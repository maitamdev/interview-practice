import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, Clock, ArrowRight, CheckCircle, 
  RotateCcw, Home, Trophy, Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

// Quick practice questions pool
const QUICK_QUESTIONS = {
  frontend: [
    "Giải thích sự khác nhau giữa var, let và const trong JavaScript?",
    "React hooks là gì? Kể tên 3 hooks phổ biến và công dụng của chúng.",
    "CSS Flexbox và Grid khác nhau như thế nào? Khi nào dùng cái nào?",
    "Virtual DOM là gì và tại sao React sử dụng nó?",
    "Giải thích closure trong JavaScript với ví dụ.",
    "Responsive design là gì? Làm sao để implement?",
    "State và Props trong React khác nhau như thế nào?",
    "Event delegation là gì? Tại sao nên dùng?",
  ],
  backend: [
    "RESTful API là gì? Kể tên các HTTP methods phổ biến.",
    "SQL injection là gì và cách phòng tránh?",
    "Giải thích sự khác nhau giữa SQL và NoSQL database.",
    "Authentication và Authorization khác nhau như thế nào?",
    "Caching là gì? Khi nào nên sử dụng cache?",
    "Microservices và Monolithic architecture khác nhau như thế nào?",
    "Database indexing là gì và tại sao quan trọng?",
    "Rate limiting là gì? Implement như thế nào?",
  ],
  behavioral: [
    "Kể về một lần bạn phải làm việc với deadline gấp.",
    "Bạn xử lý conflict với đồng nghiệp như thế nào?",
    "Mô tả một project bạn tự hào nhất và tại sao.",
    "Bạn học công nghệ mới như thế nào?",
    "Kể về một lần bạn mắc sai lầm và học được gì.",
    "Tại sao bạn muốn làm việc ở vị trí này?",
    "Điểm mạnh và điểm yếu của bạn là gì?",
    "Bạn xử lý áp lực công việc như thế nào?",
  ],
};

type QuestionCategory = keyof typeof QUICK_QUESTIONS;

interface QuickAnswer {
  question: string;
  answer: string;
  timeSpent: number;
}

export default function QuickPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [category, setCategory] = useState<QuestionCategory | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<QuickAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Timer
  useEffect(() => {
    if (!category || isFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [category, currentIndex, isFinished]);

  const startPractice = (cat: QuestionCategory) => {
    // Shuffle and pick 5 random questions
    const shuffled = [...QUICK_QUESTIONS[cat]].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 5));
    setCategory(cat);
    setCurrentIndex(0);
    setAnswers([]);
    setTimeLeft(120);
    setStartTime(Date.now());
    setIsFinished(false);
  };

  const handleNext = () => {
    const timeSpent = 120 - timeLeft;
    
    // Save current answer
    if (questions[currentIndex]) {
      setAnswers(prev => [...prev, {
        question: questions[currentIndex],
        answer: answer || '(Không trả lời)',
        timeSpent,
      }]);
    }

    if (currentIndex >= questions.length - 1) {
      setIsFinished(true);
      toast({ title: '🎉 Hoàn thành!', description: 'Xem kết quả bên dưới.' });
    } else {
      setCurrentIndex(prev => prev + 1);
      setAnswer('');
      setTimeLeft(120);
      setStartTime(Date.now());
    }
  };

  const resetPractice = () => {
    setCategory(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer('');
    setAnswers([]);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Category selection screen
  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Zap className="h-5 w-5" />
              <span className="font-medium">Luyện tập nhanh</span>
            </div>
            <h1 className="text-4xl font-bold mb-3">5 câu hỏi - 10 phút</h1>
            <p className="text-xl text-muted-foreground">
              Chọn chủ đề và bắt đầu luyện tập ngay!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { key: 'frontend', label: 'Frontend', icon: '💻', desc: 'React, JS, CSS...' },
              { key: 'backend', label: 'Backend', icon: '⚙️', desc: 'API, Database, Security...' },
              { key: 'behavioral', label: 'Behavioral', icon: '🗣️', desc: 'Soft skills, Teamwork...' },
            ].map((cat) => (
              <motion.div
                key={cat.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all h-full"
                  onClick={() => startPractice(cat.key as QuestionCategory)}
                >
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="text-5xl mb-4">{cat.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{cat.label}</h3>
                    <p className="text-muted-foreground text-lg">{cat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
              <Home className="h-5 w-5 mr-2" />
              Về Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (isFinished) {
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const avgTime = Math.round(totalTime / answers.length);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-3xl mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold mb-3">Hoàn thành!</h1>
            <p className="text-xl text-muted-foreground">
              Bạn đã trả lời {answers.length} câu hỏi
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{formatTime(totalTime)}</div>
                <div className="text-muted-foreground">Tổng thời gian</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{formatTime(avgTime)}</div>
                <div className="text-muted-foreground">Trung bình/câu</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 mb-8">
            {answers.map((a, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Câu {i + 1}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(a.timeSpent)}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{a.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {a.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="lg" onClick={resetPractice}>
              <RotateCcw className="h-5 w-5 mr-2" />
              Luyện tiếp
            </Button>
            <Button size="lg" onClick={() => navigate('/interview/new')}>
              <Trophy className="h-5 w-5 mr-2" />
              Phỏng vấn đầy đủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Practice screen
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl mx-auto py-8 px-4">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium">
              Câu {currentIndex + 1} / {questions.length}
            </span>
            <div className={`flex items-center gap-2 text-lg font-mono ${timeLeft <= 30 ? 'text-destructive animate-pulse' : ''}`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(currentIndex / questions.length) * 100} className="h-2" />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <Badge className="w-fit mb-2">{category}</Badge>
                <CardTitle className="text-2xl leading-relaxed">
                  {questions[currentIndex]}
                </CardTitle>
              </CardHeader>
            </Card>

            <Textarea
              placeholder="Nhập câu trả lời của bạn..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[200px] text-lg mb-6"
              autoFocus
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          <Button variant="outline" onClick={resetPractice}>
            Huỷ
          </Button>
          <Button size="lg" onClick={handleNext}>
            {currentIndex >= questions.length - 1 ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Hoàn thành
              </>
            ) : (
              <>
                Tiếp theo
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
