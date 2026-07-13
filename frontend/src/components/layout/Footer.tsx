'use client';

import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { navigateTo, setSelectedCategoryId, setAuthModalOpen } = useUIStore();

  const user = useAuthStore((s) => s.user);

  const handleQuickLink = (view: 'home' | 'shop' | 'orders' | 'wishlist') => {
    if (view === 'orders' || view === 'wishlist') {
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
    }
    navigateTo(view);
  };

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategoryId(categorySlug);
    navigateTo('shop');
  };

  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-900">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Us */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-300">
              About Us
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-stone-500">
              Fashion Dress Mart is Sri Lanka&apos;s premier fashion destination,
              offering a curated collection of elegant sarees, stylish dresses,
              and traditional attire. We celebrate the beauty of Sri Lankan
              fashion with quality fabrics and timeless designs.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-rose-500">
                <span className="text-xs font-bold text-white">F</span>
              </div>
              <span className="text-sm font-bold text-stone-300">Fashion Dress Mart</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-300">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', view: 'home' as const },
                { label: 'Shop', view: 'shop' as const },
                { label: 'My Orders', view: 'orders' as const },
                { label: 'Wishlist', view: 'wishlist' as const },
              ].map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => handleQuickLink(link.view)}
                    className="text-sm text-stone-500 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-300">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {['Sarees', 'Dresses', 'Kurta Sets', 'Blouses', 'Lehengas'].map(
                (cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className="text-sm text-stone-500 transition-colors hover:text-amber-400"
                    >
                      {cat}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-300">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
                <span className="text-sm text-stone-500">
                  45 Galle Road, Colombo 03, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-stone-500" />
                <span className="text-sm text-stone-500">+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-stone-500" />
                <span className="text-sm text-stone-500">info@fashiondressmart.lk</span>
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-colors hover:bg-amber-600 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-colors hover:bg-amber-600 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </button>
              <button
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-colors hover:bg-amber-600 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-stone-500">
            &copy; 2025 Fashion Dress Mart. All rights reserved.
          </p>
          <p className="text-xs text-stone-600">
            Made with love in Sri Lanka 🇱🇰
          </p>
        </div>
      </div>
    </footer>
  );
}