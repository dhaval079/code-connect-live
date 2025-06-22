import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIThinkingAnimation = () => {
  // States to control animation phases
  const [phase, setPhase] = useState(0);
  const phases = ["Thinking", "Processing", "Generating"];
  
  // Auto-cycle through phases
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % phases.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-start mt-4"
    >
      <motion.div 
        className="bg-gray-800/70 backdrop-blur-md rounded-xl px-4 py-3 border border-gray-700/50 flex items-center gap-3 overflow-hidden relative"
        whileHover={{ scale: 1.01 }}
      >
        {/* Elegant loader */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Rotating ring */}
          <motion.div 
            className="absolute w-full h-full rounded-full border-2 border-transparent border-t-blue-400 border-r-indigo-400"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear"
            }}
          />
          
          {/* Pulsing core */}
         
        </div>
        
        {/* Animated text */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div 
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-200">
                  {phases[phase]}
                </span>
                
                <div className="flex ml-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1 h-1 mx-0.5 rounded-full bg-blue-400"
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Subtle scanning effect */}
        <motion.div
          className="absolute inset-y-0 w-20 -skew-x-12 -z-10"
          style={{
            background: "linear-gradient(to right, transparent, rgba(96, 165, 250, 0.08), transparent)"
          }}
          animate={{
            x: ["-100%", "200%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default AIThinkingAnimation;