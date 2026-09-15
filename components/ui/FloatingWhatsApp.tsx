'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSite } from '@/components/providers/SiteProvider';
import { getWhatsAppLink } from '@/lib/contact';
import { t } from '@/lib/i18n/locale';

export function FloatingWhatsApp() {
  const { locale, nav, settings } = useSite();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  const href = getWhatsAppLink(settings.whatsappE164, t(settings.whatsappMessage, locale));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[calc(1.25rem+var(--cookie-notice-h,0px))] end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1da851] sm:bottom-[calc(1.5rem+var(--cookie-notice-h,0px))] sm:end-6"
      aria-label={nav.whatsapp}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
