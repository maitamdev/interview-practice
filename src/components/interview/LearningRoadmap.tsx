import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
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
  Youtube,
  Search,
  ArrowRight,
  ChevronRight
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
  
  if (titleLower.includes('javascript') || skillsLower.includes('javascript')) return <Code className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('typescript') || skillsLower.includes('typescript')) return <Layers className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('react') || skillsLower.includes('react')) return <Zap className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('database') || titleLower.includes('sql') || skillsLower.includes('sql')) return <Database className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('api') || titleLower.includes('rest') || titleLower.includes('graphql')) return <Globe className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('security') || titleLower.includes('bảo mật')) return <Shield className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('devops') || titleLower.includes('docker') || titleLower.includes('ci/cd')) return <Server className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('system') || titleLower.includes('architecture') || titleLower.includes('kiến trúc')) return <Cpu className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('soft') || titleLower.includes('communication') || titleLower.includes('giao tiếp') || titleLower.includes('star')) return <Users className="h-4 w-4 sm:h-5 sm:w-5" />;
  if (titleLower.includes('git') || titleLower.includes('version')) return <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" />;
  
  return <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />;
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'high':
      return {
        label: 'Ưu tiên cao',
        shortLabel: 'Cao',
        color: 'bg-red-500',
        borderColor: 'border-red-500',
        textColor: 'text-red-500',
        glowColor: 'shadow-red-500/30',
      };
    case 'medium':
      return {
        label: 'Nên học',
        shortLabel: 'TB',
        color: 'bg-amber-500',
        borderColor: 'border-amber-500',
        textColor: 'text-amber-500',
        glowColor: 'shadow-amber-500/30',
      };
    case 'low':
      return {
        label: 'Có thể học sau',
        shortLabel: 'Thấp',
        color: 'bg-emerald-500',
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-500',
        glowColor: 'shadow-emerald-500/30',
      };
    default:
      return {
        label: 'Học thêm',
        shortLabel: 'Khác',
        color: 'bg-gray-500',
        borderColor: 'border-gray-500',
        textColor: 'text-gray-500',
        glowColor: '',
      };
  }
};

export function LearningRoadmap({ role, weaknesses, strengths, overallScore, aiRoadmap }: LearningRoadmapProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <GitBranch className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Lộ trình học tập cá nhân hóa</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              AI đã phân tích kết quả và đề xuất lộ trình phù hợp với bạn
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="px-2 sm:px-4 py-2 rounded-lg bg-card border text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{sortedRoadmap.length}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Chủ đề</div>
            </div>
            <div className="px-2 sm:px-4 py-2 rounded-lg bg-card border text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-500">{highPriorityCount}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Ưu tiên cao</div>
            </div>
            <div className="px-2 sm:px-4 py-2 rounded-lg bg-card border text-center">
              <div className="text-xl sm:text-2xl font-bold">{totalHours}h</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Thời gian</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {/* Roadmap Visual - Zigzag style like roadmap.sh */}
        <div className="relative">
          {/* SVG for curved connections - hidden on mobile */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block"
            style={{ minHeight: sortedRoadmap.length * 120 }}
          >
            <defs>
              <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {sortedRoadmap.map((_, index) => {
              if (index >= sortedRoadmap.length - 1) return null;
              const isEven = index % 2 === 0;
              const y1 = index * 120 + 60;
              const y2 = (index + 1) * 120 + 60;
              const x1 = isEven ? '25%' : '75%';
              const x2 = isEven ? '75%' : '25%';
              
              return (
                <path
                  key={index}
                  d={`M ${x1} ${y1} C ${x1} ${y1 + 40}, ${x2} ${y2 - 40}, ${x2} ${y2}`}
                  fill="none"
                  stroke="url(#roadmapGradient)"
                  strokeWidth="3"
                  strokeDasharray={index < highPriorityCount ? "none" : "8,4"}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Roadmap nodes */}
          <div className="relative space-y-4 sm:space-y-6">
            {sortedRoadmap.map((item, index) => {
              const config = getPriorityConfig(item.priority);
              const icon = getIconForTopic(item.title, item.skills);
              const isEven = index % 2 === 0;
              const isSelected = selectedIndex === index;
              
              return (
                <div
                  key={item.id || index}
                  className={cn(
                    "relative flex",
                    // Zigzag alignment on desktop
                    "sm:w-[48%]",
                    isEven ? "sm:mr-auto" : "sm:ml-auto"
                  )}
                >
                  {/* Node card */}
                  <div
                    className={cn(
                      "w-full p-3 sm:p-4 rounded-xl border-2 bg-card transition-all duration-300 cursor-pointer",
                      config.borderColor,
                      item.priority === 'high' && "animate-pulse-subtle",
                      `shadow-lg ${config.glowColor}`,
                      isSelected && "ring-2 ring-primary scale-[1.02]"
                    )}
                    onClick={() => setSelectedIndex(isSelected ? null : index)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Number badge */}
                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0",
                        config.color
                      )}>
                        {index + 1}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn("p-1 rounded", config.color)}>
                            <div className="text-white">{icon}</div>
                          </div>
                          <h4 className={cn("font-semibold text-sm sm:text-base line-clamp-1", config.textColor)}>
                            {item.title}
                          </h4>
                          {item.priority === 'high' && (
                            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                          {item.description}
                        </p>
                        
                        {/* Meta */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.estimated_hours && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs gap-1">
                              <Clock className="h-3 w-3" />
                              {item.estimated_hours}h
                            </Badge>
                          )}
                          <Badge className={cn(config.color, "text-white text-[10px] sm:text-xs")}>
                            {config.shortLabel}
                          </Badge>
                        </div>
                        
                        {/* Expanded content */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                            {/* Skills */}
                            {item.skills.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1.5">Kỹ năng:</p>
                                <div className="flex flex-wrap gap-1">
                                  {item.skills.map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px]">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Resources */}
                            {item.resources && item.resources.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1.5">Tài liệu:</p>
                                <ul className="space-y-1">
                                  {item.resources.slice(0, 3).map((resource, i) => (
                                    <li key={i} className="flex items-start gap-1 text-xs text-muted-foreground">
                                      <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      <span className="line-clamp-1">{resource}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Search buttons */}
                            <div className="flex gap-2">
                              <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' tutorial vietnamese')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8">
                                  <Youtube className="h-3 w-3 text-red-500" />
                                  YouTube
                                </Button>
                              </a>
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(item.title + ' tutorial')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8">
                                  <Search className="h-3 w-3" />
                                  Google
                                </Button>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Expand indicator */}
                      <ChevronRight className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                        isSelected && "rotate-90"
                      )} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 sm:mt-8 pt-4 border-t flex flex-wrap gap-3 sm:gap-6 justify-center text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 animate-pulse" />
            <span className="text-muted-foreground">Ưu tiên cao</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Nên học</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Học sau</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            Lộ trình này đã được lưu vào trang "Lộ trình học tập" của bạn
          </p>
          <a href="/learning-path">
            <Button size="sm" className="gap-2 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4" />
              Xem lộ trình đầy đủ
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </CardContent>
      
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
}
