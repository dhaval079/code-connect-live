import { useScroll, useTransform, useSpring } from "framer-motion"
import { type ReactNode } from "react"
import { Ease } from "gsap"
import { motion, useReducedMotion } from "framer-motion"
import { CheckCircle2, Code, Hexagon, LucideIcon, Users, Zap } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useAnimation } from "framer-motion"
import { HTMLMotionProps } from "framer-motion";
import { HoverCard } from "./HoverCard"

export default function WhyCodeConnect() { 
    return (
        <motion.section id="why-codeconnect" className="mt-32">
        <h2 className="text-4xl font-bold text-center mb-16">Why CodeConnect?</h2>
        <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
          <p className="text-lg text-slate-300 mb-6">
            CodeConnect is built for developers, by developers. Whether you're working remotely, teaching, or
            conducting interviews, our platform enables smoother, faster, and more interactive coding sessions. We
            remove the friction from pair programming by ensuring low latency, secure connections, and real-time
            updates, making remote collaboration as effective as in-person coding.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HoverCard
              icon={Zap}
              title="Zero Latency"
              description="Built with WebRTC for ultra-fast peer-to-peer connections."
            />
            <HoverCard
              icon={Users}
              title="Seamless Collaboration"
              description="Join a room instantly and start coding together."
            />
            <HoverCard
              icon={CheckCircle2}
              title="Secure & Private"
              description="All rooms are encrypted to ensure data privacy."
            />
            <HoverCard
              icon={Code}
              title="Developer-Friendly"
              description="Powered by modern web technologies like React, WebRTC, and CodeMirror."
            />
          </div>
        </div>
      </motion.section>
    );
}