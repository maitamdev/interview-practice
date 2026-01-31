import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
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
  Check,
  ChevronDown,
  ArrowRight,
  Play
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
  
  if (titleLower.includes('javascript') || skillsLower.includes('javascript')) return <Code className="h-4 w-4" />;
  if (titleLower.includes('typescript') || skillsLower.includes('typescript')) return <Layers className="h-4 w-4" />;
  if (titleLower.includes('react') || skillsLower.includes('react')) return <Zap className="h-4 w-4" />;
  if (titleLower.includes('database') || titleLower.includes('sql') || skillsLower.includes('sql')) return <Database className="h-4 w-4" />;
  if (titleLower.includes('api') || titleLower.includes('rest') || titleLower.includes('graphql')) return <Globe className="h-4 w-4" />;
  if (titleLower.includes('security') || titleLower.includes('bảo mật')) return <Shield className="h-4 w-4" />;
  if (titleLower.includes('devops') || titleLower.includes('docker') || titleLower.includes('ci/cd')) return <Server className="h-4 w-4" />;
  if (titleLower.includes('system') || titleLower.includes('architecture') || titleLower.includes('kiến trúc')) return <Cpu className="h-4 w-4" />;
  if (titleLower.includes('soft') || titleLower.includes('communication') || titleLower.includes('giao tiếp') || titleLower.includes('star')) return <Users className="h-4 w-4" />;
  if (titleLower.includes('git') || titleLower.includes('version')) return <GitBranch className="h-4 w-4" />;
  
  return <BookOpen className="h-4 w-4" />;
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'high':
      return {
        label: 'Bắt buộc',
        bg: 'bg-purple-600',
        border: 'border-purple-600',
        text: 'text-purple-600',
        lightBg: 'bg-purple-50 dark:bg-purple-950/30',
      };
    case 'medium':
      return {
        label: 'Nên học',
        bg: 'bg-blue-600',
        border: 'border-blue-600',
        text: 'text-blue-600',
        lightBg: 'bg-blue-50 dark:bg-blue-950/30',
      };
    case 'low':
      return {
        label: 'Tùy chọn',
        bg: 'bg-slate-500',
        border: 'border-slate-500',
        text: 'text-slate-500',
        lightBg: 'bg-slate-50 dark:bg-slate-950/30',
      };
    default:
      return {
        label: 'Khác',
        bg: 'bg-slate-400',
        border: 'border-slate-400',
        text: 'text-slate-400',
        lightBg: 'bg-slate-50 dark:bg-slate-950/30',
      };
  }
};

// Roadmap Node Component - styled like roadmap.sh
function RoadmapNode({ 
  item, 
  index, 
  isExpanded, 
  onToggle,
  isLast 
}: { 
  item: LearningRoadmapItem; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const config = getPriorityConfig(item.priority);
  const icon = getIconForTopic(item.title, item.skills);

  return (
    <div className="relative">
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-6 top-14 w-0.5 h-[calc(100%-2rem)] bg-border" />
      )}
      
      <div className="flex gap-4">
        {/* Node circle */}
        <div className={cn(
          "relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all",
          config.border,
          config.lightBg
        )}>
          <span className={cn("font-semibold", config.text)}>{index + 1}</span>
        </div>

        {/* Content card */}
        <div className="flex-1 pb-8">
          <motion.div
            className={cn(
              "border rounded-lg overflow-hidden transition-all cursor-pointer",
              "hover:shadow-md",
              isExpanded && "shadow-md"
            )}
            onClick={onToggle}
            layout
          >
            {/* Header */}
            <div className={cn("p-4", config.lightBg)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("p-2 rounded-lg", config.bg, "text-white")}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn("text-xs", config.text, config.border)}>
                        {config.label}
                      </Badge>
                      {item.estimated_hours && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.estimated_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                  isExpanded && "rotate-180"
                )} />
              </div>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t"
                >
                  <div className="p-4 space-y-4">
                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{item.description}</p>

                    {/* Skills */}
                    {item.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Kỹ năng cần học:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.skills.map((skill, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-1 text-xs bg-muted rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {item.resources && item.resources.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Tài liệu tham khảo:</p>
                        <ul className="space-y-1.5">
                          {item.resources.slice(0, 4).map((resource, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ExternalLink className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' tutorial')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Play className="h-3.5 w-3.5" />
                          Xem video
                        </Button>
                      </a>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(item.title + ' documentation')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <BookOpen className="h-3.5 w-3.5" />
                          Đọc tài liệu
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function LearningRoadmap({ role, weaknesses, strengths, overallScore, aiRoadmap }: LearningRoadmapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5" />
            Lộ trình học tập
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Đang phân tích kết quả để tạo lộ trình học tập...</p>
        </CardContent>
      </Card>
    );
  }

  const highPriorityCount = sortedRoadmap.filter(i => i.priority === 'high').length;
  const mediumPriorityCount = sortedRoadmap.filter(i => i.priority === 'medium').length;
  const totalHours = sortedRoadmap.reduce((sum, i) => sum + (i.estimated_hours || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="h-5 w-5" />
              Lộ trình học tập cá nhân hóa
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Dựa trên kết quả phỏng vấn của bạn
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{sortedRoadmap.length}</div>
            <div className="text-xs text-muted-foreground">Chủ đề</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
            <div className="text-2xl font-bold text-purple-600">{highPriorityCount}</div>
            <div className="text-xs text-muted-foreground">Bắt buộc</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <div className="text-2xl font-bold text-blue-600">{mediumPriorityCount}</div>
            <div className="text-xs text-muted-foreground">Nên học</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{totalHours}h</div>
            <div className="text-xs text-muted-foreground">Tổng</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Roadmap nodes */}
        <div className="space-y-0">
          {sortedRoadmap.map((item, index) => (
            <RoadmapNode
              key={item.id || index}
              item={item}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              isLast={index === sortedRoadmap.length - 1}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600" />
              <span className="text-muted-foreground">Bắt buộc</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-muted-foreground">Nên học</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-muted-foreground">Tùy chọn</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Lộ trình này đã được lưu vào trang học tập của bạn
          </p>
          <a href="/learning-path">
            <Button variant="outline" size="sm" className="gap-2">
              Xem lộ trình đầy đủ
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
