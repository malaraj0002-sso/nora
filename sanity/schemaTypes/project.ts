import { defineField, defineType } from 'sanity';
import { ImagesIcon } from '@sanity/icons';
import { seoFields, visibilityFields } from './fields';

export const project = defineType({
  name: 'project',
  title: 'פרויקטים',
  type: 'document',
  icon: ImagesIcon,
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
      options: { source: 'title.he', maxLength: 80 },
      validation: (R) => R.required(),
      readOnly: ({ value }) => Boolean(value?.current),
    }),
    defineField({
      name: 'title',
      title: 'שם הפרויקט',
      type: 'localeString',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'description', title: 'תיאור', type: 'localeText', group: 'content' }),
    defineField({
      name: 'category',
      title: 'קטגוריה',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'מטבחים', value: 'kitchens' },
          { title: 'חדרי שינה', value: 'bedrooms' },
          { title: 'ארונות', value: 'wardrobes' },
          { title: 'ריהוט', value: 'furniture' },
          { title: 'מסחרי', value: 'commercial' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'location',
      title: 'מיקום',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'completedAt',
      title: 'תאריך השלמה',
      type: 'date',
      group: 'content',
    }),
    defineField({
      name: 'gallery',
      title: 'גלריה',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'localeString', title: 'טקסט חלופי' }],
        },
      ],
      validation: (R) => R.min(1),
    }),
    defineField({
      name: 'materials',
      title: 'חומרים (slug, לדוגמה mdf)',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      description: 'התאימו ל־slug של מסמך חומר כדי להציג את השם המתורגם באתר.',
    }),
    ...visibilityFields(),
    ...seoFields('seo'),
  ],
  orderings: [{ title: 'סדר תצוגה', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { titleHe: 'title.he', titleAr: 'title.ar', media: 'gallery.0', category: 'category', featured: 'featured' },
    prepare: ({ titleHe, titleAr, media, category, featured }) => ({
      title: titleHe || titleAr || 'פרויקט',
      subtitle: [category, featured ? 'מומלץ' : ''].filter(Boolean).join(' · '),
      media,
    }),
  },
});
