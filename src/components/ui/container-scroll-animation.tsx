"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[90rem] flex -mt-40 items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-30 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
      }}
      className="max-w-4xl -mt-10 mx-auto h-[30rem] md:h-[35rem] w-full relative group z-50"
    >
      {/* Enhanced glowing border effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-[32px] blur-sm group-hover:blur-md transition-all duration-500 opacity-60" />
      
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 rounded-[31px] opacity-40" />

      <div
        className="relative h-full w-full bg-slate-900/95 backdrop-blur-xl rounded-[30px] overflow-hidden border border-cyan-500/30 p-2 md:p-6"
        style={{
          boxShadow: `
            0 0 0 1px rgba(6, 182, 212, 0.3),
            0 4px 32px rgba(6, 182, 212, 0.2),
            0 16px 64px rgba(6, 182, 212, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-[30px]" />
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/15 to-transparent rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-400/15 to-transparent rounded-tl-full" />
        
        {/* Content container */}
        <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-950/50 backdrop-blur-sm border border-cyan-500/10">
          {children}
        </div>

        {/* Animated border lines */}
        <div className="absolute inset-0 rounded-[30px] overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-blue-400 to-transparent"
            animate={{
              x: ["100%", "-100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 1.5,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};