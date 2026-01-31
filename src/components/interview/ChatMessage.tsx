import { InterviewMessage } from '@/types/interview';
import { cn } from '@/lib/utils';
import { User, Volume2, VolumeX, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AIAvatar } from './AIAvatar';

interface ChatMessageProps {
  message: InterviewMessage;
  isLatest?: boolean;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  isLoadingTTS?: boolean;
  onStopSpeaking?: () => void;
}

export function ChatMessage({ message, isLatest, onSpeak, isSpeaking, isLoadingTTS, onStopSpeaking }: ChatMessageProps) {
  const isInterviewer = message.role === 'interviewer';
  const isSystem = message.role === 'system';

  const handleSpeakClick = () => {
    if (isSpeaking) {
      onStopSpeaking?.();
    } else {
      onSpeak?.(message.content);
    }
  };

  if (isSystem) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center py-3"
      >
        <span className="text-xs text-muted-foreground bg-muted/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border/50">
          {message.content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex gap-4 group",
        isInterviewer ? "pr-12" : "pl-12 flex-row-reverse"
      )}
    >
      {/* Avatar */}
      {isInterviewer ? (
        <AIAvatar 
          isSpeaking={isSpeaking} 
          isThinking={false}
          mood={isLatest ? 'happy' : 'neutral'}
          size="sm"
          className="flex-shrink-0"
        />
      ) : (
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 bg-gradient-to-br from-primary to-teal-500 text-white"
        >
          <User className="h-5 w-5" />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 space-y-2",
        !isInterviewer && "text-right"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center gap-2",
          !isInterviewer && "justify-end"
        )}>
          <span className={cn(
            "text-sm font-semibold",
            isInterviewer ? "text-blue-400" : "text-primary"
          )}>
            {isInterviewer ? 'AI Interviewer' : 'Bạn'}
          </span>
          {message.question_index !== null && isInterviewer && (
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              Câu {message.question_index + 1}
            </span>
          )}
          {isLatest && isInterviewer && (
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          )}
          {/* TTS Button for interviewer messages */}
          {isInterviewer && onSpeak && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-1"
              onClick={handleSpeakClick}
              disabled={isLoadingTTS}
            >
              {isLoadingTTS ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isSpeaking ? (
                <VolumeX className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              )}
            </Button>
          )}
        </div>

        {/* Message bubble */}
        <div className={cn(
          "relative rounded-2xl p-5 shadow-md transition-all",
          isInterviewer 
            ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-tl-sm" 
            : "bg-gradient-to-br from-primary/10 to-teal-500/5 border border-primary/20 rounded-tr-sm",
          isLatest && "ring-1 ring-primary/30"
        )}>
          <div className={cn(
            "prose prose-lg max-w-none",
            "prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:my-3 prose-p:text-lg",
            "prose-strong:text-foreground prose-strong:font-semibold",
            "prose-ul:my-3 prose-li:text-foreground/90 prose-li:text-lg",
            "prose-code:text-base prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
            !isInterviewer && "[&>*]:text-right"
          )}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 pr-12"
    >
      {/* Typing bubble */}
      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl rounded-tl-sm p-4 shadow-md">
        <div className="flex items-center gap-1.5">
          <motion.span 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
          <motion.span 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
          <motion.span 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
