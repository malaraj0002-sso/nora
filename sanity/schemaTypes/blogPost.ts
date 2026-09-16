import { defineField, defineType } from 'sanity';
import { seoFields } from './fields';

export const blogPost = defineType({
  name: 'blogPost',
  title: 'בלוג',
  type: 'document',
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
      options: { source: 'title.he' },
      validation: (R) => R.required(),
      readOnly: ({ value }) => Boolean(value?.current),
    }),
    defineField({
      name: 'title',
      title: 'כותרת',
      type: 'localeString',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'excerpt', title: 'תקציר', type: 'localeText', group: 'content' }),
    defineField({
      name: 'content',
      title: 'תוכן',
      type: 'localeText',
      group: 'content',
      description: 'טקסט מלא בכל שפה. פורסם רק אחרי Publish ו־visible.',
    }),
    defineField({ name: 'category', title: 'קטגוריה', type: 'string', group: 'content' }),
    defineField({
      name: 'tags',
      title: 'תגיות',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'author',
      title: 'כותב',
      type: 'string',
      group: 'content',
      initialValue: 'Nora Group',
    }),
    defineField({ name: 'date', title: 'תאריך פרסום', type: 'date', group: 'settings' }),
    defineField({
      name: 'featured',
      title: 'מומלץ',
      type: 'boolean',
      initialValue: false,
      group: 'settings',
    }),
    defineField({
      name: 'visible',
      title: 'מוצג באתר',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
    }),
    defineField({
      name: 'image',
      title: 'תמונת שער',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    ...seoFields('seo'),
  ],
  preview: {
    select: { titleHe: 'title.he', titleAr: 'title.ar', media: 'image', date: 'date', visible: 'visible' },
    prepare: ({ titleHe, titleAr, media, date, visible }) => ({
      title: titleHe || titleAr || 'מאמר',
      subtitle: [date, visible === false ? 'מוסתר' : 'מוצג'].filter(Boolean).join(' · '),
      media,
    }),
  },
});
