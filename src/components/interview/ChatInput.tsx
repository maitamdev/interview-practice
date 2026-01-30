import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, StopCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onChange?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function ChatInput({
  onSubmit,
  onChange,
  disabled = false,
  placeholder = 'Nhập câu trả lời của bạn...',
  maxLength = 2000,
  className,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange?.(newText);
  };

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
      onChange?.('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = text.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isOverLimit = charCount > maxLength;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-3", className)}
    >
      <div className={cn(
        "relative rounded-xl transition-all duration-300",
        isFocused && "ring-2 ring-primary/30"
      )}>
        <Textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-[120px] max-h-[300px] pr-14 resize-none rounded-xl",
            "bg-card/80 backdrop-blur-sm border-border/50",
            "focus:border-primary/50 focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/60",
            "text-base leading-relaxed",
            isOverLimit && "border-destructive focus:border-destructive",
            disabled && "opacity-60"
          )}
        />
        
        <Button
          onClick={handleSubmit}
          disabled={disabled || !text.trim() || isOverLimit}
          size="icon"
          className={cn(
            "absolute bottom-3 right-3 h-10 w-10 rounded-lg shadow-md",
            "bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90",
            "transition-all duration-300",
            text.trim() && !disabled && "scale-100 opacity-100",
            (!text.trim() || disabled) && "scale-95 opacity-50"
          )}
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <div className="flex justify-between items-center text-xs px-1">
        <span className="text-muted-foreground/70">
          <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-mono mr-1">Enter</kbd>
          gửi • 
          <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-mono mx-1">Shift+Enter</kbd>
          xuống dòng
        </span>
        <span className={cn(
          "font-mono tabular-nums",
          isOverLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-muted-foreground/70"
        )}>
          {charCount}/{maxLength}
        </span>
      </div>
    </motion.div>
  );
}

interface EndInterviewButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function EndInterviewButton({ onClick, disabled }: EndInterviewButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      size="sm"
      className={cn(
        "border-destructive/30 text-destructive/80",
        "hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive",
        "transition-all duration-300"
      )}
    >
      <StopCircle className="h-4 w-4 mr-2" />
      Kết thúc
    </Button>
  );
}
