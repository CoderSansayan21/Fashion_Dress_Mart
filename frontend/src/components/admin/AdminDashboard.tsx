'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Tag,
  ClipboardList,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchAdminStats } from '@/lib/api';
import { useUIStore } from '@/store/ui-store';

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  });
  const viewOrder = useUIStore((s) => s.viewOrder);

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-24 rounded bg-stone-200" />
              <div className="mt-3 h-8 w-16 rounded bg-stone-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: <Package className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Categories', value: stats.totalCategories, icon: <Tag className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <ClipboardList className="h-5 w-5" />, color: 'text-violet-600 bg-violet-50' },
    { label: 'Total Users', value: stats.totalUsers, icon: <Users className="h-5 w-5" />, color: 'text-rose-600 bg-rose-50' },
    { label: 'Revenue', value: formatLKR(stats.totalRevenue), icon: <DollarSign className="h-5 w-5" />, color: 'text-green-600 bg-green-50' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <Clock className="h-5 w-5" />, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">Welcome back! Here&apos;s an overview of your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-stone-900">{card.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              Recent Orders
            </CardTitle>
            <Badge variant="outline" className="text-xs">{stats.recentOrders.length} latest</Badge>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-400">No orders yet</p>
            ) : (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {stats.recentOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => viewOrder(order.orderNumber)}
                    className="flex w-full items-center justify-between rounded-lg border border-stone-100 p-3 text-left transition-colors hover:bg-stone-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-stone-900">#{order.orderNumber}</p>
                      <p className="text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-900">{formatLKR(order.totalAmount)}</p>
                      <Badge className={`text-[10px] ${statusColor[order.status] || 'bg-stone-100 text-stone-600'}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Products
            </CardTitle>
            <Badge variant="outline" className="text-xs">{stats.lowStockProducts.length} items</Badge>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-400">All products are well-stocked</p>
            ) : (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {stats.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-900">{product.name}</p>
                      <p className="text-xs text-stone-500">{product.brand || 'No brand'} &middot; {product.sku}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={product.stock <= 5 ? 'border-red-300 text-red-600 bg-red-50' : 'border-orange-300 text-orange-600 bg-orange-50'}
                    >
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}