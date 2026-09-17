import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { mediaSrc } from '@/lib/content/media';

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image?: string;
}) {
  return (
    <section className="relative flex min-h-[240px] items-center overflow-hidden pb-16 pt-28 sm:min-h-[300px] sm:pb-20 sm:pt-32">
      {image ? (
        <>
          <Image
            src={mediaSrc(image)}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-charcoal-950/70" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900 to-charcoal-950" />
      )}
      <div className="container-luxury relative">
        <Reveal>
          <p className="heading-eyebrow-light">{eyebrow}</p>
          <h1 className="max-w-4xl text-3xl font-bold leading-snug text-warm-50 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-warm-50/70 sm:text-lg">{subtitle}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
