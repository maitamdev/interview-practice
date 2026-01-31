import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface BadgeNotificationProps {
  badge: {
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  } | null;
  onClose: () => void;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  trophy: <Trophy className="h-8 w-8" />,
  sparkles: <Sparkles className="h-8 w-8" />,
  zap: <Zap className="h-8 w-8" />,
};

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; color: string; left: number; delay: number }>>([]);
  const { playBadge } = useSoundEffects();

  useEffect(() => {
    if (badge) {
      // Play badge sound
      playBadge();
      
      // Generate confetti
      const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setConfetti(pieces);

      // Auto close after 5 seconds
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Confetti */}
          <div className="confetti-container">
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                className="confetti-piece"
                style={{ 
                  left: `${piece.left}%`, 
                  backgroundColor: piece.color,
                  top: '50%'
                }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{ 
                  y: -300, 
                  opacity: 0, 
                  rotate: 720,
                  x: (Math.random() - 0.5) * 200
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: piece.delay,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>

          {/* Badge Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-primary/30 shadow-2xl">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="relative z-10 p-8 text-center">
                {/* Badge icon */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                >
                  <span className="text-primary">
                    {BADGE_ICONS[badge.icon] || <Trophy className="h-8 w-8" />}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-sm text-primary font-medium mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Huy hiệu mới!
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{badge.name}</h2>
                  <p className="text-muted-foreground mb-4">{badge.description}</p>
                </motion.div>

                {/* XP Reward */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-bold text-primary">+{badge.xpReward} XP</span>
                </motion.div>

                {/* Action button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6"
                >
                  <Button onClick={onClose} className="w-full btn-premium">
                    Tuyệt vời!
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage badge notifications
export function useBadgeNotification() {
  const [pendingBadge, setPendingBadge] = useState<{
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  } | null>(null);

  const showBadge = (badge: { name: string; description: string; icon: string; xpReward: number }) => {
    setPendingBadge(badge);
  };

  const closeBadge = () => {
    setPendingBadge(null);
  };

  return { pendingBadge, showBadge, closeBadge };
}
