import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGamification } from './useGamification';
import { 
  InterviewSession, 
  InterviewMessage, 
  InterviewAnswer,
  SessionSetup,
  InterviewerResponse,
  EvaluatorResponse,
  AnswerScores,
  AnswerFeedback
} from '@/types/interview';
import { useToast } from '@/hooks/use-toast';
import { validateSessionSetup, sanitizeText } from '@/lib/validation';
import { withRetry } from '@/lib/retry';
import { logger } from '@/lib/logger';

interface UseInterviewReturn {
  session: InterviewSession | null;
  messages: InterviewMessage[];
  answers: InterviewAnswer[];
  isLoading: boolean;
  isAiThinking: boolean;
  error: string | null;
  createSession: (setup: SessionSetup) => Promise<string | null>;
  startInterview: () => Promise<void>;
  submitAnswer: (answerText: string, timeTaken?: number) => Promise<void>;
  endInterview: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
}

export function useInterview(): UseInterviewReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addXp, updateStreak, incrementStats, checkScoreBadge } = useGamification();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);

  // Create a new interview session
  const createSession = useCallback(async (setup: SessionSetup): Promise<string | null> => {
    if (!user) {
      setError('Vui lòng đăng nhập');
      return null;
    }

    // Validate input
    const validation = validateSessionSetup({
      role: setup.role,
      level: setup.level,
      mode: setup.mode,
      language: setup.language,
      totalQuestions: setup.totalQuestions,
      jdText: setup.jdText,
    });

    if (!validation.valid) {
      const message = validation.errors.join(', ');
      setError(message);
      toast({ title: 'Lỗi', description: message, variant: 'destructive' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('Creating interview session', { role: setup.role, level: setup.level });
      
      const { data, error: insertError } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: user.id,
          role: setup.role,
          level: setup.level,
          mode: setup.mode,
          language: setup.language,
          total_questions: setup.totalQuestions,
          jd_text: setup.jdText ? sanitizeText(setup.jdText) : null,
          status: 'setup',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      logger.info('Session created', { sessionId: data.id });
      setSession(data as InterviewSession);
      return data.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo phiên phỏng vấn';
      logger.error('Failed to create session', { error: message });
      setError(message);
      toast({ title: 'Lỗi', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Start the interview - get first question
  const startInterview = useCallback(async () => {
    if (!session) return;

    setIsAiThinking(true);
    setError(null);

    try {
      // Update session status
      await supabase
        .from('interview_sessions')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      // Call AI to get first question with retry
      const data = await withRetry(
        async () => {
          const { data, error: fnError } = await supabase.functions.invoke('interview-engine', {
            body: {
              action: 'start',
              sessionId: session.id,
              role: session.role,
              level: session.level,
              mode: session.mode,
              language: session.language,
              jdText: session.jd_text,
            },
          });
          if (fnError) throw fnError;
          return data;
        },
        { 
          maxRetries: 2, 
          onRetry: (attempt) => logger.warn('Retrying interview-engine', { attempt }) 
        }
      );

      const aiResponse = data as InterviewerResponse;
      const questionStartedAt = new Date().toISOString();

      // Save interviewer message
      const { data: msgData, error: msgError } = await supabase
        .from('interview_messages')
        .insert({
          session_id: session.id,
          role: 'interviewer',
          content: aiResponse.question,
          question_index: 0,
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Update session with question start time
      await supabase
        .from('interview_sessions')
        .update({ current_question_started_at: questionStartedAt })
        .eq('id', session.id);

      setMessages([msgData as InterviewMessage]);
      setSession(prev => prev ? {
        ...prev,
        status: 'in_progress',
        current_question_index: 0,
        difficulty_score: aiResponse.difficulty,
        focus_tags: aiResponse.focusTags,
        current_question_started_at: questionStartedAt,
      } : null);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể bắt đầu phỏng vấn';
      setError(message);
      toast({ title: 'Lỗi', description: message, variant: 'destructive' });
    } finally {
      setIsAiThinking(false);
    }
  }, [session, toast]);

  // Submit candidate's answer
  const submitAnswer = useCallback(async (answerText: string, timeTaken?: number) => {
    if (!session) return;

    // Prevent double-submit while AI is processing (can happen if user sends twice quickly)
    if (submitInFlightRef.current || isAiThinking) {
      toast({
        title: 'Đang xử lý',
        description: 'AI đang xử lý câu trả lời trước đó. Vui lòng đợi một chút.',
      });
      return;
    }
    submitInFlightRef.current = true;

    // Get current question from last interviewer message
    const lastQuestion = messages.filter(m => m.role === 'interviewer').pop();
    if (!lastQuestion) {
      toast({ 
        title: 'Lỗi', 
        description: 'Chưa có câu hỏi. Vui lòng đợi AI hoàn tất hoặc bắt đầu lại phỏng vấn.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsAiThinking(true);
    setError(null);

    try {

      // Save candidate message
      const { error: candMsgError } = await supabase
        .from('interview_messages')
        .insert({
          session_id: session.id,
          role: 'candidate',
          content: answerText,
          question_index: session.current_question_index,
        });

      if (candMsgError) throw candMsgError;

      // Add to local messages immediately
      const candidateMsg: InterviewMessage = {
        id: crypto.randomUUID(),
        session_id: session.id,
        role: 'candidate',
        content: answerText,
        question_index: session.current_question_index,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, candidateMsg]);

      // Use a stable, up-to-date conversation history for the next-question call
      const conversationHistory = [...messages, candidateMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call evaluator to score the answer
      const { data: evalData, error: evalError } = await supabase.functions.invoke('evaluate-answer', {
        body: {
          sessionId: session.id,
          question: lastQuestion.content,
          answer: answerText,
          role: session.role,
          level: session.level,
          mode: session.mode,
          language: session.language,
          questionIndex: session.current_question_index,
        },
      });

      if (evalError) throw evalError;

      const evaluation = evalData as EvaluatorResponse;

      // Save answer with scores
      const answerRecord = {
        session_id: session.id,
        question_index: session.current_question_index,
        question_text: lastQuestion.content,
        answer_text: answerText,
        scores: JSON.parse(JSON.stringify(evaluation.scores)),
        feedback: JSON.parse(JSON.stringify(evaluation.feedback)),
        improved_answer: evaluation.feedback.improved_answer,
        time_taken_seconds: timeTaken || null,
      };

      const { data: savedAnswer, error: answerError } = await supabase
        .from('interview_answers')
        .insert([answerRecord])
        .select()
        .single();

      if (answerError) throw answerError;

      const typedAnswer: InterviewAnswer = {
        ...savedAnswer,
        scores: savedAnswer.scores as unknown as AnswerScores,
        feedback: savedAnswer.feedback as unknown as AnswerFeedback,
      };
      setAnswers(prev => [...prev, typedAnswer]);

      // Gamification: Add XP for answering and check badges
      await addXp(20, 'Trả lời câu hỏi phỏng vấn');
      await incrementStats('total_questions_answered');
      if (evaluation.scores?.overall) {
        await checkScoreBadge(evaluation.scores.overall);
      }

      // Check if we should continue or end
      const nextIndex = session.current_question_index + 1;
      if (nextIndex >= session.total_questions) {
        // End interview inline
        setIsAiThinking(false);
        setIsLoading(true);
        try {
          await supabase
            .from('interview_sessions')
            .update({
              status: 'completed',
              ended_at: new Date().toISOString(),
            })
            .eq('id', session.id);
          
          await supabase.functions.invoke('session-summary', {
            body: { sessionId: session.id },
          });
          
          // Gamification: Award XP for completing interview
          await addXp(100, 'Hoàn thành phỏng vấn');
          await incrementStats('total_interviews');
          await updateStreak();
          
          setSession(prev => prev ? { ...prev, status: 'completed' } : null);
          toast({
            title: 'Hoàn thành!',
            description: 'Phiên phỏng vấn đã kết thúc. Xem báo cáo chi tiết.',
          });
        } catch (endErr) {
          console.error('End interview error:', endErr);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Get next question from AI
      const { data: nextData, error: nextError } = await supabase.functions.invoke('interview-engine', {
        body: {
          action: 'next',
          sessionId: session.id,
          role: session.role,
          level: session.level,
          mode: session.mode,
          language: session.language,
          previousAnswer: answerText,
          previousScores: evaluation.scores,
          shouldIncreaseDifficulty: evaluation.shouldIncreaseDifficulty,
          focusTags: evaluation.nextFocusTags,
          questionIndex: nextIndex,
          conversationHistory,
        },
      });

      if (nextError) throw nextError;

      const nextQuestion = nextData as InterviewerResponse;

      // Save next interviewer message
      const { data: nextMsgData, error: nextMsgError } = await supabase
        .from('interview_messages')
        .insert({
          session_id: session.id,
          role: 'interviewer',
          content: nextQuestion.question,
          question_index: nextIndex,
        })
        .select()
        .single();

      if (nextMsgError) throw nextMsgError;

      setMessages(prev => [...prev, nextMsgData as InterviewMessage]);

      // Update session state with new question start time
      const newQuestionStartedAt = new Date().toISOString();
      await supabase
        .from('interview_sessions')
        .update({
          current_question_index: nextIndex,
          difficulty_score: nextQuestion.difficulty,
          focus_tags: nextQuestion.focusTags,
          current_question_started_at: newQuestionStartedAt,
        })
        .eq('id', session.id);

      setSession(prev => prev ? {
        ...prev,
        current_question_index: nextIndex,
        difficulty_score: nextQuestion.difficulty,
        focus_tags: nextQuestion.focusTags,
        current_question_started_at: newQuestionStartedAt,
      } : null);

    } catch (err) {
      console.error('submitAnswer error:', err);
      const message = err instanceof Error ? err.message : 'Không thể gửi câu trả lời';
      setError(message);
      toast({ title: 'Lỗi', description: message, variant: 'destructive' });
    } finally {
      setIsAiThinking(false);
      submitInFlightRef.current = false;
    }
  }, [session, messages, toast, isAiThinking]);

  // End interview
  const endInterview = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);

    try {
      // Update session status
      await supabase
        .from('interview_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      // Generate summary
      await supabase.functions.invoke('session-summary', {
        body: { sessionId: session.id },
      });

      // Gamification: Award XP for completing interview
      await addXp(100, 'Hoàn thành phỏng vấn');
      await incrementStats('total_interviews');
      await updateStreak();

      setSession(prev => prev ? { ...prev, status: 'completed' } : null);

      toast({
        title: 'Hoàn thành!',
        description: 'Phiên phỏng vấn đã kết thúc. Xem báo cáo chi tiết.',
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể kết thúc phỏng vấn';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [session, toast, addXp, incrementStats, updateStreak]);

  // Load existing session
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData as InterviewSession);

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('interview_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData as InterviewMessage[]);

      // Load answers
      const { data: answersData, error: answersError } = await supabase
        .from('interview_answers')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_index', { ascending: true });

      if (answersError) throw answersError;
      setAnswers((answersData || []).map(a => ({
        ...a,
        scores: a.scores as unknown as AnswerScores,
        feedback: a.feedback as unknown as AnswerFeedback,
      })));

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải phiên phỏng vấn';
      setError(message);
      toast({ title: 'Lỗi', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    session,
    messages,
    answers,
    isLoading,
    isAiThinking,
    error,
    createSession,
    startInterview,
    submitAnswer,
    endInterview,
    loadSession,
  };
}
