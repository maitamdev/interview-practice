import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export function ScoreDisplay({ 
  score, 
  maxScore = 5, 
  size = 'md',
  showLabel = true,
  label 
}: ScoreDisplayProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreClass = () => {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    if (percentage >= 40) return 'score-average';
    return 'score-poor';
  };

  const getScoreLabel = () => {
    if (percentage >= 80) return 'Xuất sắc';
    if (percentage >= 60) return 'Tốt';
    if (percentage >= 40) return 'Khá';
    return 'Cần cải thiện';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className="flex items-center gap-2">
      <span 
        className={cn(
          "font-semibold rounded-full border",
          sizeClasses[size],
          getScoreClass()
        )}
      >
        {score.toFixed(1)}/{maxScore}
      </span>
      {showLabel && (
        <span className="text-muted-foreground text-sm">
          {label || getScoreLabel()}
        </span>
      )}
    </div>
  );
}

interface ScoreBreakdownProps {
  scores: Record<string, number>;
  labels?: Record<string, string>;
}

const defaultLabels: Record<string, string> = {
  relevance: 'Độ liên quan',
  structure: 'Cấu trúc',
  depth: 'Độ sâu',
  clarity: 'Độ rõ ràng',
  overall: 'Tổng thể',
  communication: 'Giao tiếp',
  // Chinese fallback labels (in case old data)
  '沟通': 'Giao tiếp',
  '深度': 'Độ sâu',
  '结构': 'Cấu trúc',
  '清晰度': 'Độ rõ ràng',
  '相关性': 'Độ liên quan',
};

export function ScoreBreakdown({ scores, labels = defaultLabels }: ScoreBreakdownProps) {
  if (!scores || typeof scores !== 'object') {
    return null;
  }

  return (
    <div className="space-y-3">
      {Object.entries(scores).map(([key, value]) => {
        // Ensure value is a valid number
        const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        const percentage = (numValue / 5) * 100;
        
        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{labels[key] || key}</span>
              <span className="font-medium">{numValue.toFixed(1)}/5</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  percentage >= 80 ? "bg-primary" :
                  percentage >= 60 ? "bg-emerald-500" :
                  percentage >= 40 ? "bg-warning" : "bg-destructive"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
