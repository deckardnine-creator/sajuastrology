"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useNativeApp } from "@/lib/native-app";
import { useLanguage } from "@/lib/language-context";

/**
 * Back button that only renders inside the native app (WebView).
 * On web, returns null — zero impact on existing web UI.
 */
export function AppBackButton() {
  const isNative = useNativeApp();
  const router = useRouter();
  const { locale } = useLanguage();

  if (!isNative) return null;

  const label =
    locale === "ko" ? "뒤로" : locale === "ja" ? "戻る" : "Back";

  return (
    <div className="px-4 pt-2 pb-1">
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          }
        }}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </button>
    </div>
  );
}
