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


interface ParallaxScrollProps {
    children: ReactNode;
    speed?: number;           
    direction?: "up" | "down"; 
    easing?: "linear" | "easeIn" | "easeOut" | "easeInOut" | number[];  // Modified to accept array
    springConfig?: {          
        stiffness?: number;
        damping?: number;
        mass?: number;
    };
    threshold?: number[];      
}

export function ParallaxScroll({
  children,
  speed = 0.5, // make it small for slower effect
  direction = "up",
}: ParallaxScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [elementTop, setElementTop] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  // Intersection observer to see if in viewport
  const { ref: inViewRef, inView } = useInView({ threshold: 0.2 })

  // Merge refs so we can both track size and observe intersection
  const mergedRef = (node: HTMLDivElement) => {
    elementRef.current = node
    inViewRef(node)
  }

  // Track window scroll
  const { scrollY } = useScroll()

  // On mount or resize, recalc positions
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const onResize = () => {
      setElementTop(element.offsetTop)
      setClientHeight(window.innerHeight)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Calculate how far the parallax should move
  const scrollRange = [
    Math.max(elementTop - clientHeight, 0),
    elementTop + (elementRef.current?.offsetHeight ?? 0)
  ]
  const totalDistance = (scrollRange[1] - scrollRange[0]) * speed
  
  const transformRange = 
    direction === "up" ? [0, -totalDistance] : [0, totalDistance]

  // 1) Option A: Direct transform with ease
  // const y = useTransform(scrollY, scrollRange, transformRange, {
  //   ease: "easeOut",
  // })

  // 2) Option B: Spring-based, but slower config + no velocity
  const rawY = useTransform(scrollY, scrollRange, transformRange)
  const y = useSpring(rawY, {
    stiffness: 60,
    damping: 30,
    mass: 1,
    // velocity: 0 // or skip it
  })

  return (
    <motion.div
      ref={mergedRef}
      style={{
        y: inView ? y : 0,
        willChange: "transform",
        transform: "translateZ(0)", // GPU hint
      }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  )
}
