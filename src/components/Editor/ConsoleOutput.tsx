import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, X, Copy, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ConsoleOutputProps {
  isOpen: boolean;
  onClose: () => void;
  consoleOutput: Array<{ type: string; content: string }>;
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

  useEffect(() => {
    const handleMouseMove = (e:any) => {
      if (!isDragging) return;
      
      const deltaY = dragStartY.current - e.clientY;
      const maxHeight = window.innerHeight * 0.8; // Maximum 80% of viewport height
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

  const handleDragStart = (e:any) => {
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    setIsDragging(true);
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
       className={`fixed bottom-0 ${isSidebarOpen ? 'left-80' : 'left-0'} right-0 ${
         isDarkMode 
           ? 'bg-gray-800 border-t border-gray-700' 
           : 'bg-white border-t border-gray-200'
       }`}
       style={{ zIndex: 0 }}
     >
       {/* Drag Handle */}
       <div
         className="absolute -top-3 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center"
         onMouseDown={handleDragStart}
       >
         <div className={`w-20 h-1 ${
           isDarkMode 
             ? 'bg-gray-600 hover:bg-gray-500' 
             : 'bg-gray-300 hover:bg-gray-400'
         } rounded-full transition-colors`} />
       </div>
     
       <div className="h-full flex flex-col">
         {/* Console Header */}
         <div className={`flex items-center justify-between px-4 py-2 border-b ${
           isDarkMode 
             ? 'border-gray-700' 
             : 'border-gray-200'
         }`}>
           <div className="flex items-center space-x-2">
             <Button 
               variant="ghost" 
               size="sm"
               onClick={onClose}
               className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
             >
               <ChevronDown className="h-4 w-4" />
             </Button>
             <span className={`text-base font-medium ${
               isDarkMode ? 'text-white' : 'text-gray-900'
             }`}>Console Output</span>
           </div>
           <div className="flex items-center space-x-2">
             <Button
               variant="ghost"
               size="sm"
               onClick={onClear}
               className={`hover:text-black ${
                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}
             >
               <Trash className="h-4 w-4" />
             </Button>
             <Button
               variant="ghost"
               size="sm"
               onClick={onClose}
               className={`hover:text-black ${
                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}
             >
               <X className="h-4 w-4" />
             </Button>
           </div>
         </div>
     
         {/* Console Content */}
         <ScrollArea className={`flex-1 p-4 font-mono ${
           isDarkMode ? 'text-gray-200' : 'text-gray-800'
         }`}>
           <motion.div layout className="space-y-2">
             {consoleOutput.map((log, index) => (
               <ConsoleEntry key={index} log={log} isDarkMode={isDarkMode} />
             ))}
             {consoleOutput.length === 0 && (
               <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                 No console output (run code)
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
}
interface ConsoleEntryProps {
  log: ConsoleLog;
  isDarkMode: boolean;
}

const ConsoleEntry = ({ log, isDarkMode }: ConsoleEntryProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyContent = async () => {
    await navigator.clipboard.writeText(log.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const contentLines = log.content.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group rounded px-2 py-1 flex items-start space-x-2",
        log.type === 'error' 
          ? 'bg-red-500/10 text-red-400' 
          : log.type === 'warn' 
            ? 'bg-yellow-500/10 text-yellow-400'
            : isDarkMode
              ? 'bg-gray-700/50 text-gray-200'
              : 'bg-gray-100/50 text-gray-700'
      )}
    >
      <div className="mt-1">
        {log.type === 'error' ? '⚠️' : log.type === 'warn' ? '⚡' : '→'}
      </div>
      <div className="flex-1 break-all whitespace-pre-wrap">
        {contentLines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < contentLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyContent}
      >
        {isCopied ? (
          <motion.span
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-green-400"
          >
            ✓
          </motion.span>
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  );
};

export default ConsoleOutput;