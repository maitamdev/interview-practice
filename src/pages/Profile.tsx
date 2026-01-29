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
  Sparkles
} from 'lucide-react';
import { ROLE_INFO, LEVEL_INFO, InterviewRole, InterviewLevel, InterviewLanguage } from '@/types/interview';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Icon mapping for badges
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
  const { gamification, badges, userBadges, loading: gamLoading } = useGamification();
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

  // Update form data when profile loads
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
        .update(formData)
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
        description: 'Không thể lưu thông tin. Vui lòng thử lại.',
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
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-2xl font-display font-bold">
                {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-display font-bold">{profile?.name || 'User'}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              {gamification && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    Level {gamification.level}
                  </Badge>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    <Flame className="h-3 w-3 mr-1" />
                    {gamification.current_streak} ngày streak
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-display font-bold text-primary">{gamification?.xp || 0}</div>
                <p className="text-sm text-muted-foreground">Tổng XP</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-display font-bold text-warning">{gamification?.longest_streak || 0}</div>
                <p className="text-sm text-muted-foreground">Streak dài nhất</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-display font-bold text-success">{gamification?.total_interviews || 0}</div>
                <p className="text-sm text-muted-foreground">Phỏng vấn</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-display font-bold text-accent">{userBadges.length}</div>
                <p className="text-sm text-muted-foreground">Huy hiệu</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Level Progress */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Tiến độ Level {gamification?.level || 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={xpProgress.percentage} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {xpProgress.current} / {xpProgress.required} XP để lên Level {(gamification?.level || 1) + 1}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeInUp}>
            <Tabs defaultValue="badges" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="badges" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Huy hiệu
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </TabsTrigger>
              </TabsList>

              <TabsContent value="badges" className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {badges.map((badge) => {
                    const isEarned = earnedBadgeIds.includes(badge.id);
                    const IconComponent = BADGE_ICONS[badge.icon] || Trophy;
                    
                    return (
                      <Card
                        key={badge.id}
                        className={`relative transition-all ${
                          isEarned 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'bg-muted/30 border-border opacity-50'
                        }`}
                      >
                        <CardContent className="pt-6 text-center">
                          <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 ${
                            isEarned ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <IconComponent className={`h-7 w-7 ${isEarned ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{badge.name_vi}</h4>
                          <p className="text-xs text-muted-foreground">{badge.description_vi}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            +{badge.xp_reward} XP
                          </Badge>
                          {isEarned && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Thông tin cá nhân
                    </CardTitle>
                    <CardDescription>
                      Cập nhật thông tin và mục tiêu của bạn
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
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vị trí mục tiêu</Label>
                        <Select
                          value={formData.target_role}
                          onValueChange={(value) => setFormData({ ...formData, target_role: value as InterviewRole })}
                        >
                          <SelectTrigger>
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
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(LEVEL_INFO).map(([value, info]) => (
                              <SelectItem key={value} value={value}>
                                {info.labelVi}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Ngôn ngữ ưa thích</Label>
                      <Select
                        value={formData.preferred_language}
                        onValueChange={(value) => setFormData({ ...formData, preferred_language: value as InterviewLanguage })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full">
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
        </motion.div>
      </main>
    </div>
  );
}
