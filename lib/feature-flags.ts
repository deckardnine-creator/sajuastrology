/**
 * v1.3 Feature Flag System
 * 
 * Vercel 환경변수로 원격 on/off 제어.
 * 문제 발생 시 코드 배포 없이 환경변수만 변경 → 즉시 롤백 가능.
 * 
 * 사용 예:
 *   import { isV13Enabled } from "@/lib/feature-flags";
 *   if (isV13Enabled('ASK_SORAM', userId)) { ... }
 */

const ADMIN_PREVIEW_USER_IDS = (process.env.NEXT_PUBLIC_V13_ADMIN_USER_IDS || "")
  .split(",")
  .map(s => s.trim())
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

/**
 * Feature flag가 활성화되어 있는지 확인
 * @param flag - 체크할 플래그 이름
 * @param userId - 옵션. 어드민 프리뷰 권한 체크용
 * @returns boolean
 * 
 * 활성화 조건 (OR):
 *   1. 환경변수가 'true'로 설정됨 (모든 유저 활성)
 *   2. userId가 ADMIN_PREVIEW_USER_IDS 목록에 있음 (어드민만 활성)
 */
export function isV13Enabled(flag: V13Flag, userId?: string | null): boolean {
  const envKey = FLAG_ENV_MAP[flag];
  const envValue = process.env[envKey];
  
  // 전체 활성화
  if (envValue === "true") return true;
  
  // 어드민 프리뷰 활성화
  if (userId && ADMIN_PREVIEW_USER_IDS.includes(userId)) return true;
  
  return false;
}

/**
 * 모든 v1.3 플래그 상태 한 번에 조회 (디버깅용)
 */
export function getAllV13Flags(userId?: string | null): Record<V13Flag, boolean> {
  return {
    ASK_SORAM: isV13Enabled("ASK_SORAM", userId),
    HOME_REDIRECT: isV13Enabled("HOME_REDIRECT", userId),
    PRIMARY_CHART: isV13Enabled("PRIMARY_CHART", userId),
    SUBSCRIPTION: isV13Enabled("SUBSCRIPTION", userId),
    DASHBOARD_QA: isV13Enabled("DASHBOARD_QA", userId),
  };
}

/**
 * 어드민 프리뷰 유저인지 확인
 */
export function isAdminPreview(userId?: string | null): boolean {
  if (!userId) return false;
  return ADMIN_PREVIEW_USER_IDS.includes(userId);
}
