import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInterview } from '@/hooks/useInterview';
import { useInterviewTemplates, InterviewTemplate } from '@/hooks/useInterviewTemplates';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  FileText,
  Code,
  Briefcase,
  Save,
  Star,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createSession, isLoading } = useInterview();
  const { templates, createTemplate, deleteTemplate, setDefaultTemplate, getDefaultTemplate } = useInterviewTemplates();
  
  const [setup, setSetup] = useState<SessionSetup>({
    role: profile?.target_role || 'frontend',
    level: profile?.target_level || 'junior',
    mode: 'mixed',
    language: profile?.preferred_language || 'vi',
    totalQuestions: 10,
    jdText: '',
  });

  const [showJdInput, setShowJdInput] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Load default template on mount
  useEffect(() => {
    const defaultTemplate = getDefaultTemplate();
    if (defaultTemplate) {
      setSetup({
        role: defaultTemplate.role,
        level: defaultTemplate.level,
        mode: defaultTemplate.mode,
        language: defaultTemplate.language,
        totalQuestions: defaultTemplate.question_count,
        jdText: '',
      });
    }
  }, [templates]);

  const handleStart = async () => {
    const sessionId = await createSession(setup);
    if (sessionId) {
      navigate(`/interview/${sessionId}`);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    
    await createTemplate({
      name: templateName,
      role: setup.role,
      level: setup.level,
      mode: setup.mode,
      language: setup.language,
      question_count: setup.totalQuestions,
      is_default: false,
    });
    
    setSavingTemplate(false);
    setShowSaveTemplate(false);
    setTemplateName('');
  };

  const handleLoadTemplate = (template: InterviewTemplate) => {
    setSetup({
      role: template.role,
      level: template.level,
      mode: template.mode,
      language: template.language,
      totalQuestions: template.question_count,
      jdText: '',
    });
  };

  const roles = Object.entries(ROLE_INFO) as [InterviewRole, typeof ROLE_INFO[InterviewRole]][];
  const techRoles = roles.filter(([_, info]) => info.category === 'tech');
  const businessRoles = roles.filter(([_, info]) => info.category === 'business');
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
          {/* Saved Templates */}
          {templates.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Template đã lưu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all",
                        "hover:border-primary/50"
                      )}
                      onClick={() => handleLoadTemplate(template)}
                    >
                      {template.is_default && <Star className="h-3 w-3 text-primary" />}
                      <span className="text-sm">{template.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultTemplate(template.id);
                        }}
                        title="Đặt làm mặc định"
                      >
                        <Star className={cn("h-3 w-3", template.is_default && "fill-primary")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(template.id);
                        }}
                        title="Xóa"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role Selection */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Vị trí ứng tuyển</CardTitle>
              <CardDescription>Chọn vị trí bạn muốn luyện phỏng vấn</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tech" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="tech" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Công nghệ
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Kinh doanh
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="tech">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {techRoles.map(([key, info]) => (
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
                </TabsContent>
                <TabsContent value="business">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {businessRoles.map(([key, info]) => (
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
                </TabsContent>
              </Tabs>
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
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button 
              variant="outline"
              size="lg"
              onClick={() => setShowSaveTemplate(true)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Lưu template
            </Button>
            <Button 
              size="lg" 
              onClick={handleStart}
              disabled={isLoading}
              className="text-lg px-12 h-14"
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

      {/* Save Template Dialog */}
      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lưu template</DialogTitle>
            <DialogDescription>
              Lưu cấu hình này để sử dụng lại sau
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên template</Label>
              <Input
                placeholder="VD: Frontend Junior Interview"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Cấu hình: {ROLE_INFO[setup.role]?.labelVi} • {LEVEL_INFO[setup.level]?.labelVi} • {setup.totalQuestions} câu</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveTemplate} disabled={savingTemplate || !templateName.trim()}>
              {savingTemplate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
