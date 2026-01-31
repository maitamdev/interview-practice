import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResumeData {
  name?: string;
  email?: string;
  skills: string[];
  experience: { title: string; company: string; duration: string; highlights: string[] }[];
  education: { degree: string; school: string; year: string }[];
  projects: { name: string; description: string; tech: string[] }[];
  suggestedQuestions: string[];
}

interface ResumeScannerProps {
  onQuestionsGenerated?: (questions: string[]) => void;
  onSkillsExtracted?: (skills: string[]) => void;
}

export function ResumeScanner({ onQuestionsGenerated, onSkillsExtracted }: ResumeScannerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeResume = useCallback(async () => {
    if (!resumeText.trim()) {
      setError('Vui lòng nhập nội dung CV');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Call edge function to analyze resume
      const { data, error: fnError } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText },
      });

      clearInterval(progressInterval);

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Không thể kết nối đến server');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const parsed = data as ResumeData;
      setResumeData(parsed);
      setProgress(100);

      // Callbacks
      if (parsed.suggestedQuestions && onQuestionsGenerated) {
        onQuestionsGenerated(parsed.suggestedQuestions);
      }
      if (parsed.skills && onSkillsExtracted) {
        onSkillsExtracted(parsed.skills);
      }

      toast({
        title: 'Phân tích thành công!',
        description: `Đã tìm thấy ${parsed.skills.length} kỹ năng và tạo ${parsed.suggestedQuestions.length} câu hỏi`,
      });

    } catch (err) {
      console.error('Resume analysis error:', err);
      setError('Có lỗi khi phân tích CV. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, onQuestionsGenerated, onSkillsExtracted, toast]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      toast({
        title: 'Định dạng không hỗ trợ',
        description: 'Vui lòng upload file .txt hoặc copy-paste nội dung CV',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target?.result as string);
    };
    reader.readAsText(file);
  }, [toast]);

  const reset = () => {
    setResumeText('');
    setResumeData(null);
    setError(null);
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Scan CV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Resume Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!resumeData ? (
            <>
              {/* Upload area */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload file .txt hoặc paste nội dung CV bên dưới
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <span>Chọn file</span>
                  </Button>
                </label>
              </div>

              {/* Text input */}
              <div>
                <Textarea
                  placeholder="Paste nội dung CV của bạn vào đây...&#10;&#10;Ví dụ:&#10;Nguyễn Văn A&#10;Frontend Developer&#10;&#10;Kinh nghiệm:&#10;- 2 năm làm việc với React, TypeScript&#10;- Dự án e-commerce với 10k users&#10;&#10;Kỹ năng: React, TypeScript, Node.js, PostgreSQL"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Progress */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Đang phân tích CV...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={analyzeResume}
                  disabled={isAnalyzing || !resumeText.trim()}
                  className="flex-1 gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Phân tích CV
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Results */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Success header */}
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="font-semibold">Phân tích thành công!</p>
                  <p className="text-sm text-muted-foreground">
                    {resumeData.name && `Ứng viên: ${resumeData.name}`}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset} className="ml-auto">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Kỹ năng ({resumeData.skills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Kinh nghiệm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} className="border-l-2 border-primary/30 pl-3">
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Suggested Questions */}
              {resumeData.suggestedQuestions.length > 0 && (
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-primary">
                      <Target className="h-4 w-4" />
                      Câu hỏi gợi ý từ CV
                    </CardTitle>
                    <CardDescription>
                      AI đã tạo {resumeData.suggestedQuestions.length} câu hỏi dựa trên CV của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {resumeData.suggestedQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary font-medium">{i + 1}.</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="flex-1">
                  Scan CV khác
                </Button>
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  Áp dụng
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
