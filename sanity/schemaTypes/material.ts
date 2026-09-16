import { defineField, defineType } from 'sanity';
import { visibilityFields } from './fields';

export const material = defineType({
  name: 'material',
  title: 'חומרים',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'media', title: 'מדיה' },
    { name: 'settings', title: 'הגדרות' },
  ],
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'settings',
      options: { source: 'name.he' },
      validation: (R) => R.required(),
      readOnly: ({ value }) => Boolean(value?.current),
    }),
    defineField({
      name: 'name',
      title: 'שם',
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
          { title: 'עץ / ציפוי', value: 'wood' },
          { title: 'לוחות', value: 'boards' },
          { title: 'משטחים', value: 'surfaces' },
          { title: 'מתכת / זכוכית', value: 'other' },
        ],
      },
    }),
    defineField({ name: 'characteristics', title: 'מאפיינים', type: 'localeText', group: 'content' }),
    defineField({ name: 'applications', title: 'שימושים', type: 'localeText', group: 'content' }),
    defineField({ name: 'finishes', title: 'גימורים', type: 'localeText', group: 'content' }),
    defineField({
      name: 'image',
      title: 'תמונה',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    ...visibilityFields(),
  ],
  orderings: [{ title: 'סדר תצוגה', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { titleHe: 'name.he', titleAr: 'name.ar', media: 'image', featured: 'featured' },
    prepare: ({ titleHe, titleAr, media, featured }) => ({
      title: titleHe || titleAr || 'חומר',
      subtitle: featured ? 'מומלץ' : '',
      media,
    }),
  },
});
