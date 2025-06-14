import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = (await cookies()).get('token')?.value
  const payload = token && verifyJwt(token)

  if (!payload) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return NextResponse.json({
    message: 'All users have been displayed',
    users,
  }, { status: 200 })
}