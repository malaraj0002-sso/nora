import type { Metadata } from 'next';
import { BlogView } from '@/components/pages/BlogView';
import { JsonLd } from '@/components/seo/JsonLd';
import { loadLocalePage } from '@/lib/i18n/loadPage';
import { t } from '@/lib/i18n/locale';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { resolveCmsSeo } from '@/lib/seo/cms';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale, content } = await loadLocalePage(params);
  return resolveCmsSeo({
    locale,
    path: '/blog',
    brand: content.settings.brandName,
    seo: content.blogPage.seo,
    fallbackTitle: t(content.blogPage.title, locale) || content.nav[locale].blog,
    fallbackDescription: t(content.blogPage.subtitle, locale) || t(content.settings.seoDescription, locale),
    fallbackImage: content.blogPage.image || content.blogPosts.find((b) => b.visible)?.image,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, content } = await loadLocalePage(params);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: content.nav[locale].home, path: '/' },
          { name: content.nav[locale].blog, path: '/blog' },
        ])}
      />
      <BlogView locale={locale} content={content} />
    </>
  );
}
