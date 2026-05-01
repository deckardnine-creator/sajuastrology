"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

// =============================================================
//  /letter — A Letter from Rimfactory
//  - Server page wraps with metadata + JSON-LD
//  - This is the client component with all content + animations
//  - Uses existing Navbar / Footer (no layout surprises)
//  - 10 languages via useLanguage (EN / KO / JA / ES / FR / PT / zh-TW / RU / HI / ID)
//  - 6 illustrations + signature, all under 260KB each
// =============================================================

type Locale = "en" | "ko" | "ja" | "es" | "fr" | "pt" | "zhTW" | "ru" | "hi" | "id"

// ═══════════════════════════════════════════════════════════════
//  Localized copy — written in full for each locale
// ═══════════════════════════════════════════════════════════════

const copy: Record<Locale, {
  eyebrow: string
  title: string[] // multiline
  intro: string
  sec1Title: string
  sec1P1: string
  sec1P2: string
  sec2Title: string
  sec2P1: string
  sec2P2: string
  sec3Title: string
  sec3P1: string
  sec3P2: string
  sec4Title: string
  sec4P1: string
  sec5Title: string
  sec5P1: string
  sec5P2: string
  sec6Title: string
  sec6P1: string
  closing1: string
  closing2: string
  closing3: string
  sigLabel: string
  backHome: string
  // alts
  altHero: string
  altOrder: string
  altGalton: string
  altCaption: string
  altSapling: string
  altQuestions: string
  altCosmos: string
}> = {
  en: {
    eyebrow: "A Letter from Rimfactory",
    title: ["Not another", "fortune-telling app."],
    intro: "Hello. This is Rimfactory, the team behind SajuAstrology. Thank you to everyone using our service. Let us briefly share what we are building, how, and where it is going.",

    sec1Title: "We did not set out to build another fortune-telling app.",
    sec1P1: "In the 19th century, the statistician Francis Galton designed a simple device. Drop hundreds of beads through a board of pegs, and each bead bounces at random — yet the distribution that accumulates below is always the same bell curve. The normal distribution. Chaos theory's double pendulum says the same thing. Motion that looks unpredictable is, in fact, the product of strict laws; the laws are simply too fine-grained for human observation to follow in real time.",
    sec1P2: "We see Saju as precisely such a domain. Within the small input of one person's birth moment sits a pattern that was shaped by thousands of years of statistical intuition. Whether or not you accept that premise is your own judgment. What we do is move that premise into a form that is reproducible and computable.",

    sec2Title: "Here is how our engine actually works.",
    sec2P1: "Inside SajuAstrology, 562 interpretive passages extracted from classical Eastern sources are embedded in a 1,536-dimensional vector space. Your Saju features are mapped into the same space in real time. The closest classical references are selected via cosine similarity, then cross-verified by two independent large language models, and finally synthesized into the reading you see. Every step runs on top of true solar-time correction (±15 minutes).",
    sec2P2: "If the technical details feel unfamiliar, that is fine. The point is only this: what we hand you is not a pre-baked template. Every reading is recomputed, each time, on top of verifiable sources.",

    sec3Title: "The world is discovering us, quietly.",
    sec3P1: "Within seven days of launch, ChatGPT began recommending SajuAstrology as \"Best Overall\" across the Korean Saju category. We spent zero on advertising. Users are arriving organically from more than 50 countries, and the response to our free Compatibility service has been particularly notable.",
    sec3P2: "In response, we are currently working on a significant upgrade to the Compatibility engine. A new version will be released shortly.",

    sec4Title: "What you are seeing right now is v1.",
    sec4P1: "The SajuAstrology you use today runs on RimSaju Engine v1. v1 implements the core calculation pipeline and the skeleton of interpretation — but it is not the final destination. To be direct: there are problems we have not yet solved. How to systematically reconcile differences between classical schools. How to reduce interpretive drift at boundary conditions. How to quantify and communicate the confidence of each statement. These are real, open engineering questions — and we are addressing them in RimSaju Engine v2.",

    sec5Title: "What changes in v2.",
    sec5P1: "v2 converges the interpretations of the major classical schools of Eastern destiny theory into a single engine. Where schools disagree, we will present both readings transparently, so users can see what is academically settled and what remains in debate. A series of engine updates will improve reproducibility and consistency in edge cases.",
    sec5P2: "As v2 is being prepared, we plan to publish three things. First, we will open-source our evaluation criteria and benchmarks on GitHub. Anyone will be able to measure their own Saju interpretation system on the same ground, and if someone produces more accurate results than ours, we will learn from that work. An academically verifiable common standard has never existed in this field. One of the things we intend to do is to propose a first draft of that standard. Second, we plan to publish our methodology and validation results in a formal paper. Which classical texts served as the foundation, how they were vectorized, and how the engine handles interpretive differences between schools of thought — we will document this process in a reproducible form and make it public. We want to demonstrate that Saju interpretation can be subject to academic verification without departing from its tradition. Third, v2 improvements will be delivered to existing users in stages, at no additional cost. Those who are already using SajuAstrology will simply continue with the updated engine — no repurchase required.",

    sec6Title: "Starting free is enough.",
    sec6P1: "All of SajuAstrology's core features are free. Use them first. When a result feels genuinely insightful to you, consider a paid reading. A paid reading performs a substantially deeper layer of interpretation on the same input. Our policy is simple: trust first, judgment stays with the user.",

    closing1: "The universe is not chaos. It is order.",
    closing2: "What we do is build the language that reads that order.",
    closing3: "Thank you for being part of this.",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "Back to SajuAstrology",

    altHero: "An ancient bamboo scroll releasing points of golden light that form a constellation",
    altOrder: "A field of golden points revealing a hidden geometric lattice",
    altGalton: "A vintage Galton board — golden beads forming a perfect normal distribution",
    altCaption: "Galton's Quincunx — the revelation of order from chaos.",
    altSapling: "A small golden sapling beneath the silhouette of a vast ancient tree",
    altQuestions: "A solitary figure beneath a starlit sky where stars form ancient characters",
    altCosmos: "A cosmic vista where calligraphy and galaxies merge — heaven and humanity as one",
  },

  ko: {
    eyebrow: "림팩토리의 편지",
    title: ["또 하나의 운세 앱을", "만들지 않았습니다."],
    intro: "안녕하세요. SajuAstrology 운영사 Rimfactory입니다. 이 서비스를 이용해 주시는 모든 분께 먼저 감사드립니다. 저희가 무엇을 어떻게 만들고 있는지, 그리고 앞으로 어디로 가려 하는지 간단히 말씀드리고자 합니다.",

    sec1Title: "저희는 \"또 하나의 운세 앱\"을 만들지 않았습니다.",
    sec1P1: "19세기 통계학자 프랜시스 골턴이 고안한 간단한 장치가 있습니다. 못이 박힌 판에 구슬 수백 개를 떨어뜨리면, 구슬 하나하나는 무작위로 튕기지만 아래에 쌓이는 분포는 매번 같은 종 모양 — 정규분포 — 을 이룹니다. 카오스 이론의 이중진자도 같은 사실을 말합니다. 예측 불가능해 보이는 운동조차 사실은 엄밀한 법칙의 산물이며, 다만 그 법칙이 너무 정교해서 인간의 관찰력이 쉽게 따라가지 못할 뿐입니다.",
    sec1P2: "사주 역시 저희는 그런 영역이라고 봅니다. 한 사람의 생년월일시라는 작은 입력 안에, 수천 년에 걸쳐 축적된 통계적 직관의 패턴이 담겨 있다는 전제입니다. 이 전제를 받아들일지 말지는 각자의 판단입니다. 저희가 하는 일은, 그 전제를 재현 가능한 방식으로 계산 가능한 형태로 옮기는 것입니다.",

    sec2Title: "저희의 엔진은 다음과 같이 동작합니다.",
    sec2P1: "SajuAstrology의 엔진 내부에서는 동양 고전 원전에서 추출한 562개의 해석 패시지가 1,536차원의 벡터 공간에 임베딩되어 있습니다. 사용자의 사주 특성은 실시간으로 같은 공간에 매핑되며, 코사인 유사도를 통해 가장 가까운 고전적 근거가 선택됩니다. 선택된 근거는 두 개의 독립적인 대규모 언어 모델에 의해 교차 검증된 뒤 최종 리딩으로 합성됩니다. 모든 단계는 진태양시 보정(±15분 정밀도) 위에서 수행됩니다.",
    sec2P2: "기술적 세부가 낯설게 느껴지셔도 괜찮습니다. 요점은 한 가지입니다. 저희가 내어 드리는 결과는 사전에 준비된 템플릿이 아니며, 매번 검증 가능한 근거 위에서 새로 계산된다는 것입니다.",

    sec3Title: "지금 세계가 이 서비스를 발견하고 있습니다.",
    sec3P1: "출시 후 7일 이내에, ChatGPT는 한국 사주 분야 전반에서 SajuAstrology를 \"Best Overall\"로 추천하기 시작했습니다. 광고비는 한 푼도 집행되지 않았습니다. 현재 50개국 이상에서 사용자들이 자발적으로 유입되고 있으며, 그중에서도 무료 궁합 서비스의 호응이 유독 두드러집니다.",
    sec3P2: "이 호응에 응답하기 위해, 저희는 현재 궁합 기능의 대규모 개선 작업을 진행하고 있습니다. 새로운 버전은 조만간 공개될 예정입니다.",

    sec4Title: "지금 여러분이 보고 계신 것은 v1입니다.",
    sec4P1: "현재 서비스되고 있는 SajuAstrology는 RimSaju 엔진 v1 위에서 동작합니다. v1은 기본적인 계산 파이프라인과 해석의 뼈대를 구현한 단계이며, 저희가 궁극적으로 도달하려는 지점은 아닙니다. 사실대로 말씀드리자면, 저희가 아직 풀지 못한 과제들이 있습니다. 학파 간 해석의 이견을 어떻게 체계적으로 조율할지, 경계 조건에서 발생하는 해석의 불일치를 어떻게 줄일지, 그리고 각 해석의 신뢰도를 어떻게 정량화해서 사용자에게 전달할지 — 이런 문제들입니다. 저희는 이 과제들을 RimSaju 엔진 v2에서 다룹니다.",

    sec5Title: "v2에서 달라지는 것.",
    sec5P1: "v2에서는 동양 명리학의 주요 학파별 해석을 하나의 엔진 안에 수렴시킵니다. 학파가 충돌하는 지점에서는 이를 숨기지 않고 병기하여, 사용자가 학술적으로 무엇이 합의되어 있고 무엇이 논쟁 중인지 투명하게 볼 수 있도록 할 것입니다. 또한 해석의 재현성과 경계 사례에서의 일관성을 개선하기 위한 일련의 엔진 업데이트가 포함됩니다.",
    sec5P2: "v2가 준비되는 과정에서 저희는 세 가지를 공개할 계획입니다. 첫째, 평가 기준과 벤치마크를 GitHub에 오픈소스로 공개합니다. 누구든지 동일한 기준 위에서 자신의 사주 해석 시스템을 측정할 수 있고, 저희보다 정확한 결과를 내는 작업이 있다면 저희는 그것으로부터 배울 것입니다. 이 분야에 학술적으로 검증 가능한 공통 기준이 존재한 적은 지금까지 없었습니다. 저희가 하고자 하는 일 중 하나는 그 기준의 초안을 제안하는 것입니다. 둘째, 저희의 방법론과 검증 결과를 정식 논문으로 발표할 계획입니다. 어떤 고전을 근거로, 어떤 방식으로 벡터화했으며, 학파 간 해석 차이를 엔진이 어떻게 다루는지 — 그 과정을 재현 가능한 형태로 정리해 공개합니다. 사주 해석이 전통을 벗어나지 않으면서도 학술적 검증의 대상이 될 수 있다는 것을 보여주고 싶습니다. 셋째, v2의 개선은 기존 사용자에게 추가 비용 없이 단계적으로 반영됩니다. 이미 SajuAstrology를 사용하고 계신 분들은 별도의 재구매 없이 업데이트된 엔진을 그대로 이용하시게 됩니다.",

    sec6Title: "무료에서 시작하셔도 충분합니다.",
    sec6P1: "SajuAstrology의 기본 기능은 모두 무료로 제공됩니다. 먼저 사용해 보시고, 결과가 본인에게 납득된다고 느끼실 때 유료 리딩을 고려해 보시면 됩니다. 유료 리딩은 같은 입력값 위에서 훨씬 더 깊은 층위의 해석을 수행합니다. 저희의 방침은 단순합니다. 먼저 신뢰를 드리고, 판단은 사용자에게 맡깁니다.",

    closing1: "우주는 혼돈이 아닙니다. 질서입니다.",
    closing2: "저희가 하는 일은 그 질서를 읽어내는 언어를 만드는 것입니다.",
    closing3: "이 일에 함께해 주셔서 감사합니다.",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "SajuAstrology 홈으로",

    altHero: "고대 죽간에서 피어오르는 황금빛 입자가 별자리를 이루는 장면",
    altOrder: "수많은 황금빛 점들 속에 드러나는 숨겨진 격자 패턴",
    altGalton: "황금빛 구슬이 완벽한 정규분포를 이루는 빈티지 골턴 보드",
    altCaption: "골턴의 퀸컹스 — 혼돈으로부터 드러나는 질서.",
    altSapling: "작은 황금 싹과 그 뒤로 펼쳐진 거대한 고목의 투명한 실루엣",
    altQuestions: "광활한 별밤 아래 홀로 선 사람과 별빛으로 그려진 동양 철학 문자들",
    altCosmos: "은하와 서예가 하나로 어우러진 우주 풍경 — 천인합일의 이미지",
  },

  ja: {
    eyebrow: "Rimfactoryからの手紙",
    title: ["もう一つの", "占いアプリではありません。"],
    intro: "こんにちは。SajuAstrology運営社のRimfactoryです。このサービスをご利用いただいている皆様に、まず感謝申し上げます。私たちが何をどのように作っているのか、そしてこれからどこへ向かおうとしているのか、簡潔にお伝えしたいと思います。",

    sec1Title: "私たちは「もう一つの占いアプリ」を作ってはいません。",
    sec1P1: "19世紀の統計学者フランシス・ゴルトンが考案した簡単な装置があります。釘の打たれた板にビーズを数百個落とすと、一つひとつは無作為に跳ねますが、下に積もる分布は毎回同じ釣鐘型 — 正規分布 — を描きます。カオス理論の二重振り子も同じことを示します。予測不可能に見える運動でさえ、実は厳密な法則の産物であり、ただその法則があまりにも精巧なため、人間の観察力が容易に追いつけないだけなのです。",
    sec1P2: "四柱推命もまた、そのような領域だと私たちは考えています。一人の生年月日時という小さな入力の中に、数千年にわたって蓄積された統計的直観のパターンが宿っているという前提です。この前提を受け入れるかどうかは、それぞれの判断です。私たちがしていることは、その前提を再現可能で計算可能な形に移すことです。",

    sec2Title: "私たちのエンジンは次のように動作します。",
    sec2P1: "SajuAstrologyのエンジン内部では、東洋古典原典から抽出された562の解釈パッセージが1,536次元のベクトル空間に埋め込まれています。ユーザーの四柱推命特徴はリアルタイムで同じ空間にマッピングされ、コサイン類似度によって最も近い古典的根拠が選択されます。選択された根拠は二つの独立した大規模言語モデルによって相互検証された後、最終的な鑑定へと合成されます。すべての段階は真太陽時補正（±15分精度）の上で実行されます。",
    sec2P2: "技術的な詳細が馴染みのないものに感じられても大丈夫です。要点は一つです。私たちがお届けする結果は、あらかじめ用意されたテンプレートではなく、毎回検証可能な根拠の上で新たに計算されているということです。",

    sec3Title: "今、世界がこのサービスを発見しつつあります。",
    sec3P1: "リリース後わずか7日のうちに、ChatGPTが韓国四柱推命分野全般でSajuAstrologyを「Best Overall」として推薦し始めました。広告費は一切使っていません。現在、50か国以上から自発的にユーザーが訪れており、中でも無料相性サービスへの反響は際立っています。",
    sec3P2: "この反響に応えるため、私たちは現在、相性機能の大規模な改善作業を進めています。新しいバージョンは近日中に公開される予定です。",

    sec4Title: "今ご覧いただいているのはv1です。",
    sec4P1: "現在提供されているSajuAstrologyは、RimSajuエンジンv1の上で動作しています。v1は基本的な計算パイプラインと解釈の骨組みを実装した段階であり、私たちが最終的に到達しようとしている地点ではありません。率直に申し上げると、まだ解決できていない課題があります。学派間の解釈の相違をどのように体系的に調和させるか、境界条件で生じる解釈のずれをどのように減らすか、そして各解釈の信頼度をどのように定量化してユーザーに伝えるか — こうした問題です。これらの課題を、私たちはRimSajuエンジンv2で扱います。",

    sec5Title: "v2で変わること。",
    sec5P1: "v2では、東洋命理学の主要な学派別解釈を一つのエンジン内に統合します。学派が衝突する箇所ではこれを隠さず両論併記し、ユーザーが学術的に何が合意されていて何が論争中なのかを透明に見られるようにします。また、解釈の再現性と境界事例における一貫性を改善するための一連のエンジン更新が含まれます。",
    sec5P2: "v2が準備される過程で、私たちは三つのことを公開する計画です。第一に、評価基準とベンチマークをGitHubにオープンソースで公開します。誰もが同じ基準の上で自身の四柱推命解釈システムを測定することができ、私たちよりも正確な結果を出す取り組みがあれば、私たちはそこから学びます。この分野には、学術的に検証可能な共通基準がこれまで存在したことがありません。私たちが取り組もうとしていることの一つは、その基準のたたき台を提案することです。第二に、私たちの方法論と検証結果を正式な論文として発表する計画です。どの古典を根拠とし、どのようにvectorize（ベクトル化）し、学派間の解釈の違いをエンジンがどう扱うか — そのプロセスを再現可能な形で整理し公開します。四柱推命の解釈が伝統から離れることなく、学術的検証の対象となり得ることを示したいと考えています。第三に、v2の改善は既存ユーザーの皆さまに追加費用なしで段階的に反映されます。すでにSajuAstrologyをご利用の方は、再購入の必要なく、更新されたエンジンをそのままお使いいただけます。",

    sec6Title: "無料から始めていただくだけで十分です。",
    sec6P1: "SajuAstrologyの基本機能はすべて無料で提供されています。まずお使いいただき、結果がご自身にとって納得のいくものだと感じられたときに、有料鑑定をご検討ください。有料鑑定は同じ入力値の上で、はるかに深い層の解釈を行います。私たちの方針はシンプルです。まず信頼をお渡しし、判断はユーザーに委ねます。",

    closing1: "宇宙は混沌ではありません。秩序です。",
    closing2: "私たちがしていることは、その秩序を読み解くための言語を作ることです。",
    closing3: "この旅路にご一緒いただき、ありがとうございます。",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "SajuAstrologyホームへ",

    altHero: "古代の竹簡から立ち上る金色の光が星座を形作る情景",
    altOrder: "無数の金色の点に浮かび上がる隠された格子模様",
    altGalton: "金色のビーズが完璧な正規分布を形作るヴィンテージのゴルトンボード",
    altCaption: "ゴルトンのクインカンクス — 混沌から現れる秩序。",
    altSapling: "小さな金色の若木と、その背後に広がる巨大な古木の透明なシルエット",
    altQuestions: "広大な星空の下に独り立つ人影と、星で描かれた東洋哲学の文字",
    altCosmos: "銀河と書が一つに溶け合う宇宙の情景 — 天人合一の姿",
  },

  es: {
    eyebrow: "Una carta de Rimfactory",
    title: ["No es otra", "app de adivinación."],
    intro: "Hola. Somos Rimfactory, el equipo detrás de SajuAstrology. Gracias a todos los que utilizan nuestro servicio. Permítannos compartir brevemente qué estamos construyendo, cómo, y hacia dónde se dirige.",

    sec1Title: "No nos propusimos construir otra app de adivinación.",
    sec1P1: "En el siglo XIX, el estadístico Francis Galton diseñó un dispositivo simple. Deje caer cientos de cuentas a través de un tablero de clavos, y cada cuenta rebota al azar — sin embargo, la distribución que se acumula abajo es siempre la misma curva de campana. La distribución normal. El péndulo doble de la teoría del caos dice lo mismo. El movimiento que parece impredecible es, de hecho, el producto de leyes estrictas; las leyes son simplemente demasiado finas para que la observación humana las siga en tiempo real.",
    sec1P2: "Vemos el Saju precisamente como un dominio así. Dentro del pequeño input del momento de nacimiento de una persona se encuentra un patrón que fue moldeado por miles de años de intuición estadística. Aceptar o no esa premisa es su propio juicio. Lo que hacemos es mover esa premisa hacia una forma que sea reproducible y computable.",

    sec2Title: "Así es como funciona realmente nuestro motor.",
    sec2P1: "Dentro de SajuAstrology, 562 pasajes interpretativos extraídos de fuentes clásicas orientales están incrustados en un espacio vectorial de 1,536 dimensiones. Las características de su Saju se mapean en el mismo espacio en tiempo real. Las referencias clásicas más cercanas se seleccionan mediante similitud coseno, luego se verifican de forma cruzada por dos grandes modelos de lenguaje independientes, y finalmente se sintetizan en la lectura que usted ve. Cada paso se ejecuta sobre la corrección de tiempo solar verdadero (±15 minutos).",
    sec2P2: "Si los detalles técnicos le resultan desconocidos, está bien. El punto es solo este: lo que le entregamos no es una plantilla preparada de antemano. Cada lectura se recalcula, cada vez, sobre fuentes verificables.",

    sec3Title: "El mundo nos está descubriendo, silenciosamente.",
    sec3P1: "En los siete días posteriores al lanzamiento, ChatGPT comenzó a recomendar SajuAstrology como \"Best Overall\" en toda la categoría de Saju coreano. Gastamos cero en publicidad. Los usuarios llegan de forma orgánica desde más de 50 países, y la respuesta a nuestro servicio gratuito de compatibilidad ha sido particularmente notable.",
    sec3P2: "En respuesta, actualmente estamos trabajando en una mejora significativa del motor de compatibilidad. Una nueva versión se lanzará en breve.",

    sec4Title: "Lo que está viendo ahora mismo es la v1.",
    sec4P1: "El SajuAstrology que usa hoy funciona sobre RimSaju Engine v1. La v1 implementa el pipeline de cálculo central y el esqueleto de interpretación — pero no es el destino final. Para ser directos: hay problemas que aún no hemos resuelto. Cómo reconciliar sistemáticamente las diferencias entre las escuelas clásicas. Cómo reducir la deriva interpretativa en condiciones límite. Cómo cuantificar y comunicar la confianza de cada afirmación. Estas son cuestiones de ingeniería reales y abiertas — y las estamos abordando en RimSaju Engine v2.",

    sec5Title: "Qué cambia en la v2.",
    sec5P1: "La v2 converge las interpretaciones de las principales escuelas clásicas de la teoría del destino oriental en un solo motor. Donde las escuelas discrepan, presentaremos ambas lecturas de forma transparente, para que los usuarios puedan ver qué está académicamente establecido y qué permanece en debate. Una serie de actualizaciones del motor mejorará la reproducibilidad y la consistencia en casos límite.",
    sec5P2: "A medida que preparamos la v2, planeamos publicar tres cosas. En primer lugar, abriremos el código de nuestros criterios de evaluación y benchmarks en GitHub. Cualquiera podrá medir su propio sistema de interpretación de Saju bajo el mismo estándar, y si alguien produce resultados más precisos que los nuestros, aprenderemos de ese trabajo. En este campo nunca ha existido un estándar común verificable académicamente. Una de las cosas que nos proponemos hacer es proponer un primer borrador de ese estándar. En segundo lugar, planeamos publicar nuestra metodología y resultados de validación en un artículo formal. Qué textos clásicos sirvieron de base, cómo fueron vectorizados y cómo el motor gestiona las diferencias interpretativas entre escuelas — documentaremos este proceso de forma reproducible y lo haremos público. Queremos demostrar que la interpretación del Saju puede someterse a verificación académica sin apartarse de su tradición. En tercer lugar, las mejoras de la v2 se entregarán a los usuarios existentes de forma escalonada, sin coste adicional. Quienes ya utilizan SajuAstrology simplemente continuarán con el motor actualizado — sin necesidad de volver a comprar nada.",

    sec6Title: "Comenzar gratis es suficiente.",
    sec6P1: "Todas las funciones principales de SajuAstrology son gratuitas. Úselas primero. Cuando un resultado le resulte genuinamente revelador, considere una lectura de pago. Una lectura de pago realiza una capa de interpretación sustancialmente más profunda sobre el mismo input. Nuestra política es simple: confianza primero, el juicio queda en el usuario.",

    closing1: "El universo no es caos. Es orden.",
    closing2: "Lo que hacemos es construir el lenguaje que lee ese orden.",
    closing3: "Gracias por ser parte de esto.",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "Volver a SajuAstrology",

    altHero: "Un antiguo pergamino de bambú liberando puntos de luz dorada que forman una constelación",
    altOrder: "Un campo de puntos dorados que revelan una celosía geométrica oculta",
    altGalton: "Un tablero Galton vintage — cuentas doradas formando una distribución normal perfecta",
    altCaption: "La quincunx de Galton — la revelación del orden a partir del caos.",
    altSapling: "Un pequeño retoño dorado bajo la silueta de un vasto árbol antiguo",
    altQuestions: "Una figura solitaria bajo un cielo estrellado donde las estrellas forman caracteres antiguos",
    altCosmos: "Una vista cósmica donde la caligrafía y las galaxias se fusionan — cielo y humanidad como uno",
  },

  fr: {
    eyebrow: "Une lettre de Rimfactory",
    title: ["Ce n'est pas une autre", "application de divination."],
    intro: "Bonjour. Nous sommes Rimfactory, l'équipe derrière SajuAstrology. Merci à toutes les personnes qui utilisent notre service. Permettez-nous de partager brièvement ce que nous construisons, comment, et où cela se dirige.",

    sec1Title: "Nous ne nous sommes pas mis à créer une autre application de divination.",
    sec1P1: "Au XIXᵉ siècle, le statisticien Francis Galton a conçu un dispositif simple. Laissez tomber des centaines de perles à travers un tableau de chevilles, et chaque perle rebondit au hasard — pourtant la distribution qui s'accumule en bas est toujours la même courbe en cloche. La distribution normale. Le pendule double de la théorie du chaos dit la même chose. Le mouvement qui semble imprévisible est, en fait, le produit de lois strictes ; les lois sont simplement trop fines pour que l'observation humaine puisse les suivre en temps réel.",
    sec1P2: "Nous voyons le Saju précisément comme un tel domaine. Dans le petit input du moment de naissance d'une personne se trouve un motif qui a été façonné par des milliers d'années d'intuition statistique. Accepter ou non cette prémisse relève de votre propre jugement. Ce que nous faisons, c'est déplacer cette prémisse vers une forme reproductible et calculable.",

    sec2Title: "Voici comment notre moteur fonctionne réellement.",
    sec2P1: "À l'intérieur de SajuAstrology, 562 passages interprétatifs extraits de sources classiques orientales sont intégrés dans un espace vectoriel à 1 536 dimensions. Les caractéristiques de votre Saju sont mappées dans le même espace en temps réel. Les références classiques les plus proches sont sélectionnées via la similarité cosinus, puis vérifiées de manière croisée par deux grands modèles de langage indépendants, et finalement synthétisées en la lecture que vous voyez. Chaque étape s'exécute au-dessus de la correction du temps solaire vrai (±15 minutes).",
    sec2P2: "Si les détails techniques vous semblent peu familiers, ce n'est pas grave. Le point est seulement celui-ci : ce que nous vous remettons n'est pas un modèle préconçu. Chaque lecture est recalculée, à chaque fois, sur des sources vérifiables.",

    sec3Title: "Le monde nous découvre, discrètement.",
    sec3P1: "Dans les sept jours suivant le lancement, ChatGPT a commencé à recommander SajuAstrology comme \"Best Overall\" dans toute la catégorie Saju coréen. Nous avons dépensé zéro en publicité. Les utilisateurs arrivent organiquement de plus de 50 pays, et la réponse à notre service gratuit de compatibilité a été particulièrement notable.",
    sec3P2: "En réponse, nous travaillons actuellement sur une mise à niveau significative du moteur de compatibilité. Une nouvelle version sera publiée prochainement.",

    sec4Title: "Ce que vous voyez en ce moment est la v1.",
    sec4P1: "Le SajuAstrology que vous utilisez aujourd'hui fonctionne sur RimSaju Engine v1. La v1 implémente le pipeline de calcul de base et le squelette de l'interprétation — mais ce n'est pas la destination finale. Pour être direct : il y a des problèmes que nous n'avons pas encore résolus. Comment réconcilier systématiquement les différences entre les écoles classiques. Comment réduire la dérive interprétative aux conditions limites. Comment quantifier et communiquer la confiance de chaque affirmation. Ce sont de véritables questions d'ingénierie ouvertes — et nous les abordons dans RimSaju Engine v2.",

    sec5Title: "Ce qui change dans la v2.",
    sec5P1: "La v2 fait converger les interprétations des principales écoles classiques de la théorie du destin oriental en un seul moteur. Là où les écoles divergent, nous présenterons les deux lectures de manière transparente, afin que les utilisateurs puissent voir ce qui est académiquement établi et ce qui reste en débat. Une série de mises à jour du moteur améliorera la reproductibilité et la cohérence dans les cas limites.",
    sec5P2: "Pendant que la v2 se prépare, nous prévoyons de publier trois choses. Premièrement, nous publierons nos critères d'évaluation et nos benchmarks en open source sur GitHub. Chacun pourra mesurer son propre système d'interprétation du Saju selon le même référentiel, et si quelqu'un produit des résultats plus précis que les nôtres, nous apprendrons de ce travail. Un standard commun vérifiable académiquement n'a jamais existé dans ce domaine. L'une des choses que nous souhaitons faire est de proposer une première ébauche de ce standard. Deuxièmement, nous prévoyons de publier notre méthodologie et nos résultats de validation dans un article formel. Quels textes classiques ont servi de fondement, comment ils ont été vectorisés et comment le moteur traite les divergences d'interprétation entre les écoles — nous documenterons ce processus sous une forme reproductible et le rendrons public. Nous voulons démontrer que l'interprétation du Saju peut faire l'objet d'une vérification académique sans s'écarter de sa tradition. Troisièmement, les améliorations de la v2 seront livrées aux utilisateurs existants par étapes, sans coût supplémentaire. Ceux qui utilisent déjà SajuAstrology continueront simplement avec le moteur mis à jour — sans nécessiter de nouvel achat.",

    sec6Title: "Commencer gratuitement suffit.",
    sec6P1: "Toutes les fonctionnalités principales de SajuAstrology sont gratuites. Utilisez-les d'abord. Lorsqu'un résultat vous semble vraiment perspicace, envisagez une lecture payante. Une lecture payante effectue une couche d'interprétation substantiellement plus profonde sur le même input. Notre politique est simple : la confiance d'abord, le jugement reste à l'utilisateur.",

    closing1: "L'univers n'est pas chaos. C'est l'ordre.",
    closing2: "Ce que nous faisons, c'est construire le langage qui lit cet ordre.",
    closing3: "Merci de faire partie de ceci.",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "Retour à SajuAstrology",

    altHero: "Un ancien parchemin de bambou libérant des points de lumière dorée formant une constellation",
    altOrder: "Un champ de points dorés révélant un treillis géométrique caché",
    altGalton: "Une planche de Galton vintage — des perles dorées formant une distribution normale parfaite",
    altCaption: "Le quinconce de Galton — la révélation de l'ordre à partir du chaos.",
    altSapling: "Un petit jeune pousse dorée sous la silhouette d'un vaste arbre ancien",
    altQuestions: "Une silhouette solitaire sous un ciel étoilé où les étoiles forment des caractères anciens",
    altCosmos: "Une vue cosmique où calligraphie et galaxies fusionnent — ciel et humanité unis",
  },

  pt: {
    eyebrow: "Uma carta da Rimfactory",
    title: ["Não é mais um", "app de adivinhação."],
    intro: "Olá. Somos a Rimfactory, a equipe por trás do SajuAstrology. Obrigado a todos que usam nosso serviço. Permita-nos compartilhar brevemente o que estamos construindo, como, e para onde está indo.",

    sec1Title: "Não nos propusemos a construir mais um app de adivinhação.",
    sec1P1: "No século XIX, o estatístico Francis Galton projetou um dispositivo simples. Deixe cair centenas de contas através de um tabuleiro de pinos, e cada conta quica aleatoriamente — no entanto, a distribuição que se acumula abaixo é sempre a mesma curva em forma de sino. A distribuição normal. O pêndulo duplo da teoria do caos diz a mesma coisa. O movimento que parece imprevisível é, na verdade, o produto de leis rigorosas; as leis são simplesmente finas demais para que a observação humana as siga em tempo real.",
    sec1P2: "Vemos o Saju precisamente como um domínio desse tipo. Dentro do pequeno input do momento de nascimento de uma pessoa está um padrão moldado por milhares de anos de intuição estatística. Aceitar ou não essa premissa é seu próprio julgamento. O que fazemos é mover essa premissa para uma forma reproduzível e computável.",

    sec2Title: "Veja como nosso motor realmente funciona.",
    sec2P1: "Dentro do SajuAstrology, 562 passagens interpretativas extraídas de fontes clássicas orientais estão incorporadas em um espaço vetorial de 1.536 dimensões. As características do seu Saju são mapeadas para o mesmo espaço em tempo real. As referências clássicas mais próximas são selecionadas via similaridade de cosseno, depois verificadas por dois grandes modelos de linguagem independentes, e finalmente sintetizadas na leitura que você vê. Cada etapa é executada sobre a correção do tempo solar verdadeiro (±15 minutos).",
    sec2P2: "Se os detalhes técnicos parecem não familiares, tudo bem. O ponto é apenas este: o que entregamos a você não é um modelo pré-preparado. Cada leitura é recalculada, toda vez, sobre fontes verificáveis.",

    sec3Title: "O mundo está nos descobrindo, silenciosamente.",
    sec3P1: "Dentro de sete dias após o lançamento, o ChatGPT começou a recomendar o SajuAstrology como \"Best Overall\" em toda a categoria de Saju coreano. Gastamos zero em publicidade. Os usuários estão chegando organicamente de mais de 50 países, e a resposta ao nosso serviço gratuito de compatibilidade tem sido particularmente notável.",
    sec3P2: "Em resposta, atualmente estamos trabalhando em uma atualização significativa do motor de compatibilidade. Uma nova versão será lançada em breve.",

    sec4Title: "O que você está vendo agora é a v1.",
    sec4P1: "O SajuAstrology que você usa hoje roda no RimSaju Engine v1. A v1 implementa o pipeline de cálculo central e o esqueleto da interpretação — mas não é o destino final. Para ser direto: há problemas que ainda não resolvemos. Como reconciliar sistematicamente as diferenças entre as escolas clássicas. Como reduzir o desvio interpretativo em condições de fronteira. Como quantificar e comunicar a confiança de cada afirmação. Estas são questões de engenharia reais e abertas — e estamos abordando-as no RimSaju Engine v2.",

    sec5Title: "O que muda na v2.",
    sec5P1: "A v2 faz convergir as interpretações das principais escolas clássicas da teoria do destino oriental em um único motor. Onde as escolas divergem, apresentaremos ambas as leituras de forma transparente, para que os usuários possam ver o que está academicamente estabelecido e o que permanece em debate. Uma série de atualizações do motor melhorará a reprodutibilidade e a consistência em casos de fronteira.",
    sec5P2: "Enquanto preparamos a v2, planejamos publicar três coisas. Primeiro, abriremos o código dos nossos critérios de avaliação e benchmarks no GitHub. Qualquer pessoa poderá medir seu próprio sistema de interpretação de Saju sob o mesmo padrão, e se alguém produzir resultados mais precisos do que os nossos, aprenderemos com esse trabalho. Nunca existiu nesta área um padrão comum academicamente verificável. Uma das coisas que pretendemos fazer é propor um primeiro rascunho desse padrão. Segundo, planejamos publicar nossa metodologia e resultados de validação em um artigo formal. Quais textos clássicos serviram de base, como foram vetorizados e como o motor lida com diferenças interpretativas entre escolas — documentaremos esse processo de forma reproduzível e o tornaremos público. Queremos demonstrar que a interpretação do Saju pode ser objeto de verificação acadêmica sem se afastar de sua tradição. Terceiro, as melhorias da v2 serão entregues aos usuários existentes em etapas, sem custo adicional. Quem já utiliza o SajuAstrology simplesmente continuará com o motor atualizado — sem necessidade de nova compra.",

    sec6Title: "Começar grátis é suficiente.",
    sec6P1: "Todos os recursos principais do SajuAstrology são gratuitos. Use-os primeiro. Quando um resultado lhe parecer genuinamente perspicaz, considere uma leitura paga. Uma leitura paga realiza uma camada de interpretação substancialmente mais profunda sobre o mesmo input. Nossa política é simples: confiança primeiro, o julgamento fica com o usuário.",

    closing1: "O universo não é caos. É ordem.",
    closing2: "O que fazemos é construir a linguagem que lê essa ordem.",
    closing3: "Obrigado por fazer parte disso.",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "Voltar para SajuAstrology",

    altHero: "Um antigo pergaminho de bambu liberando pontos de luz dourada que formam uma constelação",
    altOrder: "Um campo de pontos dourados revelando uma treliça geométrica oculta",
    altGalton: "Um tabuleiro de Galton vintage — contas douradas formando uma distribuição normal perfeita",
    altCaption: "O quincunce de Galton — a revelação da ordem a partir do caos.",
    altSapling: "Uma pequena muda dourada sob a silhueta de uma vasta árvore antiga",
    altQuestions: "Uma figura solitária sob um céu estrelado onde as estrelas formam caracteres antigos",
    altCosmos: "Uma vista cósmica onde caligrafia e galáxias se fundem — céu e humanidade como um só",
  },

  zhTW: {
    eyebrow: "來自Rimfactory的信",
    title: ["這不是另一個", "占卜應用程式。"],
    intro: "您好。我們是SajuAstrology背後的團隊Rimfactory。感謝所有使用我們服務的人。請容我們簡短分享我們在建立什麼、如何建立、以及這將走向何方。",

    sec1Title: "我們並非要建立另一個占卜應用程式。",
    sec1P1: "19世紀,統計學家法蘭西斯·高爾頓設計了一個簡單的裝置。將數百顆珠子落入釘板中,每顆珠子都會隨機彈跳 — 然而下方累積的分布總是相同的鐘形曲線。常態分布。混沌理論中的雙擺也說明了同樣的事實。看似不可預測的運動,實際上是嚴格法則的產物;只是這些法則過於精細,人類的觀察力無法即時跟上。",
    sec1P2: "我們將四柱推命視為正是這樣的領域。在一個人出生時刻這個小小的輸入之中,蘊含著經過數千年累積的統計直覺模式。是否接受這個前提,取決於您自己的判斷。我們所做的,是將這個前提轉化為可重現、可計算的形式。",

    sec2Title: "我們的引擎實際上是這樣運作的。",
    sec2P1: "在SajuAstrology內部,562段從東方古典原典中擷取的解讀段落被嵌入1,536維的向量空間。您的四柱特徵會即時映射到同一空間,透過餘弦相似度選出最接近的古典依據。選出的依據會經過兩個獨立的大型語言模型交叉驗證,最後合成為您所看到的解讀。每一步都在真太陽時校正(±15分鐘精度)之上執行。",
    sec2P2: "如果技術細節感到陌生,沒關係。重點只有一個:我們呈現給您的結果不是預先準備好的模板。每次解讀都是在可驗證的依據之上重新計算而來。",

    sec3Title: "世界正在悄悄發現我們。",
    sec3P1: "發布後七天內,ChatGPT開始在整個韓國四柱推命類別中將SajuAstrology推薦為\"Best Overall\"。我們在廣告上的花費為零。使用者從超過50個國家自然地湧入,尤其是免費合盤服務的反響特別顯著。",
    sec3P2: "為了回應這股反響,我們目前正在對合盤引擎進行重大升級。新版本將在近期發布。",

    sec4Title: "您現在看到的是v1。",
    sec4P1: "目前提供的SajuAstrology運行於RimSaju Engine v1之上。v1實現了基本的計算管道和解讀骨架 — 但這不是最終目的地。坦白說,還有我們尚未解決的問題。如何系統性地調和學派間的解讀差異。如何減少邊界條件下的解讀偏移。如何量化並傳達每個論述的信賴度。這些都是真實且開放的工程問題 — 我們正在RimSaju Engine v2中處理它們。",

    sec5Title: "v2會改變什麼。",
    sec5P1: "v2將東方命理學主要古典學派的解讀匯聚到單一引擎中。在學派出現分歧的地方,我們會透明地並列呈現兩種解讀,讓使用者能清楚看到學術上已有共識的部分與仍在爭論的部分。一系列引擎更新將改善可重現性與邊界案例的一致性。",
    sec5P2: "在 v2 準備的過程中,我們計畫公開三件事。第一,我們將在 GitHub 上以開源方式公開評估標準與基準測試。任何人都能在相同的基準上衡量自己的四柱推命解讀系統,若有人產出比我們更精確的結果,我們會從中學習。此領域至今從未存在過學術上可驗證的共同標準。我們想做的其中一件事,就是提出該標準的初稿。第二,我們計畫以正式論文形式發表我們的方法論與驗證結果。以哪些古典為依據、如何進行向量化、引擎如何處理學派間的詮釋差異 — 我們將以可重現的形式整理此過程並公開。我們希望證明四柱推命的解讀在不脫離傳統的前提下,也可成為學術驗證的對象。第三,v2 的改進將以階段性方式、無額外費用地提供給現有使用者。已經在使用 SajuAstrology 的朋友,無需重新購買,即可繼續使用升級後的引擎。",

    sec6Title: "從免費開始就已足夠。",
    sec6P1: "SajuAstrology的基本功能全部免費提供。請先試用。當結果真正讓您感到有所啟發時,再考慮付費解讀。付費解讀會在相同的輸入值之上,進行遠為深入的解讀層次。我們的原則很簡單:先給予信任,判斷交由使用者。",

    closing1: "宇宙不是混沌。是秩序。",
    closing2: "我們所做的,是建立一種能讀出那份秩序的語言。",
    closing3: "感謝您與我們同行。",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "返回SajuAstrology",

    altHero: "古代竹簡中升起的金色光粒形成星座的情景",
    altOrder: "無數金色光點中浮現出隱藏的幾何格紋",
    altGalton: "金色珠子形成完美常態分布的復古高爾頓板",
    altCaption: "高爾頓的梅花機 — 從混沌中顯現的秩序。",
    altSapling: "金色小樹苗與其身後巨大古樹的半透明輪廓",
    altQuestions: "廣闊星空下獨自佇立的人影與由星光繪成的東方哲學文字",
    altCosmos: "銀河與書法合為一體的宇宙景象 — 天人合一的意象",
  },

  ru: {
    eyebrow: "Письмо от Rimfactory",
    title: ["Это не ещё одно", "приложение для гаданий."],
    intro: "Здравствуйте. Мы — Rimfactory, команда за SajuAstrology. Спасибо всем, кто пользуется нашим сервисом. Позвольте нам кратко рассказать о том, что мы создаём, как и куда это движется.",

    sec1Title: "Мы не собирались создавать ещё одно приложение для гаданий.",
    sec1P1: "В XIX веке статистик Фрэнсис Гальтон разработал простое устройство. Бросьте сотни бусин через доску со штырьками, и каждая бусина отскочит случайным образом — однако распределение, накапливающееся внизу, всегда одна и та же колоколообразная кривая. Нормальное распределение. Двойной маятник теории хаоса говорит о том же. Движение, кажущееся непредсказуемым, на самом деле является продуктом строгих законов; законы просто слишком тонки, чтобы человеческое наблюдение могло следить за ними в реальном времени.",
    sec1P2: "Мы рассматриваем Саджу именно как такую область. Внутри небольшого ввода момента рождения человека находится паттерн, сформированный тысячелетиями статистической интуиции. Принимать или не принимать эту предпосылку — ваше собственное суждение. Что мы делаем — это переводим эту предпосылку в форму, которая воспроизводима и вычислима.",

    sec2Title: "Вот как работает наш движок на самом деле.",
    sec2P1: "Внутри SajuAstrology 562 интерпретативных отрывка, извлечённых из восточных классических источников, встроены в векторное пространство размерности 1 536. Характеристики вашего Саджу отображаются в том же пространстве в реальном времени. Ближайшие классические ссылки выбираются через косинусное сходство, затем перекрёстно проверяются двумя независимыми большими языковыми моделями и, наконец, синтезируются в чтение, которое вы видите. Каждый шаг выполняется поверх коррекции истинного солнечного времени (±15 минут).",
    sec2P2: "Если технические детали кажутся незнакомыми, это нормально. Суть лишь в одном: то, что мы вам передаём — не заготовленный заранее шаблон. Каждое чтение пересчитывается каждый раз на основе проверяемых источников.",

    sec3Title: "Мир открывает нас, тихо.",
    sec3P1: "В течение семи дней после запуска ChatGPT начал рекомендовать SajuAstrology как \"Best Overall\" во всей категории корейского Саджу. Мы потратили ноль на рекламу. Пользователи приходят органически из более чем 50 стран, и отклик на наш бесплатный сервис совместимости был особенно заметен.",
    sec3P2: "В ответ мы сейчас работаем над значительным обновлением движка совместимости. Новая версия будет выпущена в ближайшее время.",

    sec4Title: "То, что вы видите прямо сейчас — это v1.",
    sec4P1: "SajuAstrology, которым вы пользуетесь сегодня, работает на RimSaju Engine v1. v1 реализует основной вычислительный конвейер и скелет интерпретации — но это не конечная цель. Скажу прямо: есть проблемы, которые мы ещё не решили. Как систематически примирять различия между классическими школами. Как уменьшить интерпретативный дрейф в граничных условиях. Как количественно оценить и передать уверенность каждого утверждения. Это настоящие открытые инженерные вопросы — и мы занимаемся ими в RimSaju Engine v2.",

    sec5Title: "Что меняется в v2.",
    sec5P1: "v2 сводит интерпретации основных классических школ восточной теории судьбы в единый движок. Там, где школы расходятся, мы будем представлять оба прочтения прозрачно, чтобы пользователи могли видеть, что академически согласовано, а что остаётся в дискуссии. Серия обновлений движка улучшит воспроизводимость и согласованность в граничных случаях.",
    sec5P2: "По мере подготовки v2 мы планируем опубликовать три вещи. Во-первых, мы откроем исходный код наших критериев оценки и бенчмарков на GitHub. Любой сможет измерить свою собственную систему интерпретации Саджу по тем же критериям, и если кто-то получит более точные результаты, чем наши, мы будем учиться у этой работы. В этой области никогда не существовало академически проверяемого общего стандарта. Одна из вещей, которую мы намерены сделать — предложить первый проект такого стандарта. Во-вторых, мы планируем опубликовать нашу методологию и результаты проверки в формальной научной статье. Какие классические тексты послужили основой, как они были векторизованы и как движок обрабатывает различия в интерпретации между школами — мы задокументируем этот процесс в воспроизводимой форме и сделаем его публичным. Мы хотим показать, что интерпретация Саджу может быть предметом академической проверки, не отходя от своей традиции. В-третьих, улучшения v2 будут доставлены существующим пользователям поэтапно, без дополнительной платы. Те, кто уже использует SajuAstrology, просто продолжат работу с обновлённым движком — без необходимости повторной покупки.",

    sec6Title: "Начать бесплатно — этого достаточно.",
    sec6P1: "Все основные функции SajuAstrology бесплатны. Сначала воспользуйтесь ими. Когда результат действительно покажется вам проницательным, рассмотрите платное чтение. Платное чтение выполняет существенно более глубокий слой интерпретации на том же входе. Наша политика проста: сначала доверие, суждение остаётся за пользователем.",

    closing1: "Вселенная — не хаос. Это порядок.",
    closing2: "Что мы делаем — мы создаём язык, который читает этот порядок.",
    closing3: "Спасибо за то, что вы часть этого.",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "Вернуться в SajuAstrology",

    altHero: "Древний бамбуковый свиток, испускающий точки золотого света, образующие созвездие",
    altOrder: "Поле золотых точек, открывающее скрытую геометрическую решётку",
    altGalton: "Винтажная доска Гальтона — золотые бусины, образующие идеальное нормальное распределение",
    altCaption: "Квинкунс Гальтона — явление порядка из хаоса.",
    altSapling: "Маленький золотой росток под силуэтом огромного древнего дерева",
    altQuestions: "Одинокая фигура под звёздным небом, где звёзды образуют древние иероглифы",
    altCosmos: "Космический пейзаж, где каллиграфия и галактики сливаются — небо и человечество едины",
  },

  hi: {
    eyebrow: "Rimfactory का एक पत्र",
    title: ["एक और", "भविष्यवाणी ऐप नहीं।"],
    intro: "नमस्ते। हम Rimfactory हैं, SajuAstrology के पीछे की टीम। हमारी सेवा का उपयोग करने वाले सभी लोगों को धन्यवाद। हम संक्षेप में साझा करना चाहते हैं कि हम क्या बना रहे हैं, कैसे, और यह कहाँ जा रहा है।",

    sec1Title: "हमने एक और भविष्यवाणी ऐप बनाने का उद्देश्य नहीं रखा।",
    sec1P1: "19वीं शताब्दी में, सांख्यिकीविद फ्रांसिस गैल्टन ने एक सरल उपकरण बनाया। खूंटियों के एक बोर्ड से सैकड़ों मनके गिराएं, और हर मनका यादृच्छिक रूप से उछलता है — फिर भी नीचे जमा होने वाला वितरण हमेशा वही घंटी के आकार का वक्र होता है। सामान्य वितरण। अराजकता सिद्धांत का द्विदोल पेंडुलम भी यही कहता है। जो गति अप्रत्याशित लगती है, वास्तव में सख्त नियमों की उपज है; नियम बस इतने सूक्ष्म हैं कि मानव अवलोकन उन्हें वास्तविक समय में अनुसरण नहीं कर सकता।",
    sec1P2: "हम Saju को ठीक ऐसा ही क्षेत्र मानते हैं। एक व्यक्ति के जन्म क्षण के छोटे से इनपुट में हजारों वर्षों की सांख्यिकीय अंतर्दृष्टि द्वारा आकारित एक पैटर्न निहित है। इस पूर्वधारणा को स्वीकार करना या न करना आपका अपना निर्णय है। हम जो करते हैं वह इस पूर्वधारणा को एक ऐसे रूप में स्थानांतरित करना है जो पुनरुत्पादनीय और कम्प्यूटेबल हो।",

    sec2Title: "हमारा इंजन वास्तव में इस प्रकार काम करता है।",
    sec2P1: "SajuAstrology के भीतर, पूर्वी शास्त्रीय स्रोतों से निकाले गए 562 व्याख्यात्मक अंश 1,536-आयामी वेक्टर स्थान में एम्बेड किए गए हैं। आपकी Saju विशेषताएँ वास्तविक समय में उसी स्थान में मैप की जाती हैं। निकटतम शास्त्रीय संदर्भ कोसाइन समानता के माध्यम से चुने जाते हैं, फिर दो स्वतंत्र बड़े भाषा मॉडल द्वारा क्रॉस-सत्यापित किए जाते हैं, और अंत में आपके द्वारा देखे जाने वाले रीडिंग में संश्लेषित किए जाते हैं। हर चरण वास्तविक सौर-समय सुधार (±15 मिनट) के शीर्ष पर चलता है।",
    sec2P2: "यदि तकनीकी विवरण अपरिचित लगते हैं, तो यह ठीक है। मुख्य बात केवल यह है: जो हम आपको देते हैं वह पहले से तैयार टेम्पलेट नहीं है। हर रीडिंग हर बार सत्यापन योग्य स्रोतों के आधार पर पुनर्गणित की जाती है।",

    sec3Title: "दुनिया हमें चुपचाप खोज रही है।",
    sec3P1: "लॉन्च के सात दिनों के भीतर, ChatGPT ने कोरियाई Saju श्रेणी में SajuAstrology को \"Best Overall\" के रूप में अनुशंसा करना शुरू कर दिया। हमने विज्ञापन पर शून्य खर्च किया। 50 से अधिक देशों से उपयोगकर्ता व्यवस्थित रूप से आ रहे हैं, और हमारी मुफ्त अनुकूलता सेवा की प्रतिक्रिया विशेष रूप से उल्लेखनीय रही है।",
    sec3P2: "इसके जवाब में, हम वर्तमान में अनुकूलता इंजन का एक महत्वपूर्ण उन्नयन कर रहे हैं। एक नया संस्करण जल्द ही जारी किया जाएगा।",

    sec4Title: "आप अभी जो देख रहे हैं वह v1 है।",
    sec4P1: "आज आप जो SajuAstrology उपयोग करते हैं वह RimSaju Engine v1 पर चलता है। v1 मूल गणना पाइपलाइन और व्याख्या के कंकाल को लागू करता है — लेकिन यह अंतिम गंतव्य नहीं है। सीधे कहूं तो: ऐसी समस्याएँ हैं जिन्हें हमने अभी तक हल नहीं किया है। शास्त्रीय विद्यालयों के बीच के अंतरों को व्यवस्थित रूप से कैसे सामंजस्य किया जाए। सीमा स्थितियों में व्याख्यात्मक बहाव को कैसे कम किया जाए। प्रत्येक कथन के विश्वास को कैसे परिमाणित और संप्रेषित किया जाए। ये वास्तविक, खुले इंजीनियरिंग प्रश्न हैं — और हम इन्हें RimSaju Engine v2 में संबोधित कर रहे हैं।",

    sec5Title: "v2 में क्या बदलता है।",
    sec5P1: "v2 पूर्वी नियति सिद्धांत के प्रमुख शास्त्रीय विद्यालयों की व्याख्याओं को एक ही इंजन में समेकित करता है। जहाँ विद्यालय असहमत हैं, हम दोनों रीडिंग्स को पारदर्शी रूप से प्रस्तुत करेंगे, ताकि उपयोगकर्ता देख सकें कि क्या अकादमिक रूप से स्थापित है और क्या बहस में बना हुआ है। इंजन अद्यतनों की एक श्रृंखला पुनरुत्पादनीयता और सीमा मामलों में स्थिरता में सुधार करेगी।",
    sec5P2: "जैसे-जैसे v2 तैयार हो रहा है, हम तीन चीज़ें सार्वजनिक करने की योजना बना रहे हैं। पहला, हम अपने मूल्यांकन मानदंड और बेंचमार्क को GitHub पर ओपन-सोर्स करेंगे। कोई भी व्यक्ति उन्हीं मानकों पर अपनी Saju विश्लेषण प्रणाली को माप सकेगा, और यदि कोई हमसे अधिक सटीक परिणाम देता है, तो हम उस कार्य से सीखेंगे। इस क्षेत्र में अब तक कभी भी शैक्षणिक रूप से सत्यापन योग्य साझा मानक मौजूद नहीं रहा है। हम जो काम करना चाहते हैं, उनमें से एक है उस मानक का पहला मसौदा प्रस्तावित करना। दूसरा, हम अपनी कार्यप्रणाली और सत्यापन परिणामों को एक औपचारिक शोध-पत्र के रूप में प्रकाशित करने की योजना बना रहे हैं। कौन से शास्त्रीय ग्रंथ आधार बने, उन्हें किस प्रकार वेक्टराइज़ किया गया, और इंजन विभिन्न विचारधाराओं के बीच व्याख्यात्मक अंतर को कैसे संभालता है — हम इस प्रक्रिया को पुनरुत्पादनीय रूप में प्रलेखित करेंगे और सार्वजनिक करेंगे। हम यह दिखाना चाहते हैं कि Saju की व्याख्या अपनी परंपरा से दूर हुए बिना भी शैक्षणिक सत्यापन का विषय बन सकती है। तीसरा, v2 के सुधार मौजूदा उपयोगकर्ताओं को चरणबद्ध तरीके से, बिना किसी अतिरिक्त शुल्क के प्रदान किए जाएंगे। जो लोग पहले से ही SajuAstrology का उपयोग कर रहे हैं, वे बिना किसी पुनः खरीद के अद्यतन इंजन का उपयोग करते रहेंगे।",

    sec6Title: "मुफ्त से शुरू करना पर्याप्त है।",
    sec6P1: "SajuAstrology की सभी मुख्य विशेषताएँ मुफ्त हैं। पहले उनका उपयोग करें। जब कोई परिणाम आपको वास्तव में अंतर्दृष्टिपूर्ण लगे, तो एक भुगतान रीडिंग पर विचार करें। एक भुगतान रीडिंग उसी इनपुट पर व्याख्या की काफी गहरी परत का प्रदर्शन करती है। हमारी नीति सरल है: पहले विश्वास, निर्णय उपयोगकर्ता के पास रहता है।",

    closing1: "ब्रह्मांड अराजकता नहीं है। यह क्रम है।",
    closing2: "हम जो करते हैं वह उस क्रम को पढ़ने वाली भाषा बनाना है।",
    closing3: "इसका हिस्सा बनने के लिए धन्यवाद।",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "SajuAstrology पर वापस",

    altHero: "एक प्राचीन बांस स्क्रॉल जो सुनहरी रोशनी के बिंदु छोड़ता है जो एक नक्षत्र बनाते हैं",
    altOrder: "सुनहरे बिंदुओं का एक क्षेत्र जो एक छिपी हुई ज्यामितीय जाली को प्रकट करता है",
    altGalton: "एक विंटेज गैल्टन बोर्ड — सुनहरी मणियाँ एक सटीक सामान्य वितरण बना रही हैं",
    altCaption: "गैल्टन का क्विनकन्क्स — अराजकता से क्रम का उद्घाटन।",
    altSapling: "एक विशाल प्राचीन वृक्ष की छाया के नीचे एक छोटा सुनहरा पौधा",
    altQuestions: "तारों से भरे आकाश के नीचे एक अकेली आकृति जहाँ तारे प्राचीन अक्षर बनाते हैं",
    altCosmos: "एक ब्रह्मांडीय दृश्य जहाँ सुलेख और आकाशगंगाएँ विलीन होती हैं — स्वर्ग और मानवता एक के रूप में",
  },

  id: {
    eyebrow: "Surat dari Rimfactory",
    title: ["Bukan sekadar aplikasi", "ramalan lainnya."],
    intro: "Halo. Kami Rimfactory, tim di balik SajuAstrology. Terima kasih kepada semua yang menggunakan layanan kami. Izinkan kami berbagi secara singkat tentang apa yang kami bangun, bagaimana, dan ke mana arahnya.",

    sec1Title: "Kami tidak bermaksud membangun aplikasi ramalan lainnya.",
    sec1P1: "Pada abad ke-19, ahli statistik Francis Galton merancang perangkat sederhana. Jatuhkan ratusan manik-manik melalui papan berpasak, dan setiap manik akan memantul secara acak — namun distribusi yang terkumpul di bawah selalu merupakan kurva berbentuk lonceng yang sama. Distribusi normal. Pendulum ganda teori chaos mengatakan hal yang sama. Gerakan yang tampak tidak terprediksi, sebenarnya, adalah produk dari hukum yang ketat; hukum-hukum tersebut terlalu halus untuk diikuti oleh pengamatan manusia secara real-time.",
    sec1P2: "Kami melihat Saju tepat sebagai domain semacam itu. Dalam input kecil saat kelahiran seseorang terdapat pola yang dibentuk oleh ribuan tahun intuisi statistik. Menerima atau tidak premis itu adalah penilaian Anda sendiri. Yang kami lakukan adalah memindahkan premis itu ke dalam bentuk yang dapat direproduksi dan dapat dihitung.",

    sec2Title: "Inilah cara mesin kami sebenarnya bekerja.",
    sec2P1: "Di dalam SajuAstrology, 562 bagian interpretatif yang diekstrak dari sumber klasik Timur tertanam dalam ruang vektor 1.536 dimensi. Karakteristik Saju Anda dipetakan ke dalam ruang yang sama secara real-time. Referensi klasik terdekat dipilih melalui kesamaan kosinus, kemudian diverifikasi silang oleh dua model bahasa besar independen, dan akhirnya disintesis menjadi bacaan yang Anda lihat. Setiap langkah berjalan di atas koreksi waktu matahari sejati (±15 menit).",
    sec2P2: "Jika detail teknis terasa asing, tidak masalah. Intinya hanya ini: yang kami serahkan kepada Anda bukanlah template yang sudah disiapkan. Setiap bacaan dihitung ulang, setiap kali, berdasarkan sumber yang dapat diverifikasi.",

    sec3Title: "Dunia sedang menemukan kami, dengan tenang.",
    sec3P1: "Dalam tujuh hari setelah peluncuran, ChatGPT mulai merekomendasikan SajuAstrology sebagai \"Best Overall\" di seluruh kategori Saju Korea. Kami mengeluarkan nol untuk iklan. Pengguna datang secara organik dari lebih dari 50 negara, dan respons terhadap layanan Kompatibilitas gratis kami sangat menonjol.",
    sec3P2: "Sebagai tanggapan, kami saat ini sedang mengerjakan peningkatan signifikan pada mesin Kompatibilitas. Versi baru akan dirilis segera.",

    sec4Title: "Yang Anda lihat sekarang adalah v1.",
    sec4P1: "SajuAstrology yang Anda gunakan hari ini berjalan pada RimSaju Engine v1. v1 mengimplementasikan pipeline perhitungan inti dan kerangka interpretasi — tetapi ini bukan tujuan akhir. Jujur saja: ada masalah yang belum kami pecahkan. Bagaimana mendamaikan secara sistematis perbedaan antar mazhab klasik. Bagaimana mengurangi pergeseran interpretatif pada kondisi batas. Bagaimana menghitung dan mengkomunikasikan kepercayaan setiap pernyataan. Ini adalah pertanyaan teknik nyata dan terbuka — dan kami menanganinya di RimSaju Engine v2.",

    sec5Title: "Apa yang berubah di v2.",
    sec5P1: "v2 menggabungkan interpretasi mazhab klasik utama teori takdir Timur menjadi satu mesin. Di mana mazhab tidak setuju, kami akan menyajikan kedua bacaan secara transparan, sehingga pengguna dapat melihat apa yang telah disepakati secara akademis dan apa yang masih dalam perdebatan. Serangkaian pembaruan mesin akan meningkatkan reproduktifitas dan konsistensi dalam kasus batas.",
    sec5P2: "Seiring dengan persiapan v2, kami berencana mempublikasikan tiga hal. Pertama, kami akan membuka kode sumber kriteria evaluasi dan benchmark kami di GitHub. Siapa pun akan dapat mengukur sistem interpretasi Saju mereka sendiri berdasarkan standar yang sama, dan jika ada yang menghasilkan hasil lebih akurat dari kami, kami akan belajar dari karya tersebut. Sebuah standar bersama yang dapat diverifikasi secara akademis belum pernah ada di bidang ini. Salah satu hal yang ingin kami lakukan adalah mengusulkan draf awal dari standar tersebut. Kedua, kami berencana mempublikasikan metodologi dan hasil validasi kami dalam makalah formal. Teks klasik mana yang menjadi dasar, bagaimana teks-teks tersebut divektorisasi, dan bagaimana mesin kami menangani perbedaan interpretasi antar mazhab — kami akan mendokumentasikan proses ini dalam bentuk yang dapat direproduksi dan mempublikasikannya. Kami ingin menunjukkan bahwa interpretasi Saju dapat menjadi subjek verifikasi akademis tanpa meninggalkan tradisinya. Ketiga, peningkatan v2 akan diberikan kepada pengguna yang sudah ada secara bertahap, tanpa biaya tambahan. Mereka yang sudah menggunakan SajuAstrology akan langsung melanjutkan dengan mesin yang diperbarui — tanpa perlu membeli ulang.",

    sec6Title: "Mulai gratis sudah cukup.",
    sec6P1: "Semua fitur inti SajuAstrology gratis. Gunakan terlebih dahulu. Saat suatu hasil terasa benar-benar mencerahkan bagi Anda, pertimbangkan bacaan berbayar. Bacaan berbayar melakukan lapisan interpretasi yang jauh lebih dalam pada input yang sama. Kebijakan kami sederhana: kepercayaan dulu, penilaian tetap pada pengguna.",

    closing1: "Alam semesta bukanlah kekacauan. Itu adalah keteraturan.",
    closing2: "Yang kami lakukan adalah membangun bahasa yang membaca keteraturan itu.",
    closing3: "Terima kasih telah menjadi bagian dari ini.",

    sigLabel: "Rimfactory · SajuAstrology",
    backHome: "Kembali ke SajuAstrology",

    altHero: "Gulungan bambu kuno yang melepaskan titik-titik cahaya emas yang membentuk konstelasi",
    altOrder: "Bidang titik-titik emas yang mengungkapkan kisi geometris tersembunyi",
    altGalton: "Papan Galton antik — manik-manik emas membentuk distribusi normal yang sempurna",
    altCaption: "Quincunx Galton — pengungkapan keteraturan dari kekacauan.",
    altSapling: "Sebuah tunas emas kecil di bawah siluet pohon kuno yang luas",
    altQuestions: "Sosok soliter di bawah langit berbintang di mana bintang-bintang membentuk aksara kuno",
    altCosmos: "Pemandangan kosmis di mana kaligrafi dan galaksi menyatu — surga dan kemanusiaan sebagai satu",
  },
}

export default function LetterClient() {
  const { locale } = useLanguage()
  // Map locale string from context to copy key (zh-TW → zhTW, pt-BR → pt, es-ES → es etc.)
  const localeKey = (() => {
    const l = locale.toLowerCase()
    if (l === "zh-tw" || l === "zhtw") return "zhTW"
    if (l.startsWith("es")) return "es"
    if (l.startsWith("fr")) return "fr"
    if (l.startsWith("pt")) return "pt"
    if (l.startsWith("ru")) return "ru"
    if (l.startsWith("hi")) return "hi"
    if (l.startsWith("id")) return "id"
    if (l.startsWith("ko")) return "ko"
    if (l.startsWith("ja")) return "ja"
    return "en"
  })() as Locale
  const c = copy[localeKey] || copy.en

  // Shared fade-up animation
  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6, ease: "easeOut" as const },
  }

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-background text-foreground overflow-hidden">

        {/* Subtle ambient star field — pure CSS, zero cost */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.18) 0%, transparent 100%), radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.14) 0%, transparent 100%), radial-gradient(1px 1px at 40% 8%, rgba(255,255,255,0.16) 0%, transparent 100%), radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.18) 0%, transparent 100%), radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.14) 0%, transparent 100%), radial-gradient(1px 1px at 15% 65%, rgba(255,255,255,0.12) 0%, transparent 100%), radial-gradient(1px 1px at 90% 75%, rgba(255,255,255,0.16) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 20% 50%, rgba(212,168,83,0.25) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 65% 30%, rgba(212,168,83,0.25) 0%, transparent 100%)"
          }} />
        </div>

        {/* ══════════════════════════════════════════════════════════
            HERO
            ══════════════════════════════════════════════════════════ */}
        <section className="relative w-full pt-page">
          <div className="relative w-full aspect-[16/10] sm:aspect-[21/10] max-h-[78vh] overflow-hidden">
            <img
              src="/letter/letter-01-hero.webp"
              alt={c.altHero}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-end sm:items-center justify-center">
              <div className="w-full max-w-4xl px-5 sm:px-8 pb-10 sm:pb-0 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <span className="inline-block px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary border border-primary/30 rounded-full backdrop-blur-sm bg-black/20">
                    {c.eyebrow}
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.35 }}
                  className="mt-4 sm:mt-6 font-serif text-[1.6rem] xs:text-[1.85rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.2] text-balance"
                >
                  {c.title.map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </motion.h1>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            ARTICLE BODY
            ══════════════════════════════════════════════════════════ */}
        <article className="relative z-10">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-8">

            {/* Intro */}
            <motion.div {...fadeUp}>
              <p className="font-serif text-lg sm:text-xl md:text-2xl text-foreground leading-[1.85] text-pretty">
                {c.intro}
              </p>
            </motion.div>

            {/* Section 1 — Not another fortune-telling app */}
            <motion.h2 {...fadeUp} className="mt-14 sm:mt-20 font-serif text-xl sm:text-2xl md:text-3xl text-foreground leading-tight">
              {c.sec1Title}
            </motion.h2>
            <motion.div {...fadeUp} className="mt-6">
              <p className="text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec1P1}
              </p>
              <p className="mt-5 text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec1P2}
              </p>
            </motion.div>

            {/* Image — hidden order */}
            <motion.figure {...fadeUp} className="mt-10 sm:mt-14 -mx-5 sm:mx-0">
              <img
                src="/letter/letter-02-order.webp"
                alt={c.altOrder}
                className="w-full aspect-[16/9] object-cover sm:rounded-2xl"
                loading="lazy"
              />
            </motion.figure>

            {/* Image — Galton (signature) */}
            <motion.figure {...fadeUp} className="mt-10 sm:mt-14 -mx-5 sm:mx-0">
              <img
                src="/letter/letter-03-galton.webp"
                alt={c.altGalton}
                className="w-full aspect-[16/9] object-cover sm:rounded-2xl"
                loading="lazy"
              />
              <figcaption className="mt-3 text-center text-xs sm:text-sm text-muted-foreground/70 italic px-4">
                {c.altCaption}
              </figcaption>
            </motion.figure>

            {/* Section 2 — How the engine works */}
            <motion.h2 {...fadeUp} className="mt-14 sm:mt-20 font-serif text-xl sm:text-2xl md:text-3xl text-foreground leading-tight">
              {c.sec2Title}
            </motion.h2>
            <motion.div {...fadeUp} className="mt-6">
              <p className="text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec2P1}
              </p>
              <p className="mt-5 text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec2P2}
              </p>
            </motion.div>

            {/* Section 3 — World is discovering us */}
            <motion.h2 {...fadeUp} className="mt-14 sm:mt-20 font-serif text-xl sm:text-2xl md:text-3xl text-foreground leading-tight">
              {c.sec3Title}
            </motion.h2>
            <motion.div {...fadeUp} className="mt-6">
              <p className="text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec3P1}
              </p>
              <p className="mt-5 text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec3P2}
              </p>
            </motion.div>

            {/* Image — Sapling (v1 → v2 bridge) */}
            <motion.figure {...fadeUp} className="mt-12 sm:mt-16 -mx-5 sm:mx-0">
              <img
                src="/letter/letter-04-sapling.webp"
                alt={c.altSapling}
                className="w-full aspect-[16/9] object-cover sm:rounded-2xl"
                loading="lazy"
              />
            </motion.figure>

            {/* Section 4 — This is v1 */}
            <motion.h2 {...fadeUp} className="mt-10 sm:mt-14 font-serif text-xl sm:text-2xl md:text-3xl text-foreground leading-tight">
              {c.sec4Title}
            </motion.h2>
            <motion.div {...fadeUp} className="mt-6">
              <p className="text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec4P1}
              </p>
            </motion.div>

            {/* Section 5 — v2 */}
            <motion.h2 {...fadeUp} className="mt-14 sm:mt-20 font-serif text-xl sm:text-2xl md:text-3xl text-foreground leading-tight">
              {c.sec5Title}
            </motion.h2>
            <motion.div {...fadeUp} className="mt-6">
              <p className="text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec5P1}
              </p>
              <p className="mt-5 text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec5P2}
              </p>
            </motion.div>

            {/* Image — questions */}
            <motion.figure {...fadeUp} className="mt-12 sm:mt-16 -mx-5 sm:mx-0">
              <img
                src="/letter/letter-08-questions.webp"
                alt={c.altQuestions}
                className="w-full aspect-[16/9] object-cover sm:rounded-2xl"
                loading="lazy"
              />
            </motion.figure>

            {/* Section 6 — Starting free */}
            <motion.h2 {...fadeUp} className="mt-14 sm:mt-20 font-serif text-xl sm:text-2xl md:text-3xl text-foreground leading-tight">
              {c.sec6Title}
            </motion.h2>
            <motion.div {...fadeUp} className="mt-6">
              <p className="text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty">
                {c.sec6P1}
              </p>
            </motion.div>

            {/* Closing pull quote */}
            <motion.div {...fadeUp} className="mt-14 sm:mt-20 text-center">
              <blockquote>
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground leading-[1.35] text-balance">
                  {c.closing1}
                </p>
                <p className="mt-5 font-serif text-lg sm:text-xl md:text-2xl text-primary leading-[1.5] text-balance">
                  {c.closing2}
                </p>
              </blockquote>
            </motion.div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              CLOSING IMAGE — full-bleed cinematic
              ══════════════════════════════════════════════════════════ */}
          <motion.figure {...fadeUp} className="mt-14 sm:mt-20">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[70vh] overflow-hidden">
              <img
                src="/letter/letter-09-cosmos.webp"
                alt={c.altCosmos}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
            </div>
          </motion.figure>

          {/* Thank you + signature */}
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-20">
            <motion.div {...fadeUp}>
              <p className="text-[15px] sm:text-base md:text-lg text-muted-foreground leading-[1.95] text-pretty text-center">
                {c.closing3}
              </p>
            </motion.div>

            {/* Signature */}
            <motion.div {...fadeUp} className="mt-12 sm:mt-16 text-center">
              <img
                src="/letter/chandler-signature.webp"
                alt="Signature"
                className="h-14 sm:h-16 md:h-20 w-auto mx-auto opacity-90"
                loading="lazy"
              />
              <p className="mt-4 text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {c.sigLabel}
              </p>
            </motion.div>

            {/* Back to home */}
            <motion.div {...fadeUp} className="mt-14 sm:mt-20 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary border border-primary/40 rounded-full hover:bg-primary/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {c.backHome}
              </Link>
            </motion.div>
          </div>
        </article>

        <Footer />
      </main>
    </>
  )
}
