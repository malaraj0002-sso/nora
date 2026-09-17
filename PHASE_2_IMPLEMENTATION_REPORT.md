# Nora Group — Phase 2 Implementation Report

**Date:** 17 September 2026  
**Scope:** First-party authentication database foundation and server-only RBAC helpers. No Dashboard UI. No login pages. No content migration.

## Git

| Item | Value |
|---|---|
| Repository | `C:/Users/Heyam/Desktop/N-G` |
| Remote | `https://github.com/malaraj0002-sso/nora.git` |
| Branch | `main` |
| Worked directly on `main` | **Yes** |
| New branch created | **No** (`phase-2-auth` was not created) |
| Force push | **No** |
| Automatic commit | **No** |
| Automatic push | **No** |
| History rewritten | **No** |

## Database

| Item | Value |
|---|---|
| Engine used | Local Docker `postgres:16-alpine` |
| Host | `127.0.0.1:5433` |
| Database name | `nora_phase2` |
| Production PostgreSQL accessed | **No** |
| `prisma migrate deploy` against production | **No** |
| Prisma CLI / client | **6.19.3** (not upgraded) |
| Migration name | `20260917180000_auth_foundation` |
| Migration scope | CREATE of auth tables **and** empty content tables already described by the Phase 1 schema. No DROP. No DELETE. No INSERT of CMS/content/users. Extra SQL: email lowercase trigger + last-active `super_admin` trigger. |

Prisma 6.19.3 on local PostgreSQL uses the default Node query engine and `DATABASE_URL`. `@prisma/adapter-neon` was **not** added. Phase 0’s Neon adapter remains a later Vercel/Neon concern, not a Phase 2 ORM change.

After seed (idempotent, run twice):

| Table | Row count |
|---|---|
| `users` | 0 |
| `roles` | 5 |
| `permissions` | 14 |
| `role_permissions` | 41 |
| `sessions` | 0 |
| `services` | 0 |

## Tables

Auth tables present:

- `users`
- `roles`
- `permissions`
- `role_permissions`
- `sessions`
- `password_reset_tokens`
- `audit_logs`

`users.role_id` → `roles.id` is `ON DELETE RESTRICT`. Sessions and reset tokens cascade on user delete. Audit `actor_user_id` is `ON DELETE SET NULL`.

## Roles

Exactly:

1. `super_admin`
2. `admin`
3. `editor`
4. `translator`
5. `viewer`

## Permissions

Stable catalogue (seeded, not invented at runtime):

- `dashboard.access`
- `content.read`
- `content.update`
- `content.publish`
- `content.delete`
- `services.update`
- `services.delete`
- `media.upload`
- `media.delete`
- `users.read`
- `users.manage`
- `roles.manage`
- `audit.read`
- `translations.update`

## Role matrix

From Phase 0 §5.3–5.4 (`lib/auth/catalog.ts`):

| Permission | super_admin | admin | editor | translator | viewer |
|---|---|---|---|---|---|
| `dashboard.access` | yes | yes | yes | yes | yes |
| `content.read` | yes | yes | yes | yes | yes |
| `content.update` | yes | yes | yes | no | no |
| `content.publish` | yes | yes | yes | no | no |
| `content.delete` | yes | yes | yes | no | no |
| `services.update` | yes | yes | yes | no | no |
| `services.delete` | yes | yes | yes | no | no |
| `media.upload` | yes | yes | yes | no | no |
| `media.delete` | yes | yes | no | no | no |
| `users.read` | yes | yes | no | no | no |
| `users.manage` | yes | yes | no | no | no |
| `roles.manage` | yes | no | no | no | no |
| `audit.read` | yes | yes | no | no | no |
| `translations.update` | yes | yes | yes | yes | no |

Notes:

- Admin `users.manage` still cannot modify `super_admin` users (application layer).
- Admin does not get `roles.manage` (role catalogue stays migration-gated).
- Editor media is upload/replace only (`media.upload`, not `media.delete`).
- Translator is translation-only (`translations.update` + `content.read`). No slug/order/delete/publish.
- Locked golden-service delete remains an application rule for later CMS phases (`is_locked` already in schema).

## Password hashing

- Algorithm: **Argon2id**
- Package: `@node-rs/argon2` `^2.2.1`
- Module: `lib/auth/password.ts` with `import 'server-only'`
- API: `hashPassword()`, `verifyPassword()`, `isArgon2idHash()`
- Parameters: memory 19456 KiB, time 2, parallelism 1 (OWASP 2024 minimum)
- Never logged. Not imported by `app/` or `components/`. Not used in middleware.
- `bcryptjs` was **not** used.

## Sessions

- Raw token: 32 cryptographically random bytes, base64url
- PostgreSQL stores **SHA-256 hex** of the raw token only (`token_hash`, unique)
- Cookie name: `__Host-nora-session`
- Cookie flags: HttpOnly, **Secure** (required by `__Host-`), SameSite=Lax, Path=/, **no Domain**
- Cookie value: raw token only
- TTL: 7 days absolute
- `createSession()` sets the cookie via `next/headers` (dynamic import; not used by middleware)
- `getSession()` / `requireUser()` reject missing, revoked, expired, and inactive-user sessions
- `revokeSession()` / `revokeAllUserSessions()` set `revoked_at`
- Disabling a user revokes that user’s active sessions

## RBAC

Server-only (`lib/auth/permissions.ts`):

- `requireUser()` — authenticated active session or 401
- `requirePermission(permission)` — session + catalogue key or 403
- `hasPermission(user, permission)` — in-memory check; inactive users fail

Authorization is server-side. No `/api/admin/*` CRUD was added. Client state is not trusted. Middleware does not instantiate Prisma.

## Super admin safety

Both layers:

1. **Application** (`lib/auth/users.ts`): `assertNotLastActiveSuperAdmin`; admin cannot delete/disable/demote any `super_admin`; a `super_admin` actor still cannot delete/disable/demote the **final active** one.
2. **Database trigger** `users_protect_last_super_admin`: `BEFORE DELETE OR UPDATE OF role_id, is_active` on `users`.

No initial super_admin, default password, or bootstrap user was created.

## Audit

`audit_logs`: `id`, `actor_user_id` (nullable), `action`, `entity_type`, `entity_id` (nullable), `metadata` JSON, `ip`, `user_agent`, `created_at`.

Indexes: `created_at DESC`, `(entity_type, entity_id)`, `actor_user_id`.

`writeAuditLog()` is insert-only. `updateAuditLog()` / `deleteAuditLog()` throw. Metadata keys matching password/token/secret/authorization/cookie/hash are stripped.

## Tests

`npm run test:auth` against local Docker Postgres only (refuses missing URL and production-looking hosts).

| # | Check | Result |
|---|---|---|
| 1 | password hash can be created | PASS |
| 2 | correct password verifies | PASS |
| 3 | wrong password fails | PASS |
| 4 | password hashes use Argon2id | PASS |
| 5 | session token hashes correctly | PASS |
| 6 | raw session token is not stored | PASS |
| 7 | session can be created | PASS |
| 8 | session can be revoked | PASS |
| 9 | expired/revoked sessions are rejected | PASS |
| 10 | inactive user cannot authenticate | PASS |
| 11 | permissions resolve correctly | PASS |
| 12 | viewer does not have publish permission | PASS |
| 13 | translator does not have delete permission | PASS |
| 14 | editor does not have user-management permission | PASS |
| 15 | admin cannot remove final super_admin | PASS |
| 16 | admin cannot disable final super_admin | PASS |
| 17 | admin cannot demote final super_admin | PASS |
| 18 | audit record can be written | PASS |
| 19 | audit metadata cannot contain passwords/tokens/secrets | PASS |
| 20 | role deletion is blocked when users reference the role | PASS |
| extra | `__Host-nora-session` cookie flags | PASS |
| extra | audit logs are append-only | PASS |
| extra | password reset stores hash only and rejects used tokens | PASS |
| extra | `revokeAllUserSessions` | PASS |
| extra | application layer blocks deleting the final super_admin | PASS |

**25/25 passed.** Test users used `@example.invalid` addresses and were deleted. Final DB user count: 0.

## Validation

| Check | Result |
|---|---|
| `npx prisma --version` | 6.19.3 |
| `npm run typecheck` | **PASS** (`DATABASE_URL` unset) |
| `npm run build` | **PASS** (`DATABASE_URL` unset) |
| `/` `/en` `/ar` `/ru` `/studio` | HTTP 200 on `next start -p 3012` |
| `/api/revalidate` | HTTP 405 on GET (existing POST-only webhook) |
| `/dashboard` | HTTP 404 (no Dashboard UI) |
| `CONTENT_SOURCE` | still defaults to `sanity`; public repository does not import Prisma |

Build listed `/he/services/kitchens`, `bedrooms`, `wardrobes` + 25 more paths = seven slugs × four locales. No dashboard route. `/studio` remains.

## Sanity verification

- No Sanity schema files changed
- No Sanity documents mutated
- No write token added
- `/studio` still builds and serves 200
- Seven golden slugs unchanged in `lib/constants.ts`
- No doors

## Security review

| Area | Finding |
|---|---|
| Secrets | No credentials in git. No `.env.local`. `.env.example` placeholders empty. Local Docker password stayed in shell env only. |
| Passwords | Argon2id only. No plaintext. Hashes not returned from session user objects. |
| Sessions | Hash-only storage. `__Host-` cookie flags correct. |
| Database | FKs and unique constraints as specified. Content tables empty. |
| Authorization | Server modules only. `app/` and `components/` have **zero** Prisma/auth imports. |
| Middleware | Unchanged; no Prisma. |
| Super admin | Application + trigger protections verified. |

## Unresolved issues

- No login UI / `/api/admin/auth/*` (Phase 5).
- First `super_admin` bootstrap CLI is still later (no default user here).
- Neon driver adapter not installed (not needed for local Postgres).
- Prisma warns that `package.json#prisma.seed` is deprecated toward Prisma 7; ignored to keep 6.19.3.
- SQL last-super_admin trigger disable is used only in local test cleanup; production will not run that script.
- Locked golden-service DELETE/slug triggers remain a later content-phase item (Phase 1 note). No service rows exist.

## Confirmations

- Sanity remains the production content source
- `CONTENT_SOURCE=sanity` remains unchanged
- no Sanity data changed
- no Sanity schemas changed
- seven golden services were untouched
- no doors were added
- no Dashboard UI was added
- no login UI was added
- no R2 infrastructure was created
- no production PostgreSQL was accessed
- no production database migration was executed
- no production secrets were committed
- no default user was created
- no default admin password was created
- no public UI was redesigned
- Phase 2 is AUTH FOUNDATION ONLY

---

PHASE 2 COMPLETE — AUTH FOUNDATION ONLY — SANITY REMAINS THE PRODUCTION CONTENT SOURCE
