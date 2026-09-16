import { cache } from 'react';
import { LOCALES } from '@/lib/constants';
import { seedContent } from '@/lib/content/seed';
import type { BlogPostItem, SiteContent } from '@/lib/content/types';
import { isSanityConfigured } from '@/lib/sanity/env';
import { isSafeSlug } from '@/lib/i18n/locale';
import { fetchBlogPostContent, fetchSanityContent } from '@/lib/sanity/fetch';

const SANITY_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Single entry for all public pages.
 * Sanity is the primary source when configured.
 * Seed is used only when Sanity is unset, times out, or the fetch fails.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!isSanityConfigured()) {
    return seedContent;
  }

  try {
    const fromCms = await withTimeout(
      fetchSanityContent(),
      SANITY_TIMEOUT_MS,
      '[getSiteContent] Sanity fetch',
    );
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
