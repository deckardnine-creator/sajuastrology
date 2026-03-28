import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju-calculator";
import { getLanguageInstruction } from "@/lib/prompt-locale";

// Node.js runtime for longer timeout (no edge)
export const maxDuration = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

/* --- helpers --- */

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

// ═══ AI ENGINE: Gemini Pro → Claude Sonnet ═══

async function callGemini(systemPrompt: string, userPrompt: string, model = "gemini-2.5-flash"): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: 8000,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textParts = parts.filter((p: any) => p.text && !p.thought);
  if (textParts.length === 0) {
    const allText = parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
    if (allText) return allText;
    console.error("Gemini empty. Parts:", JSON.stringify(parts).substring(0, 500));
    throw new Error("Gemini returned empty response");
  }
  return textParts.map((p: any) => p.text).join("");
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) throw new Error("Claude not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
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
    throw new Error(`Claude ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // Gemini Flash → Gemini Pro → Claude Sonnet
  try {
    return await callGemini(systemPrompt, userPrompt, "gemini-2.5-flash");
  } catch (err) {
    console.warn("Consultation: Gemini Flash failed —", err instanceof Error ? err.message : err);
    try {
      return await callGemini(systemPrompt, userPrompt, "gemini-2.5-pro");
    } catch (err2) {
      console.warn("Consultation: Gemini Pro failed, falling back to Claude —", err2 instanceof Error ? err2.message : err2);
      return await callClaude(systemPrompt, userPrompt);
    }
  }
}

/* --- main handler --- */

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
      case "get-report":
        return handleGetReport(body);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* --- Check Credits --- */

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

/* --- Get Saved Report --- */

async function handleGetReport({ consultationId, userId }: { consultationId: string; userId: string }) {
  if (!consultationId || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const res = await sbFetch(
    `consultations?id=eq.${consultationId}&user_id=eq.${userId}&select=report_title,report,status`
  );
  const [consultation] = await res.json();

  if (!consultation || consultation.status !== "completed") {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({
    report: {
      title: consultation.report_title || "Consultation Report",
      content: consultation.report,
    },
  });
}

/* --- Start Consultation --- */

// Basic content moderation — blocks obviously inappropriate input
function isInappropriate(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const blocked = [
    "wanna sex", "want sex", "have sex", "fuck", "suck my", "blow job",
    "kill myself", "kill someone", "how to make bomb", "how to make drug",
    "child porn", "nude", "naked photo",
  ];
  return blocked.some((b) => lower.includes(b));
}

interface BirthInput {
  name: string;
  gender: "male" | "female";
  year: number;
  month: number;
  day: number;
  hour: number;
  city: string;
}

async function handleStart({
  userId,
  category,
  question,
  birthInput,
  locale,
}: {
  userId: string;
  category: string;
  question: string;
  birthInput: BirthInput;
  locale?: string;
}) {
  if (!userId || !question) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!birthInput || !birthInput.name || !birthInput.gender || !birthInput.city) {
    return NextResponse.json({ error: "Birth information is required. Please fill in all fields." }, { status: 400 });
  }

  // Content moderation
  if (isInappropriate(question)) {
    return NextResponse.json({
      error: "Your question doesn't appear to be related to Saju astrology. Please ask about career, relationships, timing, health, or other life topics that can be analyzed through your birth chart."
    }, { status: 400 });
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

  // 2. Reserve credit (don't deduct yet — deduct only on success)
  const creditId = availableCredit.id;
  const currentUsed = availableCredit.used_credits;

  // 3. Calculate saju chart on-the-fly from birth input
  const birthDate = new Date(birthInput.year, birthInput.month - 1, birthInput.day);
  const chart = calculateSaju(
    birthInput.name,
    birthInput.gender,
    birthDate,
    birthInput.hour,
    birthInput.city
  );

  // Build chart data for storage and prompt
  const chartData = {
    name: chart.name,
    gender: chart.gender,
    birthDate: `${birthInput.year}-${String(birthInput.month).padStart(2, "0")}-${String(birthInput.day).padStart(2, "0")}`,
    birthCity: chart.birthCity,
    locale: locale || "en",
    dayMaster: {
      element: chart.dayMaster.element,
      yinYang: chart.dayMaster.yinYang,
      en: chart.dayMaster.en,
      zh: chart.dayMaster.zh,
    },
    archetype: chart.archetype,
    tenGod: chart.tenGod,
    harmonyScore: chart.harmonyScore,
    dominantElement: chart.dominantElement,
    weakestElement: chart.weakestElement,
    elements: chart.elements,
    elementBalance: chart.elements,
    pillars: {
      year: { stem: { zh: chart.pillars.year.stem.zh, en: chart.pillars.year.stem.en }, branch: { zh: chart.pillars.year.branch.zh, en: chart.pillars.year.branch.en } },
      month: { stem: { zh: chart.pillars.month.stem.zh, en: chart.pillars.month.stem.en }, branch: { zh: chart.pillars.month.branch.zh, en: chart.pillars.month.branch.en } },
      day: { stem: { zh: chart.pillars.day.stem.zh, en: chart.pillars.day.stem.en }, branch: { zh: chart.pillars.day.branch.zh, en: chart.pillars.day.branch.en } },
      hour: { stem: { zh: chart.pillars.hour.stem.zh, en: chart.pillars.hour.stem.en }, branch: { zh: chart.pillars.hour.branch.zh, en: chart.pillars.hour.branch.en } },
    },
  };

  // 4. Create consultation record
  const insertRes = await sbFetch("consultations", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      credit_id: creditId,
      category,
      initial_question: question,
      birth_data: chartData,
      status: "generating",
    }),
  });
  const [consultation] = await insertRes.json();

  // 5. Generate report directly — deduct credit only AFTER success
  try {
    const report = await generateReport({
      category,
      question,
      birthData: chartData,
      clarifyingQuestions: null,
      clarifyingAnswers: null,
      locale,
    });

    // Success! Now deduct credit
    await sbFetch(`consultation_credits?id=eq.${creditId}`, {
      method: "PATCH",
      body: JSON.stringify({ used_credits: currentUsed + 1 }),
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
  } catch {
    await sbFetch(`consultations?id=eq.${consultation.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "failed" }),
    });
    return NextResponse.json(
      { error: "Report generation failed. Your credit was not used. Please try again." },
      { status: 500 }
    );
  }
}

/* --- Submit Answers (legacy fallback) --- */

async function handleSubmitAnswers({
  consultationId,
  answers: _answers,
}: {
  consultationId: string;
  answers: string[];
}) {
  if (!consultationId) {
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

  await sbFetch(`consultations?id=eq.${consultationId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "generating" }),
  });

  // Generate report directly (no clarifying questions)
  try {
    const report = await generateReport({
      category: consultation.category,
      question: consultation.initial_question,
      birthData: consultation.birth_data,
      clarifyingQuestions: null,
      clarifyingAnswers: null,
      locale: consultation.birth_data?.locale || "en",
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

    // 5. Now deduct credit (only after success)
    if (consultation.credit_id) {
      const creditRes = await sbFetch(
        `consultation_credits?id=eq.${consultation.credit_id}&select=used_credits`
      );
      const [credit] = await creditRes.json();
      if (credit) {
        await sbFetch(`consultation_credits?id=eq.${consultation.credit_id}`, {
          method: "PATCH",
          body: JSON.stringify({ used_credits: credit.used_credits + 1 }),
        });
      }
    }

    return NextResponse.json({
      report: { title: report.title, content: report.content },
    });
  } catch {
    await sbFetch(`consultations?id=eq.${consultationId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "clarifying" }),
    });
    return NextResponse.json(
      { error: "Report generation failed. Please try again — your credit is safe." },
      { status: 500 }
    );
  }
}

/* --- Report Generator --- */

async function generateReport({
  category,
  question,
  birthData,
  clarifyingQuestions,
  clarifyingAnswers,
  locale,
}: {
  category: string;
  question: string;
  birthData: any;
  clarifyingQuestions: string[] | null;
  clarifyingAnswers: string[] | null;
  locale?: string;
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

  const systemPrompt = `You are a master-level Saju consultant with decades of experience interpreting the Korean Four Pillars of Destiny. You provide deep, personalized consultations that weave together the querent's birth chart elements, current cosmic cycles, and specific life circumstances.

YOUR STYLE:
- Authoritative yet warm, like a trusted advisor who genuinely cares
- Reference specific elements of their chart (Day Master, pillar interactions, element balance)
- Give concrete, actionable timing guidance (favorable months, seasons, years)
- Use the Five Elements (Wood, Fire, Earth, Metal, Water) relationships to explain dynamics
- Include both opportunities and cautions, balanced and honest guidance
- ${getLanguageInstruction(locale)}
- Reference specific elements of their chart (Day Master, pillar interactions, element balance)
- NEVER mention that you are an AI or that this is AI-generated

REPORT STRUCTURE:
1. Title (compelling, specific to their question)
2. Opening: acknowledge their question and set context
3. Chart Analysis: how their birth chart relates to this question (Day Master, element balance, pillar dynamics)
4. Current Cycle Reading: what the current year/period means for this area
5. Detailed Guidance: 3-5 specific insights with timing recommendations
6. Favorable and Challenging Periods: specific months or seasons ahead
7. Elemental Remedies: practical suggestions aligned with their element needs
8. Closing Reflection: empowering summary

TARGET LENGTH: 2,500-3,500 words. Be thorough and specific. Every paragraph should reference their unique chart data.

CRITICAL FORMATTING RULES — YOU MUST FOLLOW THESE EXACTLY:
- Start with the title as: # Title Text
- Every section MUST begin with: ## Section Name
- Subsections use: ### Subsection Name
- NEVER use #### or deeper heading levels
- Use **bold** for key terms and important phrases
- Use bullet lists with - for lists of recommendations
- Separate sections with blank lines
- Example of correct format:
  # Your Career Crossroads: Navigating Change in 2026
  
  ## Opening
  Your question about...
  
  ## Chart Analysis
  Your Day Master is...
  
  ### Day Master Details
  ...
  
  ## Current Cycle Reading
  ...`;

  const userPrompt = `CONSULTATION REQUEST
Category: ${category}
Question: "${question}"

${clarificationContext ? `ADDITIONAL CONTEXT FROM QUERENT:\n${clarificationContext}\n` : ""}

QUERENT'S SAJU CHART:
${chartSummary}

Generate a comprehensive, personalized Saju consultation report. Start with a compelling title (as a # heading), then the full analysis.`;

  const content = await callAI(systemPrompt, userPrompt);

  // Extract title from the first heading
  const titleMatch = content.match(/^#\s+(.+)/m);
  const title = titleMatch ? titleMatch[1].trim() : `${category} Consultation`;

  return { title, content };
}

/* --- Chart Formatter --- */

function formatChartSummary(birthData: any): string {
  if (!birthData) return "Birth data not available";

  try {
    const lines: string[] = [];

    if (birthData.name) {
      lines.push(`Name: ${birthData.name}`);
    }
    if (birthData.gender) {
      lines.push(`Gender: ${birthData.gender}`);
    }
    if (birthData.birthDate) {
      lines.push(`Birth Date: ${birthData.birthDate}`);
    }
    if (birthData.birthCity) {
      lines.push(`Birth City: ${birthData.birthCity}`);
    }
    if (birthData.dayMaster) {
      lines.push(`Day Master: ${birthData.dayMaster.en || ""} ${birthData.dayMaster.zh || ""} (${birthData.dayMaster.element || ""})`);
    }
    if (birthData.archetype) {
      lines.push(`Archetype: ${birthData.archetype}`);
    }
    if (birthData.tenGod) {
      lines.push(`Ten God: ${birthData.tenGod}`);
    }
    if (birthData.harmonyScore) {
      lines.push(`Harmony Score: ${birthData.harmonyScore}/100`);
    }
    if (birthData.dominantElement) {
      lines.push(`Dominant Element: ${birthData.dominantElement}`);
    }
    if (birthData.weakestElement) {
      lines.push(`Weakest Element: ${birthData.weakestElement}`);
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

    return lines.join("\n") || "Chart data provided but could not be formatted";
  } catch {
    return JSON.stringify(birthData).slice(0, 2000);
  }
}
