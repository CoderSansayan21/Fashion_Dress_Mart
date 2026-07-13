'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useToast } from '@/hooks/use-toast';
import { fetchProduct, addToWishlist, createReview } from '@/lib/api';

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
}

interface ReviewUser {
  id: string;
  full_name: string;
  profileImage: string | null;
}

interface ReviewWithUser {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${
            s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
          }`}
        />
      ))}
    </div>
  );
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="p-0.5"
          aria-label={`Rate ${s} stars`}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              s <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingDistribution({ reviews }: { reviews: ReviewWithUser[] }) {
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => { counts[r.rating - 1]++; });
    return counts;
  }, [reviews]);

  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-stone-50 rounded-xl">
      {/* Average */}
      <div className="flex flex-col items-center justify-center min-w-[120px]">
        <span className="text-4xl font-bold text-stone-900">{avg.toFixed(1)}</span>
        <StarRating rating={Math.round(avg)} size="md" />
        <span className="text-xs text-stone-500 mt-1">{total} review{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star - 1];
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-stone-600 text-right">{star}★</span>
              <div className="flex-1 h-2.5 rounded-full bg-stone-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="w-8 text-stone-500 text-xs">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductDetailView() {
  const selectedProductId = useUIStore((s) => s.selectedProductId);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const setSelectedCategoryId = useUIStore((s) => s.setSelectedCategoryId);
  const goBack = useUIStore((s) => s.goBack);
  const user = useAuthStore((s) => s.user);
  const cartAddItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: () => fetchProduct(selectedProductId!),
    enabled: !!selectedProductId,
  });

  const reviews: ReviewWithUser[] = (product?.reviews as unknown as ReviewWithUser[]) ?? [];

  const hasDiscount = product && product.discountPrice !== null && product.discountPrice < product.price;
  const displayPrice = product ? (hasDiscount ? product.discountPrice! : product.price) : 0;
  const savedAmount = product && hasDiscount ? product.price - product.discountPrice! : 0;

  // Add to cart
  const handleAddToCart = async () => {
    if (!user || !product) return;
    try {
      await cartAddItem(user.id, product.id, product, quantity);
      toast({ title: 'Added to cart', description: `${product.name} × ${quantity} added to your cart` });
      setQuantity(1);
    } catch {
      toast({ title: 'Error', description: 'Failed to add to cart', variant: 'destructive' });
    }
  };

  // Add to wishlist
  const handleWishlist = async () => {
    if (!user || !product) {
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

  // Submit review
  const reviewMutation = useMutation({
    mutationFn: () =>
      createReview({
        userId: user!.id,
        productId: selectedProductId!,
        rating: reviewRating,
        comment: reviewComment || undefined,
      }),
    onSuccess: () => {
      toast({ title: 'Review submitted', description: 'Thank you for your feedback!' });
      setReviewRating(0);
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['product', selectedProductId] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square w-full max-w-lg mx-auto rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/50">
        <div className="text-center">
          <p className="text-stone-500 text-lg">Product not found</p>
          <Button
            variant="outline"
            className="mt-4 border-stone-300 text-stone-600"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const specRows = [
    { label: 'Size', value: product.size },
    { label: 'Color', value: product.color },
    { label: 'Material', value: product.material },
    { label: 'SKU', value: product.sku },
  ].filter((r) => r.value);

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer text-stone-500 hover:text-amber-700"
                onClick={() => navigateTo('home')}
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer text-stone-500 hover:text-amber-700"
                onClick={() => {
                  setSelectedCategoryId(null);
                  navigateTo('shop');
                }}
              >
                Shop
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="cursor-pointer text-stone-500 hover:text-amber-700"
                    onClick={() => {
                      setSelectedCategoryId(product.category!.id);
                      navigateTo('shop');
                    }}
                  >
                    {product.category.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-stone-800 line-clamp-1 max-w-[200px]">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative aspect-square w-full max-w-lg mx-auto rounded-xl overflow-hidden bg-stone-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-300">
                  <ShoppingCart className="h-24 w-24" />
                </div>
              )}
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-rose-500 hover:bg-rose-600 text-white text-sm px-3 py-1">
                  -{Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>

            {/* Brand */}
            {product.brand && (
              <button
                className="text-sm text-amber-700 hover:text-amber-800 hover:underline transition-colors"
                onClick={() => {
                  navigateTo('shop');
                }}
              >
                {product.brand}
              </button>
            )}

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating
                  rating={Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)}
                  size="md"
                />
                <span className="text-sm text-stone-500">
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-stone-900">
                  {formatLKR(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-stone-400 line-through">
                    {formatLKR(product.price)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200">
                  Save {formatLKR(savedAmount)}
                </Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-stone-600 leading-relaxed">{product.description}</p>
            )}

            {/* Specifications */}
            {specRows.length > 0 && (
              <div className="rounded-lg border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {specRows.map((row, i) => (
                      <tr key={row.label} className={i > 0 ? 'border-t border-stone-200' : ''}>
                        <td className="px-4 py-2.5 font-medium text-stone-700 bg-stone-50 w-28">
                          {row.label}
                        </td>
                        <td className="px-4 py-2.5 text-stone-600">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-stone-700">Quantity:</span>
              <div className="flex items-center border border-stone-300 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors rounded-l-lg"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1 && v <= product.stock) setQuantity(v);
                  }}
                  className="h-10 w-14 text-center border-x border-stone-300 text-sm font-medium text-stone-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors rounded-r-lg"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-12 text-base"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !user}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0
                  ? 'Out of Stock'
                  : !user
                  ? 'Login to Add to Cart'
                  : 'Add to Cart'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 border-stone-300 text-stone-600 hover:bg-stone-50"
                onClick={handleWishlist}
                disabled={isWishlisted}
              >
                <Heart
                  className={`h-5 w-5 mr-2 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
                />
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12">
          <Separator className="mb-8" />

          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-6">Customer Reviews</h2>

          {reviews.length > 0 && <RatingDistribution reviews={reviews} />}

          {/* Write a Review */}
          {user && (
            <div className="mt-8 p-6 bg-white border border-stone-200 rounded-xl">
              <h3 className="font-semibold text-stone-800 mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-stone-600 mb-2">Your Rating</p>
                  <InteractiveStarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-2">Your Review</p>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="border-stone-300 resize-none"
                  />
                </div>
                <Button
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewRating === 0 || reviewMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <div className="mt-8 p-6 bg-stone-50 rounded-xl text-center">
              <p className="text-stone-500 text-sm">
                <button
                  className="text-amber-700 hover:underline font-medium"
                  onClick={() => {
                    useUIStore.getState().setAuthModalOpen(true);
                    useUIStore.getState().setAuthModalTab('login');
                  }}
                >
                  Login
                </button>{' '}
                to write a review
              </p>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div className="mt-8 space-y-4 max-h-96 overflow-y-auto">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-white border border-stone-200 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
                        {review.user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {review.user?.full_name ?? 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-stone-400">
                            {new Date(review.createdAt).toLocaleDateString('en-LK', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-stone-600 leading-relaxed pl-12">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {reviews.length === 0 && (
            <div className="mt-8 text-center py-8 text-stone-400">
              <p className="text-sm">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </section>

        {/* Back Button */}
        <div className="mt-8 mb-4">
          <Button
            variant="ghost"
            className="text-stone-600 hover:text-stone-800 hover:bg-stone-100"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    </div>
  );
}