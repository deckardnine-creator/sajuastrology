import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const anthropicKey = process.env.ANTHROPIC_API_KEY || "";

/* ─── helpers ─── */

async function sbFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });
}

async function callClaude(systemPrompt: string, userPrompt: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

/* ─── main handler ─── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "check-credits":
        return handleCheckCredits(body);
      case "start":
        return handleStart(body);
      case "submit-answers":
        return handleSubmitAnswers(body);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Consultation API error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ─── Check Credits ─── */

async function handleCheckCredits({ userId }: { userId: string }) {
  const res = await sbFetch(
    `consultation_credits?user_id=eq.${userId}&select=id,total_credits,used_credits`
  );
  const credits = await res.json();
  const remaining = (credits || []).reduce(
    (sum: number, c: any) => sum + (c.total_credits - c.used_credits),
    0
  );
  return NextResponse.json({ remaining });
}

/* ─── Start Consultation ─── */

async function handleStart({
  userId,
  category,
  question,
  birthData,
}: {
  userId: string;
  category: string;
  question: string;
  birthData: any;
}) {
  if (!userId || !question) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. Check credits
  const creditsRes = await sbFetch(
    `consultation_credits?user_id=eq.${userId}&select=id,total_credits,used_credits&order=purchased_at.asc`
  );
  const allCredits = await creditsRes.json();
  const availableCredit = (allCredits || []).find(
    (c: any) => c.used_credits < c.total_credits
  );

  if (!availableCredit) {
    return NextResponse.json({ error: "No credits remaining" }, { status: 403 });
  }

  // 2. Use one credit
  await sbFetch(`consultation_credits?id=eq.${availableCredit.id}`, {
    method: "PATCH",
    body: JSON.stringify({ used_credits: availableCredit.used_credits + 1 }),
  });

  // 3. Ask Claude whether clarification is needed
  const chartSummary = formatChartSummary(birthData);

  const systemPrompt = `You are a master of Saju (四柱, Korean Four Pillars of Destiny), with deep expertise in analyzing birth charts for personalized guidance. You are reviewing a consultation question.

Your task: Decide whether the question needs clarification before you can deliver a precise, personalized reading.

RULES:
- If the question is specific enough (e.g., "Should I change jobs this year?", "Is 2026 a good year for marriage?"), respond with: {"needsClarification": false}
- If the question is vague or broad (e.g., "Tell me about my future", "What about love?"), generate 2-3 SHORT, specific clarifying questions that will help you give a much more precise reading.
- Respond ONLY in valid JSON format.
- Clarifying questions should be in English, warm and conversational.
- Each question should be max 1-2 sentences.

JSON format when clarification needed:
{"needsClarification": true, "questions": ["question1", "question2", "question3"]}

JSON format when no clarification needed:
{"needsClarification": false}`;

  const userPrompt = `Category: ${category}
Question: "${question}"

Querent's Saju Chart:
${chartSummary}

Analyze whether this question needs clarification for a precise Saju consultation. Respond in JSON only.`;

  const claudeResponse = await callClaude(systemPrompt, userPrompt);

  // Parse Claude's response
  let parsed;
  try {
    const cleaned = claudeResponse.replace(/```json\s*|\s*```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = { needsClarification: false };
  }

  // 4. Create consultation record
  const consultationData: any = {
    user_id: userId,
    credit_id: availableCredit.id,
    category,
    initial_question: question,
    birth_data: birthData,
    status: parsed.needsClarification ? "clarifying" : "generating",
  };

  if (parsed.needsClarification) {
    consultationData.clarifying_questions = parsed.questions;
  }

  const insertRes = await sbFetch("consultations", {
    method: "POST",
    body: JSON.stringify(consultationData),
  });
  const [consultation] = await insertRes.json();

  if (parsed.needsClarification) {
    return NextResponse.json({
      consultationId: consultation.id,
      needsClarification: true,
      questions: parsed.questions,
    });
  }

  // 5. Generate report directly
  const report = await generateReport({
    category,
    question,
    birthData,
    clarifyingQuestions: null,
    clarifyingAnswers: null,
  });

  // Save report
  await sbFetch(`consultations?id=eq.${consultation.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      report_title: report.title,
      report: report.content,
      status: "completed",
      completed_at: new Date().toISOString(),
    }),
  });

  return NextResponse.json({
    consultationId: consultation.id,
    needsClarification: false,
    report: { title: report.title, content: report.content },
  });
}

/* ─── Submit Answers & Generate ─── */

async function handleSubmitAnswers({
  consultationId,
  answers,
}: {
  consultationId: string;
  answers: string[];
}) {
  if (!consultationId || !answers) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1. Get consultation
  const res = await sbFetch(
    `consultations?id=eq.${consultationId}&select=*`
  );
  const [consultation] = await res.json();

  if (!consultation) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }

  // 2. Save answers & update status
  await sbFetch(`consultations?id=eq.${consultationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      clarifying_answers: answers,
      status: "generating",
    }),
  });

  // 3. Generate report
  const report = await generateReport({
    category: consultation.category,
    question: consultation.initial_question,
    birthData: consultation.birth_data,
    clarifyingQuestions: consultation.clarifying_questions,
    clarifyingAnswers: answers,
  });

  // 4. Save report
  await sbFetch(`consultations?id=eq.${consultationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      report_title: report.title,
      report: report.content,
      status: "completed",
      completed_at: new Date().toISOString(),
    }),
  });

  return NextResponse.json({
    report: { title: report.title, content: report.content },
  });
}

/* ─── Report Generator ─── */

async function generateReport({
  category,
  question,
  birthData,
  clarifyingQuestions,
  clarifyingAnswers,
}: {
  category: string;
  question: string;
  birthData: any;
  clarifyingQuestions: string[] | null;
  clarifyingAnswers: string[] | null;
}) {
  const chartSummary = formatChartSummary(birthData);

  const clarificationContext = clarifyingQuestions
    ? clarifyingQuestions
        .map(
          (q: string, i: number) =>
            `Q: ${q}\nA: ${clarifyingAnswers?.[i] || "Not answered"}`
        )
        .join("\n\n")
    : "";

  const systemPrompt = `You are a master-level Saju (四柱) consultant with decades of experience interpreting the Korean Four Pillars of Destiny. You provide deep, personalized consultations that weave together the querent's birth chart elements, current cosmic cycles, and specific life circumstances.

YOUR STYLE:
- Authoritative yet warm — like a trusted advisor who genuinely cares
- Reference specific elements of their chart (Day Master, pillar interactions, element balance)
- Give concrete, actionable timing guidance (favorable months, seasons, years)
- Use the Five Elements (Wood, Fire, Earth, Metal, Water) relationships to explain dynamics
- Include both opportunities and cautions — balanced, honest guidance
- Write in clear, flowing English with occasional Korean/Chinese Saju terms in parentheses for authenticity
- NEVER mention that you are an AI or that this is AI-generated

REPORT STRUCTURE:
1. Title (compelling, specific to their question)
2. Opening — acknowledge their question and set context
3. Chart Analysis — how their birth chart relates to this question (Day Master, element balance, pillar dynamics)
4. Current Cycle Reading — what the current year/period means for this area
5. Detailed Guidance — 3-5 specific insights with timing recommendations
6. Favorable & Challenging Periods — specific months or seasons ahead
7. Elemental Remedies — practical suggestions aligned with their element needs
8. Closing Reflection — empowering summary

TARGET LENGTH: 2,500-3,500 words. Be thorough and specific. Every paragraph should reference their unique chart data.

Format the report in clean Markdown with ## headers for sections.`;

  const userPrompt = `CONSULTATION REQUEST
Category: ${category}
Question: "${question}"

${clarificationContext ? `ADDITIONAL CONTEXT FROM QUERENT:\n${clarificationContext}\n` : ""}

QUERENT'S SAJU CHART:
${chartSummary}

Generate a comprehensive, personalized Saju consultation report. Start with a compelling title (as a # heading), then the full analysis.`;

  const content = await callClaude(systemPrompt, userPrompt);

  // Extract title from the first heading
  const titleMatch = content.match(/^#\s+(.+)/m);
  const title = titleMatch ? titleMatch[1].trim() : `${category} Consultation`;

  return { title, content };
}

/* ─── Chart Formatter ─── */

function formatChartSummary(birthData: any): string {
  if (!birthData) return "Birth data not available";

  try {
    const lines: string[] = [];

    if (birthData.dayMaster) {
      lines.push(`Day Master: ${birthData.dayMaster.en || ""} ${birthData.dayMaster.zh || ""} (${birthData.dayMaster.element || ""})`);
    }
    if (birthData.archetype) {
      lines.push(`Archetype: ${birthData.archetype}`);
    }
    if (birthData.pillars) {
      const p = birthData.pillars;
      lines.push(`\nFour Pillars:`);
      for (const key of ["year", "month", "day", "hour"]) {
        if (p[key]) {
          lines.push(
            `  ${key.charAt(0).toUpperCase() + key.slice(1)} Pillar: ${p[key].stem?.en || ""} ${p[key].stem?.zh || ""} / ${p[key].branch?.en || ""} ${p[key].branch?.zh || ""}`
          );
        }
      }
    }
    if (birthData.elementBalance) {
      lines.push(`\nElement Balance:`);
      for (const [el, val] of Object.entries(birthData.elementBalance)) {
        lines.push(`  ${el}: ${val}`);
      }
    }
    if (birthData.birthDate) {
      lines.push(`\nBirth Date: ${birthData.birthDate}`);
    }
    if (birthData.gender) {
      lines.push(`Gender: ${birthData.gender}`);
    }
    if (birthData.birthCity) {
      lines.push(`Birth City: ${birthData.birthCity}`);
    }

    return lines.join("\n") || "Chart data provided but could not be formatted";
  } catch {
    return JSON.stringify(birthData).slice(0, 2000);
  }
}
