import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      message: 'Register success',
      user: {
        id: user.id,
        email: user.email,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
