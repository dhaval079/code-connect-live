import { useScroll, useTransform, useSpring } from "framer-motion"
import { type ReactNode } from "react"
import { Ease } from "gsap"
import { motion, useReducedMotion } from "framer-motion"
import { Hexagon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useAnimation } from "framer-motion"
import { HTMLMotionProps } from "framer-motion";

export const ParticleField = ({ 
    particleCount = 1000,  // Increased from 450 to 800
    minDuration = 2,
    maxDuration = 5,
    maxDelay = 2,
    particleSize = "3px",
    particleColor = "rgb(6 182 212 / 0.3)", // tailwind cyan-500/30
  }) => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: particleSize,
              height: particleSize,
              backgroundColor: particleColor,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              z: [0, 50, 0],
            }}
            transition={{
              duration: Math.random() * (maxDuration - minDuration) + minDuration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
              delay: Math.random() * maxDelay,
            }}
          />
        ))}
      </div>
    )
  }
  