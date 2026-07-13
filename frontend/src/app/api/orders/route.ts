import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, shipping_address, contact_phone, note } = body

    if (!userId || !shipping_address) {
      return NextResponse.json(
        { error: 'userId and shipping_address are required' },
        { status: 400 }
      )
    }

    // Find user's cart
    const cart = await db.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.product && item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${item.product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => {
      const price = item.product?.discountPrice ?? item.product?.price ?? 0
      return sum + price * item.quantity
    }, 0)

    // Generate order number
    const orderNumber = 'FDM-' + Date.now()

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          shippingAddress: shipping_address,
          contactPhone: contact_phone || null,
          note: note || null,
          status: 'pending',
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product?.name || 'Unknown Product',
              unitPrice: item.product?.discountPrice ?? item.product?.price ?? 0,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      })

      // Decrease stock
      for (const item of cart.items) {
        if (item.product) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      // Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}