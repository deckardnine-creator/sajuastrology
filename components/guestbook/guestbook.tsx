"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ChevronRight, PenLine, Lock, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase, type GuestbookRow } from "@/lib/supabase-client";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

// ── Constants ─────────────────────────────────────────────────
const elementColors: Record<string, string> = {
  Wood: "#59DE9B", Fire: "#FF6B6B", Earth: "#F2CA50",
  Metal: "#B8C5D6", Water: "#4A90D9",
};

const countries = [
  { code: "US", name: "USA",         flag: "🇺🇸" },
  { code: "GB", name: "UK",          flag: "🇬🇧" },
  { code: "DE", name: "Germany",     flag: "🇩🇪" },
  { code: "FR", name: "France",      flag: "🇫🇷" },
  { code: "CA", name: "Canada",      flag: "🇨🇦" },
  { code: "AU", name: "Australia",   flag: "🇦🇺" },
  { code: "JP", name: "Japan",       flag: "🇯🇵" },
  { code: "KR", name: "Korea",       flag: "🇰🇷" },
  { code: "BR", name: "Brazil",      flag: "🇧🇷" },
  { code: "IN", name: "India",       flag: "🇮🇳" },
  { code: "MX", name: "Mexico",      flag: "🇲🇽" },
  { code: "ES", name: "Spain",       flag: "🇪🇸" },
  { code: "IT", name: "Italy",       flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SG", name: "Singapore",   flag: "🇸🇬" },
  { code: "CN", name: "China",       flag: "🇨🇳" },
  { code: "TW", name: "Taiwan",      flag: "🇹🇼" },
  { code: "TH", name: "Thailand",    flag: "🇹🇭" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "SE", name: "Sweden",      flag: "🇸🇪" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs  < 24) return `${hrs} hours ago`;
  return `${days} days ago`;
}

// ── Card ──────────────────────────────────────────────────────
function GuestbookCard({ entry, index }: { entry: GuestbookRow; index?: number }) {
  const color = elementColors[entry.element] || "#F2CA50";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index ?? 0) * 0.05 }}
      className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 min-w-[280px] max-w-[320px] flex flex-col gap-2"
      style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < entry.rating ? "fill-primary text-primary" : "text-muted"}`} />
        ))}
      </div>
      <p className="text-sm text-foreground line-clamp-3 leading-relaxed">"{entry.content}"</p>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto flex-wrap">
        <span style={{ color }}>{entry.archetype}</span>
        <span>·</span>
        <span>{entry.country_flag} {entry.country}</span>
        <span>·</span>
        <span>{timeAgo(entry.created_at)}</span>
      </div>
    </motion.div>
  );
}

// ── Write Modal ───────────────────────────────────────────────
function WriteModal({
  isOpen, onClose, onSuccess,
}: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { user, sajuData } = useAuth();
  const [rating,      setRating]      = useState(5);
  const [content,     setContent]     = useState("");
  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const archetype = sajuData?.chart?.archetype ?? "Seeker";
  const element   = sajuData?.chart?.dayMaster?.element
    ? sajuData.chart.dayMaster.element.charAt(0).toUpperCase() + sajuData.chart.dayMaster.element.slice(1)
    : "Earth";
  const defaultName = user?.name?.split(" ")[0] ?? archetype;
  const selectedCountry = countries.find(c => c.code === countryCode) ?? countries[0];

  async function handleSubmit() {
    const name = displayName.trim() || defaultName;
    if (content.trim().length < 5) { setError("Please write at least 5 characters."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.from("sj_guestbook").insert({
      user_id:      user?.id ?? null,
      user_name:    name,
      archetype,
      element,
      country_code: countryCode,
      country:      selectedCountry.name,
      country_flag: selectedCountry.flag,
      rating,
      content:      content.trim(),
    });
    setLoading(false);
    if (err) { setError("Failed to submit. Please try again."); return; }
    setContent(""); setDisplayName(""); setRating(5);
    onSuccess();
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-card border border-border rounded-2xl p-6"
          style={{ boxShadow: "0 0 60px rgba(242,202,80,0.1)" }}>

          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-lg text-primary">Leave Your Cosmic Impression</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Archetype badge */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-muted-foreground">Posting as</span>
            <span className="font-medium text-foreground">{defaultName}</span>
            <span className="text-muted-foreground/40">·</span>
            <span style={{ color: elementColors[element] ?? "#F2CA50" }}>{archetype}</span>
          </div>

          {/* Stars */}
          <div className="mb-4">
            <label className="text-xs tracking-wider text-muted-foreground uppercase mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)} className="p-1">
                  <Star className={`w-6 h-6 transition-colors ${s <= rating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="text-xs tracking-wider text-muted-foreground uppercase mb-2 block">Your Impression</label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value.slice(0, 500))}
              placeholder="How accurate was your reading?"
              className="resize-none bg-background/50 border-border focus:border-primary"
              rows={3}
            />
            <p className="text-xs text-muted-foreground/50 mt-1 text-right">{content.length}/500</p>
          </div>

          {/* Display Name */}
          <div className="mb-4">
            <label className="text-xs tracking-wider text-muted-foreground uppercase mb-2 block">Display Name (optional)</label>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={defaultName}
              className="bg-background/50 border-border focus:border-primary"
            />
          </div>

          {/* Country */}
          <div className="mb-5">
            <label className="text-xs tracking-wider text-muted-foreground uppercase mb-2 block">Country</label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="bg-background/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          <Button onClick={handleSubmit} disabled={loading}
            className="w-full gold-gradient text-primary-foreground font-semibold">
            {loading ? "Submitting..." : "Share Impression"}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Auth Gate Banner ──────────────────────────────────────────
function AuthGateBanner({ label }: { label: string }) {
  const { openSignInModal } = useAuth();
  return (
    <button onClick={openSignInModal}
      className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors border border-primary/20 hover:border-primary/50 rounded-full px-4 py-2">
      <Lock className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ── Landing Version (horizontal scroll + auth gate) ───────────
export function GuestbookLanding() {
  const [entries,   setEntries]   = useState<GuestbookRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("sj_guestbook")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setEntries(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || loading || entries.length === 0) return;
    let id: number;
    let paused = false;
    const tick = () => {
      if (!paused) {
        el.scrollLeft += 0.6;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    el.addEventListener("mouseenter", () => { paused = true; });
    el.addEventListener("mouseleave", () => { paused = false; });
    return () => cancelAnimationFrame(id);
  }, [loading, entries]);

  return (
    <section className="relative py-16 overflow-hidden">
      {/* bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full bg-amber-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-purple-600/8 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif text-primary mb-2">What Seekers Are Saying</h2>
          <p className="text-muted-foreground text-sm">Real impressions from people who discovered their cosmic archetype</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {[...entries, ...entries].map((e, i) => (
              <GuestbookCard key={`${e.id}-${i}`} entry={e} index={i} />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          {/* Write review */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.p key="thanks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-primary text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Thank you for sharing!
              </motion.p>
            ) : user ? (
              <Button key="write" onClick={() => setShowModal(true)} size="sm"
                variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                <PenLine className="w-4 h-4 mr-2" /> Write a Review
              </Button>
            ) : (
              <AuthGateBanner key="gate" label="Sign in to write a review" />
            )}
          </AnimatePresence>

          {/* See all */}
          {user ? (
            <Link href="/reviews" className="inline-flex items-center gap-1 text-sm text-primary/70 hover:text-primary transition-colors">
              See all reviews <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button onClick={() => useAuth()} className="inline-flex items-center gap-1 text-sm text-primary/70 hover:text-primary transition-colors">
              <Link href="/reviews" className="inline-flex items-center gap-1">
                See all reviews <Lock className="w-3.5 h-3.5" />
              </Link>
            </button>
          )}
        </div>
      </div>

      <WriteModal isOpen={showModal} onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); setSubmitted(true); load(); }} />
    </section>
  );
}

// ── Full Reviews Page ─────────────────────────────────────────
export function GuestbookPage() {
  const [entries,   setEntries]   = useState<GuestbookRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [hasMore,   setHasMore]   = useState(true);
  const [page,      setPage]      = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const PER = 18;

  async function load(reset = false) {
    setLoading(true);
    const from = reset ? 0 : page * PER;
    const { data } = await supabase
      .from("sj_guestbook").select("*")
      .order("created_at", { ascending: false })
      .range(from, from + PER - 1);
    const rows = data ?? [];
    setEntries(prev => reset ? rows : [...prev, ...rows]);
    setHasMore(rows.length === PER);
    if (!reset) setPage(p => p + 1);
    setLoading(false);
  }

  useEffect(() => { load(true); }, []);

  const avgRating = entries.length
    ? (entries.reduce((s, e) => s + e.rating, 0) / entries.length).toFixed(1) : "—";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/12 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-700/10 blur-[130px]" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[350px] rounded-full bg-teal-600/8 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-32">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            What Seekers Are <span className="gold-gradient-text">Saying</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Real impressions from people who discovered their cosmic archetype
          </p>
          {entries.length > 0 && (
            <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full text-sm">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(parseFloat(avgRating)) ? "fill-primary text-primary" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-primary font-semibold">{avgRating}</span>
              <span className="text-muted-foreground">· {entries.length}+ reviews</span>
            </div>
          )}
        </div>

        {/* Write CTA */}
        <div className="flex justify-center mb-10">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Your review has been posted!
              </motion.p>
            ) : user ? (
              <Button key="btn" onClick={() => setShowModal(true)}
                className="gold-gradient text-primary-foreground font-semibold">
                <PenLine className="w-4 h-4 mr-2" /> Write a Review
              </Button>
            ) : (
              <AuthGateBanner key="gate" label="Sign in to write a review" />
            )}
          </AnimatePresence>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e, i) => (
            <div key={e.id} className="w-auto max-w-none">
              <GuestbookCard entry={{ ...e }} index={i} />
            </div>
          ))}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-10">
            <Button onClick={() => load()} variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10">
              <ChevronDown className="w-4 h-4 mr-2" /> Load More
            </Button>
          </div>
        )}
        {loading && (
          <div className="flex justify-center mt-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <WriteModal isOpen={showModal} onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); setSubmitted(true); load(true); }} />
    </div>
  );
}

// ── Reading Page Embedded Version ─────────────────────────────
export function GuestbookReading({
  userArchetype, userElement,
}: { userArchetype?: string; userElement?: string }) {
  const [entries,   setEntries]   = useState<GuestbookRow[]>([]);
  const [showAll,   setShowAll]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    supabase.from("sj_guestbook").select("*")
      .order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => setEntries(data ?? []));
  }, []);

  const displayed = showAll ? entries : entries.slice(0, 6);

  return (
    <section id="guestbook" className="mb-8">
      <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-primary">Cosmic Guestbook</h2>
            <p className="text-sm text-muted-foreground">What others are saying about their readings</p>
          </div>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
              <PenLine className="w-4 h-4 mr-2" /> Write Impression
            </Button>
          ) : (
            <AuthGateBanner label="Sign in to write" />
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {displayed.map((e, i) => (
            <GuestbookCard key={e.id} entry={e} index={i} />
          ))}
        </div>

        {entries.length > 6 && (
          <div className="text-center">
            <Button variant="ghost" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : `Load More (${entries.length - 6} more)`}
            </Button>
          </div>
        )}
      </div>

      <WriteModal isOpen={showModal} onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          supabase.from("sj_guestbook").select("*")
            .order("created_at", { ascending: false }).limit(30)
            .then(({ data }) => setEntries(data ?? []));
        }} />
    </section>
  );
}
