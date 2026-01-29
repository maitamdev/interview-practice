import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Role-specific technical topics
const ROLE_TOPICS: Record<string, string[]> = {
  // Tech roles
  frontend: ["React/Vue/Angular", "JavaScript/TypeScript", "CSS/Responsive Design", "State Management", "Performance Optimization", "Testing", "API Integration", "Accessibility"],
  backend: ["API Design", "Database", "System Design", "Security", "Caching", "Message Queues", "Authentication", "Microservices"],
  fullstack: ["Full-stack Architecture", "Database Design", "Frontend Frameworks", "Backend Frameworks", "DevOps Basics", "API Design", "Security"],
  data: ["SQL/NoSQL", "Data Pipelines", "Machine Learning", "Data Visualization", "Statistics", "Big Data", "ETL Processes"],
  qa: ["Test Strategies", "Automation", "Bug Tracking", "Performance Testing", "API Testing", "CI/CD", "Test Coverage"],
  ba: ["Requirements Gathering", "Stakeholder Management", "Documentation", "Process Modeling", "User Stories", "Agile/Scrum"],
  devops: ["CI/CD", "Cloud Services", "Container/Docker", "Kubernetes", "Monitoring", "Infrastructure as Code", "Security"],
  mobile: ["iOS/Android", "React Native/Flutter", "Mobile UX", "App Performance", "Push Notifications", "Offline Storage", "App Security"],
  // Business roles
  marketing: ["Digital Marketing", "SEO/SEM", "Content Marketing", "Social Media", "Analytics", "Brand Strategy", "Campaign Management", "Email Marketing"],
  sales: ["Sales Process", "Lead Generation", "Negotiation", "CRM", "Pipeline Management", "Customer Relationship", "Closing Techniques", "B2B/B2C Sales"],
  hr: ["Recruitment", "Employee Relations", "Performance Management", "Training & Development", "Labor Law", "Compensation & Benefits", "HR Policies", "Talent Management"],
  finance: ["Financial Analysis", "Budgeting", "Accounting Principles", "Financial Reporting", "Tax", "Auditing", "Cash Flow Management", "Investment Analysis"],
  product: ["Product Strategy", "Roadmap Planning", "User Research", "Agile/Scrum", "Stakeholder Management", "Metrics & KPIs", "Competitive Analysis", "Go-to-Market"],
  design: ["UI Design", "UX Research", "Prototyping", "Design Systems", "User Testing", "Figma/Sketch", "Interaction Design", "Visual Design"],
  content: ["Content Strategy", "Copywriting", "SEO Writing", "Social Media Content", "Video Content", "Editorial Planning", "Brand Voice", "Content Analytics"],
  customer_service: ["Customer Communication", "Problem Resolution", "CRM Tools", "Service Quality", "Complaint Handling", "Customer Retention", "Empathy & Patience", "Product Knowledge"],
};

// Level expectations
const LEVEL_EXPECTATIONS: Record<string, string> = {
  intern: "basic concepts, willingness to learn, problem-solving approach",
  junior: "fundamental knowledge, some practical experience, eagerness to grow",
  mid: "solid experience, independent work capability, good technical depth",
  senior: "deep expertise, leadership, system design, mentoring ability",
};

// Vietnamese interviewer names
const VI_INTERVIEWER_NAMES = ["Hương", "Lan", "Tuấn", "Hải", "Linh", "Đức", "Mai", "Phong"];
// English interviewer names
const EN_INTERVIEWER_NAMES = ["Alex", "Sarah", "Michael", "Emily", "David", "Jessica", "Chris", "Amanda"];

// Get random interviewer name based on session ID for consistency
function getInterviewerName(sessionId: string | undefined, isVietnamese: boolean): string {
  const names = isVietnamese ? VI_INTERVIEWER_NAMES : EN_INTERVIEWER_NAMES;
  // Use sessionId to get consistent name per session, or random if no sessionId
  const index = sessionId 
    ? Math.abs(sessionId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % names.length
    : Math.floor(Math.random() * names.length);
  return names[index];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, role, level, mode, language, jdText, previousAnswer, previousScores, shouldIncreaseDifficulty, focusTags, questionIndex, conversationHistory } = await req.json();
    
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const isVietnamese = language === 'vi';
    const isStart = action === 'start';
    const topics = ROLE_TOPICS[role] || ROLE_TOPICS.frontend;
    const levelExpectation = LEVEL_EXPECTATIONS[level] || LEVEL_EXPECTATIONS.junior;
    const interviewerName = getInterviewerName(sessionId, isVietnamese);

    const systemPrompt = isVietnamese 
      ? `Bạn là một interviewer chuyên nghiệp với 10+ năm kinh nghiệm tuyển dụng ${role}. Bạn đang phỏng vấn ứng viên cấp độ ${level}.

## PERSONA
- Tên: ${interviewerName}
- Phong cách: Thân thiện nhưng chuyên nghiệp, biết cách tạo không khí thoải mái
- Kỹ năng: Biết cách khai thác câu trả lời, hỏi follow-up thông minh

## NGUYÊN TẮC QUAN TRỌNG
1. **MỖI LƯỢT CHỈ HỎI 1 CÂU** - Không bao giờ hỏi nhiều câu cùng lúc
2. **ACKNOWLEDGE** - Luôn ghi nhận câu trả lời trước khi hỏi tiếp (ví dụ: "Cảm ơn bạn đã chia sẻ...", "Điểm đó rất hay...")
3. **NATURAL FLOW** - Câu hỏi tiếp theo phải liên quan đến câu trả lời trước
4. **KHÔNG GIẢNG BÀI** - Không đưa ra đáp án, không dạy
5. **REALISTIC** - Hỏi như interviewer thật, không hỏi kiểu test

## EXPECTATION CHO CẤP ĐỘ ${level.toUpperCase()}
${levelExpectation}

## CHỦ ĐỀ KỸ THUẬT CHO ${role.toUpperCase()}
${topics.join(", ")}

## INTERVIEW MODE: ${mode}
${mode === 'behavioral' ? '- Tập trung vào kinh nghiệm, tình huống thực tế (STAR method)' : ''}
${mode === 'technical' ? '- Tập trung vào kiến thức kỹ thuật, problem-solving' : ''}
${mode === 'mixed' ? '- Kết hợp cả behavioral và technical questions' : ''}

${jdText ? `## JOB DESCRIPTION THAM KHẢO:\n${jdText}` : ''}

## OUTPUT FORMAT (JSON)
{
  "question": "Câu hỏi của bạn (bao gồm acknowledge nếu có câu trả lời trước)",
  "questionType": "opening|followup|new_topic|clarification",
  "difficulty": 1-5,
  "focusTags": ["tag1", "tag2"]
}`
      : `You are a professional interviewer with 10+ years of experience hiring ${role}s. You're interviewing a ${level}-level candidate.

## PERSONA
- Name: ${interviewerName}
- Style: Friendly but professional, creates comfortable atmosphere
- Skills: Good at probing answers, asks smart follow-ups

## CRITICAL RULES
1. **ONE QUESTION PER TURN** - Never ask multiple questions at once
2. **ACKNOWLEDGE** - Always acknowledge previous answer before asking next (e.g., "Thanks for sharing...", "That's interesting...")
3. **NATURAL FLOW** - Next question should relate to previous answer
4. **NO LECTURING** - Don't give answers, don't teach
5. **REALISTIC** - Ask like a real interviewer, not like a test

## EXPECTATIONS FOR ${level.toUpperCase()} LEVEL
${levelExpectation}

## TECHNICAL TOPICS FOR ${role.toUpperCase()}
${topics.join(", ")}

## INTERVIEW MODE: ${mode}
${mode === 'behavioral' ? '- Focus on experience, real situations (STAR method)' : ''}
${mode === 'technical' ? '- Focus on technical knowledge, problem-solving' : ''}
${mode === 'mixed' ? '- Combine both behavioral and technical questions' : ''}

${jdText ? `## REFERENCE JOB DESCRIPTION:\n${jdText}` : ''}

## OUTPUT FORMAT (JSON)
{
  "question": "Your question (include acknowledgement if there's a previous answer)",
  "questionType": "opening|followup|new_topic|clarification",
  "difficulty": 1-5,
  "focusTags": ["tag1", "tag2"]
}`;

    let userPrompt: string;
    
    if (isStart) {
      userPrompt = isVietnamese 
        ? "Bắt đầu buổi phỏng vấn với lời chào và câu hỏi mở đầu tự nhiên. Giới thiệu bản thân ngắn gọn trước."
        : "Start the interview with a greeting and natural opening question. Briefly introduce yourself first.";
    } else {
      const scoreInfo = previousScores ? `Overall: ${previousScores.overall}/5` : '';
      const difficultyHint = shouldIncreaseDifficulty 
        ? (isVietnamese ? 'Ứng viên trả lời tốt, có thể tăng độ khó.' : 'Candidate answered well, can increase difficulty.')
        : (isVietnamese ? 'Giữ nguyên hoặc giảm độ khó.' : 'Maintain or decrease difficulty.');
      
      userPrompt = isVietnamese 
        ? `Câu trả lời của ứng viên: "${previousAnswer}"

Đánh giá: ${scoreInfo}
${difficultyHint}

Tags cần tập trung: ${focusTags?.join(', ') || 'general'}
Đây là câu hỏi thứ ${questionIndex + 1}.

Hãy acknowledge câu trả lời và đưa ra câu hỏi tiếp theo phù hợp.`
        : `Candidate's answer: "${previousAnswer}"

Assessment: ${scoreInfo}
${difficultyHint}

Focus tags: ${focusTags?.join(', ') || 'general'}
This is question ${questionIndex + 1}.

Acknowledge the answer and provide the next appropriate question.`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).slice(-8),
      { role: "user", content: userPrompt }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
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
    console.error("Interview engine error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
