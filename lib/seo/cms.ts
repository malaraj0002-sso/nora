import type { AppLocale } from '@/lib/constants';
import type { PageSeo } from '@/lib/content/types';
import { t } from '@/lib/i18n/locale';
import { brandedTitle, buildPageMetadata } from '@/lib/seo/metadata';

export function resolveCmsSeo({
  locale,
  path,
  brand,
  seo,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  ogType,
}: {
  locale: AppLocale;
  path: string;
  brand: string;
  seo?: PageSeo;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImage?: string;
  ogType?: 'website' | 'article';
}) {
  const title = t(seo?.title, locale) || fallbackTitle;
  const description = t(seo?.description, locale) || fallbackDescription;
  return buildPageMetadata({
    locale,
    path,
    title: brandedTitle(title, brand),
    description,
    image: seo?.image || fallbackImage,
    ogType,
  });
}
