import { seedContent } from '@/lib/content/seed';
import type { LocalizedString, PageSeo, SiteContent } from '@/lib/content/types';
import { PROJECT_CATEGORIES, REVALIDATE_TAGS, type ProjectCategory } from '@/lib/constants';
import { client } from '@/sanity/lib/client';
import { urlForImage } from './image';
import { isSanityConfigured } from './env';
import { isSafeSlug } from '@/lib/i18n/locale';

function asLocale(value: Partial<LocalizedString> | undefined, fallback: LocalizedString): LocalizedString {
  return {
    he: value?.he?.trim() || fallback.he,
    ar: value?.ar?.trim() || fallback.ar,
    en: value?.en?.trim() || fallback.en,
    ru: value?.ru?.trim() || fallback.ru,
  };
}

const FETCH_OPTS = (tags: string[]) =>
  process.env.NODE_ENV === 'development'
    ? { cache: 'no-store' as const, next: { tags } }
    : { next: { tags, revalidate: 3600 as const } };

function settled<T>(result: PromiseSettledResult<T>, label: string): T | null {
  if (result.status === 'fulfilled') return result.value;
  console.error(`[fetchSanityContent] ${label} failed; keeping seed for that slice`);
  return null;
}

function Lempty(): LocalizedString {
  return { he: '', ar: '', en: '', ru: '' };
}

function imagesFallback(): string {
  return seedContent.home.heroImages[0];
}

function imageUrl(value: unknown, fallback = ''): string {
  return urlForImage(value) || fallback;
}

function galleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((img) => urlForImage(img)).filter((src): src is string => Boolean(src));
}

function mapSeo(doc: Record<string, unknown> | null | undefined): PageSeo | undefined {
  if (!doc) return undefined;
  const title = doc.seoTitle as Partial<LocalizedString> | undefined;
  const description = doc.seoDescription as Partial<LocalizedString> | undefined;
  const image = imageUrl(doc.seoImage);
  if (!title && !description && !image) return undefined;
  return {
    title: title ? asLocale(title, Lempty()) : undefined,
    description: description ? asLocale(description, Lempty()) : undefined,
    image: image || undefined,
  };
}

function slugsFromRefs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '')).filter(isSafeSlug);
}

function isProjectCategory(value: unknown): value is ProjectCategory {
  return typeof value === 'string' && (PROJECT_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Published CMS documents merged onto seed defaults.
 * When a Sanity collection has items, those items replace seed for that slice.
 * Missing documents keep seed so onboarding never empties the site.
 */
export async function fetchSanityContent(): Promise<SiteContent | null> {
  if (!isSanityConfigured()) return null;

  const [
    settingsRes,
    homeRes,
    aboutRes,
    howWeWorkRes,
    contactPageRes,
    faqPageRes,
    blogPageRes,
    servicesRes,
    projectsRes,
    materialsRes,
    testimonialsRes,
    blogPostsRes,
    faqRes,
    uiDocsRes,
  ] = await Promise.allSettled([
    client.fetch(`*[_type == "siteSettings"][0]`, {}, FETCH_OPTS([REVALIDATE_TAGS.siteSettings, REVALIDATE_TAGS.all])),
    client.fetch(
      `*[_type == "homePage"][0]{
        ...,
        "featuredServiceSlugs": featuredServices[]->slug.current,
        "featuredProjectSlugs": featuredProjects[]->slug.current
      }`,
      {},
      FETCH_OPTS([REVALIDATE_TAGS.home, REVALIDATE_TAGS.all]),
    ),
    client.fetch(`*[_type == "aboutPage"][0]`, {}, FETCH_OPTS([REVALIDATE_TAGS.pages, REVALIDATE_TAGS.all])),
    client.fetch(`*[_type == "howWeWorkPage"][0]`, {}, FETCH_OPTS([REVALIDATE_TAGS.pages, REVALIDATE_TAGS.all])),
    client.fetch(`*[_type == "contactPage"][0]`, {}, FETCH_OPTS([REVALIDATE_TAGS.pages, REVALIDATE_TAGS.all])),
    client.fetch(`*[_type == "faqPage"][0]`, {}, FETCH_OPTS([REVALIDATE_TAGS.pages, REVALIDATE_TAGS.all])),
    client.fetch(`*[_type == "blogPage"][0]`, {}, FETCH_OPTS([REVALIDATE_TAGS.pages, REVALIDATE_TAGS.all])),
    client.fetch(
      `*[_type == "service" && visible != false] | order(order asc){
        "slug": slug.current, title, description, body, features, visible, featured,
        image, gallery, seoTitle, seoDescription, seoImage
      }`,
      {},
      FETCH_OPTS([REVALIDATE_TAGS.services, REVALIDATE_TAGS.all]),
    ),
    client.fetch(
      `*[_type == "project" && visible != false] | order(order asc){
        "slug": slug.current, title, description, category, location, completedAt, materials,
        visible, featured, gallery, seoTitle, seoDescription, seoImage
      }`,
      {},
      FETCH_OPTS([REVALIDATE_TAGS.projects, REVALIDATE_TAGS.all]),
    ),
    client.fetch(
      `*[_type == "material" && visible != false] | order(order asc){
        "slug": slug.current, name, description, characteristics, applications, finishes,
        visible, featured, image
      }`,
      {},
      FETCH_OPTS([REVALIDATE_TAGS.materials, REVALIDATE_TAGS.all]),
    ),
    client.fetch(
      `*[_type == "testimonial" && visible != false] | order(order asc){
        "id": _id, name, rating, review, project, visible, featured, image
      }`,
      {},
      FETCH_OPTS([REVALIDATE_TAGS.testimonials, REVALIDATE_TAGS.all]),
    ),
    client.fetch(
      `*[_type == "blogPost" && visible != false] | order(date desc){
        "slug": slug.current, title, excerpt, category, author, date, visible, featured,
        image, seoTitle, seoDescription, seoImage
      }`,
      {},
      FETCH_OPTS([REVALIDATE_TAGS.blog, REVALIDATE_TAGS.all]),
    ),
    client.fetch(
      `*[_type == "faqItem" && visible != false] | order(order asc){
        "id": _id, category, question, answer, visible
      }`,
      {},
      FETCH_OPTS([REVALIDATE_TAGS.faq, REVALIDATE_TAGS.all]),
    ),
    client.fetch(`*[_type == "uiLabels"]`, {}, FETCH_OPTS([REVALIDATE_TAGS.all])),
  ]);

  const settings = settled(settingsRes, 'siteSettings') as Record<string, unknown> | null;
  const home = settled(homeRes, 'homePage') as Record<string, unknown> | null;
  const about = settled(aboutRes, 'aboutPage') as Record<string, unknown> | null;
  const howWeWork = settled(howWeWorkRes, 'howWeWorkPage') as Record<string, unknown> | null;
  const contactPage = settled(contactPageRes, 'contactPage') as Record<string, unknown> | null;
  const faqPage = settled(faqPageRes, 'faqPage') as Record<string, unknown> | null;
  const blogPage = settled(blogPageRes, 'blogPage') as Record<string, unknown> | null;
  const services = settled(servicesRes, 'services') as Array<Record<string, unknown>> | null;
  const projects = settled(projectsRes, 'projects') as Array<Record<string, unknown>> | null;
  const materials = settled(materialsRes, 'materials') as Array<Record<string, unknown>> | null;
  const testimonials = settled(testimonialsRes, 'testimonials') as Array<Record<string, unknown>> | null;
  const blogPosts = settled(blogPostsRes, 'blogPosts') as Array<Record<string, unknown>> | null;
  const faq = settled(faqRes, 'faq') as Array<Record<string, unknown>> | null;
  const uiDocs = settled(uiDocsRes, 'uiLabels') as Array<Record<string, string>> | null;

  const base = structuredClone(seedContent);

  if (settings) {
    base.settings = {
      ...base.settings,
      brandName: String(settings.brandName || base.settings.brandName),
      tagline: asLocale(settings.tagline as Partial<LocalizedString>, base.settings.tagline),
      pillars: asLocale(settings.pillars as Partial<LocalizedString>, base.settings.pillars),
      phoneDisplay: String(settings.phoneDisplay || base.settings.phoneDisplay),
      phoneTel: String(settings.phoneTel || base.settings.phoneTel),
      whatsappE164: String(settings.whatsappE164 || base.settings.whatsappE164),
      email: String(settings.email || base.settings.email),
      address: asLocale(settings.address as Partial<LocalizedString>, base.settings.address),
      workingHours: asLocale(settings.workingHours as Partial<LocalizedString>, base.settings.workingHours),
      whatsappMessage: asLocale(settings.whatsappMessage as Partial<LocalizedString>, base.settings.whatsappMessage),
      logoUrl: imageUrl(settings.logo, base.settings.logoUrl),
      logoDarkUrl: imageUrl(settings.logoDark, base.settings.logoDarkUrl),
      qrUrl: imageUrl(settings.contactQr, base.settings.qrUrl),
      seoTitle: asLocale(settings.seoTitle as Partial<LocalizedString>, base.settings.seoTitle),
      seoDescription: asLocale(settings.seoDescription as Partial<LocalizedString>, base.settings.seoDescription),
      seoImage: imageUrl(settings.seoImage) || undefined,
      instagramUrl: typeof settings.instagramUrl === 'string' ? settings.instagramUrl : undefined,
      facebookUrl: typeof settings.facebookUrl === 'string' ? settings.facebookUrl : undefined,
      mapUrl: typeof settings.mapUrl === 'string' ? settings.mapUrl : undefined,
    };
  }

  if (home) {
    const heroImages = galleryUrls(home.heroImages);
    base.home = {
      ...base.home,
      heroTitle: asLocale(home.heroTitle as Partial<LocalizedString>, base.home.heroTitle),
      heroSubtitle: asLocale(home.heroSubtitle as Partial<LocalizedString>, base.home.heroSubtitle),
      introEyebrow: asLocale(home.introEyebrow as Partial<LocalizedString>, base.home.introEyebrow),
      introTitle: asLocale(home.introTitle as Partial<LocalizedString>, base.home.introTitle),
      introDescription: asLocale(home.introDescription as Partial<LocalizedString>, base.home.introDescription),
      whyEyebrow: asLocale(home.whyEyebrow as Partial<LocalizedString>, base.home.whyEyebrow),
      whyTitle: asLocale(home.whyTitle as Partial<LocalizedString>, base.home.whyTitle),
      whySubtitle: asLocale(home.whySubtitle as Partial<LocalizedString>, base.home.whySubtitle),
      processEyebrow: asLocale(home.processEyebrow as Partial<LocalizedString>, base.home.processEyebrow),
      processTitle: asLocale(home.processTitle as Partial<LocalizedString>, base.home.processTitle),
      processSubtitle: asLocale(home.processSubtitle as Partial<LocalizedString>, base.home.processSubtitle),
      servicesEyebrow: asLocale(home.servicesEyebrow as Partial<LocalizedString>, base.home.servicesEyebrow),
      servicesTitle: asLocale(home.servicesTitle as Partial<LocalizedString>, base.home.servicesTitle),
      servicesSubtitle: asLocale(home.servicesSubtitle as Partial<LocalizedString>, base.home.servicesSubtitle),
      projectsEyebrow: asLocale(home.projectsEyebrow as Partial<LocalizedString>, base.home.projectsEyebrow),
      projectsTitle: asLocale(home.projectsTitle as Partial<LocalizedString>, base.home.projectsTitle),
      projectsSubtitle: asLocale(home.projectsSubtitle as Partial<LocalizedString>, base.home.projectsSubtitle),
      materialsEyebrow: asLocale(home.materialsEyebrow as Partial<LocalizedString>, base.home.materialsEyebrow),
      materialsTitle: asLocale(home.materialsTitle as Partial<LocalizedString>, base.home.materialsTitle),
      materialsSubtitle: asLocale(home.materialsSubtitle as Partial<LocalizedString>, base.home.materialsSubtitle),
      testimonialsEyebrow: asLocale(home.testimonialsEyebrow as Partial<LocalizedString>, base.home.testimonialsEyebrow),
      testimonialsTitle: asLocale(home.testimonialsTitle as Partial<LocalizedString>, base.home.testimonialsTitle),
      testimonialsSubtitle: asLocale(home.testimonialsSubtitle as Partial<LocalizedString>, base.home.testimonialsSubtitle),
      ctaTitle: asLocale(home.ctaTitle as Partial<LocalizedString>, base.home.ctaTitle),
      ctaSubtitle: asLocale(home.ctaSubtitle as Partial<LocalizedString>, base.home.ctaSubtitle),
      heroImages: heroImages.length ? heroImages : base.home.heroImages,
      featuredServiceSlugs: slugsFromRefs(home.featuredServiceSlugs),
      featuredProjectSlugs: slugsFromRefs(home.featuredProjectSlugs),
      seo: mapSeo(home),
      introFeatures: Array.isArray(home.introFeatures) && home.introFeatures.length
        ? (home.introFeatures as Array<{ title?: LocalizedString; desc?: LocalizedString }>).map((f, i) => ({
            title: asLocale(f.title, base.home.introFeatures[i]?.title || base.home.introFeatures[0].title),
            desc: asLocale(f.desc, base.home.introFeatures[i]?.desc || base.home.introFeatures[0].desc),
          }))
        : base.home.introFeatures,
      whyItems: Array.isArray(home.whyItems) && home.whyItems.length
        ? (home.whyItems as Array<{ title?: LocalizedString; desc?: LocalizedString }>).map((f, i) => ({
            title: asLocale(f.title, base.home.whyItems[i]?.title || base.home.whyItems[0].title),
            desc: asLocale(f.desc, base.home.whyItems[i]?.desc || base.home.whyItems[0].desc),
          }))
        : base.home.whyItems,
    };
  }

  if (about) {
    const values = Array.isArray(about.values)
      ? (about.values as Array<{ title?: LocalizedString; desc?: LocalizedString }>).map((v, i) => ({
          title: asLocale(v.title, base.about.values[i]?.title || Lempty()),
          desc: asLocale(v.desc, base.about.values[i]?.desc || Lempty()),
        }))
      : null;

    base.about = {
      ...base.about,
      eyebrow: asLocale(about.eyebrow as Partial<LocalizedString>, base.about.eyebrow),
      title: asLocale(about.title as Partial<LocalizedString>, base.about.title),
      subtitle: asLocale(about.subtitle as Partial<LocalizedString>, base.about.subtitle),
      body: asLocale(about.body as Partial<LocalizedString>, base.about.body),
      mission: asLocale(about.mission as Partial<LocalizedString>, base.about.mission || Lempty()),
      vision: asLocale(about.vision as Partial<LocalizedString>, base.about.vision || Lempty()),
      valuesTitle: asLocale(about.valuesTitle as Partial<LocalizedString>, base.about.valuesTitle),
      image: imageUrl(about.image, base.about.image),
      values: values && values.length ? values : base.about.values,
      seo: mapSeo(about),
    };
  }

  if (howWeWork) {
    base.howWeWork = {
      ...base.howWeWork,
      eyebrow: asLocale(howWeWork.eyebrow as Partial<LocalizedString>, base.howWeWork.eyebrow),
      title: asLocale(howWeWork.title as Partial<LocalizedString>, base.howWeWork.title),
      subtitle: asLocale(howWeWork.subtitle as Partial<LocalizedString>, base.howWeWork.subtitle),
      image: imageUrl(howWeWork.image, base.howWeWork.image),
      seo: mapSeo(howWeWork),
      steps: Array.isArray(howWeWork.steps) && howWeWork.steps.length
        ? (
            howWeWork.steps as Array<{
              number?: string;
              title?: LocalizedString;
              description?: LocalizedString;
              image?: unknown;
            }>
          ).map((s, i) => ({
            number: s.number || String(i + 1).padStart(2, '0'),
            title: asLocale(s.title, base.howWeWork.steps[i]?.title || base.howWeWork.steps[0].title),
            description: asLocale(
              s.description,
              base.howWeWork.steps[i]?.description || base.howWeWork.steps[0].description,
            ),
            image: imageUrl(s.image) || undefined,
          }))
        : base.howWeWork.steps,
    };
  }

  if (contactPage) {
    base.contactPage = {
      ...base.contactPage,
      eyebrow: asLocale(contactPage.eyebrow as Partial<LocalizedString>, base.contactPage.eyebrow),
      title: asLocale(contactPage.title as Partial<LocalizedString>, base.contactPage.title),
      subtitle: asLocale(contactPage.subtitle as Partial<LocalizedString>, base.contactPage.subtitle),
      image: imageUrl(contactPage.image, base.contactPage.image),
      seo: mapSeo(contactPage),
    };
  }

  if (faqPage) {
    base.faqPage = {
      ...base.faqPage,
      eyebrow: asLocale(faqPage.eyebrow as Partial<LocalizedString>, base.faqPage.eyebrow),
      title: asLocale(faqPage.title as Partial<LocalizedString>, base.faqPage.title),
      subtitle: asLocale(faqPage.subtitle as Partial<LocalizedString>, base.faqPage.subtitle),
      image: imageUrl(faqPage.image, base.faqPage.image),
      seo: mapSeo(faqPage),
    };
  }

  if (blogPage) {
    base.blogPage = {
      ...base.blogPage,
      eyebrow: asLocale(blogPage.eyebrow as Partial<LocalizedString>, base.blogPage.eyebrow),
      title: asLocale(blogPage.title as Partial<LocalizedString>, base.blogPage.title),
      subtitle: asLocale(blogPage.subtitle as Partial<LocalizedString>, base.blogPage.subtitle),
      image: imageUrl(blogPage.image, base.blogPage.image),
      seo: mapSeo(blogPage),
    };
  }

  if (services?.length) {
    const mapped = services
      .map((s) => ({
        slug: String(s.slug || ''),
        title: asLocale(s.title as LocalizedString, Lempty()),
        description: asLocale(s.description as LocalizedString, Lempty()),
        body: asLocale(s.body as LocalizedString, Lempty()),
        image: imageUrl(s.image, imagesFallback()),
        gallery: galleryUrls(s.gallery),
        features: Array.isArray(s.features)
          ? (s.features as LocalizedString[]).map((f) => asLocale(f, Lempty()))
          : [],
        featured: s.featured === true,
        visible: s.visible !== false,
        seo: mapSeo(s),
      }))
      .filter((s) => isSafeSlug(s.slug));
    if (mapped.length) base.services = mapped;
  }

  if (projects?.length) {
    const mapped = projects
      .map((p) => {
        const images = galleryUrls(p.gallery);
        return {
          slug: String(p.slug || ''),
          title: asLocale(p.title as LocalizedString, Lempty()),
          description: asLocale(p.description as LocalizedString, Lempty()),
          category: isProjectCategory(p.category) ? p.category : 'furniture',
          location: asLocale(p.location as LocalizedString, Lempty()),
          completedAt: typeof p.completedAt === 'string' ? p.completedAt : undefined,
          images: images.length ? images : [imagesFallback()],
          materials: Array.isArray(p.materials) ? p.materials.map((m) => String(m)) : [],
          featured: p.featured === true,
          visible: p.visible !== false,
          seo: mapSeo(p),
        };
      })
      .filter((p) => isSafeSlug(p.slug));
    if (mapped.length) base.projects = mapped;
  }

  if (materials?.length) {
    const mapped = materials
      .map((m) => ({
        slug: String(m.slug || ''),
        name: asLocale(m.name as LocalizedString, Lempty()),
        description: asLocale(m.description as LocalizedString, Lempty()),
        characteristics: asLocale(m.characteristics as LocalizedString, Lempty()),
        applications: asLocale(m.applications as LocalizedString, Lempty()),
        finishes: asLocale(m.finishes as LocalizedString, Lempty()),
        image: imageUrl(m.image, imagesFallback()),
        featured: m.featured === true,
        visible: m.visible !== false,
      }))
      .filter((m) => isSafeSlug(m.slug));
    if (mapped.length) base.materials = mapped;
  }

  if (testimonials?.length) {
    base.testimonials = testimonials.map((t) => ({
      id: String(t.id),
      name: String(t.name || ''),
      rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
      review: asLocale(t.review as LocalizedString, Lempty()),
      project: asLocale(t.project as LocalizedString, Lempty()),
      image: imageUrl(t.image) || undefined,
      featured: t.featured === true,
      visible: t.visible !== false,
    }));
  }

  if (blogPosts?.length) {
    const mapped = blogPosts
      .map((b) => ({
        slug: String(b.slug || ''),
        title: asLocale(b.title as LocalizedString, Lempty()),
        excerpt: asLocale(b.excerpt as LocalizedString, Lempty()),
        content: Lempty(),
        category: String(b.category || ''),
        author: String(b.author || 'Nora Group'),
        date: String(b.date || ''),
        image: imageUrl(b.image, imagesFallback()),
        featured: b.featured === true,
        visible: b.visible !== false,
        seo: mapSeo(b),
      }))
      .filter((b) => isSafeSlug(b.slug));
    if (mapped.length) base.blogPosts = mapped;
  }

  if (faq?.length) {
    base.faq = faq.map((f) => ({
      id: String(f.id),
      category: String(f.category || ''),
      question: asLocale(f.question as LocalizedString, Lempty()),
      answer: asLocale(f.answer as LocalizedString, Lempty()),
      visible: f.visible !== false,
    }));
  }

  if (uiDocs?.length) {
    for (const doc of uiDocs) {
      const locale = doc.locale as keyof typeof base.nav;
      if (!locale || !base.nav[locale]) continue;
      base.nav[locale] = {
        ...base.nav[locale],
        home: doc.home || base.nav[locale].home,
        about: doc.about || base.nav[locale].about,
        services: doc.services || base.nav[locale].services,
        projects: doc.projects || base.nav[locale].projects,
        materials: doc.materials || base.nav[locale].materials,
        howWeWork: doc.howWeWork || base.nav[locale].howWeWork,
        testimonials: doc.testimonials || base.nav[locale].testimonials,
        blog: doc.blog || base.nav[locale].blog,
        faq: doc.faq || base.nav[locale].faq,
        contact: doc.contact || base.nav[locale].contact,
        callUs: doc.callUs || base.nav[locale].callUs,
        whatsapp: doc.whatsapp || base.nav[locale].whatsapp,
        viewWork: doc.viewWork || base.nav[locale].viewWork,
        learnMore: doc.learnMore || base.nav[locale].learnMore,
        viewAll: doc.viewAll || base.nav[locale].viewAll,
        viewProject: doc.viewProject || base.nav[locale].viewProject,
        readMore: doc.readMore || base.nav[locale].readMore,
        backHome: doc.backHome || base.nav[locale].backHome,
        all: doc.all || base.nav[locale].all,
      };
      base.categoryLabels[locale] = {
        ...base.categoryLabels[locale],
        all: doc.categoryAll || base.categoryLabels[locale].all,
        kitchens: doc.categoryKitchens || base.categoryLabels[locale].kitchens,
        bedrooms: doc.categoryBedrooms || base.categoryLabels[locale].bedrooms,
        wardrobes: doc.categoryWardrobes || base.categoryLabels[locale].wardrobes,
        furniture: doc.categoryFurniture || base.categoryLabels[locale].furniture,
        commercial: doc.categoryCommercial || base.categoryLabels[locale].commercial,
      };
      base.ui[locale] = {
        ...base.ui[locale],
        footerCta: doc.footerCta || base.ui[locale].footerCta,
        footerTagline: doc.footerTagline || base.ui[locale].footerTagline,
        servicesTitle: doc.servicesTitle || base.ui[locale].servicesTitle,
        navTitle: doc.navTitle || base.ui[locale].navTitle,
        contactTitle: doc.contactTitle || base.ui[locale].contactTitle,
        languagesTitle: doc.languagesTitle || base.ui[locale].languagesTitle,
        notFoundTitle: doc.notFoundTitle || base.ui[locale].notFoundTitle,
        notFoundBody: doc.notFoundBody || base.ui[locale].notFoundBody,
        relatedProjects: doc.relatedProjects || base.ui[locale].relatedProjects,
        madeBy: base.ui[locale].madeBy,
        allRightsReserved: base.ui[locale].allRightsReserved,
        demoNotice: base.ui[locale].demoNotice,
        privacy: base.ui[locale].privacy,
        cookies: base.ui[locale].cookies,
        terms: base.ui[locale].terms,
        cookieNotice: base.ui[locale].cookieNotice,
        cookieAccept: base.ui[locale].cookieAccept,
        legalTitle: base.ui[locale].legalTitle,
      };
    }
  }

  return base;
}

export async function fetchBlogPostContent(slug: string): Promise<LocalizedString | null> {
  if (!isSanityConfigured() || !isSafeSlug(slug)) return null;
  const doc = await client.fetch(
    `*[_type == "blogPost" && slug.current == $slug && visible != false][0]{ content }`,
    { slug },
    FETCH_OPTS([REVALIDATE_TAGS.blog, REVALIDATE_TAGS.all]),
  );
  if (!doc?.content) return null;
  return asLocale(doc.content as LocalizedString, Lempty());
}
