"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, ChevronRight, Copy, Check, Loader2, SendIcon, BotOffIcon, BotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import OpenAI from 'openai';
import { FuturisticInput } from '../Dashboard/buttons/FuturisticInput';
import { PlaceholdersAndVanishInput } from '../ui/placeholders-and-vanish-input';
const { GoogleGenerativeAI } = require("@google/generative-ai");

const messageAnimations = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative my-2 rounded-lg overflow-hidden bg-gray-900 border border-gray-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <span className="text-xs text-gray-400">
          {language || 'code'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyCode}
          className="h-8 px-2 hover:bg-gray-700"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
          {code}
        </code>
      </pre>
    </div>
  );
};

interface MessagePart {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

const formatMessage = (content: string): MessagePart[] => {
  const parts: MessagePart[] = [];
  let currentText = '';
  let inCodeBlock = false;
  let currentCode = '';
  let language = '';

  // Handle null or undefined content
  if (!content) {
    return [{ type: 'text', content: '' }];
  }

  // Fix malformed markdown bullet points and asterisks
  let fixedContent = content;

  // Fix incomplete or malformed markdown patterns
  // Handle asterisks that might be used for bold/italic but aren't properly paired
  const asteriskRegex = /\*\*(?!\s*\*\*)(.*?)(?<!\s*\*\*)\*\*/g;
  fixedContent = fixedContent.replace(asteriskRegex, '<strong>$1</strong>');

  // Handle single asterisks for italic
  const italicRegex = /\*(?!\s*\*)(.*?)(?<!\s*\*)\*/g;
  fixedContent = fixedContent.replace(italicRegex, '<em>$1</em>');

  // Fix bullet points that might be malformed
  fixedContent = fixedContent.replace(/^\s*\*\s+/gm, '• ');

  const lines = fixedContent.split('\n');

  for (const line of lines) {
    // Check for code block markers
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        parts.push({ type: 'code', content: currentCode.trim(), language });
        currentCode = '';
        language = '';
        inCodeBlock = false;
      } else {
        // Start of code block
        if (currentText) {
          parts.push({ type: 'text', content: currentText.trim() });
          currentText = '';
        }
        language = line.slice(3).trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      currentCode += line + '\n';
    } else {
      currentText += line + '\n';
    }
  }

  // Handle unclosed code blocks
  if (inCodeBlock && currentCode) {
    parts.push({ type: 'code', content: currentCode.trim(), language });
  }

  // Add remaining text
  if (currentText) {
    parts.push({ type: 'text', content: currentText.trim() });
  }

  return parts;
};

export const MessageContent = ({ content }: { content: string }) => {
  const parts = formatMessage(content);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <CodeBlock
                code={part.content}
                language={part.language ?? 'text'}
              />
            </motion.div>
          );
        }

        // Process regular text with improved styling and animations
        const paragraphs = part.content.split('\n\n');

        return (
          <React.Fragment key={index}>
            {paragraphs.map((paragraph, pIndex) => (
              <motion.p
                key={`${index}-${pIndex}`}
                className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: (index * 0.1) + (pIndex * 0.05),
                  ease: "easeOut"
                }}
                dangerouslySetInnerHTML={{
                  __html: paragraph
                    // Replace asterisk bullet points with proper bullet points
                    .replace(/^\s*\*\s+/gm, '• ')
                    // Ensure any remaining HTML tags are properly escaped
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    // Then un-escape our specifically added HTML tags
                    .replace(/&lt;strong&gt;/g, '<strong>')
                    .replace(/&lt;\/strong&gt;/g, '</strong>')
                    .replace(/&lt;em&gt;/g, '<em>')
                    .replace(/&lt;\/em&gt;/g, '</em>')
                }}
              />
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const MessageContainer = React.forwardRef<HTMLDivElement, React.PropsWithChildren<{}>>(
  ({ children }, ref) => (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-6" ref={ref}>
        {children}
      </div>
    </ScrollArea>
  )
);

MessageContainer.displayName = 'MessageContainer';

const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "",
    "X-Title": "CodeConnect"
  }
});

// client = genai.Client(api_key="AIzaSyCF6mKRofVaWa-4RC6hjYQtijNqxOZSt58")

const EmptyState = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center  h-full py-48 px-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* <motion.div
        className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-700 via-blue-500 to-blue-400 flex items-center justify-center relative overflow-hidden shadow-xl"
        animate={{
          scale: [1, 1.05, 0.98, 1.05, 1],
          rotate: [0, 2, 0, -2, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600/40 via-blue-300/30 to-sky-400/40"
          style={{
            backgroundSize: "400% 100%"
          }}
          animate={{
            backgroundPosition: ["0% center", "100% center", "0% center"]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-800/30 via-cyan-400/25 to-blue-500/30"
          style={{
            backgroundSize: "200% 200%",
            mixBlendMode: "soft-light"
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0)",
              "0 0 0 10px rgba(59, 130, 246, 0.15)",
              "0 0 0 20px rgba(59, 130, 246, 0.1)",
              "0 0 0 30px rgba(59, 130, 246, 0.05)",
              "0 0 0 0 rgba(59, 130, 246, 0)"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />

        <motion.div
          className="absolute w-full h-full rounded-full bg-gradient-to-r from-blue-200/30 via-transparent to-blue-200/30"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="relative w-full h-full">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-100"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                filter: "blur(0.5px)"
              }}
              animate={{
                y: [Math.random() * -18, Math.random() * 18, Math.random() * -18],
                x: [Math.random() * -18, Math.random() * 18, Math.random() * -18],
                opacity: [0.5, 0.9, 0.5],
                scale: [0.8, 1.6, 0.8]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-white/60 via-blue-200/40 to-blue-300/20"
          animate={{
            opacity: [0.6, 0.8, 0.6],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: 3,
            repeat: Infinity
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(219, 234, 254, 0.4) 0%, transparent 70%)"
          }}
          animate={{
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />

        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-2 bg-blue-300/30"
            style={{
              borderRadius: "2px",
              filter: "blur(2px)",
              transformOrigin: "center",
              rotate: `${i * 60}deg`
            }}
            animate={{
              rotate: [`${i * 60}deg`, `${i * 60 + 180}deg`, `${i * 60 + 360}deg`],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div> */}

<motion.div
  className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-500 flex items-center justify-center relative overflow-hidden shadow-xl"
  animate={{
    scale: [1, 1.05, 0.98, 1.05, 1],
    rotate: [0, 2, 0, -2, 0],
  }}
  transition={{
    duration: 10,
    repeat: Infinity,
    repeatType: "loop",
    ease: "easeInOut"
  }}
>
  {/* Main background shimmer effect */}
  <motion.div
    className="absolute inset-0 rounded-full bg-gradient-to-r from-white/30 via-blue-200/20 to-white/30"
    style={{
      backgroundSize: "400% 100%"
    }}
    animate={{
      backgroundPosition: ["0% center", "100% center", "0% center"]
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
  
  {/* Diagonal flowing gradient */}
  <motion.div
    className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100/20 via-white/25 to-blue-100/20"
    style={{
      backgroundSize: "200% 200%",
      mixBlendMode: "soft-light"
    }}
    animate={{
      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
    }}
    transition={{
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
      repeatType: "reverse"
    }}
  />
  
  {/* Enhanced pulse rings */}
  <motion.div
    className="absolute inset-0 rounded-full"
    animate={{
      boxShadow: [
        "0 0 0 0 rgba(255, 255, 255, 0)",
        "0 0 0 10px rgba(255, 255, 255, 0.1)",
        "0 0 0 20px rgba(255, 255, 255, 0.05)",
        "0 0 0 30px rgba(255, 255, 255, 0.02)",
        "0 0 0 0 rgba(255, 255, 255, 0)"
      ]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      repeatType: "loop"
    }}
  />
  
  {/* Inner rotating glow */}
  <motion.div
    className="absolute w-full h-full rounded-full bg-gradient-to-r from-white/40 via-transparent to-white/40"
    animate={{
      rotate: [0, 360]
    }}
    transition={{
      duration: 15,
      repeat: Infinity,
      ease: "linear"
    }}
  />
  
  {/* Snowflake-like particles */}
  <div className="relative w-full h-full">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: `${1 + Math.random() * 2}px`,
          height: `${1 + Math.random() * 2}px`,
          left: `${20 + Math.random() * 60}%`,
          top: `${20 + Math.random() * 60}%`,
          filter: "blur(0.5px)"
        }}
        animate={{
          y: [Math.random() * -18, Math.random() * 18, Math.random() * -18],
          x: [Math.random() * -18, Math.random() * 18, Math.random() * -18],
          opacity: [0.5, 0.9, 0.5],
          scale: [0.8, 1.6, 0.8]
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 2
        }}
      />
    ))}
  </div>
  
  {/* Center orb with subtle pulsing */}
  <motion.div
    className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-white/60 via-white/40 to-white/10"
    animate={{
      opacity: [0.6, 0.8, 0.6],
      scale: [0.9, 1.1, 0.9]
    }}
    transition={{
      duration: 3,
      repeat: Infinity
    }}
  />
  
  {/* Inner light source */}
  <motion.div
    className="absolute inset-0 rounded-full"
    style={{
      background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 70%)"
    }}
    animate={{
      opacity: [0.5, 0.7, 0.5]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      repeatType: "mirror"
    }}
  />
  
  {/* Extra lightbeam effect */}
  <motion.div
    className="absolute w-32 h-4 bg-white/20"
    style={{ 
      borderRadius: "2px",
      filter: "blur(2px)",
      transformOrigin: "center" 
    }}
    animate={{
      rotate: [0, 180, 360],
      opacity: [0, 0.3, 0]
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
</motion.div>
      <h3 className="text-xl  text-white mt-2 tracking-wide drop-shadow-sm transition-all duration-300 hover:scale-105">Ask anything</h3>        <p className="text-gray-400 text-sm max-w-xs">
        {/* I can help with coding questions, explain concepts, assist in bugs and errors. */}
      </p>

      <motion.div
        className="grid grid-cols-2 gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* <SuggestionChip text="How to use React hooks?" />
        <SuggestionChip text="Explain async/await" />
        <SuggestionChip text="Best coding practices" />
        <SuggestionChip text="CSS Grid vs Flexbox" /> */}
      </motion.div>
    </motion.div>
  );
};

interface AiAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AiAssistant = ({ isOpen, onToggle }: AiAssistantProps) => {
  interface Message {
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const askAI = async (question: any) => {
    try {
      setIsLoading(true);

      // const completion = await openai.chat.completions.create({
      //   model: "google/gemini-flash-1.5-8b-exp",
      //   // max_tokens: 1000,
      //   // temperature: 0.7,
      //   messages: [
      //     {
      //       role: "user",
      //       content: question
      //     }
      //   ]
      // });

      const genAI = new GoogleGenerativeAI("AIzaSyCF6mKRofVaWa-4RC6hjYQtijNqxOZSt58");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = question;

      const result = await model.generateContent(prompt);
      console.log(result.response.text());

      // console.log('OpenRouter response:', completion);

      // const responseContent = completion?.choices?.[0]?.message?.content;
      // if (responseContent) {
      //   return responseContent;
      // }

      const responseContent = result.response.text();
      console.log("ResponseContent is : ", responseContent);
      if (responseContent) {
        return responseContent;
      }

      throw new Error('Invalid response format from AI service');
    } catch (error) {
      console.error('AI request error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Replace your handleSubmit function in the AiAssistant component with this version:

  const scrollToBottom = () => {
    try {
      // Try finding the ScrollArea viewport directly
      const scrollAreaViewport = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollAreaViewport) {
        scrollAreaViewport.scrollTop = scrollAreaViewport.scrollHeight;
        return;
      }

      // Fallback: try using the ref directly
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("Error scrolling to bottom:", error);
    }
  };

  useEffect(() => {
    // Delay to ensure rendering is complete
    setTimeout(scrollToBottom, 100);
  }, [messages, isLoading]);

  const handleSubmit = async (e: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput('');

    const userMessage: Message = {
      type: 'user' as const,
      content: currentInput,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      setIsLoading(true);
      const aiResponse = await askAI(currentInput);

      const aiMessage: Message = {
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in AI response:', error);

      const errorMessage: Message = {
        type: 'assistant',
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
    setTimeout(scrollToBottom, 100);
  };

  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };



  // Add this SuggestionChip component right after the EmptyState component

  const SuggestionChip = ({ text }: { text: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        className="bg-gray-700/50 backdrop-blur-sm rounded-full px-3 py-2 text-xs text-gray-300 cursor-pointer border border-gray-700"
        whileHover={{
          scale: 1.03,
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          borderColor: "rgba(59, 130, 246, 0.3)"
        }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.span
          animate={{ color: isHovered ? "rgb(147, 197, 253)" : "rgb(209, 213, 219)" }}
          transition={{ duration: 0.2 }}
        >
          {text}
        </motion.span>
      </motion.div>
    );
  };


  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Add this effect to detect manual scrolling
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (scrollRef.current) {
  //       const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') || scrollRef.current;
  //       const isScrolledToBottom =
  //         Math.abs(scrollElement.scrollHeight - scrollElement.clientHeight - scrollElement.scrollTop) < 50;

  //       setUserHasScrolled(!isScrolledToBottom);
  //     }
  //   };

  //   const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') || scrollRef.current;
  //   if (scrollElement) {
  //     scrollElement.addEventListener('scroll', handleScroll);
  //     return () => scrollElement.removeEventListener('scroll', handleScroll);
  //   }
  // }, []);

  // // Modify your scroll effect to respect user scrolling
  // useEffect(() => {
  //   if (scrollRef.current && (!userHasScrolled || messages[messages.length - 1]?.type === 'user')) {
  //     // Only auto-scroll if user hasn't scrolled up OR if the latest message is from the user
  //     setTimeout(() => {
  //       const scrollContainer = scrollRef.current;
  //       if (scrollContainer) {
  //         const scrollElement = scrollContainer.querySelector('[data-radix-scroll-area-viewport]') || scrollContainer;
  //         scrollElement.scrollTop = scrollElement.scrollHeight;
  //       }
  //     }, 100);
  //   }
  // }, [messages, isLoading, userHasScrolled]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full border-l border-gray-700 bg-gray-800/95 backdrop-blur-sm flex flex-col fixed right-0 top-0 bottom-0 w-80 z-50"
        >
          <motion.div
            className="p-4 border-b border-gray-700 flex items-center justify-between"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.5, 0.8, 1]
                }}
              >
                <Bot className="w-5 h-5 text-blue-400" />
              </motion.div>
              <span className="font-semibold text-white">AI Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="hover:bg-gray-700"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </Button>
          </motion.div>

          <MessageContainer>
            <AnimatePresence>
              {messages.length > 0 ? (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      variants={messageAnimations}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        className={`max-w-[90%] rounded-2xl p-4 ${message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/70 backdrop-blur-sm text-gray-100'
                          }`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <MessageContent content={message.content} />
                        <motion.span
                          className="text-xs opacity-50 mt-2 block"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          transition={{ delay: 0.5 }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  ))}
                  {/* Add this div for scrolling to the bottom */}
                  <div ref={endOfMessagesRef} />
                </>
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start mt-4"
              >
                <div className="bg-gray-700/70 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-gray-300">AI is thinking...</span>
                </div>
              </motion.div>
            )}
          </MessageContainer>

          <motion.div
            className="p-4 border-t border-gray-700"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSubmit}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiAssistant;

