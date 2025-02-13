// src/components/TypingIndicator.tsx
'use client';

import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  activeUser: string | null;
}

export const TypingIndicator = ({ activeUser }: TypingIndicatorProps) => {
  if (!activeUser) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center space-x-2 py-2 px-4 rounded-lg bg-slate-800/50"
    >
      <span className="text-sm text-white/90">{activeUser} is typing</span>
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
            animate={{
              y: ["0%", "-50%", "0%"],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TypingIndicator;