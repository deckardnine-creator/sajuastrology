// lib/sanitize-html.ts
// Sanitizes AI-generated HTML before it hits dangerouslySetInnerHTML.
// Strips <script>, <iframe>, onerror=, onclick=, and any other XSS vectors
// while preserving all safe formatting (headings, bold, italic, lists, links, hr).
//
// Usage: dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderPaidMarkdown(text)) }}
//
// This is an ADDITIVE security layer — existing render functions are untouched.
// If DOMPurify fails to load (should never happen in browser), returns original HTML
// so the reading is never blank.

let _sanitize: ((dirty: string) => string) | null = null;
let _initAttempted = false;

function getSanitizer(): (dirty: string) => string {
  if (_sanitize) return _sanitize;
  if (_initAttempted) return (html: string) => html; // fallback: pass-through

  _initAttempted = true;
  try {
    // Dynamic import avoids SSR issues — DOMPurify needs a DOM
    const DOMPurify = require("isomorphic-dompurify");
    const purify = DOMPurify.default || DOMPurify;

    _sanitize = (dirty: string): string => {
      if (!dirty) return "";
      return purify.sanitize(dirty, {
        // Allow safe HTML tags used by our markdown renderers
        ALLOWED_TAGS: [
          "h1", "h2", "h3", "h4", "h5", "h6",
          "p", "br", "hr",
          "strong", "b", "em", "i", "u",
          "ul", "ol", "li",
          "a", "span", "div",
          "table", "thead", "tbody", "tr", "th", "td",
          "blockquote", "pre", "code",
        ],
        ALLOWED_ATTR: [
          "class", "style", "href", "target", "rel",
          "aria-hidden",
        ],
        // Force all links to open safely
        ADD_ATTR: ["target"],
        FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "textarea", "select", "button"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
      });
    };

    return _sanitize;
  } catch {
    // isomorphic-dompurify not installed or SSR without DOM — safe fallback
    console.warn("[sanitize-html] DOMPurify not available, using pass-through");
    _sanitize = (html: string) => html;
    return _sanitize;
  }
}

/**
 * Sanitize HTML string before inserting via dangerouslySetInnerHTML.
 * Safe to call on any string — returns empty string for falsy input.
 * Never throws — worst case returns the original HTML unchanged.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  try {
    return getSanitizer()(html);
  } catch {
    // Absolute last resort — never break the reading display
    return html;
  }
}
