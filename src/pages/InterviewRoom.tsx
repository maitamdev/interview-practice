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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Play, 
  MessageSquare, 
  BarChart3, 
  Mic,
  Keyboard,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ROLE_INFO, LEVEL_INFO } from '@/types/interview';
import { cn } from '@/lib/utils';

const QUESTION_TIME_LIMIT = 90; // seconds

export default function InterviewRoom() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [activeTab, setActiveTab] = useState<'chat' | 'feedback'>('chat');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const prevAiThinkingRef = useRef(false);

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
    // Don't speak if TTS is disabled - early return
    if (!ttsEnabled) {
      // Make sure to stop any ongoing speech when disabled
      stop();
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
  }, [isAiThinking, messages, ttsEnabled, speak, stop, session?.language]);

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
              {/* TTS Toggle */}
              {session.status === 'in_progress' && (
                <Button
                  variant={ttsEnabled ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTtsEnabled(prev => !prev)}
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
                /* Setup state - show start button */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Sẵn sàng phỏng vấn?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md text-base leading-relaxed">
                    AI interviewer sẽ hỏi bạn <span className="text-primary font-semibold">{session.total_questions} câu hỏi</span>. 
                    <br />Mỗi câu có <span className="text-primary font-semibold">90 giây</span> để trả lời.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleStart}
                    disabled={isAiThinking}
                    className="h-12 px-8 text-base bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 shadow-lg"
                  >
                    {isAiThinking ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang chuẩn bị...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Bắt đầu phỏng vấn
                      </>
                    )}
                  </Button>
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
                    onSubmit={handleSubmitAnswer}
                    disabled={isAiThinking}
                    placeholder="Nhập câu trả lời của bạn..."
                  />
                ) : (
                  <VoiceInput
                    onTranscript={handleSubmitAnswer}
                    disabled={isAiThinking}
                    language={session.language}
                  />
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
    </div>
  );
}
