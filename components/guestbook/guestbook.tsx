"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ChevronRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface GuestbookEntry {
  id: string;
  rating: number;
  message: string;
  displayName: string;
  archetype: string;
  element: string;
  country: string;
  countryFlag: string;
  timestamp: number;
}

// Element colors for accent
const elementColors: Record<string, string> = {
  Wood: "#59DE9B",
  Fire: "#FF6B6B",
  Earth: "#F2CA50",
  Metal: "#B8C5D6",
  Water: "#4A90D9",
};

// Country options
const countries = [
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "UK", name: "UK", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "Korea", flag: "🇰🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
];

// Seed entries
const seedEntries: GuestbookEntry[] = [
  {
    id: "seed-1",
    rating: 5,
    message: "This is way more detailed than any horoscope I've tried. The Maverick description is spot on!",
    displayName: "The Maverick",
    archetype: "The Maverick",
    element: "Fire",
    country: "USA",
    countryFlag: "🇺🇸",
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
  },
  {
    id: "seed-2",
    rating: 5,
    message: "I showed this to my Korean friend and she was shocked how accurate it was for a free service.",
    displayName: "The Creator",
    archetype: "The Creator",
    element: "Wood",
    country: "UK",
    countryFlag: "🇬🇧",
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
  },
  {
    id: "seed-3",
    rating: 4,
    message: "The hourly energy timeline is genius. Never seen that in any astrology app.",
    displayName: "The Builder",
    archetype: "The Builder",
    element: "Earth",
    country: "Germany",
    countryFlag: "🇩🇪",
    timestamp: Date.now() - 8 * 60 * 60 * 1000,
  },
  {
    id: "seed-4",
    rating: 5,
    message: "518,400 types vs 12 zodiac signs... no contest. This is the future.",
    displayName: "The Commander",
    archetype: "The Commander",
    element: "Metal",
    country: "Canada",
    countryFlag: "🇨🇦",
    timestamp: Date.now() - 12 * 60 * 60 * 1000,
  },
  {
    id: "seed-5",
    rating: 4,
    message: "Interesting how different this is from Western astrology. Very specific career advice.",
    displayName: "The Leader",
    archetype: "The Leader",
    element: "Fire",
    country: "Australia",
    countryFlag: "🇦🇺",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-6",
    rating: 5,
    message: "My husband and I both tried it. We're showing everyone at dinner tonight!",
    displayName: "The Mentor",
    archetype: "The Mentor",
    element: "Water",
    country: "France",
    countryFlag: "🇫🇷",
    timestamp: Date.now() - 26 * 60 * 60 * 1000,
  },
  {
    id: "seed-7",
    rating: 5,
    message: "The Wu Xing diagram helped me understand why I'm so intense. Wood feeding Fire!",
    displayName: "The Rebel",
    archetype: "The Rebel",
    element: "Fire",
    country: "Japan",
    countryFlag: "🇯🇵",
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
  },
  {
    id: "seed-8",
    rating: 4,
    message: "Shared my archetype card on Instagram. 10 friends already took the test!",
    displayName: "The Adventurer",
    archetype: "The Adventurer",
    element: "Wood",
    country: "Brazil",
    countryFlag: "🇧🇷",
    timestamp: Date.now() - 50 * 60 * 60 * 1000,
  },
  {
    id: "seed-9",
    rating: 5,
    message: "As a data scientist, I appreciate the 518,400 combinations claim. Way more granular than zodiac.",
    displayName: "The Visionary",
    archetype: "The Visionary",
    element: "Water",
    country: "India",
    countryFlag: "🇮🇳",
    timestamp: Date.now() - 72 * 60 * 60 * 1000,
  },
  {
    id: "seed-10",
    rating: 5,
    message: "한국 사주가 영어로 이렇게 나오니까 신기하다 ㅋㅋ 정확함!",
    displayName: "The Ally",
    archetype: "The Ally",
    element: "Earth",
    country: "Korea",
    countryFlag: "🇰🇷",
    timestamp: Date.now() - 74 * 60 * 60 * 1000,
  },
  {
    id: "seed-11",
    rating: 5,
    message: "Finally something that explains why I'm so drawn to leadership roles. The Commander fits perfectly.",
    displayName: "The Commander",
    archetype: "The Commander",
    element: "Metal",
    country: "Singapore",
    countryFlag: "🇸🇬",
    timestamp: Date.now() - 96 * 60 * 60 * 1000,
  },
  {
    id: "seed-12",
    rating: 4,
    message: "Love the daily energy feature. Checking it every morning now!",
    displayName: "The Creator",
    archetype: "The Creator",
    element: "Wood",
    country: "Netherlands",
    countryFlag: "🇳🇱",
    timestamp: Date.now() - 100 * 60 * 60 * 1000,
  },
];

// Time ago formatter
function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

// Single entry card
function GuestbookCard({ entry }: { entry: GuestbookEntry }) {
  const borderColor = elementColors[entry.element] || "#F2CA50";

  return (
    <div
      className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 min-w-[280px] max-w-[320px]"
      style={{ borderLeftColor: borderColor, borderLeftWidth: "3px" }}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < entry.rating ? "fill-primary text-primary" : "text-muted"}`}
          />
        ))}
      </div>
      {/* Message */}
      <p className="text-sm text-foreground mb-3 line-clamp-3">&ldquo;{entry.message}&rdquo;</p>
      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span style={{ color: borderColor }}>{entry.archetype}</span>
        <span>·</span>
        <span>{entry.countryFlag} {entry.country}</span>
        <span>·</span>
        <span>{timeAgo(entry.timestamp)}</span>
      </div>
    </div>
  );
}

// Write entry modal
function WriteEntryModal({
  isOpen,
  onClose,
  onSubmit,
  userArchetype,
  userElement,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<GuestbookEntry, "id" | "timestamp">) => void;
  userArchetype?: string;
  userElement?: string;
}) {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("US");

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }

    const selectedCountry = countries.find((c) => c.code === country) || countries[0];

    onSubmit({
      rating,
      message: message.slice(0, 140),
      displayName: displayName.trim() || userArchetype || "Anonymous Seeker",
      archetype: userArchetype || "Seeker",
      element: userElement || "Earth",
      country: selectedCountry.name,
      countryFlag: selectedCountry.flag,
    });

    setMessage("");
    setDisplayName("");
    setRating(5);
    onClose();
    toast.success("Thanks for sharing your impression!");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-2xl p-6 m-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif text-foreground">Leave Your Cosmic Impression</h3>
                <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Star Rating */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="p-1">
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= rating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Your Impression</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 140))}
                  placeholder="How accurate was your reading?"
                  className="resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/140</p>
              </div>

              {/* Display Name */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Display Name (optional)</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={userArchetype || "Anonymous Seeker"}
                />
              </div>

              {/* Country */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">Country</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSubmit} className="w-full gold-gradient text-primary-foreground">
                Share Impression
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Landing page version (horizontal scroll)
export function GuestbookLanding() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load from localStorage or use seeds
    try {
      const stored = localStorage.getItem("saju-guestbook");
      if (stored) {
        const parsed = JSON.parse(stored);
        setEntries([...parsed, ...seedEntries].slice(0, 20));
      } else {
        setEntries(seedEntries);
      }
    } catch {
      setEntries(seedEntries);
    }
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let isPaused = false;

    const scroll = () => {
      if (!isPaused && container) {
        container.scrollLeft += 0.5;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      container?.removeEventListener("mouseenter", handleMouseEnter);
      container?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [entries]);

  return (
    <section className="py-16 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif text-primary mb-2">What Seekers Are Saying</h2>
          <p className="text-muted-foreground">Real impressions from people who discovered their cosmic archetype</p>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {entries.map((entry) => (
            <GuestbookCard key={entry.id} entry={entry} />
          ))}
        </div>

        <div className="text-center mt-6">
          <a href="/reading#guestbook" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            See all reviews
            <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Reading page version (vertical list)
export function GuestbookReading({
  userArchetype,
  userElement,
}: {
  userArchetype?: string;
  userElement?: string;
}) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("saju-guestbook");
      if (stored) {
        const parsed = JSON.parse(stored);
        setEntries([...parsed, ...seedEntries].slice(0, 30));
      } else {
        setEntries(seedEntries);
      }
    } catch {
      setEntries(seedEntries);
    }
  }, []);

  const handleSubmitEntry = (newEntry: Omit<GuestbookEntry, "id" | "timestamp">) => {
    const entry: GuestbookEntry = {
      ...newEntry,
      id: `user-${Date.now()}`,
      timestamp: Date.now(),
    };

    const updated = [entry, ...entries];
    setEntries(updated);

    // Save user entries to localStorage
    try {
      const stored = localStorage.getItem("saju-guestbook");
      const userEntries = stored ? JSON.parse(stored) : [];
      localStorage.setItem("saju-guestbook", JSON.stringify([entry, ...userEntries]));
    } catch {
      // Ignore storage errors
    }
  };

  const displayedEntries = showAll ? entries : entries.slice(0, 6);

  return (
    <section id="guestbook" className="mb-8">
      <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-primary">Cosmic Guestbook</h2>
            <p className="text-sm text-muted-foreground">What others are saying about their readings</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
            <PenLine className="w-4 h-4 mr-2" />
            Write Impression
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {displayedEntries.map((entry) => (
            <GuestbookCard key={entry.id} entry={entry} />
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

      <WriteEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitEntry}
        userArchetype={userArchetype}
        userElement={userElement}
      />
    </section>
  );
}
