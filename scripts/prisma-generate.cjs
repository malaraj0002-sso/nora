'use strict';

/**
 * Runs `prisma generate` without requiring a live database.
 * prisma generate does not connect to Postgres; placeholders only fill
 * env("DATABASE_URL") / env("DATABASE_URL_UNPOOLED") when unset so
 * production Sanity deploys are not blocked before Phase 2.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://127.0.0.1:5432/nora_generate';
}
if (!process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
}

const prismaCli = require.resolve('prisma/build/index.js', { paths: [root] });
const result = spawnSync(process.execPath, [prismaCli, 'generate'], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
});

process.exit(result.status === null ? 1 : result.status);
