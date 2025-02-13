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

interface HoverCardProps {
icon?: LucideIcon
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
        {Icon && <Icon className="w-8 h-8 text-cyan-400 mr-3" />}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-slate-300">{description}</p>
    </motion.div>
  )
}