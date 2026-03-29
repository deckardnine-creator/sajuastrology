// lib/rag/saju-query-builder.ts
// 사주 팔자 특성을 RAG 검색 쿼리로 변환

interface SajuProfile {
  // 사주 계산기에서 나오는 데이터
  yearStem?: string;   // 년간 (甲, 乙, ...)
  yearBranch?: string; // 년지 (子, 丑, ...)
  monthStem?: string;  // 월간
  monthBranch?: string;// 월지 (월령)
  dayStem?: string;    // 일간 (일주 천간)
  dayBranch?: string;  // 일지
  hourStem?: string;   // 시간
  hourBranch?: string; // 시지
  
  // 고급 분석 데이터 (saju-advanced.ts에서)
  dominantElement?: string;   // 주도 오행
  weakElement?: string;       // 부족 오행
  geGuk?: string;             // 격국 이름
  yongShin?: string;          // 용신
  dayMasterStrength?: string; // 일주 강약
  specialPatterns?: string[]; // 합충형파해 등
}

// 천간-오행 매핑
const STEM_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

// 천간-음양 매핑
const STEM_TO_YINYANG: Record<string, string> = {
  '甲': '阳木', '乙': '阴木', '丙': '阳火', '丁': '阴火', '戊': '阳土',
  '己': '阴土', '庚': '阳金', '辛': '阴金', '壬': '阳水', '癸': '阴水',
};

/**
 * 사주 프로필을 RAG 검색 쿼리들로 변환
 * 여러 관점의 쿼리를 생성하여 다양한 고전 구절을 검색
 */
export function buildSearchQueries(profile: SajuProfile): {
  primary: string;      // 일주 + 월령 중심 (가장 중요)
  secondary: string;    // 격국 + 용신 중심
  tertiary: string;     // 합충 + 특수 패턴
} {
  const dayStem = profile.dayStem || '';
  const monthBranch = profile.monthBranch || '';
  const dayBranch = profile.dayBranch || '';
  
  const element = STEM_TO_ELEMENT[dayStem] || '';
  const yinyang = STEM_TO_YINYANG[dayStem] || '';
  
  // 1차: 일주 천간 + 월령 (궁통보감 스타일)
  const primary = [
    `${dayStem}木 ${dayStem}日`,
    `${yinyang} 天干`,
    monthBranch ? `${monthBranch}月 ${dayStem}` : '',
    profile.dayMasterStrength || '',
  ].filter(Boolean).join(' ');

  // 2차: 격국 + 용신 (자평진전/격국론명 스타일)  
  const secondary = [
    profile.geGuk || '',
    profile.yongShin ? `用神 ${profile.yongShin}` : '',
    profile.dominantElement ? `${profile.dominantElement}旺` : '',
    profile.weakElement ? `${profile.weakElement}弱` : '',
    `${dayStem}日主`,
  ].filter(Boolean).join(' ');

  // 3차: 특수 패턴 (적천수/연해자평 스타일)
  const patterns = profile.specialPatterns || [];
  const tertiary = [
    ...patterns.slice(0, 3),
    dayStem ? `${dayStem}${dayBranch || ''} 日柱` : '',
    profile.yearStem ? `${profile.yearStem}年` : '',
  ].filter(Boolean).join(' ');

  return { primary, secondary, tertiary };
}

/**
 * 궁통보감 전용 쿼리 (월별 용신 검색)
 */
export function buildQiongTongQuery(dayStem: string, monthBranch: string): string {
  const monthMap: Record<string, string> = {
    '寅': '正月', '卯': '二月', '辰': '三月',
    '巳': '四月', '午': '五月', '未': '六月',
    '申': '七月', '酉': '八月', '戌': '九月',
    '亥': '十月', '子': '十一月', '丑': '十二月',
  };
  const monthName = monthMap[monthBranch] || '';
  return `${monthName}${dayStem} ${STEM_TO_ELEMENT[dayStem] || ''}`;
}

/**
 * 적천수 천간론 전용 쿼리
 */
export function buildDiTiStemQuery(dayStem: string): string {
  const stemDescriptions: Record<string, string> = {
    '甲': '甲木参天 阳木 天干 甲',
    '乙': '乙木花草 阴木 天干 乙',
    '丙': '丙火太阳 阳火 天干 丙',
    '丁': '丁火灯烛 阴火 天干 丁',
    '戊': '戊土大山 阳土 天干 戊',
    '己': '己土田园 阴土 天干 己',
    '庚': '庚金刚铁 阳金 天干 庚',
    '辛': '辛金珠玉 阴金 天干 辛',
    '壬': '壬水大海 阳水 天干 壬',
    '癸': '癸水雨露 阴水 天干 癸',
  };
  return stemDescriptions[dayStem] || `天干 ${dayStem}`;
}

/**
 * 서비스별 검색 강도 설정
 */
export function getSearchConfig(serviceType: 'free' | 'paid' | 'compatibility' | 'consultation'): {
  topK: number;
  sources: string[];
} {
  switch (serviceType) {
    case 'free':
      return { topK: 2, sources: ['dripping_heaven'] };
    case 'paid':
      return { topK: 5, sources: ['dripping_heaven', 'penetrating_treasure', 'true_interpretation', 'geju_lunming'] };
    case 'compatibility':
      return { topK: 3, sources: ['dripping_heaven', 'ocean_ziping'] };
    case 'consultation':
      return { topK: 3, sources: ['dripping_heaven', 'penetrating_treasure', 'true_interpretation'] };
    default:
      return { topK: 3, sources: ['dripping_heaven'] };
  }
}
