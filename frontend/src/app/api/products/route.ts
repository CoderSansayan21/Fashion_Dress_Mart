import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const size = Math.max(1, Math.min(100, parseInt(searchParams.get('size') || '20')))
    const q = searchParams.get('q') || ''
    const categoryId = searchParams.get('category_id')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const isFeatured = searchParams.get('is_featured')

    const where: Record<string, unknown> = { isActive: true }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { brand: { contains: q } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (minPrice !== null && minPrice !== '') {
      where.price = { ...(where.price as Record<string, unknown> || {}), gte: parseFloat(minPrice) }
    }

    if (maxPrice !== null && maxPrice !== '') {
      where.price = { ...(where.price as Record<string, unknown> || {}), lte: parseFloat(maxPrice) }
    }

    if (isFeatured !== null && isFeatured !== '') {
      where.isFeatured = isFeatured === 'true'
    }

    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({ total, page, size, items })
  } catch (error) {
    console.error('Error listing products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}