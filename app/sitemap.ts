import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/constants';
import { getSiteContent } from '@/lib/content/getContent';
import { seedContent } from '@/lib/content/seed';
import { isSafeSlug } from '@/lib/i18n/locale';
import { absoluteUrl, hreflangMap } from '@/lib/seo/urls';

export const revalidate = 3600;

function sitemapDate(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

async function loadSitemapContent() {
  try {
    return await getSiteContent();
  } catch {
    console.error('[sitemap] getSiteContent failed; using seed fallback');
    return seedContent;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadSitemapContent();
  const staticPaths = [
    '/',
    '/about',
    '/services',
    '/projects',
    '/materials',
    '/how-we-work',
    '/testimonials',
    '/blog',
    '/faq',
    '/contact',
    '/privacy',
    '/cookies',
    '/terms',
  ];

  const entityPaths = [
    ...content.services.filter((x) => x.visible && isSafeSlug(x.slug)).map((s) => `/services/${s.slug}`),
    ...content.projects.filter((x) => x.visible && isSafeSlug(x.slug)).map((p) => `/projects/${p.slug}`),
    ...content.blogPosts.filter((x) => x.visible && isSafeSlug(x.slug)).map((b) => `/blog/${b.slug}`),
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      entries.push({
        url: absoluteUrl(locale, path),
        changeFrequency: 'weekly',
        priority: path === '/' ? 1 : path === '/privacy' || path === '/cookies' || path === '/terms' ? 0.3 : 0.7,
        alternates: { languages: hreflangMap(path) },
      });
    }
    for (const path of entityPaths) {
      const blog = content.blogPosts.find((b) => b.visible && `/blog/${b.slug}` === path);
      const lastModified = sitemapDate(blog?.date);
      entries.push({
        url: absoluteUrl(locale, path),
        changeFrequency: 'monthly',
        priority: 0.6,
        ...(lastModified ? { lastModified } : {}),
        alternates: { languages: hreflangMap(path) },
      });
    }
  }

  return entries;
}
