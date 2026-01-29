// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Level-specific scoring guidelines
const LEVEL_RUBRIC: Record<string, string> = {
  intern: `
- 5 điểm: Thể hiện tư duy logic tốt, chủ động tìm hiểu
- 4 điểm: Hiểu concepts cơ bản, có tiềm năng phát triển
- 3 điểm: Có kiến thức nền, cần học thêm
- 2 điểm: Thiếu kiến thức cơ bản nhưng có thái độ tốt
- 1 điểm: Chưa chuẩn bị, cần học từ đầu`,
  junior: `
- 5 điểm: Giải thích rõ ràng, có ví dụ thực tế, biết best practices
- 4 điểm: Hiểu đúng concept, có kinh nghiệm thực hành
- 3 điểm: Hiểu cơ bản, cần thêm kinh nghiệm
- 2 điểm: Lý thuyết yếu, thiếu thực hành
- 1 điểm: Không nắm được yêu cầu cơ bản`,
  mid: `
- 5 điểm: Trả lời sâu, biết trade-offs, có kinh nghiệm production
- 4 điểm: Kiến thức vững, giải quyết vấn đề độc lập
- 3 điểm: Làm được nhưng cần guidance
- 2 điểm: Kiến thức bề mặt, thiếu depth
- 1 điểm: Chưa đạt expectation mid-level`,
  senior: `
- 5 điểm: Expert level, system thinking, mentor được người khác
- 4 điểm: Deep knowledge, đã lead projects
- 3 điểm: Kỹ thuật tốt nhưng thiếu leadership
- 2 điểm: Mid-level disguised as senior
- 1 điểm: Chưa đạt yêu cầu senior`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, question, answer, role, level, mode, language } = await req.json();
    
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const isVietnamese = language === 'vi';
    const rubric = LEVEL_RUBRIC[level] || LEVEL_RUBRIC.junior;

    const systemPrompt = isVietnamese 
      ? `Bạn là evaluator chuyên đánh giá câu trả lời phỏng vấn cho vị trí ${role} cấp độ ${level}.

## RUBRIC CHẤM ĐIỂM (0-5)

### 1. RELEVANCE (Độ liên quan)
- 5: Trả lời đúng trọng tâm, đầy đủ ý
- 3: Có liên quan nhưng lan man hoặc thiếu ý chính
- 1: Lạc đề hoặc không trả lời

### 2. STRUCTURE (Cấu trúc)
- 5: Mạch lạc, logic, dùng STAR/framework phù hợp
- 3: Có cấu trúc cơ bản
- 1: Lộn xộn, khó theo dõi

### 3. DEPTH (Độ sâu)
- 5: Insight sâu, ví dụ thực tế, biết trade-offs
- 3: Hiểu concept, ví dụ chung chung
- 1: Bề mặt, thiếu hiểu biết

### 4. CLARITY (Độ rõ ràng)
- 5: Diễn đạt chuyên nghiệp, dễ hiểu
- 3: Hiểu được nhưng cần cải thiện
- 1: Khó hiểu, ngôn ngữ không phù hợp

### LEVEL ${level.toUpperCase()} EXPECTATIONS
${rubric}

## HƯỚNG DẪN FEEDBACK
1. **evidence**: Chỉ ra điểm yếu CỤ THỂ trong câu trả lời (quote nếu cần)
2. **suggestions**: Gợi ý ACTIONABLE, có thể áp dụng ngay
3. **improved_answer**: Viết câu trả lời mẫu NGẮN GỌN nhưng đủ ý, phù hợp với level ${level}

## OUTPUT FORMAT (JSON)
{
  "scores": {
    "relevance": 0-5,
    "structure": 0-5,
    "depth": 0-5,
    "clarity": 0-5,
    "overall": 0-5 (trung bình có trọng số: relevance 30%, depth 30%, structure 20%, clarity 20%)
  },
  "feedback": {
    "evidence": ["điểm yếu cụ thể 1", "điểm yếu cụ thể 2"],
    "suggestions": ["gợi ý cải thiện 1", "gợi ý cải thiện 2"],
    "improved_answer": "Câu trả lời mẫu ngắn gọn, đủ ý, phù hợp level ${level}"
  },
  "shouldIncreaseDifficulty": true/false (true nếu overall >= 4),
  "nextFocusTags": ["skills cần tập trung dựa trên điểm yếu"]
}`
      : `You are an evaluator assessing interview answers for ${role} position at ${level} level.

## SCORING RUBRIC (0-5)

### 1. RELEVANCE
- 5: Directly addresses the question, complete
- 3: Related but misses key points or rambles
- 1: Off-topic or non-answer

### 2. STRUCTURE
- 5: Clear, logical, uses STAR/appropriate framework
- 3: Basic structure
- 1: Disorganized, hard to follow

### 3. DEPTH
- 5: Deep insight, real examples, knows trade-offs
- 3: Understands concept, generic examples
- 1: Surface level, lacks understanding

### 4. CLARITY
- 5: Professional communication, easy to understand
- 3: Understandable but needs improvement
- 1: Hard to understand, inappropriate language

### ${level.toUpperCase()} LEVEL EXPECTATIONS
${rubric}

## FEEDBACK GUIDELINES
1. **evidence**: Point out SPECIFIC weaknesses (quote if needed)
2. **suggestions**: ACTIONABLE tips they can apply immediately
3. **improved_answer**: Write a CONCISE model answer appropriate for ${level} level

## OUTPUT FORMAT (JSON)
{
  "scores": {
    "relevance": 0-5,
    "structure": 0-5,
    "depth": 0-5,
    "clarity": 0-5,
    "overall": 0-5 (weighted average: relevance 30%, depth 30%, structure 20%, clarity 20%)
  },
  "feedback": {
    "evidence": ["specific weakness 1", "specific weakness 2"],
    "suggestions": ["improvement tip 1", "improvement tip 2"],
    "improved_answer": "Concise model answer appropriate for ${level} level"
  },
  "shouldIncreaseDifficulty": true/false (true if overall >= 4),
  "nextFocusTags": ["skills to focus based on weaknesses"]
}`;

    const userPrompt = isVietnamese
      ? `Câu hỏi phỏng vấn: "${question}"

Câu trả lời của ứng viên: "${answer}"

Hãy đánh giá chi tiết theo rubric và đưa ra feedback hữu ích.`
      : `Interview question: "${question}"

Candidate's answer: "${answer}"

Evaluate in detail using the rubric and provide helpful feedback.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Evaluate answer error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
