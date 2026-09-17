'use client';

import {useEffect} from 'react';
import type {LayoutProps} from 'sanity';
import {useLocale} from 'sanity';
import {isRtlStudioLocale} from './constants';

/**
 * Syncs the Studio document language/direction with Sanity's current UI locale.
 * Sanity 3.x does not apply RTL automatically for Arabic/Hebrew.
 */
export function StudioI18nLayout(props: LayoutProps) {
  const {currentLocale} = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = currentLocale.id;
    root.dir = isRtlStudioLocale(currentLocale.id) ? 'rtl' : 'ltr';
  }, [currentLocale.id]);

  return props.renderDefault(props);
}
