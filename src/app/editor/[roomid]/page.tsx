"use client"
import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { toast, Toaster } from "sonner"
import { useParams, useSearchParams } from "next/navigation"
import { ACTIONS } from "@/lib/actions"
import {
  LogOut,
  Play,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Settings,
  Save,
  Download,
  Share,
  Upload,
} from "lucide-react"
import { Resizable } from "re-resizable"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useSocket } from "@/providers/socketProvider"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import { Client } from "@/components/Client"
import { Chat } from "@/components/Chat"
import { Skeleton } from "@/components/ui/skeleton"

const MonacoEditor = dynamic(() => import("@/components/monaco-editor"), { ssr: false })

export default function EditorPage() {
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
  const [consoleHeight, setConsoleHeight] = useState(150)
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

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
  const editorRef = useRef(null)
  const outputRef = useRef(null)
  const controls = useAnimation()
  const [code, setCode] = useState("// Start coding here...")
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [output, setOutput] = useState("")
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: "log" | "error" | "info"; content: string }>>([])
  const lastTypingEventRef = useRef<number>(0)
  const TYPING_INTERVAL = 1000 // Minimum time between typing events in ms
  const { socket, isConnected } = useSocket()

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
    setIsDarkMode(!isDarkMode)
    setTheme(isDarkMode ? "vs-light" : "vs-dark")
  }

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
      className={`min-h-screen flex ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
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
            className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 border-r flex flex-col"
          >
            {/* Connected Users */}
            <ScrollArea className="flex-1 p-4">
              <motion.h2 variants={itemVariants} className="text-sm font-semibold text-gray-400 uppercase mb-4">
                Connected Users ({clients.length})
              </motion.h2>
              <motion.div className="space-y-3" variants={itemVariants}>
                {clients.map((client) => (
                  <motion.div key={client.socketId} variants={itemVariants}>
                    <Client
                      user={client.username}
                      isActive={client.socketId === socket?.id}
                      isTyping={typingUsers.has(client.username)}
                      lastActive={new Date().toISOString()}
                      messageCount={0}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>

            {/* Room Controls */}
            <motion.div variants={itemVariants} className="p-4 border-t border-gray-700 space-y-3">
              <Button variant="secondary" className="w-full" onClick={() => setIsShareDialogOpen(true)}>
                <Share className="h-5 w-5 mr-2" />
                Share Room
              </Button>
              <Button variant="destructive" className="w-full" onClick={leaveRoom}>
                <LogOut className="h-5 w-5 mr-2" />
                Leave Room
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Section */}
      <motion.div className="flex-1 flex flex-col" variants={itemVariants}>
        {/* Editor Header */}
        <motion.div
          variants={itemVariants}
          className={`${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } border-b p-4 flex items-center justify-between`}
        >
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 transition-colors duration-300"
              onClick={handleRunCode}
            >
              <Play className="h-5 w-5 mr-2" />
              Run Code
            </Button>
            <div className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Language: {language}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSettings}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Editor and Output */}
        <motion.div className="flex-1 flex" variants={itemVariants}>
          {/* Code Editor */}
          <motion.div className="flex-1 flex flex-col overflow-hidden" variants={itemVariants}>
            <motion.div className="flex-1" ref={editorRef} variants={itemVariants}>
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

            <AnimatePresence>
              {isOutputPanelOpen && (
                <Resizable
                  defaultSize={{ width: "100%", height: consoleHeight }}
                  minHeight={100}
                  maxHeight={300}
                  enable={{ top: true }}
                  onResizeStop={(e, direction, ref, d) => {
                    setConsoleHeight(consoleHeight + d.height)
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`h-full ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    } border-l flex flex-col`}
                  >
                    <Tabs defaultValue="output" className="w-full">
                      <div className="flex justify-between items-center p-2 border-b border-gray-700">
                        <TabsList>
                          <TabsTrigger value="output">Output</TabsTrigger>
                          <TabsTrigger value="console">Console</TabsTrigger>
                        </TabsList>
                        <Button variant="ghost" size="icon" onClick={() => setIsOutputPanelOpen(false)}>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                      <TabsContent value="output" className="p-4 font-mono text-sm h-full">
                        <SyntaxHighlighter language="javascript" style={dracula} className="rounded-lg">
                          {output || "Run your code to see output"}
                        </SyntaxHighlighter>
                      </TabsContent>
                      <TabsContent value="console" className="p-4 font-mono text-sm h-full overflow-auto">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Console</span>
                          <Button variant="ghost" size="sm" onClick={clearConsole}>
                            Clear
                          </Button>
                        </div>
                        {consoleOutput.map((log, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-1 ${
                              log.type === "error"
                                ? "text-red-400"
                                : log.type === "info"
                                  ? "text-blue-400"
                                  : "text-green-400"
                            }`}
                          >
                            {log.content}
                          </motion.div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                </Resizable>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div className="w-80 border-l max-h-full border-gray-700" variants={itemVariants}>
            <Chat roomId={roomId as string} username={username || ""} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute right-4 top-16 w-80 p-6 rounded-lg shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
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
                    <SelectItem value="vs-light">Light</SelectItem>
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

      {/* Floating Action Buttons */}
    

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Room</DialogTitle>
            <DialogDescription>Copy the link below to invite others to this room.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={`${window.location.origin}/room/${roomId}`} readOnly />
            <Button onClick={copyRoomId}>Copy</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Room Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Room</DialogTitle>
            <DialogDescription>Are you sure you want to leave this room?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLeaveRoom}>
              Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </motion.div>
  )
}

