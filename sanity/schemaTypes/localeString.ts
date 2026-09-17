import { defineField, defineType } from 'sanity';

/**
 * Field-level i18n for the public site.
 * Hebrew is the default locale (required). Empty translations fall back to Hebrew on the site.
 * Do not auto-translate proper names (customer names stay a plain string).
 */
export const localeString = defineType({
  name: 'localeString',
  title: 'טקסט רב-לשוני',
  type: 'object',
  fieldsets: [
    {
      name: 'moreLangs',
      title: 'English / Русский',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'he',
      title: 'עברית (ברירת מחדל באתר)',
      type: 'string',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'ar',
      title: 'العربية',
      type: 'string',
      validation: (R) => R.max(200),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      fieldset: 'moreLangs',
      validation: (R) => R.max(200),
    }),
    defineField({
      name: 'ru',
      title: 'Русский',
      type: 'string',
      fieldset: 'moreLangs',
      validation: (R) => R.max(200),
    }),
  ],
});

export const localeText = defineType({
  name: 'localeText',
  title: 'פסקה רב-לשונית',
  type: 'object',
  fieldsets: [
    {
      name: 'moreLangs',
      title: 'English / Русский',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'he',
      title: 'עברית (ברירת מחדל באתר)',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.max(20000),
    }),
    defineField({ name: 'ar', title: 'العربية', type: 'text', rows: 4 }),
    defineField({ name: 'en', title: 'English', type: 'text', rows: 4, fieldset: 'moreLangs' }),
    defineField({ name: 'ru', title: 'Русский', type: 'text', rows: 4, fieldset: 'moreLangs' }),
  ],
});
