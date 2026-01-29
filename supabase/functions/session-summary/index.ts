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

    // Fetch session answers
    const { data: answers, error } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_index');

    if (error) throw error;

    const allScores = answers.map(a => a.scores?.overall || 0);
    const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

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
          { role: "system", content: "Analyze interview performance and create 7-day improvement plan. Return JSON: { strengths: [], weaknesses: [], improvement_plan: [{day: 1, focus: '', tasks: []}], skill_breakdown: {} }" },
          { role: "user", content: `Answers: ${JSON.stringify(answers.map(a => ({ q: a.question_text, scores: a.scores, feedback: a.feedback })))}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const summary = JSON.parse(data.choices?.[0]?.message?.content || '{}');

    // Save summary
    await supabase.from('session_summaries').insert({
      session_id: sessionId,
      overall_score: avgScore,
      strengths: summary.strengths || [],
      weaknesses: summary.weaknesses || [],
      improvement_plan: summary.improvement_plan || [],
      skill_breakdown: summary.skill_breakdown || {},
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
