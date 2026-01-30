import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target, 
  Flame,
  Trophy,
  Loader2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_INFO } from '@/types/interview';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface UserStats {
  total_interviews: number;
  total_questions_answered: number;
  total_time_spent_minutes: number;
  average_score: number;
  highest_score: number;
  current_streak: number;
  longest_streak: number;
  daily_challenges_completed: number;
  stats_by_role: Record<string, { count: number; avg_score: number }>;
  stats_by_month: Record<string, { count: number; avg_score: number }>;
}

interface SessionHistory {
  id: string;
  role: string;
  level: string;
  created_at: string;
  overall_score: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Statistics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (user) {
      loadStatistics();
    } else {
      setLoading(false);
    }
  }, [user, timeRange]);

  const loadStatistics = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Load user statistics (using any to bypass type checking for new tables)
      const { data: statsData } = await (supabase
        .from('user_statistics' as any)
        .select('*')
        .eq('user_id', user.id)
        .single() as any);

      // Load session history with scores
      let query = supabase
        .from('interview_sessions')
        .select(`
          id,
          role,
          level,
          created_at,
          session_summaries (overall_score)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      // Apply time filter
      if (timeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (timeRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      const { data: historyData } = await query.limit(50);

      if (statsData) {
        setStats(statsData as UserStats);
      }

      if (historyData) {
        setHistory(historyData.map(h => ({
          id: h.id,
          role: h.role,
          level: h.level,
          created_at: h.created_at,
          overall_score: (h.session_summaries as any)?.[0]?.overall_score || 0,
        })));
      }

      // Calculate stats by role and month if not in DB
      if (!statsData?.stats_by_role && historyData) {
        const byRole: Record<string, { count: number; total: number }> = {};
        const byMonth: Record<string, { count: number; total: number }> = {};

        historyData.forEach(h => {
          const score = (h.session_summaries as any)?.[0]?.overall_score || 0;
          
          // By role
          if (!byRole[h.role]) byRole[h.role] = { count: 0, total: 0 };
          byRole[h.role].count++;
          byRole[h.role].total += score;

          // By month
          const month = new Date(h.created_at).toISOString().substring(0, 7);
          if (!byMonth[month]) byMonth[month] = { count: 0, total: 0 };
          byMonth[month].count++;
          byMonth[month].total += score;
        });

        const statsByRole: Record<string, { count: number; avg_score: number }> = {};
        Object.entries(byRole).forEach(([role, data]) => {
          statsByRole[role] = { count: data.count, avg_score: data.total / data.count };
        });

        const statsByMonth: Record<string, { count: number; avg_score: number }> = {};
        Object.entries(byMonth).forEach(([month, data]) => {
          statsByMonth[month] = { count: data.count, avg_score: data.total / data.count };
        });

        setStats(prev => prev ? {
          ...prev,
          stats_by_role: statsByRole,
          stats_by_month: statsByMonth,
        } : {
          total_interviews: historyData.length,
          total_questions_answered: 0,
          total_time_spent_minutes: 0,
          average_score: historyData.reduce((sum, h) => sum + ((h.session_summaries as any)?.[0]?.overall_score || 0), 0) / historyData.length || 0,
          highest_score: Math.max(...historyData.map(h => (h.session_summaries as any)?.[0]?.overall_score || 0)),
          current_streak: 0,
          longest_streak: 0,
          daily_challenges_completed: 0,
          stats_by_role: statsByRole,
          stats_by_month: statsByMonth,
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem thống kê</h1>
          <Button onClick={() => navigate('/auth')}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const scoreOverTimeData = history
    .slice()
    .reverse()
    .map(h => ({
      date: new Date(h.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      score: h.overall_score,
    }));

  const roleDistributionData = Object.entries(stats?.stats_by_role || {}).map(([role, data]) => ({
    name: ROLE_INFO[role]?.labelVi || role,
    value: data.count,
    avgScore: data.avg_score,
  }));

  const monthlyData = Object.entries(stats?.stats_by_month || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month: month.substring(5), // MM format
      interviews: data.count,
      avgScore: data.avg_score,
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-6xl mx-auto py-6 sm:py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Thống kê chi tiết</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Tiến bộ của bạn</h1>
          </div>
          
          {/* Time range filter */}
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === 'week' ? '7 ngày' : range === 'month' ? '30 ngày' : 'Tất cả'}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs">Tổng phỏng vấn</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold">{stats?.total_interviews || history.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Điểm TB</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {(stats?.average_score || 0).toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-xs">Điểm cao nhất</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-500">
                {(stats?.highest_score || 0).toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-xs">Streak</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-orange-500">
                {stats?.current_streak || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Score over time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Điểm số theo thời gian
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scoreOverTimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={scoreOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Phân bố theo vị trí
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roleDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleDistributionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly trend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Xu hướng theo tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="interviews" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Số phỏng vấn" />
                  <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={2} name="Điểm TB" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lịch sử gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 10).map((session, index) => {
                  const prevScore = history[index + 1]?.overall_score;
                  const scoreDiff = prevScore ? session.overall_score - prevScore : 0;
                  
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/interview/${session.id}/report`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {ROLE_INFO[session.role]?.icon || '💼'}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {ROLE_INFO[session.role]?.labelVi || session.role}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-bold text-primary">{session.overall_score.toFixed(1)}</div>
                        </div>
                        {scoreDiff !== 0 && (
                          <div className={cn(
                            "flex items-center text-xs",
                            scoreDiff > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {scoreDiff > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(scoreDiff).toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">Chưa có lịch sử phỏng vấn</p>
                <Button onClick={() => navigate('/interview/new')}>
                  Bắt đầu phỏng vấn đầu tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
