"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from "react";
import { supabase } from "./supabase-client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { SajuChart } from "./saju-calculator";
import { reconstructChartFromReading } from "./constants";

export interface User {
  id: string; name: string; email: string; image?: string;
  subscription: "free" | "premium" | "master";
}

export interface UserSajuData {
  chart: SajuChart | null; birthDate: Date | null; birthTime: string | null;
  birthCity: string | null; gender: "male" | "female" | null; readingGeneratedAt: Date | null;
}

interface AuthContextType {
  user: User | null; sajuData: UserSajuData; isLoading: boolean;
  isSignInModalOpen: boolean; openSignInModal: () => void; closeSignInModal: () => void;
  signIn: () => Promise<void>; signOut: () => void; saveSajuChart: (chart: SajuChart) => void;
  isPremium: boolean;
  claimTrigger: number; // Increments after claimReadings completes — dashboard watches this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {};
  return {
    id: su.id, name: meta.full_name || meta.name || "User",
    email: su.email || "", image: meta.avatar_url || meta.picture || undefined,
    subscription: "free",
  };
}

const EMPTY_SAJU: UserSajuData = {
  chart: null, birthDate: null, birthTime: null, birthCity: null, gender: null, readingGeneratedAt: null,
};

function loadSajuData(): UserSajuData {
  try {
    const raw = localStorage.getItem("saju-data");
    if (!raw) return EMPTY_SAJU;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
      readingGeneratedAt: parsed.readingGeneratedAt ? new Date(parsed.readingGeneratedAt) : null,
      chart: parsed.chart ? { ...parsed.chart, birthDate: new Date(parsed.chart.birthDate) } : null,
    };
  } catch { return EMPTY_SAJU; }
}

async function claimReadings(userId: string) {
  try {
    const raw = localStorage.getItem("saju-data");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const chart = parsed.chart;
    if (!chart?.name || !chart?.birthDate) return;
    const bd = new Date(chart.birthDate);
    const bds = `${bd.getFullYear()}-${String(bd.getMonth() + 1).padStart(2, "0")}-${String(bd.getDate()).padStart(2, "0")}`;
    const { data } = await supabase.from("readings").select("id").eq("name", chart.name).eq("birth_date", bds).is("user_id", null).limit(5);
    if (data && data.length > 0) {
      for (const r of data) {
        await supabase.from("readings").update({ user_id: userId }).eq("id", r.id).is("user_id", null);
      }
    }
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sajuData, setSajuData] = useState<UserSajuData>(EMPTY_SAJU);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [claimTrigger, setClaimTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(mapSupabaseUser(session.user));
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(mapSupabaseUser(session.user));
        setIsSignInModalOpen(false);
        setIsLoading(false);
        // Claim readings THEN signal dashboard to re-fetch
        await claimReadings(session.user.id);
        setClaimTrigger(prev => prev + 1);
        // ★ #10: Return to the page user was on before sign-in
        const returnUrl = localStorage.getItem("auth-return-url");
        if (returnUrl) {
          localStorage.removeItem("auth-return-url");
          setTimeout(() => { window.location.href = returnUrl; }, 300);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setSajuData(loadSajuData()); }, []);

  useEffect(() => {
    if (!user) return;
    const local = loadSajuData();
    if (local.chart) return;
    (async () => {
      try {
        const { data } = await supabase.from("readings")
          .select("name,gender,birth_date,birth_city,day_master_element,day_master_yinyang,year_stem,year_branch,month_stem,month_branch,day_stem,day_branch,hour_stem,hour_branch,archetype,ten_god,harmony_score,dominant_element,weakest_element,elements_wood,elements_fire,elements_earth,elements_metal,elements_water,created_at")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
        if (data && data.length > 0) {
          const r = data[0];
          const newSajuData: UserSajuData = {
            chart: reconstructChartFromReading(r) as SajuChart,
            birthDate: new Date(r.birth_date), birthTime: "12:00", birthCity: r.birth_city,
            gender: r.gender as "male" | "female", readingGeneratedAt: new Date(r.created_at),
          };
          setSajuData(newSajuData);
          localStorage.setItem("saju-data", JSON.stringify(newSajuData));
        }
      } catch {}
    })();
  }, [user]);

  const openSignInModal = useCallback(() => setIsSignInModalOpen(true), []);
  const closeSignInModal = useCallback(() => setIsSignInModalOpen(false), []);

  const signIn = async () => {
    setIsLoading(true);
    // ★ #10: Save current URL for return after OAuth
    localStorage.setItem("auth-return-url", window.location.href);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { localStorage.removeItem("auth-return-url"); setIsLoading(false); }
  };

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); };

  const saveSajuChart = (chart: SajuChart) => {
    const newSajuData: UserSajuData = {
      chart, birthDate: chart.birthDate, birthTime: "12:00",
      birthCity: chart.birthCity, gender: chart.gender, readingGeneratedAt: new Date(),
    };
    setSajuData(newSajuData);
    localStorage.setItem("saju-data", JSON.stringify(newSajuData));
  };

  const isPremium = user?.subscription === "premium" || user?.subscription === "master";

  return (
    <AuthContext.Provider value={{ user, sajuData, isLoading, isSignInModalOpen, openSignInModal, closeSignInModal, signIn, signOut, saveSajuChart, isPremium, claimTrigger }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
