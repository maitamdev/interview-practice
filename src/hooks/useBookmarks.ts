import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface BookmarkedQuestion {
  id: string;
  user_id: string;
  question_text: string;
  answer_id?: string;
  session_id?: string;
  role?: string;
  level?: string;
  tags: string[];
  notes?: string;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase
        .from('bookmarked_questions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setBookmarks((data || []) as BookmarkedQuestion[]);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const addBookmark = async (question: {
    question_text: string;
    answer_id?: string;
    session_id?: string;
    role?: string;
    level?: string;
    tags?: string[];
    notes?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase
        .from('bookmarked_questions' as any)
        .insert({
          user_id: user.id,
          ...question,
          tags: question.tags || [],
        })
        .select()
        .single() as any);

      if (error) throw error;

      const newBookmark = data as BookmarkedQuestion;
      setBookmarks(prev => [newBookmark, ...prev]);
      
      toast({ title: 'Đã lưu câu hỏi' });
      return newBookmark;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({ title: 'Lỗi', description: 'Không thể lưu câu hỏi', variant: 'destructive' });
      return null;
    }
  };

  const removeBookmark = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from('bookmarked_questions' as any)
        .delete()
        .eq('id', id) as any);

      if (error) throw error;

      setBookmarks(prev => prev.filter(b => b.id !== id));
      toast({ title: 'Đã xóa bookmark' });
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  };

  const updateBookmark = async (id: string, updates: Partial<BookmarkedQuestion>) => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from('bookmarked_questions' as any)
        .update(updates)
        .eq('id', id) as any);

      if (error) throw error;

      setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      return true;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      return false;
    }
  };

  const isBookmarked = (questionText: string) => {
    return bookmarks.some(b => b.question_text === questionText);
  };

  const getBookmarkByQuestion = (questionText: string) => {
    return bookmarks.find(b => b.question_text === questionText);
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    updateBookmark,
    isBookmarked,
    getBookmarkByQuestion,
    refresh: loadBookmarks,
  };
}
