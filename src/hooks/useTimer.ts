import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialSeconds: number;
  onTimeUp?: () => void;
  warningThreshold?: number; // seconds
}

interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  isWarning: boolean;
  isDanger: boolean;
  formattedTime: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
}

export function useTimer({
  initialSeconds,
  onTimeUp,
  warningThreshold = 30,
}: UseTimerOptions): UseTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep callback ref updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Timer logic
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUpRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds]);

  const start = useCallback(() => {
    if (seconds > 0) {
      setIsRunning(true);
    }
  }, [seconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const addTime = useCallback((additionalSeconds: number) => {
    setSeconds(prev => prev + additionalSeconds);
  }, []);

  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return {
    seconds,
    isRunning,
    isWarning: seconds <= warningThreshold && seconds > 10,
    isDanger: seconds <= 10,
    formattedTime: formatTime(seconds),
    start,
    pause,
    reset,
    addTime,
  };
}

// Session timer hook (for total interview time)
export function useSessionTimer(totalMinutes: number = 30) {
  const totalSeconds = totalMinutes * 60;
  return useTimer({
    initialSeconds: totalSeconds,
    warningThreshold: 300, // 5 minutes warning
  });
}

// Question timer hook (for individual question)
export function useQuestionTimer(
  questionSeconds: number = 90,
  onTimeUp?: () => void
) {
  return useTimer({
    initialSeconds: questionSeconds,
    onTimeUp,
    warningThreshold: 20,
  });
}
