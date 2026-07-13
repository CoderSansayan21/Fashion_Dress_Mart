'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import { createOrder, createPayment } from '@/lib/api';
import { toast } from 'sonner';

function formatLKR(amount: number) {
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CheckoutView() {
  const user = useAuthStore((s) => s.user);
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen);
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const clear = useCartStore((s) => s.clear);
  const queryClient = useQueryClient();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <Truck className="mb-4 h-16 w-16 text-stone-300" />
        <h2 className="mb-2 text-2xl font-bold text-stone-900">Please sign in to checkout</h2>
        <p className="mb-6 text-stone-500">You need an account to place an order</p>
        <Button onClick={() => setAuthModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600">
          Sign In
        </Button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
          <CheckCircle className="mb-4 h-20 w-20 text-emerald-500" />
        </motion.div>
        <h2 className="mb-2 text-3xl font-bold text-stone-900">Order Placed!</h2>
        <p className="mb-2 text-stone-500">Your order has been placed successfully</p>
        <p className="mb-6 text-lg font-semibold text-amber-600">Order: {orderSuccess.orderNumber}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => useUIStore.getState().navigateTo('orders')}>
            View Orders
          </Button>
          <Button className="bg-gradient-to-r from-amber-500 to-rose-500 text-white" onClick={() => useUIStore.getState().navigateTo('home')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <Truck className="mb-4 h-16 w-16 text-stone-300" />
        <h2 className="mb-2 text-2xl font-bold text-stone-900">Your cart is empty</h2>
        <p className="mb-6 text-stone-500">Add items to your cart before checkout</p>
        <Button onClick={() => useUIStore.getState().navigateTo('shop')} className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
          Shop Now
        </Button>
      </div>
    );
  }

  const cartTotal = cart.items.reduce((total, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return total + price * item.quantity;
  }, 0);

  const handleSubmit = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        userId: user.id,
        shipping_address: shippingAddress,
        contact_phone: contactPhone || undefined,
        note: note || undefined,
      });
      await createPayment(order.id, paymentMethod);
      await clear(user.id);
      queryClient.invalidateQueries();
      setOrderSuccess({ orderNumber: order.orderNumber });
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Checkout</h1>
        <p className="mt-1 text-stone-500">Complete your order</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-600" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Shipping Address *</Label>
                  <Textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your full shipping address"
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+94 XX XXX XXXX"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="note">Order Note (Optional)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any special instructions for your order"
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-stone-50 cursor-pointer">
                    <RadioGroupItem value="cash_on_delivery" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-sm text-stone-500">Pay when you receive your order</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-stone-50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <span className="font-medium">Card Payment</span>
                      <p className="text-sm text-stone-500">Pay securely with your credit/debit card</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {item.product.imageUrl && (
                    <img src={item.product.imageUrl} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">
                    {formatLKR((item.product.discountPrice ?? item.product.price) * item.quantity)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="font-medium">{formatLKR(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Delivery</span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">FREE</Badge>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-rose-600">{formatLKR(cartTotal)}</span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 py-6 text-base font-semibold text-white hover:from-amber-600 hover:to-rose-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order - ${formatLKR(cartTotal)}`
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}