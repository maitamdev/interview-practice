import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Target, Flame, Star } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

export function StatsCards() {
  const { gamification } = useGamification();

  const stats = [
    {
      label: 'Tổng phỏng vấn',
      value: gamification?.total_interviews || 0,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Câu hỏi đã trả lời',
      value: gamification?.total_questions_answered || 0,
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Streak hiện tại',
      value: `${gamification?.current_streak || 0} ngày`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Level',
      value: gamification?.level || 1,
      icon: Trophy,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
