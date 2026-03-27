"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

interface ConsultationRecord {
  id: string;
  category: string;
  initial_question: string;
  report_title: string | null;
  report: string | null;
  status: string;
  created_at: string;
}

function renderMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/^### (.+)$/gm, '<h3 class="font-serif text-sm font-semibold text-primary/80 mt-4 mb-1.5">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-serif text-base font-semibold text-primary border-b border-primary/20 pb-1 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-serif text-lg font-bold text-primary mt-0 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-foreground/80">$1</em>')
    .replace(/^[-•] (.+)$/gm, '<li class="text-foreground/85 leading-relaxed mb-1 ml-4">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="my-2 list-disc space-y-0.5">${m}</ul>`)
    .replace(/^---$/gm, '<hr class="border-border/30 my-4" />')
    .split(/\n\n+/)
    .map(block => {
      const b = block.trim();
      if (!b) return "";
      if (b.startsWith("<")) return b;
      return `<p class="text-foreground/85 leading-[1.8] mb-3">${b.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
}

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  career: { en: "Career & Work", ko: "직업 & 일", ja: "仕事" },
  love: { en: "Love & Relations", ko: "연애 & 관계", ja: "恋愛" },
  timing: { en: "Timing", ko: "시기 & 결정", ja: "タイミング" },
  wealth: { en: "Wealth", ko: "재물 & 재정", ja: "財運" },
  health: { en: "Health", ko: "건강 & 웰빙", ja: "健康" },
  general: { en: "General", ko: "종합 운세", ja: "総合" },
};

export function ConsultationHistory() {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("consultations")
        .select("id,category,initial_question,report_title,report,status,created_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);
      setConsultations(data || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading || consultations.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {locale === "ko" ? "상담 내역" : locale === "ja" ? "相談履歴" : "Consultation History"}
        </h2>
      </div>

      <div className="space-y-3">
        {consultations.map((c) => {
          const isOpen = expanded === c.id;
          const catLabel = CATEGORY_LABELS[c.category]?.[locale] || c.category;
          const date = new Date(c.created_at).toLocaleDateString(
            locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US",
            { month: "short", day: "numeric", year: "numeric" }
          );

          return (
            <div key={c.id} className="bg-card/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : c.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-purple-500/5 transition-colors"
              >
                <Crown className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">
                      {catLabel}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                      <Calendar className="w-3 h-3" />{date}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground/90 truncate">
                    {c.report_title || c.initial_question}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
              </button>

              {isOpen && c.report && (
                <div className="px-4 pb-4 border-t border-border/30">
                  <div
                    className="prose prose-invert prose-sm max-w-none mt-4
                      prose-headings:font-serif prose-headings:text-primary
                      prose-p:text-foreground/85 prose-p:leading-[1.8]
                      prose-strong:text-foreground prose-li:text-foreground/85"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(c.report) }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link href="/consultation"
          className="text-xs text-purple-400/70 hover:text-purple-400 transition-colors">
          {locale === "ko" ? "+ 새 상담 시작하기" : locale === "ja" ? "+ 新しい相談を始める" : "+ Start New Consultation"}
        </Link>
      </div>
    </motion.section>
  );
}
