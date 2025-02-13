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

  const handleMouseMove = useCallback(
    debounce((e: MouseEvent) => {
      const { clientX, clientY } = e
      if (cursorOuterRef.current && cursorInnerRef.current) {
        gsap.to(cursorOuterRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.6,
          ease: "power3.out",
        })
        gsap.to(cursorInnerRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.2,
          ease: "power3.out",
        })
      }

      // Add slight tilt based on velocity
      const speed = Math.sqrt(e.movementX ** 2 + e.movementY ** 2)
      const tiltX = gsap.utils.clamp(-20, 20, e.movementY * 2)
      const tiltY = gsap.utils.clamp(-20, 20, -e.movementX * 2)

      if (cursorOuterRef.current) {
        gsap.to(cursorOuterRef.current, {
          rotateX: tiltX,
          rotateY: tiltY,
          duration: 0.5,
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

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", () => {
        setIsHovering(true)
        gsap.to(cursorOuterRef.current, {
          scale: 1.5,
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          duration: 0.3,
        })
        gsap.to(cursorInnerRef.current, {
          scale: 0.5,
          backgroundColor: "rgba(6, 182, 212, 1)",
          duration: 0.3,
        })
      })

      element.addEventListener("mouseleave", () => {
        setIsHovering(false)
        gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
          scale: 1,
          backgroundColor: "rgba(6, 182, 212, 0.3)",
          duration: 0.3,
        })
      })
    })
  }, [])

  const initMagneticButtons = useCallback(() => {
    const buttons = document.querySelectorAll("[data-magnetic]")

    buttons.forEach((button) => {
      button.addEventListener("mousemove", (e) => {
        const rect = button.getBoundingClientRect()
        const mouseEvent = e as MouseEvent
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distance = Math.sqrt(Math.pow(mouseEvent.clientX - centerX, 2) + Math.pow(mouseEvent.clientY - centerY, 2))

        if (distance < 100) {
          const magneticPull = (100 - distance) / 100
          gsap.to(cursorOuterRef.current, {
            x: centerX + (mouseEvent.clientX- centerX) * 0.4,
            y: centerY + (mouseEvent.clientY - centerY) * 0.4,
            duration: 0.3,
          })
        }
      })
    })
  }, [])

  useEffect(() => {
    // Initialize rotation timeline
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
    handleElementsHover()
    initMagneticButtons()

    // Cleanup function
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      rotateTl.kill()
    }
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleElementsHover, initMagneticButtons])

  return (
    <>
      {/* Outer cursor */}
      <div
        ref={cursorOuterRef}
        className="fixed pointer-events-none z-50 mix-blend-difference w-10 h-10 -ml-5 -mt-5 transform will-change-transform"
      >
        {/* Animated border */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
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
        className="fixed w-4 h-4 pointer-events-none z-50 rounded-full bg-cyan-400/30 backdrop-blur-sm -ml-2 -mt-2 transform will-change-transform mix-blend-difference"
      >
        {/* Inner dot */}
        <div
          className={`absolute top-1/2 left-1/2 w-1 h-1 -ml-0.5 -mt-0.5 rounded-full bg-cyan-400 transition-transform duration-200 ease-in-out ${
            isClicking ? "scale-150" : "scale-100"
          }`}
        />
      </div>

      <style jsx global>{`
        * {
          cursor: none !important;
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
      `}</style>
    </>
  )
}

export default AdvancedCursor

