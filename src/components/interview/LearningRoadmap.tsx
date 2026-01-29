import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  ChevronRight,
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
  Palette,
  Server,
  Shield,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'locked' | 'recommended';
  skills: string[];
  courseId?: string;
  row: number;
  col: number;
  connections?: string[];
}

interface LearningRoadmapProps {
  role: string;
  weaknesses: string[];
  strengths: string[];
  overallScore: number;
}

// Frontend roadmap with positions for curved layout
const FRONTEND_ROADMAP: RoadmapNode[] = [
  {
    id: 'html-css',
    title: 'HTML & CSS',
    description: 'Nền tảng web',
    icon: <Globe className="h-5 w-5" />,
    status: 'completed',
    skills: ['html', 'css', 'responsive'],
    row: 0, col: 1,
    connections: ['javascript'],
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Ngôn ngữ lập trình',
    icon: <Code className="h-5 w-5" />,
    status: 'current',
    skills: ['javascript', 'es6', 'async'],
    courseId: 'js-fundamentals',
    row: 1, col: 0,
    connections: ['typescript', 'react'],
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description: 'Type safety',
    icon: <Layers className="h-5 w-5" />,
    status: 'locked',
    skills: ['typescript', 'types'],
    courseId: 'typescript-basics',
    row: 2, col: 0,
    connections: ['advanced-patterns'],
  },
  {
    id: 'react',
    title: 'React',
    description: 'UI Library',
    icon: <Zap className="h-5 w-5" />,
    status: 'locked',
    skills: ['react', 'hooks', 'state'],
    courseId: 'react-fundamentals',
    row: 2, col: 2,
    connections: ['advanced-patterns'],
  },
  {
    id: 'advanced-patterns',
    title: 'Advanced Patterns',
    description: 'Performance & Testing',
    icon: <Cpu className="h-5 w-5" />,
    status: 'locked',
    skills: ['performance', 'testing', 'patterns'],
    row: 3, col: 1,
    connections: ['fullstack'],
  },
  {
    id: 'fullstack',
    title: 'Fullstack',
    description: 'Frontend + Backend',
    icon: <GitBranch className="h-5 w-5" />,
    status: 'locked',
    skills: ['api', 'database', 'deployment'],
    row: 4, col: 1,
  },
];

const BACKEND_ROADMAP: RoadmapNode[] = [
  {
    id: 'programming',
    title: 'Programming',
    description: 'Nền tảng lập trình',
    icon: <Code className="h-5 w-5" />,
    status: 'completed',
    skills: ['programming', 'algorithms'],
    row: 0, col: 1,
    connections: ['database', 'api'],
  },
  {
    id: 'database',
    title: 'Database',
    description: 'SQL & NoSQL',
    icon: <Database className="h-5 w-5" />,
    status: 'current',
    skills: ['sql', 'nosql', 'orm'],
    courseId: 'database-fundamentals',
    row: 1, col: 0,
    connections: ['system-design'],
  },
  {
    id: 'api',
    title: 'API Design',
    description: 'REST & GraphQL',
    icon: <Globe className="h-5 w-5" />,
    status: 'locked',
    skills: ['rest', 'graphql', 'auth'],
    courseId: 'api-design',
    row: 1, col: 2,
    connections: ['system-design'],
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Kiến trúc hệ thống',
    icon: <Layers className="h-5 w-5" />,
    status: 'locked',
    skills: ['scalability', 'microservices'],
    row: 2, col: 1,
    connections: ['security', 'devops'],
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Bảo mật ứng dụng',
    icon: <Shield className="h-5 w-5" />,
    status: 'locked',
    skills: ['security', 'encryption'],
    row: 3, col: 0,
  },
  {
    id: 'devops',
    title: 'DevOps',
    description: 'CI/CD & Cloud',
    icon: <Server className="h-5 w-5" />,
    status: 'locked',
    skills: ['docker', 'kubernetes', 'aws'],
    row: 3, col: 2,
  },
];

export function LearningRoadmap({ role, weaknesses, strengths, overallScore }: LearningRoadmapProps) {
  const [roadmap, setRoadmap] = useState<RoadmapNode[]>([]);

  useEffect(() => {
    generateRoadmap();
  }, [role, weaknesses, strengths, overallScore]);

  const generateRoadmap = () => {
    let baseRoadmap = role === 'backend' ? [...BACKEND_ROADMAP] : [...FRONTEND_ROADMAP];
    
    const weaknessLower = weaknesses.map(w => w.toLowerCase()).join(' ');
    const strengthLower = strengths.map(s => s.toLowerCase()).join(' ');

    baseRoadmap = baseRoadmap.map(node => {
      const isWeak = node.skills.some(skill => weaknessLower.includes(skill));
      const isStrong = node.skills.some(skill => strengthLower.includes(skill));

      if (isWeak) {
        return { ...node, status: 'recommended' as const };
      } else if (isStrong) {
        return { ...node, status: 'completed' as const };
      }
      return node;
    });

    // Add behavioral if needed
    if (overallScore < 3.5 || weaknessLower.includes('communication') || weaknessLower.includes('giao tiếp')) {
      baseRoadmap.push({
        id: 'behavioral',
        title: 'Soft Skills',
        description: 'Giao tiếp & STAR',
        icon: <Users className="h-5 w-5" />,
        status: 'recommended',
        skills: ['communication', 'star'],
        courseId: 'behavioral-interview',
        row: 5, col: 1,
      });
    }

    setRoadmap(baseRoadmap);
  };

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
    const nodeWidth = 160;
    const nodeHeight = 80;
    const gapX = 40;
    const gapY = 30;
    
    const x1 = from.col * (nodeWidth + gapX) + nodeWidth / 2;
    const y1 = from.row * (nodeHeight + gapY) + nodeHeight;
    const x2 = to.col * (nodeWidth + gapX) + nodeWidth / 2;
    const y2 = to.row * (nodeHeight + gapY);
    
    // Create curved path
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  const nodeWidth = 160;
  const nodeHeight = 80;
  const gapX = 40;
  const gapY = 30;
  const svgWidth = 3 * (nodeWidth + gapX);
  const maxRow = Math.max(...roadmap.map(n => n.row));
  const svgHeight = (maxRow + 1) * (nodeHeight + gapY) + 20;

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Lộ trình học tập
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Roadmap cá nhân hóa dựa trên kết quả phỏng vấn của bạn
        </p>
      </CardHeader>
      <CardContent className="p-6 overflow-x-auto">
        <div className="relative min-w-[500px]" style={{ width: svgWidth, height: svgHeight }}>
          {/* SVG for curved connections */}
          <svg 
            className="absolute inset-0 pointer-events-none"
            width={svgWidth}
            height={svgHeight}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow">
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
                
                const fromStyles = getStatusStyles(node.status);
                const isActive = node.status === 'completed' || node.status === 'current';
                
                return (
                  <path
                    key={`${node.id}-${targetId}`}
                    d={getPath(node, target)}
                    fill="none"
                    stroke={isActive ? "url(#lineGradient)" : "hsl(var(--muted-foreground) / 0.2)"}
                    strokeWidth={isActive ? 3 : 2}
                    strokeDasharray={isActive ? "none" : "5,5"}
                    filter={isActive ? "url(#glow)" : "none"}
                    className="transition-all duration-500"
                  />
                );
              })
            )}
          </svg>

          {/* Nodes */}
          {roadmap.map(node => {
            const styles = getStatusStyles(node.status);
            const x = node.col * (nodeWidth + gapX);
            const y = node.row * (nodeHeight + gapY);
            
            return (
              <div
                key={node.id}
                className={cn(
                  "absolute p-3 rounded-xl border-2 bg-card transition-all duration-300 hover:scale-105",
                  styles.border,
                  node.status === 'recommended' && "animate-pulse",
                  node.status !== 'locked' && `shadow-lg ${styles.glow}`
                )}
                style={{
                  left: x,
                  top: y,
                  width: nodeWidth,
                  height: nodeHeight,
                }}
              >
                <div className="flex items-start gap-2 h-full">
                  {/* Icon */}
                  <div className={cn(
                    "p-1.5 rounded-lg flex-shrink-0",
                    node.status === 'locked' ? 'bg-muted' : styles.bg
                  )}>
                    <div className="text-white">
                      {node.status === 'locked' ? <Lock className="h-4 w-4 text-muted-foreground" /> : node.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-semibold text-sm truncate",
                      node.status === 'locked' ? 'text-muted-foreground' : styles.text
                    )}>
                      {node.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {node.description}
                    </p>
                  </div>
                  
                  {/* Status indicator */}
                  {node.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  )}
                  {node.status === 'recommended' && (
                    <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                
                {/* Hover action */}
                {node.courseId && node.status !== 'locked' && (
                  <Link 
                    to={`/learn/${node.courseId}`}
                    className="absolute inset-0 flex items-center justify-center bg-background/90 opacity-0 hover:opacity-100 transition-opacity rounded-xl"
                  >
                    <Button size="sm" variant="default" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      Học ngay
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Đã hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Đang học</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-muted-foreground">Cần cải thiện</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <span className="text-muted-foreground">Chưa mở</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
