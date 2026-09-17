import 'server-only';

import { RoleKey } from '@prisma/client';
import { getPrisma } from '../db/client';
import { writeAuditLog } from './audit';
import { forbidden, lastSuperAdminError } from './errors';
import { hashPassword } from './password';
import type { SessionUser } from './session';
import { revokeAllUserSessions } from './session';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function countOtherActiveSuperAdmins(userId: string): Promise<number> {
  return getPrisma().user.count({
    where: {
      id: { not: userId },
      isActive: true,
      role: { key: RoleKey.super_admin },
    },
  });
}

async function loadUserWithRole(userId: string) {
  return getPrisma().user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
}

export async function assertNotLastActiveSuperAdmin(userId: string, action: string): Promise<void> {
  const user = await loadUserWithRole(userId);
  if (!user) return;
  if (user.role.key !== RoleKey.super_admin || !user.isActive) return;
  const remaining = await countOtherActiveSuperAdmins(userId);
  if (remaining < 1) {
    throw lastSuperAdminError(action);
  }
}

function actorMayManageTarget(actor: SessionUser, targetRole: RoleKey): void {
  if (!actor.isActive) {
    throw forbidden('Inactive users cannot manage staff');
  }
  if (actor.roleKey === RoleKey.super_admin) return;
  if (actor.roleKey === RoleKey.admin) {
    if (targetRole === RoleKey.super_admin) {
      throw forbidden('Admin cannot modify super_admin users');
    }
    return;
  }
  throw forbidden('User management is not allowed for this role');
}

export async function setUserActive(input: {
  actor: SessionUser;
  userId: string;
  isActive: boolean;
  ip?: string | null;
}): Promise<void> {
  const target = await loadUserWithRole(input.userId);
  if (!target) throw forbidden('User not found');
  actorMayManageTarget(input.actor, target.role.key);

  if (!input.isActive) {
    if (input.actor.roleKey === RoleKey.admin && target.role.key === RoleKey.super_admin) {
      throw forbidden('Admin cannot disable a super_admin');
    }
    await assertNotLastActiveSuperAdmin(target.id, 'disable');
  }

  await getPrisma().user.update({
    where: { id: target.id },
    data: { isActive: input.isActive },
  });

  if (!input.isActive) {
    await revokeAllUserSessions(target.id);
  }

  await writeAuditLog({
    actorUserId: input.actor.id,
    action: input.isActive ? 'user.enable' : 'user.disable',
    entityType: 'user',
    entityId: target.id,
    ip: input.ip,
    metadata: { isActive: input.isActive },
  });
}

export async function changeUserRole(input: {
  actor: SessionUser;
  userId: string;
  roleKey: RoleKey;
  ip?: string | null;
}): Promise<void> {
  const target = await loadUserWithRole(input.userId);
  if (!target) throw forbidden('User not found');
  actorMayManageTarget(input.actor, target.role.key);

  if (input.actor.roleKey === RoleKey.admin && input.roleKey === RoleKey.super_admin) {
    throw forbidden('Admin cannot promote a user to super_admin');
  }

  if (target.role.key === RoleKey.super_admin && input.roleKey !== RoleKey.super_admin) {
    if (input.actor.roleKey !== RoleKey.super_admin) {
      throw forbidden('Admin cannot demote a super_admin');
    }
    await assertNotLastActiveSuperAdmin(target.id, 'demote');
  }

  const role = await getPrisma().role.findUnique({ where: { key: input.roleKey } });
  if (!role) throw forbidden('Role not found');

  await getPrisma().user.update({
    where: { id: target.id },
    data: { roleId: role.id },
  });

  await writeAuditLog({
    actorUserId: input.actor.id,
    action: 'user.role_change',
    entityType: 'user',
    entityId: target.id,
    ip: input.ip,
    metadata: { from: target.role.key, to: input.roleKey },
  });
}

export async function deleteUser(input: {
  actor: SessionUser;
  userId: string;
  ip?: string | null;
}): Promise<void> {
  const target = await loadUserWithRole(input.userId);
  if (!target) throw forbidden('User not found');
  actorMayManageTarget(input.actor, target.role.key);

  if (target.role.key === RoleKey.super_admin) {
    if (input.actor.roleKey !== RoleKey.super_admin) {
      throw forbidden('Admin cannot delete a super_admin');
    }
    await assertNotLastActiveSuperAdmin(target.id, 'delete');
  }

  await getPrisma().user.delete({ where: { id: target.id } });

  await writeAuditLog({
    actorUserId: input.actor.id,
    action: 'user.delete',
    entityType: 'user',
    entityId: target.id,
    ip: input.ip,
  });
}

/**
 * Test/helper user factory. Does not create a default admin. Callers must
 * supply email and password. Email is stored lowercase.
 */
export async function createStaffUser(input: {
  email: string;
  name: string;
  password: string;
  roleKey: RoleKey;
}): Promise<{ id: string; email: string }> {
  const email = normalizeEmail(input.email);
  const role = await getPrisma().role.findUnique({ where: { key: input.roleKey } });
  if (!role) {
    throw new Error(`Role ${input.roleKey} is not seeded`);
  }
  const passwordHash = await hashPassword(input.password);
  const user = await getPrisma().user.create({
    data: {
      email,
      name: input.name,
      passwordHash,
      roleId: role.id,
    },
  });
  return { id: user.id, email: user.email };
}

export async function changePasswordAndRevokeSessions(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await getPrisma().user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  await revokeAllUserSessions(userId);
}

export async function createPasswordResetToken(userId: string, rawToken: string, expiresAt: Date) {
  const { hashOpaqueToken } = await import('./tokens');
  return getPrisma().passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashOpaqueToken(rawToken),
      expiresAt,
    },
  });
}

export async function consumePasswordResetToken(rawToken: string): Promise<{ userId: string } | null> {
  const { hashOpaqueToken } = await import('./tokens');
  const tokenHash = hashOpaqueToken(rawToken);
  const row = await getPrisma().passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row) return null;
  if (row.usedAt) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;
  await getPrisma().passwordResetToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return { userId: row.userId };
}
