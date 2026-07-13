'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import { fetchWishlist, removeFromWishlist } from '@/lib/api';
import { toast } from 'sonner';

function formatLKR(amount: number) {
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function WishlistView() {
  const user = useAuthStore((s) => s.user);
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen);
  const addItem = useCartStore((s) => s.addItem);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: () => fetchWishlist(user!.id),
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(user!.id, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      toast.success('Removed from wishlist');
    },
  });

  const handleAddToCart = async (item: typeof items[0]) => {
    try {
      await addItem(user!.id, item.productId, item.product);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <Heart className="mb-4 h-16 w-16 text-stone-300" />
        <h2 className="mb-2 text-2xl font-bold text-stone-900">Please sign in</h2>
        <p className="mb-6 text-stone-500">Sign in to view your wishlist</p>
        <Button onClick={() => setAuthModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="h-64 animate-pulse bg-stone-100" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">My Wishlist</h1>
        <p className="mt-1 text-stone-500">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center">
          <Heart className="mb-4 h-16 w-16 text-stone-300" />
          <h2 className="mb-2 text-xl font-bold text-stone-900">Your wishlist is empty</h2>
          <p className="mb-6 text-stone-500">Save items you love for later</p>
          <Button onClick={() => useUIStore.getState().navigateTo('shop')} className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative aspect-square cursor-pointer" onClick={() => useUIStore.getState().viewProduct(item.productId)}>
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-stone-100">
                        <ShoppingBag className="h-12 w-12 text-stone-300" />
                      </div>
                    )}
                    {item.product.discountPrice && (
                      <Badge className="absolute left-2 top-2 bg-rose-500 text-white">-{Math.round((1 - item.product.discountPrice / item.product.price) * 100)}%</Badge>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 hover:bg-red-50 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); removeMutation.mutate(item.productId); }}
                      disabled={removeMutation.isPending}
                    >
                      {removeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate cursor-pointer hover:text-amber-600" onClick={() => useUIStore.getState().viewProduct(item.productId)}>
                      {item.product.name}
                    </h3>
                    {item.product.brand && <p className="text-xs text-stone-500">{item.product.brand}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-rose-600">{formatLKR(item.product.discountPrice ?? item.product.price)}</span>
                      {item.product.discountPrice && (
                        <span className="text-sm text-stone-400 line-through">{formatLKR(item.product.price)}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}