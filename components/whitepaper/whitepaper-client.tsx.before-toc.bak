"use client";

/**
 * components/whitepaper/whitepaper-client.tsx
 *
 * RimSaju v2 Whitepaper — public viewer.
 *
 * Design notes:
 *  - Korean is the source of truth (v0.4). English/Japanese fall back to Korean
 *    until translation ships; the language toggle remains visible so users see
 *    that the engine is multilingual even when the translation is pending.
 *  - Renders the markdown source directly with a small in-house parser. We
 *    deliberately avoid adding `react-markdown` or `marked` to the bundle —
 *    the document is large and shipping it through a dependency-free path is
 *    safer for Vercel builds and faster for the reader.
 *  - Copy / right-click / drag are blocked at the JS layer for a soft IP
 *    barrier. This is a deterrent, not a guarantee. A persistent visible
 *    watermark + the explicit copyright notice in the body are the real
 *    protection.
 *  - `select-none` + `oncontextmenu` are intentionally redundant with the
 *    JS handlers — cooperative browsers respect the CSS, hostile clients
 *    still hit the JS layer.
 */

import { useEffect, useMemo, useState } from "react";
import {
  whitepaperContentKo,
  whitepaperContentEn,
  whitepaperContentJa,
  WHITEPAPER_VERSION,
  WHITEPAPER_PUBLISHED,
  type WhitepaperLocale,
} from "@/lib/whitepaper-content";

// ---------------------------------------------------------------------------
// Minimal markdown renderer
//
// The whitepaper uses only a small subset of markdown:
//   #, ##, ###, ####  headings
//   **bold**, *italic*
//   GFM tables (| col | col |)
//   horizontal rules (---)
//   plain paragraphs
//   bullet/numbered lists
//
// We render straight into JSX. No HTML strings, no dangerouslySetInnerHTML.
// ---------------------------------------------------------------------------

type MdNode =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "h4"; text: string }
  | { kind: "hr" }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; text: string };

function parseMarkdown(md: string): MdNode[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const nodes: MdNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // horizontal rule
    if (/^---+\s*$/.test(line)) {
      nodes.push({ kind: "hr" });
      i++;
      continue;
    }

    // headings (#### takes precedence over ###)
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^####\s+(.*)$/))) {
      nodes.push({ kind: "h4", text: m[1] });
      i++;
      continue;
    }
    if ((m = line.match(/^###\s+(.*)$/))) {
      nodes.push({ kind: "h3", text: m[1] });
      i++;
      continue;
    }
    if ((m = line.match(/^##\s+(.*)$/))) {
      nodes.push({ kind: "h2", text: m[1] });
      i++;
      continue;
    }
    if ((m = line.match(/^#\s+(.*)$/))) {
      nodes.push({ kind: "h1", text: m[1] });
      i++;
      continue;
    }

    // table — header line containing |, followed by --- separator
    if (line.startsWith("|") && i + 1 < lines.length && /^\s*\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1])) {
      const headerCells = splitTableRow(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      nodes.push({ kind: "table", headers: headerCells, rows });
      continue;
    }

    // unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      nodes.push({ kind: "ul", items });
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      nodes.push({ kind: "ol", items });
      continue;
    }

    // paragraph — accumulate until blank line or special
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,4}\s+/.test(lines[i]) &&
      !/^---+\s*$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("|") &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trimEnd());
      i++;
    }
    nodes.push({ kind: "p", text: buf.join(" ") });
  }

  return nodes;
}

function splitTableRow(line: string): string[] {
  // strip outer pipes, then split. Trim each cell.
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

// inline formatting: **bold**, *italic*. We render as React fragments to keep
// nested marks safe.
function renderInline(text: string): React.ReactNode[] {
  // Tokenize into runs. Process bold first (greedy **...**), then italic.
  const out: React.ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    const boldMatch = rest.match(/\*\*(.+?)\*\*/);
    const italicMatch = rest.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);

    let nextIdx = -1;
    let nextKind: "bold" | "italic" | null = null;
    let nextLen = 0;
    let nextInner = "";

    if (boldMatch && boldMatch.index !== undefined) {
      nextIdx = boldMatch.index;
      nextKind = "bold";
      nextLen = boldMatch[0].length;
      nextInner = boldMatch[1];
    }
    if (
      italicMatch &&
      italicMatch.index !== undefined &&
      (nextIdx === -1 || italicMatch.index < nextIdx)
    ) {
      nextIdx = italicMatch.index;
      nextKind = "italic";
      nextLen = italicMatch[0].length;
      nextInner = italicMatch[1];
    }

    if (nextKind === null || nextIdx === -1) {
      out.push(rest);
      break;
    }

    if (nextIdx > 0) out.push(rest.slice(0, nextIdx));
    if (nextKind === "bold") {
      out.push(<strong key={`b${key++}`}>{nextInner}</strong>);
    } else {
      out.push(<em key={`i${key++}`}>{nextInner}</em>);
    }
    rest = rest.slice(nextIdx + nextLen);
  }

  return out;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

function MarkdownRenderer({ source }: { source: string }) {
  const nodes = useMemo(() => parseMarkdown(source), [source]);

  return (
    <div className="whitepaper-prose">
      {nodes.map((n, idx) => {
        switch (n.kind) {
          case "h1":
            return (
              <h1
                key={idx}
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mt-16 mb-6 leading-tight gold-gradient-text"
              >
                {renderInline(n.text)}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={idx}
                className="font-serif text-2xl sm:text-3xl font-bold mt-14 mb-5 leading-tight border-b border-amber-500/20 pb-3"
              >
                {renderInline(n.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={idx}
                className="font-serif text-xl sm:text-2xl font-semibold mt-10 mb-4 text-amber-100/90"
              >
                {renderInline(n.text)}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={idx}
                className="font-serif text-lg sm:text-xl font-semibold mt-8 mb-3 text-amber-100/80"
              >
                {renderInline(n.text)}
              </h4>
            );
          case "hr":
            return <hr key={idx} className="my-12 border-amber-500/15" />;
          case "p":
            return (
              <p
                key={idx}
                className="text-base sm:text-[1.0625rem] leading-[1.85] text-foreground/85 my-5"
              >
                {renderInline(n.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={idx} className="my-5 space-y-2 list-disc list-outside pl-6 text-base sm:text-[1.0625rem] leading-[1.85] text-foreground/85 marker:text-amber-500/60">
                {n.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="my-5 space-y-2 list-decimal list-outside pl-6 text-base sm:text-[1.0625rem] leading-[1.85] text-foreground/85 marker:text-amber-500/60">
                {n.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={idx} className="my-8 -mx-4 sm:mx-0 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-500/30">
                      {n.headers.map((h, j) => (
                        <th
                          key={j}
                          className="text-left py-3 px-3 font-semibold text-amber-100/90 whitespace-nowrap"
                        >
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {n.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-b border-amber-500/10 hover:bg-amber-500/5"
                      >
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-3 px-3 align-top text-foreground/80">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Watermark overlay
// ---------------------------------------------------------------------------

function Watermark() {
  // Tiled, very subtle. Visible enough to deter casual screenshots/redistribution
  // but light enough to not interfere with reading.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] select-none"
      style={{
        backgroundImage: `repeating-linear-gradient(-30deg, transparent 0 180px, rgba(245, 158, 11, 0.045) 180px 181px)`,
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center opacity-[0.045]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='220'><text x='10' y='110' font-family='serif' font-size='28' fill='%23F59E0B' transform='rotate(-22 60 110)'>© Rimfactory · sajuastrology.com</text></svg>\")",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

const LOCALE_LABEL: Record<WhitepaperLocale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export default function WhitepaperClient({
  initialLocale = "ko",
}: {
  initialLocale?: WhitepaperLocale;
}) {
  const [locale, setLocale] = useState<WhitepaperLocale>(initialLocale);

  // ---------------- protection layer ----------------
  // None of these are guarantees. Devtools and screenshot tools defeat them
  // trivially. They exist so casual copy-paste / right-click-save / drag-out
  // doesn't grab the text effortlessly.
  useEffect(() => {
    const blockEvent = (e: Event) => e.preventDefault();
    const blockKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // Block common copy / save / print / view-source / select-all combos.
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "s", "a", "p", "u"].includes(k)) {
        e.preventDefault();
      }
      // Block PrintScreen — note: OS-level capture cannot be blocked by JS.
      if (k === "printscreen") {
        e.preventDefault();
        // Best-effort: blank clipboard so PrtSc on Windows doesn't silently win.
        if (navigator.clipboard) {
          navigator.clipboard.writeText("© Rimfactory — 무단 복제·배포 금지").catch(() => {});
        }
      }
    };

    document.addEventListener("contextmenu", blockEvent);
    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("dragstart", blockEvent);
    document.addEventListener("selectstart", blockEvent);
    document.addEventListener("keydown", blockKey);

    return () => {
      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("dragstart", blockEvent);
      document.removeEventListener("selectstart", blockEvent);
      document.removeEventListener("keydown", blockKey);
    };
  }, []);

  // Choose the body. Korean is the source of truth; until EN/JA ship we mirror
  // Korean but show a small notice at the top.
  const body =
    locale === "ko"
      ? whitepaperContentKo
      : locale === "ja"
        ? whitepaperContentJa
        : whitepaperContentEn;

  const showFallbackNotice = locale !== "ko";

  return (
    <div
      className="relative min-h-screen bg-background text-foreground select-none"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Watermark />

      <article className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* meta strip */}
        <div className="mb-10 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-foreground/60">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            RimSaju Whitepaper {WHITEPAPER_VERSION}
          </span>
          <span className="text-foreground/30">·</span>
          <span>{WHITEPAPER_PUBLISHED}</span>
          <span className="text-foreground/30">·</span>
          <span>Rimfactory</span>
        </div>

        {/* Language toggle */}
        <div className="mb-12 flex items-center gap-2 text-sm">
          {(["ko", "en", "ja"] as WhitepaperLocale[]).map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`rounded-full px-4 py-1.5 border transition-colors ${
                locale === loc
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-100"
                  : "border-foreground/15 text-foreground/55 hover:border-foreground/30"
              }`}
            >
              {LOCALE_LABEL[loc]}
            </button>
          ))}
        </div>

        {showFallbackNotice && (
          <div className="mb-10 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4 text-sm text-foreground/70">
            {locale === "en"
              ? "The English edition is in preparation. Korean source is shown below for now."
              : "英語版・日本語版は準備中です。現在は韓国語版を表示しています。"}
          </div>
        )}

        <MarkdownRenderer source={body} />

        {/* footer note */}
        <footer className="mt-20 pt-10 border-t border-amber-500/15 text-sm text-foreground/55 leading-relaxed">
          <p>
            © 2026 Rimfactory · Chandler. All rights reserved.
          </p>
          <p className="mt-2">
            본 백서의 무단 배포·복제·번역·인용을 금합니다. 학술 인용 및 보도 목적의 인용은 출처를 명시할 경우 허용됩니다. 문의: <span className="text-amber-100/80">info@rimfactory.io</span>
          </p>
        </footer>
      </article>
    </div>
  );
}
