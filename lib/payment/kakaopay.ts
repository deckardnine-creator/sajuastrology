// lib/payment/kakaopay.ts
// Kakao Pay integration — STUB
// Activate when Kakao Pay merchant review passes.
//
// Required env vars when activating:
//   KAKAOPAY_CID                   (test: TC0ONETIME, live: assigned by Kakao)
//   KAKAOPAY_ADMIN_KEY
//   KAKAOPAY_SECRET_KEY

export async function createKakaoPayCheckout(): Promise<never> {
  throw new Error(
    "Kakao Pay integration not yet activated. " +
    "Complete merchant review and add KAKAOPAY_* env vars."
  );
}

export async function verifyKakaoPaySignature(): Promise<boolean> {
  // Implement when activating
  return false;
}
