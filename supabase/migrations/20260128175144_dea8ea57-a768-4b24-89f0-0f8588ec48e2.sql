-- Gamification tables

-- User gamification stats
CREATE TABLE public.user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  total_interviews INTEGER NOT NULL DEFAULT 0,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Badges/achievements table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  name_vi VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirement_type VARCHAR(50) NOT NULL, -- streak, interviews, score, questions
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User earned badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Daily challenges
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  title_vi VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  challenge_type VARCHAR(50) NOT NULL, -- complete_interview, score_above, answer_questions
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User challenge completions
CREATE TABLE public.user_challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- AI Coach recommendations
CREATE TABLE public.ai_coach_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type VARCHAR(50) NOT NULL, -- skill_focus, resource, practice_area
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  related_skill VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning resources
CREATE TABLE public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  resource_type VARCHAR(50) NOT NULL, -- article, video, practice, course
  difficulty VARCHAR(20) NOT NULL, -- beginner, intermediate, advanced
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_gamification
CREATE POLICY "Users can view own gamification" ON public.user_gamification
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gamification" ON public.user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification" ON public.user_gamification
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for badges (everyone can view)
CREATE POLICY "Everyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_challenges (everyone can view)
CREATE POLICY "Everyone can view daily challenges" ON public.daily_challenges
  FOR SELECT USING (true);

-- RLS Policies for user_challenge_completions
CREATE POLICY "Users can view own completions" ON public.user_challenge_completions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.user_challenge_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_coach_recommendations
CREATE POLICY "Users can view own recommendations" ON public.ai_coach_recommendations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recommendations" ON public.ai_coach_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON public.ai_coach_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning_resources (everyone can view)
CREATE POLICY "Everyone can view resources" ON public.learning_resources
  FOR SELECT USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_coach_recommendations_updated_at
  BEFORE UPDATE ON public.ai_coach_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (code, name, name_vi, description, description_vi, icon, xp_reward, requirement_type, requirement_value) VALUES
('first_interview', 'First Steps', 'Bước đầu tiên', 'Complete your first interview', 'Hoàn thành phỏng vấn đầu tiên', 'trophy', 100, 'interviews', 1),
('streak_3', 'On Fire', 'Đang cháy', '3 day streak', 'Streak 3 ngày liên tiếp', 'flame', 150, 'streak', 3),
('streak_7', 'Week Warrior', 'Chiến binh tuần', '7 day streak', 'Streak 7 ngày liên tiếp', 'zap', 300, 'streak', 7),
('streak_30', 'Monthly Master', 'Bậc thầy tháng', '30 day streak', 'Streak 30 ngày liên tiếp', 'crown', 1000, 'streak', 30),
('interviews_5', 'Getting Started', 'Bắt đầu rồi', 'Complete 5 interviews', 'Hoàn thành 5 phỏng vấn', 'target', 200, 'interviews', 5),
('interviews_10', 'Practice Makes Perfect', 'Luyện tập tạo nên hoàn hảo', 'Complete 10 interviews', 'Hoàn thành 10 phỏng vấn', 'award', 400, 'interviews', 10),
('interviews_25', 'Interview Pro', 'Pro phỏng vấn', 'Complete 25 interviews', 'Hoàn thành 25 phỏng vấn', 'star', 750, 'interviews', 25),
('score_4', 'High Achiever', 'Người đạt điểm cao', 'Score 4+ on an answer', 'Đạt 4+ điểm trong 1 câu trả lời', 'thumbs-up', 100, 'score', 4),
('score_5', 'Perfect Answer', 'Câu trả lời hoàn hảo', 'Score 5 on an answer', 'Đạt điểm 5 trong 1 câu trả lời', 'sparkles', 250, 'score', 5),
('questions_50', 'Question Master', 'Bậc thầy câu hỏi', 'Answer 50 questions', 'Trả lời 50 câu hỏi', 'message-square', 500, 'questions', 50);

-- Insert sample learning resources
INSERT INTO public.learning_resources (skill, title, description, url, resource_type, difficulty) VALUES
('communication', 'STAR Method Guide', 'Learn how to structure behavioral answers using STAR', 'https://www.themuse.com/advice/star-interview-method', 'article', 'beginner'),
('technical', 'System Design Primer', 'Comprehensive guide to system design interviews', 'https://github.com/donnemartin/system-design-primer', 'article', 'intermediate'),
('problem_solving', 'LeetCode Patterns', 'Common coding patterns for technical interviews', 'https://leetcode.com/explore/', 'practice', 'intermediate'),
('leadership', 'Leadership Principles', 'Amazon leadership principles explained', 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles', 'article', 'advanced'),
('react', 'React Interview Questions', 'Top React interview questions and answers', 'https://github.com/sudheerj/reactjs-interview-questions', 'practice', 'intermediate');