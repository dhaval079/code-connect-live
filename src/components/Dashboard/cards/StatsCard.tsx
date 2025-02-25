import { useAnimation } from "framer-motion"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { useState, useEffect } from "react"

export const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  capacity = "10k" 
}: { 
  icon: LucideIcon
  title: string
  value: string | number
  capacity?: string
}) => {
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
      className="bg-slate-800/50 opacity-85 rounded-xl p-4 flex items-center space-x-4 cursor-pointer"
      whileHover={{ boxShadow: "0px 0px 30px 0px rgba(6, 182, 212, 0.4)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div className="bg-cyan-500/20 p-2 rounded-lg" animate={controls}>
        <Icon className="w-6 h-6 text-cyan-400" />
      </motion.div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-400">{title}</p>
          <span className="text-xs italic text-slate-500">Capacity</span>
        </div>
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

export default StatsCard