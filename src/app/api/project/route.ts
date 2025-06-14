import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJwt } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const token = (await cookies()).get('token')?.value
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 })
        }

        const payload = verifyJwt(token)
        if (!payload) {
            return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 })
        }

        const userId = payload.userId
        const owned = await prisma.project.findMany({
            where: { ownerId: userId },
        })

        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: { project: true },
        })

        const joined = memberships.map(m => m.project)

        const allProjects = [...owned, ...joined].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        return NextResponse.json({
            message: 'All projects have been displayed',
            project: allProjects,
        }, { status: 200 })

    } catch (error) {
        console.error('GET /api/project error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}


export async function POST(req: NextRequest) {
    try {
        const token = (await cookies()).get('token')?.value
        const payload = token && verifyJwt(token)

        if (!payload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name } = body

        if (!name) {
            return NextResponse.json({ message: 'Project name is required' }, { status: 400 })
        }

        const existing = await prisma.project.findFirst({
            where: {
                ownerId: payload.userId,
                name: name,
            },
        })

        if (existing) {
            return NextResponse.json({ message: 'Project with this name already exists' }, { status: 409 })
        }

        const newProject = await prisma.project.create({
            data: {
                name,
                ownerId: payload.userId,
            },
        })

        return NextResponse.json({
            message: 'Project created successfully',
            project: newProject,
        }, { status: 201 })

    } catch (error) {
        console.error('Create project error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}