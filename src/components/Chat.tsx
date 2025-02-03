"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Send, Smile, Paperclip } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ACTIONS } from "@/lib/actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSocket } from "@/providers/socketProvider"

interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
}

interface ChatProps {
  roomId: string
  username: string
}

const TypingIndicator = () => (
  <div className="flex space-x-1 mt-2">
    {[0, 1, 2].map((dot) => (
      <motion.div
        key={dot}
        className="w-2 h-2 bg-blue-400 rounded-full"
        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 0.6,
          repeat: Number.POSITIVE_INFINITY,
          delay: dot * 0.2,
        }}
      />
    ))}
  </div>
)

const MessageBubble = ({ message, isOwnMessage }: { message: Message; isOwnMessage: boolean }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.8, y: -20 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
  >
    <div className={`flex ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-end group`}>
      <Avatar className="w-8 h-8 transition-transform group-hover:scale-110">
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.sender}`} />
        <AvatarFallback>{message.sender[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <motion.div
        className={`max-w-[70%] break-words rounded-2xl px-4 py-2 ${
          isOwnMessage ? "bg-blue-600 text-white ml-2" : "bg-gray-700 text-white mr-2"
        }`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <p className="text-sm">{message.content}</p>
        <div className="text-xs text-gray-300 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
      </motion.div>
    </div>
  </motion.div>
)

export const Chat = ({ roomId, username }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const { socket } = useSocket()
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const controls = useAnimation()

  useEffect(() => {
    if (!socket) return

    const handleSyncMessages = ({ messages: syncedMessages }: { messages: Message[] }) => {
      console.log("Received synced messages:", syncedMessages.length)
      if (!hasInitialized.current) {
        setMessages(syncedMessages)
        hasInitialized.current = true
        setTimeout(scrollToBottom, 100)
      }
    }

    const handleReceiveMessage = (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message].sort((a, b) => a.timestamp - b.timestamp)
      })
      setTimeout(scrollToBottom, 100)
    }

    const handleTypingStart = ({ username: typingUser }: { username: string }) => {
      if (typingUser !== username) {
        setIsTyping(true)
      }
    }

    const handleTypingStop = ({ username: typingUser }: { username: string }) => {
      if (typingUser !== username) {
        setIsTyping(false)
      }
    }

    socket.on(ACTIONS.SYNC_MESSAGES, handleSyncMessages)
    socket.on(ACTIONS.RECEIVE_MESSAGE, handleReceiveMessage)
    
    return () => {
      socket.off(ACTIONS.SYNC_MESSAGES)
      socket.off(ACTIONS.RECEIVE_MESSAGE)
      
      hasInitialized.current = false
    }
  }, [socket, username])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    const message = {
      id: `${Date.now()}-${Math.random()}`,
      content: newMessage.trim(),
      sender: username,
      timestamp: Date.now(),
    }

    socket.emit(ACTIONS.SEND_MESSAGE, { roomId, message })
    setNewMessage("")
    controls.start({ scale: [1, 1.2, 1], transition: { duration: 0.3 } })
  }

  const handleTyping = () => {
    if (!socket) return

    socket.emit(ACTIONS.TYPING, { roomId, username })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(ACTIONS.STOP_TYPING, { roomId, username })
    }, 1000)
  }

  return (
    <TooltipProvider>
      <motion.div
        className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white">Chat</h2>
          <motion.div
            className="text-sm text-gray-400"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </motion.div>
        </motion.div>

        <ScrollArea ref={scrollRef as any} className="flex-1 p-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwnMessage={message.sender === username} />
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center text-gray-400 text-sm"
            >
              <TypingIndicator />
              <span className="ml-2">Someone is typing...</span>
            </motion.div>
          )}
        </ScrollArea>

        <motion.div
          className="p-4 border-t border-gray-700 bg-gray-800"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={sendMessage} className="flex gap-2">
            <motion.input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.div animate={controls}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
              </Tooltip>
            </motion.div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="rounded-full">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="rounded-full">
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send emoji</TooltipContent>
            </Tooltip>
          </form>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  )
}

export default Chat

