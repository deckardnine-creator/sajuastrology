"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/landing/footer";
import { useLanguage } from "@/lib/language-context";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          {/* Animated Sparkle Icon */}
          <motion.div
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 rounded-full bg-primary/10 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(242, 202, 80, 0)",
                "0 0 0 20px rgba(242, 202, 80, 0.1)",
                "0 0 0 0 rgba(242, 202, 80, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </motion.div>
          </motion.div>

          {/* 404 Number */}
          <motion.p
            className="text-6xl sm:text-7xl font-serif font-bold text-primary mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            404
          </motion.p>

          {/* Heading */}
          <motion.h1
            className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t("notFound.title")}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t("notFound.desc")}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/" className="w-full sm:w-auto">
              <Button className="gold-gradient text-primary-foreground px-8 w-full sm:w-auto min-h-[44px]">
                {t("notFound.returnHome")}
              </Button>
            </Link>
            <Link href="/calculate" className="w-full sm:w-auto">
              <Button variant="outline" className="px-8 w-full sm:w-auto min-h-[44px]">
                {t("notFound.decodeDestiny")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
