'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';

const slides = [
  {
    image: '/images/hero/banner.png',
    heading: "Discover Sri Lanka's Finest Fashion",
    subheading: 'Elegant sarees, contemporary dresses & more',
    cta: 'Shop Now',
  },
  {
    image: '/images/hero/banner2.png',
    heading: 'New Arrivals - Festive Collection 2025',
    subheading: 'Celebrate in style with our exclusive designs',
    cta: 'Explore Collection',
  },
];

const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function HeroBanner() {
  const navigateTo = useUIStore((s) => s.navigateTo);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="min-w-0 shrink-0 grow-0 basis-full h-full relative"
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/30 to-transparent" />

              {/* Text content positioned bottom-left */}
              <div className="absolute inset-0 flex items-end p-8 md:p-16">
                <AnimatePresence mode="wait">
                  {selectedIndex === idx && (
                    <motion.div
                      key={idx}
                      className="max-w-xl space-y-4 md:space-y-6"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={0}
                    >
                      <motion.h1
                        className="text-4xl md:text-6xl font-bold text-white leading-tight"
                        variants={textVariants}
                        custom={0}
                      >
                        {slide.heading}
                      </motion.h1>
                      <motion.p
                        className="text-lg md:text-xl text-white/90"
                        variants={textVariants}
                        custom={1}
                      >
                        {slide.subheading}
                      </motion.p>
                      <motion.div variants={textVariants} custom={2}>
                        <Button
                          size="lg"
                          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 text-base font-semibold shadow-lg cursor-pointer"
                          onClick={() => navigateTo('shop')}
                        >
                          {slide.cta}
                          <ArrowRight className="ml-1 size-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors flex items-center justify-center text-white cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors flex items-center justify-center text-white cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === selectedIndex
                ? 'w-8 bg-amber-500'
                : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}