'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useSite } from '@/components/providers/SiteProvider';
import {
  readCookieNoticeAccepted,
  writeCookieNoticeAccepted,
} from '@/lib/cookies/notice';

function setNoticeHeight(px: number) {
  document.documentElement.style.setProperty('--cookie-notice-h', `${px}px`);
  document.body.style.paddingBottom = px ? `${px}px` : '';
}

export function CookieNotice() {
  const { ui } = useSite();
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(!readCookieNoticeAccepted());
  }, []);

  useEffect(() => {
    if (!visible) {
      setNoticeHeight(0);
      return;
    }

    const el = barRef.current;
    if (!el) return;

    const apply = () => setNoticeHeight(el.offsetHeight);
    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => {
      observer.disconnect();
      setNoticeHeight(0);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      role="dialog"
      aria-live="polite"
      aria-label={ui.cookies}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold-500/25 bg-charcoal-950/95 text-warm-50 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md"
    >
      <div className="container-luxury flex flex-col items-stretch justify-between gap-4 py-4 sm:flex-row sm:items-center">
        <p className="min-w-0 max-w-2xl text-sm leading-relaxed text-warm-50/85">
          {ui.cookieNotice}{' '}
          <Link href="/cookies" className="font-semibold text-gold-300 underline-offset-2 hover:underline">
            {ui.cookies}
          </Link>
        </p>
        <button
          type="button"
          onClick={() => {
            writeCookieNoticeAccepted();
            setVisible(false);
          }}
          className="min-h-11 shrink-0 self-start rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-gold-600 hover:to-gold-700 active:scale-[0.99] sm:self-auto"
        >
          {ui.cookieAccept}
        </button>
      </div>
    </div>
  );
}
