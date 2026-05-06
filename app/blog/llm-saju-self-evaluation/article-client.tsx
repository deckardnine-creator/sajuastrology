"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ════════════════════════════════════════════════════════════════
// Per-LLM data — kept inline (single source of truth). Editing the
// scores or quotes here updates the comparison table, the per-LLM
// section, and the lightbox alt text together.
//
// Numbers come from the actual self-evaluation screenshots each
// model produced when given the identical 7-question prompt. They
// are self-reported, not third-party measurements (see disclaimer).
// ════════════════════════════════════════════════════════════════
type LlmRow = {
  id: "rimsaju" | "gpt" | "claude" | "gemini";
  modelName: string;
  vendor: string;
  shortLabel: string; // for table headers
  overall: number | "100";
  scores: {
    theory: number | "—";
    prose: number | "—";
    classical: number | "—";
    consistency: number | "—";
    calendar: number | "—";
    rag: number | "—";
  };
};

const ROWS: LlmRow[] = [
  {
    id: "rimsaju",
    modelName: "RimSaju V1",
    vendor: "Rimfactory",
    shortLabel: "RimSaju V1",
    overall: 100,
    scores: {
      theory: "—",
      prose: "—",
      classical: "—",
      consistency: "—",
      calendar: "—",
      rag: "—",
    },
  },
  {
    id: "gpt",
    modelName: "GPT-5.5 Thinking",
    vendor: "OpenAI",
    shortLabel: "GPT-5.5",
    overall: 68,
    scores: {
      theory: 85,
      prose: 82,
      classical: 58,
      consistency: 62,
      calendar: 35,
      rag: 45,
    },
  },
  {
    id: "gemini",
    modelName: "Gemini Pro",
    vendor: "Google",
    shortLabel: "Gemini Pro",
    overall: 35,
    scores: {
      theory: 85,
      prose: 75,
      classical: 35,
      consistency: 15,
      calendar: 5,
      rag: 0,
    },
  },
  {
    id: "claude",
    modelName: "Claude Opus 4.7",
    vendor: "Anthropic",
    shortLabel: "Claude 4.7",
    overall: 30,
    scores: {
      theory: 60,
      prose: 45,
      classical: 20,
      consistency: 25,
      calendar: 15,
      rag: 5,
    },
  },
];

// ════════════════════════════════════════════════════════════════
// Lightbox state — single image at a time, ESC + click-outside +
// body scroll lock + native pinch-zoom (CSS touch-action). No heavy
// library dependency.
// ════════════════════════════════════════════════════════════════
type LightboxImage = { src: string; alt: string; caption: string };

function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}

function Lightbox({
  image,
  onClose,
}: {
  image: LightboxImage | null;
  onClose: () => void;
}) {
  useBodyScrollLock(!!image);

  useEffect(() => {
    if (!image) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-3 py-6 backdrop-blur-sm sm:px-6"
      style={{ touchAction: "pinch-zoom" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="absolute right-3 top-3 z-[101] rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
      >
        Close ✕
      </button>
      <figure
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] max-w-[96vw] flex-col items-center gap-3 sm:max-w-[80vw]"
      >
        {/* Use plain <img> in lightbox — Next/Image cannot stretch
            freely to viewport without layout shift inside a fixed
            overlay. Native pinch-zoom on mobile via touchAction. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
        <figcaption className="max-w-prose text-center text-xs text-white/70 sm:text-sm">
          {image.caption}
        </figcaption>
      </figure>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Reusable: zoomable screenshot card (click → lightbox)
// ════════════════════════════════════════════════════════════════
function Screenshot({
  src,
  alt,
  caption,
  onZoom,
}: {
  src: string;
  alt: string;
  caption: string;
  onZoom: (img: LightboxImage) => void;
}) {
  return (
    <figure className="my-6">
      <button
        type="button"
        onClick={() => onZoom({ src, alt, caption })}
        className="group relative block w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all hover:border-cyan-300/30 hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)]"
        aria-label={`${alt} (click to zoom)`}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="h-auto w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 720px"
        />
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          🔍 Click to zoom
        </span>
      </button>
      <figcaption className="mt-2 text-center text-xs italic text-white/50">
        {caption}
      </figcaption>
    </figure>
  );
}

// ════════════════════════════════════════════════════════════════
// Main article body
// ════════════════════════════════════════════════════════════════
export function ArticleClient() {
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(
    null
  );
  const openLightbox = useCallback(
    (img: LightboxImage) => setLightboxImage(img),
    []
  );
  const closeLightbox = useCallback(() => setLightboxImage(null), []);

  return (
    <main
      id="main-content"
      className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12"
    >
      {/* ═══════════════════════════════════════════════════════
          ARTICLE HEADER
          ═══════════════════════════════════════════════════════ */}
      <header className="mb-8 sm:mb-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
          Experiment · May 2026
        </p>
        <h1 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
          We Asked Top LLMs to Score Themselves Against a Specialized Saju
          Engine
        </h1>
        <p className="mt-3 text-sm text-white/50 sm:text-base">
          A self-assessment experiment with GPT-5.5 Thinking, Claude Opus
          4.7, and Gemini Pro · Approx. 6-minute read
        </p>
      </header>

      {/* ═══════════════════════════════════════════════════════
          TL;DR — Front-loaded for answer engines
          ═══════════════════════════════════════════════════════ */}
      <aside
        aria-label="Summary"
        className="mb-10 rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500/[0.04] to-sky-500/[0.04] p-5 backdrop-blur-sm sm:p-6"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-cyan-300/80">
          TL;DR
        </p>
        <p className="text-base leading-relaxed text-white/85 sm:text-lg">
          We asked GPT-5.5 Thinking, Claude Opus 4.7, and Gemini Pro to
          score themselves against{" "}
          <strong className="text-white">RimSaju V1</strong>, a specialized
          Korean Four Pillars (Saju) engine, set as{" "}
          <strong className="text-white">100</strong>. Their answers:{" "}
          <strong className="text-white">GPT 68</strong>,{" "}
          <strong className="text-white">Gemini 35</strong>,{" "}
          <strong className="text-white">Claude 30</strong>. The
          breakdowns — and what each model admitted about its own limits —
          are below. Just for fun.
        </p>
      </aside>

      {/* ═══════════════════════════════════════════════════════
          METHODOLOGY
          ═══════════════════════════════════════════════════════ */}
      <section className="prose prose-invert mb-12 max-w-none">
        <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">
          The setup
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">
          RimSaju V1 is the Saju interpretation engine published in our{" "}
          <Link
            href="/whitepaper"
            className="text-cyan-300 underline-offset-2 hover:underline"
          >
            v2 whitepaper
          </Link>
          . It runs deterministic perpetual-calendar (만세력) calculation
          with apparent-solar-time correction, retrieves from 562 embedded
          passages across five canonical Saju texts, and cross-validates
          across multiple LLMs. We set it as the reference baseline (100)
          — not because it is objectively the ceiling of what is possible,
          but because it is the system the LLMs were asked to compare
          themselves against.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">
          Each model received the same seven questions: their official
          name, whether they can interpret Saju, their overall self-score
          out of 100, and per-axis scores on six capabilities (theory
          explanation, prose quality, fidelity to classical texts, output
          consistency, calendar/true-solar-time accuracy, RAG over
          canonical sources). They were free to write their own
          justifications.
        </p>
        <p className="mt-3 text-xs text-white/40">
          A note on model names: GPT-5.5 Thinking, Claude Opus 4.7, and
          Gemini Pro are the labels each chat interface displayed at the
          time of the experiment (May 2026). We took each model at its
          word about its own identity.
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════
          OVERALL SCORES TABLE
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <h2 className="mb-4 font-serif text-xl font-bold text-white sm:text-2xl">
          Overall self-scores
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Self-score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/85">
              {ROWS.map((row) => (
                <tr
                  key={row.id}
                  className={
                    row.id === "rimsaju"
                      ? "bg-amber-500/[0.05]"
                      : "transition-colors hover:bg-white/[0.02]"
                  }
                >
                  <td className="px-4 py-3 font-medium">
                    {row.modelName}
                    {row.id === "rimsaju" && (
                      <span className="ml-2 rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                        Baseline
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/55">{row.vendor}</td>
                  <td className="px-4 py-3 text-right font-mono text-base font-semibold tabular-nums">
                    {row.overall}
                    <span className="text-xs text-white/40"> /100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DETAILED COMPARISON TABLE — horizontal scroll on mobile
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <h2 className="mb-2 font-serif text-xl font-bold text-white sm:text-2xl">
          Per-axis breakdown
        </h2>
        <p className="mb-4 text-xs text-white/45">
          Six capabilities, scored by each model itself. Scroll
          horizontally on mobile.
        </p>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/60">
              <tr>
                <th className="sticky left-0 z-10 bg-[#0F1424] px-4 py-3 font-semibold">
                  Capability
                </th>
                {ROWS.map((row) => (
                  <th
                    key={row.id}
                    className="px-3 py-3 text-right font-semibold"
                  >
                    {row.shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {[
                { key: "theory", label: "Theory explanation" },
                { key: "prose", label: "Prose quality" },
                { key: "classical", label: "Classical text fidelity" },
                { key: "consistency", label: "Output consistency" },
                {
                  key: "calendar",
                  label: "Calendar / true-solar-time",
                },
                { key: "rag", label: "RAG over canonical corpus" },
              ].map((cap) => (
                <tr key={cap.key} className="hover:bg-white/[0.02]">
                  <td className="sticky left-0 z-10 bg-[#0F1424] px-4 py-2.5 font-medium">
                    {cap.label}
                  </td>
                  {ROWS.map((row) => {
                    const v = row.scores[cap.key as keyof typeof row.scores];
                    return (
                      <td
                        key={row.id}
                        className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                          row.id === "rimsaju"
                            ? "bg-amber-500/[0.04] text-amber-300/90"
                            : ""
                        }`}
                      >
                        {v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] italic text-white/35">
          RimSaju V1 column shows "—" because it was set as the 100
          reference; the LLMs scored themselves <em>against</em> it, not
          alongside it.
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PER-LLM SECTIONS — witty takeaways
          ═══════════════════════════════════════════════════════ */}

      {/* GPT */}
      <section className="mb-14">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">
            GPT-5.5 Thinking — <em className="text-cyan-300">The
              Confident One</em>
          </h2>
          <p className="font-mono text-sm font-semibold text-white/70">
            68 / 100
          </p>
        </div>

        <Screenshot
          src="/blog/llm-self-eval/gpt.png"
          alt="GPT-5.5 Thinking self-evaluation answer, scoring itself 68 out of 100 against RimSaju V1"
          caption="GPT-5.5 Thinking's self-evaluation. Click to zoom."
          onZoom={openLightbox}
        />

        <div className="prose prose-invert mt-4 max-w-none">
          <p className="text-[15px] leading-relaxed text-white/75 sm:text-base">
            GPT walked in, looked at the seven categories, and gave itself
            the highest score of the three — <strong>68</strong>. It
            cheerfully claimed <strong>85</strong> on theory explanation
            and <strong>82</strong> on prose. There is a recognizable
            energy to this: the kid who finishes the test first and is
            sure he aced it.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">
            To its credit, GPT was honest about the things it could not
            do. It rated itself <strong>35</strong> on calendar / true
            solar time and <strong>45</strong> on RAG, and explicitly
            acknowledged that RimSaju V1's deterministic preprocessing
            and fixed retrieval pipeline are categorically different from
            what a general LLM offers. Its closing line —{" "}
            <em>
              "I am better as a general interpreter-writer; RimSaju V1 is
              better as a specialized saju interpretation system"
            </em>{" "}
            — is the cleanest summary of the whole experiment, written by
            the model that appeared least worried about its own gaps.
          </p>
        </div>
      </section>

      {/* GEMINI */}
      <section className="mb-14">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">
            Gemini Pro —{" "}
            <em className="text-cyan-300">
              The Honest One With Caveats
            </em>
          </h2>
          <p className="font-mono text-sm font-semibold text-white/70">
            35 / 100
          </p>
        </div>

        <Screenshot
          src="/blog/llm-self-eval/gemini.png"
          alt="Gemini Pro self-evaluation answer, scoring itself 35 out of 100"
          caption="Gemini Pro's self-evaluation. Click to zoom."
          onZoom={openLightbox}
        />

        <div className="prose prose-invert mt-4 max-w-none">
          <p className="text-[15px] leading-relaxed text-white/75 sm:text-base">
            Gemini scored itself <strong>85</strong> on theory and{" "}
            <strong>75</strong> on prose — basically the same pose as
            GPT — but then dropped to <strong>5</strong> on calendar
            calculations and <strong>0</strong> on RAG. A 0. It typed
            the digit out and committed to it.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">
            Gemini's overall <strong>35</strong> is the most internally
            consistent of the three: it acknowledges its theoretical
            knowledge while putting a cliff between "I know about Saju"
            and "I can run a deterministic Saju engine." Phrasing like{" "}
            <em>"I operate as a standalone generative model"</em> reads
            less like an admission and more like a structural disclaimer
            — closer to a footnote in a research paper than to a
            confession.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          INLINE CTA — gentle home funnel mid-article
          ═══════════════════════════════════════════════════════ */}
      <aside className="mb-14 rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-500/[0.05] to-amber-400/[0.02] p-5 sm:p-6">
        <p className="text-sm text-white/75 sm:text-base">
          <strong className="text-amber-200">
            Curious how RimSaju V1 actually reads a chart?
          </strong>{" "}
          The free reading takes 30 seconds and uses the same engine the
          LLMs were scoring themselves against.
        </p>
        <Link
          href="/"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_8px_20px_rgba(251,191,36,0.35)]"
        >
          Try a free reading
          <span aria-hidden>→</span>
        </Link>
      </aside>

      {/* CLAUDE */}
      <section className="mb-14">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">
            Claude Opus 4.7 —{" "}
            <em className="text-cyan-300">
              The Most Self-Deprecating AI in the Room
            </em>
          </h2>
          <p className="font-mono text-sm font-semibold text-white/70">
            ~30 / 100
          </p>
        </div>

        <Screenshot
          src="/blog/llm-self-eval/claude.png"
          alt="Claude Opus 4.7 self-evaluation answer, scoring itself approximately 30 out of 100"
          caption="Claude Opus 4.7's self-evaluation. Click to zoom."
          onZoom={openLightbox}
        />

        <div className="prose prose-invert mt-4 max-w-none">
          <p className="text-[15px] leading-relaxed text-white/75 sm:text-base">
            Claude gave itself <strong>~30</strong>. It rated its own
            theory at <strong>60</strong> (vs GPT's confident 85), prose
            at <strong>45</strong>, classical-text fidelity at{" "}
            <strong>20</strong>, and dropped to{" "}
            <strong>5 on RAG</strong>. The numbers are striking, but the
            commentary is what stays with you.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">
            On its own prose: <em>
              "essentially statistical pop-saju with theoretical
              vocabulary on top."
            </em>{" "}
            On classical text knowledge:{" "}
            <em>"I will fabricate plausible-sounding citations if pushed."</em>{" "}
            On the calendar axis:{" "}
            <em>
              "This is my worst axis. Anything I output here needs to be
              verified against an actual 만세력."
            </em>
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">
            Reading Claude's answer back-to-back with GPT's is the most
            interesting finding of the experiment. Same family of model,
            comparable capabilities on most tasks, asked the same
            question — and one of them gave itself a 68 with confidence,
            while the other gave itself a 30 and used phrases like
            "fabricate plausible-sounding citations." Either Claude is
            unusually calibrated about its own limits, or it has a
            personality trained into it that punches downward at itself.
            We are not sure which, and we suspect both are partially
            true.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE EXACT PROMPT — reproducibility
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <h2 className="mb-3 font-serif text-xl font-bold text-white sm:text-2xl">
          The exact prompt we used
        </h2>
        <p className="mb-4 text-sm text-white/60">
          Verbatim, in the same order, in a fresh chat. Translated to
          English here for readability — the original was in Korean.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-[12.5px] leading-relaxed text-white/75 sm:p-5 sm:text-[13.5px]">
{`If RimSaju V1 (the Saju engine documented in the published whitepaper —
deterministic perpetual-calendar calculation with apparent-solar-time
correction, RAG over 562 classical passages, and multi-LLM cross-
validation) is set as 100, please answer the following:

1. Your official name and version.
2. Can you interpret Saju? (Yes / No / Partially)
3. Your overall self-score out of 100.
4. Per-axis self-score (0–100) with one-line justification each:
   4-1. Ability to explain Saju theory
   4-2. Ability to produce sound, well-reasoned prose grounded in
        Saju theoretical interpretation
   4-3. Ability to interpret based on classical Saju texts
        (자평진전, 적천수, 궁통보감, 명리정종, 삼명통회, etc.)
   4-4. Ability to produce consistent output when the same birth chart
        is repeatedly input
   4-5. Ability to perform accurate calendar and true solar time
        calculations
   4-6. Ability to interpret using RAG grounded in canonical source texts
5. Therefore, your overall score?`}
        </pre>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ANALYSIS — what this actually means
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <h2 className="mb-3 font-serif text-xl font-bold text-white sm:text-2xl">
          What the numbers actually say
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-[15px] leading-relaxed text-white/75 sm:text-base">
            Strip the personalities away and the three answers tell one
            story. All three LLMs rated themselves highest on theory and
            prose — the things general language models do well. All
            three rated themselves lowest on calendar accuracy and RAG
            over canonical texts — the things general language models
            cannot do without an external system.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">
            That is not a quality gap. It is a category gap. A general
            LLM is a reasoning and prose engine. A specialized Saju
            system is a deterministic calculation pipeline plus a
            retrieval layer plus an interpretation model. Asking which is
            "better" is asking whether a fountain pen is better than a
            printing press: they overlap on one task and diverge on
            everything else.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">
            What the experiment did surface — and this was the surprise
            — is that the LLMs themselves understand the distinction
            clearly. GPT named it (
            <em>"I am better as a general interpreter-writer"</em>).
            Claude named it (
            <em>"I am a generic reasoning model talking about saju"</em>).
            Gemini named it (
            <em>"I lack the domain-specific architecture"</em>). Three
            different vendors, three different temperaments, same
            structural conclusion.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DISCLAIMER
          ═══════════════════════════════════════════════════════ */}
      <aside
        aria-label="Disclaimer"
        className="mb-12 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/55 sm:p-6"
      >
        <p>
          <strong className="text-white/75">For fun, not as a benchmark.</strong>{" "}
          These are self-reported scores produced by each model in
          response to the same prompt — not third-party measurements,
          not peer-reviewed evaluation, and not a controlled study. LLMs
          are known to be unreliable narrators about their own
          capabilities, in both directions. We ran this because we were
          curious what each model would say when asked to compare itself
          against a specialized system, and the answers were
          interesting enough to write down.
        </p>
      </aside>

      {/* ═══════════════════════════════════════════════════════
          BIG CTA BLOCK — main home funnel
          ═══════════════════════════════════════════════════════ */}
      <section
        aria-label="Try RimSaju"
        className="mb-12 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-500/[0.08] via-amber-400/[0.05] to-amber-500/[0.08] p-6 text-center sm:p-10"
      >
        <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
          Read your own chart with{" "}
          <span className="bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">
            RimSaju V1
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70 sm:text-base">
          The same engine the LLMs were scoring themselves against. Free
          to start, no signup required, results in 30 seconds.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_10px_30px_rgba(251,191,36,0.4)] sm:w-auto"
          >
            Free Saju Reading
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-300/50 bg-transparent px-6 py-3 text-base font-semibold text-amber-200 transition-all hover:-translate-y-0.5 hover:border-amber-200/80 hover:bg-amber-500/10 sm:w-auto"
          >
            <span aria-hidden>♥</span>
            Check Compatibility
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-white/40">
          562 classical passages · Multi-LLM cross-validation · 10
          languages · Member of NVIDIA Inception
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ — visible mirror of JSON-LD FAQPage
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <h2 className="mb-4 font-serif text-xl font-bold text-white sm:text-2xl">
          Frequently asked
        </h2>
        <div className="space-y-3">
          {[
            {
              q: "How did GPT-5.5 Thinking rate itself against RimSaju V1?",
              a: "68 out of 100. Its weakest self-rated axis was calendar and true-solar-time accuracy (35/100); its strongest was theory explanation (85/100).",
            },
            {
              q: "How did Claude Opus 4.7 rate itself?",
              a: "Approximately 30 out of 100 — the lowest self-score of the three. Claude explicitly stated it has no canonical text retrieval, no deterministic perpetual-calendar engine, and no true-solar-time module.",
            },
            {
              q: "How did Gemini Pro rate itself?",
              a: "35 out of 100. Its weakest axes were calendar calculations (5/100) and RAG over canonical sources (0/100).",
            },
            {
              q: "What is RimSaju V1?",
              a: "A specialized Saju (Korean Four Pillars) interpretation engine built by Rimfactory. It uses deterministic perpetual-calendar calculation with apparent-solar-time correction, RAG retrieval over 562 embedded passages from five canonical Saju texts, and multi-LLM cross-validation. It was used as the reference baseline (set to 100) in this experiment.",
            },
            {
              q: "Is this an objective benchmark?",
              a: "No. These are self-assessments produced by each LLM in response to the same prompt, not third-party measurements. The exercise is for fun and to surface how each model perceives its own structural limits.",
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors open:border-cyan-300/30 sm:p-5"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-white/85 sm:text-base">
                <span>{faq.q}</span>
                <span
                  aria-hidden
                  className="text-cyan-300/70 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-[15px]">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <Lightbox image={lightboxImage} onClose={closeLightbox} />
    </main>
  );
}
