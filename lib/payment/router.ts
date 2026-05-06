// lib/payment/router.ts
// Decides which payment methods to display based on user locale/country.
// Korea: Creem + Toss + Naver Pay + Kakao Pay (PayPal excluded — no KR card support)
// Global: Creem + PayPal

export type PaymentMethod =
  | "creem"        // Always available (global cards via MoR)
  | "paypal"       // Global non-KR users
  | "toss"         // Korea — KR cards + Toss Pay + virtual account + mobile
  | "naverpay"     // Korea — Naver Pay
  | "kakaopay";    // Korea — Kakao Pay

interface RouterContext {
  locale: string;            // 'ko' | 'en' | 'ja' | etc — from useLanguage()
  ipCountry?: string;        // ISO-3166-1 alpha-2 from CF-IPCountry header
}

/**
 * Returns the list of payment methods available for this user, in display order.
 * UI should render them top-to-bottom in the returned order.
 *
 * Active methods are determined by:
 * 1. User region (Korea vs Global)
 * 2. Whether the method is currently enabled (via env vars / feature flags)
 */
export function getAvailablePaymentMethods(ctx: RouterContext): PaymentMethod[] {
  const isKorean = ctx.locale === "ko" || ctx.ipCountry === "KR";

  const candidates: PaymentMethod[] = isKorean
    // Korea: KR PGs first (familiar to users), Creem as fallback for foreign cards
    ? ["toss", "naverpay", "kakaopay", "creem"]
    // Global: PayPal first (high recognition), Creem as alternative
    : ["paypal", "creem"];

  return candidates.filter(isPaymentMethodActive);
}

/**
 * Whether a payment method is currently active/integrated.
 * As we activate new PGs (Toss/Naver/Kakao), flip the flag here.
 *
 * Currently active: creem, paypal
 * Pending integration (KR PGs in review): toss, naverpay, kakaopay
 */
export function isPaymentMethodActive(method: PaymentMethod): boolean {
  switch (method) {
    case "creem":
      return Boolean(process.env.CREEM_API_KEY);
    case "paypal":
      return Boolean(process.env.PAYPAL_CLIENT_ID);
    case "toss":
      // TODO: enable when Toss Payments review passes
      return Boolean(process.env.TOSS_CLIENT_KEY);
    case "naverpay":
      // TODO: enable when Naver Pay review passes
      return Boolean(process.env.NAVERPAY_PARTNER_ID);
    case "kakaopay":
      // TODO: enable when Kakao Pay review passes
      return Boolean(process.env.KAKAOPAY_CID);
    default:
      return false;
  }
}

/**
 * Display label for each payment method (used in UI).
 * Localized externally — this returns the i18n key, not the display text.
 */
export function getMethodLabel(method: PaymentMethod, locale: string): string {
  // Inline labels for now — move to translations.ts later if needed
  const labels: Record<PaymentMethod, Record<string, string>> = {
    paypal: {
      en: "Pay with PayPal",
      ko: "PayPal로 결제",
      ja: "PayPalで支払う",
    },
    creem: {
      en: "Pay with card (Visa / Mastercard / JCB)",
      ko: "해외 카드 결제 (Visa / Master / JCB)",
      ja: "カード決済 (Visa / Master / JCB)",
    },
    toss: {
      ko: "토스페이먼츠 (카드 / 토스페이 / 가상계좌)",
      en: "Toss Payments",
      ja: "Toss Payments",
    },
    naverpay: {
      ko: "네이버페이",
      en: "Naver Pay",
      ja: "Naver Pay",
    },
    kakaopay: {
      ko: "카카오페이",
      en: "Kakao Pay",
      ja: "Kakao Pay",
    },
  };
  return labels[method][locale] || labels[method].en || method;
}
