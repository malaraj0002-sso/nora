/** Custom Studio UI namespace — not used by the public website. */
export const NORA_STUDIO_NS = 'noraStudio';

export const STUDIO_LOCALE_EN = 'en-US';
export const STUDIO_LOCALE_AR = 'ar-SA';
export const STUDIO_LOCALE_HE = 'he-IL';

export function isRtlStudioLocale(localeId: string): boolean {
  return localeId === STUDIO_LOCALE_AR || localeId === STUDIO_LOCALE_HE;
}
