// ModernLoader.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ModernLoaderProps {
  onComplete?: () => void;
  duration?: number; // Allows customizing the total load time (in ms)
}

// ======================
// 1. Custom Hook
// ======================
function useProgress(duration: number, onComplete?: () => void): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      if (newProgress < 100) {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        onComplete?.();
      }
    };

    requestAnimationFrame(updateProgress);
  }, [duration, onComplete]);

  return progress;
}

// ======================
// 2. Constants
// ======================
const RADIUS = 70;
const STROKE_WIDTH = 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Number of pulsing shadows around loader
const PULSING_LAYERS = 4;
// Number of subtle concentric circles behind the progress circle
const SUBTLE_CIRCLES = 3;
// Number of orbiting dots
const ORBITING_DOTS = 12;

// ======================
// 3. Main Component
// ======================
const ModernLoader: React.FC<ModernLoaderProps> = ({
  onComplete,
  duration = 3000, // Default: 3 seconds
}) => {
  // 1. Progress Logic
  const progress = useProgress(duration, onComplete);

  // 2. Stroke offset calculation
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="relative flex items-center justify-center w-68 h-68">
      {/* Soft Teal-Blue Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 to-blue-800/30 backdrop-blur-xl rounded-full" />

      {/* Pulsing Outer Shadows */}
      {[...Array(PULSING_LAYERS)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          initial={{ boxShadow: '0 0 0 rgba(56, 189, 248, 0)' }}
          animate={{
            boxShadow: '0 0 60px rgba(56, 189, 248, 0.2)',
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Circular SVG Loader */}
      <motion.svg
        className="transform -rotate-90 w-56 h-56"
        viewBox={`0 0 ${(RADIUS + STROKE_WIDTH) * 2} ${
          (RADIUS + STROKE_WIDTH) * 2
        }`}
        animate={{ rotate: [0, 360] }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: 'linear',
        }}
      >
        {/* Subtle concentric circles */}
        {[...Array(SUBTLE_CIRCLES)].map((_, i) => (
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

        {/* Progress Circle */}
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

        {/* Gradient Definition */}
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
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
      </motion.svg>

      {/* Percentage Text & Subtext */}
      <div className="absolute flex flex-col items-center justify-center">
        <div className="relative flex items-baseline">
          <motion.span
            className="text-7xl font-light italic text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400"
            animate={{ opacity: [0.8, 1] }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(progress)}
          </motion.span>
          <span className="text-3xl font-light italic text-teal-300/80 ml-1">
            %
          </span>
        </div>

        <motion.div
          className="text-base text-slate-300/80 mt-3 font-light tracking-wider"
        >
          <span className="italic">Loading</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ...
          </motion.span>
        </motion.div>
      </div>

      {/* Orbiting Dots */}
      {[...Array(ORBITING_DOTS)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            // This calculation sets each dot at an angle of i*(360/ORBITING_DOTS)
            top: `${50 + 40 * Math.sin(i * (2 * Math.PI / ORBITING_DOTS))}%`,
            left: `${50 + 40 * Math.cos(i * (2 * Math.PI / ORBITING_DOTS))}%`,
            background:
              'radial-gradient(circle, rgba(45, 212, 191, 0.6) 0%, rgba(45, 212, 191, 0) 70%)',
          }}
          animate={{
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};

export default ModernLoader;
