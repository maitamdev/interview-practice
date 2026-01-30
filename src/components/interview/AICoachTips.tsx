import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  Sparkles, 
  Target, 
  Clock, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AICoachTipsProps {
  currentQuestion: string;
  currentAnswer: string;
  role: string;
  questionType?: 'behavioral' | 'technical' | 'mixed';
  timeRemaining?: number;
  isVisible?: boolean;
}

interface Tip {
  id: string;
  icon: React.ReactNode;
  text: string;
  type: 'structure' | 'content' | 'time' | 'general';
  priority: number;
}

export function AICoachTips({ 
  currentQuestion, 
  currentAnswer, 
  role,
  questionType = 'mixed',
  timeRemaining = 90,
  isVisible = true
}: AICoachTipsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [shownTips, setShownTips] = useState<string[]>([]);

  // Analyze question to determine type
  const questionAnalysis = useMemo(() => {
    const q = currentQuestion.toLowerCase();
    const isBehavioral = q.includes('kể về') || q.includes('mô tả') || q.includes('chia sẻ') || 
                         q.includes('kinh nghiệm') || q.includes('tình huống') || q.includes('lần') ||
                         q.includes('tell me') || q.includes('describe') || q.includes('experience');
    const isTechnical = q.includes('giải thích') || q.includes('khác nhau') || q.includes('hoạt động') ||
                        q.includes('implement') || q.includes('design') || q.includes('algorithm') ||
                        q.includes('code') || q.includes('database') || q.includes('api');
    const isWhyQuestion = q.includes('tại sao') || q.includes('why') || q.includes('lý do');
    const isHowQuestion = q.includes('như thế nào') || q.includes('how') || q.includes('cách');
    
    return { isBehavioral, isTechnical, isWhyQuestion, isHowQuestion };
  }, [currentQuestion]);

  // Analyze answer
  const answerAnalysis = useMemo(() => {
    const a = currentAnswer.toLowerCase();
    const wordCount = currentAnswer.trim().split(/\s+/).filter(w => w).length;
    const hasExample = a.includes('ví dụ') || a.includes('example') || a.includes('cụ thể') || 
                       a.includes('dự án') || a.includes('project');
    const hasNumbers = /\d+%|\d+ (người|members|tháng|months|năm|years)/.test(a);
    const hasSTAR = (a.includes('tình huống') || a.includes('situation')) &&
                    (a.includes('nhiệm vụ') || a.includes('task') || a.includes('công việc')) &&
                    (a.includes('hành động') || a.includes('action') || a.includes('làm')) &&
                    (a.includes('kết quả') || a.includes('result'));
    const hasBulletPoints = a.includes('thứ nhất') || a.includes('first') || a.includes('1.') || 
                            a.includes('- ') || a.includes('đầu tiên');
    
    return { wordCount, hasExample, hasNumbers, hasSTAR, hasBulletPoints };
  }, [currentAnswer]);

  // Generate tips based on analysis
  const tips = useMemo(() => {
    const allTips: Tip[] = [];
    const { isBehavioral, isTechnical, isWhyQuestion, isHowQuestion } = questionAnalysis;
    const { wordCount, hasExample, hasNumbers, hasSTAR, hasBulletPoints } = answerAnalysis;

    // Time-based tips
    if (timeRemaining < 20 && wordCount < 30) {
      allTips.push({
        id: 'time-short',
        icon: <Clock className="h-4 w-4 text-red-500" />,
        text: 'Sắp hết giờ! Tóm tắt ý chính ngay.',
        type: 'time',
        priority: 10
      });
    } else if (timeRemaining < 30 && wordCount < 20) {
      allTips.push({
        id: 'time-warning',
        icon: <Clock className="h-4 w-4 text-amber-500" />,
        text: 'Còn ít thời gian, hãy đi vào trọng tâm.',
        type: 'time',
        priority: 9
      });
    }

    // Structure tips for behavioral questions
    if (isBehavioral && !hasSTAR && wordCount > 10) {
      allTips.push({
        id: 'star-method',
        icon: <Target className="h-4 w-4 text-primary" />,
        text: 'Sử dụng STAR: Situation → Task → Action → Result',
        type: 'structure',
        priority: 8
      });
    }

    // Content tips
    if (wordCount > 15 && !hasExample) {
      allTips.push({
        id: 'add-example',
        icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
        text: 'Thêm ví dụ cụ thể từ kinh nghiệm thực tế',
        type: 'content',
        priority: 7
      });
    }

    if (wordCount > 20 && !hasNumbers && (isBehavioral || isHowQuestion)) {
      allTips.push({
        id: 'add-numbers',
        icon: <Zap className="h-4 w-4 text-emerald-500" />,
        text: 'Thêm số liệu cụ thể (%, số người, thời gian...)',
        type: 'content',
        priority: 6
      });
    }

    // Length tips
    if (wordCount < 10 && timeRemaining > 60) {
      allTips.push({
        id: 'too-short',
        icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
        text: 'Câu trả lời còn ngắn, hãy phát triển thêm ý',
        type: 'content',
        priority: 5
      });
    } else if (wordCount > 150) {
      allTips.push({
        id: 'too-long',
        icon: <MessageSquare className="h-4 w-4 text-amber-500" />,
        text: 'Câu trả lời khá dài, cân nhắc tóm gọn hơn',
        type: 'content',
        priority: 4
      });
    }

    // Technical question tips
    if (isTechnical && wordCount > 10 && !hasBulletPoints) {
      allTips.push({
        id: 'structure-points',
        icon: <Target className="h-4 w-4 text-primary" />,
        text: 'Chia thành các điểm rõ ràng: 1, 2, 3...',
        type: 'structure',
        priority: 5
      });
    }

    // Role-specific tips
    if (role === 'frontend' && isTechnical) {
      if (!currentAnswer.toLowerCase().includes('user') && !currentAnswer.toLowerCase().includes('người dùng')) {
        allTips.push({
          id: 'frontend-ux',
          icon: <Sparkles className="h-4 w-4 text-purple-500" />,
          text: 'Đề cập đến trải nghiệm người dùng (UX)',
          type: 'content',
          priority: 3
        });
      }
    }

    if (role === 'backend' && isTechnical) {
      if (!currentAnswer.toLowerCase().includes('performance') && !currentAnswer.toLowerCase().includes('hiệu suất') &&
          !currentAnswer.toLowerCase().includes('scale') && !currentAnswer.toLowerCase().includes('mở rộng')) {
        allTips.push({
          id: 'backend-perf',
          icon: <Sparkles className="h-4 w-4 text-purple-500" />,
          text: 'Cân nhắc đề cập đến hiệu suất/khả năng mở rộng',
          type: 'content',
          priority: 3
        });
      }
    }

    // Why question tips
    if (isWhyQuestion && wordCount > 10) {
      if (!currentAnswer.toLowerCase().includes('vì') && !currentAnswer.toLowerCase().includes('because') &&
          !currentAnswer.toLowerCase().includes('do') && !currentAnswer.toLowerCase().includes('lý do')) {
        allTips.push({
          id: 'explain-why',
          icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
          text: 'Giải thích rõ lý do "tại sao"',
          type: 'content',
          priority: 6
        });
      }
    }

    // General encouragement when doing well
    if (wordCount > 50 && hasExample && (hasNumbers || hasSTAR)) {
      allTips.push({
        id: 'doing-great',
        icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
        text: '✨ Câu trả lời tốt! Tiếp tục phát huy.',
        type: 'general',
        priority: 1
      });
    }

    // Sort by priority and return top 3
    return allTips.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }, [questionAnalysis, answerAnalysis, timeRemaining, role, currentAnswer]);

  // Track shown tips to avoid repetition
  useEffect(() => {
    const newTipIds = tips.map(t => t.id);
    setShownTips(prev => [...new Set([...prev, ...newTipIds])]);
  }, [tips]);

  if (!isVisible || tips.length === 0) return null;

  return (
    <Card className={cn(
      "bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-orange-500/5",
      "border-amber-500/30 shadow-lg transition-all duration-300",
      !isExpanded && "opacity-80"
    )}>
      <CardContent className="p-3">
        {/* Header */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                AI Coach
              </span>
              <Badge variant="secondary" className="ml-2 text-xs bg-amber-500/10">
                {tips.length} gợi ý
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-amber-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-600" />
            )}
          </Button>
        </div>

        {/* Tips list */}
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {tips.map((tip, index) => (
              <div 
                key={tip.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg transition-all",
                  "bg-white/50 dark:bg-black/20 border border-amber-500/20",
                  "animate-in fade-in slide-in-from-left-2",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tip.icon}
                <span className="text-sm text-foreground/80">{tip.text}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
