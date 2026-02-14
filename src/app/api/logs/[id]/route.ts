import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay } from 'date-fns'

// PATCH /api/logs/[id] - Update a specific log entry
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { hoursLogged } = body

    if (hoursLogged === undefined) {
      return NextResponse.json(
        { error: 'Missing hoursLogged' },
        { status: 400 }
      )
    }

    const log = await prisma.habitLog.update({
      where: { id },
      data: {
        hoursLogged: parseFloat(hoursLogged)
      }
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error updating log:', error)
    return NextResponse.json(
      { error: 'Failed to update log' },
      { status: 500 }
    )
  }
}

// DELETE /api/logs/[id] - Delete a log entry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    await prisma.habitLog.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting log:', error)
    return NextResponse.json(
      { error: 'Failed to delete log' },
      { status: 500 }
    )
  }
}
