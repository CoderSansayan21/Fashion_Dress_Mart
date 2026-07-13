import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const size = Math.max(1, Math.min(100, parseInt(searchParams.get('size') || '20')))
    const q = searchParams.get('q') || ''
    const categoryId = searchParams.get('category_id')

    const where: Record<string, unknown> = {}

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { sku: { contains: q } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
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
    console.error('Error listing admin products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      description,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      size,
      color,
      material,
      imageUrl,
      isActive,
      isFeatured,
      categoryId,
    } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'name and price are required' },
        { status: 400 }
      )
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const product = await db.product.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        price: parseFloat(price),
        discountPrice: discountPrice !== undefined ? parseFloat(discountPrice) : null,
        stock: stock !== undefined ? parseInt(stock) : 0,
        sku: sku || null,
        brand: brand || null,
        size: size || null,
        color: color || null,
        material: material || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
        categoryId: categoryId || null,
      },
      include: { category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}