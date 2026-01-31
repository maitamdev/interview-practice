import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Trophy, 
  Target, 
  Zap,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastPracticeDate: string | null;
  todayCompleted: boolean;
}

const motivationalMessages = [
  { streak: 0, message: "Bắt đầu hành trình của bạn hôm nay! 🚀" },
  { streak: 1, message: "Khởi đầu tuyệt vời! Tiếp tục nhé! 💪" },
  { streak: 3, message: "3 ngày liên tiếp! Bạn đang làm rất tốt! 🔥" },
  { streak: 7, message: "1 tuần streak! Bạn thật kiên trì! 🏆" },
  { streak: 14, message: "2 tuần không nghỉ! Incredible! ⭐" },
  { streak: 30, message: "1 tháng streak! Bạn là legend! 👑" },
];

export function StreakMotivation() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    lastPracticeDate: null,
    todayCompleted: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStreakData();
    }
  }, [user]);

  const loadStreakData = async () => {
    if (!user) return;

    try {
      // Get all completed sessions grouped by date
      const { data: sessions } = await supabase
        .from('interview_sessions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (!sessions || sessions.length === 0) {
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          totalDays: 0,
          lastPracticeDate: null,
          todayCompleted: false,
        });
        setLoading(false);
        return;
      }

      // Get unique practice dates
      const practiceDates = new Set<string>();
      sessions.forEach(s => {
        const date = new Date(s.created_at).toISOString().split('T')[0];
        practiceDates.add(date);
      });

      const sortedDates = Array.from(practiceDates).sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Calculate current streak
      let currentStreak = 0;
      let checkDate = sortedDates[0] === today ? today : yesterday;
      
      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        for (const date of sortedDates) {
          if (date === checkDate) {
            currentStreak++;
            checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
          } else if (date < checkDate) {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;
      const allDates = Array.from(practiceDates).sort();
      
      for (let i = 1; i < allDates.length; i++) {
        const prevDate = new Date(allDates[i - 1]);
        const currDate = new Date(allDates[i]);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / 86400000;
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      setStreakData({
        currentStreak,
        longestStreak,
        totalDays: practiceDates.size,
        lastPracticeDate: sortedDates[0],
        todayCompleted: sortedDates[0] === today,
      });
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMessage = () => {
    const applicable = motivationalMessages
      .filter(m => m.streak <= streakData.currentStreak)
      .pop();
    return applicable?.message || motivationalMessages[0].message;
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      streakData.currentStreak > 0 
        ? "bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20" 
        : "bg-gradient-to-br from-muted/50 to-transparent"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Streak flame */}
          <motion.div
            className={cn(
              "relative w-14 h-14 rounded-full flex items-center justify-center",
              streakData.currentStreak > 0 
                ? "bg-gradient-to-br from-orange-500 to-amber-500" 
                : "bg-muted"
            )}
            animate={streakData.currentStreak > 0 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className={cn(
              "h-7 w-7",
              streakData.currentStreak > 0 ? "text-white" : "text-muted-foreground"
            )} />
            {streakData.currentStreak > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-background text-xs font-bold px-1.5 py-0.5 rounded-full border border-orange-500/30">
                {streakData.currentStreak}
              </span>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">
                {streakData.currentStreak > 0 
                  ? `${streakData.currentStreak} ngày streak!` 
                  : 'Chưa có streak'}
              </span>
              {streakData.todayCompleted && (
                <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full">
                  ✓ Hôm nay
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{getMessage()}</p>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Trophy className="h-4 w-4" />
                <span className="font-bold">{streakData.longestStreak}</span>
              </div>
              <span className="text-xs text-muted-foreground">Kỷ lục</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-primary">
                <Calendar className="h-4 w-4" />
                <span className="font-bold">{streakData.totalDays}</span>
              </div>
              <span className="text-xs text-muted-foreground">Tổng ngày</span>
            </div>
          </div>
        </div>

        {/* Progress to next milestone */}
        {streakData.currentStreak > 0 && streakData.currentStreak < 30 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Tiến độ đến mốc tiếp theo</span>
              <span>
                {streakData.currentStreak < 7 ? '7 ngày' : 
                 streakData.currentStreak < 14 ? '14 ngày' : '30 ngày'}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${
                    streakData.currentStreak < 7 ? (streakData.currentStreak / 7) * 100 :
                    streakData.currentStreak < 14 ? ((streakData.currentStreak - 7) / 7) * 100 :
                    ((streakData.currentStreak - 14) / 16) * 100
                  }%` 
                }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
