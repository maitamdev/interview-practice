-- ===========================================
-- AI INTERVIEW COACH - DATABASE SCHEMA
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE public.interview_role AS ENUM (
  'frontend', 'backend', 'fullstack', 'data', 'qa', 'ba', 'devops', 'mobile'
);

CREATE TYPE public.interview_level AS ENUM (
  'intern', 'junior', 'mid', 'senior'
);

CREATE TYPE public.interview_mode AS ENUM (
  'behavioral', 'technical', 'mixed'
);

CREATE TYPE public.interview_language AS ENUM (
  'vi', 'en'
);

CREATE TYPE public.session_status AS ENUM (
  'setup', 'in_progress', 'completed', 'abandoned'
);

CREATE TYPE public.message_role AS ENUM (
  'interviewer', 'candidate', 'system'
);

-- ===========================================
-- PROFILES TABLE
-- ===========================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  target_role interview_role DEFAULT 'frontend',
  target_level interview_level DEFAULT 'junior',
  preferred_language interview_language DEFAULT 'vi',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ===========================================
-- INTERVIEW SESSIONS TABLE
-- ===========================================

CREATE TABLE public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role interview_role NOT NULL,
  level interview_level NOT NULL,
  mode interview_mode NOT NULL DEFAULT 'mixed',
  language interview_language NOT NULL DEFAULT 'vi',
  jd_text TEXT,
  status session_status NOT NULL DEFAULT 'setup',
  total_questions INTEGER DEFAULT 10,
  current_question_index INTEGER DEFAULT 0,
  difficulty_score INTEGER DEFAULT 3 CHECK (difficulty_score >= 1 AND difficulty_score <= 5),
  focus_tags TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view own sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.interview_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- INTERVIEW MESSAGES TABLE (chat history)
-- ===========================================

CREATE TABLE public.interview_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  question_index INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;

-- Messages policies (via session ownership)
CREATE POLICY "Users can view messages of own sessions"
  ON public.interview_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions 
      WHERE id = interview_messages.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own sessions"
  ON public.interview_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions 
      WHERE id = interview_messages.session_id 
      AND user_id = auth.uid()
    )
  );

-- ===========================================
-- INTERVIEW ANSWERS TABLE (with scores)
-- ===========================================

CREATE TABLE public.interview_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  scores JSONB DEFAULT '{}'::jsonb,
  feedback JSONB DEFAULT '{}'::jsonb,
  improved_answer TEXT,
  time_taken_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

-- Answers policies (via session ownership)
CREATE POLICY "Users can view answers of own sessions"
  ON public.interview_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions 
      WHERE id = interview_answers.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers to own sessions"
  ON public.interview_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions 
      WHERE id = interview_answers.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers of own sessions"
  ON public.interview_answers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions 
      WHERE id = interview_answers.session_id 
      AND user_id = auth.uid()
    )
  );

-- ===========================================
-- SESSION SUMMARIES TABLE
-- ===========================================

CREATE TABLE public.session_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  overall_score NUMERIC(3,1),
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  improvement_plan JSONB DEFAULT '[]'::jsonb,
  skill_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_summaries ENABLE ROW LEVEL SECURITY;

-- Summaries policies (via session ownership)
CREATE POLICY "Users can view summaries of own sessions"
  ON public.session_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions 
      WHERE id = session_summaries.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert summaries to own sessions"
  ON public.session_summaries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions 
      WHERE id = session_summaries.session_id 
      AND user_id = auth.uid()
    )
  );

-- ===========================================
-- FUNCTION: Auto-create profile on signup
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- FUNCTION: Update updated_at timestamp
-- ===========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- INDEXES for performance
-- ===========================================

CREATE INDEX idx_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_sessions_status ON public.interview_sessions(status);
CREATE INDEX idx_messages_session_id ON public.interview_messages(session_id);
CREATE INDEX idx_answers_session_id ON public.interview_answers(session_id);