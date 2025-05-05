"use client"

import { useState, useEffect } from "react"

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    // Add touch support
    const updateTouchPosition = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        })
      }
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("touchmove", updateTouchPosition)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("touchmove", updateTouchPosition)
    }
  }, [])

  return mousePosition
}
