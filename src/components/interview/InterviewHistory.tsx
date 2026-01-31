import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Target, ChevronRight, History, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonList } from '@/components/ui/skeleton-card';
import { ROLE_INFO, LEVEL_INFO } from '@/types/interview';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  role: string;
  level: string;
  mode: string;
  status: string;
  created_at: string;
  ended_at: string | null;
  total_questions: number;
  current_question_index: number;
}

const LEVEL_COLORS: Record<string, string> = {
  intern: 'from-gray-400 to-gray-500',
  junior: 'from-green-400 to-emerald-500',
  mid: 'from-blue-400 to-cyan-500',
  senior: 'from-purple-400 to-pink-500',
};

export function InterviewHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setSessions(data);
      }
      setLoading(false);
    };

    fetchSessions();
  }, [user]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Hoàn thành</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Đang diễn ra</Badge>;
      case 'abandoned':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Đã huỷ</Badge>;
      default:
        return <Badge variant="secondary">Chưa bắt đầu</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Lịch sử phỏng vấn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonList count={5} />
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <History className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Chưa có phiên phỏng vấn nào</h3>
          <p className="text-muted-foreground mb-6">Bắt đầu phỏng vấn đầu tiên của bạn ngay!</p>
          <Button onClick={() => navigate('/interview/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Bắt đầu phỏng vấn
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Lịch sử phỏng vấn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const roleInfo = ROLE_INFO[session.role as keyof typeof ROLE_INFO];
              const levelInfo = LEVEL_INFO[session.level as keyof typeof LEVEL_INFO];
              const progress = Math.round((session.current_question_index / session.total_questions) * 100);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
                    "hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5"
                  )}
                  onClick={() => navigate(
                    session.status === 'completed' 
                      ? `/interview/${session.id}/report` 
                      : `/interview/${session.id}`
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Role icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                      `bg-gradient-to-br ${LEVEL_COLORS[session.level] || 'from-gray-400 to-gray-500'}`,
                      "bg-opacity-20"
                    )}>
                      {roleInfo?.icon || '💼'}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{roleInfo?.labelVi || session.role}</span>
                        <Badge variant="outline" className="text-xs">
                          {levelInfo?.labelVi || session.level}
                        </Badge>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(session.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" />
                          {session.current_question_index}/{session.total_questions} câu
                        </span>
                        {session.status === 'completed' && (
                          <span className="flex items-center gap-1 text-primary">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {progress}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
