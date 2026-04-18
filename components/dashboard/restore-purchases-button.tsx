"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t, tf } from "@/lib/translations";
import { useNativeApp } from "@/lib/native-app";
import { sendToFlutter, onFlutterMessage } from "@/lib/flutter-bridge";
import { track, Events } from "@/lib/analytics";

/**
 * Restore Purchases button — visible ONLY inside the native app.
 *
 * Apple App Review Guideline 4.10 requires apps that use in-app purchase
 * to provide a "Restore Purchases" mechanism. This button satisfies that
 * requirement by:
 *   1. Asking Flutter to call StoreKit's restore API (web → Flutter via
 *      window.FlutterBridge.postMessage("iap:restore"))
 *   2. Flutter calls InAppPurchase.restorePurchases() which asks Apple
 *      for past purchases on the user's iTunes account.
 *   3. Flutter counts restored events and reports back via
 *      window.onFlutterMessage("iap:restore:success:{count}") or
 *      ("iap:restore:error:{msg}")
 *   4. On success, we refresh the dashboard so previously-unlocked
 *      readings reappear (they were already unlocked server-side; the
 *      refresh just re-fetches the list).
 *
 * Design decisions:
 *   - Hidden on web browser (useNativeApp() === false) — web users have
 *     no App Store purchases to restore.
 *   - Hidden when signed out — restore requires an authenticated user
 *     context for the dashboard refresh to mean anything.
 *   - We do NOT call the server from here. Past purchases are already
 *     in iap_transactions; the restore flow exists for Apple compliance
 *     and to give the user visible reassurance, not to re-verify.
 */
export function RestorePurchasesButton() {
  const isNative = useNativeApp();
  const { user } = useAuth();
  const { locale } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Subscribe to Flutter results. Unsubscribe on unmount.
  useEffect(() => {
    if (!isNative) return;

    const unsubSuccess = onFlutterMessage("iap:restore:success:", (payload) => {
      const count = parseInt(payload, 10) || 0;
      // Mixpanel: restore outcome — `count` tells us whether the user actually
      // had past purchases on their Apple ID.
      try { track(Events.restore_purchases_success, { count }); } catch {}
      const text =
        count > 0
          ? count === 1
            ? t("restore.restoredOne", locale)
            : tf("restore.restoredMany", locale, { count })
          : t("restore.noPurchases", locale);

      setLoading(false);
      setMessage({ type: "success", text });

      // If anything was actually restored, refresh the dashboard so the
      // user's saved readings list reflects any unlocked content. The
      // server-side state is already correct — this just re-fetches.
      if (count > 0) {
        // Small delay so the user sees the toast before the refresh.
        setTimeout(() => { window.location.reload(); }, 1500);
      } else {
        // Auto-dismiss the "no purchases" toast after a few seconds.
        setTimeout(() => setMessage(null), 4000);
      }
    });

    const unsubError = onFlutterMessage("iap:restore:error:", (payload) => {
      const text = tf("restore.restoreFailed", locale, { payload });
      setLoading(false);
      setMessage({ type: "error", text });
      setTimeout(() => setMessage(null), 5000);
    });

    return () => {
      unsubSuccess();
      unsubError();
    };
  }, [isNative, locale]);

  // Hide on web browsers — this button is only meaningful inside the
  // Flutter WebView where FlutterBridge is available.
  if (!isNative) return null;

  // Hide when signed out — restore without a user context is pointless.
  // (The sign-in prompt is already shown by DashboardPage in that state.)
  if (!user) return null;

  const buttonLabel = t("restore.buttonLabel", locale);

  const helperText = t("restore.helperText", locale);

  const handleRestore = () => {
    if (loading) return;
    // ── Mixpanel: Apple 4.10 compliance action — user tapped "Restore" ──
    try { track(Events.restore_purchases_clicked); } catch {}
    setMessage(null);
    setLoading(true);
    const sent = sendToFlutter("iap:restore");
    if (!sent) {
      // FlutterBridge not available for some reason — fail fast rather
      // than leaving the spinner forever.
      setLoading(false);
      setMessage({
        type: "error",
        text: t("restore.noAppConnection", locale),
      });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <section className="mt-8 mb-4">
      <div className="bg-card/30 border border-border/60 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{buttonLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{helperText}</p>
        </div>
        <button
          onClick={handleRestore}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? t("restore.checking", locale) : buttonLabel}
        </button>
      </div>

      {message && (
        <div
          className={`mt-2 px-3 py-2 text-xs rounded-lg ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-red-500/10 text-red-300 border border-red-500/20"
          }`}
          role="status"
        >
          {message.text}
        </div>
      )}
    </section>
  );
}
