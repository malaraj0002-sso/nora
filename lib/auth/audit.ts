import 'server-only';

import type { Prisma } from '@prisma/client';
import { getPrisma } from '../db/client';

const SENSITIVE_KEY =
  /password|passwd|token|secret|authorization|cookie|hash|ssn|private[_-]?key|credential/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function sanitizeAuditMetadata(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return stripSensitive(value) as Prisma.InputJsonValue;
}

function stripSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripSensitive);
  }
  if (!isPlainObject(value)) {
    return value;
  }
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) continue;
    out[key] = stripSensitive(nested);
  }
  return out;
}

export async function writeAuditLog(input: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: unknown;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<{ id: string }> {
  const row = await getPrisma().auditLog.create({
    data: {
      actorId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: sanitizeAuditMetadata(input.metadata),
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
  return { id: row.id };
}

export async function updateAuditLog(): Promise<never> {
  throw new Error('Audit logs are append-only');
}

export async function deleteAuditLog(): Promise<never> {
  throw new Error('Audit logs are append-only');
}
