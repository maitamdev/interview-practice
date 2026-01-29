import { InterviewAnswer, AnswerScores, AnswerFeedback } from '@/types/interview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBreakdown } from './ScoreDisplay';
import { 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';

interface FeedbackCardProps {
  answer: InterviewAnswer;
  questionNumber: number;
  defaultExpanded?: boolean;
}

// Score interpretation helper
function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 4.5) return { label: 'Xuất sắc', color: 'text-primary' };
  if (score >= 4) return { label: 'Tốt', color: 'text-emerald-500' };
  if (score >= 3) return { label: 'Khá', color: 'text-blue-500' };
  if (score >= 2) return { label: 'Cần cải thiện', color: 'text-warning' };
  return { label: 'Yếu', color: 'text-destructive' };
}

function getScoreBgColor(score: number): string {
  if (score >= 4) return 'bg-primary/10 border-primary/30';
  if (score >= 3) return 'bg-emerald-500/10 border-emerald-500/30';
  if (score >= 2) return 'bg-warning/10 border-warning/30';
  return 'bg-destructive/10 border-destructive/30';
}

export function FeedbackCard({ 
  answer, 
  questionNumber,
  defaultExpanded = false 
}: FeedbackCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const scores = answer.scores as AnswerScores;
  const feedback = answer.feedback as AnswerFeedback;
  const overallScore = scores?.overall || 0;
  const scoreInfo = getScoreLabel(overallScore);

  return (
    <Card className={cn("glass overflow-hidden transition-all", expanded && "ring-1 ring-primary/20")}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/30 transition-colors py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border",
              getScoreBgColor(overallScore)
            )}>
              {overallScore.toFixed(1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Câu {questionNumber}</span>
                <Badge variant="outline" className={cn("text-xs", scoreInfo.color)}>
                  {scoreInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {answer.question_text}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 animate-slide-up pt-0">
          {/* Score breakdown with visual bars */}
          {scores && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Điểm chi tiết
              </h4>
              <div className="space-y-2">
                {Object.entries(scores).filter(([key]) => key !== 'overall').map(([key, value]) => {
                  const labels: Record<string, string> = {
                    relevance: 'Độ liên quan',
                    structure: 'Cấu trúc',
                    depth: 'Độ sâu',
                    clarity: 'Độ rõ ràng'
                  };
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-24">{labels[key] || key}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          value >= 4 ? "bg-primary" : value >= 3 ? "bg-primary/70" : value >= 2 ? "bg-warning" : "bg-destructive"
                        )}
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8">{value}/5</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Your answer */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span>Câu trả lời của bạn</span>
              {answer.time_taken_seconds && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(answer.time_taken_seconds / 60)}:{(answer.time_taken_seconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </h4>
            <div className="p-3 bg-candidate/10 border-l-2 border-candidate rounded-r-lg text-sm">
              {answer.answer_text || <span className="text-muted-foreground italic">Không có câu trả lời</span>}
            </div>
          </div>

          {/* Evidence - what was weak */}
          {feedback?.evidence && feedback.evidence.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-warning">
                <AlertCircle className="h-4 w-4" />
                Điểm cần cải thiện
              </h4>
              <div className="space-y-1.5">
                {feedback.evidence.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-warning/5 p-2 rounded-lg border border-warning/20">
                    <span className="text-warning font-bold">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {feedback?.suggestions && feedback.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-primary">
                <Lightbulb className="h-4 w-4" />
                Gợi ý cải thiện
              </h4>
              <div className="space-y-1.5">
                {feedback.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/20">
                    <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improved answer */}
          {(feedback?.improved_answer || answer.improved_answer) && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Câu trả lời mẫu
              </h4>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{feedback?.improved_answer || answer.improved_answer || ''}</ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
