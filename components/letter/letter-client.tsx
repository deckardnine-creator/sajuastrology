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
//  - Trilingual via useLanguage (EN / KO / JA)
//  - 6 illustrations + signature, all under 260KB each
// =============================================================

type Locale = "en" | "ko" | "ja"

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
    sec3P1: "Within seven days of launch, ChatGPT began recommending SajuAstrology as \"Best Overall\" across the Korean Saju category. We spent zero on advertising. Users are arriving organically from more than 12 countries, and the response to our free Compatibility service has been particularly notable.",
    sec3P2: "In response, we are currently working on a significant upgrade to the Compatibility engine. A new version will be released shortly.",

    sec4Title: "What you are seeing right now is v1.",
    sec4P1: "The SajuAstrology you use today runs on RimSaju Engine v1. v1 implements the core calculation pipeline and the skeleton of interpretation — but it is not the final destination. To be direct: there are problems we have not yet solved. How to systematically reconcile differences between classical schools. How to reduce interpretive drift at boundary conditions. How to quantify and communicate the confidence of each statement. These are real, open engineering questions — and we are addressing them in RimSaju Engine v2.",

    sec5Title: "What changes in v2.",
    sec5P1: "v2 converges the interpretations of the major classical schools of Eastern destiny theory into a single engine. Where schools disagree, we will present both readings transparently, so users can see what is academically settled and what remains in debate. A series of engine updates will improve reproducibility and consistency in edge cases.",
    sec5P2: "In parallel with v2, we plan to do three things. First, publish our evaluation criteria and benchmarks as open source on GitHub, so anyone can measure their own Saju engine against the same yardstick — and if a system outperforms ours, we will learn from it. Second, submit our methodology and verification results for formal academic publication. Third, roll v2 improvements out to existing users in stages. This field has never had a commonly agreed, academically verifiable standard. Part of what we intend to do is propose the first draft of one.",

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
    sec3P1: "출시 후 7일 이내에, ChatGPT는 한국 사주 분야 전반에서 SajuAstrology를 \"Best Overall\"로 추천하기 시작했습니다. 광고비는 한 푼도 집행되지 않았습니다. 현재 12개국 이상에서 사용자들이 자발적으로 유입되고 있으며, 그중에서도 무료 궁합 서비스의 호응이 유독 두드러집니다.",
    sec3P2: "이 호응에 응답하기 위해, 저희는 현재 궁합 기능의 대규모 개선 작업을 진행하고 있습니다. 새로운 버전은 조만간 공개될 예정입니다.",

    sec4Title: "지금 여러분이 보고 계신 것은 v1입니다.",
    sec4P1: "현재 서비스되고 있는 SajuAstrology는 RimSaju 엔진 v1 위에서 동작합니다. v1은 기본적인 계산 파이프라인과 해석의 뼈대를 구현한 단계이며, 저희가 궁극적으로 도달하려는 지점은 아닙니다. 사실대로 말씀드리자면, 저희가 아직 풀지 못한 과제들이 있습니다. 학파 간 해석의 이견을 어떻게 체계적으로 조율할지, 경계 조건에서 발생하는 해석의 불일치를 어떻게 줄일지, 그리고 각 해석의 신뢰도를 어떻게 정량화해서 사용자에게 전달할지 — 이런 문제들입니다. 저희는 이 과제들을 RimSaju 엔진 v2에서 다룹니다.",

    sec5Title: "v2에서 달라지는 것.",
    sec5P1: "v2에서는 동양 명리학의 주요 학파별 해석을 하나의 엔진 안에 수렴시킵니다. 학파가 충돌하는 지점에서는 이를 숨기지 않고 병기하여, 사용자가 학술적으로 무엇이 합의되어 있고 무엇이 논쟁 중인지 투명하게 볼 수 있도록 할 것입니다. 또한 해석의 재현성과 경계 사례에서의 일관성을 개선하기 위한 일련의 엔진 업데이트가 포함됩니다.",
    sec5P2: "v2가 준비되는 과정에서 저희는 세 가지를 공개할 계획입니다. 첫째, 평가 기준과 벤치마크를 GitHub에 오픈소스로 공개합니다. 누구든지 동일한 기준 위에서 자신의 사주 해석 시스템을 측정할 수 있고, 저희보다 정확한 결과를 내는 작업이 있다면 저희는 그것으로부터 배울 것입니다. 둘째, 저희의 방법론과 검증 결과를 정식 논문으로 발표할 계획입니다. 셋째, v2의 개선 내역은 기존 사용자에게 단계적으로 반영됩니다. 이 분야에 학술적으로 검증 가능한 공통 기준이 존재한 적은 지금까지 없었습니다. 저희가 하고자 하는 일 중 하나는 그 기준의 초안을 제안하는 것입니다.",

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
    sec3P1: "リリース後わずか7日のうちに、ChatGPTが韓国四柱推命分野全般でSajuAstrologyを「Best Overall」として推薦し始めました。広告費は一切使っていません。現在、12か国以上から自発的にユーザーが訪れており、中でも無料相性サービスへの反響は際立っています。",
    sec3P2: "この反響に応えるため、私たちは現在、相性機能の大規模な改善作業を進めています。新しいバージョンは近日中に公開される予定です。",

    sec4Title: "今ご覧いただいているのはv1です。",
    sec4P1: "現在提供されているSajuAstrologyは、RimSajuエンジンv1の上で動作しています。v1は基本的な計算パイプラインと解釈の骨組みを実装した段階であり、私たちが最終的に到達しようとしている地点ではありません。率直に申し上げると、まだ解決できていない課題があります。学派間の解釈の相違をどのように体系的に調和させるか、境界条件で生じる解釈のずれをどのように減らすか、そして各解釈の信頼度をどのように定量化してユーザーに伝えるか — こうした問題です。これらの課題を、私たちはRimSajuエンジンv2で扱います。",

    sec5Title: "v2で変わること。",
    sec5P1: "v2では、東洋命理学の主要な学派別解釈を一つのエンジン内に統合します。学派が衝突する箇所ではこれを隠さず両論併記し、ユーザーが学術的に何が合意されていて何が論争中なのかを透明に見られるようにします。また、解釈の再現性と境界事例における一貫性を改善するための一連のエンジン更新が含まれます。",
    sec5P2: "v2の準備に並行して、私たちは三つのことを公開する計画です。第一に、評価基準とベンチマークをGitHubにオープンソースとして公開します。誰もが同じ基準の上で自身の四柱推命解釈システムを測定でき、私たちより正確な結果を出す作業があれば、私たちはそれから学ぶでしょう。第二に、私たちの方法論と検証結果を正式な論文として発表する計画です。第三に、v2の改善内容は既存ユーザーに段階的に反映されます。この分野に学術的に検証可能な共通基準が存在したことは、これまでにありません。私たちがしようとしていることの一つは、その基準の初稿を提案することです。",

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
}

export default function LetterClient() {
  const { locale } = useLanguage()
  const c = copy[locale as Locale] || copy.en

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
