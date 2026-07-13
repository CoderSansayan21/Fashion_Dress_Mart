import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'))
    const size = Math.max(1, Math.min(100, parseInt(request.nextUrl.searchParams.get('size') || '20')))

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const where = { userId }

    const [items, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { items: true, payment: true },
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({ total, page, size, items })
  } catch (error) {
    console.error('Error listing orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}