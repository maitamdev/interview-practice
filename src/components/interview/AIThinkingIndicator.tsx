import { cn } from "@/lib/utils";

interface AIThinkingIndicatorProps {
  className?: string;
}

export function AIThinkingIndicator({ className }: AIThinkingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-3 p-4", className)}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-lg">🤖</span>
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">AI đang suy nghĩ...</span>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}
