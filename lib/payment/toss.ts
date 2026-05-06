// lib/payment/toss.ts
// Toss Payments integration — STUB
// Activate when Toss Payments business review passes.
// Toss Payments is a Korean PG that bundles cards + Toss Pay + virtual account + mobile carrier billing.
//
// Required env vars when activating:
//   TOSS_CLIENT_KEY        (frontend public key)
//   TOSS_SECRET_KEY        (backend secret)
//   TOSS_WEBHOOK_SECRET    (webhook signature)

export async function createTossCheckout(): Promise<never> {
  throw new Error(
    "Toss Payments integration not yet activated. " +
    "Complete merchant review and add TOSS_* env vars."
  );
}

export async function verifyTossSignature(): Promise<boolean> {
  // Implement when activating
  return false;
}
