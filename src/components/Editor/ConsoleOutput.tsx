import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Copy, Trash, Maximize2, Minimize2, Download, Terminal, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConsoleOutputProps {
  isOpen: boolean;
  onClose: () => void;
  consoleOutput: Array<{ type: string; content: string; timestamp?: string }>;
  onClear: () => void;
  isSidebarOpen: boolean;
  height: number;
  onHeightChange: (height: number) => void;
  isDarkMode: boolean;
}

const ConsoleOutput = ({ 
  isOpen, 
  onClose, 
  consoleOutput, 
  onClear,
  isSidebarOpen,
  height,
  onHeightChange,
  isDarkMode
}: ConsoleOutputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [filter, setFilter] = useState('all');
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(height);
  const containerRef = useRef(null);
  const previousHeight = useRef(height);

  // Add timestamp to console outputs if not present
  const timestampedOutput = consoleOutput.map(log => {
    if (!log.timestamp) {
      return {
        ...log,
        timestamp: new Date().toLocaleTimeString()
      };
    }
    return log;
  });

  const filteredOutput = timestampedOutput.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = dragStartY.current - e.clientY;
      const maxHeight = window.innerHeight * 0.9; // Maximum 90% of viewport height
      const newHeight = Math.min(Math.max(150, dragStartHeight.current + deltaY), maxHeight);
      onHeightChange(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onHeightChange]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    setIsDragging(true);
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore previous height
      onHeightChange(previousHeight.current);
    } else {
      // Save current height and maximize
      previousHeight.current = height;
      onHeightChange(window.innerHeight * 0.9);
    }
    setIsMaximized(!isMaximized);
  };

  const exportLogs = () => {
    const logText = consoleOutput.map(log => 
      `[${log.type.toUpperCase()}] ${log.timestamp || new Date().toLocaleTimeString()}: ${log.content}`
    ).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Create color theme based on isDarkMode
  const theme = {
    // Cyan theme colors
    primary: isDarkMode ? 'rgb(6, 182, 212)' : 'rgb(6, 182, 212)', // cyan-500
    primaryLight: isDarkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.1)',
    primaryDark: isDarkMode ? 'rgb(8, 145, 178)' : 'rgb(8, 145, 178)', // cyan-600
    bg: isDarkMode ? 'rgb(15, 23, 42)' : 'rgb(248, 250, 252)', // slate-900 or slate-50
    border: isDarkMode ? 'rgb(51, 65, 85)' : 'rgb(226, 232, 240)', // slate-700 or slate-200
    text: isDarkMode ? 'rgb(248, 250, 252)' : 'rgb(15, 23, 42)', // slate-50 or slate-900
    textSecondary: isDarkMode ? 'rgb(148, 163, 184)' : 'rgb(71, 85, 105)', // slate-400 or slate-600
    surface: isDarkMode ? 'rgb(30, 41, 59)' : 'rgb(241, 245, 249)', // slate-800 or slate-100
    surfaceHover: isDarkMode ? 'rgb(51, 65, 85)' : 'rgb(226, 232, 240)', // slate-700 or slate-200
    
    // Log type specific colors
    error: isDarkMode ? 'rgb(239, 68, 68)' : 'rgb(239, 68, 68)', // red-500
    errorBg: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    warn: isDarkMode ? 'rgb(245, 158, 11)' : 'rgb(245, 158, 11)', // amber-500
    warnBg: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
    success: isDarkMode ? 'rgb(34, 197, 94)' : 'rgb(34, 197, 94)', // green-500
    successBg: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className="fixed bottom-0 right-0 bg-slate-700"
          style={{
            left: isSidebarOpen ? '320px' : '0',
            zIndex: 50,
            backgroundColor: theme.bg,
            borderTop: `1px solid ${theme.border}`,
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Drag Handle */}
          <div
            className="absolute -top-3 left-0 right-0 h-6 cursor-ns-resize flex items-center justify-center"
            onMouseDown={handleDragStart}
          >
            <div 
              className="w-16 h-1.5 rounded-full transition-all duration-300 hover:w-20"
              style={{ backgroundColor: theme.primary }}
            />
          </div>
        
          <div className="h-full flex flex-col bg-gradient-to-r from-slate-800/50 to-slate-700/50 transition-all duration-300 shadow-lg ">
            {/* Console Header */}
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-transparent"
                  style={{ color: theme.primary }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <div className="flex items-center" style={{ color: theme.text }}>
                  <Terminal className="h-4 w-4 mr-2" style={{ color: theme.primary }} />
                  <span className="text-base font-medium">Console Output</span>
                  <div className="ml-2 px-2 py-0.5 text-xs rounded-full" 
                    style={{ 
                      backgroundColor: theme.primaryLight,
                      color: theme.primary
                    }}
                  >
                    {consoleOutput.length}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={cn(
                    "rounded-full text-xs px-3 py-1",
                    filter === 'all' ? 'border-2' : 'border'
                  )}
                  style={{ 
                    backgroundColor: filter === 'all' ? theme.primaryLight : 'transparent',
                    color: filter === 'all' ? theme.primary : theme.textSecondary,
                    borderColor: filter === 'all' ? theme.primary : theme.border
                  }}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('log')}
                  className={cn(
                    "rounded-full text-xs px-3 py-1",
                    filter === 'log' ? 'border-2' : 'border'
                  )}
                  style={{ 
                    backgroundColor: filter === 'log' ? theme.primaryLight : 'transparent',
                    color: filter === 'log' ? theme.primary : theme.textSecondary,
                    borderColor: filter === 'log' ? theme.primary : theme.border
                  }}
                >
                  Log
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('warn')}
                  className={cn(
                    "rounded-full text-xs px-3 py-1",
                    filter === 'warn' ? 'border-2' : 'border'
                  )}
                  style={{ 
                    backgroundColor: filter === 'warn' ? theme.warnBg : 'transparent',
                    color: filter === 'warn' ? theme.warn : theme.textSecondary,
                    borderColor: filter === 'warn' ? theme.warn : theme.border
                  }}
                >
                  Warnings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('error')}
                  className={cn(
                    "rounded-full text-xs px-3 py-1",
                    filter === 'error' ? 'border-2' : 'border'
                  )}
                  style={{ 
                    backgroundColor: filter === 'error' ? theme.errorBg : 'transparent',
                    color: filter === 'error' ? theme.error : theme.textSecondary,
                    borderColor: filter === 'error' ? theme.error : theme.border
                  }}
                >
                  Errors
                </Button>
              </div>

              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={exportLogs}
                        className="rounded-full hover:bg-transparent"
                        style={{ color: theme.textSecondary }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export logs</TooltipContent>
                  </Tooltip>
                
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="rounded-full hover:bg-transparent"
                        style={{ color: theme.textSecondary }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear console</TooltipContent>
                  </Tooltip>
                
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMaximize}
                        className="rounded-full hover:bg-transparent"
                        style={{ color: theme.textSecondary }}
                      >
                        {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMaximized ? "Minimize" : "Maximize"}</TooltipContent>
                  </Tooltip>
                
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="rounded-full hover:bg-transparent"
                        style={{ color: theme.textSecondary }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Close</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
        
            {/* Console Content */}
            <ScrollArea className="flex-1 p-4 font-mono text-sm" style={{ color: theme.text }}>
              <motion.div layout className="space-y-2">
                {filteredOutput.map((log, index) => (
                  <ConsoleEntry 
                    key={index} 
                    log={log} 
                    theme={theme}
                  />
                ))}
                {filteredOutput.length === 0 && (
                  <div 
                    className="flex flex-col items-center justify-center mb-1 text-center"
                    style={{ color: theme.textSecondary }}
                  >
                    <Terminal className="h-16 w-16 mb-4 opacity-20" />
                    {consoleOutput.length === 0 ? (
                      <>
                        <p className="mb-1">No console output yet</p>
                        <p className="text-xs">Run your code to see results here</p>
                      </>
                    ) : (
                      <p>No {filter !== 'all' ? filter : ''} messages to display</p>
                    )}
                  </div>
                )}
              </motion.div>
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ConsoleLog {
  type: string;
  content: string;
  timestamp?: string;
}

interface ConsoleEntryProps {
  log: ConsoleLog;
  theme: any;
}

const ConsoleEntry = ({ log, theme }: ConsoleEntryProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentLines = log.content.split('\n');
  const isMultiline = contentLines.length > 1;
  const hasLongLine = contentLines.some(line => line.length > 100);
  const shouldCollapse = isMultiline || hasLongLine;

  const copyContent = async () => {
    await navigator.clipboard.writeText(log.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Determine styles based on log type
  let logStyles = {
    bg: theme.primaryLight,
    border: theme.primary,
    icon: '→',
  };

  switch (log.type) {
    case 'error':
      logStyles = {
        bg: theme.errorBg,
        border: theme.error,
        icon: '⚠️',
      };
      break;
    case 'warn':
      logStyles = {
        bg: theme.warnBg, 
        border: theme.warn,
        icon: '⚡',
      };
      break;
    case 'info':
      logStyles = {
        bg: theme.primaryLight,
        border: theme.primary,
        icon: 'ℹ️',
      };
      break;
    case 'success':
      logStyles = {
        bg: theme.successBg,
        border: theme.success,
        icon: '✓',
      };
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-lg overflow-hidden  bg-slate-700"
      style={{ 
        backgroundColor: 'transparent'
      }}
    >
      <div className="flex items-center p-2 rounded-t-lg" 
        style={{ 
          backgroundColor: logStyles.bg,
          borderLeft: `3px solid ${logStyles.border}`
        }}
      >
        <div className="mr-2 w-5 text-center">
          <span>{logStyles.icon}</span>
        </div>
        
        <div className="text-xs opacity-70 mr-2">
          {log.timestamp || ''}
        </div>
        
        <div className="flex-1">
          {shouldCollapse ? (
            <div 
              className="cursor-pointer flex items-center"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 mr-1" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1" />
              )}
              <span className="font-semibold">
                {isMultiline 
                  ? `${contentLines.length} lines` 
                  : `${contentLines[0].slice(0, 100)}${contentLines[0].length > 100 ? '...' : ''}`}
              </span>
            </div>
          ) : (
            <span>{log.content}</span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 h-6 w-6"
          style={{ color: theme.textSecondary }}
          onClick={copyContent}
        >
          {isCopied ? (
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              style={{ color: theme.success }}
            >
              ✓
            </motion.span>
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      {shouldCollapse && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3 overflow-auto max-h-96 whitespace-pre-wrap"
          style={{ 
            backgroundColor: theme.surface,
            borderLeft: `3px solid ${logStyles.border}`
          }}
        >
          {contentLines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < contentLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ConsoleOutput;