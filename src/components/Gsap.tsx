// import React, { useEffect, useRef } from 'react';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
// import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';

// if (typeof window !== 'undefined') {
//   gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
// }

// export default function AdvancedSmoothScroll() {
//   const smoothWrapperRef = useRef(null);
//   const contentRef = useRef(null);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     // Enhanced scroll configuration
//     ScrollTrigger.config({
//       limitCallbacks: true,
//       ignoreMobileResize: true,
//       autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
//     });

//     // Initialize variables for velocity tracking
//     let currentVelocity = 0;
//     let lastScrollTop = window.pageYOffset;
//     let scrollTimeout: NodeJS.Timeout;
//     let rafId: number;
//     let isScrolling = false;

//     // Advanced smooth scroll with physics
//     const smoothScroll = {
//       current: window.pageYOffset,
//       target: window.pageYOffset,
//       ease: 0.05, // Adjust for smoothness
//       friction: 0.92, // Adjust for momentum
//       velocity: 0
//     };

//     // Perspective transformation setup
//     const sections = gsap.utils.toArray('.scroll-section');
//     sections.forEach((section: Element) => {
//       gsap.set(section, { 
//         transformPerspective: 1000,
//         transformStyle: "preserve-3d"
//       });
//     });

//     // Magnetic hover effect for interactive elements
//     const magneticElements = document.querySelectorAll('.magnetic');
//     magneticElements.forEach(elem => {
//       elem.addEventListener('mousemove', (e: MouseEvent) => {
//         const rect = (elem as HTMLElement).getBoundingClientRect();
//         const x = e.clientX - rect.left - rect.width / 2;
//         const y = e.clientY - rect.top - rect.height / 2;
        
//         gsap.to(elem, {
//           duration: 0.3,
//           x: x * 0.1,
//           y: y * 0.1,
//           rotation: x * 0.05,
//           ease: "power2.out"
//         });
//       });

//       elem.addEventListener('mouseleave', () => {
//         gsap.to(elem, {
//           duration: 0.3,
//           x: 0,
//           y: 0,
//           rotation: 0,
//           ease: "elastic.out(1, 0.3)"
//         });
//       });
//     });

//     // Parallax scroll effect with depth
//     sections.forEach((section: Element, i) => {
//       const bg = section.querySelector('.parallax-bg');
//       const content = section.querySelector('.content');
//       const depth = i % 2 === 0 ? 1 : -1;

//       if (bg) {
//         gsap.to(bg, {
//           y: `${30 * depth}%`,
//           ease: "none",
//           scrollTrigger: {
//             trigger: section,
//             start: "top bottom",
//             end: "bottom top",
//             scrub: 1.5,
//           }
//         });
//       }

//       if (content) {
//         gsap.from(content, {
//           scrollTrigger: {
//             trigger: content,
//             start: "top 80%",
//             end: "top 20%",
//             scrub: 1
//           },
//           y: 50 * depth,
//           opacity: 0,
//           scale: 0.9,
//           rotateX: 5 * depth,
//           transformOrigin: "center center"
//         });
//       }
//     });

//     // Advanced physics-based smooth scrolling
//     const updateScroll = () => {
//       if (!isScrolling) return;

//       // Update smooth scroll values with physics
//       smoothScroll.velocity = smoothScroll.target - smoothScroll.current;
//       smoothScroll.current += smoothScroll.velocity * smoothScroll.ease;
//       smoothScroll.velocity *= smoothScroll.friction;

//       // Apply transform
//       gsap.set(contentRef.current, {
//         y: -smoothScroll.current,
//         force3D: true
//       });

//       rafId = requestAnimationFrame(updateScroll);
//     };

//     // Scroll velocity tracking
//     const handleScroll = () => {
//       const st = window.pageYOffset;
//       currentVelocity = st - lastScrollTop;
//       lastScrollTop = st;
//       smoothScroll.target = st;

//       if (!isScrolling) {
//         isScrolling = true;
//         rafId = requestAnimationFrame(updateScroll);
//       }

//       clearTimeout(scrollTimeout);
//       scrollTimeout = setTimeout(() => {
//         isScrolling = false;
//       }, 100);
//     };

//     // Stagger reveal for elements
//     gsap.utils.toArray('.stagger-reveal').forEach((elem: Element) => {
//       gsap.from(elem, {
//         scrollTrigger: {
//           trigger: elem,
//           start: "top 80%",
//           end: "top 20%",
//           toggleActions: "play none none reverse"
//         },
//         y: 100,
//         opacity: 0,
//         duration: 1,
//         stagger: {
//           amount: 0.5,
//           from: "start"
//         },
//         ease: "power3.out"
//       });
//     });

//     // Scale effect for hero section
//     gsap.to('.hero-section', {
//       scrollTrigger: {
//         trigger: '.hero-section',
//         start: "top top",
//         end: "bottom top",
//         scrub: 1
//       },
//       scale: 0.8,
//       opacity: 0.5,
//       ease: "none"
//     });

//     // Horizontal scroll sections
//     const horizontalSections = gsap.utils.toArray('.horizontal-scroll');
//     horizontalSections.forEach((section: Element) => {
//       const items = gsap.utils.toArray('.horizontal-item', section);
      
//       gsap.to(items, {
//         xPercent: -100 * (items.length - 1),
//         ease: "none",
//         scrollTrigger: {
//           trigger: section,
//           pin: true,
//           start: "top top",
//           end: () => `+=${section.scrollWidth}`,
//           scrub: 1,
//           snap: {
//             snapTo: 1 / (items.length - 1),
//             duration: { min: 0.1, max: 0.3 },
//             ease: "power1.inOut"
//           }
//         }
//       });
//     });

//     // Event listeners
//     window.addEventListener('scroll', handleScroll, { passive: true });
//     window.addEventListener('resize', ScrollTrigger.update);

//     // Initialize first scroll position
//     handleScroll();

//     // Cleanup
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//       window.removeEventListener('resize', ScrollTrigger.update);
//       cancelAnimationFrame(rafId);
//       clearTimeout(scrollTimeout);
//       ScrollTrigger.getAll().forEach(trigger => trigger.kill());
//       gsap.killTweensOf('*');
//     };
//   }, []);

//   return null;
// }

// // HOC for smooth scroll
// export function withAdvancedScroll(WrappedComponent: React.ComponentType) {
//   return function WithAdvancedScrollComponent(props: any) {
//     const smoothWrapperRef = useRef(null);
//     const contentRef = useRef(null);
    
//     return (
//       <div className="relative min-h-screen overflow-hidden" ref={smoothWrapperRef}>
//         <AdvancedSmoothScroll />
//         <div 
//           className="transform-gpu will-change-transform"
//           ref={contentRef}
//         >
//           <WrappedComponent {...props} />
//         </div>
//       </div>
//     );
//   };
// }