import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  role: string;
  skill: string;
  title: string;
  title_vi: string;
  description_vi: string;
  difficulty: string;
  duration_hours: number;
}

interface CourseRecommendationsProps {
  sessionId: string;
  role: string;
  weaknesses: string[];
  overallScore: number;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

// Map weaknesses to skills
const WEAKNESS_TO_SKILL: Record<string, string[]> = {
  'javascript': ['javascript'],
  'react': ['react', 'javascript'],
  'hooks': ['react'],
  'state': ['react'],
  'typescript': ['typescript'],
  'css': ['css'],
  'performance': ['performance'],
  'api': ['api-design'],
  'database': ['database'],
  'sql': ['database'],
  'security': ['security'],
  'system design': ['system-design'],
  'behavioral': ['behavioral'],
  'communication': ['behavioral'],
  'star': ['behavioral'],
};

export function CourseRecommendations({ sessionId, role, weaknesses, overallScore }: CourseRecommendationsProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedCourses();
  }, [role, weaknesses]);

  const fetchRecommendedCourses = async () => {
    try {
      // Determine which skills to recommend based on weaknesses
      const skillsToRecommend = new Set<string>();
      
      weaknesses.forEach(weakness => {
        const lowerWeakness = weakness.toLowerCase();
        Object.entries(WEAKNESS_TO_SKILL).forEach(([key, skills]) => {
          if (lowerWeakness.includes(key)) {
            skills.forEach(s => skillsToRecommend.add(s));
          }
        });
      });

      // If score is low, add behavioral course
      if (overallScore < 3) {
        skillsToRecommend.add('behavioral');
      }

      // If no specific skills found, recommend based on role
      if (skillsToRecommend.size === 0) {
        if (role === 'frontend') {
          skillsToRecommend.add('javascript');
          skillsToRecommend.add('react');
        } else if (role === 'backend') {
          skillsToRecommend.add('api-design');
          skillsToRecommend.add('database');
        } else {
          skillsToRecommend.add('system-design');
        }
      }

      // Fetch courses matching the skills
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .or(`role.eq.${role},role.eq.fullstack`)
        .in('skill', Array.from(skillsToRecommend))
        .order('order_index')
        .limit(4);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Đang tải gợi ý...</div>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <Card className="glass border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Khóa học gợi ý cho bạn
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Dựa trên kết quả phỏng vấn, chúng tôi gợi ý các khóa học sau để cải thiện
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Link key={course.id} to={`/learn/${course.id}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <Badge className={DIFFICULTY_COLORS[course.difficulty]}>
                      {DIFFICULTY_LABELS[course.difficulty]}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {course.title_vi}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {course.description_vi}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {course.duration_hours} giờ
                    </span>
                    <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                      Học ngay <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link to="/learning-path">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Xem tất cả khóa học
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
