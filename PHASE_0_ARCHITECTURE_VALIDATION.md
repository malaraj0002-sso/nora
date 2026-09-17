# Nora Group — Phase 0 Architecture Validation

**Date:** 17 September 2026  
**Scope:** Validation only. No application code, Sanity data, packages, database, storage, Dashboard, or environment files were changed.  
**Application root:** `nora/` (this Next.js app). Cursor workspace wrapper: `N-G/`.  
**Source documents:** `PROJECT_AUDIT.md` (read in full). `IMPLEMENTATION_PLAN.md` was requested and **does not exist** in this repository or its git history.

---

## Document control

| Item | Finding |
|---|---|
| `PROJECT_AUDIT.md` | Present. Dated 15 September 2026. Describes a **Sanity-for-content + Postgres-for-users** Dashboard. That is **not** the architecture being validated in this phase. |
| `IMPLEMENTATION_PLAN.md` | **Missing.** No file, no git history, no alternate filename (`*PLAN*`). This report is the Phase 0 plan of record until one is written. |
| Proposed Postgres content schema | **Not in `PROJECT_AUDIT.md`.** The table list in the Phase 0 brief (services, translations, media, users, …) is treated as the candidate schema and reviewed in §6. |
| Current production content | Sanity Cloud project `g32xvgua`, dataset `production`, seven golden services restored 17 September 2026 (`RESTORE_SERVICES_REPORT.md`). |

**Architectural pivot (must stay explicit):**

```
PROJECT_AUDIT.md (15 Sep)          THIS PHASE (17 Sep)
--------------------------          -------------------
Website → Sanity CDN                Website → server repository → PostgreSQL
Dashboard → Sanity write token      Dashboard → /dashboard + /api/admin/* → PostgreSQL
Postgres = users only               Postgres = content + users + media metadata
Better Auth + Drizzle recommended   Re-evaluated; Prisma selected (see §4)
```

Sanity must remain fully functional until a later, explicit cutover. Production `CONTENT_SOURCE` stays `sanity` through Phase 7.

---

## 1. Repository validation

Inspected without modification: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `middleware.ts`, `app/`, `components/`, `lib/`, `sanity/`, `public/`, `.env.example`, `.gitignore`, git status, current branch.

### 1.1 Git and workspace

Two git repositories exist. This is a real operational risk.

| Location | State |
|---|---|
| `C:/Users/Heyam/Desktop/N-G` (Cursor workspace) | Branch `master`. **No commits.** No remotes. Only untracked `nora/`. |
| `C:/Users/Heyam/Desktop/N-G/nora` (actual app) | Branch `main`, **clean**, tracking `origin/main`. Remote: `https://github.com/malaraj0002-sso/nora.git`. HEAD `a2ed84f`. |

All future Phase 1+ work must happen in **`nora/`** (the repo with history). Do not initialize a competing project at the `N-G` wrapper.

`PROJECT_AUDIT.md` says the Next.js app is at “repo root”. That is true **inside `nora/`**. It is not true of the Cursor workspace `N-G/`.

### 1.2 Stack (confirmed)

| Layer | Present |
|---|---|
| Next.js | `^15.2.4` (App Router only; no `pages/` router) |
| React | `^19.0.0` |
| TypeScript | `^5.5.3`, `strict: true`, path alias `@/*` |
| next-intl | `^4.0.2` — routing/`dir` only (`messages: {}`) |
| Tailwind | `3.4.1` |
| Sanity | `sanity` `^3.78.1`, `next-sanity` `^9.9.0`, embedded `/studio` |
| Auth library | **None** |
| ORM / Postgres | **None** |
| Dashboard routes | **None** |
| `vercel.json` | **Absent** |
| ESLint config | **Absent** (`npm run lint` is not a real gate) |
| `node_modules` | **Missing locally** (lockfile exists; `npm install` not run in this workspace) |
| Package manager | npm only (`package-lock.json` lockfileVersion 3). No pnpm/yarn/bun/workspaces. |

Scripts: `dev` (Turbopack, **port 3001**), `dev:webpack`, `studio` (port 3333), `build`, `start`, `typecheck`, `lint` (unconfigured).

### 1.3 Directory map (current)

```
nora/
├── app/[locale]/          Public marketing pages (he / ar / en / ru)
├── app/studio/            Embedded Sanity Studio (own html/body)
├── app/api/revalidate/    Sanity webhook → ISR
├── app/layout.tsx         Passthrough (no html/body) — allows isolated roots
├── components/            Public UI (HomeView must not be redesigned)
├── lib/content/           SiteContent types, seed, getSiteContent(), chrome
├── lib/sanity/            Public fetch + image URLs
├── sanity/                Studio config, schemas, structure
├── i18n/                  next-intl routing
└── public/                Logos, 17 seed JPEGs, hero.mp4, favicon
```

There is no `app/dashboard/`. There is no `app/api/admin/`. There is no `pages/` Next.js router.

### 1.4 Public routes (do not change)

Locales: Hebrew default unprefixed `/`; `/ar`, `/en`, `/ru`. `localeDetection: false`.

`/`, `/about`, `/services`, `/services/[slug]`, `/projects`, `/projects/[slug]`, `/materials`, `/how-we-work`, `/testimonials`, `/blog`, `/blog/[slug]`, `/faq`, `/contact`, `/privacy`, `/cookies`, `/terms`

Plus `/studio` and `POST /api/revalidate`. `robots.ts` disallows `/studio` and `/api/` only — **not** `/dashboard` (route does not exist yet).

### 1.5 Environment (`.env.example` only; not modified)

| Variable | Role |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Example `g32xvgua` |
| `NEXT_PUBLIC_SANITY_DATASET` | Default `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Default `2025-01-01` |
| `SANITY_REVALIDATE_SECRET` | Webhook; empty = always 401 |
| `NEXT_PUBLIC_SITE_URL` | Canonical / sitemap (`https://www.officialnoragroup.com`) |

No `DATABASE_URL`, no `CONTENT_SOURCE`, no auth secrets. `.gitignore` already ignores `.env`, `.env*.local`, `.env.production`, and a catch-all `.env*` (this last rule also ignores `.env.example` for new git adds — keep `.env.example` tracked via an exception in Phase 1).

No `.env.local` or `.env.production` is present on disk.

### 1.6 Golden services (confirmed in code and restore report)

`SERVICE_SLUGS` in `lib/constants.ts` and `lib/content/seed.ts` (order preserved):

1. `kitchens`
2. `bedrooms`
3. `wardrobes`
4. `walk-in-closets`
5. `custom-furniture`
6. `offices`
7. `commercial`

Sanity production document IDs (`RESTORE_SERVICES_REPORT.md`): `service-kitchens` … `service-commercial`. No doors. No CMS test service. Localized `title` / `description` / `body` / `features` for `he`, `ar`, `en`, `ru`. Images on Sanity CDN.

**Do not modify these seven records, their order, localized fields, or images during any phase until an explicit, verified import has matched them.**

### 1.7 Content read path (current)

```
app/[locale]/*  →  loadLocalePage() / getSiteContent()
                      ├─ Sanity configured → fetchSanityContent() deep-merged onto seed
                      └─ missing / timeout / error → seedContent
SiteProvider holds chrome only (nav, contact, visibility), not the full CMS blob.
```

Public Sanity client: `useCdn: true`, `perspective: 'published'`, **no token**. Correct. No write client exists.

### 1.8 Security snapshot (still true)

- No staff auth except Sanity project members for `/studio`.
- No `NEXT_PUBLIC_` write token (good).
- Webhook rate limit is in-memory (weak on Vercel).
- Production CSP allows `'unsafe-inline'` and `'unsafe-eval'` for Studio.
- `mediaSrc()` allowlist: local `/public` paths + `cdn.sanity.io` only.
- Seed fail-open: CMS outage shows seed copy/contact.

**Repository verdict:** Healthy standalone Next.js 15 app. Clean git in `nora/`. Suitable as the single deployable for website + future `/dashboard`. Not ready for Postgres/Dashboard until Phase 1 foundations below.

---

## 2. Architecture validation

### 2.1 Proposed target

```
Public website (unchanged UI)
        │  server-only read
        ▼
Next.js server  ── CONTENT_SOURCE=sanity|postgres
        │
        ├─ sanity  → existing fetchSanityContent()  → Sanity CDN (keep)
        └─ postgres → new mapper → PostgreSQL (later)

/dashboard  ── session cookie + RBAC ── /api/admin/* ── PostgreSQL
                 │
                 └─ signed upload ── object storage
                                      │
                                      └─ media metadata in PostgreSQL
```

### 2.2 Is this appropriate for *this* repository?

**Yes, with conditions.** It fits the locked standalone-app rule, the existing `getSiteContent()` contract, and the requirement that Dashboard share the marketing domain.

| Rule | Fit |
|---|---|
| Single Next.js app, no monorepo | Yes. `/dashboard` as a sibling of `/studio` and `/[locale]`. |
| No second Dashboard domain | Yes. Same origin cookies are simpler and safer than a separate host. |
| Do not expose Postgres to the browser | Yes, if Prisma/client and `DATABASE_URL` stay server-only (never `NEXT_PUBLIC_*`). |
| No public anonymous write API | Yes, if all writes are `/api/admin/*` or server actions gated by session + permission. |
| Sanity stays up during migration | Yes, if `CONTENT_SOURCE` defaults to `sanity` and production is not flipped until Phase 8. |
| Do not rewrite public pages | Yes, if Postgres implements the existing `SiteContent` type. |
| Do not store image binaries in Postgres | Yes. Object storage + `media` metadata. |

### 2.3 What must not be built as a public API

- No `POST /api/content/*` without a session.
- No client-side Prisma.
- No Sanity write token in the browser (still true; do not add `NEXT_PUBLIC_SANITY_API_WRITE_TOKEN`).
- Dashboard mutations must not be reachable from the marketing site’s forms (there are none today except cookie notice).

### 2.4 Where `PROJECT_AUDIT.md` is superseded

Keep from the audit: standalone app, npm only, no doors, no quote funnel, keep `/studio`, keep seed fallback, keep public UI, users never in Sanity.

Replace from the audit: “Dashboard writes to Sanity Cloud” and “Better Auth + Drizzle as the locked stack”. Content of record will become PostgreSQL. Auth is redesigned in §5. ORM is Prisma (§4).

**Architecture verdict:** Appropriate. Do not implement it in this phase.

---

## 3. Dashboard routing validation

### 3.1 Can `/dashboard` coexist with `/[locale]`, `/studio`, `/api/revalidate`, and next-intl?

**Yes — but not with the current middleware.** Without a matcher change, next-intl will treat `/dashboard` as a Hebrew (unprefixed) marketing path.

Current `middleware.ts`:

```ts
export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(he|ar|en|ru)/:path*', '/((?!api|studio|_next|_vercel|.*\\..*).*)'],
};
```

| Path | Today |
|---|---|
| `/studio` | Excluded by negative lookahead. Isolated layout. Works. |
| `/api/revalidate` | Excluded via `api`. Works. |
| `/dashboard` | **Not excluded.** Matcher 3 catches it. next-intl `localePrefix: 'as-needed'` + default `he` will interpret it as Hebrew. |
| `/en/dashboard` | Matcher 2 (`/(he|ar|en|ru)/:path*`) catches it even if `dashboard` is added only to matcher 3. |

App Router static `app/dashboard` would beat dynamic `app/[locale]` for the URL `/dashboard` **after** middleware. The failure is the middleware rewrite, not file-system routing.

Studio already proves the required pattern: sibling route + own `layout.tsx` with `<html>/<body>` + passthrough root layout + middleware exclusion. Dashboard must copy that pattern, not nest under `app/[locale]/dashboard`.

### 3.2 Required future middleware (Phase 1 — design only)

1. Skip next-intl entirely for `/dashboard`, `/dashboard/*`, `/api`, `/studio`.
2. Add `dashboard` to the negative lookahead of matcher 3.
3. Canonicalize locale-prefixed dashboard URLs so they never become product URLs:

| Incoming | Required behavior |
|---|---|
| `/dashboard` | Pass through (no locale). |
| `/dashboard/login` | Pass through. |
| `/en/dashboard`, `/ar/dashboard`, `/ru/dashboard`, `/he/dashboard` | **308 redirect to `/dashboard…`** (strip locale). There is no strong reason to keep prefixed Dashboard URLs. |

Hebrew is unprefixed on the marketing site. A prefixed Dashboard would be inconsistent, would duplicate auth cookies/paths, and would risk `[locale]` layouts injecting Header/Footer onto staff pages.

4. Dashboard layout must **not** import `SiteProvider`, `Header`, `Footer`, or `globals.css` of the marketing site (same isolation as Studio).
5. `robots.ts` must disallow `/dashboard` (and `/dashboard/`).
6. Optional later: middleware session gate that redirects anonymous users to `/dashboard/login`, with matcher still excluding next-intl.

There is **no** strong technical reason to ship `/ar/dashboard` or `/en/dashboard`. Staff UI language (if any) should be a Dashboard setting, not a next-intl route.

### 3.3 `/api/admin/*`

Already excluded from next-intl via `api`. Keep admin APIs under `/api/admin/*`. Do not create `/api/*` write routes that are public. Keep `POST /api/revalidate` as the Sanity webhook until Postgres publishing has its own revalidate path.

**Routing verdict:** Safe if and only if middleware + robots + isolated layout are done before the first Dashboard page. Otherwise `/dashboard` becomes a broken Hebrew route.

---

## 4. ORM recommendation

Nothing installed. Comparison only.

| Criterion | Prisma | Drizzle |
|---|---|---|
| Next.js 15 App Router | Supported on **Node.js runtime**. Edge needs a driver adapter. This app already uses `runtime = 'nodejs'` for `/api/revalidate`. | Excellent on Node and serverless; no binary engine. |
| TypeScript | Generated client from schema; strong for a large CMS model. | SQL-like schema in TS; also strong. |
| Vercel | Documented. Use driver adapter + `postinstall: prisma generate`. Historical Rust-binary pain is avoided with Prisma 6.16+ `engineType = "client"` + adapter. | Smaller footprint; fewer deploy footguns. |
| PostgreSQL | First-class. Neon pooled URL + unpooled `directUrl` for migrations. | First-class. Neon serverless driver is native. |
| Migrations | `prisma migrate` — mature, reviewable SQL, good for content CMS. | `drizzle-kit` — good, younger operational lore. |
| Developer experience | Prisma Studio useful while verifying the seven golden services. Schema file is readable for 25+ tables. | Closer to SQL; less “Studio” for editors/devs. |
| Long-term maintainability | Better for a growing relational CMS (translations, publishing, FKs). | Better for a tiny auth-only database. |
| Auth libraries | Adapters exist (Auth.js, Better Auth). | Better Auth’s happiest path historically. |

`PROJECT_AUDIT.md` recommended Drizzle because Postgres was **only** going to hold users. That assumption is no longer true. Postgres is now the CMS of record.

**Choice: Prisma** (Prisma 6.16+ or current Prisma 6/7 stable at implementation time) with:

- PostgreSQL provider
- `@prisma/adapter-neon` (or `@prisma/adapter-pg` if not on Neon)
- `DATABASE_URL` = pooled
- `DATABASE_URL_UNPOOLED` / `DIRECT_URL` = migrations
- Client **only** in server modules (`lib/db/`, Route Handlers, server actions)
- Never on the Edge middleware path for queries (middleware may read a session cookie and call a Node route; do not instantiate Prisma in `middleware.ts` unless the adapter is proven on Edge)

Drizzle remains a viable alternative. It is not selected. Do not install either in Phase 0.

---

## 5. Authentication architecture (design only)

No implementation. No users in Sanity. No plaintext passwords.

### 5.1 Principles

- Staff auth is first-party inside this Next.js app.
- Session is a **server-side row**, not a client JWT as the source of truth.
- Cookie: HttpOnly, `Secure` in production, `SameSite=Lax`, `Path=/`, preferably `__Host-nora-session` (implies no `Domain` attribute, `Secure`, `Path=/`).
- Password hash: **Argon2id** (`@node-rs/argon2` on Node.js runtime). bcrypt (`bcryptjs`) is the documented fallback if a native Argon2 build ever fails on Vercel — not the primary.
- Never return password hashes, reset tokens, or session secrets to the client.
- Every `/api/admin/*` handler and every Dashboard server action calls `requirePermission(...)`.
- RBAC is enforced on the server only. Hiding a nav item is not authorization.

Better Auth / Auth.js / Clerk are **not** required. Clerk is rejected (extra vendor, users still need our permission tables). Better Auth is optional later; its default hasher is scrypt, which does not meet the Argon2id/bcrypt requirement without a custom hasher. For this CMS, a small first-party auth module is the better fit.

Email for password reset: Resend (or any SMTP) with `AUTH_EMAIL_FROM`. Not in Phase 1 UI.

### 5.2 Tables (identity)

```
roles 1──┬── role_permissions ── permissions
         │
users *──┘  (users.role_id, single role per user for v1)
         │
         ├── sessions
         ├── password_reset_tokens
         └── audit_logs
```

Single role per user is enough for five roles. Do not add many-to-many `user_roles` until a real case appears.

### 5.3 Initial roles

| Role | Dashboard | Content | Publish | Media | Users / roles | Translations |
|---|---|---|---|---|---|---|
| `super_admin` | Full | Full | Yes | Full | Full; cannot delete last super_admin | Full |
| `admin` | Full except super_admin users | Full | Yes | Full | Create/disable admin and below | Full |
| `editor` | CMS | Full except user admin | Yes | Upload/replace | No | Full |
| `translator` | CMS (locale fields) | Update translation rows only; no slug/order/delete | No | No delete | No | Yes (non-structural) |
| `viewer` | Read-only | Read | No | No | No | Read |

`translator` must not be able to delete or reorder the seven golden services, change slugs, or publish.

### 5.4 Permissions (catalog, not code)

Use stable string keys, for example:

- `dashboard.access`
- `content.read` / `content.update` / `content.publish` / `content.delete`
- `services.update` / `services.delete` (delete denied for locked slugs even if the role has `content.delete`)
- `media.upload` / `media.delete`
- `users.read` / `users.manage`
- `roles.manage`
- `audit.read`
- `translations.update`

Store permissions in `permissions` + `role_permissions` so the matrix can change without a code deploy. Seed the five roles in a migration. Do not let the Dashboard invent new role names without a migration.

### 5.5 Sessions

| Column (logical) | Notes |
|---|---|
| `id` | UUID |
| `user_id` | FK, on delete cascade |
| `token_hash` | SHA-256 of the cookie value (store hash, not raw token) |
| `expires_at` | Sliding or absolute (recommend 7 days absolute + rotation on login) |
| `revoked_at` | Logout / password change / disable user |
| `ip`, `user_agent` | Audit aid |
| `created_at` | |

On user disable: revoke all sessions. On password change: revoke all sessions except optionally the current one.

### 5.6 Audit logs

Every admin mutation writes `audit_logs`: `actor_user_id`, `action`, `entity_type`, `entity_id`, `metadata` (JSON, no secrets), `ip`, `created_at`. Immutable from the Dashboard (insert-only). Retention can be decided later; do not expose a delete-audit permission in v1.

### 5.7 Login surface

- `GET /dashboard/login` — unauthenticated
- `POST /api/admin/auth/login` — rate-limited, constant-time failure
- `POST /api/admin/auth/logout`
- Forgot-password in a later phase (needs email)

No hardcoded admin user in git. First `super_admin` created by a **local/staging CLI seed** using env `BOOTSTRAP_ADMIN_EMAIL` + hash, never a default password in source.

---

## 6. PostgreSQL schema review

`PROJECT_AUDIT.md` does **not** contain a content schema. The brief’s table list is the candidate. It is **not sufficient** to replace Sanity behind `SiteContent`.

### 6.1 Current `SiteContent` contract (must be preserved)

Defined in `lib/content/types.ts`. Public pages consume this via `getSiteContent()` / `loadLocalePage()`. Postgres must map to:

- `settings` (brand, contact, logos, SEO, social, map)
- `nav` (per-locale chrome)
- `home` (hero, intro cards, why items, section titles, CTA, hero image URLs, featured slugs, SEO)
- `about` (hero, body, mission, vision, values)
- `howWeWork` (hero + **steps array**)
- `contactPage`, `faqPage`, `blogPage` heroes
- `categoryLabels`
- `services[]`, `projects[]`, `materials[]`, `testimonials[]`, `blogPosts[]`, `faq[]`
- `legal` (today code in `lib/content/legal.ts` — keep in code unless product asks otherwise)
- `ui` chrome strings (`madeBy` / lazaCore **must remain code-hardcoded**)

Images in this contract are **URL strings**, not binaries. The mapper resolves `media.public_url`.

### 6.2 Candidate tables — keep / fix / drop

| Proposed | Verdict |
|---|---|
| `services` | **Keep.** Add `slug` UNIQUE, `sort_order`, `visible`, `featured`, `status`, `is_locked` (true for the seven golden slugs), `primary_media_id`, timestamps. |
| `service_translations` | **Keep.** `UNIQUE (service_id, locale)`. Columns: `title`, `description`, `body`, `seo_title`, `seo_description`. Locale CHECK `he|ar|en|ru`. Hebrew required before publish. |
| `service_features` | **Keep**, but features are localized. Add `service_feature_translations` **or** store `title` as JSONB `LocalizedString`. Do not use a single untranslated string. |
| `service_images` | **Keep.** `role` = `primary` \| `gallery`, `sort_order`, FK `media_id`. |
| `projects` | **Keep.** `slug` UNIQUE, `category` CHECK against current enums (`kitchens`, `bedrooms`, `wardrobes`, `furniture`, `commercial`), `completed_at`, `visible`, `featured`, `status`. |
| `project_translations` | **Missing from brief — required.** title, description, location, SEO. |
| `project_materials` | **Keep** as M2M to `materials` (today Sanity stores slug strings; FKs are an upgrade). |
| `project_services` | **Unnecessary for v1 parity.** Projects have a `category`, not a service M2M. `walk-in-closets` and `offices` are services but not project categories. Defer. |
| `project_images` | **Missing — required** (gallery). |
| `materials` | **Keep.** `slug` UNIQUE, optional `category`, `visible`, `featured`, `sort_order`. |
| `material_translations` | **Missing — required.** name, description, characteristics, applications, finishes. |
| `material_images` | Optional; a single `primary_media_id` is enough for current UI. |
| `media` | **Keep.** Metadata only: `storage_key`, `public_url`, `mime`, `byte_size`, `width`, `height`, `blurhash`, `uploaded_by`, timestamps. **No `BYTEA`.** Alt text: columns or `media_translations`. |
| `site_settings` | **Keep** as singleton (`id` fixed). Non-localized contact fields here. |
| `site_settings_translations` | **Missing — required** (tagline, pillars, address, hours, whatsapp_message, seo). |
| `home_page` | **Keep** as singleton. Featured service/project slugs as arrays or join tables. |
| `home_page_translations` | **Missing — required** (all home copy). |
| `home_intro_features` / `home_why_items` | **Missing — required** (nested arrays on home). Each needs translations. |
| `hero_slides` | **Keep only as ordered hero images** (media + sort). Current site does not have per-slide titles; do not invent slide copy. |
| `users`, `roles`, `permissions`, `sessions`, `audit_logs` | **Keep** (+ `role_permissions`, `password_reset_tokens`). |

### 6.3 Missing tables (required for a no-rewrite cutover)

| Table | Why |
|---|---|
| `about_page` + translations + `about_values` + value translations | About page is CMS today. |
| `how_we_work_page` + translations + `how_we_work_steps` + step translations | Steps array, not separate documents. |
| `contact_page` + translations | Hero only; contact data stays in `site_settings`. |
| `faq_page` + translations | Page hero. |
| `faq_items` + `faq_item_translations` | Collection. |
| `blog_page` + translations | Page hero. |
| `blog_posts` + `blog_post_translations` | Collection; body can stay `TEXT` per locale (current Sanity is `localeText`, not Portable Text). |
| `testimonials` + `testimonial_translations` | `name` is a single untranslated string today — keep that. `review` and `project` are localized. |
| `ui_labels` | Either one row per locale (like Sanity `uiLabels`) **or** a `ui_labels` + translations table. Required for nav/footer chrome. |
| `home_featured_services` / `home_featured_projects` | Ordered FKs. Empty means fall back to `featured` flags then `sort_order` (`lib/content/featured.ts`). |

**Out of scope for v1 (keep in code):** `legal` pages, lazaCore footer `madeBy`, `lib/nav.ts` hrefs, `INTERFACE_COPY` if unused.

### 6.4 Publishing

Sanity’s draft/publish is not a boolean. Map to:

| Field | Rule |
|---|---|
| `status` | `draft` \| `published` \| `archived` |
| `visible` | Existing public flag; published + visible required for `getSiteContent()` |
| `published_at` | Set on first publish |
| `updated_at` | Always |

Public mapper: `WHERE status = 'published' AND visible = true` (services also ordered by `sort_order`). Drafts exist only in Dashboard / admin API.

v1 does not need a full version history table. Audit logs cover who-changed-what.

**Hebrew publish rule:** refuse publish if `he` title (and required fields) are empty. `en`/`ru`/`ar` may fall back to Hebrew on the public site (`t()` already does this). Translators fill other locales without blocking publish.

### 6.5 Golden service constraints

```
services.slug UNIQUE
services.is_locked BOOLEAN
CHECK (slug in the seven) → is_locked = true
BEFORE DELETE / BEFORE UPDATE OF slug
  → abort if is_locked
```

Application layer must mirror this (`SERVICE_SLUGS`). Database is the last line of defense. **No delete API for locked rows.**

### 6.6 Indexing and uniqueness (minimum)

| Table | Indexes / constraints |
|---|---|
| `services` | UNIQUE `slug`; INDEX `(visible, sort_order)` |
| `*_translations` | UNIQUE `(parent_id, locale)`; FK ON DELETE CASCADE |
| `projects` | UNIQUE `slug`; INDEX `(visible, category)` |
| `materials` | UNIQUE `slug` |
| `blog_posts` | UNIQUE `slug`; INDEX `(visible, date DESC)` |
| `media` | UNIQUE `storage_key`; UNIQUE `public_url` optional |
| `users` | UNIQUE `email` (citext or lowercased) |
| `sessions` | UNIQUE `token_hash`; INDEX `(user_id, expires_at)` |
| `audit_logs` | INDEX `(created_at DESC)`; INDEX `(entity_type, entity_id)` |
| `roles` | UNIQUE `key` |
| `permissions` | UNIQUE `key` |
| `ui_labels` | UNIQUE `locale` if one-row-per-locale |

Foreign keys everywhere (no orphan translation or image rows). `ON DELETE RESTRICT` for `media` still referenced by published content; `ON DELETE CASCADE` for translation children.

### 6.7 Locale constraint

```sql
locale TEXT NOT NULL CHECK (locale IN ('he', 'ar', 'en', 'ru'))
```

Do not add a `locales` table unless a fifth language is a real product requirement.

### 6.8 JSONB vs translation tables

Translation tables are correct for the `translator` role (row-level updates, audit per locale). Nested cards (`introFeatures`, `whyItems`, `values`, `steps`, `features`) also need child tables + translations, or a JSONB `LocalizedString` column **per field** on the child row. Prefer child tables for steps/features/values; JSONB is acceptable only for true `LocalizedString` scalars if it keeps the mapper simple.

Do **not** store the entire `SiteContent` blob as one JSON document. That would bypass RBAC, translations, and golden-service constraints.

**Schema verdict:** Candidate list is a start, not a migration. Expand as above **before** Phase 2 `migrate`. Do not create tables in Phase 0.

---

## 7. Content abstraction (`getSiteContent()`)

Inspected: `lib/content/getContent.ts`, `types.ts`, `seed.ts`, `chrome.ts`.

### 7.1 Why this is the cutover hinge

Every public page already goes through `getSiteContent()` (via `loadLocalePage` / layout / sitemap / slug `generateStaticParams`). Views (`HomeView`, `ServicesView`, …) take `SiteContent`. They must not import Prisma or Sanity.

### 7.2 Target switch (design)

```
CONTENT_SOURCE=sanity     → fetchSanityContent()     (default, production now)
CONTENT_SOURCE=postgres   → fetchPostgresContent()   (later)
unset / error             → seedContent              (keep fail-open for now)
```

`getSiteContent()` stays `React.cache()`’d. Postgres fetch uses `revalidateTag` equivalents (same `REVALIDATE_TAGS`) so Dashboard publish can call `revalidateTag('services')` etc.

`toChrome()` stays unchanged: it already projects `SiteContent` → header/footer props.

`mediaSrc()` must later allow the object-storage host in addition to `/` and `cdn.sanity.io`. Until then, Postgres-sourced Sanity CDN URLs still work if import copies those URLs; new R2 URLs will  fallback-replace if the allowlist is not updated — **that allowlist change is a Phase 4 prerequisite**, not a public redesign.

### 7.3 Mapper duty

`fetchPostgresContent(): Promise<SiteContent>` must return the **same shape** as `fetchSanityContent()`, including:

- `LocalizedString` objects `{ he, ar, en, ru }` (assemble from translation rows)
- service order = `sort_order`
- missing locale → empty string, then `t()` falls back to Hebrew
- `legal` from `lib/content/legal.ts`
- `ui[locale].madeBy` from code, not CMS

Do not change `HomeView` or public routes to “adapt” to tables.

### 7.4 Seed

Keep `lib/content/seed.ts` as last-resort fallback. Do not treat seed as a second CMS. Do not create mock services. After Postgres cutover, seed remains for local/dev without `DATABASE_URL`.

**Abstraction verdict:** The contract is already the right one. Phase 1 should add the switch with `postgres` unimplemented or throwing “not enabled”, default `sanity`.

---

## 8. Media / storage comparison

PostgreSQL must not store binaries. Dashboard uploads → object storage → `media` row.

| | Cloudflare R2 | Vercel Blob | AWS S3 + CloudFront |
|---|---|---|---|
| Storage cost | Low (~$0.015/GB-mo) | Moderate; billed on Vercel | S3 Standard ~$0.023/GB-mo |
| Egress | **$0** to the internet | Counts as Vercel bandwidth | S3 egress expensive; CloudFront still charges egress |
| Image-heavy site | **Best cost profile** for a photography-heavy millwork catalog | Fine for low volume; gets costly as galleries grow | Fine if already in AWS; wasteful here |
| Vercel compatibility | S3 API; presigned PUT from Node; add host to `images.remotePatterns` + CSP | Native `@vercel/blob`; easiest DX | SDK + IAM; more moving parts |
| Signed uploads | S3-compatible presign after session check | `put()` from server or client token | Presigned PUT/POST |
| CDN | Custom domain on R2 (e.g. `cdn.officialnoragroup.com`) via Cloudflare | Vercel’s network | CloudFront |
| Transforms | Not built-in. Use `next/image` and/or Cloudflare Image Resizing later | Limited; `next/image` still used | CloudFront + Lambda or `next/image` |
| Operational complexity | Medium (Cloudflare account, DNS, CORS on bucket) | **Lowest** | Highest (IAM, OAC, cache headers) |

**Choice: Cloudflare R2 + public custom domain.**

Reasons (not convenience):

1. This site is image-heavy (services, project galleries, materials, home hero, blog). Egress dominates cost. R2’s zero egress is the correct economic default.
2. Same-domain Dashboard can presign uploads server-side; the browser never sees storage secrets.
3. Vercel Blob binds media to the Vercel account and bandwidth bill; wrong long-term for a portfolio CDN.
4. S3+CloudFront is industry-standard but strictly worse on egress and ops for a one-app SME site.

Transforms: keep `next/image` (`avif`/`webp` already configured). Add the R2/custom hostname to `remotePatterns`. Optionally add Cloudflare Image Resizing later; not a Phase 1 blocker.

Public URLs stored in `media.public_url` (https only). Seed `/images/*.jpg` remain as fallback files in `public/` — do not delete.

**Do not create a bucket in this phase.**

---

## 9. Deployment architecture

Target: **one Vercel project** + **PostgreSQL** + **R2**. No second domain for Dashboard.

```
www.officialnoragroup.com
  /                 marketing (next-intl)
  /studio           Sanity (keep)
  /dashboard        staff CMS
  /api/revalidate   Sanity webhook (keep until cutover)
  /api/admin/*      session + RBAC
```

Apex `officialnoragroup.com` already 301s to `www` in `next.config.ts`. Dashboard cookies must be set on `www` (the canonical host). `__Host-` cookies will not work on the apex redirect target mismatch — good; staff should only use www.

### 9.1 Vercel

| Item | Requirement |
|---|---|
| Root directory | `nora` if the GitHub app is ever the `N-G` wrapper; **current GitHub remote is already the `nora` repo**, so root is `/`. |
| Build | `npm run build` (add `postinstall`: `prisma generate` once Prisma exists) |
| Install | `npm install` |
| Node | 20+ (README already) |
| Region | Place Vercel and Postgres in the same or nearby region |
| Output | Next.js (not static export) |

No `vercel.json` today. Do not add one until a concrete need (headers are already in `next.config.ts`).

### 9.2 Postgres

Recommended host: **Neon** (serverless Postgres, Vercel integration, branching for staging). Alternatives (RDS, Supabase Postgres) are fine if pooled.

Staging and production must be **separate databases** (and separate R2 prefixes or buckets). Never point staging `CONTENT_SOURCE=postgres` at production data.

### 9.3 Prisma on Vercel

- `prisma generate` during install/build
- Driver adapter; no reliance on bundling a Rust query engine if using client engine
- Admin routes: `export const runtime = 'nodejs'`
- Do not query Prisma from Edge middleware
- Connection count: pooled URL only in the app

### 9.4 Environment variables (planned; not applied)

Public:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
NEXT_PUBLIC_SITE_URL=https://www.officialnoragroup.com
CONTENT_SOURCE=sanity
```

`CONTENT_SOURCE` does not need to be public. Prefer **server-only** `CONTENT_SOURCE` so the browser cannot be instructed to “switch CMS”.

Private:

```
SANITY_REVALIDATE_SECRET=
DATABASE_URL=                 # pooled
DATABASE_URL_UNPOOLED=        # migrations
AUTH_SECRET=                  # 32+ bytes
AUTH_EMAIL_FROM=
RESEND_API_KEY=               # later
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=           # https://cdn.officialnoragroup.com
BOOTSTRAP_ADMIN_EMAIL=        # staging/local seed only
```

Never `NEXT_PUBLIC_DATABASE_URL`, never `NEXT_PUBLIC_R2_SECRET_*`, never `NEXT_PUBLIC_AUTH_SECRET`.

### 9.5 Images and CSP (later)

`next.config.ts` today:

- `images.remotePatterns`: `cdn.sanity.io` only
- CSP `img-src`: `'self' data: blob: https://cdn.sanity.io`
- CSP `connect-src`: Sanity hosts

Before R2 URLs go public:

- Add the CDN hostname to `remotePatterns`
- Add it to CSP `img-src`
- Add R2 upload endpoint to `connect-src` **only if** the browser PUTs to a presigned URL (preferred: upload via `/api/admin/media` proxy to keep CSP tighter)
- Keep Sanity CSP entries until Studio is retired (not this programme’s Phase 8 even — Studio stays)

Dashboard should **not** inherit a looser CSP than needed. Prefer a route-specific header for `/dashboard` later rather than weakening the whole site.

### 9.6 Production / staging

| | Production | Staging |
|---|---|---|
| Sanity dataset | `production` (read) | same or a later `staging` dataset; do not write prod from staging |
| Postgres | prod branch | staging branch |
| `CONTENT_SOURCE` | `sanity` until Phase 8 | `postgres` from Phase 7 |
| R2 prefix | `prod/` | `staging/` |
| `/studio` | remains | remains |

**Deployment verdict:** One domain, one Vercel project is correct. Configure env and root directory carefully because of the nested `N-G` / `nora` git layout.

---

## 10. Risks discovered

1. **`IMPLEMENTATION_PLAN.md` missing.** Phase 0 has no prior plan file; this document is the plan of record.
2. **Audit vs new architecture.** Following `PROJECT_AUDIT.md` Phase 2–9 as written would keep content in Sanity and install Drizzle/Better Auth. That conflicts with this migration. Do not execute the old phase list.
3. **Nested git.** Committing in `N-G` vs `nora` can lose history or push the wrong tree.
4. **Middleware will locale-capture `/dashboard`.** Highest technical blocker before any Dashboard file.
5. **Incomplete schema vs `SiteContent`.** Migrating only the brief’s tables would drop About, How We Work, blog, FAQ, testimonials, UI chrome, and home nested cards.
6. **`project_services` mismatch.** Implementing it as required would invent relations the public site does not use.
7. **Golden services.** An import that reorders, drops locales, or regenerates slugs would ship a public regression. Database locks + checksum verification required before `CONTENT_SOURCE=postgres`.
8. **`mediaSrc()` allowlist.** New CDN hosts will silently fall back to seed images until allowlist + CSP + `remotePatterns` are updated together.
9. **Prisma + serverless connections.** Wrong URL (unpooled in app) will exhaust Neon connections.
10. **Argon2 native bindings on Vercel.** Mitigate with `@node-rs/argon2` on Node runtime; bcryptjs fallback documented.
11. **Seed fail-open.** A Postgres outage after cutover would show seed contact numbers. Decide in Phase 8 whether to fail-open or fail to a static error; do not change behavior now.
12. **No ESLint; `node_modules` missing** in this workspace. Phase 1 must `npm install` and `npm run typecheck` before claiming green.
13. **In-memory webhook rate limit** remains weak; out of scope unless touching that route.
14. **Accidental production switch.** `CONTENT_SOURCE` must default to `sanity`. No Vercel env flip in Phases 1–7.
15. **Doors / extra services.** Dashboard create-service UI (later) needs a product-level block list; schema should not prevent legitimate new non-door services, but must not seed doors.
16. **`HomeView` protection.** Any content mapper bug shows up on the homepage. Visual/contract tests against the seven cards are required before cutover — without editing `HomeView`.
17. **`.gitignore` `.env*`** can untrack `.env.example` on re-add. Fix ignore exception in Phase 1.
18. **Translator vs field-level i18n.** If we flatten locales into JSON only, translator RBAC becomes column surgery. Translation tables are the safer model.

---

## 11. Required changes before Phase 1

These are **gates**, not Phase 1 work:

1. Agree that **`nora/` is the git remote of record** (`malaraj0002-sso/nora`). Do not develop in the empty `N-G` wrapper.
2. Agree this report **supersedes** `PROJECT_AUDIT.md` sections 18–20 where they conflict (Sanity-as-CMS-of-record, Drizzle/Better Auth lock).
3. Agree **Prisma**, **R2**, **first-party sessions + Argon2id**, **`CONTENT_SOURCE` default `sanity`**.
4. Agree Dashboard URLs are **unprefixed `/dashboard` only**.
5. Agree the seven services are locked; no doors; no public redesign; `/studio` stays.
6. Expand the schema to the missing tables in §6 **on paper** (this file) before generating migrations.
7. Restore local toolchain: Node 20+, `npm install` in `nora/` (Phase 1 start, still no product change).
8. Do **not**: migrate Sanity, create buckets, create Vercel env for Postgres cutover, or add Dashboard pages until Phase 1/5 as scheduled.

---

## 12. Exact implementation order

```
Phase 0  Architecture validation          ← this document
   │
Phase 1  Non-breaking foundations         sequential after 0
   │
   ├──────────────┬───────────────────────┐
Phase 2  Auth DB  Phase 3 Content DB      Phase 4 R2 config
   │              │                       │
   └──────┬───────┴──────────┬────────────┘
          │                  │
Phase 5  Dashboard shell + login + /api/admin auth
          │
Phase 6  Sanity → Postgres import (staging) + golden-service verify
          │
Phase 7  Dashboard CMS against Postgres (staging CONTENT_SOURCE=postgres)
          │
Phase 8  Production cutover (CONTENT_SOURCE=postgres), Studio remains
```

### Parallel vs sequential

| Work | Mode |
|---|---|
| Phase 0 | Sequential (done). |
| Phase 1 tasks (middleware, `CONTENT_SOURCE` stub, Prisma schema file, env example, robots) | **Mostly sequential in one PR**; middleware/robots can be authored in parallel with schema draft. |
| Phase 2 (identity tables) and Phase 3 (content tables) | **Same migrate stream, sequential files** (`0001_auth`, `0002_content`). Do not apply content migrations before auth if Dashboard bootstrap needs users — actually content can migrate without users; **parallel design, sequential apply**. |
| Phase 4 (R2) | **Parallel** with Phase 2/3 after credentials exist; **blocked** from public URLs until allowlist/CSP. |
| Phase 5 | **Blocked** on Phase 1 middleware + Phase 2 auth tables. |
| Phase 6 import | **Blocked** on Phase 3 schema + staging DB. Can run **in parallel** with Phase 5 UI. |
| Phase 7 CMS editors | **Blocked** on Phase 5 + Phase 6 verification for services. Other collections can follow. |
| Phase 8 | **Blocked** on staging parity of the seven services, media allowlist, and publish/revalidate. |

Never parallelize: production `CONTENT_SOURCE` flip, golden-service deletes, Sanity package removal, `HomeView` edits.

### Phase meanings (concrete)

**Phase 0** — This report. No product changes.

**Phase 1** — Foundations, Sanity still live. See checklist in §13.

**Phase 2** — Apply auth migrations; seed roles/permissions; hashing + session helpers; no login UI required until Phase 5.

**Phase 3** — Apply content/media migrations; empty tables; locked-slug constraints; no production read from Postgres.

**Phase 4** — R2 bucket + IAM-style keys in staging; signed upload helper; `mediaSrc` + CSP + `remotePatterns` for the CDN host; no production traffic.

**Phase 5** — `app/dashboard` isolated layout, login, session cookie, `/api/admin/auth/*`, RBAC helper, viewer-capable shell. **No CMS editors yet.**

**Phase 6** — Read-only export from Sanity (or GROQ dump) → insert Postgres. Diff the seven services (slug, order, four locales, image identity). Keep `CONTENT_SOURCE=sanity` in production.

**Phase 7** — Dashboard CRUD → Postgres. Staging website `CONTENT_SOURCE=postgres`. Production still Sanity.

**Phase 8** — Production `CONTENT_SOURCE=postgres`. Keep `/studio`, Sanity packages, seed fallback. Add Dashboard-triggered `revalidateTag`. Do not delete Sanity documents.

---

## 13. Exact Phase 1 implementation checklist

Phase 1 is **foundations only**. Production content stays on Sanity. No Dashboard UI. No `migrate deploy` against production. No R2 bucket. No package removal.

### Must do

1. Work in `nora/` on a branch from `main`. Confirm `git status` clean before starting.
2. `npm install` (lockfile already present). Confirm `npm run typecheck`.
3. **Middleware:** skip next-intl for `/dashboard` and `/dashboard/*`; add `dashboard` to matcher exclusions; 308 locale-prefixed dashboard URLs to `/dashboard`. **Do not add Dashboard pages yet** (exclusion can land first; `/dashboard` will 404 without a page — that is acceptable and safer than a locale capture).
4. **`app/robots.ts`:** disallow `/dashboard`.
5. **`getSiteContent()`:** introduce server-only `CONTENT_SOURCE` (`sanity` \| `postgres`). Default **`sanity`**. `postgres` branch: not implemented (throw or fall back to Sanity with a server log) — public pages unchanged.
6. Add `lib/content/repository.ts` (or equivalent) so Sanity fetch stays isolated; **do not** change view components, `HomeView`, or routes.
7. Author `prisma/schema.prisma` (or equivalent draft) covering **auth + expanded content** from §6. Do **not** run `prisma migrate` against production. Local migrate is optional and must not be required to boot the site.
8. `.env.example`: add placeholders `CONTENT_SOURCE=sanity`, `DATABASE_URL=`, `DATABASE_URL_UNPOOLED=`, `AUTH_SECRET=` — empty values. Do not add real secrets. Fix `.gitignore` so `.env.example` remains trackable (`!.env.example`).
9. `package.json`: if Prisma is installed, add `postinstall: prisma generate`. If Phase 1 only drafts the schema without installing, defer install to the first migrate phase — **prefer installing Prisma in Phase 1** so the schema is real, but **do not** connect it to production.
10. Keep all Sanity packages, `/studio`, seed, seven services, public routes.
11. `npm run typecheck` and `npm run build` must pass with Sanity still the default.
12. Update this report’s follow-up log only if Phase 1 discovers a contradiction (optional `IMPLEMENTATION_LOG.md` later — not required in Phase 1).

### Must not do in Phase 1

- Modify the seven services or any Sanity document
- Remove `/studio` or Sanity packages
- Edit `HomeView` or redesign the public site
- Add doors / mock services
- Switch production to Postgres
- Create R2/S3/Blob buckets
- Build Dashboard screens or login UI
- Create a public write API
- Change next-intl locale list or marketing pathnames
- Commit `.env.local`

### Phase 1 acceptance

- `/`, `/en`, `/studio` still work conceptually (middleware still skips studio/api).
- `/dashboard` is **not** rewritten to a locale layout (404 without a page is OK).
- `/en/dashboard` would redirect to `/dashboard` once middleware ships.
- `CONTENT_SOURCE` unset or `sanity` → existing Sanity/seed path.
- No production data changed.

---

## 14. Final go / no-go recommendation

**GO for Phase 1 foundations. NO-GO for cutover, Dashboard UI, migrations-on-production, and storage provisioning.**

| Decision | Recommendation |
|---|---|
| Proceed with Postgres-backed CMS in this same Next.js app | **Go** |
| Dashboard at `/dashboard` on the marketing domain | **Go**, after middleware exclusion |
| Prisma as ORM | **Go** |
| R2 as object storage | **Go** (create later) |
| First-party Argon2id sessions + five roles | **Go** (implement later) |
| `CONTENT_SOURCE` switch behind `getSiteContent()` | **Go** |
| Keep Sanity live until Phase 8 | **Mandatory** |
| Execute old `PROJECT_AUDIT.md` Better Auth + Drizzle + Sanity-write Dashboard | **No-go** |
| Create tables / buckets / Dashboard in Phase 0 | **No-go** (already respected) |
| Locale-prefixed Dashboard | **No-go** |

**Conditions of go:** Phase 1 follows the checklist in §13; golden services remain untouched; `HomeView` untouched; no doors.

---

PHASE 0 COMPLETE — NO APPLICATION OR CMS CHANGES MADE
