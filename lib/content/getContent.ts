import { cache } from 'react';
import { LOCALES } from '@/lib/constants';
import { seedContent } from '@/lib/content/seed';
import type { BlogPostItem, SiteContent } from '@/lib/content/types';
import { isSanityConfigured } from '@/lib/sanity/env';
import { isSafeSlug } from '@/lib/i18n/locale';
import { fetchBlogPostContent, fetchSanityContent } from '@/lib/sanity/fetch';

/**
 * Single entry for all public pages.
 * Sanity is the primary source when configured.
 * Seed is used only when Sanity is unset or the fetch fails.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!isSanityConfigured()) {
    return seedContent;
  }

  try {
    const fromCms = await fetchSanityContent();
    return fromCms ?? seedContent;
  } catch {
    console.error('[getSiteContent] Sanity fetch failed; using seed fallback');
    return seedContent;
  }
});

export const getBlogPost = cache(async (slug: string): Promise<BlogPostItem | null> => {
  if (!isSafeSlug(slug)) return null;

  const site = await getSiteContent();
  const post = site.blogPosts.find((b) => b.visible && b.slug === slug);
  if (!post) return null;

  const hasBody = LOCALES.some((code) => post.content[code]?.trim());
  if (hasBody) return post;

  try {
    const body = await fetchBlogPostContent(slug);
    if (body) return { ...post, content: body };
  } catch {
    console.error('[getBlogPost] body fetch failed; using excerpt');
  }

  return post;
});
