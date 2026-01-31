import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, Clock, ArrowRight, CheckCircle, 
  RotateCcw, Home, Trophy, Target, Sparkles,
  Brain, Code, Users, Timer, Award, Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';

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

const CATEGORY_CONFIG = {
  frontend: { 
    label: 'Frontend', 
    icon: Code, 
    emoji: '💻', 
    desc: 'React, JavaScript, CSS...',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  backend: { 
    label: 'Backend', 
    icon: Brain, 
    emoji: '⚙️', 
    desc: 'API, Database, Security...',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  behavioral: { 
    label: 'Behavioral', 
    icon: Users, 
    emoji: '🗣️', 
    desc: 'Soft skills, Teamwork...',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
};

export default function QuickPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [category, setCategory] = useState<QuestionCategory | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<QuickAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
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
        <div className="container max-w-5xl mx-auto py-8 px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-teal-500/10 text-primary px-5 py-2.5 rounded-full mb-6 border border-primary/20"
              whileHover={{ scale: 1.02 }}
            >
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Luyện tập nhanh</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">5 câu hỏi</span> - 10 phút
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chọn chủ đề và bắt đầu luyện tập ngay! Mỗi câu hỏi có 2 phút để trả lời.
            </p>
          </motion.div>

          {/* Category Cards */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {Object.entries(CATEGORY_CONFIG).map(([key, config], index) => {
              const Icon = config.icon;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer h-full transition-all duration-300 hover-lift",
                      "border-2 hover:border-primary/50",
                      config.bgColor, config.borderColor
                    )}
                    onClick={() => startPractice(key as QuestionCategory)}
                  >
                    <CardContent className="pt-8 pb-6 text-center relative overflow-hidden">
                      {/* Background glow */}
                      <div className={cn(
                        "absolute inset-0 opacity-20 blur-3xl",
                        `bg-gradient-to-br ${config.color}`
                      )} />
                      
                      <div className="relative z-10">
                        <motion.div 
                          className="text-6xl mb-4"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {config.emoji}
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2">{config.label}</h3>
                        <p className="text-muted-foreground text-lg mb-4">{config.desc}</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Timer className="h-4 w-4" />
                          <span>5 câu • 2 phút/câu</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Features */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: Zap, label: 'Nhanh chóng', desc: '10 phút' },
              { icon: Target, label: 'Tập trung', desc: '5 câu hỏi' },
              { icon: Brain, label: 'Đa dạng', desc: '3 chủ đề' },
              { icon: Award, label: 'Hiệu quả', desc: 'Luyện tập' },
            ].map((item, i) => (
              <Card key={i} className="glass">
                <CardContent className="pt-4 pb-4 text-center">
                  <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <div className="text-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')} className="gap-2">
              <Home className="h-5 w-5" />
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
    const config = CATEGORY_CONFIG[category];

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-3xl mx-auto py-8 px-4">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div 
              className="text-7xl mb-4"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              🎉
            </motion.div>
            <h1 className="text-4xl font-bold mb-3">
              <span className="text-gradient">Hoàn thành!</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Bạn đã trả lời {answers.length} câu hỏi {config.label}
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass hover-lift">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gradient">{formatTime(totalTime)}</div>
                <div className="text-muted-foreground">Tổng thời gian</div>
              </CardContent>
            </Card>
            <Card className="glass hover-lift">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gradient">{formatTime(avgTime)}</div>
                <div className="text-muted-foreground">Trung bình/câu</div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-4 mb-8">
            {answers.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Card className="glass hover-lift">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cn(config.bgColor, config.borderColor)}>
                        Câu {i + 1}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(a.timeSpent)}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{a.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground bg-muted/30 p-4 rounded-xl">
                      {a.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="flex gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button variant="outline" size="lg" onClick={resetPractice} className="gap-2">
              <RotateCcw className="h-5 w-5" />
              Luyện tiếp
            </Button>
            <Button size="lg" onClick={() => navigate('/interview/new')} className="gap-2 btn-premium">
              <Trophy className="h-5 w-5" />
              Phỏng vấn đầy đủ
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Practice screen
  const config = CATEGORY_CONFIG[category];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const timePercent = (timeLeft / 120) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl mx-auto py-8 px-4">
        {/* Progress Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge className={cn("text-sm", config.bgColor, config.borderColor)}>
                {config.emoji} {config.label}
              </Badge>
              <span className="text-lg font-semibold">
                Câu {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <motion.div 
              className={cn(
                "flex items-center gap-2 text-lg font-mono px-4 py-2 rounded-xl",
                timeLeft <= 30 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
              )}
              animate={timeLeft <= 30 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: timeLeft <= 30 ? Infinity : 0 }}
            >
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </motion.div>
          </div>
          
          {/* Progress bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Tiến độ</span>
              <Progress value={progressPercent} className="flex-1 h-2" />
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Thời gian</span>
              <Progress 
                value={timePercent} 
                className={cn("flex-1 h-2", timeLeft <= 30 && "[&>div]:bg-destructive")} 
              />
              <span>{Math.round(timePercent)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6 glass border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Câu hỏi</span>
                </div>
                <CardTitle className="text-2xl leading-relaxed">
                  {questions[currentIndex]}
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="relative">
              <Textarea
                placeholder="Nhập câu trả lời của bạn... Hãy trả lời chi tiết và có cấu trúc."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[220px] text-lg mb-6 resize-none input-glow"
                autoFocus
              />
              <div className="absolute bottom-8 right-3 text-xs text-muted-foreground">
                {answer.length} ký tự
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          <Button variant="outline" onClick={resetPractice} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Huỷ
          </Button>
          <Button 
            size="lg" 
            onClick={handleNext}
            className={cn(
              "gap-2",
              currentIndex >= questions.length - 1 ? "btn-premium" : ""
            )}
          >
            {currentIndex >= questions.length - 1 ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Hoàn thành
              </>
            ) : (
              <>
                Tiếp theo
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
