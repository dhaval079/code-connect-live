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










//2
// 'use client';
// import { useEffect } from 'react';

// import fluidCursor from '@/hooks/use-FluidCursor';

// const EnhancedCursor = () => {
//   useEffect(() => {
//     fluidCursor();
//   }, []);

//   return (
//     <div className='fixed top-0 left-0 z-2'>
//       <canvas id='fluid' className='w-screen h-screen' />
//     </div>
//   );
// };
// export default EnhancedCursor;










// //3
// // @ts-nocheck
// 'use client';
// import { useEffect, useRef, useState } from 'react';

// const CyanCursor = () => {
//   const cursorRef = useRef(null);
//   const followerRef = useRef(null);
//   const auraRef = useRef(null);
//   const trailsRef = useRef([]);
//   const gsapRef = useRef(null);
  
//   // Track states
//   const [isHovering, setIsHovering] = useState(false);
//   const [isMagnetic, setIsMagnetic] = useState(false);
//   const [magneticElement, setMagneticElement] = useState(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const [cursorText, setCursorText] = useState("");
  
//   // Mouse position tracking with smooth animation
//   const mouse = useRef({ x: 0, y: 0 });
//   const previousMouse = useRef({ x: 0, y: 0 });
//   const currentMouse = useRef({ x: 0, y: 0 });
//   const lastMouseMove = useRef(Date.now());
//   const rafId = useRef(null);
  
//   // Pulse effect state
//   const pulseRef = useRef(0);
//   const pulseDirectionRef = useRef(1);

//   useEffect(() => {
//     // Import GSAP dynamically
//     const loadGSAP = async () => {
//       try {
//         // Import GSAP
//         const gsapModule = await import('gsap');
//         gsapRef.current = gsapModule.gsap;
        
//         // Initialize cursor once GSAP is loaded
//         initCursor();
//       } catch (err) {
//         console.error("Error loading GSAP:", err);
//         // Fallback to basic cursor if GSAP fails to load
//         initBasicCursor();
//       }
//     };
    
//     loadGSAP();
    
//     return () => {
//       if (rafId.current) {
//         cancelAnimationFrame(rafId.current);
//       }
      
//       // Clean up event listeners
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mousedown', handleMouseDown);
//       document.removeEventListener('mouseup', handleMouseUp);
//       document.removeEventListener('mouseover', handleMouseOver);
//       document.removeEventListener('mouseout', handleMouseOut);
//       document.removeEventListener('mouseenter', handleMouseEnter);
//       document.removeEventListener('mouseleave', handleMouseLeave);
//     };
//   }, []);
  
//   function initCursor() {
//     const gsap = gsapRef.current;
//     if (!gsap) return;
    
//     // Make sure cursor starts hidden
//     gsap.set(".cursor-dot", { opacity: 0, scale: 0 });
//     gsap.set(".cursor-follower", { opacity: 0, scale: 0 });
//     gsap.set(".cursor-aura", { opacity: 0, scale: 0 });
    
//     // Create trails DOM elements dynamically
//     const trailsContainer = document.createElement('div');
//     trailsContainer.className = 'cursor-trails-container';
//     document.body.appendChild(trailsContainer);
    
//     for (let i = 0; i < 8; i++) {
//       const trail = document.createElement('div');
//       trail.className = 'cursor-trail';
//       trail.style.setProperty('--index', i);
//       trailsContainer.appendChild(trail);
//       trailsRef.current.push(trail);
      
//       // Add unique delay to each trail
//       gsap.set(trail, { 
//         opacity: 0,
//         scale: 0.1 + (0.9 / 8) * (8 - i),
//         x: 0,
//         y: 0
//       });
//     }
    
//     // Initial animation to show cursor when mouse moves
//     const showCursor = () => {
//       setIsVisible(true);
//       gsap.to(".cursor-dot", { 
//         opacity: 1, 
//         scale: 1,
//         duration: 0.4, 
//         ease: "elastic.out(1, 0.3)"
//       });
      
//       gsap.to(".cursor-follower", { 
//         opacity: 0.9, 
//         scale: 1,
//         duration: 0.6, 
//         ease: "elastic.out(1, 0.3)"
//       });
      
//       gsap.to(".cursor-aura", { 
//         opacity: 0.7, 
//         scale: 1,
//         duration: 0.8, 
//         ease: "elastic.out(1, 0.3)"
//       });
      
//       // Animate trails with staggered delay
//       trailsRef.current.forEach((trail, i) => {
//         gsap.to(trail, { 
//           opacity: 0.4 - (i * 0.04), 
//           scale: 0.5 - (i * 0.05),
//           duration: 0.6,
//           delay: i * 0.03,
//           ease: "power2.out"
//         });
//       });
      
//       // Only add event listeners once
//       document.removeEventListener('mousemove', showCursor);
//     };
    
//     // Set up events
//     document.addEventListener('mousemove', showCursor, { once: true });
//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mousedown', handleMouseDown);
//     document.addEventListener('mouseup', handleMouseUp);
//     document.addEventListener('mouseover', handleMouseOver);
//     document.addEventListener('mouseout', handleMouseOut);
//     document.addEventListener('mouseenter', handleMouseEnter);
//     document.addEventListener('mouseleave', handleMouseLeave);
    
//     // Start the animation loop
//     startAnimation();
//   }
  
//   function initBasicCursor() {
//     // Fallback basic cursor functionality
//     document.addEventListener('mousemove', handleMouseMove);
//   }
  
//   const startAnimation = () => {
//     const gsap = gsapRef.current;
//     if (!gsap) return;
    
//     const render = () => {
//       // Update pulse effect
//       pulseRef.current += 0.03 * pulseDirectionRef.current;
//       if (pulseRef.current >= 1) {
//         pulseRef.current = 1;
//         pulseDirectionRef.current = -1;
//       } else if (pulseRef.current <= 0) {
//         pulseRef.current = 0;
//         pulseDirectionRef.current = 1;
//       }
      
//       // Calculate the lerped (smoothed) position
//       currentMouse.current.x += (mouse.current.x - currentMouse.current.x) * 0.15;
//       currentMouse.current.y += (mouse.current.y - currentMouse.current.y) * 0.15;
      
//       // Apply the smoothed position to the cursor dot (with minimal smoothing for responsiveness)
//       gsap.set(".cursor-dot", { 
//         x: mouse.current.x, 
//         y: mouse.current.y,
//         duration: 0
//       });
      
//       // Apply different smoothing to the follower for that trailing effect
//       gsap.set(".cursor-follower", { 
//         x: currentMouse.current.x, 
//         y: currentMouse.current.y
//       });
      
//       // Apply pulsing to the aura
//       const pulseScale = 1 + pulseRef.current * 0.2;
//       gsap.set(".cursor-aura", { 
//         x: currentMouse.current.x, 
//         y: currentMouse.current.y,
//         scale: pulseScale
//       });
      
//       // Update trail positions with a staggered effect
//       trailsRef.current.forEach((trail, i) => {
//         // Calculate a position between the previous and current position based on index
//         const segmentProgress = i / trailsRef.current.length;
//         const lerpX = previousMouse.current.x + (currentMouse.current.x - previousMouse.current.x) * (1 - segmentProgress);
//         const lerpY = previousMouse.current.y + (currentMouse.current.y - previousMouse.current.y) * (1 - segmentProgress);
        
//         // Apply trail positions
//         gsap.set(trail, { 
//           x: lerpX,
//           y: lerpY
//         });
//       });
      
//       // Store previous position for next frame's trail calculations
//       previousMouse.current.x = currentMouse.current.x;
//       previousMouse.current.y = currentMouse.current.y;
      
//       // Check for cursor inactivity (hide after 3 seconds of no movement)
//       if (Date.now() - lastMouseMove.current > 3000 && isVisible) {
//         gsap.to([".cursor-dot", ".cursor-follower", ".cursor-aura"], { 
//           opacity: 0, 
//           scale: 0,
//           duration: 0.3, 
//           ease: "power2.out",
//           stagger: 0.05
//         });
        
//         gsap.to(".cursor-trail", { 
//           opacity: 0, 
//           scale: 0,
//           duration: 0.2, 
//           ease: "power2.out",
//           stagger: 0.01
//         });
        
//         setIsVisible(false);
//       }
      
//       rafId.current = requestAnimationFrame(render);
//     };
    
//     // Start the render loop
//     rafId.current = requestAnimationFrame(render);
//   };
  
//   // Event handlers
//   const handleMouseMove = (e:any) => {
//     const { clientX, clientY } = e;
    
//     // Update raw mouse position
//     mouse.current.x = clientX;
//     mouse.current.y = clientY;
    
//     // Initialize current position if it's at 0,0
//     if (currentMouse.current.x === 0) {
//       currentMouse.current.x = clientX;
//       currentMouse.current.y = clientY;
//       previousMouse.current.x = clientX;
//       previousMouse.current.y = clientY;
//     }
    
//     lastMouseMove.current = Date.now();
    
//     if (!isVisible) {
//       setIsVisible(true);
      
//       const gsap = gsapRef.current;
//       if (gsap) {
//         // Show cursor elements again
//         gsap.to(".cursor-dot", { 
//           opacity: 1, 
//           scale: 1,
//           duration: 0.4, 
//           ease: "elastic.out(1, 0.3)"
//         });
        
//         gsap.to(".cursor-follower", { 
//           opacity: 0.9, 
//           scale: 1,
//           duration: 0.6, 
//           ease: "elastic.out(1, 0.3)"
//         });
        
//         gsap.to(".cursor-aura", { 
//           opacity: 0.7, 
//           scale: 1,
//           duration: 0.8, 
//           ease: "elastic.out(1, 0.3)"
//         });
        
//         // Animate trails with staggered delay
//         trailsRef.current.forEach((trail, i) => {
//           gsap.to(trail, { 
//             opacity: 0.4 - (i * 0.04), 
//             scale: 0.5 - (i * 0.05),
//             duration: 0.6,
//             delay: i * 0.03,
//             ease: "power2.out"
//           });
//         });
//       }
//     }
//   };
  
//   const handleMouseDown = () => {
//     const gsap = gsapRef.current;
//     if (!gsap) return;
    
//     // Click effect
//     gsap.to(".cursor-dot", { 
//       scale: 0.7, 
//       duration: 0.2, 
//       ease: "power2.out"
//     });
    
//     gsap.to(".cursor-follower", { 
//       scale: 0.9, 
//       duration: 0.3, 
//       ease: "power2.out"
//     });
    
//     // Create ripple effect
//     const ripple = document.createElement('div');
//     ripple.className = 'cursor-ripple';
//     ripple.style.left = `${mouse.current.x}px`;
//     ripple.style.top = `${mouse.current.y}px`;
//     document.body.appendChild(ripple);
    
//     gsap.fromTo(ripple, 
//       { scale: 0, opacity: 0.7 },
//       { 
//         scale: 1.8, 
//         opacity: 0, 
//         duration: 0.8, 
//         ease: "power1.out",
//         onComplete: () => {
//           if (ripple.parentNode) {
//             ripple.parentNode.removeChild(ripple);
//           }
//         }
//       }
//     );
//   };
  
//   const handleMouseUp = () => {
//     const gsap = gsapRef.current;
//     if (!gsap) return;
    
//     // Release click effect
//     gsap.to(".cursor-dot", { 
//       scale: 1, 
//       duration: 0.4, 
//       ease: "elastic.out(1.2, 0.4)"
//     });
    
//     gsap.to(".cursor-follower", { 
//       scale: 1, 
//       duration: 0.5, 
//       ease: "elastic.out(1.2, 0.4)"
//     });
//   };
  
//   const handleMouseOver = (e:any) => {
//     // Check if we're hovering over an interactive element
//     const target = e.target;
//     const interactiveElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    
//     if (interactiveElements.includes(target.tagName) || 
//         getComputedStyle(target).cursor === 'pointer' ||
//         target.closest('a') ||
//         target.closest('button')) {
      
//       setIsHovering(true);
      
//       const gsap = gsapRef.current;
//       if (gsap) {
//         // Effects for interactive elements
//         gsap.to(".cursor-dot", { 
//           backgroundColor: "rgba(0, 255, 255, 1)",
//           scale: 0.7,
//           duration: 0.3, 
//           ease: "power2.out"
//         });
        
//         gsap.to(".cursor-follower", { 
//           scale: 1.3,
//           backgroundColor: "rgba(0, 255, 255, 0.15)",
//           borderColor: "rgba(0, 255, 255, 0.8)",
//           duration: 0.3, 
//           ease: "power2.out"
//         });
        
//         gsap.to(".cursor-trail", { 
//           backgroundColor: "rgba(0, 255, 255, 0.6)",
//           duration: 0.3, 
//           ease: "power2.out"
//         });
//       }
//     }
//   };
  
//   const handleMouseOut = (e:any) => {
//     const target = e.target;
    
//     // Check if we're leaving an interactive element
//     if (isHovering) {
//       const interactiveElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
      
//       if (interactiveElements.includes(target.tagName) || 
//           getComputedStyle(target).cursor === 'pointer' ||
//           target.closest('a') ||
//           target.closest('button')) {
          
//         setIsHovering(false);
        
//         const gsap = gsapRef.current;
//         if (gsap) {
//           // Reset effects
//           gsap.to(".cursor-dot", { 
//             backgroundColor: "rgba(0, 255, 255, 0.9)",
//             scale: 1,
//             duration: 0.3, 
//             ease: "power2.out"
//           });
          
//           gsap.to(".cursor-follower", { 
//             scale: 1,
//             backgroundColor: "rgba(0, 255, 255, 0.05)",
//             borderColor: "rgba(0, 255, 255, 0.5)",
//             duration: 0.3, 
//             ease: "power2.out"
//           });
          
//           gsap.to(".cursor-trail", { 
//             backgroundColor: "rgba(0, 210, 255, 0.4)",
//             duration: 0.3, 
//             ease: "power2.out"
//           });
//         }
//       }
//     }
//   };
  
//   const handleMouseEnter = () => {
//     const gsap = gsapRef.current;
//     if (!gsap) return;
    
//     setIsVisible(true);
    
//     // Show cursor again
//     gsap.to([".cursor-dot", ".cursor-follower", ".cursor-aura"], { 
//       opacity: 1, 
//       scale: 1,
//       duration: 0.3, 
//       ease: "power2.out",
//       stagger: 0.05
//     });
    
//     gsap.to(".cursor-trail", { 
//       opacity: isVisible ? 0.4 : 0,
//       scale: 0.5,
//       duration: 0.3, 
//       ease: "power2.out",
//       stagger: 0.02
//     });
//   };
  
//   const handleMouseLeave = () => {
//     const gsap = gsapRef.current;
//     if (!gsap) return;
    
//     setIsVisible(false);
    
//     // Hide cursor
//     gsap.to([".cursor-dot", ".cursor-follower", ".cursor-aura"], { 
//       opacity: 0, 
//       scale: 0,
//       duration: 0.3, 
//       ease: "power2.out",
//       stagger: 0.05
//     });
    
//     gsap.to(".cursor-trail", { 
//       opacity: 0, 
//       scale: 0,
//       duration: 0.2, 
//       ease: "power2.out",
//       stagger: 0.01
//     });
//   };

//   return (
//     <div className="gsap-cursor-container">
//       {/* Main cursor dot */}
//       <div 
//         className="cursor-dot" 
//         ref={cursorRef}
//       />
      
//       {/* Following circle */}
//       <div 
//         className="cursor-follower" 
//         ref={followerRef}
//       />
      
//       {/* Aura effect */}
//       <div 
//         className="cursor-aura" 
//         ref={auraRef}
//       />
//     </div>
//   );
// };

// export default CyanCursor;












//4
"use client"
import { useEffect, useRef } from "react"

const CyanCursorSimple = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorFollowerRef = useRef<HTMLDivElement>(null)
  const cursorAuraRef = useRef<HTMLDivElement>(null)
  const trailsRef = useRef<HTMLDivElement[]>([])
  const trailsContainerRef = useRef<HTMLDivElement | null>(null)

  // Mouse position tracking
  const mousePosition = useRef({ x: 0, y: 0 })
  const followerPosition = useRef({ x: 0, y: 0 })

  // Animation frame reference
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    // Create trails container
    const trailsContainer = document.createElement("div")
    trailsContainer.className = "cursor-trails-container"
    document.body.appendChild(trailsContainer)
    trailsContainerRef.current = trailsContainer

    // Create trail elements
    for (let i = 0; i < 8; i++) {
      const trail = document.createElement("div")
      trail.className = "cursor-trail"
      trail.style.opacity = "0"
      trail.style.transform = "translate(-50%, -50%) scale(0)"
      trailsContainer.appendChild(trail)
      trailsRef.current.push(trail)
    }

    // Initialize cursor position
    if (cursorDotRef.current) {
      cursorDotRef.current.style.opacity = "0"
      cursorDotRef.current.style.transform = "translate(-50%, -50%) scale(0)"
    }

    if (cursorFollowerRef.current) {
      cursorFollowerRef.current.style.opacity = "0"
      cursorFollowerRef.current.style.transform = "translate(-50%, -50%) scale(0)"
    }

    if (cursorAuraRef.current) {
      cursorAuraRef.current.style.opacity = "0"
      cursorAuraRef.current.style.transform = "translate(-50%, -50%) scale(0)"
    }

    // Event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseover", handleMouseOver)
    document.addEventListener("mouseout", handleMouseOut)

    // Start animation loop
    startAnimationLoop()

    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }

      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseout", handleMouseOut)

      // Remove trails container
      if (trailsContainerRef.current && trailsContainerRef.current.parentNode) {
        trailsContainerRef.current.parentNode.removeChild(trailsContainerRef.current)
      }
    }
  }, [])

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e

    // Update mouse position
    mousePosition.current = { x: clientX, y: clientY }

    // Show cursor on first move
    if (cursorDotRef.current && cursorDotRef.current.style.opacity === "0") {
      showCursor()
    }
  }

  const showCursor = () => {
    if (cursorDotRef.current) {
      cursorDotRef.current.style.opacity = "1"
      cursorDotRef.current.style.transform = "translate(-50%, -50%) scale(1)"
      cursorDotRef.current.style.transition = "opacity 0.3s ease, transform 0.3s ease"
    }

    if (cursorFollowerRef.current) {
      cursorFollowerRef.current.style.opacity = "0.9"
      cursorFollowerRef.current.style.transform = "translate(-50%, -50%) scale(1)"
      cursorFollowerRef.current.style.transition = "opacity 0.4s ease, transform 0.4s ease"
    }

    if (cursorAuraRef.current) {
      cursorAuraRef.current.style.opacity = "0.7"
      cursorAuraRef.current.style.transform = "translate(-50%, -50%) scale(1)"
      cursorAuraRef.current.style.transition = "opacity 0.5s ease, transform 0.5s ease"
    }

    // Show trails
    trailsRef.current.forEach((trail, i) => {
      trail.style.opacity = `${0.4 - i * 0.05}`
      trail.style.transform = `translate(-50%, -50%) scale(${0.5 - i * 0.05})`
      trail.style.transition = `opacity 0.5s ease, transform 0.5s ease`
    })
  }

  const handleMouseDown = () => {
    // Click effect
    if (cursorDotRef.current) {
      cursorDotRef.current.style.transform = "translate(-50%, -50%) scale(0.7)"
      cursorDotRef.current.style.transition = "transform 0.2s ease"
    }

    if (cursorFollowerRef.current) {
      cursorFollowerRef.current.style.transform = "translate(-50%, -50%) scale(0.9)"
      cursorFollowerRef.current.style.transition = "transform 0.2s ease"
    }

    // Create ripple effect
    const ripple = document.createElement("div")
    ripple.className = "cursor-ripple"
    ripple.style.left = `${mousePosition.current.x}px`
    ripple.style.top = `${mousePosition.current.y}px`
    document.body.appendChild(ripple)

    // Animate ripple
    setTimeout(() => {
      ripple.style.transform = "translate(-50%, -50%) scale(1.8)"
      ripple.style.opacity = "0"
      ripple.style.transition = "transform 0.8s ease, opacity 0.8s ease"
    }, 10)

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 800)
  }

  const handleMouseUp = () => {
    // Release click effect
    if (cursorDotRef.current) {
      cursorDotRef.current.style.transform = "translate(-50%, -50%) scale(1)"
      cursorDotRef.current.style.transition = "transform 0.3s ease"
    }

    if (cursorFollowerRef.current) {
      cursorFollowerRef.current.style.transform = "translate(-50%, -50%) scale(1)"
      cursorFollowerRef.current.style.transition = "transform 0.3s ease"
    }
  }

  const handleMouseOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement

    // Check if hovering over interactive element
    if (
      ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
      getComputedStyle(target).cursor === "pointer" ||
      target.closest("a") ||
      target.closest("button")
    ) {
      // Hover effect
      if (cursorDotRef.current) {
        cursorDotRef.current.style.backgroundColor = "rgba(0, 255, 255, 1)"
        cursorDotRef.current.style.transform = "translate(-50%, -50%) scale(0.7)"
      }

      if (cursorFollowerRef.current) {
        cursorFollowerRef.current.style.borderColor = "rgba(0, 255, 255, 0.8)"
        cursorFollowerRef.current.style.backgroundColor = "rgba(0, 255, 255, 0.15)"
        cursorFollowerRef.current.style.transform = "translate(-50%, -50%) scale(1.3)"
      }

      trailsRef.current.forEach((trail) => {
        trail.style.backgroundColor = "rgba(0, 255, 255, 0.6)"
      })
    }
  }

  const handleMouseOut = (e: MouseEvent) => {
    const target = e.target as HTMLElement

    // Check if leaving interactive element
    if (
      ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
      getComputedStyle(target).cursor === "pointer" ||
      target.closest("a") ||
      target.closest("button")
    ) {
      // Reset hover effect
      if (cursorDotRef.current) {
        cursorDotRef.current.style.backgroundColor = "rgba(0, 255, 255, 0.9)"
        cursorDotRef.current.style.transform = "translate(-50%, -50%) scale(1)"
      }

      if (cursorFollowerRef.current) {
        cursorFollowerRef.current.style.borderColor = "rgba(0, 255, 255, 0.5)"
        cursorFollowerRef.current.style.backgroundColor = "rgba(0, 255, 255, 0.05)"
        cursorFollowerRef.current.style.transform = "translate(-50%, -50%) scale(1)"
      }

      trailsRef.current.forEach((trail) => {
        trail.style.backgroundColor = "rgba(0, 210, 255, 0.4)"
      })
    }
  }

  const startAnimationLoop = () => {
    const animate = () => {
      // Smooth follower movement
      followerPosition.current.x += (mousePosition.current.x - followerPosition.current.x) * 0.15
      followerPosition.current.y += (mousePosition.current.y - followerPosition.current.y) * 0.15

      // Update cursor dot position (follows mouse exactly)
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${mousePosition.current.x}px`
        cursorDotRef.current.style.top = `${mousePosition.current.y}px`
      }

      // Update follower position (smoothed)
      if (cursorFollowerRef.current) {
        cursorFollowerRef.current.style.left = `${followerPosition.current.x}px`
        cursorFollowerRef.current.style.top = `${followerPosition.current.y}px`
      }

      // Update aura position (same as follower)
      if (cursorAuraRef.current) {
        cursorAuraRef.current.style.left = `${followerPosition.current.x}px`
        cursorAuraRef.current.style.top = `${followerPosition.current.y}px`
      }

      // Update trail positions
      trailsRef.current.forEach((trail, i) => {
        const progress = i / trailsRef.current.length
        const trailX = mousePosition.current.x + (followerPosition.current.x - mousePosition.current.x) * progress
        const trailY = mousePosition.current.y + (followerPosition.current.y - mousePosition.current.y) * progress

        trail.style.left = `${trailX}px`
        trail.style.top = `${trailY}px`
      })

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animationFrameId.current = requestAnimationFrame(animate)
  }

  return (
    <>
      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorFollowerRef} className="cursor-follower" />
      <div ref={cursorAuraRef} className="cursor-aura" />
      <style jsx global>{`
        html, body {
          cursor: none !important;
        }
        
        a, button, input, select, textarea, [role="button"] {
          cursor: none !important;
        }
        
        .cursor-dot {
          position: fixed;
          width: 8px;
          height: 8px;
          background-color: rgba(0, 255, 255, 0.9);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%) scale(0);
        }
        
        .cursor-follower {
          position: fixed;
          width: 36px;
          height: 36px;
          border: 2px solid rgba(0, 255, 255, 0.5);
          background-color: rgba(0, 255, 255, 0.05);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%) scale(0);
        }
        
        .cursor-aura {
          position: fixed;
          width: 80px;
          height: 80px;
          background-color: rgba(0, 255, 255, 0.1);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9997;
          transform: translate(-50%, -50%) scale(0);
          box-shadow: 0 0 20px 5px rgba(0, 255, 255, 0.2);
        }
        
        .cursor-trail {
          position: fixed;
          width: 12px;
          height: 12px;
          background-color: rgba(0, 210, 255, 0.4);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9996;
          transform: translate(-50%, -50%) scale(0);
        }
        
        .cursor-ripple {
          position: fixed;
          width: 80px;
          height: 80px;
          border: 2px solid rgba(0, 255, 255, 0.8);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9995;
          transform: translate(-50%, -50%) scale(0);
        }
        
        @media (max-width: 768px) {
          .cursor-dot, .cursor-follower, .cursor-aura, .cursor-trail, .cursor-ripple {
            display: none;
          }
        }
      `}</style>
    </>
  )
}

export default CyanCursorSimple















//5
// "use client"

// import React, { useEffect, useRef, useState, ReactElement } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { useMousePosition } from "@/hooks/use-FluidCursor"

// export default function AdvancedCursor() {
//   // Refs for cursor elements
//   const cursorDotRef = useRef<HTMLDivElement>(null)
//   const cursorRingRef = useRef<HTMLDivElement>(null)
//   const cursorAuraRef = useRef<HTMLDivElement>(null)
//   const trailsContainerRef = useRef<HTMLDivElement>(null)
//   const particlesContainerRef = useRef<HTMLDivElement>(null)

//   // Mouse position with custom hook
//   const mousePosition = useMousePosition()

//   // State management
//   const [cursorVariant, setCursorVariant] = useState("default")
//   const [cursorText, setCursorText] = useState("")
//   const [isVisible, setIsVisible] = useState(false)
//   const [isClicking, setIsClicking] = useState(false)
//   const [trailElements, setTrailElements] = useState<React.ReactElement[]>([])
//   const [particles, setParticles] = useState<React.ReactElement[]>([])

//   // Track last positions for velocity calculations
//   const lastPositionRef = useRef({ x: 0, y: 0 })
//   const velocityRef = useRef({ x: 0, y: 0 })
//   const lastUpdateTimeRef = useRef(0)

//   // Magnetic effect tracking
//   const magneticElementRef = useRef<Element | null>(null)
//   const magneticStrengthRef = useRef(0)
//   const originalButtonPositionRef = useRef({ x: 0, y: 0 })

//   // Initialize cursor system
//   useEffect(() => {
//     // Hide default cursor
//     document.documentElement.classList.add("hide-cursor")

//     // Show cursor when mouse moves
//     const handleFirstMove = () => {
//       setIsVisible(true)
//       window.removeEventListener("mousemove", handleFirstMove)
//     }

//     window.addEventListener("mousemove", handleFirstMove)

//     // Set up event listeners
//     window.addEventListener("mousedown", handleMouseDown)
//     window.addEventListener("mouseup", handleMouseUp)
//     window.addEventListener("mouseleave", handleMouseLeave)
//     window.addEventListener("mouseenter", handleMouseEnter)

//     // Set up hover detection for interactive elements
//     setupHoverDetection()

//     // Create initial trail elements
//     createTrailElements()

//     return () => {
//       document.documentElement.classList.remove("hide-cursor")
//       window.removeEventListener("mousemove", handleFirstMove)
//       window.removeEventListener("mousedown", handleMouseDown)
//       window.removeEventListener("mouseup", handleMouseUp)
//       window.removeEventListener("mouseleave", handleMouseLeave)
//       window.removeEventListener("mouseenter", handleMouseEnter)

//       // Clean up hover detection
//       cleanupHoverDetection()
//     }
//   }, [])

//   // Update velocity calculations
//   useEffect(() => {
//     if (!mousePosition.x || !mousePosition.y) return

//     const now = performance.now()
//     const dt = now - lastUpdateTimeRef.current

//     if (dt > 0) {
//       // Calculate velocity
//       velocityRef.current = {
//         x: ((mousePosition.x - lastPositionRef.current.x) / dt) * 15,
//         y: ((mousePosition.y - lastPositionRef.current.y) / dt) * 15,
//       }

//       // Update last position and time
//       lastPositionRef.current = { x: mousePosition.x, y: mousePosition.y }
//       lastUpdateTimeRef.current = now
//     }
//   }, [mousePosition])

//   // Create trail elements
//   const createTrailElements = () => {
//     const newTrails = []
//     const trailCount = 12 // Increased trail count

//     for (let i = 0; i < trailCount; i++) {
//       const delay = i * 0.008
//       const scale = 1 - (i / trailCount) * 0.7
//       const opacity = 0.5 - (i / trailCount) * 0.5

//       newTrails.push(
//         <motion.div
//           key={`trail-${i}`}
//           className="cursor-trail"
//           initial={{ opacity: 0, scale: 0 }}
//           animate={{
//             opacity: isVisible ? opacity : 0,
//             scale: isVisible ? scale : 0,
//             x: mousePosition.x || 0,
//             y: mousePosition.y || 0,
//             transition: {
//               x: { type: "spring", stiffness: 250 - i * 20, damping: 15, mass: 0.2 + i * 0.05, delay: delay },
//               y: { type: "spring", stiffness: 250 - i * 20, damping: 15, mass: 0.2 + i * 0.05, delay: delay },
//               opacity: { duration: 0.2 },
//             },
//           }}
//           style={{
//             backgroundColor: `hsla(${180 + i * 2}, 100%, ${70 - i * 2}%, ${opacity})`,
//             filter: `blur(${1 + i * 0.1}px)`,
//             boxShadow: `0 0 ${8 + i}px hsla(${180 + i * 2}, 100%, ${70 - i * 2}%, ${opacity * 0.7})`,
//             mixBlendMode: "screen",
//           }}
//         />,
//       )
//     }

//     setTrailElements(newTrails)
//   }

//   // Create particle burst effect
//   const createParticleBurst = (x: number, y: number) => {
//     const newParticles: ReactElement[] = []
//     const particleCount = 12
//     const uniqueId = Date.now()

//     for (let i = 0; i < particleCount; i++) {
//       const angle = (i / particleCount) * Math.PI * 2
//       const speed = 2 + Math.random() * 3
//       const distance = 50 + Math.random() * 80
//       const size = 3 + Math.random() * 5
//       const duration = 0.5 + Math.random() * 0.7
//       const hue = 180 + Math.random() * 40 - 20

//       newParticles.push(
//         <motion.div
//           key={`particle-${uniqueId}-${i}`}
//           className="cursor-particle"
//           initial={{
//             x,
//             y,
//             scale: 0.5,
//             opacity: 0.8,
//           }}
//           animate={{
//             x: x + Math.cos(angle) * distance,
//             y: y + Math.sin(angle) * distance,
//             scale: 0,
//             opacity: 0,
//           }}
//           transition={{
//             duration: duration,
//             ease: "easeOut",
//           }}
//           style={{
//             width: `${size}px`,
//             height: `${size}px`,
//             backgroundColor: `hsla(${hue}, 100%, 70%, 0.8)`,
//             boxShadow: `0 0 ${size * 2}px hsla(${hue}, 100%, 70%, 0.5)`,
//             borderRadius: "50%",
//             position: "fixed",
//             top: 0,
//             left: 0,
//             transform: "translate(-50%, -50%)",
//             pointerEvents: "none",
//             zIndex: 10002,
//           }}
//           onAnimationComplete={() => {
//             // Remove this particle when animation completes
//             setParticles((prev) => prev.filter((p) => p.key !== `particle-${uniqueId}-${i}`))
//           }}
//         />,
//       )
//     }

//     setParticles((prev) => [...prev, ...newParticles])
//   }

//   // Create ripple effect
//   const createRippleEffect = (x: number, y: number) => {
//     const rippleId = `ripple-${Date.now()}`
//     const ripple = (
//       <motion.div
//         key={rippleId}
//         className="cursor-ripple"
//         initial={{
//           x,
//           y,
//           scale: 0.2,
//           opacity: 0.9,
//           borderColor: "rgba(0, 255, 255, 0.9)",
//         }}
//         animate={{
//           scale: 2,
//           opacity: 0,
//           borderColor: "rgba(0, 255, 255, 0)",
//         }}
//         transition={{
//           duration: 0.8,
//           ease: "easeOut",
//         }}
//         onAnimationComplete={() => {
//           // Remove this ripple when animation completes
//           setParticles((prev) => prev.filter((p) => p.key !== rippleId))
//         }}
//       />
//     )

//     setParticles((prev) => [...prev, ripple])
//   }

//   // Set up hover detection for interactive elements
//   const setupHoverDetection = () => {
//     const interactiveSelectors = 'a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])'
//     const interactiveElements = document.querySelectorAll(interactiveSelectors)

//     interactiveElements.forEach((el) => {
//       el.addEventListener("mouseenter", () => handleElementHover(el))
//       el.addEventListener("mouseleave", handleElementLeave)

//       // Add magnetic effect to buttons
//       if (el.tagName === "BUTTON" || el.getAttribute("role") === "button" || el.tagName === "A") {
//         el.addEventListener("mousemove", (e:any) => handleMagneticMove(e, el))
//       }
//     })
//   }

//   // Clean up hover detection
//   const cleanupHoverDetection = () => {
//     const interactiveSelectors = 'a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])'
//     const interactiveElements = document.querySelectorAll(interactiveSelectors)

//     interactiveElements.forEach((el) => {
//       el.removeEventListener("mouseenter", () => handleElementHover(el))
//       el.removeEventListener("mouseleave", handleElementLeave)

//       if (el.tagName === "BUTTON" || el.getAttribute("role") === "button" || el.tagName === "A") {
//         el.removeEventListener("mousemove", (e:any) => handleMagneticMove(e, el as Element))
//       }
//     })
//   }

//   // Handle magnetic effect on buttons
//   const handleMagneticMove = (e: MouseEvent, element: Element) => {
//     const rect = element.getBoundingClientRect()
//     const centerX = rect.left + rect.width / 2
//     const centerY = rect.top + rect.height / 2

//     // Save original position if not already saved
//     if (!originalButtonPositionRef.current.x) {
//       originalButtonPositionRef.current = {
//         x: centerX,
//         y: centerY,
//       }
//     }

//     // Calculate distance from mouse to center of button
//     const distanceX = e.clientX - centerX
//     const distanceY = e.clientY - centerY

//     // Calculate distance
//     const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

//     // Calculate magnetic strength based on distance
//     // Stronger when closer to center
//     const maxDistance = Math.max(rect.width, rect.height) * 1.5
//     const magneticStrength = Math.max(0, 1 - distance / maxDistance) * 0.3

//     magneticElementRef.current = element
//     magneticStrengthRef.current = magneticStrength

//     // Apply magnetic effect to the button
//     const button = element as HTMLElement
//     const moveX = distanceX * magneticStrength * 0.5
//     const moveY = distanceY * magneticStrength * 0.5

//     button.style.transform = `translate(${moveX}px, ${moveY}px)`
//   }

//   // Handle element hover
//   const handleElementHover = (element: Element) => {
//     // Get element text for label
//     let hoverText = ""
//     // if (element.tagName === "A") {
//     //   hoverText = "Click"
//     // } else if (element.tagName === "BUTTON") {
//     //   hoverText = "Press"
//     // } else if (element.tagName === "INPUT") {
//     //   const inputType = (element as HTMLInputElement).type
//     //   hoverText = inputType === "submit" ? "Submit" : "Type"
//     // }

//     setCursorText(hoverText)
//     setCursorVariant("hover")
//   }

//   // Handle element leave
//   const handleElementLeave = () => {
//     setCursorText("")
//     setCursorVariant("default")

//     // Reset magnetic element
//     if (magneticElementRef.current) {
//       const button = magneticElementRef.current as HTMLElement
//       button.style.transform = "translate(0, 0)"
//       magneticElementRef.current = null
//       magneticStrengthRef.current = 0
//       originalButtonPositionRef.current = { x: 0, y: 0 }
//     }
//   }

//   // Handle mouse down
//   const handleMouseDown = () => {
//     setIsClicking(true)
//     setCursorVariant("clicking")

//     // Create particle burst and ripple at current mouse position
//     if (mousePosition.x && mousePosition.y) {
//       createParticleBurst(mousePosition.x, mousePosition.y)
//       createRippleEffect(mousePosition.x, mousePosition.y)
//     }
//   }

//   // Handle mouse up
//   const handleMouseUp = () => {
//     setIsClicking(false)
//     setCursorVariant(cursorText ? "hover" : "default")
//   }

//   // Handle mouse leave
//   const handleMouseLeave = () => {
//     setIsVisible(false)
//   }

//   // Handle mouse enter
//   const handleMouseEnter = () => {
//     setIsVisible(true)
//   }

//   // Cursor variants for different states
//   const cursorVariants = {
//     default: {
//       width: 10,
//       height: 10,
//       backgroundColor: "rgba(0, 255, 255, 0.9)",
//       // Use style prop for mixBlendMode instead
//       borderRadius: "50%",
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 500,
//         damping: 28,
//         mass: 0.5,
//       },
//     },
//     hover: {
//       width: 16,
//       height: 16,
//       backgroundColor: "rgba(0, 255, 255, 1)",
//       // Use style prop for mixBlendMode instead
//       borderRadius: "50%",
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 400,
//         damping: 28,
//       },
//     },
//     clicking: {
//       width: 14,
//       height: 14,
//       backgroundColor: "rgba(0, 255, 255, 1)",
//       // Use style prop for mixBlendMode instead
//       borderRadius: "50%",
//       scale: 0.8,
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 400,
//         damping: 28,
//       },
//     },
//   }

//   // Cursor ring variants
//   const ringVariants = {
//     default: {
//       width: 40,
//       height: 40,
//       borderColor: "rgba(0, 255, 255, 0.5)",
//       borderWidth: "1.5px",
//       backgroundColor: "rgba(0, 255, 255, 0.05)",
//       opacity: 0.9,
//       borderRadius: "50%",
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 300,
//         damping: 20,
//         mass: 0.8,
//       },
//     },
//     hover: {
//       width: 60,
//       height: 60,
//       borderColor: "rgba(0, 255, 255, 0.8)",
//       borderWidth: "2px",
//       backgroundColor: "rgba(0, 255, 255, 0.15)",
//       opacity: 1,
//       borderRadius: "50%",
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 200,
//         damping: 20,
//       },
//     },
//     clicking: {
//       width: 50,
//       height: 50,
//       borderColor: "rgba(0, 255, 255, 0.9)",
//       borderWidth: "3px",
//       backgroundColor: "rgba(0, 255, 255, 0.2)",
//       opacity: 1,
//       scale: 0.9,
//       borderRadius: "50%",
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 300,
//         damping: 10,
//       },
//     },
//   }

//   // Cursor aura variants
//   const auraVariants = {
//     default: {
//       width: 80,
//       height: 80,
//       opacity: isVisible ? 0.7 : 0,
//       scale: isVisible ? 1 : 0,
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 150,
//         damping: 15,
//         mass: 1,
//       },
//     },
//     hover: {
//       width: 100,
//       height: 100,
//       opacity: isVisible ? 0.9 : 0,
//       scale: isVisible ? 1.2 : 0,
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 150,
//         damping: 15,
//       },
//     },
//     clicking: {
//       width: 90,
//       height: 90,
//       opacity: isVisible ? 0.95 : 0,
//       scale: isVisible ? 0.9 : 0,
//       x: mousePosition.x || 0,
//       y: mousePosition.y || 0,
//       transition: {
//         type: "spring",
//         stiffness: 200,
//         damping: 10,
//       },
//     },
//   }

//   // Calculate tilt based on velocity
//   const getTiltStyle = () => {
//     const maxTilt = 20 // Maximum tilt in degrees
//     const tiltX = Math.min(Math.max(-velocityRef.current.y * 0.5, -maxTilt), maxTilt)
//     const tiltY = Math.min(Math.max(velocityRef.current.x * 0.5, -maxTilt), maxTilt)

//     return {
//       transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
//     }
//   }

//   return (
//     <>
//       <style jsx global>{`
//         /* Hide default cursor */
//         .hide-cursor, .hide-cursor * {
//           cursor: none !important;
//         }
        
//         /* Cursor elements */
//         .cursor-dot, .cursor-ring, .cursor-aura, .cursor-trail, .cursor-ripple, .cursor-text {
//           pointer-events: none;
//           position: fixed;
//           top: 0;
//           left: 0;
//           transform: translate(-50%, -50%);
//           z-index: 10000;
//           will-change: transform, width, height, opacity;
//         }
        
//         /* Cursor ripple */
//         .cursor-ripple {
//           border-radius: 50%;
//           border: 2px solid rgba(0, 255, 255, 0.8);
//           box-shadow: 0 0 20px rgba(0, 255, 255, 0.4),
//                       inset 0 0 15px rgba(0, 255, 255, 0.3);
//           z-index: 9998;
//         }
        
//         /* Cursor text */
//         .cursor-text {
//           color: rgba(0, 255, 255, 1);
//           font-size: 12px;
//           font-weight: 600;
//           letter-spacing: 0.5px;
//           text-transform: uppercase;
//           white-space: nowrap;
//           z-index: 10004;
//           text-shadow: 0 0 5px rgba(0, 255, 255, 0.8),
//                        0 0 10px rgba(0, 255, 255, 0.5);
//           backdrop-filter: blur(4px);
//           padding: 4px 8px;
//           border-radius: 4px;
//           background-color: rgba(0, 0, 0, 0.1);
//         }
        
//         /* Media query for touch devices */
//         @media (hover: none) and (pointer: coarse) {
//           .cursor-dot, .cursor-ring, .cursor-aura, .cursor-trail, 
//           .cursor-ripple, .cursor-text, .cursor-particle {
//             display: none !important;
//           }
          
//           .hide-cursor, .hide-cursor * {
//             cursor: auto !important;
//           }
//         }
//       `}</style>

//       {/* Main cursor elements */}
//       <AnimatePresence>
//         {isVisible && (
//           <>
//             {/* Cursor dot */}
//             <motion.div
//               ref={cursorDotRef}
//               className="cursor-dot"
//               variants={cursorVariants}
//               animate={cursorVariant}
//               initial="default"
//               exit={{
//                 opacity: 0,
//                 scale: 0,
//                 transition: { duration: 0.2 },
//               }}
//               style={{
//                 boxShadow:
//                   "0 0 15px rgba(0, 255, 255, 0.5), 0 0 5px rgba(0, 255, 255, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.5)",
//                 backdropFilter: "blur(1px)",
//                 mixBlendMode: "screen",
//                 ...getTiltStyle(),
//               }}
//             />

//             {/* Cursor ring */}
//             <motion.div
//               ref={cursorRingRef}
//               className="cursor-ring"
//               variants={ringVariants}
//               animate={cursorVariant}
//               initial="default"
//               exit={{
//                 opacity: 0,
//                 scale: 0,
//                 transition: { duration: 0.2 },
//               }}
//               style={{
//                 backdropFilter: "blur(2px)",
//                 boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
//                 ...getTiltStyle(),
//               }}
//             />

//             {/* Cursor aura */}
//             <motion.div
//               ref={cursorAuraRef}
//               className="cursor-aura"
//               variants={auraVariants}
//               animate={cursorVariant}
//               initial="default"
//               exit={{
//                 opacity: 0,
//                 scale: 0,
//                 transition: { duration: 0.2 },
//               }}
//               style={{
//                 background:
//                   "radial-gradient(circle, rgba(0, 255, 255, 0.15) 0%, rgba(0, 255, 255, 0.08) 40%, rgba(0, 255, 255, 0) 70%)",
//                 mixBlendMode: "screen",
//               }}
//             />

//             {/* Cursor text */}
//             {cursorText && (
//               <motion.div
//                 className="cursor-text"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{
//                   opacity: 1,
//                   x: mousePosition.x || 0,
//                   y: (mousePosition.y || 0) - 45,
//                 }}
//                 exit={{ opacity: 0, y: 10 }}
//                 transition={{
//                   opacity: { duration: 0.2 },
//                   y: { duration: 0.2 },
//                   x: { type: "spring", stiffness: 500, damping: 28 },
//                 }}
//               >
//                 {cursorText}
//               </motion.div>
//             )}
//           </>
//         )}
//       </AnimatePresence>

//       {/* Cursor trails */}
//       <div ref={trailsContainerRef} className="cursor-trails-container">
//         {trailElements}
//       </div>

//       {/* Particles container */}
//       <div ref={particlesContainerRef}>{particles}</div>
//     </>
//   )
// }

