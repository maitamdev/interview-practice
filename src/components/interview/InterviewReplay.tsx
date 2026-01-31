import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp?: string;
}

interface InterviewReplayProps {
  messages: Message[];
  onClose?: () => void;
}

export function InterviewReplay({ messages, onClose }: InterviewReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress
  const progress = messages.length > 0 ? (currentIndex / messages.length) * 100 : 0;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages]);

  // Playback logic
  useEffect(() => {
    if (isPlaying && currentIndex < messages.length) {
      const baseDelay = messages[currentIndex].role === 'interviewer' ? 2000 : 1500;
      const delay = baseDelay / speed;

      timerRef.current = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, messages[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
        
        // Play sound if not muted
        if (!isMuted) {
          const audio = new AudioContext();
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.frequency.value = messages[currentIndex].role === 'interviewer' ? 600 : 800;
          gain.gain.value = 0.05;
          oscillator.start();
          oscillator.stop(audio.currentTime + 0.1);
        }
      }, delay);
    } else if (currentIndex >= messages.length) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentIndex, messages, speed, isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setDisplayedMessages([]);
  };

  const handleSkip = () => {
    if (currentIndex < messages.length) {
      setDisplayedMessages(prev => [...prev, messages[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentSpeedIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentSpeedIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Xem lại phỏng vấn</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeedChange}
            >
              {speed}x
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="h-80 overflow-y-auto mb-4 space-y-3 p-3 bg-muted/30 rounded-lg">
          <AnimatePresence>
            {displayedMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  msg.role === 'candidate' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] p-3 rounded-lg",
                  msg.role === 'candidate' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card border"
                )}>
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {msg.role === 'interviewer' ? 'HR' : 'Bạn'}
                  </p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isPlaying && currentIndex < messages.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{currentIndex} / {messages.length} tin nhắn</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRestart}
            disabled={currentIndex === 0}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            size="lg"
            onClick={handlePlayPause}
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5" />
                Tạm dừng
              </>
            ) : currentIndex >= messages.length ? (
              <>
                <RotateCcw className="h-5 w-5" />
                Xem lại
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                {currentIndex === 0 ? 'Bắt đầu' : 'Tiếp tục'}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSkip}
            disabled={currentIndex >= messages.length}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
