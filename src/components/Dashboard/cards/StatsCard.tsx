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
  
  