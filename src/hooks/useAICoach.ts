import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { AnswerScores } from '@/types/interview';

export interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  priority: number;
  is_completed: boolean;
  related_skill: string | null;
  created_at: string;
}

export interface LearningResource {
  id: string;
  skill: string;
  title: string;
  description: string;
  url: string | null;
  resource_type: string;
  difficulty: string;
}

export interface SkillAnalysis {
  skill: string;
  avgScore: number;
  count: number;
  trend: 'improving' | 'stable' | 'declining';
}

export function useAICoach() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recommendations and resources
  const loadCoachData = useCallback(async () => {
    if (!user) return;

    try {
      // Load recommendations
      const { data: recs, error: recsError } = await supabase
        .from('ai_coach_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('priority', { ascending: true })
        .limit(5);
      
      if (recsError) throw recsError;
      setRecommendations(recs || []);

      // Load learning resources
      const { data: res, error: resError } = await supabase
        .from('learning_resources')
        .select('*');
      
      if (resError) throw resError;
      setResources(res || []);

      // Analyze skills from past answers
      await analyzeSkills();
    } catch (err) {
      console.error('Error loading coach data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Analyze user's skill performance
  const analyzeSkills = useCallback(async () => {
    if (!user) return;

    try {
      // Get user's sessions
      const { data: sessions } = await supabase
        .from('interview_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (!sessions || sessions.length === 0) {
        setSkillAnalysis([]);
        return;
      }

      // Get all answers with scores
      const { data: answers } = await supabase
        .from('interview_answers')
        .select('scores, created_at')
        .in('session_id', sessions.map(s => s.id))
        .order('created_at', { ascending: true });

      if (!answers) return;

      // Group by skill dimensions
      const skillMap: Record<string, number[]> = {
        relevance: [],
        structure: [],
        depth: [],
        clarity: [],
      };

      answers.forEach(answer => {
        const scores = answer.scores as unknown as AnswerScores;
        if (scores) {
          if (scores.relevance !== undefined) skillMap.relevance.push(scores.relevance);
          if (scores.structure !== undefined) skillMap.structure.push(scores.structure);
          if (scores.depth !== undefined) skillMap.depth.push(scores.depth);
          if (scores.clarity !== undefined) skillMap.clarity.push(scores.clarity);
        }
      });

      // Calculate analysis
      const analysis: SkillAnalysis[] = Object.entries(skillMap)
        .filter(([_, scores]) => scores.length > 0)
        .map(([skill, scores]) => {
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          
          // Calculate trend (compare first half vs second half)
          let trend: 'improving' | 'stable' | 'declining' = 'stable';
          if (scores.length >= 4) {
            const midpoint = Math.floor(scores.length / 2);
            const firstHalf = scores.slice(0, midpoint);
            const secondHalf = scores.slice(midpoint);
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            
            if (secondAvg - firstAvg > 0.3) trend = 'improving';
            else if (firstAvg - secondAvg > 0.3) trend = 'declining';
          }

          return { skill, avgScore, count: scores.length, trend };
        });

      setSkillAnalysis(analysis);
    } catch (err) {
      console.error('Error analyzing skills:', err);
    }
  }, [user]);

  useEffect(() => {
    loadCoachData();
  }, [loadCoachData]);

  // Generate new recommendations based on performance
  const generateRecommendations = useCallback(async () => {
    if (!user || skillAnalysis.length === 0) return;

    try {
      // Find weakest skills
      const weakSkills = skillAnalysis
        .sort((a, b) => a.avgScore - b.avgScore)
        .slice(0, 2);

      const newRecs: Omit<AIRecommendation, 'id' | 'created_at'>[] = [];

      for (const skill of weakSkills) {
        if (skill.avgScore < 3.5) {
          const skillNames: Record<string, { title: string; desc: string }> = {
            relevance: {
              title: 'Cải thiện tính liên quan',
              desc: 'Tập trung vào việc trả lời đúng trọng tâm câu hỏi. Hãy xác định yêu cầu chính trước khi trả lời.',
            },
            structure: {
              title: 'Cấu trúc câu trả lời',
              desc: 'Sử dụng phương pháp STAR (Situation, Task, Action, Result) để tổ chức câu trả lời rõ ràng.',
            },
            depth: {
              title: 'Tăng chiều sâu nội dung',
              desc: 'Đưa ra ví dụ cụ thể, số liệu và chi tiết kỹ thuật để làm phong phú câu trả lời.',
            },
            clarity: {
              title: 'Nâng cao sự rõ ràng',
              desc: 'Sử dụng ngôn ngữ đơn giản, tránh lan man và đi thẳng vào vấn đề.',
            },
          };

          const info = skillNames[skill.skill];
          if (info) {
            newRecs.push({
              user_id: user.id,
              recommendation_type: 'skill_focus',
              title: info.title,
              description: info.desc,
              priority: skill.avgScore < 2.5 ? 1 : 2,
              is_completed: false,
              related_skill: skill.skill,
            });
          }
        }
      }

      if (newRecs.length > 0) {
        // Clear old incomplete recommendations
        await supabase
          .from('ai_coach_recommendations')
          .delete()
          .eq('user_id', user.id)
          .eq('is_completed', false);

        // Insert new recommendations
        const { data, error } = await supabase
          .from('ai_coach_recommendations')
          .insert(newRecs)
          .select();

        if (error) throw error;
        setRecommendations(data || []);
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
    }
  }, [user, skillAnalysis]);

  // Complete a recommendation
  const completeRecommendation = useCallback(async (recId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_coach_recommendations')
        .update({ is_completed: true })
        .eq('id', recId)
        .eq('user_id', user.id);

      if (error) throw error;
      setRecommendations(prev => prev.filter(r => r.id !== recId));
    } catch (err) {
      console.error('Error completing recommendation:', err);
    }
  }, [user]);

  // Get resources for a specific skill
  const getResourcesForSkill = useCallback((skill: string) => {
    return resources.filter(r => r.skill === skill);
  }, [resources]);

  // Get suggested resources based on weaknesses
  const getSuggestedResources = useCallback(() => {
    if (skillAnalysis.length === 0) return resources.slice(0, 3);

    const weakestSkill = skillAnalysis.sort((a, b) => a.avgScore - b.avgScore)[0];
    const skillResources = resources.filter(r => r.skill === weakestSkill?.skill);
    
    if (skillResources.length > 0) return skillResources.slice(0, 3);
    return resources.slice(0, 3);
  }, [skillAnalysis, resources]);

  return {
    recommendations,
    resources,
    skillAnalysis,
    loading,
    generateRecommendations,
    completeRecommendation,
    getResourcesForSkill,
    getSuggestedResources,
    refresh: loadCoachData,
  };
}
