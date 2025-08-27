"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import React from "react";
import { motion } from "motion/react";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 blur-3xl opacity-20">
              <div className="w-full h-full opacity-80 bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-400" />
              {/* <div className="w-full h-full bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-400" /> */}
            </div>
            
            {/* Main title content */}
            <div className="relative z-10">
              <motion.h1 
                className="text-3xl md:text-4xl font-semibold mb-6 md:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="text-slate-300">
                  Unleash the power of
                </span>
                <br />
                <motion.span 
                  className="relative inline-block text-4xl md:text-[5rem] lg:text-[6rem] font-bold mt-2 leading-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                >
                  {/* Primary gradient text */}
                  <span 
                    className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
                    style={{
                      filter: "drop-shadow(0 0 30px rgba(6, 182, 212, 0.5))",
                    }}
                  >
                    Pair Programming
                  </span>
                  
                  {/* Glowing text shadow */}
                  <span 
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent blur-sm opacity-40"
                    aria-hidden="true"
                  >
                    Pair Programming
                  </span>
                  
                  {/* Animated underline */}
                  {/* <motion.div
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    style={{
                      boxShadow: "0 0 20px rgba(6, 182, 212, 0.6)",
                    }}
                  /> */}
                </motion.span>
              </motion.h1>
            </div>
          </div>
        }
      >
        <div className="relative group">
          {/* Subtle glow around the image */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 via-blue-500/10 to-cyan-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src={`/editorpage.png`}
            alt="Advanced scroll animation demo showcasing smooth motion effects"
            height={920}
            width={1400}
            className="relative mx-auto rounded-2xl object-cover h-full border border-cyan-500/20 shadow-2xl"
            draggable={false}
            style={{
              boxShadow: `
                0 4px 32px rgba(6, 182, 212, 0.1),
                0 16px 64px rgba(6, 182, 212, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
          />
          
          {/* Corner accent lights */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full opacity-60" 
               style={{ boxShadow: "0 0 15px rgba(6, 182, 212, 0.8)" }} />
          <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full opacity-60"
               style={{ boxShadow: "0 0 15px rgba(59, 130, 246, 0.8)" }} />
        </div>
      </ContainerScroll>
    </div>
  );
}