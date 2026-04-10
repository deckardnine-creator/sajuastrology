"use client";

import { useState, useEffect } from "react";

/**
 * Detects if the app is running inside a native wrapper.
 * 
 * Detection methods (any one triggers native mode):
 * 1. User-Agent contains "SajuApp" — set by Flutter WebView (primary, always reliable)
 * 2. URL param ?app=true — fallback for testing in browser
 * 
 * Side effect: when native is detected, adds `.native-app` class to <html>.
 * This drives CSS variables (--pt-page, --pt-page-lg) defined in globals.css,
 * allowing pages to use `.pt-page` / `.pt-page-lg` utilities that automatically
 * collapse top padding when the Flutter shell hides the web Navbar.
 * 
 * The class is only ever added (never removed) because:
 * - User-Agent never changes mid-session
 * - URL param ?app=true is set on initial load and persists across navigations
 * - Multiple useNativeApp() callers across pages remain idempotent
 */
export function useNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const uaMatch = navigator.userAgent.includes("SajuApp");
    const urlMatch = new URLSearchParams(window.location.search).get("app") === "true";
    const native = uaMatch || urlMatch;
    setIsNative(native);
    if (native) {
      document.documentElement.classList.add("native-app");
    }
  }, []);

  return isNative;
}

/**
 * Non-hook version for use outside React components (e.g., in event handlers).
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    navigator.userAgent.includes("SajuApp") ||
    new URLSearchParams(window.location.search).get("app") === "true"
  );
}
