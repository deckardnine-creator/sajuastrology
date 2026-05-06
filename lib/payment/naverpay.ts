// lib/payment/naverpay.ts
// Naver Pay integration — STUB
// Activate when Naver Pay merchant review passes.
//
// Required env vars when activating:
//   NAVERPAY_PARTNER_ID
//   NAVERPAY_CLIENT_ID
//   NAVERPAY_CLIENT_SECRET
//   NAVERPAY_CHAIN_ID

export async function createNaverPayCheckout(): Promise<never> {
  throw new Error(
    "Naver Pay integration not yet activated. " +
    "Complete merchant review and add NAVERPAY_* env vars."
  );
}

export async function verifyNaverPaySignature(): Promise<boolean> {
  // Implement when activating
  return false;
}
