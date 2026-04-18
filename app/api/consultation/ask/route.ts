import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju-calculator";
import { getLanguageInstruction, getLanguageHeader, getLanguageFooter } from "@/lib/prompt-locale";
import { buildRAGContext } from "@/lib/rag/prompt-injector";

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

  // thinkingBudget: 0 disables thinking mode — valid ONLY for Flash models.
  // Gemini 2.5 Pro enforces thinking mode and rejects 0 with 400
  // ("Budget 0 is invalid. This model only works in thinking mode.").
  // For Pro, omit thinkingConfig entirely so the model uses its default
  // dynamic thinking budget.
  const isFlash = model.includes("flash");
  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: 8000,
  };
  if (isFlash) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig,
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

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  model: string = "claude-sonnet-4-20250514",
): Promise<string> {
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
      model,
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

// Wrapper that retries once on transient API errors (429, 5xx, 529).
// Short exponential backoff: 800ms before first retry. Non-transient errors
// (4xx other than 429) propagate immediately since retrying won't help.
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  attempts = 2,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = /\b(429|5\d\d|529)\b/.test(msg);
      if (!isTransient || i === attempts - 1) throw err;
      console.warn(
        `${label}: transient error, retry ${i + 1}/${attempts - 1} —`,
        msg.substring(0, 150),
      );
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

async function callAI(systemPrompt: string, userPrompt: string, locale?: string): Promise<string> {
  // Fallback chain with retry on transient errors at each step:
  //   1. Gemini Flash (EN first) or Gemini Pro (KO/JA first) — with 1 retry
  //   2. The other Gemini model — with 1 retry
  //   3. Claude Sonnet — with 1 retry
  //   4. Claude Haiku — final last-resort (faster, higher availability)
  //
  // Each step catches transient errors (429/5xx/529) and retries once after
  // 800ms. Non-transient errors (bad request etc.) fail through immediately.
  // The 4th step exists because observed production errors show Gemini +
  // Claude Sonnet can both be overloaded simultaneously, and Haiku usually
  // has capacity when Sonnet doesn't.
  const useProFirst = locale && locale !== "en";
  const firstModel = useProFirst ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const secondModel = useProFirst ? "gemini-2.5-flash" : "gemini-2.5-pro";

  try {
    return await withRetry(
      () => callGemini(systemPrompt, userPrompt, firstModel),
      `Consultation/${firstModel}`,
    );
  } catch (err) {
    console.warn(`Consultation: ${firstModel} failed —`, err instanceof Error ? err.message : err);
    try {
      return await withRetry(
        () => callGemini(systemPrompt, userPrompt, secondModel),
        `Consultation/${secondModel}`,
      );
    } catch (err2) {
      console.warn(
        `Consultation: ${secondModel} failed, falling back to Claude Sonnet —`,
        err2 instanceof Error ? err2.message : err2,
      );
      try {
        return await withRetry(
          () => callClaude(systemPrompt, userPrompt, "claude-sonnet-4-20250514"),
          `Consultation/claude-sonnet`,
        );
      } catch (err3) {
        console.warn(
          `Consultation: Claude Sonnet failed, final fallback to Claude Haiku —`,
          err3 instanceof Error ? err3.message : err3,
        );
        // Final fallback. If Haiku also fails, the error propagates and
        // the Promise.all catch in the main handler logs it as Part N failed.
        return await callClaude(systemPrompt, userPrompt, "claude-haiku-4-5-20251001");
      }
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
      case "poll":
        return handlePoll(body);
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

/* --- Poll Consultation Status (for progressive rendering) --- */

async function handlePoll({ consultationId, userId }: { consultationId?: string; userId: string }) {
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // If consultationId provided, poll specific consultation
  // Otherwise, find the latest generating consultation for this user
  let query = consultationId
    ? `consultations?id=eq.${consultationId}&user_id=eq.${userId}&select=id,status,report_title,report`
    : `consultations?user_id=eq.${userId}&status=eq.generating&select=id,status,report_title,report&order=created_at.desc&limit=1`;

  const res = await sbFetch(query);
  const results = await res.json();
  const consultation = results?.[0];

  if (!consultation) {
    return NextResponse.json({ status: "none", report: null });
  }
  return NextResponse.json({
    status: consultation.status,
    consultationId: consultation.id,
    report: consultation.report ? {
      title: consultation.report_title || "",
      content: consultation.report,
    } : null,
  });
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

  // ─── [PHASE 1 STEP 3] Auto-create user's own readings row ────────────
  // If the user has no readings yet, bootstrap one from birthInput
  // (which IS the user in consultation flows). Dynamic import keeps the
  // top-level import list untouched. 3s timeout cap — never affects the
  // consultation flow that the client is already waiting on.
  try {
    const { ensureUserReading } = await import("@/lib/auto-create-reading");
    await Promise.race([
      ensureUserReading({
        userId,
        name: birthInput.name,
        gender: birthInput.gender,
        birthDateStr: chartData.birthDate,
        birthHour: birthInput.hour,
        birthHourUnknown: false,
        birthCity: birthInput.city,
        locale: locale || "en",
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);
  } catch {
    // Silent — protects the consultation flow
  }

  // 5. Generate report in 3 PARALLEL parts — progressive save to DB
  try {
    const chartSummary = formatChartSummary(chartData);
    const currentYear = new Date().getFullYear();
    const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const langInstr = getLanguageInstruction(locale);

    // RAG: Classical corpus search based on querent's saju (fails silently)
    let ragPrefix = "";
    let citationMeta: any = null;
    try {
      const sajuDataForRAG = {
        dayStem: chart.pillars.day.stem.zh,
        dayBranch: chart.pillars.day.branch.zh,
        monthStem: chart.pillars.month.stem.zh,
        monthBranch: chart.pillars.month.branch.zh,
        yearStem: chart.pillars.year.stem.zh,
        yearBranch: chart.pillars.year.branch.zh,
        hourStem: chart.pillars.hour.stem.zh,
        hourBranch: chart.pillars.hour.branch.zh,
        dominantElement: chart.dominantElement,
        weakElement: chart.weakestElement,
      };
      const ragContext = await buildRAGContext(
        sajuDataForRAG, 'consultation', (locale as 'ko' | 'en' | 'ja' | 'es' | 'fr')
      );
      ragPrefix = ragContext.contextText || "";
      if (ragContext.citations && ragContext.citations.length > 0) {
        citationMeta = {
          totalCorpusSize: 562,
          sourceCount: new Set(ragContext.citations.map((c: any) => c.source_name_ko)).size,
          matchCount: ragContext.citations.length,
          topSimilarity: Math.round(Math.max(...ragContext.citations.map((c: any) => c.similarity)) * 1000) / 1000,
          queryDimensions: 1536,
          dayMaster: chart.pillars.day.stem.zh,
          monthBranch: chart.pillars.month.branch.zh,
          citations: ragContext.citations.map((c: any) => ({
            source: '',
            source_name_ko: c.source_name_ko,
            source_name_cn: c.source_name_cn,
            chapter: c.chapter,
            excerpt: c.excerpt,
            similarity: Math.round(c.similarity * 1000) / 1000,
          })),
        };
      }
    } catch (ragErr) {
      console.warn("[consultation] RAG context failed (continuing without):", ragErr);
      ragPrefix = "";
    }

    const baseContext = `${ragPrefix}Category: ${category}\nQuestion: "${question}"\nDate: ${currentDate} (Year: ${currentYear})\n\nQUERENT'S SAJU CHART:\n${chartSummary}`;

    // Part prompts — each generates a section independently
    const part1System = `${getLanguageHeader(locale)}You are a master Saju consultant. Generate the OPENING of a consultation report.\n\nYour task: Write a compelling title (as # heading), an opening that acknowledges their question, and a detailed Chart Analysis section showing how their birth chart relates to this question (Day Master, element balance, pillar dynamics).\n\nTarget: 800-1000 words. Start with: # Title\nThen ## sections. Use **bold** for key terms. ${langInstr}\nNEVER mention you are AI.`;

    const part2System = `${getLanguageHeader(locale)}You are a master Saju consultant. Generate the MIDDLE SECTIONS of a consultation report.\n\nYour task: Write 3 sections:\n1. ## Current Cycle Reading — what the current year/period means for this area\n2. ## Detailed Guidance — 3-5 specific insights with timing recommendations\n3. ## Favorable and Challenging Periods — specific months or seasons ahead\n\nTarget: 1200-1500 words. Use ## for sections, ### for subsections. Use **bold** for key terms. ${langInstr}\nNEVER mention you are AI. Reference specific chart elements.`;

    const part3System = `${getLanguageHeader(locale)}You are a master Saju consultant. Generate the CLOSING SECTIONS of a consultation report.\n\nYour task: Write 2 sections:\n1. ## Elemental Remedies — practical suggestions aligned with their element needs\n2. ## Closing Reflection — empowering summary that ties everything together\n\nTarget: 500-700 words. Use ## for sections. Use **bold** for key terms. ${langInstr}\nNEVER mention you are AI.`;

    const parts: (string | null)[] = [null, null, null];
    let reportTitle = "";
    const consultId = consultation.id;

    // Save accumulated parts to DB
    const saveProgress = async () => {
      const combined = parts.filter(Boolean).join("\n\n");
      if (combined.length < 20) return;
      // Extract title from part 1
      if (parts[0] && !reportTitle) {
        const match = parts[0].match(/^#\s+(.+)/m);
        reportTitle = match ? match[1].trim() : `${category} Consultation`;
      }
      await sbFetch(`consultations?id=eq.${consultId}`, {
        method: "PATCH",
        body: JSON.stringify({
          report: combined,
          report_title: reportTitle || `${category} Consultation`,
        }),
      });
    };

    // Run 3 parts in parallel
    await Promise.all([
      callAI(part1System, baseContext, locale).then(async (content) => {
        parts[0] = content;
        await saveProgress();
      }).catch((err) => {
        console.error("[consultation] Part1 failed:", err);
      }),

      callAI(part2System, baseContext, locale).then(async (content) => {
        parts[1] = content;
        await saveProgress();
      }).catch((err) => {
        console.error("[consultation] Part2 failed:", err);
      }),

      callAI(part3System, baseContext, locale).then(async (content) => {
        parts[2] = content;
        await saveProgress();
      }).catch((err) => {
        console.error("[consultation] Part3 failed:", err);
      }),
    ]);

    // Combine final
    const finalContent = parts.filter(Boolean).join("\n\n");
    if (!finalContent || finalContent.length < 100) {
      throw new Error("All parts failed or too short");
    }

    if (!reportTitle) {
      const match = finalContent.match(/^#\s+(.+)/m);
      reportTitle = match ? match[1].trim() : `${category} Consultation`;
    }

    // Success! Deduct credit
    await sbFetch(`consultation_credits?id=eq.${creditId}`, {
      method: "PATCH",
      body: JSON.stringify({ used_credits: currentUsed + 1 }),
    });

    // Save final report
    await sbFetch(`consultations?id=eq.${consultId}`, {
      method: "PATCH",
      body: JSON.stringify({
        report_title: reportTitle,
        report: finalContent,
        status: "completed",
        completed_at: new Date().toISOString(),
        ...(citationMeta ? { citation_meta: citationMeta } : {}),
      }),
    });

    return NextResponse.json({
      consultationId: consultId,
      needsClarification: false,
      report: { title: reportTitle, content: finalContent },
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

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const systemPrompt = `${getLanguageHeader(locale)}You are a master-level Saju consultant with decades of experience interpreting the Korean Four Pillars of Destiny. You provide deep, personalized consultations that weave together the querent's birth chart elements, current cosmic cycles, and specific life circumstances.

IMPORTANT: Today's date is ${currentDate}. The current year is ${currentYear}. All forecasts and timing guidance must be based on this date. Do NOT reference past years as current.

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
  # Your Career Crossroads: Navigating Change in ${currentYear}
  
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
Consultation Date: ${currentDate} (Year: ${currentYear})

${clarificationContext ? `ADDITIONAL CONTEXT FROM QUERENT:\n${clarificationContext}\n` : ""}

QUERENT'S SAJU CHART:
${chartSummary}

Generate a comprehensive, personalized Saju consultation report. Start with a compelling title (as a # heading), then the full analysis.${getLanguageFooter(locale)}`;

  const content = await callAI(systemPrompt, userPrompt, locale);

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
