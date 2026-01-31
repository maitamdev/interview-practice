import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  questionText: string;
  answerId?: string;
  sessionId?: string;
  role?: string;
  level?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export function BookmarkButton({
  questionText,
  answerId,
  sessionId,
  role,
  level,
  className,
  size = 'icon',
}: BookmarkButtonProps) {
  const { isBookmarked, addBookmark, removeBookmark, getBookmarkByQuestion } = useBookmarks();
  const [loading, setLoading] = useState(false);
  
  const bookmarked = isBookmarked(questionText);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    try {
      if (bookmarked) {
        const bookmark = getBookmarkByQuestion(questionText);
        if (bookmark) {
          await removeBookmark(bookmark.id);
        }
      } else {
        await addBookmark({
          question_text: questionText,
          answer_id: answerId,
          session_id: sessionId,
          role,
          level,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "transition-colors",
        bookmarked && "text-primary",
        className
      )}
      title={bookmarked ? "Bỏ lưu" : "Lưu câu hỏi"}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
