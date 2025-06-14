import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/jwt'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { tasks: true },
    })

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    if (project.ownerId !== payload.userId) {
      const isMember = await prisma.membership.findFirst({
        where: {
          userId: payload.userId,
          projectId: project.id,
        }
      })

      if (!isMember) {
        return NextResponse.json({ message: 'Forbidden: Not a member' }, { status: 403 })
      }
    }

    return NextResponse.json({
      message: 'Project has been displayed',
      project: project,
    }, { status: 200 })

  } catch (error) {
    console.error('GET Project error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Project name is required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } })
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    if (project.ownerId !== payload.userId) {
      return NextResponse.json({ message: 'Forbidden: Not the owner' }, { status: 403 })
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { name },
    })

    return NextResponse.json({
      message: 'Project updated successfully',
      project: updated,
    }, { status: 200 })

  } catch (error) {
    console.error('Update Project error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    if (project.ownerId !== payload.userId) {
      return NextResponse.json({ message: 'Forbidden: Only owner can delete' }, { status: 403 })
    }

    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 })

  } catch (error) {
    console.error('DELETE Project error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}