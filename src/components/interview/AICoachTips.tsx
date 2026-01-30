import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Zap,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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

const ICON_MAP: Record<string, React.ReactNode> = {
  structure: <Target className="h-4 w-4 text-primary" />,
  content: <Lightbulb className="h-4 w-4 text-amber-500" />,
  time: <Clock className="h-4 w-4 text-red-500" />,
  general: <Sparkles className="h-4 w-4 text-emerald-500" />,
};

// Debounce delay in ms
const DEBOUNCE_DELAY = 2000;

export function AICoachTips({ 
  currentQuestion, 
  currentAnswer, 
  role,
  timeRemaining = 90,
  isVisible = true
}: AICoachTipsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [aiTips, setAiTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [lastAnswer, setLastAnswer] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Local rule-based tips as fallback
  const localTips = useMemo(() => {
    const allTips: Tip[] = [];
    const q = currentQuestion.toLowerCase();
    const a = currentAnswer.toLowerCase();
    const wordCount = currentAnswer.trim().split(/\s+/).filter(w => w).length;
    
    const isBehavioral = q.includes('kể về') || q.includes('mô tả') || q.includes('chia sẻ') || 
                         q.includes('kinh nghiệm') || q.includes('tình huống');
    const hasExample = a.includes('ví dụ') || a.includes('cụ thể') || a.includes('dự án');
    const hasNumbers = /\d+%|\d+ (người|members|tháng|months)/.test(a);
    const hasSTAR = (a.includes('tình huống') || a.includes('situation')) &&
                    (a.includes('nhiệm vụ') || a.includes('task')) &&
                    (a.includes('hành động') || a.includes('action')) &&
                    (a.includes('kết quả') || a.includes('result'));

    // Time warnings
    if (timeRemaining < 20 && wordCount < 30) {
      allTips.push({
        id: 'time-short',
        icon: <Clock className="h-4 w-4 text-red-500" />,
        text: 'Sắp hết giờ! Tóm tắt ý chính ngay.',
        type: 'time',
        priority: 10
      });
    }

    // STAR method
    if (isBehavioral && !hasSTAR && wordCount > 10) {
      allTips.push({
        id: 'star-method',
        icon: <Target className="h-4 w-4 text-primary" />,
        text: 'Sử dụng STAR: Situation → Task → Action → Result',
        type: 'structure',
        priority: 8
      });
    }

    // Add example
    if (wordCount > 15 && !hasExample) {
      allTips.push({
        id: 'add-example',
        icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
        text: 'Thêm ví dụ cụ thể từ kinh nghiệm thực tế',
        type: 'content',
        priority: 7
      });
    }

    // Add numbers
    if (wordCount > 20 && !hasNumbers) {
      allTips.push({
        id: 'add-numbers',
        icon: <Zap className="h-4 w-4 text-emerald-500" />,
        text: 'Thêm số liệu cụ thể (%, số người, thời gian...)',
        type: 'content',
        priority: 6
      });
    }

    // Too short
    if (wordCount < 10 && timeRemaining > 60) {
      allTips.push({
        id: 'too-short',
        icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
        text: 'Câu trả lời còn ngắn, hãy phát triển thêm ý',
        type: 'content',
        priority: 5
      });
    }

    return allTips.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }, [currentQuestion, currentAnswer, timeRemaining]);

  // Fetch AI tips with debounce
  const fetchAITips = useCallback(async (answer: string) => {
    if (!useAI || answer.length < 15 || !currentQuestion) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach-tips', {
        body: {
          question: currentQuestion,
          answer: answer,
          role: role,
          timeRemaining: timeRemaining,
        },
      });

      if (error) throw error;

      if (data?.tips && Array.isArray(data.tips)) {
        const formattedTips: Tip[] = data.tips.map((tip: any, index: number) => ({
          id: `ai-tip-${index}`,
          icon: ICON_MAP[tip.type] || ICON_MAP.general,
          text: tip.text,
          type: tip.type || 'general',
          priority: tip.priority || 5,
        }));
        setAiTips(formattedTips.slice(0, 3));
      }
    } catch (error) {
      console.error('AI Coach error:', error);
      // Fallback to local tips on error
      setUseAI(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, role, timeRemaining, useAI]);

  // Debounced effect for AI tips
  useEffect(() => {
    if (!useAI || currentAnswer.length < 15) {
      setAiTips([]);
      return;
    }

    // Only fetch if answer changed significantly
    if (Math.abs(currentAnswer.length - lastAnswer.length) < 10) {
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      setLastAnswer(currentAnswer);
      fetchAITips(currentAnswer);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [currentAnswer, useAI, fetchAITips, lastAnswer]);

  // Use AI tips if available, otherwise local tips
  const tips = useAI && aiTips.length > 0 ? aiTips : localTips;

  if (!isVisible || (tips.length === 0 && !isLoading)) return null;

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
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-amber-600" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                AI Coach
              </span>
              <span title={useAI ? "AI Mode" : "Local Mode"}>
                {useAI ? (
                  <Wifi className="h-3 w-3 text-emerald-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-muted-foreground" />
                )}
              </span>
              <Badge variant="secondary" className="text-xs bg-amber-500/10">
                {isLoading ? '...' : `${tips.length} gợi ý`}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setUseAI(!useAI);
                setAiTips([]);
              }}
            >
              {useAI ? 'AI' : 'Local'}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-amber-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-amber-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Tips list */}
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {isLoading && tips.length === 0 ? (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-black/20">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span className="text-sm text-muted-foreground">Đang phân tích...</span>
              </div>
            ) : (
              tips.map((tip, index) => (
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
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
