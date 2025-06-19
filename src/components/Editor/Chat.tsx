"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion, useSpring, useMotionValue, useTransform } from "framer-motion"
import { Send, MessageSquare, X, Heart, ThumbsUp, Smile, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ACTIONS } from "@/lib/actions"
import { useSocket } from "@/providers/socketProvider"

interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  reactions?: { [emoji: string]: string[] }
}

interface ChatProps {
  roomId: string
  username: string
  isOpen: boolean
  onToggle: () => void
}

const reactionEmojis = [
  { icon: Heart, emoji: "❤️", color: "from-red-400 to-pink-500" },
  { icon: ThumbsUp, emoji: "👍", color: "from-blue-400 to-cyan-500" },
  { icon: Smile, emoji: "😊", color: "from-yellow-400 to-orange-500" },
  { icon: Zap, emoji: "⚡", color: "from-purple-400 to-violet-500" },
]

export const Chat = ({ roomId, username, isOpen, onToggle }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasSeenReactionTip, setHasSeenReactionTip] = useState(false)

  const { socket } = useSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasInitialized = useRef(false)

  const normalizedUsername = username.toLowerCase()
  const prefersReducedMotion = useReducedMotion()

  // Advanced motion values for premium interactions
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 }
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)

  // Parallax effects
  const backgroundX = useTransform(smoothMouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-20, 20])
  const backgroundY = useTransform(smoothMouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-20, 20])

  // Mouse tracking for premium effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Typing indicator with debounce
  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true)
      const timeout = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [newMessage])

  // Show reaction tip after first message
  useEffect(() => {
    if (messages.length === 1 && !hasSeenReactionTip) {
      const timer = setTimeout(() => {
        setHasSeenReactionTip(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [messages.length, hasSeenReactionTip])

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, scrollToBottom])

  // Socket handlers
  useEffect(() => {
    if (!socket) return

    const handleSyncMessages = ({ messages: syncedMessages }: { messages: Message[] }) => {
      if (!hasInitialized.current) {
        const normalizedMessages = syncedMessages.map((msg) => ({
          ...msg,
          sender: msg.sender.toLowerCase(),
        }))
        setMessages(normalizedMessages)
        hasInitialized.current = true
        setTimeout(scrollToBottom, 100)
      }
    }

    const handleReceiveMessage = (message: Message) => {
      const normalizedMessage = {
        ...message,
        sender: message.sender.toLowerCase(),
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === normalizedMessage.id)) return prev
        return [...prev, normalizedMessage].sort((a, b) => a.timestamp - b.timestamp)
      })
      setTimeout(scrollToBottom, 100)
    }

    socket.on(ACTIONS.SYNC_MESSAGES, handleSyncMessages)
    socket.on(ACTIONS.RECEIVE_MESSAGE, handleReceiveMessage)

    return () => {
      socket.off(ACTIONS.SYNC_MESSAGES)
      socket.off(ACTIONS.RECEIVE_MESSAGE)
      hasInitialized.current = false
    }
  }, [socket, normalizedUsername, scrollToBottom])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      content: newMessage.trim(),
      sender: normalizedUsername,
      timestamp: Date.now(),
    }

    socket?.emit(ACTIONS.SEND_MESSAGE, { roomId, message })
    setNewMessage("")
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions }
          if (!reactions[emoji]) {
            reactions[emoji] = []
          }

          if (reactions[emoji].includes(normalizedUsername)) {
            reactions[emoji] = reactions[emoji].filter((user) => user !== normalizedUsername)
            if (reactions[emoji].length === 0) {
              delete reactions[emoji]
            }
          } else {
            reactions[emoji].push(normalizedUsername)
          }

          return { ...msg, reactions }
        }
        return msg
      }),
    )
    setShowReactions(null)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Floating particles component
  const FloatingParticles = () => {
    if (prefersReducedMotion) return null

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full"
            initial={{
              x: Math.random() * 400,
              y: Math.random() * 600,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              y: [0, -30, 0],
              scale: [0, 1, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 6,
              repeat: 2,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="fixed bottom-8 right-8 z-50"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-blue-600/20 rounded-full blur-xl" />
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 600, damping: 15 }}
              >
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-violet-400 to-purple-400"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: 1, ease: "linear" }}
                  />
                )}

                <Button
                  onClick={onToggle}
                  className="relative h-16 w-16 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:via-purple-500 hover:to-blue-500 shadow-2xl border-0 transition-all duration-500 overflow-hidden"
                >
                  {isHovered && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 1.5, repeat: 1, ease: "linear" }}
                    />
                  )}

                  <MessageSquare className="h-7 w-7 text-white relative z-10" />

                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window - Fixed position */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ x: "100%", opacity: 0, scale: 0.9, rotateY: -15 }}
            transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
            className="fixed right-8 top-8 bottom-8 w-[420px] z-50"
            style={{ 
              perspective: 1000,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div className="h-full relative" style={{ display: "flex", flexDirection: "column" }}>
            <div className="relative h-full flex flex-col">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-xl" />
              
              {/* Main chat container - explicit height and flex */}
              <div
              className="relative h-full flex flex-col"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)",
                backdropFilter: "blur(40px) saturate(180%)",
                borderRadius: "32px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 32px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              }}
            >
              {/* Floating particles */}
              <FloatingParticles />

              {/* Dynamic background gradient */}
              <motion.div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
                  x: backgroundX,
                  y: backgroundY,
                }}
              />

              {/* Header */}
              <motion.div
                className="relative px-4 py-3 border-b border-white/10 z-10"
                style={{ flexShrink: 0 }}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <motion.h2
                      className="text-lg font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Chat
                    </motion.h2>
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <p className="text-sm text-white/60">{messages.length} messages</p>
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 600 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggle}
                      className="text-white/60 hover:text-white hover:bg-white/10 rounded-2xl h-10 w-10 p-0 transition-all duration-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>

                <motion.div
                  className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </motion.div>

              {/* Messages area */}
              <div className="overflow-hidden relative" style={{ minHeight: 0, flex: "1 1 auto" }}>
                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <FloatingParticles />
                </div>
                
                <div className="h-full overflow-y-auto relative z-10">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4">
                      <div className="text-center space-y-4">
                      <motion.div
                        className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm border border-white/10"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: 2,
                          ease: "easeInOut",
                        }}
                      >
                        <MessageSquare className="h-10 w-10 text-violet-300" />
                      </motion.div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">No messages yet</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                          Start the conversation and
                          <br />
                          make it memorable
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-4">
                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {messages.map((message, index) => {
                          const isOwnMessage = message.sender === normalizedUsername
                          const showAvatar = index === 0 || messages[index - 1].sender !== message.sender

                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 30, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -30, scale: 0.9 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                delay: index * 0.05,
                              }}
                              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group`}
                            >
                              <div className={`max-w-[85%] ${isOwnMessage ? "order-2" : "order-1"}`}>
                                {!isOwnMessage && showAvatar && (
                                  <motion.div
                                    className="flex items-center gap-2 mb-2 ml-3"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <motion.div
                                      className="w-6 h-6 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg"
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                      <span className="text-xs font-bold text-white uppercase">
                                        {message.sender[0]}
                                      </span>
                                    </motion.div>
                                    <span className="text-xs font-medium text-white/70 capitalize">
                                      {message.sender}
                                    </span>
                                  </motion.div>
                                )}

                                <div className="relative">
                                  <motion.div
                                    className={`relative px-4 py-3 rounded-2xl shadow-xl backdrop-blur-sm group ${
                                      isOwnMessage
                                        ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white ml-8 border border-violet-400/20"
                                        : "bg-white/10 text-white border border-white/20 mr-8"
                                    }`}
                                    whileHover={{
                                      scale: 1.02,
                                      boxShadow: isOwnMessage
                                        ? "0 20px 40px rgba(139, 92, 246, 0.3)"
                                        : "0 20px 40px rgba(255, 255, 255, 0.1)",
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    onDoubleClick={() =>
                                      setShowReactions(showReactions === message.id ? null : message.id)
                                    }
                                  >
                                    {/* Reaction hint on hover */}
                                    <motion.div
                                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                                        isOwnMessage ? "-left-2" : "-right-2"
                                      }`}
                                      initial={{ scale: 0 }}
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      <div className="bg-white/10 backdrop-blur-xl rounded-full p-1.5 border border-white/20">
                                        <Smile className="h-3 w-3 text-white/60" />
                                      </div>
                                    </motion.div>

                                    {/* First message reaction tip */}
                                    <AnimatePresence>
                                      {messages.length === 1 && index === 0 && !hasSeenReactionTip && (
                                        <motion.div
                                          initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg"
                                        >
                                          <span>Double-tap to react! 👆</span>
                                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-violet-500" />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    <p className="break-words leading-relaxed text-sm relative z-10">
                                      {message.content}
                                    </p>

                                    <div className="flex items-center justify-end mt-2 space-x-2">
                                      <span
                                        className={`text-xs font-medium ${
                                          isOwnMessage ? "text-white/70" : "text-white/50"
                                        }`}
                                      >
                                        {formatTime(message.timestamp)}
                                      </span>
                                    </div>

                                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="flex flex-wrap gap-2 mt-3"
                                      >
                                        {Object.entries(message.reactions).map(([emoji, users]) => (
                                          <motion.button
                                            key={emoji}
                                            onClick={() => addReaction(message.id, emoji)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium transition-all backdrop-blur-sm ${
                                              users.includes(normalizedUsername)
                                                ? "bg-white/20 text-white border border-white/30 shadow-lg"
                                                : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                                            }`}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <span className="text-sm">{emoji}</span>
                                            <span className="text-xs">{users.length}</span>
                                          </motion.button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </motion.div>

                                  <AnimatePresence>
                                    {showReactions === message.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                        className={`absolute ${isOwnMessage ? "right-0" : "left-0"} mt-2 z-20`}
                                      >
                                        <div className="flex gap-2 p-3 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl">
                                          {reactionEmojis.map(({ emoji, icon: Icon, color }, index) => (
                                            <motion.button
                                              key={emoji}
                                              onClick={() => addReaction(message.id, emoji)}
                                              className={`p-2 rounded-xl hover:bg-white/20 transition-all bg-gradient-to-br ${color} text-white`}
                                              whileHover={{ scale: 1.2, rotate: 5 }}
                                              whileTap={{ scale: 0.9 }}
                                              initial={{ opacity: 0, scale: 0 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{ delay: index * 0.1 }}
                                            >
                                              <Icon className="h-4 w-4" />
                                            </motion.button>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* Input area */}
              <div
                className="relative px-4 py-3 border-t border-white/10 z-10"
                style={{ 
                  minHeight: "90px",
                  flexShrink: 0,
                  background: "linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent)"
                }}
              >
                <form onSubmit={sendMessage} className="relative">
                  <div className="relative">
                    <motion.div
                      className="relative rounded-2xl"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-2xl p-0.5"
                        style={{
                          background:
                            isFocused || isTyping
                              ? "linear-gradient(90deg, #8b5cf6, #a855f7, #3b82f6, #06b6d4, #8b5cf6)"
                              : "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                          backgroundSize: "300% 100%",
                        }}
                        animate={{
                          backgroundPosition: isFocused || isTyping ? ["0% 50%", "100% 50%", "0% 50%"] : "0% 50%",
                        }}
                        transition={{
                          duration: 3,
                          repeat: isFocused || isTyping ? Number.POSITIVE_INFINITY : 0,
                          ease: "linear",
                        }}
                      >
                        <div className="h-full w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                          <div className="relative flex items-center">
                            <input
                              ref={inputRef}
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              placeholder="Type a message..."
                              className="w-full bg-transparent text-white placeholder:text-white/40 px-4 py-3 pr-12 focus:outline-none text-sm rounded-2xl font-medium"
                              autoComplete="off"
                            />

                            <AnimatePresence mode="wait">
                              {newMessage.trim() ? (
                                <motion.button
                                  key="send-active"
                                  type="submit"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 transition-all shadow-xl border border-violet-400/20"
                                  initial={{ scale: 0, rotate: -90, opacity: 0 }}
                                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                  exit={{ scale: 0, rotate: 90, opacity: 0 }}
                                  whileHover={{
                                    scale: 1.1,
                                    boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)",
                                    rotate: 5,
                                  }}
                                  whileTap={{ scale: 0.9 }}
                                  transition={{ type: "spring", stiffness: 600, damping: 15 }}
                                >
                                  <Send className="h-4 w-4 text-white" />
                                </motion.button>
                              ) : (
                                <motion.div
                                  key="send-inactive"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-xl bg-white/5 text-white/30 border border-white/10"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  <Send className="h-4 w-4" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </form>
                
                {/* Helper text */}
                <div className="text-center mt-2">
                  <span className="text-xs text-white/30">Press Enter to send • Double-tap messages to react</span>
                </div>
                
                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -top-12 left-4 flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
                    >
                      <div className="flex space-x-1">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-violet-400 rounded-full"
                            animate={{
                              y: prefersReducedMotion ? 0 : [0, -6, 0],
                              opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              delay,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-white/60 font-medium">You're typing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close reactions */}
      {showReactions && (
        <motion.div
          className="fixed inset-0 z-40"
          onClick={() => setShowReactions(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </>
  )
}



const TypingIndicator: React.FC = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: [0, -5, 0] },
  }

  return (
    <div className="flex space-x-1 mt-2">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 bg-blue-400 rounded-full"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: dot * 0.2,
          }}
        />
      ))}
    </div>
  )
}
