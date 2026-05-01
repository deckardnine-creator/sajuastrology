"use client";

/**
 * components/whitepaper/whitepaper-client.tsx
 *
 * RimSaju v2 Whitepaper — public viewer.
 *
 * v2 changes (chandler 2026-05-01):
 *  - Headings (h1/h2/h3/h4) carry stable slug IDs so the TOC can deep-link.
 *  - The TOC list items beneath "### 목차" are auto-converted to anchor
 *    links that scroll-jump to the right heading. Heading lands ~88px
 *    below the viewport top so the title is clear of the sticky header
 *    and the body sits in the visible center — what chandler asked.
 *  - Right after the Abstract section, a small Chandler signature block
 *    is rendered: "림팩토리 대표 챈들러" + the signature image already
 *    used in /letter (/letter/chandler-signature.webp).
 *
 * Design notes (unchanged):
 *  - Korean is the source of truth (v0.4). EN/JA fall back to Korean.
 *  - In-house markdown parser, no react-markdown dependency.
 *  - Copy / right-click / drag are blocked at the JS layer for soft IP
 *    barrier. This is a deterrent, not a guarantee. Real protection is
 *    the persistent watermark + the explicit copyright notice.
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
// Slug helper
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  const cleaned = text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .trim();
  return cleaned
    .replace(/\s+/g, "-")
    .replace(/[(),.·—–:?!"'`]/g, "")
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Markdown parser
// ---------------------------------------------------------------------------

type MdNode =
  | { kind: "h1"; text: string; id: string }
  | { kind: "h2"; text: string; id: string }
  | { kind: "h3"; text: string; id: string }
  | { kind: "h4"; text: string; id: string }
  | { kind: "hr" }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "ul"; items: string[]; isToc: boolean }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; text: string };

function parseMarkdown(md: string): MdNode[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const nodes: MdNode[] = [];
  let i = 0;
  let inTocSection = false;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (!line.trim()) {
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      nodes.push({ kind: "hr" });
      inTocSection = false;
      i++;
      continue;
    }

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^####\s+(.*)$/))) {
      const text = m[1];
      nodes.push({ kind: "h4", text, id: slugify(text) });
      i++;
      continue;
    }
    if ((m = line.match(/^###\s+(.*)$/))) {
      const text = m[1];
      nodes.push({ kind: "h3", text, id: slugify(text) });
      if (/^(목차|目次|Table\s+of\s+Contents)\s*$/i.test(text.trim())) {
        inTocSection = true;
      } else {
        inTocSection = false;
      }
      i++;
      continue;
    }
    if ((m = line.match(/^##\s+(.*)$/))) {
      const text = m[1];
      nodes.push({ kind: "h2", text, id: slugify(text) });
      inTocSection = false;
      i++;
      continue;
    }
    if ((m = line.match(/^#\s+(.*)$/))) {
      const text = m[1];
      nodes.push({ kind: "h1", text, id: slugify(text) });
      inTocSection = false;
      i++;
      continue;
    }

    if (
      line.startsWith("|") &&
      i + 1 < lines.length &&
      /^\s*\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1])
    ) {
      const headerCells = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      nodes.push({ kind: "table", headers: headerCells, rows });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      nodes.push({ kind: "ul", items, isToc: inTocSection });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      nodes.push({ kind: "ol", items });
      continue;
    }

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
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

function renderInline(text: string): React.ReactNode[] {
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
// TOC link resolver
// ---------------------------------------------------------------------------

function buildHeadingIndex(nodes: MdNode[]) {
  const exact = new Map<string, string>();
  for (const n of nodes) {
    if (n.kind === "h1" || n.kind === "h2" || n.kind === "h3") {
      const plain = n.text
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .trim();
      exact.set(plain, n.id);
    }
  }
  return exact;
}

function resolveTocLink(
  itemText: string,
  index: Map<string, string>,
): string | null {
  const plain = itemText
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .trim();
  if (index.has(plain)) return index.get(plain)!;
  for (const [headingText, slug] of index.entries()) {
    if (headingText.startsWith(plain) || plain.startsWith(headingText)) {
      return slug;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

const SCROLL_MARGIN = "scroll-mt-24";

function MarkdownRenderer({
  source,
  signatureBlock,
}: {
  source: string;
  signatureBlock?: React.ReactNode;
}) {
  const nodes = useMemo(() => parseMarkdown(source), [source]);
  const headingIndex = useMemo(() => buildHeadingIndex(nodes), [nodes]);

  let signatureRendered = false;
  let lastH3WasAbstract = false;

  return (
    <div className="whitepaper-prose">
      {nodes.map((n, idx) => {
        let injectSignatureAfter: React.ReactNode = null;
        if (
          !signatureRendered &&
          lastH3WasAbstract &&
          (n.kind === "hr" ||
            n.kind === "h2" ||
            n.kind === "h3" ||
            n.kind === "h1")
        ) {
          injectSignatureAfter = signatureBlock ?? null;
          signatureRendered = true;
          lastH3WasAbstract = false;
        }

        let rendered: React.ReactNode = null;
        switch (n.kind) {
          case "h1":
            rendered = (
              <h1
                key={idx}
                id={n.id}
                className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mt-16 mb-6 leading-tight gold-gradient-text ${SCROLL_MARGIN}`}
              >
                {renderInline(n.text)}
              </h1>
            );
            break;
          case "h2":
            rendered = (
              <h2
                key={idx}
                id={n.id}
                className={`font-serif text-2xl sm:text-3xl font-bold mt-14 mb-5 leading-tight border-b border-amber-500/20 pb-3 ${SCROLL_MARGIN}`}
              >
                {renderInline(n.text)}
              </h2>
            );
            break;
          case "h3":
            if (/^(초록|Abstract|抄録|要旨)/i.test(n.text.trim())) {
              lastH3WasAbstract = true;
            }
            rendered = (
              <h3
                key={idx}
                id={n.id}
                className={`font-serif text-xl sm:text-2xl font-semibold mt-10 mb-4 text-amber-100/90 ${SCROLL_MARGIN}`}
              >
                {renderInline(n.text)}
              </h3>
            );
            break;
          case "h4":
            rendered = (
              <h4
                key={idx}
                id={n.id}
                className={`font-serif text-lg sm:text-xl font-semibold mt-8 mb-3 text-amber-100/80 ${SCROLL_MARGIN}`}
              >
                {renderInline(n.text)}
              </h4>
            );
            break;
          case "hr":
            rendered = <hr key={idx} className="my-12 border-amber-500/15" />;
            break;
          case "p":
            rendered = (
              <p
                key={idx}
                className="text-base sm:text-[1.0625rem] leading-[1.85] text-foreground/85 my-5"
              >
                {renderInline(n.text)}
              </p>
            );
            break;
          case "ul": {
            if (n.isToc) {
              rendered = (
                <ul
                  key={idx}
                  className="my-5 space-y-2.5 list-none pl-0 text-base sm:text-[1.0625rem] leading-[1.85] text-foreground/85"
                >
                  {n.items.map((item, j) => {
                    const slug = resolveTocLink(item, headingIndex);
                    if (slug) {
                      return (
                        <li
                          key={j}
                          className="pl-4 border-l-2 border-amber-500/20 hover:border-amber-400/60 transition-colors"
                        >
                          <a
                            href={`#${slug}`}
                            className="text-amber-100/85 hover:text-amber-300 transition-colors inline-flex items-baseline gap-2"
                            onClick={(e) => {
                              const target = document.getElementById(slug);
                              if (target) {
                                e.preventDefault();
                                const y =
                                  target.getBoundingClientRect().top +
                                  window.scrollY -
                                  88;
                                window.scrollTo({ top: y, behavior: "smooth" });
                                history.replaceState(null, "", `#${slug}`);
                              }
                            }}
                          >
                            <span className="text-amber-500/60 text-sm">→</span>
                            <span>{renderInline(item)}</span>
                          </a>
                        </li>
                      );
                    }
                    return (
                      <li key={j} className="pl-4 text-foreground/65">
                        {renderInline(item)}
                      </li>
                    );
                  })}
                </ul>
              );
            } else {
              rendered = (
                <ul
                  key={idx}
                  className="my-5 space-y-2 list-disc list-outside pl-6 text-base sm:text-[1.0625rem] leading-[1.85] text-foreground/85 marker:text-amber-500/60"
                >
                  {n.items.map((it, j) => (
                    <li key={j}>{renderInline(it)}</li>
                  ))}
                </ul>
              );
            }
            break;
          }
          case "ol":
            rendered = (
              <ol
                key={idx}
                className="my-5 space-y-2 list-decimal list-outside pl-6 text-base sm:text-[1.0625rem] leading-[1.85] text-foreground/85 marker:text-amber-500/60"
              >
                {n.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            );
            break;
          case "table":
            rendered = (
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
                          <td
                            key={ci}
                            className="py-3 px-3 align-top text-foreground/80"
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            break;
        }

        return (
          <span key={`f${idx}`} style={{ display: "contents" }}>
            {rendered}
            {injectSignatureAfter}
          </span>
        );
      })}

      {!signatureRendered && signatureBlock}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

function Watermark() {
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
// Signature block
// ---------------------------------------------------------------------------

function SignatureBlock() {
  return (
    <div className="my-12 sm:my-16 flex flex-col items-center sm:items-start gap-3">
      <div className="text-sm sm:text-base text-foreground/70">
        림팩토리 대표
      </div>
      <img
        src="/letter/chandler-signature.webp"
        alt="Chandler — Rimfactory"
        className="h-12 sm:h-14 w-auto opacity-90"
        loading="lazy"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="text-base sm:text-lg font-serif text-amber-100/90">
        챈들러 (Chandler)
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
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

  useEffect(() => {
    const blockEvent = (e: Event) => e.preventDefault();
    const blockKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "x", "s", "a", "p", "u"].includes(k)
      ) {
        e.preventDefault();
      }
      if (k === "printscreen") {
        e.preventDefault();
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText("© Rimfactory — 무단 복제·배포 금지")
            .catch(() => {});
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

  // Re-trigger anchor scroll on language change so deep links keep working.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    const slug = hash.slice(1);
    const t = window.setTimeout(() => {
      const target = document.getElementById(slug);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [locale]);

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

        <MarkdownRenderer
          source={body}
          signatureBlock={<SignatureBlock />}
        />

        <footer className="mt-20 pt-10 border-t border-amber-500/15 text-sm text-foreground/55 leading-relaxed">
          <p>© 2026 Rimfactory · Chandler. All rights reserved.</p>
          <p className="mt-2">
            본 백서의 무단 배포·복제·번역·인용을 금합니다. 학술 인용 및 보도 목적의 인용은 출처를 명시할 경우 허용됩니다. 문의:{" "}
            <span className="text-amber-100/80">info@rimfactory.io</span>
          </p>
        </footer>
      </article>
    </div>
  );
}
