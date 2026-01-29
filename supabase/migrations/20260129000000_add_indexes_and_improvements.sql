-- ===========================================
-- PERFORMANCE INDEXES
-- ===========================================

-- Interview messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_session_created 
  ON public.interview_messages(session_id, created_at);

-- Interview answers indexes  
CREATE INDEX IF NOT EXISTS idx_answers_session_index 
  ON public.interview_answers(session_id, question_index);

-- User gamification indexes
CREATE INDEX IF NOT EXISTS idx_gamification_user 
  ON public.user_gamification(user_id);

-- User badges indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_earned 
  ON public.user_badges(user_id, earned_at DESC);

-- Daily challenges indexes
CREATE INDEX IF NOT EXISTS idx_challenges_date 
  ON public.daily_challenges(challenge_date);

-- Sessions by status for cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_status_created 
  ON public.interview_sessions(status, created_at);

-- ===========================================
-- ADDITIONAL CONSTRAINTS
-- ===========================================

-- Ensure total_questions is reasonable
ALTER TABLE public.interview_sessions 
  DROP CONSTRAINT IF EXISTS check_total_questions;
ALTER TABLE public.interview_sessions 
  ADD CONSTRAINT check_total_questions 
  CHECK (total_questions > 0 AND total_questions <= 50);

-- Ensure current_question_index is valid
ALTER TABLE public.interview_sessions 
  DROP CONSTRAINT IF EXISTS check_question_index;
ALTER TABLE public.interview_sessions 
  ADD CONSTRAINT check_question_index 
  CHECK (current_question_index >= 0);

-- ===========================================
-- SOFT DELETE SUPPORT
-- ===========================================

-- Add deleted_at column to sessions
ALTER TABLE public.interview_sessions 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Update RLS to exclude soft-deleted records
DROP POLICY IF EXISTS "Users can view own sessions" ON public.interview_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- ===========================================
-- AUDIT LOG TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_user_created 
  ON public.audit_log(user_id, created_at DESC);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log (users can't see it)
CREATE POLICY "Audit log is admin only"
  ON public.audit_log FOR SELECT
  USING (false);

-- ===========================================
-- CLEANUP FUNCTION FOR OLD SESSIONS
-- ===========================================

CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  -- Soft delete abandoned sessions older than 7 days
  UPDATE public.interview_sessions
  SET deleted_at = now()
  WHERE status = 'abandoned' 
    AND created_at < now() - interval '7 days'
    AND deleted_at IS NULL;
    
  -- Soft delete setup sessions older than 1 day
  UPDATE public.interview_sessions
  SET deleted_at = now()
  WHERE status = 'setup' 
    AND created_at < now() - interval '1 day'
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
