'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, CreditCard, Truck, MapPin, Phone, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUIStore } from '@/store/ui-store';
import { fetchOrders } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

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

const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export default function OrderDetailView() {
  const selectedOrderNumber = useUIStore((s) => s.selectedOrderNumber);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const user = useAuthStore((s) => s.user);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => fetchOrders(user!.id, 1, 100),
    enabled: !!user && !!selectedOrderNumber,
  });

  const order = ordersData?.items.find((o) => o.orderNumber === selectedOrderNumber);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center">
        <Package className="mb-4 h-16 w-16 text-stone-300" />
        <h2 className="mb-4 text-xl font-bold text-stone-900">Order not found</h2>
        <Button variant="outline" onClick={() => navigateTo('orders')}>Back to Orders</Button>
      </div>
    );
  }

  const currentStepIdx = statusSteps.indexOf(order.status);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" className="mb-6 -ml-2 text-stone-500 hover:text-stone-900" onClick={() => navigateTo('orders')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{order.orderNumber}</h1>
          <p className="mt-1 text-stone-500">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Badge className={`self-start text-sm ${statusColors[order.status]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Status Timeline */}
      {currentStepIdx >= 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {statusSteps.map((step, idx) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      idx <= currentStepIdx ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500'
                    }`}>
                      {idx < currentStepIdx ? '✓' : idx + 1}
                    </div>
                    <p className={`mt-1.5 text-xs capitalize ${idx <= currentStepIdx ? 'font-medium text-stone-900' : 'text-stone-400'}`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-right">{formatLKR(item.unitPrice)}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right font-semibold">{formatLKR(item.unitPrice * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Shipping Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-4 w-4 text-amber-600" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  <p>{order.shippingAddress}</p>
                </div>
                {order.contactPhone && (
                  <div className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                    <p>{order.contactPhone}</p>
                  </div>
                )}
                {order.note && (
                  <div className="flex gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                    <p>{order.note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Info */}
          {order.payment && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Method</span>
                    <span className="capitalize font-medium">{order.payment.method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Status</span>
                    <Badge className={statusColors[order.payment.status]}>{order.payment.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Transaction ID</span>
                    <span className="font-mono text-xs">{order.payment.transactionId.slice(0, 12)}...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Total */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Clock className="h-4 w-4" />
                  <span>Order Total</span>
                </div>
                <p className="mt-1 text-3xl font-bold text-rose-600">{formatLKR(order.totalAmount)}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}