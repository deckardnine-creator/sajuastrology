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
import { reconstructChartFromReading } from "./constants";

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
    subscription: "free",
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

/* ─── Claim unclaimed readings after sign-in ─── */

async function claimReadings(userId: string) {
  try {
    const raw = localStorage.getItem("saju-data");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const chart = parsed.chart;
    if (!chart?.name || !chart?.birthDate) return;

    const birthDate = new Date(chart.birthDate);
    const birthDateStr = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`;

    const { data: unclaimed } = await supabase
      .from("readings")
      .select("id")
      .eq("name", chart.name)
      .eq("birth_date", birthDateStr)
      .is("user_id", null)
      .limit(5);

    if (unclaimed && unclaimed.length > 0) {
      for (const reading of unclaimed) {
        await supabase
          .from("readings")
          .update({ user_id: userId })
          .eq("id", reading.id)
          .is("user_id", null);
      }
    }
  } catch {
    // Non-critical: silently ignore claim failures
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(mapSupabaseUser(session.user));
        setIsSignInModalOpen(false);
        setIsLoading(false);
        claimReadings(session.user.id);
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

  /* — If localStorage has no chart but user has readings in DB, restore it — */
  useEffect(() => {
    if (!user) return;
    const local = loadSajuData();
    if (local.chart) return;

    (async () => {
      try {
        const { data } = await supabase
          .from("readings")
          .select("name,gender,birth_date,birth_city,day_master_element,day_master_yinyang,year_stem,year_branch,month_stem,month_branch,day_stem,day_branch,hour_stem,hour_branch,archetype,ten_god,harmony_score,dominant_element,weakest_element,elements_wood,elements_fire,elements_earth,elements_metal,elements_water,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const r = data[0];
          const reconstructed = reconstructChartFromReading(r);

          const newSajuData: UserSajuData = {
            chart: reconstructed as SajuChart,
            birthDate: new Date(r.birth_date),
            birthTime: "12:00",
            birthCity: r.birth_city,
            gender: r.gender as "male" | "female",
            readingGeneratedAt: new Date(r.created_at),
          };
          setSajuData(newSajuData);
          localStorage.setItem("saju-data", JSON.stringify(newSajuData));
        }
      } catch {
        // Non-critical: chart recovery can fail silently
      }
    })();
  }, [user]);

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
      setIsLoading(false);
    }
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
