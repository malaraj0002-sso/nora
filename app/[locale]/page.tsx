import type { Metadata } from 'next';
import { HomeView } from '@/components/home/HomeView';
import { JsonLd } from '@/components/seo/JsonLd';
import { loadLocalePage } from '@/lib/i18n/loadPage';
import { t } from '@/lib/i18n/locale';
import { resolveCmsSeo } from '@/lib/seo/cms';
import { localBusinessGraph } from '@/lib/seo/jsonld';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale, content } = await loadLocalePage(params);
  return resolveCmsSeo({
    locale,
    path: '/',
    brand: content.settings.brandName,
    seo: {
      title: content.home.seo?.title || content.settings.seoTitle,
      description: content.home.seo?.description || content.settings.seoDescription,
      image: content.home.seo?.image || content.settings.seoImage,
    },
    fallbackTitle: t(content.settings.seoTitle, locale),
    fallbackDescription: t(content.settings.seoDescription, locale),
    fallbackImage: content.home.heroImages[0] || content.settings.logoUrl,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, content } = await loadLocalePage(params);
  return (
    <>
      <JsonLd data={localBusinessGraph(content, locale)} />
      <HomeView locale={locale} content={content} />
    </>
  );
}
