"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { SajuChart } from "./saju-calculator";

// Demo user data for testing
const DEMO_USER = {
  id: "demo-user-1",
  name: "Demo User",
  email: "demo@sajuastrology.com",
  image: "/api/placeholder/100/100",
  subscription: "free" as const,
};

// Demo birth data
const DEMO_BIRTH_DATA = {
  birthDate: new Date(1990, 4, 15), // May 15, 1990
  birthTime: "14:00",
  birthCity: "Seoul",
  gender: "female" as const,
};

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sajuData, setSajuData] = useState<UserSajuData>({
    chart: null,
    birthDate: null,
    birthTime: null,
    birthCity: null,
    gender: null,
    readingGeneratedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem("saju-user");
    const savedSajuData = localStorage.getItem("saju-data");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedSajuData) {
      const parsed = JSON.parse(savedSajuData);
      setSajuData({
        ...parsed,
        birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
        readingGeneratedAt: parsed.readingGeneratedAt ? new Date(parsed.readingGeneratedAt) : null,
        // Restore the chart's birthDate as a Date object
        chart: parsed.chart ? {
          ...parsed.chart,
          birthDate: new Date(parsed.chart.birthDate),
        } : null,
      });
    }
    setIsLoading(false);
  }, []);

  const openSignInModal = () => setIsSignInModalOpen(true);
  const closeSignInModal = () => setIsSignInModalOpen(false);

  const signIn = async () => {
    setIsLoading(true);
    
    // Simulate Google OAuth - in production, use NextAuth.js
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Set demo user
    setUser(DEMO_USER);
    localStorage.setItem("saju-user", JSON.stringify(DEMO_USER));
    
    // If no saju data exists, populate with demo data
    const savedSajuData = localStorage.getItem("saju-data");
    if (!savedSajuData) {
      // User will need to generate their reading
    }
    
    setIsLoading(false);
    closeSignInModal();
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("saju-user");
    // Keep saju data for convenience
  };

  const saveSajuChart = (chart: SajuChart) => {
    const newSajuData: UserSajuData = {
      chart,
      birthDate: chart.birthDate,
      birthTime: "12:00", // From calculation
      birthCity: chart.birthCity,
      gender: chart.gender,
      readingGeneratedAt: new Date(),
    };
    setSajuData(newSajuData);
    localStorage.setItem("saju-data", JSON.stringify(newSajuData));
  };

  const isPremium = user?.subscription === "premium" || user?.subscription === "master";

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
