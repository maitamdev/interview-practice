import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  formattedTime: string;
  isWarning: boolean;
  isDanger: boolean;
  label?: string;
  className?: string;
}

export function TimerDisplay({
  formattedTime,
  isWarning,
  isDanger,
  label,
  className,
}: TimerDisplayProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
        isDanger 
          ? "border-destructive/50 bg-destructive/10 text-destructive animate-pulse" 
          : isWarning 
            ? "border-warning/50 bg-warning/10 text-warning" 
            : "border-border bg-card",
        className
      )}
    >
      <Clock className={cn(
        "h-4 w-4",
        isDanger ? "text-destructive" : isWarning ? "text-warning" : "text-muted-foreground"
      )} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className={cn(
        "font-mono font-semibold",
        isDanger ? "text-destructive" : isWarning ? "text-warning" : ""
      )}>
        {formattedTime}
      </span>
    </div>
  );
}
