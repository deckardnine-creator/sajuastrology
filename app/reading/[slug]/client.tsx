"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Share2, Lock, Sparkles } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { ELEMENTS, type Element } from "@/lib/saju-calculator";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ReadingData {
  id: string;
  name: string;
  gender: string;
  birth_date: string;
  birth_city: string;
  year_stem: string;
  year_branch: string;
  month_stem: string;
  month_branch: string;
  day_stem: string;
  day_branch: string;
  hour_stem: string;
  hour_branch: string;
  day_master_element: string;
  day_master_yinyang: string;
  archetype: string;
  ten_god: string;
  harmony_score: number;
  dominant_element: string;
  weakest_element: string;
  elements_wood: number;
  elements_fire: number;
  elements_earth: number;
  elements_metal: number;
  elements_water: number;
  free_reading_personality: string;
  free_reading_year: string;
  free_reading_element: string;
  paid_reading_career: string | null;
  paid_reading_love: string | null;
  paid_reading_health: string | null;
  paid_reading_decade: string | null;
  is_paid: boolean;
  share_slug: string;
  created_at: string;
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: "#59DE9B",
  fire: "#EF4444",
  earth: "#F2CA50",
  metal: "#C0C0C0",
  water: "#3B82F6",
};

const ELEMENT_LABELS: Record<string, string> = {
  wood: "Wood 木",
  fire: "Fire 火",
  earth: "Earth 土",
  metal: "Metal 金",
  water: "Water 水",
};

const DAY_MASTER_DISPLAY: Record<string, { zh: string; en: string }> = {
  "wood-yang": { zh: "甲", en: "Yang Wood" },
  "wood-yin": { zh: "乙", en: "Yin Wood" },
  "fire-yang": { zh: "丙", en: "Yang Fire" },
  "fire-yin": { zh: "丁", en: "Yin Fire" },
  "earth-yang": { zh: "戊", en: "Yang Earth" },
  "earth-yin": { zh: "己", en: "Yin Earth" },
  "metal-yang": { zh: "庚", en: "Yang Metal" },
  "metal-yin": { zh: "辛", en: "Yin Metal" },
  "water-yang": { zh: "壬", en: "Yang Water" },
  "water-yin": { zh: "癸", en: "Yin Water" },
};

export default function ReadingPageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [reading, setReading] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paidContentLoading, setPaidContentLoading] = useState(false);

  useEffect(() => {
    async function fetchReading() {
      const { data, error: fetchError } = await supabase
        .from("readings")
        .select("*")
        .eq("share_slug", slug)
        .single();

      if (fetchError || !data) {
        setError("Reading not found");
        setLoading(false);
        return;
      }

      setReading(data as ReadingData);
      setLoading(false);
    }

    if (slug) fetchReading();
  }, [slug]);

  // Handle payment success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get("payment");
    const sessionId = urlParams.get("session_id");

    if (payment === "success" && sessionId && slug) {
      setPaidContentLoading(true);
      // Verify payment and generate paid reading
      fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, shareSlug: slug }),
      })
        .then((res) => res.json())
        .then(() => {
          // Reload reading data to get paid content
          window.location.href = `/reading/${slug}`;
        })
        .catch(() => {
          setPaidContentLoading(false);
        });
    }
  }, [slug]);

  const handleUnlock = async () => {
    if (!reading) return;
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug: reading.share_slug, readingName: reading.name }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your cosmic blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-serif text-primary mb-4">Reading Not Found</h1>
          <p className="text-muted-foreground mb-8">This reading may have been removed or the link is incorrect.</p>
          <Link href="/calculate">
            <Button className="gold-gradient text-primary-foreground">Get Your Free Reading</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const dmKey = `${reading.day_master_element}-${reading.day_master_yinyang}`;
  const dmDisplay = DAY_MASTER_DISPLAY[dmKey] || { zh: "?", en: "Unknown" };
  const dmColor = ELEMENT_COLORS[reading.day_master_element] || "#F2CA50";

  const pillars = [
    { name: "Hour", stem: reading.hour_stem, branch: reading.hour_branch },
    { name: "Day", stem: reading.day_stem, branch: reading.day_branch },
    { name: "Month", stem: reading.month_stem, branch: reading.month_branch },
    { name: "Year", stem: reading.year_stem, branch: reading.year_branch },
  ];

  const elements = {
    wood: reading.elements_wood,
    fire: reading.elements_fire,
    earth: reading.elements_earth,
    metal: reading.elements_metal,
    water: reading.elements_water,
  };

  const maxElement = Math.max(...Object.values(elements));

  const shareUrl = `https://sajuastrology.com/reading/${reading.share_slug}`;
  const shareText = `I just discovered I'm "${reading.archetype}" in Korean astrology (Saju). My Day Master is ${dmDisplay.en}. Get your free reading:`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${reading.name}'s Saju Reading`, text: shareText, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <Link href="/calculate" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> New Reading
            </Link>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </motion.div>

          {/* Title */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif mb-2">
              {reading.name}&apos;s <span className="gold-gradient-text">Cosmic Blueprint</span>
            </h1>
            <p className="text-muted-foreground mb-3">
              Born {new Date(reading.birth_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} in {reading.birth_city}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-xs tracking-wider text-muted-foreground uppercase">
                Day Master: <span style={{ color: dmColor }} className="font-semibold">{dmDisplay.zh} {dmDisplay.en}</span>
              </span>
              <span className="text-xs tracking-wider text-muted-foreground uppercase">
                Archetype: <span className="text-primary font-semibold">{reading.archetype}</span>
              </span>
              <span className="text-xs tracking-wider text-muted-foreground uppercase">
                Harmony: <span className="text-primary font-semibold">{reading.harmony_score}%</span>
              </span>
            </div>
          </motion.section>

          {/* Four Pillars */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4 text-center">The Four Pillars of Destiny</h2>
            <div className="grid grid-cols-4 gap-3">
              {pillars.map((p, i) => (
                <div key={p.name}
                  className={`bg-card/60 backdrop-blur border rounded-xl p-4 text-center ${p.name === "Day" ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}>
                  <p className="text-xs text-muted-foreground mb-2">{p.name}</p>
                  <p className="text-2xl font-serif text-primary">{p.stem}</p>
                  <p className="text-lg text-muted-foreground">{p.branch}</p>
                  {p.name === "Day" && <p className="text-[10px] text-primary/60 mt-1">Day Master</p>}
                </div>
              ))}
            </div>
          </motion.section>

          {/* AI Personality Reading */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
            <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-serif" style={{ color: dmColor }}>{dmDisplay.zh}</span>
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold">{reading.archetype}</h2>
                  <p className="text-xs text-muted-foreground">{dmDisplay.en} · {reading.ten_god}</p>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                {reading.free_reading_personality.split("\n\n").map((para, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Five Elements Balance */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-10">
            <h2 className="font-serif text-xl font-semibold mb-4">Five Elements Balance</h2>
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
              <div className="space-y-3 mb-6">
                {(["wood", "fire", "earth", "metal", "water"] as const).map((el) => (
                  <div key={el} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-muted-foreground">{ELEMENT_LABELS[el]}</span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${maxElement > 0 ? (elements[el] / maxElement) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ backgroundColor: ELEMENT_COLORS[el] }}
                      >
                        <span className="text-xs font-semibold text-background">{elements[el]}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reading.free_reading_element}
                </p>
              </div>
            </div>
          </motion.section>

          {/* This Year's Fortune */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-10">
            <h2 className="font-serif text-xl font-semibold mb-4">{new Date().getFullYear()} Fortune Forecast</h2>
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
              <div className="prose prose-invert prose-sm max-w-none">
                {reading.free_reading_year.split("\n\n").map((para, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Harmony Score */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-10">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Cosmic Harmony Score</p>
              <div className="text-5xl font-serif text-primary mb-2">{reading.harmony_score}</div>
              <p className="text-sm text-muted-foreground">
                {reading.harmony_score >= 80
                  ? "Exceptionally balanced chart with strong cosmic alignment"
                  : reading.harmony_score >= 60
                  ? "Well-balanced chart with good elemental distribution"
                  : "Chart with distinct character — focus on strengthening weaker elements"}
              </p>
            </div>
          </motion.section>

          {/* Paid Content (visible after payment) */}
          {reading.is_paid && reading.paid_reading_career && (
            <>
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-10">
                <h2 className="font-serif text-xl font-semibold mb-4">Career & Wealth Blueprint</h2>
                <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-2xl p-6 md:p-8">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {reading.paid_reading_career.split("\n\n").map((para, i) => (
                      <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                    ))}
                  </div>
                </div>
              </motion.section>

              {reading.paid_reading_love && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mb-10">
                  <h2 className="font-serif text-xl font-semibold mb-4">Love & Relationships</h2>
                  <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {reading.paid_reading_love.split("\n\n").map((para, i) => (
                        <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {reading.paid_reading_health && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mb-10">
                  <h2 className="font-serif text-xl font-semibold mb-4">Health & Wellness</h2>
                  <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {reading.paid_reading_health.split("\n\n").map((para, i) => (
                        <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {reading.paid_reading_decade && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mb-10">
                  <h2 className="font-serif text-xl font-semibold mb-4">10-Year Fortune Cycle</h2>
                  <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-2xl p-6 md:p-8">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {reading.paid_reading_decade.split("\n\n").map((para, i) => (
                        <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}
            </>
          )}

          {/* Locked Premium Content (visible when NOT paid) */}
          {!reading.is_paid && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-10">
              <div className="relative overflow-hidden rounded-2xl border border-border">
                {/* Blurred preview */}
                <div className="p-6 md:p-8 blur-sm select-none pointer-events-none">
                  <h2 className="font-serif text-xl font-semibold mb-3">10-Year Fortune Cycle</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your next decade holds remarkable potential. The years {new Date().getFullYear() + 2}-{new Date().getFullYear() + 4} mark a significant 
                    turning point in your career trajectory. The elemental shifts in your luck pillars suggest a period of consolidation 
                    followed by rapid expansion. Pay particular attention to opportunities that arise in late spring of {new Date().getFullYear() + 1}, 
                    as your Day Master energy aligns powerfully with the annual pillar...
                  </p>
                  <h2 className="font-serif text-xl font-semibold mb-3 mt-6">Career & Wealth Blueprint</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your unique combination of elements creates a natural affinity for roles that require both vision and execution.
                    The presence of strong resource energy in your chart suggests that financial stability comes through building 
                    lasting systems rather than chasing quick wins...
                  </p>
                  <h2 className="font-serif text-xl font-semibold mb-3 mt-6">Love & Relationships</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    In matters of the heart, your Day Master seeks a partner whose energy complements rather than mirrors your own.
                    The elemental dynamics in your relationship house suggest deep connections form through shared creative pursuits...
                  </p>
                </div>
                {/* Lock overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background flex items-end justify-center pb-8">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold mb-2">Unlock Your Full Destiny</h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                      10-year forecast, career blueprint, love analysis, health guidance — all personalized to your chart.
                    </p>
                    <Button 
                      className="gold-gradient text-primary-foreground font-semibold px-8"
                      onClick={handleUnlock}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Unlock Full Reading — $9.99
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground/50 mt-2">One-time payment. Yours forever.</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Payment processing overlay */}
          {paidContentLoading && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
              <div className="bg-card/50 backdrop-blur border border-primary/30 rounded-2xl p-8 text-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-primary font-serif text-lg mb-2">Generating your full reading...</p>
                <p className="text-muted-foreground text-sm">Your personalized career, love, and 10-year forecast is being crafted.</p>
              </div>
            </motion.section>
          )}

          {/* Share CTA */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mb-10">
            <div className="gold-gradient rounded-2xl p-8 text-center">
              <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-2">Share Your Cosmic Identity</h3>
              <p className="text-primary-foreground/80 mb-4">Let your friends discover their own cosmic blueprint</p>
              <Button variant="secondary" className="bg-background text-foreground hover:bg-background/90" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share My Reading
              </Button>
            </div>
          </motion.section>

        </div>
      </div>
      <Footer />
    </main>
  );
}
