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
    console.log("[session-summary] Starting for session:", sessionId);
    
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!GROQ_API_KEY) {
      console.error("[session-summary] GROQ_API_KEY not configured");
      throw new Error("GROQ_API_KEY not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if summary already exists
    const { data: existingSummary } = await supabase
      .from('session_summaries')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existingSummary) {
      console.log("[session-summary] Summary already exists, skipping");
      return new Response(JSON.stringify({ success: true, message: 'Summary already exists' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch session info for role
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('role, level')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error("[session-summary] Error fetching session:", sessionError);
    }

    const role = sessionData?.role || 'frontend';
    const level = sessionData?.level || 'junior';
    console.log("[session-summary] Role:", role, "Level:", level);

    // Fetch session answers
    const { data: answers, error } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_index');

    if (error) {
      console.error("[session-summary] Error fetching answers:", error);
      throw error;
    }

    console.log("[session-summary] Found", answers?.length || 0, "answers");

    // Handle empty answers
    if (!answers || answers.length === 0) {
      console.log("[session-summary] No answers, creating empty summary");
      await supabase.from('session_summaries').insert({
        session_id: sessionId,
        overall_score: 0,
        strengths: ['Chưa có dữ liệu để phân tích'],
        weaknesses: ['Phiên phỏng vấn chưa có câu trả lời nào'],
        improvement_plan: [],
        skill_breakdown: {},
        learning_roadmap: [],
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

    console.log("[session-summary] Average score:", avgScore.toFixed(2));

    // Generate summary with AI
    console.log("[session-summary] Calling Groq API...");
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
      "title": "Tên chủ đề cần học",
      "description": "Mô tả ngắn về chủ đề",
      "priority": "high",
      "skills": ["skill1", "skill2"],
      "resources": ["Tài liệu hoặc link gợi ý"],
      "estimated_hours": 10
    }
  ]
}

IMPORTANT RULES:
1. skill_breakdown keys MUST be in English: communication, relevance, structure, depth, clarity. Values are scores from 1-5.
2. All text content (strengths, weaknesses, improvement_plan, learning_roadmap titles/descriptions) MUST be in Vietnamese.
3. learning_roadmap should contain 4-6 topics the candidate should learn, ordered by priority based on their weaknesses.
4. priority values: "high" (cần học ngay), "medium" (nên học), "low" (có thể học sau).
5. Base the roadmap on the candidate's actual weaknesses shown in their answers.
6. For ${role} role at ${level} level, focus on relevant skills:
   - Frontend: JavaScript, TypeScript, React, CSS, Performance, Testing, Responsive Design
   - Backend: Database, API Design, System Design, Security, DevOps, Caching
   - QA: Testing methodologies, Automation, Bug tracking, Test cases
   - BA: Requirements gathering, Documentation, Stakeholder management
   - Data: SQL, Python, Data analysis, Visualization
   - DevOps: CI/CD, Docker, Kubernetes, Cloud services
   - Mobile: React Native, Flutter, iOS/Android native
7. Include soft skills (communication, presentation, STAR method) if those scores are low.
8. Make the analysis specific to this candidate's actual performance, not generic advice.` 
          },
          { 
            role: "user", 
            content: `Phân tích kết quả phỏng vấn ${role} ${level} sau và tạo lộ trình học tập cá nhân hóa dựa trên điểm yếu của ứng viên:

Điểm trung bình: ${avgScore.toFixed(1)}/5

Chi tiết câu trả lời:
${JSON.stringify(answers.map(a => ({ 
  question: a.question_text, 
  answer: a.answer_text?.substring(0, 200) || '[Không trả lời]',
  scores: a.scores, 
  feedback: a.feedback 
})), null, 2)}

Hãy phân tích cụ thể dựa trên câu trả lời thực tế của ứng viên, không đưa ra nhận xét chung chung.` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[session-summary] Groq API error:", response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[session-summary] Groq response received");

    let summary;
    try {
      summary = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      console.log("[session-summary] Parsed summary:", Object.keys(summary));
    } catch (parseError) {
      console.error("[session-summary] Failed to parse Groq response:", parseError);
      summary = {};
    }

    // Validate and provide defaults
    const finalSummary = {
      session_id: sessionId,
      overall_score: avgScore,
      strengths: summary.strengths?.length > 0 ? summary.strengths : ['Cần thêm dữ liệu để phân tích'],
      weaknesses: summary.weaknesses?.length > 0 ? summary.weaknesses : ['Cần thêm dữ liệu để phân tích'],
      improvement_plan: summary.improvement_plan || [],
      skill_breakdown: summary.skill_breakdown || {
        communication: avgScore,
        relevance: avgScore,
        structure: avgScore,
        depth: avgScore,
        clarity: avgScore,
      },
      learning_roadmap: summary.learning_roadmap || [],
    };

    // Save summary
    const { error: insertError } = await supabase.from('session_summaries').insert(finalSummary);
    
    if (insertError) {
      console.error("[session-summary] Error inserting summary:", insertError);
      throw insertError;
    }

    console.log("[session-summary] Summary saved successfully");

    // Save learning roadmap to user_learning_roadmaps table for the Learning Path page
    if (finalSummary.learning_roadmap && finalSummary.learning_roadmap.length > 0) {
      console.log("[session-summary] Saving learning roadmap to user_learning_roadmaps...");
      
      // Get user_id from session
      const { data: sessionInfo } = await supabase
        .from('interview_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionInfo?.user_id) {
        for (const item of finalSummary.learning_roadmap) {
          try {
            // Upsert roadmap item (update if exists, insert if not)
            await supabase.from('user_learning_roadmaps').upsert({
              user_id: sessionInfo.user_id,
              session_id: sessionId,
              topic_id: item.id || `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: item.title,
              description: item.description || '',
              priority: item.priority || 'medium',
              skills: item.skills || [],
              resources: item.resources || [],
              estimated_hours: item.estimated_hours || 10,
              progress: 0,
              status: 'not_started',
            }, { onConflict: 'user_id,topic_id' });
          } catch (roadmapErr) {
            console.error("[session-summary] Error saving roadmap item:", roadmapErr);
          }
        }
        console.log("[session-summary] Learning roadmap saved to user_learning_roadmaps");
      }
    }

    return new Response(JSON.stringify({ success: true, summary: finalSummary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[session-summary] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
