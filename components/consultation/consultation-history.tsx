"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  FileText,
  Sparkles,
  ChevronRight,
  Loader2,
  Briefcase,
  Heart,
  Clock,
  TrendingUp,
  Activity,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Consultation {
  id: string;
  category: string;
  initial_question: string;
  report_title: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const CATEGORY_ICONS: Record<string, any> = {
  career: Briefcase,
  love: Heart,
  timing: Clock,
  wealth: TrendingUp,
  health: Activity,
  general: HelpCircle,
};

const CATEGORY_COLORS: Record<string, string> = {
  career: "#3B82F6",
  love: "#EC4899",
  timing: "#F59E0B",
  wealth: "#10B981",
  health: "#8B5CF6",
  general: "#6B7280",
};

export function ConsultationHistory() {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
    const timeout = setTimeout(() => { setLoading(false); }, 8000);
    return () => clearTimeout(timeout);
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: consults } = await supabase
        .from("consultations")
        .select("id, category, initial_question, report_title, status, created_at, completed_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setConsultations(consults || []);

      const { data: creds } = await supabase
        .from("consultation_credits")
        .select("total_credits, used_credits")
        .eq("user_id", user.id);

      const remaining = (creds || []).reduce(
        (sum, c) => sum + (c.total_credits - c.used_credits),
        0
      );
      setCredits(remaining);
    } catch {
      setConsultations([]);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (consultationId: string) => {
    if (expandedId === consultationId) {
      setExpandedId(null);
      setExpandedReport(null);
      return;
    }

    setExpandedId(consultationId);
    setLoadingReport(true);

    const { data } = await supabase
      .from("consultations")
      .select("report")
      .eq("id", consultationId)
      .single();

    setExpandedReport(data?.report || null);
    setLoadingReport(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (consultations.length === 0 && credits === 0) {
    return null;
  }

  const dateLocaleMap = { en: "en-US", ko: "ko-KR", ja: "ja-JP" } as const;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase flex items-center gap-2">
          <Crown className="w-4 h-4 text-purple-400" />
          {t("ch.title", locale)}
        </h2>
        {credits > 0 && (
          <Link
            href="/consultation"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {t("ch.newConsult", locale)} <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Credits Bar */}
      <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {credits > 0
                  ? `${credits} ${credits !== 1 ? t("ch.remaining", locale) : t("ch.remaining1", locale)}`
                  : t("ch.noRemaining", locale)}
              </p>
              <p className="text-xs text-muted-foreground">
                {consultations.length > 0
                  ? `${consultations.filter((c) => c.status === "completed").length} ${t("ch.completed", locale)}`
                  : t("ch.getGuidance", locale)}
              </p>
            </div>
          </div>

          {credits > 0 ? (
            <Link href="/consultation">
              <Button size="sm" variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                {t("ch.ask", locale)}
              </Button>
            </Link>
          ) : (
            <Link href="/consultation">
              <Button
                size="sm"
                className="text-xs"
                style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", color: "white" }}
              >
                <Crown className="w-3 h-3 mr-1" />
                {t("ch.getMore", locale)}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Consultation List */}
      {consultations.length > 0 && (
        <div className="space-y-2">
          {(showAll ? consultations : consultations.slice(0, 3)).map((c) => {
            const Icon = CATEGORY_ICONS[c.category] || HelpCircle;
            const color = CATEGORY_COLORS[c.category] || "#6B7280";
            const isExpanded = expandedId === c.id;

            return (
              <div key={c.id} className="bg-card/50 backdrop-blur border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => c.status === "completed" && loadReport(c.id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.report_title || c.initial_question}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString(dateLocaleMap[locale] || "en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {c.status !== "completed" && (
                        <span className="ml-2 text-amber-400">· {c.status}</span>
                      )}
                    </p>
                  </div>
                  {c.status === "completed" && (
                    <ChevronRight
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border"
                  >
                    {loadingReport ? (
                      <div className="p-4 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : expandedReport ? (
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground line-clamp-4 mb-3 whitespace-pre-line">
                          {expandedReport
                            .replace(/^#+ .+$/gm, "")
                            .replace(/\*\*(.+?)\*\*/g, "$1")
                            .replace(/\*(.+?)\*/g, "$1")
                            .replace(/^[-•] /gm, "• ")
                            .replace(/^\d+\.\s/gm, "")
                            .replace(/---+/g, "")
                            .replace(/\n{3,}/g, "\n\n")
                            .trim()
                            .slice(0, 500)}
                          ...
                        </div>
                        <Link href={`/consultation?view=${c.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {t("ch.readFull", locale)}
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 text-xs text-muted-foreground">
                        {t("ch.notAvailable", locale)}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
          {consultations.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-sm text-primary hover:underline"
            >
              {t("ch.showAll", locale)} {consultations.length}
            </button>
          )}
        </div>
      )}
    </motion.section>
  );
}
