/**
 * v1.3 Feature Flag System (PATCHED for admin bypass)
 * 
 * Vercel 환경변수로 원격 on/off 제어.
 * 
 * 바이패스 우선순위:
 *   1. 환경변수 'true' → 모든 유저
 *   2. ADMIN_USER_IDS 목록 → 특정 user_id (UUID)
 *   3. ADMIN_EMAILS 목록 → 특정 이메일 (예: rimfacai@gmail.com)
 *      (rimfacai@gmail.com은 기본값으로 항상 포함)
 */

const ADMIN_PREVIEW_USER_IDS = (process.env.NEXT_PUBLIC_V13_ADMIN_USER_IDS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// rimfacai@gmail.com은 환경변수 미설정 시에도 기본 바이패스
const ADMIN_PREVIEW_EMAILS = (process.env.NEXT_PUBLIC_V13_ADMIN_EMAILS || "rimfacai@gmail.com")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export type V13Flag =
  | "ASK_SORAM"          // Ask Soram 챗봇 기능
  | "HOME_REDIRECT"      // 로그인 시 홈 → 소람 채팅 화면
  | "PRIMARY_CHART"      // 기본사주 영구 저장
  | "SUBSCRIPTION"       // Soram Daily Pass 구독
  | "DASHBOARD_QA";      // 대시보드 Q&A 히스토리

const FLAG_ENV_MAP: Record<V13Flag, string> = {
  ASK_SORAM: "NEXT_PUBLIC_V13_ASK_SORAM",
  HOME_REDIRECT: "NEXT_PUBLIC_V13_HOME_REDIRECT",
  PRIMARY_CHART: "NEXT_PUBLIC_V13_PRIMARY_CHART",
  SUBSCRIPTION: "NEXT_PUBLIC_V13_SUBSCRIPTION",
  DASHBOARD_QA: "NEXT_PUBLIC_V13_DASHBOARD_QA",
};

export interface V13UserContext {
  userId?: string | null;
  email?: string | null;
}

function normalizeContext(ctx?: V13UserContext | string | null): { userId: string | null; email: string | null } {
  if (!ctx) return { userId: null, email: null };
  if (typeof ctx === "string") return { userId: ctx, email: null };
  return { userId: ctx.userId || null, email: ctx.email || null };
}

/**
 * Feature flag가 활성화되어 있는지 확인
 * 
 * @param flag - 체크할 플래그 이름
 * @param ctx - 유저 컨텍스트 (userId 또는 email 또는 둘 다)
 *              - 문자열로 넘기면 userId로 간주
 *              - 객체로 넘기면 { userId, email } 둘 다 활용
 */
export function isV13Enabled(flag: V13Flag, ctx?: V13UserContext | string | null): boolean {
  const envKey = FLAG_ENV_MAP[flag];
  const envValue = process.env[envKey];
  
  // 1. 전체 활성화
  if (envValue === "true") return true;
  
  // 2. user_id / email 바이패스
  const { userId, email } = normalizeContext(ctx);
  
  if (userId && ADMIN_PREVIEW_USER_IDS.includes(userId)) return true;
  if (email && ADMIN_PREVIEW_EMAILS.includes(email.toLowerCase())) return true;
  
  return false;
}

/**
 * 모든 v1.3 플래그 상태 한 번에 조회 (디버깅용)
 */
export function getAllV13Flags(ctx?: V13UserContext | string | null): Record<V13Flag, boolean> {
  return {
    ASK_SORAM: isV13Enabled("ASK_SORAM", ctx),
    HOME_REDIRECT: isV13Enabled("HOME_REDIRECT", ctx),
    PRIMARY_CHART: isV13Enabled("PRIMARY_CHART", ctx),
    SUBSCRIPTION: isV13Enabled("SUBSCRIPTION", ctx),
    DASHBOARD_QA: isV13Enabled("DASHBOARD_QA", ctx),
  };
}

/**
 * 어드민 프리뷰 유저인지 확인
 */
export function isAdminPreview(ctx?: V13UserContext | string | null): boolean {
  if (!ctx) return false;
  const { userId, email } = normalizeContext(ctx);
  if (userId && ADMIN_PREVIEW_USER_IDS.includes(userId)) return true;
  if (email && ADMIN_PREVIEW_EMAILS.includes(email.toLowerCase())) return true;
  return false;
}
