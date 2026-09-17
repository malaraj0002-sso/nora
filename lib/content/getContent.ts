import { cache } from 'react';
import { LOCALES } from '@/lib/constants';
import { loadPublishedBlogBody, loadPublishedContent } from '@/lib/content/repository';
import type { BlogPostItem, SiteContent } from '@/lib/content/types';
import { isSafeSlug } from '@/lib/i18n/locale';

/**
 * Single entry for all public pages.
 * CONTENT_SOURCE defaults to sanity. Seed is used only when the repository
 * has no published document set (Sanity unset, timeout, or fetch failure).
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  return loadPublishedContent();
});

export const getBlogPost = cache(async (slug: string): Promise<BlogPostItem | null> => {
  if (!isSafeSlug(slug)) return null;

  const site = await getSiteContent();
  const post = site.blogPosts.find((b) => b.visible && b.slug === slug);
  if (!post) return null;

  const hasBody = LOCALES.some((code) => post.content[code]?.trim());
  if (hasBody) return post;

  const body = await loadPublishedBlogBody(slug);
  if (body) return { ...post, content: body };

  return post;
});
