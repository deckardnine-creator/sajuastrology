export type Locale = "en" | "ko" | "ja";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
};

export const DEFAULT_LOCALE: Locale = "en";

const translations = {
  // ─── Navbar ───
  "nav.whatIsSaju": { en: "What is Saju?", ko: "사주란?", ja: "四柱とは？" },
  "nav.pricing": { en: "Pricing", ko: "요금제", ja: "料金" },
  "nav.compatibility": { en: "Compatibility", ko: "궁합", ja: "相性" },
  "nav.consultation": { en: "Consultation", ko: "상담", ja: "相談" },
  "nav.getReading": { en: "Get Your Reading — Free", ko: "무료 사주 보기", ja: "無料で鑑定する" },
  "nav.signIn": { en: "Sign In", ko: "로그인", ja: "ログイン" },
  "nav.signOut": { en: "Sign Out", ko: "로그아웃", ja: "ログアウト" },
  "nav.dashboard": { en: "My Dashboard", ko: "내 대시보드", ja: "マイページ" },

  // ─── Footer ───
  "footer.privacy": { en: "Privacy", ko: "개인정보처리방침", ja: "プライバシー" },
  "footer.terms": { en: "Terms", ko: "이용약관", ja: "利用規約" },

  // ─── Hero ───
  "hero.title1": { en: "Your Birth Date Holds a", ko: "당신의 생년월일에는", ja: "あなたの生年月日には" },
  "hero.title2": { en: "5,000-Year-Old Code.", ko: "5,000년의 비밀이 있습니다.", ja: "5,000年の秘密が隠されています。" },
  "hero.desc": {
    en: "Western astrology gives you 1 of 12 types. Saju gives you 1 of 518,400 unique cosmic profiles. Get your free reading in 30 seconds — plus personalized daily fortune updates based on your chart.",
    ko: "서양 별자리는 12가지 유형 중 하나. 사주는 518,400가지 고유한 우주적 프로필 중 하나를 제공합니다. 30초 만에 무료 사주를 받고, 매일 맞춤 운세도 확인하세요.",
    ja: "西洋占星術は12タイプの1つ。四柱推命は518,400通りの固有プロフィールの1つを提供します。30秒で無料鑑定、毎日のパーソナル運勢もチェック。",
  },
  "hero.cta": { en: "See My Reading — Free", ko: "무료 사주 보기", ja: "無料で鑑定する" },
  "hero.appComingSoon": {
    en: "app coming very soon — use the web app for now!",
    ko: "앱 곧 출시 — 지금은 웹에서 이용하세요!",
    ja: "アプリ近日公開 — 今はWebでご利用ください！",
  },

  // ─── Pricing ───
  "pricing.title": { en: "Choose Your Path", ko: "나의 길을 선택하세요", ja: "あなたの道を選ぶ" },
  "pricing.subtitle": {
    en: "Start free. Pay once when you're ready — no subscriptions, no recurring fees.",
    ko: "무료로 시작하세요. 준비되면 한 번만 결제 — 구독 없음, 반복 결제 없음.",
    ja: "無料で始めましょう。準備ができたら一回払い — サブスクなし。",
  },
  "pricing.free": { en: "Free", ko: "무료", ja: "無料" },
  "pricing.oneTime": { en: "one-time", ko: "1회 결제", ja: "一回払い" },

  // ─── Consultation ───
  "consult.badge": { en: "Master Consultation", ko: "마스터 상담", ja: "マスター相談" },
  "consult.title1": { en: "Your Personal", ko: "나만의", ja: "あなただけの" },
  "consult.title2": { en: "Saju Advisor", ko: "사주 어드바이저", ja: "四柱アドバイザー" },
  "consult.desc": {
    en: "Ask any life question and receive a detailed analysis through the lens of your unique birth chart.",
    ko: "삶의 어떤 질문이든 하세요. 당신의 사주를 통해 상세한 분석을 받으실 수 있습니다.",
    ja: "人生のあらゆる質問をどうぞ。あなたの四柱を通じた詳細な分析をお届けします。",
  },
  "consult.remaining": { en: "remaining", ko: "남음", ja: "残り" },
  "consult.consultation": { en: "consultation", ko: "상담", ja: "相談" },
  "consult.consultations": { en: "consultations", ko: "상담", ja: "相談" },
  "consult.birthInfo": { en: "Your Birth Information", ko: "출생 정보", ja: "生年月日情報" },
  "consult.edit": { en: "Edit", ko: "수정", ja: "編集" },
  "consult.category": { en: "What area of life is your question about?", ko: "어떤 분야에 대한 질문인가요?", ja: "どの分野についての質問ですか？" },
  "consult.questionLabel": { en: "Describe your question or situation", ko: "질문이나 상황을 설명해주세요", ja: "質問や状況を説明してください" },
  "consult.submit": { en: "Submit Consultation", ko: "상담 제출", ja: "相談を送信" },
  "consult.signIn": { en: "Sign In to Get Started", ko: "로그인하여 시작하기", ja: "ログインして始める" },
  "consult.unlock": { en: "Unlock Master Consultations", ko: "마스터 상담 열기", ja: "マスター相談を解除" },
  "consult.get5": { en: "Get 5 Consultations", ko: "상담 5회 구매", ja: "相談5回を購入" },

  // ─── Categories ───
  "cat.career": { en: "Career & Work", ko: "직업 & 일", ja: "仕事 & キャリア" },
  "cat.love": { en: "Love & Relationships", ko: "연애 & 관계", ja: "恋愛 & 人間関係" },
  "cat.timing": { en: "Timing & Decisions", ko: "시기 & 결정", ja: "タイミング & 決断" },
  "cat.wealth": { en: "Wealth & Finance", ko: "재물 & 재정", ja: "財運 & 金融" },
  "cat.health": { en: "Health & Wellness", ko: "건강 & 웰빙", ja: "健康 & ウェルネス" },
  "cat.general": { en: "General Life", ko: "종합 운세", ja: "総合運" },

  // ─── Form Fields ───
  "form.name": { en: "Full Name", ko: "이름", ja: "氏名" },
  "form.namePlaceholder": { en: "Enter your name", ko: "이름을 입력하세요", ja: "名前を入力" },
  "form.gender": { en: "Gender", ko: "성별", ja: "性別" },
  "form.male": { en: "♂ Male", ko: "♂ 남성", ja: "♂ 男性" },
  "form.female": { en: "♀ Female", ko: "♀ 여성", ja: "♀ 女性" },
  "form.birthDate": { en: "Birth Date", ko: "생년월일", ja: "生年月日" },
  "form.birthHour": { en: "Birth Hour", ko: "태어난 시간", ja: "出生時刻" },
  "form.birthHourNote": { en: "(approximate is fine)", ko: "(대략적이어도 괜찮습니다)", ja: "(おおよそで大丈夫です)" },
  "form.birthCity": { en: "Birth City", ko: "출생 도시", ja: "出生都市" },
  "form.cityPlaceholder": { en: "Search city (e.g., Seoul, Tokyo, New York)", ko: "도시 검색 (예: 서울, 도쿄, 뉴욕)", ja: "都市検索（例：東京、ソウル）" },

  // ─── Compatibility ───
  "compat.badge": { en: "Compatibility Check", ko: "궁합 체크", ja: "相性チェック" },
  "compat.title1": { en: "Cosmic", ko: "운명적", ja: "宇宙の" },
  "compat.title2": { en: "Compatibility", ko: "궁합", ja: "相性" },
  "compat.desc": {
    en: "Discover how your Four Pillars align with another person's destiny.",
    ko: "당신의 사주가 상대방의 운명과 어떻게 조화되는지 알아보세요.",
    ja: "あなたの四柱が相手の運命とどう調和するか確認しましょう。",
  },
  "compat.you": { en: "You", ko: "나", ja: "あなた" },
  "compat.partner": { en: "Partner", ko: "상대방", ja: "相手" },
  "compat.next": { en: "Next: Partner's Info", ko: "다음: 상대방 정보", ja: "次：相手の情報" },
  "compat.check": { en: "Check Compatibility", ko: "궁합 확인", ja: "相性を確認" },

  // ─── Dashboard ───
  "dash.welcome": { en: "Welcome back,", ko: "돌아오셨군요,", ja: "おかえりなさい、" },
  "dash.todayEnergy": { en: "Today's Energy", ko: "오늘의 에너지", ja: "今日のエネルギー" },
  "dash.dayMaster": { en: "Day Master", ko: "일주", ja: "日主" },
  "dash.todayLucky": { en: "Today's Lucky", ko: "오늘의 행운", ja: "今日のラッキー" },
  "dash.todayFortune": { en: "Today's Fortune", ko: "오늘의 운세", ja: "今日の運勢" },
  "dash.fourPillars": { en: "Your Four Pillars", ko: "나의 사주팔자", ja: "あなたの四柱" },
  "dash.thisWeek": { en: "This Week", ko: "이번 주", ja: "今週" },
  "dash.myReadings": { en: "My Readings", ko: "내 사주", ja: "鑑定結果" },
  "dash.newReading": { en: "New Reading", ko: "새 사주", ja: "新規鑑定" },
  "dash.myConsultations": { en: "My Consultations", ko: "내 상담", ja: "相談履歴" },
  "dash.share": { en: "Share", ko: "공유", ja: "共有" },
  "dash.fullReading": { en: "Full Reading", ko: "전체 보기", ja: "全文を見る" },

  // ─── Common ───
  "common.back": { en: "Back", ko: "뒤로", ja: "戻る" },
  "common.loading": { en: "Loading...", ko: "로딩 중...", ja: "読み込み中..." },
  "common.error": { en: "Something went wrong", ko: "오류가 발생했습니다", ja: "エラーが発生しました" },
  "common.tryAgain": { en: "Try Again", ko: "다시 시도", ja: "もう一度" },
  "common.copied": { en: "Copied!", ko: "복사됨!", ja: "コピー完了！" },
  "common.copyLink": { en: "Copy Link", ko: "링크 복사", ja: "リンクをコピー" },
  "common.free": { en: "Free", ko: "무료", ja: "無料" },
  "common.excellent": { en: "Excellent", ko: "아주 좋음", ja: "最高" },
  "common.balanced": { en: "Balanced", ko: "균형", ja: "バランス" },
  "common.beGentle": { en: "Be gentle", ko: "무리하지 마세요", ja: "ゆっくりと" },

  // ─── Disclaimer ───
  "disclaimer": {
    en: "This is for entertainment and self-reflection only. See our Terms.",
    ko: "이 서비스는 오락 및 자기 성찰 목적으로만 제공됩니다. 이용약관을 참고하세요.",
    ja: "エンターテインメントおよび自己理解の目的でのみ提供されます。利用規約をご覧ください。",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[locale] || entry.en;
}

export default translations;
