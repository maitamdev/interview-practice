// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch session info for role
    const { data: sessionData } = await supabase
      .from('interview_sessions')
      .select('role, level')
      .eq('id', sessionId)
      .single();

    const role = sessionData?.role || 'frontend';
    const level = sessionData?.level || 'junior';

    // Fetch session answers
    const { data: answers, error } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_index');

    if (error) throw error;

    // Handle empty answers
    if (!answers || answers.length === 0) {
      await supabase.from('session_summaries').insert({
        session_id: sessionId,
        overall_score: 0,
        strengths: ['Chưa có dữ liệu để phân tích'],
        weaknesses: ['Phiên phỏng vấn chưa có câu trả lời nào'],
        improvement_plan: [],
        skill_breakdown: {},
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        summary: { message: 'No answers to analyze' } 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allScores = answers.map(a => a.scores?.overall || 0);
    const avgScore = allScores.length > 0 
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
      : 0;

    // Generate summary with AI
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `You are an interview coach analyzing performance for a ${role} ${level} position. Respond in Vietnamese.

Return JSON with this exact structure:
{
  "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
  "weaknesses": ["điểm yếu 1", "điểm yếu 2", "điểm yếu 3"],
  "improvement_plan": [
    {"day": 1, "focus": "Chủ đề ngày 1", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]},
    {"day": 2, "focus": "Chủ đề ngày 2", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]},
    {"day": 3, "focus": "Chủ đề ngày 3", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]},
    {"day": 4, "focus": "Chủ đề ngày 4", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]},
    {"day": 5, "focus": "Chủ đề ngày 5", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]},
    {"day": 6, "focus": "Chủ đề ngày 6", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]},
    {"day": 7, "focus": "Chủ đề ngày 7", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]}
  ],
  "skill_breakdown": {
    "communication": 3.5,
    "relevance": 4.0,
    "structure": 3.0,
    "depth": 2.5,
    "clarity": 3.5
  },
  "learning_roadmap": [
    {
      "id": "topic-1",
      "title": "Tên chủ đề",
      "description": "Mô tả ngắn",
      "priority": "high",
      "skills": ["skill1", "skill2"],
      "resources": ["Link hoặc tài liệu gợi ý"],
      "estimated_hours": 10
    }
  ]
}

RULES:
1. skill_breakdown keys MUST be in English: communication, relevance, structure, depth, clarity. Values are scores from 1-5.
2. All text content MUST be in Vietnamese.
3. learning_roadmap should contain 4-6 topics the candidate should learn, ordered by priority.
4. priority can be: "high" (cần học ngay), "medium" (nên học), "low" (có thể học sau).
5. Base the roadmap on the candidate's weaknesses and the ${role} role requirements.
6. For ${role} role, focus on relevant technical skills like:
   - Frontend: JavaScript, TypeScript, React, CSS, Performance, Testing
   - Backend: Database, API Design, System Design, Security, DevOps
   - Fullstack: Both frontend and backend skills
7. Include soft skills if communication/structure scores are low.` 
          },
          { role: "user", content: `Phân tích kết quả phỏng vấn ${role} ${level} sau và tạo lộ trình học tập cá nhân hóa:\n\nĐiểm trung bình: ${avgScore.toFixed(1)}/5\n\nChi tiết câu trả lời:\n${JSON.stringify(answers.map(a => ({ q: a.question_text, scores: a.scores, feedback: a.feedback })), null, 2)}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const summary = JSON.parse(data.choices?.[0]?.message?.content || '{}');

    // Save summary with learning roadmap
    await supabase.from('session_summaries').insert({
      session_id: sessionId,
      overall_score: avgScore,
      strengths: summary.strengths || [],
      weaknesses: summary.weaknesses || [],
      improvement_plan: summary.improvement_plan || [],
      skill_breakdown: summary.skill_breakdown || {},
      learning_roadmap: summary.learning_roadmap || [],
    });

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Session summary error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
