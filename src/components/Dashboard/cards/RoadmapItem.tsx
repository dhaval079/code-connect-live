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