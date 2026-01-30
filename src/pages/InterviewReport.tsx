import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { FeedbackCard } from '@/components/interview/FeedbackCard';
import { ScoreBreakdown } from '@/components/interview/ScoreDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  InterviewSession, 
  InterviewAnswer, 
  SessionSummary,
  ROLE_INFO, 
  LEVEL_INFO,
  AnswerScores,
  AnswerFeedback,
  ImprovementDay,
  LearningRoadmapItem
} from '@/types/interview';
import { 
  ArrowLeft, 
  Trophy, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Target,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CourseRecommendations } from '@/components/interview/CourseRecommendations';
import { LearningRoadmap } from '@/components/interview/LearningRoadmap';

export default function InterviewReport() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadReport();
    }
  }, [sessionId]);

  // Retry loading summary if not found
  const retrySummary = async () => {
    if (!sessionId) return;
    
    setSummaryLoading(true);
    try {
      // Call the edge function to generate summary
      await supabase.functions.invoke('session-summary', {
        body: { sessionId },
      });
      
      // Wait a bit then reload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Load summary again
      const { data: summaryData } = await supabase
        .from('session_summaries')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (summaryData) {
        const data = summaryData as {
          created_at: string;
          id: string;
          improvement_plan: unknown;
          learning_roadmap: unknown;
          overall_score: number;
          session_id: string;
          skill_breakdown: unknown;
          strengths: string[];
          weaknesses: string[];
        };
        setSummary({
          ...data,
          improvement_plan: (data.improvement_plan as ImprovementDay[]) || [],
          skill_breakdown: (data.skill_breakdown as Record<string, number>) || {},
          learning_roadmap: (data.learning_roadmap as LearningRoadmapItem[]) || [],
        } as SessionSummary);
      }
    } catch (err) {
      console.error('Error retrying summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      // Load session
      const { data: sessionData } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionData) {
        setSession(sessionData as InterviewSession);
      }

      // Load answers
      const { data: answersData } = await supabase
        .from('interview_answers')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_index');

      if (answersData) {
        setAnswers(answersData.map(a => ({
          ...a,
          scores: a.scores as unknown as AnswerScores,
          feedback: a.feedback as unknown as AnswerFeedback,
        })) as InterviewAnswer[]);
      }

      // Load summary
      const { data: summaryData } = await supabase
        .from('session_summaries')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (summaryData) {
        const data = summaryData as {
          created_at: string;
          id: string;
          improvement_plan: unknown;
          learning_roadmap: unknown;
          overall_score: number;
          session_id: string;
          skill_breakdown: unknown;
          strengths: string[];
          weaknesses: string[];
        };
        setSummary({
          ...data,
          improvement_plan: (data.improvement_plan as ImprovementDay[]) || [],
          skill_breakdown: (data.skill_breakdown as Record<string, number>) || {},
          learning_roadmap: (data.learning_roadmap as LearningRoadmapItem[]) || [],
        } as SessionSummary);
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy báo cáo</h1>
          <Link to="/dashboard">
            <Button>Về Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const overallScore = summary?.overall_score || 
    (answers.length > 0 
      ? answers.reduce((sum, a) => sum + (a.scores?.overall || 0), 0) / answers.length 
      : 0);

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-primary';
    if (score >= 3) return 'text-emerald-500';
    if (score >= 2) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Về Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-3xl">{ROLE_INFO[session.role]?.icon}</span>
              Báo cáo phỏng vấn
            </h1>
            <p className="text-muted-foreground mt-1">
              {ROLE_INFO[session.role]?.labelVi} • {LEVEL_INFO[session.level]?.labelVi} • 
              {session.ended_at && format(new Date(session.ended_at), ' dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/interview/new">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Phỏng vấn lại
              </Button>
            </Link>
          </div>
        </div>

        {/* Score overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Overall score */}
          <Card className="glass md:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-primary/30 flex items-center justify-center mb-4">
                <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore.toFixed(1)}
                </span>
              </div>
              <h3 className="text-lg font-semibold">Điểm tổng thể</h3>
              <p className="text-muted-foreground text-sm">
                {answers.length} câu hỏi đã trả lời
              </p>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <Trophy className="h-5 w-5" />
                Điểm mạnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.strengths && summary.strengths.length > 0 && summary.strengths[0] !== 'Chưa có dữ liệu để phân tích' ? (
                <ul className="space-y-2">
                  {summary.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted-foreground text-sm mb-3">
                    {summaryLoading ? 'Đang phân tích...' : 'Chưa có phân tích'}
                  </p>
                  {!summaryLoading && (
                    <Button size="sm" variant="outline" onClick={retrySummary} className="gap-2">
                      <RotateCcw className="h-3 w-3" />
                      Phân tích lại
                    </Button>
                  )}
                  {summaryLoading && <Loader2 className="h-4 w-4 animate-spin mx-auto" />}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Cần cải thiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.weaknesses && summary.weaknesses.length > 0 && summary.weaknesses[0] !== 'Phiên phỏng vấn chưa có câu trả lời nào' && summary.weaknesses[0] !== 'Cần thêm dữ liệu để phân tích' ? (
                <ul className="space-y-2">
                  {summary.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted-foreground text-sm mb-3">
                    {summaryLoading ? 'Đang phân tích...' : 'Chưa có phân tích'}
                  </p>
                  {!summaryLoading && !summary && (
                    <Button size="sm" variant="outline" onClick={retrySummary} className="gap-2">
                      <RotateCcw className="h-3 w-3" />
                      Phân tích lại
                    </Button>
                  )}
                  {summaryLoading && <Loader2 className="h-4 w-4 animate-spin mx-auto" />}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill breakdown */}
        {summary?.skill_breakdown && Object.keys(summary.skill_breakdown).length > 0 && (
          <Card className="glass mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Phân tích kỹ năng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown scores={summary.skill_breakdown} />
            </CardContent>
          </Card>
        )}

        {/* 7-day improvement plan */}
        {summary?.improvement_plan && summary.improvement_plan.length > 0 && (
          <Card className="glass mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Kế hoạch cải thiện 7 ngày
              </CardTitle>
              <CardDescription>
                Lộ trình cá nhân hóa dựa trên kết quả phỏng vấn của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {summary.improvement_plan.map((day, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono">
                        Ngày {day.day || i + 1}
                      </Badge>
                      <h4 className="font-medium">{day.focus}</h4>
                    </div>
                    {day.tasks && day.tasks.length > 0 && (
                      <ul className="space-y-1 ml-4">
                        {day.tasks.map((task, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Recommendations */}
        {session && summary?.weaknesses && (
          <div className="mb-8">
            <CourseRecommendations
              sessionId={sessionId!}
              role={session.role}
              weaknesses={summary.weaknesses || []}
              overallScore={overallScore}
            />
          </div>
        )}

        {/* Learning Roadmap - Visual like roadmap.sh */}
        {session && summary && (
          <div className="mb-8">
            <LearningRoadmap
              role={session.role}
              weaknesses={summary.weaknesses || []}
              strengths={summary.strengths || []}
              overallScore={overallScore}
              aiRoadmap={summary.learning_roadmap}
            />
          </div>
        )}

        {/* Detailed answers */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Chi tiết từng câu hỏi</CardTitle>
            <CardDescription>
              Xem lại câu hỏi, câu trả lời và feedback chi tiết
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {answers.map((answer, index) => (
              <FeedbackCard
                key={answer.id}
                answer={answer}
                questionNumber={index + 1}
                defaultExpanded={false}
              />
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
