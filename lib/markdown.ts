// Shared Markdown → HTML renderer with XSS sanitization
// Used by: consultation-client.tsx (and future components)

export function renderMarkdown(md: string, options?: { stripFirstHeading?: boolean }): string {
  const stripH1 = options?.stripFirstHeading ?? true;

  let text = md;
  if (stripH1) {
    text = text.replace(/^#\s+.+\n*/m, "").trim();
  }

  // ── XSS sanitization — remove dangerous tags/attributes ──
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  text = text.replace(/<object[\s\S]*?<\/object>/gi, "");
  text = text.replace(/<embed[\s\S]*?>/gi, "");
  text = text.replace(/<link[\s\S]*?>/gi, "");
  text = text.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "");
  text = text.replace(/javascript\s*:/gi, "");

  // Horizontal rules
  text = text.replace(/^---+$/gm, '<hr class="my-6 border-border/50" />');

  // Headers (process ### before ## before #)
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');

  // Bold & italic (order matters)
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Bullet lists — wrap consecutive <li> items in <ul>
  text = text.replace(/^[-•] (.+)$/gm, '{{LI}}$1{{/LI}}');
  text = text.replace(/({{LI}}[\s\S]*?{{\/LI}}\n?)+/g, (match) => {
    const items = match.replace(/{{LI}}([\s\S]*?){{\/LI}}/g, '<li>$1</li>');
    return `<ul>${items}</ul>`;
  });

  // Numbered lists
  text = text.replace(/^\d+\.\s+(.+)$/gm, '{{OLI}}$1{{/OLI}}');
  text = text.replace(/({{OLI}}[\s\S]*?{{\/OLI}}\n?)+/g, (match) => {
    const items = match.replace(/{{OLI}}([\s\S]*?){{\/OLI}}/g, '<li>$1</li>');
    return `<ol>${items}</ol>`;
  });

  // Paragraphs — split by double newlines, wrap non-tag lines
  text = text
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|li|hr|p|div|blockquote)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  // Clean up any stray empty paragraphs
  text = text.replace(/<p>\s*<\/p>/g, "");

  return text;
}
