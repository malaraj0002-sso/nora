import { defineField } from 'sanity';

/** Shared SEO fields — canonical URLs stay computed by the Next.js site. */
export const seoFieldGroup = { name: 'seo', title: 'SEO' } as const;

export function seoFields(group = 'seo') {
  return [
    defineField({
      name: 'seoTitle',
      title: 'כותרת SEO',
      type: 'localeString',
      group,
      description: 'אם ריק, האתר משתמש בכותרת העמוד.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'תיאור SEO',
      type: 'localeText',
      group,
      description: 'מומלץ עד כ־160 תווים. אם ריק, האתר משתמש בתיאור העמוד.',
    }),
    defineField({
      name: 'seoImage',
      title: 'תמונת שיתוף',
      type: 'image',
      group,
      options: { hotspot: true },
      description: 'Open Graph / רשתות חברתיות. אם ריק, האתר משתמש בתמונה הראשית.',
    }),
  ];
}

export function visibilityFields() {
  return [
    defineField({
      name: 'order',
      title: 'סדר תצוגה',
      type: 'number',
      initialValue: 0,
      description: 'מספר נמוך יותר מופיע קודם.',
      group: 'settings',
    }),
    defineField({
      name: 'featured',
      title: 'מומלץ / בעמוד הבית',
      type: 'boolean',
      initialValue: false,
      group: 'settings',
    }),
    defineField({
      name: 'visible',
      title: 'מוצג באתר',
      type: 'boolean',
      initialValue: true,
      description: 'כיבוי מסתיר מהאתר בלי למחוק. טיוטות של Sanity לא מתפרסמות בכל מקרה.',
      group: 'settings',
    }),
  ];
}
