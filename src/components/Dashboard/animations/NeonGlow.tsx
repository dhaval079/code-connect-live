import { motion } from "framer-motion"
export const NeonGlow = () => {
    return (
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500 rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500 rounded-full filter blur-[150px] opacity-30" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-cyan-500 rounded-full filter blur-[150px] opacity-20" />
      </motion.div>
    )
  }