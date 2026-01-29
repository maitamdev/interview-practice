import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChallengeTemplate {
  type: string;
  title: string;
  title_vi: string;
  description: string;
  description_vi: string;
  target_value: number;
  xp_reward: number;
}

const challengeTemplates: ChallengeTemplate[] = [
  {
    type: 'interview',
    title: 'Complete 1 Interview',
    title_vi: 'Hoàn thành 1 buổi phỏng vấn',
    description: 'Complete at least 1 interview session today',
    description_vi: 'Hoàn thành ít nhất 1 buổi phỏng vấn hôm nay',
    target_value: 1,
    xp_reward: 50,
  },
  {
    type: 'questions',
    title: 'Answer 5 Questions',
    title_vi: 'Trả lời 5 câu hỏi',
    description: 'Answer at least 5 interview questions today',
    description_vi: 'Trả lời ít nhất 5 câu hỏi phỏng vấn hôm nay',
    target_value: 5,
    xp_reward: 75,
  },
  {
    type: 'score',
    title: 'Get 3+ Score',
    title_vi: 'Đạt điểm 3+',
    description: 'Score at least 3 on any answer today',
    description_vi: 'Đạt ít nhất 3 điểm trong 1 câu trả lời hôm nay',
    target_value: 3,
    xp_reward: 60,
  },
  {
    type: 'interview',
    title: 'Complete 2 Interviews',
    title_vi: 'Hoàn thành 2 buổi phỏng vấn',
    description: 'Complete at least 2 interview sessions today',
    description_vi: 'Hoàn thành ít nhất 2 buổi phỏng vấn hôm nay',
    target_value: 2,
    xp_reward: 100,
  },
  {
    type: 'questions',
    title: 'Answer 10 Questions',
    title_vi: 'Trả lời 10 câu hỏi',
    description: 'Answer at least 10 interview questions today',
    description_vi: 'Trả lời ít nhất 10 câu hỏi phỏng vấn hôm nay',
    target_value: 10,
    xp_reward: 120,
  },
  {
    type: 'score',
    title: 'Get 4+ Score',
    title_vi: 'Đạt điểm 4+',
    description: 'Score at least 4 on any answer today',
    description_vi: 'Đạt ít nhất 4 điểm trong 1 câu trả lời hôm nay',
    target_value: 4,
    xp_reward: 100,
  },
  {
    type: 'streak',
    title: 'Maintain Streak',
    title_vi: 'Duy trì streak',
    description: 'Complete any interview to maintain your streak',
    description_vi: 'Hoàn thành 1 buổi phỏng vấn để duy trì streak',
    target_value: 1,
    xp_reward: 40,
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Check if challenge already exists for today
    const { data: existingChallenge } = await supabase
      .from('daily_challenges')
      .select('id')
      .eq('challenge_date', today)
      .maybeSingle();

    if (existingChallenge) {
      return new Response(
        JSON.stringify({ message: 'Challenge already exists for today', challenge_id: existingChallenge.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pick a random challenge template
    const randomIndex = Math.floor(Math.random() * challengeTemplates.length);
    const template = challengeTemplates[randomIndex];

    // Create today's challenge
    const { data: newChallenge, error } = await supabase
      .from('daily_challenges')
      .insert({
        challenge_date: today,
        challenge_type: template.type,
        title: template.title,
        title_vi: template.title_vi,
        description: template.description,
        description_vi: template.description_vi,
        target_value: template.target_value,
        xp_reward: template.xp_reward,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Daily challenge created', challenge: newChallenge }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating daily challenge:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
