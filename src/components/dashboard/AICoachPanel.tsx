import { useAICoach } from '@/hooks/useAICoach';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Minus,
  ExternalLink,
  CheckCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SKILL_NAMES: Record<string, string> = {
  relevance: 'Liên quan',
  structure: 'Cấu trúc',
  depth: 'Chiều sâu',
  clarity: 'Rõ ràng',
};

const RESOURCE_TYPES: Record<string, { label: string; color: string }> = {
  article: { label: 'Bài viết', color: 'bg-blue-500/20 text-blue-500' },
  video: { label: 'Video', color: 'bg-red-500/20 text-red-500' },
  practice: { label: 'Thực hành', color: 'bg-green-500/20 text-green-500' },
  course: { label: 'Khóa học', color: 'bg-purple-500/20 text-purple-500' },
};

export function AICoachPanel() {
  const { 
    recommendations, 
    skillAnalysis, 
    loading, 
    getSuggestedResources,
    completeRecommendation,
    generateRecommendations 
  } = useAICoach();

  const suggestedResources = getSuggestedResources();

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Skill Analysis */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Phân tích kỹ năng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skillAnalysis.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Hoàn thành thêm phỏng vấn để xem phân tích
            </p>
          ) : (
            <div className="space-y-3">
              {skillAnalysis.map(skill => (
                <div key={skill.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {SKILL_NAMES[skill.skill] || skill.skill}
                      {skill.trend === 'improving' && (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                      {skill.trend === 'declining' && (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      {skill.trend === 'stable' && (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                      )}
                    </span>
                    <span className="font-medium">{skill.avgScore.toFixed(1)}/5</span>
                  </div>
                  <Progress 
                    value={(skill.avgScore / 5) * 100} 
                    className={cn(
                      "h-2",
                      skill.avgScore < 2.5 && "[&>div]:bg-red-500",
                      skill.avgScore >= 2.5 && skill.avgScore < 3.5 && "[&>div]:bg-yellow-500",
                      skill.avgScore >= 3.5 && "[&>div]:bg-green-500"
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Gợi ý cải thiện
            </CardTitle>
            {skillAnalysis.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={generateRecommendations}
                className="h-7 text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Cập nhật
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có gợi ý. Hoàn thành phỏng vấn để nhận gợi ý cá nhân hóa.
            </p>
          ) : (
            <div className="space-y-3">
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => completeRecommendation(rec.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  {rec.related_skill && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {SKILL_NAMES[rec.related_skill] || rec.related_skill}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Resources */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tài liệu gợi ý
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestedResources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có tài liệu phù hợp
            </p>
          ) : (
            <div className="space-y-2">
              {suggestedResources.map(resource => {
                const typeInfo = RESOURCE_TYPES[resource.resource_type] || { label: resource.resource_type, color: 'bg-muted' };
                
                return (
                  <a
                    key={resource.id}
                    href={resource.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {resource.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={cn("text-xs", typeInfo.color)}>
                            {typeInfo.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {resource.difficulty === 'beginner' ? 'Cơ bản' : 
                             resource.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                          </Badge>
                        </div>
                      </div>
                      {resource.url && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
