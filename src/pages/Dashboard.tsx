import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { InterviewSession, ROLE_INFO, LEVEL_INFO, AnswerScores } from '@/types/interview';
import { GamificationPanel } from '@/components/dashboard/GamificationPanel';
import { AICoachPanel } from '@/components/dashboard/AICoachPanel';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { VoiceSettings } from '@/components/dashboard/VoiceSettings';
import { Onboarding, useOnboarding } from '@/components/Onboarding';
import { 
  Plus, 
  History, 
  TrendingUp, 
  Target,
  Clock,
  BarChart3,
  ChevronRight,
  Loader2,
  Gamepad2,
  Brain,
  Settings,
  Activity,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SessionWithStats extends InterviewSession {
  avgScore?: number;
  answerCount?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    totalQuestions: 0,
    completedSessions: 0,
  });
  const { showOnboarding, hasSeenOnboarding, triggerOnboarding, completeOnboarding } = useOnboarding();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Show onboarding for new users
  useEffect(() => {
    if (user && !hasSeenOnboarding) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        triggerOnboarding();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, hasSeenOnboarding]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (sessionsError) throw sessionsError;

      const { data: answersData, error: answersError } = await supabase
        .from('interview_answers')
        .select('scores, session_id')
        .in('session_id', sessionsData?.map(s => s.id) || []);

      if (answersError) throw answersError;

      const sessionsWithStats = (sessionsData || []).map(session => {
        const sessionAnswers = (answersData || []).filter(a => a.session_id === session.id);
        const scores = sessionAnswers
          .map(a => (a.scores as unknown as AnswerScores)?.overall || 0)
          .filter(s => s > 0);
        
        return {
          ...session,
          avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
          answerCount: sessionAnswers.length,
        } as SessionWithStats;
      });

      setSessions(sessionsWithStats);

      const allScores = (answersData || [])
        .map(a => (a.scores as unknown as AnswerScores)?.overall || 0)
        .filter(s => s > 0);

      setStats({
        totalSessions: sessionsData?.length || 0,
        avgScore: allScores.length > 0 
          ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
          : 0,
        totalQuestions: answersData?.length || 0,
        completedSessions: sessionsData?.filter(s => s.status === 'completed').length || 0,
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      setup: { label: 'Chưa bắt đầu', className: 'bg-muted text-muted-foreground' },
      in_progress: { label: 'Đang diễn ra', className: 'bg-warning/20 text-warning' },
      completed: { label: 'Hoàn thành', className: 'bg-primary/20 text-primary' },
      abandoned: { label: 'Đã huỷ', className: 'bg-destructive/20 text-destructive' },
    };
    const { label, className } = statusMap[status] || statusMap.setup;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="relative">
            <div className="orb orb-primary w-32 h-32 -top-16 -left-16" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: History, value: stats.totalSessions, label: 'Phiên phỏng vấn', color: 'primary' },
    { icon: Target, value: stats.completedSessions, label: 'Hoàn thành', color: 'success' },
    { icon: BarChart3, value: stats.totalQuestions, label: 'Câu đã trả lời', color: 'accent' },
    { icon: TrendingUp, value: stats.avgScore.toFixed(1), label: 'Điểm TB', color: 'warning' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Onboarding modal for new users */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding 
            onComplete={completeOnboarding} 
            userName={profile?.full_name?.split(' ')[0]}
          />
        )}
      </AnimatePresence>

      {/* Background decorations */}
      <div className="orb orb-primary w-[500px] h-[500px] -top-64 -right-64 opacity-30" />
      <div className="orb orb-accent w-[400px] h-[400px] top-1/2 -left-48 opacity-20" />
      <div className="orb orb-secondary w-[300px] h-[300px] bottom-0 right-1/4 opacity-25" />
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="badge-premium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Dashboard
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Xin chào, <span className="text-gradient">{profile?.name || 'bạn'}</span>! 👋
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Sẵn sàng cho buổi phỏng vấn tiếp theo chưa?
            </p>
          </div>
          <Link to="/interview/new">
            <Button size="lg" className="glow-sm group">
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Phỏng vấn mới
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((stat, index) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="glass-glow group hover:scale-[1.02] transition-transform duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-${stat.color}/10 group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-display font-bold stat-number">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content with Tabs */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Left Column - Sessions & Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass p-1">
                <TabsTrigger value="sessions" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">
                  <History className="h-4 w-4" />
                  Phiên gần đây
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">
                  <Activity className="h-4 w-4" />
                  Phân tích
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="mt-4">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <History className="h-5 w-5 text-primary" />
                      Phiên gần đây
                    </CardTitle>
                    <CardDescription>
                      Các buổi phỏng vấn gần nhất của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sessions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="relative w-20 h-20 mx-auto mb-4">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
                          <div className="absolute inset-2 rounded-full bg-muted flex items-center justify-center">
                            <History className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </div>
                        <h3 className="text-lg font-display font-semibold mb-2">Chưa có phiên phỏng vấn nào</h3>
                        <p className="text-muted-foreground mb-6">
                          Bắt đầu phỏng vấn đầu tiên của bạn ngay!
                        </p>
                        <Link to="/interview/new">
                          <Button className="glow-sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo phỏng vấn
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sessions
                          .filter(s => s.status !== 'in_progress') // Hide ongoing interviews
                          .map((session, index) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={session.status === 'completed' 
                                ? `/interview/${session.id}/report` 
                                : `/interview/${session.id}`
                              }
                              className="block group"
                            >
                              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
                                <div className="flex-shrink-0 text-3xl">
                                  {ROLE_INFO[session.role]?.icon || '💼'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-display font-semibold">
                                      {ROLE_INFO[session.role]?.labelVi || session.role}
                                    </span>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span className="text-sm text-muted-foreground">
                                      {LEVEL_INFO[session.level]?.labelVi || session.level}
                                    </span>
                                    {getStatusBadge(session.status)}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {format(new Date(session.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </span>
                                    {session.answerCount !== undefined && session.answerCount > 0 && (
                                      <span>{session.answerCount}/{session.total_questions} câu</span>
                                    )}
                                    {session.avgScore !== undefined && session.avgScore > 0 && (
                                      <span className="text-primary font-semibold">
                                        {session.avgScore.toFixed(1)}/5
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <AnalyticsCharts />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Gamification & AI Coach */}
          <div className="space-y-6">
            <Tabs defaultValue="gamification" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass p-1">
                <TabsTrigger value="gamification" className="gap-1 px-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Gamepad2 className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Game</span>
                </TabsTrigger>
                <TabsTrigger value="coach" className="gap-1 px-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Coach</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1 px-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Voice</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gamification" className="mt-4">
                <GamificationPanel />
              </TabsContent>

              <TabsContent value="coach" className="mt-4">
                <AICoachPanel />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <VoiceSettings />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
