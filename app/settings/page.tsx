"use client";

import Link from "next/link";
import { Settings, User, Bell, Shield, CreditCard, LogOut } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { user, isLoading, signOut, isPremium } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">
          <SettingsContent user={user} isPremium={isPremium} signOut={signOut} />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="pb-20 p-4">
          <SettingsContent user={user} isPremium={isPremium} signOut={signOut} />
        </main>
        <MobileDashboardNav />
      </div>
    </div>
  );
}

function SettingsContent({ 
  user, 
  isPremium, 
  signOut 
}: { 
  user: any; 
  isPremium: boolean; 
  signOut: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif text-foreground">Settings</h1>
      </div>

      {/* Profile Section */}
      <section className="bg-card/50 border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium text-foreground">Profile</h2>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {user?.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary text-2xl font-serif">
                {user?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{user?.name || "Guest User"}</p>
            <p className="text-sm text-muted-foreground">{user?.email || "Not signed in"}</p>
          </div>
        </div>

        {!user && (
          <Link href="/calculate">
            <Button className="w-full gold-gradient text-primary-foreground">
              Get Your Reading
            </Button>
          </Link>
        )}
      </section>

      {/* Subscription Section */}
      <section className="bg-card/50 border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium text-foreground">Subscription</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-foreground">
              {isPremium ? "Premium Plan" : "Free Plan"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isPremium 
                ? "Unlimited access to all features" 
                : "Limited access to basic features"}
            </p>
          </div>
          {isPremium ? (
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
              Active
            </span>
          ) : (
            <Link href="/pricing">
              <Button size="sm" className="gold-gradient text-primary-foreground">
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-card/50 border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium text-foreground">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-reading" className="text-foreground">Daily reading reminders</Label>
            <Switch id="daily-reading" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-forecast" className="text-foreground">Weekly forecast updates</Label>
            <Switch id="weekly-forecast" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="special-events" className="text-foreground">Special celestial events</Label>
            <Switch id="special-events" />
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="bg-card/50 border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium text-foreground">Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile" className="text-foreground">Public profile</Label>
            <Switch id="public-profile" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="share-archetype" className="text-foreground">Allow archetype sharing</Label>
            <Switch id="share-archetype" defaultChecked />
          </div>
        </div>
      </section>

      {/* Sign Out */}
      {user && (
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      )}
    </div>
  );
}
