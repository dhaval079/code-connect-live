import React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { createAvatar } from '@dicebear/core';
import { lorelei, bottts, pixelArt, adventurer } from '@dicebear/collection';
import type { Style } from '@dicebear/core';

interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  attachments?: { type: "image" | "video" | "audio"; url: string }[]
}

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
}

// Define specific types for our avatar configurations
type AvatarStyle = Style<{
  backgroundColor?: string[];
  seed: string;
}>;

interface AvatarStyleConfig {
  style: AvatarStyle;
  config: {
    backgroundColor: string[];
  };
}

const getAvatarUrl = (seed: string) => {
  const styles: AvatarStyleConfig[] = [
    {
      style: lorelei as unknown as AvatarStyle,
      config: {
        backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
      }
    },
    {
      style: bottts as unknown as AvatarStyle,
      config: {
        backgroundColor: ["b6e3f4", "c0aede", "d1d4f9"],
      }
    },
    {
      style: pixelArt as unknown as AvatarStyle,
      config: {
        backgroundColor: ["b6e3f4", "c0aede", "d1d4f9"],
      }
    },
    {
      style: adventurer as unknown as AvatarStyle,
      config: {
        backgroundColor: ["b6e3f4", "c0aede", "d1d4f9"],
      }
    }
  ];

  // Get consistent style for user
  const styleIndex = seed
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % styles.length;
  const { style, config } = styles[styleIndex];

  // Create avatar with specific configuration
  const avatar = createAvatar(style, {
    seed,
    backgroundColor: config.backgroundColor,
  });

  return avatar.toDataUri();
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const bubbleVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 },
  } as const;

  const attachmentVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  } as const;

  const avatarVariants = {
    initial: { scale: 0.8, rotate: -10 },
    animate: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 10 },
  } as const;

  return (
    <motion.div
      layout
      initial="initial"
      animate="animate"
      exit="exit"
      variants={bubbleVariants}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-end group`}>
        <motion.div
          variants={avatarVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="relative"
        >
          <Avatar className="w-8 h-8 ring-2 ring-offset-2 ring-offset-background transition-all duration-300
            ring-blue-500/50 group-hover:ring-blue-500">
            <AvatarImage src={getAvatarUrl(message.sender)} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
              {message.sender[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <motion.div
            className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <motion.div
          className={`max-w-[70%] break-words rounded-2xl px-4 py-2 ${
            isOwnMessage 
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-2" 
              : "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100 mr-2"
          } shadow-lg`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <p className="text-sm">{message.content}</p>
          {message.attachments && message.attachments.length > 0 && (
            <motion.div
              className="mt-2"
              initial="initial"
              animate="animate"
              variants={attachmentVariants}
              transition={{ delay: 0.2 }}
            >
              {message.attachments.map((attachment, index) => (
                <React.Fragment key={index}>
                  {attachment.type === "image" && (
                    <div className="relative rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={attachment.url || "/placeholder.svg"}
                        alt="Image attachment"
                        width={200}
                        height={150}
                        className="rounded-lg object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  {attachment.type === "video" && (
                    <video 
                      src={attachment.url} 
                      controls 
                      className="rounded-lg w-full max-w-[200px] shadow-lg" 
                    />
                  )}
                  {attachment.type === "audio" && (
                    <audio 
                      src={attachment.url} 
                      controls 
                      className="w-full rounded-lg shadow-lg" 
                    />
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}