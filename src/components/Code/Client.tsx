"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion"
import { createAvatar } from "@dicebear/core"
import { Sparkles, MessageSquare, Zap, Activity } from 'lucide-react'
import type { Style } from '@dicebear/core';
import { 
  lorelei, 
  bottts, 
  pixelArt, 
  adventurer,
  micah,
  openPeeps,
  avataaars,
  bigSmile,
  funEmoji,
  notionists,
  personas
} from '@dicebear/collection';

// Define avatar style type
type AvatarStyle = Style<{
  backgroundColor?: string[];
  seed: string;
}>;

// Background colors that work well with all styles
const commonBackgroundColors = [
  "b6e3f4",  // Light Blue
  "c0aede",  // Soft Purple
  "d1d4f9",  // Periwinkle
  "ffd5dc",  // Light Pink
  "ffdfbf"   // Light Peach
];

// Organized avatar styles with balance between masculine, feminine, and neutral options
const avatarStyles = [
  // Feminine-leaning styles
  lorelei as unknown as AvatarStyle,         // Artistic feminine
  notionists as unknown as AvatarStyle,      // Professional feminine
  personas as unknown as AvatarStyle,        // Modern feminine
  
  // Masculine-leaning styles
  adventurer as unknown as AvatarStyle,      // Adventure game masculine
  avataaars as unknown as AvatarStyle,       // Professional masculine
  bigSmile as unknown as AvatarStyle,        // Friendly masculine

  // Gender-neutral styles
  bottts as unknown as AvatarStyle,          // Robot/neutral
  pixelArt as unknown as AvatarStyle,        // Pixel art/neutral
  micah as unknown as AvatarStyle,           // Abstract/neutral
  openPeeps as unknown as AvatarStyle,       // Modern/neutral
  funEmoji as unknown as AvatarStyle         // Emoji/neutral
];

// Configuration for avatar creation
const avatarConfig = {
  backgroundColor: commonBackgroundColors
};

export { 
  avatarStyles, 
  avatarConfig,
  type AvatarStyle 
};

interface ClientProps {
  user: string
  isActive: boolean
  isTyping: boolean
  lastActive: string
  messageCount: number
  mood: "happy" | "neutral" | "busy"
}

const moodColors = {
  happy: "#4ade80",
  neutral: "#60a5fa",
  busy: "#f87171"
} as const

const moodEmojis = {
  happy: "😊",
  neutral: "😐",
  busy: "😓"
} as const

// const avatarStyles = [
//   bottts as unknown as AvatarStyle,
//   lorelei as unknown as AvatarStyle,
//   micah as unknown as AvatarStyle,
//   pixelArt as unknown as AvatarStyle,
//   adventurer as unknown as AvatarStyle,
// ];

const TypingAnimation = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 bg-blue-400 rounded-full"
          initial={{ y: 0 }}
          animate={{
            y: [0, -6, 0],
            transition: {
              duration: 0.6,
              repeat: Infinity,
              delay: dot * 0.2,
            },
          }}
        />
      ))}
    </div>
  )
}

export const Client: React.FC<ClientProps> = ({ 
  user, 
  isActive, 
  isTyping, 
  lastActive, 
  messageCount, 
  mood 
}) => {
  const [avatar, setAvatar] = useState("")
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    // Get consistent avatar style for user
    const styleIndex = user
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarStyles.length;
    const style = avatarStyles[styleIndex];
    
    const avatarSvg = createAvatar(style, {
      seed: user,
      backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
    }).toDataUri()
    
    setAvatar(avatarSvg)
  }, [user])

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  } as const

  return (
    <motion.div
      ref={ref}
      className="relative flex items-center overflow-y-scroll space-x-4 p-6 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 shadow-lg overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      whileHover={{ scale: 1.03 }}
    >
      <motion.div className="relative z-10" variants={itemVariants}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5],
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-75 blur-lg"
            />
          )}
        </AnimatePresence>

        <motion.div
          className="relative rounded-full overflow-hidden"
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          <img src={avatar || "/placeholder.svg"} alt={user} className="w-16 h-16" />
        </motion.div>
      </motion.div>

      <div className="flex flex-col min-w-0 flex-1 z-10">
        <motion.div className="flex items-center space-x-2 mb-1" variants={itemVariants}>
          <motion.span
            className="font-medium text-white truncate text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {user}
          </motion.span>
          {isActive && (
            <motion.span
              className="text-xs bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full flex items-center space-x-1"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <Sparkles size={12} />
              <span>Active</span>
            </motion.span>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {isTyping ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-blue-400 flex items-center space-x-2"
              variants={itemVariants}
            >
              <MessageSquare size={14} />
              <span>typing</span>
              <TypingAnimation />
            </motion.div>
          ) : (
            <motion.div
              key="last-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-sm text-gray-400 flex items-center space-x-1"
              variants={itemVariants}
            >
              <Zap size={14} />
              <span>Last active: {lastActive}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute top-2 right-2 bg-gray-700 rounded-full px-2 py-1 text-xs text-white flex items-center space-x-1"
        initial={{ opacity: 0, scale: 0, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.6, type: "spring" }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        variants={itemVariants}
      >
        <MessageSquare size={12} />
        <span>{messageCount}</span>
      </motion.div>

      <motion.div
        className="absolute bottom-2 right-2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        variants={itemVariants}
      >
        <Activity size={16} className="text-gray-400" />
      </motion.div>
    </motion.div>
  )
}

export default Client
