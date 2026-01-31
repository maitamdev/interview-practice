import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  ChevronRight, 
  ChevronLeft,
  Target,
  Clock,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tips = [
  {
    icon: Target,
    title: 'Phương pháp STAR',
    content: 'Trả lời theo cấu trúc: Situation (Tình huống) → Task (Nhiệm vụ) → Action (Hành động) → Result (Kết quả)',
    color: 'text-primary'
  },
  {
    icon: Clock,
    title: 'Quản lý thời gian',
    content: 'Mỗi câu có 90 giây. Dành 10s suy nghĩ, 60s trả lời chính, 20s tổng kết.',
    color: 'text-amber-500'
  },
  {
    icon: MessageSquare,
    title: 'Ví dụ cụ thể',
    content: 'Luôn đưa ra ví dụ thực tế từ kinh nghiệm. Số liệu cụ thể tăng độ tin cậy.',
    color: 'text-emerald-500'
  },
  {
    icon: Sparkles,
    title: 'Tự tin & Chân thành',
    content: 'Không cần hoàn hảo. Thể hiện sự học hỏi từ thất bại cũng là điểm cộng.',
    color: 'text-purple-500'
  }
];

export function InterviewTips() {
  const [currentTip, setCurrentTip] = useState(0);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const tip = tips[currentTip];
  const Icon = tip.icon;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Mẹo phỏng vấn</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {currentTip + 1}/{tips.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[80px]"
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg bg-background/50", tip.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.content}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevTip}
            className="h-7 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1">
            {tips.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTip(idx)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  idx === currentTip ? "bg-primary w-4" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextTip}
            className="h-7 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
