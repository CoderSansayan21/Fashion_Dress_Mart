import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const size = Math.max(1, Math.min(100, parseInt(searchParams.get('size') || '20')))
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    const [items, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: true,
          payment: true,
          user: { select: { id: true, full_name: true, email: true } },
        },
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({ total, page, size, items })
  } catch (error) {
    console.error('Error listing admin orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}