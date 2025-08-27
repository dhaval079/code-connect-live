require('dotenv').config({ path: '.env' })

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found!')
    console.log('Current working directory:', process.cwd())
    console.log('Checking for .env file...')
    const fs = require('fs')
    console.log('.env exists:', fs.existsSync('.env'))
    if (fs.existsSync('.env')) {
      console.log('.env content preview:', fs.readFileSync('.env', 'utf8').substring(0, 50) + '...')
    }
    return
  }
  
  console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 30) + '...')
  
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    console.log('📡 Connecting to database...')
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // First, create a test user (required for foreign key constraint)
    console.log('👤 Creating test user...')
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@codeconnect.local'
      }
    })
    console.log('✅ Created test user:', testUser.id)
    
    // Now create conversation with the user's ID
    console.log('🧪 Testing conversation creation...')
    const testConversation = await prisma.conversation.create({
      data: {
        title: 'Test Conversation',
        userId: testUser.id  // Use the actual user ID
      }
    })
    console.log('✅ Created test conversation:', testConversation.id)
    
    console.log('🧪 Testing message creation...')
    const testMessage = await prisma.message.create({
      data: {
        content: 'Hello, this is a test message!',
        role: 'USER',
        conversationId: testConversation.id,
        userId: testUser.id  // Use the actual user ID
      }
    })
    console.log('✅ Created test message:', testMessage.id)
    
    console.log('🧹 Cleaning up test data...')
    await prisma.message.delete({ where: { id: testMessage.id } })
    await prisma.conversation.delete({ where: { id: testConversation.id } })
    await prisma.user.delete({ where: { id: testUser.id } })
    console.log('✅ Test data cleaned up')
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    if (error.code === 'P1001') {
      console.error('🔗 Database connection failed. Check your DATABASE_URL')
    } else if (error.code === 'P2002') {
      console.error('🔑 Unique constraint violation')
    } else if (error.code === 'P2003') {
      console.error('🔗 Foreign key constraint violation')
    } else if (error.code === 'P2025') {
      console.error('🔍 Record not found')
    }
  } finally {
    console.log('🔌 Disconnecting from database...')
    process.exit(0)
  }
}

testDatabaseConnection()