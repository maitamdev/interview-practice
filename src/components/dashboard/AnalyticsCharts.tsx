import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AnswerScores } from '@/types/interview';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface DailyStats {
  date: string;
  interviews: number;
  questions: number;
  avgScore: number;
}

interface SkillData {
  skill: string;
  value: number;
  fullMark: 5;
}

export function AnalyticsCharts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [scoreHistory, setScoreHistory] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      // Get sessions for the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data: sessions } = await supabase
        .from('interview_sessions')
        .select('id, created_at, status')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      // Get all answers for these sessions
      const { data: answers } = await supabase
        .from('interview_answers')
        .select('scores, created_at, session_id')
        .in('session_id', sessions.map(s => s.id))
        .order('created_at', { ascending: true });

      // Calculate daily stats
      const dailyMap: Record<string, DailyStats> = {};
      
      // Initialize last 14 days
      for (let i = 13; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'dd/MM', { locale: vi });
        dailyMap[date] = { date, interviews: 0, questions: 0, avgScore: 0 };
      }

      // Count interviews per day
      sessions.forEach(session => {
        const date = format(new Date(session.created_at), 'dd/MM', { locale: vi });
        if (dailyMap[date]) {
          dailyMap[date].interviews++;
        }
      });

      // Count questions and scores per day
      const scoresByDate: Record<string, number[]> = {};
      
      (answers || []).forEach(answer => {
        const date = format(new Date(answer.created_at), 'dd/MM', { locale: vi });
        if (dailyMap[date]) {
          dailyMap[date].questions++;
          const scores = answer.scores as unknown as AnswerScores;
          if (scores?.overall) {
            if (!scoresByDate[date]) scoresByDate[date] = [];
            scoresByDate[date].push(scores.overall);
          }
        }
      });

      // Calculate average scores
      Object.keys(scoresByDate).forEach(date => {
        const scores = scoresByDate[date];
        dailyMap[date].avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      });

      setDailyStats(Object.values(dailyMap));

      // Calculate skill breakdown (radar chart data)
      const skillTotals: Record<string, { sum: number; count: number }> = {
        relevance: { sum: 0, count: 0 },
        structure: { sum: 0, count: 0 },
        depth: { sum: 0, count: 0 },
        clarity: { sum: 0, count: 0 },
      };

      (answers || []).forEach(answer => {
        const scores = answer.scores as unknown as AnswerScores;
        if (scores) {
          if (scores.relevance !== undefined) {
            skillTotals.relevance.sum += scores.relevance;
            skillTotals.relevance.count++;
          }
          if (scores.structure !== undefined) {
            skillTotals.structure.sum += scores.structure;
            skillTotals.structure.count++;
          }
          if (scores.depth !== undefined) {
            skillTotals.depth.sum += scores.depth;
            skillTotals.depth.count++;
          }
          if (scores.clarity !== undefined) {
            skillTotals.clarity.sum += scores.clarity;
            skillTotals.clarity.count++;
          }
        }
      });

      const skillNames: Record<string, string> = {
        relevance: 'Liên quan',
        structure: 'Cấu trúc',
        depth: 'Chiều sâu',
        clarity: 'Rõ ràng',
      };

      setSkillData(
        Object.entries(skillTotals)
          .filter(([_, data]) => data.count > 0)
          .map(([skill, data]) => ({
            skill: skillNames[skill] || skill,
            value: data.sum / data.count,
            fullMark: 5,
          }))
      );

      // Score history (last 10 answers)
      const recentScores = (answers || [])
        .slice(-10)
        .map((answer, index) => ({
          date: `#${index + 1}`,
          score: (answer.scores as unknown as AnswerScores)?.overall || 0,
        }));

      setScoreHistory(recentScores);

    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hasData = dailyStats.some(d => d.interviews > 0 || d.questions > 0);

  if (!hasData) {
    return (
      <Card className="glass">
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">Chưa có dữ liệu</h3>
          <p className="text-muted-foreground text-sm">
            Hoàn thành phỏng vấn để xem biểu đồ phân tích
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Hoạt động
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Tiến độ
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Kỹ năng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Hoạt động 14 ngày qua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyStats}>
                    <defs>
                      <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }} 
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="questions"
                      name="Câu hỏi"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorInterviews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Điểm số gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }} 
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      tick={{ fontSize: 11 }} 
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Điểm"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Phân bố kỹ năng</CardTitle>
            </CardHeader>
            <CardContent>
              {skillData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillData}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis 
                        dataKey="skill" 
                        tick={{ fontSize: 11 }} 
                        className="text-foreground"
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 5]} 
                        tick={{ fontSize: 10 }}
                      />
                      <Radar
                        name="Điểm"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Chưa đủ dữ liệu để hiển thị
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
