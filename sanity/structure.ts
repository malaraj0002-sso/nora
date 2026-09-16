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
import { Overview } from './overview/Overview';

function singleton(S: StructureBuilder, id: string, title: string, icon: typeof HomeIcon) {
  return S.listItem()
    .title(title)
    .id(id)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(id).title(title));
}

function collection(S: StructureBuilder, type: string, title: string, icon: typeof HomeIcon) {
  return S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(S.documentTypeList(type).title(title).defaultOrdering([{ field: 'order', direction: 'asc' }]));
}

/** Desk mirrors the public website. Hebrew labels for the business owner. */
export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('Nora Group')
    .items([
      S.listItem()
        .title('סקירה')
        .id('overview')
        .icon(DashboardIcon)
        .child(S.component(Overview).id('overviewPane').title('סקירה')),
      S.divider(),
      S.listItem()
        .title('האתר')
        .id('website')
        .icon(MasterDetailIcon)
        .child(
          S.list()
            .id('websiteList')
            .title('האתר')
            .items([
              singleton(S, 'homePage', 'דף הבית', HomeIcon),
              singleton(S, 'aboutPage', 'אודות', InfoOutlineIcon),
              collection(S, 'service', 'שירותים', CaseIcon),
              collection(S, 'project', 'פרויקטים', ImagesIcon),
              collection(S, 'material', 'חומרים', EarthGlobeIcon),
              singleton(S, 'howWeWorkPage', 'איך אנחנו עובדים', ControlsIcon),
              collection(S, 'testimonial', 'המלצות', CommentIcon),
              S.listItem()
                .title('שאלות נפוצות')
                .id('faq')
                .icon(DocumentIcon)
                .child(
                  S.list()
                    .id('faqList')
                    .title('שאלות נפוצות')
                    .items([
                      singleton(S, 'faqPage', 'כותרת העמוד', DocumentIcon),
                      S.documentTypeListItem('faqItem').title('שאלות').icon(DocumentIcon),
                    ]),
                ),
              singleton(S, 'contactPage', 'יצירת קשר', UsersIcon),
              S.listItem()
                .title('בלוג')
                .id('blog')
                .icon(DocumentIcon)
                .child(
                  S.list()
                    .id('blogList')
                    .title('בלוג')
                    .items([
                      singleton(S, 'blogPage', 'כותרת העמוד', DocumentIcon),
                      S.documentTypeListItem('blogPost').title('מאמרים').icon(DocumentIcon),
                    ]),
                ),
            ]),
        ),
      S.listItem()
        .title('הגדרות האתר')
        .id('websiteSettings')
        .icon(CogIcon)
        .child(
          S.list()
            .id('websiteSettingsList')
            .title('הגדרות האתר')
            .items([
              singleton(S, 'siteSettings', 'כללי · יצירת קשר · SEO', CogIcon),
              S.documentTypeListItem('uiLabels').title('תפריט וטקסטים').icon(ControlsIcon),
            ]),
        ),
      S.listItem()
        .title('מדיה')
        .id('media')
        .icon(ImagesIcon)
        .child(
          S.documentList()
            .id('mediaAssets')
            .title('מדיה')
            .schemaType('sanity.imageAsset')
            .filter('_type == "sanity.imageAsset"')
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
        ),
    ]);
