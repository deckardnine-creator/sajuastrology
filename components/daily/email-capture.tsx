"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already subscribed
    try {
      const subscribed = localStorage.getItem("saju-daily-subscribed");
      if (subscribed) {
        setIsSubscribed(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Store email and subscription status
    try {
      localStorage.setItem("saju-daily-email", email);
      localStorage.setItem("saju-daily-subscribed", "true");
      const existingEmails = JSON.parse(localStorage.getItem("saju-email-list") || "[]");
      if (!existingEmails.includes(email)) {
        existingEmails.push(email);
        localStorage.setItem("saju-email-list", JSON.stringify(existingEmails));
      }
    } catch {
      // Ignore storage errors
    }

    setIsSubscribed(true);
    setIsLoading(false);
    toast.success("You'll receive your first reading tomorrow morning!");
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-serif text-foreground">Get Your Daily Reading in Your Inbox</h3>
          <p className="text-sm text-muted-foreground">Wake up to personalized cosmic guidance every morning</p>
        </div>
      </div>

      {isSubscribed ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-3 py-4"
        >
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-foreground font-medium">Subscribed!</p>
            <p className="text-sm text-muted-foreground">Your first reading arrives tomorrow morning</p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-background"
          />
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="gold-gradient text-primary-foreground whitespace-nowrap"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Subscribe — Free
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
