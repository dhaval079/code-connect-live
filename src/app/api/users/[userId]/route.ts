
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }  // Make params a Promise
) {
  try {
    const { userId } = await params  // Await params before using
    
    console.log('Fetching user:', userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      console.log('User not found:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('Found user:', user.id)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}