import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInterview } from '@/hooks/useInterview';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  SessionSetup, 
  InterviewRole, 
  InterviewLevel, 
  InterviewMode, 
  InterviewLanguage,
  ROLE_INFO,
  LEVEL_INFO,
  MODE_INFO 
} from '@/types/interview';
import { 
  ArrowRight, 
  Loader2, 
  Sparkles,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createSession, isLoading } = useInterview();
  
  const [setup, setSetup] = useState<SessionSetup>({
    role: profile?.target_role || 'frontend',
    level: profile?.target_level || 'junior',
    mode: 'mixed',
    language: profile?.preferred_language || 'vi',
    totalQuestions: 10,
    jdText: '',
  });

  const [showJdInput, setShowJdInput] = useState(false);

  const handleStart = async () => {
    const sessionId = await createSession(setup);
    if (sessionId) {
      navigate(`/interview/${sessionId}`);
    }
  };

  const roles = Object.entries(ROLE_INFO) as [InterviewRole, typeof ROLE_INFO[InterviewRole]][];
  const levels = Object.entries(LEVEL_INFO) as [InterviewLevel, typeof LEVEL_INFO[InterviewLevel]][];
  const modes = Object.entries(MODE_INFO) as [InterviewMode, typeof MODE_INFO[InterviewMode]][];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Thiết lập phỏng vấn</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Tạo phiên phỏng vấn mới</h1>
          <p className="text-muted-foreground">
            Tùy chỉnh buổi phỏng vấn phù hợp với mục tiêu của bạn
          </p>
        </div>

        <div className="space-y-6">
          {/* Role Selection */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Vị trí ứng tuyển</CardTitle>
              <CardDescription>Chọn vị trí bạn muốn luyện phỏng vấn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roles.map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSetup(prev => ({ ...prev, role: key }))}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      setup.role === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="text-2xl mb-2">{info.icon}</div>
                    <div className="font-medium text-sm">{info.labelVi}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Level Selection */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Cấp độ kinh nghiệm</CardTitle>
              <CardDescription>Độ khó câu hỏi sẽ được điều chỉnh theo cấp độ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {levels.map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSetup(prev => ({ ...prev, level: key }))}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      setup.level === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="font-medium">{info.labelVi}</div>
                    <div className="text-xs text-muted-foreground mt-1">{info.years}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mode Selection */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Loại phỏng vấn</CardTitle>
              <CardDescription>Chọn loại câu hỏi bạn muốn luyện tập</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {modes.map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSetup(prev => ({ ...prev, mode: key }))}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      setup.mode === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="font-medium">{info.labelVi}</div>
                    <div className="text-xs text-muted-foreground mt-1">{info.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language & Questions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Ngôn ngữ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'vi' as InterviewLanguage, label: '🇻🇳 Tiếng Việt' },
                    { key: 'en' as InterviewLanguage, label: '🇬🇧 English' },
                  ].map((lang) => (
                    <button
                      key={lang.key}
                      onClick={() => setSetup(prev => ({ ...prev, language: lang.key }))}
                      className={cn(
                        "p-3 rounded-lg border text-center transition-all",
                        setup.language === lang.key
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Số câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 15].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSetup(prev => ({ ...prev, totalQuestions: num }))}
                      className={cn(
                        "p-3 rounded-lg border text-center font-medium transition-all",
                        setup.totalQuestions === num
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {num} câu
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* JD Input (Optional) */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Job Description (Tuỳ chọn)
                  </CardTitle>
                  <CardDescription>
                    Dán JD để AI tạo câu hỏi phù hợp hơn với vị trí thực tế
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowJdInput(!showJdInput)}
                >
                  {showJdInput ? 'Ẩn' : 'Thêm JD'}
                </Button>
              </div>
            </CardHeader>
            {showJdInput && (
              <CardContent>
                <Textarea
                  placeholder="Dán nội dung Job Description vào đây..."
                  className="min-h-[150px]"
                  value={setup.jdText}
                  onChange={(e) => setSetup(prev => ({ ...prev, jdText: e.target.value }))}
                />
              </CardContent>
            )}
          </Card>

          {/* Start Button */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              onClick={handleStart}
              disabled={isLoading}
              className="glow-primary text-lg px-12 h-14"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  Bắt đầu phỏng vấn
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
