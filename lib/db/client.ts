import 'server-only';

import { PrismaClient } from '@prisma/client';

/**
 * Server-only Prisma client. Never import this from Client Components,
 * middleware, or Edge runtime. Future /api/admin Route Handlers must use
 * `export const runtime = 'nodejs'`.
 *
 * Instantiation is lazy so `next build` without DATABASE_URL still succeeds
 * as long as public pages do not import this module.
 */

const globalForPrisma = globalThis as unknown as { noraPrisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL is not set. Auth and Postgres helpers are unavailable.');
  }
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.noraPrisma) {
    globalForPrisma.noraPrisma = createPrismaClient();
  }
  return globalForPrisma.noraPrisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (globalForPrisma.noraPrisma) {
    await globalForPrisma.noraPrisma.$disconnect();
    globalForPrisma.noraPrisma = undefined;
  }
}
