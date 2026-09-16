import type { Metadata } from 'next';
import { HowWeWorkView } from '@/components/pages/HowWeWorkView';
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
    path: '/how-we-work',
    brand: content.settings.brandName,
    seo: content.howWeWork.seo,
    fallbackTitle: t(content.howWeWork.title, locale),
    fallbackDescription: t(content.howWeWork.subtitle, locale),
    fallbackImage: content.howWeWork.image,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, content } = await loadLocalePage(params);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: content.nav[locale].home, path: '/' },
          { name: content.nav[locale].howWeWork, path: '/how-we-work' },
        ])}
      />
      <HowWeWorkView locale={locale} content={content} />
    </>
  );
}
