import { defineField, defineType } from 'sanity';
import { CaseIcon } from '@sanity/icons';
import { seoFields, visibilityFields } from './fields';

export const service = defineType({
  name: 'service',
  title: 'שירותים',
  type: 'document',
  icon: CaseIcon,
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'media', title: 'מדיה' },
    { name: 'settings', title: 'הגדרות' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'settings',
      options: { source: 'title.he', maxLength: 64 },
      validation: (R) => R.required(),
      readOnly: ({ value }) => Boolean(value?.current),
      description: 'מופיע בכתובת. לא ליצור שירותי דלתות — Nora Group לא מייצרת דלתות.',
    }),
    defineField({
      name: 'title',
      title: 'כותרת',
      type: 'localeString',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'description',
      title: 'תיאור קצר',
      type: 'localeText',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'תיאור מלא',
      type: 'localeText',
      group: 'content',
    }),
    defineField({
      name: 'image',
      title: 'תמונה ראשית',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageAlt',
      title: 'טקסט חלופי לתמונה',
      type: 'localeString',
      group: 'media',
    }),
    defineField({
      name: 'gallery',
      title: 'גלריה',
      type: 'array',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'features',
      title: 'יתרונות',
      type: 'array',
      group: 'content',
      of: [{ type: 'localeString' }],
    }),
    ...visibilityFields(),
    ...seoFields('seo'),
  ],
  orderings: [
    { title: 'סדר תצוגה', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'מומלצים', name: 'featured', by: [{ field: 'featured', direction: 'desc' }] },
  ],
  preview: {
    select: { titleHe: 'title.he', titleAr: 'title.ar', media: 'image', visible: 'visible', featured: 'featured' },
    prepare: ({ titleHe, titleAr, media, visible, featured }) => ({
      title: titleHe || titleAr || 'שירות',
      subtitle: [visible === false ? 'מוסתר' : 'מוצג', featured ? 'מומלץ' : ''].filter(Boolean).join(' · '),
      media,
    }),
  },
});
