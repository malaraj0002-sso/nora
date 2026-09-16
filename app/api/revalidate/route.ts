import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { REVALIDATE_TAGS } from '@/lib/constants';

export const runtime = 'nodejs';

const MAX_SECRET_BYTES = 256;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return ip.slice(0, 64);
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || a.length === 0 || a.length > MAX_SECRET_BYTES) return false;
  return timingSafeEqual(a, b);
}

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

const TYPE_TAGS: Record<string, string> = {
  siteSettings: REVALIDATE_TAGS.siteSettings,
  homePage: REVALIDATE_TAGS.home,
  aboutPage: REVALIDATE_TAGS.pages,
  howWeWorkPage: REVALIDATE_TAGS.pages,
  contactPage: REVALIDATE_TAGS.pages,
  faqPage: REVALIDATE_TAGS.pages,
  blogPage: REVALIDATE_TAGS.pages,
  uiLabels: REVALIDATE_TAGS.all,
  service: REVALIDATE_TAGS.services,
  project: REVALIDATE_TAGS.projects,
  material: REVALIDATE_TAGS.materials,
  testimonial: REVALIDATE_TAGS.testimonials,
  blogPost: REVALIDATE_TAGS.blog,
  faqItem: REVALIDATE_TAGS.faq,
};

async function tagsFromBody(request: Request): Promise<string[]> {
  const tags = new Set<string>(Object.values(REVALIDATE_TAGS));
  try {
    const body = (await request.clone().json()) as { _type?: unknown };
    if (typeof body?._type === 'string' && TYPE_TAGS[body._type]) {
      tags.add(TYPE_TAGS[body._type]);
    }
  } catch {
    /* empty or non-JSON webhook body — revalidate everything */
  }
  return [...tags];
}

/**
 * Sanity webhook target: POST with header `x-revalidate-secret`.
 * Empty or missing SANITY_REVALIDATE_SECRET rejects every request (fail closed).
 */
export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ message: 'Too Many Requests' }, { status: 429 });
  }

  const expected = process.env.SANITY_REVALIDATE_SECRET?.trim() ?? '';
  const provided = request.headers.get('x-revalidate-secret') ?? '';

  if (!expected || expected.length > MAX_SECRET_BYTES || provided.length > MAX_SECRET_BYTES) {
    return unauthorized();
  }

  if (!secretMatches(provided, expected)) {
    return unauthorized();
  }

  const extraTags = await tagsFromBody(request);

  revalidateTag(REVALIDATE_TAGS.all);
  for (const tag of extraTags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: true, tags: extraTags, now: Date.now() });
}

export function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'POST' } });
}
