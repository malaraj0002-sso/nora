'use client';

import type {FieldProps} from 'sanity';
import {useTranslation} from 'sanity';
import {NORA_STUDIO_NS} from './constants';
import {studioUiTitleKey} from './schemaUi';

/**
 * Form fields render `props.title` (the field label), not the shared type title.
 * Translate that label with the same Studio i18n catalog used by structure/groups.
 */
export function StudioFormField(props: FieldProps) {
  const {t} = useTranslation(NORA_STUDIO_NS);
  const raw = typeof props.title === 'string' ? props.title : undefined;
  const key = raw ? studioUiTitleKey(raw) : undefined;
  const title = key ? t(key, {ns: NORA_STUDIO_NS, defaultValue: props.title}) : props.title;

  return props.renderDefault({...props, title});
}
