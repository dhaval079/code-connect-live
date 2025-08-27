"use client"
import React, { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot, Copy, Check, MessageCircle, RotateCcw, X, Sparkles, Trash2, Plus,
  AlertTriangle, Search, Download, Bookmark, BookmarkCheck, Settings,
  Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2, Clock, Share2,
  ChevronDown, ChevronUp, Zap, Star, ThumbsUp, ThumbsDown, Edit3,
  Save, FileText, Moon, Sun, Type, Palette, Menu,
  Loader,
  MessagesSquare,
  MessageSquareDiff,
  MessageCirclePlus,
  Fan,
  ChevronLeft,
  ChevronRight,
  History,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import OpenAI from "openai"
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input"
import AIThinkingAnimation from "./AiThinking"
import Image from "next/image";
import { ToolTipText } from "./ToolTip";

const { GoogleGenerativeAI } = require("@google/generative-ai")

// Enhanced animations
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

// Enhanced interface for messages
interface Message {
  type: "user" | "assistant"
  content: string
  timestamp: string
  id: string
  isBookmarked?: boolean
  rating?: 'up' | 'down' | null
  isEdited?: boolean
  originalContent?: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: string
}

interface Settings {
  theme: 'dark' | 'light'
  fontSize: 'small' | 'medium' | 'large'
  voiceEnabled: boolean
  autoScroll: boolean
  showTimestamps: boolean
  compactMode: boolean
}

const CustomLogo = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <Image
        src="/ailogo.svg"
        width={32}
        height={32}
        alt="Code Connect AI"
      />
    </div>
  )
}

// Sidebar Component
export const Sidebar = ({ 
  isOpen, 
  onClose, 
  onNewChat, 
  onDeleteChat, 
  onExportChat, 
  onShowSettings,
  searchTerm,
  onSearchChange,
  showSearch,
  onToggleSearch,
  messages
}: {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onDeleteChat: () => void
  onExportChat: () => void
  onShowSettings: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  showSearch: boolean
  onToggleSearch: () => void
  messages: Message[]
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            className="fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 flex flex-col"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-700/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CustomLogo />
                  {/* <span className="text-white font-semibold text-lg">AI Assistant</span> */}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-slate-800/50 lg:hidden"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </Button>
              </div>

              {/* New Chat Button */}
              <motion.button
                onClick={onNewChat}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                <span>New Chat</span>
              </motion.button>
            </div>

            {/* Search Section */}
            <div className="p-4 border-b border-slate-700/30">
              <motion.button
                onClick={onToggleSearch}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 ${showSearch ? 'bg-slate-800/30' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Search messages</span>
              </motion.button>

              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/50 text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat History Section */}
            <div className="flex-1 overflow-hidden">
              <div className="p-4">
                <h3 className="text-slate-400 text-sm font-medium mb-3 flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Recent Chats</span>
                </h3>
                
                {messages.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-600/20">
                      <MessageCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-300 text-sm truncate">Current conversation</p>
                        <p className="text-slate-500 text-xs">{messages.length} messages</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm text-center py-8">
                    No chat history yet
                  </div>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="p-4 border-t border-slate-700/30 space-y-2">
              {/* Export Chat */}
              <motion.button
                onClick={onExportChat}
                disabled={messages.length === 0}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: messages.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: messages.length > 0 ? 0.98 : 1 }}
              >
                <Download className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Export Chat</span>
              </motion.button>

              {/* Settings */}
              <motion.button
                onClick={onShowSettings}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Settings</span>
              </motion.button>

              {/* Delete Chat */}
              <motion.button
                onClick={onDeleteChat}
                disabled={messages.length === 0}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: messages.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: messages.length > 0 ? 0.98 : 1 }}
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <span className="text-red-300">Delete Chat</span>
              </motion.button>
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-slate-700/30">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-800/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm font-medium">User</p>
                  <p className="text-slate-500 text-xs">Free Plan</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}