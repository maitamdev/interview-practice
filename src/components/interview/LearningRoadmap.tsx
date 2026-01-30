import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Code,
  Database,
  Globe,
  Layers,
  Cpu,
  GitBranch,
  Users,
  Zap,
  Server,
  Shield,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Youtube,
  Search,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LearningRoadmapItem } from '@/types/interview';

interface LearningRoadmapProps {
  role: string;
  weaknesses: string[];
  strengths: string[];
  overallScore: number;
  aiRoadmap?: LearningRoadmapItem[];
}

// Icon mapping for different topics
const getIconForTopic = (title: string, skills: string[]): React.ReactNode => {
  const titleLower = title.toLowerCase();
  const skillsLower = skills.join(' ').toLowerCase();
  
  if (titleLower.includes('javascript') || skillsLower.includes('javascript')) return <Code className="h-5 w-5" />;
  if (titleLower.includes('typescript') || skillsLower.includes('typescript')) return <Layers className="h-5 w-5" />;
  if (titleLower.includes('react') || skillsLower.includes('react')) return <Zap className="h-5 w-5" />;
  if (titleLower.includes('database') || titleLower.includes('sql') || skillsLower.includes('sql')) return <Database className="h-5 w-5" />;
  if (titleLower.includes('api') || titleLower.includes('rest') || titleLower.includes('graphql')) return <Globe className="h-5 w-5" />;
  if (titleLower.includes('security') || titleLower.includes('bảo mật')) return <Shield className="h-5 w-5" />;
  if (titleLower.includes('devops') || titleLower.includes('docker') || titleLower.includes('ci/cd')) return <Server className="h-5 w-5" />;
  if (titleLower.includes('system') || titleLower.includes('architecture') || titleLower.includes('kiến trúc')) return <Cpu className="h-5 w-5" />;
  if (titleLower.includes('soft') || titleLower.includes('communication') || titleLower.includes('giao tiếp') || titleLower.includes('star')) return <Users className="h-5 w-5" />;
  if (titleLower.includes('git') || titleLower.includes('version')) return <GitBranch className="h-5 w-5" />;
  
  return <BookOpen className="h-5 w-5" />;
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'high':
      return {
        label: 'Ưu tiên cao',
        color: 'bg-red-500',
        borderColor: 'border-red-500/50',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-500',
      };
    case 'medium':
      return {
        label: 'Nên học',
        color: 'bg-amber-500',
        borderColor: 'border-amber-500/50',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-500',
      };
    case 'low':
      return {
        label: 'Có thể học sau',
        color: 'bg-emerald-500',
        borderColor: 'border-emerald-500/50',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-500',
      };
    default:
      return {
        label: 'Học thêm',
        color: 'bg-muted-foreground',
        borderColor: 'border-muted-foreground/50',
        bgColor: 'bg-muted/50',
        textColor: 'text-muted-foreground',
      };
  }
};

export function LearningRoadmap({ role, weaknesses, strengths, overallScore, aiRoadmap }: LearningRoadmapProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort by priority
  const sortedRoadmap = useMemo(() => {
    if (!aiRoadmap || aiRoadmap.length === 0) return [];
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...aiRoadmap].sort((a, b) => 
      (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
    );
  }, [aiRoadmap]);

  if (sortedRoadmap.length === 0) {
    return (
      <Card className="glass">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Lộ trình học tập
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p>Đang phân tích kết quả để tạo lộ trình học tập cá nhân hóa...</p>
        </CardContent>
      </Card>
    );
  }

  const highPriorityCount = sortedRoadmap.filter(i => i.priority === 'high').length;
  const totalHours = sortedRoadmap.reduce((sum, i) => sum + (i.estimated_hours || 0), 0);

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <GitBranch className="h-5 w-5 text-primary" />
              Lộ trình học tập cá nhân hóa
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI đã phân tích kết quả phỏng vấn và đề xuất lộ trình học tập phù hợp với bạn
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="px-4 py-2 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">{sortedRoadmap.length}</div>
              <div className="text-xs text-muted-foreground">Chủ đề</div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-red-500">{highPriorityCount}</div>
              <div className="text-xs text-muted-foreground">Ưu tiên cao</div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-card border">
              <div className="text-2xl font-bold">{totalHours}h</div>
              <div className="text-xs text-muted-foreground">Tổng thời gian</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Roadmap Items */}
        <div className="space-y-4">
          {sortedRoadmap.map((item, index) => {
            const config = getPriorityConfig(item.priority);
            const isExpanded = expandedId === item.id;
            const icon = getIconForTopic(item.title, item.skills);
            
            return (
              <div key={item.id} className="relative">
                {/* Connection line */}
                {index < sortedRoadmap.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-primary/10 z-0" />
                )}
                
                <div
                  className={cn(
                    "relative rounded-xl border-2 transition-all duration-300",
                    config.borderColor,
                    config.bgColor,
                    isExpanded && "ring-2 ring-primary/30"
                  )}
                >
                  {/* Main content - clickable */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Number badge */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
                        config.color
                      )}>
                        {index + 1}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className={cn("p-1.5 rounded-lg", config.color)}>
                              <div className="text-white">{icon}</div>
                            </div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            {item.priority === 'high' && (
                              <Sparkles className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={cn(config.color, "text-white")}>
                              {config.label}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        
                        {/* Meta info */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {item.estimated_hours && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{item.estimated_hours} giờ</span>
                            </div>
                          )}
                          {item.skills.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {item.skills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {item.skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-border/50 mt-2">
                      <div className="pt-4 space-y-4">
                        {/* All skills */}
                        {item.skills.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Kỹ năng cần học:</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.skills.map((skill, i) => (
                                <Badge key={i} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Resources */}
                        {item.resources && item.resources.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Tài liệu gợi ý:</h4>
                            <ul className="space-y-1">
                              {item.resources.map((resource, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Search buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' tutorial vietnamese')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-2">
                              <Youtube className="h-4 w-4 text-red-500" />
                              Tìm trên YouTube
                            </Button>
                          </a>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(item.title + ' tutorial hướng dẫn')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-2">
                              <Search className="h-4 w-4" />
                              Tìm trên Google
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-4 border-t flex flex-wrap gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-muted-foreground">Ưu tiên cao - Cần học ngay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-muted-foreground">Nên học - Quan trọng</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-muted-foreground">Có thể học sau</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Lộ trình này đã được lưu vào trang "Lộ trình học tập" của bạn
          </p>
          <a href="/learning-path">
            <Button className="gap-2">
              <BookOpen className="h-4 w-4" />
              Xem lộ trình đầy đủ
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
