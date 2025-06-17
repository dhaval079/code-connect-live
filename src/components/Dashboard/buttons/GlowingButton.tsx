import { useScroll, useTransform, useSpring } from "framer-motion"
import { type ReactNode } from "react"
import { Ease } from "gsap"
import { motion, useReducedMotion } from "framer-motion"
import { Hexagon, LucideIcon } from "lucide-react"
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
        "relative overflow-hidden px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium",
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
