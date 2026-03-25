"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "./supabase-client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { SajuChart } from "./saju-calculator";

/* ─── Types ─── */

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  subscription: "free" | "premium" | "master";
}

export interface UserSajuData {
  chart: SajuChart | null;
  birthDate: Date | null;
  birthTime: string | null;
  birthCity: string | null;
  gender: "male" | "female" | null;
  readingGeneratedAt: Date | null;
}

interface AuthContextType {
  user: User | null;
  sajuData: UserSajuData;
  isLoading: boolean;
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
  signIn: () => Promise<void>;
  signOut: () => void;
  saveSajuChart: (chart: SajuChart) => void;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ─── Helpers ─── */

function mapSupabaseUser(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {};
  return {
    id: su.id,
    name: meta.full_name || meta.name || "User",
    email: su.email || "",
    image: meta.avatar_url || meta.picture || undefined,
    subscription: "free", // Default to free; upgrade logic can query DB later
  };
}

const EMPTY_SAJU: UserSajuData = {
  chart: null,
  birthDate: null,
  birthTime: null,
  birthCity: null,
  gender: null,
  readingGeneratedAt: null,
};

function loadSajuData(): UserSajuData {
  try {
    const raw = localStorage.getItem("saju-data");
    if (!raw) return EMPTY_SAJU;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
      readingGeneratedAt: parsed.readingGeneratedAt
        ? new Date(parsed.readingGeneratedAt)
        : null,
      chart: parsed.chart
        ? { ...parsed.chart, birthDate: new Date(parsed.chart.birthDate) }
        : null,
    };
  } catch {
    return EMPTY_SAJU;
  }
}

/* ─── Provider ─── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sajuData, setSajuData] = useState<UserSajuData>(EMPTY_SAJU);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  /* — Session bootstrap & auth listener — */
  useEffect(() => {
    // 1. Restore existing session (fast)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setIsLoading(false);
    });

    // 2. Listen for future auth changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(mapSupabaseUser(session.user));
        setIsSignInModalOpen(false);
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* — Restore saju chart data from localStorage — */
  useEffect(() => {
    setSajuData(loadSajuData());
  }, []);

  /* — Modal controls — */
  const openSignInModal = useCallback(() => setIsSignInModalOpen(true), []);
  const closeSignInModal = useCallback(() => setIsSignInModalOpen(false), []);

  /* — Sign in via Google OAuth — */
  const signIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Google OAuth error:", error.message);
      setIsLoading(false);
    }
    // Browser will redirect to Google → Supabase → /auth/callback
  };

  /* — Sign out — */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  /* — Save saju chart to localStorage — */
  const saveSajuChart = (chart: SajuChart) => {
    const newSajuData: UserSajuData = {
      chart,
      birthDate: chart.birthDate,
      birthTime: "12:00",
      birthCity: chart.birthCity,
      gender: chart.gender,
      readingGeneratedAt: new Date(),
    };
    setSajuData(newSajuData);
    localStorage.setItem("saju-data", JSON.stringify(newSajuData));
  };

  const isPremium =
    user?.subscription === "premium" || user?.subscription === "master";

  return (
    <AuthContext.Provider
      value={{
        user,
        sajuData,
        isLoading,
        isSignInModalOpen,
        openSignInModal,
        closeSignInModal,
        signIn,
        signOut,
        saveSajuChart,
        isPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
