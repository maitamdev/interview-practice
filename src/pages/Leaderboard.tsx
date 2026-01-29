import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Medal, Crown, TrendingUp, 
  Flame, Target, Users, ArrowUp, ArrowDown, Minus
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
  change: 'up' | 'down' | 'same';
}

// Mock data for demo (in production, fetch from Supabase)
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: '1', name: 'Minh Nguyen', xp: 15420, level: 25, totalInterviews: 48, avgScore: 4.5, streak: 15, change: 'same' },
  { rank: 2, userId: '2', name: 'Linh Tran', xp: 12850, level: 22, totalInterviews: 42, avgScore: 4.3, streak: 12, change: 'up' },
  { rank: 3, userId: '3', name: 'Duc Le', xp: 11200, level: 20, totalInterviews: 38, avgScore: 4.2, streak: 8, change: 'up' },
  { rank: 4, userId: '4', name: 'Hoa Pham', xp: 9800, level: 18, totalInterviews: 35, avgScore: 4.0, streak: 5, change: 'down' },
  { rank: 5, userId: '5', name: 'Tuan Vo', xp: 8500, level: 16, totalInterviews: 30, avgScore: 3.9, streak: 7, change: 'same' },
  { rank: 6, userId: '6', name: 'Mai Hoang', xp: 7200, level: 14, totalInterviews: 28, avgScore: 3.8, streak: 3, change: 'up' },
  { rank: 7, userId: '7', name: 'Khoa Dang', xp: 6100, level: 12, totalInterviews: 25, avgScore: 3.7, streak: 4, change: 'down' },
  { rank: 8, userId: '8', name: 'Lan Bui', xp: 5400, level: 11, totalInterviews: 22, avgScore: 3.6, streak: 2, change: 'same' },
  { rank: 9, userId: '9', name: 'Nam Do', xp: 4800, level: 10, totalInterviews: 20, avgScore: 3.5, streak: 1, change: 'up' },
  { rank: 10, userId: '10', name: 'Thao Ngo', xp: 4200, level: 9, totalInterviews: 18, avgScore: 3.4, streak: 6, change: 'down' },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2: return <Medal className="h-6 w-6 text-gray-400" />;
    case 3: return <Medal className="h-6 w-6 text-amber-600" />;
    default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getChangeIcon = (change: 'up' | 'down' | 'same') => {
  switch (change) {
    case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
    case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
    default: return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLeaderboard(MOCK_LEADERBOARD);
      // Add current user to a random position for demo
      if (user) {
        setUserRank({
          rank: 15,
          userId: user.id,
          name: 'Bạn',
          xp: 2500,
          level: 7,
          totalInterviews: 12,
          avgScore: 3.8,
          streak: 3,
          change: 'up',
        });
      }
      setLoading(false);
    }, 1000);
  }, [user, timeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Trophy className="h-5 w-5" />
            <span className="font-medium">Bảng xếp hạng</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Top người luyện tập</h1>
          <p className="text-xl text-muted-foreground">
            Xem bạn đứng ở đâu so với cộng đồng
          </p>
        </div>

        {/* Your rank card */}
        {userRank && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">#{userRank.rank}</div>
                  <div>
                    <div className="font-semibold text-lg">Vị trí của bạn</div>
                    <div className="text-sm text-muted-foreground">
                      {userRank.xp.toLocaleString()} XP • Level {userRank.level}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getChangeIcon(userRank.change)}
                  <Button onClick={() => navigate('/interview/new')}>
                    Luyện tập ngay
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeframe tabs */}
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Tuần này</TabsTrigger>
            <TabsTrigger value="monthly">Tháng này</TabsTrigger>
            <TabsTrigger value="alltime">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {leaderboard.slice(0, 3).map((entry, index) => {
            const order = [1, 0, 2]; // 2nd, 1st, 3rd
            const actualEntry = leaderboard[order[index]];
            const heights = ['h-32', 'h-40', 'h-28'];
            const bgColors = ['bg-gray-400/20', 'bg-yellow-500/20', 'bg-amber-600/20'];
            
            return (
              <div key={actualEntry.userId} className="flex flex-col items-center">
                <Avatar className="h-16 w-16 mb-2 border-2 border-primary">
                  <AvatarFallback className="text-xl">
                    {actualEntry.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-center">{actualEntry.name}</div>
                <div className="text-sm text-muted-foreground mb-2">
                  {actualEntry.xp.toLocaleString()} XP
                </div>
                <div className={`w-full ${heights[index]} ${bgColors[index]} rounded-t-lg flex items-end justify-center pb-2`}>
                  {getRankIcon(actualEntry.rank)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bảng xếp hạng đầy đủ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    entry.rank <= 3 ? 'bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Level {entry.level} • {entry.totalInterviews} phỏng vấn
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold">{entry.xp.toLocaleString()} XP</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {entry.streak} ngày streak
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getChangeIcon(entry.change)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats comparison */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">3.8</div>
              <div className="text-sm text-muted-foreground">Điểm TB của bạn</div>
              <div className="text-xs text-green-500 mt-1">+0.3 so với TB</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Phỏng vấn của bạn</div>
              <div className="text-xs text-muted-foreground mt-1">TB: 28</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Streak của bạn</div>
              <div className="text-xs text-muted-foreground mt-1">Max: 15</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">#15</div>
              <div className="text-sm text-muted-foreground">Xếp hạng</div>
              <div className="text-xs text-green-500 mt-1">↑ 3 tuần này</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
