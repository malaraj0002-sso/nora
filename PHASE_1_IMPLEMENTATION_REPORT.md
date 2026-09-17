# Nora Group — Phase 1 Implementation Report

**Date:** 17 September 2026  
**Branch:** `phase-1-foundations` (from `origin/main` `0c36c9d`)  
**Remote:** `https://github.com/malaraj0002-sso/nora.git`  
**Scope:** Non-breaking foundations only. No Dashboard UI. No Postgres connection. No Sanity data changes. No public redesign.

## Repository location

`C:/Users/Heyam/Desktop/N-G/nora` **does not exist**. This Cursor workspace (`C:/Users/Heyam/Desktop/N-G`) **is** the Git repository with remote `https://github.com/malaraj0002-sso/nora.git`. All Phase 1 work was done here. No second git repository was initialized. The outer wrapper described in Phase 0 is gone; `N-G` itself is `nora`.

`origin/main` already contained commit `0c36c9d complete phase 1 foundations` (middleware, robots, `CONTENT_SOURCE`, Prisma schema, env placeholders). This branch is based on that history. Additional uncommitted hardening is listed below. Nothing was committed or pushed in this session.

Local `main` is an orphan commit `1a08b50 N` with the **same tree** as `origin/main`. It was not used as the Phase 1 base.

---

## Files changed

### Already on `origin/main` vs pre-Phase-1 (`a2ed84f`)

| File | Change |
|---|---|
| `middleware.ts` | Skip next-intl for `/dashboard`, `/api`, `/studio`; 308 locale-prefixed Dashboard URLs |
| `app/robots.ts` | Disallow `/dashboard` and `/dashboard/` (kept `/studio` and `/api/`) |
| `lib/content/source.ts` | Server-only `CONTENT_SOURCE` switch (default `sanity`) |
| `lib/content/repository.ts` | Repository: Sanity path + postgres stub that falls back |
| `lib/content/getContent.ts` | Public `getSiteContent()` now calls the repository |
| `prisma/schema.prisma` | Auth + expanded content schema (not migrated) |
| `.env.example` | `CONTENT_SOURCE`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET` |
| `.gitignore` | `!.env.example` after `.env*` |
| `package.json` / `package-lock.json` | Prisma + `postinstall` generate |
| `PHASE_0_ARCHITECTURE_VALIDATION.md` | Already present (Phase 0) |

Public UI, Sanity packages, seed, and `SiteContent` were **not** in that diff.

### Uncommitted on `phase-1-foundations` (this session)

| File | Change |
|---|---|
| `lib/content/source.ts` | `import 'server-only'` |
| `lib/content/repository.ts` | `import 'server-only'` |
| `prisma/schema.prisma` | `published_at` on catalog models |
| `app/layout.tsx` | Comment only: future Dashboard isolation (no layout created) |
| `package.json` | `postinstall` runs `scripts/prisma-generate.cjs` |
| `scripts/prisma-generate.cjs` | `prisma generate` with generate-only URL placeholders |
| `package-lock.json` | `hasInstallScript: true` only |

**Not created (intentional):** `app/dashboard/**`, login UI, admin APIs, R2, production migrations, `.env.local`, `.env.production`.

---

## Dependencies added

| Package | Role |
|---|---|
| `prisma` `^6.19.3` (dev) | CLI / generate |
| `@prisma/client` `^6.19.3` | Generated client (not imported by public pages) |

No Better Auth, Clerk, Drizzle, storage SDKs, or Resend. No unrelated upgrades. Sanity / next-sanity remain.

---

## Middleware behavior

next-intl does **not** process:

- `/dashboard`, `/dashboard/*`
- `/api`, `/api/*`
- `/studio`, `/studio/*`

Matcher 3 includes `dashboard` in the negative lookahead.

Canonical 308 redirects (remaining path preserved):

| Incoming | Redirect |
|---|---|
| `/en/dashboard` | `/dashboard` |
| `/ar/dashboard` | `/dashboard` |
| `/ru/dashboard` | `/dashboard` |
| `/he/dashboard` | `/dashboard` |
| `/en/dashboard/login` | `/dashboard/login` |
| `/ar/dashboard/anything` | `/dashboard/anything` |

`/dashboard` is **not** a Hebrew marketing route. It 404s because `app/dashboard` does not exist (expected).

Unchanged: locales, default locale `he`, `localePrefix: 'as-needed'`, `/`, `/en`, `/ar`, `/ru`. Dashboard is **not** under `app/[locale]/dashboard`.

---

## Dashboard isolation design

Not implemented as pages. Prepared so a future `app/dashboard/layout.tsx` can own `<html>`/`<body>` like Studio:

- Root `app/layout.tsx` remains a passthrough (no marketing chrome).
- Middleware skips next-intl for `/dashboard`.
- Marketing `Header`, `Footer`, `SiteProvider`, and `globals.css` stay in `app/[locale]/layout.tsx` only.

No Dashboard layout file was added.

---

## Robots changes

`app/robots.ts` disallow list:

- `/studio` (kept)
- `/api/` (kept)
- `/dashboard` (added)
- `/dashboard/` (added)

Sitemap URL for public marketing pages is unchanged (`${SITE_URL}/sitemap.xml`). `app/sitemap.ts` was not edited.

Live `/robots.txt` on the local production server:

```
User-Agent: *
Allow: /
Disallow: /studio
Disallow: /api/
Disallow: /dashboard
Disallow: /dashboard/

Sitemap: https://www.officialnoragroup.com/sitemap.xml
```

---

## CONTENT_SOURCE behavior

Server-only (`lib/content/source.ts` + `import 'server-only'`). Never `NEXT_PUBLIC_*`.

| Value | Behavior |
|---|---|
| missing / empty / unknown | treated as `sanity` |
| `sanity` | existing Sanity fetch + seed fallback |
| `postgres` | **not implemented**; server `console.warn`, then the Sanity + seed path |

Safer choice for production: postgres does **not** throw and does **not** require `DATABASE_URL`. Prisma is **not** imported from `getSiteContent()` / the repository. A missing `DATABASE_URL` cannot break the Sanity path.

`SiteContent`, `HomeView`, public routes, and Sanity fetch mapping are unchanged except that `getSiteContent()` now calls `loadPublishedContent()`.

---

## Prisma schema summary

`prisma/schema.prisma` — PostgreSQL, **not applied**. No `migrate`, no production connection, no seed insert of the seven services.

- `Locale` enum: `he` \| `ar` \| `en` \| `ru`
- `RoleKey`: `super_admin` \| `admin` \| `editor` \| `translator` \| `viewer`
- `PublishStatus`: `draft` \| `published` \| `archived`
- Catalog rows include `status`, `visible`, `published_at`, `updated_at`
- Media is metadata only (no `BYTEA`)
- FKs + unique `(parent_id, locale)` on translation tables
- Hero slides are ordered images only (no `hero_slide_translations`; current contract has URL[] only)

`postinstall` runs `prisma generate` via `scripts/prisma-generate.cjs`. If `DATABASE_URL` / `DATABASE_URL_UNPOOLED` are unset, generate-only placeholders are used. Generate does **not** connect to Postgres.

---

## Auth schema summary

First-party sessions (no login UI, no users created, no hardcoded admin):

- `roles`, `permissions`, `role_permissions`
- `users` — one `role_id` per user; `password_hash` for future Argon2id
- `sessions` — `token_hash` only (never raw cookie)
- `password_reset_tokens` — hash only
- `audit_logs` — insert-oriented; actor optional

Password hashes and token hashes are schema fields only. No client modules read them.

---

## Content schema summary

**Site:** `site_settings` + translations, `ui_labels` + translations, `navigation_items` + translations  

**Home:** `home_page` + translations, `hero_slides`, `home_intro_features` + translations, `home_why_items` + translations, `home_featured_services`, `home_featured_projects`  

**Pages:** about / how-we-work / contact / faq / blog page tables + translations; `about_values`, `how_we_work_steps` + translations  

**Catalog:** services (incl. `is_locked`), service features/images + translations; projects + images + `project_materials`; materials; testimonials (`name` unlocalized); FAQ items; blog posts  

**Media:** `media` + `media_translations` (alt per locale)

Legal pages and lazaCore `madeBy` stay in code.

### Golden services

`services.is_locked` is in the schema. Comments require future app + DB trigger to refuse DELETE and slug UPDATE when locked.

**Phase 1 did not insert the seven rows.** Sanity production records are untouched.

Expected slugs (code + seed + restore report):

1. `kitchens`
2. `bedrooms`
3. `wardrobes`
4. `walk-in-closets`
5. `custom-furniture`
6. `offices`
7. `commercial`

Build output listed `/he/services/kitchens`, `bedrooms`, `wardrobes` + 25 more paths = 7 slugs × 4 locales. No doors. No extra service.

---

## Environment changes

`.env.example` placeholders only (no real credentials):

```
CONTENT_SOURCE=sanity
DATABASE_URL=
DATABASE_URL_UNPOOLED=
AUTH_SECRET=
```

Sanity public vars unchanged. No `.env.local` / `.env.production` created. `.gitignore` keeps `.env*` ignored and `!.env.example` tracked.

---

## Validation results

Toolchain: `npm install` (Prisma Client generated). `npm run typecheck` **pass**. `npm run build` **pass**.

Local production server (`next start`, port **3011** because **3001 was already in use**):

| URL | Result |
|---|---|
| `/` | 200 |
| `/en` | 200 |
| `/ar` | 200 |
| `/ru` | 200 |
| `/studio` | 200 |
| `/api/revalidate` | 405 on GET (existing POST-only webhook; not a locale page) |
| `/dashboard` | 404 (not a Hebrew marketing page) |
| `/dashboard/login` | 404 |
| `/dashboard/anything` | 404 |
| `/en/dashboard` | **308** → `/dashboard` |
| `/ar/dashboard` | **308** → `/dashboard` |
| `/ru/dashboard` | **308** → `/dashboard` |
| `/he/dashboard` | **308** → `/dashboard` |
| `/en/dashboard/login` | **308** → `/dashboard/login` |
| `/ar/dashboard/anything` | **308** → `/dashboard/anything` |
| `/robots.txt` | 200 with dashboard disallows |

`npm run dev` was not started: port 3001 was occupied by another listener. Production `next start` on 3011 was used instead.

---

## Typecheck result

`npm run typecheck` (`tsc --noEmit`) — **PASS** (exit 0).

---

## Build result

`npm run build` — **PASS** (exit 0). Next.js 15.5.25 (resolved from `^15.2.4`). 131 static pages. Routes include marketing locales, `/studio/[[...tool]]`, `/api/revalidate`. No `/dashboard` page (expected).

---

## Warnings

- npm deprecation notices (`glob`, `uuid@8`, `@sanity/next-loader`, etc.). Not upgraded.
- `npm audit`: 26 vulnerabilities reported. Not fixed (would be unrelated upgrades).
- npm `allow-scripts` pending for `@prisma/client`, `@prisma/engines`, `prisma`, `esbuild`, `@swc/core`, `@parcel/watcher`. Explicit `postinstall` still generated Prisma Client successfully.
- `npm warn Unknown env config "devdir"`.
- Port 3001 `EADDRINUSE` during `next start`; verification used 3011.

---

## Unresolved issues

- SQL `BEFORE DELETE` / `BEFORE UPDATE OF slug` triggers for `is_locked` need a later migration (Phase 2/3). Schema field + comments only in Phase 1.
- `CONTENT_SOURCE=postgres` mapper is not implemented (safe Sanity fallback).
- No Dashboard UI, auth runtime, or database.
- Local orphan `main` (`1a08b50`) should not be force-pushed; `origin/main` is the history of record.
- Locked-service enforcement is schema-ready, not runtime-enforced (no Postgres yet).

---

## Confirmations

- **Sanity was not removed.** Packages, `/studio`, env vars, image support, and `fetchSanityContent()` remain.
- **Production content was not modified.** No Sanity mutations, no dataset change, no write token added.
- **The seven golden services were untouched** in code order and in Sanity (this phase made no CMS writes).
- **No doors were introduced.** The only “doors” string in app TS is the constants comment that they are omitted.

---

## Git status (not committed, not pushed)

```
On branch phase-1-foundations
Changes not staged for commit:
	modified:   app/layout.tsx
	modified:   lib/content/repository.ts
	modified:   lib/content/source.ts
	modified:   package-lock.json
	modified:   package.json
	modified:   prisma/schema.prisma

Untracked files:
	scripts/
	PHASE_1_IMPLEMENTATION_REPORT.md
```

`git diff --stat` (uncommitted):

```
 app/layout.tsx            | 7 ++++---
 lib/content/repository.ts | 2 ++
 lib/content/source.ts     | 2 ++
 package-lock.json         | 1 +
 package.json              | 2 +-
 prisma/schema.prisma      | 6 ++++++
 6 files changed, 16 insertions(+), 4 deletions(-)
```

`middleware.ts`, `app/robots.ts`, `.env.example`, and `.gitignore` have **no uncommitted diff**; they landed earlier on `origin/main` as part of `0c36c9d`. Uncommitted `lib/content/` diff is the `server-only` imports only.

---

PHASE 1 COMPLETE — FOUNDATIONS ONLY — SANITY REMAINS THE PRODUCTION CONTENT SOURCE
