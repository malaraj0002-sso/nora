import { defineField, defineType } from 'sanity';

export const faqItem = defineType({
  name: 'faqItem',
  title: 'שאלות נפוצות',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'settings', title: 'הגדרות' },
  ],
  fields: [
    defineField({ name: 'category', title: 'קטגוריה', type: 'string', group: 'content' }),
    defineField({
      name: 'question',
      title: 'שאלה',
      type: 'localeString',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'answer',
      title: 'תשובה',
      type: 'localeText',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'order',
      title: 'סדר תצוגה',
      type: 'number',
      initialValue: 0,
      group: 'settings',
    }),
    defineField({
      name: 'visible',
      title: 'מוצג באתר',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
    }),
  ],
  orderings: [{ title: 'סדר תצוגה', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { titleHe: 'question.he', titleAr: 'question.ar', subtitle: 'category' },
    prepare: ({ titleHe, titleAr, subtitle }) => ({
      title: titleHe || titleAr || 'שאלה',
      subtitle,
    }),
  },
});
