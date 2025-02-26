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

  const lines = content.split('\n');

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        parts.push({ type: 'code', content: currentCode.trim(), language });
        currentCode = '';
        language = '';
        inCodeBlock = false;
      } else {
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
              >
                {paragraph}
              </motion.p>
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
      <div ref={ref} className="space-y-6">
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

  const EmptyState = () => {
    return (
      <motion.div
        className="flex flex-col items-center justify-center align-middle h-full py-10 px-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/90 via-pink-500/80 to-orange-500/70 flex items-center justify-center mb-5 relative overflow-hidden shadow-lg"
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
      >
        {/* Flowing gradient overlay */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-300/30 via-indigo-400/40 to-purple-300/30"
          style={{
            backgroundSize: "300% 100%"
          }}
          animate={{
            backgroundPosition: ["0% center", "100% center", "0% center"]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Diagonal flowing gradient */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400/20 via-pink-500/30 to-cyan-500/20"
          style={{
            backgroundSize: "200% 200%",
            mixBlendMode: "overlay"
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />

        {/* Multiple pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(236, 72, 153, 0)",
              "0 0 0 10px rgba(236, 72, 153, 0.1)",
              "0 0 0 20px rgba(236, 72, 153, 0.05)",
              "0 0 0 30px rgba(236, 72, 153, 0.02)",
              "0 0 0 0 rgba(236, 72, 153, 0)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />

        {/* Inner rotating glow */}
        <motion.div
          className="absolute w-full h-full rounded-full bg-gradient-to-r from-white/20 via-transparent to-white/20"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Floating particles */}
        <div className="relative w-full h-full">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/70"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              animate={{
                y: [Math.random() * -10, Math.random() * 10, Math.random() * -10],
                x: [Math.random() * -10, Math.random() * 10, Math.random() * -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Center glow */}
        <motion.div
          className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-white/30 to-transparent"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </motion.div>
      <h3 className="text-xl  text-white mb-3 tracking-wide drop-shadow-sm transition-all duration-300 hover:scale-105">Ask anything</h3>        <p className="text-gray-400 text-sm max-w-xs">
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


          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length > 0 ? (
              <div className="space-y-6">
                <AnimatePresence>
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
                        className={`max-w-[90%] rounded-lg p-4 ${message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700/70 backdrop-blur-sm text-gray-100'
                          }`}
                        whileHover={{ scale: 1.01 }}
                        layout
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
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState />
            )}

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
          </ScrollArea>

          <MessageContainer ref={scrollRef}>
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  variants={messageAnimations}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <motion.div
                    className={`max-w-[90%] rounded-lg p-4 ${message.type === 'user'
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

