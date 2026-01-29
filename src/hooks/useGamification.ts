import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserGamification {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_interviews: number;
  total_questions_answered: number;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  name_vi: string;
  description: string;
  description_vi: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  title: string;
  title_vi: string;
  description: string;
  description_vi: string;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  is_completed?: boolean;
}

// XP required for each level
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXp(xp: number): number {
  let level = 1;
  let totalXp = 0;
  while (totalXp + getXpForLevel(level) <= xp) {
    totalXp += getXpForLevel(level);
    level++;
  }
  return level;
}

export function getXpProgress(xp: number): { current: number; required: number; percentage: number } {
  const level = getLevelFromXp(xp);
  let totalXpForCurrentLevel = 0;
  for (let i = 1; i < level; i++) {
    totalXpForCurrentLevel += getXpForLevel(i);
  }
  const currentLevelXp = xp - totalXpForCurrentLevel;
  const requiredXp = getXpForLevel(level);
  return {
    current: currentLevelXp,
    required: requiredXp,
    percentage: (currentLevelXp / requiredXp) * 100,
  };
}

export function useGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  // Load gamification data
  const loadGamification = useCallback(async () => {
    if (!user) return;

    try {
      // Load or create user gamification
      let { data: gamData, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!gamData && !gamError) {
        // Create new gamification record
        const { data: newGam, error: insertError } = await supabase
          .from('user_gamification')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        gamData = newGam;
      }

      if (gamError) throw gamError;
      setGamification(gamData);

      // Load all badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value', { ascending: true });
      
      if (badgesError) throw badgesError;
      setBadges(allBadges || []);

      // Load user's earned badges
      const { data: earnedBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id);
      
      if (userBadgesError) throw userBadgesError;
      setUserBadges((earnedBadges || []).map(ub => ({
        ...ub,
        badge: ub.badge as unknown as Badge,
      })));

      // Load today's challenge
      const today = new Date().toISOString().split('T')[0];
      const { data: challenge, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .maybeSingle();
      
      if (challengeError) throw challengeError;
      
      if (challenge) {
        // Check if completed
        const { data: completion } = await supabase
          .from('user_challenge_completions')
          .select('id')
          .eq('user_id', user.id)
          .eq('challenge_id', challenge.id)
          .maybeSingle();
        
        setDailyChallenge({
          ...challenge,
          is_completed: !!completion,
        });
      }
    } catch (err) {
      console.error('Error loading gamification:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGamification();
  }, [loadGamification]);

  // Add XP to user
  const addXp = useCallback(async (amount: number, reason: string) => {
    if (!user || !gamification) return;

    const newXp = gamification.xp + amount;
    const newLevel = getLevelFromXp(newXp);
    const leveledUp = newLevel > gamification.level;

    try {
      const { error } = await supabase
        .from('user_gamification')
        .update({
          xp: newXp,
          level: newLevel,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setGamification(prev => prev ? {
        ...prev,
        xp: newXp,
        level: newLevel,
      } : null);

      toast({
        title: `+${amount} XP`,
        description: reason,
      });

      if (leveledUp) {
        toast({
          title: '🎉 Level Up!',
          description: `Bạn đã lên Level ${newLevel}!`,
        });
      }
    } catch (err) {
      console.error('Error adding XP:', err);
    }
  }, [user, gamification, toast]);

  // Update streak
  const updateStreak = useCallback(async () => {
    if (!user || !gamification) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastActivity = gamification.last_activity_date;

    let newStreak = gamification.current_streak;
    
    if (lastActivity === today) {
      // Already updated today
      return;
    } else if (lastActivity === yesterday) {
      // Continue streak
      newStreak += 1;
    } else {
      // Reset streak
      newStreak = 1;
    }

    const newLongestStreak = Math.max(newStreak, gamification.longest_streak);

    try {
      const { error } = await supabase
        .from('user_gamification')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setGamification(prev => prev ? {
        ...prev,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
      } : null);

      // Check for streak badges
      await checkBadges('streak', newStreak);
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  }, [user, gamification]);

  // Increment stats
  const incrementStats = useCallback(async (field: 'total_interviews' | 'total_questions_answered', amount: number = 1) => {
    if (!user || !gamification) return;

    const newValue = (gamification[field] || 0) + amount;

    try {
      const { error } = await supabase
        .from('user_gamification')
        .update({ [field]: newValue })
        .eq('user_id', user.id);

      if (error) throw error;

      setGamification(prev => prev ? {
        ...prev,
        [field]: newValue,
      } : null);

      // Check for related badges
      if (field === 'total_interviews') {
        await checkBadges('interviews', newValue);
      } else if (field === 'total_questions_answered') {
        await checkBadges('questions', newValue);
      }
    } catch (err) {
      console.error('Error incrementing stats:', err);
    }
  }, [user, gamification]);

  // Check and award badges
  const checkBadges = useCallback(async (type: string, value: number) => {
    if (!user) return;

    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
    const eligibleBadges = badges.filter(
      b => b.requirement_type === type && 
           b.requirement_value <= value && 
           !earnedBadgeIds.includes(b.id)
    );

    for (const badge of eligibleBadges) {
      try {
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_id: badge.id,
          });

        if (error) throw error;

        setUserBadges(prev => [...prev, {
          id: crypto.randomUUID(),
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
          badge,
        }]);

        // Award XP for badge
        await addXp(badge.xp_reward, `Đạt huy hiệu: ${badge.name_vi}`);

        toast({
          title: '🏆 Huy hiệu mới!',
          description: badge.name_vi,
        });
      } catch (err) {
        console.error('Error awarding badge:', err);
      }
    }
  }, [user, badges, userBadges, addXp, toast]);

  // Check score badge
  const checkScoreBadge = useCallback(async (score: number) => {
    if (score >= 5) {
      await checkBadges('score', 5);
    } else if (score >= 4) {
      await checkBadges('score', 4);
    }
  }, [checkBadges]);

  // Complete daily challenge
  const completeDailyChallenge = useCallback(async () => {
    if (!user || !dailyChallenge || dailyChallenge.is_completed) return;

    try {
      const { error } = await supabase
        .from('user_challenge_completions')
        .insert({
          user_id: user.id,
          challenge_id: dailyChallenge.id,
        });

      if (error) throw error;

      setDailyChallenge(prev => prev ? { ...prev, is_completed: true } : null);
      await addXp(dailyChallenge.xp_reward, 'Hoàn thành thử thách hàng ngày');

      toast({
        title: '✅ Thử thách hoàn thành!',
        description: dailyChallenge.title_vi,
      });
    } catch (err) {
      console.error('Error completing challenge:', err);
    }
  }, [user, dailyChallenge, addXp, toast]);

  return {
    gamification,
    badges,
    userBadges,
    dailyChallenge,
    loading,
    addXp,
    updateStreak,
    incrementStats,
    checkScoreBadge,
    completeDailyChallenge,
    refresh: loadGamification,
  };
}
