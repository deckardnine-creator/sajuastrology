"use client";

import { useState, useEffect } from "react";

/**
 * Detects if the app is running inside a Capacitor native wrapper.
 * Uses custom user agent string appended via capacitor.config.ts.
 */
export function useNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(navigator.userAgent.includes("SajuApp"));
  }, []);

  return isNative;
}
