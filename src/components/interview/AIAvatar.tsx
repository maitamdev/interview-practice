import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [blinkState, setBlinkState] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Mouth animation when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    const mouthInterval = setInterval(() => {
      setMouthOpen(Math.random() * 100);
    }, 100);

    return () => clearInterval(mouthInterval);
  }, [isSpeaking]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const getMoodExpression = () => {
    switch (mood) {
      case 'happy':
        return { eyebrow: -2, mouthCurve: 8 };
      case 'thinking':
        return { eyebrow: 3, mouthCurve: -2 };
      case 'listening':
        return { eyebrow: 1, mouthCurve: 2 };
      default:
        return { eyebrow: 0, mouthCurve: 0 };
    }
  };

  const expression = getMoodExpression();

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* 3D Container */}
      <motion.div
        className="w-full h-full relative"
        style={{ perspective: '500px' }}
        animate={isThinking ? { rotateY: [0, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: isThinking ? Infinity : 0 }}
      >
        {/* Head */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-200 dark:to-amber-300 shadow-lg"
          style={{ transformStyle: 'preserve-3d' }}
          animate={isSpeaking ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
        >
          {/* Hair */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[85%] h-[45%] bg-gradient-to-b from-slate-800 to-slate-700 rounded-t-full" />
          
          {/* Face container */}
          <div className="absolute inset-[15%] flex flex-col items-center justify-center">
            {/* Eyes */}
            <div className="flex gap-[25%] mb-[10%]">
              {/* Left eye */}
              <motion.div 
                className="relative w-[22%] aspect-square"
                animate={{ y: expression.eyebrow }}
              >
                <div className="absolute inset-0 bg-white rounded-full shadow-inner" />
                <motion.div 
                  className="absolute inset-[20%] bg-slate-800 rounded-full"
                  animate={{ 
                    scaleY: blinkState ? 0.1 : 1,
                    y: isSpeaking ? [0, -1, 0] : 0
                  }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Pupil highlight */}
                  <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] bg-white rounded-full opacity-80" />
                </motion.div>
              </motion.div>
              
              {/* Right eye */}
              <motion.div 
                className="relative w-[22%] aspect-square"
                animate={{ y: expression.eyebrow }}
              >
                <div className="absolute inset-0 bg-white rounded-full shadow-inner" />
                <motion.div 
                  className="absolute inset-[20%] bg-slate-800 rounded-full"
                  animate={{ 
                    scaleY: blinkState ? 0.1 : 1,
                    y: isSpeaking ? [0, -1, 0] : 0
                  }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] bg-white rounded-full opacity-80" />
                </motion.div>
              </motion.div>
            </div>

            {/* Nose */}
            <div className="w-[8%] h-[12%] bg-amber-300/50 rounded-full mb-[5%]" />

            {/* Mouth */}
            <motion.div 
              className="relative w-[35%] overflow-hidden"
              animate={{ 
                height: isSpeaking ? `${8 + mouthOpen * 0.12}%` : '8%',
              }}
              transition={{ duration: 0.05 }}
            >
              <div 
                className={cn(
                  "absolute inset-0 bg-rose-400 rounded-full",
                  isSpeaking && "bg-rose-500"
                )}
                style={{
                  borderRadius: `50% 50% ${50 + expression.mouthCurve}% ${50 + expression.mouthCurve}%`,
                }}
              />
              {/* Teeth when speaking */}
              {isSpeaking && mouthOpen > 30 && (
                <div className="absolute top-0 left-[10%] right-[10%] h-[40%] bg-white rounded-b" />
              )}
            </motion.div>
          </div>

          {/* Ears */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[30%] w-[12%] h-[20%] bg-amber-200 rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[30%] w-[12%] h-[20%] bg-amber-200 rounded-full" />
        </motion.div>

        {/* Thinking indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              className="absolute -top-2 -right-2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity, 
                      delay: i * 0.15 
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speaking indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="flex items-end gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    animate={{ height: [4, 12, 4] }}
                    transition={{ 
                      duration: 0.4, 
                      repeat: Infinity, 
                      delay: i * 0.1 
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Glow effect when active */}
      {(isSpeaking || isThinking) && (
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10 animate-pulse" />
      )}
    </div>
  );
}

// Professional HR Avatar variant
export function HRAvatarProfessional({ 
  isSpeaking = false, 
  isThinking = false,
  gender = 'female',
  className 
}: { 
  isSpeaking?: boolean; 
  isThinking?: boolean;
  gender?: 'male' | 'female';
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl"
        animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
      >
        {/* Professional avatar image placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <AIAvatar 
            isSpeaking={isSpeaking} 
            isThinking={isThinking}
            mood={isThinking ? 'thinking' : isSpeaking ? 'happy' : 'neutral'}
            size="lg"
          />
        </div>
      </motion.div>
      
      {/* Status badge */}
      <div className={cn(
        "absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
        isSpeaking ? "bg-emerald-500 text-white" : 
        isThinking ? "bg-amber-500 text-white" : 
        "bg-slate-200 text-slate-600"
      )}>
        {isSpeaking ? 'Đang nói' : isThinking ? 'Đang nghĩ' : 'HR'}
      </div>
    </div>
  );
}
