"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import { debounce } from "lodash"
import { MoveLeftIcon } from "lucide-react"

interface CursorConfig {
  mode: 'default' | 'highlight' | 'drag' | 'text' | 'link'
  color: string
  scale: number
}

const EnhancedCursor: React.FC = () => {
  const cursorOuterRef = useRef<HTMLDivElement>(null)
  const cursorInnerRef = useRef<HTMLDivElement>(null)
  const trailsRef = useRef<HTMLDivElement[]>([])
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [cursorMode, setCursorMode] = useState<CursorConfig['mode']>('default')
  const rafRef = useRef<number | undefined>(undefined)
  const mousePosition = useRef({ x: 0, y: 0 })
  const lastScrollPosition = useRef({ x: 0, y: 0 })

  const cursorConfigs: Record<CursorConfig['mode'], CursorConfig> = {
    default: { mode: 'default', color: 'rgba(6, 182, 212, 0.3)', scale: 1 },
    highlight: { mode: 'highlight', color: 'rgba(147, 51, 234, 0.2)', scale: 1.5 },
    drag: { mode: 'drag', color: 'rgba(147, 51, 234, 0.4)', scale: 1.2 },
    text: { mode: 'text', color: 'rgba(59, 130, 246, 0.4)', scale: 0.8 },
    link: { mode: 'link', color: 'rgba(16, 185, 129, 0.4)', scale: 1.3 }
  }

  // Enhanced device detection
  const checkDevice = useCallback(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
      (window.matchMedia && window.matchMedia("(hover: none)").matches) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0

    setIsMobileDevice(isMobile)
    document.body.classList.toggle("is-mobile-device", isMobile)
  }, [])

  // Enhanced cursor movement with momentum and trails
  const handleMouseMove = useCallback(
    debounce((e: MouseEvent) => {
      const { clientX, clientY } = e
      mousePosition.current = { x: clientX, y: clientY }

      if (cursorOuterRef.current && cursorInnerRef.current) {
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => {
            const scrollX = window.scrollX - lastScrollPosition.current.x
            const scrollY = window.scrollY - lastScrollPosition.current.y
            
            // Update cursor position with scroll compensation
            gsap.to(cursorOuterRef.current, {
              x: clientX + scrollX,
              y: clientY + scrollY,
              duration: 1,
              ease: "power3.out",
            })
            
            gsap.to(cursorInnerRef.current, {
              x: clientX + scrollX,
              y: clientY + scrollY,
              duration: 0.8,
              ease: "power3.out",
            })

            // Animate trails with delay
            trailsRef.current.forEach((trail, index) => {
              gsap.to(trail, {
                x: clientX + scrollX,
                y: clientY + scrollY,
                duration: 1 + index * 0.2,
                ease: "power3.out",
                opacity: 1 - (index * 0.2),
              })
            })

            rafRef.current = undefined
          })
        }
      }

      // Dynamic tilt based on movement and velocity
      const speed = Math.sqrt(e.movementX ** 2 + e.movementY ** 2)
      const maxTilt = speed * 0.5 // More dramatic tilt at higher speeds
      const tiltX = gsap.utils.clamp(-maxTilt, maxTilt, e.movementY * 2)
      const tiltY = gsap.utils.clamp(-maxTilt, maxTilt, -e.movementX * 2)

      if (cursorOuterRef.current) {
        gsap.to(cursorOuterRef.current, {
          rotateX: tiltX,
          rotateY: tiltY,
          duration: 0.8,
          ease: "power2.out"
        })
      }
    }, 5),
    []
  )

  // Enhanced click animations
  const handleMouseDown = useCallback(() => {
    setIsClicking(true)
    const config = cursorConfigs[cursorMode]
    
    gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
      scale: config.scale * 0.8,
      duration: 0.2,
      ease: "power2.inOut"
    })

    // Create ripple effect
    const ripple = document.createElement('div')
    ripple.className = 'absolute w-8 h-8 bg-cyan-400/20 rounded-full pointer-events-none'
    ripple.style.left = `${mousePosition.current.x}px`
    ripple.style.top = `${mousePosition.current.y}px`
    document.body.appendChild(ripple)

    gsap.to(ripple, {
      scale: 3,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      onComplete: () => ripple.remove()
    })
  }, [cursorMode])

  const handleMouseUp = useCallback(() => {
    setIsClicking(false)
    const config = cursorConfigs[cursorMode]
    
    gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
      scale: config.scale,
      duration: 0.3,
      ease: "elastic.out(1, 0.3)"
    })
  }, [cursorMode])

  // Enhanced element interactions
  const handleElementsHover = useCallback(() => {
    const interactiveElements = document.querySelectorAll(
      "button, a, input, textarea, [data-cursor-interact], [contenteditable='true']"
    )

    const handleEnter = (e: Event) => {
      const element = e.target as HTMLElement
      setIsHovering(true)
      
      // Determine cursor mode based on element type
      let newMode: CursorConfig['mode'] = 'default'
      if (element.tagName === 'A' || element.hasAttribute('data-cursor-link')) {
        newMode = 'link'
      } else if (element.tagName === 'BUTTON') {
        newMode = 'highlight'
      } else if (element.hasAttribute('contenteditable') || element.tagName === 'TEXTAREA') {
        newMode = 'text'
      } else if (element.hasAttribute('data-cursor-drag')) {
        newMode = 'drag'
      }
      
      setCursorMode(newMode)
      const config = cursorConfigs[newMode]

      gsap.to(cursorOuterRef.current, {
        scale: config.scale,
        backgroundColor: config.color,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.to(cursorInnerRef.current, {
        scale: config.scale * 0.5,
        backgroundColor: config.color,
        duration: 0.5,
        ease: "power2.out"
      })

      // Add magnetic effect for specific elements
      if (element.hasAttribute('data-cursor-magnetic')) {
        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
          x: centerX,
          y: centerY,
          duration: 0.5,
          ease: "power3.out"
        })
      }
    }

    const handleLeave = () => {
      setIsHovering(false)
      setCursorMode('default')
      const config = cursorConfigs.default

      gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
        scale: config.scale,
        backgroundColor: config.color,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", handleEnter)
      element.addEventListener("mouseleave", handleLeave)
    })

    return () => {
      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleEnter)
        element.removeEventListener("mouseleave", handleLeave)
      })
    }
  }, [])

  // Handle scroll position updates
  const handleScroll = useCallback(() => {
    lastScrollPosition.current = {
      x: window.scrollX,
      y: window.scrollY
    }
  }, [])

  useEffect(() => {
    checkDevice()
    window.addEventListener("resize", checkDevice)
    window.addEventListener("scroll", handleScroll)

    if (!isMobileDevice) {
      // Initialize parallax rotation effect
      const rotateTl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } })
      rotateTl.to(cursorOuterRef.current, {
        rotate: 360,
        duration: 8,
        ease: "none",
      })

      // Create cursor trails
      const trailCount = 3
      for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div')
        trail.className = 'fixed pointer-events-none z-[9998] w-6 h-6 rounded-full bg-cyan-400/20 backdrop-blur-sm transform'
        document.body.appendChild(trail)
        trailsRef.current.push(trail)
      }

      // Add event listeners
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mousedown", handleMouseDown)
      window.addEventListener("mouseup", handleMouseUp)

      // Initialize interactions
      const cleanupHover = handleElementsHover()

      // Cleanup function
      return () => {
        window.removeEventListener("resize", checkDevice)
        window.removeEventListener("scroll", handleScroll)
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mousedown", handleMouseDown)
        window.removeEventListener("mouseup", handleMouseUp)
        cleanupHover()
        rotateTl.kill()
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
        }
        trailsRef.current.forEach(trail => trail.remove())
      }
    }
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleElementsHover, isMobileDevice, checkDevice, handleScroll])

  if (isMobileDevice) return null

  return (
    <>
      {/* Outer cursor */}
      <div
        ref={cursorOuterRef}
        className="fixed pointer-events-none z-[9999] mix-blend-difference w-12 h-12 -ml-6 -mt-6 transform will-change-transform"
      >
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full border border-cyan-400/40"
              style={{
                transform: `rotate(${i * 90}deg)`,
                animation: `spin${i + 1} 4s linear infinite`,
              }}
            />
          ))}
        </div>
        
        {/* Cursor mode indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          {cursorMode === 'drag' && <MoveLeftIcon className="w-4 h-4 text-cyan-400/50" />}
        </div>
      </div>

      {/* Inner cursor */}
      <div
        ref={cursorInnerRef}
        className="fixed w-4 h-4 pointer-events-none z-[9999] rounded-full bg-cyan-400/30 backdrop-blur-sm -ml-2 -mt-2 transform will-change-transform mix-blend-difference"
      >
        <div
          className={`absolute top-1/2 left-1/2 w-1 h-1 -ml-0.5 -mt-0.5 rounded-full bg-cyan-400 transition-transform duration-200 ease-in-out ${
            isClicking ? "scale-150" : "scale-100"
          }`}
        />
      </div>

      <style jsx global>{`
        @media (hover: hover) {
          * {
            cursor: none !important;
          }
        }

        .is-mobile-device * {
          cursor: auto !important;
        }

        @keyframes spin1 {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes spin2 {
          0% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(270deg) scale(1); }
          100% { transform: rotate(450deg) scale(1.1); }
        }

        @keyframes spin3 {
          0% { transform: rotate(180deg) scale(1.2); }
          50% { transform: rotate(360deg) scale(1); }
          100% { transform: rotate(540deg) scale(1.2); }
        }

        @keyframes spin4 {
          0% { transform: rotate(270deg) scale(1); }
          50% { transform: rotate(450deg) scale(1.1); }
          100% { transform: rotate(630deg) scale(1); }
        }

        @media (pointer: coarse) {
          .cursor-outer,
          .cursor-inner {
            display: none !important;
          }
          
          button, 
          a, 
          input[type="button"] {
            min-height: 44px;
            min-width: 44px;
            padding: 12px;
          }

          .interactive:active {
            transform: scale(0.98);
          }
        }

        .cursor-magnetic {
          transition: transform 0.3s cubic-bezier(0.75, -0.27, 0.3, 1.33);
        }

        .cursor-magnetic:hover {
          transform: scale(1.1);
        }

        [data-cursor-interact]:hover {
          transition: transform 0.2s ease;
          transform: scale(1.05);
        }

        /* Enhanced hover effects for different cursor modes */
        [data-cursor-mode="link"]:hover {
          color: rgb(16, 185, 129);
          transition: color 0.3s ease;
        }

        [data-cursor-mode="highlight"]:hover {
          background-color: rgba(255, 102, 0, 0.1);
          transition: background-color 0.3s ease;
        }

        [data-cursor-mode="drag"]:hover {
          cursor: grab !important;
        }

        [data-cursor-mode="drag"]:active {
          cursor: grabbing !important;
          transform: scale(0.98);
        }

        /* Custom animations for cursor trails */
        @keyframes fadeTrail {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Improved focus styles */
        :focus-visible {
          outline: 2px solid rgb(6, 182, 212);
          outline-offset: 2px;
        }

        /* Performance optimizations */
        .will-change-transform {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          *, 
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Enhanced accessibility features */}
      <div aria-hidden="true" className="sr-only">
        Custom cursor indicator - current mode: {cursorMode}
      </div>
    </>
  )
}

export default EnhancedCursor