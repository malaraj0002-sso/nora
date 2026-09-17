import type { Metadata } from 'next';
import { FaqView } from '@/components/pages/FaqView';
import { JsonLd } from '@/components/seo/JsonLd';
import { loadLocalePage } from '@/lib/i18n/loadPage';
import { t } from '@/lib/i18n/locale';
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo/jsonld';
import { resolveCmsSeo } from '@/lib/seo/cms';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale, content } = await loadLocalePage(params);
  return resolveCmsSeo({
    locale,
    path: '/faq',
    brand: content.settings.brandName,
    seo: content.faqPage.seo,
    fallbackTitle: t(content.faqPage.title, locale) || content.nav[locale].faq,
    fallbackDescription: t(content.faqPage.subtitle, locale) || content.ui[locale].footerTagline,
    fallbackImage: content.faqPage.image,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, content } = await loadLocalePage(params);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: content.nav[locale].home, path: '/' },
          { name: content.nav[locale].faq, path: '/faq' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(locale, content.faq)} />
      <FaqView locale={locale} content={content} />
    </>
  );
}
