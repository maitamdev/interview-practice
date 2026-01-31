import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useGamification, getXpProgress } from '@/hooks/useGamification';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Trophy, 
  Flame, 
  Star, 
  Settings, 
  Save,
  Loader2,
  Award,
  Target,
  MessageSquare,
  Zap,
  Crown,
  ThumbsUp,
  Sparkles,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  Medal
} from 'lucide-react';
import { ROLE_INFO, LEVEL_INFO, InterviewRole, InterviewLevel, InterviewLanguage } from '@/types/interview';

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'trophy': Trophy,
  'flame': Flame,
  'zap': Zap,
  'star': Star,
  'crown': Crown,
  'target': Target,
  'award': Award,
  'thumbs-up': ThumbsUp,
  'sparkles': Sparkles,
  'message-square': MessageSquare,
};

export default function Profile() {
  const { user, profile } = useAuth();
  const { gamification, badges, userBadges } = useGamification();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<{
    name: string;
    target_role: InterviewRole;
    target_level: InterviewLevel;
    preferred_language: InterviewLanguage;
  }>({
    name: profile?.name || '',
    target_role: profile?.target_role || 'frontend',
    target_level: profile?.target_level || 'junior',
    preferred_language: profile?.preferred_language || 'vi',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        target_role: profile.target_role || 'frontend',
        target_level: profile.target_level || 'junior',
        preferred_language: profile.preferred_language || 'vi',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          target_role: formData.target_role as any,
          target_level: formData.target_level as any,
          preferred_language: formData.preferred_language,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Đã lưu!',
        description: 'Thông tin hồ sơ đã được cập nhật.',
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thông tin.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const xpProgress = gamification ? getXpProgress(gamification.xp) : { current: 0, required: 100, percentage: 0 };
  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div 
              className="flex flex-col md:flex-row items-center md:items-start gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-background shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-teal-500 text-white text-4xl font-display font-bold">
                    {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-bold shadow-lg">
                  Lv.{gamification?.level || 1}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                  {profile?.name || 'Người dùng'}
                </h1>
                <p className="text-muted-foreground mb-4">{user?.email}</p>
                
                {/* Target info */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <Badge variant="secondary" className="gap-1">
                    {ROLE_INFO[formData.target_role]?.icon} {ROLE_INFO[formData.target_role]?.labelVi}
                  </Badge>
                  <Badge variant="outline">
                    {LEVEL_INFO[formData.target_level]?.labelVi}
                  </Badge>
                </div>

                {/* XP Progress */}
                <div className="max-w-sm mx-auto md:mx-0">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tiến độ Level {(gamification?.level || 1) + 1}</span>
                    <span className="font-medium">{xpProgress.current}/{xpProgress.required} XP</span>
                  </div>
                  <Progress value={xpProgress.percentage} className="h-2" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden lg:flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-card/50 backdrop-blur rounded-lg px-4 py-2 border">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{gamification?.current_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Ngày streak</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-card/50 backdrop-blur rounded-lg px-4 py-2 border">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">{userBadges.length}</p>
                    <p className="text-xs text-muted-foreground">Huy hiệu</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{gamification?.xp || 0}</p>
                    <p className="text-xs text-muted-foreground">Tổng XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{gamification?.longest_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Streak cao nhất</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{gamification?.total_interviews || 0}</p>
                    <p className="text-xs text-muted-foreground">Phỏng vấn</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Medal className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userBadges.length}/{badges.length}</p>
                    <p className="text-xs text-muted-foreground">Huy hiệu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="badges" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="badges" className="gap-2 text-base">
                  <Trophy className="h-4 w-4" />
                  Huy hiệu
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </TabsTrigger>
              </TabsList>

              <TabsContent value="badges" className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((badge) => {
                    const isEarned = earnedBadgeIds.includes(badge.id);
                    const IconComponent = BADGE_ICONS[badge.icon] || Trophy;
                    
                    return (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Card className={`relative h-full transition-all ${
                          isEarned 
                            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg shadow-primary/10' 
                            : 'bg-muted/20 border-border/50 opacity-60 grayscale'
                        }`}>
                          <CardContent className="pt-6 text-center">
                            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                              isEarned 
                                ? 'bg-gradient-to-br from-primary/30 to-primary/10' 
                                : 'bg-muted/50'
                            }`}>
                              <IconComponent className={`h-8 w-8 ${isEarned ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <h4 className="font-semibold mb-1">{badge.name_vi}</h4>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{badge.description_vi}</p>
                            <Badge variant={isEarned ? 'default' : 'outline'} className="text-xs">
                              +{badge.xp_reward} XP
                            </Badge>
                            {isEarned && (
                              <div className="absolute top-3 right-3">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
                
                {badges.length === 0 && (
                  <Card className="py-12 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Chưa có huy hiệu nào</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Thông tin cá nhân
                    </CardTitle>
                    <CardDescription>
                      Cập nhật thông tin và mục tiêu nghề nghiệp của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ tên</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập họ tên của bạn"
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vị trí mục tiêu</Label>
                        <Select
                          value={formData.target_role}
                          onValueChange={(value) => setFormData({ ...formData, target_role: value as InterviewRole })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_INFO).map(([value, info]) => (
                              <SelectItem key={value} value={value}>
                                {info.icon} {info.labelVi}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Cấp độ mục tiêu</Label>
                        <Select
                          value={formData.target_level}
                          onValueChange={(value) => setFormData({ ...formData, target_level: value as InterviewLevel })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(LEVEL_INFO).map(([value, info]) => (
                              <SelectItem key={value} value={value}>
                                {info.labelVi} ({info.years})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Ngôn ngữ phỏng vấn</Label>
                      <Select
                        value={formData.preferred_language}
                        onValueChange={(value) => setFormData({ ...formData, preferred_language: value as InterviewLanguage })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full h-11">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
