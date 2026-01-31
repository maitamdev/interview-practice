import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface AIAvatarProps {
  isSpeaking?: boolean;
  isThinking?: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'listening';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AIAvatar({ 
  isSpeaking = false, 
  isThinking = false,
  mood = 'neutral',
  size = 'md',
  className 
}: AIAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  };

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className={cn(
          sizeClasses[size],
          "rounded-xl flex items-center justify-center shadow-lg",
          "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
          "transition-all duration-300"
        )}
        animate={isSpeaking ? { scale: [1, 1.05, 1] } : isThinking ? { rotate: [0, 3, -3, 0] } : {}}
        transition={{ duration: isSpeaking ? 0.5 : 2, repeat: (isSpeaking || isThinking) ? Infinity : 0 }}
      >
        <Bot className={iconSizes[size]} />
        
        {/* Pulse ring when speaking */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-blue-400"
            animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Status indicator */}
      <AnimatePresence>
        {(isSpeaking || isThinking) && (
          <motion.div
            className={cn(
              "absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium",
              isSpeaking ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            {isSpeaking ? (
              <>
                <motion.span 
                  className="w-1 h-1 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0 }}
                />
                <motion.span 
                  className="w-1 h-1 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                />
                <motion.span 
                  className="w-1 h-1 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
                />
              </>
            ) : (
              <>
                <motion.span 
                  className="w-1 h-1 bg-white rounded-full"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                />
                <motion.span 
                  className="w-1 h-1 bg-white rounded-full"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                />
                <motion.span 
                  className="w-1 h-1 bg-white rounded-full"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simpler professional avatar for chat
export function HRAvatarSimple({ 
  isSpeaking = false, 
  isThinking = false,
  className 
}: { 
  isSpeaking?: boolean; 
  isThinking?: boolean;
  className?: string;
}) {
  return (
    <AIAvatar 
      isSpeaking={isSpeaking} 
      isThinking={isThinking}
      size="sm"
      className={className}
    />
  );
}
