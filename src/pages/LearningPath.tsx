import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  BookOpen, CheckCircle, Play, Clock, Target, Sparkles, ChevronDown, ChevronUp,
  Youtube, Search, Loader2, Trash2, Code, Database, Megaphone, Users, 
  Briefcase, PenTool, BarChart3, Headphones, Smartphone, Server, ShieldCheck
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserRoadmapItem {
  id: string;
  user_id: string;
  session_id: string | null;
  topic_id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  skills: string[];
  resources: string[];
  estimated_hours: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  role?: string;
}

// Role categories with icons and labels
const ROLE_CATEGORIES = {
  frontend: { label: 'Frontend', icon: Code, color: 'text-blue-500', bgColor: 'bg-blue-500' },
  backend: { label: 'Backend', icon: Server, color: 'text-green-500', bgColor: 'bg-green-500' },
  fullstack: { label: 'Fullstack', icon: Database, color: 'text-purple-500', bgColor: 'bg-purple-500' },
  mobile: { label: 'Mobile', icon: Smartphone, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  devops: { label: 'DevOps', icon: ShieldCheck, color: 'text-red-500', bgColor: 'bg-red-500' },
  data: { label: 'Data', icon: BarChart3, color: 'text-cyan-500', bgColor: 'bg-cyan-500' },
  qa: { label: 'QA/Testing', icon: CheckCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  marketing: { label: 'Marketing', icon: Megaphone, color: 'text-pink-500', bgColor: 'bg-pink-500' },
  sales: { label: 'Sales', icon: Briefcase, color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
  hr: { label: 'HR', icon: Users, color: 'text-indigo-500', bgColor: 'bg-indigo-500' },
  design: { label: 'Design', icon: PenTool, color: 'text-violet-500', bgColor: 'bg-violet-500' },
  product: { label: 'Product', icon: Target, color: 'text-amber-500', bgColor: 'bg-amber-500' },
  customer_service: { label: 'CSKH', icon: Headphones, color: 'text-teal-500', bgColor: 'bg-teal-500' },
  other: { label: 'Khác', icon: BookOpen, color: 'text-gray-500', bgColor: 'bg-gray-500' },
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'high':
      return { label: 'Cao', color: 'bg-red-500', textColor: 'text-red-500', borderColor: 'border-red-500/30' };
    case 'medium':
      return { label: 'TB', color: 'bg-amber-500', textColor: 'text-amber-500', borderColor: 'border-amber-500/30' };
    case 'low':
      return { label: 'Thấp', color: 'bg-emerald-500', textColor: 'text-emerald-500', borderColor: 'border-emerald-500/30' };
    default:
      return { label: 'Khác', color: 'bg-gray-500', textColor: 'text-gray-500', borderColor: 'border-gray-500/30' };
  }
};

export default function LearningPath() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roadmapItems, setRoadmapItems] = useState<UserRoadmapItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<UserRoadmapItem | null>(null);
  const [activeRole, setActiveRole] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRoadmaps();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRoadmaps = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch roadmaps with session info to get role
      const { data, error } = await supabase
        .from('user_learning_roadmaps')
        .select(`
          *,
          interview_sessions (role)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map role from session
      const itemsWithRole = (data || []).map(item => ({
        ...item,
        role: item.interview_sessions?.role || 'other',
      })) as UserRoadmapItem[];
      
      setRoadmapItems(itemsWithRole);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (itemId: string, newProgress: number) => {
    if (!user) return;
    try {
      const status = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
      const updates: Record<string, unknown> = {
        progress: newProgress,
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (newProgress > 0 && !roadmapItems.find(i => i.id === itemId)?.started_at) {
        updates.started_at = new Date().toISOString();
      }
      if (newProgress >= 100) {
        updates.completed_at = new Date().toISOString();
      }

      await supabase
        .from('user_learning_roadmaps')
        .update(updates)
        .eq('id', itemId);

      setRoadmapItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, progress: newProgress, status } as UserRoadmapItem : item
      ));

      if (newProgress >= 100) {
        toast({ title: '🎉 Hoàn thành!', description: 'Bạn đã hoàn thành chủ đề này!' });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const deleteRoadmapItem = async (itemId: string) => {
    if (!user) return;
    try {
      await supabase.from('user_learning_roadmaps').delete().eq('id', itemId);
      setRoadmapItems(prev => prev.filter(item => item.id !== itemId));
      toast({ title: 'Đã xóa', description: 'Đã xóa chủ đề khỏi lộ trình học tập' });
    } catch (error) {
      console.error('Error deleting roadmap item:', error);
    }
  };

  // Group items by role
  const groupedByRole = useMemo(() => {
    const groups: Record<string, UserRoadmapItem[]> = {};
    roadmapItems.forEach(item => {
      const role = item.role || 'other';
      if (!groups[role]) groups[role] = [];
      groups[role].push(item);
    });
    return groups;
  }, [roadmapItems]);

  // Get available roles that have items
  const availableRoles = useMemo(() => {
    return Object.keys(groupedByRole).sort((a, b) => {
      const order = Object.keys(ROLE_CATEGORIES);
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [groupedByRole]);

  // Filter items based on active role
  const filteredItems = useMemo(() => {
    if (activeRole === 'all') return roadmapItems;
    return roadmapItems.filter(item => item.role === activeRole);
  }, [roadmapItems, activeRole]);

  // Sort by priority
  const sortedItems = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...filteredItems].sort((a, b) => 
      (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
    );
  }, [filteredItems]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredItems.length;
    const completed = filteredItems.filter(i => i.status === 'completed').length;
    const inProgress = filteredItems.filter(i => i.status === 'in_progress').length;
    const totalHours = filteredItems.reduce((sum, i) => sum + (i.estimated_hours || 0), 0);
    const avgProgress = total > 0 ? Math.round(filteredItems.reduce((sum, i) => sum + i.progress, 0) / total) : 0;
    return { total, completed, inProgress, totalHours, avgProgress };
  }, [filteredItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl mx-auto py-8 px-4"><SkeletonCard /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-4 text-sm">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">Lộ trình học tập</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">Lộ trình học tập cá nhân hóa</h1>
          <p className="text-sm sm:text-xl text-muted-foreground">
            Dựa trên kết quả phỏng vấn, AI đã tạo lộ trình học phù hợp với bạn
          </p>
        </div>

        {roadmapItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có lộ trình học tập</h3>
              <p className="text-muted-foreground mb-6">
                Hoàn thành một buổi phỏng vấn để AI tạo lộ trình học tập cá nhân hóa cho bạn
              </p>
              <Button onClick={() => navigate('/interview/new')}>
                <Target className="h-4 w-4 mr-2" />
                Bắt đầu phỏng vấn
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Role Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant={activeRole === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveRole('all')}
                  className="flex-shrink-0"
                >
                  Tất cả ({roadmapItems.length})
                </Button>
                {availableRoles.map(role => {
                  const config = ROLE_CATEGORIES[role as keyof typeof ROLE_CATEGORIES] || ROLE_CATEGORIES.other;
                  const Icon = config.icon;
                  const count = groupedByRole[role]?.length || 0;
                  return (
                    <Button
                      key={role}
                      variant={activeRole === role ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveRole(role)}
                      className={cn("flex-shrink-0 gap-1.5", activeRole !== role && config.color)}
                    >
                      <Icon className="h-4 w-4" />
                      {config.label} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.total}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Chủ đề</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-500">{stats.inProgress}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Đang học</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-500">{stats.completed}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Hoàn thành</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{stats.avgProgress}%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Tiến độ</div>
                </CardContent>
              </Card>
            </div>

            {/* Roadmap Items */}
            <div className="space-y-3 sm:space-y-4">
              {sortedItems.map((item, index) => {
                const priorityConfig = getPriorityConfig(item.priority);
                const roleConfig = ROLE_CATEGORIES[item.role as keyof typeof ROLE_CATEGORIES] || ROLE_CATEGORIES.other;
                const RoleIcon = roleConfig.icon;
                const isExpanded = expandedId === item.id;
                
                return (
                  <Card 
                    key={item.id}
                    className={cn(
                      "transition-all",
                      item.status === 'completed' && "bg-green-500/5 border-green-500/30",
                      isExpanded && "ring-2 ring-primary/30"
                    )}
                  >
                    <CardContent className="p-3 sm:p-4">
                      {/* Header - clickable */}
                      <div 
                        className="cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          {/* Number + Role icon */}
                          <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0",
                            roleConfig.bgColor
                          )}>
                            <RoleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h3 className="font-semibold text-sm sm:text-base leading-tight">{item.title}</h3>
                                  {item.priority === 'high' && (
                                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                <Badge className={cn(priorityConfig.color, "text-white text-[10px] sm:text-xs")}>
                                  {priorityConfig.label}
                                </Badge>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="mt-2 sm:mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Tiến độ</span>
                                <span className="font-medium">{item.progress}%</span>
                              </div>
                              <Progress value={item.progress} className="h-1.5 sm:h-2" />
                            </div>
                            
                            {/* Meta */}
                            <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                              <Badge variant="outline" className={cn("text-[10px] sm:text-xs", roleConfig.color)}>
                                {roleConfig.label}
                              </Badge>
                              {item.estimated_hours && (
                                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {item.estimated_hours}h
                                </span>
                              )}
                              {item.skills.slice(0, 2).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs hidden sm:inline-flex">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {/* Progress buttons */}
                          <div>
                            <p className="text-xs sm:text-sm font-medium mb-2">Cập nhật tiến độ:</p>
                            <div className="flex gap-2 flex-wrap">
                              {[0, 25, 50, 75, 100].map(value => (
                                <Button
                                  key={value}
                                  size="sm"
                                  variant={item.progress === value ? 'default' : 'outline'}
                                  onClick={() => updateProgress(item.id, value)}
                                  className="text-xs"
                                >
                                  {value}%
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Skills */}
                          {item.skills.length > 0 && (
                            <div>
                              <p className="text-xs sm:text-sm font-medium mb-2">Kỹ năng:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {item.skills.map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Search buttons */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' tutorial vietnamese')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button variant="outline" size="sm" className="w-full gap-2">
                                <Youtube className="h-4 w-4 text-red-500" />
                                Tìm trên YouTube
                              </Button>
                            </a>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(item.title + ' tutorial hướng dẫn')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button variant="outline" size="sm" className="w-full gap-2">
                                <Search className="h-4 w-4" />
                                Tìm trên Google
                              </Button>
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRoadmapItem(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* AI Coach */}
            <Card className="mt-8 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Gợi ý từ AI Coach</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {stats.completed === stats.total && stats.total > 0
                        ? 'Tuyệt vời! Bạn đã hoàn thành tất cả. Hãy phỏng vấn lại để kiểm tra kiến thức!'
                        : filteredItems.filter(i => i.priority === 'high' && i.status !== 'completed').length > 0
                          ? `Bạn có ${filteredItems.filter(i => i.priority === 'high' && i.status !== 'completed').length} chủ đề ưu tiên cao cần học. Tập trung vào những chủ đề này trước!`
                          : 'Tiếp tục học các chủ đề còn lại để cải thiện kỹ năng phỏng vấn.'
                      }
                    </p>
                    <Button onClick={() => navigate('/interview/new')} size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Luyện tập phỏng vấn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
