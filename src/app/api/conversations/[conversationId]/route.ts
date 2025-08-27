// src/app/api/conversations/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// DELETE conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;

    console.log('🗑️ Deleting conversation:', conversationId, 'for user:', userId);

    // Add validation for conversationId
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify the conversation belongs to the user before deleting
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the conversation (messages will be deleted due to cascade)
    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    console.log('✅ Conversation deleted successfully');

    return NextResponse.json({ success: true, message: 'Conversation deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation', details: (error as any).message },
      { status: 500 }
    );
  }
}

// PATCH conversation (update title)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();
    const { conversationId } = await params;

    console.log('✏️ Updating conversation title:', { conversationId, title, userId });

    // Add validation
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Verify the conversation belongs to the user before updating
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // Update the conversation title
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        title: title.trim(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Conversation title updated successfully');

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
      message: 'Title updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation', details: (error as any).message },
      { status: 500 }
    );
  }
}

// GET single conversation (optional - for debugging)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);

  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}