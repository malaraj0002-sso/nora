/**
 * Guards seed/migrate/verify scripts so they cannot target production.
 * Do not use this in the future production Prisma client path.
 */

const LOOPBACK = new Set(['localhost', '127.0.0.1', '::1']);

export function assertLocalOrStagingDatabase(url: string, label = 'DATABASE_URL'): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} is not a valid URL.`);
  }

  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error(`${label} must be a postgresql:// URL.`);
  }

  const host = decodeURIComponent(parsed.hostname).toLowerCase();
  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, '')).toLowerCase();
  const combined = `${host} ${dbName} ${url.toLowerCase()}`;

  if (combined.includes('officialnoragroup') || combined.includes('vercel-storage')) {
    throw new Error(`${label} looks like production and was refused.`);
  }

  if (dbName === 'prod' || dbName === 'production' || dbName.endsWith('_prod')) {
    throw new Error(`${label} database name looks like production and was refused.`);
  }

  if (LOOPBACK.has(host) || host === 'postgres' || host.endsWith('.local')) {
    return;
  }

  const allowStaging = process.env.ALLOW_STAGING_DATABASE?.trim() === '1';
  const stagingHint =
    dbName.includes('stag') ||
    dbName.includes('dev') ||
    dbName.includes('phase2') ||
    dbName.includes('test') ||
    host.includes('stag');

  if (allowStaging && stagingHint) {
    return;
  }

  throw new Error(
    `${label} host "${host}" is not loopback/local. Set ALLOW_STAGING_DATABASE=1 only for a dedicated staging database.`,
  );
}

export function requireLocalDatabaseUrl(): { url: string; unpooled: string } {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Phase 2 auth scripts require a local or dedicated staging PostgreSQL URL.',
    );
  }
  assertLocalOrStagingDatabase(url, 'DATABASE_URL');
  const unpooled = process.env.DATABASE_URL_UNPOOLED?.trim() || url;
  assertLocalOrStagingDatabase(unpooled, 'DATABASE_URL_UNPOOLED');
  return { url, unpooled };
}
