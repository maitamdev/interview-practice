import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Target, 
  Sparkles, 
  Send, 
  CheckCircle, 
  Flame,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_INFO, LEVEL_INFO } from '@/types/interview';

interface DailyChallenge {
  id: string;
  challenge_date: string;
  role: string;
  level: string;
  question: string;
  hints: string[];
  sample_answer: string;
  difficulty: number;
  tags: string[];
}

interface UserAttempt {
  id: string;
  answer_text: string;
  score: number;
  feedback: {
    summary: string;
    strengths: string[];
    improvements: string[];
  };
  completed_at: string;
}

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [userAttempt, setUserAttempt] = useState<UserAttempt | null>(null);
  const [answer, setAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      loadTodayChallenge();
      loadStreak();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadTodayChallenge = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's challenge (using any to bypass type checking)
      let { data: challengeData, error: challengeError } = await (supabase
        .from('daily_challenges' as any)
        .select('*')
        .eq('challenge_date', today)
        .single() as any);

      console.log('Challenge data:', challengeData, 'Error:', challengeError);

      // If no challenge for today, generate one
      if (!challengeData || challengeError) {
        console.log('Generating new challenge for today...');
        const { data: generated, error: genError } = await supabase.functions.invoke('generate-daily-challenge', {
          body: { date: today },
        });
        
        console.log('Generated:', generated, 'Error:', genError);
        
        if (generated && !genError) {
          challengeData = generated;
        } else {
          toast({
            title: 'Lỗi',
            description: 'Không thể tạo thử thách. Vui lòng thử lại.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      if (challengeData) {
        setChallenge(challengeData as DailyChallenge);
        
        // Check if user already attempted
        const { data: attemptData } = await (supabase
          .from('daily_challenge_attempts' as any)
          .select('*')
          .eq('user_id', user!.id)
          .eq('challenge_id', challengeData.id)
          .single() as any);

        if (attemptData) {
          setUserAttempt(attemptData as UserAttempt);
        }
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async () => {
    if (!user) return;
    try {
      const { data } = await (supabase
        .from('user_statistics' as any)
        .select('daily_challenge_streak')
        .eq('user_id', user.id)
        .single() as any);
      
      if (data) {
        setStreak(data.daily_challenge_streak || 0);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const submitAnswer = async () => {
    if (!user || !challenge || !answer.trim()) return;
    
    setSubmitting(true);
    try {
      // Call AI to evaluate answer
      const { data: evalData, error: evalError } = await supabase.functions.invoke('evaluate-answer', {
        body: {
          question: challenge.question,
          answer: answer,
          role: challenge.role,
          level: challenge.level,
          mode: 'mixed',
          language: 'vi',
        },
      });

      if (evalError) throw evalError;

      const score = Math.round((evalData.scores?.overall || 3) * 20); // Convert to 0-100

      // Save attempt (using any to bypass type checking)
      const { data: attemptData, error: insertError } = await (supabase
        .from('daily_challenge_attempts' as any)
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          answer_text: answer,
          score,
          feedback: {
            summary: evalData.feedback?.summary || '',
            strengths: evalData.feedback?.strengths || [],
            improvements: evalData.feedback?.improvements || [],
          },
        })
        .select()
        .single() as any);

      if (insertError) throw insertError;

      setUserAttempt(attemptData as UserAttempt);

      // Update streak (using rpc with any)
      await (supabase.rpc as any)('increment_daily_challenge_streak', { p_user_id: user.id });
      setStreak(prev => prev + 1);

      toast({
        title: '🎉 Hoàn thành!',
        description: `Bạn đạt ${score} điểm. Streak: ${streak + 1} ngày!`,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi câu trả lời',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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
        <div className="container max-w-3xl mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Đăng nhập để tham gia thử thách</h1>
          <Button onClick={() => navigate('/auth')}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl mx-auto py-6 sm:py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full mb-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Thử thách hàng ngày</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{today}</h1>
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-orange-500">{streak}</div>
              <div className="text-xs text-muted-foreground">ngày liên tiếp</div>
            </div>
          </div>
        </div>

        {!challenge ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có thử thách hôm nay</h3>
              <p className="text-muted-foreground mb-4">Thử thách mới sẽ được tạo tự động</p>
              <Button onClick={loadTodayChallenge}>
                <Sparkles className="h-4 w-4 mr-2" />
                Tạo thử thách
              </Button>
            </CardContent>
          </Card>
        ) : userAttempt ? (
          /* Already completed */
          <div className="space-y-6">
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <CardTitle>Đã hoàn thành!</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-primary mb-2">{userAttempt.score}</div>
                  <div className="text-muted-foreground">điểm</div>
                  <Progress value={userAttempt.score} className="h-3 mt-4" />
                </div>

                {/* Question */}
                <div className="p-4 rounded-lg bg-muted/50 mb-4">
                  <h4 className="font-medium mb-2">Câu hỏi:</h4>
                  <p className="text-muted-foreground">{challenge.question}</p>
                </div>

                {/* Your answer */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                  <h4 className="font-medium mb-2">Câu trả lời của bạn:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{userAttempt.answer_text}</p>
                </div>

                {/* Feedback */}
                {userAttempt.feedback && (
                  <div className="p-4 rounded-lg bg-card border">
                    <h4 className="font-medium mb-2">Nhận xét:</h4>
                    <p className="text-muted-foreground">{userAttempt.feedback.summary}</p>
                  </div>
                )}

                {/* Sample answer */}
                {challenge.sample_answer && (
                  <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-600">
                      <Lightbulb className="h-4 w-4" />
                      Câu trả lời mẫu:
                    </h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{challenge.sample_answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">Quay lại vào ngày mai để tiếp tục streak!</p>
              <Button onClick={() => navigate('/interview/new')}>
                <Target className="h-4 w-4 mr-2" />
                Luyện tập thêm
              </Button>
            </div>
          </div>
        ) : (
          /* Challenge form */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {ROLE_INFO[challenge.role]?.labelVi || challenge.role}
                    </Badge>
                    <Badge variant="outline">
                      {LEVEL_INFO[challenge.level]?.labelVi || challenge.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i < challenge.difficulty ? "bg-amber-500" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl mt-4">{challenge.question}</CardTitle>
                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {challenge.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hints */}
                {challenge.hints && challenge.hints.length > 0 && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHints(!showHints)}
                      className="gap-2 text-amber-600"
                    >
                      <Lightbulb className="h-4 w-4" />
                      {showHints ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                    </Button>
                    {showHints && (
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {challenge.hints.map((hint, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Answer input */}
                <div>
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>{answer.length} ký tự</span>
                    <span>Tối thiểu 50 ký tự</span>
                  </div>
                </div>

                <Button
                  onClick={submitAnswer}
                  disabled={submitting || answer.length < 50}
                  className="w-full gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang chấm điểm...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Gửi câu trả lời
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Mẹo trả lời</h4>
                    <p className="text-sm text-muted-foreground">
                      Sử dụng phương pháp STAR (Situation, Task, Action, Result) để cấu trúc câu trả lời. 
                      Đưa ra ví dụ cụ thể từ kinh nghiệm thực tế của bạn.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
