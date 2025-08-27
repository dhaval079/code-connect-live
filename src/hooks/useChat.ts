import { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  createdAt: string
  messages: Message[]
}

export function useChat(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations', {
        headers: { 'user-id': userId }
      })
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  // Fetch messages for specific conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      setMessages(data)
      setCurrentConversation(conversationId)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Send message
  const sendMessage = async (content: string, conversationId: string) => {
    try {
      // Save user message
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          role: 'USER',
          conversationId,
          userId
        })
      })

      // Add to local state immediately
      const userMessage = {
        id: Date.now().toString(),
        content,
        role: 'USER' as const,
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, userMessage])

      // Get AI response (implement your AI logic here)
      const aiResponse = await getAIResponse(content)
      
      // Save AI response
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: aiResponse,
          role: 'ASSISTANT',
          conversationId,
          userId
        })
      })

      // Add AI response to local state
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'ASSISTANT' as const,
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Create new conversation
  const createConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const newConversation = await response.json()
      setConversations(prev => [newConversation, ...prev])
      return newConversation.id
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchConversations()
    }
  }, [userId])

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    fetchMessages,
    sendMessage,
    createConversation,
    fetchConversations
  }
}

// Placeholder for AI response - implement your AI logic
async function getAIResponse(message: string): Promise<string> {
  // Replace with your actual AI API call
  return `AI response to: ${message}`
}