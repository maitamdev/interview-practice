import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_INFO, LEVEL_INFO, AnswerScores, InterviewRole } from '@/types/interview';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CompareInterviewsProps {
  currentSessionId: string;
  currentScore: number;
  currentRole: InterviewRole;
  currentLevel: string;
}

interface PreviousSession {
  id: string;
  role: string;
  level: string;
  created_at: string;
  avgScore: number;
  questionCount: number;
}

export function CompareInterviews({ 
  currentSessionId, 
  currentScore, 
  currentRole,
  currentLevel 
}: CompareInterviewsProps) {
  const { user } = useAuth();
  const [previousSessions, setPreviousSessions] = useState<PreviousSession[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreviousSessions();
    }
  }, [user, currentSessionId]);

  const loadPreviousSessions = async () => {
    if (!user) return;

    try {
      // Get previous sessions (same role, excluding current)
      const { data: sessions } = await supabase
        .from('interview_sessions')
        .select('id, role, level, created_at')
        .eq('user_id', user.id)
        .eq('role', currentRole as any)
        .eq('status', 'completed')
        .neq('id', currentSessionId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      // Get scores for each session
      const sessionsWithScores: PreviousSession[] = [];
      
      for (const session of sessions) {
        const { data: answers } = await supabase
          .from('interview_answers')
          .select('scores')
          .eq('session_id', session.id);

        if (answers && answers.length > 0) {
          const avgScore = answers.reduce((sum, a) => {
            const scores = a.scores as unknown as AnswerScores;
            return sum + (scores?.overall || 0);
          }, 0) / answers.length;

          sessionsWithScores.push({
            ...session,
            avgScore,
            questionCount: answers.length,
          });
        }
      }

      setPreviousSessions(sessionsWithScores);
    } catch (error) {
      console.error('Error loading previous sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || previousSessions.length === 0) {
    return null;
  }

  const lastSession = previousSessions[0];
  const scoreDiff = currentScore - lastSession.avgScore;
  const percentChange = lastSession.avgScore > 0 
    ? ((scoreDiff / lastSession.avgScore) * 100).toFixed(1)
    : '0';

  const getTrendIcon = () => {
    if (scoreDiff > 0.2) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (scoreDiff < -0.2) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (scoreDiff > 0.2) return 'text-green-500';
    if (scoreDiff < -0.2) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getTrendBg = () => {
    if (scoreDiff > 0.2) return 'bg-green-500/10 border-green-500/30';
    if (scoreDiff < -0.2) return 'bg-red-500/10 border-red-500/30';
    return 'bg-muted/30 border-muted';
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            So sánh với lần trước
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="gap-1"
          >
            {expanded ? (
              <>Thu gọn <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Chi tiết <ChevronDown className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick comparison */}
        <div className={cn(
          "p-4 rounded-xl border mb-4",
          getTrendBg()
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTrendIcon()}
              <div>
                <div className={cn("text-2xl font-bold", getTrendColor())}>
                  {scoreDiff > 0 ? '+' : ''}{scoreDiff.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {scoreDiff > 0.2 ? 'Tiến bộ!' : scoreDiff < -0.2 ? 'Cần cố gắng hơn' : 'Ổn định'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">So với lần trước</div>
              <div className={cn("font-semibold", getTrendColor())}>
                {scoreDiff > 0 ? '+' : ''}{percentChange}%
              </div>
            </div>
          </div>
        </div>

        {/* Score comparison bars */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Lần này</span>
              <span className="text-primary font-bold">{currentScore.toFixed(2)}/5</span>
            </div>
            <Progress value={(currentScore / 5) * 100} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Lần trước</span>
              <span className="text-muted-foreground">{lastSession.avgScore.toFixed(2)}/5</span>
            </div>
            <Progress value={(lastSession.avgScore / 5) * 100} className="h-3 [&>div]:bg-muted-foreground/50" />
          </div>
        </div>

        {/* Expanded history */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-4 border-t"
          >
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Lịch sử phỏng vấn {ROLE_INFO[currentRole]?.labelVi}
            </h4>
            
            {previousSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                    session.avgScore >= 4 ? "bg-primary/10 text-primary" :
                    session.avgScore >= 3 ? "bg-emerald-500/10 text-emerald-500" :
                    "bg-warning/10 text-warning"
                  )}>
                    {session.avgScore.toFixed(1)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {format(new Date(session.created_at), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.questionCount} câu hỏi • {LEVEL_INFO[session.level]?.labelVi}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {index === 0 ? (
                    <Badge variant="outline" className="text-xs">Lần trước</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {index + 1} lần trước
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Trend summary */}
            {previousSessions.length >= 2 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary" />
                  <span>
                    {(() => {
                      const scores = [currentScore, ...previousSessions.map(s => s.avgScore)];
                      const trend = scores[0] - scores[scores.length - 1];
                      if (trend > 0.5) return `Bạn đã tiến bộ +${trend.toFixed(2)} điểm qua ${scores.length} lần phỏng vấn!`;
                      if (trend < -0.5) return `Điểm giảm ${Math.abs(trend).toFixed(2)} so với ban đầu. Hãy ôn tập thêm!`;
                      return `Điểm ổn định qua ${scores.length} lần phỏng vấn.`;
                    })()}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
