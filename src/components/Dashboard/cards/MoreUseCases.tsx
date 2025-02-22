"use client"

import { useRef, useEffect } from 'react'
import { motion, useAnimation, useInView, useScroll, useTransform } from "framer-motion"
import { NeonGlow } from '../animations/NeonGlow'
import { HoverCard } from './HoverCard'

const useCases = [
    {
        title: "Remote Pair Programming",
        description: "Work with your teammates on live coding projects in real-time.",
    },
    {
        title: "Live Coding Interviews",
        description:
            "Assess candidates with actual coding tasks, track their thought process, and communicate via chat.",
    },
    {
        title: "Coding Bootcamps & Education",
        description:
            "Engage students by coding together, explaining concepts visually, and sharing snippets instantly.",
    },
    {
        title: "Hackathons & Team Challenges",
        description: "Organize competitive coding sessions where teams can collaborate dynamically.",
    },
    {
        title: "Freelancers & Consultants",
        description:
            "Work with clients on live projects, debug issues, and showcase solutions interactively.",
    },
]

export default function MoreUseCases() {
    const controls = useAnimation()
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    const { scrollYProgress } = useScroll()
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "5%"])

    useEffect(() => {
        if (inView) {
            controls.start("visible")
        }
    }, [controls, inView])

    const staggerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    }

    return (
        <motion.section 
            id="use-cases" 
            className="mt-32 relative overflow-hidden p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            ref={ref}
        >
            <motion.div 
                className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-10"
                style={{ y }}
            />
            <motion.h2 
                className="text-4xl font-bold text-center mb-16"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.span
                    initial={{ display: "inline-block" }}
                    animate={{ rotateX: [0, 90, 0] }}
                    transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                >
                    More Use Cases
                </motion.span>
            </motion.h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {useCases.map((useCase, index) => (
                    <motion.div
                        key={useCase.title}
                        className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6"
                        variants={staggerVariants}
                        initial="hidden"
                        animate={controls}
                        custom={index}
                        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <h3 className="text-2xl font-semibold mb-2">{useCase.title}</h3>
                        <p className="text-slate-300">{useCase.description}</p>
                    </motion.div>
                ))}
            </div>
            <motion.button
                className="fixed bottom-8 right-8 bg-slate-800/50 backdrop-blur-xl rounded-full p-3 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
            </motion.button>
        </motion.section>
    )
}