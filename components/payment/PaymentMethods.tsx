// components/payment/PaymentMethods.tsx
// Renders payment buttons based on user locale.
// Korea: Toss + Naver Pay + Kakao Pay + Creem
// Global: PayPal + Creem
//
// Each button is a black-box that knows how to start its own checkout flow.
// The parent passes productKey + customId; this component decides which buttons to render.

"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  getAvailablePaymentMethods,
  getMethodLabel,
  type PaymentMethod,
} from "@/lib/payment/router";
import type { CreemProductKey } from "@/lib/payment/creem";

interface PaymentMethodsProps {
  productKey: CreemProductKey;
  customId: string;                    // shareSlug or user_id
  customerEmail?: string;
  // Optional override for PayPal handler — if not provided, PayPal button is hidden.
  // Existing PayPal flow stays in the parent component; this just calls it.
  onPayPalClick?: () => void;
  // Visual variant: 'stacked' (full-width vertical) or 'inline' (side-by-side)
  variant?: "stacked" | "inline";
}

export function PaymentMethods({
  productKey,
  customId,
  customerEmail,
  onPayPalClick,
  variant = "stacked",
}: PaymentMethodsProps) {
  const { locale } = useLanguage();
  const [loading, setLoading] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const methods = getAvailablePaymentMethods({ locale });

  async function handleCreemClick() {
    setLoading("creem");
    setError(null);
    try {
      const res = await fetch("/api/creem/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productKey,
          customId,
          customerEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error || data.detail || "Checkout failed");
      }
      // Redirect to Creem hosted checkout
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(null);
    }
  }

  function handlePayPalClick() {
    if (!onPayPalClick) return;
    setLoading("paypal");
    onPayPalClick();
    // Reset loading after a delay in case PayPal SDK doesn't navigate
    setTimeout(() => setLoading(null), 12000);
  }

  function handleStubClick(method: PaymentMethod) {
    // Toss/Naver/Kakao not yet activated — show placeholder
    setError(`${getMethodLabel(method, locale)} — coming soon`);
  }

  const containerClass =
    variant === "stacked"
      ? "flex flex-col gap-3 w-full"
      : "flex flex-row gap-3 flex-wrap w-full";

  return (
    <div className={containerClass}>
      {methods.map((method) => {
        const label = getMethodLabel(method, locale);
        const isLoading = loading === method;
        const isPrimary = method === methods[0]; // First method gets primary styling

        const baseClass =
          "px-4 py-3 rounded-lg font-medium transition-all text-sm md:text-base " +
          "disabled:opacity-50 disabled:cursor-not-allowed " +
          (variant === "stacked" ? "w-full" : "flex-1 min-w-[140px]");

        const styleClass = isPrimary
          ? "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
          : "bg-background text-foreground hover:bg-foreground/5 border border-foreground/20";

        if (method === "creem") {
          return (
            <button
              key={method}
              onClick={handleCreemClick}
              disabled={loading !== null}
              className={`${baseClass} ${styleClass}`}
            >
              {isLoading ? "..." : label}
            </button>
          );
        }

        if (method === "paypal" && onPayPalClick) {
          return (
            <button
              key={method}
              onClick={handlePayPalClick}
              disabled={loading !== null}
              className={`${baseClass} ${styleClass}`}
            >
              {isLoading ? "..." : label}
            </button>
          );
        }

        // Toss / Naver / Kakao stubs
        if (method === "toss" || method === "naverpay" || method === "kakaopay") {
          return (
            <button
              key={method}
              onClick={() => handleStubClick(method)}
              disabled={loading !== null}
              className={`${baseClass} ${styleClass} opacity-60`}
              title="Coming soon"
            >
              {label}
            </button>
          );
        }

        return null;
      })}

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
