import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '@/components/ui/skeleton-card';

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

const ROLE_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Fullstack',
  data: 'Data',
  qa: 'QA',
  ba: 'BA',
  devops: 'DevOps',
  mobile: 'Mobile',
};

const LEVEL_COLORS: Record<string, string> = {
  intern: 'bg-gray-500',
  junior: 'bg-green-500',
  mid: 'bg-blue-500',
  senior: 'bg-purple-500',
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
        return <Badge variant="default" className="bg-green-500">Hoàn thành</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-yellow-500">Đang diễn ra</Badge>;
      case 'abandoned':
        return <Badge variant="destructive">Đã huỷ</Badge>;
      default:
        return <Badge variant="secondary">Chưa bắt đầu</Badge>;
    }
  };

  if (loading) {
    return <SkeletonCard />;
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>Chưa có phiên phỏng vấn nào</p>
          <Button className="mt-4" onClick={() => navigate('/interview/new')}>
            Bắt đầu phỏng vấn đầu tiên
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Lịch sử phỏng vấn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/interview/${session.id}/report`)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${LEVEL_COLORS[session.level]}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ROLE_LABELS[session.role]}</span>
                      <Badge variant="outline" className="text-xs">
                        {session.level}
                      </Badge>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {session.current_question_index}/{session.total_questions} câu
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
