import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalUsers,
      revenueResult,
      pendingOrders,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.order.count(),
      db.user.count(),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'cancelled' } },
      }),
      db.order.count({ where: { status: 'pending' } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { id: true, full_name: true, email: true } },
        },
      }),
      db.product.findMany({
        where: { stock: { lte: 10 } },
        include: { category: true },
      }),
    ])

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalOrders,
      totalUsers,
      totalRevenue: revenueResult._sum.totalAmount || 0,
      pendingOrders,
      recentOrders,
      lowStockProducts,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}