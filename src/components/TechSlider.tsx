"use client"

import { motion } from "framer-motion"

const phrases = ["Code Together", "Build Faster", "Ship Better", "Scale Higher", "Dream Bigger"]

export const CodeConnectSlider = () => {
  return (
    <div className="w-full overflow-hidden bg-slate-900/50 py-32">
      <motion.div
        className="whitespace-nowrap"
        animate={{
          x: [0, -1920],
        }}
        transition={{
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        <div className="inline-flex">
          {[...phrases, ...phrases].map((text, i) => (
            <div key={i} className="mx-4 inline-flex items-center text-[120px] font-bold tracking-tighter">
              <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">{text}</span>
              <span className="mx-8 text-slate-600">/</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

