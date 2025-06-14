import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/jwt'

export async function GET(req: NextRequest,{ params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }
    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, ownerId: true } },
        assignee: { select: { id: true, email: true } },
      },
    })
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    const isOwner = task.project.ownerId === payload.userId
    const isMember = await prisma.membership.findFirst({
      where: {
        userId: payload.userId,
        projectId: task.project.id,
      },
    })
    if (!isOwner && !isMember) {
      return NextResponse.json(
        { message: 'Forbidden: You are not part of this project' },
        { status: 403 }
      )
    }

    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    console.error('GET /api/task/[id] error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get('token')?.value
    const payload = token && verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { project: true },
    })
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    const isOwner = task.project.ownerId === payload.userId
    const isMember = await prisma.membership.findFirst({
      where: {
        userId: payload.userId,
        projectId: task.projectId,
      },
    })
    if (!isOwner && !isMember) {
      return NextResponse.json({ message: 'Forbidden you dont have any access of this task' }, { status: 403 })
    }

    const { title, description, status, assigneeId } = await req.json()
    const allowedAssigneeIds = [
      task.project.ownerId,
      ...(await prisma.membership.findMany({
        where: { projectId: task.projectId },
        select: { userId: true },
      })).map(m => m.userId),
    ]
    const resolvedAssignee = assigneeId || payload.userId
    if (!allowedAssigneeIds.includes(resolvedAssignee)) {
      return NextResponse.json(
        { message: 'Assignee must be owner or member of project' },
        { status: 403 }
      )
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { title, description, status, assigneeId: resolvedAssignee },
    })

    return NextResponse.json({ message: 'Task updated', task: updatedTask }, { status: 200 })
  } catch (error) {
    console.error('Update Task error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get('token')?.value
    const payload = token && verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { project: true },
    })
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    const isOwner = task.project.ownerId === payload.userId
    const isMember = await prisma.membership.findFirst({
      where: {
        userId: payload.userId,
        projectId: task.projectId,
      },
    })
    if (!isOwner && !isMember) {
      return NextResponse.json({ message: 'Forbidden you dont have any access of this task.' }, { status: 403 })
    }

    await prisma.task.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Task deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete Task error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}