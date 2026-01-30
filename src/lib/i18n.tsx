import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Language = 'vi' | 'en';

interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

const translations: Translations = {
  // Navbar
  'nav.newInterview': { vi: 'Phỏng vấn mới', en: 'New Interview' },
  'nav.dailyChallenge': { vi: 'Thử thách', en: 'Challenge' },
  'nav.questionBank': { vi: 'Ngân hàng câu hỏi', en: 'Question Bank' },
  'nav.learningPath': { vi: 'Lộ trình học', en: 'Learning Path' },
  'nav.statistics': { vi: 'Thống kê', en: 'Statistics' },
  'nav.leaderboard': { vi: 'Xếp hạng', en: 'Leaderboard' },
  'nav.profile': { vi: 'Hồ sơ', en: 'Profile' },
  'nav.dashboard': { vi: 'Dashboard', en: 'Dashboard' },
  'nav.logout': { vi: 'Đăng xuất', en: 'Logout' },
  'nav.login': { vi: 'Đăng nhập', en: 'Login' },

  // Common
  'common.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'common.save': { vi: 'Lưu', en: 'Save' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.delete': { vi: 'Xóa', en: 'Delete' },
  'common.edit': { vi: 'Sửa', en: 'Edit' },
  'common.back': { vi: 'Quay lại', en: 'Back' },
  'common.next': { vi: 'Tiếp theo', en: 'Next' },
  'common.submit': { vi: 'Gửi', en: 'Submit' },
  'common.search': { vi: 'Tìm kiếm', en: 'Search' },
  'common.filter': { vi: 'Lọc', en: 'Filter' },
  'common.all': { vi: 'Tất cả', en: 'All' },
  'common.noData': { vi: 'Chưa có dữ liệu', en: 'No data' },

  // Auth
  'auth.login': { vi: 'Đăng nhập', en: 'Login' },
  'auth.register': { vi: 'Đăng ký', en: 'Register' },
  'auth.email': { vi: 'Email', en: 'Email' },
  'auth.password': { vi: 'Mật khẩu', en: 'Password' },
  'auth.forgotPassword': { vi: 'Quên mật khẩu?', en: 'Forgot password?' },
  'auth.noAccount': { vi: 'Chưa có tài khoản?', en: "Don't have an account?" },
  'auth.hasAccount': { vi: 'Đã có tài khoản?', en: 'Already have an account?' },

  // Interview
  'interview.start': { vi: 'Bắt đầu phỏng vấn', en: 'Start Interview' },
  'interview.end': { vi: 'Kết thúc', en: 'End' },
  'interview.question': { vi: 'Câu hỏi', en: 'Question' },
  'interview.answer': { vi: 'Câu trả lời', en: 'Answer' },
  'interview.feedback': { vi: 'Nhận xét', en: 'Feedback' },
  'interview.score': { vi: 'Điểm', en: 'Score' },
  'interview.timeLeft': { vi: 'Còn lại', en: 'Time left' },
  'interview.ready': { vi: 'Tôi đã sẵn sàng', en: "I'm ready" },
  'interview.preparing': { vi: 'Đang chuẩn bị...', en: 'Preparing...' },
  'interview.enterAnswer': { vi: 'Nhập câu trả lời của bạn...', en: 'Enter your answer...' },
  'interview.tryAgain': { vi: 'Phỏng vấn lại', en: 'Try Again' },
  'interview.share': { vi: 'Chia sẻ', en: 'Share' },
  'interview.exportPdf': { vi: 'Xuất PDF', en: 'Export PDF' },

  // Interview Setup
  'setup.title': { vi: 'Thiết lập phỏng vấn', en: 'Interview Setup' },
  'setup.selectRole': { vi: 'Chọn vị trí', en: 'Select Role' },
  'setup.selectLevel': { vi: 'Chọn cấp độ', en: 'Select Level' },
  'setup.selectMode': { vi: 'Chọn chế độ', en: 'Select Mode' },
  'setup.questions': { vi: 'câu hỏi', en: 'questions' },

  // Roles
  'role.frontend': { vi: 'Frontend Developer', en: 'Frontend Developer' },
  'role.backend': { vi: 'Backend Developer', en: 'Backend Developer' },
  'role.fullstack': { vi: 'Fullstack Developer', en: 'Fullstack Developer' },
  'role.marketing': { vi: 'Marketing', en: 'Marketing' },
  'role.product_manager': { vi: 'Product Manager', en: 'Product Manager' },
  'role.data_analyst': { vi: 'Data Analyst', en: 'Data Analyst' },

  // Levels
  'level.junior': { vi: 'Junior', en: 'Junior' },
  'level.mid': { vi: 'Mid-level', en: 'Mid-level' },
  'level.senior': { vi: 'Senior', en: 'Senior' },

  // Report
  'report.title': { vi: 'Báo cáo phỏng vấn', en: 'Interview Report' },
  'report.overallScore': { vi: 'Điểm tổng thể', en: 'Overall Score' },
  'report.strengths': { vi: 'Điểm mạnh', en: 'Strengths' },
  'report.weaknesses': { vi: 'Cần cải thiện', en: 'Areas to Improve' },
  'report.skillAnalysis': { vi: 'Phân tích kỹ năng', en: 'Skill Analysis' },
  'report.improvementPlan': { vi: 'Kế hoạch cải thiện 7 ngày', en: '7-Day Improvement Plan' },
  'report.detailedQuestions': { vi: 'Chi tiết từng câu hỏi', en: 'Question Details' },
  'report.backToDashboard': { vi: 'Về Dashboard', en: 'Back to Dashboard' },

  // Dashboard
  'dashboard.welcome': { vi: 'Chào mừng trở lại', en: 'Welcome back' },
  'dashboard.totalInterviews': { vi: 'Tổng phỏng vấn', en: 'Total Interviews' },
  'dashboard.avgScore': { vi: 'Điểm trung bình', en: 'Average Score' },
  'dashboard.streak': { vi: 'Streak', en: 'Streak' },
  'dashboard.recentHistory': { vi: 'Lịch sử gần đây', en: 'Recent History' },

  // Statistics
  'stats.title': { vi: 'Thống kê chi tiết', en: 'Detailed Statistics' },
  'stats.progress': { vi: 'Tiến bộ của bạn', en: 'Your Progress' },
  'stats.7days': { vi: '7 ngày', en: '7 days' },
  'stats.30days': { vi: '30 ngày', en: '30 days' },
  'stats.allTime': { vi: 'Tất cả', en: 'All time' },
  'stats.scoreOverTime': { vi: 'Điểm số theo thời gian', en: 'Score Over Time' },
  'stats.roleDistribution': { vi: 'Phân bố theo vị trí', en: 'Role Distribution' },
  'stats.monthlyTrend': { vi: 'Xu hướng theo tháng', en: 'Monthly Trend' },
  'stats.highestScore': { vi: 'Điểm cao nhất', en: 'Highest Score' },

  // Daily Challenge
  'challenge.title': { vi: 'Thử thách hàng ngày', en: 'Daily Challenge' },
  'challenge.streak': { vi: 'ngày liên tiếp', en: 'day streak' },
  'challenge.completed': { vi: 'Đã hoàn thành!', en: 'Completed!' },
  'challenge.points': { vi: 'điểm', en: 'points' },
  'challenge.yourAnswer': { vi: 'Câu trả lời của bạn', en: 'Your Answer' },
  'challenge.sampleAnswer': { vi: 'Câu trả lời mẫu', en: 'Sample Answer' },
  'challenge.hints': { vi: 'Gợi ý', en: 'Hints' },
  'challenge.submitAnswer': { vi: 'Gửi câu trả lời', en: 'Submit Answer' },
  'challenge.scoring': { vi: 'Đang chấm điểm...', en: 'Scoring...' },
  'challenge.minChars': { vi: 'Tối thiểu 50 ký tự', en: 'Minimum 50 characters' },
  'challenge.practiceMore': { vi: 'Luyện tập thêm', en: 'Practice More' },
  'challenge.comeBackTomorrow': { vi: 'Quay lại vào ngày mai để tiếp tục streak!', en: 'Come back tomorrow to continue your streak!' },

  // Learning Path
  'learning.title': { vi: 'Lộ trình học tập', en: 'Learning Path' },
  'learning.roadmap': { vi: 'Lộ trình', en: 'Roadmap' },
  'learning.progress': { vi: 'Tiến độ', en: 'Progress' },
  'learning.completed': { vi: 'Hoàn thành', en: 'Completed' },
  'learning.inProgress': { vi: 'Đang học', en: 'In Progress' },
  'learning.notStarted': { vi: 'Chưa bắt đầu', en: 'Not Started' },
  'learning.searchYoutube': { vi: 'Tìm trên YouTube', en: 'Search YouTube' },
  'learning.searchGoogle': { vi: 'Tìm trên Google', en: 'Search Google' },

  // Leaderboard
  'leaderboard.title': { vi: 'Bảng xếp hạng', en: 'Leaderboard' },
  'leaderboard.rank': { vi: 'Hạng', en: 'Rank' },
  'leaderboard.user': { vi: 'Người dùng', en: 'User' },
  'leaderboard.interviews': { vi: 'Phỏng vấn', en: 'Interviews' },

  // Share
  'share.title': { vi: 'Chia sẻ kết quả', en: 'Share Result' },
  'share.description': { vi: 'Chia sẻ thành tích phỏng vấn của bạn lên mạng xã hội', en: 'Share your interview achievement on social media' },
  'share.copied': { vi: 'Đã copy!', en: 'Copied!' },
  'share.linkCopied': { vi: 'Link đã được copy vào clipboard', en: 'Link copied to clipboard' },

  // Settings
  'settings.language': { vi: 'Ngôn ngữ', en: 'Language' },
  'settings.theme': { vi: 'Giao diện', en: 'Theme' },
  'settings.voice': { vi: 'Giọng nói', en: 'Voice' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    // Load language from localStorage or user preferences
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Save to user preferences if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase.from('user_preferences' as any).upsert({
        user_id: user.id,
        language: lang,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }) as any);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Language selector component
export function LanguageSelector() {
  const { language, setLanguage } = useI18n();
  
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
      <button
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'vi' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted'
        }`}
      >
        🇻🇳 VI
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'en' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted'
        }`}
      >
        🇺🇸 EN
      </button>
    </div>
  );
}
