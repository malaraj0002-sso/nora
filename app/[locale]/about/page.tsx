import type { Metadata } from 'next';
import { AboutView } from '@/components/pages/AboutView';
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
    path: '/about',
    brand: content.settings.brandName,
    seo: content.about.seo,
    fallbackTitle: t(content.about.title, locale),
    fallbackDescription: t(content.about.subtitle, locale),
    fallbackImage: content.about.image,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, content } = await loadLocalePage(params);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: content.nav[locale].home, path: '/' },
          { name: content.nav[locale].about, path: '/about' },
        ])}
      />
      <AboutView locale={locale} content={content} />
    </>
  );
}
