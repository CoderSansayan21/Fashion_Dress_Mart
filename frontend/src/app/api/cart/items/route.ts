import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity = 1 } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'userId and productId are required' },
        { status: 400 }
      )
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Find or create cart
    let cart = await db.cart.findUnique({ where: { userId } })
    if (!cart) {
      cart = await db.cart.create({ data: { userId } })
    }

    // Check if item already in cart
    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        )
      }
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      })
      return NextResponse.json(updated, { status: 200 })
    }

    const cartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: { product: true },
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
  }
}