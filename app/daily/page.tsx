"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Compass,
  Zap,
  Share2,
  Check,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t, toBCP47 } from "@/lib/translations";
import {
  getDailyPillar,
  calculateDailyEnergy,
  ELEMENTS,
  type Element,
} from "@/lib/saju-calculator";
import type { DailyFortune } from "@/lib/daily-fortune";

/* ─── i18n content ─── */

const txt = {
  pageTitle: {
    en: "Today's Fortune", ko: "오늘의 운세", ja: "今日の運勢",
    es: "Fortuna de Hoy", fr: "Fortune du Jour", pt: "Sorte de Hoje",
    zhTW: "今日運勢", ru: "Удача на сегодня", hi: "आज का भाग्य", id: "Keberuntungan Hari Ini"
  },
  todayEnergy: {
    en: "Today's Energy", ko: "오늘의 기운", ja: "今日のエネルギー",
    es: "Energía de Hoy", fr: "Énergie du Jour", pt: "Energia de Hoje",
    zhTW: "今日能量", ru: "Энергия сегодня", hi: "आज की ऊर्जा", id: "Energi Hari Ini"
  },
  dominantElement: {
    en: "Dominant Element", ko: "지배 원소", ja: "支配元素",
    es: "Elemento Dominante", fr: "Élément Dominant", pt: "Elemento Dominante",
    zhTW: "主導元素", ru: "Доминирующий элемент", hi: "प्रमुख तत्व", id: "Elemen Dominan"
  },
  yourScore: {
    en: "Your Energy Score", ko: "나의 에너지 점수", ja: "あなたのエネルギー",
    es: "Tu Puntuación", fr: "Ton Score", pt: "Sua Pontuação",
    zhTW: "你的能量分數", ru: "Твой балл", hi: "आपका स्कोर", id: "Skormu"
  },
  fortune: {
    en: "Your Daily Fortune", ko: "오늘의 운세 메시지", ja: "今日の運勢メッセージ",
    es: "Tu Mensaje de Hoy", fr: "Ton Message du Jour", pt: "Sua Mensagem de Hoje",
    zhTW: "今日運勢訊息", ru: "Сообщение дня", hi: "आज का संदेश", id: "Pesan Hari Ini"
  },
  luckyItems: {
    en: "Lucky Items", ko: "행운 아이템", ja: "ラッキーアイテム",
    es: "Elementos de Suerte", fr: "Éléments Chanceux", pt: "Itens da Sorte",
    zhTW: "幸運物品", ru: "Счастливые вещи", hi: "भाग्यशाली वस्तुएं", id: "Item Keberuntungan"
  },
  color: {
    en: "Color", ko: "색상", ja: "カラー",
    es: "Color", fr: "Couleur", pt: "Cor",
    zhTW: "顏色", ru: "Цвет", hi: "रंग", id: "Warna"
  },
  direction: {
    en: "Direction", ko: "방향", ja: "方角",
    es: "Dirección", fr: "Direction", pt: "Direção",
    zhTW: "方向", ru: "Направление", hi: "दिशा", id: "Arah"
  },
  activity: {
    en: "Activity", ko: "활동", ja: "活動",
    es: "Actividad", fr: "Activité", pt: "Atividade",
    zhTW: "活動", ru: "Занятие", hi: "गतिविधि", id: "Aktivitas"
  },
  weekAhead: {
    en: "Week Ahead", ko: "이번 주 에너지", ja: "今週のエネルギー",
    es: "Semana por Venir", fr: "Semaine à Venir", pt: "Semana à Frente",
    zhTW: "本週能量", ru: "На неделю", hi: "आगामी सप्ताह", id: "Pekan Depan"
  },
  getReading: {
    en: "Get Your Free Reading", ko: "무료 사주 보기", ja: "無料で鑑定する",
    es: "Obtén Tu Lectura Gratis", fr: "Obtiens Ta Lecture Gratuite", pt: "Obtenha Sua Leitura Grátis",
    zhTW: "免費獲取解讀", ru: "Бесплатное чтение", hi: "मुफ़्त रीडिंग पाएं", id: "Dapatkan Pembacaan Gratis"
  },
  personalCta: {
    en: "Get your personalized daily fortune based on your Four Pillars birth chart.",
    ko: "사주팔자 기반 맞춤 일일 운세를 받아보세요.",
    ja: "四柱推命に基づくパーソナライズされた毎日の運勢をお受け取りください。",
    es: "Obtén tu fortuna diaria personalizada basada en tu carta de Cuatro Pilares.",
    fr: "Obtiens ta fortune quotidienne personnalisée basée sur ta carte des Quatre Piliers.",
    pt: "Obtenha sua sorte diária personalizada baseada em seu mapa dos Quatro Pilares.",
    zhTW: "根據你的四柱命盤獲取個人化的每日運勢。",
    ru: "Получи персональную ежедневную удачу на основе карты Четырёх Столпов.",
    hi: "अपने Four Pillars जन्म चार्ट के आधार पर व्यक्तिगत दैनिक भाग्य पाएं।",
    id: "Dapatkan keberuntungan harian personal berdasarkan peta kelahiran Four Pillars-mu."
  },
  share: {
    en: "Share", ko: "공유", ja: "共有",
    es: "Compartir", fr: "Partager", pt: "Compartilhar",
    zhTW: "分享", ru: "Поделиться", hi: "साझा करें", id: "Bagikan"
  },
  copied: {
    en: "Copied!", ko: "복사됨!", ja: "コピー済み!",
    es: "¡Copiado!", fr: "Copié !", pt: "Copiado!",
    zhTW: "已複製!", ru: "Скопировано!", hi: "कॉपी हो गया!", id: "Disalin!"
  },
  excellent: {
    en: "Excellent day ahead!", ko: "최고의 하루!", ja: "素晴らしい一日!",
    es: "¡Día excelente por delante!", fr: "Excellente journée en vue !", pt: "Excelente dia à frente!",
    zhTW: "絕佳的一天!", ru: "Отличный день!", hi: "बेहतरीन दिन आगे!", id: "Hari yang luar biasa!"
  },
  balanced: {
    en: "A balanced, steady day.", ko: "균형 잡힌 하루.", ja: "バランスの取れた一日。",
    es: "Un día equilibrado y estable.", fr: "Une journée équilibrée.", pt: "Um dia equilibrado.",
    zhTW: "平衡穩定的一天。", ru: "Сбалансированный день.", hi: "संतुलित दिन।", id: "Hari yang seimbang."
  },
  beGentle: {
    en: "Take it easy today.", ko: "오늘은 무리하지 마세요.", ja: "今日はゆっくり過ごしましょう。",
    es: "Tómalo con calma hoy.", fr: "Vas-y doucement aujourd'hui.", pt: "Vá com calma hoje.",
    zhTW: "今天放輕鬆。", ru: "Не перенапрягайся сегодня.", hi: "आज आराम से चलें।", id: "Santai saja hari ini."
  },
  upgrade: {
    en: "Unlock Full Destiny Reading", ko: "전체 운명 분석 잠금 해제", ja: "フルデスティニーリーディングを解放",
    es: "Desbloquear Lectura Completa", fr: "Débloquer Lecture Complète", pt: "Desbloquear Leitura Completa",
    zhTW: "解鎖完整命運解讀", ru: "Полное чтение судьбы", hi: "पूर्ण भाग्य रीडिंग अनलॉक करें", id: "Buka Pembacaan Takdir Penuh"
  },
  upgradeDesc: {
    en: "Go deeper — 10-year forecast, career, love, and hidden talent analysis.",
    ko: "10년 대운, 직업·연애·숨겨진 재능까지 심층 분석.",
    ja: "10年大運、職業・恋愛・隠れた才能の深層分析。",
    es: "Profundiza — pronóstico de 10 años, carrera, amor y análisis de talento oculto.",
    fr: "Plus profond — prévision sur 10 ans, carrière, amour et talents cachés.",
    pt: "Mais profundo — previsão de 10 anos, carreira, amor e talentos ocultos.",
    zhTW: "深入探索 — 十年運勢、事業、愛情及隱藏才能分析。",
    ru: "Глубже — прогноз на 10 лет, карьера, любовь, скрытые таланты.",
    hi: "गहराई में जाएं — 10-वर्षीय पूर्वानुमान, करियर, प्रेम, छुपी प्रतिभा।",
    id: "Lebih dalam — prediksi 10 tahun, karier, cinta, dan analisis bakat tersembunyi."
  },
  signInCta: {
    en: "Sign in to see your personalized fortune, energy score, and weekly forecast.",
    ko: "로그인하면 나만의 맞춤 운세, 에너지 점수, 주간 예측을 볼 수 있어요.",
    ja: "ログインすると、パーソナライズされた運勢、エネルギースコア、週間予測が見られます。",
    es: "Inicia sesión para ver tu fortuna personalizada, puntuación y pronóstico semanal.",
    fr: "Connecte-toi pour voir ta fortune personnalisée, score et prévision hebdomadaire.",
    pt: "Entre para ver sua sorte personalizada, pontuação e previsão semanal.",
    zhTW: "登入以查看個人化運勢、能量分數和每週預測。",
    ru: "Войди, чтобы увидеть свою удачу, балл и прогноз на неделю.",
    hi: "व्यक्तिगत भाग्य, स्कोर और साप्ताहिक पूर्वानुमान के लिए साइन इन करें।",
    id: "Masuk untuk melihat keberuntungan personal, skor, dan prediksi mingguan."
  },
  signIn: {
    en: "Sign In", ko: "로그인", ja: "ログイン",
    es: "Iniciar Sesión", fr: "Connexion", pt: "Entrar",
    zhTW: "登入", ru: "Войти", hi: "साइन इन", id: "Masuk"
  },
  or: {
    en: "or", ko: "또는", ja: "または",
    es: "o", fr: "ou", pt: "ou",
    zhTW: "或", ru: "или", hi: "या", id: "atau"
  },
} as const;

function tx(obj: Record<string, string>, locale: string): string {
  // Normalize: "zh-TW", "zh_TW", "zhTW", "zh-tw" -> "zhtw"
  const l = locale.toLowerCase().replace(/[-_]/g, "");
  if (l === "zhtw") return obj.zhTW || obj.en;
  // Match by prefix for language codes with country variants (es-ES, pt-BR, etc.)
  if (l.startsWith("es")) return obj.es || obj.en;
  if (l.startsWith("fr")) return obj.fr || obj.en;
  if (l.startsWith("pt")) return obj.pt || obj.en;
  if (l.startsWith("ru")) return obj.ru || obj.en;
  if (l.startsWith("hi")) return obj.hi || obj.en;
  if (l.startsWith("id")) return obj.id || obj.en;
  if (l.startsWith("ko")) return obj.ko || obj.en;
  if (l.startsWith("ja")) return obj.ja || obj.en;
  return obj[locale] || obj.en;
}

const ELEMENT_NAMES: Record<string, Record<string, string>> = {
  wood: {
    en: "Wood", ko: "목(木)", ja: "木",
    es: "Madera (木)", fr: "Bois (木)", pt: "Madeira (木)",
    zhTW: "木", ru: "Дерево (木)", hi: "Wood (木)", id: "Kayu (木)"
  },
  fire: {
    en: "Fire", ko: "화(火)", ja: "火",
    es: "Fuego (火)", fr: "Feu (火)", pt: "Fogo (火)",
    zhTW: "火", ru: "Огонь (火)", hi: "Fire (火)", id: "Api (火)"
  },
  earth: {
    en: "Earth", ko: "토(土)", ja: "土",
    es: "Tierra (土)", fr: "Terre (土)", pt: "Terra (土)",
    zhTW: "土", ru: "Земля (土)", hi: "Earth (土)", id: "Tanah (土)"
  },
  metal: {
    en: "Metal", ko: "금(金)", ja: "金",
    es: "Metal (金)", fr: "Métal (金)", pt: "Metal (金)",
    zhTW: "金", ru: "Металл (金)", hi: "Metal (金)", id: "Logam (金)"
  },
  water: {
    en: "Water", ko: "수(水)", ja: "水",
    es: "Agua (水)", fr: "Eau (水)", pt: "Água (水)",
    zhTW: "水", ru: "Вода (水)", hi: "Water (水)", id: "Air (水)"
  },
};

const ELEMENT_DESC: Record<string, Record<string, string>> = {
  wood: {
    en: "A day of growth and creativity. New ideas take root easily.",
    ko: "성장과 창의의 기운이 가득한 날. 새로운 아이디어가 쉽게 뿌리내립니다.",
    ja: "成長と創造のエネルギーに満ちた日。新しいアイデアが根付きやすい。",
    es: "Un día de crecimiento y creatividad. Las nuevas ideas echan raíces fácilmente.",
    fr: "Une journée de croissance et de créativité. Les nouvelles idées prennent racine facilement.",
    pt: "Um dia de crescimento e criatividade. Novas ideias criam raízes com facilidade.",
    zhTW: "成長與創意的日子。新想法容易紮根。",
    ru: "День роста и творчества. Новые идеи легко пускают корни.",
    hi: "वृद्धि और रचनात्मकता का दिन। नए विचार आसानी से जड़ पकड़ते हैं।",
    id: "Hari pertumbuhan dan kreativitas. Ide-ide baru mudah berakar."
  },
  fire: {
    en: "Passionate energy fills the day. Action and visibility are favored.",
    ko: "열정적인 기운이 가득한 날. 행동과 표현이 유리합니다.",
    ja: "情熱的なエネルギーに満ちた日。行動と表現が有利。",
    es: "Energía apasionada llena el día. La acción y la visibilidad son favorecidas.",
    fr: "Une énergie passionnée remplit la journée. L'action et la visibilité sont favorisées.",
    pt: "Energia apaixonada preenche o dia. Ação e visibilidade são favorecidas.",
    zhTW: "熱情能量充滿一天。行動和表達受到青睞。",
    ru: "Страстная энергия наполняет день. Действие и видимость благоприятны.",
    hi: "जुनूनी ऊर्जा दिन को भर देती है। कार्रवाई और दृश्यता अनुकूल हैं।",
    id: "Energi bergairah memenuhi hari ini. Aksi dan visibilitas mendukung."
  },
  earth: {
    en: "Stability and grounding energy. A good day for planning and building.",
    ko: "안정과 기반의 기운. 계획과 구축에 좋은 날입니다.",
    ja: "安定と基盤のエネルギー。計画と構築に良い日。",
    es: "Estabilidad y energía enraizante. Un buen día para planificar y construir.",
    fr: "Stabilité et énergie ancrée. Un bon jour pour planifier et construire.",
    pt: "Estabilidade e energia firme. Um bom dia para planejar e construir.",
    zhTW: "穩定與接地的能量。計劃和建造的好日子。",
    ru: "Стабильность и заземляющая энергия. Хороший день для планирования и созидания.",
    hi: "स्थिरता और आधार ऊर्जा। योजना और निर्माण के लिए अच्छा दिन।",
    id: "Energi stabil dan membumi. Hari yang baik untuk merencanakan dan membangun."
  },
  metal: {
    en: "Clarity and precision rule today. Decisions made now carry weight.",
    ko: "명확함과 정밀함의 기운. 오늘 내린 결정은 무게가 있습니다.",
    ja: "明晰さと精密さの気。今日の決断は重みがある。",
    es: "Claridad y precisión dominan hoy. Las decisiones tomadas ahora tienen peso.",
    fr: "Clarté et précision règnent aujourd'hui. Les décisions prises maintenant ont du poids.",
    pt: "Clareza e precisão governam hoje. Decisões tomadas agora têm peso.",
    zhTW: "今天清晰與精準主導。現在做的決定分量十足。",
    ru: "Сегодня правят ясность и точность. Решения, принятые сейчас, имеют вес.",
    hi: "आज स्पष्टता और सटीकता का शासन। अभी लिए गए निर्णयों में भार है।",
    id: "Kejernihan dan ketelitian berkuasa hari ini. Keputusan yang dibuat sekarang berbobot."
  },
  water: {
    en: "Wisdom and intuition flow freely. Trust your inner voice today.",
    ko: "지혜와 직감이 자유롭게 흐르는 날. 내면의 목소리를 믿으세요.",
    ja: "知恵と直感が自由に流れる日。内なる声を信じて。",
    es: "La sabiduría e intuición fluyen libremente. Confía en tu voz interior hoy.",
    fr: "Sagesse et intuition coulent librement. Fais confiance à ta voix intérieure aujourd'hui.",
    pt: "Sabedoria e intuição fluem livremente. Confie em sua voz interior hoje.",
    zhTW: "智慧與直覺自由流淌。今天相信你的內在聲音。",
    ru: "Мудрость и интуиция текут свободно. Доверяй своему внутреннему голосу сегодня.",
    hi: "ज्ञान और अंतर्ज्ञान स्वतंत्र रूप से बहते हैं। आज अपनी आंतरिक आवाज़ पर भरोसा करें।",
    id: "Kebijaksanaan dan intuisi mengalir bebas. Percayai suara batinmu hari ini."
  },
};

const ELEMENT_EMOJI: Record<string, string> = {
  wood: "🌿", fire: "🔥", earth: "⛰️", metal: "⚔️", water: "🌊",
};

/* ─── Component ─── */

export default function DailyPage() {
  const { user, sajuData, openSignInModal } = useAuth();
  const { locale } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [fortuneCopied, setFortuneCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  // Today's pillar — available to ALL users
  const todayPillar = useMemo(() => getDailyPillar(new Date()), []);
  const todayElement = todayPillar.stem.element as Element;
  const todayElementColor = ELEMENTS[todayElement]?.color || "#F2CA50";
  const todayStemZh = todayPillar.stem.zh;
  const todayBranchZh = todayPillar.branch.zh;

  // Date formatting — deferred to client to avoid SSR/CSR timezone mismatch
  const dateLocale = toBCP47(locale);
  const formattedDate = mounted
    ? new Date().toLocaleDateString(dateLocale, {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "";

  // Personal energy — logged-in users with chart only
  const dailyScore = useMemo(() => {
    if (!sajuData.chart) return null;
    return Math.round(calculateDailyEnergy(sajuData.chart, new Date()));
  }, [sajuData.chart]);

  // Weekly energy
  const weekDays = useMemo(() => {
    if (!sajuData.chart) return null;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const score = Math.round(calculateDailyEnergy(sajuData.chart!, d));
      const wLocale = toBCP47(locale);
      return {
        day: d.toLocaleDateString(wLocale, { weekday: "short" }),
        dateNum: d.getDate(),
        score,
      };
    });
  }, [sajuData.chart, locale]);

  // Daily fortune — lazy loaded
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  useEffect(() => {
    if (!sajuData.chart || dailyScore === null) return;
    const el = sajuData.chart.dayMaster.element;
    (async () => {
      try {
        const [baseMod, koMod, jaMod, esMod, frMod, ptMod, zhTWMod, ruMod, hiMod, idMod] = await Promise.all([
          import("@/lib/daily-fortune"),
          import("@/lib/daily-fortune-ko").catch(() => null),
          import("@/lib/daily-fortune-ja").catch(() => null),
          import("@/lib/daily-fortune-es").catch(() => null),
          import("@/lib/daily-fortune-fr").catch(() => null),
          import("@/lib/daily-fortune-pt").catch(() => null),
          import("@/lib/daily-fortune-zhTW").catch(() => null),
          import("@/lib/daily-fortune-ru").catch(() => null),
          import("@/lib/daily-fortune-hi").catch(() => null),
          import("@/lib/daily-fortune-id").catch(() => null),
        ]);
        setFortune(
          baseMod.getDailyFortuneLocale(
            el, dailyScore, locale,
            (koMod as any)?.FORTUNES_KO,
            (jaMod as any)?.FORTUNES_JA,
            (esMod as any)?.FORTUNES_ES,
            (frMod as any)?.FORTUNES_FR,
            (ptMod as any)?.FORTUNES_PT,
            (zhTWMod as any)?.FORTUNES_ZHTW,
            (ruMod as any)?.FORTUNES_RU,
            (hiMod as any)?.FORTUNES_HI,
            (idMod as any)?.FORTUNES_ID,
          )
        );
      } catch {
        import("@/lib/daily-fortune").then((mod) => {
          setFortune(mod.getDailyFortune(el, dailyScore));
        }).catch(() => {});
      }
    })();
  }, [sajuData.chart, dailyScore, locale]);

  const handleShare = () => {
    if (!fortune) return;
    const siteTag = t("dash.siteTag", locale);
    const text = `${fortune.shareText}\n\n${siteTag}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setFortuneCopied(true);
      setTimeout(() => setFortuneCopied(false), 2000);
    }
  };

  const hasChart = !!sajuData.chart;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full blur-[140px] opacity-25" style={{ backgroundColor: todayElementColor }} />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-page pb-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-muted-foreground mb-1">{formattedDate}</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {tx(txt.pageTitle, locale)}
          </h1>
        </motion.div>

        {/* Today's 干支 Card — visible to ALL */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 text-center">
            {/* Stem + Branch */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-serif"
                style={{ backgroundColor: `${todayElementColor}15`, color: todayElementColor }}
              >
                {todayStemZh}
              </div>
              <div className="w-16 h-16 rounded-xl bg-muted/30 flex items-center justify-center text-3xl font-serif text-muted-foreground">
                {todayBranchZh}
              </div>
            </div>

            {/* Element badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3" style={{ backgroundColor: `${todayElementColor}15` }}>
              <span className="text-lg">{ELEMENT_EMOJI[todayElement]}</span>
              <span className="text-sm font-medium" style={{ color: todayElementColor }}>
                {tx(txt.dominantElement, locale)}: {ELEMENT_NAMES[todayElement]?.[locale] || ELEMENT_NAMES[todayElement]?.en}
              </span>
            </div>

            {/* Element description */}
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {ELEMENT_DESC[todayElement]?.[locale] || ELEMENT_DESC[todayElement]?.en}
            </p>

            {/* Stem info */}
            <p className="text-xs text-muted-foreground/50 mt-3">
              {todayPillar.stem.en} · {todayPillar.branch.en}
            </p>
          </div>
        </motion.section>

        {/* ═══ Logged-in with chart: Personal Fortune ═══ */}
        {hasChart && dailyScore !== null && (
          <>
            {/* Energy Score */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {tx(txt.yourScore, locale)}
                  </p>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-serif"
                    style={{ backgroundColor: `${ELEMENTS[sajuData.chart!.dayMaster.element as Element]?.color || "#F2CA50"}20`, color: ELEMENTS[sajuData.chart!.dayMaster.element as Element]?.color || "#F2CA50" }}
                  >
                    {sajuData.chart!.dayMaster.zh}
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  {/* Gauge */}
                  <div className="relative">
                    <svg className="w-20 h-20 -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/30" />
                      {mounted && (
                        <motion.circle
                          cx="40" cy="40" r="34" fill="none"
                          stroke={dailyScore >= 70 ? "#59DE9B" : dailyScore >= 50 ? "#F2CA50" : "#EF4444"}
                          strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={`${(dailyScore / 100) * 213.6} 213.6`}
                          initial={{ strokeDasharray: "0 213.6" }}
                          animate={{ strokeDasharray: `${(dailyScore / 100) * 213.6} 213.6` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      )}
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                      {mounted ? dailyScore : "--"}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-lg font-medium text-foreground mb-1">
                      {dailyScore >= 70 ? tx(txt.excellent, locale) : dailyScore >= 50 ? tx(txt.balanced, locale) : tx(txt.beGentle, locale)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sajuData.chart!.dayMaster.en} · {sajuData.chart!.archetype}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Fortune Message */}
            {fortune && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {tx(txt.fortune, locale)}
                    </p>
                    <button
                      onClick={handleShare}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 shrink-0 min-h-[32px]"
                    >
                      {fortuneCopied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                      {fortuneCopied ? tx(txt.copied, locale) : tx(txt.share, locale)}
                    </button>
                  </div>

                  <p className="text-sm sm:text-base text-foreground leading-relaxed mb-3">
                    {fortune.message}
                  </p>
                  <p className="text-sm text-primary font-medium mb-4">
                    {fortune.advice}
                  </p>

                  {/* Lucky Items */}
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      {tx(txt.luckyItems, locale)}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-muted/20 min-w-0">
                        <div className="w-5 h-5 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: fortune.luckyColorHex }} />
                        <span className="text-xs text-foreground text-center leading-tight break-words w-full">{fortune.luckyColor}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{tx(txt.color, locale)}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-muted/20 min-w-0">
                        <Compass className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground text-center leading-tight break-words w-full">{fortune.luckyDirection}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{tx(txt.direction, locale)}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-muted/20 min-w-0">
                        <Zap className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground text-center leading-tight break-words w-full">{fortune.luckyActivity}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{tx(txt.activity, locale)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Weekly Energy */}
            {weekDays && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  {tx(txt.weekAhead, locale)}
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {weekDays.map((d, i) => {
                    const sc = d.score >= 70 ? "#59DE9B" : d.score >= 50 ? "#F2CA50" : "#EF4444";
                    return (
                      <div
                        key={i}
                        className={`bg-card/50 border rounded-lg p-2 text-center ${i === 0 ? "border-primary" : "border-border"}`}
                      >
                        <p className="text-[10px] text-muted-foreground">{d.day}</p>
                        <p className="text-sm font-medium">{d.dateNum}</p>
                        {mounted && (
                          <div className="mt-1">
                            <div className="mx-auto w-5 h-10 bg-muted/20 rounded-full relative overflow-hidden">
                              <div
                                className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700"
                                style={{ height: `${d.score}%`, backgroundColor: sc }}
                              />
                            </div>
                            <p className="text-[11px] font-bold mt-0.5" style={{ color: sc }}>{d.score}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </>
        )}

        {/* ═══ Not logged in or no chart: CTA ═══ */}
        {!hasChart && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>

              {!user ? (
                <>
                  {/* Non-logged-in: sign in + get reading */}
                  <h2 className="font-serif text-xl font-bold text-foreground mb-2">
                    {tx(txt.pageTitle, locale)}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    {tx(txt.signInCta, locale)}
                  </p>
                  <button
                    onClick={() => openSignInModal()}
                    className="w-full max-w-xs mx-auto h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg mb-3 transition-colors"
                  >
                    {tx(txt.signIn, locale)}
                  </button>
                  <p className="text-xs text-muted-foreground mb-3">{tx(txt.or, locale)}</p>
                  <Link href="/calculate" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                    {tx(txt.getReading, locale)}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </>
              ) : (
                <>
                  {/* Logged in but no chart yet */}
                  <h2 className="font-serif text-xl font-bold text-foreground mb-2">
                    {tx(txt.getReading, locale)}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    {tx(txt.personalCta, locale)}
                  </p>
                  <Link href="/calculate">
                    <Button className="gold-gradient text-primary-foreground font-semibold px-8 h-12 group">
                      {tx(txt.getReading, locale)}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.section>
        )}

        {/* Bottom CTA — premium upgrade (logged-in only, not premium) */}
        {hasChart && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Link href="/pricing">
              <div className="glass-gold rounded-2xl p-6 text-center hover:border-primary/30 transition-colors border border-transparent">
                <p className="font-serif text-lg font-bold text-foreground mb-1">
                  {tx(txt.upgrade, locale)}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {tx(txt.upgradeDesc, locale)}
                </p>
                <span className="text-sm text-primary font-medium flex items-center justify-center gap-1">
                  {t("common.learnMore", locale)}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          </motion.section>
        )}
      </div>

      <Footer />
    </main>
  );
}
