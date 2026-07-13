import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = { updatedAt: new Date() }

    const allowedFields = [
      'name', 'slug', 'description', 'price', 'discountPrice',
      'stock', 'sku', 'brand', 'size', 'color', 'material',
      'imageUrl', 'isActive', 'isFeatured', 'categoryId',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'price' || field === 'discountPrice') {
          data[field] = body[field] !== null ? parseFloat(body[field]) : null
        } else if (field === 'stock') {
          data[field] = parseInt(body[field])
        } else {
          data[field] = body[field]
        }
      }
    }

    const product = await db.product.update({
      where: { id },
      data,
      include: { category: true },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await db.product.delete({ where: { id } })

    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}