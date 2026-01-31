import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserNote {
  id: string;
  user_id: string;
  session_id?: string;
  answer_id?: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useNotes(sessionId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('user_notes' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await (query as any);

      if (error) throw error;
      setNotes((data || []) as UserNote[]);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async (note: {
    session_id?: string;
    answer_id?: string;
    title?: string;
    content: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase
        .from('user_notes' as any)
        .insert({
          user_id: user.id,
          ...note,
        })
        .select()
        .single() as any);

      if (error) throw error;

      const newNote = data as UserNote;
      setNotes(prev => [newNote, ...prev]);
      
      toast({ title: 'Đã lưu ghi chú' });
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({ title: 'Lỗi', description: 'Không thể lưu ghi chú', variant: 'destructive' });
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<UserNote>) => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from('user_notes' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id) as any);

      if (error) throw error;

      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from('user_notes' as any)
        .delete()
        .eq('id', id) as any);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== id));
      toast({ title: 'Đã xóa ghi chú' });
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    refresh: loadNotes,
  };
}
