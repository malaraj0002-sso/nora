/**
 * Phase 2 auth verification against local/staging PostgreSQL only.
 * Refuses to run if DATABASE_URL is missing or looks like production.
 */
import { randomBytes } from 'node:crypto';
import { RoleKey } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { writeAuditLog, sanitizeAuditMetadata, updateAuditLog } from '../lib/auth/audit';
import { ROLE_PERMISSIONS, type PermissionKey } from '../lib/auth/catalog';
import { AuthError } from '../lib/auth/errors';
import { hashPassword, isArgon2idHash, verifyPassword } from '../lib/auth/password';
import { hasPermission } from '../lib/auth/permissions';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../lib/auth/session-cookie';
import {
  findValidSessionByRawToken,
  generateSessionToken,
  hashSessionToken,
  persistSession,
  revokeAllUserSessions,
  revokeSession,
  type SessionUser,
} from '../lib/auth/session';
import { generateOpaqueToken, hashOpaqueToken, RESET_TOKEN_TTL_MS } from '../lib/auth/tokens';
import {
  changeUserRole,
  consumePasswordResetToken,
  createPasswordResetToken,
  createStaffUser,
  deleteUser,
  setUserActive,
} from '../lib/auth/users';
import { requireLocalDatabaseUrl } from '../lib/db/assert-local';

type Check = { name: string; ok: boolean; detail?: string };

const checks: Check[] = [];

function record(name: string, ok: boolean, detail?: string) {
  checks.push({ name, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ''}`);
}

function asUser(partial: SessionUser): SessionUser {
  return partial;
}

function randomEmail(slot: string): string {
  return `phase2-auth-verify-${slot}-${randomBytes(6).toString('hex')}@example.invalid`;
}

function randomSecret(): string {
  return `phase2-test-${randomBytes(16).toString('base64url')}`;
}

async function main() {
  requireLocalDatabaseUrl();
  const prisma = new PrismaClient();
  const createdIds: string[] = [];

  try {
    const password = randomSecret();
    const hash = await hashPassword(password);
    record('1. password hash can be created', typeof hash === 'string' && hash.length > 20);
    record('2. correct password verifies', await verifyPassword(hash, password) === true);
    record('3. wrong password fails', await verifyPassword(hash, `${password}x`) === false);
    record('4. password hashes use Argon2id', isArgon2idHash(hash));

    const rawSession = generateSessionToken();
    const sessionHash = hashSessionToken(rawSession);
    record(
      '5. session token hashes correctly',
      sessionHash === hashOpaqueToken(rawSession) && sessionHash.length === 64,
    );

    const viewer = await createStaffUser({
      email: randomEmail('viewer'),
      name: 'Phase2 Viewer',
      password: randomSecret(),
      roleKey: RoleKey.viewer,
    });
    createdIds.push(viewer.id);

    const stored = await persistSession({
      userId: viewer.id,
      rawToken: rawSession,
      ip: '127.0.0.1',
      userAgent: 'phase2-verify',
    });
    const rawInDb = await prisma.session.findFirst({ where: { tokenHash: rawSession } });
    const hashInDb = await prisma.session.findUnique({ where: { tokenHash: stored.tokenHash } });
    record('6. raw session token is not stored', rawInDb === null && hashInDb !== null);
    record('7. session can be created', hashInDb?.userId === viewer.id);

    await revokeSession(stored.sessionId);
    const afterRevoke = await findValidSessionByRawToken(rawSession);
    record('8. session can be revoked', afterRevoke === null);

    const expiredRaw = generateSessionToken();
    await persistSession({
      userId: viewer.id,
      rawToken: expiredRaw,
      ttlMs: -1000,
    });
    const expired = await findValidSessionByRawToken(expiredRaw);
    record('9. expired/revoked sessions are rejected', expired === null && afterRevoke === null);

    const inactiveRaw = generateSessionToken();
    const inactiveUser = await createStaffUser({
      email: randomEmail('inactive'),
      name: 'Phase2 Inactive',
      password: randomSecret(),
      roleKey: RoleKey.editor,
    });
    createdIds.push(inactiveUser.id);
    await persistSession({ userId: inactiveUser.id, rawToken: inactiveRaw });
    await prisma.user.update({ where: { id: inactiveUser.id }, data: { isActive: false } });
    const inactiveSession = await findValidSessionByRawToken(inactiveRaw);
    record('10. inactive user cannot authenticate', inactiveSession === null);

    const roles = await prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
    const perms = (key: RoleKey): PermissionKey[] => {
      const role = roles.find((item) => item.key === key);
      return (role?.permissions.map((row) => row.permission.key) ?? []) as PermissionKey[];
    };
    const viewerPerms = perms(RoleKey.viewer);
    const editorPerms = perms(RoleKey.editor);
    const translatorPerms = perms(RoleKey.translator);
    const adminPerms = perms(RoleKey.admin);
    record(
      '11. permissions resolve correctly',
      viewerPerms.includes('content.read') &&
        viewerPerms.includes('dashboard.access') &&
        JSON.stringify([...viewerPerms].sort()) === JSON.stringify([...ROLE_PERMISSIONS.viewer].sort()),
    );
    record(
      '12. viewer does not have publish permission',
      !hasPermission(asUser({
        id: 'x',
        email: 'x',
        name: 'x',
        isActive: true,
        roleId: 'x',
        roleKey: 'viewer',
        permissions: viewerPerms,
        lastLoginAt: null,
      }), 'content.publish'),
    );
    record(
      '13. translator does not have delete permission',
      !translatorPerms.includes('content.delete') && !translatorPerms.includes('services.delete'),
    );
    record(
      '14. editor does not have user-management permission',
      !editorPerms.includes('users.manage') && !editorPerms.includes('users.read'),
    );

    const superA = await createStaffUser({
      email: randomEmail('super-a'),
      name: 'Phase2 Super A',
      password: randomSecret(),
      roleKey: RoleKey.super_admin,
    });
    createdIds.push(superA.id);
    const adminUser = await createStaffUser({
      email: randomEmail('admin'),
      name: 'Phase2 Admin',
      password: randomSecret(),
      roleKey: RoleKey.admin,
    });
    createdIds.push(adminUser.id);

    const adminActor = asUser({
      id: adminUser.id,
      email: adminUser.email,
      name: 'Phase2 Admin',
      isActive: true,
      roleId: 'admin',
      roleKey: RoleKey.admin,
      permissions: adminPerms,
      lastLoginAt: null,
    });

    let deleteBlocked = false;
    try {
      await deleteUser({ actor: adminActor, userId: superA.id });
    } catch (error) {
      deleteBlocked = error instanceof AuthError;
    }
    record('15. admin cannot remove final super_admin', deleteBlocked);

    let disableBlocked = false;
    try {
      await setUserActive({ actor: adminActor, userId: superA.id, isActive: false });
    } catch (error) {
      disableBlocked = error instanceof AuthError;
    }
    record('16. admin cannot disable final super_admin', disableBlocked);

    let demoteBlocked = false;
    try {
      await changeUserRole({ actor: adminActor, userId: superA.id, roleKey: RoleKey.editor });
    } catch (error) {
      demoteBlocked = error instanceof AuthError;
    }
    record('17. admin cannot demote final super_admin', demoteBlocked);

    const audit = await writeAuditLog({
      actorUserId: adminUser.id,
      action: 'phase2.verify',
      entityType: 'auth_test',
      entityId: viewer.id,
      metadata: {
        note: 'ok',
        password: 'should-not-persist',
        token: 'should-not-persist',
        secret: 'should-not-persist',
        nested: { passwordHash: 'nope', keep: true },
      },
      ip: '127.0.0.1',
      userAgent: 'phase2-verify',
    });
    const auditRow = await prisma.auditLog.findUnique({ where: { id: audit.id } });
    const meta = (auditRow?.metadata ?? {}) as Record<string, unknown>;
    const nested = (meta.nested ?? {}) as Record<string, unknown>;
    record('18. audit record can be written', Boolean(auditRow?.id) && auditRow?.action === 'phase2.verify');
    record(
      '19. audit metadata cannot contain passwords/tokens/secrets',
      meta.password === undefined &&
        meta.token === undefined &&
        meta.secret === undefined &&
        nested.passwordHash === undefined &&
        nested.keep === true &&
        JSON.stringify(sanitizeAuditMetadata({ password: 'x', keep: 1 })).includes('"keep"'),
    );

    let roleDeleteBlocked = false;
    try {
      await prisma.role.delete({ where: { key: RoleKey.viewer } });
    } catch {
      roleDeleteBlocked = true;
    }
    const viewerRoleStillThere = await prisma.role.findUnique({ where: { key: RoleKey.viewer } });
    record('20. role deletion is blocked when users reference the role', roleDeleteBlocked && viewerRoleStillThere !== null);

    const cookie = sessionCookieOptions(new Date(Date.now() + 1000));
    const cookieOk =
      SESSION_COOKIE_NAME === '__Host-nora-session' &&
      cookie.httpOnly === true &&
      cookie.secure === true &&
      cookie.sameSite === 'lax' &&
      cookie.path === '/' &&
      !('domain' in cookie);
    record('cookie flags for __Host-nora-session', cookieOk);

    let appendOnly = false;
    try {
      await updateAuditLog();
    } catch {
      appendOnly = true;
    }
    record('audit logs are append-only', appendOnly);

    const resetRaw = generateOpaqueToken();
    await createPasswordResetToken(viewer.id, resetRaw, new Date(Date.now() + RESET_TOKEN_TTL_MS));
    const rawResetStored = await prisma.passwordResetToken.findFirst({ where: { tokenHash: resetRaw } });
    const consumed = await consumePasswordResetToken(resetRaw);
    const consumedAgain = await consumePasswordResetToken(resetRaw);
    record(
      'password reset stores hash only and rejects used tokens',
      rawResetStored === null && consumed?.userId === viewer.id && consumedAgain === null,
    );

    const liveRaw = generateSessionToken();
    await persistSession({ userId: viewer.id, rawToken: liveRaw });
    await revokeAllUserSessions(viewer.id);
    record('revokeAllUserSessions rejects later reads', (await findValidSessionByRawToken(liveRaw)) === null);

    const superActor = asUser({
      id: superA.id,
      email: superA.email,
      name: 'Phase2 Super A',
      isActive: true,
      roleId: 'super',
      roleKey: RoleKey.super_admin,
      permissions: [...ROLE_PERMISSIONS.super_admin],
      lastLoginAt: null,
    });
    let lastDeleteBlocked = false;
    try {
      await deleteUser({ actor: superActor, userId: superA.id });
    } catch (error) {
      lastDeleteBlocked = error instanceof AuthError && error.code === 'last_super_admin';
    }
    record('application layer blocks deleting the final super_admin', lastDeleteBlocked);
  } finally {
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE users DISABLE TRIGGER users_protect_last_super_admin');
    } catch {
      /* trigger may not exist if verification failed before migrate extras */
    }
    if (createdIds.length > 0) {
      await prisma.session.deleteMany({ where: { userId: { in: createdIds } } });
      await prisma.passwordResetToken.deleteMany({ where: { userId: { in: createdIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdIds } } });
    }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE users ENABLE TRIGGER users_protect_last_super_admin');
    } catch {
      /* ignore */
    }
    await prisma.$disconnect();
  }

  const failed = checks.filter((item) => !item.ok);
  console.log('');
  console.log(`Phase 2 auth checks: ${checks.length - failed.length}/${checks.length} passed`);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown verify error';
  console.error(message);
  process.exit(1);
});
