import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, method } = body

    if (!orderId || !method) {
      return NextResponse.json(
        { error: 'orderId and method are required' },
        { status: 400 }
      )
    }

    if (!['card', 'cash_on_delivery'].includes(method)) {
      return NextResponse.json(
        { error: 'method must be "card" or "cash_on_delivery"' },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({ where: { id: orderId } })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check for existing payment
    const existingPayment = await db.payment.findUnique({
      where: { orderId },
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this order' },
        { status: 409 }
      )
    }

    const transactionId = 'TXN-' + crypto.randomBytes(16).toString('hex').toUpperCase()
    const status = method === 'cash_on_delivery' ? 'pending' : 'completed'

    const payment = await db.payment.create({
      data: {
        orderId,
        transactionId,
        amount: order.totalAmount,
        currency: 'LKR',
        method,
        status,
      },
    })

    // Update order status if card payment
    if (method === 'card') {
      await db.order.update({
        where: { id: orderId },
        data: { status: 'processing' },
      })
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}