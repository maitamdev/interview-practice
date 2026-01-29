import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, CheckCircle, Circle, Lock, 
  Play, Clock, Target, TrendingUp, Sparkles,
  ChevronRight, ExternalLink
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  status: 'completed' | 'in-progress' | 'locked';
  progress: number;
  resources: { title: string; url: string; type: 'video' | 'article' | 'practice' }[];
}

const LEARNING_PATHS = {
  frontend: {
    title: 'Frontend Developer Path',
    description: 'Từ cơ bản đến nâng cao cho Frontend Developer',
    modules: [
      {
        id: 'fe-1',
        title: 'JavaScript Fundamentals',
        description: 'Nắm vững core concepts của JavaScript',
        duration: '2 tuần',
        topics: ['Variables & Types', 'Functions & Scope', 'Closures', 'Async/Await', 'ES6+'],
        status: 'completed' as const,
        progress: 100,
        resources: [
          { title: 'JavaScript.info', url: 'https://javascript.info', type: 'article' as const },
          { title: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net', type: 'article' as const },
        ],
      },
      {
        id: 'fe-2',
        title: 'React Mastery',
        description: 'Thành thạo React và ecosystem',
        duration: '3 tuần',
        topics: ['Components & Props', 'Hooks', 'State Management', 'Performance', 'Testing'],
        status: 'in-progress' as const,
        progress: 60,
        resources: [
          { title: 'React Docs', url: 'https://react.dev', type: 'article' as const },
          { title: 'React Patterns', url: 'https://reactpatterns.com', type: 'article' as const },
        ],
      },
      {
        id: 'fe-3',
        title: 'CSS & Responsive Design',
        description: 'Layout, animations, và responsive',
        duration: '2 tuần',
        topics: ['Flexbox', 'Grid', 'Animations', 'Media Queries', 'CSS-in-JS'],
        status: 'locked' as const,
        progress: 0,
        resources: [
          { title: 'CSS Tricks', url: 'https://css-tricks.com', type: 'article' as const },
        ],
      },
      {
        id: 'fe-4',
        title: 'System Design for Frontend',
        description: 'Thiết kế hệ thống frontend scale lớn',
        duration: '2 tuần',
        topics: ['Architecture', 'State Management', 'Caching', 'Performance', 'Micro-frontends'],
        status: 'locked' as const,
        progress: 0,
        resources: [],
      },
      {
        id: 'fe-5',
        title: 'Interview Preparation',
        description: 'Chuẩn bị cho phỏng vấn thực tế',
        duration: '1 tuần',
        topics: ['Common Questions', 'Coding Challenges', 'System Design', 'Behavioral'],
        status: 'locked' as const,
        progress: 0,
        resources: [],
      },
    ],
  },
  backend: {
    title: 'Backend Developer Path',
    description: 'Từ cơ bản đến nâng cao cho Backend Developer',
    modules: [
      {
        id: 'be-1',
        title: 'API Design & REST',
        description: 'Thiết kế API chuẩn và scalable',
        duration: '2 tuần',
        topics: ['REST Principles', 'HTTP Methods', 'Status Codes', 'Versioning', 'Documentation'],
        status: 'completed' as const,
        progress: 100,
        resources: [],
      },
      {
        id: 'be-2',
        title: 'Database Mastery',
        description: 'SQL, NoSQL và optimization',
        duration: '3 tuần',
        topics: ['SQL Queries', 'Indexing', 'Transactions', 'NoSQL', 'Caching'],
        status: 'in-progress' as const,
        progress: 40,
        resources: [],
      },
      {
        id: 'be-3',
        title: 'Security & Authentication',
        description: 'Bảo mật ứng dụng web',
        duration: '2 tuần',
        topics: ['Auth/AuthZ', 'JWT', 'OAuth', 'OWASP Top 10', 'Encryption'],
        status: 'locked' as const,
        progress: 0,
        resources: [],
      },
      {
        id: 'be-4',
        title: 'System Design',
        description: 'Thiết kế hệ thống distributed',
        duration: '3 tuần',
        topics: ['Scalability', 'Load Balancing', 'Microservices', 'Message Queues', 'CAP Theorem'],
        status: 'locked' as const,
        progress: 0,
        resources: [],
      },
    ],
  },
};

type PathKey = keyof typeof LEARNING_PATHS;

export default function LearningPath() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPath, setSelectedPath] = useState<PathKey>('frontend');
  const [weakAreas, setWeakAreas] = useState<string[]>(['React Hooks', 'System Design', 'Performance']);

  const currentPath = LEARNING_PATHS[selectedPath];
  const completedModules = currentPath.modules.filter(m => m.status === 'completed').length;
  const totalProgress = Math.round((completedModules / currentPath.modules.length) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <Play className="h-5 w-5 text-primary" />;
      default: return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
  };

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
          <h1 className="text-4xl font-bold mb-3">Học theo lộ trình cá nhân hóa</h1>
          <p className="text-xl text-muted-foreground">
            Dựa trên kết quả phỏng vấn, chúng tôi gợi ý lộ trình phù hợp với bạn
          </p>
        </div>

        {/* Weak areas alert */}
        {weakAreas.length > 0 && (
          <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Điểm cần cải thiện</div>
                  <div className="flex flex-wrap gap-2">
                    {weakAreas.map(area => (
                      <Badge key={area} variant="outline" className="bg-warning/10">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Path selector */}
        <div className="flex gap-4 mb-6">
          {(Object.keys(LEARNING_PATHS) as PathKey[]).map(key => (
            <Button
              key={key}
              variant={selectedPath === key ? 'default' : 'outline'}
              onClick={() => setSelectedPath(key)}
              className="flex-1"
            >
              {key === 'frontend' ? '💻 Frontend' : '⚙️ Backend'}
            </Button>
          ))}
        </div>

        {/* Progress overview */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{currentPath.title}</h2>
                <p className="text-muted-foreground">{currentPath.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{totalProgress}%</div>
                <div className="text-sm text-muted-foreground">
                  {completedModules}/{currentPath.modules.length} modules
                </div>
              </div>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-4">
          {currentPath.modules.map((module, index) => (
            <Card 
              key={module.id}
              className={`transition-all ${
                module.status === 'locked' ? 'opacity-60' : 'hover:border-primary/50'
              }`}
            >
              <CardContent className="py-5">
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className="flex flex-col items-center">
                    {getStatusIcon(module.status)}
                    {index < currentPath.modules.length - 1 && (
                      <div className={`w-0.5 h-full mt-2 ${
                        module.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                      }`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{module.title}</h3>
                        <p className="text-muted-foreground">{module.description}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {module.duration}
                      </Badge>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {module.topics.map(topic => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>

                    {/* Progress bar for in-progress */}
                    {module.status === 'in-progress' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tiến độ</span>
                          <span>{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                    )}

                    {/* Resources */}
                    {module.resources.length > 0 && module.status !== 'locked' && (
                      <div className="flex flex-wrap gap-2">
                        {module.resources.map(resource => (
                          <a
                            key={resource.url}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {resource.title}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Action button */}
                    {module.status !== 'locked' && (
                      <Button 
                        className="mt-3" 
                        variant={module.status === 'completed' ? 'outline' : 'default'}
                        onClick={() => navigate('/quick-practice')}
                      >
                        {module.status === 'completed' ? 'Ôn tập' : 'Tiếp tục học'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI recommendation */}
        <Card className="mt-8 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Gợi ý từ AI Coach</h3>
                <p className="text-muted-foreground mb-4">
                  Dựa trên kết quả phỏng vấn gần đây, bạn nên tập trung vào <strong>React Hooks</strong> và 
                  <strong> Performance Optimization</strong>. Hãy hoàn thành module "React Mastery" trước khi 
                  chuyển sang System Design.
                </p>
                <Button onClick={() => navigate('/interview/new')}>
                  <Target className="h-4 w-4 mr-2" />
                  Luyện tập ngay
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
