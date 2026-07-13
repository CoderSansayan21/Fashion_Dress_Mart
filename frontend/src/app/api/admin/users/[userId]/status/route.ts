import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { isActive } = body

    if (isActive === undefined) {
      return NextResponse.json({ error: 'isActive is required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { id: userId } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { isActive: Boolean(isActive) },
      select: {
        id: true,
        full_name: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}