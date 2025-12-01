"use client"
import { useState, useRef, useEffect, useMemo, useCallback, Suspense, memo } from "react"
import { motion, AnimatePresence, useAnimation, Variants } from "framer-motion"
import { toast, Toaster } from "sonner"
import { useParams, useSearchParams } from "next/navigation"
import { ACTIONS } from "@/lib/actions"
import {
  LogOut,
  ChevronLeft,
  Share,
  Terminal,
} from "lucide-react"
import { useSocket } from "@/providers/socketProvider"
import dynamic from "next/dynamic"
import Whiteboard from "@/components/Editor/WhiteBoard"
import ConsoleOutput from "@/components/Editor/ConsoleOutput"
import PremiumEditorHeader from "@/components/Editor/EditorHeader"
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
const Input = dynamic(
  () => import("@/components/ui/input").then((mod) => mod.Input)
);
const Client = dynamic(
  () => import("@/components/Editor/Client").then((mod) => mod.Client),
  { ssr: false }
);

// Memoized Editor Section to prevent re-renders from dialog state changes
const EditorSection = memo(({
  isLoading,
  code,
  roomId,
  language,
  fontSize,
  theme,
  handleCodeChange,
  isConsoleOpen,
  consoleHeight,
  setConsoleHeight,
  isDarkMode,
  renderSkeleton,
  editorRef
}: any) => (
  <div className="flex-1 flex flex-col overflow-hidden">
    <div className="flex-1 overflow-hidden min-h-0" ref={editorRef}>
      {isLoading ? (
        <div className="h-full">{renderSkeleton()}</div>
      ) : (
        <div className="h-full w-full">
          <MonacoEditor
            roomId={roomId}
            language={language}
            fontSize={fontSize}
            value={code}
            onChange={handleCodeChange}
            theme={theme}
          />
        </div>
      )}
    </div>

    {isConsoleOpen && (
      <motion.div
        className={`h-1 cursor-ns-resize ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} transition-colors group`}
        onMouseDown={(e) => {
          const startY = e.clientY;
          const startHeight = consoleHeight;

          const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = startY - moveEvent.clientY;
            const newHeight = Math.max(100, Math.min(startHeight + deltaY, window.innerHeight - 200));
            setConsoleHeight(newHeight);
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        whileHover={{ scaleY: 1.2 }}
        transition={{ duration: 0.2 }}
      />
    )}
  </div>
), (prev: any, next: any) => {
  return (
    prev.code === next.code &&
    prev.isLoading === next.isLoading &&
    prev.language === next.language &&
    prev.fontSize === next.fontSize &&
    prev.isConsoleOpen === next.isConsoleOpen &&
    prev.consoleHeight === next.consoleHeight &&
    prev.isDarkMode === next.isDarkMode
  );
});
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
    import("@/components/Editor/Assistant/AiAssistant").then((mod) => mod.default),
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
  const [consoleHeight, setConsoleHeight] = useState(120)
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
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    if (username) {
      const generateUserId = (username: string) => {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
          const char = username.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return `user_${Math.abs(hash)}`;
      }

      const generatedUserId = generateUserId(username);
      setUserId(generatedUserId);
      console.log('Generated userId:', generatedUserId, 'for username:', username);
    }
  }, [username])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnectingSplash(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Memoized variants
  const pageVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94], // easeOut cubic-bezier
          staggerChildren: 0.1,
        },
      },
    }),
    [],
  )

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94] // easeOut cubic-bezier
        },
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

  const copyRoomId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId as string)
      toast.success("Room ID copied to clipboard")
    } catch (err: any) {
      toast.error("Failed to copy room ID")
    }
  }, [roomId])

  const leaveRoom = useCallback(() => {
    setIsLeaveDialogOpen(true)
  }, [])

  const confirmLeaveRoom = useCallback(() => {
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
  }, [socket, roomId])

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 to-slate-800">
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 to-slate-800">
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
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
      }}
      className={isDarkMode ? "bg-slate-950" : "bg-white"}
    >
      <motion.div
        className={`h-full w-full overflow-hidden flex flex-row ${isDarkMode ? "bg-slate-950 text-white" : "bg-white text-black"
          }`}
        initial="hidden"
        animate={isPageLoaded ? "visible" : "hidden"}
        variants={pageVariants}
      >
      {/* < CyanCursorSimple/> */}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`w-80 h-full border-r flex flex-col ${
              isDarkMode
                ? "border-slate-800 bg-black text-slate-200"
                : "border-slate-200 bg-white text-black"
            }`}
          >
            {/* Connected Users */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 sidebar-scrollbar">
                <div className="p-4">
                  <motion.h2
                    variants={itemVariants}
                    className={`text-sm justify-center items-center text-center mx-auto font-semibold uppercase mb-4 ${isDarkMode
                      ? "text-slate-400"
                      : "text-slate-600 bg-white"
                      }`}
                  >
                    <span className="bg-gray-300 text-transparent bg-clip-text">Connected</span> <span className="text-slate-400 lowercase">({clients.length} users)</span>
                  </motion.h2>
                  <motion.div className={`space-y-5`} variants={itemVariants}>
                    {clients.map((client) => (
                      <motion.div key={client.socketId} variants={itemVariants}>
                        <Client
                          user={client.username}
                          isActive={client.socketId === socket?.id}
                          isTyping={typingUsers.has(client.username)}
                          lastActive={new Date().toISOString()}
                          mood={null}
                          isDarkMode={isDarkMode}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </ScrollArea>
            </div>

            {/* Room Controls - Sticky to bottom */}
            <div
              className={`p-4 border-t space-y-2 flex-shrink-0 ${
                isDarkMode ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <Button
                variant="outline"
                size="sm"
                className={`w-full ${
                  isDarkMode
                    ? "bg-slate-800 hover:bg-slate-700 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-300"
                }`}
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full bg-[#EA4335] hover:bg-[#D33426] border-[#EA4335] hover:border-[#D33426] text-white transition-colors"
                onClick={leaveRoom}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Section */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {/* Editor Header */}
        <PremiumEditorHeader
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isAiPanelOpen={isAiPanelOpen}
          setIsAiPanelOpen={setIsAiPanelOpen}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          isWhiteboardOpen={isWhiteboardOpen}
          setIsWhiteboardOpen={setIsWhiteboardOpen}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          language={language}
          handleRunCode={handleRunCode}
          toggleSettings={toggleSettings}
        />
        {/* Editor and Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor - Takes remaining space */}
          <div className="flex-1 overflow-hidden min-h-0" ref={editorRef}>
            {isLoading ? (
              <div className="h-full">{renderSkeleton()}</div>
            ) : (
              <div className="h-full w-full">
                <MonacoEditor
                  roomId={roomId as string}
                  language={language}
                  fontSize={fontSize}
                  value={code}
                  onChange={handleCodeChange}
                  theme={theme}
                />
              </div>
            )}
          </div>

          {/* Resizable Divider */}
          {isConsoleOpen && (
            <motion.div
              className={`h-1 cursor-ns-resize ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} transition-colors group`}
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startHeight = consoleHeight;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaY = startY - moveEvent.clientY;
                  const newHeight = Math.max(100, Math.min(startHeight + deltaY, window.innerHeight - 200));
                  setConsoleHeight(newHeight);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              whileHover={{ scaleY: 1.2 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Console - Resizable height at bottom */}
          {isConsoleOpen && (
          <div style={{ height: `${consoleHeight}px` }} className="overflow-hidden flex-shrink-0">

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
          </div>
          )}

          {!isConsoleOpen && (
            <Button
              className="fixed bottom-4 right-4 bg-white text-black hover:bg-white/80 hover:text-slate-700 z-40"
              onClick={() => setIsConsoleOpen(true)}
            >
              <Terminal className="w-4 h-4 mr-2" />
              Show Console
            </Button>
          )}
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
            userId={userId} // Use the generated userId
            username={username || ""} // Handle null case
          />
        </div>
        <Whiteboard
          isOpen={isWhiteboardOpen}
          onToggle={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
        />
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 1 }}
            animate={{ opacity: 1, y: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute right-4 top-16 w-80 p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-slate-800" : "bg-white"
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
          className={`sm:max-w-[425px] rounded-lg border ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Share Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Invite others to join this room by sharing the link below:
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={`${window.location.origin}/editor/${roomId}`}
                readOnly
                className={`text-sm font-mono ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-slate-100 border-slate-300 text-slate-900"
                }`}
              />
              <Button
                type="button"
                onClick={copyRoomId}
                className={`px-3 h-9 flex-shrink-0 ${
                  isDarkMode
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Room Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent
          className={`sm:max-w-[400px] rounded-lg border ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Leave Room</DialogTitle>
          </DialogHeader>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Are you sure you want to leave this room? You can rejoin later using the room ID.
          </p>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLeaveDialogOpen(false)}
              className={`px-4 h-9 ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-100"
                  : "bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-900"
              }`}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmLeaveRoom}
              className="px-4 h-9 bg-red-600 hover:bg-red-700 text-white"
            >
              Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </motion.div>
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div></div>}>
      <EditorPageContent />
    </Suspense>
  )
}