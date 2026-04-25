/**
 * Soram Image Asset Constants
 * 
 * 모든 소람 이미지 경로를 한 곳에서 관리.
 * 나중에 투명 PNG로 교체될 때, 같은 경로에 새 파일 덮어쓰기만 하면
 * 코드 수정 없이 자동 적용됨.
 */

const BASE = "/soram/v1";

/**
 * 큰 일러스트 (홈 / 채팅 / 모달용)
 */
export const SORAM_IMAGES = {
  /** #1 환영 인사 — 로그인 직후 홈 히어로 */
  welcome: `${BASE}/main/soram_welcome.webp`,
  
  /** #2 대기/경청 — Ask Soram 입력창 옆 기본 상태 */
  listening: `${BASE}/main/soram_listening.webp`,
  
  /** #3 사주 해석 중 — 답변 생성 로딩 */
  reading: `${BASE}/main/soram_reading.webp`,
  
  /** #4 답변 전달 — 200자 답변 표시 시 */
  answering: `${BASE}/main/soram_answering.webp`,
  
  /** #5 격려/축하 — 기본사주 저장 완료 직후 */
  cheering: `${BASE}/main/soram_cheering.webp`,
  
  /** #6 조용한 미소 — 하루 1회 리밋 도달 시 (비구독자) */
  rest: `${BASE}/main/soram_rest.webp`,
  
  /** #7 경고/신중 — 기본사주 저장 컨펌 모달 */
  serious: `${BASE}/main/soram_serious.webp`,
  
  /** #8 서재 배너 — 대시보드 "소람과의 대화" 섹션 헤더 */
  library_banner: `${BASE}/main/soram_library_banner.webp`,
  
  /** #9 인사/퇴장 — 로그아웃/에러 상태 */
  farewell: `${BASE}/main/soram_farewell.webp`,
} as const;

/**
 * 표정 아바타 (Q&A 히스토리, 답변 톤별 표시)
 * 8가지 표정 — AI가 답변 시 tone 필드 반환 → 해당 아바타 사용
 */
export const SORAM_FACES = {
  default: `${BASE}/avatars/soram_face_default.png`,
  concern: `${BASE}/avatars/soram_face_concern.png`,
  hidden_joy: `${BASE}/avatars/soram_face_hidden_joy.png`,
  sarcasm: `${BASE}/avatars/soram_face_sarcasm.png`,
  bewildered: `${BASE}/avatars/soram_face_bewildered.png`,
  contemplation: `${BASE}/avatars/soram_face_contemplation.png`,
  exhausted: `${BASE}/avatars/soram_face_exhausted.png`,
  void: `${BASE}/avatars/soram_face_void.png`,
} as const;

export type SoramTone = keyof typeof SORAM_FACES;

/**
 * 안전한 톤 검증 (AI가 잘못된 값 반환 시 default로 폴백)
 */
export function getSoramFace(tone: string | undefined | null): string {
  if (tone && tone in SORAM_FACES) {
    return SORAM_FACES[tone as SoramTone];
  }
  return SORAM_FACES.default;
}

/**
 * 톤별 한국어 설명 (디버깅용 / 선택적 노출용)
 */
export const SORAM_TONE_LABELS: Record<SoramTone, { ko: string; en: string; ja: string }> = {
  default: { ko: "평온", en: "Calm", ja: "穏やか" },
  concern: { ko: "걱정", en: "Concerned", ja: "心配" },
  hidden_joy: { ko: "숨은 기쁨", en: "Hidden Joy", ja: "秘めた喜び" },
  sarcasm: { ko: "장난기", en: "Playful", ja: "茶目っ気" },
  bewildered: { ko: "당황", en: "Bewildered", ja: "戸惑い" },
  contemplation: { ko: "사색", en: "Contemplative", ja: "考慮" },
  exhausted: { ko: "지친", en: "Tired", ja: "疲れ" },
  void: { ko: "공허", en: "Empty", ja: "空虚" },
};
