import { defineField, defineType } from 'sanity';
import { visibilityFields } from './fields';

export const testimonial = defineType({
  name: 'testimonial',
  title: 'המלצות',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'media', title: 'מדיה' },
    { name: 'settings', title: 'הגדרות' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'שם הלקוח',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
      description: 'שם פרטי — לא מתורגם אוטומטית.',
    }),
    defineField({
      name: 'rating',
      title: 'דירוג',
      type: 'number',
      group: 'content',
      validation: (R) => R.min(1).max(5).required(),
      initialValue: 5,
    }),
    defineField({
      name: 'review',
      title: 'המלצה',
      type: 'localeText',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'project', title: 'סוג הפרויקט', type: 'localeString', group: 'content' }),
    defineField({
      name: 'image',
      title: 'תמונה / אווטאר',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    ...visibilityFields(),
  ],
  preview: {
    select: { title: 'name', subtitle: 'project.he' },
  },
});
