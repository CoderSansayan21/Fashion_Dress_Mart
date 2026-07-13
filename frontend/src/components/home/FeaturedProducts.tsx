'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, ShoppingBag } from 'lucide-react';
import { fetchProducts, fetchWishlist, addToWishlist, removeFromWishlist } from '@/lib/api';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
}

function getDiscountPercent(price: number, discount: number): number {
  return Math.round(((price - discount) / price) * 100);
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
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

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-2/5" />
    </div>
  );
}

function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onViewProduct,
}: {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onViewProduct: () => void;
}) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercent(product.price, product.discountPrice!)
    : 0;

  return (
    <motion.div
      variants={cardVariants}
      className="group cursor-pointer"
      onClick={onViewProduct}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-md bg-stone-100">
        {/* Product image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url(${product.imageUrl || `https://picsum.photos/seed/${product.slug}/400/400`})`,
          }}
        />

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold px-2 py-0.5">
              -{discountPercent}%
            </Badge>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={onToggleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`size-4 transition-colors ${
              isWishlisted
                ? 'fill-rose-500 text-rose-500'
                : 'text-stone-400 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Add to cart overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-stone-900/80 backdrop-blur-sm p-3">
            <Button
              size="sm"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(e);
              }}
            >
              <ShoppingCart className="size-4 mr-1.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-stone-900 line-clamp-1 text-sm md:text-base">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-rose-600">
            {formatLKR(product.discountPrice ?? product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatLKR(product.price)}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {product.size && (
            <Badge variant="secondary" className="text-xs">
              {product.size}
            </Badge>
          )}
          {product.material && (
            <Badge variant="outline" className="text-xs">
              {product.material}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturedProducts() {
  const queryClient = useQueryClient();
  const viewProduct = useUIStore((s) => s.viewProduct);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen);
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { is_featured: true, size: 8 }],
    queryFn: () => fetchProducts({ is_featured: true, size: 8 }),
  });

  const products = data?.items ?? [];

  // Fetch wishlist if logged in
  const { data: wishlistItems } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: () => fetchWishlist(user!.id),
    enabled: !!user?.id,
  });

  const wishlistedIds = new Set(
    wishlistItems?.map((w) => w.productId) ?? []
  );

  const wishlistMutation = useMutation({
    mutationFn: async ({ productId, isCurrentlyWishlisted }: { productId: string; isCurrentlyWishlisted: boolean }) => {
      if (isCurrentlyWishlisted) {
        await removeFromWishlist(user!.id, productId);
      } else {
        await addToWishlist(user!.id, productId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    },
  });

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    wishlistMutation.mutate({
      productId: product.id,
      isCurrentlyWishlisted: wishlistedIds.has(product.id),
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    addItem(user.id, product.id, product);
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
          Featured Collection
        </h2>
        <button
          onClick={() => navigateTo('shop')}
          className="text-amber-700 hover:text-amber-800 font-medium text-sm md:text-base flex items-center gap-1 transition-colors cursor-pointer"
        >
          View All
          <ShoppingBag className="size-4" />
        </button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No featured products available yet.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistedIds.has(product.id)}
              onToggleWishlist={(e) => handleToggleWishlist(e, product)}
              onAddToCart={(e) => handleAddToCart(e, product)}
              onViewProduct={() => viewProduct(product.id)}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}