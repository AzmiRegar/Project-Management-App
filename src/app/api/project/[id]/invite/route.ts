import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyJwt } from '@/lib/jwt'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = (await cookies()).get('token')?.value
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        const payload = verifyJwt(token)
        if (!payload) {
            return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 })
        }

        const projectId = params.id
        const inviterId = payload.userId

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true }
        })
        if (!project) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 })
        }
        if (project.ownerId !== inviterId) {
            return NextResponse.json({ message: 'Forbidden: Only owner can invite' }, { status: 403 })
        }

        const { userId } = await req.json()
        if (!userId) {
            return NextResponse.json({ message: 'userId is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return NextResponse.json({ message: 'User to invite not found' }, { status: 404 })
        }

        const exists = await prisma.membership.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId
                }
            }
        })
        if (exists) {
            return NextResponse.json({ message: 'User is already a member' }, { status: 409 })
        }

        const membership = await prisma.membership.create({
            data: {
                userId,
                projectId
            }
        })

        await prisma.task.updateMany({
            where: {
                projectId,
                assigneeId: null
            },
            data: {
                assigneeId: userId
            }
        })

        return NextResponse.json({
            message: 'Member invited and unassigned tasks assigned successfully',
            membership
        }, { status: 201 })

    } catch (error) {
        console.error('POST /api/project/[id]/invite error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(
    _: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const members = await prisma.membership.findMany({
            where: { projectId: params.id },
            include: {
                user: {
                    select: { id: true, email: true }
                }
            }
        })

        return NextResponse.json({ members })
    } catch (error) {
        console.error('Error fetching members:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}




export async function DELETE(
    req: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        const { userId } = await req.json()
        const { projectId } = params

        const membership = await prisma.membership.findFirst({
            where: {
                userId,
                projectId,
            },
        })

        if (!membership) {
            return NextResponse.json({ message: "Membership tidak ditemukan" }, { status: 404 })
        }

        await prisma.membership.delete({
            where: {
                id: membership.id,
            },
        })

        return NextResponse.json({ message: "Membership berhasil dihapus" })
    } catch (error) {
        console.error("Error deleting membership:", error)
        return NextResponse.json({ message: "Gagal menghapus membership" }, { status: 500 })
    }
}
