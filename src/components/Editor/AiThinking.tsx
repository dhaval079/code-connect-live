import React from 'react';
import { motion } from 'framer-motion';

const AIThinkingAnimation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex justify-start"
    >
      <motion.div 
        className="bg-gray-800/40 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-gray-700/20 flex items-center"
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        {/* Premium dot animation */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400"
              animate={{
                opacity: [0.4, 1, 0.4],
                y: [0, -2, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIThinkingAnimation;