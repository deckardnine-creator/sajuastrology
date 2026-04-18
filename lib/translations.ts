// ═══════════════════════════════════════════════════════════════════
// Locale: 11 languages supported (EN/KO/JA fully translated;
// others fall back to English until translation data is injected
// in Phase 1a-2. Type uses Partial so missing keys compile cleanly.)
// ═══════════════════════════════════════════════════════════════════
export type Locale =
  | "en"
  | "ko"
  | "ja"
  | "zh-TW"
  | "hi"
  | "es"
  | "fr"
  | "pt"
  | "ru"
  | "id";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  "zh-TW": "中文繁體",
  hi: "हिन्दी",
  es: "Español",
  fr: "Français",
  pt: "Português",
  ru: "Русский",
  id: "Indonesia",
};

// Short code shown in the language switcher button
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  ko: "KO",
  ja: "JA",
  "zh-TW": "繁",
  hi: "HI",
  es: "ES",
  fr: "FR",
  pt: "PT",
  ru: "RU",
  id: "ID",
};

// RTL languages — text direction only, layout stays LTR
// Currently no RTL languages are supported. Kept as typed empty array so
// callers of isRTL() still compile without branching on null/undefined.
export const RTL_LOCALES: readonly Locale[] = [] as const;
export const isRTL = (locale: Locale): boolean =>
  RTL_LOCALES.includes(locale);

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORTED_LOCALES: readonly Locale[] = [
  "en",
  "ko",
  "ja",
  "zh-TW",
  "hi",
  "es",
  "fr",
  "pt",
  "ru",
  "id",
] as const;

// Translation data. Each entry must have en (fallback); other
// locales are optional. Missing locales resolve to en at runtime
// via the t() function below.
const translations = {
  // ─── Navbar ───
  "nav.whatIsSaju": { en: "What is Saju?", ko: "사주란?", ja: "四柱とは？", es: "¿Qué es Saju?" },
  "nav.pricing": { en: "Pricing", ko: "요금제", ja: "料金", es: "Precios" },
  "nav.compatibility": { en: "Compatibility", ko: "궁합", ja: "相性", es: "Compatibilidad" },
  "nav.consultation": { en: "Consultation", ko: "상담", ja: "相談", es: "Consulta" },
  "nav.getReading": { en: "Get Your Reading — Free", ko: "무료 사주 보기", ja: "無料で鑑定する", es: "Tu lectura — Gratis" },
  "nav.signIn": { en: "Sign In", ko: "로그인", ja: "ログイン", es: "Iniciar sesión" },
  "nav.signOut": { en: "Sign Out", ko: "로그아웃", ja: "ログアウト", es: "Cerrar sesión" },
  "nav.home": { en: "Home", ko: "홈", ja: "ホーム", es: "Inicio" },
  "nav.dashboard": { en: "My Dashboard", ko: "내 대시보드", ja: "マイページ", es: "Mi panel" },

  // ─── Footer ───
  "footer.privacy": { en: "Privacy", ko: "개인정보처리방침", ja: "プライバシー", es: "Privacidad" },
  "footer.terms": { en: "Terms", ko: "이용약관", ja: "利用規約", es: "Términos" },
  // ─── Hero ───
  "hero.title1": { en: "Your Birth Date Holds a", ko: "당신의 생년월일에는", ja: "あなたの生年月日には", es: "Tu fecha de nacimiento guarda" },
  "hero.title2": { en: "5,000-Year-Old Code.", ko: "5,000년의 비밀이 있습니다.", ja: "5,000年の秘密が隠されています。", es: "un código de 5.000 años." },
  "hero.desc": {
    en: "Western astrology gives you 1 of 12 types. Saju gives you 1 of 518,400 unique cosmic profiles. Get your free reading in 30 seconds — plus personalized daily fortune updates based on your chart.",
    ko: "서양 별자리는 12가지 유형 중 하나. 사주는 518,400가지 고유한 우주적 프로필 중 하나를 제공합니다. 30초 만에 무료 사주를 받고, 매일 맞춤 운세도 확인하세요.",
    ja: "西洋占星術は12タイプの1つ。四柱推命は518,400通りの固有プロフィールの1つを提供します。30秒で無料鑑定、毎日のパーソナル運勢もチェック。",
    es: "La astrología occidental te da 1 de 12 tipos. Saju te da 1 de 518.400 perfiles cósmicos únicos. Recibe tu lectura gratis en 30 segundos — más pronóstico diario personalizado basado en tu carta.",
  },
  "hero.cta": { en: "See My Reading — Free", ko: "무료 사주 보기", ja: "無料で鑑定する", es: "Ver mi lectura — Gratis" },
  "hero.appComingSoon": {
    en: "app coming very soon — use the web app for now!",
    ko: "앱 곧 출시 — 지금은 웹에서 이용하세요!",
    ja: "アプリ近日公開 — 今はWebでご利用ください！",
    es: "App muy pronto — ¡usa la versión web por ahora!",
  },
  "hero.techLine": { en: "562 classical passages from 5 ancient texts — vector-matched in real time", ko: "5대 고전 원전 562개 패시지 실시간 벡터 분석", ja: "5大古典原典562パッセージをリアルタイムベクトル分析", es: "562 pasajes clásicos de 5 textos antiguos — comparados por vectores en tiempo real" },
  "hero.letterLink": { en: "✒ A Letter from Rimfactory — what we're building →", ko: "✒ 림팩토리의 편지 — 우리가 무엇을 만들고 있는지 →", ja: "✒ Rimfactoryからの手紙 — 何を作っているのか →", es: "✒ Una carta de Rimfactory — lo que estamos construyendo →" },
  "hero.celebLink": { en: "✦ Read Celebrity Saju Readings →", ko: "✦ 셀럽 사주 분석 보기 →", ja: "✦ セレブの四柱推命を見る →", es: "✦ Lee lecturas de celebridades Saju →" },

  // ─── How It Works ───
  "hiw.title": { en: "How It Works", ko: "이용 방법", ja: "ご利用方法", es: "Cómo funciona" },
  "hiw.desc": { en: "Three simple steps to unlock your cosmic blueprint", ko: "우주적 청사진을 여는 3가지 간단한 단계", ja: "宇宙の設計図を解き明かす3つのステップ", es: "Tres pasos simples para desbloquear tu plano cósmico" },
  "hiw.step": { en: "Step", ko: "단계", ja: "ステップ", es: "Paso" },
  "hiw.step1.title": { en: "Enter Your Birth Moment", ko: "출생 정보 입력", ja: "生年月日時を入力", es: "Ingresa tu momento de nacimiento" },
  "hiw.step1.desc": { en: "Your exact date, time, and city of birth. We calculate True Solar Time for precision.", ko: "정확한 생년월일, 시간, 출생 도시를 입력하세요. 정확도를 위해 진태양시를 계산합니다.", ja: "正確な生年月日、時間、都市を入力。精度のため真太陽時を計算します。", es: "Tu fecha, hora y ciudad exacta de nacimiento. Calculamos la Hora Solar Verdadera para precisión." },
  "hiw.step2.title": { en: "Decode Your Four Pillars", ko: "사주팔자 해석", ja: "四柱を解読", es: "Decodifica tus Cuatro Pilares" },
  "hiw.step2.desc": { en: "Our engine maps the cosmic energy state at your birth into 8 characters across 4 pillars.", ko: "우리 엔진이 출생 시의 우주 에너지 상태를 4개 기둥, 8개 글자로 매핑합니다.", ja: "エンジンが誕生時の宇宙エネルギーを4柱8文字にマッピングします。", es: "Nuestro motor mapea el estado de energía cósmica en tu nacimiento en 8 caracteres a través de 4 pilares." },
  "hiw.step3.title": { en: "Receive Your Cosmic Blueprint", ko: "우주적 청사진 받기", ja: "宇宙の設計図を受け取る", es: "Recibe tu plano cósmico" },
  "hiw.step3.desc": { en: "Get a hyper-personalized analysis of your personality, career path, love life, and fortune cycles.", ko: "성격, 직업, 연애, 운세 사이클에 대한 초개인화 분석을 받으세요.", ja: "性格、職業、恋愛、運勢サイクルの超パーソナル分析をお受け取りください。", es: "Obtén un análisis hiperpersonalizado de tu personalidad, carrera, vida amorosa y ciclos de fortuna." },

  // ─── Comparison Section ───
  "comp.title": { en: "Why Saju Is Different", ko: "사주가 다른 이유", ja: "四柱推命が異なる理由", es: "Por qué Saju es diferente" },
  "comp.desc": { en: "See how K-Astrology compares to traditional Western zodiac", ko: "K-점성술이 전통 서양 별자리와 어떻게 다른지 알아보세요", ja: "K-占星術が西洋占星術とどう違うか確認", es: "Descubre cómo la K-Astrología se compara con el zodíaco occidental tradicional" },
  "comp.western": { en: "Western Zodiac", ko: "서양 별자리", ja: "西洋占星術", es: "Zodíaco occidental" },
  "comp.western1": { en: "12 Types", ko: "12가지 유형", ja: "12タイプ", es: "12 tipos" },
  "comp.western2": { en: "Based on sun position", ko: "태양 위치 기반", ja: "太陽の位置に基づく", es: "Basado en la posición del sol" },
  "comp.western3": { en: "Monthly predictions", ko: "월별 예측", ja: "月別予測", es: "Predicciones mensuales" },
  "comp.western4": { en: "Generic advice", ko: "일반적인 조언", ja: "汎用的なアドバイス", es: "Consejos genéricos" },
  "comp.western5": { en: "No source attribution", ko: "출처 불명의 해석", ja: "出典不明の解釈", es: "Sin fuentes citadas" },
  "comp.saju": { en: "K-Astrology (Saju)", ko: "K-점성술 (사주)", ja: "K-占星術（四柱推命）", es: "K-Astrología (Saju)" },
  "comp.saju1": { en: "518,400 Types", ko: "518,400가지 유형", ja: "518,400タイプ", es: "518.400 tipos" },
  "comp.saju2": { en: "Based on full cosmic state", ko: "완전한 우주적 상태 기반", ja: "完全な宇宙状態に基づく", es: "Basado en el estado cósmico completo" },
  "comp.saju3": { en: "Daily precision readings", ko: "일별 정밀 분석", ja: "日別精密鑑定", es: "Lecturas diarias precisas" },
  "comp.saju4": { en: "Hyper-personalized guidance", ko: "초개인화 가이던스", ja: "超パーソナライズガイダンス", es: "Guía hiperpersonalizada" },
  "comp.saju5": { en: "Grounded in classical texts", ko: "고전 원전 근거 제시", ja: "古典原典の根拠を提示", es: "Fundamentado en textos clásicos" },

  // ─── CTA Banner ───
  "cta.title": { en: "Your cosmic code is waiting.", ko: "당신의 우주적 코드가 기다리고 있습니다.", ja: "あなたの宇宙コードが待っています。", es: "Tu código cósmico te espera." },
  "cta.desc": { en: "Grounded in 2,000 years of classical texts", ko: "2,000년 고전 원전에 근거한 당신만의 분석", ja: "2,000年の古典原典に基づくあなただけの分析", es: "Fundamentado en 2.000 años de textos clásicos" },
  "cta.btn": { en: "Get My Free Reading", ko: "무료 사주 보기", ja: "無料で鑑定する", es: "Obtener mi lectura gratis" },

  // ─── Pricing ───
  "pricing.title": { en: "Choose Your Path", ko: "나의 길을 선택하세요", ja: "あなたの道を選ぶ", es: "Elige tu camino" },
  "pricing.titleMain": { en: "Choose Your", ko: "나의 길을", ja: "あなたの道を", es: "Elige tu" },
  "pricing.titleGold": { en: "Path", ko: "선택하세요", ja: "選ぶ", es: "Camino" },
  "pricing.subtitle": {
    en: "Start free. Pay once when you're ready — no subscriptions, no recurring fees.",
    ko: "무료로 시작하세요. 준비되면 한 번만 결제 — 구독 없음, 반복 결제 없음.",
    ja: "無料で始めましょう。準備ができたら一回払い — サブスクなし。",
    es: "Empieza gratis. Paga una vez cuando estés listo — sin suscripciones, sin cargos recurrentes.",
  },
  "pricing.free": { en: "Free", ko: "무료", ja: "無料", es: "Gratis" },
  "pricing.oneTime": { en: "one-time", ko: "1회 결제", ja: "一回払い", es: "pago único" },

  // ─── Pricing Cards ───
  "pc.free.name": { en: "Free", ko: "무료", ja: "無料", es: "Gratis" },
  "pc.free.desc": { en: "Discover your cosmic blueprint", ko: "우주적 청사진을 발견하세요", ja: "宇宙の設計図を発見", es: "Descubre tu plano cósmico" },
  "pc.free.cta": { en: "Get Started — Free", ko: "무료로 시작하기", ja: "無料で始める", es: "Empezar — Gratis" },
  "pc.free.f1": { en: "Your Four Pillars (사주팔자) decoded", ko: "사주팔자 해석", ja: "四柱推命の解読", es: "Tus Cuatro Pilares (사주팔자) decodificados" },
  "pc.free.f2": { en: "Day Master & Archetype analysis", ko: "일주 & 원형 분석", ja: "日主 & アーキタイプ分析", es: "Análisis de Maestro del Día y arquetipo" },
  "pc.free.f3": { en: "Five Elements balance chart", ko: "오행 균형 차트", ja: "五行バランスチャート", es: "Gráfico de equilibrio de los Cinco Elementos" },
  "pc.free.f4": { en: "This year's fortune overview", ko: "올해의 운세 개요", ja: "今年の運勢概要", es: "Resumen de fortuna de este año" },
  "pc.free.f5": { en: "Compatibility check — full detailed analysis", ko: "궁합 — 상세 분석", ja: "相性チェック — 詳細分析", es: "Prueba de compatibilidad — análisis completo detallado" },
  "pc.free.f6": { en: "Personalized daily fortune", ko: "맞춤형 일일 운세", ja: "パーソナライズ毎日の運勢", es: "Fortuna diaria personalizada" },
  "pc.free.f7": { en: "Shareable profile & results", ko: "공유 가능한 프로필 & 결과", ja: "共有可能なプロフィール & 結果", es: "Perfil y resultados compartibles" },
  "pc.full.name": { en: "Full Destiny Reading", ko: "풀 운명 리딩", ja: "フル運命鑑定", es: "Lectura Completa del Destino" },
  "pc.full.desc": { en: "Your complete life blueprint", ko: "완전한 인생 설계도", ja: "あなたの完全な人生設計図", es: "Tu plano de vida completo" },
  "pc.full.badge": { en: "MOST POPULAR", ko: "가장 인기", ja: "一番人気", es: "MÁS POPULAR" },
  "pc.full.cta": { en: "Start Free → Upgrade to Full", ko: "무료로 시작 → 풀 업그레이드", ja: "無料で始める → フルにアップグレード", es: "Empezar gratis → Actualizar a Completa" },
  "pc.full.noSub": { en: "No subscription. Pay once, keep forever.", ko: "구독 없음. 한 번 결제, 영원히.", ja: "サブスクなし。一回払い、永遠に。", es: "Sin suscripción. Paga una vez, tuya para siempre." },
  "pc.full.f1": { en: "Everything in Free, plus:", ko: "무료 포함, 추가로:", ja: "無料版のすべてに加え：", es: "Todo en Gratis, más:" },
  "pc.full.f2": { en: "10-year fortune cycle (대운) analysis", ko: "10년 대운 분석", ja: "10年大運分析", es: "Análisis del ciclo de fortuna de 10 años (대운)" },
  "pc.full.f3": { en: "Wealth & Career detailed blueprint", ko: "재물 & 직업 상세 분석", ja: "財運 & キャリア詳細分析", es: "Plano detallado de riqueza y carrera" },
  "pc.full.f4": { en: "Love & Relationship deep insights", ko: "연애 & 관계 심층 분석", ja: "恋愛 & 人間関係の深い洞察", es: "Insights profundos de amor y relaciones" },
  "pc.full.f5": { en: "Health & wellness timing guidance", ko: "건강 & 웰빙 시기 가이드", ja: "健康 & タイミングガイド", es: "Guía de momentos de salud y bienestar" },
  "pc.full.f6": { en: "Monthly energy calendar", ko: "월별 에너지 캘린더", ja: "月別エネルギーカレンダー", es: "Calendario mensual de energía" },
  "pc.full.f7": { en: "Hidden talent & life purpose", ko: "숨겨진 재능 & 인생 목적", ja: "隠れた才能 & 人生の目的", es: "Talento oculto y propósito de vida" },
  "pc.full.f8": { en: "Permanent reading — yours forever", ko: "영구 보관 — 영원히 당신의 것", ja: "永久保存 — 永遠にあなたのもの", es: "Lectura permanente — tuya para siempre" },
  "pc.consult.name": { en: "Master Consultation", ko: "마스터 상담", ja: "マスター相談", es: "Consulta Maestra" },
  "pc.consult.desc": { en: "5 AI-powered Saju sessions", ko: "5회 AI 사주 세션", ja: "5回のAI四柱セッション", es: "5 sesiones AI de Saju" },
  "pc.consult.cta": { en: "Get 5 AI Sessions", ko: "AI 세션 5회 구매", ja: "AIセッション5回を購入", es: "Obtener 5 sesiones AI" },
  "pc.consult.perSession": { en: "$6 per session", ko: "1회당 $6", ja: "1回あたり$6", es: "$6 por sesión" },
  "pc.consult.f1": { en: "5 AI-generated sessions, powered by RimSaju Engine", ko: "5회 AI 생성 세션 — RimSaju 엔진 기반", ja: "5回のAI生成セッション — RimSajuエンジン搭載", es: "5 sesiones generadas por AI, con RimSaju Engine" },
  "pc.consult.f2": { en: "Just enter your birth details — no prior reading needed", ko: "생년월일만 입력 — 사전 리딩 불필요", ja: "生年月日を入力するだけ — 事前鑑定不要", es: "Solo ingresa tus datos de nacimiento — no necesitas lectura previa" },
  "pc.consult.f3": { en: "Ask about career, love, timing, or any life question", ko: "직업, 연애, 시기 등 모든 질문 가능", ja: "仕事、恋愛、タイミングなど何でも質問", es: "Pregunta sobre carrera, amor, momentos clave, o cualquier pregunta de vida" },
  "pc.consult.f4": { en: "Follow-up analysis rounds for deeper precision", ko: "심층 분석을 위한 후속 분석 라운드", ja: "より深い精度のための追加分析ラウンド", es: "Rondas de análisis de seguimiento para mayor precisión" },
  "pc.consult.f5": { en: "Comprehensive AI analysis report per session", ko: "세션당 종합 AI 분석 보고서", ja: "セッションごとの包括的AI分析レポート", es: "Reporte de análisis AI completo por sesión" },
  "pc.consult.f6": { en: "All sessions saved to your dashboard", ko: "모든 세션 대시보드에 저장", ja: "すべてのセッションをダッシュボードに保存", es: "Todas las sesiones guardadas en tu panel" },

  // ─── Pricing FAQ ───
  "faq.title": { en: "Frequently Asked Questions", ko: "자주 묻는 질문", ja: "よくある質問", es: "Preguntas frecuentes" },
  "faq.q1": { en: "Is there really no subscription?", ko: "정말 구독이 없나요?", ja: "本当にサブスクはないですか？", es: "¿Realmente no hay suscripción?" },
  "faq.a1": { en: "None at all. The Free tier is completely free — no credit card needed. The Full Destiny Reading is a one-time $9.99 payment, and your reading page is permanent. The Master Consultation is $29.99 for 5 AI-generated analysis rounds. Once you pay, you own it. No recurring charges, no auto-renewal, no hidden fees.", ko: "전혀 없습니다. 무료 티어는 완전 무료 — 신용카드 불필요. 풀 운명 리딩은 1회 $9.99, 리딩 페이지는 영구 보존. 마스터 상담은 5회 AI 분석 라운드 $29.99. 결제 후 영원히 소유. 반복 결제, 자동 갱신, 숨겨진 비용 없음.", ja: "一切ありません。無料プランは完全無料 — カード不要。フル鑑定は一回$9.99で永久保存。マスター相談は5回AI分析ラウンド$29.99。定期課金、自動更新、隠れた料金なし。", es: "Ninguno. El nivel Gratis es completamente gratis — sin tarjeta de crédito. La Lectura Completa del Destino es un pago único de $9.99, y tu página de lectura es permanente. La Consulta Maestra cuesta $29.99 por 5 rondas de análisis AI. Una vez que pagas, es tuyo. Sin cargos recurrentes, sin renovación automática, sin tarifas ocultas." },
  "faq.q2": { en: "What do I get for free vs. paid?", ko: "무료와 유료의 차이는?", ja: "無料と有料の違いは？", es: "¿Qué obtengo gratis vs. de pago?" },
  "faq.a2": { en: "Free includes: your Four Pillars decoded, Day Master archetype, Five Elements balance chart, this year's fortune overview, a personalized daily fortune, and full detailed compatibility analysis (love, work, friendship, conflict resolution, and yearly forecast). The $9.99 Full Destiny Reading adds: a deep 10-year fortune cycle, career and wealth blueprint, love and relationship patterns, health timing guidance, monthly energy calendar, and hidden talent analysis — all on a permanent page that's yours forever.", ko: "무료: 사주팔자 해석, 일주 원형, 오행 균형 차트, 올해 운세, 맞춤 일일 운세, 전체 궁합 분석. $9.99 풀 리딩 추가: 10년 대운, 직업/재물 분석, 연애/관계 패턴, 건강 시기 가이드, 월별 에너지 캘린더, 숨겨진 재능 — 영구 페이지.", ja: "無料：四柱解読、日主、五行バランス、今年の運勢、毎日の運勢、詳細相性分析。$9.99フル鑑定追加：10年大運、仕事・財運、恋愛パターン、健康タイミング、月別エネルギー、隠れた才能 — 永久ページ。", es: "Gratis incluye: tus Cuatro Pilares decodificados, arquetipo del Maestro del Día, gráfico de equilibrio de los Cinco Elementos, resumen de fortuna del año, fortuna diaria personalizada, y análisis detallado de compatibilidad (amor, trabajo, amistad, resolución de conflictos y pronóstico anual). La Lectura Completa del Destino de $9.99 agrega: ciclo profundo de fortuna de 10 años, plano de carrera y riqueza, patrones de amor y relaciones, guía de momentos de salud, calendario mensual de energía, y análisis de talento oculto — todo en una página permanente que es tuya para siempre." },
  "faq.q3": { en: "Is compatibility really completely free?", ko: "궁합은 정말 완전 무료인가요?", ja: "相性は本当に完全無料ですか？", es: "¿La compatibilidad es realmente gratis?" },
  "faq.a3": { en: "Yes! The full compatibility analysis — including detailed love, work, friendship, conflict resolution, and this year's forecast — is 100% free. No sign-up required, no credit card, no catch. Check as many pairs as you want. Sign in to save results to your dashboard.", ko: "네! 전체 궁합 분석 — 연애, 직장, 우정, 갈등 해결, 올해 예측 포함 — 100% 무료. 가입 불필요, 신용카드 불필요. 원하는 만큼 확인하세요. 로그인하면 대시보드에 저장.", ja: "はい！相性分析 — 恋愛、仕事、友情、対立解消、今年の予測 — 100%無料。登録不要。好きなだけチェック可能。ログインで保存。", es: "¡Sí! El análisis completo de compatibilidad — incluyendo amor, trabajo, amistad, resolución de conflictos y pronóstico de este año — es 100% gratis. Sin registro, sin tarjeta de crédito, sin trucos. Prueba todas las parejas que quieras. Inicia sesión para guardar resultados en tu panel." },
  "faq.q4": { en: "What languages are supported?", ko: "지원되는 언어는?", ja: "対応言語は？", es: "¿Qué idiomas están soportados?" },
  "faq.a4": { en: "SajuAstrology is available in English, Korean (한국어), and Japanese (日本語). The interface and AI-generated readings are fully localized in all three languages. You can switch languages anytime from the menu.", ko: "SajuAstrology는 영어, 한국어, 일본어를 지원합니다. 인터페이스와 AI 리딩 모두 3개 언어로 완전 현지화. 메뉴에서 언제든 변경 가능.", ja: "英語、韓国語、日本語に対応。インターフェースとAI鑑定は3言語で完全ローカライズ。メニューからいつでも切替可能。", es: "SajuAstrology está disponible en inglés, coreano (한국어), japonés (日本語), y español. La interfaz y las lecturas generadas por AI están totalmente localizadas. Puedes cambiar de idioma en cualquier momento desde el menú." },
  "faq.q5": { en: "Is there a mobile app?", ko: "모바일 앱이 있나요?", ja: "モバイルアプリはありますか？", es: "¿Hay una app móvil?" },
  "faq.a5": { en: "Yes! SajuAstrology is available on both iOS (App Store) and Android (Google Play). Enjoy a seamless mobile experience with all features available on the go.", ko: "네! iOS(앱스토어)와 Android(구글 플레이) 모두 지원합니다. 모든 기능을 모바일에서 편리하게 이용하세요.", ja: "はい！iOS・Android両方で利用可能です。すべての機能をモバイルで快適にご利用いただけます。", es: "¡Sí! SajuAstrology está disponible tanto en iOS (App Store) como en Android (Google Play). Disfruta una experiencia móvil fluida con todas las funciones disponibles en movimiento." },
  "faq.q6": { en: "Can I use my purchase on all devices?", ko: "구매한 콘텐츠를 모든 기기에서 이용할 수 있나요?", ja: "購入したコンテンツは全デバイスで利用できますか？", es: "¿Puedo usar mi compra en todos los dispositivos?" },
  "faq.a6": { en: "Yes! Your purchase is linked to your account and accessible on the web and the app where you used the same sign-in method. In the iOS app, use Apple sign-in; in the Android app, use Google sign-in. Prices are the same across all platforms — web or mobile app. Prices are the same across all platforms ($9.99 / $29.99).", ko: "네! 구매 내역은 계정(Google 또는 Apple)에 연결되어 웹과 앱 모든 기기에서 이용 가능합니다. 모든 플랫폼에서 동일 가격($9.99 / $29.99).", ja: "はい！購入はアカウント（GoogleまたはApple）に紐付けられ、ウェブ・アプリどのデバイスでも利用可能です。全プラットフォーム同一価格（$9.99 / $29.99）。", es: "¡Sí! Tu compra está vinculada a tu cuenta y accesible en la web y la app donde usaste el mismo método de inicio de sesión. En la app iOS, usa inicio de sesión con Apple; en la app Android, con Google. Los precios son iguales en todas las plataformas ($9.99 / $29.99)." },
  "faq.q7": { en: "Do I need to sign in to pay?", ko: "결제하려면 로그인해야 하나요?", ja: "支払いにはログインが必要ですか？", es: "¿Necesito iniciar sesión para pagar?" },
  "faq.a7": { en: "Yes. We require sign-in before any purchase so your paid content is permanently saved to your account and accessible from your dashboard on any device. Sign-in is free and takes one click.", ko: "네. 구매 전 로그인(Google 또는 Apple) 필요. 유료 콘텐츠가 계정에 영구 저장. 로그인은 무료이며 클릭 한 번.", ja: "はい。購入前にログイン（GoogleまたはApple）が必要。有料コンテンツがアカウントに永久保存。ログインは無料でワンクリック。", es: "Sí. Requerimos inicio de sesión antes de cualquier compra para que tu contenido pagado quede guardado permanentemente en tu cuenta y accesible desde tu panel en cualquier dispositivo. El inicio de sesión es gratis y toma un clic." },
  "faq.q8": { en: "How does the daily fortune work?", ko: "일일 운세는 어떻게 작동하나요?", ja: "毎日の運勢はどう機能しますか？", es: "¿Cómo funciona la fortuna diaria?" },
  "faq.a8": { en: "Once you generate a free reading and sign in, your dashboard shows a personalized daily fortune based on your Day Master element and that day's cosmic energy. It includes a fortune message, practical advice, lucky color, lucky direction, and a suggested activity — all changing every day. Completely free.", ko: "무료 리딩 생성 후 로그인하면 대시보드에 맞춤 일일 운세 표시. 운세 메시지, 행운의 색/방향/활동 — 매일 변경. 완전 무료.", ja: "無料鑑定生成後にログインすると毎日の運勢が表示。運勢メッセージ、ラッキーカラー・方角・活動 — 毎日更新。完全無料。", es: "Una vez que generes una lectura gratis e inicies sesión, tu panel muestra una fortuna diaria personalizada basada en tu elemento Maestro del Día y la energía cósmica del día. Incluye un mensaje de fortuna, consejo práctico, color de la suerte, dirección de la suerte, y una actividad sugerida — todo cambiando cada día. Completamente gratis." },
  "faq.q9": { en: "Can I generate readings for other people?", ko: "다른 사람의 사주도 볼 수 있나요?", ja: "他の人の鑑定もできますか？", es: "¿Puedo generar lecturas para otras personas?" },
  "faq.a9": { en: "Yes! Generate as many free readings as you want — for friends, family, partners, or anyone. Each reading gets its own shareable link.", ko: "네! 누구의 무료 사주든 원하는 만큼 생성하세요. 각 리딩에 고유한 공유 링크가 생성됩니다.", ja: "はい！好きなだけ無料鑑定を生成可能。各鑑定に固有の共有リンクが生成されます。", es: "¡Sí! Genera tantas lecturas gratis como quieras — para amigos, familia, parejas, o cualquier persona. Cada lectura recibe su propio enlace compartible." },
  "faq.q10": { en: "What is the Master Consultation?", ko: "마스터 상담이란?", ja: "マスター相談とは？", es: "¿Qué es la Consulta Maestra?" },
  "faq.a10": { en: "A focused AI analysis round from our RimSaju Engine. Enter your birth details directly (no prior reading needed), submit a life question — career, love, timing, wealth, health — and receive a comprehensive analysis grounded in your birth chart and 562 classical passages, with concrete timing guidance and actionable insights. 5 rounds for $29.99. If you already have a reading, your birth data is auto-filled.", ko: "RimSaju 엔진 기반 AI 집중 분석 라운드. 생년월일 직접 입력(사전 리딩 불필요), 질문 제출 후 사주 차트와 562개 고전 구절을 기반으로 한 종합 분석을 받습니다. 5회 $29.99. 기존 리딩이 있으면 자동 입력.", ja: "RimSajuエンジンによるAI集中分析ラウンド。生年月日を直接入力（事前鑑定不要）、質問を送ると四柱と562の古典パッセージに基づく包括的分析が届きます。5回$29.99。既存鑑定がある場合は自動入力。", es: "Una ronda de análisis AI enfocado de nuestro RimSaju Engine. Ingresa tus datos de nacimiento directamente (no necesitas lectura previa), envía una pregunta de vida — carrera, amor, momentos clave, riqueza, salud — y recibe un análisis completo basado en tu carta de nacimiento y 562 pasajes clásicos, con guía concreta de momentos y insights accionables. 5 rondas por $29.99. Si ya tienes una lectura, tus datos de nacimiento se autocompletan." },
  "faq.q11": { en: "How accurate is Saju analysis?", ko: "사주 분석은 얼마나 정확한가요?", ja: "四柱分析はどのくらい正確ですか？", es: "¿Qué tan precisa es el análisis de Saju?" },
  "faq.a11": { en: "Saju (四柱命理) maps 518,400 unique cosmic profiles based on the interactions of Five Elements, Heavenly Stems, and Earthly Branches — far more nuanced than Western astrology's 12 types. The same framework has guided decisions in East Asian cultures for over a thousand years.", ko: "사주는 오행, 천간, 지지의 상호작용으로 518,400가지 고유 프로필을 제공 — 서양 12가지보다 훨씬 정교합니다.", ja: "四柱推命は五行・天干・地支で518,400通りの固有プロフィールを提供 — 西洋占星術の12タイプよりはるかに精緻です。", es: "Saju (四柱命理) mapea 518.400 perfiles cósmicos únicos basados en las interacciones de los Cinco Elementos, Tallos Celestiales y Ramas Terrestres — mucho más matizado que los 12 tipos de la astrología occidental. El mismo marco ha guiado decisiones en culturas del este asiático por más de mil años." },
  "faq.q12": { en: "What payment methods do you accept?", ko: "어떤 결제 방법을 지원하나요?", ja: "対応決済方法は？", es: "¿Qué métodos de pago aceptan?" },
  "faq.a12": { en: "On the web: PayPal, Visa, Mastercard, Amex, and other major cards via PayPal Checkout. In the app: in-app purchase through Apple App Store (iOS) or Google Play (Android). All transactions are encrypted and your payment details are never stored on our servers.", ko: "웹: PayPal, Visa, Mastercard, Amex 등 주요 카드. 앱: App Store(iOS) 또는 Google Play(Android) 인앱결제. 모든 거래 암호화, 결제 정보 미저장.", ja: "ウェブ：PayPal、Visa、Mastercard、Amex等。アプリ：App Store（iOS）またはGoogle Play（Android）のアプリ内課金。すべて暗号化、決済情報はサーバーに保存しません。", es: "En la web: PayPal, Visa, Mastercard, Amex, y otras tarjetas principales vía PayPal Checkout. En la app: compra integrada a través de Apple App Store (iOS) o Google Play (Android). Todas las transacciones están encriptadas y los detalles de pago nunca se guardan en nuestros servidores." },
  "faq.q13": { en: "What is your refund policy?", ko: "환불 정책은?", ja: "返金ポリシーは？", es: "¿Cuál es su política de reembolsos?" },
  "faq.a13": { en: "Since readings are generated instantly and uniquely for your birth chart, we generally cannot offer refunds on completed readings. For technical issues, contact info@rimfactory.io within 7 days. For in-app purchases, refund requests must be submitted through Apple or Google. Unused consultation credits remain in your account indefinitely.", ko: "리딩은 즉시 생성되므로 환불 불가. 기술적 문제는 7일 이내 info@rimfactory.io로 연락. 앱 인앱결제 환불은 Apple 또는 Google을 통해 신청. 미사용 상담 크레딧은 무기한 유지.", ja: "鑑定は即時生成のため原則返金不可。技術的問題は7日以内にinfo@rimfactory.ioまで。アプリ内課金の返金はAppleまたはGoogleへ申請。未使用クレジットは無期限。", es: "Dado que las lecturas se generan instantáneamente y de forma única para tu carta de nacimiento, generalmente no podemos ofrecer reembolsos en lecturas completadas. Para problemas técnicos, contacta info@rimfactory.io dentro de 7 días. Para compras en la app, las solicitudes de reembolso deben enviarse a través de Apple o Google. Los créditos de consulta no usados permanecen en tu cuenta indefinidamente." },
  "faq.q14": { en: "Is my birth data private?", ko: "출생 정보는 안전한가요?", ja: "データは安全ですか？", es: "¿Mis datos de nacimiento son privados?" },
  "faq.a14": { en: "Yes. Your data is stored securely and never shared with third parties. We use industry-standard encryption and security. Delete your account from your dashboard, or contact us anytime.", ko: "네. 안전하게 저장, 제3자 미공유. 업계 표준 암호화. 언제든 삭제 요청 가능.", ja: "はい。安全に保存、第三者と共有しません。いつでも削除リクエスト可能。", es: "Sí. Tus datos se almacenan de forma segura y nunca se comparten con terceros. Usamos encriptación y seguridad estándar de la industria. Elimina tu cuenta desde tu panel, o contáctanos en cualquier momento." },

  // ─── Consultation ───
  "consult.badge": { en: "Master Consultation", ko: "마스터 상담", ja: "マスター相談", es: "Consulta Maestra" },
  "consult.title1": { en: "Your Personal", ko: "나만의", ja: "あなただけの", es: "Tu sesión" },
  "consult.title2": { en: "AI Saju Session", ko: "AI 사주 세션", ja: "AI四柱セッション", es: "AI personal de Saju" },
  "consult.desc": { en: "Ask any life question and receive a detailed AI analysis from our RimSaju Engine, grounded in your unique birth chart and 562 classical passages.", ko: "삶의 어떤 질문이든 하세요. RimSaju 엔진의 AI 분석이 당신의 사주와 562개 고전 구절을 기반으로 상세한 답변을 제공합니다.", ja: "人生のあらゆる質問をどうぞ。RimSajuエンジンのAI分析が、あなたの四柱と562の古典パッセージに基づいて詳細な答えをお届けします。", es: "Haz cualquier pregunta de vida y recibe un análisis AI detallado de nuestro RimSaju Engine, basado en tu carta de nacimiento única y 562 pasajes clásicos." },
  "consult.remaining": { en: "remaining", ko: "남음", ja: "残り", es: "restantes" },
  "consult.consultation": { en: "consultation", ko: "상담", ja: "相談", es: "consulta" },
  "consult.consultations": { en: "consultations", ko: "상담", ja: "相談", es: "consultas" },
  "consult.birthInfo": { en: "Your Birth Information", ko: "출생 정보", ja: "生年月日情報", es: "Tu información de nacimiento" },
  "consult.edit": { en: "Edit", ko: "수정", ja: "編集", es: "Editar" },
  "consult.category": { en: "What area of life is your question about?", ko: "어떤 분야에 대한 질문인가요?", ja: "どの分野についての質問ですか？", es: "¿Sobre qué área de la vida es tu pregunta?" },
  "consult.questionLabelDetail": { en: "Describe your question in detail (100+ characters recommended)", ko: "질문을 자세히 입력하세요 (100자 이상 권장)", ja: "質問を詳しく入力してください（100文字以上推奨）", es: "Describe tu pregunta en detalle (100+ caracteres recomendado)" },
  "consult.questionLabel": { en: "Describe your question or situation", ko: "질문이나 상황을 설명해주세요", ja: "質問や状況を説明してください", es: "Describe tu pregunta o situación" },
  "consult.questionPlaceholder": { en: "Be as specific as possible — the more context you provide, the more precise your reading will be...", ko: "가능한 구체적으로 작성하세요 — 더 많은 맥락을 제공할수록 더 정확한 분석을 받을 수 있습니다...", ja: "できるだけ具体的に — 詳しい情報を提供するほど、より正確な分析が得られます...", es: "Sé lo más específico posible — cuanto más contexto, más precisa será tu lectura..." },
  "consult.exampleQuestions": { en: "Example questions:", ko: "질문 예시:", ja: "質問の例：", es: "Preguntas de ejemplo:" },
  "consult.submit": { en: "Submit Consultation", ko: "상담 제출", ja: "相談を送信", es: "Enviar consulta" },
  "consult.analyzing": { en: "Analyzing your question...", ko: "질문 분석 중...", ja: "質問を分析中...", es: "Analizando tu pregunta..." },
  "consult.signIn": { en: "Sign In to Get Started", ko: "로그인하여 시작하기", ja: "ログインして始める", es: "Inicia sesión para comenzar" },
  "consult.unlock": { en: "Unlock Master Consultations", ko: "마스터 상담 열기", ja: "マスター相談を解除", es: "Desbloquear Consultas Maestras" },
  "consult.get5": { en: "Get 5 Consultations", ko: "상담 5회 구매", ja: "相談5回を購入", es: "Obtener 5 consultas" },
  "consult.personalTitle": { en: "AI Saju Consultations", ko: "AI 사주 상담", ja: "AI四柱相談", es: "Consultas AI de Saju" },
  "consult.personalDesc": { en: "Get in-depth AI answers to your life questions — career, love, timing, and more — computed from your unique birth chart by the RimSaju Engine.", ko: "삶의 질문에 대한 AI 심층 답변 — 직업, 연애, 시기 등 — RimSaju 엔진이 당신의 사주를 기반으로 계산.", ja: "人生の質問への深いAIの答え — 仕事、恋愛、タイミングなど — RimSajuエンジンがあなたの四柱から計算します。", es: "Obtén respuestas AI profundas a tus preguntas de vida — carrera, amor, momentos clave y más — computadas desde tu carta única por el RimSaju Engine." },
  "consult.priceTag": { en: "5 AI analysis rounds for $29.99 · No subscription", ko: "5회 AI 분석 $29.99 · 구독 없음", ja: "5回AI分析 $29.99 · サブスクなし", es: "5 rondas de análisis AI por $29.99 · Sin suscripción" },
  "consult.unlockDesc": { en: "Get 5 in-depth AI Saju analysis rounds for any life question — career, love, timing, and more. Each round produces a comprehensive analysis computed from your birth chart by the RimSaju Engine.", ko: "모든 질문에 대한 5회 심층 AI 사주 분석 라운드. RimSaju 엔진이 라운드당 종합 분석을 사주 기반으로 생성합니다.", ja: "あらゆる質問に5回の深いAI四柱分析ラウンド。RimSajuエンジンがラウンドごとに包括的分析をあなたの四柱から生成します。", es: "Obtén 5 rondas de análisis AI profundo de Saju para cualquier pregunta de vida — carrera, amor, momentos clave y más. Cada ronda produce un análisis completo computado desde tu carta por el RimSaju Engine." },
  "consult.perSession": { en: "$6 per analysis round · No subscription", ko: "1회 $6 · 구독 없음", ja: "1回$6 · サブスクなし", es: "$6 por ronda de análisis · Sin suscripción" },
  "consult.feat1": { en: "5 AI-generated sessions, powered by RimSaju Engine", ko: "5회 AI 생성 세션 — RimSaju 엔진 기반", ja: "5回のAI生成セッション — RimSajuエンジン搭載", es: "5 sesiones generadas por AI, con RimSaju Engine" },
  "consult.feat2": { en: "Ask about any area of life", ko: "모든 분야 질문 가능", ja: "あらゆる分野について質問可能", es: "Pregunta sobre cualquier área de la vida" },
  "consult.feat3": { en: "Just enter your birth details — no prior reading needed", ko: "생년월일만 입력 — 사전 리딩 불필요", ja: "生年月日を入力するだけ — 事前鑑定不要", es: "Solo ingresa tus datos de nacimiento — no necesitas lectura previa" },
  "consult.feat4": { en: "All reports saved to your dashboard", ko: "모든 보고서 대시보드에 저장", ja: "すべてのレポートをダッシュボードに保存", es: "Todos los reportes guardados en tu panel" },
  "consult.moreDetails": { en: "A few more details", ko: "몇 가지 추가 정보", ja: "もう少し詳しく", es: "Algunos detalles más" },
  "consult.moreContext": { en: "To give you the most precise reading, I need a bit more context.", ko: "가장 정확한 분석을 위해 추가 정보가 필요합니다.", ja: "より正確な分析のため、もう少し情報が必要です。", es: "Para darte la lectura más precisa, necesito un poco más de contexto." },
  "consult.yourAnswer": { en: "Your answer...", ko: "답변을 입력하세요...", ja: "回答を入力...", es: "Tu respuesta..." },
  "consult.generateReading": { en: "Generate My Reading", ko: "분석 생성하기", ja: "鑑定を生成", es: "Generar mi lectura" },
  "consult.complete": { en: "Consultation Complete", ko: "상담 완료", ja: "相談完了", es: "Consulta completa" },
  "consult.newConsult": { en: "New Consultation", ko: "새 상담", ja: "新規相談", es: "Nueva consulta" },
  "consult.viewAll": { en: "View All Consultations", ko: "모든 상담 보기", ja: "すべての相談を見る", es: "Ver todas las consultas" },
  "consult.consultingPillars": { en: "Consulting the Four Pillars", ko: "사주 분석 중", ja: "四柱を鑑定中", es: "Consultando los Cuatro Pilares" },
  "consult.elapsed": { en: "elapsed · Deep analysis in progress", ko: "경과 · 심층 분석 진행 중", ja: "経過 · 深い分析を実行中", es: "transcurrido · Análisis profundo en progreso" },
  "consult.doNotLeave": { en: "Please stay on this page. Leaving may interrupt your reading and your session credit cannot be restored.", ko: "이 페이지에 머물러주세요. 떠나면 분석이 중단되고 크레딧이 복원되지 않습니다.", ja: "このページにとどまってください。離脱すると鑑定が中断され、クレジットは復元できません。", es: "Por favor permanece en esta página. Salir puede interrumpir tu lectura y el crédito de sesión no se podrá restaurar." },
  "consult.craftedUniquely": { en: "Your analysis is being computed in real time — this takes 30–60 seconds", ko: "분석이 실시간으로 생성 중입니다 — 30~60초 소요", ja: "分析をリアルタイムで生成中 — 30〜60秒", es: "Tu análisis se está computando en tiempo real — esto tarda 30-60 segundos" },
  "consult.entertainment": { en: "This consultation is for entertainment and self-reflection only. See our Terms.", ko: "이 상담은 오락 및 자기 성찰 목적입니다. 이용약관 참고.", ja: "エンターテインメントおよび自己理解の目的です。利用規約参照。", es: "Esta consulta es solo para entretenimiento y autoreflexión. Ver nuestros Términos." },
  "consult.creditSafe": { en: "Generation failed. Your credit is safe.", ko: "생성 실패. 크레딧은 사용되지 않았습니다.", ja: "生成に失敗しました。クレジットは使用されていません。", es: "Generación fallida. Tu crédito está a salvo." },
  "consult.aiBusyCredit": { en: "The AI is busy right now. Please try again. Your credit was not used.", ko: "AI가 잠시 바빠요. 잠깐 후 다시 시도해주세요. 크레딧은 사용되지 않았습니다.", ja: "AIが混雑しています。クレジットは使用されていません。", es: "La AI está ocupada ahora. Por favor intenta de nuevo. Tu crédito no se usó." },
  "consult.generationFailedCredit": { en: "Generation failed. Your credit is safe — please try again.", ko: "생성 실패. 크레딧은 안전합니다. 다시 시도해주세요.", ja: "生成に失敗しました。クレジットは安全です。", es: "Generación fallida. Tu crédito está a salvo — por favor intenta de nuevo." },
  "consult.networkErrorCredit": { en: "Network error. Please try again — your credit was not used.", ko: "네트워크 오류. 크레딧은 사용되지 않았습니다. 다시 시도해주세요.", ja: "ネットワークエラー。クレジットは使用されていません。再試行してください。", es: "Error de red. Por favor intenta de nuevo — tu crédito no se usó." },
  "consult.paymentSetupFailed": { en: "Payment setup failed", ko: "결제 설정 실패", ja: "決済設定に失敗しました", es: "Configuración de pago fallida" },
  "consult.unexpectedResponse": { en: "Unexpected response. Please try again.", ko: "예상치 못한 응답입니다. 다시 시도해주세요.", ja: "予期しない応答です。再試行してください。", es: "Respuesta inesperada. Por favor intenta de nuevo." },
  "consult.writeMore": { en: "Write 100+ chars for a more accurate reading", ko: "100자 이상 자세히 입력할수록 정확한 답을 얻습니다", ja: "100文字以上詳しく書くほど精度が上がります", es: "Escribe 100+ caracteres para una lectura más precisa" },
  "consult.koPaymentNotice": { en: "", ko: "해외 결제 수단 전용 · 국내 카드 미지원", ja: "", es: "" },

  // ─── Consultation History ───
  "ch.title": { en: "My Consultations", ko: "내 상담", ja: "相談履歴", es: "Mis consultas" },
  "ch.newConsult": { en: "New Consultation", ko: "새 상담", ja: "新規相談", es: "Nueva consulta" },
  "ch.remaining": { en: "consultations remaining", ko: "상담 남음", ja: "相談残り", es: "consultas restantes" },
  "ch.remaining1": { en: "consultation remaining", ko: "상담 남음", ja: "相談残り", es: "consulta restante" },
  "ch.noRemaining": { en: "No consultations remaining", ko: "남은 상담 없음", ja: "残りの相談なし", es: "Sin consultas restantes" },
  "ch.completed": { en: "completed", ko: "완료", ja: "完了", es: "completada" },
  "ch.getGuidance": { en: "Get personalized Saju guidance", ko: "맞춤 사주 상담 받기", ja: "パーソナル四柱相談を受ける", es: "Obtén orientación Saju personalizada" },
  "ch.ask": { en: "Ask", ko: "질문", ja: "質問", es: "Preguntar" },
  "ch.getMore": { en: "Get More", ko: "추가 구매", ja: "追加購入", es: "Obtener más" },
  "ch.readFull": { en: "Read Full Report", ko: "전체 보고서 보기", ja: "レポート全文を読む", es: "Leer reporte completo" },
  "ch.notAvailable": { en: "Report not available.", ko: "보고서를 사용할 수 없습니다.", ja: "レポートは利用できません。", es: "Reporte no disponible." },
  "ch.showAll": { en: "Show all", ko: "모두 보기", ja: "すべて表示", es: "Ver todas" },
  "ch.historyTitle": { en: "Consultation History", ko: "상담 내역", ja: "相談履歴", es: "Historial de consultas" },
  "ch.startNew": { en: "+ Start New Consultation", ko: "+ 새 상담 시작하기", ja: "+ 新しい相談を始める", es: "+ Iniciar nueva consulta" },

  // ─── Restore Purchases (native app only) ───
  "restore.buttonLabel": { en: "Restore Purchases", ko: "구매 복원", ja: "購入を復元", es: "Restaurar compras" },
  "restore.helperText": { en: "Re-check your App Store account for past purchases.", ko: "이전에 결제한 내역을 다시 불러옵니다.", ja: "以前の購入履歴を再読み込みします。", es: "Revisa tu cuenta de App Store por compras anteriores." },
  "restore.checking": { en: "Checking...", ko: "확인 중...", ja: "確認中...", es: "Verificando..." },
  "restore.noPurchases": { en: "No purchases to restore", ko: "복원할 구매가 없습니다", ja: "復元する購入はありません", es: "No hay compras para restaurar" },
  "restore.restoredOne": { en: "1 purchase restored", ko: "1개의 구매가 복원되었습니다", ja: "1件の購入を復元しました", es: "1 compra restaurada" },
  "restore.restoredMany": { en: "{count} purchases restored", ko: "{count}개의 구매가 복원되었습니다", ja: "{count}件の購入を復元しました", es: "{count} compras restauradas" },
  "restore.restoreFailed": { en: "Restore failed: {payload}", ko: "복원 실패: {payload}", ja: "復元失敗: {payload}", es: "Restauración fallida: {payload}" },
  "restore.noAppConnection": { en: "Could not reach the native app", ko: "앱 연결을 확인할 수 없습니다", ja: "アプリ接続を確認できません", es: "No se puede conectar con la app nativa" },

  // ─── Categories ───
  "cat.career": { en: "Career & Work", ko: "직업 & 일", ja: "仕事 & キャリア", es: "Carrera y trabajo" },
  "cat.love": { en: "Love & Relationships", ko: "연애 & 관계", ja: "恋愛 & 人間関係", es: "Amor y relaciones" },
  "cat.timing": { en: "Timing & Decisions", ko: "시기 & 결정", ja: "タイミング & 決断", es: "Momentos y decisiones" },
  "cat.wealth": { en: "Wealth & Finance", ko: "재물 & 재정", ja: "財運 & 金融", es: "Riqueza y finanzas" },
  "cat.health": { en: "Health & Wellness", ko: "건강 & 웰빙", ja: "健康 & ウェルネス", es: "Salud y bienestar" },
  "cat.general": { en: "General Life", ko: "종합 운세", ja: "総合運", es: "Vida general" },

  // ─── Form Fields ───
  "form.name": { en: "Full Name", ko: "이름", ja: "氏名", es: "Nombre completo" },
  "form.namePlaceholder": { en: "Enter your name", ko: "이름을 입력하세요", ja: "名前を入力", es: "Ingresa tu nombre" },
  "form.gender": { en: "Gender", ko: "성별", ja: "性別", es: "Género" },
  "form.male": { en: "♂ Male", ko: "♂ 남성", ja: "♂ 男性", es: "♂ Masculino" },
  "form.female": { en: "♀ Female", ko: "♀ 여성", ja: "♀ 女性", es: "♀ Femenino" },
  "form.maleShort": { en: "Male", ko: "남성", ja: "男性", es: "Masculino" },
  "form.femaleShort": { en: "Female", ko: "여성", ja: "女性", es: "Femenino" },
  "form.birthDate": { en: "Birth Date", ko: "생년월일", ja: "生年月日", es: "Fecha de nacimiento" },
  "form.birthDateNote": { en: "(Solar / Gregorian calendar)", ko: "(양력 기준)", ja: "(西暦)", es: "(Calendario solar / gregoriano)" },
  "form.birthHour": { en: "Birth Hour", ko: "태어난 시간", ja: "出生時刻", es: "Hora de nacimiento" },
  "form.birthTime": { en: "Birth Time", ko: "태어난 시각", ja: "出生時刻", es: "Hora de nacimiento" },
  "form.birthHourNote": { en: "(approximate is fine)", ko: "(대략적이어도 괜찮습니다)", ja: "(おおよそで大丈夫です)", es: "(hora aproximada está bien)" },
  "form.birthCity": { en: "Birth City", ko: "출생 도시", ja: "出生都市", es: "Ciudad de nacimiento" },
  "form.cityPlaceholder": { en: "Search city (e.g., Seoul, Tokyo, New York)", ko: "도시 검색 (예: 서울, 도쿄, 뉴욕)", ja: "都市検索（例：東京、ソウル）", es: "Buscar ciudad (ej. Seúl, Tokio, Nueva York)" },
  "form.cityOfBirth": { en: "City of birth...", ko: "출생 도시...", ja: "出生都市...", es: "Ciudad de nacimiento..." },
  "form.unknownTime": { en: "I don't know my birth time (defaults to noon, reduced accuracy)", ko: "태어난 시간을 모릅니다 (정오 기본, 정확도 감소)", ja: "出生時刻がわかりません（正午がデフォルト、精度低下）", es: "No sé mi hora de nacimiento (se usa mediodía, precisión reducida)" },
  "form.coordinatesLocked": { en: "coordinates locked", ko: "좌표 설정됨", ja: "座標設定済み", es: "coordenadas bloqueadas" },
  "form.yourName": { en: "Your Name", ko: "이름", ja: "お名前", es: "Tu nombre" },
  "form.enterName": { en: "Enter your name...", ko: "이름을 입력하세요...", ja: "名前を入力...", es: "Ingresa tu nombre..." },
  "form.year": { en: "Year", ko: "년", ja: "年", es: "Año" },
  "form.month": { en: "Month", ko: "월", ja: "月", es: "Mes" },
  "form.day": { en: "Day", ko: "일", ja: "日", es: "Día" },
  "form.hour": { en: "Hour", ko: "시", ja: "時", es: "Hora" },
  "form.min": { en: "Min", ko: "분", ja: "分", es: "Min" },

  // ─── Calculate Page ───
  "calc.discoverDestiny": { en: "Discover Your Destiny", ko: "당신의 운명을 발견하세요", ja: "あなたの運命を発見", es: "Descubre tu destino" },
  "calc.enterDetails": { en: "Enter Your Birth Details", ko: "출생 정보를 입력하세요", ja: "生年月日を入力してください", es: "Ingresa tus datos de nacimiento" },
  "calc.seeMyReading": { en: "See My Reading", ko: "내 사주 보기", ja: "鑑定を見る", es: "Ver mi lectura" },
  "calc.craftedUniquely": { en: "Your reading is crafted uniquely — this takes a moment", ko: "맞춤 리딩 생성 중 — 잠시만 기다려주세요", ja: "あなただけの鑑定を作成中 — 少々お待ちください", es: "Tu lectura se está creando únicamente — esto tarda un momento" },
  "calc.somethingWrong": { en: "Something went wrong", ko: "오류가 발생했습니다", ja: "エラーが発生しました", es: "Algo salió mal" },
  "calc.couldntGenerate": { en: "We couldn't generate your reading. Please try again.", ko: "리딩 생성 실패. 다시 시도해주세요.", ja: "鑑定を生成できませんでした。もう一度お試しください。", es: "No pudimos generar tu lectura. Por favor intenta de nuevo." },
  "calc.westernGivesYou": { en: "Western astrology gives you ", ko: "서양 별자리는 ", ja: "西洋占星術は", es: "La astrología occidental te da " },
  "calc.oneOfTwelve": { en: "1 of 12", ko: "12가지 중 1가지", ja: "12タイプの1つ", es: "1 de 12" },
  "calc.types": { en: " types.", ko: " 유형.", ja: "。", es: " tipos." },
  "calc.sajuMaps": { en: "Saju maps ", ko: "사주는 ", ja: "四柱推命は", es: "Saju mapea " },
  "calc.uniqueProfiles": { en: " unique cosmic profiles from the exact moment and place you were born.", ko: "가지 고유한 우주적 프로필을 제공합니다.", ja: "通りの固有プロフィールを提供。", es: " perfiles cósmicos únicos desde el momento y lugar exacto de tu nacimiento." },
  "calc.readyIn": { en: "Your reading will be ready in ", ko: "리딩이 ", ja: "鑑定は", es: "Tu lectura estará lista en " },
  "calc.seconds30": { en: "30 seconds", ko: "30초 후", ja: "30秒で", es: "30 segundos" },
  "calc.readyInSuffix": { en: ".", ko: "에 준비됩니다.", ja: "準備完了。", es: "." },

  // ─── Compatibility ───

  // ─── Reading Steps (Calculate Loading) ───
  "readingStep.1.label": { en: "Decoding your Four Pillars", ko: "사주팔자 해석 중", ja: "四柱を解読中", es: "Decodificando tus Cuatro Pilares" },
  "readingStep.1.sub": { en: "Year · Month · Day · Hour", ko: "년 · 월 · 일 · 시", ja: "年 · 月 · 日 · 時", es: "Año · Mes · Día · Hora" },
  "readingStep.2.label": { en: "Mapping the Five Elements", ko: "오행 분석 중", ja: "五行を分析中", es: "Mapeando los Cinco Elementos" },
  "readingStep.2.sub": { en: "Wood · Fire · Earth · Metal · Water", ko: "목 · 화 · 토 · 금 · 수", ja: "木 · 火 · 土 · 金 · 水", es: "Madera · Fuego · Tierra · Metal · Agua" },
  "readingStep.3.label": { en: "Identifying your Day Master", ko: "일주 확인 중", ja: "日主を特定中", es: "Identificando tu Maestro del Día" },
  "readingStep.3.sub": { en: "The core of who you are", ko: "당신의 핵심", ja: "あなたの核心", es: "El núcleo de quién eres" },
  "readingStep.4.label": { en: "Calculating elemental harmony", ko: "오행 조화 계산 중", ja: "五行の調和を計算中", es: "Calculando la armonía elemental" },
  "readingStep.4.sub": { en: "Strengths, tensions, and balance", ko: "강점, 긴장, 균형", ja: "強み、緊張、バランス", es: "Fortalezas, tensiones y equilibrio" },
  "readingStep.5.label": { en: "Consulting the Ten Gods", ko: "십신 분석 중", ja: "十神を分析中", es: "Consultando los Diez Dioses" },
  "readingStep.5.sub": { en: "Your archetype is emerging…", ko: "당신의 원형이 드러나는 중…", ja: "アーキタイプが現れています…", es: "Tu arquetipo está emergiendo…" },
  "readingStep.6.label": { en: "Weaving your personal narrative", ko: "맞춤 리딩 작성 중", ja: "パーソナルストーリーを紡いでいます", es: "Tejiendo tu narrativa personal" },
  "readingStep.6.sub": { en: "Almost there…", ko: "거의 완성…", ja: "もう少し…", es: "Casi listo…" },
  "compat.badge": { en: "Compatibility Check", ko: "궁합 체크", ja: "相性チェック", es: "Prueba de compatibilidad" },
  "compat.title1": { en: "Cosmic", ko: "운명적", ja: "宇宙の", es: "Compatibilidad" },
  "compat.title2": { en: "Compatibility", ko: "궁합", ja: "相性", es: "Cósmica" },
  "compat.desc": { en: "Discover how your Four Pillars align with another person's destiny.", ko: "당신의 사주가 상대방의 운명과 어떻게 조화되는지 알아보세요.", ja: "あなたの四柱が相手の運命とどう調和するか確認しましょう。", es: "Descubre cómo tus Cuatro Pilares se alinean con el destino de otra persona." },
  "compat.generatedAt": { en: "Generated", ko: "생성일시", ja: "作成日時", es: "Generado" },
  "compat.you": { en: "You", ko: "나", ja: "あなた", es: "Tú" },
  "compat.partner": { en: "Partner", ko: "상대방", ja: "相手", es: "Pareja" },
  "compat.next": { en: "Next: Partner's Info", ko: "다음: 상대방 정보", ja: "次：相手の情報", es: "Siguiente: Info de la pareja" },
  "compat.check": { en: "Check Compatibility", ko: "궁합 확인", ja: "相性を確認", es: "Probar compatibilidad" },
  "compat.samePerson": { en: "Looks like you entered the same person twice. Try entering a different partner!", ko: "같은 사람을 두 번 입력한 것 같습니다. 다른 상대방을 입력해주세요!", ja: "同じ人を2回入力したようです。別の相手を入力してください！", es: "Parece que ingresaste a la misma persona dos veces. ¡Intenta con una pareja diferente!" },
  "compat.stayOnPage": { en: "Please stay on this page — leaving may interrupt the reading.", ko: "이 페이지에 머물러주세요 — 떠나면 분석이 중단될 수 있습니다.", ja: "このページにとどまってください — 離脱すると中断される場合があります。", es: "Por favor permanece en esta página — salir puede interrumpir la lectura." },
  "compat.readingStars": { en: "Reading the Stars", ko: "별을 읽는 중", ja: "星を読んでいます", es: "Leyendo las estrellas" },
  "compat.craftingPair": { en: "Crafting a reading unique to this pair — about 15 seconds", ko: "이 쌍에 맞는 분석 작성 중 — 약 15초", ja: "このペアの鑑定を作成中 — 約15秒", es: "Creando una lectura única para esta pareja — unos 15 segundos" },

  // ─── Compatibility Result ───
  "cr.notFound": { en: "Result Not Found", ko: "결과를 찾을 수 없습니다", ja: "結果が見つかりません", es: "Resultado no encontrado" },
  "cr.removed": { en: "This compatibility reading may have been removed.", ko: "이 궁합 분석이 삭제되었을 수 있습니다.", ja: "この相性鑑定は削除された可能性があります。", es: "Esta lectura de compatibilidad puede haber sido eliminada." },
  "cr.shareResult": { en: "Share Result", ko: "결과 공유", ja: "結果を共有", es: "Compartir resultado" },
  "cr.copied": { en: "Copied!", ko: "복사됨!", ja: "コピー完了！", es: "¡Copiado!" },
  "cr.love": { en: "Love", ko: "연애", ja: "恋愛", es: "Amor" },
  "cr.work": { en: "Work", ko: "직장", ja: "仕事", es: "Trabajo" },
  "cr.friendship": { en: "Friendship", ko: "우정", ja: "友情", es: "Amistad" },
  "cr.conflict": { en: "Conflict", ko: "갈등", ja: "対立", es: "Conflicto" },
  "cr.yourConnection": { en: "Your Cosmic Connection", ko: "우주적 연결", ja: "宇宙のつながり", es: "Tu conexión cósmica" },
  "cr.loveCompat": { en: "Love Compatibility", ko: "연애 궁합", ja: "恋愛相性", es: "Compatibilidad en el amor" },
  "cr.workCompat": { en: "Work Compatibility", ko: "직장 궁합", ja: "仕事相性", es: "Compatibilidad en el trabajo" },
  "cr.friendCompat": { en: "Friendship Compatibility", ko: "우정 궁합", ja: "友情相性", es: "Compatibilidad en la amistad" },
  "cr.conflictCompat": { en: "Conflict Resolution", ko: "갈등 해결", ja: "対立解消", es: "Resolución de conflictos" },
  "cr.together": { en: "Together", ko: "함께", ja: "一緒に", es: "Juntos" },
  "cr.discoverDestiny": { en: "Discover Your Personal Destiny", ko: "나만의 운명을 발견하세요", ja: "あなたの運命を発見", es: "Descubre tu destino personal" },
  "cr.shapedByCore": { en: "Your compatibility is shaped by who you are at your core. Unlock your complete Four Pillars reading.", ko: "궁합은 당신의 본질에 달려 있습니다. 완전한 사주 리딩을 열어보세요.", ja: "相性はあなたの本質で決まります。完全な四柱鑑定を解放しましょう。", es: "Tu compatibilidad está moldeada por quién eres en tu esencia. Desbloquea tu lectura completa de los Cuatro Pilares." },
  "cr.getFullReading": { en: "Get My Full Reading — $9.99", ko: "풀 리딩 받기 — $9.99", ja: "フル鑑定 — $9.99", es: "Obtener mi lectura completa — $9.99" },
  "cr.startFree": { en: "Start free, upgrade when ready", ko: "무료로 시작, 준비되면 업그레이드", ja: "無料で始めて、準備ができたら", es: "Empieza gratis, actualiza cuando estés listo" },
  "cr.checkAnother": { en: "Check Another Pair", ko: "다른 궁합 확인", ja: "別のペアをチェック", es: "Probar otra pareja" },
  "cr.getMyFreeReading": { en: "Get My Free Reading", ko: "무료 사주 보기", ja: "無料で鑑定する", es: "Obtener mi lectura gratis" },
  "cr.signInToSave": { en: "Sign in to save this result to your dashboard", ko: "로그인하여 결과를 대시보드에 저장", ja: "ログインして結果をダッシュボードに保存", es: "Inicia sesión para guardar este resultado en tu panel" },
  "cr.signInGoogle": { en: "Sign In with Google", ko: "Google로 로그인", ja: "Googleでログイン", es: "Iniciar sesión con Google" },
  "cr.entertainment": { en: "This compatibility reading is for entertainment and self-reflection only. See our Terms.", ko: "이 궁합 분석은 오락 및 자기 성찰 목적입니다. 이용약관 참고.", ja: "エンターテインメントおよび自己理解の目的です。利用規約参照。", es: "Esta lectura de compatibilidad es solo para entretenimiento y autoreflexión. Ver nuestros Términos." },

  // ─── Sign In Modal ───
  "signIn.welcome": { en: "Welcome, Seeker", ko: "환영합니다", ja: "ようこそ", es: "Bienvenido, buscador" },
  "signIn.saveReading": { en: "Sign in to save your reading and unlock daily insights", ko: "로그인하여 사주를 저장하고 일일 인사이트를 받으세요", ja: "ログインして鑑定を保存し、毎日のインサイトを受け取る", es: "Inicia sesión para guardar tu lectura y desbloquear insights diarios" },
  "signIn.continueGoogle": { en: "Continue with Google", ko: "Google로 계속하기", ja: "Googleで続ける", es: "Continuar con Google" },
  "signIn.continueApple": { en: "Continue with Apple", ko: "Apple로 계속하기", ja: "Appleで続ける", es: "Continuar con Apple" },
  "signIn.agreeTo": { en: "By continuing, you agree to our", ko: "계속 진행하면", ja: "続行すると、", es: "Al continuar, aceptas nuestros" },
  "signIn.and": { en: "and", ko: "과", ja: "と", es: "y" },
  "signIn.agreeSuffix": { en: "", ko: "에 동의하는 것입니다", ja: "に同意したことになります", es: "" },

  // ─── User Menu ───
  "um.premium": { en: "Premium", ko: "프리미엄", ja: "プレミアム", es: "Premium" },
  "um.freePlan": { en: "Free Plan", ko: "무료 플랜", ja: "無料プラン", es: "Plan gratis" },
  "um.dashboard": { en: "My Dashboard", ko: "내 대시보드", ja: "マイページ", es: "Mi panel" },
  "um.myChart": { en: "My Saju Chart", ko: "내 사주", ja: "マイ四柱", es: "Mi carta Saju" },
  "um.compatibility": { en: "Compatibility", ko: "궁합", ja: "相性", es: "Compatibilidad" },
  "um.consultation": { en: "Consultation", ko: "상담", ja: "相談", es: "Consulta" },
  "um.signingOut": { en: "Signing out...", ko: "로그아웃 중...", ja: "ログアウト中...", es: "Cerrando sesión..." },
  "um.signOut": { en: "Sign Out", ko: "로그아웃", ja: "ログアウト", es: "Cerrar sesión" },

  // ─── Dashboard ───
  "dash.welcome": { en: "Welcome back,", ko: "돌아오셨군요,", ja: "おかえりなさい、", es: "Bienvenido de vuelta," },
  "dash.todayEnergy": { en: "Today's Energy", ko: "오늘의 에너지", ja: "今日のエネルギー", es: "Energía de hoy" },
  "dash.dayMaster": { en: "Day Master", ko: "일주", ja: "日主", es: "Maestro del Día" },
  "dash.todayLucky": { en: "Today's Lucky", ko: "오늘의 행운", ja: "今日のラッキー", es: "Suerte de hoy" },
  "dash.todayFortune": { en: "Today's Fortune", ko: "오늘의 운세", ja: "今日の運勢", es: "Fortuna de hoy" },
  "dash.fourPillars": { en: "Your Four Pillars", ko: "나의 사주팔자", ja: "あなたの四柱", es: "Tus Cuatro Pilares" },
  "dash.thisWeek": { en: "This Week", ko: "이번 주", ja: "今週", es: "Esta semana" },
  "dash.myReadings": { en: "My Readings", ko: "내 사주", ja: "鑑定結果", es: "Mis lecturas" },
  "dash.newReading": { en: "New Reading", ko: "새 사주", ja: "新規鑑定", es: "Nueva lectura" },
  "dash.myConsultations": { en: "My Consultations", ko: "내 상담", ja: "相談履歴", es: "Mis consultas" },
  "dash.share": { en: "Share", ko: "공유", ja: "共有", es: "Compartir" },
  "dash.fullReading": { en: "Full Reading", ko: "전체 보기", ja: "全文を見る", es: "Lectura completa" },
  "dash.dashboard": { en: "Dashboard", ko: "대시보드", ja: "ダッシュボード", es: "Panel" },
  "dash.newReading": { en: "New Reading", ko: "새 사주 보기", ja: "新しい鑑定", es: "Nueva lectura" },
  "dash.consultation": { en: "Consultation", ko: "상담", ja: "相談", es: "Consulta" },
  "dash.askCredits": { en: "Ask ({n} left)", ko: "질문하기 ({n}회 남음)", ja: "質問する（{n}回残り）", es: "Preguntar ({n} restantes)" },
  "dash.getConsultation": { en: "Get Consultation", ko: "상담 구매하기", ja: "相談を購入する", es: "Obtener consulta" },
  "dash.emptyDesc": { en: "Your cosmic blueprint awaits. Generate your Saju reading to unlock personalized daily insights.", ko: "우주적 청사진이 기다립니다. 사주 리딩을 생성하여 맞춤 일일 인사이트를 받아보세요.", ja: "宇宙の設計図が待っています。四柱鑑定を生成して毎日のパーソナルインサイトを受け取りましょう。", es: "Tu plano cósmico te espera. Genera tu lectura Saju para desbloquear insights diarios personalizados." },
  "dash.generateReading": { en: "Generate My Reading", ko: "내 사주 보기", ja: "鑑定を生成する", es: "Generar mi lectura" },
  "dash.newCheck": { en: "New Check", ko: "새 궁합", ja: "新規チェック", es: "Nueva prueba" },
  "dash.checkCompat": { en: "Check Compatibility", ko: "궁합 확인하기", ja: "相性をチェック", es: "Probar compatibilidad" },
  "dash.viewCompat": { en: "Check Compatibility", ko: "궁합 보기", ja: "相性を見る", es: "Ver compatibilidad" },
  "dash.checkCompatDesc": { en: "See how your Four Pillars align with a partner, friend, or colleague", ko: "파트너, 친구, 동료와 당신의 사주가 어떻게 조화되는지 확인하세요", ja: "パートナー、友人、同僚との四柱の調和を確認", es: "Ve cómo tus Cuatro Pilares se alinean con una pareja, amigo o colega" },
  "dash.setPrimaryHint": { en: "Tap ★ to set your primary chart (once per day).", ko: "★를 눌러 기본 사주를 설정하세요 (하루 1회).", ja: "★を押してメインの命式を設定（1日1回）。", es: "Toca ★ para fijar tu carta principal (una vez por día)." },
  "dash.viewAllChecks": { en: "View all", ko: "모두 보기", ja: "すべて見る", es: "Ver todas" },
  "dash.checks": { en: "checks", ko: "궁합 결과", ja: "件のチェック", es: "pruebas" },
  "dash.welcomeGuest": { en: "Welcome", ko: "환영합니다", ja: "ようこそ", es: "Bienvenido" },
  "dash.signInDesc": { en: "Sign in to save readings, track your fortune, and access your cosmic dashboard.", ko: "로그인하여 사주 결과를 저장하고 운세를 확인하세요.", ja: "ログインして鑑定結果を保存し、運勢を確認しましょう。", es: "Inicia sesión para guardar lecturas, rastrear tu fortuna y acceder a tu panel cósmico." },
  "dash.termsConsent": { en: "By continuing, you agree to our Terms of Service and Privacy Policy.", ko: "계속 진행하면 이용약관 및 개인정보 처리방침에 동의하는 것입니다.", ja: "続行することで、利用規約とプライバシーポリシーに同意したものとみなされます。", es: "Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad." },
  "dash.deleting": { en: "Deleting...", ko: "삭제 중...", ja: "削除中...", es: "Eliminando..." },
  "dash.tapToConfirmDelete": { en: "Tap to confirm delete", ko: "탭하여 삭제 확인", ja: "タップして確認", es: "Toca para confirmar" },
  "dash.deleteAccount": { en: "Delete Account", ko: "계정삭제", ja: "退会", es: "Eliminar cuenta" },
  "dash.deleteWarning": { en: "Are you sure? All data will be permanently deleted.", ko: "정말 삭제하시겠습니까? 모든 데이터가 영구 삭제됩니다.", ja: "本当に削除しますか？すべてのデータが完全に削除されます。", es: "¿Estás seguro? Todos los datos se eliminarán permanentemente." },
  "dash.possessiveReading": { en: "'s Reading", ko: "의 사주", ja: "の四柱", es: " — Lectura" },
  "dash.myChart": { en: "MY CHART", ko: "내 사주", ja: "マイチャート", es: "MI CARTA" },
  "dash.premium": { en: "Premium", ko: "프리미엄", ja: "プレミアム", es: "Premium" },
  "dash.showAllReadings": { en: "Show all {count} readings", ko: "전체 {count}개 보기", ja: "全{count}件を表示", es: "Ver todas las {count} lecturas" },
  "dash.alreadySwitchedToday": { en: "You already switched today. Try again tomorrow.", ko: "오늘 이미 변경했어요. 내일 다시 시도하세요.", ja: "今日はすでに変更しました。明日もう一度お試しください。", es: "Ya cambiaste hoy. Intenta mañana." },
  "dash.siteTag": { en: "My Saju Daily Fortune — sajuastrology.com", ko: "나의 오늘의 사주 운세 — sajuastrology.com", ja: "今日の四柱推命運勢 — sajuastrology.com", es: "Mi fortuna diaria Saju — sajuastrology.com" },

  // ─── Common ───
  "common.back": { en: "Back", ko: "뒤로", ja: "戻る", es: "Volver" },
  "common.loading": { en: "Loading...", ko: "로딩 중...", ja: "読み込み中...", es: "Cargando..." },
  "common.error": { en: "Something went wrong", ko: "오류가 발생했습니다", ja: "エラーが発生しました", es: "Algo salió mal" },
  "common.tryAgain": { en: "Try Again", ko: "다시 시도", ja: "もう一度", es: "Intentar de nuevo" },
  "common.copied": { en: "Copied!", ko: "복사됨!", ja: "コピー完了！", es: "¡Copiado!" },
  "common.copyLink": { en: "Copy Link", ko: "링크 복사", ja: "リンクをコピー", es: "Copiar enlace" },
  "common.free": { en: "Free", ko: "무료", ja: "無料", es: "Gratis" },
  "common.excellent": { en: "Excellent", ko: "아주 좋음", ja: "最高", es: "Excelente" },
  "common.balanced": { en: "Balanced", ko: "균형", ja: "バランス", es: "Equilibrado" },
  "common.beGentle": { en: "Be gentle", ko: "무리하지 마세요", ja: "ゆっくりと", es: "Con cuidado" },
  "common.contact": { en: "Contact", ko: "문의", ja: "お問い合わせ", es: "Contacto" },
  "common.privacy": { en: "Privacy", ko: "개인정보", ja: "プライバシー", es: "Privacidad" },
  "common.terms": { en: "Terms", ko: "이용약관", ja: "利用規約", es: "Términos" },
  "common.aiBusy": { en: "The AI is busy right now. Please try again in a moment.", ko: "AI가 잠시 바빠요. 잠깐 후 다시 시도해주세요.", ja: "AIが混雑しています。しばらくしてから再試行してください。", es: "La AI está ocupada ahora. Por favor intenta de nuevo en un momento." },
  "common.aiBusyShort": { en: "The AI is a bit busy right now. Please try again in a moment.", ko: "AI가 잠시 바빠요. 잠깐 후 다시 시도해주세요.", ja: "AIが少し混雑しています。しばらくしてからもう一度お試しください。", es: "La AI está un poco ocupada. Por favor intenta de nuevo en un momento." },
  "common.networkError": { en: "Network error. Please try again.", ko: "네트워크 오류. 다시 시도해주세요.", ja: "ネットワークエラー。再試行してください。", es: "Error de red. Por favor intenta de nuevo." },
  "common.networkErrorConnection": { en: "Network error — please check your connection.", ko: "네트워크 오류가 발생했습니다. 다시 시도해주세요.", ja: "ネットワークエラーが発生しました。再試行してください。", es: "Error de red — por favor revisa tu conexión." },
  "common.somethingWentWrong": { en: "Something went wrong. Please try again.", ko: "오류가 발생했습니다. 다시 시도해주세요.", ja: "エラーが発生しました。もう一度お試しください。", es: "Algo salió mal. Por favor intenta de nuevo." },
  "common.requestTimedOut": { en: "Request timed out. Please try again.", ko: "요청 시간이 초과됐습니다. 다시 시도해주세요.", ja: "リクエストがタイムアウトしました。もう一度お試しください。", es: "La solicitud expiró. Por favor intenta de nuevo." },
  "common.generationTimedOut": { en: "Generation timed out. Please try again.", ko: "생성 시간이 초과되었습니다. 다시 시도해주세요.", ja: "生成がタイムアウトしました。再試行してください。", es: "La generación expiró. Por favor intenta de nuevo." },
  "common.previewGenerating": { en: "Preview — generating...", ko: "미리보기 — 생성 중...", ja: "プレビュー — 生成中...", es: "Vista previa — generando..." },
  "common.learnMore": { en: "Learn more", ko: "자세히 보기", ja: "詳細を見る", es: "Saber más" },
  "common.solarCalendar": { en: "Solar Calendar", ko: "양력", ja: "新暦", es: "Calendario solar" },

  // ─── Compatibility Page — Loading Steps ───
  "compat.load1.label": { en: "Decoding your Day Masters", ko: "일주 해석 중", ja: "日主を解読中", es: "Decodificando tus Maestros del Día" },
  "compat.load1.sub": { en: "Reading the cosmic DNA of two souls", ko: "두 영혼의 우주적 DNA를 읽는 중", ja: "二つの魂の宇宙的DNAを読んでいます", es: "Leyendo el ADN cósmico de dos almas" },
  "compat.load2.label": { en: "Measuring elemental chemistry", ko: "오행 케미 측정 중", ja: "五行の相性を測定中", es: "Midiendo la química elemental" },
  "compat.load2.sub": { en: "Some elements ignite, others soothe", ko: "어떤 오행은 불을 지피고, 어떤 오행은 진정시킵니다", ja: "燃え上がる元素、鎮める元素", es: "Algunos elementos encienden, otros calman" },
  "compat.load3.label": { en: "Tracing branch harmonies", ko: "지지 조화 추적 중", ja: "地支の調和を追跡中", es: "Rastreando armonías de las ramas" },
  "compat.load3.sub": { en: "Hidden bonds written in the stars", ko: "별에 쓰인 숨겨진 인연", ja: "星に書かれた隠れた絆", es: "Vínculos ocultos escritos en las estrellas" },
  "compat.load4.label": { en: "Detecting cosmic friction", ko: "우주적 긴장 감지 중", ja: "宇宙の摩擦を検出中", es: "Detectando fricción cósmica" },
  "compat.load4.sub": { en: "A little tension makes things interesting", ko: "약간의 긴장감이 관계를 흥미롭게 합니다", ja: "少しの緊張が面白さを生む", es: "Un poco de tensión hace las cosas interesantes" },
  "compat.load5.label": { en: "Crafting your story", ko: "이야기 작성 중", ja: "ストーリーを作成中", es: "Creando tu historia" },
  "compat.load5.sub": { en: "Every pair has a unique chapter", ko: "모든 쌍에는 고유한 장이 있습니다", ja: "すべてのペアに固有の章がある", es: "Cada pareja tiene un capítulo único" },
  "compat.autoFilled": { en: "Auto-filled from your Saju chart", ko: "사주 차트에서 자동 입력됨", ja: "四柱チャートから自動入力", es: "Autocompletado desde tu carta Saju" },
  "compat.enterDifferent": { en: "Enter different info instead", ko: "다른 정보 입력하기", ja: "別の情報を入力する", es: "Ingresar información diferente" },
  "compat.yourInfo": { en: "Your Information", ko: "나의 정보", ja: "あなたの情報", es: "Tu información" },
  "compat.partnerInfo": { en: "Partner's Information", ko: "상대방 정보", ja: "相手の情報", es: "Información de la pareja" },
  "compat.backToYour": { en: "Back to your info", ko: "내 정보로 돌아가기", ja: "あなたの情報に戻る", es: "Volver a tu información" },
  "compat.freeNoCard": { en: "Free · No credit card required", ko: "무료 · 신용카드 불필요", ja: "無料 · カード不要", es: "Gratis · Sin tarjeta de crédito" },
  "compat.analyzingPair": { en: "cosmic connection", ko: "우주적 연결", ja: "宇宙のつながり", es: "conexión cósmica" },
  "compat.birthTimeUnknown": { en: "I don't know the birth time", ko: "출생 시간을 모릅니다", ja: "出生時間がわかりません", es: "No sé la hora de nacimiento" },

  // ─── Compatibility Result — Score Labels ───
  "cr.labelSoulmates": { en: "Cosmic Soulmates", ko: "운명적 소울메이트", ja: "宇宙のソウルメイト", es: "Almas gemelas cósmicas" },
  "cr.labelHarmony": { en: "Natural Harmony", ko: "자연스러운 조화", ja: "自然な調和", es: "Armonía natural" },
  "cr.labelTension": { en: "Dynamic Tension", ko: "역동적 긴장", ja: "ダイナミックな緊張", es: "Tensión dinámica" },
  "cr.labelChallenge": { en: "Growth Challenge", ko: "성장의 도전", ja: "成長の挑戦", es: "Desafío de crecimiento" },
  "cr.labelOpposite": { en: "Opposite Forces", ko: "반대 에너지", ja: "反対の力", es: "Fuerzas opuestas" },
  "cr.newCheck": { en: "New Check", ko: "새로운 궁합", ja: "新しいチェック", es: "Nueva prueba" },

  // ─── Element Labels ───
  "element.wood": { en: "Wood 木", ko: "목 木", ja: "木 木", es: "Madera 木" },
  "element.fire": { en: "Fire 火", ko: "화 火", ja: "火 火", es: "Fuego 火" },
  "element.earth": { en: "Earth 土", ko: "토 土", ja: "土 土", es: "Tierra 土" },
  "element.metal": { en: "Metal 金", ko: "금 金", ja: "金 金", es: "Metal 金" },
  "element.water": { en: "Water 水", ko: "수 水", ja: "水 水", es: "Agua 水" },

  // ─── Reading Page ───
  "reading.notFound": { en: "Reading Not Found", ko: "사주를 찾을 수 없습니다", ja: "鑑定が見つかりません", es: "Lectura no encontrada" },
  "reading.notFoundDesc": { en: "This reading may have been removed or the link is incorrect.", ko: "이 사주가 삭제되었거나 링크가 잘못되었을 수 있습니다.", ja: "この鑑定は削除されたか、リンクが正しくない可能性があります。", es: "Esta lectura puede haber sido eliminada o el enlace es incorrecto." },
  "reading.getFree": { en: "Get Your Free Reading", ko: "무료 사주 보기", ja: "無料で鑑定する", es: "Obtener tu lectura gratis" },
  "reading.loading": { en: "Loading your cosmic blueprint...", ko: "우주적 청사진 로딩 중...", ja: "宇宙の設計図を読み込み中...", es: "Cargando tu plano cósmico..." },
  "reading.cosmicBlueprint": { en: "Cosmic Blueprint", ko: "우주적 청사진", ja: "宇宙の設計図", es: "Plano cósmico" },
  "reading.born": { en: "Born", ko: "출생", ja: "生年月日", es: "Nacido" },
  "reading.dayMaster": { en: "Day Master", ko: "일주", ja: "日主", es: "Maestro del Día" },
  "reading.archetype": { en: "Archetype", ko: "원형", ja: "アーキタイプ", es: "Arquetipo" },
  "reading.harmony": { en: "Harmony", ko: "조화", ja: "調和", es: "Armonía" },
  "reading.fourPillars": { en: "The Four Pillars of Destiny", ko: "사주팔자", ja: "四柱推命", es: "Los Cuatro Pilares del Destino" },
  "reading.pillarHour": { en: "Hour", ko: "시주", ja: "時柱", es: "Hora" },
  "reading.pillarDay": { en: "Day", ko: "일주", ja: "日柱", es: "Día" },
  "reading.pillarMonth": { en: "Month", ko: "월주", ja: "月柱", es: "Mes" },
  "reading.pillarYear": { en: "Year", ko: "년주", ja: "年柱", es: "Año" },
  "reading.dayMasterLabel": { en: "Day Master", ko: "일주", ja: "日主", es: "Maestro del Día" },
  "reading.fiveElements": { en: "Five Elements Balance", ko: "오행 균형", ja: "五行バランス", es: "Equilibrio de los Cinco Elementos" },
  "reading.fortuneForecast": { en: "Fortune Forecast", ko: "운세 예보", ja: "運勢予報", es: "Pronóstico de fortuna" },
  "reading.harmonyScore": { en: "Cosmic Harmony Score", ko: "우주적 조화 점수", ja: "宇宙の調和スコア", es: "Puntuación de armonía cósmica" },
  "reading.harmonyHigh": { en: "Exceptionally balanced chart with strong cosmic alignment", ko: "강력한 우주적 정렬을 가진 탁월하게 균형 잡힌 사주", ja: "非常にバランスの取れた命式、強い宇宙の整合性", es: "Carta excepcionalmente equilibrada con fuerte alineación cósmica" },
  "reading.harmonyMid": { en: "Well-balanced chart with good elemental distribution", ko: "좋은 오행 분포를 가진 균형 잡힌 사주", ja: "良い五行分布のバランスの取れた命式", es: "Carta bien equilibrada con buena distribución elemental" },
  "reading.harmonyLow": { en: "Chart with distinct character — focus on strengthening weaker elements", ko: "뚜렷한 개성의 사주 — 약한 오행 강화에 집중", ja: "個性的な命式 — 弱い元素の強化に注力", es: "Carta con carácter distintivo — enfócate en fortalecer los elementos más débiles" },
  "reading.checkCompat": { en: "Check Your Compatibility", ko: "궁합 확인하기", ja: "相性をチェック", es: "Prueba tu compatibilidad" },
  "reading.checkCompatDesc": { en: "See how your Four Pillars align with a partner, friend, or colleague — free.", ko: "당신의 사주가 상대방과 어떻게 조화되는지 확인하세요 — 무료.", ja: "あなたの四柱が相手とどう調和するか確認 — 無料。", es: "Ve cómo tus Cuatro Pilares se alinean con una pareja, amigo o colega — gratis." },
  "reading.careerWealth": { en: "Career & Wealth Blueprint", ko: "직업 & 재물 분석", ja: "仕事 & 財運分析", es: "Plano de carrera y riqueza" },
  "reading.loveRelation": { en: "Love & Relationships", ko: "연애 & 관계", ja: "恋愛 & 人間関係", es: "Amor y relaciones" },
  "reading.healthWellness": { en: "Health & Wellness", ko: "건강 & 웰빙", ja: "健康 & ウェルネス", es: "Salud y bienestar" },
  "reading.decadeCycle": { en: "10-Year Fortune Cycle", ko: "10년 대운", ja: "10年大運", es: "Ciclo de fortuna de 10 años" },
  "reading.monthlyEnergy": { en: "Next 6 Months Energy Flow", ko: "향후 6개월 에너지 흐름", ja: "今後6ヶ月のエネルギー", es: "Flujo de energía — próximos 6 meses" },
  "reading.hiddenTalent": { en: "Bonus: Your Hidden Talent & Life Purpose", ko: "보너스: 숨겨진 재능 & 인생 목적", ja: "ボーナス：隠れた才能 & 人生の目的", es: "Bonus: Tu talento oculto y propósito de vida" },
  "reading.hiddenTalentSub": { en: "A special gift from the cosmos", ko: "우주로부터의 특별한 선물", ja: "宇宙からの特別な贈り物", es: "Un regalo especial del cosmos" },
  "reading.genFailed": { en: "Generation Failed", ko: "생성 실패", ja: "生成失敗", es: "Generación fallida" },
  "reading.genFailedDesc": { en: "Your payment was successful, but the AI reading generation encountered an issue. Don't worry — your purchase is saved. Tap below to try again.", ko: "결제는 완료되었지만 AI 리딩 생성에 문제가 발생했습니다. 걱정하지 마세요 — 구매 내역이 저장되었습니다. 아래를 눌러 다시 시도하세요.", ja: "お支払いは完了しましたが、AI鑑定の生成に問題が発生しました。ご安心ください — 購入記録は保存されています。下のボタンで再試行してください。", es: "Tu pago fue exitoso, pero la generación de la lectura AI encontró un problema. No te preocupes — tu compra está guardada. Toca abajo para reintentar." },
  "reading.retryGen": { en: "Retry Generation", ko: "다시 생성하기", ja: "再生成", es: "Reintentar generación" },
  "reading.retryPersist": { en: "If this persists, your reading will be generated automatically on your next visit.", ko: "문제가 계속되면 다음 방문 시 자동으로 생성됩니다.", ja: "問題が続く場合、次回訪問時に自動生成されます。", es: "Si persiste, tu lectura se generará automáticamente en tu próxima visita." },
  "reading.unlockFull": { en: "Unlock Your Full Destiny", ko: "완전한 운명 열기", ja: "完全な運命を解放", es: "Desbloquea tu destino completo" },
  "reading.unlockDesc": { en: "10-year forecast · Career · Love · Health · Hidden Talent — all personalized to your chart.", ko: "10년 예측 · 직업 · 연애 · 건강 · 숨겨진 재능 — 모두 당신의 사주에 맞춤.", ja: "10年予測 · 仕事 · 恋愛 · 健康 · 隠れた才能 — すべてあなたの命式に合わせて。", es: "Pronóstico 10 años · Carrera · Amor · Salud · Talento oculto — todo personalizado a tu carta." },
  "reading.unlockBtn": { en: "Unlock Full Reading — $9.99", ko: "풀 리딩 열기 — $9.99", ja: "フル鑑定を解放 — $9.99", es: "Desbloquear lectura completa — $9.99" },
  "reading.oneTime": { en: "One-time payment. Yours forever.", ko: "1회 결제. 영원히 당신의 것.", ja: "一回払い。永遠にあなたのもの。", es: "Pago único. Tuya para siempre." },
  "reading.compatFree": { en: "Compatibility detailed analysis is already free for everyone!", ko: "궁합 상세 분석은 모든 분께 무료입니다!", ja: "相性の詳細分析はすべての方に無料です！", es: "¡El análisis detallado de compatibilidad ya es gratis para todos!" },
  "reading.craftingFull": { en: "Crafting Your Full Destiny Reading", ko: "완전한 운명 리딩 생성 중", ja: "完全な運命鑑定を作成中", es: "Creando tu lectura completa del destino" },
  "reading.threeScholars": { en: "Three cosmic scholars are reading your pillars simultaneously", ko: "세 명의 우주적 학자가 동시에 사주를 읽고 있습니다", ja: "三人の宇宙の学者が同時にあなたの四柱を読んでいます", es: "Tres eruditos cósmicos están leyendo tus pilares simultáneamente" },
  "reading.genStep1": { en: "Career & Wealth Blueprint", ko: "직업 & 재물 분석", ja: "仕事 & 財運分析", es: "Plano de carrera y riqueza" },
  "reading.genStep1Sub": { en: "Mapping your professional destiny...", ko: "직업적 운명을 분석 중...", ja: "職業の運命を分析中...", es: "Mapeando tu destino profesional..." },
  "reading.genStep2": { en: "Love & Relationships", ko: "연애 & 관계", ja: "恋愛 & 人間関係", es: "Amor y relaciones" },
  "reading.genStep2Sub": { en: "Decoding your heart's cosmic pattern...", ko: "마음의 우주적 패턴 해석 중...", ja: "心の宇宙パターンを解読中...", es: "Decodificando el patrón cósmico de tu corazón..." },
  "reading.genStep3": { en: "Health & Wellness", ko: "건강 & 웰빙", ja: "健康 & ウェルネス", es: "Salud y bienestar" },
  "reading.genStep3Sub": { en: "Reading your elemental body map...", ko: "오행 체질 분석 중...", ja: "五行の体質を分析中...", es: "Leyendo tu mapa corporal elemental..." },
  "reading.genStep4": { en: "10-Year Fortune Cycle", ko: "10년 대운", ja: "10年大運", es: "Ciclo de fortuna de 10 años" },
  "reading.genStep4Sub": { en: "Charting your decade ahead...", ko: "앞으로의 10년을 분석 중...", ja: "今後10年を分析中...", es: "Trazando tu próxima década..." },
  "reading.genStep5": { en: "6-Month Energy Flow", ko: "6개월 에너지 흐름", ja: "6ヶ月エネルギー", es: "Flujo de energía de 6 meses" },
  "reading.genStep5Sub": { en: "Weaving your near-future story...", ko: "가까운 미래의 이야기를 엮는 중...", ja: "近い未来のストーリーを紡いでいます...", es: "Tejiendo tu historia del futuro cercano..." },
  "reading.genStep6": { en: "Hidden Talent & Life Purpose", ko: "숨겨진 재능 & 인생 목적", ja: "隠れた才能 & 人生の目的", es: "Talento oculto y propósito de vida" },
  "reading.genStep6Sub": { en: "Unveiling your cosmic gift...", ko: "우주적 선물을 드러내는 중...", ja: "宇宙の贈り物を明かしています...", es: "Revelando tu don cósmico..." },
  "reading.genDone": { en: "Done", ko: "완료", ja: "完了", es: "Listo" },
  "reading.genTakes": { en: "This takes about 15-20 seconds — your reading is being personally crafted, not pulled from a template.", ko: "약 15-20초 소요 — 템플릿이 아닌 맞춤 리딩을 생성 중입니다.", ja: "約15〜20秒 — テンプレートではなく、あなた専用の鑑定を作成中です。", es: "Esto tarda unos 15-20 segundos — tu lectura se está creando personalmente, no viene de una plantilla." },
  "reading.doNotLeave": { en: "Do not close or leave this page — your reading is being generated.", ko: "이 페이지를 닫거나 이탈하지 마세요 — 리딩을 생성 중입니다.", ja: "このページを閉じたり離れたりしないでください — 鑑定を生成中です。", es: "No cierres ni salgas de esta página — tu lectura se está generando." },
  "reading.shareReading": { en: "Share this reading", ko: "사주 공유하기", ja: "鑑定を共有", es: "Compartir esta lectura" },
  "reading.shareSub": { en: "Send the link to friends or family", ko: "친구나 가족에게 링크를 보내세요", ja: "友人や家族にリンクを送信", es: "Envía el enlace a amigos o familia" },
  "reading.shareCosmicId": { en: "Share Your Cosmic Identity", ko: "우주적 정체성을 공유하세요", ja: "宇宙のアイデンティティを共有", es: "Comparte tu identidad cósmica" },
  "reading.shareCosmicIdSub": { en: "Sign in to save your reading and share it with friends", ko: "로그인하여 사주를 저장하고 친구와 공유하세요", ja: "ログインして鑑定を保存し、友人と共有", es: "Inicia sesión para guardar tu lectura y compartirla con amigos" },
  "reading.savedDash": { en: "Saved to your dashboard", ko: "대시보드에 저장됨", ja: "ダッシュボードに保存済み", es: "Guardado en tu panel" },
  "reading.tapDash": { en: "Tap to view your dashboard →", ko: "대시보드로 이동 →", ja: "ダッシュボードへ →", es: "Toca para ver tu panel →" },
  "reading.wantOwn": { en: "Want your own cosmic blueprint?", ko: "나만의 우주적 청사진을 원하시나요?", ja: "あなただけの宇宙の設計図が欲しいですか？", es: "¿Quieres tu propio plano cósmico?" },
  "reading.discover30s": { en: "Discover your unique Four Pillars in 30 seconds", ko: "30초 만에 당신만의 사주팔자를 알아보세요", ja: "30秒であなたの四柱推命を発見", es: "Descubre tus Cuatro Pilares únicos en 30 segundos" },
  "reading.getMineFree": { en: "Get Mine Free", ko: "무료로 보기", ja: "無料で見る", es: "Obtener el mío gratis" },
  "reading.saveShare": { en: "Save & share your reading", ko: "사주 저장 & 공유", ja: "鑑定を保存 & 共有", es: "Guardar y compartir tu lectura" },
  "reading.saveShareDesc": { en: "Sign in to save this reading to your dashboard, revisit anytime, and share with friends.", ko: "로그인하여 대시보드에 저장하고, 언제든 다시 보고, 친구와 공유하세요.", ja: "ログインしてダッシュボードに保存、いつでも閲覧、友人と共有。", es: "Inicia sesión para guardar esta lectura en tu panel, revisarla cuando quieras y compartir con amigos." },
  "reading.free3s": { en: "Free — takes 3 seconds", ko: "무료 — 3초면 완료", ja: "無料 — 3秒で完了", es: "Gratis — tarda 3 segundos" },
  "reading.processing": { en: "Processing...", ko: "처리 중...", ja: "処理中...", es: "Procesando..." },
  "reading.verifyingPayment": { en: "Verifying payment...", ko: "결제 확인 중...", ja: "決済確認中...", es: "Verificando pago..." },
  "reading.verifyingDesc": { en: "Please wait — your reading will begin shortly.", ko: "잠시만 기다려주세요. 곧 리딩이 시작됩니다.", ja: "少々お待ちください。まもなく鑑定が始まります。", es: "Por favor espera — tu lectura comenzará en un momento." },
  "reading.generating": { en: "Generating your reading", ko: "사주 생성 중", ja: "四柱を生成中", es: "Generando tu lectura" },
  "reading.stayMsg": { en: "Please stay on this page — leaving may interrupt the reading.", ko: "이 페이지를 떠나지 마세요 — 해석이 중단될 수 있습니다.", ja: "このページを離れないでください — 解釈が中断される可能性があります。", es: "Por favor permanece en esta página — salir puede interrumpir la lectura." },
  "reading.titleTop": { en: "Cosmic", ko: "우주적", ja: "宇宙の", es: "Plano" },
  "reading.titleBottom": { en: "Blueprint", ko: "청사진", ja: "設計図", es: "cósmico" },
  "reading.estimated": { en: "estimated", ko: "추정값", ja: "推定値", es: "estimado" },

  // ─── Blog Article ───
  "blog.allArticles": { en: "All Articles", ko: "모든 글", ja: "すべての記事", es: "Todos los artículos" },
  "blog.readyToSeeChart": { en: "Ready to see your chart?", ko: "내 사주를 확인할 준비가 되셨나요?", ja: "あなたの命式を確認する準備はできましたか？", es: "¿Listo para ver tu carta?" },
  "blog.getFreeReading": { en: "Get your free Four Pillars reading in 30 seconds.", ko: "30초 만에 무료 사주 분석을 받아보세요.", ja: "30秒で無料の四柱推命鑑定を受けましょう。", es: "Obtén tu lectura gratis de los Cuatro Pilares en 30 segundos." },
  "blog.getMyFreeReading": { en: "Get My Free Reading", ko: "무료 사주 보기", ja: "無料で鑑定する", es: "Obtener mi lectura gratis" },

  // ─── Disclaimer ───
  "disclaimer": {
    en: "This is for entertainment and self-reflection only. See our Terms.",
    ko: "이 서비스는 오락 및 자기 성찰 목적으로만 제공됩니다. 이용약관을 참고하세요.",
    ja: "エンターテインメントおよび自己理解の目的でのみ提供されます。利用規約をご覧ください。",
    es: "Esto es solo para entretenimiento y autoreflexión. Ver nuestros Términos.",
  },

  // ─── What is Saju Page ───

  // Hero
  "wis.hero.titleMain": { en: "What is", ko: "", ja: "", es: "¿Qué es" },
  "wis.hero.titleGold": { en: "Saju", ko: "사주", ja: "四柱推命", es: "Saju" },
  "wis.hero.titleSuffix": { en: "?", ko: "란 무엇인가요?", ja: "とは何ですか？", es: "?" },
  "wis.hero.desc": { en: "The 1,000-year-old system that maps your entire life from the moment you were born.", ko: "태어난 순간부터 인생 전체를 그려내는 1,000년의 지혜.", ja: "生まれた瞬間から人生全体を描く、1,000年の知恵。", es: "El sistema de 1.000 años de antigüedad que mapea toda tu vida desde el momento en que naciste." },

  // Comparison Hook
  "wis.hook.title1": { en: "You know your zodiac sign. But that's only", ko: "별자리는 알고 있죠. 하지만 그건 단지", ja: "星座は知っている。でもそれは", es: "Conoces tu signo zodiacal. Pero eso es solo" },
  "wis.hook.title2": { en: "1 piece", ko: "1조각", ja: "1ピース", es: "1 pieza" },
  "wis.hook.title3": { en: "of a", ko: "에 불과해요.", ja: "に過ぎない。", es: "de un" },
  "wis.hook.title4": { en: "518,400-piece", ko: "518,400조각", ja: "518,400ピース", es: "rompecabezas de 518.400 piezas" },
  "wis.hook.title5": { en: "puzzle.", ko: "퍼즐 중 하나.", ja: "パズルの1ピース。", es: "." },
  "wis.hook.western": { en: "Western: 12 Types", ko: "서양: 12가지 유형", ja: "西洋：12タイプ", es: "Occidental: 12 tipos" },
  "wis.hook.saju": { en: "Saju: 518,400 Unique Profiles", ko: "사주: 518,400가지 고유 프로필", ja: "四柱推命：518,400通りのプロフィール", es: "Saju: 518.400 perfiles únicos" },

  // How Saju Works
  "wis.how.title": { en: "How Saju Works", ko: "사주의 원리", ja: "四柱推命の仕組み", es: "Cómo funciona Saju" },
  "wis.how.desc": { en: "Four steps to understanding your cosmic blueprint", ko: "우주적 청사진을 이해하는 4단계", ja: "宇宙の設計図を理解する4ステップ", es: "Cuatro pasos para entender tu plano cósmico" },
  "wis.how.s1.title": { en: "Four Pillars, Eight Characters", ko: "사주팔자 — 4개의 기둥, 8개의 글자", ja: "四柱八字 — 4つの柱、8つの文字", es: "Cuatro Pilares, ocho caracteres" },
  "wis.how.s1.desc": { en: "Your birth year, month, day, and hour each form a pillar. Each pillar has two characters — a Heavenly Stem and an Earthly Branch. Together, these 8 characters create your cosmic DNA.", ko: "생년, 월, 일, 시 각각이 하나의 기둥을 이룹니다. 각 기둥은 천간과 지지 두 글자로 구성되어 있습니다. 이 8개 글자가 당신의 우주적 DNA를 만들어냅니다.", ja: "生年・月・日・時がそれぞれ柱を形成。各柱は天干と地支の2文字で構成。この8文字があなたの宇宙的DNAを作ります。", es: "Tu año, mes, día y hora de nacimiento forman un pilar cada uno. Cada pilar tiene dos caracteres — un Tallo Celestial y una Rama Terrestre. Juntos, estos 8 caracteres crean tu ADN cósmico." },
  "wis.how.s2.title": { en: "The Five Elements", ko: "오행", ja: "五行", es: "Los Cinco Elementos" },
  "wis.how.s2.desc": { en: "Everything in Saju maps to five cosmic forces: Wood, Fire, Earth, Metal, and Water. Their balance in your chart determines your personality, strengths, and life path.", ko: "사주의 모든 것은 목, 화, 토, 금, 수 다섯 가지 우주적 힘으로 연결됩니다. 이들의 균형이 성격, 강점, 인생 방향을 결정합니다.", ja: "四柱推命のすべては木・火・土・金・水の五つの力に紐付きます。そのバランスが性格・強み・人生の方向性を決定します。", es: "Todo en Saju mapea a cinco fuerzas cósmicas: Madera, Fuego, Tierra, Metal y Agua. Su equilibrio en tu carta determina tu personalidad, fortalezas y camino de vida." },
  "wis.how.s3.title": { en: "Your Day Master", ko: "일주 (日主)", ja: "日主", es: "Tu Maestro del Día" },
  "wis.how.s3.desc": { en: "The character on your Day Pillar's Heavenly Stem is your Day Master — the core of who you are. It's like your sun sign, but far more specific.", ko: "일주 천간의 글자가 바로 일주(日主) — 당신의 본질입니다. 태양 별자리와 비슷하지만 훨씬 더 구체적입니다.", ja: "日柱の天干の文字があなたの「日主」— あなたの本質。太陽星座に似ていますが、はるかに具体的です。", es: "El carácter en el Tallo Celestial de tu Pilar del Día es tu Maestro del Día — el núcleo de quién eres. Es como tu signo solar, pero mucho más específico." },
  "wis.how.s3.label": { en: "Your Day Master", ko: "나의 일주", ja: "あなたの日主", es: "Tu Maestro del Día" },
  "wis.how.s3.example": { en: "Yang Earth", ko: "양토 (陽土)", ja: "陽土", es: "Tierra Yang" },
  "wis.how.s4.title": { en: "The Ten Archetypes", ko: "십신 (十神) — 10가지 원형", ja: "十神 — 10のアーキタイプ", es: "Los Diez Arquetipos" },
  "wis.how.s4.desc": { en: "The relationship between your Day Master and every other character reveals your dominant archetype — your natural approach to wealth, love, power, and creativity.", ko: "일주와 다른 글자들의 관계가 지배적인 원형을 드러냅니다 — 재물, 사랑, 권력, 창의력에 대한 당신의 본능적 접근법.", ja: "日主と他の文字との関係があなたの支配的なアーキタイプを明かします — 財運・恋愛・権力・創造性への本能的アプローチ。", es: "La relación entre tu Maestro del Día y cada otro carácter revela tu arquetipo dominante — tu enfoque natural hacia la riqueza, el amor, el poder y la creatividad." },

  // Five Elements
  "wis.el.wood": { en: "Wood", ko: "목 (木)", ja: "木", es: "Madera" },
  "wis.el.wood.kw": { en: "Growth, Creativity", ko: "성장, 창의성", ja: "成長、創造性", es: "Crecimiento, creatividad" },
  "wis.el.fire": { en: "Fire", ko: "화 (火)", ja: "火", es: "Fuego" },
  "wis.el.fire.kw": { en: "Passion, Action", ko: "열정, 행동력", ja: "情熱、行動力", es: "Pasión, acción" },
  "wis.el.earth": { en: "Earth", ko: "토 (土)", ja: "土", es: "Tierra" },
  "wis.el.earth.kw": { en: "Stability, Trust", ko: "안정, 신뢰", ja: "安定、信頼", es: "Estabilidad, confianza" },
  "wis.el.metal": { en: "Metal", ko: "금 (金)", ja: "金", es: "Metal" },
  "wis.el.metal.kw": { en: "Precision, Discipline", ko: "정밀함, 규율", ja: "精密、規律", es: "Precisión, disciplina" },
  "wis.el.water": { en: "Water", ko: "수 (水)", ja: "水", es: "Agua" },
  "wis.el.water.kw": { en: "Wisdom, Adaptability", ko: "지혜, 적응력", ja: "知恵、適応力", es: "Sabiduría, adaptabilidad" },

  // Archetypes
  "wis.arch.ally": { en: "The Ally", ko: "동료형", ja: "同士型", es: "El aliado" },
  "wis.arch.maverick": { en: "The Maverick", ko: "독불장군형", ja: "マーベリック型", es: "El independiente" },
  "wis.arch.creator": { en: "The Creator", ko: "창조자형", ja: "クリエイター型", es: "El creador" },
  "wis.arch.rebel": { en: "The Rebel", ko: "반항아형", ja: "反骨型", es: "El rebelde" },
  "wis.arch.adventurer": { en: "The Adventurer", ko: "모험가형", ja: "冒険家型", es: "El aventurero" },
  "wis.arch.builder": { en: "The Builder", ko: "건설자형", ja: "ビルダー型", es: "El constructor" },
  "wis.arch.commander": { en: "The Commander", ko: "지휘관형", ja: "指揮官型", es: "El comandante" },
  "wis.arch.leader": { en: "The Leader", ko: "리더형", ja: "リーダー型", es: "El líder" },
  "wis.arch.visionary": { en: "The Visionary", ko: "선구자형", ja: "ビジョナリー型", es: "El visionario" },
  "wis.arch.mentor": { en: "The Mentor", ko: "멘토형", ja: "メンター型", es: "El mentor" },

  // Why Different
  "wis.diff.title": { en: "Why It's Different", ko: "사주가 다른 이유", ja: "なぜ違うのか", es: "Por qué es diferente" },
  "wis.diff.desc": { en: "Three key advantages over traditional astrology systems", ko: "전통 점성술 대비 세 가지 핵심 강점", ja: "従来の占星術に対する3つの主要な優位性", es: "Tres ventajas clave sobre los sistemas astrológicos tradicionales" },
  "wis.diff.1.title": { en: "Precision", ko: "정밀함", ja: "精密さ", es: "Precisión" },
  "wis.diff.1.desc": { en: "Zodiac uses your birth month. Saju uses your exact birth hour and True Solar Time — calculated from your birth city's longitude.", ko: "별자리는 출생 월을 사용합니다. 사주는 정확한 출생 시각과 출생지 경도로 계산한 진태양시를 사용합니다.", ja: "星座は生まれた月を使う。四柱推命は正確な出生時刻と出生地の経度から計算した真太陽時を使います。", es: "El zodíaco usa tu mes de nacimiento. Saju usa tu hora exacta de nacimiento y la Hora Solar Verdadera — calculada desde la longitud de tu ciudad natal." },
  "wis.diff.2.title": { en: "Depth", ko: "깊이", ja: "深さ", es: "Profundidad" },
  "wis.diff.2.desc": { en: "MBTI gives you 16 types. Saju gives you 518,400+ unique combinations, each with distinct life patterns.", ko: "MBTI는 16가지 유형을 제공합니다. 사주는 각기 다른 인생 패턴을 가진 518,400가지 이상의 고유한 조합을 제공합니다.", ja: "MBTIは16タイプ。四柱推命は518,400通り以上の固有の組み合わせ、それぞれ異なる人生パターンを提供します。", es: "MBTI te da 16 tipos. Saju te da 518.400+ combinaciones únicas, cada una con patrones de vida distintos." },
  "wis.diff.3.title": { en: "Time-Awareness", ko: "시간 인식", ja: "時間認識", es: "Conciencia del tiempo" },
  "wis.diff.3.desc": { en: "Your Saju chart interacts with annual and decadal energy cycles, giving you year-by-year and even day-by-day guidance.", ko: "사주 차트는 연간 및 10년 단위 에너지 사이클과 상호작용하여 연별, 심지어 일별 지침을 제공합니다.", ja: "四柱チャートは年間・10年サイクルのエネルギーと相互作用し、年別・日別のガイダンスを提供します。", es: "Tu carta Saju interactúa con ciclos de energía anuales y decadales, dándote guía año a año e incluso día a día." },

  // Credibility
  "wis.cred.title": { en: "A Millennium of Wisdom", ko: "천 년의 지혜", ja: "千年の知恵", es: "Un milenio de sabiduría" },
  "wis.cred.desc": { en: "— also known as Four Pillars of Destiny — has been the primary life-guidance system in Korea, China, and Japan for over a millennium. Today, it's consulted for major life decisions: career changes, marriages, business launches, and more.", ko: "— 사주팔자로도 알려진 — 한국, 중국, 일본에서 천 년 이상 핵심적인 인생 지침 시스템으로 자리잡아 왔습니다. 오늘날에도 직업 변경, 결혼, 창업 등 중요한 인생 결정에 활용됩니다.", ja: "— 四柱推命としても知られる — 千年以上にわたり韓国・中国・日本の主要な人生指針システムとして機能してきました。今日も転職・結婚・起業などの重要な決断に活用されています。", es: "— también conocido como los Cuatro Pilares del Destino — ha sido el principal sistema de guía de vida en Corea, China y Japón por más de un milenio. Hoy se consulta para decisiones importantes: cambios de carrera, matrimonios, lanzamiento de negocios y más." },

  // Education CTA
  "wis.cta.title": { en: "Ready to decode yours?", ko: "당신의 사주를 해석할 준비가 되셨나요?", ja: "あなたの四柱を解読する準備はできましたか？", es: "¿Listo para decodificar el tuyo?" },
  "wis.cta.btn": { en: "Enter Your Birth Details", ko: "출생 정보 입력하기", ja: "生年月日を入力する", es: "Ingresa tus datos de nacimiento" },

  // ─── Not Found Page ───
  "notFound.title": { en: "Lost in the Cosmos?", ko: "우주에서 길을 잃으셨나요?", ja: "宇宙で迷子になりましたか？", es: "¿Perdido en el cosmos?" },
  "notFound.desc": { en: "The path you seek doesn't exist in this dimension. Perhaps the stars have redirected you for a reason.", ko: "찾으시는 페이지가 이 차원에 존재하지 않습니다. 별이 당신을 다른 곳으로 인도한 이유가 있을 겁니다.", ja: "お探しのページはこの次元に存在しません。星があなたを導いた理由があるかもしれません。", es: "El camino que buscas no existe en esta dimensión. Tal vez las estrellas te hayan redirigido por una razón." },
  "notFound.returnHome": { en: "Return to Earth", ko: "홈으로 돌아가기", ja: "ホームに戻る", es: "Volver a la Tierra" },
  "notFound.decodeDestiny": { en: "Decode My Destiny", ko: "내 운명 해석하기", ja: "運命を解読する", es: "Decodificar mi destino" },

  // ─── Hero App Buttons ───
  "hero.downloadOn": { en: "Download on the", ko: "다운로드", ja: "ダウンロード", es: "Descargar en el" },
  "hero.appStore": { en: "App Store", ko: "App Store", ja: "App Store", es: "App Store" },
  "hero.getItOn": { en: "Get it on", ko: "다운로드", ja: "ダウンロード", es: "Disponible en" },
  "hero.googlePlay": { en: "Google Play", ko: "Google Play", ja: "Google Play", es: "Google Play" },

  // ─── Upgrade CTA (Reading Page) ───
  "upgrade.title": { en: "This is your free overview.", ko: "여기까지가 무료 분석입니다.", ja: "ここまでが無料分析です。", es: "Esta es tu vista previa gratis." },
  "upgrade.desc": { en: "Unlock your full 10-year forecast, career & love deep-dive, and hidden talent analysis.", ko: "10년 대운, 직업·연애 심층 분석, 숨겨진 재능 분석을 확인하세요.", ja: "10年大運、職業・恋愛の深層分析、隠れた才能分析をご覧ください。", es: "Desbloquea tu pronóstico completo de 10 años, análisis profundo de carrera y amor, y análisis de talentos ocultos." },
  "upgrade.cta": { en: "Unlock Premium — $9.99 one-time", ko: "프리미엄 잠금 해제 — $9.99 일회 결제", ja: "プレミアム解放 — $9.99 一回払い", es: "Desbloquear Premium — $9.99 pago único" },
  "upgrade.ctaApp": { en: "Unlock Premium — $9.99", ko: "프리미엄 잠금 해제 — $9.99", ja: "プレミアム解放 — $9.99", es: "Desbloquear Premium — $9.99" },
  "upgrade.free": { en: "Or continue with free daily readings", ko: "또는 무료 일일 리딩 계속하기", ja: "または無料デイリー鑑定を続ける", es: "O continuar con lecturas diarias gratis" },
  "upgrade.koNotice": { en: "", ko: "해외 결제 수단 전용 · 국내 카드 미지원", ja: "", es: "" },

  // ─── Compatibility Checker (quick check on reading page) ───
  "qc.title": { en: "Check Your Compatibility", ko: "궁합 확인하기", ja: "相性をチェック", es: "Prueba tu compatibilidad" },
  "qc.subtitle": { en: "Enter someone's birth date to see your elemental harmony", ko: "상대방의 생년월일을 입력하여 오행 궁합을 확인하세요", ja: "相手の生年月日を入力して五行の相性を確認", es: "Ingresa la fecha de nacimiento de alguien para ver su armonía elemental" },
  "qc.birthDate": { en: "Birth Date", ko: "생년월일", ja: "生年月日", es: "Fecha de nacimiento" },
  "qc.gender": { en: "Gender", ko: "성별", ja: "性別", es: "Género" },
  "qc.female": { en: "Female", ko: "여성", ja: "女性", es: "Femenino" },
  "qc.male": { en: "Male", ko: "남성", ja: "男性", es: "Masculino" },
  "qc.analyzing": { en: "Analyzing...", ko: "분석 중...", ja: "分析中...", es: "Analizando..." },
  "qc.checkBtn": { en: "Check Compatibility", ko: "궁합 확인", ja: "相性チェック", es: "Probar compatibilidad" },
  "qc.tryAnother": { en: "Try Another", ko: "다시 해보기", ja: "もう一度", es: "Probar otra" },
  "qc.fullReport": { en: "Full Compatibility Report", ko: "전체 궁합 리포트", ja: "詳細相性レポート", es: "Reporte completo de compatibilidad" },

  // ─── Bottom Navigation ───
  "bnav.home": { en: "Home", ko: "홈", ja: "ホーム", es: "Inicio" },
  "bnav.reading": { en: "Reading", ko: "사주", ja: "鑑定", es: "Lectura" },
  "bnav.compatibility": { en: "Match", ko: "궁합", ja: "相性", es: "Match" },
  "bnav.consultation": { en: "Consult", ko: "상담", ja: "相談", es: "Consulta" },
  "bnav.my": { en: "My", ko: "마이", ja: "マイ", es: "Mi" },
} as const;

export type TranslationKey = keyof typeof translations;

// ─── Fallback logic ───────────────────────────────────────────────
// 1. Try requested locale
// 2. Fall back to English (always present on every key)
// 3. Fall back to the key itself if the key is missing entirely
//
// Note: as-const gives each entry a narrowed type like
// { readonly en: string; readonly ko: string; readonly ja: string }.
// We cast to a broader record so TS accepts locales like "es", "fr"
// that aren't present on every entry yet — they'll miss at runtime
// and fall through to the English fallback, which is exactly what
// we want during the staged multilingual rollout.
export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key] as Record<string, string> | undefined;
  if (!entry) return key;
  return entry[locale] ?? entry.en ?? key;
}

// ─── Templated translation ────────────────────────────────────────
// For strings with {variable} placeholders. Example:
//   tf("restore.restoredMany", "ko", { count: 3 })
//   → "3개의 구매가 복원되었습니다"
//
// Values are coerced to String(). Missing vars leave the placeholder
// in place rather than inserting "undefined".
export function tf(
  key: TranslationKey,
  locale: Locale,
  vars: Record<string, string | number> = {},
): string {
  let s = t(key, locale);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
  }
  return s;
}

// ─── BCP 47 language tag mapping ──────────────────────────────────
// For browser APIs that need standard locale codes (e.g.
// Date.toLocaleDateString, Intl.NumberFormat). NOT a translation —
// this is a system-level code lookup.
//
// Unknown locales fall back to "en-US" rather than throwing.
const BCP47_MAP: Record<Locale, string> = {
  en: "en-US",
  ko: "ko-KR",
  ja: "ja-JP",
  "zh-TW": "zh-TW",
  hi: "hi-IN",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
  ru: "ru-RU",
  id: "id-ID",
};

export function toBCP47(locale: Locale): string {
  return BCP47_MAP[locale] ?? "en-US";
}

export default translations;
