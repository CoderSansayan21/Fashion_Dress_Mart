'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchCategories } from '@/lib/api';
import { useUIStore } from '@/store/ui-store';
import { Skeleton } from '@/components/ui/skeleton';
import type { Category } from '@/types';

// Default categories in case API returns different data
const PRIORITY_CATEGORIES = [
  { name: 'Sarees', fallback: 'Saree' },
  { name: 'Dresses', fallback: 'Dress' },
  { name: 'Kurta Sets', fallback: 'Kurta' },
  { name: 'Blouses', fallback: 'Blouse' },
  { name: 'Lehengas', fallback: 'Lehenga' },
];

function getCategoryImage(name: string): string {
  const seed = encodeURIComponent(name);
  return `https://picsum.photos/seed/${seed}/600/400`;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function CategoryShowcase() {
  const navigateTo = useUIStore((s) => s.navigateTo);
  const setSelectedCategoryId = useUIStore((s) => s.setSelectedCategoryId);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Match our priority categories with the API data, fallback to defaults
  const displayCategories = PRIORITY_CATEGORIES.map((p) => {
    const match = categories?.find(
      (c) =>
        c.name.toLowerCase() === p.name.toLowerCase() ||
        c.name.toLowerCase().includes(p.fallback.toLowerCase())
    );
    return match
      ? match
      : { id: '', name: p.name, slug: '', description: null, image: null, createdAt: '' };
  });

  const handleCategoryClick = (cat: Category) => {
    if (cat.id) {
      setSelectedCategoryId(cat.id);
    }
    navigateTo('shop');
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
          Shop by Category
        </h2>
        <div className="mt-3 mx-auto w-20 h-1 bg-amber-500 rounded-full" />
      </motion.div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 md:h-56 rounded-2xl" />
            ))}
          </div>
          <div className="flex justify-center gap-4">
            <Skeleton className="h-48 md:h-56 w-[calc(50%-0.5rem)] md:w-80 rounded-2xl" />
            <Skeleton className="h-48 md:h-56 w-[calc(50%-0.5rem)] md:w-80 rounded-2xl" />
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* First row: 3 items */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            {displayCategories.slice(0, 3).map((cat) => (
              <motion.button
                key={cat.name}
                variants={itemVariants}
                onClick={() => handleCategoryClick(cat)}
                className="group relative h-48 md:h-56 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${cat.image || getCategoryImage(cat.name)})`,
                  }}
                />
                <div className="absolute inset-0 bg-stone-900/40 transition-colors duration-300 group-hover:bg-stone-900/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">
                    {cat.name}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Second row: 2 items centered */}
          <div className="flex justify-center gap-4 md:gap-6">
            {displayCategories.slice(3, 5).map((cat) => (
              <motion.button
                key={cat.name}
                variants={itemVariants}
                onClick={() => handleCategoryClick(cat)}
                className="group relative h-48 md:h-56 w-[calc(50%-0.5rem)] md:w-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${cat.image || getCategoryImage(cat.name)})`,
                  }}
                />
                <div className="absolute inset-0 bg-stone-900/40 transition-colors duration-300 group-hover:bg-stone-900/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">
                    {cat.name}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}