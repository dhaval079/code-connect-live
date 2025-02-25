// components/LoadingScreen.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernLoader } from './LoadinAnimation';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-900 flex items-center justify-center z-50"
        >
          <ModernLoader onComplete={() => setIsVisible(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}