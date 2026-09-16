'use client';

import {Box, Flex} from '@sanity/ui';
import type {NavbarProps} from 'sanity';
import {StudioLocaleSwitcher} from './StudioLocaleSwitcher';

/** Keeps Sanity's default navbar and adds a compact native language control. */
export function StudioNavbar(props: NavbarProps) {
  return (
    <Flex align="stretch">
      <Box flex={1}>
        {props.renderDefault({
          ...props,
          __internal_actions: [
            ...(props.__internal_actions ?? []),
            {
              location: 'sidebar',
              name: 'nora-studio-locale-sidebar',
              render: () => <StudioLocaleSwitcher variant="sidebar" />,
            },
          ],
        })}
      </Box>
      <Flex
        align="center"
        paddingX={2}
        style={{background: 'var(--card-bg-color)', borderBottom: '1px solid var(--card-border-color)'}}
      >
        <StudioLocaleSwitcher variant="topbar" />
      </Flex>
    </Flex>
  );
}
