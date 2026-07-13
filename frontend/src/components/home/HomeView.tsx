'use client';

import HeroBanner from './HeroBanner';
import CategoryShowcase from './CategoryShowcase';
import FeaturedProducts from './FeaturedProducts';
import Testimonials from './Testimonials';

export default function HomeView() {
  return (
    <>
      <HeroBanner />
      <CategoryShowcase />
      <FeaturedProducts />
      <Testimonials />
    </>
  );
}