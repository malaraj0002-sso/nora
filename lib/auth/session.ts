import 'server-only';

import type { Prisma } from '@prisma/client';
import { getPrisma } from '../db/client';
import type { PermissionKey } from './catalog';
import { isPermissionKey } from './catalog';
import { forbidden, unauthenticated } from './errors';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from './session-cookie';
import { generateOpaqueToken, hashOpaqueToken, SESSION_TTL_MS } from './tokens';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  roleId: string;
  roleKey: string;
  permissions: PermissionKey[];
  lastLoginAt: Date | null;
};

export type AuthSession = {
  sessionId: string;
  expiresAt: Date;
  user: SessionUser;
};

const sessionInclude = {
  user: {
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  },
} satisfies Prisma.SessionInclude;

type SessionRecord = Prisma.SessionGetPayload<{ include: typeof sessionInclude }>;

function toSessionUser(record: SessionRecord['user']): SessionUser {
  const permissions = record.role.permissions
    .map((row) => row.permission.key)
    .filter(isPermissionKey);

  return {
    id: record.id,
    email: record.email,
    name: record.name,
    isActive: record.isActive,
    roleId: record.roleId,
    roleKey: record.role.key,
    permissions,
    lastLoginAt: record.lastLoginAt,
  };
}

export function generateSessionToken(): string {
  return generateOpaqueToken();
}

export function hashSessionToken(rawToken: string): string {
  return hashOpaqueToken(rawToken);
}

export async function persistSession(input: {
  userId: string;
  rawToken: string;
  ip?: string | null;
  userAgent?: string | null;
  ttlMs?: number;
}): Promise<{ sessionId: string; expiresAt: Date; tokenHash: string }> {
  const tokenHash = hashSessionToken(input.rawToken);
  const expiresAt = new Date(Date.now() + (input.ttlMs ?? SESSION_TTL_MS));
  const session = await getPrisma().session.create({
    data: {
      userId: input.userId,
      tokenHash,
      expiresAt,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
  return { sessionId: session.id, expiresAt, tokenHash };
}

export async function findValidSessionByTokenHash(tokenHash: string): Promise<AuthSession | null> {
  const record = await getPrisma().session.findUnique({
    where: { tokenHash },
    include: sessionInclude,
  });
  if (!record) return null;
  if (record.revokedAt) return null;
  if (record.expiresAt.getTime() <= Date.now()) return null;
  if (!record.user.isActive) return null;
  return {
    sessionId: record.id,
    expiresAt: record.expiresAt,
    user: toSessionUser(record.user),
  };
}

export async function findValidSessionByRawToken(rawToken: string): Promise<AuthSession | null> {
  return findValidSessionByTokenHash(hashSessionToken(rawToken));
}

async function readRawSessionCookie(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE_NAME)?.value?.trim();
  return value || null;
}

async function writeRawSessionCookie(rawToken: string, expiresAt: Date): Promise<void> {
  const { cookies } = await import('next/headers');
  const jar = await cookies();
  const options = sessionCookieOptions(expiresAt);
  jar.set(SESSION_COOKIE_NAME, rawToken, options);
}

async function clearRawSessionCookie(): Promise<void> {
  const { cookies } = await import('next/headers');
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions(new Date(0)),
    expires: new Date(0),
  });
}

/**
 * Creates a session row (hash only) and sets `__Host-nora-session`.
 * Returns session metadata — never the raw token.
 */
export async function createSession(input: {
  userId: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<{ sessionId: string; expiresAt: Date }> {
  const rawToken = generateSessionToken();
  const created = await persistSession({
    userId: input.userId,
    rawToken,
    ip: input.ip,
    userAgent: input.userAgent,
  });
  await writeRawSessionCookie(rawToken, created.expiresAt);
  return { sessionId: created.sessionId, expiresAt: created.expiresAt };
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = await readRawSessionCookie();
  if (!raw) return null;
  return findValidSessionByRawToken(raw);
}

export async function requireUser(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) throw unauthenticated();
  if (!session.user.isActive) throw unauthenticated('Account is disabled');
  return session;
}

export async function revokeSession(sessionId: string, clearCookie = false): Promise<void> {
  await getPrisma().session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (clearCookie) {
    await clearRawSessionCookie();
  }
}

export async function revokeSessionByRawToken(rawToken: string, clearCookie = true): Promise<void> {
  const tokenHash = hashSessionToken(rawToken);
  await getPrisma().session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (clearCookie) {
    await clearRawSessionCookie();
  }
}

export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await getPrisma().session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
