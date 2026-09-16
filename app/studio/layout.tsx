import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from 'next-sanity/studio';
import { projectId } from '@/sanity/env';

export const metadata: Metadata = {
  ...studioMetadata,
  title: 'Nora Group Studio',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  ...studioViewport,
  interactiveWidget: 'resizes-content',
};

const studioLocaleBoot = `(function(){try{var loc=localStorage.getItem(${JSON.stringify(`sanity-locale:${projectId}:default`)});if(!loc)return;var rtl=loc.indexOf("he")===0||loc.indexOf("ar")===0;document.documentElement.lang=loc;document.documentElement.dir=rtl?"rtl":"ltr";}catch(e){}})();`;

/**
 * Isolated document shell for Studio — no site Header/Footer/Tailwind globals.
 * Default Hebrew/RTL matches Sanity's last registered locale; the boot script
 * applies a stored Studio UI language before paint.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0 }}>
        <script dangerouslySetInnerHTML={{ __html: studioLocaleBoot }} />
        {children}
      </body>
    </html>
  );
}
