"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Heart, Briefcase, Users, Shield, Sparkles, Share2, Check, RotateCcw, Calendar } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client";
import { ELEMENT_COLORS } from "@/lib/constants";

interface CompatResult {
  person_a_name: string;
  person_a_element: string;
  person_a_day_master: string;
  person_b_name: string;
  person_b_element: string;
  person_b_day_master: string;
  overall_score: number;
  love_score: number;
  work_score: number;
  friendship_score: number;
  conflict_score: number;
  free_summary: string;
  paid_love: string | null;
  paid_work: string | null;
  paid_friendship: string | null;
  paid_conflict: string | null;
  paid_yearly: string | null;
  share_slug: string;
  created_at: string;
}

const ELEMENT_EMOJI: Record<string, string> = {
  wood: "🌿", fire: "🔥", earth: "🏔", metal: "⚔", water: "🌊",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "#59DE9B";
  if (score >= 60) return "#F2CA50";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function getLabel(score: number): string {
  if (score >= 85) return "Cosmic Soulmates";
  if (score >= 70) return "Natural Harmony";
  if (score >= 55) return "Dynamic Tension";
  if (score >= 40) return "Growth Challenge";
  return "Opposite Forces";
}

export default function CompatibilityResultClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, openSignInModal } = useAuth();

  const [result, setResult] = useState<CompatResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    async function fetchResult() {
      const { data, error } = await supabase
        .from("compatibility_results")
        .select("*")
        .eq("share_slug", slug)
        .single();
      if (error || !data) { setLoading(false); return; }
      setResult(data as CompatResult);
      setLoading(false);
    }
    if (slug) fetchResult();
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    const text = result
      ? `${result.person_a_name} & ${result.person_b_name}: ${result.overall_score}% Compatibility — ${getLabel(result.overall_score)} ✦\n\nCheck yours free: ${url}`
      : url;
    if (navigator.share) {
      navigator.share({ text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-serif text-primary mb-4">Result Not Found</h1>
          <p className="text-muted-foreground mb-8">This compatibility reading may have been removed.</p>
          <Link href="/compatibility"><Button className="gold-gradient text-primary-foreground">Check Compatibility</Button></Link>
        </div>
        <Footer />
      </main>
    );
  }

  const colorA = ELEMENT_COLORS[result.person_a_element] || "#F2CA50";
  const colorB = ELEMENT_COLORS[result.person_b_element] || "#3B82F6";
  const emojiA = ELEMENT_EMOJI[result.person_a_element] || "✦";
  const emojiB = ELEMENT_EMOJI[result.person_b_element] || "✦";
  const overallColor = getScoreColor(result.overall_score);

  const categories = [
    { key: "love", label: "Love", icon: Heart, score: result.love_score, color: "#EC4899", content: result.paid_love },
    { key: "work", label: "Work", icon: Briefcase, score: result.work_score, color: "#3B82F6", content: result.paid_work },
    { key: "friendship", label: "Friendship", icon: Users, score: result.friendship_score, color: "#10B981", content: result.paid_friendship },
    { key: "conflict", label: "Conflict Resolution", icon: Shield, score: result.conflict_score, color: "#F59E0B", content: result.paid_conflict },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">

          {/* Back */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <button onClick={() => router.push("/compatibility")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> New Check
            </button>
          </motion.div>

          {/* Title Card */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-card/50 border border-pink-500/20 rounded-2xl p-6 sm:p-8 text-center">
              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${colorA}20`, border: `2px solid ${colorA}40` }}>
                    <span className="text-2xl sm:text-3xl">{emojiA}</span>
                  </div>
                  <p className="font-medium text-sm sm:text-base">{result.person_a_name}</p>
                  <p className="text-xs text-muted-foreground">{result.person_a_day_master}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Heart className="w-6 h-6 text-pink-400" fill="currentColor" />
                  </motion.div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${colorB}20`, border: `2px solid ${colorB}40` }}>
                    <span className="text-2xl sm:text-3xl">{emojiB}</span>
                  </div>
                  <p className="font-medium text-sm sm:text-base">{result.person_b_name}</p>
                  <p className="text-xs text-muted-foreground">{result.person_b_day_master}</p>
                </div>
              </div>

              {/* Overall Score */}
              <div className="mb-4">
                <div className="relative w-28 h-28 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke={overallColor} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(result.overall_score / 100) * 264} 264`}
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ strokeDasharray: `${(result.overall_score / 100) * 264} 264` }}
                      transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: overallColor }}>{result.overall_score}</span>
                    <span className="text-[10px] text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <p className="font-serif text-xl font-semibold" style={{ color: overallColor }}>
                  {getLabel(result.overall_score)}
                </p>
              </div>

              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleShare}>
                {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {linkCopied ? "Copied!" : "Share Result"}
              </Button>
            </div>
          </motion.section>

          {/* Category Scores */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const sc = getScoreColor(cat.score);
                return (
                  <div key={cat.key} className="bg-card/50 border border-border rounded-xl p-4 text-center">
                    <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: cat.color }} />
                    <p className="text-2xl font-bold mb-1" style={{ color: sc }}>{cat.score}</p>
                    <p className="text-xs text-muted-foreground">{cat.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Free Summary */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <div className="bg-card/50 border border-primary/20 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-lg font-semibold">Your Cosmic Connection</h2>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                {result.free_summary.split("\n\n").map((para, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Detailed Analysis — ALL FREE */}
          {categories.map((cat, i) => cat.content && (
            <motion.section key={cat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }} className="mb-8">
              <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
                <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                {cat.label} Compatibility
              </h2>
              <div className="bg-card/50 border border-border rounded-2xl p-6 sm:p-8">
                <div className="prose prose-invert prose-sm max-w-none">
                  {cat.content.split("\n\n").map((para, j) => (
                    <p key={j} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                  ))}
                </div>
              </div>
            </motion.section>
          ))}

          {result.paid_yearly && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-8">
              <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {new Date().getFullYear()} Together
              </h2>
              <div className="bg-card/50 border border-primary/20 rounded-2xl p-6 sm:p-8">
                <div className="prose prose-invert prose-sm max-w-none">
                  {result.paid_yearly.split("\n\n").map((para, i) => (
                    <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* $9.99 Saju Upsell CTA */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mb-8">
            <div className="bg-gradient-to-br from-primary/5 via-card/80 to-purple-500/5 border border-primary/30 rounded-2xl p-6 sm:p-8 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-serif text-xl font-semibold mb-2">
                Discover Your Personal Destiny
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-2">
                Your compatibility is shaped by who you are at your core. Unlock your complete Four Pillars reading:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-5 max-w-sm mx-auto">
                <li className="flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> 10-year fortune cycle</li>
                <li className="flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Career & wealth blueprint</li>
                <li className="flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Love & relationship patterns</li>
                <li className="flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Hidden talent & life purpose</li>
              </ul>
              <Link href="/calculate">
                <Button className="gold-gradient text-primary-foreground font-semibold px-8">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get My Full Reading — $9.99
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground/50 mt-2">Start free, upgrade when ready</p>
            </div>
          </motion.section>

          {/* Bottom CTAs */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/compatibility">
                <Button variant="outline" className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" /> Check Another Pair
                </Button>
              </Link>
              <Link href="/calculate">
                <Button className="w-full gap-2 gold-gradient text-primary-foreground">
                  <Sparkles className="w-4 h-4" /> Get My Free Reading
                </Button>
              </Link>
            </div>

            {!user && (
              <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Sign in to save this result to your dashboard</p>
                <Button variant="outline" size="sm" className="text-xs gap-2" onClick={openSignInModal}>
                  Sign In with Google
                </Button>
              </div>
            )}
          </motion.section>

          <p className="text-center text-[11px] text-muted-foreground/40 mt-8">
            This compatibility reading is for entertainment and self-reflection only. See our Terms.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
