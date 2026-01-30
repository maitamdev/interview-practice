import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterview } from '@/hooks/useInterview';
import { useTimer } from '@/hooks/useTimer';
import { Navbar } from '@/components/Navbar';
import { ChatMessage, TypingIndicator } from '@/components/interview/ChatMessage';
import { ChatInput, EndInterviewButton } from '@/components/interview/ChatInput';
import { TimerDisplay } from '@/components/interview/TimerDisplay';
import { FeedbackCard } from '@/components/interview/FeedbackCard';
import { VoiceInput, useTextToSpeech } from '@/components/interview/VoiceInput';
import { AICoachTips } from '@/components/interview/AICoachTips';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  Play, 
  MessageSquare, 
  BarChart3, 
  Mic,
  Keyboard,
  Volume2,
  VolumeX,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { ROLE_INFO, LEVEL_INFO } from '@/types/interview';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const QUESTION_TIME_LIMIT = 90; // seconds
const MAX_VIOLATIONS = 3; // Maximum allowed tab switches before auto-end

export default function InterviewRoom() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [activeTab, setActiveTab] = useState<'chat' | 'feedback'>('chat');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [coachEnabled, setCoachEnabled] = useState(true);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const prevAiThinkingRef = useRef(false);

  // Anti-cheat state
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isAutoEnding, setIsAutoEnding] = useState(false);

  const { speak, stop, isSpeaking } = useTextToSpeech();

  const {
    session,
    messages,
    answers,
    isLoading,
    isAiThinking,
    startInterview,
    submitAnswer,
    endInterview,
    abandonInterview,
    loadSession,
  } = useInterview();

  // Question timer with persistence support
  const questionTimer = useTimer({
    initialSeconds: QUESTION_TIME_LIMIT,
    warningThreshold: 20,
    onTimeUp: () => {
      // Auto-submit placeholder when time's up
      if (!isAiThinking) {
        submitAnswer('[Hết thời gian - không trả lời]');
      }
    },
  });

  // Restore timer from persisted state when session loads
  useEffect(() => {
    if (session?.status === 'in_progress' && session.current_question_started_at) {
      const startTime = new Date(session.current_question_started_at);
      const timeLimit = session.question_time_limit || QUESTION_TIME_LIMIT;
      questionTimer.setFromPersistedTime(startTime, timeLimit);
    }
  }, [session?.id, session?.current_question_started_at]);

  // ==========================================
  // ANTI-CHEAT SYSTEM
  // ==========================================
  
  // Handle tab/window visibility change
  useEffect(() => {
    if (session?.status !== 'in_progress') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tab or minimized window
        handleViolation('Bạn đã chuyển tab hoặc thu nhỏ cửa sổ');
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: '⚠️ Không được phép',
        description: 'Click chuột phải bị vô hiệu hóa trong phòng phỏng vấn',
        variant: 'destructive',
      });
    };

    // Prevent copy/paste - but allow typing in input fields
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;
      
      // Block copy from anywhere (prevent copying questions/answers)
      if (e.type === 'copy' || e.type === 'cut') {
        e.preventDefault();
        toast({
          title: '⚠️ Không được phép',
          description: 'Copy bị vô hiệu hóa trong phòng phỏng vấn',
          variant: 'destructive',
        });
        return;
      }
      
      // Block paste - but only if it's actual clipboard paste, not Vietnamese typing
      // Vietnamese IME doesn't trigger paste event, so this is safe
      if (e.type === 'paste' && !isInputField) {
        e.preventDefault();
        toast({
          title: '⚠️ Không được phép',
          description: 'Paste bị vô hiệu hóa trong phòng phỏng vấn',
          variant: 'destructive',
        });
      }
    };

    // Prevent keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+X) - but only outside input fields
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;
      
      // Allow ALL keys in input fields - Vietnamese typing uses special key combinations
      if (isInputField) {
        return; // Don't block anything in input fields
      }
      
      // Block Ctrl+C, Ctrl+V, Ctrl+X outside input fields
      if (e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        toast({
          title: '⚠️ Không được phép',
          description: 'Phím tắt copy/paste bị vô hiệu hóa',
          variant: 'destructive',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [session?.status, toast]);

  // Handle violation
  const handleViolation = useCallback((reason: string) => {
    setViolations(prev => {
      const newCount = prev + 1;
      
      if (newCount >= MAX_VIOLATIONS) {
        // Auto-end interview after max violations
        setIsAutoEnding(true);
        return newCount;
      }
      
      // Show warning
      setShowViolationWarning(true);
      toast({
        title: `⚠️ Cảnh báo ${newCount}/${MAX_VIOLATIONS}`,
        description: reason,
        variant: 'destructive',
      });
      
      return newCount;
    });
  }, [toast]);

  // Auto-end interview when max violations reached
  useEffect(() => {
    if (isAutoEnding && session?.status === 'in_progress') {
      const autoEnd = async () => {
        // Stop TTS immediately
        stop();
        toast({
          title: '🚫 Phỏng vấn bị hủy',
          description: 'Bạn đã vi phạm quy định 3 lần. Phiên phỏng vấn đã bị hủy.',
          variant: 'destructive',
        });
        await abandonInterview();
        navigate('/dashboard');
      };
      autoEnd();
    }
  }, [isAutoEnding, session?.status, abandonInterview, navigate, toast, stop]);

  // Prevent browser back/forward navigation during interview
  useEffect(() => {
    if (session?.status !== 'in_progress') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Bạn đang trong phiên phỏng vấn. Bạn có chắc muốn rời đi?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session?.status]);

  // Cleanup TTS when leaving page
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Load session on mount
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // TTS: Read new interviewer messages aloud ONLY when AI finishes thinking
  useEffect(() => {
    // Don't speak if TTS is disabled
    if (!ttsEnabled) {
      return;
    }
    
    // Detect when AI just finished thinking (transition from true to false)
    if (prevAiThinkingRef.current && !isAiThinking) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'interviewer' && lastMsg.id !== lastSpokenMessageIdRef.current) {
        speak(lastMsg.content, session?.language || 'vi');
        lastSpokenMessageIdRef.current = lastMsg.id;
      }
    }
    prevAiThinkingRef.current = isAiThinking;
  }, [isAiThinking, messages, ttsEnabled, speak, session?.language]);

  // Start/reset timer when new question arrives (only for NEW questions, not page reload)
  const lastQuestionIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (session?.status === 'in_progress' && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'interviewer') {
        // Only reset if this is a NEW question (index changed), not a page reload
        const currentIndex = session.current_question_index;
        if (lastQuestionIndexRef.current !== null && lastQuestionIndexRef.current !== currentIndex) {
          // New question arrived - reset timer
          questionTimer.reset();
          questionTimer.start();
        } else if (lastQuestionIndexRef.current === null && !session.current_question_started_at) {
          // First question and no persisted time - start fresh
          questionTimer.reset();
          questionTimer.start();
        }
        lastQuestionIndexRef.current = currentIndex;
      }
    }
  }, [messages, session?.status, session?.current_question_index]);

  // Handle answer submission
  const handleSubmitAnswer = async (text: string) => {
    // Prevent submit if no question yet
    if (messages.filter(m => m.role === 'interviewer').length === 0) {
      return;
    }
    
    // Stop TTS immediately when user submits answer
    stop();
    
    // Mark current message as already spoken to prevent re-reading
    const lastInterviewerMsg = messages.filter(m => m.role === 'interviewer').pop();
    if (lastInterviewerMsg) {
      lastSpokenMessageIdRef.current = lastInterviewerMsg.id;
    }
    
    questionTimer.pause();
    const timeLimit = session?.question_time_limit || QUESTION_TIME_LIMIT;
    const timeTaken = timeLimit - questionTimer.seconds;
    await submitAnswer(text, timeTaken);
  };

  // Unlock audio autoplay by playing a silent sound
  const unlockAudio = useCallback(() => {
    // Create and play a silent audio to unlock autoplay
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silentAudio.volume = 0.01;
    silentAudio.play().catch(() => {});
    
    // Also unlock Web Speech API
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Handle start interview
  const handleStart = async () => {
    // Unlock audio autoplay when user clicks start
    unlockAudio();
    await startInterview();
  };

  // Handle end interview
  const handleEnd = async () => {
    stop(); // Stop TTS before ending
    await endInterview();
    navigate(`/interview/${sessionId}/report`);
  };

  // Loading state
  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Completed state
  if (session.status === 'completed') {
    navigate(`/interview/${sessionId}/report`, { replace: true });
    return null;
  }

  const progress = ((session.current_question_index + 1) / session.total_questions) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Header with session info - Enhanced */}
      <div className="border-b border-border/30 bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: Session info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl border border-primary/20">
                {ROLE_INFO[session.role]?.icon}
              </div>
              <div>
                <h1 className="font-semibold text-lg">
                  {ROLE_INFO[session.role]?.labelVi}
                  <span className="text-muted-foreground font-normal"> • </span>
                  <span className="text-primary">{LEVEL_INFO[session.level]?.labelVi}</span>
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">Câu {session.current_question_index + 1}/{session.total_questions}</span>
                  <Progress value={progress} className="w-32 h-2" />
                </div>
              </div>
            </div>

            {/* Center: Timer */}
            {session.status === 'in_progress' && (
              <div className="flex-shrink-0">
                <TimerDisplay
                  formattedTime={questionTimer.formattedTime}
                  isWarning={questionTimer.isWarning}
                  isDanger={questionTimer.isDanger}
                  label="Còn lại"
                />
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* AI Coach Toggle */}
              {session.status === 'in_progress' && (
                <Button
                  variant={coachEnabled ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCoachEnabled(prev => !prev)}
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    coachEnabled && "bg-amber-500/10 border border-amber-500/20"
                  )}
                  title={coachEnabled ? 'Tắt AI Coach' : 'Bật AI Coach'}
                >
                  <Sparkles className={cn(
                    "h-4 w-4",
                    coachEnabled ? "text-amber-500" : "text-muted-foreground"
                  )} />
                </Button>
              )}
              {/* TTS Toggle */}
              {session.status === 'in_progress' && (
                <Button
                  variant={ttsEnabled ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (ttsEnabled) {
                      // Turning OFF - stop speech first
                      stop();
                    }
                    setTtsEnabled(prev => !prev);
                  }}
                  className={cn(
                    "gap-2 rounded-lg transition-all",
                    ttsEnabled && "bg-primary/10 border border-primary/20"
                  )}
                  title={ttsEnabled ? 'Tắt giọng nói AI' : 'Bật giọng nói AI'}
                >
                  {isSpeaking ? (
                    <Volume2 className="h-4 w-4 animate-pulse text-primary" />
                  ) : ttsEnabled ? (
                    <Volume2 className="h-4 w-4 text-primary" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              )}
              {session.focus_tags && session.focus_tags.length > 0 && (
                <div className="hidden md:flex gap-1.5">
                  {session.focus_tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-secondary/50 border border-border/50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {session.status === 'in_progress' && (
                <EndInterviewButton onClick={handleEnd} disabled={isAiThinking} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Chat/Feedback tabs on mobile, side-by-side on desktop */}
        <div className="flex-1 flex flex-col min-h-0 max-h-full">
          {/* Mobile tabs */}
          <div className="md:hidden mb-4 flex-shrink-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'feedback')}>
              <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-primary/10">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="feedback" className="gap-2 data-[state=active]:bg-primary/10">
                  <BarChart3 className="h-4 w-4" />
                  Feedback ({answers.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Chat area - Compact with fixed height */}
          <Card className={cn(
            "flex flex-col overflow-hidden",
            "bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl",
            "border border-border/30 shadow-xl",
            "h-[500px] md:h-[calc(100vh-220px)]",
            activeTab !== 'chat' && "hidden md:flex"
          )}>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {session.status === 'setup' ? (
                /* Setup state - show interview info and rules */
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  {/* Interview Room Info */}
                  <div className="w-full max-w-lg mb-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-3xl border border-primary/20">
                          {ROLE_INFO[session.role]?.icon}
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        Phỏng vấn {ROLE_INFO[session.role]?.labelVi}
                      </h2>
                      <p className="text-primary font-medium mb-3">
                        Cấp độ: {LEVEL_INFO[session.level]?.labelVi} ({LEVEL_INFO[session.level]?.years})
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{session.total_questions} câu hỏi</Badge>
                        <Badge variant="secondary">90 giây/câu</Badge>
                        <Badge variant="secondary">{session.mode === 'behavioral' ? 'Hành vi' : session.mode === 'technical' ? 'Kỹ thuật' : 'Kết hợp'}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Rules & Warnings */}
                  <div className="w-full max-w-lg mb-6">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <h3 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5" />
                        Lưu ý quan trọng
                      </h3>
                      <ul className="text-sm text-left space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Không được chuyển tab</strong> hoặc thu nhỏ cửa sổ trong khi phỏng vấn</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Copy/Paste bị vô hiệu hóa</strong> để đảm bảo tính công bằng</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span><strong>3 lần vi phạm</strong> sẽ tự động hủy phiên phỏng vấn</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>Mỗi câu hỏi có <strong>90 giây</strong> để trả lời, hết giờ sẽ tự động chuyển câu</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="w-full max-w-lg mb-6">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <h3 className="font-semibold text-primary flex items-center justify-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5" />
                        Mẹo phỏng vấn
                      </h3>
                      <ul className="text-sm text-left space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Trả lời theo cấu trúc <strong>STAR</strong> (Situation, Task, Action, Result)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Đưa ra <strong>ví dụ cụ thể</strong> từ kinh nghiệm thực tế</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Giữ câu trả lời <strong>ngắn gọn, súc tích</strong> (1-2 phút)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Start Button */}
                  <Button 
                    size="lg" 
                    onClick={handleStart}
                    disabled={isAiThinking}
                    className="h-14 px-10 text-lg bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 shadow-lg"
                  >
                    {isAiThinking ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang chuẩn bị...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Tôi đã sẵn sàng - Bắt đầu phỏng vấn
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Nhấn nút để bắt đầu, HR sẽ chào và hỏi câu đầu tiên
                  </p>
                </div>
              ) : (
                /* In progress - show messages */
                <>
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isLatest={index === messages.length - 1}
                    />
                  ))}
                  {isAiThinking && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Input area - Enhanced */}
            {session.status === 'in_progress' && (
              <div className="border-t border-border/30 p-4 bg-gradient-to-t from-card/60 to-transparent">
                {/* Input mode toggle */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 backdrop-blur-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputMode('text')}
                      className={cn(
                        "gap-2 rounded-md transition-all",
                        inputMode === 'text' && "bg-primary/20 text-primary"
                      )}
                    >
                      <Keyboard className="h-4 w-4" />
                      Text
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputMode('voice')}
                      className={cn(
                        "gap-2 rounded-md transition-all",
                        inputMode === 'voice' && "bg-primary/20 text-primary"
                      )}
                    >
                      <Mic className="h-4 w-4" />
                      Voice
                    </Button>
                  </div>
                </div>

                {inputMode === 'text' ? (
                  <ChatInput
                    onSubmit={(text) => {
                      setCurrentAnswer('');
                      handleSubmitAnswer(text);
                    }}
                    onChange={setCurrentAnswer}
                    disabled={isAiThinking}
                    placeholder="Nhập câu trả lời của bạn..."
                  />
                ) : (
                  <VoiceInput
                    onTranscript={(text) => {
                      setCurrentAnswer('');
                      handleSubmitAnswer(text);
                    }}
                    disabled={isAiThinking}
                    language={session.language}
                  />
                )}

                {/* AI Coach Tips */}
                {coachEnabled && messages.length > 0 && (
                  <div className="mt-3">
                    <AICoachTips
                      currentQuestion={messages.filter(m => m.role === 'interviewer').pop()?.content || ''}
                      currentAnswer={currentAnswer}
                      role={session.role}
                      questionType={session.mode as 'behavioral' | 'technical' | 'mixed'}
                      timeRemaining={questionTimer.seconds}
                      isVisible={!isAiThinking && currentAnswer.length > 0}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Feedback sidebar - Independent scroll */}
        <div className={cn(
          "md:w-80 lg:w-96 flex flex-col",
          "h-[400px] md:h-[calc(100vh-220px)]",
          activeTab !== 'feedback' && "hidden md:flex"
        )}>
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold">Feedback theo câu</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {answers.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground">
                    Feedback sẽ hiển thị sau mỗi câu trả lời
                  </p>
                </CardContent>
              </Card>
            ) : (
              answers.map((answer, index) => (
                <FeedbackCard
                  key={answer.id}
                  answer={answer}
                  questionNumber={index + 1}
                  defaultExpanded={index === answers.length - 1}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Violation Warning Dialog */}
      <AlertDialog open={showViolationWarning} onOpenChange={setShowViolationWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Cảnh báo vi phạm!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Bạn đã rời khỏi phòng phỏng vấn. Đây là lần vi phạm thứ{' '}
                <span className="font-bold text-destructive">{violations}/{MAX_VIOLATIONS}</span>.
              </p>
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {violations >= MAX_VIOLATIONS - 1 
                    ? 'Lần vi phạm tiếp theo sẽ tự động hủy phỏng vấn!'
                    : `Còn ${MAX_VIOLATIONS - violations} lần cảnh báo trước khi bị hủy.`
                  }
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Vui lòng không chuyển tab, thu nhỏ cửa sổ, hoặc click ra ngoài trong khi phỏng vấn.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowViolationWarning(false)} className="w-full">
              Tôi hiểu, tiếp tục phỏng vấn
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Violation Counter Badge - Show during interview */}
      {session.status === 'in_progress' && violations > 0 && (
        <div className="fixed bottom-4 left-4 z-50">
          <Badge variant="destructive" className="gap-1 px-3 py-1.5 text-sm">
            <AlertTriangle className="h-3.5 w-3.5" />
            Vi phạm: {violations}/{MAX_VIOLATIONS}
          </Badge>
        </div>
      )}
    </div>
  );
}
