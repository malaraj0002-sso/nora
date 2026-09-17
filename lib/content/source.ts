/**
 * Server-only content repository switch.
 * Never expose via NEXT_PUBLIC_* — the browser must not choose the CMS.
 *
 * Default is always `sanity`. Missing or unknown values are treated as sanity
 * so production cannot accidentally require PostgreSQL.
 */
export type ContentSource = 'sanity' | 'postgres';

export function getContentSource(): ContentSource {
  const raw = process.env.CONTENT_SOURCE?.trim().toLowerCase();
  if (raw === 'postgres') return 'postgres';
  return 'sanity';
}
