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

interface RevealAnimationProps {
  children: React.ReactNode
  offsetY?: number
  duration?: number
  delay?: number
  threshold?: number | number[]
  rootMargin?: string
  /** If false, animations re-trigger whenever it re-enters view */
  triggerOnce?: boolean
}

export const RevealAnimation: React.FC<RevealAnimationProps> = ({
  children,
  offsetY = 50,
  duration = 0.8,
  delay = 0,
  threshold = 0.2,
  rootMargin = "-100px",
  triggerOnce = true,
}) => {
  // Check user’s “prefers-reduced-motion” setting
  const prefersReducedMotion = useReducedMotion()

  const { ref, inView } = useInView({
    triggerOnce,
    threshold,
    rootMargin,
  })

  // Variants for motion
  const variants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : offsetY,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : duration,
        ease: "easeOut",
        delay,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      // Initial and animate states driven by intersection observer
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      style={{ willChange: "opacity, transform" }} // Hint for performance
    >
      {children}
    </motion.div>
  )
}
