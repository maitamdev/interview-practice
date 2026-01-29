import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Building2, Filter, Star, 
  ChevronRight, BookOpen, Sparkles
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { 
  COMPANY_QUESTIONS, 
  COMPANIES, 
  CompanyQuestion,
  getQuestionsByCompany 
} from '@/data/companyQuestions';

const DIFFICULTY_LABELS = ['', 'Dễ', 'Cơ bản', 'Trung bình', 'Khó', 'Rất khó'];
const DIFFICULTY_COLORS = ['', 'text-green-500', 'text-blue-500', 'text-yellow-500', 'text-orange-500', 'text-red-500'];

export default function QuestionBank() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredQuestions = COMPANY_QUESTIONS.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCompany = !selectedCompany || q.company === selectedCompany;
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    return matchesSearch && matchesCompany && matchesCategory;
  });

  const QuestionCard = ({ question }: { question: CompanyQuestion }) => (
    <Card className="hover:border-primary/50 transition-all cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{question.companyLogo}</span>
            <div>
              <span className="font-medium">{question.company}</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{question.role}</Badge>
                <Badge variant="secondary" className="text-xs">{question.level}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(question.difficulty)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 fill-current ${DIFFICULTY_COLORS[question.difficulty]}`} />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed mb-3 group-hover:text-primary transition-colors">
          {question.question}
        </p>
        <div className="flex flex-wrap gap-1">
          {question.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs bg-muted/50">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Ngân hàng câu hỏi</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Câu hỏi từ các công ty hàng đầu</h1>
          <p className="text-xl text-muted-foreground">
            {COMPANY_QUESTIONS.length}+ câu hỏi thực tế từ Google, Meta, VNG, FPT...
          </p>
        </div>

        {/* Company filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Lọc theo công ty
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCompany === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCompany(null)}
            >
              Tất cả
            </Button>
            {COMPANIES.map(company => (
              <Button
                key={company.name}
                variant={selectedCompany === company.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCompany(company.name)}
              >
                <span className="mr-1">{company.logo}</span>
                {company.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Search and category tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm câu hỏi, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="system-design">System Design</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory}>
            <div className="grid gap-4">
              {filteredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Không tìm thấy câu hỏi phù hợp</p>
                    <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </CardContent>
                </Card>
              ) : (
                filteredQuestions.map(q => (
                  <QuestionCard key={q.id} question={q} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{COMPANY_QUESTIONS.length}</div>
              <div className="text-sm text-muted-foreground">Tổng câu hỏi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{COMPANIES.length}</div>
              <div className="text-sm text-muted-foreground">Công ty</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {COMPANY_QUESTIONS.filter(q => q.category === 'system-design').length}
              </div>
              <div className="text-sm text-muted-foreground">System Design</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {COMPANY_QUESTIONS.filter(q => q.difficulty >= 4).length}
              </div>
              <div className="text-sm text-muted-foreground">Câu hỏi khó</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
