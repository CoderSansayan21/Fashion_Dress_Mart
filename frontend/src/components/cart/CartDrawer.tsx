'use client';

import { useEffect } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

import CartItemComponent from '@/components/cart/CartItem';

function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString('en-LK')}`;
}

export default function CartDrawer() {
  const { isCartOpen, setCartOpen, navigateTo, setAuthModalOpen } = useUIStore();
  const { user } = useAuthStore();
  const { cart, itemCount, isLoading, loadCart, calculateTotal } = useCartStore();

  // Load cart when user changes and cart opens
  useEffect(() => {
    if (isCartOpen && user) {
      loadCart(user.id);
    }
  }, [isCartOpen, user, loadCart]);

  const total = calculateTotal();
  const hasItems = itemCount > 0 && cart?.items && cart.items.length > 0;

  const handleCheckout = () => {
    if (!user) {
      setCartOpen(false);
      setAuthModalOpen(true);
      return;
    }
    setCartOpen(false);
    navigateTo('checkout');
  };

  const handleContinueShopping = () => {
    setCartOpen(false);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-stone-200 px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-stone-900">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {itemCount > 0 && (
              <span className="text-sm font-normal text-stone-500">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <p className="text-sm text-stone-500">Loading your cart...</p>
            </div>
          </div>
        ) : hasItems ? (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 px-6">
              <AnimatePresence mode="popLayout">
                {cart!.items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </ScrollArea>

            {/* Cart Footer */}
            <div className="border-t border-stone-200 px-6 py-4">
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-medium text-stone-900">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Delivery</span>
                  <span className="text-sm text-emerald-600 font-medium">Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-900">Total</span>
                  <span className="text-lg font-bold text-stone-900">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCheckout}
                  className="h-11 w-full bg-gradient-to-r from-amber-600 to-rose-600 font-semibold text-white hover:from-amber-700 hover:to-rose-700"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={handleContinueShopping}
                  className="h-10 w-full border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty Cart State */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
              <ShoppingBag className="h-10 w-10 text-stone-300" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-stone-700">Your cart is empty</p>
              <p className="mt-1 text-sm text-stone-500">
                Discover our beautiful collection and add items to your cart.
              </p>
            </div>
            <Button
              onClick={handleContinueShopping}
              variant="outline"
              className="mt-2 border-amber-600 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
            >
              Start Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}