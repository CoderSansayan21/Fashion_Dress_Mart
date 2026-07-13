import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const wishlistItems = await db.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(wishlistItems)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

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

    // Check if already in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 409 }
      )
    }

    const wishlistItem = await db.wishlistItem.create({
      data: { userId, productId },
      include: { product: true },
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}