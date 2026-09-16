# Nora Group — Current SEO State Report

**Date:** 16 September 2026  
**Repository:** `C:/Users/Heyam/Desktop/NoraGroupWebsite`  
**Production Domain (stated):** `https://www.officialnoragroup.com/`  
**Production Domain (in code / live robots.txt):** `https://officialnoragroup.com`  
**Audit type:** Read-only. No existing project files were modified. Build and typecheck were not run.

This report describes the SEO implementation that already exists in source and, where possible, what production currently emits. It does not implement fixes.

**Live fetch notes**

- Public pages on `https://www.officialnoragroup.com/` and `https://officialnoragroup.com/` returned marketing content.
- Live document titles on sampled routes match seed + `brandedTitle()` output.
- The fetch converter returns markdown, so live `<link rel="canonical">`, `<link rel="alternate" hreflang>`, Open Graph, Twitter, and JSON-LD tags were **not** visible in the converted HTML. Those items below are reported from **code generation**.
- Live `https://www.officialnoragroup.com/sitemap.xml` and `https://officialnoragroup.com/sitemap.xml` both returned **HTTP 500**.
- Live `robots.txt` was readable (exact body in section 8).

---

## Executive Summary

Nora Group already has a substantial multilingual SEO layer: Next.js 15 App Router, next-intl (`localePrefix: 'as-needed'`, Hebrew default unprefixed), per-page `generateMetadata`, canonical + hreflang (`he` / `ar` / `en` / `ru` / `x-default`), `robots.ts`, `sitemap.ts`, JSON-LD (`HomeAndConstructionBusiness`, `WebSite`, `BreadcrumbList`, `FAQPage`, `Article`), Open Graph, Twitter `summary_large_image`, `html lang`/`dir`, and Next/Image AVIF/WebP.

The largest current gaps are **host mismatch** (code and robots use non-www; the stated primary is www), a **production sitemap 500**, **incomplete LocalBusiness fields** (no opening hours, social `sameAs`, geo, or street address in schema), **no Service schema**, and **OG/Twitter image gaps** on testimonials and legal pages. Public copy does **not** advertise door manufacturing.

Content currently communicates custom carpentry and interior design in Migdal Oz: kitchens, bedrooms, wardrobes, walk-in closets, custom furniture, offices, commercial interiors, and materials (MDF, HPL, acrylic, veneer, melamine, natural wood, glass, metal).

---

## 1. SEO Architecture

| Item | File | Location | Current implementation | Status |
|---|---|---|---|---|
| Next.js | `package.json` | `"next": "^15.2.4"` | App Router | EXISTS |
| React | `package.json` | `"react": "^19.0.0"` | React 19 | EXISTS |
| next-intl | `package.json` | `"next-intl": "^4.0.2"` | Routing + `html` lang/dir; UI copy lives in CMS/seed, not message files | EXISTS |
| Root layout | `app/layout.tsx` | L8–10 | Passthrough only (no site metadata) | EXISTS |
| Locale layout | `app/[locale]/layout.tsx` | L43–115 | `generateStaticParams`, `generateMetadata`, fonts, Header/Footer | EXISTS |
| Locale routing | `i18n/routing.ts` | L4–10 | `locales: he, ar, en, ru`; `defaultLocale: he`; `localePrefix: 'as-needed'`; `localeDetection: false` | EXISTS |
| Middleware | `middleware.ts` | L1–8 | `next-intl` middleware; matcher skips `api`, `studio`, `_next`, `_vercel`, files with dots | EXISTS |
| Default locale | `lib/constants.ts` | L9 | Hebrew (`he`), unprefixed `/` | EXISTS |
| `html lang` / `dir` | `lib/constants.ts` `LOCALE_META`; `app/[locale]/layout.tsx` L98–101 | he=`he` rtl; ar=`ar` rtl; en=`en-US` ltr; ru=`ru` ltr | EXISTS |
| `metadataBase` | `app/[locale]/layout.tsx` | L59 | `new URL(SITE_URL)` | EXISTS |
| Layout metadata | `app/[locale]/layout.tsx` | L55–68 | Title/description from `settings.seoTitle` / `settings.seoDescription`; OG `siteName`; Twitter card; `robots: index, follow` | EXISTS |
| Page metadata | All `app/[locale]/**/page.tsx` | `generateMetadata` | Page-level title/description/canonical/hreflang/OG/Twitter | EXISTS |
| Shared SEO util | `lib/seo/metadata.ts` | L5–51 | `brandedTitle()`, `buildPageMetadata()` | EXISTS |
| CMS SEO helper | `lib/seo/cms.ts` | L6–35 | `resolveCmsSeo()` — CMS SEO fields with fallbacks | EXISTS |
| URL helpers | `lib/seo/urls.ts` | L3–45 | `localizedPath`, `absoluteUrl`, `toAbsoluteAsset`, `hreflangMap` | EXISTS |
| JSON-LD utils | `lib/seo/jsonld.ts` | full file | `safeJsonLd`, `localBusinessGraph`, `breadcrumbJsonLd`, `faqPageJsonLd`, `articleJsonLd` | EXISTS |
| JSON-LD renderer | `components/seo/JsonLd.tsx` | L3–9 | `<script type="application/ld+json">` | EXISTS |
| Sitemap | `app/sitemap.ts` | full file | Dynamic `MetadataRoute.Sitemap` from content | EXISTS |
| Robots | `app/robots.ts` | full file | Allow `/`; disallow `/studio`, `/api/`; sitemap URL | EXISTS |
| Site URL | `lib/constants.ts` | L21–37 | `NEXT_PUBLIC_SITE_URL` or fallback `https://officialnoragroup.com` (no www) | EXISTS — host mismatch vs stated www primary |
| Env example | `.env.example` | L12 | `NEXT_PUBLIC_SITE_URL=https://officialnoragroup.com` | EXISTS — non-www |
| Content source | `lib/content/getContent.ts` | L14–25 | Sanity when configured; seed fallback | EXISTS |
| Locale string fallback | `lib/i18n/locale.ts` | L25–39 | Active locale → Hebrew → any non-empty | EXISTS |
| Studio | `app/studio/layout.tsx` | L8–12 | Title `Nora Group Studio`; `robots: noindex, nofollow` | EXISTS |
| next-intl messages | `i18n/request.ts` | L14–15 | `messages: {}` — routing only | EXISTS |
| Image config | `next.config.ts` | L41–45 | AVIF + WebP; 30-day cache; Sanity CDN remote pattern | EXISTS |
| Security headers | `next.config.ts` | L14–57 | Production HSTS + CSP; no www redirect in Next | EXISTS |
| www redirect in Next | `next.config.ts` | — | No `redirects()` for www/non-www | MISSING in Next config |

### App Router structure (indexable marketing)

```
app/
  layout.tsx                          (passthrough)
  robots.ts
  sitemap.ts
  [locale]/layout.tsx                 (html/body, metadataBase)
  [locale]/page.tsx                   /
  [locale]/about/page.tsx
  [locale]/services/page.tsx
  [locale]/services/[slug]/page.tsx
  [locale]/projects/page.tsx
  [locale]/projects/[slug]/page.tsx
  [locale]/materials/page.tsx
  [locale]/how-we-work/page.tsx
  [locale]/testimonials/page.tsx
  [locale]/blog/page.tsx
  [locale]/blog/[slug]/page.tsx
  [locale]/faq/page.tsx
  [locale]/contact/page.tsx
  [locale]/privacy/page.tsx
  [locale]/cookies/page.tsx
  [locale]/terms/page.tsx
  [locale]/not-found.tsx
  studio/[[...tool]]/page.tsx         (noindex)
  api/revalidate/route.ts             (disallowed in robots)
```

Hebrew URLs are unprefixed. Other locales use `/ar`, `/en`, `/ru`.

---

## 2. Metadata

**Architecture:** Layout sets `metadataBase`, default title/description from site settings, OG `siteName`, Twitter card type, and `index,follow`. Each page `generateMetadata` overrides title/description and adds canonical, hreflang, OG, and Twitter via `buildPageMetadata()`.

**`brandedTitle()`** (`lib/seo/metadata.ts` L5–9): if the title already contains the brand string `Nora Group`, it is left unchanged; otherwise it appends ` | Nora Group`.

**`buildPageMetadata()`** always sets:

- `title`
- `description`
- `alternates.canonical` = `absoluteUrl(locale, path)`
- `alternates.languages` = hreflang map
- `openGraph.title / description / url / locale / type` and `images` when an image exists
- `twitter.card = summary_large_image` plus title, description, and image when present

**`resolveCmsSeo()`** is used on: home, about, how-we-work, blog index, FAQ, contact, service slugs, project slugs, blog slugs.

**`buildPageMetadata()` only (no page-level CMS SEO object):** services index, projects index, materials, testimonials, privacy, cookies, terms.

**CMS SEO objects** exist in types for home, about, how-we-work, services, projects, blog posts, contact, FAQ, blog page. Seed does **not** populate those page `seo` objects, so production titles below match **fallback copy** unless Sanity has unpublished/published overrides. Live sampled titles match the seed fallbacks.

---

## 3. Titles

Titles below are the strings the code generates from seed fallbacks, with **LIVE** where production document title was observed.

| Route | Locale | Current Title | Static/Dynamic | Status |
|---|---|---|---|---|
| `/` | he | Nora Group \| נגרות ועיצוב פנים | Dynamic (CMS settings.seoTitle / home.seo) | EXISTS — LIVE |
| `/ar` | ar | Nora Group \| نجارة وتصميم داخلي | Dynamic | EXISTS — LIVE |
| `/en` | en | Nora Group \| Custom Carpentry & Interior Design | Dynamic | EXISTS — LIVE |
| `/ru` | ru | Nora Group \| Индивидуальная столярка и дизайн интерьера | Dynamic | EXISTS — LIVE |
| `/about` | he | Nora Group — נגרות ועיצוב פנים מקצועי | Dynamic (about.seo or H1 fallback) | EXISTS — LIVE |
| `/ar/about` | ar | Nora Group — نجارة وتصميم داخلي احترافي | Dynamic | EXISTS (code; not separately fetched) |
| `/en/about` | en | Nora Group — Professional Carpentry & Interior Design | Dynamic | EXISTS — LIVE |
| `/ru/about` | ru | Nora Group — профессиональная столярка и дизайн интерьера | Dynamic | EXISTS (code) |
| `/services` | he | אומנות בעץ ברמה גבוהה \| Nora Group | Dynamic from `home.servicesTitle` | EXISTS — LIVE |
| `/ar/services` | ar | حرفية خشبية بمستوى عالٍ \| Nora Group | Dynamic | EXISTS (code) |
| `/en/services` | en | High-End Wood Craftsmanship \| Nora Group | Dynamic | EXISTS — LIVE |
| `/ru/services` | ru | Высококачественная работа по дереву \| Nora Group | Dynamic | EXISTS (code) |
| `/projects` | he | מהרעיון ועד לתוצאה המושלמת בשטח \| Nora Group | Dynamic from `home.projectsTitle` | EXISTS — LIVE |
| `/ar/projects` | ar | من الفكرة إلى النتيجة المتقنة على أرض الواقع \| Nora Group | Dynamic | EXISTS (code) |
| `/en/projects` | en | From Concept to a Refined Result \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/projects` | ru | От идеи до безупречного результата \| Nora Group | Dynamic | EXISTS (code) |
| `/materials` | he | חומרים שנבחרו בקפידה \| Nora Group | Dynamic from `home.materialsTitle` | EXISTS — LIVE |
| `/ar/materials` | ar | خامات مختارة بعناية \| Nora Group | Dynamic | EXISTS (code) |
| `/en/materials` | en | Carefully Selected Materials \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/materials` | ru | Тщательно подобранные материалы \| Nora Group | Dynamic | EXISTS (code) |
| `/how-we-work` | he | איך אנחנו עובדים \| Nora Group | Dynamic | EXISTS — LIVE |
| `/ar/how-we-work` | ar | كيف نعمل \| Nora Group | Dynamic | EXISTS (code) |
| `/en/how-we-work` | en | How We Work \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/how-we-work` | ru | Как мы работаем \| Nora Group | Dynamic | EXISTS (code) |
| `/testimonials` | he | המלצות לקוחות \| Nora Group | Dynamic from `home.testimonialsTitle` | EXISTS — LIVE |
| `/ar/testimonials` | ar | آراء عملائنا \| Nora Group | Dynamic | EXISTS (code) |
| `/en/testimonials` | en | What Our Clients Say \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/testimonials` | ru | Что говорят наши клиенты \| Nora Group | Dynamic | EXISTS (code) |
| `/blog` | he | מאמרים ועדכונים \| Nora Group | Dynamic | EXISTS — LIVE |
| `/ar/blog` | ar | مقالات وتحديثات \| Nora Group | Dynamic | EXISTS (code) |
| `/en/blog` | en | Articles & Updates \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/blog` | ru | Статьи и новости \| Nora Group | Dynamic | EXISTS — LIVE |
| `/faq` | he | שאלות נפוצות \| Nora Group | Dynamic | EXISTS — LIVE |
| `/ar/faq` | ar | الأسئلة الشائعة \| Nora Group | Dynamic | EXISTS (code) |
| `/en/faq` | en | Frequently Asked Questions \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/faq` | ru | Частые вопросы \| Nora Group | Dynamic | EXISTS (code) |
| `/contact` | he | בואו נדבר \| Nora Group | Dynamic | EXISTS — LIVE |
| `/ar/contact` | ar | لنتحدث \| Nora Group | Dynamic | EXISTS — LIVE |
| `/en/contact` | en | Let's Talk \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/contact` | ru | Давайте поговорим \| Nora Group | Dynamic | EXISTS (code) |
| `/privacy` | he | מדיניות פרטיות \| Nora Group | Dynamic | EXISTS — LIVE |
| `/ar/privacy` | ar | سياسة الخصوصية \| Nora Group | Dynamic | EXISTS (code) |
| `/en/privacy` | en | Privacy Policy \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/privacy` | ru | Политика конфиденциальности \| Nora Group | Dynamic | EXISTS (code) |
| `/cookies` | he | מדיניות עוגיות \| Nora Group | Dynamic | EXISTS — LIVE |
| `/ar/cookies` | ar | سياسة ملفات الارتباط \| Nora Group | Dynamic | EXISTS (code) |
| `/en/cookies` | en | Cookie Policy \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/cookies` | ru | Политика cookie \| Nora Group | Dynamic | EXISTS (code) |
| `/terms` | he | תנאי שימוש \| Nora Group | Dynamic | EXISTS — LIVE |
| `/ar/terms` | ar | شروط الاستخدام \| Nora Group | Dynamic | EXISTS (code) |
| `/en/terms` | en | Terms of Use \| Nora Group | Dynamic | EXISTS (code) |
| `/ru/terms` | ru | Условия использования \| Nora Group | Dynamic | EXISTS (code) |
| `/services/kitchens` | he | מטבחים \| Nora Group | Dynamic (service title) | EXISTS — LIVE |
| `/en/blog/choosing-kitchen-materials` | en | How to Choose Kitchen Materials \| Nora Group | Dynamic | EXISTS — LIVE |
| `/studio` | — | Nora Group Studio | Static in studio layout | EXISTS — noindex |

**Title pattern notes**

- Homepage and About already include “Nora Group”, so `brandedTitle()` does not double-suffix.
- Services / projects / materials listing titles reuse **homepage section headings**, not nav labels (“Our Services”).
- Titles are unique per route within a locale.
- Seed does not define per-page `seo.title` except site-level `settings.seoTitle` for home.

---

## 4. Meta Descriptions

Live `<meta name="description">` tags were not visible in the markdown fetch. Values below are **code-generated from seed fallbacks** (and CMS `seo.description` when present).

| Route | Locale | Current Description | Status |
|---|---|---|---|
| `/` | he | נגרות ועיצוב פנים בהתאמה אישית במגדל עוז — תכנון, ביצוע ואיכות ללא פשרות. | Localized; from `settings.seoDescription` unless `home.seo` overrides |
| `/ar` | ar | نجارة وتصميم داخلي حسب الطلب في مجدال عوز — تخطيط دقيق، تنفيذ احترافي وجودة لا تقبل التنازل. | Localized |
| `/en` | en | Custom carpentry and interior design in Migdal Oz — precise planning, professional execution, and uncompromising quality. | Localized |
| `/ru` | ru | Индивидуальная столярка и дизайн интерьера в Мигдаль-Озе — точное планирование, профессиональное исполнение и бескомпромиссное качество. | Localized |
| `/about` | he | תכנון · ביצוע · איכות — ממגדל עוז | Fallback = about subtitle (short) |
| `/ar/about` | ar | تخطيط · تنفيذ · جودة — من مجدال عوز | Localized |
| `/en/about` | en | Planning · Execution · Quality — from Migdal Oz | Localized |
| `/ru/about` | ru | Планирование · Исполнение · Качество — Мигдаль Оз | Localized |
| `/services` | he | מטבחים, ארונות, ריהוט ועוד | Fallback = home.servicesSubtitle |
| `/ar/services` | ar | مطابخ، خزائن، أثاث وأكثر | Localized |
| `/en/services` | en | Kitchens, wardrobes, furniture, and more | Localized |
| `/ru/services` | ru | Кухни, шкафы, мебель и многое другое | Localized |
| `/projects` | he | מבחר פרויקטים שמשקף דיוק ואיכות | home.projectsSubtitle |
| `/ar/projects` | ar | مجموعة من المشاريع التي تعكس الدقة والجودة | Localized |
| `/en/projects` | en | A selection of projects that reflects precision and quality | Localized |
| `/ru/projects` | ru | Подборка проектов, отражающих точность и качество | Localized |
| `/materials` | he | מגוון אפשרויות לכל סגנון ותקציב | home.materialsSubtitle |
| `/ar/materials` | ar | مجموعة متنوعة تناسب كل أسلوب وميزانية | Localized |
| `/en/materials` | en | A range of options for every style and budget | Localized |
| `/ru/materials` | ru | Разнообразие вариантов для любого стиля и бюджета | Localized |
| `/how-we-work` | he | שקיפות בכל שלב | howWeWork.subtitle |
| `/ar/how-we-work` | ar | وضوح في كل خطوة | Localized |
| `/en/how-we-work` | en | Clarity at Every Step | Localized |
| `/ru/how-we-work` | ru | Прозрачность на каждом этапе | Localized |
| `/testimonials` | he | חוויות אמיתיות מהבית ומהעסק | home.testimonialsSubtitle |
| `/ar/testimonials` | ar | تجارب حقيقية من المنازل والأعمال | Localized |
| `/en/testimonials` | en | Real experiences from homes and businesses | Localized |
| `/ru/testimonials` | ru | Реальные впечатления клиентов из дома и бизнеса | Localized |
| `/blog` | he | חומרים, תהליך ותכנון נכון | blogPage.subtitle |
| `/ar/blog` | ar | خامات وعملية وتخطيط سليم | Localized |
| `/en/blog` | en | Materials, process, and sound planning | Localized |
| `/ru/blog` | ru | Материалы, процесс и грамотное планирование | Localized |
| `/faq` | he | תשובות קצרות לפני השיחה | faqPage.subtitle |
| `/ar/faq` | ar | إجابات موجزة قبل المكالمة | Localized |
| `/en/faq` | en | Short answers before you call | Localized |
| `/ru/faq` | ru | Краткие ответы перед звонком | Localized |
| `/contact` | he | טלפון, וואטסאפ או אימייל | contactPage.subtitle |
| `/ar/contact` | ar | الهاتف أو واتساب أو البريد الإلكتروني | Localized |
| `/en/contact` | en | Phone, WhatsApp, or Email | Localized |
| `/ru/contact` | ru | Телефон, WhatsApp или электронная почта | Localized |
| `/privacy` | he | מדיניות זו מסבירה כיצד Nora Group מתייחסת למידע אישי בקשר לאתר officialnoragroup.com. זהו מידע כללי בלבד, ואינו ייעוץ משפטי. | Legal intro (long) |
| `/ar/privacy` | ar | توضح هذه السياسة كيف تتعامل Nora Group مع المعلومات الشخصية المتعلقة بموقع officialnoragroup.com. هذا نص معلوماتي فقط وليس استشارة قانونية. | Legal intro |
| `/en/privacy` | en | This policy explains how Nora Group handles personal information in connection with officialnoragroup.com. It is informational only and is not legal advice. | Legal intro |
| `/ru/privacy` | ru | Эта политика объясняет, как Nora Group обрабатывает персональные данные в связи с сайтом officialnoragroup.com. Это общая информация, а не юридическая консультация. | Legal intro |
| `/cookies` | he | האתר משתמש באמצעי אחסון טכניים הכרחיים בלבד. אין מעקב פרסומי או שיווקי נכון לתאריך זה. | Legal intro |
| `/ar/cookies` | ar | يستخدم الموقع وسائل تخزين تقنية ضرورية فقط. لا يوجد تتبع إعلاني أو تسويقي حتى هذا التاريخ. | Legal intro |
| `/en/cookies` | en | This site uses necessary technical storage only. There is no advertising or marketing tracking as of this date. | Legal intro |
| `/ru/cookies` | ru | Сайт использует только необходимые технические средства. Рекламного и маркетингового отслеживания на эту дату нет. | Legal intro |
| `/terms` | he | תנאים אלה חלים על השימוש באתר officialnoragroup.com. הם אינם חוזה לביצוע עבודת נגרות — הצעת מחיר והזמנה נסגרות בשיחה או בוואטסאפ. | Legal intro |
| `/ar/terms` | ar | تسري هذه الشروط على استخدام موقع officialnoragroup.com. ليست عقدًا لتنفيذ أعمال النجارة — العرض والطلب يُغلقان عبر الهاتف أو واتساب. | Legal intro |
| `/en/terms` | en | These terms apply to use of officialnoragroup.com. They are not a contract for carpentry work — quotes and orders are agreed by phone or WhatsApp. | Legal intro |
| `/ru/terms` | ru | Эти условия относятся к использованию сайта officialnoragroup.com. Это не договор на столярные работы — смета и заказ согласовываются по телефону или в WhatsApp. | Legal intro |

**Description analysis**

| Finding | Status |
|---|---|
| Missing descriptions | None in the generateMetadata paths above; empty `seo` falls back to page subtitle/intro |
| Duplicated descriptions | Not identical across routes. Homepage settings description is unique. Several listing descriptions are short marketing subtitles, not search-oriented |
| Dynamic descriptions | Yes — CMS can override home/about/how-we-work/blog/faq/contact and all slug pages |
| Localized descriptions | Yes, four locales in seed |
| Fallback descriptions | `t()` then page subtitle/title; blog also falls back to `settings.seoDescription`; FAQ can fall back to footer tagline |
| Short descriptions | About, services, how-we-work, contact are very short |
| Long descriptions | Privacy intro is a full paragraph (likely truncated in SERPs) |
| Live visible first paragraph on `/` | Hero subtitle, which is **not** the same string as `settings.seoDescription` |

Service/project/blog slug descriptions fall back to the entity description/excerpt, e.g. kitchens HE: `מטבחים מותאמים שמשלבים יופי ופונקציה`.

---

## 5. Canonical URLs

**Implementation:** `lib/seo/urls.ts` `absoluteUrl()` + `buildPageMetadata().alternates.canonical`.

**Domain used:** `SITE_URL` = `process.env.NEXT_PUBLIC_SITE_URL` origin if https (or local http), else `https://officialnoragroup.com`.

**Live confirmation:** `robots.txt` sitemap is `https://officialnoragroup.com/sitemap.xml` → production `SITE_URL` is **non-www**.

Generated canonical pattern (code):

| Page | Locale | Generated canonical | www | HTTPS | Points to current locale |
|---|---|---|---|---|---|
| Homepage | he | `https://officialnoragroup.com` | No | Yes | Yes (unprefixed he) |
| Homepage | ar | `https://officialnoragroup.com/ar` | No | Yes | Yes |
| Homepage | en | `https://officialnoragroup.com/en` | No | Yes | Yes |
| Homepage | ru | `https://officialnoragroup.com/ru` | No | Yes | Yes |
| `/about` | he | `https://officialnoragroup.com/about` | No | Yes | Yes |
| `/en/about` | en | `https://officialnoragroup.com/en/about` | No | Yes | Yes |
| `/services/kitchens` | he | `https://officialnoragroup.com/services/kitchens` | No | Yes | Yes |
| `/en/blog/choosing-kitchen-materials` | en | `https://officialnoragroup.com/en/blog/choosing-kitchen-materials` | No | Yes | Yes |
| Other indexable routes | all | `{SITE_URL}{localizedPath}` | No | Yes | Yes |

**Conflicts / duplicates**

- Stated primary is `https://www.officialnoragroup.com/`. Generated canonicals omit `www`.
- Live fetch returned full page content from **both** www and non-www (duplicate host risk if no 301, or canonical/redirect mismatch if non-www 301s to www while canonical stays non-www).
- Layout metadata does not set canonical; pages do. No second conflicting canonical helper was found.
- Hebrew homepage canonical has **no trailing slash** (`SITE_URL` only). Other paths have no trailing slash either.
- Studio is noindex; it does not use `buildPageMetadata`.
- If a slug `generateMetadata` cannot find the entity it returns `{}`, so that response would inherit layout metadata **without a page canonical**.

---

## 6. Hreflang

**Implementation:** `hreflangMap()` in `lib/seo/urls.ts` L37–45, attached as `alternates.languages` on every `buildPageMetadata` page.

Keys generated for every path:

- `x-default` → Hebrew unprefixed URL
- `he` → Hebrew unprefixed URL (self for he pages)
- `ar` → `/ar...`
- `en` → `/en...`
- `ru` → `/ru...`

All values are absolute `https://officialnoragroup.com...`.

| Page | he | ar | en | ru | x-default | Status |
|---|---|---|---|---|---|---|
| Home | `https://officialnoragroup.com` | `https://officialnoragroup.com/ar` | `https://officialnoragroup.com/en` | `https://officialnoragroup.com/ru` | `https://officialnoragroup.com` | Implemented in code; www not used |
| About | `.../about` | `.../ar/about` | `.../en/about` | `.../ru/about` | `.../about` | Reciprocal by construction |
| Services | `.../services` | `.../ar/services` | `.../en/services` | `.../ru/services` | `.../services` | Same |
| Projects | `.../projects` | `.../ar/projects` | `.../en/projects` | `.../ru/projects` | `.../projects` | Same |
| Materials | `.../materials` | `.../ar/materials` | `.../en/materials` | `.../ru/materials` | `.../materials` | Same |
| How we work | `.../how-we-work` | `.../ar/how-we-work` | `.../en/how-we-work` | `.../ru/how-we-work` | `.../how-we-work` | Same |
| Testimonials | `.../testimonials` | `.../ar/testimonials` | `.../en/testimonials` | `.../ru/testimonials` | `.../testimonials` | Same |
| Blog | `.../blog` | `.../ar/blog` | `.../en/blog` | `.../ru/blog` | `.../blog` | Same |
| FAQ | `.../faq` | `.../ar/faq` | `.../en/faq` | `.../ru/faq` | `.../faq` | Same |
| Contact | `.../contact` | `.../ar/contact` | `.../en/contact` | `.../ru/contact` | `.../contact` | Same |
| Privacy | `.../privacy` | `.../ar/privacy` | `.../en/privacy` | `.../ru/privacy` | `.../privacy` | Same |
| Service slug | `.../services/{slug}` | `.../ar/services/{slug}` | `.../en/services/{slug}` | `.../ru/services/{slug}` | `.../services/{slug}` | Same slug in all locales (field-level i18n, not per-locale slugs) |
| Project slug | `.../projects/{slug}` | prefixed | prefixed | prefixed | unprefixed he | Same |
| Blog slug | `.../blog/{slug}` | prefixed | prefixed | prefixed | unprefixed he | Same |

**Checks**

| Check | Result |
|---|---|
| Absolute URLs | Yes |
| www vs non-www | Non-www only |
| HTTPS | Yes |
| Self-reference | Yes (`he`/`ar`/`en`/`ru` includes the current locale URL) |
| Reciprocal references | Yes — same map on every locale of the same path |
| Missing translations | Hreflang still emitted even if `t()` falls back to Hebrew body copy |
| Nonexistent routes | Slugs come from visible CMS/seed entities; unpublished items are omitted from sitemap but hreflang on a live slug still points at all four locale URLs |
| `en` vs `en-US` | hreflang key is `en`; OG locale is `en-US` |

Live hreflang `<link>` tags were not visible in the markdown fetch.

---

## 7. Sitemap

**File:** `app/sitemap.ts`

**How URLs are generated:** `getSiteContent()` then, for each of `LOCALES` (`he`,`ar`,`en`,`ru`), emit static paths + visible service/project/blog entity paths via `absoluteUrl(locale, path)` and `alternates.languages: hreflangMap(path)`.

**Domain:** `SITE_URL` → live robots proves `https://officialnoragroup.com` (non-www).

**Locales included:** he (unprefixed), ar, en, ru.

**Pages included (static):** `/`, `/about`, `/services`, `/projects`, `/materials`, `/how-we-work`, `/testimonials`, `/blog`, `/faq`, `/contact`, `/privacy`, `/cookies`, `/terms`.

**Entity pages included:** all `visible` services, projects, blog posts (seed: 7 services, 8 projects, 3 posts).

**Pages excluded:** `/studio`, `/api/*`, 404, any `visible: false` entity.

**lastModified:** only when the path is a blog post and `blog.date` is set. Static and service/project URLs omit `lastModified`.

**changeFrequency:** `weekly` for static; `monthly` for entities.

**priority:** `1` home; `0.3` privacy/cookies/terms; `0.7` other static; `0.6` entities.

**Canonical URLs:** sitemap `url` equals the locale canonical from `absoluteUrl`.

**www:** not used.

**`/studio` / `/api`:** not in the sitemap array.

**Hreflang in sitemap:** `alternates.languages` is set per entry.

**Live comparison:** `https://www.officialnoragroup.com/sitemap.xml` and `https://officialnoragroup.com/sitemap.xml` both returned **HTTP 500**. The generated XML could not be compared. Root cause of the 500 is unknown from this read-only pass (`getSiteContent()` failure would throw inside the sitemap handler).

Expected entry count if seed is used: `(13 static + 7 services + 8 projects + 3 posts) × 4 locales = 124 URLs`.

---

## 8. Robots.txt

**File:** `app/robots.ts`

**Generated / live body** (identical on www and non-www fetch):

```
User-Agent: *
Allow: /
Disallow: /studio
Disallow: /api/

Sitemap: https://officialnoragroup.com/sitemap.xml
```

| Check | Result |
|---|---|
| User-agent | `*` |
| Allow | `/` |
| Disallow | `/studio`, `/api/` |
| Sitemap URL | `https://officialnoragroup.com/sitemap.xml` |
| www | Sitemap host is **non-www** even when robots is requested on www |
| HTTPS | Yes |
| Crawl delay | Not set |
| Host directive | Not set |

Studio is also `noindex` in `app/studio/layout.tsx`. API revalidate route is not a document URL.

---

## 9. Structured Data / JSON-LD

All JSON-LD is built in `lib/seo/jsonld.ts` and rendered by `components/seo/JsonLd.tsx`. `safeJsonLd()` Unicode-escapes `<`, `>`, U+2028, U+2029.

### 9.1 HomeAndConstructionBusiness + WebSite

| Field | Value |
|---|---|
| FILE | `lib/seo/jsonld.ts` L18–48; injected from `app/[locale]/page.tsx` L34 |
| TYPE | `HomeAndConstructionBusiness` + `WebSite` in `@graph` |
| DATA SOURCE | `content.settings` + `SITE_URL` |
| `@id` business | `{SITE_URL}/#business` |
| name | `settings.brandName` → seed `Nora Group` |
| url | `SITE_URL` (Hebrew origin, not locale URL) |
| telephone | `settings.phoneTel` → seed `+972524659510` |
| email | `settings.email` → seed `official.noragroup@gmail.com` |
| image (used as logo stand-in) | `toAbsoluteAsset(settings.logoUrl)` or `{SITE_URL}/logo.png` |
| logo | MISSING as a schema property |
| address | `PostalAddress`: `addressLocality` = localized `settings.address` (Migdal Oz / מגדל עוז / مجدال عوز / Мигдаль Оз); `addressCountry` = `IL` |
| streetAddress | MISSING |
| postalCode | MISSING |
| geo | MISSING |
| openingHours / openingHoursSpecification | MISSING |
| sameAs | MISSING |
| priceRange | MISSING |
| areaServed | MISSING |
| WebSite `@id` | `{SITE_URL}/#website` |
| WebSite url | `SITE_URL` |
| WebSite name | brandName |
| WebSite inLanguage | `['he','ar','en','ru']` |
| WebSite publisher | `{ '@id': '{SITE_URL}/#business' }` |
| WebSite potentialAction/SearchAction | MISSING |

This graph is emitted **only on the homepage**, not on contact or inner pages.

### 9.2 BreadcrumbList

| Field | Value |
|---|---|
| FILE | `lib/seo/jsonld.ts` L51–64 |
| TYPE | `BreadcrumbList` |
| USED ON | about, services, projects, materials, how-we-work, testimonials, blog, FAQ, contact, privacy, cookies, terms, service/project/blog slugs |
| NOT ON | homepage |
| FIELDS | `itemListElement[]` with `position`, `name`, `item` (absolute locale URL) |
| DATA SOURCE | nav labels + entity titles |

### 9.3 FAQPage

| Field | Value |
|---|---|
| FILE | `lib/seo/jsonld.ts` L67–85; `app/[locale]/faq/page.tsx` L36 |
| TYPE | `FAQPage` |
| FIELDS | `mainEntity[]` of `Question` + `acceptedAnswer.text` |
| DATA SOURCE | visible FAQ items, localized via `t()` |
| LIVE FAQ topics | project duration, warranty, what is produced, 3D design, materials, pricing, contact method, installation |

### 9.4 Article

| Field | Value |
|---|---|
| FILE | `lib/seo/jsonld.ts` L87–115; `app/[locale]/blog/[slug]/page.tsx` L55–64 |
| TYPE | `Article` (not `BlogPosting`) |
| headline | localized post title |
| description | localized excerpt |
| mainEntityOfPage | absolute post URL (string, not a `WebPage` object) |
| image | absolute asset URL if resolvable |
| datePublished | `post.date` (seed: `2025-01-15`, `2025-02-20`, `2025-03-10`) |
| dateModified | MISSING |
| author | `{ @type: Organization, name: post.author }` seed `Nora Group` |
| publisher | `{ '@id': '{SITE_URL}/#business' }` — that node is **not** defined on the article page |
| inLanguage | MISSING |

### 9.5 Types not implemented

`Organization` (as its own type), `LocalBusiness` (name; a subtype is used instead), `Service`, `ImageObject`, `BlogPosting`, `Person`, `Review`/`AggregateRating` (testimonials have no review schema), `Offer`, `GeoCoordinates`.

---

## 10. Organization / LocalBusiness

What the **code** currently tells search engines:

| Fact | Status | Where |
|---|---|---|
| Name: Nora Group | EXISTS | settings.brandName; schema `name`; visible UI |
| Website | EXISTS | schema `url` = `SITE_URL` (non-www) |
| Logo | EXISTS as file `/logo.png`; schema uses `image`, not `logo` | `CONTACT_DEFAULTS.logoPath`; jsonld L20–32 |
| Phone | EXISTS | display `052-465-9510`; tel `+972524659510`. Live contact page showed `+972524659510` as the visible number (possible CMS override of `phoneDisplay`) |
| Location / locality | EXISTS | Migdal Oz (localized) in address field and schema `addressLocality` |
| Street address | MISSING | only locality |
| Opening hours | EXISTS in UI copy; MISSING in JSON-LD | seed `א׳–ה׳ 08:00–17:00` / `Sun–Thu, 8:00 AM–5:00 PM`. Does not say Friday/Saturday closed. Brief stated 07:00–17:00 — **code says 08:00** |
| Social profiles | MISSING in seed; schema `sameAs` MISSING | types/CMS fields `instagramUrl`, `facebookUrl` exist; live contact page did not show Instagram/Facebook |
| Services | EXISTS in page content; MISSING as schema `Service` / `hasOfferCatalog` | 7 service slugs, no doors |
| Business type | EXISTS | JSON-LD `@type: HomeAndConstructionBusiness`. Visible copy: carpentry & interior design workshop |
| Email | EXISTS | `official.noragroup@gmail.com` |
| Google Maps | UNKNOWN in CMS; MISSING in seed | `mapUrl` optional; live contact address was plain text, not a map link |

---

## 11. Open Graph

Implemented in `buildPageMetadata()` (`lib/seo/metadata.ts` L37–44) plus layout `openGraph.siteName` / `type: website`.

| Property | Current implementation | Status |
|---|---|---|
| og:title | Same as document title | EXISTS |
| og:description | Same as meta description | EXISTS |
| og:image | `toAbsoluteAsset(image)` when a page passes `image` | EXISTS on home, about, services, projects, materials, how-we-work, blog, FAQ, contact, slugs (with fallbacks). **MISSING** on testimonials, privacy, cookies, terms |
| og:url | Locale canonical | EXISTS (non-www) |
| og:type | `website` default; blog posts `article` | EXISTS |
| og:locale | `LOCALE_META[locale].htmlLang` → `he`, `ar`, `en-US`, `ru` | EXISTS |
| og:locale:alternate | Not set | MISSING |
| og:site_name | `settings.brandName` from layout | EXISTS |

Homepage OG image fallback: `home.heroImages[0]` or logo (`/images/hero-kitchen.jpg` in seed).

---

## 12. Twitter/X Metadata

| Property | Current implementation | Status |
|---|---|---|
| twitter:card | `summary_large_image` (layout + page) | EXISTS |
| twitter:title | Page title | EXISTS |
| twitter:description | Page description | EXISTS |
| twitter:image | Same as OG image when provided | EXISTS on pages that pass `image`; **MISSING** on testimonials and legal pages |
| twitter:site | Not set | MISSING |
| twitter:creator | Not set | MISSING |

---

## 13. Image SEO

| Location | Implementation | Status |
|---|---|---|
| Next/Image | Used across Hero, PageHero, grids, details, BrandLockup, footer QR | EXISTS |
| Formats | `next.config.ts` AVIF + WebP | EXISTS |
| Width/height | Many images use `fill` + `sizes`; intrinsic width/height not always set | MIXED |
| Priority | PageHero `priority`; Hero first slide `priority={currentSlide === 0}` | EXISTS |
| Loading | Default Next/Image lazy for non-priority | EXISTS |
| Remote | Sanity `cdn.sanity.io` allowed | EXISTS |
| Hero slides | `alt=""` (`components/home/Hero.tsx` L83) | Empty alt (decorative treatment of primary visual) |
| PageHero | `alt={title}` (`components/ui/PageHero.tsx` L22) | Alt equals H1 text, not image description |
| Services / home services | `alt={t(s.title, locale)}` | Service name |
| Projects listing | `alt={p.title}` after `t()` in `ProjectsView` | Project name |
| Materials | `alt={t(m.name, locale)}` | Material name |
| Blog cards | `alt={t(post.title, locale)}` | Post title |
| Brand lockup | `alt={brandName}` | EXISTS |
| Contact QR | `` `${settings.brandName} WhatsApp QR` `` | Localized brand + English “WhatsApp QR” |
| Footer QR | `alt="WhatsApp QR Code"` | English-only on all locales |
| Testimonials avatar | `alt={item.name}` | Name (often Hebrew `לקוח/ה א׳` on all locales) |
| Generic alts | Many alts repeat the adjacent heading | Present but not descriptive of the photo |

Local files live under `/public/images/` (jpg). `images.ts` maps kitchens, wardrobes, bedrooms, furniture, office, commercial, wood, craft, hero.

---

## 14. Heading Structure

| Page | H1 | H2 / H3 | Notes | Status |
|---|---|---|---|---|
| Home | `Hero` `motion.h1` = `home.heroTitle` (HE live content starts with intro H2 in markdown extraction) | Multiple H2 sections: intro, services, projects, why, process, materials, testimonials, CTA | Code has one H1. Live markdown for `/` and `/en` did **not** emit an H1 (client `motion.h1`). Inner pages using `PageHero` did emit H1 | H1 implemented; live homepage H1 visibility UNCERTAIN |
| About | PageHero = about title | H2 values block; H3 value names | Single H1 LIVE | OK |
| Services | PageHero = servicesTitle | Each service card is H2 | H1 then H2s LIVE | OK |
| Service detail | PageHero = service title | No extra H2 in the features list | Single H1 LIVE | OK |
| Projects | PageHero = projectsTitle | Grid cards H3 | H1 → H3 skip LIVE | Hierarchy skip |
| Project detail | PageHero = project title | H2 + related H3 | Implemented | OK-ish |
| Materials | PageHero | Each material H2 | LIVE | OK |
| How we work | PageHero | Steps are H3 | H1 → H3 skip LIVE | Hierarchy skip |
| Testimonials | PageHero | Names are `<p>` | Single H1 LIVE | OK |
| Blog index | PageHero | Post titles H2 | LIVE | OK |
| Blog post | PageHero = post title | Footer CTA H2 | LIVE | OK |
| FAQ | PageHero | Questions are `<summary>` / `<span>`, not headings | Single H1 LIVE | Questions not in heading outline |
| Contact | PageHero | Contact labels not headings | Single H1 LIVE | OK |
| Legal | PageHero title | Section H2s | LIVE | OK |
| 404 | `NotFoundView` H1 | — | No generateMetadata | H1 exists |
| All pages | Footer `h2` CTA (“בואו ניצור יחד את הפרויקט שלכם” / locale equivalent) | Footer column `h3`s | Extra H2 on every page | Extra H2 |

Homepage H1 copy (seed): HE `חללי עץ המעוצבים בדיוק בשבילכם` / AR `مساحات خشبية مصممة خصيصًا لكم` / EN `Wooden Spaces Designed Just for You` / RU `Деревянные пространства, созданные специально для вас`.

---

## 15. Indexability

| Surface | robots | Canonical | In sitemap | Indexable? |
|---|---|---|---|---|
| Public locale pages | Layout `index, follow` | Yes (page metadata) | Yes (listed paths) | Intended indexable |
| Legal pages | index, follow | Yes | Yes (priority 0.3) | Indexable |
| Studio `/studio` | `noindex, nofollow` + robots Disallow | Studio metadata only | No | Not indexable |
| `/api/` | robots Disallow | N/A | No | Not indexable |
| 404 | Inherits locale `index, follow`; no page-level noindex | None specific | No | **Would be indexable if crawled** |
| Entity `generateMetadata` miss | returns `{}` | May lack canonical | Not listed if not visible | Edge case |
| Duplicate hosts | both www and non-www served content | Canonical non-www | Sitemap non-www (500) | Duplicate-host risk |
| `/he/...` prefix | next-intl `as-needed` should treat default as unprefixed | — | Sitemap uses unprefixed he | `/he` duplicate UNKNOWN |

No page-level `noindex` on marketing or legal routes.

---

## 16. Multilingual SEO

| Topic | Current implementation |
|---|---|
| Locales | he (default), ar, en, ru |
| URL strategy | `localePrefix: 'as-needed'`; Hebrew `/`, others `/{locale}` |
| Browser language redirects | Disabled (`localeDetection: false`) |
| `html lang` | `he`, `ar`, `en-US`, `ru` |
| `dir` | rtl for he/ar; ltr for en/ru |
| Fonts | Inter; Noto Sans Hebrew for he; Cairo for ar; `display: 'swap'` |
| Metadata language | Per-locale titles/descriptions from `t()` |
| Canonical | Per-locale absolute URL |
| Hreflang | he, ar, en, ru, x-default→he |
| Sitemap | All four locales |
| Translated content | Live HE/AR/EN/RU pages show translated marketing copy |
| Untranslated bits | Testimonial **names** remain Hebrew (`לקוח/ה א׳/ב׳/ג׳`) on EN/AR/RU; footer QR alt English; some UI strings mixed |
| Duplicate content risk | Same slugs all locales; `t()` Hebrew fallback if a locale field is empty; www vs non-www; x-default = Hebrew |
| next-intl messages | Empty object — not a second copy source |

---

## 17. Local SEO

| Element | Status |
|---|---|
| Business name Nora Group | EXISTS (UI + schema) |
| Phone | EXISTS (contact, footer, schema telephone) |
| Location Migdal Oz | EXISTS (localized address string) |
| Street address | MISSING |
| Opening hours | EXISTS in contact UI; MISSING in schema; seed hours Sun–Thu 08:00–17:00; Friday/Saturday closed **not written**; differs from brief 07:00 |
| Contact information | EXISTS phone, WhatsApp, email, QR |
| LocalBusiness schema | EXISTS as `HomeAndConstructionBusiness` (subtype) |
| Organization schema | MISSING as standalone type |
| Google Maps | Field exists; seed empty; live contact had no map link |
| Social profiles | Fields exist; seed empty; live contact had no Instagram/Facebook |
| NAP consistency | Legal pages cite `officialnoragroup.com` (non-www), phone `052-465-9510`, Migdal Oz. Live contact visible number appeared as `+972524659510` |

---

## 18. Blog SEO

Seed posts (all `visible: true`, author `Nora Group`):

| Slug | HE title | EN title | Date | Image |
|---|---|---|---|---|
| `choosing-kitchen-materials` | איך בוחרים חומרים למטבח | How to Choose Kitchen Materials | 2025-01-15 | kitchen1 |
| `wardrobe-trends` | מגמות בארונות ובחדרי ארונות | Wardrobe and Walk-in Closet Trends | 2025-02-20 | wardrobe1 |
| `wood-care` | איך שומרים על ריהוט עץ | How to Care for Wood Furniture | 2025-03-10 | furniture1 |

| Blog SEO item | Status |
|---|---|
| Index title/description | EXISTS (`מאמרים ועדכונים \| Nora Group` LIVE HE) |
| Post title | `brandedTitle(post.title)` — LIVE EN example `How to Choose Kitchen Materials \| Nora Group` |
| Post description | excerpt fallback or `post.seo` |
| Canonical | locale post URL | EXISTS in code |
| Hreflang | all four locales + x-default | EXISTS in code |
| Article schema | `Article` | EXISTS |
| BlogPosting | MISSING |
| Author | Organization name `Nora Group` in schema and UI | EXISTS |
| datePublished | `post.date` | EXISTS |
| dateModified | MISSING |
| Image | post image in metadata + schema `image` | EXISTS |
| Breadcrumbs | Home → Blog → title | EXISTS |
| Body length | Short seed paragraphs (few sentences) | Thin content |

---

## 19. Performance-Related SEO

| Topic | Current implementation |
|---|---|
| Next/Image | Used; AVIF/WebP; 30-day `minimumCacheTTL` |
| Hero | Client component (`'use client'`) with Framer Motion slider; still receives title as props from server `HomeView` |
| Header / Footer / LanguageSelector / CookieNotice / FloatingWhatsApp / ProjectsGrid / Reveal | Client components wrapping SSR content |
| Reveal CSS | `.reveal { opacity: 0 }` until IntersectionObserver; text remains in HTML. `prefers-reduced-motion` forces opacity 1 |
| Fonts | `next/font/google`, `display: 'swap'` |
| Metadata | Server `generateMetadata` — not client-only |
| Important SEO pages | Server Components for page shells (`HomeView`, `AboutView`, etc. are server components except noted clients) |
| Analytics | Legal/cookies copy states no GA / Meta Pixel as of 12 Sep 2026 |
| JS on homepage | Motion hero + header/footer client bundles |
| `poweredByHeader` | Disabled |
| Excessive client-only SEO | Titles/descriptions/JSON-LD are server-rendered. Risk is homepage H1 living in client `Hero` and reveal opacity |

---

## 20. Existing Issues

1. **Host mismatch:** code, env example, legal copy, canonicals, hreflang, and robots sitemap use `https://officialnoragroup.com` (non-www). Stated primary is `https://www.officialnoragroup.com/`.
2. **Duplicate host:** www and non-www both returned live page content.
3. **Production sitemap HTTP 500** on both hosts — crawlers cannot read URL list. Robots still points at that sitemap.
4. **Robots sitemap host** is non-www even when `robots.txt` is served on www.
5. **LocalBusiness JSON-LD** missing `openingHoursSpecification`, `sameAs`, `geo`, `streetAddress`, `postalCode`, and `logo`.
6. **WebSite `url`** is always the Hebrew origin, not the locale homepage.
7. **Article `publisher` `@id`** is not defined on article pages (graph only on home).
8. **No `dateModified`** on articles.
9. **No Service schema** on `/services` or slug pages.
10. **No `og:locale:alternate`.**
11. **OG/Twitter image missing** on testimonials, privacy, cookies, terms.
12. **`og:locale` for English is `en-US`** while hreflang is `en`.
13. **Homepage H1** is a client `motion.h1`; live markdown extraction did not surface it (inner `PageHero` H1s did).
14. **Footer extra H2** on every page.
15. **Heading skips:** projects listing and how-we-work go H1 → H3.
16. **Hero images `alt=""`** (empty).
17. **PageHero alt = title** (not image-specific).
18. **Footer QR alt** English-only.
19. **Testimonial names** not localized (Hebrew on AR/EN/RU).
20. **Working hours** 08:00–17:00 Sun–Thu; Friday/Saturday closed not stated; differs from brief 07:00–17:00.
21. **Sitemap `lastModified`** omitted except blog dates.
22. **404 inherits `index,follow`** with no noindex.
23. **Contact page** has NAP in HTML but only BreadcrumbList JSON-LD (business graph is homepage-only).
24. **Listing pages** (services, projects, materials, testimonials, legal) have no dedicated CMS SEO object in `generateMetadata`.
25. **`t()` Hebrew fallback** can mix Hebrew body into other locales if CMS fields are empty.
26. **Legal/contact domain strings** are non-www.
27. **Thin blog bodies** in seed (and live EN post showed a single short paragraph).
28. **Reveal `opacity: 0`** until JS (content still in DOM).
29. **No map or social URLs** in seed; live contact showed neither maps nor social links.
30. **FAQ questions** are not headings.
31. **Slug metadata returning `{}`** if entity missing skips canonical/hreflang for that response.
32. Next.js config has **no www/non-www redirect**.

Door manufacturing: **no public service, project, or metadata** advertises doors. Mentions exist only as “do not add doors” comments in `lib/constants.ts`, Sanity schema descriptions, README, and docs.

---

## 21. Missing SEO Elements

1. `www` as the canonical/sitemap/robots host (if www is the real primary).
2. A working production `sitemap.xml` (code exists; live 500).
3. JSON-LD `openingHoursSpecification` (and explicit Friday/Saturday closed).
4. JSON-LD `sameAs` (Instagram/Facebook) — and seed values for those URLs.
5. JSON-LD `geo` / `GeoCoordinates`.
6. JSON-LD `streetAddress` / `postalCode`.
7. JSON-LD `logo` property.
8. Standalone `Organization` type (optional alongside the existing subtype).
9. `Service` JSON-LD (and/or `hasOfferCatalog`).
10. `ImageObject` JSON-LD.
11. `BlogPosting` (only `Article`).
12. `dateModified` on posts.
13. `og:locale:alternate`.
14. Default OG image on testimonials and legal pages.
15. `twitter:site` / `twitter:creator`.
16. Google Maps URL/embed in seed (field exists, unused).
17. `noindex` on 404.
18. `lastModified` for non-blog sitemap URLs.
19. Page-level CMS SEO wiring for services/projects/materials/testimonials/legal indexes.
20. Visual breadcrumbs (schema exists; no breadcrumb UI component found).
21. `WebSite` `SearchAction`.
22. Review/AggregateRating schema for testimonials.
23. Locale-specific `WebSite.url`.
24. Image-specific (non-empty, non-title-echo) alts on hero/PageHero.
25. Explicit closed days in the public hours string.

---

## 22. Existing Good Practices

1. Next.js App Router server `generateMetadata` on all marketing routes.
2. Shared `buildPageMetadata` / `brandedTitle` / `absoluteUrl` / `hreflangMap`.
3. `metadataBase` from `SITE_URL`.
4. Canonical per locale path.
5. Hreflang for he, ar, en, ru, and x-default → Hebrew.
6. `robots.ts` Allow `/`, Disallow `/studio` and `/api/`, with sitemap pointer.
7. Sitemap includes all four locales, static IA, and visible entities; excludes studio/API.
8. JSON-LD: `HomeAndConstructionBusiness`, `WebSite`, `BreadcrumbList`, `FAQPage`, `Article`.
9. `safeJsonLd` script-break escaping.
10. Open Graph title, description, url, type, locale, site_name; images on most pages.
11. Twitter `summary_large_image`.
12. `html lang` and `dir` per locale.
13. Hebrew default unprefixed; no browser-language hijack (`localeDetection: false`).
14. Studio `noindex, nofollow`.
15. Next/Image with AVIF/WebP and Sanity remote allowlist.
16. Font `display: 'swap'`.
17. Production HSTS, nosniff, referrer-policy, `poweredByHeader: false`.
18. Localized titles and descriptions in four languages.
19. CMS SEO fields for home/about/how-we-work/blog/faq/contact and entity slugs.
20. Unique titles per route (within a locale).
21. Blog `og:type` article + datePublished + author.
22. Visible NAP on contact (name, phone, email, locality, hours).
23. No public door services.
24. Service slugs match the real offer set (kitchens, bedrooms, wardrobes, walk-in closets, custom furniture, offices, commercial).
25. FAQPage schema aligned with on-page Q&A.
26. Absolute HTTPS URLs in helpers (rejects odd protocols / relative junk via `toAbsoluteAsset`).
27. Live translated pages for HE/AR/EN/RU confirmed.
28. Legal pages present and dated (12 September 2026).
29. `generateStaticParams` for locales and slugs.
30. Content fallback seed if Sanity is unset/fails.

---

## 23. Data That Is Unknown

1. Exact live `<link rel="canonical">` / hreflang / OG / JSON-LD HTML (markdown fetch did not expose those tags).
2. Why production `sitemap.xml` returns 500 (Sanity error vs runtime vs host).
3. Whether Vercel actually 301s non-www → www (both hostnames returned content to the fetcher).
4. Whether unpublished Sanity drafts differ from live published SEO fields.
5. Whether `home.seo` is filled in the live CMS (titles matched site settings; meta description HTML unverified).
6. Street address, postal code, geo coordinates (not in seed).
7. Real Instagram/Facebook/Maps URLs if stored only in unpublished CMS.
8. Google Search Console verification, indexing, and coverage.
9. Whether homepage `motion.h1` is present in raw HTML for Googlebot.
10. Production `NEXT_PUBLIC_SITE_URL` exact env string (robots implies origin `https://officialnoragroup.com` with no www and no trailing path).
11. Whether `/he` and `/he/about` redirect or 404.
12. Indexing of legal pages in Google.
13. Image file EXIF / true pixel dimensions.
14. Whether any Sanity document sets page `seo.image` different from seed images.
15. Crawl budget / Core Web Vitals field data (not measured; build/typecheck not run).

---

## 24. Recommended Future Actions

These are recommendations only. **None of them were implemented in this audit.**

1. Align `NEXT_PUBLIC_SITE_URL`, canonicals, hreflang, sitemap, robots, and legal domain copy with the real primary host (`www` or non-www), and 301 the other host.
2. Diagnose and repair the production `sitemap.xml` 500 so Search Console can ingest URLs.
3. After the sitemap works, resubmit it in Search Console and inspect coverage for both hosts.
4. Add JSON-LD `openingHoursSpecification` (Sun–Thu plus Friday/Saturday closed) once hours are confirmed (07:00 vs 08:00).
5. Add `sameAs`, `logo`, `geo`, and fuller `PostalAddress` if those facts are available.
6. Emit the business graph on contact (and optionally every page) so Article `publisher` `@id` resolves.
7. Add `Service` JSON-LD for the seven real services only — not doors.
8. Switch blog schema to `BlogPosting` and set `dateModified`.
9. Add `og:locale:alternate` and a fallback OG image for testimonials/legal.
10. Make `og:locale` for English `en` (or emit hreflang `en-US` consistently — pick one).
11. Verify homepage H1 in view-source / Googlebot HTML; keep one H1 in server-rendered markup.
12. Remove or demote the footer extra H2; fix H1→H3 skips.
13. Replace empty/generic image alts with descriptive alts where images are informative.
14. Localize testimonial names (or use initials that work in all languages).
15. Add `noindex` to 404.
16. Wire CMS SEO objects for services/projects/materials/testimonials/legal indexes.
17. Expand thin blog bodies if the blog is meant to rank.
18. Set `lastModified` from CMS `_updatedAt` in the sitemap.
19. Confirm map URL and social URLs in Site settings if they should appear.
20. Re-audit live HTML (canonical, hreflang, JSON-LD) with unconverted source after host/sitemap fixes.
21. Do **not** add door manufacturing services or door keywords.

---

*End of read-only SEO current-state report. No SEO fixes were implemented.*
