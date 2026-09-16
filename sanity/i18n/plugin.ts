import {
  defineLocale,
  defineLocaleResourceBundle,
  definePlugin,
} from 'sanity';
import {
  NORA_STUDIO_NS,
  STUDIO_LOCALE_AR,
  STUDIO_LOCALE_EN,
  STUDIO_LOCALE_HE,
} from './constants';
import {noraStudioAr, noraStudioEn, noraStudioHe} from './resources/noraStudio';

const arSALocale = defineLocale({
  id: STUDIO_LOCALE_AR,
  title: 'العربية',
  weekInfo: {
    firstDay: 6,
    weekend: [5, 6],
    minimalDays: 1,
  },
  bundles: [
    {namespace: 'studio', resources: () => import('./resources/studioAr')},
    {namespace: 'structure', resources: () => import('./resources/structureAr')},
    {namespace: 'validation', resources: () => import('./resources/validationAr')},
  ],
});

const heILLocale = defineLocale({
  id: STUDIO_LOCALE_HE,
  title: 'עברית',
  weekInfo: {
    firstDay: 7,
    weekend: [5, 6],
    minimalDays: 1,
  },
  bundles: [
    {namespace: 'studio', resources: () => import('./resources/studioHe')},
    {namespace: 'structure', resources: () => import('./resources/structureHe')},
    {namespace: 'validation', resources: () => import('./resources/validationHe')},
  ],
});

const noraStudioBundles = [
  defineLocaleResourceBundle({
    locale: STUDIO_LOCALE_EN,
    namespace: NORA_STUDIO_NS,
    resources: noraStudioEn,
  }),
  defineLocaleResourceBundle({
    locale: STUDIO_LOCALE_AR,
    namespace: NORA_STUDIO_NS,
    resources: noraStudioAr,
  }),
  defineLocaleResourceBundle({
    locale: STUDIO_LOCALE_HE,
    namespace: NORA_STUDIO_NS,
    resources: noraStudioHe,
  }),
];

/**
 * Official Sanity i18n plugin: English (built-in), Arabic, and Hebrew.
 * Hebrew is registered last so it remains the default when no preference is stored.
 */
export const noraStudioLocales = definePlugin({
  name: 'nora-studio-locales',
  i18n: {
    locales: (prev) => {
      const withoutCustom = prev.filter(
        (locale) => locale.id !== STUDIO_LOCALE_AR && locale.id !== STUDIO_LOCALE_HE,
      );
      return [
        ...withoutCustom.map((locale) =>
          locale.id === STUDIO_LOCALE_EN ? {...locale, title: 'English'} : locale,
        ),
        arSALocale,
        heILLocale,
      ];
    },
    bundles: noraStudioBundles,
  },
});
