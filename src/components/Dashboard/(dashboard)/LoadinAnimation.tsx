import React, { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ModernLoaderProps {
  onComplete?: () => void;
  duration?: number;
  entranceDelay?: number;
}

// Performance optimization: Move constants outside component
const RADIUS = 90;
const STROKE_WIDTH = 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PULSING_LAYERS = 5;
const SUBTLE_CIRCLES = 3;
const ORBITING_DOTS = 12;

// Precompute static arrays
const pulsingLayers = Array.from({ length: PULSING_LAYERS });
const subtleCircles = Array.from({ length: SUBTLE_CIRCLES });
const orbitingDots = Array.from({ length: ORBITING_DOTS }, (_, i) => {
  const angle = (i * 2 * Math.PI) / ORBITING_DOTS;
  return {
    top: 50 + 40 * Math.sin(angle),
    left: 50 + 40 * Math.cos(angle),
    delay: i * 0.15,
  };
});

// Optimized progress hook with RAF throttling
function useProgress(duration: number, start: boolean, onComplete?: () => void): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!start) return;

    let lastTimestamp: number;
    let animationFrame: number;

    const updateProgress = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        onComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [duration, onComplete, start]);

  return progress;
}

// Memoized gradient component
const ProgressGradient = memo(() => (
  <defs>
    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#14b8a6">
        <animate
          attributeName="stop-color"
          values="#14b8a6; #0ea5e9; #14b8a6"
          dur="2s"
          repeatCount="indefinite"
        />
      </stop>
      <stop offset="100%" stopColor="#0ea5e9">
        <animate
          attributeName="stop-color"
          values="#0ea5e9; #14b8a6; #0ea5e9"
          dur="2s"
          repeatCount="indefinite"
        />
      </stop>
    </linearGradient>
  </defs>
));



// Main optimized component
export const ModernLoader: React.FC<ModernLoaderProps> = memo(
  ({ onComplete, duration = 3000, entranceDelay = 1000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [startProgress, setStartProgress] = useState(false);



    // Handle entrance animation
    useEffect(() => {
      const showTimer = setTimeout(() => setIsVisible(true), entranceDelay);
      const progressTimer = setTimeout(() => setStartProgress(true), entranceDelay + 500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(progressTimer);
      };
    }, [entranceDelay]);

    // Progress logic with delayed start
    const progress = useProgress(duration, startProgress, onComplete);

    // Memoize stroke offset calculation
    const strokeDashoffset = useMemo(
      () => CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE,
      [progress]
    );

    // Entrance animation variants
    const containerVariants: Variants = {
      hidden: { y: 50, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1] as const, // Custom bezier curve for smooth entrance
        }
      },
      exit: {
        y: 50,
        opacity: 0,
        transition: { duration: 0.5 }
      }
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="relative flex items-center justify-center w-68 h-68"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Optimized background with reduced blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-800/30 to-blue-800/30 backdrop-blur-sm rounded-full" />

            {/* Pulsing layers with reduced repaints */}
            {pulsingLayers.map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                initial={{ boxShadow: '0 0 0 rgba(56, 189, 248, 0)' }}
                animate={{ boxShadow: '0 0 60px rgba(56, 189, 248, 0.2)' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Optimized SVG with reduced nodes */}
            <motion.svg
              className="transform -rotate-90 w-56 h-56"
              viewBox={`0 0 ${(RADIUS + STROKE_WIDTH) * 2} ${(RADIUS + STROKE_WIDTH) * 2}`}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            >
              {subtleCircles.map((_, i) => (
                <circle
                  key={i}
                  cx={RADIUS + STROKE_WIDTH}
                  cy={RADIUS + STROKE_WIDTH}
                  r={RADIUS - i * 4}
                  className="stroke-teal-600/30"
                  fill="none"
                  strokeWidth={0.5}
                />
              ))}

              <motion.circle
                cx={RADIUS + STROKE_WIDTH}
                cy={RADIUS + STROKE_WIDTH}
                r={RADIUS}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />

              <ProgressGradient />
            </motion.svg>

            {/* Optimized percentage display */}
            <motion.div
              className="absolute flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="relative flex items-baseline">
                <motion.span
                  className="text-7xl text-opacity-55 italic text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400"
                >
                  {Math.round(progress)}
                </motion.span>
                <span className="text-3xl font-light text-teal-300/80 ml-1">
                  %
                </span>
              </div>

              <div className="text-base text-slate-300/80 mt-3 font-light tracking-wider">
                <span className="italic">Loading</span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  ...
                </motion.span>
              </div>
            </motion.div>

            {/* Optimized orbiting dots with reduced repaints */}
            {orbitingDots.map((dot, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  top: `${dot.top}%`,
                  left: `${dot.left}%`,
                  background: 'radial-gradient(circle, rgba(45, 212, 191, 0.6) 0%, rgba(45, 212, 191, 0) 70%)',
                }}
                animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: dot.delay,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
