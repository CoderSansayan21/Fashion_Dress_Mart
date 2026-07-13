import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { quantity } = body

    if (quantity === undefined || quantity < 1) {
      return NextResponse.json(
        { error: 'quantity must be at least 1' },
        { status: 400 }
      )
    }

    const cartItem = await db.cartItem.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    if (cartItem.product && cartItem.product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    const updated = await db.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cartItem = await db.cartItem.findUnique({ where: { id } })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    await db.cartItem.delete({ where: { id } })

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 })
  }
}