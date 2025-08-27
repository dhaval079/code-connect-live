import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  variant?: 'default' | 'dark' | 'glass' | 'gradient' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  offset?: number;
  arrow?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce' | 'glow';
  disabled?: boolean;
  maxWidth?: string;
  trigger?: 'hover' | 'click' | 'focus';
}

export const ToolTipText: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'auto',
  variant = 'glass',
  size = 'md',
  delay = 200,
  offset = 8,
  arrow = true,
  animation = 'fade',
  disabled = false,
  maxWidth = '250px',
  trigger = 'hover'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform values for glow effect
  const rotateX = useTransform(mouseY, [-100, 100], [5, -5]);
  const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

  // Auto-position calculation
  useEffect(() => {
    if (position === 'auto' && triggerRef.current && isVisible) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Determine best position based on available space
      if (rect.top > viewportHeight / 2) {
        setCurrentPosition('top');
      } else if (rect.bottom < viewportHeight / 2) {
        setCurrentPosition('bottom');
      } else if (rect.left > viewportWidth / 2) {
        setCurrentPosition('left');
      } else {
        setCurrentPosition('right');
      }
    } else if (position !== 'auto') {
      setCurrentPosition(position);
    }
  }, [position, isVisible]);

  // Handle mouse movement for glow effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  // Show/hide handlers with debouncing
  const handleShow = () => {
    if (disabled) return;

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    if (!isVisible) {
      const timeout = setTimeout(() => setIsVisible(true), delay);
      setShowTimeout(timeout);
    }
  };

  const handleHide = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }

    const timeout = setTimeout(() => setIsVisible(false), 100);
    setHideTimeout(timeout);
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      setIsVisible(true);
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      setIsVisible(false);
    }
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'dark':
        return 'bg-gray-900/95 text-white border border-gray-700/50 shadow-xl';
      case 'glass':
        return 'bg-white/10 text-white border border-white/20 backdrop-blur-xl shadow-2xl';
      case 'gradient':
        return 'bg-gradient-to-r from-purple-500/90 via-blue-500/90 to-cyan-500/90 text-white border border-white/20 shadow-2xl';
      case 'minimal':
        return 'bg-black/80 text-white border-none shadow-lg';
      default:
        return 'bg-gray-800/95 text-white border border-gray-600/50 shadow-xl';
    }
  };

  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  // Position styles
  const getPositionStyles = () => {
    switch (currentPosition) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: `${offset}px`
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: `${offset}px`
        };
      case 'left':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: `${offset}px`
        };
      case 'right':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: `${offset}px`
        };
      default:
        return {};
    }
  };

  // Arrow styles
  const getArrowStyles = () => {
    const arrowSize = 6;
    const baseStyles = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid' as const,
    };

    switch (currentPosition) {
      case 'top':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: variant === 'glass' ? 'rgba(255,255,255,0.2) transparent transparent transparent' :
            variant === 'gradient' ? '#8b5cf6 transparent transparent transparent' :
              '#374151 transparent transparent transparent'
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: variant === 'glass' ? 'transparent transparent rgba(255,255,255,0.2) transparent' :
            variant === 'gradient' ? 'transparent transparent #8b5cf6 transparent' :
              'transparent transparent #374151 transparent'
        };
      case 'left':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: variant === 'glass' ? 'transparent transparent transparent rgba(255,255,255,0.2)' :
            variant === 'gradient' ? 'transparent transparent transparent #8b5cf6' :
              'transparent transparent transparent #374151'
        };
      case 'right':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: variant === 'glass' ? 'transparent rgba(255,255,255,0.2) transparent transparent' :
            variant === 'gradient' ? 'transparent #8b5cf6 transparent transparent' :
              'transparent #374151 transparent transparent'
        };
      default:
        return baseStyles;
    }
  };

  // Animation variants
  const getAnimationVariants = () => {
    const baseDistance = 10;

    switch (animation) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 }
        };
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0.3, y: baseDistance },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.8, y: baseDistance / 2 }
        };
      case 'glow':
        return {
          initial: { opacity: 0, scale: 0.9, boxShadow: '0 0 0 rgba(139, 92, 246, 0)' },
          animate: { opacity: 1, scale: 1, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' },
          exit: { opacity: 0, scale: 0.9, boxShadow: '0 0 0 rgba(139, 92, 246, 0)' }
        };
      default: // slide
        const slideDistance = currentPosition === 'top' || currentPosition === 'bottom' ?
          { y: currentPosition === 'top' ? baseDistance : -baseDistance } :
          { x: currentPosition === 'left' ? baseDistance : -baseDistance };

        return {
          initial: { opacity: 0, ...slideDistance },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, ...slideDistance }
        };
    }
  };

  const animationVariants = getAnimationVariants();

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (showTimeout) clearTimeout(showTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [showTimeout, hideTimeout]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={trigger === 'hover' ? handleShow : undefined}
      onMouseLeave={trigger === 'hover' ? handleHide : undefined}
      onMouseMove={variant === 'gradient' ? handleMouseMove : undefined}
      onClick={trigger === 'click' ? handleClick : undefined}
      onFocus={trigger === 'focus' ? handleFocus : undefined}
      onBlur={trigger === 'focus' ? handleBlur : undefined}
      tabIndex={trigger === 'focus' ? 0 : undefined}
    >
      {children}

      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            ref={tooltipRef}
            className={`
              absolute z-50 rounded-xl font-medium pointer-events-none
              ${getVariantStyles()}
              ${getSizeStyles()}
            `}
            style={{
              ...getPositionStyles(),
              maxWidth,
              ...(variant === 'gradient' && animation === 'glow' ? {
                rotateX: rotateX,
                rotateY: rotateY,
                transformStyle: 'preserve-3d'
              } : {})
            }}
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={
              animation === 'bounce'
                ? { type: "spring" as const, stiffness: 400, damping: 15 }
                : animation === 'glow'
                  ? { duration: 0.3 }
                  : { duration: 0.2, ease: "easeOut" }
            }
            onMouseEnter={() => {
              if (hideTimeout) {
                clearTimeout(hideTimeout);
                setHideTimeout(null);
              }
            }}
            onMouseLeave={trigger === 'hover' ? handleHide : undefined}
          >
            {/* Content */}
            <div className="relative z-10">
              {content}
            </div>

            {/* Arrow */}
            {arrow && (
              <div style={getArrowStyles()} />
            )}

            {/* Gradient overlay for glass effect */}
            {variant === 'glass' && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 pointer-events-none" />
            )}

            {/* Animated border for gradient variant */}
            {variant === 'gradient' && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1))',
                  backgroundSize: '300% 300%'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


