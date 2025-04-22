"use client";
import { useRef, useEffect } from 'react';

/**
 * ShadowGlowParticles - A lightweight particle background using shadow blur for glow
 * May perform better on some devices compared to gradient-based glow
 * 
 * @param {Object} props
 * @param {number} [props.particleCount=50] - Number of particles (lower is better for performance)
 * @param {number} [props.baseSize=2] - Base size of particles in pixels
 * @param {string} [props.baseColor="#6ee7b7"] - Base color of particles
 * @param {string} [props.accentColor="#06b6d4"] - Secondary color for some particles
 * @param {number} [props.glowSize=6] - Size of shadow blur (glow effect)
 * @param {number} [props.speed=0.15] - Movement speed factor
 * @param {string} [props.className=""] - Additional CSS classes
 */
export default function ShadowGlowParticles({
  particleCount = 50,
  baseSize = 2,
  baseColor = "#6ee7b7",
  accentColor = "#06b6d4",
  glowSize = 6,
  speed = 0.15,
  className = "",
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  
  // Setup on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Re-initialize particles on resize
      initParticles();
    };

    const ctx = canvas.getContext('2d', { alpha: true });
    contextRef.current = ctx;
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Start animation
    startAnimation();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [particleCount, baseSize, baseColor, accentColor, glowSize, speed]);

  // Initialize particles
  const initParticles = () => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Create particles with minimal properties
    particlesRef.current = Array.from({ length: particleCount }, () => {
      const useAccentColor = Math.random() > 0.7;
      
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: baseSize * (0.5 + Math.random()),
        color: useAccentColor ? accentColor : baseColor,
        glowColor: useAccentColor ? accentColor : baseColor,
        opacity: 0.4 + Math.random() * 0.6,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.001 + Math.random() * 0.001,
        glowIntensity: 0.6 + Math.random() * 0.4,
      };
    });
  };

  // Main animation loop using shadowBlur for glow
  const startAnimation = () => {
    const animate = (time) => {
      const ctx = contextRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      
      // Clear canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Simple movement
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Simple wrapping
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Simple pulse effect
        const pulse = 0.7 + 0.3 * Math.sin(time * particle.pulseSpeed + particle.pulsePhase);
        const currentSize = particle.size * pulse;
        
        // Setup shadow for glow effect
        ctx.shadowBlur = glowSize * particle.glowIntensity * pulse;
        ctx.shadowColor = particle.glowColor;
        
        // Draw particle with glow
        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity * pulse;
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Reset context properties
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      // Continue animation
      frameRef.current = requestAnimationFrame(animate);
    };
    
    frameRef.current = requestAnimationFrame(animate);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-0 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}