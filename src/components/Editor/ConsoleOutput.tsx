// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ChevronDown, ChevronRight, X, Copy, Trash, Download, Filter, Search, Maximize2, Minimize2, Pin } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { cn } from '@/lib/utils';
// import { Input } from '@/components/ui/input';
// import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// interface ConsoleOutputProps {
//   isOpen: boolean;
//   onClose: () => void;
//   consoleOutput: Array<{ type: string; content: string; timestamp?: Date }>;
//   onClear: () => void;
//   isSidebarOpen: boolean;
//   height: number;
//   onHeightChange: (height: number) => void;
//   isDarkMode: boolean;
// }

// const ConsoleOutput = ({ 
//   isOpen, 
//   onClose, 
//   consoleOutput, 
//   onClear,
//   isSidebarOpen,
//   height,
//   onHeightChange,
//   isDarkMode
// }: ConsoleOutputProps) => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isPinned, setIsPinned] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [activeFilters, setActiveFilters] = useState<string[]>(['log', 'error', 'warn']);
//   const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
//   const dragStartY = useRef(0);
//   const dragStartHeight = useRef(height);
//   const containerRef = useRef(null);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll to bottom when new logs appear
//   useEffect(() => {
//     if (scrollAreaRef.current) {
//       const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
//       if (scrollElement) {
//         scrollElement.scrollTop = scrollElement.scrollHeight;
//       }
//     }
//   }, [consoleOutput.length]);

//   useEffect(() => {
//     const handleMouseMove = (e:any) => {
//       if (!isDragging) return;

//       const deltaY = dragStartY.current - e.clientY;
//       const maxHeight = window.innerHeight * 0.8; // Maximum 80% of viewport height
//       const newHeight = Math.min(Math.max(250, dragStartHeight.current + deltaY), maxHeight);
//       onHeightChange(newHeight);
//     };

//     const handleMouseUp = () => {
//       setIsDragging(false);
//     };

//     if (isDragging) {
//       document.addEventListener('mousemove', handleMouseMove);
//       document.addEventListener('mouseup', handleMouseUp);
//     }

//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, [isDragging, onHeightChange]);

//   const handleDragStart = (e:any) => {
//     if (isFullscreen) return;
//     dragStartY.current = e.clientY;
//     dragStartHeight.current = height;
//     setIsDragging(true);
//   };

//   const toggleFullscreen = () => {
//     setIsFullscreen(!isFullscreen);
//     if (!isFullscreen) {
//       // Save current height before going fullscreen
//       dragStartHeight.current = height;
//       onHeightChange(window.innerHeight * 0.8);
//     } else {
//       // Restore previous height
//       onHeightChange(dragStartHeight.current);
//     }
//   };

//   const exportLogs = () => {
//     const logsText = consoleOutput
//       .map(log => `[${log.type.toUpperCase()}] ${log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString()}: ${log.content}`)
//       .join('\n');

//     const blob = new Blob([logsText], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `console-logs-${new Date().toISOString().slice(0, 10)}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   // Filter logs based on active filters and search term
//   const filteredLogs = consoleOutput.filter(log => 
//     activeFilters.includes(log.type) && 
//     (searchTerm === '' || log.content.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <AnimatePresence>
//       {isOpen && (
//        <motion.div
//         ref={containerRef}
//         initial={{ height: 0, opacity: 0 }}
//         animate={{ 
//           height: isFullscreen ? '80vh' : height, 
//           opacity: 1,
//           left: isPinned || isFullscreen ? 0 : (isSidebarOpen ? '320px' : 0)
//         }}
//         exit={{ height: 0, opacity: 0 }}
//         transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
//         className={`fixed bottom-0 right-0 ${
//           isDarkMode 
//             ? 'bg-gray-800 border-t border-gray-700' 
//             : 'bg-white border-t border-gray-200'
//         }`}
//         style={{ 
//           zIndex: 40,
//           width: isFullscreen ? '100%' : (isPinned ? '100%' : undefined)
//         }}
//       >
//          {/* Drag Handle */}
//          <div
//            className="absolute -top-3 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center"
//            onMouseDown={handleDragStart}
//          >
//            <div className={`w-20 h-1 ${
//              isDarkMode 
//                ? 'bg-gray-600 hover:bg-gray-500' 
//                : 'bg-gray-300 hover:bg-gray-400'
//            } rounded-full transition-colors`} />
//          </div>

//          <div className="h-full flex flex-col">
//            {/* Console Header */}
//            <div className={`flex items-center justify-between px-4 py-2 border-b ${
//              isDarkMode 
//                ? 'border-gray-700' 
//                : 'border-gray-200'
//            }`}>
//              <div className="flex items-center space-x-2">
//                <TooltipProvider>
//                  <Tooltip>
//                    <TooltipTrigger asChild>
//                      <Button 
//                        variant="ghost" 
//                        size="sm"
//                        onClick={onClose}
//                        className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
//                        disabled={isPinned}
//                      >
//                        <ChevronDown className="h-4 w-4" />
//                      </Button>
//                    </TooltipTrigger>
//                    <TooltipContent>
//                      <p>Minimize console</p>
//                    </TooltipContent>
//                  </Tooltip>
//                </TooltipProvider>
//                <span className={`text-base font-medium ${
//                  isDarkMode ? 'text-white' : 'text-gray-900'
//                }`}>Console Output</span>
//                <span className={`text-xs rounded-full px-2 py-0.5 ${
//                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
//                }`}>
//                  {filteredLogs.length} {filteredLogs.length === 1 ? 'item' : 'items'}
//                </span>
//              </div>

//              <div className="flex items-center space-x-1">
//                <TooltipProvider>
//                  <Tooltip>
//                    <TooltipTrigger asChild>
//                      <Button
//                        variant="ghost"
//                        size="sm"
//                        onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
//                        className={cn(
//                          "hover:text-black",
//                          isDarkMode ? 'text-gray-400' : 'text-gray-500',
//                          isFilterMenuOpen && (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')
//                        )}
//                      >
//                        <Filter className="h-4 w-4" />
//                      </Button>
//                    </TooltipTrigger>
//                    <TooltipContent>
//                      <p>Filter console entries</p>
//                    </TooltipContent>
//                  </Tooltip>
//                </TooltipProvider>

//                <TooltipProvider>
//                  <Tooltip>
//                    <TooltipTrigger asChild>
//                      <Button
//                        variant="ghost"
//                        size="sm"
//                        onClick={exportLogs}
//                        className={`hover:text-black ${
//                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                        }`}
//                      >
//                        <Download className="h-4 w-4" />
//                      </Button>
//                    </TooltipTrigger>
//                    <TooltipContent>
//                      <p>Export logs</p>
//                    </TooltipContent>
//                  </Tooltip>
//                </TooltipProvider>

//                <TooltipProvider>
//                  <Tooltip>
//                    <TooltipTrigger asChild>
//                      <Button
//                        variant="ghost"
//                        size="sm"
//                        onClick={() => setIsPinned(!isPinned)}
//                        className={cn(
//                          "hover:text-black",
//                          isDarkMode ? 'text-gray-400' : 'text-gray-500',
//                          isPinned && (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')
//                        )}
//                      >
//                        <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
//                      </Button>
//                    </TooltipTrigger>
//                    <TooltipContent>
//                      <p>{isPinned ? 'Unpin console' : 'Pin console'}</p>
//                    </TooltipContent>
//                  </Tooltip>
//                </TooltipProvider>

//                <TooltipProvider>
//                  <Tooltip>
//                    <TooltipTrigger asChild>
//                      <Button
//                        variant="ghost"
//                        size="sm"
//                        onClick={toggleFullscreen}
//                        className={`hover:text-black ${
//                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                        }`}
//                      >
//                        {isFullscreen ? 
//                          <Minimize2 className="h-4 w-4" /> : 
//                          <Maximize2 className="h-4 w-4" />
//                        }
//                      </Button>
//                    </TooltipTrigger>
//                    <TooltipContent>
//                      <p>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen mode'}</p>
//                    </TooltipContent>
//                  </Tooltip>
//                </TooltipProvider>

//                <TooltipProvider>
//                  <Tooltip>
//                    <TooltipTrigger asChild>
//                      <Button
//                        variant="ghost"
//                        size="sm"
//                        onClick={onClear}
//                        className={`hover:text-black ${
//                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                        }`}
//                      >
//                        <Trash className="h-4 w-4" />
//                      </Button>
//                    </TooltipTrigger>
//                    <TooltipContent>
//                      <p>Clear console</p>
//                    </TooltipContent>
//                  </Tooltip>
//                </TooltipProvider>

//                <TooltipProvider>
//                  <Tooltip>
//                    <TooltipTrigger asChild>
//                      <Button
//                        variant="ghost"
//                        size="sm"
//                        onClick={isPinned ? undefined : onClose}
//                        disabled={isPinned}
//                        className={`hover:text-black ${
//                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                        }`}
//                      >
//                        <X className="h-4 w-4" />
//                      </Button>
//                    </TooltipTrigger>
//                    <TooltipContent>
//                      <p>Close console</p>
//                    </TooltipContent>
//                  </Tooltip>
//                </TooltipProvider>
//              </div>
//            </div>

//            {/* Filter and Search Bar */}
//            <AnimatePresence>
//              {isFilterMenuOpen && (
//                <motion.div
//                  initial={{ height: 0, opacity: 0 }}
//                  animate={{ height: 'auto', opacity: 1 }}
//                  exit={{ height: 0, opacity: 0 }}
//                  className={`p-2 border-b ${
//                    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
//                  }`}
//                >
//                  <div className="flex items-center space-x-4">
//                    <div className="flex-1">
//                      <div className="relative">
//                        <Search className={`absolute left-2 top-2.5 h-4 w-4 ${
//                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                        }`} />
//                        <Input
//                          placeholder="Search console output..."
//                          value={searchTerm}
//                          onChange={(e) => setSearchTerm(e.target.value)}
//                          className={`pl-8 ${
//                            isDarkMode 
//                              ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
//                              : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
//                          }`}
//                        />
//                      </div>
//                    </div>
//                    <div>
//                      <ToggleGroup 
//                        type="multiple" 
//                        value={activeFilters} 
//                        onValueChange={(value) => {
//                          if (value.length > 0) setActiveFilters(value);
//                        }}
//                      >
//                        <ToggleGroupItem 
//                          value="log" 
//                          className={`text-xs ${
//                            isDarkMode ? 'data-[state=on]:bg-blue-600' : 'data-[state=on]:bg-blue-200'
//                          }`}
//                        >
//                          Logs
//                        </ToggleGroupItem>
//                        <ToggleGroupItem 
//                          value="error" 
//                          className={`text-xs ${
//                            isDarkMode ? 'data-[state=on]:bg-red-600' : 'data-[state=on]:bg-red-200'
//                          }`}
//                        >
//                          Errors
//                        </ToggleGroupItem>
//                        <ToggleGroupItem 
//                          value="warn" 
//                          className={`text-xs ${
//                            isDarkMode ? 'data-[state=on]:bg-yellow-600' : 'data-[state=on]:bg-yellow-200'
//                          }`}
//                        >
//                          Warnings
//                        </ToggleGroupItem>
//                      </ToggleGroup>
//                    </div>
//                  </div>
//                </motion.div>
//              )}
//            </AnimatePresence>

//            {/* Console Content */}
//            <ScrollArea 
//              ref={scrollAreaRef} 
//              className={`flex-1 p-4 font-mono ${
//                isDarkMode ? 'text-gray-200' : 'text-gray-800'
//              }`}
//            >
//              <motion.div layout className="space-y-2">
//                {filteredLogs.map((log, index) => (
//                  <ConsoleEntry key={index} log={log} isDarkMode={isDarkMode} />
//                ))}
//                {filteredLogs.length === 0 && (
//                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                    {consoleOutput.length === 0 ? 
//                      'No console output (run code)' : 
//                      'No matching console entries'
//                    }
//                  </div>
//                )}
//              </motion.div>
//            </ScrollArea>

//            {/* Status Bar */}
//            <div className={`px-4 py-1 border-t flex justify-between items-center text-xs ${
//              isDarkMode 
//                ? 'border-gray-700 bg-gray-800 text-gray-400' 
//                : 'border-gray-200 bg-gray-50 text-gray-500'
//            }`}>
//              <div>
//                {filteredLogs.length} of {consoleOutput.length} console entries
//              </div>
//              <div>
//                {searchTerm && `Search: "${searchTerm}"`}
//              </div>
//            </div>
//          </div>
//        </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// interface ConsoleLog {
//   type: string;
//   content: string;
//   timestamp?: Date;
// }

// interface ConsoleEntryProps {
//   log: ConsoleLog;
//   isDarkMode: boolean;
// }

// const ConsoleEntry = ({ log, isDarkMode }: ConsoleEntryProps) => {
//   const [isCopied, setIsCopied] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const contentLines = log.content.split('\n');
//   const hasMultipleLines = contentLines.length > 3;
//   const displayLines = isExpanded ? contentLines : contentLines.slice(0, 3);
//   const hiddenLines = contentLines.length - displayLines.length;

//   const copyContent = async () => {
//     await navigator.clipboard.writeText(log.content);
//     setIsCopied(true);
//     setTimeout(() => setIsCopied(false), 2000);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className={cn(
//         "group rounded px-2 py-1 relative",
//         log.type === 'error' 
//           ? `bg-red-500/10 ${isDarkMode ? 'text-red-300' : 'text-red-600'}` 
//           : log.type === 'warn' 
//             ? `bg-yellow-500/10 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`
//             : isDarkMode
//               ? 'bg-gray-700/50 text-gray-200'
//               : 'bg-gray-100/50 text-gray-700'
//       )}
//     >
//       <div className="flex items-start space-x-2">
//         {hasMultipleLines && (
//           <Button
//             variant="ghost"
//             size="sm"
//             className="p-0 h-6 w-6 mt-0.5"
//             onClick={() => setIsExpanded(!isExpanded)}
//           >
//             {isExpanded ? (
//               <ChevronDown className="h-4 w-4" />
//             ) : (
//               <ChevronRight className="h-4 w-4" />
//             )}
//           </Button>
//         )}

//         <div className="mt-1">
//           {log.type === 'error' ? '⚠️' : log.type === 'warn' ? '⚡' : '→'}
//         </div>

//         <div className="flex-1 break-all whitespace-pre-wrap">
//           {displayLines.map((line, i) => (
//             <React.Fragment key={i}>
//               {line}
//               {i < displayLines.length - 1 && <br />}
//             </React.Fragment>
//           ))}

//           {!isExpanded && hiddenLines > 0 && (
//             <Button
//               variant="link"
//               size="sm"
//               className={`px-1 py-0 h-auto ${
//                 isDarkMode ? 'text-blue-300' : 'text-blue-600'
//               }`}
//               onClick={() => setIsExpanded(true)}
//             >
//               + {hiddenLines} more {hiddenLines === 1 ? 'line' : 'lines'}
//             </Button>
//           )}
//         </div>

//         <Button
//           variant="ghost"
//           size="sm"
//           className="opacity-0 group-hover:opacity-100 transition-opacity"
//           onClick={copyContent}
//         >
//           {isCopied ? (
//             <motion.span
//               initial={{ scale: 0.5 }}
//               animate={{ scale: 1 }}
//               className="text-green-400"
//             >
//               ✓
//             </motion.span>
//           ) : (
//             <Copy className="h-4 w-4" />
//           )}
//         </Button>
//       </div>

//       {log.timestamp && (
//         <div className={`text-xs absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity ${
//           isDarkMode ? 'text-gray-400' : 'text-gray-500'
//         }`}>
//           {new Date(log.timestamp).toLocaleTimeString()}
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default ConsoleOutput;
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  X,
  Copy,
  Trash,
  Download,
  Filter,
  Search,
  Pin,
  Maximize,
  Minimize,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  Info,
  Terminal,
  ToggleRight,
  Settings,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface ConsoleOutputProps {
  isOpen: boolean;
  onClose: () => void;
  consoleOutput: Array<{ type: string; content: string; timestamp?: Date }>;
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
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(height);
  const containerRef = useRef(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'log' | 'error' | 'warn'>('all');
  const [activeTab, setActiveTab] = useState('console');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Performance optimization
  const consoleContainerRef = useRef<HTMLDivElement>(null);

  // Auto-expand for errors
  const [autoExpandErrors, setAutoExpandErrors] = useState(true);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All', count: consoleOutput.length },
    { value: 'log', label: 'Logs', count: consoleOutput.filter(log => log.type === 'log').length },
    { value: 'error', label: 'Errors', count: consoleOutput.filter(log => log.type === 'error').length },
    { value: 'warn', label: 'Warnings', count: consoleOutput.filter(log => log.type === 'warn').length },
    { value: 'info', label: 'Info', count: consoleOutput.filter(log => log.type === 'info').length }
  ];

  // Filter logs based on active filter and search term
  const filteredLogs = useMemo(() => {
    let filtered = consoleOutput;

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === activeFilter);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => log.content.toLowerCase().includes(term));
    }

    return filtered;
  }, [consoleOutput, activeFilter, searchTerm]);

  // Auto scroll to bottom when new logs come in
  useEffect(() => {
    if (isAutoScrollEnabled && consoleContainerRef.current) {
      const container = consoleContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [filteredLogs, isAutoScrollEnabled]);

  // Handle mouse movement for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = dragStartY.current - e.clientY;
      const maxHeight = window.innerHeight * 0.8; // Maximum 80% of viewport height
      const newHeight = Math.min(Math.max(250, dragStartHeight.current + deltaY), maxHeight);
      onHeightChange(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, onHeightChange]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    setIsDragging(true);
  };

  // Export console logs as a file
  const exportLogs = () => {
    const logsText = filteredLogs
      .map(log => {
        const timestamp = log.timestamp
          ? new Date(log.timestamp).toISOString()
          : new Date().toISOString();
        return `[${timestamp}] [${log.type.toUpperCase()}] ${log.content}`;
      })
      .join('\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle maximized state
  const toggleMaximized = () => {
    setIsMaximized(!isMaximized);
  };

  // Preview JSON for objects in console
  const parseAndFormatJSON = (content: string) => {
    try {
      // Check if content is JSON
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      // Not valid JSON, return as is
    }
    return content;
  };

  // Keyboard shortcut to clear console (Ctrl+L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        onClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear]);

  // Calculate console stats
  const consoleStats = {
    total: consoleOutput.length,
    errors: consoleOutput.filter(log => log.type === 'error').length,
    warnings: consoleOutput.filter(log => log.type === 'warn').length,
    infos: consoleOutput.filter(log => log.type === 'info').length,
    logs: consoleOutput.filter(log => log.type === 'log').length,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isMaximized ? '80vh' : height,
            opacity: 1,
            bottom: 0,
          }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className={`fixed ${isSidebarOpen ? 'left-80' : 'left-0'} right-0 ${isDarkMode
              ? 'bg-slate-900 border-t border-slate-700/50'
              : 'bg-white border-t border-slate-200'
            } backdrop-blur-sm shadow-lg`}
          style={{ zIndex: 10 }}
        >
          {/* Drag Handle */}
          <div
            className="absolute -top-3 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center"
            onMouseDown={handleDragStart}
          >
            <div className={`w-20 h-1 ${isDarkMode
                ? 'bg-slate-600 hover:bg-blue-500'
                : 'bg-slate-300 hover:bg-blue-400'
              } rounded-full transition-colors duration-300`} />
          </div>

          <div className="h-full flex flex-col">
            {/* Console Header */}
            <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode
                ? 'border-slate-700/50 bg-slate-900/95'
                : 'border-slate-200 bg-white/95'
              } backdrop-blur-sm`}>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className={`${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'} hover:bg-transparent`}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <div className="flex items-center">
                  <Terminal className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                  <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                    Console
                  </span>
                </div>

                {consoleStats.total > 0 && (
                  <div className="flex items-center space-x-1.5 ml-3">
                    {consoleStats.errors > 0 && (
                      <Badge variant="destructive" className="px-1.5 py-0 h-5 text-xs font-mono flex items-center bg-red-500/20 text-red-400 border border-red-500/30">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {consoleStats.errors}
                      </Badge>
                    )}
                    {consoleStats.warnings > 0 && (
                      <Badge variant="outline" className="px-1.5 py-0 h-5 text-xs font-mono flex items-center bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        !
                        {consoleStats.warnings}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Search Filter */}
                <div className="relative mr-2 group">
                  <div className="flex items-center space-x-1 bg-slate-800/50 rounded-md border border-slate-700/50 px-2">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Filter logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-7 px-1 py-0 w-36 bg-transparent border-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 hover:bg-transparent"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-3 w-3 text-slate-400 hover:text-slate-200" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filter Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`px-2 py-1 h-7 text-xs gap-1 ${isDarkMode
                          ? 'bg-slate-800 border-slate-700/50 hover:bg-slate-700'
                          : 'bg-slate-200 border-slate-300/50'
                        }`}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      <span className="capitalize">{activeFilter}</span>
                      {activeFilter !== 'all' && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">
                          {filterOptions.find(opt => opt.value === activeFilter)?.count || 0}
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={`p-1 w-40 ${isDarkMode
                        ? 'bg-slate-800 border-slate-700/50'
                        : 'bg-white border-slate-200'
                      }`}
                    side="bottom"
                    align="end"
                  >
                    <div className="space-y-1">
                      {filterOptions.map(option => (
                        <Button
                          key={option.value}
                          variant={activeFilter === option.value ? "secondary" : "ghost"}
                          size="sm"
                          className={`w-full justify-between ${activeFilter === option.value
                              ? 'bg-blue-500/20 text-blue-400'
                              : ''
                            }`}
                          onClick={() => setActiveFilter(option.value as any)}
                        >
                          <span className="capitalize">{option.label}</span>
                          <Badge
                            variant="outline"
                            className={`ml-2 px-1.5 py-0 h-5 text-xs ${activeFilter === option.value
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                : isDarkMode
                                  ? 'bg-slate-700 text-slate-400 border-slate-600/50'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                          >
                            {option.count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Auto-scroll Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isAutoScrollEnabled
                      ? isDarkMode
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                        : 'text-blue-600 bg-blue-500/10 border border-blue-500/30'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                  title={isAutoScrollEnabled ? "Auto-scroll enabled" : "Auto-scroll disabled"}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>

                {/* Pin Console */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isPinned
                      ? isDarkMode
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                        : 'text-amber-600 bg-amber-500/10 border border-amber-500/30'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  onClick={() => setIsPinned(!isPinned)}
                  title={isPinned ? "Console pinned" : "Pin console"}
                >
                  <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
                </Button>

                {/* Toggle Maximize */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isDarkMode
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                  onClick={toggleMaximized}
                  title={isMaximized ? "Restore console" : "Maximize console"}
                >
                  {isMaximized ?
                    <Minimize className="h-3.5 w-3.5" /> :
                    <Maximize className="h-3.5 w-3.5" />
                  }
                </Button>

                {/* Settings Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isSettingsOpen
                      ? isDarkMode
                        ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                        : 'text-blue-600 bg-blue-500/10 border border-blue-500/30'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  title="Console settings"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>

                {/* Export Logs */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isDarkMode
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                  onClick={exportLogs}
                  title="Export logs"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>

                {/* Clear Console */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isDarkMode
                      ? 'text-slate-400 hover:text-red-400'
                      : 'text-slate-500 hover:text-red-500'
                    }`}
                  onClick={onClear}
                  title="Clear console (Ctrl+L)"
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>

                {/* Close Console */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isDarkMode
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                  onClick={onClose}
                  title="Close console"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`border-b ${isDarkMode
                      ? 'border-slate-700/50 bg-slate-800/50'
                      : 'border-slate-200 bg-slate-100/50'
                    }`}
                >
                  <div className="p-3 grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">Show timestamps</span>
                      </div>
                      <Switch
                        checked={showTimestamps}
                        onCheckedChange={setShowTimestamps}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">Auto-expand errors</span>
                      </div>
                      <Switch
                        checked={autoExpandErrors}
                        onCheckedChange={setAutoExpandErrors}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-slate-400" />
                          Font Size: {fontSize}px
                        </span>
                      </div>
                      <Slider
                        value={[fontSize]}
                        min={10}
                        max={18}
                        step={1}
                        onValueChange={(value) => setFontSize(value[0])}
                        className="py-2"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Console Content */}
            <div
              ref={consoleContainerRef}
              className={`flex-1 p-3 font-mono text-sm overflow-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-800'
                }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <ConsoleEntry
                      key={index}
                      log={{
                        ...log,
                        timestamp: log.timestamp || new Date(),
                      }}
                      isDarkMode={isDarkMode}
                      showTimestamp={showTimestamps}
                      autoExpand={autoExpandErrors && log.type === 'error'}
                    />
                  ))
                ) : searchTerm ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`py-6 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="h-8 w-8 mb-2 opacity-20" />
                      <div>No logs matching "{searchTerm}"</div>
                      <Button
                        variant="link"
                        className="text-xs text-blue-400"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear search
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`py-6 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Terminal className="h-8 w-8 mb-3 opacity-20" />
                      <div>Console is empty</div>
                      <div className="text-xs mt-1 opacity-70">Run code to see output</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ConsoleLog {
  type: string;
  content: string;
  timestamp?: Date;
}

interface ConsoleEntryProps {
  log: ConsoleLog;
  isDarkMode: boolean;
  showTimestamp?: boolean;
  autoExpand?: boolean;
}

const ConsoleEntry = ({ log, isDarkMode, showTimestamp = false, autoExpand = false }: ConsoleEntryProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const contentLines = log.content.split('\n');
  const hasMultipleLines = contentLines.length > 4;
  const isJsonContent = log.content.trim().startsWith('{') || log.content.trim().startsWith('[');

  // Format timestamps
  const formattedTime = new Date(log.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const copyContent = async () => {
    await navigator.clipboard.writeText(log.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Format JSON content
  const formattedContent = useMemo(() => {
    if (isJsonContent) {
      try {
        const parsedContent = JSON.parse(log.content);
        return JSON.stringify(parsedContent, null, 2);
      } catch (e) {
        return log.content;
      }
    }
    return log.content;
  }, [log.content, isJsonContent]);

  // Dynamically determine content height
  // Dynamically determine content height
  const contentMaxHeight = isExpanded ? '1000px' : hasMultipleLines ? '6em' : 'none';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group rounded-md px-3 py-1.5 my-1 flex items-start space-x-2 relative hover:bg-opacity-80 transition-colors border",
        log.type === 'error'
          ? isDarkMode
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-red-500/10 border-red-500/20 text-red-600'
          : log.type === 'warn'
            ? isDarkMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
            : log.type === 'info'
              ? isDarkMode
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-600'
              : isDarkMode
                ? 'bg-slate-800/70 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100/70 border-slate-200/50 text-slate-700 hover:bg-slate-100'
      )}
    >
      {/* Log type indicator */}
      <div className="mt-0.5 flex-shrink-0">
        {log.type === 'error' ? (
          <div className="bg-red-500/20 text-red-500 h-5 w-5 rounded-full flex items-center justify-center">
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
        ) : log.type === 'warn' ? (
          <div className="bg-amber-500/20 text-amber-500 h-5 w-5 rounded-full flex items-center justify-center">
            !
          </div>
        ) : log.type === 'info' ? (
          <div className="bg-blue-500/20 text-blue-500 h-5 w-5 rounded-full flex items-center justify-center">
            <Info className="h-3.5 w-3.5" />
          </div>
        ) : (
          <div className="bg-slate-500/20 text-slate-500 h-5 w-5 rounded-full flex items-center justify-center">
            <Terminal className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      {/* Timestamp if enabled */}
      {showTimestamp && (
        <div className={`text-xs mt-0.5 font-mono flex-shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
          {formattedTime}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 break-all">
        {hasMultipleLines || isJsonContent ? (
          <div className="relative">
            <div
              className={`overflow-hidden transition-all duration-300 ${isExpanded ? '' : 'line-clamp-4'}`}
              style={{ maxHeight: contentMaxHeight }}
            >
              <pre className="whitespace-pre-wrap text-xs leading-5">
                {formattedContent}
              </pre>
            </div>

            {hasMultipleLines && (
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -bottom-1 -right-1 h-5 text-xs px-1.5 py-0 ${isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    : 'bg-white hover:bg-slate-100 text-slate-500'
                  }`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Collapse' : `Show ${contentLines.length} lines`}
              </Button>
            )}
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{log.content}</div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0.5"
          onClick={copyContent}
          title="Copy to clipboard"
        >
          {isCopied ? (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-green-400 flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 14L8.5 17.5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Left border indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full ${log.type === 'error'
          ? 'bg-red-500'
          : log.type === 'warn'
            ? 'bg-amber-500'
            : log.type === 'info'
              ? 'bg-blue-500'
              : isDarkMode
                ? 'bg-slate-700'
                : 'bg-slate-300'
        }`} />
    </motion.div>
  );
};

export default ConsoleOutput;