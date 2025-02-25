import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface PremiumParallaxProps {
  children: React.ReactNode;
  speed?: number;
  friction?: number;
  ease?: number;
}

export const PremiumParallax: React.FC<PremiumParallaxProps> = ({
  children,
  speed = 0.2,
  friction = 0.8,
  ease = 0.15
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const smoothScrollRef = useRef({
    current: 0,
    target: 0,
    limit: 0
  });

  // Smooth scroll animation
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    // Calculate scroll limits
    const calculateDimensions = () => {
      smoothScrollRef.current.limit = 
        content.getBoundingClientRect().height - window.innerHeight;
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);

    // Initialize GSAP smooth scroll
    const smoothScroll = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });

    // Add parallax effect to elements with data-speed attribute
    gsap.utils.toArray<HTMLElement>('[data-speed]').forEach(element => {
      const speedAttr = element.getAttribute('data-speed') || speed;
      const parallaxDistance = element.offsetHeight * Number(speedAttr);

      smoothScroll.to(element, {
        y: -parallaxDistance,
        ease: 'none'
      }, 0);
    });

    // Handle smooth scrolling
    let animationFrame: number;
    const updateScroll = () => {
      smoothScrollRef.current.current = gsap.utils.interpolate(
        smoothScrollRef.current.current,
        smoothScrollRef.current.target,
        ease
      );

      const scrollProgress = smoothScrollRef.current.current;
      
      gsap.set(content, {
        y: -scrollProgress,
        force3D: true
      });

      animationFrame = requestAnimationFrame(updateScroll);
    };

    // Start animation loop
    animationFrame = requestAnimationFrame(updateScroll);

    // Handle wheel events for custom scroll speed
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const scrollTarget = smoothScrollRef.current.target + e.deltaY * friction;
      smoothScrollRef.current.target = gsap.utils.clamp(
        0,
        smoothScrollRef.current.limit,
        scrollTarget
      );
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', calculateDimensions);
      wrapper.removeEventListener('wheel', handleWheel);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [speed, friction, ease]);

  // Get scroll progress for additional effects
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end']
  });

  // Create smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 1
  });

  // Create transform values based on scroll progress
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.05, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      <motion.div
        ref={contentRef}
        style={{
          scale,
          opacity
        }}
        className="relative w-full transform-gpu will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Helper component for parallax sections
export const ParallaxSection: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = 0.5, className = '' }) => {
  return (
    <div
      data-speed={speed}
      className={`relative ${className}`}
    >
      {children}
    </div>
  );
};

export default PremiumParallax;