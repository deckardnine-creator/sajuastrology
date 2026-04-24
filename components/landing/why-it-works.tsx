"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"

const content = {
  badge: {
    en: "WHY IT WORKS",
    ko: "왜 정확한가",
    ja: "なぜ正確なのか",
    "zh-TW": "為何精準",
    es: "POR QUÉ FUNCIONA",
    fr: "POURQUOI ÇA MARCHE",
    pt: "POR QUE FUNCIONA",
    ru: "ПОЧЕМУ ЭТО РАБОТАЕТ",
    hi: "क्यों यह काम करता है",
    id: "MENGAPA AKURAT",
  },
  title: {
    en: "Built Different from Day One",
    ko: "처음부터 다르게 만들었습니다",
    ja: "最初から、違う。",
    "zh-TW": "從第一天起就與眾不同",
    es: "Diferente desde el primer día",
    fr: "Différent dès le premier jour",
    pt: "Diferente desde o primeiro dia",
    ru: "Особенный с первого дня",
    hi: "पहले दिन से ही अलग",
    id: "Berbeda Sejak Hari Pertama",
  },
  items: [
    {
      id: "solar",
      num: {
        en: "True Solar Time",
        ko: "진태양시 보정",
        ja: "真太陽時補正",
        "zh-TW": "真太陽時校正",
        es: "Tiempo Solar Real",
        fr: "Temps Solaire Vrai",
        pt: "Tempo Solar Verdadeiro",
        ru: "Истинное солнечное время",
        hi: "वास्तविक सौर समय",
        id: "Waktu Matahari Sejati",
      },
      title: {
        en: "— the correction others skip",
        ko: "— 다른 서비스가 건너뛰는 계산",
        ja: "— 他が省く補正",
        "zh-TW": "— 其他服務省略的校正",
        es: "— la corrección que otros omiten",
        fr: "— la correction que les autres omettent",
        pt: "— a correção que outros ignoram",
        ru: "— коррекция, которую другие пропускают",
        hi: "— वह सुधार जो दूसरे छोड़ देते हैं",
        id: "— koreksi yang dilewatkan situs lain",
      },
      desc: {
        en: "Your clock says 2:00 PM. But the sun over Seoul is 32 minutes behind Tokyo's meridian. That 32 minutes can shift your Hour Pillar entirely. We correct for your city's longitude — most saju sites don't.",
        ko: "시계는 오후 2시. 하지만 서울 하늘의 태양은 도쿄 기준 자오선보다 32분 느립니다. 그 32분이 시주를 바꿀 수 있습니다. 우리는 출생 도시 경도로 진태양시를 보정합니다 — 대부분의 사주 서비스는 이걸 안 합니다.",
        ja: "時計は午後2時。でもソウルの太陽は東京の子午線より32分遅れています。その32分が時柱をまるごと変えることも。私たちは出生都市の経度で真太陽時を補正します — ほとんどの四柱推命サイトはこれをしません。",
        "zh-TW": "時鐘顯示下午2點。但首爾天空的太陽比東京子午線晚32分鐘。這32分鐘可能完全改變您的時柱。我們根據您出生城市的經度進行校正 — 大多數四柱網站不會這樣做。",
        es: "Tu reloj marca las 2:00 PM. Pero el sol sobre Seúl está 32 minutos por detrás del meridiano de Tokio. Esos 32 minutos pueden cambiar completamente tu Pilar de Hora. Nosotros corregimos según la longitud de tu ciudad — la mayoría de sitios de saju no lo hacen.",
        fr: "Votre horloge indique 14h00. Mais le soleil au-dessus de Séoul est 32 minutes derrière le méridien de Tokyo. Ces 32 minutes peuvent complètement changer votre Pilier d'Heure. Nous corrigeons selon la longitude de votre ville — la plupart des sites de saju ne le font pas.",
        pt: "Seu relógio marca 14h. Mas o sol sobre Seul está 32 minutos atrás do meridiano de Tóquio. Esses 32 minutos podem mudar completamente seu Pilar da Hora. Corrigimos pela longitude da sua cidade — a maioria dos sites de saju não faz isso.",
        ru: "Часы показывают 14:00. Но солнце над Сеулом отстает на 32 минуты от токийского меридиана. Эти 32 минуты могут полностью изменить ваш Столп Часа. Мы корректируем по долготе вашего города — большинство сайтов саджу этого не делают.",
        hi: "आपकी घड़ी दोपहर 2:00 बजे दिखाती है। लेकिन सियोल के ऊपर सूरज टोक्यो के मध्याह्न से 32 मिनट पीछे है। वे 32 मिनट आपके घंटे स्तंभ को पूरी तरह बदल सकते हैं। हम आपके शहर के देशांतर के अनुसार सुधार करते हैं — अधिकांश साजू साइटें ऐसा नहीं करतीं।",
        id: "Jam Anda menunjukkan pukul 14:00. Tetapi matahari di atas Seoul tertinggal 32 menit dari meridian Tokyo. 32 menit itu dapat mengubah Pilar Jam Anda sepenuhnya. Kami mengoreksi berdasarkan bujur kota Anda — kebanyakan situs saju tidak melakukannya.",
      },
    },
    {
      id: "realtime",
      num: {
        en: "Real-time AI",
        ko: "실시간 AI 분석",
        ja: "リアルタイムAI分析",
        "zh-TW": "即時 AI 分析",
        es: "IA en Tiempo Real",
        fr: "IA en Temps Réel",
        pt: "IA em Tempo Real",
        ru: "ИИ в реальном времени",
        hi: "रियल-टाइम AI",
        id: "AI Waktu Nyata",
      },
      title: {
        en: "— not a template lookup",
        ko: "— 미리 만든 결과가 아닙니다",
        ja: "— テンプレートではない",
        "zh-TW": "— 而非樣板查找",
        es: "— no una plantilla predefinida",
        fr: "— pas un modèle pré-rédigé",
        pt: "— não um modelo pré-escrito",
        ru: "— не шаблонный поиск",
        hi: "— पूर्व-निर्मित टेम्पलेट नहीं",
        id: "— bukan pencarian template",
      },
      desc: {
        en: "Other saju sites match your birth date to pre-written paragraphs stored in a database. We generate every reading from scratch — a multi-engine AI pipeline analyzes your unique Four Pillars in real time, with 5-stage fallback to ensure zero failures.",
        ko: "다른 사주 사이트는 생년월일을 데이터베이스의 미리 작성된 문단과 매칭합니다. 우리는 매번 처음부터 생성합니다 — 멀티엔진 AI 파이프라인이 당신만의 사주팔자를 실시간으로 분석하며, 5단계 폴백으로 실패율 제로를 보장합니다.",
        ja: "他の四柱推命サイトは生年月日をデータベースの定型文に照合するだけ。私たちは毎回ゼロから生成します — マルチエンジンAIパイプラインがあなた固有の四柱八字をリアルタイムで分析し、5段階フォールバックで失敗率ゼロを保証します。",
        "zh-TW": "其他四柱網站只是將您的生日與資料庫中預先寫好的段落匹配。我們每次從零開始生成 — 多引擎 AI 管線即時分析您獨有的四柱八字,並透過 5 階段備援機制保證零失敗。",
        es: "Otros sitios de saju emparejan tu fecha de nacimiento con párrafos preescritos almacenados en una base de datos. Nosotros generamos cada lectura desde cero — un pipeline de IA multi-motor analiza tus Cuatro Pilares únicos en tiempo real, con 5 niveles de respaldo para garantizar cero fallos.",
        fr: "D'autres sites de saju associent votre date de naissance à des paragraphes pré-rédigés stockés dans une base de données. Nous générons chaque lecture à partir de zéro — un pipeline d'IA multi-moteur analyse vos Quatre Piliers uniques en temps réel, avec 5 niveaux de secours pour garantir zéro échec.",
        pt: "Outros sites de saju combinam sua data de nascimento com parágrafos pré-escritos armazenados em banco de dados. Geramos cada leitura do zero — um pipeline de IA multi-motor analisa seus Quatro Pilares únicos em tempo real, com 5 níveis de fallback para garantir zero falhas.",
        ru: "Другие сайты саджу сопоставляют дату рождения с заранее написанными абзацами из базы данных. Мы генерируем каждое чтение с нуля — многодвигательный ИИ-конвейер анализирует ваши уникальные Четыре Столпа в реальном времени, с 5-ступенчатой резервной системой для гарантии нулевых сбоев.",
        hi: "अन्य साजू साइटें आपकी जन्म तिथि को डेटाबेस में संग्रहीत पूर्व-लिखित अनुच्छेदों से मिलाती हैं। हम हर पठन शुरू से उत्पन्न करते हैं — मल्टी-इंजन AI पाइपलाइन आपके अद्वितीय चार स्तंभों का रियल-टाइम विश्लेषण करती है, 5-चरणीय फ़ॉलबैक के साथ शून्य विफलता सुनिश्चित करती है।",
        id: "Situs saju lain mencocokkan tanggal lahir Anda dengan paragraf pra-tulis yang disimpan di database. Kami menghasilkan setiap bacaan dari awal — pipeline AI multi-mesin menganalisis Empat Pilar unik Anda secara waktu nyata, dengan cadangan 5 tahap untuk memastikan nol kegagalan.",
      },
    },
    {
      id: "rag",
      num: { en: "562", ko: "562", ja: "562", "zh-TW": "562", es: "562", fr: "562", pt: "562", ru: "562", hi: "562", id: "562" },
      title: {
        en: "classical passages, vector-matched to you",
        ko: "개 고전 원전 패시지, 당신에게 벡터 매칭",
        ja: "の古典パッセージを、あなたにベクトル照合",
        "zh-TW": "段古典文獻,向量匹配到您",
        es: "pasajes clásicos, emparejados vectorialmente contigo",
        fr: "passages classiques, appariés vectoriellement à vous",
        pt: "passagens clássicas, combinadas vetorialmente com você",
        ru: "классических отрывков, векторно сопоставленных с вами",
        hi: "शास्त्रीय अंश, आपसे वेक्टर-मिलान",
        id: "bagian klasik, dicocokkan vektor dengan Anda",
      },
      desc: {
        en: "滴天髓 · 穷通宝鉴 · 子平真诠 · 渊海子平 · 格局论命 — 2,000+ years of theory, split into 562 passages, embedded as 1,536-dimensional vectors. Your birth chart is converted to the same vector space, and the most relevant classical insights are retrieved and woven into your reading. Every interpretation has a traceable source.",
        ko: "적천수 · 궁통보감 · 자평진전 · 연해자평 · 격국론명 — 2,000년 넘는 이론을 562개 패시지로 분리, 1,536차원 벡터로 임베딩. 당신의 사주를 같은 벡터 공간으로 변환해 가장 관련 높은 고전 인사이트를 검색하고 리딩에 녹여냅니다. 모든 해석에 원전 출처가 있습니다.",
        ja: "滴天髓・窮通寶鑑・子平真詮・淵海子平・格局論命 — 2,000年超の理論を562パッセージに分割し、1,536次元ベクトルに埋め込みました。あなたの四柱を同じベクトル空間に変換し、最も関連性の高い古典的洞察を抽出して鑑定に織り込みます。すべての解釈に、たどれる原典出典があります。",
        "zh-TW": "滴天髓・窮通寶鑑・子平真詮・淵海子平・格局論命 — 超過 2,000 年的理論,分為 562 段,嵌入為 1,536 維向量。您的八字被轉換到相同的向量空間,檢索出最相關的古典洞見並編織進您的解讀中。每一個解釋都有可追溯的原典出處。",
        es: "Di Tian Sui · Qiong Tong Bao Jian · Zi Ping Zhen Quan · Yuan Hai Zi Ping · Ge Ju Lun Ming — más de 2,000 años de teoría, divididos en 562 pasajes, incrustados como vectores de 1,536 dimensiones. Tu carta natal se convierte al mismo espacio vectorial, y las ideas clásicas más relevantes se recuperan y entretejen en tu lectura. Cada interpretación tiene una fuente rastreable.",
        fr: "Di Tian Sui · Qiong Tong Bao Jian · Zi Ping Zhen Quan · Yuan Hai Zi Ping · Ge Ju Lun Ming — plus de 2 000 ans de théorie, divisés en 562 passages, intégrés sous forme de vecteurs à 1 536 dimensions. Votre thème est converti dans le même espace vectoriel, et les perspectives classiques les plus pertinentes sont récupérées et tissées dans votre lecture. Chaque interprétation a une source traçable.",
        pt: "Di Tian Sui · Qiong Tong Bao Jian · Zi Ping Zhen Quan · Yuan Hai Zi Ping · Ge Ju Lun Ming — mais de 2.000 anos de teoria, divididos em 562 passagens, incorporados como vetores de 1.536 dimensões. Seu mapa natal é convertido no mesmo espaço vetorial, e as percepções clássicas mais relevantes são recuperadas e tecidas em sua leitura. Cada interpretação tem uma fonte rastreável.",
        ru: "Ди Тянь Суй · Цюн Тун Бао Цзянь · Цзы Пин Чжэнь Цюань · Юань Хай Цзы Пин · Гэ Цзюй Лунь Мин — более 2000 лет теории, разделенной на 562 отрывка, встроенных как 1536-мерные векторы. Ваша натальная карта преобразуется в то же векторное пространство, и наиболее релевантные классические идеи извлекаются и вплетаются в ваше чтение. Каждая интерпретация имеет отслеживаемый источник.",
        hi: "दी तियान सुई · छिओंग तोंग बाओ जियान · ज़ी पिंग झेन छ्वान · युआन हाई ज़ी पिंग · गे जू लुन मिंग — 2,000+ वर्षों का सिद्धांत, 562 अंशों में विभाजित, 1,536-आयामी वेक्टर के रूप में एम्बेड किया गया। आपकी जन्म कुंडली उसी वेक्टर स्थान में परिवर्तित होती है, और सबसे प्रासंगिक शास्त्रीय अंतर्दृष्टि पुनर्प्राप्त होकर आपके पठन में बुनी जाती है। हर व्याख्या का एक खोजने योग्य स्रोत है।",
        id: "Di Tian Sui · Qiong Tong Bao Jian · Zi Ping Zhen Quan · Yuan Hai Zi Ping · Ge Ju Lun Ming — teori lebih dari 2.000 tahun, dibagi menjadi 562 bagian, ditanamkan sebagai vektor 1.536 dimensi. Bagan kelahiran Anda dikonversi ke ruang vektor yang sama, dan wawasan klasik paling relevan diambil dan dijalin ke dalam bacaan Anda. Setiap interpretasi memiliki sumber yang dapat dilacak.",
      },
    },
    {
      id: "free",
      num: { en: "$0", ko: "$0", ja: "$0", "zh-TW": "$0", es: "$0", fr: "$0", pt: "$0", ru: "$0", hi: "$0", id: "$0" },
      title: {
        en: "to start. No subscription ever.",
        ko: "시작 비용. 구독은 영원히 없음.",
        ja: "で始められます。サブスクは一切ありません。",
        "zh-TW": "開始費用。永遠沒有訂閱制。",
        es: "para empezar. Sin suscripción, nunca.",
        fr: "pour commencer. Jamais d'abonnement.",
        pt: "para começar. Sem assinatura, nunca.",
        ru: "для старта. Никаких подписок, никогда.",
        hi: "शुरू करने के लिए। कभी कोई सदस्यता नहीं।",
        id: "untuk memulai. Tanpa langganan, selamanya.",
      },
      desc: {
        en: "Your free reading is genuinely free — no credit card, no trial, no catch. If you want deeper analysis, it's a one-time $9.99 payment. You keep it forever. No monthly fees, no recurring charges.",
        ko: "무료 리딩은 진짜 무료 — 카드 불필요, 체험판 아님. 더 깊은 분석이 필요하면 1회 $9.99 결제, 영원히 소유. 월정액 없음, 자동 결제 없음.",
        ja: "無料鑑定は本当に無料 — カード不要、体験版でもありません。より深い分析が必要な場合は一回$9.99の支払いで、永久に保存できます。月額料金なし、自動課金なし。",
        "zh-TW": "免費解讀是真正免費 — 不需信用卡、不是試用、沒有陷阱。如需更深入分析,僅需一次性支付 $9.99,永久保留。沒有月費,沒有定期扣款。",
        es: "Tu lectura gratuita es genuinamente gratis — sin tarjeta de crédito, sin prueba, sin trampa. Si quieres un análisis más profundo, es un pago único de $9.99. Lo conservas para siempre. Sin cuotas mensuales, sin cargos recurrentes.",
        fr: "Votre lecture gratuite est vraiment gratuite — pas de carte bancaire, pas d'essai, pas de piège. Pour une analyse plus approfondie, c'est un paiement unique de 9,99 $. Vous la gardez pour toujours. Pas de frais mensuels, pas de prélèvements récurrents.",
        pt: "Sua leitura gratuita é genuinamente grátis — sem cartão de crédito, sem teste, sem pegadinha. Para uma análise mais profunda, é um pagamento único de $9.99. Você mantém para sempre. Sem mensalidades, sem cobranças recorrentes.",
        ru: "Ваше бесплатное чтение действительно бесплатное — без кредитной карты, без пробной версии, без подвоха. Если нужен более глубокий анализ, это разовая оплата $9.99. Остается у вас навсегда. Никаких месячных платежей, никаких повторяющихся списаний.",
        hi: "आपका निःशुल्क पठन वास्तव में मुफ़्त है — क्रेडिट कार्ड नहीं, ट्रायल नहीं, कोई छिपा नियम नहीं। गहरे विश्लेषण के लिए, एक बार का $9.99 भुगतान। आप इसे हमेशा के लिए रखते हैं। कोई मासिक शुल्क नहीं, कोई आवर्ती शुल्क नहीं।",
        id: "Bacaan gratis Anda benar-benar gratis — tanpa kartu kredit, tanpa uji coba, tanpa jebakan. Jika menginginkan analisis mendalam, cukup pembayaran sekali $9.99. Anda memilikinya selamanya. Tanpa biaya bulanan, tanpa biaya berulang.",
      },
    },
  ],
} as const

function tx(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj.en
}

/* ── Mini SVG illustrations ── */

function SolarTimeDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full max-w-[200px]" fill="none">
      {/* Sun */}
      <circle cx="40" cy="30" r="14" fill="#F2CA50" opacity="0.9" />
      <g stroke="#F2CA50" strokeWidth="1.5" opacity="0.5">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          return (
            <line
              key={i}
              x1={40 + Math.cos(rad) * 18}
              y1={30 + Math.sin(rad) * 18}
              x2={40 + Math.cos(rad) * 22}
              y2={30 + Math.sin(rad) * 22}
            />
          )
        })}
      </g>
      {/* Arrow */}
      <path d="M 65 30 L 95 30" stroke="#F2CA50" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M 90 26 L 96 30 L 90 34" stroke="#F2CA50" strokeWidth="1.5" fill="none" />
      {/* Clock */}
      <circle cx="120" cy="30" r="16" stroke="#888" strokeWidth="1" fill="none" />
      <line x1="120" y1="30" x2="120" y2="20" stroke="#ccc" strokeWidth="1.5" />
      <line x1="120" y1="30" x2="128" y2="30" stroke="#F2CA50" strokeWidth="1.5" />
      <circle cx="120" cy="30" r="1.5" fill="#F2CA50" />
      {/* Label */}
      <text x="120" y="58" textAnchor="middle" fill="#888" fontSize="7" fontFamily="monospace">−32 min</text>
      {/* Correction arrow */}
      <path d="M 145 30 L 175 30" stroke="#22c55e" strokeWidth="1.5" />
      <path d="M 170 26 L 176 30 L 170 34" stroke="#22c55e" strokeWidth="1.5" fill="none" />
      {/* Corrected */}
      <circle cx="190" cy="30" r="8" fill="#22c55e" opacity="0.2" />
      <text x="190" y="33" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold">✓</text>
    </svg>
  )
}

function AIPipelineDiagram() {
  return (
    <svg viewBox="0 0 200 60" className="w-full max-w-[200px]" fill="none">
      {/* Input */}
      <rect x="5" y="15" width="30" height="30" rx="4" stroke="#F2CA50" strokeWidth="1" opacity="0.6" />
      <text x="20" y="33" textAnchor="middle" fill="#F2CA50" fontSize="12">四</text>
      <text x="20" y="53" textAnchor="middle" fill="#888" fontSize="6">Your Saju</text>
      {/* Arrow 1 */}
      <path d="M 40 30 L 55 30" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
      {/* AI Engine 1 */}
      <rect x="58" y="18" width="26" height="24" rx="4" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="0.8" />
      <text x="71" y="33" textAnchor="middle" fill="#3b82f6" fontSize="6" fontWeight="bold">AI 1</text>
      {/* Arrow 2 */}
      <path d="M 88 30 L 103 30" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
      {/* AI Engine 2 */}
      <rect x="106" y="18" width="26" height="24" rx="4" fill="#a855f7" opacity="0.15" stroke="#a855f7" strokeWidth="0.8" />
      <text x="119" y="33" textAnchor="middle" fill="#a855f7" fontSize="6" fontWeight="bold">AI 2</text>
      {/* Arrow 3 */}
      <path d="M 136 30 L 151 30" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
      {/* Output */}
      <rect x="154" y="12" width="40" height="36" rx="6" fill="#22c55e" opacity="0.1" stroke="#22c55e" strokeWidth="1" />
      <text x="174" y="28" textAnchor="middle" fill="#22c55e" fontSize="6" fontWeight="bold">Your</text>
      <text x="174" y="37" textAnchor="middle" fill="#22c55e" fontSize="6" fontWeight="bold">Reading</text>
      {/* Fallback arrows */}
      <path d="M 71 42 C 71 50, 119 50, 119 42" stroke="#666" strokeWidth="0.6" strokeDasharray="2 1" fill="none" />
      <text x="95" y="52" textAnchor="middle" fill="#666" fontSize="5">5-stage fallback</text>
    </svg>
  )
}

function RAGDiagram() {
  return (
    <svg viewBox="0 0 200 60" className="w-full max-w-[200px]" fill="none">
      {/* Books stack */}
      {[0, 5, 10].map((offset, i) => (
        <rect key={i} x={8 + offset * 0.5} y={14 - offset * 0.5} width="22" height="28" rx="2"
          stroke="#F2CA50" strokeWidth="0.8" opacity={0.3 + i * 0.25} fill="none" />
      ))}
      <text x="22" y="32" textAnchor="middle" fill="#F2CA50" fontSize="7">古典</text>
      <text x="22" y="51" textAnchor="middle" fill="#888" fontSize="5">5 texts</text>
      {/* Arrow to vectors */}
      <path d="M 40 28 L 58 28" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
      {/* Vector cloud */}
      {[0, 1, 2, 3, 4, 5].map((_, i) => (
        <circle key={i} cx={70 + (i % 3) * 10} cy={20 + Math.floor(i / 3) * 14} r="3"
          fill="#a855f7" opacity={0.2 + i * 0.1} />
      ))}
      <text x="80" y="51" textAnchor="middle" fill="#888" fontSize="5">562 vectors</text>
      {/* Arrow to match */}
      <path d="M 98 28 L 118 28" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
      {/* Similarity matching */}
      <rect x="120" y="14" width="32" height="28" rx="4" stroke="#22c55e" strokeWidth="0.8" fill="#22c55e" opacity="0.1" />
      <text x="136" y="26" textAnchor="middle" fill="#22c55e" fontSize="6">match</text>
      <text x="136" y="36" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold">97%</text>
      {/* Arrow to reading */}
      <path d="M 156 28 L 172 28" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
      {/* Citation */}
      <rect x="174" y="16" width="22" height="24" rx="3" stroke="#F2CA50" strokeWidth="0.8" fill="none" />
      <line x1="178" y1="23" x2="192" y2="23" stroke="#F2CA50" strokeWidth="0.6" opacity="0.4" />
      <line x1="178" y1="27" x2="190" y2="27" stroke="#F2CA50" strokeWidth="0.6" opacity="0.3" />
      <line x1="178" y1="31" x2="188" y2="31" stroke="#F2CA50" strokeWidth="0.6" opacity="0.2" />
      <text x="185" y="51" textAnchor="middle" fill="#888" fontSize="5">cited</text>
    </svg>
  )
}

function FreeDiagram() {
  return (
    <svg viewBox="0 0 200 60" className="w-full max-w-[200px]" fill="none">
      {/* Free tier */}
      <rect x="10" y="12" width="50" height="36" rx="6" fill="#22c55e" opacity="0.1" stroke="#22c55e" strokeWidth="1" />
      <text x="35" y="28" textAnchor="middle" fill="#22c55e" fontSize="7" fontWeight="bold">FREE</text>
      <text x="35" y="39" textAnchor="middle" fill="#888" fontSize="5.5">Full reading</text>
      {/* Arrow */}
      <path d="M 65 30 L 82 30" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
      <text x="73" y="42" textAnchor="middle" fill="#888" fontSize="5">want more?</text>
      {/* Paid tier */}
      <rect x="85" y="12" width="50" height="36" rx="6" fill="#F2CA50" opacity="0.1" stroke="#F2CA50" strokeWidth="1" />
      <text x="110" y="28" textAnchor="middle" fill="#F2CA50" fontSize="7" fontWeight="bold">$9.99</text>
      <text x="110" y="39" textAnchor="middle" fill="#888" fontSize="5.5">One-time</text>
      {/* X on subscription */}
      <rect x="148" y="16" width="44" height="28" rx="4" stroke="#ef4444" strokeWidth="0.8" opacity="0.3" fill="none" />
      <text x="170" y="30" textAnchor="middle" fill="#ef4444" fontSize="5.5" opacity="0.5">$XX/month</text>
      <line x1="150" y1="17" x2="190" y2="43" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
      <line x1="190" y1="17" x2="150" y2="43" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}

const DIAGRAMS: Record<string, () => JSX.Element> = {
  solar: SolarTimeDiagram,
  realtime: AIPipelineDiagram,
  rag: RAGDiagram,
  free: FreeDiagram,
}

export function WhyItWorks() {
  const { locale } = useLanguage()
  // locale may be any of the 10 supported languages.
  // tx() safely falls back to English if a key is missing, so passing
  // locale as string keeps new languages working without further changes.
  const l = locale as string

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary tracking-wider uppercase mb-4">
            {tx(content.badge, l)}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold">
            {tx(content.title, l)}
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {content.items.map((item, i) => {
            const Diagram = DIAGRAMS[item.id]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card/80 border border-border rounded-2xl p-6 sm:p-8 hover:border-primary/20 transition-colors"
              >
                {/* Diagram */}
                <div className="mb-5 flex justify-center">
                  <Diagram />
                </div>
                {/* Title */}
                <div className="mb-3">
                  <span className="font-serif text-xl sm:text-2xl font-bold gold-gradient-text">
                    {tx(item.num, l)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1.5">
                    {tx(item.title, l)}
                  </span>
                </div>
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tx(item.desc, l)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
