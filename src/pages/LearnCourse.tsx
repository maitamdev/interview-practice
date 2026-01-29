import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, BookOpen, Clock, CheckCircle2, Circle, 
  Play, ChevronRight, GraduationCap, Trophy
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Course {
  id: string;
  title_vi: string;
  description_vi: string;
  difficulty: string;
  duration_hours: number;
  skill: string;
}

interface Lesson {
  id: string;
  title_vi: string;
  content_vi: string;
  duration_minutes: number;
  order_index: number;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp', 
  advanced: 'Nâng cao',
};


export default function LearnCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseData) setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (lessonsData) {
        setLessons(lessonsData);
        if (lessonsData.length > 0) {
          setCurrentLesson(lessonsData[0]);
        }
      }

      // Fetch user's completed lessons
      if (user) {
        const { data: completions } = await supabase
          .from('user_lesson_completion')
          .select('lesson_id')
          .eq('user_id', user.id);

        if (completions) {
          setCompletedLessons(new Set(completions.map(c => c.lesson_id)));
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;

    try {
      await supabase.from('user_lesson_completion').upsert({
        user_id: user.id,
        lesson_id: lessonId,
      }, { onConflict: 'user_id,lesson_id' });

      setCompletedLessons(prev => new Set([...prev, lessonId]));

      // Update course progress
      const newProgress = Math.round(((completedLessons.size + 1) / lessons.length) * 100);
      await supabase.from('user_course_progress').upsert({
        user_id: user.id,
        course_id: courseId,
        current_lesson_id: lessonId,
        progress_percent: newProgress,
        completed_at: newProgress >= 100 ? new Date().toISOString() : null,
      }, { onConflict: 'user_id,course_id' });

      // Move to next lesson
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const progress = lessons.length > 0 
    ? Math.round((completedLessons.size / lessons.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8 px-4"><SkeletonCard /></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h1>
          <Link to="/learning-path"><Button>Về lộ trình học</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <Link to="/learning-path" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />Về lộ trình học
        </Link>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Lesson list */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  {course.title_vi}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />{course.duration_hours} giờ
                  <Badge variant="outline" className="ml-2">{DIFFICULTY_LABELS[course.difficulty]}</Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiến độ</span><span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-1">
                    {lessons.map((lesson, index) => {
                      const isCompleted = completedLessons.has(lesson.id);
                      const isCurrent = currentLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 ${
                            isCurrent ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : isCurrent ? (
                              <Play className="h-5 w-5 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : ''}`}>
                              {index + 1}. {lesson.title_vi}
                            </p>
                            <p className="text-xs text-muted-foreground">{lesson.duration_minutes} phút</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">Bài {lessons.findIndex(l => l.id === currentLesson.id) + 1}/{lessons.length}</Badge>
                      <CardTitle className="text-2xl">{currentLesson.title_vi}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />{currentLesson.duration_minutes} phút
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-lg !my-4"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {currentLesson.content_vi}
                    </ReactMarkdown>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      disabled={lessons.findIndex(l => l.id === currentLesson.id) === 0}
                      onClick={() => {
                        const idx = lessons.findIndex(l => l.id === currentLesson.id);
                        if (idx > 0) setCurrentLesson(lessons[idx - 1]);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />Bài trước
                    </Button>

                    {completedLessons.has(currentLesson.id) ? (
                      <Badge className="bg-green-100 text-green-700 gap-1">
                        <CheckCircle2 className="h-4 w-4" />Đã hoàn thành
                      </Badge>
                    ) : (
                      <Button onClick={() => markLessonComplete(currentLesson.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />Hoàn thành bài học
                      </Button>
                    )}

                    <Button
                      disabled={lessons.findIndex(l => l.id === currentLesson.id) === lessons.length - 1}
                      onClick={() => {
                        const idx = lessons.findIndex(l => l.id === currentLesson.id);
                        if (idx < lessons.length - 1) setCurrentLesson(lessons[idx + 1]);
                      }}
                    >
                      Bài tiếp<ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Chọn một bài học để bắt đầu</p>
                </CardContent>
              </Card>
            )}

            {progress >= 100 && (
              <Card className="mt-6 border-green-500/50 bg-green-50 dark:bg-green-950/20">
                <CardContent className="py-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-bold mb-2">Chúc mừng! 🎉</h3>
                  <p className="text-muted-foreground mb-4">Bạn đã hoàn thành khóa học này!</p>
                  <Link to="/interview/new">
                    <Button>Thử phỏng vấn lại để kiểm tra</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
