"use client"

import React, { useRef, useEffect, useState, useMemo, RefObject } from "react"
import { motion, useAnimation, useReducedMotion, Variant, Variants, HTMLMotionProps, AnimationControls } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"

type RevealDirection = "up" | "down" | "left" | "right"
type RevealEffect = "fade" | "slide" | "scale" | "rotate" | "flip" | "skew" | "blur"

interface RevealAnimationProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  direction?: RevealDirection
  effect?: RevealEffect | RevealEffect[]
  duration?: number
  delay?: number
  stagger?: number
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
  customVariants?: Variants
  easing?: string
  offsetDistance?: number
  scale?: number
  rotate?: number
  opacity?: number
  transformOrigin?: string
  className?: string
  skew?: number
  blur?: number
  repeatDelay?: number
  repeat?: number
  repeatType?: "loop" 
  onAnimationComplete?: () => void
  viewport?: {  amount?: number | "some" | "all" }
}

const defaultVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const getDirectionOffset = (direction: RevealDirection, distance: number): Partial<Variant> => {
  switch (direction) {
    case "up": return { y: distance }
    case "down": return { y: -distance }
    case "left": return { x: distance }
    case "right": return { x: -distance }
    default: return {}
  }
}

const createVariants = (
  direction: RevealDirection,
  effect: RevealEffect[],
  offsetDistance: number,
  scale: number,
  rotate: number,
  opacity: number,
  skew: number,
  blur: number
): Variants => {
  let hidden: Variant & { scale?: number; rotate?: number; rotateY?: number; skew?: number; filter?: string } = { opacity }
  let visible: Variant & { scale?: number; rotate?: number; rotateY?: number; skew?: number; filter?: string } = { opacity: 1 }

  if (effect.includes("fade")) {
    hidden.opacity = opacity
  }
  if (effect.includes("slide")) {
    const offset = getDirectionOffset(direction, offsetDistance)
    hidden = { ...hidden, ...offset } as Variant & { scale?: number; rotate?: number; rotateY?: number; skew?: number; filter?: string }
    visible = { ...visible, x: 0, y: 0 }
  }
  if (effect.includes("scale")) {
    hidden.scale = scale
    visible.scale = 1
  }
  if (effect.includes("rotate")) {
    hidden = { ...hidden, rotate: rotate }
    visible = { ...hidden, rotate: 0 }
  }
  if (effect.includes("flip")) {
    hidden.rotateY = 180
    visible.rotateY = 0
  }
  if (effect.includes("skew")) {
    hidden.skew = skew
    visible.skew = 0
  }
  if (effect.includes("blur")) {
    hidden.filter = `blur(${blur}px)`
    visible.filter = "blur(0px)"
  }

  return { hidden, visible }
}

export const RevealAnimation: React.FC<RevealAnimationProps> = ({
  children,
  direction = "up",
  effect = ["fade", "slide"],
  duration = 0.8,
  delay = 0,
  stagger = 0.1,
  threshold = 0.2,
  rootMargin = "-100px",
  triggerOnce = true,
  customVariants,
  easing = "easeOut",
  offsetDistance = 50,
  scale = 0.9,
  rotate = 15,
  opacity = 0,
  transformOrigin = "center",
  className,
  skew = 10,
  blur = 5,
  repeatDelay = 0,
  repeat = 0,
  repeatType = "loop",
  onAnimationComplete,
  viewport,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion()
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
    rootMargin,
  })

  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  const variants = useMemo(() => 
    customVariants || createVariants(
      direction,
      Array.isArray(effect) ? effect : [effect],
      offsetDistance,
      scale,
      rotate,
      opacity,
      skew,
      blur
    ),
    [customVariants, direction, effect, offsetDistance, scale, rotate, opacity, skew, blur]
  )

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    } else if (!triggerOnce) {
      controls.start("hidden")
    }
  }, [controls, inView, triggerOnce])

  const animateChildren = (child: React.ReactNode, index: number) => {
    if (React.isValidElement(child)) {
      return (
        <motion.div
          key={index}
          variants={variants}
          transition={{
            duration: isClient ? (prefersReducedMotion ? 0 : duration) : 0,
            delay: isClient ? delay + index * stagger : 0,
            ease: easing,
            repeat,
            repeatType,
            repeatDelay,
          }}
        >
          {child}
        </motion.div>
      )
    }
    return child
  }

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{
        duration: isClient ? (prefersReducedMotion ? 0 : duration) : 0,
        delay: isClient ? delay : 0,
        ease: easing,
        repeat,
        repeatType,
        repeatDelay,
      }}
      style={{ 
        transformOrigin,
        willChange: "opacity, transform",
      }}
      className={cn("reveal-animation", className)}
      onAnimationComplete={onAnimationComplete}
      viewport={viewport}
      {...props}
    >
      {React.Children.map(children, animateChildren)}
    </motion.div>
  )
}

export const RevealGroup: React.FC<RevealAnimationProps & { as?: React.ElementType }> = ({ 
  children, 
  as: Component = "div",
  ...props 
}) => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: props.triggerOnce,
    threshold: props.threshold,
    rootMargin: props.rootMargin,
  })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    } else if (!props.triggerOnce) {
      controls.start("hidden")
    }
  }, [controls, inView, props.triggerOnce])

  return (
    <Component ref={ref}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<RevealAnimationProps>, {
            ...props,
            animate: controls,
            delay: (props.delay || 0) + index * (props.stagger || 0.1),
          })
        }
        return child
      })}
    </Component>
  )
}

export const useRevealAnimation = (options: Omit<RevealAnimationProps, 'children'>): [React.RefObject<HTMLElement>, AnimationControls] => {
  const controls = useAnimation()
  const ref = useRef<HTMLElement>(null)
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: options.triggerOnce,
    threshold: options.threshold,
    rootMargin: options.rootMargin
  })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    } else if (!options.triggerOnce) {
      controls.start("hidden")
    }
  }, [controls, inView, options.triggerOnce])

  // Combine refs
  useEffect(() => {
    if (ref.current) {
      inViewRef(ref.current)
    }
  }, [inViewRef])

  return [ref as RefObject<HTMLElement>, controls]
}
