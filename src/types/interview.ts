// Interview Coach Types

export type InterviewRole = 
  // Tech roles
  | 'frontend' 
  | 'backend' 
  | 'fullstack' 
  | 'data' 
  | 'qa' 
  | 'ba' 
  | 'devops' 
  | 'mobile'
  // Business roles
  | 'marketing'
  | 'sales'
  | 'hr'
  | 'finance'
  | 'product'
  | 'design'
  | 'content'
  | 'customer_service';

export type InterviewLevel = 'intern' | 'junior' | 'mid' | 'senior';

export type InterviewMode = 'behavioral' | 'technical' | 'mixed';

export type InterviewLanguage = 'vi' | 'en';

export type SessionStatus = 'setup' | 'in_progress' | 'completed' | 'abandoned';

export type MessageRole = 'interviewer' | 'candidate' | 'system';

// Database types
export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  target_role: InterviewRole;
  target_level: InterviewLevel;
  preferred_language: InterviewLanguage;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  role: InterviewRole;
  level: InterviewLevel;
  mode: InterviewMode;
  language: InterviewLanguage;
  jd_text: string | null;
  status: SessionStatus;
  total_questions: number;
  current_question_index: number;
  difficulty_score: number;
  focus_tags: string[];
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  // Timer persistence fields
  current_question_started_at: string | null;
  question_time_limit: number;
}

export interface InterviewMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  question_index: number | null;
  created_at: string;
}

export interface AnswerScores {
  relevance: number;
  structure: number;
  depth: number;
  clarity: number;
  overall: number;
}

export interface AnswerFeedback {
  evidence: string[];
  suggestions: string[];
  improved_answer: string;
}

export interface InterviewAnswer {
  id: string;
  session_id: string;
  question_index: number;
  question_text: string;
  answer_text: string;
  audio_url: string | null;
  transcript: string | null;
  scores: AnswerScores;
  feedback: AnswerFeedback;
  improved_answer: string | null;
  time_taken_seconds: number | null;
  created_at: string;
}

export interface SessionSummary {
  id: string;
  session_id: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_plan: ImprovementDay[];
  skill_breakdown: Record<string, number>;
  learning_roadmap: LearningRoadmapItem[];
  created_at: string;
}

export interface ImprovementDay {
  day: number;
  focus: string;
  tasks: string[];
}

export interface LearningRoadmapItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  skills: string[];
  resources: string[];
  estimated_hours: number;
}

// UI State types
export interface SessionSetup {
  role: InterviewRole;
  level: InterviewLevel;
  mode: InterviewMode;
  language: InterviewLanguage;
  totalQuestions: number;
  jdText?: string;
}

// AI Response types
export interface InterviewerResponse {
  question: string;
  questionType: 'opening' | 'followup' | 'new_topic' | 'clarification';
  difficulty: number;
  focusTags: string[];
  timeWarning?: boolean;
}

export interface EvaluatorResponse {
  scores: AnswerScores;
  feedback: AnswerFeedback;
  shouldIncreaseDifficulty: boolean;
  nextFocusTags: string[];
}

// Role and Level display info
export const ROLE_INFO: Record<InterviewRole, { label: string; labelVi: string; icon: string; category: 'tech' | 'business' }> = {
  // Tech roles
  frontend: { label: 'Frontend Developer', labelVi: 'Lập trình viên Frontend', icon: '🎨', category: 'tech' },
  backend: { label: 'Backend Developer', labelVi: 'Lập trình viên Backend', icon: '⚙️', category: 'tech' },
  fullstack: { label: 'Fullstack Developer', labelVi: 'Lập trình viên Fullstack', icon: '🔧', category: 'tech' },
  data: { label: 'Data Engineer/Scientist', labelVi: 'Kỹ sư/Nhà khoa học dữ liệu', icon: '📊', category: 'tech' },
  qa: { label: 'QA/Tester', labelVi: 'QA/Kiểm thử viên', icon: '🔍', category: 'tech' },
  ba: { label: 'Business Analyst', labelVi: 'Phân tích nghiệp vụ', icon: '📋', category: 'tech' },
  devops: { label: 'DevOps Engineer', labelVi: 'Kỹ sư DevOps', icon: '🚀', category: 'tech' },
  mobile: { label: 'Mobile Developer', labelVi: 'Lập trình viên Mobile', icon: '📱', category: 'tech' },
  // Business roles
  marketing: { label: 'Marketing', labelVi: 'Marketing', icon: '📢', category: 'business' },
  sales: { label: 'Sales', labelVi: 'Kinh doanh', icon: '💼', category: 'business' },
  hr: { label: 'Human Resources', labelVi: 'Nhân sự', icon: '👥', category: 'business' },
  finance: { label: 'Finance/Accounting', labelVi: 'Tài chính/Kế toán', icon: '💰', category: 'business' },
  product: { label: 'Product Manager', labelVi: 'Quản lý sản phẩm', icon: '🎯', category: 'business' },
  design: { label: 'UI/UX Designer', labelVi: 'Thiết kế UI/UX', icon: '✨', category: 'business' },
  content: { label: 'Content Creator', labelVi: 'Sáng tạo nội dung', icon: '✍️', category: 'business' },
  customer_service: { label: 'Customer Service', labelVi: 'Chăm sóc khách hàng', icon: '🎧', category: 'business' },
};

export const LEVEL_INFO: Record<InterviewLevel, { label: string; labelVi: string; years: string }> = {
  intern: { label: 'Intern', labelVi: 'Thực tập sinh', years: '0 năm' },
  junior: { label: 'Junior', labelVi: 'Junior', years: '0-2 năm' },
  mid: { label: 'Mid-level', labelVi: 'Mid-level', years: '2-5 năm' },
  senior: { label: 'Senior', labelVi: 'Senior', years: '5+ năm' },
};

export const MODE_INFO: Record<InterviewMode, { label: string; labelVi: string; description: string }> = {
  behavioral: { 
    label: 'Behavioral', 
    labelVi: 'Hành vi', 
    description: 'Tập trung vào kinh nghiệm, tình huống thực tế' 
  },
  technical: { 
    label: 'Technical', 
    labelVi: 'Kỹ thuật', 
    description: 'Câu hỏi về kiến thức chuyên môn, kỹ năng' 
  },
  mixed: { 
    label: 'Mixed', 
    labelVi: 'Kết hợp', 
    description: 'Kết hợp cả behavioral và technical' 
  },
};
