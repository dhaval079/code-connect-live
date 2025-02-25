// "use client";
// import React, { useState, useEffect } from 'react';
// import { ArrowUp } from 'lucide-react';

// const ScrollToTop = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   // Show button when page is scrolled up to given distance
//   const toggleVisibility = () => {
//     if (window.pageYOffset > 300) {
//       setIsVisible(true);
//     } else {
//       setIsVisible(false);
//     }
//   };

//   // Smooth scroll to top with easing
//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: 'smooth'
//     });
//   };

//   useEffect(() => {
//     window.addEventListener('scroll', toggleVisibility);
//     return () => {
//       window.removeEventListener('scroll', toggleVisibility);
//     };
//   }, []);

//   return (
//     <div className={`
//       fixed
//       bottom-8
//       right-8
//       transition-all
//       duration-500
//       ease-in-out
//       transform
//       ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
//     `}>
//       <button
//         onClick={scrollToTop}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         className={`
//           group
//           relative
//           p-4
//           bg-gray-900
//           hover:bg-gray-800
//           text-gray-300
//           hover:text-white
//           rounded-full
//           shadow-lg
//           cursor-pointer
//           transition-all
//           duration-300
//           ease-in-out
//           hover:shadow-2xl
//           focus:outline-none
//           focus:ring-2
//           focus:ring-purple-500
//           focus:ring-opacity-50
//           z-50
//         `}
//         aria-label="Scroll to top"
//       >
//         {/* Pulse effect background */}
//         <span className={`
//           absolute
//           inset-0
//           rounded-full
//           bg-purple-500
//           opacity-20
//           transition-transform
//           duration-300
//           ease-in-out
//           ${isHovered ? 'scale-125' : 'scale-0'}
//         `}></span>
        
//         {/* Main icon */}
//         <ArrowUp className={`
//           w-6
//           h-6
//           transform
//           transition-all
//           duration-300
//           ease-in-out
//           ${isHovered ? 'translate-y-0 scale-110' : 'translate-y-1'}
//           group-hover:animate-bounce
//         `} />
        
//         {/* Glow effect */}
//         <div className={`
//           absolute
//           inset-0
//           rounded-full
//           bg-purple-500
//           filter
//           blur-xl
//           opacity-0
//           transition-opacity
//           duration-300
//           group-hover:opacity-20
//         `}></div>
//       </button>
      
//       {/* Tooltip */}
//       <div className={`
//         absolute
//         bottom-full
//         left-1/2
//         transform
//         -translate-x-1/2
//         mb-2
//         px-3
//         py-1
//         bg-gray-900
//         text-white
//         text-sm
//         rounded-md
//         shadow-lg
//         transition-all
//         duration-300
//         ${isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1 pointer-events-none'}
//       `}>
//         Back to top
//       </div>
//     </div>
//   );
// };

// export default ScrollToTop;