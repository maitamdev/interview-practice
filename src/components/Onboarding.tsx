import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Mic, 
  BookOpen, 
  Trophy,
  ChevronRight,
  ChevronLeft,
  X,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface OnboardingProps {
  onComplete: () => void;
  userName?: string;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Chào mừng đến với AI Interview Coach!',
    description: 'Nền tảng luyện phỏng vấn thông minh với AI, giúp bạn tự tin chinh phục mọi cuộc phỏng vấn.',
    color: 'from-primary to-teal-500',
    tips: [
      'Luyện tập với AI phỏng vấn viên thông minh',
      'Nhận feedback chi tiết cho từng câu trả lời',
      'Theo dõi tiến độ và cải thiện kỹ năng',
    ],
  },
  {
    id: 'interview',
    icon: Brain,
    title: 'Phỏng vấn với AI',
    description: 'AI sẽ đóng vai nhà tuyển dụng, đặt câu hỏi phù hợp với vị trí và cấp độ bạn chọn.',
    color: 'from-blue-500 to-cyan-500',
    tips: [
      'Chọn vị trí: Frontend, Backend, Fullstack...',
      'Chọn cấp độ: Fresher, Junior, Senior...',
      'AI sẽ hỏi follow-up dựa trên câu trả lời',
    ],
  },
  {
    id: 'voice',
    icon: Mic,
    title: 'Trả lời bằng giọng nói',
    description: 'Sử dụng microphone để trả lời như phỏng vấn thật, hoặc gõ text nếu bạn thích.',
    color: 'from-purple-500 to-pink-500',
    tips: [
      'Nhấn nút mic để bắt đầu nói',
      'AI sẽ đọc câu hỏi bằng giọng Việt tự nhiên',
      'Có thể chuyển đổi giữa voice và text',
    ],
  },
  {
    id: 'feedback',
    icon: Target,
    title: 'Đánh giá chi tiết',
    description: 'Sau mỗi câu trả lời, AI sẽ chấm điểm và đưa ra gợi ý cải thiện cụ thể.',
    color: 'from-orange-500 to-amber-500',
    tips: [
      'Điểm theo 4 tiêu chí: Liên quan, Cấu trúc, Độ sâu, Rõ ràng',
      'Gợi ý cải thiện cho từng điểm yếu',
      'Câu trả lời mẫu để tham khảo',
    ],
  },
  {
    id: 'learning',
    icon: BookOpen,
    title: 'Lộ trình học tập',
    description: 'Dựa trên kết quả phỏng vấn, AI sẽ tạo lộ trình học tập cá nhân hóa cho bạn.',
    color: 'from-green-500 to-emerald-500',
    tips: [
      'Xác định điểm yếu cần cải thiện',
      'Đề xuất tài liệu và khóa học phù hợp',
      'Theo dõi tiến độ học tập',
    ],
  },
  {
    id: 'gamification',
    icon: Trophy,
    title: 'Gamification & Thử thách',
    description: 'Kiếm XP, mở khóa huy hiệu, leo bảng xếp hạng và hoàn thành thử thách hàng ngày!',
    color: 'from-yellow-500 to-orange-500',
    tips: [
      'Nhận XP sau mỗi buổi phỏng vấn',
      'Mở khóa huy hiệu khi đạt thành tích',
      'Thử thách hàng ngày để duy trì streak',
    ],
  },
];

export function Onboarding({ onComplete, userName }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { playClick, playComplete } = useSoundEffects();
  
  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const Icon = step.icon;

  const handleNext = () => {
    playClick();
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      playComplete();
      onComplete();
    }
  };

  const handlePrev = () => {
    playClick();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                className={cn(
                  "w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center",
                  "bg-gradient-to-br", step.color
                )}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className="h-12 w-12 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-3">
                {currentStep === 0 && userName ? `${step.title.replace('!', `, ${userName}!`)}` : step.title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                {step.description}
              </p>

              {/* Tips */}
              <div className="space-y-3 text-left max-w-md mx-auto mb-8">
                {step.tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold",
                      "bg-gradient-to-br", step.color
                    )}>
                      {index + 1}
                    </div>
                    <span className="text-sm">{tip}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => { playClick(); setCurrentStep(index); }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : index < currentStep 
                      ? "bg-primary/50" 
                      : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </span>

            <Button
              onClick={handleNext}
              className={cn(
                "gap-2",
                currentStep === ONBOARDING_STEPS.length - 1 && "bg-gradient-to-r from-primary to-teal-500"
              )}
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <>
                  <Rocket className="h-4 w-4" />
                  Bắt đầu
                </>
              ) : (
                <>
                  Tiếp
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('onboarding-completed') === 'true';
  });

  const triggerOnboarding = () => {
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    localStorage.setItem('onboarding-completed', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding-completed');
    setHasSeenOnboarding(false);
  };

  return {
    showOnboarding,
    hasSeenOnboarding,
    triggerOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}
