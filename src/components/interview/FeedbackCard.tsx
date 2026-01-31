import { InterviewAnswer, AnswerScores, AnswerFeedback } from '@/types/interview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBreakdown } from './ScoreDisplay';
import { BookmarkButton } from './BookmarkButton';
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
  sessionId?: string;
  role?: string;
  level?: string;
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
  defaultExpanded = false,
  sessionId,
  role,
  level
}: FeedbackCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const scores = answer.scores as AnswerScores;
  const feedback = answer.feedback as AnswerFeedback;
  const overallScore = scores?.overall || 0;
  const scoreInfo = getScoreLabel(overallScore);

  return (
    <Card className={cn("glass overflow-hidden transition-all", expanded && "ring-1 ring-primary/20")}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/30 transition-colors py-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg border",
              getScoreBgColor(overallScore)
            )}>
              {overallScore.toFixed(1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">Câu {questionNumber}</span>
                <Badge variant="outline" className={cn("text-sm px-3 py-1", scoreInfo.color)}>
                  {scoreInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {answer.question_text}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <BookmarkButton
              questionText={answer.question_text}
              answerId={answer.id}
              sessionId={sessionId}
              role={role}
              level={level}
            />
            <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5 animate-slide-up pt-0">
          {/* Score breakdown with visual bars */}
          {scores && (
            <div className="p-4 bg-muted/30 rounded-xl">
              <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Điểm chi tiết
              </h4>
              <div className="space-y-3">
                {Object.entries(scores).filter(([key]) => key !== 'overall').map(([key, value]) => {
                  const labels: Record<string, string> = {
                    relevance: 'Độ liên quan',
                    structure: 'Cấu trúc',
                    depth: 'Độ sâu',
                    clarity: 'Độ rõ ràng'
                  };
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-28">{labels[key] || key}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          value >= 4 ? "bg-primary" : value >= 3 ? "bg-primary/70" : value >= 2 ? "bg-warning" : "bg-destructive"
                        )}
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-10">{value}/5</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Your answer */}
          <div>
            <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span>Câu trả lời của bạn</span>
              {answer.time_taken_seconds && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(answer.time_taken_seconds / 60)}:{(answer.time_taken_seconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </h4>
            <div className="p-4 bg-candidate/10 border-l-4 border-candidate rounded-r-xl text-base leading-relaxed">
              {answer.answer_text || <span className="text-muted-foreground italic">Không có câu trả lời</span>}
            </div>
          </div>

          {/* Evidence - what was weak */}
          {feedback?.evidence && feedback.evidence.length > 0 && (
            <div>
              <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                Điểm cần cải thiện
              </h4>
              <div className="space-y-2">
                {feedback.evidence.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 text-base text-muted-foreground bg-warning/5 p-3 rounded-xl border border-warning/20">
                    <span className="text-warning font-bold text-lg">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {feedback?.suggestions && feedback.suggestions.length > 0 && (
            <div>
              <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-primary">
                <Lightbulb className="h-5 w-5" />
                Gợi ý cải thiện
              </h4>
              <div className="space-y-2">
                {feedback.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 text-base text-muted-foreground bg-primary/5 p-3 rounded-xl border border-primary/20">
                    <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improved answer */}
          {(feedback?.improved_answer || answer.improved_answer) && (
            <div>
              <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                Câu trả lời mẫu
              </h4>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-base prose prose-lg prose-invert max-w-none leading-relaxed">
                <ReactMarkdown>{feedback?.improved_answer || answer.improved_answer || ''}</ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
