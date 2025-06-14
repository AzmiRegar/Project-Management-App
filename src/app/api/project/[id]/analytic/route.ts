import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    _: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id

        const counts = await prisma.task.groupBy({
            by: ['status'],
            where: { projectId },
            _count: true,
        })

        const result = {
            TODO: 0,
            IN_PROGRESS: 0,
            DONE: 0,
        }

        counts.forEach(({ status, _count }) => {
            result[status] = _count
        })

        return NextResponse.json({ data: result })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}