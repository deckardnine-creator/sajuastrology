"use client";

import { useState, useEffect } from "react";

/**
 * Detects if the app is running inside a native wrapper.
 * 
 * Detection methods (any one triggers native mode):
 * 1. User-Agent contains "SajuApp" — set by Flutter WebView (primary, always reliable)
 * 2. URL param ?app=true — fallback for testing in browser
 * 
 * Note: User-Agent persists across all navigations within WebView,
 * so no localStorage persistence is needed.
 */
export function useNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const uaMatch = navigator.userAgent.includes("SajuApp");
    const urlMatch = new URLSearchParams(window.location.search).get("app") === "true";
    setIsNative(uaMatch || urlMatch);
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
