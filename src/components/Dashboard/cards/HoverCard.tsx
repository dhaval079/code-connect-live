import { motion, useReducedMotion } from "framer-motion"
import { Hexagon, LucideIcon } from "lucide-react"

interface HoverCardProps {
icon?: LucideIcon
title: string
  description: string
}

export const HoverCard = ({ icon: Icon, title, description }: HoverCardProps) => {
  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 shadow-lg"
      whileHover={{ scale: 1.05, boxShadow: "5px 5px 40px 5px rgba(6, 182, 212, 0.4)" }}
      transition={{ duration: 1 }}
    >
      <div className="flex items-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-cyan-400 mr-3" />}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-slate-300">{description}</p>
    </motion.div>
  )
}