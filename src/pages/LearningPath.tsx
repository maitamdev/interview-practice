import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  BookOpen, CheckCircle, Play, Clock, Target, Sparkles, ChevronRight, ExternalLink,
  Youtube, FileText, GraduationCap, Code, Search, Loader2, RotateCcw, Trash2
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { useToast } from '@/hooks/use-toast';

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
}

interface SearchResult {
  title: string;
  url: string;
  type: 'youtube' | 'article' | 'documentation';
  thumbnail?: string;
}

export default function LearningPath() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roadmapItems, setRoadmapItems] = useState<UserRoadmapItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<UserRoadmapItem | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

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
      const { data, error } = await supabase
        .from('user_learning_roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoadmapItems((data || []) as UserRoadmapItem[]);
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

      // Update local state
      setRoadmapItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, progress: newProgress, status } as UserRoadmapItem : item
      ));

      if (newProgress >= 100) {
        toast({
          title: '🎉 Hoàn thành!',
          description: 'Bạn đã hoàn thành chủ đề này!',
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const deleteRoadmapItem = async (itemId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('user_learning_roadmaps')
        .delete()
        .eq('id', itemId);

      setRoadmapItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: 'Đã xóa',
        description: 'Đã xóa chủ đề khỏi lộ trình học tập',
      });
    } catch (error) {
      console.error('Error deleting roadmap item:', error);
    }
  };

  const searchResources = async (topic: string, skills: string[]) => {
    setSearchLoading(true);
    setSearchResults([]);
    
    // Generate search results based on topic and skills
    const searchQuery = `${topic} ${skills.slice(0, 2).join(' ')} tutorial`;
    
    // Simulated search results - in production, you'd call YouTube API and Google Custom Search
    const results: SearchResult[] = [
      // YouTube results
      {
        title: `${topic} - Hướng dẫn đầy đủ cho người mới`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' vietnamese')}`,
        type: 'youtube',
      },
      {
        title: `${topic} Tutorial - Full Course`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' full course')}`,
        type: 'youtube',
      },
      {
        title: `${topic} Crash Course`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' crash course')}`,
        type: 'youtube',
      },
      // Documentation/Articles
      {
        title: `${topic} - Tài liệu chính thức`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' official documentation')}`,
        type: 'documentation',
      },
      {
        title: `${topic} - Bài viết hướng dẫn`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' tutorial guide')}`,
        type: 'article',
      },
      {
        title: `${topic} Best Practices`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' best practices')}`,
        type: 'article',
      },
    ];

    // Add skill-specific resources
    skills.slice(0, 3).forEach(skill => {
      results.push({
        title: `${skill} - Video hướng dẫn`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`,
        type: 'youtube',
      });
    });

    setSearchResults(results);
    setSearchLoading(false);
  };

  const openTopicDetail = (item: UserRoadmapItem) => {
    setSelectedItem(item);
    searchResources(item.title, item.skills);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Ưu tiên cao';
      case 'medium': return 'Ưu tiên TB';
      case 'low': return 'Ưu tiên thấp';
      default: return priority;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <Play className="h-5 w-5 text-primary" />;
      default: return <Target className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'documentation': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'course': return <GraduationCap className="h-4 w-4 text-purple-500" />;
      case 'practice': return <Code className="h-4 w-4 text-green-500" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const filteredItems = filter === 'all' 
    ? roadmapItems 
    : roadmapItems.filter(item => item.priority === filter);

  const completedCount = roadmapItems.filter(i => i.status === 'completed').length;
  const inProgressCount = roadmapItems.filter(i => i.status === 'in_progress').length;
  const totalProgress = roadmapItems.length > 0 
    ? Math.round(roadmapItems.reduce((sum, i) => sum + i.progress, 0) / roadmapItems.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Lộ trình học tập</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Lộ trình học tập cá nhân hóa</h1>
          <p className="text-xl text-muted-foreground">
            Dựa trên kết quả phỏng vấn, AI đã tạo lộ trình học phù hợp với bạn
          </p>
        </div>

        {/* Stats Overview */}
        {roadmapItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-3xl font-bold text-primary">{roadmapItems.length}</div>
                <div className="text-sm text-muted-foreground">Chủ đề</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-3xl font-bold text-amber-500">{inProgressCount}</div>
                <div className="text-sm text-muted-foreground">Đang học</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-3xl font-bold text-green-500">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Hoàn thành</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-3xl font-bold">{totalProgress}%</div>
                <div className="text-sm text-muted-foreground">Tiến độ</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter */}
        {roadmapItems.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tất cả ({roadmapItems.length})
            </Button>
            <Button 
              variant={filter === 'high' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('high')}
              className={filter === 'high' ? '' : 'text-red-500 border-red-500/30'}
            >
              Ưu tiên cao ({roadmapItems.filter(i => i.priority === 'high').length})
            </Button>
            <Button 
              variant={filter === 'medium' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('medium')}
              className={filter === 'medium' ? '' : 'text-amber-500 border-amber-500/30'}
            >
              Ưu tiên TB ({roadmapItems.filter(i => i.priority === 'medium').length})
            </Button>
            <Button 
              variant={filter === 'low' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('low')}
              className={filter === 'low' ? '' : 'text-green-500 border-green-500/30'}
            >
              Ưu tiên thấp ({roadmapItems.filter(i => i.priority === 'low').length})
            </Button>
          </div>
        )}

        {/* Roadmap Items */}
        {filteredItems.length === 0 ? (
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
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <Card 
                key={item.id} 
                className={`transition-all hover:border-primary/50 cursor-pointer ${
                  item.status === 'completed' ? 'bg-green-500/5 border-green-500/30' : ''
                }`}
                onClick={() => openTopicDetail(item)}
              >
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {index + 1}
                      </div>
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-xl font-semibold">{item.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={getPriorityColor(item.priority)}>
                            {getPriorityLabel(item.priority)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.estimated_hours}h
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.skills.slice(0, 5).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {item.skills.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.skills.length - 5}
                          </Badge>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tiến độ</span>
                          <span className="font-medium">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant={item.status === 'completed' ? 'outline' : 'default'}
                          onClick={(e) => {
                            e.stopPropagation();
                            openTopicDetail(item);
                          }}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Xem tài liệu
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRoadmapItem(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* AI Coach Suggestion */}
        {roadmapItems.length > 0 && (
          <Card className="mt-8 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Gợi ý từ AI Coach</h3>
                  <p className="text-muted-foreground mb-4">
                    {roadmapItems.filter(i => i.priority === 'high' && i.status !== 'completed').length > 0
                      ? `Bạn có ${roadmapItems.filter(i => i.priority === 'high' && i.status !== 'completed').length} chủ đề ưu tiên cao cần học. Hãy tập trung vào những chủ đề này trước!`
                      : completedCount === roadmapItems.length
                        ? 'Tuyệt vời! Bạn đã hoàn thành tất cả các chủ đề. Hãy phỏng vấn lại để kiểm tra kiến thức!'
                        : 'Tiếp tục học các chủ đề còn lại để cải thiện kỹ năng phỏng vấn của bạn.'
                    }
                  </p>
                  <Button onClick={() => navigate('/interview/new')}>
                    <Target className="h-4 w-4 mr-2" />
                    Luyện tập phỏng vấn
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Topic Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedItem.title}</DialogTitle>
                <DialogDescription>{selectedItem.description}</DialogDescription>
              </DialogHeader>

              {/* Progress Update */}
              <div className="my-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Tiến độ học tập</span>
                  <span className="text-lg font-bold text-primary">{selectedItem.progress}%</span>
                </div>
                <Progress value={selectedItem.progress} className="h-3 mb-3" />
                <div className="flex gap-2 flex-wrap">
                  {[0, 25, 50, 75, 100].map(value => (
                    <Button
                      key={value}
                      size="sm"
                      variant={selectedItem.progress === value ? 'default' : 'outline'}
                      onClick={() => updateProgress(selectedItem.id, value)}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Kỹ năng cần học</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Tài liệu học tập
                </h4>
                
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Đang tìm tài liệu...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <a
                        key={index}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                      >
                        {getResourceIcon(result.type)}
                        <span className="flex-1 text-sm">{result.title}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Custom Search */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Tìm kiếm thêm tài liệu:</p>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedItem.title + ' tutorial vietnamese')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <Youtube className="h-4 w-4 text-red-500" />
                        Tìm trên YouTube
                      </Button>
                    </a>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(selectedItem.title + ' tutorial')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <Search className="h-4 w-4" />
                        Tìm trên Google
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
