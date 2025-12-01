import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  PanelLeftClose,
  ArrowRight,
  Play,
  Bot,
  MessageSquare,
  PenTool,
  Minimize,
  Maximize,
  Moon,
  Sun,
  Settings,
  Code2,
  ChevronDown,
  Zap,
  Circle,
  Square,
  PanelRight,
  ArrowLeftToLine,
  ArrowRightToLine,
  PanelLeft
} from 'lucide-react';

interface PremiumEditorHeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  isAiPanelOpen: boolean;
  setIsAiPanelOpen: (value: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (value: boolean) => void;
  isWhiteboardOpen: boolean;
  setIsWhiteboardOpen: (value: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
  language: string;
  handleRunCode: () => void;
  toggleSettings: () => void;
}

const PremiumEditorHeader: React.FC<PremiumEditorHeaderProps> = ({
  isDarkMode,
  setIsDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  isAiPanelOpen,
  setIsAiPanelOpen,
  isChatOpen,
  setIsChatOpen,
  isWhiteboardOpen,
  setIsWhiteboardOpen,
  isFullscreen,
  setIsFullscreen,
  language,
  handleRunCode,
  toggleSettings
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleRunCodeInternal = () => {
    setIsRunning(true);
    handleRunCode(); // Call the passed function
    setTimeout(() => setIsRunning(false), 2500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const navItems = [
    {
      id: 'ai' as const,
      label: 'AI Assistant',
      icon: Bot,
      isActive: isAiPanelOpen,
      onClick: () => setIsAiPanelOpen(!isAiPanelOpen),
      accentColor: 'violet' as const
    },
    {
      id: 'chat' as const,
      label: 'Collaborate',
      icon: MessageSquare,
      isActive: isChatOpen,
      onClick: () => setIsChatOpen(!isChatOpen),
      accentColor: 'blue' as const
    },
    {
      id: 'edit' as const,
      label: 'Whiteboard',
      icon: PenTool,
      isActive: isWhiteboardOpen,
      onClick: () => setIsWhiteboardOpen(!isWhiteboardOpen),
      accentColor: 'emerald' as const
    }
  ];

  const controlItems = [
    {
      icon: isFullscreen ? Minimize : Maximize,
      onClick: toggleFullscreen,
      label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'
    },
    {
      icon: isDarkMode ? Sun : Moon,
      onClick: toggleDarkMode,
      label: isDarkMode ? 'Light Mode' : 'Dark Mode'
    },
    {
      icon: Settings,
      onClick: toggleSettings,
      label: 'Settings'
    }
  ];

  const getAccentClasses = (color: 'violet' | 'blue' | 'emerald', isActive = false) => {
    const colors = {
      violet: isActive
        ? 'bg-violet-500 text-white shadow-violet-500/25'
        : 'hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/30',
      blue: isActive
        ? 'bg-blue-500 text-white shadow-blue-500/25'
        : 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30',
      emerald: isActive
        ? 'bg-emerald-500 text-white shadow-emerald-500/25'
        : 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
    };
    return colors[color] || '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: 'preserve-3d'
      }}
      className={`
        relative z-40 overflow-hidden border-b
        ${isDarkMode
          ? 'bg-black border-slate-900'
          : 'bg-white/95 border-slate-200/60'
        }
        backdrop-blur
      `}
    >
      {/* Main content */}
      <div className="relative px-8 py-4">
        <div className="flex items-center justify-between max-w-full">

          {/* Left Section */}
          <div className="flex items-center space-x-6">
            {/* Sidebar Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`
                relative p-3 rounded-xl transition-all duration-300 group
                ${isDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800'
                  : 'bg-slate-50/80 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200/70'
                }
              `}
            >
              <motion.div
                animate={{ rotate: isSidebarOpen ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {isSidebarOpen ?
                  <PanelLeft className="h-5 w-5" /> :
                  <ArrowRightToLine className="h-5 w-5" />
                }
              </motion.div>

              {/* Subtle glow effect */}
                {isDarkMode && (
                  <div className="absolute inset-0 rounded-xl bg-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
            </motion.button>

            {/* Run Code Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunCodeInternal}
              disabled={isRunning}
              className="relative px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-medium transition-all duration-300 group overflow-hidden shadow-lg shadow-emerald-500/20"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />

              <div className="relative flex items-center space-x-3">
                <motion.div
                  animate={isRunning ? {
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  } : {}}
                  transition={{
                    rotate: { duration: 0.6, ease: "easeOut" },
                    scale: { duration: 0.3, repeat: isRunning ? Infinity : 0 }
                  }}
                >
                  {isRunning ? <Zap className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </motion.div>
                <span className="text-sm font-medium">
                  {isRunning ? 'Executing...' : 'Run Code'}
                </span>
              </div>

              {/* Progress bar */}
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    exit={{ width: '100%', opacity: 0 }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                    className="absolute bottom-0 left-0 h-0.5 bg-white/60"
                  />
                )}
              </AnimatePresence>
            </motion.button>

            {/* Language Selector */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center space-x-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300
                ${isDarkMode
                  ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800'
                  : 'bg-slate-50/60 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200/70'
                }
              `}
            >
              <Code2 className="h-4 w-4" />
              <span className="text-sm font-medium">{language}</span>
              <motion.div
                animate={{ rotate: isHovered === 'language' ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <ChevronDown className="h-3 w-3 opacity-60" />
              </motion.div>
            </motion.div>
          </div>

          {/* Center Navigation */}
          <div className="flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={item.onClick}
                onHoverStart={() => setIsHovered(item.id)}
                onHoverEnd={() => setIsHovered(null)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative group px-6 py-3 rounded-xl transition-all duration-300 border
                  ${item.isActive
                    ? `${getAccentClasses(item.accentColor, true)} border-transparent shadow`
                    : isDarkMode
                      ? `bg-slate-900/60 text-slate-300 border-slate-800 ${getAccentClasses(item.accentColor)}`
                      : `bg-slate-50/60 text-slate-600 border-slate-200 ${getAccentClasses(item.accentColor)}`
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={item.isActive ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <item.icon className="h-4 w-4" />
                  </motion.div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>

                {/* Advanced active indicator */}
                <AnimatePresence>
                  {item.isActive && (
                    <>
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        className="absolute bottom-0 left-1/2 w-8 h-0.5 bg-current rounded-full"
                        style={{ x: '-50%' }}
                      />
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 rounded-xl bg-current"
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${item.accentColor === 'violet' ? 'rgb(139, 92, 246)' :
                        item.accentColor === 'blue' ? 'rgb(59, 130, 246)' :
                          'rgb(16, 185, 129)'
                      }, transparent 70%)`
                  }}
                />
              </motion.button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            {controlItems.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={item.onClick}
                className={`
                  relative p-3 rounded-xl transition-all duration-300 group
                  ${isDarkMode
                    ? 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200/70'
                  }
                `}
                title={item.label}
              >
                <motion.div
                  animate={index === 1 && isHovered === 'theme' ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onHoverStart={() => index === 1 && setIsHovered('theme')}
                  onHoverEnd={() => setIsHovered(null)}
                >
                  <item.icon className="h-4 w-4" />
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Sophisticated bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-800" />
    </motion.div>
  );
};

export default PremiumEditorHeader;