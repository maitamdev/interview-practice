import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { InterviewRole, InterviewLevel, InterviewMode, InterviewLanguage } from '@/types/interview';

export interface InterviewTemplate {
  id: string;
  user_id: string;
  name: string;
  role: InterviewRole;
  level: InterviewLevel;
  mode: InterviewMode;
  language: InterviewLanguage;
  question_count: number;
  is_default: boolean;
  created_at: string;
}

export function useInterviewTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase
        .from('interview_templates' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setTemplates((data || []) as InterviewTemplate[]);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const createTemplate = async (template: Omit<InterviewTemplate, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      // If setting as default, unset other defaults first
      if (template.is_default) {
        await (supabase
          .from('interview_templates' as any)
          .update({ is_default: false })
          .eq('user_id', user.id) as any);
      }

      const { data, error } = await (supabase
        .from('interview_templates' as any)
        .insert({
          user_id: user.id,
          ...template,
        })
        .select()
        .single() as any);

      if (error) throw error;

      const newTemplate = data as InterviewTemplate;
      setTemplates(prev => [newTemplate, ...prev.map(t => 
        template.is_default ? { ...t, is_default: false } : t
      )]);
      
      toast({ title: 'Đã lưu template' });
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({ title: 'Lỗi', description: 'Không thể lưu template', variant: 'destructive' });
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from('interview_templates' as any)
        .delete()
        .eq('id', id) as any);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Đã xóa template' });
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  };

  const setDefaultTemplate = async (id: string) => {
    if (!user) return false;

    try {
      // Unset all defaults
      await (supabase
        .from('interview_templates' as any)
        .update({ is_default: false })
        .eq('user_id', user.id) as any);

      // Set new default
      const { error } = await (supabase
        .from('interview_templates' as any)
        .update({ is_default: true })
        .eq('id', id) as any);

      if (error) throw error;

      setTemplates(prev => prev.map(t => ({
        ...t,
        is_default: t.id === id,
      })));
      
      toast({ title: 'Đã đặt làm mặc định' });
      return true;
    } catch (error) {
      console.error('Error setting default template:', error);
      return false;
    }
  };

  const getDefaultTemplate = () => {
    return templates.find(t => t.is_default);
  };

  return {
    templates,
    loading,
    createTemplate,
    deleteTemplate,
    setDefaultTemplate,
    getDefaultTemplate,
    refresh: loadTemplates,
  };
}
