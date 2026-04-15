"use client";

import { useState, useEffect } from "react";

/**
 * Detects if the app is running inside a native wrapper.
 *
 * Detection methods (any one triggers native mode):
 * 1. window.FlutterBridge — injected by webview_flutter's addJavaScriptChannel.
 *    The most reliable indicator; it exists ONLY inside the Flutter WebView.
 * 2. User-Agent contains "SajuApp" — set by Flutter via setUserAgent().
 * 3. URL param ?app=true — set by Flutter when building tab URLs.
 * 4. sessionStorage flag — persists detection across same-origin client
 *    navigations where the URL query param gets stripped (form submit, etc).
 *
 * KEY DIFFERENCE FROM PREVIOUS VERSION:
 * Detection now runs SYNCHRONOUSLY inside useState's lazy initializer, BEFORE
 * the first render. This eliminates the 0.2s flash where SSR-default web UI
 * (header, footer banner, etc) briefly appears before useEffect updates state.
 *
 * SSR returns false (no `window`). The first client render then re-runs the
 * lazy initializer and gets the correct value immediately. React's hydration
 * mismatch warning for components using this hook is acceptable — the visible
 * outcome is that native chrome stays hidden from frame 1.
 */
function detectNative(): boolean {
  if (typeof window === "undefined") return false;
  // Order matters: cheapest checks first.
  if (typeof (window as { FlutterBridge?: unknown }).FlutterBridge !== "undefined") return true;
  if (navigator.userAgent.includes("SajuApp")) return true;
  if (new URLSearchParams(window.location.search).get("app") === "true") return true;
  try {
    if (sessionStorage.getItem("native-app") === "1") return true;
  } catch {}
  return false;
}

export function useNativeApp(): boolean {
  // Lazy initializer runs ONCE before first render — gives correct value on
  // frame 1 instead of waiting for useEffect to flip the state.
  const [isNative, setIsNative] = useState<boolean>(detectNative);

  useEffect(() => {
    // Re-check on mount in case FlutterBridge was injected after lazy init
    // (rare, but possible with some plugin versions).
    const native = detectNative();
    if (native !== isNative) setIsNative(native);
    if (native) {
      document.documentElement.classList.add("native-app");
      try { sessionStorage.setItem("native-app", "1"); } catch {}
    }
  }, [isNative]);

  return isNative;
}

/**
 * Non-hook version for use outside React components (event handlers, utils).
 */
export function isNativeApp(): boolean {
  return detectNative();
}
