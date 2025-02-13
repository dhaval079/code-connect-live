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


export default function WaveLoader() {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {[0, 1, 2, 3].map((index) => (
          <motion.circle
            key={index}
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={`rgba(96, 165, 250, ${0.1 + index * 0.2})`}
            strokeWidth="4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 1],
              opacity: [1, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    )
  }