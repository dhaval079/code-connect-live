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