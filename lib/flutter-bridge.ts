"use client";

/**
 * Flutter ↔ Web Bridge
 * 
 * [Web → Flutter] via FlutterBridge.postMessage(string)
 *   - 'iap:full_destiny_reading:{shareSlug}'  — trigger IAP purchase
 *   - 'iap:master_consultation_5'             — trigger consultation IAP
 *   - 'auth:login:google'                     — trigger Google sign-in
 *   - 'auth:login:apple'                      — trigger Apple sign-in
 *   - 'auth:logout'                           — trigger sign-out
 *   - 'rating:trigger'                        — trigger app rating dialog
 * 
 * [Flutter → Web] via window.onFlutterMessage(string)
 *   - 'iap:success:{shareSlug}'               — purchase completed
 *   - 'iap:error:{message}'                   — purchase failed
 *   - 'auth:session:{accessToken}|{refreshToken}' — inject session into web Supabase client
 *   - 'auth:logout'                           — signed out
 */

import { supabase } from "./supabase-client";

// Extend Window for TypeScript
declare global {
  interface Window {
    FlutterBridge?: {
      postMessage: (message: string) => void;
    };
    onFlutterMessage?: (message: string) => void;
    __flutterBridgeListeners?: Map<string, Set<(payload: string) => void>>;
  }
}

/**
 * Send a message to Flutter native layer.
 * No-op if not running in Flutter WebView.
 */
export function sendToFlutter(message: string): boolean {
  if (typeof window !== "undefined" && window.FlutterBridge) {
    window.FlutterBridge.postMessage(message);
    return true;
  }
  return false;
}

/**
 * Request IAP purchase from Flutter.
 */
export function requestIAP(productId: string, shareSlug?: string): boolean {
  const msg = shareSlug
    ? `iap:${productId}:${shareSlug}`
    : `iap:${productId}`;
  return sendToFlutter(msg);
}

/**
 * Request auth from Flutter.
 */
export function requestAuth(provider: "google" | "apple"): boolean {
  return sendToFlutter(`auth:login:${provider}`);
}

/**
 * Request sign-out from Flutter.
 */
export function requestSignOut(): boolean {
  return sendToFlutter("auth:logout");
}

/**
 * Subscribe to messages from Flutter.
 * Returns unsubscribe function.
 */
export function onFlutterMessage(
  prefix: string,
  callback: (payload: string) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  if (!window.__flutterBridgeListeners) {
    window.__flutterBridgeListeners = new Map();

    // Install the global handler once
    window.onFlutterMessage = (message: string) => {
      // Handle auth:session injection directly — set Supabase session in web client
      if (message.startsWith("auth:session:")) {
        const payload = message.slice("auth:session:".length);
        const sepIndex = payload.indexOf("|");
        if (sepIndex > 0) {
          const accessToken = payload.slice(0, sepIndex);
          const refreshToken = payload.slice(sepIndex + 1);
          if (accessToken && refreshToken) {
            // setSession refreshes the Supabase JS client session so
            // onAuthStateChange fires → AuthContext updates → UI re-renders
            supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
              .catch(() => {});
          }
        }
        // Also dispatch to any registered listeners
      }

      const listeners = window.__flutterBridgeListeners;
      if (!listeners) return;

      for (const [prefix, callbacks] of listeners) {
        if (message.startsWith(prefix)) {
          const payload = message.slice(prefix.length);
          callbacks.forEach((cb) => cb(payload));
        }
      }
    };
  }

  const listeners = window.__flutterBridgeListeners;
  if (!listeners.has(prefix)) {
    listeners.set(prefix, new Set());
  }
  listeners.get(prefix)!.add(callback);

  return () => {
    listeners.get(prefix)?.delete(callback);
  };
}
