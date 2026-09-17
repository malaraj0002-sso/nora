import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetailView } from '@/components/pages/ProjectDetailView';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSiteContent } from '@/lib/content/getContent';
import { loadSlugPage } from '@/lib/i18n/loadPage';
import { localeSlugStaticParams } from '@/lib/i18n/staticParams';
import { t } from '@/lib/i18n/locale';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { resolveCmsSeo } from '@/lib/seo/cms';

export async function generateStaticParams() {
  const content = await getSiteContent();
  return localeSlugStaticParams(content.projects.filter((p) => p.visible).map((p) => p.slug));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, content, slug } = await loadSlugPage(params);
  const project = content.projects.find((p) => p.visible && p.slug === slug);
  if (!project) return {};
  return resolveCmsSeo({
    locale,
    path: `/projects/${slug}`,
    brand: content.settings.brandName,
    seo: project.seo,
    fallbackTitle: t(project.title, locale),
    fallbackDescription: t(project.description, locale),
    fallbackImage: project.images[0],
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, content, slug } = await loadSlugPage(params);
  const project = content.projects.find((p) => p.visible && p.slug === slug);
  if (!project) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: content.nav[locale].home, path: '/' },
          { name: content.nav[locale].projects, path: '/projects' },
          { name: t(project.title, locale), path: `/projects/${slug}` },
        ])}
      />
      <ProjectDetailView locale={locale} content={content} slug={slug} />
    </>
  );
}
