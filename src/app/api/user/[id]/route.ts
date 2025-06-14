import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/jwt'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('GET /api/user/[id] error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
    }

    if (payload.userId !== params.id) {
      return NextResponse.json({ message: 'Forbidden: Cannot update other users' }, { status: 403 })
    }

    const body = await req.json()
    const { email, password } = body

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { id: params.id } })

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        email,
        ...(password && { password }),
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updated,
    }, { status: 200 })

  } catch (error) {
    console.error('Update user erorr:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = (await cookies()).get('token')?.value
  const payload = token && verifyJwt(token)

  if (!payload || payload.userId !== params.id) {
    return NextResponse.json({ message: 'Forbidden: cannot delete other user' }, { status: 403 })
  }

  await prisma.user.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ message: 'User deleted' })
}