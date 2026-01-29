import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge as BadgeType } from '@/hooks/useGamification';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Star, 
  Crown, 
  Target, 
  Award, 
  ThumbsUp, 
  Sparkles, 
  MessageSquare,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BadgeNotificationProps {
  badge: BadgeType | null;
  onClose: () => void;
}

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'trophy': Trophy,
  'flame': Flame,
  'zap': Zap,
  'star': Star,
  'crown': Crown,
  'target': Target,
  'award': Award,
  'thumbs-up': ThumbsUp,
  'sparkles': Sparkles,
  'message-square': MessageSquare,
};

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  const IconComponent = BADGE_ICONS[badge.icon] || Trophy;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative bg-card border border-primary/30 rounded-2xl p-6 shadow-2xl shadow-primary/20 max-w-sm">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl" />
            
            {/* Content */}
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Trophy className="h-5 w-5 text-warning" />
                </motion.div>
                <span className="text-sm font-medium text-warning">Huy hiệu mới!</span>
              </div>

              {/* Badge */}
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <IconComponent className="h-8 w-8 text-primary" />
                </motion.div>
                <div>
                  <h4 className="font-display font-bold text-lg">{badge.name_vi}</h4>
                  <p className="text-sm text-muted-foreground">{badge.description_vi}</p>
                  <div className="flex items-center gap-1 mt-1 text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-sm font-medium">+{badge.xp_reward} XP</span>
                  </div>
                </div>
              </div>

              {/* Confetti effect (simple version) */}
              <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-2xl">🎉</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
