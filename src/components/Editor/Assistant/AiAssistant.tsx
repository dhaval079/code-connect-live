"use client"
import React, { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useAnimation, Variants } from "framer-motion"
import {
  Bot, Copy, Check, MessageCircle, RotateCcw, X, Sparkles, Trash2, Plus,
  AlertTriangle, Search, Download, Bookmark, BookmarkCheck,
  Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2, Clock, Share2,
  ChevronDown, ChevronUp, Zap, Star, ThumbsUp, ThumbsDown, Edit3,
  Save, FileText, Moon, Sun, Type, Palette,
  Loader,
  MessagesSquare,
  MessageSquareDiff,
  MessageCirclePlus,
  Fan,
  Menu,
  MessageSquare,
  NotebookPen,
  PenBoxIcon,
  Settings2,
  Cog,
  LayoutGrid,
  CogIcon
} from "lucide-react";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import OpenAI from "openai"
import { PlaceholdersAndVanishInput } from "../../ui/placeholders-and-vanish-input"
import AIThinkingAnimation from "../AiThinking"
import Image from "next/image";
import { ToolTipText } from "../ToolTip";
import { Sidebar } from "../Sidebar";
import { EmptyState } from "./EmptyState";
import { Settings, SettingsPanel } from "./SettingsPanel";

const { GoogleGenerativeAI } = require("@google/generative-ai")

// Enhanced animations
const messageAnimations: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const, // easeOut cubic-bezier
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
}

// Enhanced interface for messages
interface Message {
  id: string
  content: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'  // Changed from type to role
  createdAt: string  // Changed from timestamp
  isBookmarked?: boolean
  rating?: 'up' | 'down' | null
  isEdited?: boolean
  originalContent?: string
}

interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

class ChatService {
  static async createOrGetUser(userId: string, username?: string): Promise<any> {
    try {
      console.log('Creating/getting user:', { userId, username })

      // Try to find existing user first
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const existingUser = await response.json()
        console.log('Found existing user:', existingUser.id)
        return existingUser
      }

      // Create new user if not found
      console.log('Creating new user...')
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          name: username || `User ${userId}`,
          email: `${userId}@codeconnect.local`
        })
      })

      if (createResponse.ok) {
        const newUser = await createResponse.json()
        console.log('Created new user:', newUser.id)
        return newUser
      }

      throw new Error('Failed to create user')
    } catch (error) {
      console.error('Failed to create or get user:', error)
      return null
    }
  }

  static async fetchConversations(userId: string, username?: string): Promise<ChatSession[]> {
    try {
      // Ensure user exists first
      await this.createOrGetUser(userId, username)

      const response = await fetch('/api/conversations', {
        headers: { 'user-id': userId }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      return [];
    }
  }

  static async createConversation(userId: string, username?: string, title?: string): Promise<ChatSession | null> {
    try {
      // Ensure user exists first
      await this.createOrGetUser(userId, username)

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'New Chat',
          userId
        })
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return await response.json();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  }

  static async fetchMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  static async saveMessage(message: {
    content: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    conversationId: string;
    userId: string;
  }): Promise<Message | null> {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      if (!response.ok) throw new Error('Failed to save message');
      return await response.json();
    } catch (error) {
      console.error('Failed to save message:', error);
      return null;
    }
  }


  // Update these methods in your ChatService class

  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      console.log('🗑️ Attempting to delete conversation:', conversationId);

      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Delete response:', result);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Delete failed:', response.status, errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error in deleteConversation:', error);
      return false;
    }
  }

  static async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    try {
      console.log('✏️ Attempting to update title:', { conversationId, title });

      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title.trim() })
      });

      console.log('Update response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Update response:', result);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Update failed:', response.status, errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error in updateConversationTitle:', error);
      return false;
    }
  }
}


const CustomLogo = () => {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center pt-2">
      <Image
        src="/ailogo.svg"
        width={50}
        height={50}
        alt="Code Connect AI"
      />
    </div>
  )
}

// Enhanced Code Block with line numbers and better styling
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = React.useState(false)
  const [showLineNumbers, setShowLineNumbers] = React.useState(true)

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  return (
    <div className="relative my-4 rounded-xl overflow-hidden bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/30">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{language || "code"}</span>
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showLineNumbers ? 'Hide' : 'Show'} lines
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">{lines.length} lines</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="h-7 px-2 hover:bg-slate-700/50 transition-all duration-200"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <Copy className="h-5 w-5 text-slate-400 hover:text-slate-200" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex">
        {showLineNumbers && (
          <div className="bg-slate-800/30 px-3 py-4 text-xs text-slate-500 font-mono select-none">
            {lines.map((_, index) => (
              <div key={index} className="leading-relaxed">
                {index + 1}
              </div>
            ))}
          </div>
        )}
        <pre className="flex-1 p-4 overflow-x-auto">
          <code className="text-sm text-slate-100 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

// Enhanced message formatting
interface MessagePart {
  type: "text" | "code"
  content: string
  language?: string
}

const formatMessage = (content: string): MessagePart[] => {
  const parts: MessagePart[] = []
  let currentText = ""
  let inCodeBlock = false
  let currentCode = ""
  let language = ""

  if (!content) {
    return [{ type: "text", content: "" }]
  }

  let fixedContent = content
  const asteriskRegex = /\*\*(?!\s*\*\*)(.*?)(?<!\s*\*\*)\*\*/g
  fixedContent = fixedContent.replace(asteriskRegex, "<strong>$1</strong>")

  const italicRegex = /\*(?!\s*\*)(.*?)(?<!\s*\*)\*/g
  fixedContent = fixedContent.replace(italicRegex, "<em>$1</em>")

  fixedContent = fixedContent.replace(/^\s*\*\s+/gm, "• ")

  const lines = fixedContent.split("\n")

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        parts.push({ type: "code", content: currentCode.trim(), language })
        currentCode = ""
        language = ""
        inCodeBlock = false
      } else {
        if (currentText) {
          parts.push({ type: "text", content: currentText.trim() })
          currentText = ""
        }
        language = line.slice(3).trim()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      currentCode += line + "\n"
    } else {
      currentText += line + "\n"
    }
  }

  if (inCodeBlock && currentCode) {
    parts.push({ type: "code", content: currentCode.trim(), language })
  }

  if (currentText) {
    parts.push({ type: "text", content: currentText.trim() })
  }

  return parts
}

// Enhanced Message Content with better styling
export const MessageContent = ({ content, fontSize = 'medium' }: { content: string; fontSize?: string }) => {
  const parts = formatMessage(content)

  const fontSizeClass = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-md'
  }[fontSize]

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <CodeBlock code={part.content} language={part.language ?? "text"} />
            </motion.div>
          )
        }

        const paragraphs = part.content.split("\n\n")

        return (
          <React.Fragment key={index}>
            {paragraphs.map((paragraph, pIndex) => (
              <motion.p
                key={`${index}-${pIndex}`}
                className={`${fontSizeClass} leading-7 whitespace-pre-wrap break-words text-slate-100`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1 + pIndex * 0.05,
                  ease: "easeOut",
                }}
                dangerouslySetInnerHTML={{
                  __html: paragraph
                    .replace(/^\s*\*\s+/gm, "• ")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/&lt;strong&gt;/g, "<strong>")
                    .replace(/&lt;\/strong&gt;/g, "</strong>")
                    .replace(/&lt;em&gt;/g, "<em>")
                    .replace(/&lt;\/em&gt;/g, "</em>"),
                }}
              />
            ))}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Enhanced Message Container with search functionality
const MessageContainer = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode
  searchTerm?: string
  sidebarOpen: boolean
}>(({ children, searchTerm, sidebarOpen }, ref) => (
  <div className="flex-1 overflow-hidden max-h-[84%]">
    <ScrollArea className="max-h-[84%]">
      <div className="p-6">
        <div
          className={`space-y-10 mx-auto mt-1 mb-12 transition-all duration-300 ${sidebarOpen
            ? 'w-[60%] lg:w-[55%]'
            : 'w-[55%]'
            }`}
          ref={ref}
        >
          {children}
        </div>
      </div>
    </ScrollArea>
  </div>
))

MessageContainer.displayName = "MessageContainer"

// Settings Panel Component



interface AiAssistantProps {
  isOpen: boolean
  onToggle: () => void
  userId: string  // Add this required prop
  username: string
}

const AiAssistant = ({ isOpen, onToggle, userId, username }: AiAssistantProps) => {
  // Enhanced state management
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [selectedChatId, setSelectedChatId] = useState<string>('new')
  const [showSettings, setShowSettings] = useState(false)
  const [conversations, setConversations] = useState<ChatSession[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showUserActions, setShowUserActions] = useState<string | null>(null)
  const [userMessageCopied, setUserMessageCopied] = useState<string | null>(null)

  useEffect(() => {
    if (userId && isOpen) {
      loadConversations();
    }
  }, [userId, isOpen]);


  const loadConversations = async () => {
    console.log('Loading conversations for:', { userId, username })
    setIsLoadingConversations(true);
    const fetchedConversations = await ChatService.fetchConversations(userId, username);
    setConversations(fetchedConversations);
    setIsLoadingConversations(false);
  };

  // UPDATE createNewConversation to pass username
  const createNewConversation = async () => {
    console.log('Creating new conversation for:', { userId, username })
    const newConversation = await ChatService.createConversation(userId, username);
    if (newConversation) {
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setSelectedChatId(newConversation.id);
      setMessages([]);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const fetchedMessages = await ChatService.fetchMessages(conversationId);
    setMessages(fetchedMessages);
    setCurrentConversationId(conversationId);
    setSelectedChatId(conversationId);
  };



  // Settings state
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    fontSize: 'large',
    voiceEnabled: false,
    autoScroll: true,
    showTimestamps: false,
    compactMode: false
  })

  // Refs
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        })
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [messages, isLoading, settings.autoScroll])

  const scrollToBottom = useCallback(() => {
    if (!settings.autoScroll) return

    const timeoutId = setTimeout(() => {
      try {
        // Method 1: Try to find the ScrollArea viewport
        const scrollAreaViewport = document.querySelector("[data-radix-scroll-area-viewport]")
        if (scrollAreaViewport) {
          scrollAreaViewport.scrollTo({
            top: scrollAreaViewport.scrollHeight,
            behavior: 'smooth'
          })
          return
        }

        // Method 2: Use the ref
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end"
          })
        }
      } catch (error) {
        console.error("Error scrolling to bottom:", error)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [settings.autoScroll]

  )

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Also add this useEffect to scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length, scrollToBottom])

  // Enhanced handlers
  const handleNewChat = async () => {
    await createNewConversation();
    setInput("");
    setCopiedMessageId(null);
    setShowDeleteConfirm(false);
    setSearchTerm("");
    setShowSearch(false);
  };

  const handleDeleteChat = () => {
    if (messages.length > 0) {
      setShowDeleteConfirm(true)
    }
  }

  const handleUserMessageCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setUserMessageCopied(messageId)
      setTimeout(() => setUserMessageCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  const handleUserMessageEdit = (message: Message) => {
    // Add your edit logic here - could open a modal, enable inline editing, etc.
    console.log('Edit message:', message)
    // Example: setEditingMessageId(message.id); setEditContent(message.content);
  }

  // Add these handler functions to your component
  const handleRenameChat = (chatId: string, currentTitle: string) => {
    setIsRenaming(chatId);
    setRenameValue(currentTitle);
  };

  const cancelRename = () => {
    setIsRenaming(null);
    setRenameValue("");
  };

  // Replace your existing handler functions with these improved versions

  const handleDeleteConversation = async (chatId: string) => {
    console.log('🚀 Starting delete conversation process for:', chatId);

    // Enhanced confirmation
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this conversation?\n\nThis action cannot be undone and will permanently remove all messages.'
    );

    if (!confirmDelete) {
      console.log('❌ User cancelled deletion');
      return;
    }

    try {
      console.log('🔄 Calling ChatService.deleteConversation...');
      const success = await ChatService.deleteConversation(chatId);

      console.log('🎯 Delete operation result:', success);

      if (success) {
        console.log('✅ Successfully deleted conversation, updating state...');

        // Update conversations list
        setConversations(prev => {
          const updated = prev.filter(conv => conv.id !== chatId);
          console.log('📊 Updated conversations count:', updated.length);
          return updated;
        });

        // If we deleted the current conversation, reset to new chat
        if (chatId === currentConversationId) {
          console.log('🔄 Deleted current conversation, resetting to new chat...');
          setCurrentConversationId(null);
          setSelectedChatId('new');
          setMessages([]);
        }

        console.log('✅ Conversation deleted and state updated successfully');

        // Show success feedback
        // You can replace this with a toast notification if you have one
        alert('Conversation deleted successfully!');

      } else {
        console.error('❌ Delete operation returned false');
        alert('Failed to delete conversation. Please check the console for details and try again.');
      }
    } catch (error) {
      console.error('❌ Exception in handleDeleteConversation:', error);
      alert(`Error deleting conversation: ${(error as any).message}`);
    }
  };

  const saveRename = async (chatId: string) => {
    if (!renameValue.trim()) {
      console.log('❌ Empty rename value, cancelling...');
      cancelRename();
      return;
    }

    console.log('🚀 Starting rename process:', { chatId, newTitle: renameValue.trim() });

    try {
      console.log('🔄 Calling ChatService.updateConversationTitle...');
      const success = await ChatService.updateConversationTitle(chatId, renameValue.trim());

      console.log('🎯 Rename operation result:', success);

      if (success) {
        console.log('✅ Successfully renamed conversation, updating state...');

        // Update conversations list
        setConversations(prev => {
          const updated = prev.map(conv =>
            conv.id === chatId
              ? { ...conv, title: renameValue.trim() }
              : conv
          );
          console.log('📊 Updated conversation titles:', updated.map(c => ({ id: c.id, title: c.title })));
          return updated;
        });

        console.log('✅ Conversation renamed successfully');

        // Show success feedback (optional)
        console.log(`✨ Conversation renamed to: "${renameValue.trim()}"`);

      } else {
        console.error('❌ Rename operation returned false');
        alert('Failed to rename conversation. Please check the console for details and try again.');
      }
    } catch (error) {
      console.error('❌ Exception in saveRename:', error);
      alert(`Error renaming conversation: ${(error as any).message}`);
    } finally {
      // Always clean up rename state
      console.log('🧹 Cleaning up rename state...');
      setIsRenaming(null);
      setRenameValue("");
    }
  };

  // Call this function in useEffect to test on component mount (temporary)
  useEffect(() => {
    if (userId && isOpen) {
      loadConversations();
      // Uncomment the line below to test API routes
      // testApiRoutes();
    }
  }, [userId, isOpen]);




  const handleBookmark = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isBookmarked: !msg.isBookmarked }
          : msg
      )
    )
  }

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, rating: msg.rating === rating ? null : rating }
          : msg
      )
    )
  }

  const handleEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId)
    setEditContent(currentContent)
  }

  const saveEdit = () => {
    if (editingMessageId) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingMessageId
            ? {
              ...msg,
              content: editContent,
              isEdited: true,
              originalContent: msg.originalContent || msg.content
            }
            : msg
        )
      )
    }
    setEditingMessageId(null)
    setEditContent("")
  }

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages,
      settings: settings
    }
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareChat = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Chat Conversation',
          text: messages.slice(-3).map(m => `${m.role}: ${m.content.slice(0, 100)}...`).join('\n'),
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      const chatText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
      await navigator.clipboard.writeText(chatText)
      alert('Chat copied to clipboard!')
    }
  }

  const filteredMessages = messages.filter(message =>
    !searchTerm || message.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const askAI = async (question: any) => {
    try {
      setIsLoading(true)
      const genAI = new GoogleGenerativeAI("AIzaSyCF6mKRofVaWa-4RC6hjYQtijNqxOZSt58")
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      const result = await model.generateContent(question)
      const responseContent = result.response.text()
      if (responseContent) {
        return responseContent
      }
      throw new Error("Invalid response format from AI service")
    } catch (error) {
      console.error("AI request error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }


  const generateConversationTitle = async (firstMessage: string): Promise<string> => {
    try {
      console.log('Generating professional title for message:', firstMessage.substring(0, 50) + '...')

      const genAI = new GoogleGenerativeAI("AIzaSyCF6mKRofVaWa-4RC6hjYQtijNqxOZSt58")
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      // More explicit prompt to get ONLY one title
      const basePrompt = `You are a professional title generator. Create ONE title only for this message: "${firstMessage}"

STRICT REQUIREMENTS:
- Return ONLY the title (nothing else)
- Maximum 5 words
- Professional business language
- No bullet points, options, or explanations
- No quotes, asterisks, or formatting
- Focus on the main technical topic

GOOD EXAMPLES:
React Component Design
API Integration Help
Database Performance Issue
Code Review Session

YOUR TITLE:`

      const result = await model.generateContent(basePrompt)
      let title = result.response.text().trim()

      console.log('Raw AI response:', title)

      // Enhanced parsing for multiple options or explanatory text
      title = extractCleanTitle(title)

      console.log('Extracted title:', title)

      // Professional cleanup
      title = title.replace(/['"*]/g, '') // Remove quotes and asterisks
      title = title.replace(/^title:?\s*/i, '') // Remove "Title:" prefix
      title = title.replace(/\.+$/, '') // Remove trailing periods
      title = title.replace(/^\d+\.\s*/, '') // Remove numbered list format
      title = title.replace(/^-\s*/, '') // Remove dash prefix
      title = title.replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      title = title.replace(/\s+/g, ' ') // Normalize spaces
      title = title.trim()

      // Enforce 3-4 words maximum
      const words = title.split(' ').filter((word: any) => word.length > 0)
      if (words.length > 5) {
        title = words.slice(0, 5).join(' ')
      }

      // Professional Title Case
      title = title.split(' ')
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      // Quality validation
      if (title.length < 3 || words.length < 2) {
        throw new Error('Generated title too short')
      }

      // Avoid generic titles
      const genericWords = ['chat', 'conversation', 'discussion', 'talk', 'new', 'here', 'are', 'few', 'options']
      if (genericWords.some(generic => title.toLowerCase().includes(generic))) {
        throw new Error('Generic title generated, using fallback')
      }

      console.log('Final professional title:', title)
      return title

    } catch (error) {
      console.error('Error generating title, using fallback:', (error as any).message)

      // Intelligent fallback based on message content
      return generateSmartFallback(firstMessage)
    }
  }

  // Helper function to extract clean title from AI response
  const extractCleanTitle = (response: string): string => {
    // Remove common intro phrases
    let cleaned = response.replace(/^(here are?|some options?|suggestions?|titles?):?\s*/i, '')

    // If response contains bullets or multiple options, extract the first good one
    const lines = cleaned.split('\n').filter(line => line.trim())

    for (const line of lines) {
      // Look for lines that look like titles (with bullets, asterisks, or just text)
      let candidate = line.replace(/^[*•\-\d\.\s]+/, '').trim()

      // Skip explanatory text
      if (candidate.toLowerCase().includes('general') ||
        candidate.toLowerCase().includes('specific') ||
        candidate.toLowerCase().includes('option') ||
        candidate.length > 30) {
        continue
      }

      // If it looks like a good title (3-20 chars, 2-4 words)
      const words = candidate.split(' ').filter(w => w.length > 0)
      if (words.length >= 2 && words.length <= 5 && candidate.length >= 3 && candidate.length <= 25) {
        return candidate
      }
    }

    // If no good title found in lines, try to extract from the beginning
    const firstLine = lines[0] || response
    return firstLine.replace(/^[*•\-\d\.\s]+/, '').trim()
  }

  // Smart fallback that analyzes the message content
  const generateSmartFallback = (message: string): string => {
    const messageLower = message.toLowerCase()

    // Technology-specific titles
    if (messageLower.includes('react')) return 'React Development'
    if (messageLower.includes('javascript') || messageLower.includes('js')) return 'JavaScript Implementation'
    if (messageLower.includes('typescript') || messageLower.includes('ts')) return 'TypeScript Development'
    if (messageLower.includes('python')) return 'Python Programming'
    if (messageLower.includes('api')) return 'API Integration'
    if (messageLower.includes('database') || messageLower.includes('db')) return 'Database Query'
    if (messageLower.includes('auth')) return 'Authentication Setup'
    if (messageLower.includes('deploy')) return 'Deployment Strategy'
    if (messageLower.includes('test')) return 'Testing Framework'
    if (messageLower.includes('bug') || messageLower.includes('error')) return 'Bug Investigation'
    if (messageLower.includes('performance')) return 'Performance Analysis'
    if (messageLower.includes('security')) return 'Security Review'

    // Question type analysis
    if (messageLower.includes('how to') || messageLower.includes('how do')) return 'Implementation Guide'
    if (messageLower.includes('what is') || messageLower.includes('what are')) return 'Concept Explanation'
    if (messageLower.includes('why') || messageLower.includes('difference')) return 'Technical Analysis'

    // Generic professional fallbacks
    const fallbackTitles = [
      "Technical Consultation",
      "Code Implementation",
      "System Architecture",
      "Problem Resolution",
      "Development Help",
      "Feature Planning",
      "Code Review"
    ]

    return fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)]
  }

  // Helper function to extract key technical terms for better context
  const extractKeyTerms = (message: string): string[] => {
    const technicalTerms = [
      'react', 'javascript', 'typescript', 'python', 'java', 'node', 'api', 'database',
      'sql', 'mongodb', 'firebase', 'aws', 'docker', 'kubernetes', 'git', 'github',
      'frontend', 'backend', 'fullstack', 'microservices', 'authentication', 'authorization',
      'oauth', 'jwt', 'rest', 'graphql', 'websocket', 'cdn', 'ci/cd', 'devops',
      'testing', 'debugging', 'performance', 'security', 'encryption', 'ssl', 'https'
    ]

    const messageLower = message.toLowerCase()
    return technicalTerms.filter(term => messageLower.includes(term))
  }


  const handleSubmit = async (e: any) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!input.trim() || isLoading) return;

    console.log('📝 Submitting message for:', { userId, username })
    console.log('📊 Current state:', {
      currentConversationId,
      messagesLength: messages.length,
      hasExistingConversation: !!currentConversationId
    })

    // Check if this is the first message (no conversation exists AND no messages)
    const isFirstMessage = messages.length === 0; // Simple and correct logic
    console.log('🔍 Is first message?', isFirstMessage)

    let conversationId = currentConversationId;
    let newConversation: ChatSession | null = null;

    if (!conversationId) {
      console.log('🆕 Creating new conversation...')
      // Create conversation with temporary title for first message
      newConversation = await ChatService.createConversation(userId, username, "New Chat");
      if (!newConversation) {
        console.error('❌ Failed to create conversation')
        return;
      }
      conversationId = newConversation.id;
      setCurrentConversationId(conversationId);
      setConversations(prev => [newConversation!, ...prev]);
      console.log('✅ New conversation created:', conversationId)
    }

    const currentInput = input;
    setInput("");

    // Save user message to database
    console.log('💾 Saving user message...')
    const userMessage = await ChatService.saveMessage({
      content: currentInput,
      role: 'USER',
      conversationId,
      userId
    });

    if (userMessage) {
      setMessages(prev => [...prev, userMessage]);
      console.log('✅ User message saved')
    } else {
      console.error('❌ Failed to save user message')
    }

    try {
      setIsLoading(true);

      console.log('🤖 Getting AI response...')
      // Generate AI response
      const aiResponse = await askAI(currentInput);

      // Save AI response to database
      console.log('💾 Saving AI response...')
      const aiMessage = await ChatService.saveMessage({
        content: aiResponse,
        role: 'ASSISTANT',
        conversationId,
        userId
      });

      if (aiMessage) {
        setMessages(prev => [...prev, aiMessage]);
        console.log('✅ AI message saved')
      }

      // Generate and update title for first message
      if (isFirstMessage && conversationId) {
        console.log('🎯 Starting title generation process...')
        console.log('📝 First message content:', currentInput)

        try {
          const generatedTitle = await generateConversationTitle(currentInput);
          console.log('✨ Generated title:', generatedTitle)

          // Update conversation title in database
          console.log('🔄 Updating title in database...')
          const titleUpdated = await ChatService.updateConversationTitle(conversationId, generatedTitle);

          if (titleUpdated) {
            console.log('✅ Title updated in database successfully')
            // Update local state
            setConversations(prev =>
              prev.map(conv =>
                conv.id === conversationId
                  ? { ...conv, title: generatedTitle }
                  : conv
              )
            );
            console.log('✅ Local state updated with new title:', generatedTitle)
          } else {
            console.error('❌ Failed to update title in database')
          }
        } catch (titleError) {
          console.error('❌ Title generation failed:', titleError)
        }
      } else {
        console.log('⏭️ Skipping title generation:', { isFirstMessage, conversationId })
      }

    } catch (error) {
      console.error("❌ Error in AI response:", error);

      const errorMessage = await ChatService.saveMessage({
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
        role: 'ASSISTANT',
        conversationId,
        userId
      });

      if (errorMessage) {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };


  // ADD this useEffect to log username changes
  useEffect(() => {
    console.log('AiAssistant props updated:', { userId, username, isOpen })
  }, [userId, username, isOpen])

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex <= 0 || messageIndex >= messages.length) return

    const userMessage = messages[messageIndex - 1]
    if (userMessage.role !== "USER") return  // FIXED: changed from .type to .role

    setMessages((prev) => prev.slice(0, messageIndex))

    // Get conversation ID for saving regenerated response
    let conversationId = currentConversationId;
    if (!conversationId) return;

    try {
      setIsLoading(true)
      const aiResponse = await askAI(userMessage.content)

      // Save regenerated AI response to database
      const aiMessage = await ChatService.saveMessage({
        content: aiResponse,
        role: 'ASSISTANT',
        conversationId,
        userId
      });

      if (aiMessage) {
        setMessages(prev => [...prev, aiMessage]);
      }
      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error("Error regenerating response:", error)

      const errorMessage = await ChatService.saveMessage({
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
        role: 'ASSISTANT',
        conversationId,
        userId
      });

      if (errorMessage) {
        setMessages(prev => [...prev, errorMessage]);
      }
      setTimeout(() => scrollToBottom(), 100)
    } finally {
      setIsLoading(false)
    }
  }

  const placeholders = [
    "Ask Anything",
    "What is the concept of React.js?",
    "Ask Anything",
    "Write a Javascript method to reverse a string",
    "Ask Anything"
  ]

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            opacity: { duration: 0.2 }
          }}
          className="fixed inset-0 bg-[#212121] backdrop-blur-lg flex z-50 overflow-hidden"
        >
          {/* Sidebar */}
          <>
            {/* Search Modal Overlay */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSearch(false)}
                >
                  <motion.div
                    className="bg-gray-900 border border-gray-700 rounded-xl p-4 max-w-md w-full mx-4 shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: -20 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search your chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => setShowSearch(false)}
                        className="p-1 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Search Results */}
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {conversations
                        .filter(chat =>
                          chat.title.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((chat) => (
                          <motion.button
                            key={chat.id}
                            onClick={() => {
                              loadMessages(chat.id);
                              setShowSearch(false);
                              setSearchTerm("");
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors group"
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <p className="text-sm text-white truncate">{chat.title}</p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {new Date(chat.createdAt).toLocaleDateString()}
                            </p>
                          </motion.button>
                        ))}

                      {searchTerm && conversations.filter(chat =>
                        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No chats found
                          </div>
                        )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Sidebar */}
            <motion.div
              className="w-64 bg-black border-r border-gray-800/50 flex flex-col h-full relative overflow-hidden"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                staggerChildren: 0.05
              }}
            >
              {/* Subtle Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-transparent to-gray-900/20 pointer-events-none" />

              {/* Top Navigation Section */}
              <motion.div
                className="flex-shrink-0 p-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <motion.button
                  onClick={handleNewChat}
                  className="w-full flex items-center rounded-lg text-white/90 transition-all duration-200 group relative overflow-hidden"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <motion.div
                    // whileHover={{ rotate: 2 }}
                    transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                    className="hover:bg-neutral-700 ml-2"
                  >
                    <CustomLogo />
                  </motion.div>
                  {/* <span className="text-sm font-medium relative z-10">CodeConnect</span> */}

                  {/* Hover background effect */}
                  <motion.div
                    className="absolute inset-0  rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
                {/* New Chat Button */}
                <motion.button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-3 px-3 py-3 -mb-1 rounded-lg text-white/90 hover:bg-gray-800 transition-all duration-200 group relative overflow-hidden"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                  >
                    {/* <PenBoxIcon className="w-4 h-4 relative z-10" /> */}
                    <Plus className="w-4 h-4 relative z-10" />

                  </motion.div>
                  <span className="text-sm font-medium relative z-10">New chat</span>

                  {/* Hover background effect */}
                  <motion.div
                    className="absolute inset-0 bg-gray-800 rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>

                {/* Navigation Items */}
                <div className="mt-2 space-y-1">
                  {[
                    {
                      icon: Search,
                      label: "Search chats",
                      onClick: () => setShowSearch(true),
                      delay: 0.2
                    },
                    {
                      icon: BookmarkCheck,
                      label: "Library",
                      delay: 0.25
                    },
                    {
                      icon: Sparkles,
                      label: "Explore",
                      delay: 0.3
                    },
                    {
                      icon: LayoutGrid,
                      label: "Models",
                      delay: 0.35
                    }
                  ].map((item, index) => (
                    <motion.button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 group relative overflow-hidden"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: item.delay, duration: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: item.label === "Sora" || item.label === "GPTs" ? 360 : 0 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
                      >
                        <item.icon className="w-4 h-4 relative z-10" />
                      </motion.div>
                      <span className="text-sm relative z-10">{item.label}</span>

                      {/* Hover background effect */}
                      <motion.div
                        className="absolute inset-0 bg-gray-800 rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Chats Section - Replace your existing chat section with this */}
              <motion.div
                className="flex-1 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              // transition={{ delay: 0.4, duration: 0.5 }}
              >
                {/* Section Header */}
                <div className="px-2 py-2 border-b border-gray-800/30">
                  <h3 className="text-xs font-bold text-neutral-400  tracking-wider px-2">
                    Chats
                  </h3>
                </div>

                {/* Chat List with Custom Scrollbar */}
                <ScrollArea className="h-full scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-transparent [&>div>div[style]]:!pr-0">
                  {/* <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(115, 115, 115, 0.95);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(115, 115, 115, 1);
      }
    `}</style> */}
                  <div className="py-2 scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-transparent">
                    {isLoadingConversations ? (
                      <div className="flex items-center justify-center mx-auto h-full w-full py-8">
                        <Loader className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        No conversations yet
                      </div>
                    ) : (
                      conversations.map((chat) => (
                        <div
                          key={chat.id}
                          className={`relative mx-2 mb-1 rounded-lg  ${selectedChatId === chat.id ? 'bg-gray-800' : 'hover:bg-neutral-700/60'
                            }`}
                          onMouseEnter={(e) => {
                            const actionsEl = e.currentTarget.querySelector('.chat-actions');
                            if (actionsEl) (actionsEl as any).style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            const actionsEl = e.currentTarget.querySelector('.chat-actions');
                            if (actionsEl) (actionsEl as any).style.opacity = '0';
                          }}
                        >
                          {/* Main Chat Button */}
                          <div className="relative">
                            <button
                              onClick={() => !isRenaming ? loadMessages(chat.id) : null}
                              className={`w-full text-left py-2 rounded-lg relative ${selectedChatId === chat.id
                                ? 'bg-neutral-700/70 text-white'
                                : 'text-white'
                                }`}
                            >
                              {/* Active Indicator */}
                              {selectedChatId === chat.id && (
                                <div className="w-full fixed bottom-0 left-1 right-10 rounded-full" />
                              )}

                              {/* Chat Title or Rename Input */}
                              <div className="ml-2 overflow-x-hidden">
                                {isRenaming === chat.id ? (
                                  <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveRename(chat.id);
                                      } else if (e.key === 'Escape') {
                                        cancelRename();
                                      }
                                    }}
                                    onBlur={() => saveRename(chat.id)}
                                    className="w-full bg-gray-700 text-white text-sm px-2 py-1  rounded border border-gray-600 outline-none focus:border-blue-500"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <p
                                    className="text-sm font-medium truncate"
                                    style={{
                                      maxWidth: '180px', // Fixed width to ensure buttons space
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                    title={chat.title} // Show full title on hover
                                  >
                                    {chat.title}
                                  </p>
                                )}
                              </div>
                            </button>

                            {/* Action Buttons - Always present but hidden */}
                            {isRenaming !== chat.id && (
                              <div
                                className="chat-actions absolute right-1 top-1/2 -translate-y-1/2 transition-opacity  opacity-100 backdrop-blur-md duration-200 z-60"
                                style={{ opacity: 0 }}
                              >
                                <div className="flex items-center rounded-xl shadow-lg p-0.5">
                                  {/* Rename Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRenameChat(chat.id, chat.title);
                                    }}
                                    className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                    title="Rename"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteConversation(chat.id);
                                    }}
                                    className="p-1.5 rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </motion.div>

              {/* Bottom Section - Upgrade Plan */}
              <motion.div
                className="flex-shrink-0 border-t border-gray-800/50 p-2"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4, type: "spring" }}
              >


                {/* Settings Button */}
                <motion.button
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 group relative overflow-hidden"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <CogIcon className="w-4 h-4 relative z-10" />
                  </motion.div>
                  <span className="text-sm relative z-10">Settings</span>

                  {/* Hover background effect */}
                  <motion.div
                    className="absolute inset-0 bg-gray-800 rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              </motion.div>

              {/* Subtle animated particles */}
              <motion.div
                className="absolute top-1/4 right-2 w-1 h-1 bg-gray-600/30 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 0,
                }}
              />
              <motion.div
                className="absolute top-1/2 right-4 w-0.5 h-0.5 bg-gray-500/40 rounded-full"
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  delay: 2,
                }}
              />
            </motion.div>
          </>


          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Main Header */}
            <motion.div
              className="p-2 flex items-center justify-between"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="flex items-center space-x-4 ml-3 mt-2">
                <h2 className="text-white font-semibold">
                  {selectedChatId === 'new' ? 'New Conversation' :
                    conversations.find(c => c.id === selectedChatId)?.title || 'Chat'}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <ToolTipText content="Download" variant="glass" animation="fade">
                  <motion.button
                    onClick={exportChat}
                    disabled={messages.length === 0}
                    className="h-9 w-9 rounded-lg  hover:bg-slate-700/50 transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                  </motion.button>
                </ToolTipText>

                <ToolTipText content="Share" variant="glass" animation="fade">
                  <motion.button
                    onClick={shareChat}
                    disabled={messages.length === 0}
                    className="h-9 w-9 rounded-lg  hover:bg-slate-700/50 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="w-4 h-4 text-slate-400" />
                  </motion.button>
                </ToolTipText>

                <ToolTipText content="Delete Chat" variant="dark" animation="fade">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Find current conversation by selectedChatId
                      const currentChat = conversations.find(c => c.id === selectedChatId);
                      if (currentChat && selectedChatId !== 'new') {
                        handleDeleteConversation(currentChat.id);
                      }
                    }}
                    disabled={selectedChatId === 'new' || !selectedChatId || messages.length === 0}
                    className="h-9 w-9 rounded-lg hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </motion.button>
                </ToolTipText>

                <ToolTipText content="Close" variant="dark" animation="fade">
                  <motion.button
                    onClick={onToggle}
                    className="h-9 w-9 rounded-lg  hover:bg-slate-700/50 transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </motion.button>
                </ToolTipText>
              </div>
            </motion.div>

            {/* Messages Area */}
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center mb-10">
                <div className="flex-shrink-0 mb-6 max-w-3xl">
                  <EmptyState />
                </div>
                <div className="w-full max-w-3xl">
                  <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={(e) => setInput(e.target.value)}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* FIXED SCROLL AREA - Remove fixed height constraints */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[84%]">
                    <div className="p-6 pb-32"> {/* Added bottom padding for input area */}
                      <div className="w-[63%] mx-auto space-y-6 mt-6">
                        <AnimatePresence mode="popLayout">
                          {filteredMessages.map((message, index) => (
                            <motion.div
                              key={message.id}
                              variants={messageAnimations}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="group"
                            >
                              {/* Your existing message rendering code stays the same */}
                              {message.role === "USER" ? (
                                <div className="flex justify-end mb-12">
                                  <div className="max-w-[60%]">
                                    {settings.showTimestamps && (
                                      <div className="text-xs text-slate-500 mb-1 text-right">
                                        {formatTimestamp(message.createdAt)}
                                      </div>
                                    )}
                                    <motion.div
                                      className="relative group/message"
                                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                      animate={{ opacity: 1, x: 0, scale: 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25,
                                        opacity: { duration: 0.3 }
                                      }}
                                      onHoverStart={() => setShowUserActions(message.id)}
                                      onHoverEnd={() => setShowUserActions(null)}
                                    >
                                      <motion.div
                                        className="relative mb-1 rounded-3xl px-6 py-2 text-black bg-stone-700 shadow-2xl overflow-hidden backdrop-blur-xl  border-blue-300/20"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                          // background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)',
                                          boxShadow: '0 8px 32px -8px rgba(37, 99, 235, 0.4)'
                                        }}
                                      >
                                        <div className="relative z-10 text-black">
                                          <MessageContent content={message.content} fontSize={settings.fontSize} />
                                        </div>
                                      </motion.div>

                                      {/* Action Buttons - Simple Animation */}
                                      <AnimatePresence>
                                        {showUserActions === message.id && (
                                          <motion.div
                                            className="flex items-center justify-end mt-2"
                                            initial={{ opacity: 0, y: 0 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                          >
                                            {/* Copy Button */}
                                            <button
                                              onClick={() => handleUserMessageCopy(message.content, message.id)}
                                              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white hover:text-gray-200  hover:bg-gray-600 rounded-3xl transition-colors duration-200 shadow-sm"
                                              disabled={userMessageCopied === message.id}
                                            >
                                              {userMessageCopied === message.id ? (
                                                <Check size={12} className="text-green-600" />
                                              ) : (
                                                <Copy size={12} />
                                              )}
                                            </button>

                                            {/* Edit Button */}
                                            <button
                                              onClick={() => handleUserMessageEdit(message)}
                                              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white hover:text-gray-200  hover:bg-gray-600 rounded-3xl transition-colors duration-200 shadow-sm"
                                            >
                                              <Edit3 size={12} />
                                            </button>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </motion.div>

                                    {/* Your existing code continues here... */}
                                    {editingMessageId !== message.id && (
                                      <motion.div
                                        className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                        initial={false}
                                      >
                                        {/* Your existing left-side action buttons code */}
                                      </motion.div>
                                    )}

                                    {/* Edit Indicator */}
                                    {message.isEdited && (
                                      <div className="text-xs text-cyan-200/60 mt-1 text-right">
                                        <span title={`Original: ${message.originalContent}`}>edited</span>
                                      </div>
                                    )}
                                  </div>
                                </div>) : (
                                <div className="mb-12">
                                  <div className="flex items-start space-x-3 mb-3">
                                    <motion.div
                                      className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                                    >
                                      <Fan className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <div className="flex-1 space-y-2">
                                      {settings.showTimestamps && (
                                        <div className="text-xs text-slate-500">{formatTimestamp(message.createdAt)}</div>
                                      )}
                                      <MessageContent content={message.content} fontSize={settings.fontSize} />
                                    </div>
                                  </div>

                                  <motion.div className="flex items-center space-x-1 ml-10 ">
                                    <Button
                                      size="sm"
                                      onClick={() => copyMessage(message.content, message.id)}
                                      className="h-7 p-2 hover:bg-neutral-700 rounded-lg text-white bg-transparent"
                                    >
                                      {copiedMessageId === message.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => regenerateResponse(index)}
                                      disabled={isLoading}
                                      className="h-7 p-2 hover:bg-neutral-700 rounded-lg text-white bg-transparent"
                                    >
                                      <RotateCcw className="w-5 h-5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleBookmark(message.id)}
                                      className="h-7 p-2 hover:bg-neutral-700 rounded-lg text-white bg-transparent"
                                    >
                                      {message.isBookmarked ? <BookmarkCheck className="w-5 h-5 text-yellow-400" /> : <Bookmark className="w-5 h-5" />}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleRating(message.id, 'up')}
                                      className={`h-7 px-2 hover:bg-neutral-700 rounded-lg text-white bg-transparent ${message.rating === 'up' ? 'text-green-400' : ''}`}
                                    >
                                      <ThumbsUp className="w-5 h-5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleRating(message.id, 'down')}
                                      className={`h-7 px-2 hover:bg-neutral-700 rounded-lg text-white bg-transparent ${message.rating === 'down' ? 'text-red-400' : ''}`}
                                    >
                                      <ThumbsDown className="w-5 h-5" />
                                    </Button>
                                  </motion.div>
                                </div>
                              )}
                            </motion.div>
                          ))}

                          {isLoading && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="flex items-start space-x-3 mb-6"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                                <Fan className="w-5 h-5 text-white" />
                              </div>
                              <AIThinkingAnimation />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} className="h-4" />
                      </div>
                    </div>
                  </ScrollArea>
                </div>
                {/* FIXED INPUT AREA - Better positioning */}
                <div className="w-full fixed bottom-4 left-36">
                  <div className="p-6">
                    <div className="max-w-3xl mx-auto w-full">
                      <PlaceholdersAndVanishInput
                        placeholders={placeholders}
                        onChange={(e) => setInput(e.target.value)}
                        onSubmit={handleSubmit}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                <motion.div
                  className="bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 border border-slate-700"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-red-500/20">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Delete Chat</h3>
                      <p className="text-slate-400 text-sm">This action cannot be undone</p>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm mb-6">
                    Are you sure you want to delete this conversation? All messages will be permanently removed.
                  </p>

                  <div className="flex space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 hover:bg-slate-700/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleNewChat()
                        setShowDeleteConfirm(false)
                      }}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AiAssistant