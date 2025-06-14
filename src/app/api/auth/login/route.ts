import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/jwt'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const token = signJwt({ userId: user.id, email: user.email })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      message: 'Login success',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
