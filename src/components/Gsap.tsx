import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const AdvancedCursor = () => {
  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const cursorOuter = cursorOuterRef.current;
    const cursorInner = cursorInnerRef.current;

    // Create smooth movement animation
    let xTo = gsap.quickTo(cursorOuter, "x", { duration: 0.6, ease: "power3.out" });
    let yTo = gsap.quickTo(cursorOuter, "y", { duration: 0.6, ease: "power3.out" });
    let xiTo = gsap.quickTo(cursorInner, "x", { duration: 0.2, ease: "power3.out" });
    let yiTo = gsap.quickTo(cursorInner, "y", { duration: 0.2, ease: "power3.out" });

    // Initialize rotation timeline
    const rotateTl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    rotateTl.to(cursorOuter, {
      rotate: 360,
      duration: 5,
      ease: "none"
    });

    // Mouse move handler with lerped movement
    const handleMouseMove = (e:any) => {
      const { clientX, clientY } = e;
      xTo(clientX);
      yTo(clientY);
      xiTo(clientX);
      yiTo(clientY);

      // Optional: Add slight tilt based on velocity
      const speed = Math.sqrt(e.movementX ** 2 + e.movementY ** 2);
      const tiltX = gsap.utils.clamp(-20, 20, e.movementY * 2);
      const tiltY = gsap.utils.clamp(-20, 20, -e.movementX * 2);
      
      gsap.to(cursorOuter, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.5,
      });
    };

    // Interaction handlers
    const handleMouseDown = () => {
      setIsClicking(true);
      gsap.to([cursorOuter, cursorInner], {
        scale: 0.8,
        duration: 0.2,
      });
    };

    const handleMouseUp = () => {
      setIsClicking(false);
      gsap.to([cursorOuter, cursorInner], {
        scale: 1,
        duration: 0.2,
      });
    };

    // Interactive elements handling
    const handleElementsHover = () => {
      const interactiveElements = document.querySelectorAll('button, a, input, [data-cursor-interact]');
      
      interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          setIsHovering(true);
          gsap.to(cursorOuter, {
            scale: 1.5,
            background: 'rgba(6, 182, 212, 0.1)',
            duration: 0.3,
          });
          gsap.to(cursorInner, {
            scale: 0.5,
            background: 'rgba(6, 182, 212, 1)',
            duration: 0.3,
          });
        });

        element.addEventListener('mouseleave', () => {
          setIsHovering(false);
          gsap.to([cursorOuter, cursorInner], {
            scale: 1,
            background: 'rgba(6, 182, 212, 0.3)',
            duration: 0.3,
          });
        });
      });
    };

    // Initialize magnetic effect for buttons
    const initMagneticButtons = () => {
      const buttons = document.querySelectorAll('[data-magnetic]');
      
      buttons.forEach(button => {
        button.addEventListener('mousemove', (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const rect = button.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.sqrt(
            Math.pow(mouseEvent.clientX - centerX, 2) + 
            Math.pow(mouseEvent.clientY - centerY, 2)
          );
          
          if (distance < 100) {
            const magneticPull = (100 - distance) / 100;
            gsap.to(cursorOuter, {
              x: centerX + (mouseEvent.clientX - centerX) * 0.4,
              y: centerY + (mouseEvent.clientY - centerY) * 0.4,
              duration: 0.3,
            });
          }
        });
      });
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Initialize interactions
    handleElementsHover();
    initMagneticButtons();

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      rotateTl.kill();
    };
  }, []);

  return (
    <>
      {/* Outer cursor */}
      <div
        ref={cursorOuterRef}
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          width: '40px',
          height: '40px',
          marginLeft: '-20px',
          marginTop: '-20px',
          transform: 'translate(0, 0)',
          willChange: 'transform'
        }}
      >
        {/* Animated border */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(6, 182, 212, 0.3)',
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
        className="fixed w-4 h-4 pointer-events-none z-50 rounded-full bg-cyan-400/30 backdrop-blur-sm"
        style={{
          marginLeft: '-8px',
          marginTop: '-8px',
          transform: 'translate(0, 0)',
          willChange: 'transform',
          mixBlendMode: 'difference'
        }}
      >
        {/* Inner dot */}
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-1 -ml-0.5 -mt-0.5 rounded-full bg-cyan-400"
          style={{
            transform: `scale(${isClicking ? 1.5 : 1})`,
            transition: 'transform 0.2s ease'
          }}
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
  );
};

export default AdvancedCursor;