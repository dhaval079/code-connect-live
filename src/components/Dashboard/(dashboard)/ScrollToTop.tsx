import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop;
      const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrolled / maxHeight) * 100;
      
      setScrollProgress(progress);
      setIsVisible(scrolled > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.button
            onClick={scrollToTop}
            className="relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.1, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            
            {/* Progress ring */}
            <svg
              className="absolute inset-0 w-14 h-14 -rotate-90 transform"
              viewBox="0 0 56 56"
            >
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="2"
              />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
                transition={{
                  duration: 0.1,
                  ease: "easeOut",
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Main button */}
            <motion.div
              className="relative w-14 h-14 bg-slate-900/95 backdrop-blur-xl rounded-full flex items-center justify-center border border-slate-700/50 shadow-2xl"
              whileHover={{
                boxShadow: "0 0 30px 0 rgba(6, 182, 212, 0.4)",
                borderColor: "rgba(6, 182, 212, 0.5)",
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              {/* Inner glow effect */}
              <motion.div
                className="absolute inset-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              
              {/* Icon */}
              <motion.div
                animate={{
                  y: [-1, 1, -1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                <ChevronUp className="w-6 h-6 text-cyan-400 relative z-10" />
              </motion.div>
            </motion.div>

            {/* Tooltip */}
            <motion.div
              className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-800/95 backdrop-blur-xl text-cyan-400 text-sm px-3 py-2 rounded-lg border border-slate-700/50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none"
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              Scroll to top
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-700/50 rotate-45" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;