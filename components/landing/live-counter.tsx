"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveCounterProps {
  startValue?: number;
  className?: string;
}

export function LiveCounter({ startValue = 2347892, className = "" }: LiveCounterProps) {
  const [count, setCount] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    // Increment counter at random intervals (8-15 seconds)
    const scheduleNextIncrement = () => {
      const delay = Math.random() * 7000 + 8000; // 8-15 seconds
      return setTimeout(() => {
        setIsAnimating(true);
        setCount((prev) => {
          prevCountRef.current = prev;
          return prev + 1;
        });
        setTimeout(() => setIsAnimating(false), 600);
        scheduleNextIncrement();
      }, delay);
    };

    const timeoutId = scheduleNextIncrement();
    return () => clearTimeout(timeoutId);
  }, []);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  // Split number into individual digits for animation
  const digits = formatNumber(count).split("");
  const prevDigits = formatNumber(prevCountRef.current).split("");

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {digits.map((digit, index) => {
          const prevDigit = prevDigits[index];
          const isChanged = digit !== prevDigit && isAnimating;
          const isNumber = /\d/.test(digit);

          if (!isNumber) {
            // Comma or separator
            return (
              <span key={`sep-${index}`} className="text-primary/60">
                {digit}
              </span>
            );
          }

          return (
            <div key={index} className="relative overflow-hidden w-[0.7em] h-[1.2em]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`${digit}-${count}`}
                  initial={isChanged ? { y: -20, opacity: 0 } : false}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`absolute inset-0 flex items-center justify-center ${
                    isChanged ? "text-primary" : "text-foreground"
                  }`}
                >
                  {digit}
                </motion.span>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Pulse indicator */}
      <motion.div
        animate={{
          scale: isAnimating ? [1, 1.5, 1] : 1,
          opacity: isAnimating ? [1, 0.5, 0] : 0.5,
        }}
        transition={{ duration: 0.6 }}
        className="w-2 h-2 rounded-full bg-primary ml-1"
      />
    </div>
  );
}

// Simple version without per-digit animation (better performance)
export function LiveCounterSimple({ startValue = 2347892, className = "" }: LiveCounterProps) {
  const [count, setCount] = useState(startValue);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const scheduleNextIncrement = () => {
      const delay = Math.random() * 7000 + 8000;
      return setTimeout(() => {
        setIsGlowing(true);
        setCount((prev) => prev + 1);
        setTimeout(() => setIsGlowing(false), 800);
        scheduleNextIncrement();
      }, delay);
    };

    const timeoutId = scheduleNextIncrement();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <span
      className={`inline-flex items-center transition-all duration-300 ${
        isGlowing ? "text-primary drop-shadow-[0_0_8px_rgba(242,202,80,0.5)]" : ""
      } ${className}`}
    >
      {count.toLocaleString("en-US")}+
      <motion.span
        animate={{
          opacity: isGlowing ? [0.5, 1, 0.5] : 0.3,
          scale: isGlowing ? [1, 1.2, 1] : 1,
        }}
        className="w-1.5 h-1.5 rounded-full bg-primary ml-1.5"
      />
    </span>
  );
}
