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
  Zap
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
  children?: string[];
}

interface LearningRoadmapProps {
  role: string;
  weaknesses: string[];
  strengths: string[];
  overallScore: number;
}

// Roadmap data for different roles
const FRONTEND_ROADMAP: RoadmapNode[] = [
  {
    id: 'html-css',
    title: 'HTML & CSS',
    description: 'Nền tảng web cơ bản',
    icon: <Globe className="h-5 w-5" />,
    status: 'completed',
    skills: ['html', 'css', 'responsive'],
    children: ['javascript'],
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Ngôn ngữ lập trình web',
    icon: <Code className="h-5 w-5" />,
    status: 'current',
    skills: ['javascript', 'es6', 'async'],
    courseId: 'js-fundamentals',
    children: ['typescript', 'react'],
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description: 'JavaScript với type safety',
    icon: <Layers className="h-5 w-5" />,
    status: 'locked',
    skills: ['typescript', 'types', 'generics'],
    courseId: 'typescript-basics',
    children: ['advanced-react'],
  },
  {
    id: 'react',
    title: 'React',
    description: 'Thư viện UI phổ biến nhất',
    icon: <Zap className="h-5 w-5" />,
    status: 'locked',
    skills: ['react', 'hooks', 'state'],
    courseId: 'react-fundamentals',
    children: ['advanced-react'],
  },
  {
    id: 'advanced-react',
    title: 'React Nâng cao',
    description: 'Patterns & Performance',
    icon: <Cpu className="h-5 w-5" />,
    status: 'locked',
    skills: ['performance', 'patterns', 'testing'],
    children: ['fullstack'],
  },
  {
    id: 'fullstack',
    title: 'Fullstack',
    description: 'Kết nối Frontend & Backend',
    icon: <GitBranch className="h-5 w-5" />,
    status: 'locked',
    skills: ['api', 'database', 'deployment'],
  },
];

const BACKEND_ROADMAP: RoadmapNode[] = [
  {
    id: 'programming',
    title: 'Lập trình cơ bản',
    description: 'Nền tảng lập trình',
    icon: <Code className="h-5 w-5" />,
    status: 'completed',
    skills: ['programming', 'algorithms'],
    children: ['database', 'api'],
  },
  {
    id: 'database',
    title: 'Database',
    description: 'SQL & NoSQL',
    icon: <Database className="h-5 w-5" />,
    status: 'current',
    skills: ['sql', 'nosql', 'orm'],
    courseId: 'database-fundamentals',
    children: ['system-design'],
  },
  {
    id: 'api',
    title: 'API Design',
    description: 'REST & GraphQL',
    icon: <Globe className="h-5 w-5" />,
    status: 'locked',
    skills: ['rest', 'graphql', 'authentication'],
    courseId: 'api-design',
    children: ['system-design'],
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Kiến trúc hệ thống',
    icon: <Layers className="h-5 w-5" />,
    status: 'locked',
    skills: ['scalability', 'microservices', 'caching'],
    children: ['devops'],
  },
  {
    id: 'devops',
    title: 'DevOps',
    description: 'CI/CD & Cloud',
    icon: <Cpu className="h-5 w-5" />,
    status: 'locked',
    skills: ['docker', 'kubernetes', 'aws'],
  },
];

const BEHAVIORAL_NODE: RoadmapNode = {
  id: 'behavioral',
  title: 'Kỹ năng mềm',
  description: 'Giao tiếp & STAR method',
  icon: <Users className="h-5 w-5" />,
  status: 'recommended',
  skills: ['communication', 'star', 'teamwork'],
  courseId: 'behavioral-interview',
};

export function LearningRoadmap({ role, weaknesses, strengths, overallScore }: LearningRoadmapProps) {
  const [roadmap, setRoadmap] = useState<RoadmapNode[]>([]);

  useEffect(() => {
    generateRoadmap();
  }, [role, weaknesses, strengths, overallScore]);

  const generateRoadmap = () => {
    // Select base roadmap based on role
    let baseRoadmap = role === 'backend' ? [...BACKEND_ROADMAP] : [...FRONTEND_ROADMAP];
    
    // Update status based on weaknesses and strengths
    const weaknessLower = weaknesses.map(w => w.toLowerCase()).join(' ');
    const strengthLower = strengths.map(s => s.toLowerCase()).join(' ');

    baseRoadmap = baseRoadmap.map(node => {
      // Check if any skill is in weaknesses
      const isWeak = node.skills.some(skill => weaknessLower.includes(skill));
      // Check if any skill is in strengths
      const isStrong = node.skills.some(skill => strengthLower.includes(skill));

      if (isWeak) {
        return { ...node, status: 'recommended' as const };
      } else if (isStrong) {
        return { ...node, status: 'completed' as const };
      }
      return node;
    });

    // Add behavioral node if score is low or communication is weak
    if (overallScore < 3.5 || weaknessLower.includes('communication') || weaknessLower.includes('giao tiếp')) {
      baseRoadmap.push(BEHAVIORAL_NODE);
    }

    // Set first non-completed as current
    let foundCurrent = false;
    baseRoadmap = baseRoadmap.map(node => {
      if (!foundCurrent && node.status !== 'completed' && node.status !== 'recommended') {
        foundCurrent = true;
        return { ...node, status: 'current' as const };
      }
      return node;
    });

    setRoadmap(baseRoadmap);
  };

  const getStatusStyles = (status: RoadmapNode['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-primary/20 border-primary',
          icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
          text: 'text-primary',
          badge: 'bg-primary/20 text-primary',
          badgeText: 'Đã hoàn thành',
        };
      case 'current':
        return {
          bg: 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/30',
          icon: <Circle className="h-5 w-5 text-blue-500 fill-blue-500" />,
          text: 'text-blue-500',
          badge: 'bg-blue-500/20 text-blue-500',
          badgeText: 'Đang học',
        };
      case 'recommended':
        return {
          bg: 'bg-amber-500/20 border-amber-500 animate-pulse',
          icon: <Sparkles className="h-5 w-5 text-amber-500" />,
          text: 'text-amber-500',
          badge: 'bg-amber-500/20 text-amber-500',
          badgeText: 'Nên học',
        };
      default:
        return {
          bg: 'bg-muted/50 border-muted-foreground/30',
          icon: <Lock className="h-5 w-5 text-muted-foreground" />,
          text: 'text-muted-foreground',
          badge: 'bg-muted text-muted-foreground',
          badgeText: 'Chưa mở',
        };
    }
  };

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Lộ trình học tập của bạn
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Dựa trên kết quả phỏng vấn {role === 'frontend' ? 'Frontend' : 'Backend'} Developer
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Roadmap visualization */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-muted to-muted-foreground/20" />
          
          {/* Nodes */}
          <div className="space-y-6">
            {roadmap.map((node, index) => {
              const styles = getStatusStyles(node.status);
              
              return (
                <div key={node.id} className="relative flex items-start gap-4 group">
                  {/* Node circle */}
                  <div className={cn(
                    "relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                    styles.bg,
                    node.status === 'recommended' && "shadow-lg shadow-amber-500/20"
                  )}>
                    {node.icon}
                  </div>
                  
                  {/* Content */}
                  <div className={cn(
                    "flex-1 p-4 rounded-xl border transition-all",
                    node.status === 'recommended' 
                      ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50" 
                      : "bg-card/50 border-border hover:border-primary/30",
                    node.courseId && "cursor-pointer"
                  )}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className={cn("font-semibold", styles.text)}>
                          {node.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {node.description}
                        </p>
                      </div>
                      <Badge className={cn("text-xs", styles.badge)}>
                        {styles.badgeText}
                      </Badge>
                    </div>
                    
                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {node.skills.map(skill => (
                        <span 
                          key={skill}
                          className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    {/* Action button */}
                    {node.courseId && (node.status === 'current' || node.status === 'recommended') && (
                      <Link to={`/learn/${node.courseId}`}>
                        <Button 
                          size="sm" 
                          variant={node.status === 'recommended' ? 'default' : 'outline'}
                          className="gap-1"
                        >
                          <BookOpen className="h-4 w-4" />
                          Bắt đầu học
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Đã hoàn thành</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Circle className="h-4 w-4 text-blue-500 fill-blue-500" />
            <span className="text-muted-foreground">Đang học</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">Nên học (dựa trên điểm yếu)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Chưa mở khóa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
