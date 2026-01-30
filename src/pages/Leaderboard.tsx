import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Medal, Crown, TrendingUp, 
  Flame, Target, Users
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonCard } from '@/components/ui/skeleton-card';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  totalInterviews: number;
  avgScore: number;
  streak: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2: return <Medal className="h-6 w-6 text-gray-400" />;
    case 3: return <Medal className="h-6 w-6 text-amber-600" />;
    default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  }
};


export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [userStats, setUserStats] = useState<{ avgScore: number; totalInterviews: number } | null>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('alltime');

  useEffect(() => {
    fetchLeaderboard();
  }, [user, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all users' gamification data
      const { data: gamificationData, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);

      if (gamError) throw gamError;

      // Fetch profiles for names
      const userIds = gamificationData?.map(g => g.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      const profileMap = new Map(profilesData?.map(p => [p.user_id, p.name]) || []);

      // Build leaderboard entries
      const entries: LeaderboardEntry[] = (gamificationData || []).map((g, index) => ({
        rank: index + 1,
        userId: g.user_id,
        name: profileMap.get(g.user_id) || 'Người dùng',
        xp: g.xp,
        level: g.level,
        totalInterviews: g.total_interviews,
        avgScore: 0,
        streak: g.current_streak,
      }));

      setLeaderboard(entries);

      // Find current user's rank
      if (user) {
        const currentUserEntry = entries.find(e => e.userId === user.id);
        if (currentUserEntry) {
          setUserRank(currentUserEntry);
          setUserStats({ avgScore: currentUserEntry.avgScore, totalInterviews: currentUserEntry.totalInterviews });
        } else {
          // User not in leaderboard yet
          const { data: userGam } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (userGam) {
            setUserRank({
              rank: entries.length + 1,
              userId: user.id,
              name: 'Bạn',
              xp: userGam.xp,
              level: userGam.level,
              totalInterviews: userGam.total_interviews,
              avgScore: 0,
              streak: userGam.current_streak,
            });
            setUserStats({ avgScore: 0, totalInterviews: userGam.total_interviews });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-8 px-4"><SkeletonCard /></div>
      </div>
    );
  }

  const avgInterviews = leaderboard.length > 0
    ? Math.round(leaderboard.reduce((a, b) => a + b.totalInterviews, 0) / leaderboard.length) : 0;
  const maxStreak = leaderboard.length > 0 ? Math.max(...leaderboard.map(e => e.streak)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Trophy className="h-5 w-5" />
            <span className="font-medium">Bảng xếp hạng</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Top người luyện tập</h1>
          <p className="text-xl text-muted-foreground">Xem bạn đứng ở đâu so với cộng đồng</p>
        </div>

        {userRank && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">#{userRank.rank}</div>
                  <div>
                    <div className="font-semibold text-lg">Vị trí của bạn</div>
                    <div className="text-sm text-muted-foreground">{userRank.xp.toLocaleString()} XP • Level {userRank.level}</div>
                  </div>
                </div>
                <Button onClick={() => navigate('/interview/new')}>Luyện tập ngay</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Tuần này</TabsTrigger>
            <TabsTrigger value="monthly">Tháng này</TabsTrigger>
            <TabsTrigger value="alltime">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>

        {leaderboard.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Chưa có ai trên bảng xếp hạng</h3>
              <p className="text-muted-foreground mb-4">Hãy là người đầu tiên hoàn thành phỏng vấn!</p>
              <Button onClick={() => navigate('/interview/new')}>Bắt đầu phỏng vấn</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 0, 2].map((orderIndex) => {
                  const entry = leaderboard[orderIndex];
                  if (!entry) return null;
                  const heights = ['h-32', 'h-40', 'h-28'];
                  const bgColors = ['bg-gray-400/20', 'bg-yellow-500/20', 'bg-amber-600/20'];
                  const displayIndex = orderIndex === 0 ? 1 : orderIndex === 1 ? 0 : 2;
                  return (
                    <div key={entry.userId} className="flex flex-col items-center">
                      <Avatar className="h-16 w-16 mb-2 border-2 border-primary">
                        <AvatarFallback className="text-xl">{entry.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-center truncate max-w-full">{entry.name}</div>
                      <div className="text-sm text-muted-foreground mb-2">{entry.xp.toLocaleString()} XP</div>
                      <div className={`w-full ${heights[displayIndex]} ${bgColors[displayIndex]} rounded-t-lg flex items-end justify-center pb-2`}>
                        {getRankIcon(entry.rank)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Bảng xếp hạng đầy đủ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div key={entry.userId} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${entry.rank <= 3 ? 'bg-primary/5' : 'hover:bg-muted/50'} ${entry.userId === user?.id ? 'ring-2 ring-primary' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>
                        <Avatar className="h-10 w-10"><AvatarFallback>{entry.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-medium">{entry.name}{entry.userId === user?.id && <span className="text-primary ml-2">(Bạn)</span>}</div>
                          <div className="text-sm text-muted-foreground">Level {entry.level} • {entry.totalInterviews} phỏng vấn</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-semibold">{entry.xp.toLocaleString()} XP</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{entry.streak} ngày streak</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card><CardContent className="pt-6 text-center"><TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" /><div className="text-2xl font-bold">{userStats.avgScore || 0}</div><div className="text-sm text-muted-foreground">Điểm TB</div></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><Target className="h-8 w-8 mx-auto mb-2 text-primary" /><div className="text-2xl font-bold">{userStats.totalInterviews}</div><div className="text-sm text-muted-foreground">Phỏng vấn</div><div className="text-xs text-muted-foreground mt-1">TB: {avgInterviews}</div></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" /><div className="text-2xl font-bold">{userRank?.streak || 0}</div><div className="text-sm text-muted-foreground">Streak</div><div className="text-xs text-muted-foreground mt-1">Max: {maxStreak}</div></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" /><div className="text-2xl font-bold">#{userRank?.rank || '-'}</div><div className="text-sm text-muted-foreground">Xếp hạng</div></CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}
