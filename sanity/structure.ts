import {
  CaseIcon,
  CogIcon,
  CommentIcon,
  ControlsIcon,
  DashboardIcon,
  DocumentIcon,
  EarthGlobeIcon,
  HomeIcon,
  ImagesIcon,
  InfoOutlineIcon,
  MasterDetailIcon,
  UsersIcon,
} from '@sanity/icons';
import type { StructureBuilder, StructureResolver } from 'sanity/structure';
import { NORA_STUDIO_NS } from './i18n/constants';
import { Overview } from './overview/Overview';

function titleI18n(key: string) {
  return { title: { key, ns: NORA_STUDIO_NS } };
}

function singleton(
  S: StructureBuilder,
  id: string,
  title: string,
  icon: typeof HomeIcon,
  key: string,
) {
  return S.listItem()
    .title(title)
    .i18n(titleI18n(key))
    .id(id)
    .icon(icon)
    .child(
      S.document()
        .schemaType(id)
        .documentId(id)
        .title(title)
        .i18n(titleI18n(key)),
    );
}

function collection(
  S: StructureBuilder,
  type: string,
  title: string,
  icon: typeof HomeIcon,
  key: string,
) {
  return S.listItem()
    .title(title)
    .i18n(titleI18n(key))
    .id(type)
    .icon(icon)
    .child(
      S.documentTypeList(type)
        .title(title)
        .i18n(titleI18n(key))
        .defaultOrdering([{ field: 'order', direction: 'asc' }]),
    );
}

/** Desk mirrors the public website. Labels follow the Studio UI language. */
export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('Nora Group')
    .items([
      S.listItem()
        .title('סקירה')
        .i18n(titleI18n('structure.overview'))
        .id('overview')
        .icon(DashboardIcon)
        .child(
          S.component(Overview)
            .id('overviewPane')
            .title('סקירה')
            .i18n(titleI18n('structure.overview')),
        ),
      S.divider(),
      S.listItem()
        .title('האתר')
        .i18n(titleI18n('structure.website'))
        .id('website')
        .icon(MasterDetailIcon)
        .child(
          S.list()
            .id('websiteList')
            .title('האתר')
            .i18n(titleI18n('structure.website'))
            .items([
              singleton(S, 'homePage', 'דף הבית', HomeIcon, 'structure.home'),
              singleton(S, 'aboutPage', 'אודות', InfoOutlineIcon, 'structure.about'),
              collection(S, 'service', 'שירותים', CaseIcon, 'structure.services'),
              collection(S, 'project', 'פרויקטים', ImagesIcon, 'structure.projects'),
              collection(S, 'material', 'חומרים', EarthGlobeIcon, 'structure.materials'),
              singleton(S, 'howWeWorkPage', 'איך אנחנו עובדים', ControlsIcon, 'structure.howWeWork'),
              collection(S, 'testimonial', 'המלצות', CommentIcon, 'structure.testimonials'),
              S.listItem()
                .title('שאלות נפוצות')
                .i18n(titleI18n('structure.faq'))
                .id('faq')
                .icon(DocumentIcon)
                .child(
                  S.list()
                    .id('faqList')
                    .title('שאלות נפוצות')
                    .i18n(titleI18n('structure.faq'))
                    .items([
                      singleton(S, 'faqPage', 'כותרת העמוד', DocumentIcon, 'structure.faqPage'),
                      S.listItem()
                        .title('שאלות')
                        .i18n(titleI18n('structure.faqItems'))
                        .id('faqItem')
                        .icon(DocumentIcon)
                        .child(
                          S.documentTypeList('faqItem')
                            .title('שאלות')
                            .i18n(titleI18n('structure.faqItems')),
                        ),
                    ]),
                ),
              singleton(S, 'contactPage', 'יצירת קשר', UsersIcon, 'structure.contact'),
              S.listItem()
                .title('בלוג')
                .i18n(titleI18n('structure.blog'))
                .id('blog')
                .icon(DocumentIcon)
                .child(
                  S.list()
                    .id('blogList')
                    .title('בלוג')
                    .i18n(titleI18n('structure.blog'))
                    .items([
                      singleton(S, 'blogPage', 'כותרת העמוד', DocumentIcon, 'structure.blogPage'),
                      S.listItem()
                        .title('מאמרים')
                        .i18n(titleI18n('structure.blogPosts'))
                        .id('blogPost')
                        .icon(DocumentIcon)
                        .child(
                          S.documentTypeList('blogPost')
                            .title('מאמרים')
                            .i18n(titleI18n('structure.blogPosts')),
                        ),
                    ]),
                ),
            ]),
        ),
      S.listItem()
        .title('הגדרות האתר')
        .i18n(titleI18n('structure.websiteSettings'))
        .id('websiteSettings')
        .icon(CogIcon)
        .child(
          S.list()
            .id('websiteSettingsList')
            .title('הגדרות האתר')
            .i18n(titleI18n('structure.websiteSettings'))
            .items([
              singleton(S, 'siteSettings', 'כללי · יצירת קשר · SEO', CogIcon, 'structure.siteSettings'),
              S.listItem()
                .title('תפריט וטקסטים')
                .i18n(titleI18n('structure.uiLabels'))
                .id('uiLabels')
                .icon(ControlsIcon)
                .child(
                  S.documentTypeList('uiLabels')
                    .title('תפריט וטקסטים')
                    .i18n(titleI18n('structure.uiLabels')),
                ),
            ]),
        ),
      S.listItem()
        .title('מדיה')
        .i18n(titleI18n('structure.media'))
        .id('media')
        .icon(ImagesIcon)
        .child(
          S.documentList()
            .id('mediaAssets')
            .title('מדיה')
            .i18n(titleI18n('structure.media'))
            .schemaType('sanity.imageAsset')
            .filter('_type == "sanity.imageAsset"')
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
        ),
    ]);
