"use client"
import { useState, useRef, useEffect, useMemo, Suspense } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { toast, Toaster } from "sonner"
import { useParams, useSearchParams } from "next/navigation"
import { ACTIONS } from "@/lib/actions"
import {
  LogOut,
  Play,
  ChevronRight,
  ChevronLeft,
  Maximize,
  Minimize,
  SunMoon,
  Moon,
  Settings,
  Save,
  Download,
  Share,
  Upload,
  Terminal,
  Bot,
  Sparkles,
  MessageSquare,
  Edit,
  PencilRuler,
  Twitch,
  BugPlay,
  NotebookPen,
  SquarePen,
  MessageSquareMore,
} from "lucide-react"
import { useSocket } from "@/providers/socketProvider"
import dynamic from "next/dynamic"
import Whiteboard from "@/components/Editor/WhiteBoard"
import ConsoleOutput from "@/components/Editor/ConsoleOutput"
const Button = dynamic(
  () => import("@/components/ui/button").then((mod) => mod.Button)
);
const Slider = dynamic(
  () => import("@/components/ui/slider").then((mod) => mod.Slider)
);
const Select = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.Select)
);
const SelectTrigger = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectTrigger)
);
const SelectValue = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectValue)
);
const SelectContent = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectContent)
);
const SelectItem = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectItem)
);
const ScrollArea = dynamic(
  () =>
    import("@/components/ui/scroll-area").then((mod) => mod.ScrollArea)
);
const Dialog = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.Dialog)
);
const DialogContent = dynamic(
  () =>
    import("@/components/ui/dialog").then((mod) => mod.DialogContent)
);
const DialogHeader = dynamic(
  () =>
    import("@/components/ui/dialog").then((mod) => mod.DialogHeader)
);
const DialogTitle = dynamic(
  () =>
    import("@/components/ui/dialog").then((mod) => mod.DialogTitle)
);
const DialogDescription = dynamic(
  () =>
    import("@/components/ui/dialog").then((mod) => mod.DialogDescription)
);
const Input = dynamic(
  () => import("@/components/ui/input").then((mod) => mod.Input)
);
const Client = dynamic(
  () => import("@/components/Editor/Client").then((mod) => mod.Client),
  { ssr: false }
);
const Chat = dynamic(
  () => import("@/components/Editor/Chat").then((mod) => mod.Chat),
  { ssr: false }
);
const Skeleton = dynamic(
  () => import("@/components/ui/skeleton").then((mod) => mod.Skeleton)
);
// const ConsoleOutput = dynamic(
//   () =>
//     import("@/components/Editor/ConsoleOutput").then((mod) => mod.default),
//   // { ssr: false }
// );
const AiAssistant = dynamic(
  () =>
    import("@/components/Editor/AiAssistant").then((mod) => mod.default),
  { ssr: false }
);
const WaveLoader = dynamic(
  () =>
    import("@/components/Dashboard/animations/WaveLoader").then((mod) => mod.default),
  { ssr: false }
);
const MonacoEditor = dynamic(() => import("@/components/Editor/monaco-editor"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

// const Whiteboard = dynamic(
//   () => import("@/components/Editor/Whiteboard").then((mod) => mod.default),
//   { ssr: false }
// );

function EditorPageContent() {
  // Socket and Client State
  const socketRef = useRef<any>(null)
  const [clients, setClients] = useState<{ socketId: string; username: string }[]>([])
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params?.roomid
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "failed">("connecting")
  const username = searchParams.get("username")
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [consoleHeight, setConsoleHeight] = useState(240)
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [showConnectingSplash, setShowConnectingSplash] = useState(true);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);


  // Editor State
  const [fontSize, setFontSize] = useState(14)
  const [language, setLanguage] = useState("javascript")
  const [theme, setTheme] = useState("vs-dark")

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isOutputPanelOpen, setIsOutputPanelOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState("code")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)

  // Refs
  const editorRef = useRef<any>(null)
  const outputRef = useRef(null)
  const controls = useAnimation()
  const [code, setCode] =
    useState(`//Start Coding Here...
  // Function to print a pyramid pattern
  function printPyramid(height) {
      let pattern = '';
      
      // Loop through each row
      for (let i = 1; i <= height; i++) {
          // Add spaces before stars
          let spaces = ' '.repeat(height - i);
          
          // Add stars for this row
          let stars = '*'.repeat(2 * i - 1);
          
          // Combine spaces and stars for this row
          pattern += spaces + stars + '\\n';
      }
      
      return pattern;
  }
  console.log(printPyramid(5));`);

  const [typingUsers, setTypingUsers] = useState(new Set())
  const [output, setOutput] = useState("")
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: "log" | "error" | "info"; content: string }>>([])
  const lastTypingEventRef = useRef<number>(0)
  const TYPING_INTERVAL = 1000 // Minimum time between typing events in ms
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnectingSplash(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Memoized variants
  const pageVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut",
          staggerChildren: 0.1,
        },
      },
    }),
    [],
  )

  const itemVariants = useMemo(
    () => ({
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      },
    }),
    [],
  )

  // Effects
  useEffect(() => {
    // Trigger initial animation when the page loads
    setIsPageLoaded(true)
    controls.start("visible")
  }, [controls])

  useEffect(() => {
    if (!socket || !isConnected) return

    if (!username || !roomId) {
      toast.error("Missing room ID or username")
      window.location.href = "/"
      return
    }

    console.log("Joining room with:", { roomId, username: username })

    socket.emit(ACTIONS.JOIN, {
      id: roomId,
      user: username,
    })

    // Handle join response
    socket.on(ACTIONS.JOINED, ({ clients, user, socketId }) => {
      console.log("JOINED event received:", { clients, user, socketId })
      toast.success(`${user} joined the room`)
      setClients(clients)
      setConnectionStatus("connected")
      setIsLoading(false)
    })

    socket.on(ACTIONS.DISCONNECTED, ({ socketId, user, clients: updatedClients }) => {
      console.log("DISCONNECTED event received:", { socketId, user, clients: updatedClients })
      setClients(updatedClients)
      toast.info(`${user} left the room`)
    })

    const handleBeforeUnload = () => {
      if (socket && roomId) {
        socket.emit(ACTIONS.LEAVE, { roomId })
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      setCode(code)
    })

    socket.on(ACTIONS.SYNC_CODE, ({ code }) => {
      setCode(code)
    })

    socket.on(ACTIONS.COMPILE_RESULT, ({ result, error }) => {
      if (error) {
        setOutput(error)
        setConsoleOutput((prev) => [...prev, { type: "error", content: error }])
      } else {
        setOutput(result)
        setConsoleOutput((prev) => [...prev, { type: "log", content: result }])
      }
    })

    socket.on("error", handleSocketError)

    return () => {
      socket.off(ACTIONS.JOINED)
      socket.off(ACTIONS.DISCONNECTED)
      socket.off(ACTIONS.CODE_CHANGE)
      socket.off(ACTIONS.SYNC_CODE)
      handleBeforeUnload()
      window.removeEventListener("beforeunload", handleBeforeUnload)
      socket.off(ACTIONS.COMPILE_RESULT)
      socket.off("error")
    }
  }, [socket, isConnected, roomId, username])

  useEffect(() => {
    if (!socket || !isConnected) return

    // Handle typing events
    const handleTyping = ({ username }: { username: string }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.add(username)
        return newSet
      })

      // Clear existing timeout for this user if it exists
      if (typingTimeoutRef.current[username]) {
        clearTimeout(typingTimeoutRef.current[username])
      }

      // Set new timeout
      typingTimeoutRef.current[username] = setTimeout(() => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          newSet.delete(username)
          return newSet
        })
        delete typingTimeoutRef.current[username]
      }, 1500) // Slightly longer than the server timeout
    }

    const handleStopTyping = ({ username }: { username: string }) => {
      // Clear timeout if it exists
      if (typingTimeoutRef.current[username]) {
        clearTimeout(typingTimeoutRef.current[username])
        delete typingTimeoutRef.current[username]
      }

      setTypingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(username)
        return newSet
      })
    }

    socket.on(ACTIONS.TYPING, handleTyping)
    socket.on(ACTIONS.STOP_TYPING, handleStopTyping)

    // Cleanup
    return () => {
      socket.off(ACTIONS.TYPING)
      socket.off(ACTIONS.STOP_TYPING)
      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(clearTimeout)
      typingTimeoutRef.current = {}
    }
  }, [socket, isConnected])

  // Handlers
  const clearConsole = () => setConsoleOutput([])

  const handleCodeChange = (value: string) => {
    setCode(value)
    socket?.emit(ACTIONS.CODE_CHANGE, { roomId, code: value })

    if (!username) return

    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      Object.values(typingTimeoutRef.current).forEach(clearTimeout)
    }

    // Always emit typing event for the current user
    socket?.emit(ACTIONS.TYPING, {
      roomId,
      username,
    })

    // Set timeout to clear typing status
    if (!username) return
    typingTimeoutRef.current[username] = setTimeout(() => {
      socket?.emit(ACTIONS.STOP_TYPING, {
        roomId,
        username,
      })
    }, 1000)
  }

  const handleRunCode = () => {
    try {
      socket?.emit(ACTIONS.COMPILE, { roomId, code, language })
    } catch (err: any) {
      setOutput(`Error: ${err.message}`)
    }
  }

  const handleSocketError = (err: any) => {
    console.error("Socket error:", err)
    toast.error(err.message || "Failed to connect to server. Please try again.")
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId as string)
      toast.success("Room ID copied to clipboard")
    } catch (err: any) {
      toast.error("Failed to copy room ID")
    }
  }

  const leaveRoom = () => {
    setIsLeaveDialogOpen(true)
  }

  const confirmLeaveRoom = () => {
    try {
      if (socket) {
        socket.emit(ACTIONS.LEAVE, { roomId })
        socket.disconnect()
      }
      window.location.href = "/"
    } catch (error) {
      console.error("Error leaving room:", error)
      toast.error("Failed to leave room")
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    setTheme(isDarkMode ? "vs-light" : "vs-dark");

    // Update monaco editor theme
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: isDarkMode ? "vs-light" : "vs-dark"
      });
    }

    // Update document theme class for Tailwind
    document.documentElement.classList.toggle("dark");
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  // Render functions
  const renderSkeleton = () => (
    <div className="flex flex-col space-y-4 animate-pulse">
      <Skeleton className="h-12 w-full" />
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    </div>
  )

  if (showConnectingSplash) {
    return (
      <div className="flex h-screen w-full  overflow-hidden items-center justify-center bg-black/100">
        <motion.div
          className="flex flex-col items-center space-y-8 p-12 backdrop-blur-lg rounded-3xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          variants={pageVariants}
        >
          <motion.h2
            className="text-4xl font-bold text-white text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Connecting to session
          </motion.h2>
          <div className="relative w-40 h-40">
            <WaveLoader />
          </div>
          <motion.div
            className="text-blue-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Please wait...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-2xl font-bold text-white">Connecting to session...</div>
          <motion.div
            className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </motion.div>
      </div>
    )
  }

  if (connectionStatus === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          className="flex flex-col items-center space-y-6 text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-3xl font-bold">Failed to connect to session</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className={`h-screen w-full overflow-hidden flex ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100  text-black"
        }`}
      initial="hidden"
      animate={isPageLoaded ? "visible" : "hidden"}
      variants={pageVariants}
    >
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`w-80 
              bg-gradient-to-b from-slate-800 to-slate-850 border-slate-700 text-black
              border-r flex flex-col`}
          >
            {/* Connected Users */}
            <ScrollArea className="flex-1 p-4">
              <motion.h2
                variants={itemVariants}
                className={`text-sm justify-center items-center text-center mx-auto font-semibold uppercase mb-4 ${isDarkMode
                  ? "text-gray-400"
                  : "text-gray-600"
                  }`}
              >
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">Connected</span> <span className="text-gray-400 lowercase">({clients.length} users)</span>
              </motion.h2>
              <motion.div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-3" variants={itemVariants}>
                {clients.map((client) => (
                  <motion.div key={client.socketId} variants={itemVariants}>
                    <Client
                      user={client.username}
                      isActive={client.socketId === socket?.id}
                      isTyping={typingUsers.has(client.username)}
                      lastActive={new Date().toISOString()}
                      messageCount={0}
                      mood={null}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>

            {/* Room Controls */}

            <motion.div
              className="p-4 border-t border-gray-700 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-300 p-0.5 shadow-lg"
                whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  data-color="white"
                  variant="secondary"
                  className="bg-gradient-to-br from-white to-gray-100 text-black w-full h-10 rounded-lg border-none relative overflow-hidden shadow-inner"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50 opacity-0"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div
                    className="flex items-center justify-center relative z-10"
                    initial={{ gap: "0.5rem" }}
                    whileHover={{ gap: "0.75rem" }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.6, ease: "circOut" }}
                    >
                      <Share className="h-5 w-5" />
                    </motion.div>
                    <span className="font-medium">Share Room</span>
                  </motion.div>
                </Button>
              </motion.div>

              <motion.div
                className="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-0.5 shadow-lg"
                whileHover={{
                  boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4), 0 10px 10px -5px rgba(239, 68, 68, 0.1)",
                }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  data-color="red"
                  variant="destructive"
                  className="bg-gradient-to-br from-red-500 to-red-600 w-full h-10 rounded-lg border-none relative overflow-hidden shadow-inner"
                  onClick={leaveRoom}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: 2,
                      ease: "linear"
                    }}
                    style={{ opacity: 0.2 }}
                  />

                  <motion.div className="flex items-center justify-center relative z-10">
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.5 }}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                    </motion.div>
                    <span className="font-medium">Leave Room</span>
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Section */}
      <motion.div className="flex-1 h-full flex flex-col overflow-hidden" variants={itemVariants}>
        {/* Editor Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            duration: 0.5
          }}
          className={`${isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
            } border-b p-4 flex items-center justify-between`}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ backgroundColor: "transparent" }}
              animate={{
                backgroundColor: isSidebarOpen ? "rgba(22, 163, 74, 0.2)" : "transparent"
              }}
              transition={{ duration: 0.3 }}
              className="rounded-xl text-white"
            >
              <Button
                variant="default"
                className="bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
                onClick={handleRunCode}
              >
                <BugPlay className="mr-1" />
                Run Code
              </Button>
            </motion.div>

            <div className={`${isDarkMode ? "text-gray-400" : "text-gray-600 bg-cyan-700"}`}>
              Language: {language}
            </div>
          </div>
          <div className="flex items-center space-x-8 mr-8">
            <Button
              variant="ghost"
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className="relative h-10 px-4 group"
            >
              <span className="flex items-center">
                {/* <Twitch className="h-5 w-5 mr-2 group-hover:text-blue-400 transition-colors  hover:bg-white" /> */}
                <div className="mr-1">
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 20 20"><g fill="none"><path fill="url(#fluentColorAgents200)" d="M13.18 2H10.5C8.768 7.023 6.823 12.62 6.823 18h6.483a1.75 1.75 0 0 0 1.485-.825l3.998-6.42a1.43 1.43 0 0 0 0-1.51L14.98 3.13A2 2 0 0 0 13.18 2"></path><path fill="url(#fluentColorAgents201)" fillOpacity=".5" d="M13.18 2H10.5C8.768 7.023 6.823 12.62 6.823 18h6.483a1.75 1.75 0 0 0 1.485-.825l3.998-6.42a1.43 1.43 0 0 0 0-1.51L14.98 3.13A2 2 0 0 0 13.18 2"></path><path fill="url(#fluentColorAgents202)" d="M13.25 2.001H6.69c-.601 0-1.16.308-1.48.816l-3.942 6.25a1.75 1.75 0 0 0 0 1.867L5.13 17.06c.354.56.96.91 1.619.938l.067.002h.006a2 2 0 0 0 1.969-1.662l.003-.002L11.18 3.953a2 2 0 0 1 2.069-1.952"></path><path fill="url(#fluentColorAgents203)" fillOpacity=".4" d="M13.25 2.001H6.69c-.601 0-1.16.308-1.48.816l-3.942 6.25a1.75 1.75 0 0 0 0 1.867L5.13 17.06c.354.56.96.91 1.619.938l.067.002h.006a2 2 0 0 0 1.969-1.662l.003-.002L11.18 3.953a2 2 0 0 1 2.069-1.952"></path><defs><radialGradient id="fluentColorAgents200" cx="0" cy="0" r="1" gradientTransform="rotate(-87.881 17.698 4.836)scale(23.3302 18.6978)" gradientUnits="userSpaceOnUse"><stop stopColor="#FFC470"></stop><stop offset=".251" stopColor="#FF835C"></stop><stop offset=".584" stopColor="#F24A9D"></stop><stop offset=".871" stopColor="#B339F0"></stop><stop offset="1" stopColor="#C354FF"></stop></radialGradient><radialGradient id="fluentColorAgents201" cx="0" cy="0" r="1" gradientTransform="matrix(-9.9932 -9.83058 9.94854 -10.1131 11.777 16.154)" gradientUnits="userSpaceOnUse"><stop offset=".709" stopColor="#FFB357" stopOpacity="0"></stop><stop offset=".942" stopColor="#FFB357"></stop></radialGradient><radialGradient id="fluentColorAgents202" cx="0" cy="0" r="1" gradientTransform="rotate(-160.247 10.243 6.665)scale(22.9945 19.4416)" gradientUnits="userSpaceOnUse"><stop offset=".222" stopColor="#4E46E2"></stop><stop offset=".578" stopColor="#625DF6"></stop><stop offset=".955" stopColor="#E37DFF"></stop></radialGradient><linearGradient id="fluentColorAgents203" x1="4.823" x2="10.254" y1="8.629" y2="9.914" gradientUnits="userSpaceOnUse"><stop stopColor="#7563F7" stopOpacity="0"></stop><stop offset=".986" stopColor="#4916AE"></stop></linearGradient></defs></g></svg> */}
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24" ><g fill="none"><path fill="url(#fluentColorChatMore240)" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.96 9.96 0 0 1-4.644-1.142l-4.29 1.117a.85.85 0 0 1-1.037-1.036l1.116-4.289A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2"></path><path fill="url(#fluentColorChatMore241)" d="M13.252 13H8.75l-.102.007a.75.75 0 0 0 0 1.486l.102.007h4.502l.101-.007a.75.75 0 0 0 0-1.486zm1.998-3.5h-6.5l-.102.007a.75.75 0 0 0 0 1.486L8.75 11h6.5l.102-.007a.75.75 0 0 0 0-1.486z"></path><defs><linearGradient id="fluentColorChatMore240" x1="2.714" x2="20.178" y1="5.751" y2="35.521" gradientUnits="userSpaceOnUse"><stop stopColor="#0FAFFF"></stop><stop offset="1" stopColor="#CC23D1"></stop></linearGradient><linearGradient id="fluentColorChatMore241" x1="8.7" x2="9.227" y1="9.588" y2="15.025" gradientUnits="userSpaceOnUse"><stop stopColor="#FDFDFD"></stop><stop offset="1" stopColor="#CCEAFF"></stop></linearGradient></defs></g></svg> */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><g fill="none"><path fill="url(#fluentColorChatMultiple240)" fillRule="evenodd" d="M22 13.5a7.5 7.5 0 1 0-4.411 6.836c1.258.29 2.613.54 3.236.652a.996.996 0 0 0 1.153-1.17a68 68 0 0 0-.681-3.143A7.5 7.5 0 0 0 22 13.5M14.517 18h-.034z" clipRule="evenodd"></path><path fill="url(#fluentColorChatMultiple241)" fillRule="evenodd" d="M2 10.5a7.5 7.5 0 1 1 4.411 6.836c-1.258.29-2.613.54-3.236.652a.996.996 0 0 1-1.153-1.17a68 68 0 0 1 .681-3.143A7.5 7.5 0 0 1 2 10.5M9.483 15h.034z" clipRule="evenodd"></path><defs><radialGradient id="fluentColorChatMultiple240" cx="0" cy="0" r="1" gradientTransform="matrix(6.90278 8.0094 -8.01592 6.9084 11.027 10.005)" gradientUnits="userSpaceOnUse"><stop offset=".63" stopColor="#3D35B1"></stop><stop offset=".85" stopColor="#6553C9"></stop><stop offset="1" stopColor="#7660D3"></stop></radialGradient><linearGradient id="fluentColorChatMultiple241" x1="2" x2="17.003" y1="3" y2="18" gradientUnits="userSpaceOnUse"><stop stopColor="#0FAFFF"></stop><stop offset="1" stopColor="#2764E7"></stop></linearGradient></defs></g></svg>
                </div>
                Ask AI
              </span>
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-3 w-3 text-blue-400" />
              </motion.div>
              <motion.div
                className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isAiPanelOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="relative h-10 px-4 group "
            >
              <span className="flex items-center">
                <MessageSquareMore className="h-5 w-5 mr-2 hover:bg-white group-hover:text-blue-400 transition-colors" />
                Chat
              </span>
              <motion.div
                className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isChatOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
              className="relative h-10 px-4 group"
            >
              <span className="flex items-center">
                <SquarePen className="h-5 w-5 mr-2 group-hover:text-blue-400 transition-colors" />
                Edit
              </span>
              <motion.div
                className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isWhiteboardOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {[
              {
                icon: isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />,
                onClick: toggleFullscreen
              },
              {
                icon: isDarkMode ? <Moon className="h-5 w-5" /> : <SunMoon className="h-5 w-5" />,
                onClick: toggleDarkMode
              },
              {
                icon: <Settings className="h-5 w-5" />,
                onClick: toggleSettings
              }
            ].map((button, index) => (
              <motion.div
                key={index}
                whileHover={{ rotate: 0, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button variant="ghost" size="icon" onClick={button.onClick}>
                  {button.icon}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Editor and Output */}
        <motion.div className="flex-1 flex" variants={itemVariants}>
          {/* Code Editor */}
          <motion.div
            className="flex-1 flex flex-col overflow-hidden"
            variants={itemVariants}
          >
            <motion.div
              className="flex-1"
              ref={editorRef}
              style={{
                height: isConsoleOpen ? `calc(100vh - ${consoleHeight + 120}px)` : 'calc(100vh - 120px)',
                transition: 'height 0.3s ease'
              }}
            >
              {isLoading ? (
                renderSkeleton()
              ) : (
                <MonacoEditor
                  roomId={roomId as string}
                  language={language}
                  fontSize={fontSize}
                  value={code}
                  onChange={handleCodeChange}
                  theme={theme}
                />
              )}
            </motion.div>

            <ConsoleOutput
              isOpen={isConsoleOpen}
              onClose={() => setIsConsoleOpen(false)}
              consoleOutput={consoleOutput}
              onClear={clearConsole}
              height={consoleHeight}
              onHeightChange={setConsoleHeight}
              isSidebarOpen={isSidebarOpen}
              isDarkMode={isDarkMode}
            />
            {!isConsoleOpen && (
              <Button
                className="fixed bottom-4 right-4 bg-white text-black hover:bg-white/80 hover:text-gray-700"
                onClick={() => setIsConsoleOpen(true)}
              >
                <Terminal className="w-4 h-4 mr-2" />
                Show Console
              </Button>
            )}
          </motion.div>
          {isChatOpen && (
           <Chat
        roomId={roomId as string}
        username={username || ""}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
          )}

          <AiAssistant
            isOpen={isAiPanelOpen}
            onToggle={() => setIsAiPanelOpen(!isAiPanelOpen)}
          />
        </motion.div>
        <Whiteboard
          isOpen={isWhiteboardOpen}
          onToggle={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
        />
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 1 }}
            animate={{ opacity: 1, y: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute right-4 top-16 w-80 p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
          >
            <h3 className="text-xl font-semibold mb-6">Settings</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="fontSize" className="block mb-2 text-sm font-medium">
                  Font Size: {fontSize}px
                </label>
                <Slider
                  id="fontSize"
                  min={10}
                  max={24}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>
              <div>
                <label htmlFor="language" className="block mb-2 text-sm font-medium">
                  Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="theme" className="block mb-2 text-sm font-medium">
                  Theme
                </label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vs-dark">Dark</SelectItem>
                    {/* <SelectItem value="vs-light">Light</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOutputPanelOpen && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-l-md"
          onClick={() => setIsOutputPanelOpen(true)}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
      )}

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent
          className={`sm:max-w-[425px] bg-white border-gray-200 text-black`}>
          <DialogHeader>
            <DialogTitle>Share Room</DialogTitle>
            <DialogDescription>Copy the link below to invite others to this room.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input className="italic text-black bg-white" value={`${window.location.origin}/editor/${roomId}`} readOnly />
            <Button className="bg-black text-white hover:bg-gray-800" onClick={copyRoomId}>Copy Room</Button>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Room ID can be used to rejoin this session later.
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Room Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent
          className={`sm:max-w-[425px] bg-white border-gray-200 text-black`}        >
          <DialogHeader>
            <DialogTitle>Leave Room</DialogTitle>
            <DialogDescription>Are you sure you want to leave this room?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" className="bg-black text-white" onClick={() => setIsLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white" onClick={confirmLeaveRoom}>
              Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </motion.div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div></div>}>
      <EditorPageContent />
    </Suspense>
  )
}