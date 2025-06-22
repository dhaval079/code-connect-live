"use client"
import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Copy, Check, MessageCircle, RotateCcw, X, Sparkles, Trash2, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import OpenAI from "openai"
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input"
import AIThinkingAnimation from "./AiThinking"
import Image from "next/image";
const { GoogleGenerativeAI } = require("@google/generative-ai")

const messageAnimations = {
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
      ease: "easeOut",
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

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = React.useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-xl overflow-hidden bg-gray-900/80 border border-gray-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700/30">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{language || "code"}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyCode}
          className="h-7 px-2 hover:bg-gray-700/50 transition-all duration-200"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-200" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  )
}

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

export const MessageContent = ({ content }: { content: string }) => {
  const parts = formatMessage(content)

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
                className="text-sm leading-7 whitespace-pre-wrap break-words text-gray-100"
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

const MessageContainer = React.forwardRef<HTMLDivElement, React.PropsWithChildren<{}>>(({ children }, ref) => (
  <ScrollArea className="flex-1 h-0 p-6">
    <div className="space-y-8 max-w-4xl mx-auto" ref={ref}>
      {children}
    </div>
  </ScrollArea>
))

MessageContainer.displayName = "MessageContainer"

const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "",
    "X-Title": "CodeConnect",
  },
})

const EmptyState = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full py-32 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center relative overflow-hidden shadow-2xl"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-white/40 to-white/20"
            style={{ backgroundSize: "300% 100%" }}
            animate={{
              backgroundPosition: ["0% center", "100% center", "0% center"],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />

          <motion.div
            className="relative z-10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0)",
                "0 0 0 20px rgba(59, 130, 246, 0.1)",
                "0 0 0 40px rgba(59, 130, 246, 0.05)",
                "0 0 0 0 rgba(59, 130, 246, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        </motion.div>
      </motion.div>

      <motion.h3
        className="text-2xl font-semibold text-white mb-3 tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        How can I help you today?
      </motion.h3>

      <motion.p
        className="text-gray-400 text-base max-w-md leading-relaxed"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Ask me anything about coding, debugging, concepts, or get help with your projects.
      </motion.p>
    </motion.div>
  )
}

interface AiAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

const AiAssistant = ({ isOpen, onToggle }: AiAssistantProps) => {
  interface Message {
    type: "user" | "assistant"
    content: string
    timestamp: string
    id: string
  }

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleNewChat = () => {
    setMessages([])
    setInput("")
    setCopiedMessageId(null)
    setShowDeleteConfirm(false)
  }

  const handleDeleteChat = () => {
    if (messages.length > 0) {
      setShowDeleteConfirm(true)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

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

  const scrollToBottom = () => {
    try {
      const scrollAreaViewport = document.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollAreaViewport) {
        scrollAreaViewport.scrollTop = scrollAreaViewport.scrollHeight
        return
      }

      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    } catch (error) {
      console.error("Error scrolling to bottom:", error)
    }
  }

  useEffect(() => {
    setTimeout(scrollToBottom, 100)
  }, [messages, isLoading])

  const handleSubmit = async (e: any) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!input.trim() || isLoading) return

    const currentInput = input
    setInput("")

    const userMessage: Message = {
      type: "user" as const,
      content: currentInput,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      setIsLoading(true)
      const aiResponse = await askAI(currentInput)

      const aiMessage: Message = {
        type: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
        id: (Date.now() + 1).toString(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error in AI response:", error)

      const errorMessage: Message = {
        type: "assistant",
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        id: (Date.now() + 1).toString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
    setTimeout(scrollToBottom, 100)
  }

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
    if (userMessage.type !== "user") return

    // Remove the assistant message and any messages after it
    setMessages((prev) => prev.slice(0, messageIndex))

    try {
      setIsLoading(true)
      const aiResponse = await askAI(userMessage.content)

      const aiMessage: Message = {
        type: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error regenerating response:", error)

      const errorMessage: Message = {
        type: "assistant",
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const placeholders = [
    "Type Your Message...",
    "Write a Javascript method to reverse a string",
    "Type Your Message...",
    "What is concept of React.js?",
    "Type Your Message..."
  ]

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

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
          className="fixed inset-0 border border-gray-700/50 bg-gray-900/80 backdrop-blur-lg flex flex-col z-50 shadow-2xl"        >
          <motion.div
            className="p-4 border-b opacity-10 border-gray-700/10 flex items-center justify-between bg-gradient-to-r from-gray-900/20 to-gray-800/10 backdrop-blur-sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center space-x-3"
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <CustomLogo />

                <div className="h-8 w-px bg-gray-600/40"></div>

                {/* {messages.length > 0 && ( */}
                <div className="flex items-center space-x-2">
                  {/* New Chat Button */}
                  <motion.button
                    onClick={handleNewChat}
                    className="group relative h-9 w-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4 text-white/80 group-hover:text-white transition-colors duration-200" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>

                  {/* Delete Button */}
                  <motion.button
                    onClick={handleDeleteChat}
                    className="group relative h-9 w-9 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 hover:border-red-400/40 transition-all duration-300 flex items-center justify-center backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4 text-red-400/80 group-hover:text-red-300 transition-colors duration-200" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>
                </div>
                {/* )} */}
              </motion.div>
            </div>

            {/* Close Button */}
            <motion.button
              onClick={onToggle}
              className="group relative h-9 w-9 rounded-xl bg-gradient-to-br from-gray-400/20 to-gray-600/10 border border-gray-600/20 hover:border-gray-500/40 transition-all duration-300 flex items-center justify-center backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-black/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors duration-200" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </motion.div>
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
                  className="bg-gray-800 rounded-2xl p-6 max-w-sm mx-4 border border-gray-700"
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
                      <p className="text-gray-400 text-sm">This action cannot be undone</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-6">
                    Are you sure you want to delete this conversation? All messages will be permanently removed.
                  </p>

                  <div className="flex space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 hover:bg-gray-700/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNewChat}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <MessageContainer>
            <AnimatePresence mode="popLayout">
              {messages.length > 0 ? (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      variants={messageAnimations}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="group"
                    >
                      {message.type === "user" ? (
                        <div className="flex justify-end mb-6">
                          <motion.div
                            className="max-w-[85%] rounded-2xl px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                          >
                            <MessageContent content={message.content} />
                          </motion.div>
                        </div>
                      ) : (
                        <div className="mb-8">
                          <div className="flex items-start space-x-3 mb-3">
                            <motion.div
                              className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                              <Bot className="w-4 h-4 text-white" />
                            </motion.div>
                            <div className="flex-1 space-y-2">
                              <MessageContent content={message.content} />
                            </div>
                          </div>

                          <motion.div
                            className="flex items-center space-x-2 ml-10 opacity-100 group-hover:opacity-90 duration-200"
                            initial={{ y: 10, opacity: 100 }}
                            animate={{ y: 0, opacity: 100 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(message.content, message.id)}
                              className="h-7 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 rounded-lg"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span className="text-xs">
                                {copiedMessageId === message.id ? "Copied" : "Copy"}
                              </span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => regenerateResponse(index)}
                              disabled={isLoading}
                              className="h-7 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 rounded-lg disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="text-xs">Regenerate</span>
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={endOfMessagesRef} />
                </>
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-start space-x-3 mb-6"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <AIThinkingAnimation />
              </motion.div>
            )}
          </MessageContainer>

          <motion.div
            className="p-14 border-t w-[70%] mx-auto border-gray-700/30 bg-gray-800/20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSubmit}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AiAssistant