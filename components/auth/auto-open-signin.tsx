"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

/**
 * Detects `?signin=1` in the URL on mount and opens the sign-in modal.
 *
 * Used on the home page so that /dashboard redirects (triggered when a
 * logged-out user tries to access a protected route) can land the user
 * on the home page AND open the sign-in modal in a single flow —
 * without flashing dashboard UI first.
 *
 * After triggering, it removes `?signin=1` from the URL via
 * history.replaceState so that a page refresh or share doesn't re-trigger.
 *
 * Uses `window.location.search` rather than `useSearchParams` to avoid
 * Next.js 14 App Router's Suspense requirement — this component renders
 * at the top of the home page and must not block first paint.
 */
export function AutoOpenSignin() {
  const { user, isLoading, openSignInModal } = useAuth();
  const firedRef = useRef(false);

  useEffect(() => {
    // Guard: only fire once per mount, never while auth is still resolving,
    // and never if the user is already signed in.
    if (firedRef.current) return;
    if (isLoading) return;
    if (user) return;

    if (typeof window === "undefined") return;

    const search = window.location.search;
    if (!search) return;

    const params = new URLSearchParams(search);
    if (params.get("signin") !== "1") return;

    firedRef.current = true;

    // Open the modal on the next frame so the home page has rendered
    // first — user briefly sees the hero, then the modal slides in.
    // This is intentional: it communicates "you are on the home page,
    // and here is sign-in" rather than a bare modal on a blank screen.
    requestAnimationFrame(() => {
      openSignInModal();

      // Clean up the URL so refresh doesn't re-open the modal.
      params.delete("signin");
      const newSearch = params.toString();
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    });
  }, [user, isLoading, openSignInModal]);

  return null;
}
