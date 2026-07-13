import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const size = Math.max(1, Math.min(100, parseInt(searchParams.get('size') || '20')))

    const [items, total] = await Promise.all([
      db.user.findMany({
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          address: true,
          profileImage: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.user.count(),
    ])

    return NextResponse.json({ total, items })
  } catch (error) {
    console.error('Error listing admin users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}