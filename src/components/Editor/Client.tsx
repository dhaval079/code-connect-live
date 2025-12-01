"use client"

import React, { useRef } from "react"
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion"
import Avatar from "react-nice-avatar"

interface ClientProps {
  user: string
  isActive: boolean
  isTyping: boolean
  lastActive: string
  mood: "happy" | "neutral" | "busy" | null
  isDarkMode?: boolean
}

const moodColors = {
  happy: "#4ade80",
  neutral: "#60a5fa",
  busy: "#f87171"
} as const

const TypingAnimation = ({ isDarkMode = true }: { isDarkMode?: boolean }) => {
  return (
    <div className={`relative flex items-center gap-1.5 px-2 py-1 rounded-full ${
      isDarkMode
        ? "bg-slate-800/60 text-slate-300"
        : "bg-slate-200/70 text-slate-500"
    }`}>
      <motion.span
        className="text-[11px] font-medium tracking-wide uppercase"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        typing
      </motion.span>
      <div className="relative flex items-center gap-1.5 pl-1">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="inline-block h-1.5 w-1.5 rounded-full bg-current"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.7, 1, 0.7],
              x: [0, 3, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot * 0.18,
            }}
          />
        ))}
        <motion.span
          className={`pointer-events-none absolute inset-y-[-4px] left-0 right-0 rounded-full bg-gradient-to-r from-transparent to-transparent ${
            isDarkMode ? "via-slate-500/25" : "via-white/50"
          }`}
          initial={{ x: "-120%" }}
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  )
}

export const Client: React.FC<ClientProps> = ({
  user,
  isActive,
  isTyping,
  lastActive,
  mood,
  isDarkMode = true
}) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  React.useEffect(() => {
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
      className={`relative flex items-center gap-5 p-6 rounded-2xl border shadow-sm ${
        isDarkMode
          ? "border-slate-800 bg-black text-slate-100"
          : "border-slate-200 bg-white text-slate-900"
      }`}
      variants={cardVariants}
      initial="hidden"
      animate={controls}
    >
      <motion.div className="relative z-10" variants={itemVariants}>
        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
          isDarkMode ? "border-slate-800" : "border-slate-200"
        }`}>
          <Avatar id={user} className="w-full h-full" />
        </div>
      </motion.div>

      <div className="flex flex-col min-w-0 flex-1 z-10">
        <motion.div className="flex items-center gap-2 mb-1" variants={itemVariants}>
          <motion.span
            className={`font-medium truncate text-lg ${
              isDarkMode ? "text-slate-100" : "text-slate-900"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {user}
          </motion.span>
          {isActive && (
            <motion.span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                isDarkMode
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              }`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isDarkMode ? "bg-emerald-400" : "bg-emerald-500"}`} />
              <span>Online</span>
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
              className={`text-sm flex items-center gap-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
              variants={itemVariants}
            >
              <span className={`h-2 w-2 rounded-full ${isDarkMode ? "bg-emerald-400" : "bg-emerald-500"} animate-pulse`} />
              <TypingAnimation isDarkMode={isDarkMode} />
            </motion.div>
          ) : (
            <motion.div
              key="last-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`text-sm flex items-center gap-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              variants={itemVariants}
            >
              <span>Last active: {lastActive}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {mood && (
          <motion.div
            className={`mt-2 inline-flex items-center gap-2 text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            variants={itemVariants}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: moodColors[mood] }}
            />
            <span className="capitalize">{mood}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Client
