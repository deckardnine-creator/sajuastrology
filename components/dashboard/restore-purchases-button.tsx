"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useNativeApp } from "@/lib/native-app";
import { sendToFlutter, onFlutterMessage } from "@/lib/flutter-bridge";

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
      const text =
        count > 0
          ? locale === "ko"
            ? `${count}개의 구매가 복원되었습니다`
            : locale === "ja"
            ? `${count}件の購入を復元しました`
            : `${count} purchase${count === 1 ? "" : "s"} restored`
          : locale === "ko"
          ? "복원할 구매가 없습니다"
          : locale === "ja"
          ? "復元する購入はありません"
          : "No purchases to restore";

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
      const text =
        locale === "ko"
          ? `복원 실패: ${payload}`
          : locale === "ja"
          ? `復元失敗: ${payload}`
          : `Restore failed: ${payload}`;
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

  const buttonLabel =
    locale === "ko"
      ? "구매 복원"
      : locale === "ja"
      ? "購入を復元"
      : "Restore Purchases";

  const helperText =
    locale === "ko"
      ? "이전에 결제한 내역을 다시 불러옵니다."
      : locale === "ja"
      ? "以前の購入履歴を再読み込みします。"
      : "Re-check your App Store account for past purchases.";

  const handleRestore = () => {
    if (loading) return;
    setMessage(null);
    setLoading(true);
    const sent = sendToFlutter("iap:restore");
    if (!sent) {
      // FlutterBridge not available for some reason — fail fast rather
      // than leaving the spinner forever.
      setLoading(false);
      setMessage({
        type: "error",
        text:
          locale === "ko"
            ? "앱 연결을 확인할 수 없습니다"
            : locale === "ja"
            ? "アプリ接続を確認できません"
            : "Could not reach the native app",
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
          {loading
            ? locale === "ko"
              ? "확인 중..."
              : locale === "ja"
              ? "確認中..."
              : "Checking..."
            : buttonLabel}
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
