import { motion } from "framer-motion"
import React from "react"

interface EmptyStateProps {}

export const EmptyState: React.FC<EmptyStateProps> = ({}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h3
        className="text-2xl font-semibold text-white tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        How can I assist you today?
      </motion.h3>
    </motion.div>
  )
}
