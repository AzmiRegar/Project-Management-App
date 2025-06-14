import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get('token')?.value
    const payload = token && verifyJwt(token)

    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, status, projectId, assigneeId } = await req.json()

    if (!title || !projectId) {
      return NextResponse.json({ message: 'Title and projectId are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
      }
    })

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    const isOwner = project.ownerId === payload.userId
    const isMember = project.members.some(m => m.userId === payload.userId)

    if (!isOwner && !isMember) {
      return NextResponse.json({ message: 'Forbidden: You are not part of this project' }, { status: 403 })
    }

    const allowedAssigneeIds = [
      project.ownerId,
      ...project.members.map(m => m.userId)
    ]

    const resolvedAssigneeId = assigneeId || payload.userId

    if (!allowedAssigneeIds.includes(resolvedAssigneeId)) {
      return NextResponse.json({
        message: 'Assignee must be a member of this project',
      }, { status: 403 })
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'todo',
        projectId,
        assigneeId: resolvedAssigneeId,
      },
    })

    return NextResponse.json({
      message: 'Task created successfully',
      task: newTask,
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/task/create error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value
    const payload = token && verifyJwt(token)

    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = payload.userId

    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true }
    })

    const memberProjects = await prisma.membership.findMany({
      where: { userId },
      select: { projectId: true }
    })

    const accessibleProjectIds = [
      ...ownedProjects.map(p => p.id),
      ...memberProjects.map(m => m.projectId),
    ]

    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: accessibleProjectIds },
      },
      include: {
        project: true,
        assignee: {
          select: { id: true, email: true }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      message: 'Tasks retrieved successfully',
      tasks
    }, { status: 200 })

  } catch (error) {
    console.error('GET /api/task error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
