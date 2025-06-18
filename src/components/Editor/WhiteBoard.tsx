"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo, Redo, Trash2, Square, Circle, Minus, Pencil, Download, Type, Image as ImageIcon, SquareActivityIcon, SquareDashed, Crop, TypeOutline, CircleChevronRight, SquareChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WhiteboardProps {
  isOpen: boolean;
  onToggle: () => void;
}

type Tool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text' | 'image';
type DrawingAction = {
  tool: Tool;
  paths: { x: number; y: number; pressure?: number }[];
  color: string;
  width: number;
  text?: string;
  image?: string;
  x?: number;
  y?: number;
  width2?: number;
  height?: number;
};

const Whiteboard: React.FC<WhiteboardProps> = ({ isOpen, onToggle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(2);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawingAction | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);

  // Initialize canvas and context
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);
    }
    
    // Set canvas size
    resizeCanvas();
    
    // Add resize event listener
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isOpen]);

  // Redraw canvas on actions change
  useEffect(() => {
    if (!context || !canvasRef.current) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw all actions
    actions.forEach(action => {
      drawAction(action);
    });
  }, [actions, context]);

  // Resize canvas function
  const resizeCanvas = () => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Preserve drawings after resize
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      // Redraw all actions
      actions.forEach(action => {
        drawAction(action);
      });
    }
  };

  // Draw a single action
  const drawAction = (action: DrawingAction) => {
    if (!context || !canvasRef.current) return;
    
    context.strokeStyle = action.color;
    context.lineWidth = action.width;
    
    switch (action.tool) {
      case 'pen':
        if (action.paths.length < 2) return;
        
        context.beginPath();
        context.moveTo(action.paths[0].x, action.paths[0].y);
        
        for (let i = 1; i < action.paths.length; i++) {
          context.lineTo(action.paths[i].x, action.paths[i].y);
        }
        
        context.stroke();
        break;
        
      case 'eraser':
        if (action.paths.length < 2) return;
        
        const originalColor = context.strokeStyle;
        context.strokeStyle = '#ffffff';
        
        context.beginPath();
        context.moveTo(action.paths[0].x, action.paths[0].y);
        
        for (let i = 1; i < action.paths.length; i++) {
          context.lineTo(action.paths[i].x, action.paths[i].y);
        }
        
        context.stroke();
        context.strokeStyle = originalColor;
        break;
        
      case 'line':
        if (action.paths.length < 2) return;
        
        context.beginPath();
        context.moveTo(action.paths[0].x, action.paths[0].y);
        context.lineTo(action.paths[action.paths.length - 1].x, action.paths[action.paths.length - 1].y);
        context.stroke();
        break;
        
      case 'rectangle':
        if (action.paths.length < 2) return;
        
        const startX = action.paths[0].x;
        const startY = action.paths[0].y;
        const endX = action.paths[action.paths.length - 1].x;
        const endY = action.paths[action.paths.length - 1].y;
        
        const width = endX - startX;
        const height = endY - startY;
        
        context.beginPath();
        context.rect(startX, startY, width, height);
        context.stroke();
        break;
        
      case 'circle':
        if (action.paths.length < 2) return;
        
        const startPoint = action.paths[0];
        const endPoint = action.paths[action.paths.length - 1];
        
        const radius = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
        );
        
        context.beginPath();
        context.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        context.stroke();
        break;
        
      case 'text':
        if (!action.text || action.x === undefined || action.y === undefined) return;
        
        context.font = `${action.width * 5}px sans-serif`;
        context.fillStyle = action.color;
        context.fillText(action.text, action.x, action.y);
        break;
        
      case 'image':
        if (!action.image || action.x === undefined || action.y === undefined) return;
        
        const img = new Image();
        img.src = action.image;
        img.onload = () => {
          if (!context) return;
          if (action.width2 && action.height) {
            context.drawImage(img, action.x!, action.y!, action.width2, action.height);
          } else {
            context.drawImage(img, action.x!, action.y!);
          }
        };
        break;
    }
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAddingText) return;
    
    setIsDrawing(true);
    
    // Create a new action
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newAction: DrawingAction = {
      tool: currentTool,
      paths: [{ x, y }],
      color: currentColor,
      width: currentWidth,
    };
    
    if (currentTool === 'text') {
      setTextPosition({ x, y });
      setIsAddingText(true);
      return;
    }
    
    setCurrentAction(newAction);
    setRedoStack([]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction || isAddingText) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add new point to current action
    setCurrentAction({
      ...currentAction,
      paths: [...currentAction.paths, { x, y }],
    });
    
    // Draw preview
    if (!context || !canvasRef.current) return;
    
    // Clear canvas and redraw all actions including the current one
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw all completed actions
    actions.forEach(action => {
      drawAction(action);
    });
    
    // Draw current action
    drawAction({
      ...currentAction,
      paths: [...currentAction.paths, { x, y }],
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAction || isAddingText) return;
    
    // Add current action to actions array
    setActions([...actions, currentAction]);
    setCurrentAction(null);
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  // Handle text input
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput && textPosition) {
      const newAction: DrawingAction = {
        tool: 'text',
        paths: [],
        color: currentColor,
        width: currentWidth,
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
      };
      
      setActions([...actions, newAction]);
      setTextInput('');
      setTextPosition(null);
      setIsAddingText(false);
    }
    
    if (e.key === 'Escape') {
      setTextInput('');
      setTextPosition(null);
      setIsAddingText(false);
    }
  };

  // Handle undo/redo
  const handleUndo = () => {
    if (actions.length === 0) return;
    
    const lastAction = actions[actions.length - 1];
    const newActions = actions.slice(0, -1);
    
    setActions(newActions);
    setRedoStack([...redoStack, lastAction]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const lastRedoAction = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    setActions([...actions, lastRedoAction]);
    setRedoStack(newRedoStack);
  };

  // Handle clear
  const handleClear = () => {
    setActions([]);
    setRedoStack([]);
    
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Handle export
  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const target = event.target;
      if (!target || !target.result) return;
      
      const img = new Image();
      img.src = target.result as string;
      
      img.onload = () => {
        if (!canvasRef.current) return;
        
        // Calculate dimensions to maintain aspect ratio
        const maxWidth = canvasRef.current.width / 2;
        const maxHeight = canvasRef.current.height / 2;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width = width * ratio;
        }
        
        // Create action for image
        const newAction: DrawingAction = {
          tool: 'image',
          paths: [],
          color: currentColor,
          width: currentWidth,
          image: target.result as string,
          x: canvasRef.current.width / 4,
          y: canvasRef.current.height / 4,
          width2: width,
          height: height,
        };
        
        setActions([...actions, newAction]);
      };
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 h-full max-w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 bg-gray-100 shadow-lg z-40 flex flex-col"
        >
          {/* Whiteboard header - upgraded UI */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="mr-2 text-gray-200 hover:text-white hover:bg-gray-700/50"
              >
                <SquareChevronRight className="h-14 w-14" />
              </Button>
              <h2 className="text-xl font-semibold bg-neutral-100  bg-clip-text text-transparent">
                Whiteboard
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Color picker with enhanced UI */}
              <div className="flex items-center rounded-lg  p-2 shadow-inner justify-center mx-auto">
                <div className="relative group mr-4">
                  <div className="absolute -inset-0.5 bg-black rounded-full opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="relative w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 bg-white"
                  />
                </div>
                <div className="w-32">
                  <span className="block text-xs text-gray-300 mb-1">Stroke: {currentWidth}px</span>
                  <Slider
                    value={[currentWidth]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(value) => setCurrentWidth(value[0])}
                    className="h-4"
                  />
                </div>
              </div>
              
              <div className="flex bg-gray-800/70 p-1 rounded-lg space-x-1 shadow-inner">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUndo}
                  disabled={actions.length === 0}
                  className="text-gray-300 hover:text-white hover:bg-gray-700/70 disabled:opacity-40"
                >
                  <Undo className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="text-gray-300 hover:text-white hover:bg-gray-700/70 disabled:opacity-40"
                >
                  <Redo className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="text-gray-300 hover:text-red-400 hover:bg-gray-700/70"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExport}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Download className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white flex items-center gap-1 px-3"
                    >
                      <ImageIcon className="h-5 w-5" />
                      <span>Add Image</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                    <DropdownMenuItem className="focus:bg-gray-700 focus:text-white hover:bg-gray-700">
                      <label className="cursor-pointer w-full flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {/* Toolbar - upgraded UI */}
          <div className="p-2 border-b bg-gray-800 shadow-md">
            <div className="flex items-center justify-center bg-gray-900/50 rounded-lg p-1.5 w-full mx-auto gap-6 overflow-auto">
              {[
                { tool: 'pen', icon: Pencil, label: 'Pen' },
                { tool: 'line', icon: Minus, label: 'Line' },
                { tool: 'rectangle', icon: Crop, label: 'Rectangle' },
                { tool: 'circle', icon: Circle, label: 'Circle' },
                { tool: 'text', icon: TypeOutline, label: 'Text' },
                { tool: 'eraser', icon: Trash2, label: 'Eraser' },
              ].map(item => (
                <Button
                  key={item.tool}
                  variant={currentTool === item.tool ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentTool(item.tool as Tool)}
                  className={`relative mx-1 flex items-center ${
                    currentTool === item.tool 
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white' 
                      : 'bg-gray-800/70 text-gray-300 hover:text-white hover:bg-gray-700'
                  } rounded-md transition-all duration-200`}
                >
                  <item.icon className={`h-4 w-4 mr-1 ${currentTool === item.tool ? 'text-white' : 'text-gray-400'}`} />
                  {item.label}
                  {currentTool === item.tool && (
                    <motion.div 
                      layoutId="activeTool" 
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-400 rounded-md -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Canvas container */}
          <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden bg-white"
          >
            {/* Grid pattern background */}
            <div className="absolute inset-0 bg-grid-small text-gray-200 opacity-30"></div>
            
            {/* Canvas element */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="absolute inset-0 cursor-crosshair z-10"
            />
            
            {/* Tool indicator - appears next to cursor when drawing */}
            {isDrawing && currentTool === 'pen' && (
              <div 
                className="fixed w-5 h-5 rounded-full border-2 border-gray-900 z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-70"
                style={{ 
                  backgroundColor: currentColor,
                  width: `${currentWidth * 2}px`, 
                  height: `${currentWidth * 2}px`,
                  left: currentAction?.paths[currentAction.paths.length-1]?.x,
                  top: currentAction?.paths[currentAction.paths.length-1]?.y
                }}
              ></div>
            )}
            
            {/* Tool tips for various tools */}
            {!isDrawing && !isAddingText && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 text-white px-3 py-1.5 rounded-full text-sm z-10 backdrop-blur-sm">
                {currentTool === 'pen' && "Click and drag to draw freely"}
                {currentTool === 'eraser' && "Click and drag to erase"}
                {currentTool === 'line' && "Click and drag to create a line"}
                {currentTool === 'rectangle' && "Click and drag to create a rectangle"}
                {currentTool === 'circle' && "Click and drag to create a circle"}
                {currentTool === 'text' && "Click where you want to add text"}
              </div>
            )}
            
            {/* Enhanced text input overlay */}
            {isAddingText && textPosition && (
              <div
                style={{
                  position: 'absolute',
                  left: textPosition.x,
                  top: textPosition.y - 40,
                  zIndex: 20,
                }}
              >
                <div className="bg-white border-2 border-cyan-500 rounded-lg shadow-lg p-1">
                  <input
                    type="text"
                    value={textInput}
                    onChange={handleTextInputChange}
                    onKeyDown={handleTextInputKeyDown}
                    autoFocus
                    placeholder="Type and press Enter"
                    className="outline-none px-2 py-1 text-sm bg-transparent w-48"
                  />
                  <div className="text-xs text-gray-500 px-2 pb-1">
                    Press Enter to add or Escape to cancel
                  </div>
                </div>
                <div className="w-4 h-4 bg-white border-l-2 border-b-2 border-cyan-500 transform rotate-45 absolute -bottom-2 left-4 z-10"></div>
              </div>
            )}
            
            {/* "Powered by" watermark */}
            <div className="absolute bottom-2 right-3 text-gray-400 text-sm font-medium opacity-70 select-none z-10 pointer-events-none">
              <span className="mr-1">Powered by</span>
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-transparent bg-clip-text font-bold">
                Code Connect
              </span>
            </div>
            
            {/* Current coordinates indicator for precision work */}
            <div className="absolute top-2 left-3 bg-gray-800/60 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-md opacity-70 z-10 pointer-events-none">
              {currentAction?.paths[currentAction.paths.length-1]?.x?.toFixed(0) || "0"}, 
              {currentAction?.paths[currentAction.paths.length-1]?.y?.toFixed(0) || "0"}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Whiteboard;