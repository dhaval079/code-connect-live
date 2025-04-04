"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, useTransform } from "framer-motion"
import { Send, Paperclip, X, MessageSquare, Video, Image } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ACTIONS } from "@/lib/actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSocket } from "@/providers/socketProvider"
import { MessageBubble } from "./MessageBubble"

interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  attachments?: { type: "image" | "video" | "audio"; url: string }[]
}

interface ChatProps {
  roomId: string
  username: string
  isOpen: boolean
  onToggle: () => void
}

export const Chat = ({ roomId, username, isOpen, onToggle }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const { socket } = useSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasInitialized = useRef(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Convert username to lowercase at component level
  const normalizedUsername = username.toLowerCase()

  const charLimit = 1000
  const prefersReducedMotion = useReducedMotion()
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 300 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Calculate character limit percentage with spring physics
  const charPercentage = Math.min((newMessage.length / charLimit) * 100, 100)
  const isNearLimit = charPercentage > 80
  const progressWidth = useMotionValue(0)
  const smoothProgressWidth = useSpring(progressWidth, { damping: 20, stiffness: 100 })

  // Update progress width when message changes
  useEffect(() => {
    progressWidth.set(charPercentage)
  }, [charPercentage, progressWidth])

  // Track mouse position for hover effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        cursorX.set(e.clientX - rect.left)
        cursorY.set(e.clientY - rect.top)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [cursorX, cursorY])

  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 800)
    } else {
      setIsTyping(false)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [newMessage])


  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages])

  useEffect(() => {
    if (!socket) return

  const handleSyncMessages = ({ messages: syncedMessages }: { messages: Message[] }) => {
    if (!hasInitialized.current) {
      // Normalize existing usernames
      const normalizedMessages = syncedMessages.map(msg => ({
        ...msg,
        sender: msg.sender.toLowerCase()
      }))
      setMessages(normalizedMessages)
      hasInitialized.current = true
      setTimeout(scrollToBottom, 100)
    }
  }

    const handleReceiveMessage = (message: Message) => {
      // Normalize incoming message username
      const normalizedMessage = {
        ...message,
        sender: message.sender.toLowerCase()
      }
  
      setMessages((prev) => {
        if (prev.some((m) => m.id === normalizedMessage.id)) return prev
        return [...prev, normalizedMessage].sort((a, b) => a.timestamp - b.timestamp)
      })
      setTimeout(scrollToBottom, 100)
    }


    const handleTypingStart = ({ username: typingUser }: { username: string }) => {
      if (typingUser.toLowerCase() !== normalizedUsername) {
        setIsTyping(true)
      }
    }

    const handleTypingStop = ({ username: typingUser }: { username: string }) => {
      if (typingUser.toLowerCase() !== normalizedUsername) {
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
  }, [socket, normalizedUsername])

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
    setTimeout(() => {
      setNewMessage("")
    }, 50)
  }

  const handleAttachment = (type: "image" | "video", url: string) => {
    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      content: type === "image" ? "Image attachment" : "Video attachment",
      sender: normalizedUsername,
      timestamp: Date.now(),
      attachments: [{ type, url }],
    }

    socket?.emit(ACTIONS.SEND_MESSAGE, { roomId, message })
    setShowAttachmentModal(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Dynamic gradient based on typing state and message length
  const gradientColors = isNearLimit
    ? "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)"
    : isTyping
      ? "linear-gradient(90deg, #3b82f6, #8b5cf6, #6366f1, #3b82f6)"
      : "linear-gradient(90deg, #3b82f6, #8b5cf6)"

  // Particle effect for typing
  const Particles = () => {
    if (prefersReducedMotion || !isTyping) return null

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/30"
            initial={{
              x: "50%",
              y: "50%",
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: [null, `${40 + Math.random() * 60}%`],
              y: [null, `${Math.random() * 100}%`],
              opacity: [0, 0.7, 0],
              scale: [0, 1 + Math.random(), 0],
            }}
            transition={{
              duration: 1 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
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
      <AnimatePresence>
        {!isOpen && (
       <Button
       variant="ghost"
       size="icon"
       onClick={onToggle}
       className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
     >
       <MessageSquare className="h-5 w-5 text-white" />
     </Button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
      {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-80 bprder-4 border-gray-700 bg-gray-800/95 backdrop-blur-sm"
          >
            <TooltipProvider>
              <div className="flex flex-col h-full bg-gradient-to-br  from-gray-900 to-gray-800 rounded-2xl shadow-xl">
                <motion.div className="flex-none flex items-center justify-center gap-4 py-5 border-b border-gray-700 bg-gray-800/95">
                  <h2 className="text-lg font-semibold text-gray-100">Chat</h2>
                  <div className="text-sm text-gray-400">
                    ({messages.length} message{messages.length !== 1 ? "s" : ""})
                  </div>
                </motion.div>

                <div className="flex-1 relative overflow-hidden">
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center text-gray-400"
                    >
                      <div className="text-center">
                        <p className="text-xl mb-2">No messages yet</p>
                        <p className="text-sm">Start a conversation by sending a message</p>
                      </div>
                    </motion.div>
                  ) : (
                    <ScrollArea
                      ref={scrollAreaRef}
                      className="h-[calc(100vh-13rem)] absolute inset-0"
                    >
                      <div className="flex flex-col space-y-4 p-4 min-h-full">
                        <AnimatePresence initial={false}>
                          {messages.map((message) => (
                            <MessageBubble
                              key={message.id}
                              message={message}
                              isOwnMessage={message.sender === normalizedUsername}
                            />
                          ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  )}
                </div>

                <motion.div
                  className="flex-none border-t p-3 text-black border-gray-800/50 bg-gray-900/95 backdrop-blur-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={sendMessage} className="relative">
                    <div className="relative flex items-center">
                      {/* Enhanced 3D gradient border with parallax effect */}
                      <motion.div
                        className="absolute -inset-0.5 rounded-3xl opacity-0 blur-sm z-0"
                        style={{
                          background: gradientColors,
                          boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
                          x: useTransform(cursorXSpring, [0, 300], prefersReducedMotion ? [0, 0] : [-2, 2]),
                          y: useTransform(cursorYSpring, [0, 60], prefersReducedMotion ? [0, 0] : [-1, 1]),
                        }}
                        animate={{
                          opacity: isFocused ? 0.95 : isTyping ? 0.8 : 0,
                        }}
                        transition={{
                          opacity: { duration: 0.4, ease: "easeOut" },
                          background: { duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                        }}
                      />

                      {/* Glass effect container with subtle 3D transform */}
                      <motion.div
                        className="relative w-full z-10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-lg"
                        style={{
                          perspective: 1000,
                          x: useTransform(cursorXSpring, [0, 300], prefersReducedMotion ? [0, 0] : [-1, 1]),
                          y: useTransform(cursorYSpring, [0, 60], prefersReducedMotion ? [0, 0] : [-0.5, 0.5]),
                        }}
                      >
                        {/* Smooth progress indicator with spring physics */}
                        <motion.div
                          className={`absolute bottom-0 left-0 h-0.5 ${isNearLimit ? "bg-gradient-to-r from-blue-500 via-amber-500 to-amber-500" : "bg-blue-500"
                            } ${newMessage.length >= charLimit ? "bg-gradient-to-r from-amber-500 to-red-500" : ""}`}
                          style={{ width: smoothProgressWidth.get() + "%" }}
                          transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        />

                        <div className="relative flex items-center">
                          {/* Particle effects container */}
                          <Particles />

                          {/* Enhanced input field with better styling */}
                          <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value.slice(0, charLimit))}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Type a message..."
                            className="w-full bg-slate-800/90 text-white rounded-3xl px-5 py-4 pr-14 focus:outline-none border border-slate-700/80 placeholder:text-slate-400/70 relative z-10 text-md shadow-inner transition-all duration-200"
                            autoComplete="off"
                            maxLength={charLimit}
                          />

                          {/* Enhanced send button with 3D effects */}
                          <AnimatePresence mode="wait">
                            {newMessage.trim() ? (
                              <motion.button
                                key="send-active"
                                type="submit"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full z-20"
                                style={{
                                  background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
                                  boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)",
                                }}
                                initial={{ scale: 0.8, opacity: 0, y: "-50%", rotate: -45 }}
                                animate={{
                                  scale: 1,
                                  opacity: 1,
                                  y: "-50%",
                                  rotate: 0,
                                  transition: { type: "spring", stiffness: 500, damping: 15 },
                                }}
                                exit={{
                                  scale: 0.8,
                                  opacity: 0,
                                  y: "-50%",
                                  rotate: 45,
                                  transition: { duration: 0.15, ease: "easeOut" },
                                }}
                                whileHover={{
                                  scale: 1.1,
                                  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4), 0 2px 5px rgba(0, 0, 0, 0.1)",
                                }}
                                whileTap={{
                                  scale: 0.92,
                                  boxShadow: "0 2px 5px rgba(59, 130, 246, 0.3), 0 1px 2px rgba(0, 0, 0, 0.1)",
                                }}
                                aria-label="Send message"
                              >
                                <motion.div
                                  className="relative"
                                  whileHover={{ rotate: prefersReducedMotion ? 0 : 15 }}
                                  transition={{ type: "spring", stiffness: 700, damping: 15 }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-white"
                                  >
                                    <path d="M22 2L11 13"></path>
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                                  </svg>

                                  {/* Subtle glow effect */}
                                  <motion.div
                                    className="absolute inset-0 rounded-full bg-white/20 blur-sm"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
                                    transition={{
                                      duration: 2,
                                      repeat: Number.POSITIVE_INFINITY,
                                      repeatType: "loop",
                                      ease: "easeInOut",
                                    }}
                                  />
                                </motion.div>
                              </motion.button>
                            ) : (
                              <motion.div
                                key="send-inactive"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-slate-700/50 text-slate-500 z-20"
                                initial={{ scale: 0.8, opacity: 0, y: "-50%" }}
                                animate={{
                                  scale: 1,
                                  opacity: 0.7,
                                  y: "-50%",
                                  transition: { type: "spring", stiffness: 500, damping: 15 },
                                }}
                                exit={{
                                  scale: 0.8,
                                  opacity: 0,
                                  y: "-50%",
                                  transition: { duration: 0.15, ease: "easeOut" },
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M22 2L11 13"></path>
                                  <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                                </svg>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </div>

                    {/* Enhanced character counter with spring physics */}
                    <div className="relative h-6 mt-1 ml-2">
                      <AnimatePresence>
                        {newMessage.length > 0 && (
                          <motion.div
                            className={`absolute left-0 text-xs font-medium ${isNearLimit ? "text-amber-400" : "text-slate-400"
                              } ${newMessage.length >= charLimit ? "text-red-400" : ""}`}
                            initial={{ opacity: 0, y: -10, scale: 0.9 }}
                            animate={{
                              opacity: 0.9,
                              y: 0,
                              scale: 1,
                              transition: { type: "spring", stiffness: 500, damping: 30 },
                            }}
                            exit={{
                              opacity: 0,
                              y: -5,
                              scale: 0.95,
                              transition: { duration: 0.2, ease: "easeOut" },
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              {isTyping && (
                                <motion.div
                                  className="flex space-x-1"
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{
                                    opacity: 1,
                                    width: "auto",
                                    transition: { duration: 0.2 },
                                  }}
                                  exit={{
                                    opacity: 0,
                                    width: 0,
                                    transition: { duration: 0.2 },
                                  }}
                                >
                                  {[0, 0.2, 0.4].map((delay, i) => (
                                    <motion.div
                                      key={i}
                                      className="w-1 h-1 rounded-full bg-blue-400"
                                      animate={{
                                        y: prefersReducedMotion ? 0 : [0, -3, 0],
                                        opacity: [0.5, 1, 0.5],
                                      }}
                                      transition={{
                                        y: { duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay },
                                        opacity: { duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay },
                                      }}
                                    />
                                  ))}
                                </motion.div>
                              )}

                              <motion.span
                                animate={{
                                  color: isNearLimit
                                    ? newMessage.length >= charLimit
                                      ? "#f87171" // red-400
                                      : "#fbbf24" // amber-400
                                    : "#94a3b8", // slate-400
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                {newMessage.length}/{charLimit}
                              </motion.span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Enhanced keyboard shortcut hints */}
                    <AnimatePresence>
                      {isFocused && (
                        <motion.div
                          className="absolute right-3 -bottom-6 text-xs text-slate-500 flex items-center gap-1.5"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{
                            opacity: 0.7,
                            y: 0,
                            transition: { type: "spring", stiffness: 500, damping: 30, delay: 0.1 },
                          }}
                          exit={{
                            opacity: 0,
                            y: -5,
                            transition: { duration: 0.2 },
                          }}
                        >
                          <span className="px-1.5 py-0.5 bg-slate-800/50 rounded text-[10px] border border-slate-700/50">
                            Enter
                          </span>
                          <span>to send</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Global keyboard shortcut hint */}
                    <AnimatePresence>
                      {!isFocused && !isTyping && (
                        <motion.div
                          className="absolute left-3 -bottom-6 text-xs text-slate-500 flex items-center gap-1.5"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 0.5,
                            transition: { delay: 1, duration: 0.3 },
                          }}
                          exit={{ opacity: 0 }}
                        >
                          <span className="px-1 py-0.5 bg-slate-800/50 rounded text-[10px] border border-slate-700/50">
                            {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                          </span>
                          <span className="px-1 py-0.5 bg-slate-800/50 rounded text-[10px] border border-slate-700/50">/</span>
                          <span>to focus</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                  {showAttachmentModal && (
                    <AttachmentModal
                      onClose={() => setShowAttachmentModal(false)}
                      onAttach={handleAttachment}
                    />
                  )}

                  {/* Add the keyframe animation for the gradient */}
                  <style jsx global>{`
    @keyframes gradient-x {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-gradient-x {
      background-size: 200% 200%;
      animation: gradient-x 3s linear infinite;
    }
  `}</style>
                </motion.div>

              </div>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

interface AttachmentModalProps {
  onClose: () => void
  onAttach: (type: "image" | "video", url: string) => void
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({ onClose, onAttach }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleAttach = () => {
    if (selectedFile) {
      const type = selectedFile.type.startsWith("image/") ? "image" : "video"
      const url = URL.createObjectURL(selectedFile)
      onAttach(type, url)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 p-6 rounded-lg shadow-xl"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-100">Attach File</h3>
          <div className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200"
            >
              {selectedFile ? (
                <span className="text-gray-300">{selectedFile.name}</span>
              ) : (
                <>
                  <Image className="w-6 h-6 text-gray-400" />
                  <Video className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-400">Choose an image or video</span>
                </>
              )}
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} className="text-gray-300 border-gray-600 hover:bg-gray-700">
                Cancel
              </Button>
              <Button onClick={handleAttach} disabled={!selectedFile} className="bg-blue-600 hover:bg-blue-700">
                Attach
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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

