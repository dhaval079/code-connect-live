"use client";
import { useState, useRef, useEffect, lazy } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { v4 as uuidV4 } from "uuid"
import { toast } from "sonner"
import {
  Sparkles,
  Code,
  Terminal,
  Zap,
  Globe,
  Users,
  Laptop,
  Server,
  GitBranch,
  Boxes,
  LucideCircle,
  CircleFadingPlus,
} from "lucide-react"
import {
  FloatingHexagon,
  CodeBlock,
} from "@/components/Dashboard/Decorative"
import { HoverCard } from "@/components/Dashboard/cards/HoverCard"
import { StatsCard } from "@/components/Dashboard/cards/StatsCard"
import { GlowingButton } from "@/components/Dashboard/buttons/GlowingButton"
import { FuturisticInput } from "@/components/Dashboard/buttons/FuturisticInput"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import ScrollToTopButton from "@/components/Dashboard/ScrollToTop";

const RevealAnimation = dynamic(
  () => import('@/components/Dashboard/animations/RevealAnimation').then((mod) => mod.RevealAnimation),
);

const LoadingScreen = dynamic(() => import('@/components/Dashboard/LoadingScreen'), {
  ssr: false,
  loading: () => <div></div>,
});

const EnhancedCursor = dynamic(
  () => import('@/components/Dashboard/Cursor').then((mod) => mod.default),
  { ssr: false }
);

const WhyCodeConnect = dynamic(
  () => import('@/components/Dashboard/cards/WhyCodeConnect'),
  {
    loading: () => (
      <div className="w-full h-96 animate-pulse bg-gray-800/50 rounded-xl">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    ),
    ssr: true
  }
)

const CodeConnectSlider = lazy(() => import('@/components/Dashboard/Slider'));

const MoreUseCases = dynamic(
  () => import('@/components/Dashboard/cards/MoreUseCases'),
  {
    loading: () => (
      <div className="w-full h-64 animate-pulse bg-gray-800/50 rounded-xl">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    ),
    ssr: true
  }
)

const AnimatedBackground = dynamic(
  () => import("@/components/Dashboard/animations/AnimatedBackground").then(mod => mod.AnimatedBackground),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />
  }
);

const NeonGlow = dynamic(
  () => import('@/components/Dashboard/animations/NeonGlow').then(mod => mod.NeonGlow),
  {
    ssr: false,
    loading: () => null
  }
);

const FAQSection = dynamic(
  () => import('@/components/Dashboard/FaqSection'),
  {
    loading: () => (
      <div className="w-full h-96 animate-pulse bg-gray-800/50 rounded-xl">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    ),
    ssr: true
  }
)

export default function CodeConnect() {
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const formRef = useRef(null)
  const isInView = useInView(formRef, { once: true })

  useEffect(() => {
    console.log("Mounted");
    return () => console.log("Unmounted");
  }, []);

  const handleJoin = async () => {
    if (!roomId || !username) {
      toast.error("Please enter both room ID and username")
      return
    }

    try {
      setIsLoading(true)
      const baseUrl = window.location.origin
      window.location.href = `${baseUrl}/editor/${roomId}?username=${encodeURIComponent(username)}`
    } catch (error) {
      console.error("Join error:", error)
      toast.error("Failed to join room")
      setIsLoading(false)
    }
  }

  const createNewRoom = (e: any) => {
    e.preventDefault()
    const id = uuidV4()
    setRoomId(id)
    navigator.clipboard.writeText(id).then(() => {
      toast.success("Created a new room", {
        description: "Room ID copied to clipboard!",
      })
    })
  }

  const handleInputKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoin()
    }
  }

  return (
    <div className="relative w-full overflow-hidden">
      <LoadingScreen />
      <EnhancedCursor />
      
      {/* Main Content - starts after navbar */}
      <div className=""> {/* Increased padding to account for larger initial navbar */}
        {/* Remove PremiumParallax wrapper that's interfering with scroll detection */}
        <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-700 to-slate-800 text-white overflow-hidden">
          <div className="items-center justify-center text-center">
            <AnimatedBackground />
          </div>
          <NeonGlow />
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <FloatingHexagon key={i} delay={i * 0.3} />
            ))}
          </div>

            <div className="z-10 relative mt-20">
              <RevealAnimation>
                <div className="container mx-auto px-4 py-20">
                  <RevealAnimation
                    effect={["fade", "slide", "blur"]}
                    duration={0.8}
                    delay={0.2}
                  >
                    <main className="z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                      <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: -100 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
             <motion.h1
  className="
    text-4xl lg:text-5xl font-bold relative z-10 
    bg-clip-text text-transparent 
    bg-gradient-to-b from-neutral-200 to-neutral-500 
    font-sans
  "
  variants={{
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  }}
  initial="hidden"
  animate="visible"
  transition={{ duration: 0.8, delay: 0.3 }}
>
  Collaborate in Real-Time<br/>
  with{" "}
                         <motion.span
  className="bg-gradient-to-b from-cyan-400 to-blue-500 text-transparent bg-clip-text"
  style={{
    // top 50% cyan, bottom 50% blue
  }}
>
  CodeConnect
                          </motion.span>
                        </motion.h1>
                        <motion.p
                          className="text-lg my-8 text-neutral-400"
                          variants={{
                            hidden: { opacity: 0, y: 50 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          initial="hidden"
                          animate="visible"
                          transition={{ duration: 0.8, delay: 0.4 }}
                        >
                          Join a room, share your code, and build amazing projects together. Experience seamless collaboration
                          like never before.
                        </motion.p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <StatsCard icon={Globe} title="Active Rooms" value="1,346" capacity="2k" />
                          <StatsCard icon={Users} title="Connected Devs" value="258" capacity="10k" />
                        </div>
                        <CodeBlock />
                      </motion.div>
                      <motion.div
                        ref={formRef}
                        className="lg:w-1/2 w-full max-w-md"
                        initial={{ opacity: 0, x: 100 }}
                        animate={isInView ? {
                          opacity: 1,
                          x: 0,
                        } : {}}
                        transition={{
                          duration: 1.2,
                          delay: 0.4,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        <motion.div
                          className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl "
                          whileHover={{
                            boxShadow: "0 0 50px 0 rgba(6, 182, 212, 0.3)",
                            scale: 1.02,
                            transition: {
                              duration: 0.4,
                              ease: "easeOut"
                            }
                          }}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.8,
                            delay: 0.6,
                            ease: [0.34, 1.56, 0.64, 1]
                          }}
                        >
                          <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent 
    bg-gradient-to-b from-neutral-100 to-neutral-500 
    font-sans">Join a Room</h2>
                          <div className="space-y-6">
                            <FuturisticInput
                              label="Room ID"
                              id="room-id"
                              icon={Terminal}
                              value={roomId}
                              onChange={(e: any) => setRoomId(e.target.value)}
                              onKeyUp={handleInputKeyUp}
                              placeholder="Enter room ID"
                            />
                            <FuturisticInput
                              label="Username"
                              id="username"
                              icon={Users}
                              value={username}
                              onChange={(e: any) => setUsername(e.target.value)}
                              onKeyUp={handleInputKeyUp}
                              placeholder="Choose a username"
                            />
                            <GlowingButton
                              className="w-full"
                              onClick={async () => {
                                setIsLoading(true);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                handleJoin();
                              }}
                              disabled={isLoading}
                            >
                              <AnimatePresence mode="wait">
                                {isLoading ? (
                                  <motion.div
                                    key="loading"
                                    className="flex items-center justify-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                      duration: 0.4,
                                      ease: "easeOut"
                                    }}
                                  >
                                    <motion.div
                                      animate={{
                                        rotate: 360,
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "linear",
                                      }}
                                    >
                                      <Code className="w-5 h-5 mr-2" />
                                    </motion.div>
                                    Connecting...
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="join"
                                    className="flex items-center justify-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                      duration: 0.4,
                                      ease: "easeOut"
                                    }}
                                  >
                                    <CircleFadingPlus className="w-5 h-5 mr-2" />
                                    Join Room
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </GlowingButton>
                          </div>
                          <p className="text-center text-sm text-slate-400 mt-6">
                            Don&apos;t have an invite?{" "}
                            <motion.button
                              onClick={createNewRoom}
                              className="text-cyan-400 hover:text-cyan-300 transition-colors relative group"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeOut"
                              }}
                            >
                              Create New Room
                              <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-300 transition-all duration-500 ease-out group-hover:w-full" />
                            </motion.button>
                          </p>
                        </motion.div>
                      </motion.div>
                    </main>
                  </RevealAnimation>
                </div>
              </RevealAnimation>

              <RevealAnimation>
                <motion.section id="features" className="mt-32 px-6 justify-center items-center mx-auto">
                  <h2 className="text-4xl text-center mb-16 font-bold">Key Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    <HoverCard
                      icon={Laptop}
                      title="Real-time Collaboration"
                      description="Code together in real-time with multiple developers, just like you're in the same room."
                    />
                    <HoverCard
                      icon={Server}
                      title="Secure Rooms"
                      description="Create private, secure rooms for your team to collaborate without worries."
                    />
                    <HoverCard
                      icon={Zap}
                      title="Instant Sync"
                      description="Changes sync instantly across all connected devices, ensuring everyone's always on the same page."
                    />
                  </div>
                </motion.section>
              </RevealAnimation>

              <RevealAnimation>
                <motion.section id="how-it-works" className="mt-32">
                  <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
                  <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
                    {[
                      { icon: GitBranch, title: "Create or Join", description: "Start a new room or join an existing one" },
                      { icon: Users, title: "Collaborate", description: "Work together in real-time with your team" },
                      { icon: Boxes, title: "Build", description: "Create amazing projects faster than ever" },
                    ].map((step, index) => (
                      <motion.div
                        key={step.title}
                        className="flex flex-col items-center text-center"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                      >
                        <div className="relative">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20"
                            animate={{
                              scale: [1, 1.3, 0.8],
                              opacity: [0.2, 0.1, 0.1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "reverse",
                            }}
                          />
                          <div className="relative bg-slate-800 p-6 rounded-full">
                            <step.icon className="w-10 h-10 text-cyan-400" />
                          </div>
                        </div>
                        <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
                        <p className="mt-2 text-slate-400">{step.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              </RevealAnimation>

              <RevealAnimation>
                <WhyCodeConnect />
              </RevealAnimation>

              <RevealAnimation>
                <MoreUseCases />
              </RevealAnimation>

              <RevealAnimation>
                <FAQSection />
              </RevealAnimation>


              <RevealAnimation>
                <CodeConnectSlider />
              </RevealAnimation>

              <footer className="mt-32 mb-20 text-center text-sm text-slate-400">
                <p>© 2023 CodeConnect. All rights reserved.</p>
                <p className="mt-2">
                  Built with love by{" "}
                  <a
                    href={"http://github.com/dhaval079"}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors relative group inline-block"
                  >
                    @Dhaval Rupapara
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-300 transition-all duration-300 ease-out group-hover:w-full" />
                  </a>
                </p>
              </footer>
            </div>
          </div>
        </div>
        <ScrollToTopButton />
      </div>
  )
}
