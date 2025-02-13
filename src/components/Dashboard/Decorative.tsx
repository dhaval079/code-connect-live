import { motion, useReducedMotion } from "framer-motion"
import { Hexagon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useAnimation } from "framer-motion"
import { HTMLMotionProps } from "framer-motion";


export const FloatingHexagon = ({ delay = 0 }) => (
  <motion.div
    className="absolute"
    style={{
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.1, 0.3, 0.1],
      scale: [1, 1.2, 1],
      rotate: [0, 360],
    }}
    transition={{
      duration: 20,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    }}
  >
    <Hexagon className="w-8 h-8 text-cyan-500/10" />
  </motion.div>
)

export const CodeBlock = () => {
    const codeLines = [
        "const room = new CodeRoom();",
        "room.onJoin((user) => {",
        "    console.log(`${user} joined`);",
        "});",
        "",
        "room.onMessage((msg) => {",
        "    collaborators.push(msg);",
        "});",
    ]

    return (
        <motion.div
            className="bg-slate-800/70 rounded-lg p-4 font-mono text-sm text-cyan-300 overflow-hidden relative whitespace-pre"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            {codeLines.map((line, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    {line}
                </motion.div>
            ))}
            <motion.div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
                animate={{
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                }}
            />
        </motion.div>
    )
}

export const AnimatedLogo = () => (
  <motion.div
    className="relative w-12 h-12"
    animate={{
      rotate: [0, 360],
    }}
    transition={{
      duration: 20,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    }}
  >
    <motion.div
      className="absolute inset-0"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    >
      <Hexagon className="w-full h-full text-cyan-400" />
    </motion.div>
    <motion.div
      className="absolute inset-0"
      animate={{
        rotate: [0, -360],
      }}
      transition={{
        duration: 40,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      <Hexagon className="w-full h-full text-blue-400 opacity-50" />
    </motion.div>
  </motion.div>
)

export const PulsingCircle = () => (
  <div className="relative">
    <motion.div
      className="absolute inset-0 bg-cyan-500 rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.5, 0, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      }}
    />
    <div className="relative bg-cyan-500 w-3 h-3 rounded-full" />
  </div>
)










