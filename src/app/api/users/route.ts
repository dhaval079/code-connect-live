
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    console.log('GET /api/messages - conversationId:', conversationId)
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }
    
    console.log('Fetching messages for conversationId:', conversationId)
    
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log('Found messages:', messages.length)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, role, conversationId, userId } = body
    
    console.log('POST /api/messages - body:', { role, conversationId, userId, contentLength: content?.length })
    
    if (!content || !role || !conversationId || !userId) {
      console.log('Missing required fields:', { content: !!content, role: !!role, conversationId: !!conversationId, userId: !!userId })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    console.log('Saving message:', { role, conversationId, userId, contentLength: content.length })
    
    const message = await prisma.message.create({
      data: {
        content,
        role,
        conversationId,
        userId
      }
    })
    
    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })
    
    console.log('Saved message:', message.id)
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}