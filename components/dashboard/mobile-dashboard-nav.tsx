"use client";

// ════════════════════════════════════════════════════════════════════
// MobileDashboardNav — DEPRECATED in v1.3 Sprint 2-B
// ════════════════════════════════════════════════════════════════════
// This was a 3-tab dashboard-only bar (Dashboard / New Reading /
// Consultation). It has been superseded by the global 5-tab
// MobileBottomNav (Home / Reading / Soram / Match / My) which is
// mounted in app/layout.tsx and visible across the entire app.
//
// Why we keep this file as a shim instead of deleting:
//   1. app/dashboard/page.tsx still imports it. Removing the file
//      breaks the build before that import gets cleaned up.
//   2. Some TestFlight builds may have the dashboard route cached.
//      Returning null is a no-op — safe in any deployment order.
//
// New implementation: components/layout/mobile-bottom-nav.tsx
// ════════════════════════════════════════════════════════════════════

export function MobileDashboardNav() {
  // Replaced by the global MobileBottomNav in app/layout.tsx.
  return null;
}
