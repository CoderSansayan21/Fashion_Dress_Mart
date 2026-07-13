'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';

function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString('en-LK')}`;
}

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const effectivePrice = item.product.discountPrice ?? item.product.price;
  const lineTotal = effectivePrice * item.quantity;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 py-3"
    >
      {/* Product Image */}
      <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {item.product.imageUrl ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            <span className="text-xs">No img</span>
          </div>
        )}
        {item.product.discountPrice && (
          <span className="absolute -right-1 -top-1 rounded bg-rose-500 px-1 py-0.5 text-[9px] font-bold text-white">
            SALE
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-900">
              {item.product.name}
            </p>
            {item.product.brand && (
              <p className="text-xs text-stone-500">{item.product.brand}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-stone-400 hover:text-rose-600 hover:bg-rose-50"
            onClick={handleRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-stone-900">
              {formatPrice(effectivePrice)}
            </span>
            {item.product.discountPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(item.product.price)}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-0.5 rounded-lg border border-stone-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none rounded-l-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="flex h-7 w-8 items-center justify-center text-xs font-medium text-stone-900">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none rounded-r-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              onClick={handleIncrease}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
        </div>

        {/* Line Total */}
        <div className="mt-0.5 text-right">
          <span className="text-xs font-medium text-stone-500">
            Subtotal: {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}