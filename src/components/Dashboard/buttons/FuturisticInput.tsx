import { useScroll, useTransform, useSpring } from "framer-motion"
import { type ReactNode } from "react"
import { Ease } from "gsap"
import { motion, useReducedMotion } from "framer-motion"
import { Hexagon, LucideIcon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useAnimation } from "framer-motion"
import { HTMLMotionProps } from "framer-motion";


interface FuturisticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }
  
  export const FuturisticInput: React.FC<FuturisticInputProps> = ({ label, icon: Icon, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
  
    return (
      <div className="space-y-2 relative w-full">
        <label className="text-sm font-medium text-cyan-300" htmlFor={props.id}>
          {label}
        </label>
  
        <div className="relative group">
          {/* Text Input */}
          <input
            {...props}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full bg-slate-800/50 
              border-2 border-cyan-500/20 
              text-white placeholder:text-slate-500 
              rounded-lg px-4 py-2 pl-10 
              outline-none transition-all duration-300 
              hover:border-cyan-600
              focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/30
            `}
          />
  
          {/* Input Icon */}
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 pointer-events-none" />
  
          {/* AnimatePresence for Focus Glow */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                key="focusGlow"
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {/* Pulsing border glow */}
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  initial={{ boxShadow: '0 0 0 0 rgba(6,182,212,0.6)' }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(6,182,212,0.6)',
                      '0 0 15px 2px rgba(6,182,212,0.8)',
                      '0 0 0 0 rgba(6,182,212,0.6)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
  
          {/* Neon-like glow on hover (behind input) */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none z-[-1]"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, boxShadow: '0 0 25px 5px rgba(6,182,212,0.4)' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    );
  };
  