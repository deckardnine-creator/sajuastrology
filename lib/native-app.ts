"use client";

import { useState, useEffect } from "react";

/**
 * Detects if the app is running inside a native wrapper.
 * 
 * Detection methods (any one triggers native mode):
 * 1. User-Agent contains "SajuApp" — set by Flutter WebView (primary, always reliable)
 * 2. URL param ?app=true — set by Flutter when building tab URLs
 * 3. sessionStorage flag — persists detection across same-origin client navigations
 *    where the URL query param gets stripped (e.g. form submit → /reading/{slug}).
 * 
 * Side effect: when native is detected, adds `.native-app` class to <html>.
 * This drives CSS that collapses padding-top reserved for the (hidden) Navbar.
 * 
 * The class and sessionStorage flag are only ever added (never removed) because:
 * - User-Agent never changes mid-session
 * - Once flagged native, the flag remains true for the duration of the WebView
 * - Multiple useNativeApp() callers across pages remain idempotent
 */
export function useNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const uaMatch = navigator.userAgent.includes("SajuApp");
    const urlMatch = new URLSearchParams(window.location.search).get("app") === "true";
    let storedMatch = false;
    try {
      storedMatch = sessionStorage.getItem("native-app") === "1";
    } catch {}
    // FlutterBridge is injected by webview_flutter's addJavaScriptChannel.
    // This is the most reliable indicator — it exists ONLY inside the Flutter WebView.
    const bridgeMatch = typeof (window as any).FlutterBridge !== "undefined";

    const native = uaMatch || urlMatch || storedMatch || bridgeMatch;
    setIsNative(native);

    if (native) {
      document.documentElement.classList.add("native-app");
      try {
        sessionStorage.setItem("native-app", "1");
      } catch {}
    }
  }, []);

  return isNative;
}

/**
 * Non-hook version for use outside React components (e.g., in event handlers).
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof (window as any).FlutterBridge !== "undefined") return true;
  if (navigator.userAgent.includes("SajuApp")) return true;
  if (new URLSearchParams(window.location.search).get("app") === "true") return true;
  try {
    if (sessionStorage.getItem("native-app") === "1") return true;
  } catch {}
  return false;
}
