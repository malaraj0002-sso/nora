import { seedContent } from '@/lib/content/seed';
import { getContentSource } from '@/lib/content/source';
import type { BlogPostItem, LocalizedString, SiteContent } from '@/lib/content/types';
import { isSanityConfigured } from '@/lib/sanity/env';
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
 * Future PostgreSQL mapper. Not implemented in Phase 1.
 * Returning null lets the caller keep the existing Sanity + seed path
 * so a stray CONTENT_SOURCE=postgres cannot take production offline.
 */
async function fetchPostgresContent(): Promise<SiteContent | null> {
  console.warn(
    '[content] CONTENT_SOURCE=postgres is not implemented yet; using Sanity (seed if Sanity is unset)',
  );
  return null;
}

async function fetchFromSanity(): Promise<SiteContent | null> {
  if (!isSanityConfigured()) {
    return null;
  }

  try {
    const fromCms = await withTimeout(
      fetchSanityContent(),
      SANITY_TIMEOUT_MS,
      '[getSiteContent] Sanity fetch',
    );
    return fromCms ?? null;
  } catch {
    console.error('[getSiteContent] Sanity fetch failed; using seed fallback');
    return null;
  }
}

/**
 * Published site content. Postgres is a no-op until a later phase.
 * Missing DATABASE_URL must not affect this path — Prisma is not imported here.
 */
export async function loadPublishedContent(): Promise<SiteContent> {
  const source = getContentSource();

  if (source === 'postgres') {
    const fromPostgres = await fetchPostgresContent();
    if (fromPostgres) return fromPostgres;
  }

  const fromSanity = await fetchFromSanity();
  return fromSanity ?? seedContent;
}

export async function loadPublishedBlogBody(slug: string): Promise<LocalizedString | null> {
  try {
    return await fetchBlogPostContent(slug);
  } catch {
    console.error('[getBlogPost] body fetch failed; using excerpt');
    return null;
  }
}

export type { BlogPostItem, SiteContent };
