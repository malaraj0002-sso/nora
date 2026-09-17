# Restore original services to Sanity Production

Migration date: 17 September 2026

## Migration

- Sanity project: `g32xvgua`
- Dataset: `production`
- Studio: `/studio`
- Source: `lib/content/seed.ts` + `public/images/`
- Architecture unchanged: Sanity Production → `lib/sanity/fetch.ts` → `getSiteContent` → existing `HomeView`

Seven published documents:

| Order | Document ID | Slug |
|---:|---|---|
| 1 | `service-kitchens` | `kitchens` |
| 2 | `service-bedrooms` | `bedrooms` |
| 3 | `service-wardrobes` | `wardrobes` |
| 4 | `service-walk-in-closets` | `walk-in-closets` |
| 5 | `service-custom-furniture` | `custom-furniture` |
| 6 | `service-offices` | `offices` |
| 7 | `service-commercial` | `commercial` |

Each document has `visible: true`, localized title/description/body/features (he, ar, en, ru), slug, order, and a Sanity image. `homePage.featuredServices` was left empty/null.

Seed content in `lib/content/seed.ts` was not removed. It remains the fallback if Sanity is unavailable.

## Images

Uploaded original local JPEGs as Sanity assets and attached them as the main image (and a single gallery item):

| Service | Local file | Sanity asset ID |
|---|---|---|
| kitchens | `public/images/hero-kitchen.jpg` | `image-5fc8a61c5b954882987c65f9ee6637dd4cc76f2d-1536x1024-jpg` |
| bedrooms | `public/images/bedroom.jpg` | `image-8334fc56c2154562167fd1121d476e3b7412ceee-1536x1024-jpg` |
| wardrobes | `public/images/wardrobe.jpg` | `image-ba54b320961b308e659cf88421d3f5927fd8b5c4-1536x1024-jpg` |
| walk-in-closets | `public/images/wardrobe-2.jpg` | `image-fb65ce1e5a50213f0f44c8c62e32af31bbfce845-1536x1024-jpg` |
| custom-furniture | `public/images/furniture.jpg` | `image-1e82197e85dab450252c5046d80413d6073ba3f6-1536x1024-jpg` |
| offices | `public/images/office.jpg` | `image-c349203d14c552983e2a556d17f3ec482c7f0f60-1536x1024-jpg` |
| commercial | `public/images/commercial.jpg` | `image-70c744e15780e0124ba317bf999bd2273f3c5765-1536x1024-jpg` |

Live English homepage uses `cdn.sanity.io/images/g32xvgua/production/5fc8a61c5b954882987c65f9ee6637dd4cc76f2d…` for Kitchens.

## Deleted document

- ID: `5f997bae-f0ee-44b9-998d-d6ee07a67d4b`
- Slug: `cms`
- Title: CMS Test Service
- Verified ID + slug + English title before delete
- Confirmed only this document was deleted

After migration:

- service documents = 7
- cms service = 0
- Doors service = 0

## Website restoration

Live site: `https://www.officialnoragroup.com`

- Homepage **Our Services** section restored in the same place (`HomeView` services grid)
- Original card design unchanged (`HomeView.tsx` was not modified)
- Original order restored (kitchens → commercial)
- Original images restored via Sanity CDN
- Hebrew titles verified on `/`
- Arabic titles verified on `/ar`
- English titles verified on `/en`
- Russian titles verified on `/ru`
- Footer service links match the seven originals
- CMS Test is gone
- No Doors card

Service pages (200):

- `/services/kitchens` through `/services/commercial`
- `/en/services/…`, `/ar/services/…`, `/ru/services/…` for all seven slugs

Studio `/studio` Services list shows all seven, visible, with images, in order. Native Sanity editing (title, description, visibility, order, image, publish) remains available. No extra test edits were made to production copy.

## Safety

- Doors = 0
- No duplicate service slugs
- No unrelated documents deleted
- No Git rollback
- No homepage redesign
- No Studio functionality removed
- No write token added to the public website
- Sanity project/dataset unchanged (`g32xvgua` / `production`)

## Validation

| Check | Result |
|---|---|
| Sanity Production | PASS |
| Homepage | PASS |
| Service pages | PASS |
| Revalidation | PASS (live site updated after publish; existing webhook/ISR path) |
| Typecheck | PASS (`npm run typecheck`, exit 0) |
| Build | PASS (`npm run build`, exit 0) |

## Final architecture

Sanity Production  
→ existing Sanity fetch layer (`lib/sanity/fetch.ts`)  
→ existing content layer (`getSiteContent`)  
→ existing `HomeView`  
→ original Nora Group services section restored
