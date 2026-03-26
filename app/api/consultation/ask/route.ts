import { NextRequest, NextResponse } from "next/server";

// Node.js runtime for longer timeout (no edge)
export const maxDuration = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const anthropicKey = process.env.ANTHROPIC_API_KEY || "";

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

  // 3. Get fresh chart data from DB (localStorage can be stale)
  let chartData = birthData;
  let hasValidChart = false;
  try {
    const readingRes = await sbFetch(
      `readings?user_id=eq.${userId}&select=name,gender,birth_date,birth_city,day_master_element,day_master_yinyang,archetype,ten_god,harmony_score,dominant_element,weakest_element,elements_wood,elements_fire,elements_earth,elements_metal,elements_water,year_stem,year_branch,month_stem,month_branch,day_stem,day_branch,hour_stem,hour_branch&order=created_at.desc&limit=1`
    );
    const readings = await readingRes.json();
    if (readings?.length > 0) {
      hasValidChart = true;
      const r = readings[0];
      chartData = {
        name: r.name, gender: r.gender, birthDate: r.birth_date, birthCity: r.birth_city,
        dayMaster: { element: r.day_master_element, yinYang: r.day_master_yinyang, en: `${r.day_master_yinyang === "yang" ? "Yang" : "Yin"} ${r.day_master_element.charAt(0).toUpperCase() + r.day_master_element.slice(1)}`, zh: "" },
        archetype: r.archetype, tenGod: r.ten_god, harmonyScore: r.harmony_score,
        dominantElement: r.dominant_element, weakestElement: r.weakest_element,
        elements: { wood: r.elements_wood, fire: r.elements_fire, earth: r.elements_earth, metal: r.elements_metal, water: r.elements_water },
        elementBalance: { wood: r.elements_wood, fire: r.elements_fire, earth: r.elements_earth, metal: r.elements_metal, water: r.elements_water },
        pillars: {
          year: { stem: { zh: r.year_stem, en: "" }, branch: { zh: r.year_branch, en: "" } },
          month: { stem: { zh: r.month_stem, en: "" }, branch: { zh: r.month_branch, en: "" } },
          day: { stem: { zh: r.day_stem, en: "" }, branch: { zh: r.day_branch, en: "" } },
          hour: { stem: { zh: r.hour_stem, en: "" }, branch: { zh: r.hour_branch, en: "" } },
        },
      };
    }
  } catch { /* Fall back to client-provided data */ }

  // Guard: reject if no reading exists for this user at all
  if (!hasValidChart && (!birthData || !birthData.dayMaster)) {
    return NextResponse.json({
      error: "No Saju chart found for your account. Please generate a free reading first at sajuastrology.com/calculate before using consultations."
    }, { status: 400 });
  }

  // Ask Claude whether clarification is needed
  const chartSummary = formatChartSummary(chartData);

  const systemPrompt = `You are a master of Saju (Korean Four Pillars of Destiny), with deep expertise in analyzing birth charts for personalized guidance. You are reviewing a consultation question.

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

  // 4. Create consultation record (credit not yet deducted)
  const consultationData: any = {
    user_id: userId,
    credit_id: creditId,
    category,
    initial_question: question,
    birth_data: chartData,
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
    // Don't deduct credit yet — only deduct when report is generated successfully
    return NextResponse.json({
      consultationId: consultation.id,
      needsClarification: true,
      questions: parsed.questions,
    });
  }

  // 5. Generate report directly — deduct credit only AFTER success
  try {
    const report = await generateReport({
      category,
      question,
      birthData: chartData,
      clarifyingQuestions: null,
      clarifyingAnswers: null,
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

/* --- Submit Answers & Generate --- */

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
  try {
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

  const systemPrompt = `You are a master-level Saju consultant with decades of experience interpreting the Korean Four Pillars of Destiny. You provide deep, personalized consultations that weave together the querent's birth chart elements, current cosmic cycles, and specific life circumstances.

YOUR STYLE:
- Authoritative yet warm, like a trusted advisor who genuinely cares
- Reference specific elements of their chart (Day Master, pillar interactions, element balance)
- Give concrete, actionable timing guidance (favorable months, seasons, years)
- Use the Five Elements (Wood, Fire, Earth, Metal, Water) relationships to explain dynamics
- Include both opportunities and cautions, balanced and honest guidance
- Write in clear, flowing English with occasional Korean/Chinese Saju terms in parentheses for authenticity
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
- Use **bold** for key terms and important phrases
- Use bullet lists with - for lists of recommendations
- Use ### for subsections within a section
- Separate sections with blank lines
- Example of correct format:
  # Your Career Crossroads: Navigating Change in 2026
  
  ## Opening
  Your question about...
  
  ## Chart Analysis
  Your Day Master is...
  
  ## Current Cycle Reading
  ...`;

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
