"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Send, Smile, Paperclip, Mic, Image, Video, SparkleIcon, MessageSquare, X } from 'lucide-react'
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
}

export const Chat = ({ roomId, username, isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const { socket } = useSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasInitialized = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const controls = useAnimation()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (!socket) return

    const handleSyncMessages = ({ messages: syncedMessages }: { messages: Message[] }) => {
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

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !isRecording) return

    let content = newMessage.trim()
    let attachments: { type: string; url: string }[] = []

    if (isRecording) {
      content = "Audio message"
      attachments = []
    }

    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      content,
      sender: username,
      timestamp: Date.now(),
      attachments,
    }

    socket?.emit(ACTIONS.SEND_MESSAGE, { roomId, message })
    setNewMessage("")
    setIsRecording(false)
    controls.start({ scale: [1, 1.2, 1], transition: { duration: 0.3 } })
  }

  // const handleTyping = () => {
  //   if (!socket) return

  //   socket.emit(ACTIONS.TYPING, { roomId, username })

  //   if (typingTimeoutRef.current) {
  //     clearTimeout(typingTimeoutRef.current)
  //   }

  //   typingTimeoutRef.current = setTimeout(() => {
  //     socket.emit(ACTIONS.STOP_TYPING, { roomId, username })
  //   }, 1000)
  // }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  const handleAttachment = (type: "image" | "video", url: string) => {
    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      content: type === "image" ? "Image attachment" : "Video attachment",
      sender: username,
      timestamp: Date.now(),
      attachments: [{ type, url }],
    }

    socket?.emit(ACTIONS.SEND_MESSAGE, { roomId, message })
    setShowAttachmentModal(false)
  }

  return (
    <>
    {/* Chat Toggle Button */}
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="fixed bottom-4 right-4 z-50  rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
    >
      {isOpen ? (
        <X className="h-5 w-5 text-white" />
      ) : (
        <MessageSquare className="h-5 w-5 text-white" />
      )}
    </Button>

    {/* Chat Panel */}
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed right-0 top-0 h-full w-80 border-l border-gray-700 bg-gray-800/95 backdrop-blur-sm"
        >
 <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl">
        <motion.div className="flex-none flex items-center justify-center gap-4 py-5 border-b border-gray-700 bg-gray-800">
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
                    isOwnMessage={message.sender === username}
                  />
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
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
                  )}
        </div>

        <motion.div className="flex-none p-4 border-t border-gray-700 bg-gray-800">
          <form onSubmit={sendMessage} className="flex gap-2">
            <motion.input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              // onKeyPress={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              whileFocus={{ scale: 1.02 }}
            />
            <div className="flex gap-3">
              <motion.div animate={controls}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                      disabled={!newMessage.trim() && !isRecording}
                    >
                      <Send className="h-4 w-4 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </motion.div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="rounded-full text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                    onClick={() => setShowAttachmentModal(true)}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>

            </div>
          </form>

          {showAttachmentModal && (
            <AttachmentModal 
              onClose={() => setShowAttachmentModal(false)} 
              onAttach={handleAttachment} 
            />
          )}
        </motion.div>
      </div>
    </TooltipProvider>        </motion.div>
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

