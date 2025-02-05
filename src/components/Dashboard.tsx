import { motion } from "framer-motion"
import { Hexagon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useAnimation } from "framer-motion"

import { HTMLMotionProps } from "framer-motion";

export const GlowingButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
} & Omit<HTMLMotionProps<"button">, "children" | "className" | "onClick" | "disabled">> = ({ children, className, onClick, disabled, ...props }) => {
  const buttonRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500  text-white font-medium",
        "shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => !disabled && setIsHovered(false)}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "0%" : "-100%" }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}


interface FuturisticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const FuturisticInput: React.FC<FuturisticInputProps> = ({ label, icon: Icon, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2 relative w-full">
      <label className="text-sm font-medium text-cyan-300" htmlFor={props.id}>
        {label}
      </label>

      <div className="relative group">
        {/* Text Input */}
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full bg-slate-800/50 
            border-2 border-cyan-500/20 
            text-white placeholder:text-slate-500 
            rounded-lg px-4 py-2 pl-10 
            outline-none transition-all duration-300 
            hover:border-cyan-600
            focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/30
          `}
        />

        {/* Input Icon */}
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 pointer-events-none" />

        {/* AnimatePresence for Focus Glow */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              key="focusGlow"
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {/* Pulsing border glow */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                initial={{ boxShadow: '0 0 0 0 rgba(6,182,212,0.6)' }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(6,182,212,0.6)',
                    '0 0 15px 2px rgba(6,182,212,0.8)',
                    '0 0 0 0 rgba(6,182,212,0.6)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neon-like glow on hover (behind input) */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none z-[-1]"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1, boxShadow: '0 0 25px 5px rgba(6,182,212,0.4)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
};


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

export const StatsCard = ({ icon: Icon, title, value }: { icon: LucideIcon; title: string; value: string | number }) => {
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) {
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.3, times: [0, 0.5, 1] },
      })
    }
  }, [isHovered, controls])

  return (
    <motion.div
      className="bg-slate-800/50 rounded-xl p-4 flex items-center space-x-4 cursor-pointer"
      whileHover={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div className="bg-cyan-500/20 p-2 rounded-lg" animate={controls}>
        <Icon className="w-6 h-6 text-cyan-400" />
      </motion.div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <motion.p
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  )
}

export const ParticleField = ({ 
  particleCount = 800,  // Increased from 450 to 800
  minDuration = 2,
  maxDuration = 5,
  maxDelay = 2,
  particleSize = "1px",
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

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) {
      controls.start({
        rotate: [0, 10, -10, 0],
        transition: { duration: 0.5 },
      })
    }
  }, [isHovered, controls])

  return (
    <motion.div
      className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer"
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div className="bg-cyan-500/20 p-3 rounded-full mb-4" animate={controls}>
        <Icon className="w-8 h-8 text-cyan-400" />
      </motion.div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
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

export const RevealAnimation = ({ children }: { children: React.ReactNode }) => {
  const { ref, inView: isInView } = useInView({ triggerOnce: true, rootMargin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

interface RoadmapItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const RoadmapItem: React.FC<RoadmapItemProps> = ({ icon: Icon, title, description }) => (
  <motion.div
    className="flex items-start space-x-4"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="bg-cyan-500/20 p-2 rounded-full"></div>
  </motion.div>
)

import type { LucideIcon } from "lucide-react"

interface HoverCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export const HoverCard = ({ icon: Icon, title, description }: HoverCardProps) => {
  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 shadow-lg"
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.3)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <Icon className="w-8 h-8 text-cyan-400 mr-3" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-slate-300">{description}</p>
    </motion.div>
  )
}


export const NeonGlow = () => {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500 rounded-full filter blur-[150px] opacity-20" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500 rounded-full filter blur-[150px] opacity-20" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-cyan-500 rounded-full filter blur-[150px] opacity-20" />
    </motion.div>
  )
}

import { useScroll, useTransform, useSpring } from "framer-motion"
import { type ReactNode } from "react"
import { Ease } from "gsap"

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

export const ParallaxScroll = ({
    children,
    speed = 1,
    direction = "up",
    easing = "easeInOut",
    springConfig = {
        stiffness: 100,
        damping: 30,
        mass: 1
    },
    threshold = [0.2]
}: ParallaxScrollProps) => {
    const elementRef = useRef<HTMLDivElement>(null)
    const [elementTop, setElementTop] = useState(0)
    const [clientHeight, setClientHeight] = useState(0)
    const { ref: inViewRef, inView } = useInView({ threshold })
    
    const mergedRef = (node: HTMLDivElement) => {
        elementRef.current = node;
        inViewRef(node);
    };

    const { scrollY } = useScroll()

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
    }, [elementRef])

    const scrollRange = [
        Math.max(elementTop - clientHeight, 0),
        elementTop + (elementRef.current?.offsetHeight || 0)
    ]

    const transformRange = direction === "up" 
        ? [0, -(scrollRange[1] - scrollRange[0]) * speed]
        : [0, (scrollRange[1] - scrollRange[0]) * speed]

    const y = useSpring(
        useTransform(
            scrollY, 
            scrollRange, 
            transformRange,
        ), 
        {
            ...springConfig,
            velocity: scrollY.getVelocity()
        }
    )

    return (
        <motion.div
            ref={elementRef}
            style={{
                y: inView ? y : 0,
                willChange: "transform",
            }}
            className="will-change-transform"
        >
            {children}
        </motion.div>
    )
}

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