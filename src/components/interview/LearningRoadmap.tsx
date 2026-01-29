import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Lock, 
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
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LearningRoadmapItem } from '@/types/interview';

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'locked' | 'recommended';
  skills: string[];
  resources?: string[];
  estimatedHours?: number;
  row: number;
  col: number;
  connections?: string[];
}

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
  if (titleLower.includes('soft') || titleLower.includes('communication') || titleLower.includes('giao tiếp')) return <Users className="h-5 w-5" />;
  if (titleLower.includes('git') || titleLower.includes('version')) return <GitBranch className="h-5 w-5" />;
  
  return <BookOpen className="h-5 w-5" />;
};

// Convert AI roadmap to visual nodes with positions
const convertAIRoadmapToNodes = (aiRoadmap: LearningRoadmapItem[]): RoadmapNode[] => {
  if (!aiRoadmap || aiRoadmap.length === 0) return [];
  
  // Sort by priority: high -> medium -> low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...aiRoadmap].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return sorted.map((item, index) => {
    // Calculate position in a zigzag pattern
    const row = index;
    const col = index % 2 === 0 ? 0 : 2; // Alternate left-right
    
    // Determine status based on priority
    let status: RoadmapNode['status'] = 'locked';
    if (item.priority === 'high') status = 'recommended';
    else if (item.priority === 'medium') status = 'current';
    
    // Create connections to next item
    const connections = index < sorted.length - 1 ? [sorted[index + 1].id] : undefined;
    
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      icon: getIconForTopic(item.title, item.skills),
      status,
      skills: item.skills,
      resources: item.resources,
      estimatedHours: item.estimated_hours,
      row,
      col,
      connections,
    };
  });
};

export function LearningRoadmap({ role, weaknesses, strengths, overallScore, aiRoadmap }: LearningRoadmapProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  // Convert AI roadmap to visual nodes
  const roadmap = useMemo(() => {
    if (aiRoadmap && aiRoadmap.length > 0) {
      return convertAIRoadmapToNodes(aiRoadmap);
    }
    return [];
  }, [aiRoadmap]);

  const getStatusStyles = (status: RoadmapNode['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-500',
          text: 'text-emerald-500',
          glow: 'shadow-emerald-500/30',
        };
      case 'current':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-500',
          text: 'text-blue-500',
          glow: 'shadow-blue-500/30',
        };
      case 'recommended':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-500',
          text: 'text-amber-500',
          glow: 'shadow-amber-500/30',
        };
      default:
        return {
          bg: 'bg-muted-foreground/30',
          border: 'border-muted-foreground/30',
          text: 'text-muted-foreground',
          glow: '',
        };
    }
  };

  // Calculate SVG path between two nodes
  const getPath = (from: RoadmapNode, to: RoadmapNode) => {
    const nodeWidth = 280;
    const nodeHeight = 100;
    const gapX = 40;
    const gapY = 40;
    
    const x1 = from.col * (nodeWidth + gapX) / 3 + nodeWidth / 2;
    const y1 = from.row * (nodeHeight + gapY) + nodeHeight;
    const x2 = to.col * (nodeWidth + gapX) / 3 + nodeWidth / 2;
    const y2 = to.row * (nodeHeight + gapY);
    
    // Create curved path
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  if (roadmap.length === 0) {
    return (
      <Card className="glass">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Lộ trình học tập
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Đang phân tích kết quả để tạo lộ trình học tập cá nhân hóa...</p>
        </CardContent>
      </Card>
    );
  }

  const nodeWidth = 280;
  const nodeHeight = 100;
  const gapX = 40;
  const gapY = 40;
  const svgWidth = nodeWidth + gapX * 2;
  const maxRow = Math.max(...roadmap.map(n => n.row));
  const svgHeight = (maxRow + 1) * (nodeHeight + gapY) + 20;

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Lộ trình học tập cá nhân hóa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI đã phân tích kết quả phỏng vấn và đề xuất lộ trình học tập phù hợp với bạn
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Roadmap visualization */}
          <div className="flex-1 overflow-x-auto">
            <div className="relative min-w-[320px]" style={{ width: svgWidth, height: svgHeight }}>
              {/* SVG for curved connections */}
              <svg 
                className="absolute inset-0 pointer-events-none"
                width={svgWidth}
                height={svgHeight}
              >
                <defs>
                  <linearGradient id="lineGradientAI" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  </linearGradient>
                  <filter id="glowAI">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {roadmap.map(node => 
                  node.connections?.map(targetId => {
                    const target = roadmap.find(n => n.id === targetId);
                    if (!target) return null;
                    
                    const isActive = node.status === 'recommended' || node.status === 'current';
                    
                    return (
                      <path
                        key={`${node.id}-${targetId}`}
                        d={getPath(node, target)}
                        fill="none"
                        stroke={isActive ? "url(#lineGradientAI)" : "hsl(var(--muted-foreground) / 0.2)"}
                        strokeWidth={isActive ? 3 : 2}
                        strokeDasharray={isActive ? "none" : "5,5"}
                        filter={isActive ? "url(#glowAI)" : "none"}
                        className="transition-all duration-500"
                      />
                    );
                  })
                )}
              </svg>

              {/* Nodes */}
              {roadmap.map((node, index) => {
                const styles = getStatusStyles(node.status);
                const x = node.col * (nodeWidth + gapX) / 3;
                const y = node.row * (nodeHeight + gapY);
                
                return (
                  <div
                    key={node.id}
                    className={cn(
                      "absolute p-4 rounded-xl border-2 bg-card transition-all duration-300 cursor-pointer",
                      styles.border,
                      node.status === 'recommended' && "animate-pulse",
                      `shadow-lg ${styles.glow}`,
                      selectedNode?.id === node.id && "ring-2 ring-primary"
                    )}
                    style={{
                      left: x,
                      top: y,
                      width: nodeWidth,
                      minHeight: nodeHeight,
                    }}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Priority number */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                        styles.bg,
                        "text-white"
                      )}>
                        {index + 1}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn("p-1 rounded", styles.bg)}>
                            <div className="text-white">{node.icon}</div>
                          </div>
                          <h4 className={cn("font-semibold text-sm", styles.text)}>
                            {node.title}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {node.description}
                        </p>
                        
                        {/* Meta info */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {node.estimatedHours && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Clock className="h-3 w-3" />
                              {node.estimatedHours}h
                            </Badge>
                          )}
                          <Badge 
                            variant={node.status === 'recommended' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {node.status === 'recommended' ? 'Ưu tiên cao' : 
                             node.status === 'current' ? 'Nên học' : 'Có thể học sau'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      {node.status === 'recommended' && (
                        <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          {selectedNode && (
            <div className="lg:w-80 p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-2 rounded-lg", getStatusStyles(selectedNode.status).bg)}>
                  <div className="text-white">{selectedNode.icon}</div>
                </div>
                <div>
                  <h3 className="font-semibold">{selectedNode.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedNode.description}</p>
                </div>
              </div>
              
              {/* Skills */}
              {selectedNode.skills.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Kỹ năng:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Resources */}
              {selectedNode.resources && selectedNode.resources.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tài liệu gợi ý:</p>
                  <ul className="space-y-1">
                    {selectedNode.resources.map((resource, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Estimated time */}
              {selectedNode.estimatedHours && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Thời gian ước tính: {selectedNode.estimatedHours} giờ</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-muted-foreground">Ưu tiên cao</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Nên học</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <span className="text-muted-foreground">Có thể học sau</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
