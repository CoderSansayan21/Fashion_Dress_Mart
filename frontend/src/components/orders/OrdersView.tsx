'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { fetchOrders } from '@/lib/api';

function formatLKR(amount: number) {
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-sky-100 text-sky-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

export default function OrdersView() {
  const user = useAuthStore((s) => s.user);
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen);
  const viewOrder = useUIStore((s) => s.viewOrder);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => fetchOrders(user!.id, 1, 50),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <Package className="mb-4 h-16 w-16 text-stone-300" />
        <h2 className="mb-2 text-2xl font-bold text-stone-900">Please sign in</h2>
        <p className="mb-6 text-stone-500">Sign in to view your orders</p>
        <Button onClick={() => setAuthModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
          Sign In
        </Button>
      </div>
    );
  }

  const orders = data?.items || [];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">My Orders</h1>
        <p className="mt-1 text-stone-500">Track and manage your orders</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="h-24 animate-pulse bg-stone-100" />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center">
          <Package className="mb-4 h-16 w-16 text-stone-300" />
          <h2 className="mb-2 text-xl font-bold text-stone-900">No orders yet</h2>
          <p className="mb-6 text-stone-500">Start shopping to see your orders here</p>
          <Button onClick={() => useUIStore.getState().navigateTo('shop')} className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
            Shop Now
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-stone-900">{order.orderNumber}</p>
                        <Badge className={statusColors[order.status] || 'bg-stone-100 text-stone-700'}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })} &middot; {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-stone-900">{formatLKR(order.totalAmount)}</p>
                      <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700" onClick={() => viewOrder(order.orderNumber)}>
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}