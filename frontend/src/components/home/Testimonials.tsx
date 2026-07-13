'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      'The saree collection is absolutely stunning! The quality exceeded my expectations.',
    name: 'Nimali Fernando',
    location: 'Colombo',
    rating: 5,
  },
  {
    quote:
      'Best place for traditional Sri Lankan fashion. Fast delivery and great customer service.',
    name: 'Suresh Wijesinghe',
    location: 'Kandy',
    rating: 5,
  },
  {
    quote:
      'I ordered a lehenga for my wedding and it was perfect. Beautiful craftsmanship!',
    name: 'Dinushi Samaraweera',
    location: 'Galle',
    rating: 5,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-200 text-stone-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-stone-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
          What Our Customers Say
        </h2>
        <div className="mt-3 mx-auto w-20 h-1 bg-amber-500 rounded-full" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
      >
        {testimonials.map((t) => (
          <motion.div
            key={t.name}
            variants={cardVariants}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <Quote className="size-8 text-amber-400 mb-4" />
            <p className="text-stone-700 leading-relaxed mb-6 text-sm md:text-base">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="border-t border-stone-100 pt-4">
              <StarRating rating={t.rating} />
              <div className="mt-2">
                <p className="font-semibold text-stone-900 text-sm">
                  {t.name}
                </p>
                <p className="text-sm text-muted-foreground">{t.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}