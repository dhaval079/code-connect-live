"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import { debounce } from "lodash"

const AdvancedCursor: React.FC = () => {
  const cursorOuterRef = useRef<HTMLDivElement>(null)
  const cursorInnerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const rafRef = useRef<number | undefined>(undefined)

  // Device detection
  const checkDevice = useCallback(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
      (window.matchMedia && window.matchMedia("(hover: none)").matches) ||
      "ontouchstart" in window
    setIsMobileDevice(isMobile)

    if (isMobile) {
      document.body.classList.add("is-mobile-device")
    } else {
      document.body.classList.remove("is-mobile-device")
    }
  }, [])

  const handleMouseMove = useCallback(
    debounce((e: MouseEvent) => {
      const { clientX, clientY } = e
      if (cursorOuterRef.current && cursorInnerRef.current) {
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => {
            gsap.to(cursorOuterRef.current, {
              x: clientX,
              y: clientY,
              duration: 1,
              ease: "power3.out",
            })
            gsap.to(cursorInnerRef.current, {
              x: clientX,
              y: clientY,
              duration: 0.8,
              ease: "power3.out",
            })
            rafRef.current = undefined
          })
        }
      }

      // Add slight tilt based on velocity
      const speed = Math.sqrt(e.movementX ** 2 + e.movementY ** 2)
      const tiltX = gsap.utils.clamp(-20, 20, e.movementY * 2)
      const tiltY = gsap.utils.clamp(-20, 20, -e.movementX * 2)

      if (cursorOuterRef.current) {
        gsap.to(cursorOuterRef.current, {
          rotateX: tiltX,
          rotateY: tiltY,
          duration: 0.8,
        })
      }
    }, 5),
    [],
  )

  const handleMouseDown = useCallback(() => {
    setIsClicking(true)
    gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
      scale: 0.8,
      duration: 0.2,
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsClicking(false)
    gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
      scale: 1,
      duration: 0.2,
    })
  }, [])

  const handleElementsHover = useCallback(() => {
    const interactiveElements = document.querySelectorAll("button, a, input, [data-cursor-interact]")

    const handleEnter = () => {
      setIsHovering(true)
      gsap.to(cursorOuterRef.current, {
        scale: 1.5,
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        duration: 0.3,
      })
      gsap.to(cursorInnerRef.current, {
        scale: 0.5,
        backgroundColor: "rgba(6, 182, 212, 1)",
        duration: 0.5,
      })
    }

    const handleLeave = () => {
      setIsHovering(false)
      gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
        scale: 1,
        backgroundColor: "rgba(6, 182, 212, 0.3)",
        duration: 0.3,
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

  useEffect(() => {
    checkDevice()
    window.addEventListener("resize", checkDevice)

    if (!isMobileDevice) {
      // Initialize rotation timeline for desktop
      const rotateTl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } })
      rotateTl.to(cursorOuterRef.current, {
        rotate: 360,
        duration: 5,
        ease: "none",
      })

      // Add event listeners
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mousedown", handleMouseDown)
      window.addEventListener("mouseup", handleMouseUp)

      // Initialize interactions
      const cleanupHover = handleElementsHover()

      // Cleanup function
      return () => {
        window.removeEventListener("resize", checkDevice)
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mousedown", handleMouseDown)
        window.removeEventListener("mouseup", handleMouseUp)
        cleanupHover()
        rotateTl.kill()
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
        }
      }
    }
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleElementsHover, isMobileDevice, checkDevice])

  // Don't render on mobile devices
  if (isMobileDevice) return null

  return (
    <>
      {/* Outer cursor */}
      <div
        ref={cursorOuterRef}
        className="fixed pointer-events-none z-[9999] mix-blend-difference w-10 h-10 -ml-5 -mt-5 transform will-change-transform"
      >
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full border border-cyan-400/30"
              style={{
                transform: `rotate(${i * 90}deg)`,
                animation: `spin${i + 1} 4s linear infinite`,
              }}
            />
          ))}
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

        /* Mobile-specific styles */
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

        /* Touch-specific styles */
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
      `}</style>
    </>
  )
}

export default AdvancedCursor

