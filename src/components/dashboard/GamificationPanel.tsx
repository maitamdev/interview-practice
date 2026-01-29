import { motion } from 'framer-motion';
import { useGamification, getXpProgress } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  Zap, 
  Trophy, 
  Star, 
  Target,
  Award,
  Crown,
  ThumbsUp,
  Sparkles,
  MessageSquare,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  crown: Crown,
  target: Target,
  award: Award,
  star: Star,
  'thumbs-up': ThumbsUp,
  sparkles: Sparkles,
  'message-square': MessageSquare,
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function GamificationPanel() {
  const { gamification, badges, userBadges, dailyChallenge, loading } = useGamification();

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="py-12 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const xpProgress = gamification ? getXpProgress(gamification.xp) : { current: 0, required: 100, percentage: 0 };
  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      {/* XP & Level Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass overflow-hidden">
          <div className="relative p-5">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 p-0.5">
                      <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center">
                        <Zap className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {gamification?.level || 1}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-3xl font-display font-bold">{gamification?.level || 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-display font-bold text-gradient stat-number">{gamification?.xp || 0}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{xpProgress.current} XP</span>
                  <span>{xpProgress.required} XP để lên level</span>
                </div>
                <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Streak Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                  gamification?.current_streak && gamification.current_streak > 0 
                    ? "bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30" 
                    : "bg-muted"
                )}>
                  <Flame className={cn(
                    "h-6 w-6 transition-all",
                    gamification?.current_streak && gamification.current_streak > 0 
                      ? "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" 
                      : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="font-display font-semibold">Streak hiện tại</p>
                  <p className="text-sm text-muted-foreground">
                    Kỷ lục: <span className="text-orange-400 font-medium">{gamification?.longest_streak || 0}</span> ngày
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-display font-bold stat-number">{gamification?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">ngày</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Challenge */}
      {dailyChallenge && (
        <motion.div variants={itemVariants}>
          <Card className={cn(
            "glass border-2 transition-all",
            dailyChallenge.is_completed 
              ? "border-primary/40 bg-primary/5" 
              : "border-dashed border-border/60 hover:border-accent/50"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 font-display">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  dailyChallenge.is_completed ? "bg-primary/20" : "bg-accent/20"
                )}>
                  <Target className={cn(
                    "h-4 w-4",
                    dailyChallenge.is_completed ? "text-primary" : "text-accent"
                  )} />
                </div>
                Thử thách hôm nay
                {dailyChallenge.is_completed && (
                  <span className="badge-premium ml-auto">
                    ✅ Hoàn thành
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display font-semibold text-lg">{dailyChallenge.title_vi}</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {dailyChallenge.description_vi}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="badge-premium">
                  <Zap className="h-3 w-3 mr-1" />
                  +{dailyChallenge.xp_reward} XP
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Badges */}
      <motion.div variants={itemVariants}>
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 font-display">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              Huy hiệu 
              <span className="ml-auto text-muted-foreground font-normal">
                {userBadges.length}/{badges.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {badges.map((badge, index) => {
                const Icon = BADGE_ICONS[badge.icon] || Trophy;
                const isEarned = earnedBadgeIds.includes(badge.id);
                
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-default group relative",
                      isEarned 
                        ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/30 hover:scale-105" 
                        : "bg-muted/30 text-muted-foreground/50 border border-transparent"
                    )}
                    title={`${badge.name_vi}: ${badge.description_vi}`}
                  >
                    {isEarned && (
                      <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <Icon className={cn(
                      "h-5 w-5 relative z-10 transition-transform",
                      isEarned && "group-hover:scale-110"
                    )} />
                    <span className="text-[9px] mt-1.5 text-center truncate w-full relative z-10 font-medium">
                      {badge.name_vi}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
