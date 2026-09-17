# Nora Group — Phase 2 Cleanup Report

**Date:** 17 September 2026  
**Scope:** Audit follow-up only. Not Phase 3. No Dashboard, login UI, content migration, R2, or `CONTENT_SOURCE` change.

## Fixed

### Phase 1 report restored

`PHASE_1_IMPLEMENTATION_REPORT.md` was recovered from Git history, not invented.

| Item | Value |
|---|---|
| Recovered from | `7583274e9f059fe766c9bce924f7e5a3fb32705f` |
| Branch containing that commit | `phase-1-foundations` / `origin/phase-1-foundations` |
| Other versions | None (`git log --all -- PHASE_1_IMPLEMENTATION_REPORT.md` shows only that commit) |

The restored file is the historical Phase 1 report. It was **not** rewritten to claim later Phase 2 work. Some statements in it describe the `phase-1-foundations` working tree at that time (including uncommitted items such as `published_at`) and therefore must be read as Phase 1 history, not as a description of current `main`.

### `server-only` on content source

`lib/content/source.ts` now starts with `import 'server-only'`.

Unchanged: `CONTENT_SOURCE` still defaults to `sanity`; `postgres` is not automatic; `SiteContent` contract, Sanity queries, seed fallback, locales, and public rendering were not modified.

### Auth verification script hardened

`scripts/phase-2-auth-verify.ts`:

- Missing `DATABASE_URL` still fails closed (before Prisma is used).
- Hosted production markers are refused even if a staging flag is present: `vercel`, `neon.tech`, `supabase`, `amazonaws`, `postgres.database.azure.com`, plus existing `officialnoragroup` / `vercel-storage`.
- Cleanup first deletes sessions, reset tokens, and non-final-super-admin test users **without** disabling `users_protect_last_super_admin`.
- Trigger disable is used only for leftover last-active `super_admin` test users, and only when **all** of these are true:
  1. URL already passed local/staging checks
  2. URL does not match hosted production markers
  3. `NORA_AUTH_VERIFY_ALLOW_DESTRUCTIVE=true`
- The flag cannot override a production-looking URL.
- If the trigger is disabled, restoration runs in `finally`.

Application RBAC, last-super-admin protection, password hashing, sessions, and audit behavior were not changed.

### `.env.example` whitespace

Trailing spaces were removed from `SANITY_REVALIDATE_SECRET=`.

Placeholders remain empty:

```
CONTENT_SOURCE=sanity
DATABASE_URL=
DATABASE_URL_UNPOOLED=
AUTH_SECRET=
```

No `.env.local` was created. No `NEXT_PUBLIC_DATABASE_*` or `NEXT_PUBLIC_AUTH_*` variables exist.

## Intentionally Unchanged

- Phase 2 auth architecture (Argon2id, SHA-256 session hashes, `__Host-nora-session`, five roles, application + DB last-super-admin protection)
- Prisma migration history (`prisma/migrations/20260917180000_auth_foundation` was not edited, renamed, or replayed)
- Sanity production source and `/studio`
- Seven golden services (`kitchens`, `bedrooms`, `wardrobes`, `walk-in-closets`, `custom-furniture`, `offices`, `commercial`)
- Public website UI, queries, and `SiteContent`
- Phase 0 deferred items: `published_at`, golden-service deletion triggers, Neon adapter, R2
- No Dashboard / login / admin APIs

## Validation

| Check | Result |
|---|---|
| `npm run typecheck` | **PASS** (`tsc --noEmit`, exit 0). `DATABASE_URL` was unset. |
| `npm run build` | **PASS** (Next.js 15.5.25, exit 0). 131 pages. `/studio/[[...tool]]` present. No `/dashboard` route. Service paths include `/he/services/kitchens`, `bedrooms`, `wardrobes` + 25 more (7 slugs × 4 locales). |
| `git diff --check` | **PASS** (no whitespace errors reported). |
| `npm run test:auth` against PostgreSQL | **Not executed.** `DATABASE_URL` was unset in this shell. A local Docker container named `nora-phase2-pg` was running, but no connection string was invented and production was not contacted. |
| Fail-closed with missing URL | **Confirmed.** `npm run test:auth` exited 1 with: `DATABASE_URL is not set. Phase 2 auth scripts require a local or dedicated staging PostgreSQL URL.` |

## Security boundary (post-change)

- `app/` and `components/` do not import `@prisma/client`, `lib/auth`, or `lib/db`.
- `middleware.ts` does not import Prisma, Argon2, or session database access.
- Prisma/auth imports remain in `lib/auth/*`, `lib/db/*`, `prisma/seed.ts`, and `scripts/phase-2-auth-verify.ts` only.

## Migration Warning

The existing Phase 2 migration creates the complete empty Prisma schema in addition to authentication tables. It must not be applied to production during Phase 2. Production remains on Sanity until the explicit PostgreSQL content migration and cutover phase.

## Git State

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD | `83e65f2` |
| Remote | `https://github.com/malaraj0002-sso/nora.git` |
| Working tree | Dirty (uncommitted cleanup) |
| Commit performed | **No** |
| Push performed | **No** |
| Branch created | **No** |
| History rewritten | **No** |

Changed / added files (uncommitted):

- `PHASE_1_IMPLEMENTATION_REPORT.md` (restored, untracked)
- `PHASE_2_CLEANUP_REPORT.md` (this file, untracked)
- `.env.example`
- `lib/content/source.ts`
- `scripts/phase-2-auth-verify.ts`
