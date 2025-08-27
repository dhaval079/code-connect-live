// components/LoadingScreen.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernLoader } from './LoadinAnimation';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleComplete = () => {
    setIsVisible(false);
    // Call the onComplete callback after exit animation
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 7000); // Match the exit animation duration
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleComplete();
    }, 12000);
    
    // Add a backup timeout
    const backupTimer = setTimeout(() => {
      handleComplete();
    }, 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(backupTimer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 0.95,
            y: -20,
            transition: {
              duration: 0.8,
              ease: [0.55, 0.06, 0.68, 0.19], // Custom easing for smooth exit
            }
          }}
          className="fixed inset-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50"
        >
          <motion.div
            exit={{
              opacity: 0,
              scale: 0.9,
              y: -30,
              transition: {
                duration: 0.6,
                ease: [0.55, 0.06, 0.68, 0.19],
              }
            }}
          >
            <ModernLoader onComplete={handleComplete} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}