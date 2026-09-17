import { defineField, defineType } from 'sanity';
import { seoFields } from './fields';

const pageHeroFields = [
  defineField({ name: 'eyebrow', title: 'שורה עליונה', type: 'localeString', group: 'content' }),
  defineField({ name: 'title', title: 'כותרת', type: 'localeString', group: 'content' }),
  defineField({ name: 'subtitle', title: 'תת-כותרת', type: 'localeText', group: 'content' }),
  defineField({
    name: 'image',
    title: 'תמונת רקע',
    type: 'image',
    options: { hotspot: true },
    group: 'media',
  }),
];

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'אודות',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'media', title: 'מדיה' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    ...pageHeroFields,
    defineField({ name: 'body', title: 'תיאור החברה', type: 'localeText', group: 'content' }),
    defineField({
      name: 'mission',
      title: 'ייעוד',
      type: 'localeText',
      group: 'content',
      description: 'מוצג בעמוד האודות אם מולא.',
    }),
    defineField({
      name: 'vision',
      title: 'חזון',
      type: 'localeText',
      group: 'content',
      description: 'מוצג בעמוד האודות אם מולא.',
    }),
    defineField({ name: 'valuesTitle', title: 'כותרת ערכים', type: 'localeString', group: 'content' }),
    defineField({
      name: 'values',
      title: 'ערכים',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'localeString', title: 'כותרת' },
            { name: 'desc', type: 'localeText', title: 'תיאור' },
          ],
          preview: { select: { title: 'title.he' } },
        },
      ],
    }),
    ...seoFields('seo'),
  ],
  preview: { prepare: () => ({ title: 'אודות' }) },
});

export const howWeWorkPage = defineType({
  name: 'howWeWorkPage',
  title: 'איך אנחנו עובדים',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'media', title: 'מדיה' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    ...pageHeroFields,
    defineField({
      name: 'steps',
      title: 'שלבים',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'number', type: 'string', title: 'מספר', description: 'לדוגמה 01' },
            { name: 'title', type: 'localeString', title: 'כותרת' },
            { name: 'description', type: 'localeText', title: 'תיאור' },
            {
              name: 'image',
              type: 'image',
              title: 'תמונה / אייקון',
              options: { hotspot: true },
            },
          ],
          preview: { select: { title: 'title.he', subtitle: 'number', media: 'image' } },
        },
      ],
    }),
    ...seoFields('seo'),
  ],
  preview: { prepare: () => ({ title: 'איך אנחנו עובדים' }) },
});

export const contactPage = defineType({
  name: 'contactPage',
  title: 'יצירת קשר',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'media', title: 'מדיה' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    ...pageHeroFields,
    defineField({
      name: 'note',
      title: 'הערה לעורכים',
      type: 'string',
      group: 'content',
      readOnly: true,
      initialValue: 'טלפון, וואטסאפ, אימייל וכתובת נערכים ב«הגדרות האתר». אין טופס הצעת מחיר.',
    }),
    ...seoFields('seo'),
  ],
  preview: { prepare: () => ({ title: 'יצירת קשר' }) },
});

export const faqPage = defineType({
  name: 'faqPage',
  title: 'שאלות נפוצות — כותרת העמוד',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'media', title: 'מדיה' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [...pageHeroFields, ...seoFields('seo')],
  preview: { prepare: () => ({ title: 'שאלות נפוצות — עמוד' }) },
});

export const blogPage = defineType({
  name: 'blogPage',
  title: 'בלוג — כותרת העמוד',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'media', title: 'מדיה' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [...pageHeroFields, ...seoFields('seo')],
  preview: { prepare: () => ({ title: 'בלוג — עמוד' }) },
});

export const uiLabels = defineType({
  name: 'uiLabels',
  title: 'תפריט וטקסטים',
  type: 'document',
  groups: [
    { name: 'nav', title: 'ניווט', default: true },
    { name: 'actions', title: 'כפתורים' },
    { name: 'footer', title: 'פוטר' },
    { name: 'categories', title: 'קטגוריות פרויקטים' },
  ],
  fields: [
    defineField({
      name: 'locale',
      title: 'שפה',
      type: 'string',
      group: 'nav',
      options: {
        list: [
          { title: 'עברית', value: 'he' },
          { title: 'العربية', value: 'ar' },
          { title: 'English', value: 'en' },
          { title: 'Русский', value: 'ru' },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'home', type: 'string', title: 'דף הבית', group: 'nav' }),
    defineField({ name: 'about', type: 'string', title: 'אודות', group: 'nav' }),
    defineField({ name: 'services', type: 'string', title: 'שירותים', group: 'nav' }),
    defineField({ name: 'projects', type: 'string', title: 'פרויקטים', group: 'nav' }),
    defineField({ name: 'materials', type: 'string', title: 'חומרים', group: 'nav' }),
    defineField({ name: 'howWeWork', type: 'string', title: 'איך אנחנו עובדים', group: 'nav' }),
    defineField({ name: 'testimonials', type: 'string', title: 'המלצות', group: 'nav' }),
    defineField({ name: 'blog', type: 'string', title: 'בלוג', group: 'nav' }),
    defineField({ name: 'faq', type: 'string', title: 'שאלות נפוצות', group: 'nav' }),
    defineField({ name: 'contact', type: 'string', title: 'יצירת קשר', group: 'nav' }),
    defineField({ name: 'callUs', type: 'string', title: 'התקשרו אלינו', group: 'actions' }),
    defineField({ name: 'whatsapp', type: 'string', title: 'וואטסאפ', group: 'actions' }),
    defineField({ name: 'viewWork', type: 'string', title: 'צפו בעבודות', group: 'actions' }),
    defineField({ name: 'learnMore', type: 'string', title: 'למידע נוסף', group: 'actions' }),
    defineField({ name: 'viewAll', type: 'string', title: 'הצג הכול', group: 'actions' }),
    defineField({ name: 'viewProject', type: 'string', title: 'צפו בפרויקט', group: 'actions' }),
    defineField({ name: 'readMore', type: 'string', title: 'קראו עוד', group: 'actions' }),
    defineField({ name: 'backHome', type: 'string', title: 'חזרה לדף הבית', group: 'actions' }),
    defineField({ name: 'all', type: 'string', title: 'הכול', group: 'actions' }),
    defineField({ name: 'footerCta', type: 'string', title: 'קריאה בפוטר', group: 'footer' }),
    defineField({ name: 'footerTagline', type: 'text', title: 'סלוגן בפוטר', group: 'footer' }),
    defineField({ name: 'servicesTitle', type: 'string', title: 'כותרת שירותים בפוטר', group: 'footer' }),
    defineField({ name: 'navTitle', type: 'string', title: 'כותרת ניווט בפוטר', group: 'footer' }),
    defineField({ name: 'contactTitle', type: 'string', title: 'כותרת יצירת קשר בפוטר', group: 'footer' }),
    defineField({ name: 'languagesTitle', type: 'string', title: 'כותרת שפות', group: 'footer' }),
    defineField({ name: 'notFoundTitle', type: 'string', title: 'כותרת 404', group: 'footer' }),
    defineField({ name: 'notFoundBody', type: 'text', title: 'טקסט 404', group: 'footer' }),
    defineField({ name: 'relatedProjects', type: 'string', title: 'פרויקטים קשורים', group: 'footer' }),
    defineField({ name: 'categoryAll', type: 'string', title: 'קטגוריה: הכול', group: 'categories' }),
    defineField({ name: 'categoryKitchens', type: 'string', title: 'קטגוריה: מטבחים', group: 'categories' }),
    defineField({ name: 'categoryBedrooms', type: 'string', title: 'קטגוריה: חדרי שינה', group: 'categories' }),
    defineField({ name: 'categoryWardrobes', type: 'string', title: 'קטגוריה: ארונות', group: 'categories' }),
    defineField({ name: 'categoryFurniture', type: 'string', title: 'קטגוריה: ריהוט', group: 'categories' }),
    defineField({ name: 'categoryCommercial', type: 'string', title: 'קטגוריה: מסחרי', group: 'categories' }),
  ],
  preview: {
    select: { locale: 'locale' },
    prepare: ({ locale }) => ({ title: `תפריט וטקסטים — ${locale || '?'}` }),
  },
});
