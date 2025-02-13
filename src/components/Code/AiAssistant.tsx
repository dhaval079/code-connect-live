"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, ChevronRight, Copy, Check, Loader2, SendIcon, BotOffIcon, BotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import OpenAI from 'openai';
import { FuturisticInput } from '../Dashboard/buttons/FuturisticInput';
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
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              code={part.content}
              language={part.language ?? 'text'}
            />
          );
        }
        return (
          <motion.p
            key={index}
            className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {part.content}
          </motion.p>
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
    "HTTP-Referer":  "",
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

  const askAI = async (question:any) => {
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

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const aiResponse = await askAI(input);
      const aiMessage: Message = {
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        type: 'assistant',
        content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
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

          {/* <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageAnimations}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <motion.div
                      className={`max-w-[90%] rounded-lg p-4 ${
                        message.type === 'user'
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
            </div>
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
          </ScrollArea> */}
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
          <motion.form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-700"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex space-x-2">
              <FuturisticInput
               disabled={isLoading}
                value={input}
                icon={BotIcon}
                onChange={(e:any) => setInput(e.target.value)}
                label=""
                id="ai-input"
                className="flex-1 mb-4 bg-gray-700/70 backdrop-blur-sm border-gray-600 text-white"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 mt-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiAssistant;

