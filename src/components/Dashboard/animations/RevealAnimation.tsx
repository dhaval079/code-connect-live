"use client"

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  RefObject,
  forwardRef,
  useCallback,
  createContext,
  useContext
} from "react"
import {
  motion,
  useAnimation,
  useReducedMotion,
  Variants,
  HTMLMotionProps,
  useMotionValue,
  useSpring,
  cubicBezier
} from "framer-motion"
import { useInView } from "react-intersection-observer"



// Advanced easing curves for award-winning animations
const EASING_CURVES = {
  // Smooth and organic
  smooth: cubicBezier(0.25, 0.46, 0.45, 0.94),
  // Sharp and snappy
  sharp: cubicBezier(0.55, 0.06, 0.68, 0.19),
  // Bouncy and playful
  bounce: cubicBezier(0.68, -0.55, 0.265, 1.55),
  // Elegant and sophisticated
  elegant: cubicBezier(0.23, 1, 0.32, 1),
  // Modern and crisp
  modern: cubicBezier(0.4, 0.0, 0.2, 1),
  // Liquid and flowing
  liquid: cubicBezier(0.25, 0.46, 0.45, 0.94),
  // Magnetic attraction
  magnetic: cubicBezier(0.2, 0, 0.38, 0.9),
}

// Advanced reveal directions with 3D support
type RevealDirection = "up" | "down" | "left" | "right" | "diagonalUpLeft" | "diagonalUpRight" | "diagonalDownLeft" | "diagonalDownRight" | "radial" | "spiral"

// Sophisticated effects
type RevealEffect =
  | "fade"
  | "slide"
  | "scale"
  | "rotate"
  | "rotateX"
  | "rotateY"
  | "skew"
  | "blur"
  | "morph"
  | "magnetic"
  | "liquid"
  | "glitch"
  | "wave"
  | "elastic"
  | "gravity"
  | "particle"
  | "typewriter"
  | "reveal"
  | "clip"

// Stagger patterns for complex animations
type StaggerPattern = "sequence" | "random" | "center" | "edges" | "spiral" | "wave" | "custom"

// Animation contexts for performance
interface AnimationContextValue {
  prefersReducedMotion: boolean
  globalSpeed: number
  debugMode: boolean
}

const AnimationContext = createContext<AnimationContextValue>({
  prefersReducedMotion: false,
  globalSpeed: 1,
  debugMode: false
})

// Props for variant creation (without children requirement)
interface VariantCreationProps {
  direction?: RevealDirection
  effect?: RevealEffect | RevealEffect[]
  offsetDistance?: number
  scale?: { from: number; to: number }
  rotate?: { from: number; to: number }
  opacity?: { from: number; to: number }
  blur?: { from: number; to: number }
}

// Enhanced props with award-winning features
interface RevealAnimationProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode

  // Core animation
  direction?: RevealDirection
  effect?: RevealEffect | RevealEffect[]
  duration?: number
  delay?: number

  // Advanced timing
  stagger?: number | { amount: number; pattern: StaggerPattern; from?: number }
  easing?: keyof typeof EASING_CURVES | string

  // Intersection observer
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean

  // Visual effects
  offsetDistance?: number
  scale?: { from: number; to: number }
  rotate?: { from: number; to: number }
  opacity?: { from: number; to: number }

  // Advanced effects
  magnetic?: {
    enabled: boolean
    strength?: number
    distance?: number
    ease?: keyof typeof EASING_CURVES
  }
  morphing?: {
    enabled: boolean
    path?: string
    intensity?: number
  }

  // Performance
  willChange?: string[]
  transform3d?: boolean

  // Interaction
  hover?: Variants
  tap?: Variants

  // Callbacks
  onStart?: () => void
  onComplete?: () => void
  onViewportEnter?: () => void
  onViewportLeave?: () => void

  // Styling
  className?: string
  style?: React.CSSProperties

  // Debug
  debug?: boolean
}

// Get direction offset with 3D support
const getDirectionOffset = (direction: RevealDirection, distance: number) => {
  const offsets: Record<RevealDirection, any> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    diagonalUpLeft: { x: distance, y: distance },
    diagonalUpRight: { x: -distance, y: distance },
    diagonalDownLeft: { x: distance, y: -distance },
    diagonalDownRight: { x: -distance, y: -distance },
    radial: { scale: 0, opacity: 0 },
    spiral: { rotate: 180, scale: 0, x: distance, y: distance }
  }
  return offsets[direction] || {}
}

// Create sophisticated animation variants
const createAdvancedVariants = (props: VariantCreationProps): Variants => {
  const effects = Array.isArray(props.effect) ? props.effect : [props.effect || "fade"]
  const {
    direction = "up",
    offsetDistance = 60,
    scale = { from: 0.95, to: 1 },
    rotate = { from: 0, to: 0 },
    opacity = { from: 0, to: 1 },
    blur = { from: 8, to: 0 }
  } = props

  let hidden: Record<string, any> = { opacity: opacity.from }
  let visible: Record<string, any> = { opacity: opacity.to }

  // Apply effects
  effects.forEach(effect => {
    switch (effect) {
      case "slide":
        const offset = getDirectionOffset(direction, offsetDistance)
        hidden = { ...hidden, ...offset }
        visible = { ...visible, x: 0, y: 0 }
        break

      case "scale":
        hidden.scale = scale.from
        visible.scale = scale.to
        break

      case "rotate":
        hidden.rotate = rotate.from
        visible.rotate = rotate.to
        break

      case "rotateX":
        hidden.rotateX = rotate.from || -90
        visible.rotateX = 0
        break

      case "rotateY":
        hidden.rotateY = rotate.from || 90
        visible.rotateY = 0
        break

      case "blur":
        hidden.filter = `blur(${blur.from}px)`
        visible.filter = `blur(${blur.to}px)`
        break

      case "skew":
        hidden.skew = 15
        visible.skew = 0
        break

      case "morph":
        hidden.borderRadius = "50%"
        visible.borderRadius = "0%"
        break

      case "elastic":
        // Don't set transition in variants, handle it in the component
        break

      case "liquid":
        hidden.clipPath = "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)"
        visible.clipPath = "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)"
        break

      case "reveal":
        hidden.clipPath = "inset(0 100% 0 0)"
        visible.clipPath = "inset(0 0% 0 0)"
        break

      case "wave":
        hidden.pathLength = 0
        visible.pathLength = 1
        break

      case "glitch":
        // Complex glitch effect with multiple variants
        hidden = {
          ...hidden,
          x: [0, -5, 5, -3, 3, 0],
          filter: "hue-rotate(90deg) saturate(5)",
        }
        break
    }
  })

  return {
    hidden: hidden as any,
    visible: visible as any
  }
}

// Magnetic interaction hook
const useMagneticEffect = (enabled: boolean, strength = 0.3, distance = 150) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { damping: 20, stiffness: 300 })
  const springY = useSpring(y, { damping: 20, stiffness: 300 })

  useEffect(() => {
    if (!enabled || !ref.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const dist = Math.sqrt(deltaX ** 2 + deltaY ** 2)

      if (dist < distance) {
        const factor = (distance - dist) / distance
        x.set(deltaX * strength * factor)
        y.set(deltaY * strength * factor)
      } else {
        x.set(0)
        y.set(0)
      }
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    document.addEventListener("mousemove", handleMouseMove)
    ref.current.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      ref.current?.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [enabled, strength, distance, x, y])

  return { ref, x: springX, y: springY }
}

// Advanced stagger calculation
const calculateStaggerDelay = (
  index: number,
  total: number,
  stagger: RevealAnimationProps["stagger"],
  baseDelay: number = 0
): number => {
  if (typeof stagger === "number") {
    return baseDelay + index * stagger
  }

  if (typeof stagger === "object") {
    const { amount, pattern = "sequence" } = stagger

    switch (pattern) {
      case "random":
        return baseDelay + Math.random() * amount
      case "center":
        const center = Math.floor(total / 2)
        const distanceFromCenter = Math.abs(index - center)
        return baseDelay + distanceFromCenter * amount
      case "edges":
        const distanceFromEdge = Math.min(index, total - 1 - index)
        return baseDelay + distanceFromEdge * amount
      case "spiral":
        return baseDelay + (index * amount) + Math.sin(index * 0.5) * amount * 0.5
      case "wave":
        return baseDelay + Math.sin((index / total) * Math.PI) * amount
      default:
        return baseDelay + index * amount
    }
  }

  return baseDelay
}

// Main Enhanced Reveal Component
export const RevealAnimation = forwardRef<HTMLDivElement, RevealAnimationProps>(({
  children,
  direction = "up",
  effect = ["fade", "slide",],
  duration = 0.8,
  delay = 0.2,
  stagger = 0.1,
  easing = "elegant",
  threshold = 0.1,
  rootMargin = "0px 0px -10% 0px",
  triggerOnce = true,
  magnetic = { enabled: false },
  debug = false,
  onStart,
  onComplete,
  onViewportEnter,
  onViewportLeave,
  className = "",
  willChange = ["opacity", "transform"],
  transform3d = true,
  hover,
  tap,
  ...motionProps
}, forwardedRef) => {
  const context = useContext(AnimationContext)
  const prefersReducedMotion = useReducedMotion()
  const controls = useAnimation()
  const [isClient, setIsClient] = useState(false)

  // Refs and intersection observer
  const internalRef = useRef<HTMLDivElement>(null)
  const ref = forwardedRef || internalRef
  const [inViewRef, inView] = useInView({
    triggerOnce,
    threshold,
    rootMargin,
  })

  // Magnetic effect
  const magneticEffect = useMagneticEffect(
    magnetic.enabled,
    magnetic.strength,
    magnetic.distance
  )

  // Performance optimization
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Create variants
  const variants = useMemo(() => createAdvancedVariants({
    direction,
    effect,
    offsetDistance: 60,
    scale: { from: 0.95, to: 1 },
    opacity: { from: 0, to: 1 },
    blur: { from: 8, to: 0 }
  }), [direction, effect])

  // Animation controls
  useEffect(() => {
    if (!isClient || prefersReducedMotion) return

    if (inView) {
      onViewportEnter?.()
      onStart?.()
      controls.start("visible").then(() => {
        onComplete?.()
      })
    } else if (!triggerOnce) {
      onViewportLeave?.()
      controls.start("hidden")
    }
  }, [controls, inView, triggerOnce, isClient, prefersReducedMotion])

  // Combine refs
  useEffect(() => {
    const currentRef = typeof ref === 'function' ? null : (ref as RefObject<HTMLDivElement>)?.current
    if (currentRef) {
      inViewRef(currentRef)
    }
  }, [inViewRef, ref])

  // Skip animation for reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const easingFunction = typeof easing === "string" && EASING_CURVES[easing as keyof typeof EASING_CURVES]
    ? EASING_CURVES[easing as keyof typeof EASING_CURVES]
    : (easing as any)

  return (
    <motion.div
      ref={ref as any}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{
        duration: isClient ? duration * (context.globalSpeed || 1) : 0,
        delay: isClient ? delay : 0,
        ease: easingFunction || "easeOut",
        type: "tween"
      }}
      whileHover={hover as any}
      whileTap={tap as any}
      style={{
        willChange: willChange.join(", "),
        transform: transform3d ? "translate3d(0,0,0)" : undefined,
        x: magnetic.enabled ? magneticEffect.x : undefined,
        y: magnetic.enabled ? magneticEffect.y : undefined,
        ...motionProps.style,
      }}
      className={`enhanced-reveal ${className} ${debug ? "debug-mode" : ""}`}
      {...motionProps}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child

        const childDelay = calculateStaggerDelay(
          index,
          React.Children.count(children),
          stagger,
          delay
        )

        return (
          <motion.div
            key={index}
            variants={variants}
            transition={{
              duration: isClient ? duration * (context.globalSpeed || 1) : 0,
              delay: isClient ? childDelay : 0,
              ease: easingFunction || "easeOut",
              type: "tween"
            }}
            style={{
              willChange: willChange.join(", "),
            }}
          >
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
})

RevealAnimation.displayName = "RevealAnimation"

// Advanced Reveal Group for complex sequences
export const RevealSequence: React.FC<{
  children: React.ReactNode
  pattern?: StaggerPattern
  stagger?: number
  className?: string
}> = ({
  children,
  pattern = "sequence",
  stagger = 0.15,
  className = ""
}) => {
    const controls = useAnimation()
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    })

    const variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: stagger,
          delayChildren: 0.2,
        }
      }
    }

    useEffect(() => {
      if (inView) {
        controls.start("visible")
      }
    }, [controls, inView])

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        className={`reveal-sequence ${className}`}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: {
                opacity: 0,
                y: 30,
                scale: 0.95
              },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  damping: 25,
                  stiffness: 120,
                  mass: 1
                }
              }
            }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    )
  }

// Hook for programmatic control
export const useRevealAnimation = (
  options: Omit<RevealAnimationProps, 'children'>
) => {
  const controls = useAnimation()
  const ref = useRef<HTMLDivElement>(null)
  const [inViewRef, inView] = useInView({
    triggerOnce: options.triggerOnce || true,
    threshold: options.threshold || 0.1,
    rootMargin: options.rootMargin || "0px 0px -10% 0px"
  })

  // Magnetic effect
  const magneticEffect = useMagneticEffect(
    options.magnetic?.enabled || false,
    options.magnetic?.strength,
    options.magnetic?.distance
  )

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    } else if (!options.triggerOnce) {
      controls.start("hidden")
    }
  }, [controls, inView, options.triggerOnce])

  const trigger = useCallback((variant: "visible" | "hidden") => {
    return controls.start(variant)
  }, [controls])

  return {
    ref,
    inViewRef,
    controls,
    inView,
    trigger,
    magneticX: magneticEffect.x,
    magneticY: magneticEffect.y,
  }
}

// Provider for global animation settings
export const AnimationProvider: React.FC<{
  children: React.ReactNode
  globalSpeed?: number
  debugMode?: boolean
}> = ({
  children,
  globalSpeed = 1,
  debugMode = false
}) => {
    const prefersReducedMotion = useReducedMotion()

    return (
      <AnimationContext.Provider value={{
        prefersReducedMotion: prefersReducedMotion || false,
        globalSpeed,
        debugMode
      }}>
        {children}
      </AnimationContext.Provider>
    )
  }

// Demo Component
const Demo: React.FC = () => {
  const [currentEffect, setCurrentEffect] = useState<RevealEffect>("slide")
  const [currentDirection, setCurrentDirection] = useState<RevealDirection>("up")
  const [magneticEnabled, setMagneticEnabled] = useState(false)

  const effects: RevealEffect[] = ["slide", "scale", "rotate", "blur", "morph", "liquid", "reveal", "elastic"]
  const directions: RevealDirection[] = ["up", "down", "left", "right", "diagonalUpLeft", "radial", "spiral"]

  return (
    <AnimationProvider globalSpeed={1} debugMode={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <RevealAnimation
            effect={["fade", "slide"]}
            direction="down"
            duration={1}
            delay={0.2}
            easing="elegant"
          >
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Award-Winning Animations
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Experience next-level reveal animations with magnetic effects, advanced easing, and sophisticated transitions
              </p>
            </div>
          </RevealAnimation>

          {/* Controls */}
          <RevealAnimation
            effect="scale"
            delay={0.4}
            className="mb-16"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold mb-6">Animation Controls</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Effect</label>
                  <select
                    value={currentEffect}
                    onChange={(e) => setCurrentEffect(e.target.value as RevealEffect)}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    {effects.map(effect => (
                      <option key={effect} value={effect} className="bg-gray-800">
                        {effect.charAt(0).toUpperCase() + effect.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Direction</label>
                  <select
                    value={currentDirection}
                    onChange={(e) => setCurrentDirection(e.target.value as RevealDirection)}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    {directions.map(direction => (
                      <option key={direction} value={direction} className="bg-gray-800">
                        {direction.charAt(0).toUpperCase() + direction.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Magnetic</label>
                  <button
                    onClick={() => setMagneticEnabled(!magneticEnabled)}
                    className={`w-full p-3 rounded-lg border transition-all ${magneticEnabled
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'bg-white/10 border-white/20 text-gray-300'
                      }`}
                  >
                    {magneticEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          </RevealAnimation>

          {/* Demo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {Array.from({ length: 6 }, (_, i) => (
              <RevealAnimation
                key={i}
                effect={[currentEffect, "fade"]}
                direction={currentDirection}
                delay={i * 0.1}
                duration={0.8}
                easing="elegant"
                magnetic={{
                  enabled: magneticEnabled,
                  strength: 0.2,
                  distance: 120
                }}
                hover={{
                  scale: 1.02,
                  y: -5,
                  transition: { type: "tween", duration: 0.2 }
                } as any}
                className="transform-gpu"
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Demo Card {i + 1}</h3>
                  <p className="text-gray-400 text-sm">
                    This card demonstrates the {currentEffect} effect with {currentDirection} direction
                  </p>
                </div>
              </RevealAnimation>
            ))}
          </div>

          {/* Advanced Sequence */}
          <RevealAnimation
            effect="liquid"
            duration={1.2}
            delay={0.5}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Advanced Sequences</h2>
              <p className="text-gray-300">Complex staggered animations with different patterns</p>
            </div>
          </RevealAnimation>

          <RevealSequence pattern="center" stagger={0.1}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-20 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg mb-4 flex items-center justify-center text-black font-semibold">
                Sequence Item {i + 1}
              </div>
            ))}
          </RevealSequence>

          {/* Footer */}
          <RevealAnimation
            effect={["fade", "scale"]}
            delay={1}
            className="mt-20 text-center"
          >
            <div className="text-gray-400">
              <p>✨ Built with advanced animation techniques for award-winning user experiences</p>
            </div>
          </RevealAnimation>
        </div>
      </div>

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .enhanced-reveal {
            transform-style: preserve-3d;
          }
          
          .debug-mode {
            outline: 2px dashed rgba(255, 0, 255, 0.5) !important;
          }
          
          .reveal-sequence > * {
            transform-style: preserve-3d;
          }
        `
      }} />
    </AnimationProvider>
  )
}

export default Demo