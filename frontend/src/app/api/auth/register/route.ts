import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, password, phone, address } = body

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'full_name, email, and password are required' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        full_name,
        email,
        hashedPassword,
        phone: phone || null,
        address: address || null,
        role: 'customer',
      },
    })

    const { hashedPassword: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}