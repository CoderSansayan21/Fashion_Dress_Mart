'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { addToWishlist } from '@/lib/api';
import type { Product } from '@/types';

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
}

function getDiscountPercent(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100);
}

export default function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const viewProduct = useUIStore((s) => s.viewProduct);
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPercent = hasDiscount ? getDiscountPercent(product.price, product.discountPrice!) : 0;

  const handleCardClick = () => {
    viewProduct(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please login', description: 'Login to add items to cart' });
      return;
    }
    setIsAdding(true);
    try {
      await addItem(user.id, product.id, product, 1);
      toast({ title: 'Added to cart', description: `${product.name} added to your cart` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add to cart', variant: 'destructive' });
    }
    setIsAdding(false);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please login', description: 'Login to add items to wishlist' });
      return;
    }
    if (isWishlisted) return;
    try {
      await addToWishlist(user.id, product.id);
      setIsWishlisted(true);
      toast({ title: 'Added to wishlist', description: `${product.name} saved to wishlist` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add to wishlist', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
      onClick={handleCardClick}
    >
      <Card className="overflow-hidden border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-stone-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400">
              <ShoppingCart className="h-12 w-12 opacity-30" />
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-rose-500 hover:bg-rose-600 text-white z-10">
              -{discountPercent}%
            </Badge>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-500 hover:text-rose-500'
              }`}
            />
          </button>

          {/* Add to Cart - slides up on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            <Button
              size="sm"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-md"
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </motion.div>
        </div>

        {/* Content */}
        <CardContent className="p-3 sm:p-4 space-y-1.5">
          {product.material && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-stone-100 text-stone-600 border-0">
              {product.material}
            </Badge>
          )}
          <h3 className="font-medium text-sm sm:text-base text-stone-800 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-xs text-stone-500">{product.brand}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <span className="font-bold text-base sm:text-lg text-stone-900">
              {formatLKR(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-stone-400 line-through">
                {formatLKR(product.price)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}