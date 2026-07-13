import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, rating, comment } = body

    if (!userId || !productId || rating === undefined) {
      return NextResponse.json(
        { error: 'userId, productId, and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check for existing review (unique constraint)
    const existing = await db.review.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 }
      )
    }

    const review = await db.review.create({
      data: {
        userId,
        productId,
        rating,
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, full_name: true, profileImage: true } },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}