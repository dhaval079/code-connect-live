// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { ensureUserExists } from '@/lib/user-utils';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, role, conversationId } = await request.json();
    
    if (!content || !role || !conversationId) {
      return NextResponse.json(
        { error: 'Missing required fields: content, role, conversationId' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be USER, ASSISTANT, or SYSTEM' },
        { status: 400 }
      );
    }

    console.log('💬 Saving message for userId:', userId, '| conversationId:', conversationId, '| role:', role);

    // Ensure user exists before creating message
    await ensureUserExists(userId);

    // Verify conversation exists and belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      }
    });

    if (!conversation) {
      console.log('❌ Conversation not found or does not belong to user:', { conversationId, userId });
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    console.log('✅ Conversation verified:', { id: conversation.id, belongsTo: conversation.userId });

    const message = await prisma.message.create({
      data: {
        content,
        role: role as Role,
        conversationId,
        userId // Direct assignment since userId field stores Clerk ID
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

// Add GET method if you need to fetch messages
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        userId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}