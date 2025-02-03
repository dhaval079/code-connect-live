"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion"
import { v4 as uuidV4 } from "uuid"
import { toast } from "sonner"
import { Hexagon, Sparkles, Code, Terminal, Zap, Globe, Users, Laptop, Server, GitBranch, Boxes } from "lucide-react"
import { cn } from "@/lib/utils"
import AnimatedBackground from "@/components/AnimatedBackground"
import Testimonials from "@/components/Testimonials"
import Pricing from "@/components/Pricing"


const GlowingButton = ({ children, className, onClick, disabled, ...props }) => {
  const buttonRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: any) => {
    console.log("Button clicked") // Debug log
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium",
        "shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => !disabled && setIsHovered(false)}
      {...props}
    >
      {children}
    </motion.button>
  )
}

const FuturisticInput = ({ label, icon: Icon, ...props }: { label: string; icon: any; [key: string]: any }) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-medium text-cyan-300" htmlFor={props.id}>
        {label}
      </label>
      <div className="relative group">
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-slate-800/50 border-2 border-cyan-500/20 text-white placeholder:text-slate-500 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300"
        />
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 w-5 h-5" />
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-cyan-500/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const FloatingHexagon = ({ delay = 0 }) => (
  <motion.div
    className="absolute"
    style={{
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.1, 0.3, 0.1],
      scale: [1, 1.2, 1],
      rotate: [0, 360],
    }}
    transition={{
      duration: 20,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    }}
  >
    <Hexagon className="w-8 h-8 text-cyan-500/10" />
  </motion.div>
)

const StatsCard = ({
  icon: Icon,
  title,
  value,
}: { icon: React.ElementType; title: string; value: string | number }) => {
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) {
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.3, times: [0, 0.5, 1] },
      })
    }
  }, [isHovered, controls])

  return (
    <motion.div
      className="bg-slate-800/50 rounded-xl p-4 flex items-center space-x-4 cursor-pointer"
      whileHover={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div className="bg-cyan-500/20 p-2 rounded-lg" animate={controls}>
        <Icon className="w-6 h-6 text-cyan-400" />
      </motion.div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <motion.p
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  )
}

const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(150)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-500/30 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            z: [0, 50, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

const CodeBlock = () => {
  const codeLines = [
    "const room = new CodeRoom();",
    "room.onJoin((user) => {",
    "  console.log(`${user} joined`);",
    "});",
    "",
    "room.onMessage((msg) => {",
    "  collaborators.push(msg);",
    "});",
  ]

  return (
    <motion.div
      className="bg-slate-800/70 rounded-lg p-4 font-mono text-sm text-cyan-300 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      {codeLines.map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          {line}
        </motion.div>
      ))}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  )
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: { icon: React.ElementType; title: string; description: string | number }) => {
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) {
      controls.start({
        rotate: [0, 10, -10, 0],
        transition: { duration: 0.5 },
      })
    }
  }, [isHovered, controls])

  return (
    <motion.div
      className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer"
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div className="bg-cyan-500/20 p-3 rounded-full mb-4" animate={controls}>
        <Icon className="w-8 h-8 text-cyan-400" />
      </motion.div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </motion.div>
  )
}

const AnimatedLogo = () => (
  <motion.div
    className="relative w-12 h-12"
    animate={{
      rotate: [0, 360],
    }}
    transition={{
      duration: 20,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    }}
  >
    <motion.div
      className="absolute inset-0"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    >
      <Hexagon className="w-full h-full text-cyan-400" />
    </motion.div>
    <motion.div
      className="absolute inset-0"
      animate={{
        rotate: [0, -360],
      }}
      transition={{
        duration: 40,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      <Hexagon className="w-full h-full text-blue-400 opacity-50" />
    </motion.div>
  </motion.div>
)

const PulsingCircle = () => (
  <div className="relative">
    <motion.div
      className="absolute inset-0 bg-cyan-500 rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.5, 0, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      }}
    />
    <div className="relative  bg-cyan-500 w-3 h-3 rounded-full" />
  </div>
)

export default function CodeConnect() {
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef(null)
  const [isMounted, setIsMounted] = useState(false)
  const isInView = useInView(formRef, { once: true })
  // const router = useRouter();

  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // In your home page (page.tsx)
  const handleJoin = async () => {
    if (!roomId || !username) {
      toast.error("Please enter both room ID and username")
      return
    }

    try {
      setIsLoading(true)
      // Use URL parameters for both roomId and username
      const baseUrl = window.location.origin
      window.location.href = `${baseUrl}/editor/${roomId}?username=${encodeURIComponent(username)}`
    } catch (error) {
      console.error("Join error:", error)
      toast.error("Failed to join room")
      setIsLoading(false)
    }
  }

  // When creating a new room:
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

  // Don't render until mounted to prevent hydration issues
  // if (!isMounted) {
  //   return (
  //     <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
  //       <div className="container mx-auto px-4 py-8 relative z-10">
  //         {/* Skeleton loading state */}
  //         <div className="animate-pulse">
  //           <div className="h-8 bg-slate-800 rounded w-48 mb-16"></div>
  //           <div className="space-y-6">
  //             <div className="h-40 bg-slate-800 rounded"></div>
  //             <div className="h-40 bg-slate-800 rounded"></div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Don't render until mounted to prevent hydration issues
  // if (!isMounted) return null;
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      <ParticleField />
      <AnimatedBackground />
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <FloatingHexagon key={i} delay={i * 0.5} />
        ))}
      </div>
      <div className=" z-10">
        <div className="container mx-auto px-4 py-8 relative">
          <motion.header
            className="flex items-center justify-between mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <AnimatedLogo />
              <motion.span
                className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                CodeConnect
              </motion.span>
            </motion.div>
            <div className="flex items-center space-x-6">
              {/* <LanguageSelector /> */}
              <motion.nav
                className="flex space-x-6"
                variants={{
                  hidden: { opacity: 0, y: -20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {["Features", "Pricing", "Contact"].map((item) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="text-slate-300 hover:text-white transition-colors relative"
                    variants={{
                      hidden: { opacity: 0, y: -20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {item}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ))}
              </motion.nav>
            </div>
          </motion.header>

          <main className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.h1
                className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Collaborate in Real-Time <br />
                with{" "}
                <motion.span
                  className="bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text"
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  CodeConnect
                </motion.span>
              </motion.h1>
              <motion.p
                className="text-xl text-slate-300 mb-8"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Join a room, share your code, and build amazing projects together. Experience seamless collaboration
                like never before.
              </motion.p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <StatsCard icon={Globe} title="Active Rooms" value="1,234" />
                <StatsCard icon={Users} title="Connected Devs" value="5,678" />
              </div>
              <CodeBlock />
            </motion.div>

            <motion.div
              ref={formRef}
              className="lg:w-1/2 w-full max-w-md"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-cyan-500/10"
                whileHover={{ boxShadow: "0 0 50px rgba(6, 182, 212, 0.3)" }}
              >
                <h2 className="text-2xl font-bold mb-6 text-center">Join a Room</h2>
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
                  <GlowingButton className="w-full" onClick={handleJoin} disabled={isLoading}>
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          className="flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Join Room
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlowingButton>
                </div>
                <p className="text-center text-sm text-slate-400 mt-6">
                  Don&apos;t have an invite?{" "}
                  <button
                    onClick={createNewRoom}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
                  >
                    Create New Room
                  </button>
                </p>
              </motion.div>
            </motion.div>
          </main>
        </div>
        <motion.section
          className="mt-24"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Laptop}
              title="Real-time Collaboration"
              description="Code together in real-time with multiple developers, just like you're in the same room."
            />
            <FeatureCard
              icon={Server}
              title="Secure Rooms"
              description="Create private, secure rooms for your team to collaborate without worries."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Sync"
              description="Changes sync instantly across all connected devices, ensuring everyone's always on the same page."
            />
          </div>
        </motion.section>

        <motion.section
          className="mt-24"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
            {[
              { icon: GitBranch, title: "Create or Join", description: "Start a new room or join an existing one" },
              { icon: Users, title: "Collaborate", description: "Work together in real-time with your team" },
              { icon: Boxes, title: "Build", description: "Create amazing projects faster than ever" },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-cyan-500 rounded-full opacity-20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  />
                  <div className="relative bg-slate-800 p-4 rounded-full">
                    <step.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <footer className="mt-24 text-center text-sm text-slate-400">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            © 2023 CodeConnect. All rights reserved.
          </motion.p>
          <motion.p
            className="mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Built with passion by{" "}
            <a
              href="#"
              className="text-cyan-400 hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
            >
              dhaval079
            </a>
          </motion.p>
        </footer>
      </div>
    </div>
  )
}

