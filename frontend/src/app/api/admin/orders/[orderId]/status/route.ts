import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ALLOWED_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await db.order.findUnique({ where: { id: orderId } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}