"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useRef, useState, useEffect } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (Math.abs(scrollY - lastScrollY.current) > 5) {
        const shouldBeVisible = scrollY > 50;

        if (shouldBeVisible !== visible) {
          setVisible(shouldBeVisible);
        }

        lastScrollY.current = scrollY;
      }

      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollState);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [visible]);

  return (
    <motion.div
      ref={ref}
      animate={{
        padding: visible ? "16px" : "0px", // Animate the padding
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn("fixed z-[9999] w-full pointer-events-none", className)}
      style={{
        contain: 'layout style paint',
        willChange: 'auto',
        top: 0,
        left: 0,
        right: 0,
        margin: 0,
      }}
    >
      <div className="pointer-events-auto">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(
                child as React.ReactElement<{ visible?: boolean }>,
                { visible },
              )
            : child,
        )}
      </div>
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        background: visible 
          ? "rgba(15, 23, 42, 0.95)" 
          : "transparent",
        backdropFilter: visible ? "blur(20px)" : "blur(0px)",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "55%" : "100%",
        height: visible ? "56px" : "80px",
        borderRadius: visible ? "28px" : "0px",
        paddingLeft: visible ? "24px" : "48px",
        paddingRight: visible ? "24px" : "48px",
        marginTop: visible ? "24px" : "10px",
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-8xl bg-transparent lg:flex",
        className,
      )}
    >
      {/* Pass visible prop to all children */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { visible });
        }
        return child;
      })}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "flex items-center justify-center space-x-8 text-sm font-medium",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 -ml-16 text-gray-300 hover:text-white transition-colors duration-200"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-2xl bg-white/20"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backgroundColor: visible ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.8)",
        backdropFilter: visible ? "blur(16px)" : "blur(8px)",
      }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{
        willChange: 'transform, background-color, backdrop-filter',
      }}
      className={cn(
        "relative z-50 w-full flex flex-col lg:hidden",
        visible ? "mobile-navbar-compact" : "mobile-navbar-full",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between h-full",
        className,
      )}
    >
      {children}
    </div>
  );
};


export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className={cn(
            "absolute top-full left-0 right-0 mt-4 mx-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden",
            className,
          )}
        >
          <div className="p-6 space-y-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button 
      onClick={onClick} 
      className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <IconX className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <IconMenu2 className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};


// export const NavbarLogo = () => {
//   const [isHovered, setIsHovered] = useState(false)

//   return (
//     <motion.a
//       href="#"
//       className="flex items-center space-x-4 group cursor-pointer relative"
//       onHoverStart={() => setIsHovered(true)}
//       onHoverEnd={() => setIsHovered(false)}
//       whileHover={{ scale: 1.02 }}
//       initial={{ opacity: 0, x: -20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
//     >
//       {/* Logo Container */}
//       <div className="relative w-12 h-12">
//         {/* Background Glow */}
//         <motion.div
//           className="absolute inset-0 rounded-2xl blur-lg"
//           style={{
//             background: "linear-gradient(45deg, rgba(6,182,212,0.3), rgba(37,99,235,0.3), rgba(124,58,237,0.3))",
//           }}
//           animate={{
//             scale: isHovered ? [1, 1.2, 1] : 1,
//             opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3,
//           }}
//           transition={{
//             duration: 2,
//             repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
//             ease: "easeInOut",
//           }}
//         />

//         {/* Main Logo */}
//         <motion.div className="relative w-full h-full">
//           <svg viewBox="0 0 120 120" className="w-full h-full">
//             {/* Flowing Ribbon 1 */}
//             <motion.path
//               d="M20 30 Q40 10, 60 30 Q80 50, 100 30 Q90 60, 70 70 Q50 80, 30 70 Q10 50, 20 30"
//               fill="url(#ribbon1)"
//               animate={{
//                 d: isHovered
//                   ? [
//                       "M20 30 Q40 10, 60 30 Q80 50, 100 30 Q90 60, 70 70 Q50 80, 30 70 Q10 50, 20 30",
//                       "M25 35 Q45 15, 65 35 Q85 55, 105 35 Q95 65, 75 75 Q55 85, 35 75 Q15 55, 25 35",
//                       "M20 30 Q40 10, 60 30 Q80 50, 100 30 Q90 60, 70 70 Q50 80, 30 70 Q10 50, 20 30",
//                     ]
//                   : "M20 30 Q40 10, 60 30 Q80 50, 100 30 Q90 60, 70 70 Q50 80, 30 70 Q10 50, 20 30",
//               }}
//               transition={{
//                 duration: 3,
//                 repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
//                 ease: "easeInOut",
//               }}
//             />

//             {/* Flowing Ribbon 2 */}
//             <motion.path
//               d="M30 90 Q50 70, 70 90 Q90 110, 110 90 Q100 60, 80 50 Q60 40, 40 50 Q20 60, 30 90"
//               fill="url(#ribbon2)"
//               animate={{
//                 d: isHovered
//                   ? [
//                       "M30 90 Q50 70, 70 90 Q90 110, 110 90 Q100 60, 80 50 Q60 40, 40 50 Q20 60, 30 90",
//                       "M35 85 Q55 65, 75 85 Q95 105, 115 85 Q105 55, 85 45 Q65 35, 45 45 Q25 55, 35 85",
//                       "M30 90 Q50 70, 70 90 Q90 110, 110 90 Q100 60, 80 50 Q60 40, 40 50 Q20 60, 30 90",
//                     ]
//                   : "M30 90 Q50 70, 70 90 Q90 110, 110 90 Q100 60, 80 50 Q60 40, 40 50 Q20 60, 30 90",
//               }}
//               transition={{
//                 duration: 3,
//                 delay: 0.5,
//                 repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
//                 ease: "easeInOut",
//               }}
//             />

//             {/* Interlocking Ring 1 */}
//             <motion.path
//               d="M60 20 Q80 20, 90 40 Q90 60, 70 70 Q50 70, 40 50 Q40 30, 60 20"
//               fill="none"
//               stroke="url(#ring1)"
//               strokeWidth="3"
//               strokeLinecap="round"
//               animate={{
//                 rotate: isHovered ? [0, 360] : [0, 180, 0],
//                 strokeWidth: isHovered ? [3, 4, 3] : 3,
//               }}
//               transition={{
//                 duration: isHovered ? 8 : 12,
//                 repeat: Number.POSITIVE_INFINITY,
//                 ease: "linear",
//               }}
//               style={{ transformOrigin: "center" }}
//             />

//             {/* Interlocking Ring 2 */}
//             <motion.path
//               d="M60 100 Q40 100, 30 80 Q30 60, 50 50 Q70 50, 80 70 Q80 90, 60 100"
//               fill="none"
//               stroke="url(#ring2)"
//               strokeWidth="3"
//               strokeLinecap="round"
//               animate={{
//                 rotate: isHovered ? [0, -360] : [0, -180, 0],
//                 strokeWidth: isHovered ? [3, 4, 3] : 3,
//               }}
//               transition={{
//                 duration: isHovered ? 8 : 12,
//                 repeat: Number.POSITIVE_INFINITY,
//                 ease: "linear",
//               }}
//               style={{ transformOrigin: "center" }}
//             />

//             {/* Central Flow Element */}
//             <motion.ellipse
//               cx="60"
//               cy="60"
//               rx="15"
//               ry="8"
//               fill="url(#centerFlow)"
//               animate={{
//                 rx: isHovered ? [15, 18, 15] : 15,
//                 ry: isHovered ? [8, 12, 8] : 8,
//                 rotate: [0, 360],
//               }}
//               transition={{
//                 duration: 6,
//                 repeat: Number.POSITIVE_INFINITY,
//                 ease: "easeInOut",
//               }}
//               style={{ transformOrigin: "center" }}
//             />

//             {/* Flowing Lines */}
//             {[0, 1, 2].map((i) => (
//               <motion.path
//                 key={i}
//                 d={`M${20 + i * 20} 60 Q${40 + i * 20} ${40 + i * 10}, ${60 + i * 20} 60 Q${80 + i * 20} ${80 - i * 10}, ${100 + i * 20} 60`}
//                 fill="none"
//                 stroke="url(#flowLine)"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//                 opacity="0.6"
//                 animate={{
//                   pathLength: isHovered ? [0, 1, 0] : 1,
//                   opacity: isHovered ? [0.3, 0.8, 0.3] : 0.6,
//                 }}
//                 transition={{
//                   duration: 2,
//                   delay: i * 0.3,
//                   repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
//                   ease: "easeInOut",
//                 }}
//               />
//             ))}

//             {/* Energy Dots */}
//             {[0, 1, 2, 3, 4].map((i) => {
//               const angle = i * 72 * (Math.PI / 180)
//               const radius = 25
//               return (
//                 <motion.circle
//                   key={i}
//                   cx={60 + radius * Math.cos(angle)}
//                   cy={60 + radius * Math.sin(angle)}
//                   r="2"
//                   fill="url(#energyDot)"
//                   animate={{
//                     cx: [60 + radius * Math.cos(angle), 60 + radius * Math.cos(angle + Math.PI * 2)],
//                     cy: [60 + radius * Math.sin(angle), 60 + radius * Math.sin(angle + Math.PI * 2)],
//                     r: isHovered ? [2, 3, 2] : 2,
//                     opacity: isHovered ? [0.7, 1, 0.7] : 0.8,
//                   }}
//                   transition={{
//                     duration: 4 + i,
//                     repeat: Number.POSITIVE_INFINITY,
//                     ease: "linear",
//                   }}
//                 />
//               )
//             })}

//             {/* Gradients - Updated to Cyan/Blue/Purple */}
//             <defs>
//               <linearGradient id="ribbon1" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
//                 <stop offset="50%" stopColor="#2563eb" stopOpacity="0.9" />
//                 <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7" />
//               </linearGradient>

//               <linearGradient id="ribbon2" x1="100%" y1="100%" x2="0%" y2="0%">
//                 <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
//                 <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
//                 <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.7" />
//               </linearGradient>

//               <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#2563eb" />
//                 <stop offset="100%" stopColor="#7c3aed" />
//               </linearGradient>

//               <linearGradient id="ring2" x1="100%" y1="100%" x2="0%" y2="0%">
//                 <stop offset="0%" stopColor="#06b6d4" />
//                 <stop offset="100%" stopColor="#3b82f6" />
//               </linearGradient>

//               <radialGradient id="centerFlow" cx="50%" cy="50%" r="50%">
//                 <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
//                 <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
//               </radialGradient>

//               <linearGradient id="flowLine" x1="0%" y1="0%" x2="100%" y2="0%">
//                 <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
//                 <stop offset="50%" stopColor="#2563eb" stopOpacity="0.8" />
//                 <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
//               </linearGradient>

//               <radialGradient id="energyDot" cx="50%" cy="50%" r="50%">
//                 <stop offset="0%" stopColor="#ffffff" />
//                 <stop offset="100%" stopColor="#3b82f6" />
//               </radialGradient>
//             </defs>
//           </svg>
//         </motion.div>

//         {/* Ambient Light Effect */}
//         <motion.div
//           className="absolute inset-0 rounded-2xl"
//           style={{
//             background: "radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, transparent 70%)",
//           }}
//           animate={{
//             opacity: isHovered ? [0.3, 0.6, 0.3] : 0.2,
//             scale: isHovered ? [1, 1.1, 1] : 1,
//           }}
//           transition={{
//             duration: 2,
//             repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
//             ease: "easeInOut",
//           }}
//         />
//       </div>

//       {/* Company Name */}
//       <div className="flex flex-col">
//         <motion.span 
//           className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text" 
//           animate={{ 
//             backgroundPosition: ["0%", "100%", "0%"],
//           }} 
//           transition={{ 
//             duration: 3, 
//             repeat: Number.POSITIVE_INFINITY, 
//             repeatType: "reverse",
//           }} 
//         > 
//           CodeConnect 
//         </motion.span>
//       </div>

//       {/* Hover Glow Effect */}
//       <motion.div
//         className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5"
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{
//           opacity: isHovered ? 1 : 0,
//           scale: isHovered ? 1 : 0.9,
//         }}
//         transition={{
//           duration: 0.3,
//           ease: "easeOut",
//         }}
//       />
//     </motion.a>
//   )
// }



export const NavbarLogo = ({ visible }: { visible?: boolean }) => {
  return (
    <motion.a
      href="#"
      className="flex items-center gap-3 group cursor-pointer ml-2"
      animate={{
        scale: visible ? 0.9 : 1,
      }}
      whileHover={{ 
        scale: visible ? 0.95 : 1.05,
      }}
      whileTap={{ 
        scale: visible ? 0.88 : 0.98,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8
      }}
    >
      <div className="relative w-9 h-9">
        {/* Glow effect background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Main rotating hexagon */}
        <motion.div
          className="absolute inset-0 z-10"
          animate={{
            rotate: [0, 360],
          }}
          whileHover={{
            rotate: [0, 360],
            transition: {
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <motion.svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path 
              d="M17.5 3.5L22 12l-4.5 8.5h-11L2 12l4.5-8.5h11z"
              whileHover={{
                strokeWidth: "2",
              }}
              transition={{ 
                strokeWidth: { duration: 0.2 }
              }}
            />
          </motion.svg>
        </motion.div>

        {/* Subtle pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-400/30"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
            delay: 0.5,
          }}
        />
      </div>

      <motion.div className="relative overflow-hidden">
        <motion.span
          className="block text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-[length:200%_100%] text-transparent bg-clip-text"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            opacity: visible ? 0.95 : 1,
          }}
          whileHover={{
            scale: 1.02,
          }}
          transition={{
            backgroundPosition: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 },
          }}
        >
          CodeConnect
        </motion.span>
      </motion.div>
    </motion.a>
  );
};

type NavbarButtonProps = {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & Omit<React.ComponentPropsWithoutRef<"a">, "children"> &
  Omit<React.ComponentPropsWithoutRef<"button">, "children">;

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: NavbarButtonProps) => {
  const baseStyles =
    "px-4 py-2 rounded-lg text-sm font-medium relative cursor-pointer transition-all duration-200 inline-block text-center";

  const variantStyles = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25 hover:scale-105",
    secondary: "bg-transparent text-white border border-gray-600 hover:border-cyan-400 hover:text-cyan-400",
    dark: "bg-gray-800 text-white shadow-lg hover:bg-gray-700",
    gradient: "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg hover:from-blue-600 hover:to-blue-800",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {React.createElement(
        Tag,
        {
          ...(href ? { href } : {}),
          className: cn(baseStyles, variantStyles[variant], className),
          ...props,
        },
        children
      )}
    </motion.div>
  );
}