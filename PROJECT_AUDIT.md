# Nora Group — Project Audit

**Date:** 15 September 2026  
**Repository:** standalone Next.js app at repo root (`package.json` name: `nora-group`)  
**Status:** Studio-only CMS implementation completed 15 September 2026. There is no `/dashboard` and no custom auth. `/studio` is the control panel.  
**Package manager:** npm (`package-lock.json` present). pnpm, yarn, bun, workspaces, Turborepo, and Nx are out of scope.

This audit describes the current standalone project and the recommended path to a production Dashboard + Sanity CMS. It does **not** propose a monorepo.

---

## Locked constraints

| Constraint | Status |
|---|---|
| Single standalone Next.js project | **Confirmed in repo. Keep it.** |
| No `apps/web`, `apps/Dashboard`, `packages/` | **Do not create.** |
| No `pnpm-workspace.yaml`, Turborepo, Nx | **Do not create.** |
| npm only | **Confirmed.** |
| Dashboard lives in this same app (`/dashboard`) | **Recommended and required by the standalone rule.** |
| Sanity Cloud = website content | **Already started; complete it.** |
| Users/passwords never in Sanity | **Nothing to remove; do not add.** |
| Do not redesign the public marketing site | **Keep existing UI unless a CMS field is missing.** |
| No door manufacturing services | **None in seed or schemas. Do not add.** |

---

## 1. Current project architecture

```
NoraGroupWebsite/          ← one Next.js 15 App Router app
├── app/[locale]/          Public marketing pages (he / ar / en / ru)
├── app/studio/            Embedded Sanity Studio
├── app/api/revalidate/    Sanity webhook → ISR
├── components/            Public UI
├── lib/content/           Types, seed fallback, getSiteContent()
├── lib/sanity/            Public fetch + image URLs
├── sanity/                Studio config, schemas, structure
├── i18n/                  next-intl routing (messages are empty)
└── public/                Logos, seed photos, hero.mp4
```

There is **no** `pages/` Next.js router (only `components/pages/` view components).  
There is **no** `apps/` directory.  
There is **no** Dashboard route group.

| Layer | Present today |
|---|---|
| Next.js 15 + React 19 + TypeScript | Yes |
| Tailwind 3 | Yes |
| next-intl | Routing / `dir` only (`messages: {}`) |
| Sanity Studio (embedded `/studio`) | Yes |
| Sanity Cloud read path | Yes |
| Custom Nora Dashboard | **No** |
| Auth library | **No** |
| User database | **No** |
| Sanity write token in Next.js | **No** |
| `vercel.json` | **No** (Vercel defaults apply) |

### Scripts (`package.json`)

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js Turbopack, **port 3001** |
| `npm run dev:webpack` | Same, Webpack |
| `npm run studio` | Standalone Studio, port 3333 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | **Not configured** (no ESLint config) |

---

## 2. Current website architecture

Marketing site for Nora Group (custom carpentry / interior design, Migdal Oz). Contact-only CTAs (phone + WhatsApp). Not a quote funnel.

### Locales

| Locale | Direction | URL |
|---|---|---|
| Hebrew (`he`) — default | RTL | Unprefixed `/` |
| Arabic (`ar`) | RTL | `/ar` |
| English (`en`) | LTR | `/en` |
| Russian (`ru`) | LTR | `/ru` |

`localeDetection: false`. Browser language does not redirect `/`.

### Public routes

`/`, `/about`, `/services`, `/services/[slug]`, `/projects`, `/projects/[slug]`, `/materials`, `/how-we-work`, `/testimonials`, `/blog`, `/blog/[slug]`, `/faq`, `/contact`, `/privacy`, `/cookies`, `/terms`

### Data flow

1. Locale layout calls `getSiteContent()` once per request (`React.cache`).
2. If Sanity project id is missing/`placeholder` → **seed**.
3. If Sanity is configured → published documents, **deep-merged onto seed**.
4. `SiteProvider` holds chrome (nav, contact, visibility), not the full CMS blob.
5. Page views are mostly Server Components.

### i18n split (already correct — keep)

| Kind | Location | Examples |
|---|---|---|
| UI chrome | Code: seed `nav`/`ui`, `lib/i18n/interfaceCopy.ts`, optional Sanity `uiLabels` | Buttons, nav |
| CMS content | Sanity field-level `{ he, ar, en, ru }` | Services, projects, homepage |
| Legal | `lib/content/legal.ts` (not CMS) | Privacy, cookies, terms |

Missing translations fall back to **Hebrew**. Do **not** switch to one document per language.

Footer **Made by lazaCore** is hardcoded on purpose.

---

## 3. Current Dashboard architecture

**The Nora Dashboard does not exist.**

There are no dashboard routes, components, tables, forms, login page, theme switcher, or activity log.

What can be mistaken for a dashboard:

| Thing | Reality |
|---|---|
| `/studio` | Sanity Studio for **Sanity project members** |
| Studio Overview pane | GROQ counts inside Studio |
| `DashboardIcon` | Sanity icon |

The public Tailwind tokens (charcoal, gold, wood, beige) can inspire a Dashboard design system. The public site must not be restyled as a side effect.

---

## 4. Current Sanity architecture

```
Public site  →  sanity/lib/client.ts  →  Sanity CDN (published, no token)
Studio       →  Sanity session (project members)  →  Sanity Cloud writes
Webhook      →  POST /api/revalidate  →  revalidateTag(...)
```

### Environment (`.env.example`)

| Variable | Role | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Example `g32xvgua` | No (public id) |
| `NEXT_PUBLIC_SANITY_DATASET` | Default `production` | No |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Default `2025-01-01` | No |
| `SANITY_REVALIDATE_SECRET` | Webhook; empty = always 401 | **Yes** |
| `NEXT_PUBLIC_SITE_URL` | Canonical / sitemap | No |
| `SANITY_API_WRITE_TOKEN` | **Not defined** | Would be yes |

### Public client (`sanity/lib/client.ts`)

`useCdn: true`, `perspective: 'published'`, **no token**. Correct for the website.

There is **one** Sanity client module. No duplicate write client (and no write leak).

Fetch uses cache tags (`REVALIDATE_TAGS`) plus a 3600s safety revalidate. Blog bodies are loaded lazily.

---

## 5. Existing Sanity schemas

Registered in `sanity/schemaTypes/index.ts`:

| Type | Kind | Fields today |
|---|---|---|
| `localeString` / `localeText` | Object | `{ ar, he, en, ru }` — Hebrew required; EN/RU collapsed |
| `siteSettings` | Singleton | Brand, phone, WhatsApp, email, address, hours, logos, QR, SEO |
| `homePage` | Singleton | Hero, intro, why, section titles, CTA, hero images |
| `aboutPage` | Singleton | Hero, body, values |
| `howWeWorkPage` | Singleton | Hero + **steps array** (not separate documents) |
| `contactPage` | Singleton | Page hero only (contact data is `siteSettings`) |
| `uiLabels` | One doc / locale | Nav / footer / 404 |
| `service` | Collection | slug, title, description, image, features, order, visible |
| `project` | Collection | slug, title, description, category, gallery, materials (strings), order, visible |
| `material` | Collection | slug, name, description, characteristics, applications, finishes, image, order, visible |
| `testimonial` | Collection | name (single string), rating, review, project, order, visible |
| `blogPost` | Collection | slug, title, excerpt, content (`localeText`), category, author, date, image, visible |
| `faqItem` | Collection | category, question, answer, order, visible |

**Blog exists on the public site** — keep and extend the schema; do not invent a new blog.

### Schema gaps (extend existing types; do not duplicate)

| Needed | Today |
|---|---|
| Featured flags | Missing |
| Per-document SEO | Only global settings SEO |
| Service full/rich body + gallery | Description + one image + features |
| Homepage featured-item pickers | Uses collection lists |
| About mission / vision / stats | Body + values only |
| Project location, completion date, main image | Gallery only; no location/date |
| Material category / featured | Missing |
| Testimonial avatar | Missing (**rating is displayed** on home + testimonials page — keep) |
| Social media / map | Missing |
| How We Work icons | Title/description/number only |
| Blog portable/rich text, tags | Plain `localeText`; no tags |
| Navigation CMS | `uiLabels` exists — reuse |
| Users | Must never be a Sanity document type |

Slugs become read-only after first set (URL stability).

---

## 6. Existing Sanity Studio

- Config: `sanity.config.ts`, `basePath: '/studio'`
- Theme: Nora gold/dark (`sanity/theme.ts`)
- Structure: `sanity/structure.ts` — **Arabic titles**
- Overview: real published counts
- Vision tool hidden in production
- Isolated layout, `robots: noindex`
- Optional standalone: `npm run studio` → `:3333`
- CORS must allow `localhost:3001` and production origin with credentials

### Desk today

```
محتوى الموقع
├── نظرة عامة
├── ابدأ من هنا          (siteSettings, contactPage)
├── صفحات الموقع         (home, about, howWeWork)
├── المعرض والعمل         (projects, services, materials)
├── آراء ومحتوى          (testimonials, FAQ, blog)
└── إعدادات متقدمة       (uiLabels)
```

This is grouped, but **not** the website-shaped tree requested (Homepage / About / Services / … / Settings / Media). Studio chrome is Arabic while the **site default is Hebrew**. `docs/STUDIO-HANDOFF.he.md` incorrectly says the menu is Hebrew.

---

## 7. Existing authentication

| Surface | Mechanism |
|---|---|
| Public site | None |
| `/studio` | Sanity.io project-member login |
| Dashboard | **Does not exist** |
| `/api/revalidate` | Shared secret header `x-revalidate-secret` |

No Auth.js, Better Auth, Clerk, Lucia, Supabase Auth, or Firebase.  
No password hashing in application code.  
No hardcoded admin credentials.  
`localStorage` is **only** the cookie-notice flag (`lib/cookies/notice.ts`).

Studio access = whoever is invited to the Sanity project. That is not Owner / Admin / Editor / Employee for Nora Group staff.

---

## 8. Existing user management

**None** in this codebase. No create/edit/disable/delete user, roles, last login, or password reset.

The only “user list” is Sanity Manage (outside the repo).

---

## 9. Existing database

**None.** No Postgres, SQLite, Prisma, Drizzle, or other app database.

Website content is intended to live in **Sanity Cloud**. Seed TypeScript is the offline fallback, not a second CMS database.

---

## 10. Existing API routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/revalidate` | POST (GET → 405) | ISR after Studio publish |

Timing-safe secret compare. Empty secret → 401 (fail closed). In-memory rate limit (weak on Vercel). Revalidates **all** tags.

No Dashboard CRUD, auth, or translation endpoints.

---

## 11. Existing mock data

No files named `mockData`, `fakeData`, or `demoData`.  
No fake Dashboard users.  
No fake login.

**Production fallback:** `lib/content/seed.ts` (~2000 lines), four locales, full site copy.

| Slice | Notes |
|---|---|
| Services | kitchens, bedrooms, wardrobes, walk-in-closets, custom-furniture, offices, commercial — **no doors** |
| Projects | 8 demo projects; local `/images/...` |
| Materials | 8 items |
| Testimonials | 3 items; names are Hebrew placeholders (`לקוח/ה א׳`) on every locale |
| How We Work | 7 steps: Consultation → Measurements → Design → Approval → Manufacturing → Installation → Handover |
| Blog | 3 posts |
| Contact | Flyer defaults (overridable in Studio) |

Seed is intentional so the site never ships empty (`docs/CODE-REVIEW.md`). After CMS is populated, Sanity should be the live source; seed stays a last-resort fallback.

---

## 12. Existing hardcoded content

| What | Where | Keep? |
|---|---|---|
| Full marketing copy | `lib/content/seed.ts` | Fallback only |
| Contact defaults | `lib/constants.ts` `CONTACT_DEFAULTS` | Fallback; live values from `siteSettings` |
| UI chrome not in CMS | `lib/i18n/interfaceCopy.ts` | Yes (UI translations) |
| Legal pages | `lib/content/legal.ts` | Yes unless legal must be CMS-edited |
| lazaCore footer | Code | Yes (product rule) |
| Nav IA / hrefs | `lib/nav.ts` | Yes; labels from CMS/seed |
| Default WhatsApp message | `lib/contact.ts` (Hebrew if none passed) | Prefer CMS `whatsappMessage` |
| Seed images / hero video | `public/images`, `public/videos/hero.mp4` | Keep small fallbacks; new media → Sanity Assets |
| About values from Studio | **Not mapped** in `lib/sanity/fetch.ts` | Bug: website keeps seed values |

Homepage section **copy** is CMS-ready (`homePage`). Featured services/projects are not independently picked — the site shows collection items.

---

## 13. Existing security problems

1. No staff authentication except Sanity project members.  
2. No Next.js write client yet (not a leak; a gap for Dashboard). Write token must never be `NEXT_PUBLIC_*`.  
3. Webhook rate limit is in-memory (ineffective across Vercel isolates).  
4. `SANITY_REVALIDATE_SECRET` may be empty until deploy (fail closed).  
5. Production CSP allows `'unsafe-inline'` and `'unsafe-eval'` (Studio). Dashboard should not inherit a looser policy than needed.  
6. Seed fail-open: CMS outage shows seed contact/copy.  
7. `.gitignore` ignores `.env` and `.env*.local` but **not** `.env.production` by name. Add that during implementation.  
8. No ESLint config.  
9. No draft preview for unpublished content on the public site (published-only — correct for visitors).  
10. `/dashboard` is not in `robots.ts` yet (route does not exist).

The public site does **not** currently expose a Sanity write token.

---

## 14. Existing localization problems

1. Studio desk is Arabic; site default is Hebrew.  
2. `next-intl` messages are empty; chrome is split across seed, `uiLabels`, and `INTERFACE_COPY`.  
3. Testimonial **names** are not localized.  
4. EN/RU fields are collapsed in Studio — easy to skip.  
5. No automatic translation pipeline.  
6. Public RTL/LTR was recently audited — do not regress logical CSS or fonts (Cairo, Noto Sans Hebrew, Inter).

---

## 15. Existing Vercel configuration

| Item | Today |
|---|---|
| `vercel.json` | **Absent** — Vercel will detect Next.js at repo root |
| Build command | `npm run build` (Next default) |
| Install | `npm install` |
| Output | Next.js (not a monorepo setting) |
| Domain | Documented as `https://officialnoragroup.com` via `NEXT_PUBLIC_SITE_URL` |
| Canonical / sitemap / robots | Use `SITE_URL` from that env (fallback production domain if unset) |
| Webhook | README: `POST https://officialnoragroup.com/api/revalidate` + `x-revalidate-secret` |
| `robots.ts` | Disallows `/studio` and `/api/` |
| No Netlify config | Nothing to remove |

`SITE_URL` rejects non-https production values and local http only for localhost. Do not hardcode `localhost` as production.

CORS in Sanity Manage must include the production origin with credentials for Studio login.

---

## 16. What can be reused

- Public website UI, layout, motion, nav, contact CTAs  
- next-intl routing (Hebrew unprefixed)  
- Field-level locale objects  
- Existing Sanity document types (extend fields)  
- `getSiteContent()` public read path  
- `POST /api/revalidate` (improve, do not duplicate)  
- Public CDN Sanity client  
- `visible` flags, slug safety, `mediaSrc()` allowlist  
- How We Work singleton + steps array  
- `uiLabels` **or** code chrome — pick one policy, don’t add a third  
- Seed as **dev/offline fallback**  
- Brand tokens as Dashboard inspiration  
- Product rules: no doors, no quote form, lazaCore footer  
- npm scripts and single-app Vercel deploy  

---

## 17. What should be replaced

| Item | Action |
|---|---|
| Seed as silent production CMS | Keep file; live site should prefer published Sanity |
| Studio desk grouping | Reorganize to website IA; same documents |
| Arabic-only Studio labels | Align with Hebrew-first business + Arabic editors |
| About `values` fetch gap | Map CMS values (and later mission/vision) |
| In-memory webhook limiter | Harden existing route |
| Dual chrome systems | Consolidate |
| Git as image CMS for new work | Sanity Assets |

**Do not delete** seed until production Sanity documents are confirmed.  
**Do not delete** Studio.  
**Do not delete** unused Supabase/Netlify — they are not present.

---

## 18. What must be created

All inside **this same Next.js app** (no new packages workspace):

1. Auth + Postgres (users, hashes, sessions, roles, permissions, activity)  
2. `/dashboard` route group: login, overview, CMS sections, users, roles, settings, activity  
3. Server-only Sanity write client + authorized mutations  
4. Server-enforced permission helpers  
5. Schema field extensions (featured, SEO, location, social, etc.)  
6. Studio structure matching the website  
7. Server-side translation architecture (provider configurable, default off)  
8. Password reset (email)  
9. Dashboard design system (light / dark / system)  
10. `.env.example` entries for auth/DB/write token (placeholders only)  
11. `IMPLEMENTATION_LOG.md` and `FINAL_REPORT.md` after implementation  
12. `robots.ts` disallow `/dashboard`  

---

## 19. Recommended final architecture

**Standalone Next.js app on Vercel. No monorepo.**

```
Public website (existing UI)
        │  CDN read, published, no write token
        ▼
Next.js server (this same project)
        │  mutations only after session + permission checks
        ▼
Sanity Cloud  ◄──── Sanity Studio (/studio)
        ▲
        │
/dashboard  ── Better Auth ── Postgres (users / roles / sessions / audit)
```

### Authentication / database recommendation

**There is no existing auth or database to reuse.**

| Option | Verdict |
|---|---|
| Users in Sanity | Forbidden |
| localStorage / hardcoded admin | Forbidden |
| Clerk / Auth0 | Extra vendor; custom permission matrix still needs our DB |
| Supabase | Not in the project; extra BaaS |
| Auth.js v5 + Prisma + Neon | Viable fallback |
| **Better Auth + Neon Postgres + Drizzle + Resend** | **Recommended** |

**Why Better Auth + Neon + Drizzle + Resend**

- Fits Next.js App Router + Vercel + npm in this single app  
- HttpOnly session cookies; scrypt (or equivalent modern) password hashing  
- Users/roles/permissions/activity in **Postgres**, content in **Sanity**  
- Neon is serverless Postgres that Vercel already supports  
- Drizzle is TypeScript-first and small  
- Resend for password-reset email  
- Granular permissions (`services.update`, `users.delete`, …) live in **our** tables  
- No per-seat SaaS for a small company  

**Not recommended as primary:** Clerk, unless the owner wants zero database operations.

### Roles

| Role | Access |
|---|---|
| Owner | Full; protected from demotion/deletion by Admin |
| Admin | Content + media + users except Owner |
| Editor | Content + media; no user/security admin |
| Employee | Allowlisted sections only |

Every mutation is authorized **on the server**.

### Sanity clients to add

| Client | Token | Where |
|---|---|---|
| Public read | None | Existing `sanity/lib/client.ts` |
| Server write | `SANITY_API_WRITE_TOKEN` | Server-only module |
| Studio | Sanity session | `/studio` |

### Translation (architecture; default off)

Server action/route. `TRANSLATION_PROVIDER=none|openai|google`. Keys never `NEXT_PUBLIC_*`. Editors can always edit `localeString` / `localeText`.

### Studio vs Dashboard

Same Sanity documents. Studio stays for Owner/power editing. Dashboard is the branded staff CMS with company accounts.

---

## 20. Implementation plan

**Do not start until approval.** All work stays in this repository. npm only.

### Phase 1 — Audit  
This document. Application code untouched.

### Phase 2 — Architecture lock  
Confirm Better Auth + Neon + Drizzle + Resend. Add `/dashboard` in this app. Exclude `/dashboard` from next-intl locale prefixing (same pattern as `studio` / `api`).

### Phase 3 — Sanity schemas + Studio  
Extend existing types. Reorganize Structure Builder to:

```
NORA GROUP
├── Website (Homepage, About, Services, Projects, Materials, How We Work, Testimonials, FAQ, Contact, Blog)
├── Website Settings (General, Contact, Social, SEO, Navigation)
├── Media
└── Content
```

No duplicate document types. No door services. Keep How We Work as a steps array. Keep Blog (site already has it).

### Phase 4 — Secure Sanity integration  
Server write client, GROQ/mutations, image uploads via Sanity Assets, validation. Fix About `values` mapping. Public client stays tokenless.

### Phase 5 — Authentication  
Login, logout, sessions, hashing, forgot-password. Premium Nora login UI. Cookie flags: HttpOnly, Secure in production, SameSite.

### Phase 6 — Users  
Create, edit, disable, delete, reset password, change role, last login. Never return hashes.

### Phase 7 — Permissions  
Catalog + `requirePermission()` on every privileged route/action.

### Phase 8 — Dashboard UI  
Sidebar IA as specified. Light / dark / system. Responsive. Accessible. Brand-coherent. **Do not restyle the public site.**

### Phase 9 — Dashboard CMS  
Real Sanity lists/editors. Confirmation dialogs. Empty/error/success states. Overview uses real counts.

### Phase 10 — Website  
Keep public UI. Ensure published Sanity is the live source. Seed = fallback only.

### Phase 11 — Localization  
Four languages on CMS fields. RTL he/ar, LTR en/ru. Do not break next-intl.

### Phase 12 — Translation  
Server-side, configurable, default `none`.

### Phase 13 — Revalidation  
Improve `/api/revalidate` (targeted tags, secret; optional Sanity signature). No second webhook route.

### Phase 14 — Security  
Authz, token leak check, gitignore `.env.production`, robots `/dashboard`, CSP review.

### Phase 15 — Testing  
`npm install`, `npm run build`, `npm run typecheck`, `npm run dev`. Manual: website, dashboard, auth, CRUD, Studio, images, webhook, four locales, themes, mobile.

### Phase 16 — Documentation  
Update this audit if needed. Write `IMPLEMENTATION_LOG.md` and `FINAL_REPORT.md`. Update `.env.example` and README. **No automatic git commit.**

---

## Planned environment variables (not applied yet)

Public:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
NEXT_PUBLIC_SITE_URL=https://officialnoragroup.com
```

Private:

```
SANITY_REVALIDATE_SECRET=
SANITY_API_WRITE_TOKEN=
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
RESEND_API_KEY=
AUTH_EMAIL_FROM=
TRANSLATION_PROVIDER=none
TRANSLATION_API_KEY=
```

Names will match the implementation if Phase 2 is approved. No real secrets in git.

---

## Git safety (this phase)

| File | Change |
|---|---|
| `PROJECT_AUDIT.md` | Updated to match standalone-project constraints and the 20-section audit |

No `.env` files touched. No application source modified. No commit made.

---

## Approval needed before implementation

Please confirm:

1. Proceed inside **this standalone Next.js app** with `/dashboard` (no monorepo, no `apps/*`).  
2. **Better Auth + Neon Postgres + Drizzle + Resend** for users (not Clerk, not users-in-Sanity).  
3. **Keep Studio** at `/studio` and **keep seed** as fallback.  
4. **Do not redesign** the public marketing site.  
5. **No door services.**  
6. Keep field-level i18n `{ he, ar, en, ru }`.

Reply with approval (and any stack change) and Phase 2+ can begin.

---

*End of Phase 1. Waiting for approval. No implementation changes until then.*
