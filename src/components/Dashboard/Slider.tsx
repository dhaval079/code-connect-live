"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"

const phrases = ["Code Together", "Build Faster", "Ship Better", "Scale Higher", "Dream Bigger"]

export const CodeConnectSlider = () => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="w-full overflow-hidden bg-slate-900/50 py-32 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background pulse */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Main text slider */}
      <div className="relative">
        <motion.div
          className="whitespace-nowrap"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            x: {
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              duration: isHovered ? 35 : 25, // Slower base speed with smoother hover transition
              ease: "linear",
            },
          }}
        >
          <div className="inline-flex items-center">
            {[...phrases, ...phrases].map((text, i) => (
              <motion.div
                key={i}
                className="mx-4 inline-flex items-center text-[120px] font-bold tracking-tighter"
                whileHover={{
                  scale: 1.02,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }
                }}
              >
                <motion.span
                  className="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent"
                  initial={{ opacity: 0.9 }}
                  whileHover={{
                    opacity: 1,
                    transition: {
                      duration: 0.2
                    }
                  }}
                >
                  {text}
                </motion.span>
                <motion.span
                  className="mx-8 text-slate-600"
                  animate={{
                    opacity: [0.3, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  /
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subtle edge fading */}
      <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-slate-900/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-slate-900/50 to-transparent pointer-events-none" />
    </div>
  )
}

export default CodeConnectSlider