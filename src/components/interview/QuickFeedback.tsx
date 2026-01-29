import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface QuickFeedbackProps {
  sessionId: string;
  questionIndex: number;
}

export function QuickFeedback({ sessionId, questionIndex }: QuickFeedbackProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async (type: 'good' | 'bad') => {
    if (!user) return;
    
    setRating(type);
    
    try {
      await supabase.from('user_feedback').insert({
        user_id: user.id,
        session_id: sessionId,
        question_index: questionIndex,
        rating: type,
        comment: comment || null,
      });
      
      setSubmitted(true);
      toast({ title: 'Cảm ơn phản hồi của bạn!' });
    } catch {
      // Table might not exist, ignore
    }
  };

  const submitComment = async () => {
    if (!rating || !comment.trim()) return;
    
    try {
      await supabase.from('user_feedback').update({
        comment,
      }).match({
        session_id: sessionId,
        question_index: questionIndex,
      });
      
      setShowComment(false);
      toast({ title: 'Đã gửi góp ý!' });
    } catch {
      // Ignore
    }
  };

  if (submitted && !showComment) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Đã gửi phản hồi</span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowComment(true)}
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Thêm góp ý
        </Button>
      </div>
    );
  }

  if (showComment) {
    return (
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Textarea
            placeholder="Góp ý thêm về câu hỏi hoặc đánh giá..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={submitComment}>Gửi</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowComment(false)}>Huỷ</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Câu hỏi này thế nào?</span>
      <Button
        variant={rating === 'good' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => submitFeedback('good')}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant={rating === 'bad' ? 'destructive' : 'ghost'}
        size="sm"
        onClick={() => submitFeedback('bad')}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
