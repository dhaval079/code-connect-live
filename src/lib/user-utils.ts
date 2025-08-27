// src/lib/user-utils.ts
import { currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function ensureUserExists(clerkUserId: string) {
  try {
    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { id: clerkUserId }
    });

    if (!user) {
      console.log(`User ${clerkUserId} not found, creating new user...`);
      
      // Get user data from Clerk
      const clerkUser = await currentUser();
      
      if (clerkUser) {
        user = await prisma.user.create({
          data: {
            id: clerkUserId, // Use Clerk ID as the primary key
            email: clerkUser.emailAddresses[0]?.emailAddress,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            avatar: clerkUser.imageUrl || null,
          }
        });
        console.log(`User ${clerkUserId} created successfully`);
      } else {
        throw new Error('Could not fetch user data from Clerk');
      }
    }

    return user;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}