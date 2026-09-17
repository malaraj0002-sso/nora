import 'server-only';

import { hash, verify } from '@node-rs/argon2';

/**
 * Argon2id password hashing. Node.js runtime only — never import from
 * Client Components or middleware.
 *
 * Options follow OWASP's 2024 minimum for Argon2id (19 MiB, t=2, p=1).
 * `algorithm: 2` is Argon2id (`Algorithm.Argon2id`); numeric form avoids
 * TypeScript isolatedModules errors with the package's const enum.
 */

const ARGON2ID_OPTIONS = {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== 'string' || password.length < 1) {
    throw new Error('Password is required');
  }
  return hash(password, ARGON2ID_OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  if (typeof passwordHash !== 'string' || typeof password !== 'string' || password.length < 1) {
    return false;
  }
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

export function isArgon2idHash(value: string): boolean {
  return typeof value === 'string' && value.startsWith('$argon2id$');
}
