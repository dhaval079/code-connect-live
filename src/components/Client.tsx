"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion"
import { createAvatar } from "@dicebear/core"
import { bottts, lorelei, micah } from "@dicebear/collection"
import { Sparkles, MessageSquare, Zap, Activity } from 'lucide-react'

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
}

const moodEmojis = {
  happy: "😊",
  neutral: "😐",
  busy: "😓"
}

const Particles = ({ mood }: { mood: "happy" | "neutral" | "busy" }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: moodColors[mood] }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

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

export const Client: React.FC<ClientProps> = ({ user, isActive, isTyping, lastActive, messageCount, mood }) => {
  const [avatar, setAvatar] = useState("")
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    const styles = [bottts, lorelei, micah];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    
    const avatarSvg = createAvatar(randomStyle, {
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
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <motion.div
      ref={ref}
      className="relative flex items-center overflow-y-scroll space-x-4 p-6 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 shadow-lg overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      whileHover={{ scale: 1.03 }}
    >
      {/* <Particles mood={mood} /> */}
      
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

        {/* <motion.div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: moodColors[mood] }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.2 }}
        >
          {moodEmojis[mood]}
        </motion.div> */}
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
