'use client';

import {CheckmarkIcon, EarthGlobeIcon} from '@sanity/icons';
import {Button, Menu, MenuButton, MenuItem, Stack} from '@sanity/ui';
import {useCallback} from 'react';
import {useLocale, useTranslation} from 'sanity';
import {NORA_STUDIO_NS} from './constants';

type Variant = 'topbar' | 'sidebar';

export function StudioLocaleSwitcher({variant}: {variant: Variant}) {
  const {currentLocale, locales, changeLocale} = useLocale();
  const {t} = useTranslation(NORA_STUDIO_NS);

  const onSelect = useCallback(
    (id: string) => {
      void changeLocale(id);
    },
    [changeLocale],
  );

  if (!locales || locales.length < 2) {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <Stack padding={2} space={1}>
        {locales.map((locale) => (
          <Button
            key={locale.id}
            fontSize={1}
            icon={locale.id === currentLocale.id ? CheckmarkIcon : undefined}
            justify="flex-start"
            mode="bleed"
            onClick={() => onSelect(locale.id)}
            padding={3}
            selected={locale.id === currentLocale.id}
            text={locale.title}
            width="fill"
          />
        ))}
      </Stack>
    );
  }

  return (
    <MenuButton
      button={
        <Button
          fontSize={1}
          icon={EarthGlobeIcon}
          mode="bleed"
          padding={2}
          text={currentLocale.title}
          title={t('language.menu')}
        />
      }
      id="nora-studio-locale-menu"
      menu={
        <Menu>
          {locales.map((locale) => (
            <MenuItem
              key={locale.id}
              fontSize={1}
              icon={locale.id === currentLocale.id ? CheckmarkIcon : undefined}
              onClick={() => onSelect(locale.id)}
              pressed={locale.id === currentLocale.id}
              text={locale.title}
            />
          ))}
        </Menu>
      }
      popover={{placement: 'bottom-end', portal: true}}
    />
  );
}
