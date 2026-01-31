-- Bookmarked questions table
CREATE TABLE IF NOT EXISTS bookmarked_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_id UUID REFERENCES interview_answers(id) ON DELETE SET NULL,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE SET NULL,
  role TEXT,
  level TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notes table
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES interview_answers(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview templates table
CREATE TABLE IF NOT EXISTS interview_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  level TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'mixed',
  language TEXT NOT NULL DEFAULT 'vi',
  question_count INTEGER DEFAULT 5,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_user ON bookmarked_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_session ON user_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_templates_user ON interview_templates(user_id);

-- RLS policies
ALTER TABLE bookmarked_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks" ON bookmarked_questions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes" ON user_notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own templates" ON interview_templates
  FOR ALL USING (auth.uid() = user_id);
