// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { ensureUserExists } from '@/lib/user-utils';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ No userId in GET conversations');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 GET conversations - userId:', userId);

    // Ensure user exists
    await ensureUserExists(userId);

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    console.log(`📊 Found conversations: ${conversations.length} for user: ${userId}`);
    console.log('📋 Conversation IDs:', conversations.map(c => ({ id: c.id, title: c.title, userId: c.userId })));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ No userId in POST conversations');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();
    
    console.log('✨ Creating conversation for userId:', userId, 'with title:', title);

    // Ensure user exists before creating conversation
    await ensureUserExists(userId);

    // Create the conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Chat',
        userId // Direct assignment since userId field stores Clerk ID
      }
    });

    console.log('✅ Created conversation:', { id: conversation.id, userId: conversation.userId });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}