'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { images } from '@/lib/content/images';
import { mediaSrc } from '@/lib/content/media';

const FALLBACK_SLIDES = [
  images.hero1,
  images.hero2,
  images.hero3,
  images.kitchen2,
  images.wardrobe1,
];

const SLIDE_INTERVAL_MS = 5000;
const FADE_MS = 1400;

export function Hero({
  title,
  subtitle,
  pillars,
  slides,
  whatsapp,
  whatsappLabel,
  viewWorkLabel,
}: {
  title: string;
  subtitle: string;
  pillars: string;
  slides: string[];
  whatsapp: string;
  whatsappLabel: string;
  viewWorkLabel: string;
}) {
  const reduceMotion = useReducedMotion();

  const activeSlides = useMemo(() => {
    const raw = slides && slides.length > 0 ? slides : FALLBACK_SLIDES;
    return raw.map((s) => mediaSrc(s)).filter(Boolean);
  }, [slides]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [outgoingSlide, setOutgoingSlide] = useState<number | null>(null);
  const loadedRef = useRef(new Set<string>());
  const currentRef = useRef(0);
  const slidesRef = useRef(activeSlides);
  currentRef.current = currentSlide;
  slidesRef.current = activeSlides;

  const markLoaded = useCallback((src: string) => {
    loadedRef.current.add(src);
  }, []);

  const goToSlide = useCallback(
    (next: number) => {
      const prev = currentRef.current;
      if (next === prev || next < 0 || next >= activeSlides.length) return;
      if (!reduceMotion) setOutgoingSlide(prev);
      setCurrentSlide(next);
    },
    [activeSlides.length, reduceMotion],
  );

  useEffect(() => {
    setCurrentSlide((prev) => (prev >= activeSlides.length ? 0 : prev));
  }, [activeSlides.length]);

  useEffect(() => {
    if (outgoingSlide === null) return;
    const timer = window.setTimeout(() => setOutgoingSlide(null), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [outgoingSlide, currentSlide]);

  useEffect(() => {
    if (reduceMotion || activeSlides.length < 2) return;

    let timeoutId = 0;
    let waitingSince: number | null = null;

    const schedule = (ms: number) => {
      timeoutId = window.setTimeout(tick, ms);
    };

    const tick = () => {
      const list = slidesRef.current;
      const prev = currentRef.current;
      const next = (prev + 1) % list.length;
      const nextSrc = list[next];
      const ready = !nextSrc || loadedRef.current.has(nextSrc);

      if (!ready) {
        if (waitingSince === null) waitingSince = Date.now();
        if (Date.now() - waitingSince < 2000) {
          schedule(250);
          return;
        }
      }

      waitingSince = null;
      goToSlide(next);
      schedule(SLIDE_INTERVAL_MS);
    };

    schedule(SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion, activeSlides.length, goToSlide]);

  const fadeUp = (delay: number) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden pb-16 pt-28 sm:min-h-screen sm:pb-24 sm:pt-32 bg-charcoal-950">
      
      {/* خلفية السلايدر بألوان الصور الأصلية 100% */}
      <div className="pointer-events-none absolute inset-0">
        {activeSlides.map((src, idx) => {
          const isCurrent = idx === currentSlide;
          const isOutgoing = idx === outgoingSlide;
          const visible = isCurrent || isOutgoing;
          return (
            <div
              key={`${idx}-${src}`}
              className="absolute inset-0"
              style={{
                opacity: visible ? 1 : 0,
                zIndex: isCurrent ? 2 : isOutgoing ? 1 : 0,
                transition: reduceMotion ? 'none' : `opacity ${FADE_MS}ms ease-in-out`,
              }}
              aria-hidden={!isCurrent}
            >
              <Image
                src={src}
                alt=""
                fill
                priority={idx === 0}
                loading={idx === 0 ? undefined : 'eager'}
                className="object-cover object-center"
                sizes="100vw"
                onLoad={() => markLoaded(src)}
              />
            </div>
          );
        })}

        {/* تعتيم خفيف جداً يغطي فقط المنطقة السفلى خلف النصوص دون التغطية على ألوان باقي الصورة */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-charcoal-950/70 via-charcoal-950/20 to-transparent" />
      </div>

      {/* المحتوى النصي مع حماية الوضوح عبر drop-shadow */}
      <div className="container-luxury relative z-10 max-w-4xl">
        <motion.p className="heading-eyebrow-light drop-shadow" {...fadeUp(0.08)}>
          {pillars}
        </motion.p>
        <motion.h1
          className="text-hero text-balance font-bold text-warm-50 drop-shadow-md"
          {...fadeUp(0.2)}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mt-5 max-w-2xl text-base leading-relaxed text-warm-50 sm:text-lg lg:text-xl drop-shadow"
          {...fadeUp(0.34)}
        >
          {subtitle}
        </motion.p>

        {/* أزرار الدعوة للعمل */}
        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          {...fadeUp(0.48)}
        >
          <motion.a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp shadow-md"
            whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <span className="min-w-0">{whatsappLabel}</span>
          </motion.a>
          <Link
            href="/projects"
            className="btn-secondary border-warm-50 text-warm-50 hover:bg-warm-50 hover:text-charcoal-900 shadow-md"
          >
            {viewWorkLabel}
          </Link>
        </motion.div>

        {/* مؤشرات التنقل بين الصور (Dots) */}
        {activeSlides.length > 1 && (
          <div className="mt-12 flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 pointer-events-auto ${
                  idx === currentSlide
                    ? 'w-8 bg-gold-400'
                    : 'w-2 bg-warm-50/50 hover:bg-warm-50/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
