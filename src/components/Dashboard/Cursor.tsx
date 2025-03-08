// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { gsap } from "gsap"
// import { MoveLeftIcon } from "lucide-react"

// interface CursorConfig {
//   mode: "default" | "highlight" | "drag" | "text" | "link"
//   color: string
//   scale: number
// }

// const EnhancedCursor = () => {
//   const cursorOuterRef = useRef<HTMLDivElement>(null)
//   const cursorInnerRef = useRef<HTMLDivElement>(null)
//   const trailsRef = useRef<HTMLDivElement[]>([])
//   const [isHovering, setIsHovering] = useState(false)
//   const [isClicking, setIsClicking] = useState(false)
//   const [isMobileDevice, setIsMobileDevice] = useState(false)
//   const [cursorMode, setCursorMode] = useState<CursorConfig["mode"]>("default")
//   const mousePosition = useRef({ x: 0, y: 0 })
//   const lastScrollPosition = useRef({ x: 0, y: 0 })
//   const lastUpdateTime = useRef(0)
//   const isAnimating = useRef(false)
//   const prevMousePosition = useRef({ x: 0, y: 0 })
//   const velocity = useRef({ x: 0, y: 0 })

//   // Optimized cursor configurations
//   const cursorConfigs: Record<CursorConfig["mode"], CursorConfig> = {
//     default: { mode: "default", color: "rgba(6, 182, 212, 0.3)", scale: 1 },
//     highlight: { mode: "highlight", color: "rgba(147, 51, 234, 0.2)", scale: 1.5 },
//     drag: { mode: "drag", color: "rgba(147, 51, 234, 0.4)", scale: 1.2 },
//     text: { mode: "text", color: "rgba(59, 130, 246, 0.4)", scale: 0.8 },
//     link: { mode: "link", color: "rgba(16, 185, 129, 0.4)", scale: 1.3 },
//   }

//   // Optimized device detection with memoization
//   const checkDevice = useCallback(() => {
//     if (typeof window === "undefined") return false

//     const isMobile =
//       /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
//       (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
//       (window.matchMedia && window.matchMedia("(hover: none)").matches) ||
//       "ontouchstart" in window ||
//       navigator.maxTouchPoints > 0

//     setIsMobileDevice(isMobile)
//     document.body.classList.toggle("is-mobile-device", isMobile)
//     return isMobile
//   }, [])

//   // Optimized animation loop using requestAnimationFrame
//   const animateCursor = useCallback(() => {
//     if (!isAnimating.current) return

//     const now = performance.now()
//     const deltaTime = now - lastUpdateTime.current
//     lastUpdateTime.current = now

//     if (cursorOuterRef.current && cursorInnerRef.current) {
//       const { x, y } = mousePosition.current
//       const scrollX = window.scrollX - lastScrollPosition.current.x
//       const scrollY = window.scrollY - lastScrollPosition.current.y

//       // Calculate velocity for more natural movement
//       velocity.current.x = 0.8 * velocity.current.x + 0.2 * (x - prevMousePosition.current.x)
//       velocity.current.y = 0.8 * velocity.current.y + 0.2 * (y - prevMousePosition.current.y)

//       prevMousePosition.current = { x, y }

//       // Use GSAP for hardware-accelerated transforms
//       gsap.set(cursorOuterRef.current, {
//         x: x + scrollX,
//         y: y + scrollY,
//         rotateX: velocity.current.y * 0.2,
//         rotateY: -velocity.current.x * 0.2,
//         force3D: true,
//       })

//       gsap.set(cursorInnerRef.current, {
//         x: x + scrollX,
//         y: y + scrollY,
//         force3D: true,
//       })

//       // Optimize trail animations with staggered positions
//       trailsRef.current.forEach((trail, index) => {
//         const delay = index * 2
//         const trailX = x - velocity.current.x * delay * 0.8
//         const trailY = y - velocity.current.y * delay * 0.8

//         gsap.set(trail, {
//           x: trailX + scrollX,
//           y: trailY + scrollY,
//           opacity: 0.3 - index * 0.1,
//           scale: 1 - index * 0.15,
//           force3D: true,
//         })
//       })
//     }

//     requestAnimationFrame(animateCursor)
//   }, [])

//   // Optimized mouse move handler with throttling
//   const handleMouseMove = useCallback(
//     (e: MouseEvent) => {
//       const { clientX, clientY } = e
//       mousePosition.current = { x: clientX, y: clientY }

//       // Start animation loop if not already running
//       if (!isAnimating.current) {
//         isAnimating.current = true
//         lastUpdateTime.current = performance.now()
//         requestAnimationFrame(animateCursor)
//       }
//     },
//     [animateCursor],
//   )

//   // Optimized click animations
//   const handleMouseDown = useCallback(() => {
//     setIsClicking(true)
//     const config = cursorConfigs[cursorMode]

//     gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
//       scale: config.scale * 0.8,
//       duration: 0.2,
//       ease: "power2.inOut",
//       force3D: true,
//     })

//     // Create ripple effect with object pooling
//     const ripple = document.createElement("div")
//     ripple.className = "absolute w-8 h-8 bg-cyan-400/20 rounded-full pointer-events-none will-change-transform"
//     ripple.style.left = `${mousePosition.current.x}px`
//     ripple.style.top = `${mousePosition.current.y}px`
//     document.body.appendChild(ripple)

//     gsap.to(ripple, {
//       scale: 3,
//       opacity: 0,
//       duration: 0.8,
//       ease: "power2.out",
//       force3D: true,
//       onComplete: () => ripple.remove(),
//     })
//   }, [cursorMode])

//   const handleMouseUp = useCallback(() => {
//     setIsClicking(false)
//     const config = cursorConfigs[cursorMode]

//     gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
//       scale: config.scale,
//       duration: 0.3,
//       ease: "elastic.out(1, 0.3)",
//       force3D: true,
//     })
//   }, [cursorMode])

//   // Optimized element interactions with event delegation
//   const handleElementsHover = useCallback(() => {
//     // Use event delegation instead of attaching listeners to each element
//     const handleMouseOver = (e: MouseEvent) => {
//       const target = e.target as HTMLElement

//       // Check if the target or its parents are interactive elements
//       const interactiveElement = target.closest(
//         "button, a, input, textarea, [data-cursor-interact], [contenteditable='true']",
//       )

//       if (interactiveElement) {
//         setIsHovering(true)

//         // Determine cursor mode based on element type
//         let newMode: CursorConfig["mode"] = "default"
//         if (interactiveElement.tagName === "A" || interactiveElement.hasAttribute("data-cursor-link")) {
//           newMode = "link"
//         } else if (interactiveElement.tagName === "BUTTON") {
//           newMode = "highlight"
//         } else if (interactiveElement.hasAttribute("contenteditable") || interactiveElement.tagName === "TEXTAREA") {
//           newMode = "text"
//         } else if (interactiveElement.hasAttribute("data-cursor-drag")) {
//           newMode = "drag"
//         }

//         setCursorMode(newMode)
//         const config = cursorConfigs[newMode]

//         gsap.to(cursorOuterRef.current, {
//           scale: config.scale,
//           backgroundColor: config.color,
//           duration: 0.3,
//           ease: "power2.out",
//           force3D: true,
//         })

//         gsap.to(cursorInnerRef.current, {
//           scale: config.scale * 0.5,
//           backgroundColor: config.color,
//           duration: 0.3,
//           ease: "power2.out",
//           force3D: true,
//         })

//         // Add magnetic effect for specific elements
//         if (interactiveElement.hasAttribute("data-cursor-magnetic")) {
//           const rect = interactiveElement.getBoundingClientRect()
//           const centerX = rect.left + rect.width / 2
//           const centerY = rect.top + rect.height / 2

//           gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
//             x: centerX,
//             y: centerY,
//             duration: 0.5,
//             ease: "power3.out",
//             force3D: true,
//           })
//         }
//       }
//     }

//     const handleMouseOut = (e: MouseEvent) => {
//       const target = e.target as HTMLElement
//       const relatedTarget = e.relatedTarget as HTMLElement

//       // Check if we're moving from an interactive element to a non-interactive one
//       const fromInteractive = target.closest(
//         "button, a, input, textarea, [data-cursor-interact], [contenteditable='true']",
//       )

//       const toInteractive = relatedTarget?.closest(
//         "button, a, input, textarea, [data-cursor-interact], [contenteditable='true']",
//       )

//       if (fromInteractive && !toInteractive) {
//         setIsHovering(false)
//         setCursorMode("default")
//         const config = cursorConfigs.default

//         gsap.to([cursorOuterRef.current, cursorInnerRef.current], {
//           scale: config.scale,
//           backgroundColor: config.color,
//           duration: 0.3,
//           ease: "power2.out",
//           force3D: true,
//         })
//       }
//     }

//     document.addEventListener("mouseover", handleMouseOver, { passive: true })
//     document.addEventListener("mouseout", handleMouseOut, { passive: true })

//     return () => {
//       document.removeEventListener("mouseover", handleMouseOver)
//       document.removeEventListener("mouseout", handleMouseOut)
//     }
//   }, [])

//   // Optimized scroll handler
//   const handleScroll = useCallback(() => {
//     lastScrollPosition.current = {
//       x: window.scrollX,
//       y: window.scrollY,
//     }
//   }, [])

//   useEffect(() => {
//     if (typeof window === "undefined") return

//     const isMobile = checkDevice()
//     window.addEventListener("resize", checkDevice, { passive: true })
//     window.addEventListener("scroll", handleScroll, { passive: true })

//     if (!isMobile) {
//       // Create cursor trails with optimized DOM manipulation
//       const trailCount = 3
//       const fragment = document.createDocumentFragment()

//       for (let i = 0; i < trailCount; i++) {
//         const trail = document.createElement("div")
//         trail.className =
//           "fixed pointer-events-none z-[9998] w-6 h-6 rounded-full bg-cyan-400/20 backdrop-blur-sm transform will-change-transform"
//         fragment.appendChild(trail)
//         trailsRef.current.push(trail)
//       }

//       document.body.appendChild(fragment)

//       // Add event listeners with passive flag for better performance
//       window.addEventListener("mousemove", handleMouseMove, { passive: true })
//       window.addEventListener("mousedown", handleMouseDown, { passive: true })
//       window.addEventListener("mouseup", handleMouseUp, { passive: true })

//       // Initialize interactions
//       const cleanupHover = handleElementsHover()

//       // Start animation loop
//       isAnimating.current = true
//       lastUpdateTime.current = performance.now()
//       requestAnimationFrame(animateCursor)

//       // Cleanup function
//       return () => {
//         window.removeEventListener("resize", checkDevice)
//         window.removeEventListener("scroll", handleScroll)
//         window.removeEventListener("mousemove", handleMouseMove)
//         window.removeEventListener("mousedown", handleMouseDown)
//         window.removeEventListener("mouseup", handleMouseUp)
//         cleanupHover()

//         isAnimating.current = false
//         trailsRef.current.forEach((trail) => trail.remove())
//       }
//     }
//   }, [handleMouseMove, handleMouseDown, handleMouseUp, handleElementsHover, animateCursor, checkDevice, handleScroll])

//   if (isMobileDevice) return null

//   return (
//     <>
//       {/* Outer cursor with optimized rendering */}
//       <div
//         ref={cursorOuterRef}
//         className="fixed pointer-events-none z-[9999] mix-blend-difference w-12 h-12 -ml-6 -mt-6 transform will-change-transform"
//         style={{
//           transform: "translate3d(0,0,0)",
//           backfaceVisibility: "hidden",
//         }}
//       >
//         <div className="absolute inset-0">
//           {[...Array(2)].map((_, i) => (
//             <div
//               key={`ring-${i}`}
//               className="absolute inset-0 rounded-full border border-cyan-400/40"
//               style={{
//                 transform: `rotate(${i * 180}deg)`,
//                 animation: `optimizedSpin${i + 1} 4s linear infinite`,
//               }}
//             />
//           ))}
//         </div>

//         {/* Cursor mode indicator */}
//         {cursorMode === "drag" && (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <MoveLeftIcon className="w-4 h-4 text-cyan-400/50" />
//           </div>
//         )}
//       </div>

//       {/* Inner cursor with optimized rendering */}
//       <div
//         ref={cursorInnerRef}
//         className="fixed w-4 h-4 pointer-events-none z-[9999] rounded-full bg-cyan-400/30 backdrop-blur-sm -ml-2 -mt-2 transform will-change-transform mix-blend-difference"
//         style={{
//           transform: "translate3d(0,0,0)",
//           backfaceVisibility: "hidden",
//         }}
//       >
//         <div
//           className={`absolute top-1/2 left-1/2 w-1 h-1 -ml-0.5 -mt-0.5 rounded-full bg-cyan-400 transition-transform duration-200 ease-in-out ${
//             isClicking ? "scale-150" : "scale-100"
//           }`}
//         />
//       </div>

//       <style jsx global>{`
//         @media (hover: hover) {
//           * {
//             cursor: none !important;
//           }
//         }

//         .is-mobile-device * {
//           cursor: auto !important;
//         }

//         /* Optimized animations with reduced complexity */
//         @keyframes optimizedSpin1 {
//           0% { transform: rotate(0deg) scale(1); }
//           100% { transform: rotate(360deg) scale(1); }
//         }

//         @keyframes optimizedSpin2 {
//           0% { transform: rotate(180deg) scale(1.1); }
//           100% { transform: rotate(540deg) scale(1.1); }
//         }

//         @media (pointer: coarse) {
//           .cursor-outer,
//           .cursor-inner {
//             display: none !important;
//           }
          
//           button, 
//           a, 
//           input[type="button"] {
//             min-height: 44px;
//             min-width: 44px;
//             padding: 12px;
//           }

//           .interactive:active {
//             transform: scale(0.98);
//           }
//         }

//         .cursor-magnetic {
//           transition: transform 0.3s cubic-bezier(0.75, -0.27, 0.3, 1.33);
//         }

//         .cursor-magnetic:hover {
//           transform: scale(1.1);
//         }

//         [data-cursor-interact]:hover {
//           transition: transform 0.2s ease;
//           transform: scale(1.05);
//         }

//         /* Enhanced hover effects for different cursor modes */
//         [data-cursor-mode="link"]:hover {
//           color: rgb(16, 185, 129);
//           transition: color 0.3s ease;
//         }

//         [data-cursor-mode="highlight"]:hover {
//           background-color: rgba(255, 102, 0, 0.1);
//           transition: background-color 0.3s ease;
//         }

//         [data-cursor-mode="drag"]:hover {
//           cursor: grab !important;
//         }

//         [data-cursor-mode="drag"]:active {
//           cursor: grabbing !important;
//           transform: scale(0.98);
//         }

//         /* Smooth scroll behavior */
//         html {
//           scroll-behavior: smooth;
//         }

//         /* Improved focus styles */
//         :focus-visible {
//           outline: 2px solid rgb(6, 182, 212);
//           outline-offset: 2px;
//         }

//         /* Performance optimizations */
//         .will-change-transform {
//           will-change: transform;
//           transform: translateZ(0);
//           backface-visibility: hidden;
//         }

//         /* Reduced motion preferences */
//         @media (prefers-reduced-motion: reduce) {
//           *, 
//           *::before,
//           *::after {
//             animation-duration: 0.01ms !important;
//             animation-iteration-count: 1 !important;
//             transition-duration: 0.01ms !important;
//             scroll-behavior: auto !important;
//           }
//         }
//       `}</style>

//       {/* Enhanced accessibility features */}
//       <div aria-hidden="true" className="sr-only">
//         Custom cursor indicator - current mode: {cursorMode}
//       </div>
//     </>
//   )
// }

// export default EnhancedCursor

'use client';
import { useEffect } from 'react';

import fluidCursor from '@/hooks/use-FluidCursor';

const EnhancedCursor = () => {
  useEffect(() => {
    fluidCursor();
  }, []);

  return (
    <div className='fixed top-0 left-0 z-2'>
      <canvas id='fluid' className='w-screen h-screen' />
    </div>
  );
};
export default EnhancedCursor;
