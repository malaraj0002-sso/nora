import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogDetailView } from '@/components/pages/BlogDetailView';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBlogPost, getSiteContent } from '@/lib/content/getContent';
import { loadSlugPage } from '@/lib/i18n/loadPage';
import { localeSlugStaticParams } from '@/lib/i18n/staticParams';
import { t } from '@/lib/i18n/locale';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { resolveCmsSeo } from '@/lib/seo/cms';

export async function generateStaticParams() {
  const content = await getSiteContent();
  return localeSlugStaticParams(content.blogPosts.filter((b) => b.visible).map((b) => b.slug));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, content, slug } = await loadSlugPage(params);
  const post = await getBlogPost(slug);
  if (!post) return {};
  return resolveCmsSeo({
    locale,
    path: `/blog/${slug}`,
    brand: content.settings.brandName,
    seo: post.seo,
    fallbackTitle: t(post.title, locale),
    fallbackDescription: t(post.excerpt, locale),
    fallbackImage: post.image,
    ogType: 'article',
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, content, slug } = await loadSlugPage(params);
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const path = `/blog/${slug}`;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: content.nav[locale].home, path: '/' },
          { name: content.nav[locale].blog, path: '/blog' },
          { name: t(post.title, locale), path },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          locale,
          path,
          title: t(post.title, locale),
          description: t(post.excerpt, locale),
          image: post.image,
          date: post.date,
          author: post.author,
        })}
      />
      <BlogDetailView locale={locale} content={content} post={post} />
    </>
  );
}
