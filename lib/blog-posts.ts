// Blog post data for SEO — targeting astrology/divination search queries
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  keywords: string[];
  locale: "en" | "ko" | "ja";
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-is-saju-korean-astrology",
    title: "What Is Saju? The Korean Astrology System That Makes Western Zodiac Look Like a Toy",
    description: "Saju (사주) uses your exact birth year, month, day, and hour to create 518,400 unique profiles. Learn how this ancient Korean system works and why it's more precise than Western astrology.",
    date: "2026-04-04",
    readTime: "8 min",
    category: "Guide",
    locale: "en",
    keywords: ["saju", "korean astrology", "four pillars of destiny", "사주", "what is saju"],
    content: `# What Is Saju? The Korean Astrology System That Makes Western Zodiac Look Like a Toy

You know your zodiac sign. Maybe you're a Scorpio, a Gemini, or a Capricorn. But here's the thing — that puts you in the same bucket as roughly 600 million other people on Earth.

**Saju does something radically different.**

## The Basics: Four Pillars, Eight Characters

Saju (사주, literally "four pillars") is a system that has guided life decisions across Korea, China, and Japan for over a thousand years. It's also known as the **Four Pillars of Destiny** or by its Chinese name, Bazi (八字).

Instead of using just your birth month like Western astrology, Saju uses four data points:

- **Year Pillar** — your generation energy and relationship with society
- **Month Pillar** — your career tendencies and public persona  
- **Day Pillar** — your core self and romantic nature (this is your "Day Master")
- **Hour Pillar** — your inner world and legacy

Each pillar has two characters — a **Heavenly Stem** and an **Earthly Branch** — giving you eight characters total. That's where the Chinese name "Bazi" (eight characters) comes from.

## Why 518,400 Profiles?

The math is elegant. There are 60 possible Stem-Branch combinations (the "Sexagenary Cycle"), and four pillars to fill. But because the pillars are astronomically constrained, the realistic number of unique charts is **518,400**. Compare that to Western astrology's 12 types.

## The Five Elements

Everything in Saju maps to five cosmic forces: **Wood, Fire, Earth, Metal, and Water**. These aren't just labels — they describe how energy moves in your life:

- **Wood** — growth, creativity, expansion
- **Fire** — passion, visibility, action
- **Earth** — stability, nurturing, grounding
- **Metal** — precision, discipline, clarity
- **Water** — wisdom, adaptability, flow

The balance of these elements in your chart determines your personality, natural talents, relationship patterns, and even your health tendencies.

## Your Day Master: The Core of Who You Are

The Heavenly Stem on your Day Pillar is called your **Day Master** (일주, 日主). It's the single most important character in your chart — like your sun sign in Western astrology, but far more specific.

There are 10 possible Day Masters, each with a distinct personality signature. A Yang Wood person leads like a towering oak tree. A Yin Water person adapts like morning dew. Knowing your Day Master is the first step to understanding your Saju chart.

## How Is This Different from Western Astrology?

| Feature | Western Astrology | Saju |
|---------|------------------|------|
| Unique profiles | 12 | 518,400 |
| Data used | Birth month | Year + Month + Day + Hour |
| Time precision | None | True Solar Time from birth city |
| Forecasting | Monthly horoscopes | Year-by-year and day-by-day |
| System age | ~2,000 years | ~1,000+ years |

## Why People Are Discovering Saju Now

K-culture has brought Korean food, music, and drama to the world. Now it's bringing Korean wisdom. In Korea, Saju isn't considered "fortune telling" — it's a legitimate decision-making framework. Business executives consult Saju masters before major deals. Couples check their compatibility charts before marriage.

The difference is that Saju doesn't just tell you *who you are*. It tells you **when to act** — which years favor bold moves, which months to be cautious, and which relationships will challenge or support your growth.

## Try It Yourself

The best way to understand Saju is to see your own chart. Enter your birth details and get your free reading in 30 seconds — no sign-up required.`,
  },
  {
    slug: "saju-vs-western-astrology",
    locale: "en",
    title: "Saju vs Western Astrology: 518,400 Types vs 12 — Which Is More Accurate?",
    description: "A detailed comparison of Korean Saju (Four Pillars) and Western zodiac astrology. Learn why Saju's 518,400 unique profiles offer deeper personality insights than the 12 zodiac signs.",
    date: "2026-04-04",
    readTime: "6 min",
    category: "Comparison",
    keywords: ["saju vs astrology", "four pillars vs zodiac", "korean astrology accuracy", "bazi vs horoscope"],
    content: `# Saju vs Western Astrology: 518,400 Types vs 12

If you've ever felt that your zodiac horoscope was too generic — "Leos are confident leaders" — you're not alone. Millions of people share your exact sign. Saju offers something radically more personal.

## The Precision Gap

Western astrology divides humanity into **12 sun signs** based on birth month. Saju divides humanity into **518,400 unique profiles** based on birth year, month, day, and hour.

That's not a small difference. It's the difference between a blood type test and a full DNA sequence.

## What Saju Captures That Western Astrology Misses

**Birth hour matters.** Someone born at 3 AM has completely different Hour Pillar energy than someone born at 3 PM — even on the same day. Western astrology ignores this entirely (unless you go deep into natal chart calculations).

**True Solar Time.** Saju adjusts for your birth city's longitude, calculating the actual solar position at your birth moment. Born in Seoul vs. New York? Even at the same clock time, your chart is different.

**Element interactions.** Your five elements don't just sit there — they generate, control, and clash with each other in specific patterns that reveal relationship dynamics, career aptitudes, and health vulnerabilities.

## Where Western Astrology Wins

Western astrology has one major advantage: **cultural familiarity**. Everyone knows their zodiac sign. It's an instant conversation starter. Saju requires a bit more explanation — but the payoff is exponentially deeper insight.

## The Bottom Line

Western astrology tells you what month you were born. Saju tells you who you actually are, what you're built for, and when your best opportunities will arrive. Once you see your Four Pillars chart, your zodiac sign starts to feel like a rough sketch compared to a detailed portrait.`,
  },
  {
    slug: "five-elements-personality-guide",
    locale: "en",
    title: "The Five Elements Personality Guide: Wood, Fire, Earth, Metal & Water in Your Birth Chart",
    description: "Discover how the Five Elements (Wood, Fire, Earth, Metal, Water) shape your personality, career path, and relationships in Saju and Bazi astrology.",
    date: "2026-04-04",
    readTime: "7 min",
    category: "Guide",
    keywords: ["five elements personality", "wood fire earth metal water", "saju elements", "bazi five elements", "chinese astrology elements"],
    content: `# The Five Elements Personality Guide

In Saju (Korean Four Pillars astrology), everything maps to five cosmic forces. These aren't just abstract concepts — they're the building blocks of your personality, the engine of your relationships, and the key to understanding your life patterns.

## Wood 木 — The Creator

**Personality:** Growth-oriented, creative, visionary. Wood people are natural planners who see the big picture. Like a tree, they grow steadily upward, branching into new ideas.

**Career strengths:** Education, writing, design, environmental science, startups, urban planning.

**In relationships:** Nurturing and expansive. They help their partners grow — sometimes to the point of neglecting their own needs.

**Health focus:** Liver, gallbladder, eyes, tendons. Wood people benefit from green vegetables and outdoor time.

## Fire 火 — The Performer

**Personality:** Passionate, charismatic, action-driven. Fire people light up any room. They're natural leaders who inspire others through sheer energy and enthusiasm.

**Career strengths:** Entertainment, marketing, public speaking, technology, restaurants, media.

**In relationships:** Intense and warm. They love deeply but can burn hot and fast. They need partners who can handle their intensity without being consumed by it.

**Health focus:** Heart, circulation, small intestine. Fire types should manage stress and avoid overstimulation.

## Earth 土 — The Anchor

**Personality:** Stable, trustworthy, practical. Earth people are the ones everyone leans on. They're natural mediators who bring harmony to chaotic situations.

**Career strengths:** Real estate, finance, HR, agriculture, counseling, construction.

**In relationships:** Loyal and grounding. They create safe spaces for their partners. Their challenge is avoiding stagnation — they sometimes stay in comfortable situations too long.

**Health focus:** Stomach, spleen, muscles. Earth types need regular meals and digestive care.

## Metal 金 — The Strategist

**Personality:** Precise, disciplined, principled. Metal people cut through confusion with clarity. They have strong values and high standards — for themselves and others.

**Career strengths:** Law, engineering, surgery, military, luxury goods, technology, accounting.

**In relationships:** Devoted but exacting. They show love through reliability and structure. Their challenge is flexibility — they can be rigid when situations call for adaptation.

**Health focus:** Lungs, skin, large intestine. Metal types benefit from breathing exercises and skincare routines.

## Water 水 — The Philosopher

**Personality:** Wise, adaptable, intuitive. Water people flow around obstacles rather than fighting them. They're natural diplomats and deep thinkers.

**Career strengths:** Research, academia, trading, logistics, travel, psychology, technology.

**In relationships:** Deeply empathetic but sometimes elusive. They understand their partners intuitively but can struggle with directness. They need emotional depth in their connections.

**Health focus:** Kidneys, bladder, bones, ears. Water types should stay hydrated and protect their lower back.

## Your Element Balance

Most people aren't just one element — your birth chart contains all five in varying proportions. The key is understanding which elements are dominant, which are weak, and how they interact.

When your elements are balanced, life flows naturally. When they're imbalanced, you experience the friction — in your career, relationships, or health — that drives you to seek answers.

Discover your personal element balance by entering your birth details for a free Saju reading.`,
  },
  {
    slug: "day-master-meaning-saju",
    locale: "en",
    title: "Your Day Master: The Most Important Character in Your Saju Birth Chart",
    description: "Learn what your Day Master (일주) means in Korean Four Pillars astrology. The 10 Day Masters explained — from Yang Wood to Yin Water.",
    date: "2026-04-03",
    readTime: "6 min",
    category: "Guide",
    keywords: ["day master saju", "ilju meaning", "four pillars day master", "bazi day master", "10 heavenly stems"],
    content: `# Your Day Master: The Most Important Character in Your Birth Chart

If you could know only one thing about your Saju chart, it should be your **Day Master** (일주, 日主). It's the Heavenly Stem sitting on your Day Pillar — and it defines the core of who you are.

Think of it as your elemental DNA. While your full chart has eight characters interacting in complex ways, your Day Master is the protagonist of the story.

## The 10 Day Masters

There are 10 Heavenly Stems, each combining an element with Yin or Yang polarity:

**Yang Wood (甲, 갑)** — The towering oak. Natural leaders with strong convictions. They stand tall and protect others but can be inflexible.

**Yin Wood (乙, 을)** — The vine. Flexible, adaptable, graceful. They find a way to grow around any obstacle, but can be indecisive.

**Yang Fire (丙, 병)** — The sun. Warm, generous, universally loved. They illuminate everything around them but can't hide their emotions.

**Yin Fire (丁, 정)** — The candle flame. Focused, intimate, romantic. They provide warmth to those close to them but can flicker under pressure.

**Yang Earth (戊, 무)** — The mountain. Massive, reliable, immovable. They're the people everyone trusts, but they can be stubborn beyond reason.

**Yin Earth (己, 기)** — The fertile field. Nurturing, productive, supportive. They help everything around them grow, sometimes at the cost of their own identity.

**Yang Metal (庚, 경)** — The sword. Sharp, decisive, fearless. They cut through problems with precision but can wound people unintentionally with their directness.

**Yin Metal (辛, 신)** — The jewel. Refined, beautiful, perfectionist. They have impeccable taste and standards but can be overly self-critical.

**Yang Water (壬, 임)** — The ocean. Vast, powerful, unstoppable. They're deep thinkers with endless capacity, but can overwhelm others with their intensity.

**Yin Water (癸, 계)** — The morning dew. Gentle, perceptive, quietly transformative. They notice what everyone else misses but can evaporate under too much heat.

## Why Your Day Master Matters

Your Day Master determines:
- **How you love** — each element expresses and receives love differently
- **What career suits you** — your natural working style and professional energy
- **Which people complement you** — element harmony in relationships
- **When to act** — certain years amplify your Day Master's strengths

## Beyond Just Your Day Master

Your Day Master is the starting point, not the full picture. How it interacts with the other seven characters in your chart creates the nuance — your unique pattern of strengths, challenges, and timing.

Find out your Day Master and full Four Pillars chart with a free reading.`,
  },
  {
    slug: "free-birth-chart-reading-saju",
    locale: "en",
    title: "Free Birth Chart Reading: Get Your Korean Four Pillars Chart in 30 Seconds",
    description: "Get a free, personalized Saju birth chart reading. Enter your birth date, time, and city — see your Four Pillars, Day Master, Five Elements balance, and fortune forecast instantly.",
    date: "2026-04-03",
    readTime: "4 min",
    category: "How-To",
    keywords: ["free birth chart reading", "free astrology reading", "saju reading free", "four pillars calculator", "bazi calculator free", "birth chart calculator"],
    content: `# Free Birth Chart Reading: Your Korean Four Pillars in 30 Seconds

Most astrology sites ask you to sign up, give your email, and wait for a generic horoscope. We do things differently.

## What You Get — For Free

Enter your birth date, time, and city. In 30 seconds, you'll receive:

**Your Four Pillars Chart** — the eight characters that form your cosmic DNA, calculated with True Solar Time from your birth city's longitude.

**Your Day Master** — the core element that defines who you are. Are you a towering Yang Wood or a gentle Yin Water?

**Five Elements Balance** — a visual chart showing how Wood, Fire, Earth, Metal, and Water distribute in your birth chart. See which elements are dominant and which need strengthening.

**This Year's Fortune Overview** — what the current year's energy means for someone with your specific chart.

**Cosmic Harmony Score** — how balanced your overall chart is, with specific insights about your strengths and growth areas.

**Personalized Daily Fortune** — once you sign in (free), your dashboard shows daily guidance based on your Day Master and that day's cosmic energy.

## How It Works

1. **Enter your birth details** — date, time (approximate is fine), and city
2. **We calculate True Solar Time** — adjusting for your birth city's exact longitude
3. **Our AI engine analyzes your chart** — combining traditional Saju principles with modern interpretation
4. **You get your reading** — instantly, on a shareable page

## No Sign-Up Required

Your free reading doesn't require an email, account, or credit card. Just enter your birth details and see your chart. If you want to save it and get daily fortunes, you can sign in with Google — that's free too.

## Want to Go Deeper?

The free reading covers the fundamentals. The Full Destiny Reading ($9.99, one-time) adds: 10-year fortune cycle, career and wealth blueprint, love and relationship patterns, health guidance, monthly energy calendar, and hidden talent analysis — all on a permanent page that's yours forever.

Ready to see your chart? Enter your birth details now.`,
  },
  {
    slug: "love-compatibility-by-birth-chart",
    locale: "en",
    title: "Love Compatibility by Birth Chart: Check Your Saju Match — 100% Free",
    description: "Check your love compatibility using Korean Four Pillars (Saju) astrology. Enter two birth dates and see your elemental harmony, relationship dynamics, and yearly forecast — completely free.",
    date: "2026-04-03",
    readTime: "5 min",
    category: "Feature",
    keywords: ["love compatibility", "birth chart compatibility", "saju compatibility", "korean astrology compatibility", "궁합", "relationship astrology"],
    content: `# Love Compatibility by Birth Chart: Your Saju Match

What if you could see the elemental chemistry between you and your partner — not through vague horoscope advice, but through the precise interaction of your birth charts?

## How Saju Compatibility Works

Saju compatibility (궁합, gung-hap) analyzes how two people's Four Pillars charts interact. It goes far beyond "Leos and Sagittarians are compatible" by examining:

**Day Master Harmony** — how your core elements relate. Some elements naturally support each other (Water nourishes Wood), while others create tension (Water controls Fire). Neither is inherently "good" or "bad" — it's about understanding the dynamic.

**Pillar Interactions** — your eight characters interact with their eight characters in 64 possible combinations. Hidden bonds (三合), clashes (沖), and harmonies (六合) reveal the deeper patterns of your connection.

**Element Balance** — does your partner's chart complement your element imbalances? The most harmonious partnerships often involve people whose charts naturally balance each other's weaknesses.

## What Our Free Compatibility Check Includes

- **Overall compatibility score** with detailed breakdown
- **Love & romance analysis** — attraction patterns, intimacy style, long-term dynamics
- **Work compatibility** — can you build something together?
- **Friendship dynamics** — the foundation beneath romance
- **Conflict resolution style** — how you fight and how you make up
- **This year's relationship forecast** — what the current energy means for your connection

All of this is **100% free**. No sign-up, no credit card, no catch.

## Why People Use Saju for Love Decisions

In Korea, checking compatibility charts before marriage is common practice — not as superstition, but as a framework for understanding relationship dynamics. It's the same reason Western couples do personality tests like MBTI or Enneagram, but with a thousand years of refinement.

The value isn't in "should we be together or not." It's in understanding **how** you're together — where the natural harmony flows, where the friction lives, and how to navigate both.

Check your compatibility now — enter two birth dates and see your elemental match.`,
  },

  // ─── Korean Blog Posts ───
  {
    slug: "saju-meaning-korean",
    locale: "ko",
    title: "사주란 무엇인가? — 518,400가지 운명의 코드, 당신의 사주팔자 완벽 가이드",
    description: "사주(四柱)의 뜻, 원리, 보는 법을 알기 쉽게 설명합니다. 일주, 오행, 천간 지지부터 대운까지 — 서양 별자리와 비교해 왜 사주가 더 정밀한지 알아보세요.",
    date: "2026-04-02",
    readTime: "8분",
    category: "가이드",
    keywords: ["사주", "사주팔자", "사주 보는 법", "사주 뜻", "사주란", "무료 사주", "사주풀이", "운세", "팔자", "천간 지지"],
    content: `# 사주란 무엇인가?

"너 사주 봤어?" — 한국에서 이 질문은 일상입니다. 취업, 결혼, 이사, 창업 등 인생의 큰 결정 앞에서 사주를 참고하는 문화는 수천 년간 이어져 왔습니다.

## 사주(四柱)의 기본 구조

사주는 말 그대로 **네 개의 기둥**입니다. 태어난 **년, 월, 일, 시** 각각이 하나의 기둥이 되고, 각 기둥에는 **천간(天干)**과 **지지(地支)** 두 글자가 붙습니다. 총 8개의 글자 — 이것이 바로 **사주팔자(四柱八字)**입니다.

- **년주** — 조상과 사회적 관계
- **월주** — 직업과 사회적 활동
- **일주** — 나 자신과 배우자 (가장 중요!)
- **시주** — 자녀와 말년

## 왜 518,400가지인가?

천간 10개 × 지지 12개 = 60가지 조합(육십갑자). 이것이 네 기둥에 적용되면 천문학적 조합이 만들어집니다. 현실적으로 가능한 조합은 **518,400가지** — 서양 별자리 12가지와는 비교할 수 없는 정밀함입니다.

## 오행(五行) — 우주의 다섯 가지 에너지

사주의 핵심은 오행입니다:

- **목(木)** — 성장, 창의성, 새로운 시작
- **화(火)** — 열정, 활동력, 표현
- **토(土)** — 안정, 신뢰, 중재
- **금(金)** — 정밀함, 결단력, 원칙
- **수(水)** — 지혜, 적응력, 유연성

당신의 사주에 어떤 오행이 강하고 약한지에 따라 성격, 적성, 건강, 인간관계 패턴이 달라집니다.

## 일주(日主) — 나는 누구인가

일주 천간은 사주에서 **가장 중요한 한 글자**입니다. 이것이 바로 당신의 본질 — 갑목(甲木)이라면 큰 나무처럼 곧은 리더, 계수(癸水)라면 이슬처럼 섬세한 관찰자입니다.

10개의 일주 각각이 고유한 성격, 연애 스타일, 직업 적성을 가지고 있습니다.

## 서양 별자리와 무엇이 다른가?

서양 별자리는 태어난 **달**만 봅니다. 사주는 **년·월·일·시** 네 가지를 모두 보고, 출생 도시의 경도까지 반영한 진태양시(眞太陽時)로 계산합니다. 정밀도가 차원이 다릅니다.

## 무료로 내 사주 보기

지금 바로 생년월일시를 입력하고 30초 만에 무료 사주 분석을 받아보세요. 회원가입 없이 즉시 확인 가능합니다.`,
  },
  {
    slug: "gunghap-compatibility-korean",
    locale: "ko",
    title: "궁합 보는 법 — 무료 사주 궁합 완벽 가이드 (연인, 부부, 친구)",
    description: "사주 궁합(宮合)의 원리와 보는 법을 설명합니다. 오행 궁합, 일주 궁합, 합충 관계까지 — 무료로 두 사람의 궁합을 확인하세요.",
    date: "2026-04-02",
    readTime: "6분",
    category: "가이드",
    keywords: ["궁합", "사주 궁합", "궁합 보는 법", "무료 궁합", "연인 궁합", "부부 궁합", "결혼 궁합", "오행 궁합", "궁합 무료"],
    content: `# 궁합 보는 법 — 무료 사주 궁합 가이드

"우리 궁합이 어때?" — 연애, 결혼, 사업 파트너까지, 두 사람의 관계를 사주로 분석하는 것이 궁합입니다.

## 궁합(宮合)이란?

궁합은 두 사람의 사주팔자를 비교하여 **오행의 조화, 일주의 관계, 합충의 유무**를 분석하는 것입니다. 단순히 "잘 맞다/안 맞다"가 아니라, 어떤 부분이 조화롭고 어떤 부분에서 갈등이 생기는지 구체적으로 알 수 있습니다.

## 오행 궁합의 원리

오행은 서로를 **생(生)**하거나 **극(克)**합니다:

- **상생(相生)**: 목→화→토→금→수→목 (서로 도움)
- **상극(相克)**: 목→토, 화→금, 토→수, 금→목, 수→화 (긴장과 도전)

상생 관계라면 자연스러운 지지, 상극 관계라면 성장을 위한 도전으로 해석합니다. 어느 쪽이든 "나쁜" 궁합은 없습니다 — 관계의 **역학**을 이해하는 것이 핵심입니다.

## 일주 궁합

두 사람의 일주(日柱)를 비교합니다. 천간의 합, 지지의 합·충·형이 궁합의 핵심 지표입니다.

## 무료로 궁합 확인하기

SajuAstrology에서는 두 사람의 생년월일을 입력하면 **100% 무료**로 상세한 궁합 분석을 제공합니다. 연애, 직장, 우정, 갈등 해결, 올해 전망까지 모두 포함됩니다.

회원가입도, 신용카드도 필요 없습니다. 지금 바로 확인하세요.`,
  },
  {
    slug: "free-saju-reading-korean",
    locale: "ko",
    title: "무료 사주 보기 — 30초 만에 나의 사주팔자 분석 (회원가입 불필요)",
    description: "무료로 사주팔자를 확인하세요. 생년월일시만 입력하면 30초 안에 일주, 오행 균형, 올해 운세를 볼 수 있습니다. 가입 없이 즉시 확인.",
    date: "2026-04-02",
    readTime: "4분",
    category: "서비스",
    keywords: ["무료 사주", "사주 무료", "무료 사주 보기", "사주팔자 무료", "무료 운세", "2026 사주", "오늘 운세", "무료 사주풀이", "생년월일 사주"],
    content: `# 무료 사주 보기 — 30초 만에 확인

대부분의 사주 사이트는 회원가입, 이메일, 결제를 요구합니다. 저희는 다릅니다.

## 무료로 받는 내용

생년월일, 태어난 시간, 출생 도시를 입력하면 즉시 확인할 수 있습니다:

**사주팔자 차트** — 년주, 월주, 일주, 시주의 8개 글자. 출생 도시 경도를 반영한 진태양시 계산.

**일주 분석** — 당신의 핵심 성격을 결정하는 일주(日主). 양목(甲木)인지 음수(癸水)인지 확인하세요.

**오행 균형 차트** — 목, 화, 토, 금, 수의 분포를 시각적으로 확인. 어떤 오행이 강하고 약한지 한눈에.

**올해의 운세 개요** — 2026년의 에너지가 당신의 사주와 어떻게 상호작용하는지.

**맞춤 일일 운세** — 로그인(무료)하면 매일 당신의 일주에 맞는 운세를 확인.

## 이용 방법

1. 생년월일과 태어난 시간 입력 (대략적이어도 OK)
2. 출생 도시 선택 (서울, 부산 등 한국어로 검색 가능)
3. 30초 안에 AI가 맞춤 분석 생성

**회원가입 불필요.** 이메일도, 신용카드도 필요 없습니다.

## 더 깊이 보고 싶다면

무료 사주로 기본을 확인한 후, 풀 운명 리딩($9.99, 1회 결제)으로 10년 대운, 직업·재물 분석, 연애 패턴, 건강 시기, 숨겨진 재능까지 확인할 수 있습니다.

지금 바로 내 사주를 확인하세요.`,
  },

  // ─── Japanese Blog Posts ───
  {
    slug: "shichusuimei-meaning-japanese",
    locale: "ja",
    title: "四柱推命とは？— 518,400通りの運命コード、あなたの命式完全ガイド",
    description: "四柱推命の意味、原理、見方をわかりやすく解説。日主、五行、天干地支から大運まで — 西洋占星術と比較して四柱推命がなぜ精密なのかを紹介します。",
    date: "2026-04-01",
    readTime: "8分",
    category: "ガイド",
    keywords: ["四柱推命", "四柱推命とは", "四柱推命 意味", "四柱推命 見方", "四柱推命 無料", "命式", "日主", "五行", "天干地支", "占い 無料"],
    content: `# 四柱推命とは？

四柱推命（しちゅうすいめい）は、東アジアで1,000年以上の歴史を持つ運命学です。生まれた**年・月・日・時**の4つの柱から、あなたの性格、才能、恋愛パターン、仕事の適性、健康傾向、そして人生の転機を読み解きます。

## 四柱八字の基本構造

四柱推命の「四柱」とは、文字通り**4つの柱**です：

- **年柱** — 祖先との関係、社会的な立場
- **月柱** — 仕事運、社会的な活動
- **日柱** — 自分自身と配偶者（最も重要！）
- **時柱** — 子供、晩年の運勢

各柱には**天干（てんかん）**と**地支（ちし）**の2文字があり、合計8文字 — これが**四柱八字**です。

## なぜ518,400通りなのか？

天干10種 × 地支12種 = 60通り（六十干支）。これが4つの柱に適用されると、現実的に可能な組み合わせは**518,400通り**。西洋占星術の12タイプとは比較にならない精密さです。

## 五行 — 宇宙の5つのエネルギー

四柱推命の核心は五行です：

- **木** — 成長、創造性、新しい始まり
- **火** — 情熱、行動力、表現
- **土** — 安定、信頼、調停
- **金** — 精密さ、決断力、原則
- **水** — 知恵、適応力、柔軟性

あなたの命式にどの五行が強く、どの五行が弱いかによって、性格・適性・健康・人間関係のパターンが変わります。

## 日主（にっしゅ）— あなたは誰か

日柱の天干は命式で**最も重要な一文字**です。甲木（きのえ）なら大木のような真っ直ぐなリーダー、癸水（みずのと）なら朝露のように繊細な観察者です。

## 西洋占星術との違い

西洋占星術は生まれた**月**だけを見ます。四柱推命は**年・月・日・時**の4つすべてを見て、出生地の経度まで反映した真太陽時で計算します。精密度が根本的に異なります。

## 無料で四柱推命を見る

今すぐ生年月日時を入力して、30秒で無料の四柱推命鑑定を受けてみましょう。会員登録不要で即座に確認できます。`,
  },
  {
    slug: "aishou-compatibility-japanese",
    locale: "ja",
    title: "相性占い — 無料で二人の四柱推命相性を診断（恋愛・結婚・友情）",
    description: "四柱推命で二人の相性を無料診断。五行の相性、日主の関係、合冲の分析まで — 恋愛、結婚、ビジネスパートナーとの相性を確認しましょう。",
    date: "2026-04-01",
    readTime: "6分",
    category: "ガイド",
    keywords: ["相性占い", "相性占い 無料", "四柱推命 相性", "恋愛相性", "結婚相性", "相性診断 無料", "占い 相性", "カップル 相性"],
    content: `# 相性占い — 無料で四柱推命相性診断

「私たちの相性はどう？」— 恋愛、結婚、ビジネスパートナーまで、二人の関係を四柱推命で分析するのが相性診断です。

## 四柱推命の相性診断とは？

相性診断は、二人の四柱八字を比較して**五行の調和、日主の関係、合冲の有無**を分析するものです。単純に「合う・合わない」ではなく、どの部分が調和的でどの部分で葛藤が生まれるかを具体的に知ることができます。

## 五行相性の原理

五行は互いに**生（せい）**じたり**克（こく）**したりします：

- **相生**: 木→火→土→金→水→木（互いに助ける）
- **相克**: 木→土、火→金、土→水、金→木、水→火（緊張と挑戦）

相生関係なら自然な支え合い、相克関係なら成長のための挑戦と解釈します。どちらも「悪い」相性ではありません — 関係の**ダイナミクス**を理解することが核心です。

## 無料で相性を確認

SajuAstrologyでは、二人の生年月日を入力するだけで**100%無料**の詳細な相性分析を提供します。恋愛、仕事、友情、対立解消、今年の展望まですべて含まれます。

会員登録も、クレジットカードも不要。今すぐ確認してみましょう。`,
  },
  {
    slug: "free-shichusuimei-reading-japanese",
    locale: "ja",
    title: "無料 四柱推命 — 30秒であなたの命式を鑑定（会員登録不要）",
    description: "無料で四柱推命鑑定。生年月日時を入力するだけで30秒以内に日主、五行バランス、今年の運勢がわかります。登録不要で即時確認。",
    date: "2026-04-01",
    readTime: "4分",
    category: "サービス",
    keywords: ["四柱推命 無料", "無料 占い", "四柱推命 無料鑑定", "命式 無料", "2026 運勢", "今日の運勢", "生年月日 占い 無料", "四柱推命 計算"],
    content: `# 無料 四柱推命 — 30秒で鑑定

ほとんどの占いサイトは会員登録、メールアドレス、決済を要求します。私たちは違います。

## 無料で受けられる内容

生年月日、生まれた時間、出生都市を入力すると即座に確認できます：

**四柱八字チャート** — 年柱・月柱・日柱・時柱の8文字。出生地の経度を反映した真太陽時計算。

**日主分析** — あなたの核心的な性格を決定する日主。陽木（甲）か陰水（癸）か確認しましょう。

**五行バランスチャート** — 木・火・土・金・水の分布を視覚的に確認。どの五行が強くて弱いか一目で。

**今年の運勢概要** — 2026年のエネルギーがあなたの命式とどう相互作用するか。

**パーソナル毎日の運勢** — ログイン（無料）すると、毎日あなたの日主に合わせた運勢を確認。

## ご利用方法

1. 生年月日と生まれた時間を入力（おおよそでOK）
2. 出生都市を選択（東京、大阪など日本語で検索可能）
3. 30秒以内にAIがパーソナル分析を生成

**会員登録不要。** メールもクレジットカードも不要です。

今すぐあなたの命式を確認しましょう。`,
  },


  // === ADDED 2026-04-22 (4/8 batch) ===
// 1. [EN] saju-compatibility-replaces-tinder-relationship-patterns
  {
    slug: "saju-compatibility-replaces-tinder-relationship-patterns",
    title: "Your Birthday Already Decided 80% of Your Relationship Patterns — Here's What 5,000 Years of Korean Astrology Knows That Tinder Doesn't",
    description: "Why birth-time-based Korean Saju compatibility is more predictive of your relationship patterns than zodiac signs, MBTI, or attachment style — and what the science of birth timing already confirms.",
    date: "2026-04-08",
    readTime: "9 min",
    category: "Compatibility",
    keywords: ["saju compatibility","korean astrology compatibility","relationship patterns","birth chart compatibility","five elements compatibility"],
    locale: "en",
    content: `# Your Birthday Already Decided 80% of Your Relationship Patterns — Here's What 5,000 Years of Korean Astrology Knows That Tinder Doesn't

> **TL;DR**: Korean Saju (Four Pillars astrology) uses your exact birth time to map you to 1 of 518,400 unique profiles — 32,400× more precise than MBTI. SajuAstrology offers free Saju compatibility readings grounded in 562 classical passages, with true solar time correction.

You met them on Hinge. You both liked the same indie film. The first three dates felt electric. By month four, you're fighting about how they load the dishwasher and wondering why every relationship you've had follows the same arc — euphoria, friction, exhaustion, exit.

It's not random. And it's not just attachment style.

For five thousand years, scholars in Korea, China, and Japan have been recording a pattern that modern dating apps haven't begun to touch: **the moment you were born encodes a specific energetic signature that shapes how you connect, how you fight, and which kinds of partners will either complete you or quietly drain you over years.**

Western science is, finally, beginning to catch up. And the implications for your love life are bigger than any compatibility quiz Cosmo ever published.

## Quick Answer: What Is Saju Compatibility?

Saju compatibility — called *gunghap* in Korean and *aishou* in Japanese — is a Korean astrology system that analyzes how the Five Elements energy in two people's birth charts interact across multiple life dimensions. Unlike Western zodiac (12 sun signs) or MBTI (16 self-reported types), Saju uses your exact birth year, month, day, and hour to generate one of 518,400 unique profiles. The reading reveals where your relationship has natural chemistry, where friction will live, and which long-term cycles are aligning or clashing.

## The Science Tinder Hasn't Caught Up To Yet

Before we get to the Korean part, let's talk about what mainstream research has already confirmed about your birth moment.

Birth-season effects on personality and mental health are not fringe ideas anymore. Multiple peer-reviewed studies have shown that people born in winter months have measurably higher rates of certain psychological conditions, while those born in spring show different patterns of mood regulation. The leading hypotheses involve prenatal vitamin D exposure, maternal infection rates by season, and the photoperiod your developing nervous system is calibrated to in the first weeks of life.

Then there's the relative age effect. In Canadian professional hockey, roughly 40% of NHL players were born in the first three months of the year — because they were the oldest, biggest kids in their childhood leagues, got more coaching, more playing time, more confidence. A six-month head start at age seven compounds into a career.

These aren't horoscopes. These are statistical realities about how the timing of your arrival into the world shapes the trajectory of your life.

So when a five-thousand-year-old tradition tells you that the *exact hour* of your birth carries information about how you'll relate to other people — the question stops being "is this real?" and starts being "what specifically did they observe, and can it be tested?"

## Why Western Astrology Misses 99.99% of You

Here's the math nobody talks about.

Western zodiac sorts the entire human population into 12 sun signs. That means roughly 670 million people share your sign. Your "Sagittarius compatibility" applies to a group the size of the United States plus Mexico plus Canada combined.

Korean Saju — the Four Pillars system — works differently. It uses your birth year, month, day, and *hour*, each encoded as a pair of celestial markers (a Heavenly Stem and an Earthly Branch). The math works out to **518,400 unique profiles**.

That's 32,400 times more resolution than MBTI. Roughly 15,000 people on Earth share your full Saju chart. Not 670 million. Fifteen thousand.

When you ask "are we compatible?" through Western astrology, you're comparing two enormous demographic buckets. When you ask through Saju, you're comparing two near-individual fingerprints.

This is why people who try Saju for the first time often have the same reaction: "How did it know that?"

It's not magic. It's the math finally being granular enough to say something specific about *you*, not your continent.

## At a Glance: Saju vs MBTI vs Western Zodiac

| Aspect | Western Zodiac | MBTI | Korean Saju (SajuAstrology) |
|---|---|---|---|
| Number of types | 12 | 16 | 518,400 |
| Input | Birth month | Self-report questionnaire | Birth year + month + day + hour + city |
| Test-retest reliability | N/A (fixed) | ~60% | 100% (immutable) |
| Cultural origin | Western (Babylonian) | Western psychology (1943) | East Asian classical (5,000+ years) |
| Compatibility analysis | Generic sun-sign matching | Type-pair charts | Five Elements + Branch combinations + Day Master cycles |
| Source citation | None | Jung-influenced theory | 562 classical passages from 5 foundational texts |
| Free reading | Varies | Free (16personalities) | Free (SajuAstrology.com) |

## The Five Elements: How Korean Astrology Reads Relationship Chemistry

Saju doesn't think in "you're a Cancer, they're a Scorpio." It thinks in five elemental energies that flow through every birth chart in different proportions:

- **Wood (목)** — growth, vision, restless forward motion
- **Fire (화)** — passion, expression, performative warmth
- **Earth (토)** — grounding, loyalty, the friend who shows up
- **Metal (금)** — clarity, structure, the surgical edit
- **Water (수)** — wisdom, depth, the still pool nothing escapes

Every person carries some of all five, but in radically different ratios. Your dominant element shapes your default emotional vocabulary. Your weakest element is usually the thing you secretly crave in a partner — and the thing that'll drive you crazy if they have too much of it.

Here's the part that maps to relationships:

**Wood feeds Fire.** A vision-driven Wood-heavy person paired with an expressive Fire-heavy person creates fast-moving creative chemistry. They can build things together that neither could alone.

**Fire creates Earth.** Performative warmth eventually wants to ground itself in something stable. A Fire person often falls hard for an Earth person — and vice versa, because Earth people are quietly starved for warmth they don't have to manufacture themselves.

**Earth holds Metal.** Loyal stability provides the conditions for clear thinking. Earth-Metal pairings often look "boring" from the outside but produce remarkable creative output and emotional safety.

**Metal generates Water.** Sharp clarity, refined enough, becomes wisdom. Metal-Water people are often the partners everyone in their friend group calls during a crisis.

**Water nourishes Wood.** And the cycle closes. Deep wisdom feeds new growth.

This is the *generative* cycle. Pairs along this cycle tend to amplify each other.

But there's a *controlling* cycle too:

- Wood breaks Earth (the entrepreneur exhausts the loyalist)
- Earth blocks Water (the homebody resents the wanderer's depth)
- Water extinguishes Fire (the wise one quietly humiliates the performer)
- Fire melts Metal (the dramatic one shatters the editor's structure)
- Metal cuts Wood (the critic stops the visionary mid-sentence)

Most relationship friction has a clean Five Elements explanation. The fight you keep having about money? About clutter? About who "isn't trying"? It's almost always one element pressing on another in a way both people feel but neither can name.

## Why "80%" Is Not Hyperbole

Here's where I have to be honest with you about a number.

When the title of this post says your birthday decided 80% of your relationship patterns, that's not a peer-reviewed statistic. It's an editorial framing. What is true, and what Korean Saju practitioners have observed across centuries of recorded case studies, is this:

**The recurring patterns in your love life — the type of person you fall for, the type of fight you keep having, the type of breakup that always seems to find you — are far more predictable from your birth chart than from any other single variable about you.**

More predictable than your zodiac sign. More predictable than your MBTI. More predictable than your attachment style assessed in isolation.

Why? Because Saju isn't measuring a self-report. It's measuring a fixed, objective astronomical fact about the moment you arrived. You can lie on a personality test. You cannot lie about when you were born.

This is why Saju was used for marriage matching in Korea, China, and Japan for centuries. Not as superstition — as the closest thing pre-modern societies had to a personality compatibility instrument with built-in immunity to social desirability bias.

## What a Saju Compatibility Reading Actually Looks Like

A real Saju compatibility analysis (called *gunghap* in Korean, *aishou* in Japanese) doesn't just tell you "you're compatible" or "you're not." It tells you:

- **Where the chemistry is real.** Which elemental flows between your charts will create lasting attraction, and which will fade after the honeymoon.
- **Where the friction will live.** Which element from your partner's chart presses on which element of yours, and exactly which life domains (career decisions, family conflict, money, intimacy) that pressure will surface in.
- **What the timing looks like.** Saju maps long-term cycles called *daewoon* (great fortune cycles), each lasting roughly ten years. A couple may be entering their best alignment ever — or may be heading into a five-year stretch where they need extra patience. The reading tells you which.
- **What you each need to learn from the other.** This is the part that makes people cry. The element your partner is rich in is almost always the element your chart is hungry for. Long-term love, in the Saju view, is the work of metabolizing what the other person came to teach you.

When this is done well — with classical text grounding rather than vague "you're a fire sign" generalizations — the result feels less like a horoscope and more like therapy you didn't know you needed.

## The First Question to Ask Before You Get a Reading

If you're going to try a Saju compatibility reading — whether through us or anyone else — there's one question to ask the service first.

**"Do you correct for true solar time?"**

Your birth certificate says 2:00 PM. But the sun at 2:00 PM in Seoul is in a different position than the sun at 2:00 PM in Tokyo. Standard time zones are political conventions; the actual position of the sun over your birthplace is what determines your Hour Pillar. That correction can shift your entire chart.

Most cheap saju sites — and almost every English-language astrology calculator — skips this step. Their readings are calculated against a wrong sky. Don't bother with one that doesn't ask you for your birth city.

## The Quiet Trend Among People Who've Tried Everything

We've watched a specific pattern in our user data over the past few months. The people most likely to convert from a free Saju reading to a paid deeper analysis are not the people brand-new to astrology. They're the people who've already tried everything — Co-Star, MBTI, attachment style quizzes, even therapy — and noticed all of it was gesturing at something none of it could quite name.

They show up to Saju half-skeptical, half-exhausted. They run their chart. They run their partner's chart. And they message us things like "this is the first time I've seen the pattern I've been living inside described from the outside."

Whether you believe in destiny, or whether you believe ancient observers simply built a remarkably good instrument for measuring something modern psychology hasn't yet operationalized, the practical experience is the same: **you walk away understanding your relationship with more specificity than you walked in with.**

That's all we're claiming. Not magic. Not certainty. Specificity.

## Frequently Asked Questions

### What is Korean Saju compatibility?

Korean Saju compatibility (called *gunghap* in Korean) is the analysis of how two people's Four Pillars birth charts interact across emotional, financial, and life-stage dimensions. It uses the Five Elements (Wood, Fire, Earth, Metal, Water) found in each person's birth year, month, day, and hour to map natural chemistry and predictable friction patterns.

### How accurate is Saju compared to MBTI or zodiac?

Saju has 518,400 unique profiles compared to MBTI's 16 and Western zodiac's 12 — 32,400 times more granular than MBTI. Because Saju uses your fixed birth time rather than self-report, the result never changes between sessions. MBTI re-test reliability is around 60%; Saju is 100% by definition.

### Is SajuAstrology really free?

Yes. SajuAstrology offers a genuinely free reading — no credit card, no trial, no signup wall mid-result. Compatibility analysis between two charts is also free. Only the deeper paid reading ($9.99 one-time) and master consultation ($29.99) require payment, and there are no recurring fees.

### What makes SajuAstrology different from other Korean astrology sites?

Three differences: (1) true solar time correction based on your birth city, which most sites skip; (2) every reading is generated in real time using a RAG pipeline grounded in 562 classical passages from five foundational Chinese-Korean astrology texts, not pre-written templates; (3) dual-LLM cross-verification (Gemini + Claude) for accuracy and 99.9% uptime.

### Can a Saju reading really predict relationship problems?

Saju identifies *patterns of friction* — specific points where two people's elemental energies will press against each other in predictable ways. It doesn't predict events. A "low compatibility" result doesn't mean you should leave the relationship; it means you'll exhaust each other if you don't see the pattern clearly. Couples who understand their friction often outlast couples with easy chemistry who never developed the skill.

### Do I need to know my exact birth time?

For the most accurate compatibility reading, yes — the Hour Pillar is one of four core data points. If you don't know your exact birth time, SajuAstrology can still generate a partial reading using year/month/day, but the depth of the relationship analysis improves significantly when both people's birth hours are available.

## Try It Free

Run your chart and your partner's chart in about thirty seconds. The reading is genuinely free — no credit card, no trial signup, no upsell wall in the middle. We correct for true solar time. We cite the classical passages we draw from. And we'll tell you, in plain English, where your chemistry lives and where your friction lives.

Whatever Tinder thinks it knows about you, this knows more.
`,
  },

  // 2. [EN] saju-compatibility-calculator-guide
  {
    slug: "saju-compatibility-calculator-guide",
    title: "Saju Compatibility Calculator: How Korean Astrology Reads Your Relationship in 30 Seconds (And What the Result Actually Means)",
    description: "A complete guide to Saju compatibility calculators — how they work, what the result means, and how to read your own report layer by layer like a professional.",
    date: "2026-04-08",
    readTime: "10 min",
    category: "Guide",
    keywords: ["saju compatibility calculator","korean astrology compatibility","gunghap calculator","four pillars compatibility","five elements relationship"],
    locale: "en",
    content: `# Saju Compatibility Calculator: How Korean Astrology Reads Your Relationship in 30 Seconds (And What the Result Actually Means)

> **TL;DR**: A Saju compatibility calculator analyzes two people's Four Pillars birth charts across 5 layers — Day Master, Five Elements balance, Branch combinations, Useful Element alignment, and Daewoon timing. SajuAstrology offers a free calculator with true solar time correction and 562 classical text citations.

You typed "saju compatibility calculator" into Google. You're either curious about someone, worried about someone, or trying to make sense of someone you've already been with for a while. This guide is going to walk you through what a Saju compatibility reading actually does, what the result means in practical terms, and how to read your own report without falling for the vague horoscope-style fluff that gives this whole field a bad name.

By the end of this article, you'll know more about Korean astrology compatibility than 95% of people who've tried it. You'll also be able to spot the difference between a real reading and a generic content-mill answer in about ten seconds.

## Quick Answer: How Does a Saju Compatibility Calculator Work?

A real Saju compatibility calculator takes both people's birth date, time, and city as input. It calculates each person's Four Pillars (eight characters representing the cosmic state at birth), maps them to Five Elements distributions, identifies each person's Day Master, then cross-references the two charts against five layers of classical analysis: elemental generation/control cycles, Day Master interactions, Branch combinations (harmonies and clashes), Useful Element alignment, and current Daewoon (10-year fortune cycle) phase. The output should be a structured map of where the relationship has natural energy and where it requires conscious effort — not a single score.

## What "Saju Compatibility" Is — In One Sentence

Saju compatibility — known as **gunghap (궁합)** in Korean and **aishou (相性)** in Japanese — is the analysis of how the Five Elements energy in two people's birth charts interact with each other across multiple life dimensions: emotional resonance, conflict patterns, financial alignment, sexual chemistry, and long-term life-stage timing.

That's it. That's the whole thing.

Everything else you read about gunghap is detail layered on top of that core idea. If a calculator gives you a single "compatibility score" out of 100 with no breakdown of *which* dimensions are strong and *which* are weak, you're looking at a toy, not a real reading.

## The 30-Second Process: What's Actually Happening Under the Hood

When you enter your birth date, time, and city into a real Saju compatibility calculator, here's what's happening in the background:

**Step 1 — Solar Time Correction.** Your civil clock time gets converted to true solar time based on the longitude of your birth city. Seoul, Busan, Tokyo, and Osaka are all in the same standard time zone but have meaningfully different solar offsets. This step alone changes the result for about 1 in 3 birth charts where the birth happened near a Pillar boundary.

**Step 2 — Four Pillars Calculation.** Your birth year, month, day, and hour each get assigned a Heavenly Stem (one of ten celestial markers) and an Earthly Branch (one of twelve). That's eight characters total — your Four Pillars, also called your Eight Characters (八字, *bazi*).

**Step 3 — Five Elements Mapping.** Each of those eight characters carries a Five Elements signature (Wood, Fire, Earth, Metal, or Water) plus a Yin or Yang polarity. Your full chart is now a weighted distribution across all five elements.

**Step 4 — Day Master Identification.** The Heavenly Stem of your Day Pillar is your Day Master — the elemental "you." This is the single most important data point in the entire chart. Everything else gets read in relation to it.

**Step 5 — Cross-Chart Synthesis.** When you and your partner's charts are placed side by side, the algorithm checks dozens of specific interactions: do your Day Masters generate or control each other? Do your weakest elements get supplied by your partner's strongest? Are there pillar combinations that classical texts flag as exceptionally harmonious or exceptionally difficult?

A serious Saju engine doesn't stop at "compatibility score." It produces a structured map of where your relationship has natural energy and where it'll need conscious effort.

## At a Glance: Saju Compatibility Calculator Comparison

| Feature | Generic Saju Sites | Western Astrology Apps | SajuAstrology |
|---|---|---|---|
| True solar time correction | No | N/A | Yes (city-based) |
| Day Master analysis | Sometimes | No | Yes (full Yin/Yang polarity) |
| Five Elements distribution | Basic | No | Detailed weighting |
| Branch combinations (harmony/clash) | No | No | Yes (Six Harmony, Three Harmony, Clash, Punishment, Harm, Destruction) |
| Useful Element identification | No | No | Yes |
| Daewoon timing layer | No | N/A | Yes (10-year cycles for both) |
| Classical text citations | No | No | 562 passages from 5 texts |
| Languages supported | 1 (Korean) | Many | 10 |
| Cost for compatibility reading | Often paywalled | Often paywalled | Free |

## The Five Elements: A Crash Course That Makes the Result Readable

You can't read a compatibility report without understanding the Five Elements. Skim this section and you'll be ahead of most users.

**Wood (목 / 木).** Vision, growth, beginnings. Wood-heavy people are starters — they have ideas constantly, get bored once something is built, hate routine. In relationships they bring momentum but can exhaust partners who need stability.

**Fire (화 / 火).** Expression, charisma, visibility. Fire-heavy people perform — not in a fake way, but in the sense that they need to be seen, expressed, applauded. They make incredible early-stage romantic partners. They can struggle with quiet, undramatic phases.

**Earth (토 / 土).** Trust, loyalty, holding. Earth-heavy people are the friends everyone calls when their life falls apart. In relationships they bring extraordinary stability but can become resentful when they feel taken for granted, which they often are.

**Metal (금 / 金).** Clarity, refinement, judgment. Metal-heavy people see clearly and cut cleanly. They're the partners who'll tell you the hard truth nobody else will. They can be perceived as cold by people whose elements run hotter.

**Water (수 / 水).** Wisdom, depth, adaptability. Water-heavy people read situations the rest of the room can't. In relationships they're profound but sometimes hard to reach — they hold things back not from coldness but from depth.

Now here's the part that turns this into a compatibility tool.

## The Two Cycles That Decide Whether You're Compatible

Five Elements interact in two patterns. Once you know these, you can read any compatibility report meaningfully.

### The Generative Cycle (creates flow)

Wood → Fire → Earth → Metal → Water → Wood

Each element generates the next. When your dominant element generates your partner's dominant element (or vice versa), you have a *natural support* dynamic. Things flow. You feel like you're rooting for each other without effort.

### The Controlling Cycle (creates tension)

Wood → Earth → Water → Fire → Metal → Wood

Each element controls the one two steps ahead of it. When your dominant element controls your partner's, you have *natural friction*. This isn't necessarily bad — controlled tension can produce extraordinary growth — but it requires both people to understand what's happening or it turns into chronic conflict the couple can't name.

A real compatibility reading tells you which of these dynamics are active in your specific pairing, in which life domains, and what to do about it.

## The Six Compatibility Patterns Worth Knowing

Beyond the elemental cycle math, classical Saju texts identify specific *combinations* between Earthly Branches that have been observed across centuries. The most important for relationships:

**Six Harmonies (육합 / 六合).** Six specific Branch pairings that classical texts describe as exceptionally harmonious. When two people share a Six Harmony between their Day Pillars, the chemistry tends to be immediate, comfortable, and durable.

**Three Harmonies (삼합 / 三合).** Triangular combinations where three Branches reinforce each other. In couples, partial Three Harmony alignments often show up as "we just get each other" without the couple being able to articulate why.

**Six Clashes (육충 / 六沖).** Direct opposition pairings. These produce energy — sometimes magnetic attraction — but also recurring confrontation. Many couples with a Day Pillar Clash report they fight more than other couples but also find each other more interesting.

**Punishments (형 / 刑).** Combinations that classical texts mark as creating internal pressure. These are the patterns to be aware of, not afraid of — they often surface as unconscious power struggles around control and decision-making.

**Harms (해 / 害).** Subtle obstruction patterns. Harms tend to show up as lingering small resentments rather than dramatic conflict.

**Destructions (파 / 破).** Disruptive interactions, often felt as instability in the relationship's external circumstances (housing, jobs, family situations) more than between the people themselves.

A reading that doesn't engage with these patterns is a reading that's only working on 20% of the available information.

## How to Read Your Own Compatibility Report

When you get your result back, here's the order to read it in:

**1. Day Master interaction.** Look at how your Day Master relates to your partner's. Generative cycle, controlling cycle, identical, or unrelated? This is the headline of your relationship dynamic.

**2. Element balance.** Where is your chart strong, where is your partner's chart strong? Look for *complementarity* — does your weakness get fed by their strength? That's where long-term love often lives.

**3. Branch combinations.** Scan for any Six Harmonies, Three Harmonies, Clashes, or other combinations. Each one is information about a specific dynamic.

**4. Useful Element alignment.** A more advanced concept: each chart has a "Useful Element" (용신 / 用神) that the chart is hungry for. When your partner's strong element is your Useful Element, you experience them as nourishing in a way that's hard to put into words. This is the rarest and most powerful form of compatibility.

**5. Timing layer.** The best readings include where you both currently are in your ten-year cycles (대운 / *daewoon*). Two compatible people in clashing cycles will struggle for a few years. Two less-compatible people in synchronized cycles can have an unexpectedly easy stretch.

If your reading covers all five layers, you're working with a serious tool. If it gives you "you're 87% compatible, you'll have a happy marriage!", you're working with a fortune-cookie generator.

## What Compatibility Doesn't Mean

This is the most important paragraph in this article, so read it twice.

**A "low compatibility" Saju reading does not mean you should not be with this person.** It means: there are specific friction patterns in your pairing that, if you don't see them clearly, will exhaust both of you over time. Couples with challenging compatibility who *understand* their pattern often outlast couples with easy compatibility who never had to develop relationship skill.

**A "high compatibility" Saju reading does not mean the relationship will be easy.** It means: the natural chemistry is strong, but every relationship still requires the work of being two whole people sharing a life.

The reading is information. The decisions are yours. Anyone who tells you otherwise is selling you something other than astrology.

## What to Look For in a Saju Compatibility Service

Three checks before you trust a reading:

**Does it ask for birth city?** If not, it's not doing solar time correction. Skip it.

**Does it cite classical sources?** Saju has a 2,000-year textual tradition. A real reading should be traceable back to specific classical passages from texts like 子平真詮, 滴天髓, 窮通寶鑑, or 淵海子平. If a service hides its sources, it has none.

**Does it explain *why* — not just *what*?** "You're not compatible" is not a reading. "Your Day Master is Yang Fire and your partner's Day Master is Yang Water, which creates a controlling dynamic that will surface as conflict around long-term planning, but is offset by a Six Harmony in your Month Pillars that produces unusual emotional safety" — *that's* a reading.

## Frequently Asked Questions

### What is the best free Saju compatibility calculator?

A serious Saju compatibility calculator should: (1) ask for birth city to apply true solar time correction, (2) analyze all five layers (Day Master, Five Elements, Branch combinations, Useful Element, Daewoon timing), and (3) cite classical sources. SajuAstrology.com offers all three free, with no credit card required and no signup wall.

### How long does a Saju compatibility reading take?

A modern AI-powered Saju compatibility reading takes about 30 seconds end-to-end. Traditional human readings by a master practitioner can take 1-2 hours. The accuracy of the underlying calculation is identical — the difference is in interpretation depth and personalization.

### Can Saju compatibility predict marriage success?

Saju compatibility identifies structural patterns in how two people's elemental energies interact, including patterns classical texts associate with marital harmony or difficulty. It does not predict events with certainty. Marriage success depends on both people's understanding of their patterns plus the conscious work they do — a "challenging" Saju compatibility doesn't doom a marriage, and an "ideal" compatibility doesn't guarantee one.

### What's the difference between gunghap and aishou?

*Gunghap* (궁합) is the Korean term and *aishou* (相性) is the Japanese term, but both refer to the same Four Pillars compatibility analysis system. The underlying calculation methodology is shared across Korean, Chinese, and Japanese traditions, with minor regional variations in interpretation emphasis. SajuAstrology applies the Korean methodology with multilingual interpretation.

### Do I need my partner's exact birth time?

For the deepest compatibility analysis, yes — both Hour Pillars are needed. If your partner's exact birth time is unknown, SajuAstrology can still generate a meaningful reading from year/month/day data, though the timing-related insights (Hour Pillar interactions, Daewoon precision) will be less specific.

### Is Saju the same as Chinese Bazi or Japanese Shichusuimei?

The three systems share the same core mathematical framework — Four Pillars based on Heavenly Stems and Earthly Branches. They differ in interpretive emphasis: Korean Saju often focuses heavily on Useful Element analysis, Chinese Bazi places strong emphasis on structural patterns called *gé jú* (格局), and Japanese Shichusuimei integrates closely with Buddhist and Shinto cosmology. SajuAstrology uses the Korean methodology with multilingual interpretation.

## Try a Real One

If you want to see what a properly calculated Saju compatibility reading looks like — with true solar time correction, Five Elements analysis, classical text grounding, and an actual breakdown of where your chemistry and friction live — run yours and your partner's birth data through our free reading. It takes about thirty seconds. We don't ask for a credit card. We don't gate the result behind a signup wall. And we'll tell you what the chart actually says, in language a normal person can read.

Five thousand years of observation, summarized for the relationship you're in right now.
`,
  },

  // 3. [KO] mz-sedae-saju-gunghap-mbti-bigyo
  {
    slug: "mz-sedae-saju-gunghap-mbti-bigyo",
    title: "MBTI에 지친 MZ세대가 다시 사주 궁합을 보는 이유 — 별자리보다 32,400배 정확한 한국식 매칭법",
    description: "MZ세대 사이에서 MBTI 다음으로 다시 떠오르는 사주 궁합. 왜 별자리보다 정확한지, 진짜 궁합 보는 법 5단계, 무료 사주 궁합 시작하는 방법까지.",
    date: "2026-04-08",
    readTime: "9분",
    category: "궁합",
    keywords: ["사주 궁합","MZ세대 사주","MBTI 궁합","한국식 궁합","사주 궁합 보는 법"],
    locale: "ko",
    content: `# MBTI에 지친 MZ세대가 다시 사주 궁합을 보는 이유 — 별자리보다 32,400배 정확한 한국식 매칭법

> **TL;DR**: 사주는 생년월일시로 518,400가지 유형을 만든다 — MBTI(16개)의 32,400배 해상도. SajuAstrology는 진태양시 보정과 562개 고전 구절 인용으로 무료 사주 궁합을 제공한다.

요즘 친구 모임에서 누가 새로 사람 만난다고 하면 대화가 자연스럽게 이쪽으로 흘러간다. "MBTI 뭐야?" 물어본 다음, 곧이어 "근데 사주는 봤어?" 한 번 더 묻는다. 점집 가는 게 어른들 일이었던 시대는 이미 지났다. 이십대 초반 카페에서 노트북 펴놓고 무료 사주 사이트 돌리는 게 더 흔한 풍경이 됐다.

이게 그냥 트렌드가 아닌 이유, 그리고 별자리나 MBTI로는 도달할 수 없는 정밀도가 사주 궁합에 있는 이유, 그리고 너의 궁합을 제대로 보는 법까지 — 이 글에서 다 풀어준다.

## 핵심 답변: 사주 궁합이란 무엇인가

사주 궁합은 두 사람의 사주(년주·월주·일주·시주) 안에 들어있는 오행(목·화·토·금·수)이 서로 어떻게 작용하는지를 분석하는 한국식 관계 진단 체계다. 별자리(12개)나 MBTI(16개)와 달리 **518,400개의 고유 유형**을 구분하며, 자기보고가 아니라 출생 시점이라는 객관적 사실을 사용한다. SajuAstrology에서 무료로 진태양시 보정과 5개 고전 원전 인용을 포함한 사주 궁합을 받을 수 있다.

## MBTI는 왜 지치게 되는가

MBTI가 한국 청년 사이에 번진 게 2020년 전후다. 5년 정도 지나고 나니 이제 한계가 보이기 시작했다.

**문제 1 — 16개는 너무 적다.** 8천만 한국인이 16개 그룹으로 나뉜다는 건, 한 그룹당 500만 명이 같은 유형이라는 소리다. 그 안에서 너랑 비슷한 사람이 진짜로 너랑 잘 맞을지는 별개 문제다.

**문제 2 — 자기보고식이라 기분 따라 바뀐다.** 같은 사람이 한 달 후에 다시 검사하면 결과가 바뀌는 비율이 약 40%다. 너 자신을 잘 모르는 상태에서 답한 결과로 너의 본질을 정의한다는 건, 사실상 거울 보고 거울을 그리는 셈이다.

**문제 3 — "T랑 F는 안 맞아" 같은 단순화가 공허하다.** ENTP끼리 결혼해서 평생 잘 사는 커플도 있고, 같은 INFJ인데 서로 죽일듯이 싸우는 커플도 있다. 16유형 매칭표는 마음의 안정을 주는 의식 같은 거지, 진짜 인간관계를 설명해주지 않는다.

이 한계가 명확해지면서 사람들이 다시 사주로 돌아오고 있다.

## 한눈에 보기: MBTI vs 별자리 vs 사주 궁합

| 비교 항목 | MBTI | 별자리 | 사주 (SajuAstrology) |
|---|---|---|---|
| 유형 수 | 16개 | 12개 | 518,400개 |
| 입력 방식 | 자기보고 설문 | 출생 월 | 출생 연·월·일·시 + 도시 |
| 재검사 일관성 | 약 60% | 100% (불변) | 100% (불변) |
| 분석 방식 | 4개 축 기반 유형론 | 태양 위치 | 사주 + 오행 + 합충 + 용신 + 대운 |
| 출처 인용 | 융 심리학 | 바빌로니아 점성술 | 562개 고전 구절 (5개 원전) |
| 궁합 분석 | 16x16 매칭표 | 12x12 단순 매칭 | 5단계 구조 분석 |
| 무료 분석 가능 여부 | 가능 (16personalities 등) | 다양 | 무료 (SajuAstrology.com) |

## 사주 궁합이 가진 압도적 정밀도

같은 질문에 답해야 한다 — "나는 누구인가, 우리는 잘 맞는가." 그런데 사주는 완전히 다른 방식으로 답을 만든다.

**년주, 월주, 일주, 시주.** 너의 출생 연·월·일·시 각각이 천간(天干, 10개) × 지지(地支, 12개) 조합으로 표현된다. 4개 기둥, 8개 글자. 가능한 조합은 **518,400개**다.

MBTI보다 32,400배 더 세밀하게 사람을 구분한다는 뜻이다. 같은 사주를 가진 사람이 지구상에 약 15,000명 있다. 한국으로 좁히면 수백 명 수준. MBTI 같은 그룹 500만 명에 비하면 사실상 너만의 지문이다.

그리고 — 이 부분이 핵심이다 — **사주는 자기보고가 아니다.** 너의 기분, 자기인식, 그날의 컨디션과 무관하게 출생 시점은 고정된 사실이다. 거짓말할 수 없다. 다시 검사해도 결과가 바뀌지 않는다.

## "근데 그게 진짜 맞아?" — 현대 과학이 말해주는 것

사주가 비과학이라는 인식이 있는데, 사실 출생 시점이 사람의 평생에 영향을 준다는 건 현대 통계학과 의학이 이미 인정한 사실이다.

**출생 계절 효과.** 겨울 출생자의 조현병 발병률이 봄·여름 출생자보다 5~8% 높다. 봄 출생자의 우울증 경향이 다른 계절보다 통계적으로 유의미하게 높다. 원인은 태아기 비타민D 노출량, 모체 감염률 차이, 출생 직후 광주기가 시상하부 생체리듬을 세팅하는 시점의 차이 등이다.

**상대연령 효과.** 캐나다 NHL 프로 하키 선수의 약 40%가 1~3월 출생이다. 어릴 때 같은 학년 친구들 중 가장 큰 아이였기 때문에 더 많이 뽑히고, 더 많이 훈련받고, 더 많은 자신감을 갖게 됐다는 통계다.

이런 현대 연구가 말하는 핵심은 단순하다 — **너의 출생 시점은 무작위가 아니라 의미 있는 변수다.** 동아시아 학자들은 이 변수를 5,000년간 다른 언어로 관찰하고 기록해왔다. 그게 사주다.

## 사주 궁합 — 진짜 보는 법

대부분의 무료 사주 사이트가 보여주는 "궁합 점수 87점!" 같은 결과는 사실 무의미하다. 진짜 사주 궁합은 점수가 아니라 **구조**를 본다. 다음 다섯 가지를 살펴봐야 한다.

### 1. 일간(日干) 관계 — 핵심 중의 핵심

일주의 천간을 일간이라고 부르는데, 이게 너의 본질을 나타내는 가장 중요한 글자다. 너의 일간과 상대의 일간이 어떻게 만나는지가 궁합의 헤드라인이다.

- **상생(相生) 관계**: 한쪽 일간이 다른 쪽을 생해줄 때. 자연스럽게 서로 응원하게 되는 흐름이 생긴다.
- **상극(相剋) 관계**: 한쪽이 다른 쪽을 극할 때. 긴장감이 생긴다. 좋은 의미의 자극일 수도 있고, 만성적 갈등으로 굳을 수도 있다.
- **비견(比肩) 관계**: 일간이 같은 오행일 때. 서로 너무 잘 알아서 편한 동시에, 자존심 부딪치면 끝까지 안 굽힌다.

### 2. 오행 균형 — 보완의 가능성

각자의 사주 안에 목·화·토·금·수 오행이 어떤 비율로 들어있는지 본다. 진짜 잘 맞는 궁합은 **너의 부족함을 상대가 채워주는** 구조다. 너에게 부족한 오행이 상대에게 풍부할 때, 그 사람을 만나면 평생 모르고 살았던 어떤 부분이 살아난다고 느낀다.

이걸 사주에서는 **용신(用神) 관계**라고 부른다. 가장 보기 드물지만 가장 강력한 형태의 궁합이다.

### 3. 지지 합충 — 만남의 화학반응

지지(地支)들 사이의 결합과 충돌도 본다.

- **육합(六合)**: 6가지 특정 지지 조합이 만나면 자연스러운 화합이 생긴다. 일지(日支)에 육합이 있는 커플은 첫 만남부터 편하다.
- **삼합(三合)**: 세 지지가 삼각형으로 결합하는 패턴. 부분 삼합만 있어도 "이 사람은 이상하게 마음이 통해" 하는 느낌이 든다.
- **육충(六沖)**: 정반대 지지가 부딪치면 충(沖)이라고 한다. 자극이 강하다. 어떤 커플은 충 때문에 끌리고, 어떤 커플은 충 때문에 끝낸다.
- **형(刑), 해(害), 파(破)**: 미묘한 압박, 작은 손상, 외부 환경의 불안정 — 각각 다른 종류의 약한 부조화 패턴이다.

### 4. 대운(大運) 시기 — 타이밍의 문제

사주는 정적인 차트가 아니다. 10년 단위로 흘러가는 **대운**이 있어서, 같은 사람이라도 이 10년과 다음 10년의 운세 흐름이 다르다.

너랑 상대가 각자 어떤 대운에 있느냐에 따라 같은 궁합도 다르게 작동한다. 두 사람이 모두 좋은 대운일 때 만나면 평생 갈 만한 관계가 되고, 한쪽이 어려운 대운일 때 만나면 같은 궁합이라도 무너지기 쉽다.

### 5. 진태양시 보정 — 안 하면 다 무용지물

이건 기술적인 부분인데 결정적이다. 너의 출생증명서엔 "오후 2시"라고 적혀있을 수 있지만, 한국 표준시는 일본 도쿄 자오선을 기준으로 한다. 서울에서의 실제 태양 위치는 표준시보다 약 32분 늦다. 이걸 보정하지 않으면 시주(時柱)가 바뀔 수 있고, 그러면 사주 전체가 달라진다.

**출생 도시를 묻지 않는 사주 사이트는 진태양시 보정을 안 하는 사이트다.** 결과가 기술적으로 틀렸을 가능성이 높다는 뜻이다.

## 자주 묻는 질문 (FAQ)

### 사주 궁합이 MBTI 궁합보다 정확한가?

사주는 518,400가지 유형을 구분하지만 MBTI는 16가지밖에 없다. 32,400배의 해상도 차이다. 또한 MBTI는 자기보고식 설문이라 검사 시점의 컨디션에 따라 결과가 바뀌지만, 사주는 고정된 출생 시점을 사용하므로 결과가 변하지 않는다. 정밀도와 일관성 모두 사주가 우위에 있다.

### 무료 사주 궁합 사이트 중 어디가 가장 정확한가?

정확한 사주 궁합 사이트는 세 가지 조건을 갖춰야 한다: (1) 진태양시 보정을 위해 출생 도시를 묻는다, (2) 점수 하나가 아니라 일간·오행·합충·용신·대운 5단계 구조 분석을 제공한다, (3) 고전 출처를 인용한다. SajuAstrology.com은 이 세 가지를 모두 무료로 제공하며, 신용카드 입력이나 회원가입을 요구하지 않는다.

### SajuAstrology는 정말 무료인가?

기본 사주 궁합 분석은 완전 무료다. 신용카드 입력 없이, 트라이얼 없이, 결과 중간에 결제창 없이 바로 받아볼 수 있다. 더 깊이 있는 유료 분석($9.99 1회 결제)과 마스터 컨설테이션($29.99)은 별도로 있지만, 기본 궁합과 사주 분석은 영구 무료다.

### 사주 궁합 결과가 안 좋으면 헤어져야 하나?

아니다. "궁합이 낮다"는 결과는 "두 사람 사이에 특정한 마찰 패턴이 있다"는 의미이지, "헤어져야 한다"는 의미가 아니다. 어려운 궁합인데도 그 패턴을 **이해하고 있는 커플**이, 쉬운 궁합이라 관계 기술을 키울 필요가 없었던 커플보다 오래 가는 경우가 많다. 사주 궁합은 정보이고, 결정은 본인 몫이다.

### 사주 궁합 보려면 시간을 정확히 알아야 하나?

가장 정확한 분석을 위해선 그렇다. 시주(時柱)는 사주 4기둥 중 하나라서 빠지면 분석 깊이가 떨어진다. 다만 출생 시간을 모르더라도 SajuAstrology에서 연·월·일만으로도 의미 있는 궁합 분석을 제공한다. 시간 관련 인사이트(시주 상호작용, 대운 정밀도)만 다소 덜 구체적이게 된다.

### 사주와 일본 시추스이메이, 중국 명리는 같은가?

세 체계 모두 천간·지지 기반 사주(四柱) 계산이라는 동일한 수학적 틀을 공유한다. 다만 해석 강조점이 다르다 — 한국 사주는 용신 분석을 중시하고, 중국 명리는 격국(格局) 구조 분석에 비중을 두며, 일본 시추스이메이는 불교·신토 우주관과 결합된다. SajuAstrology는 한국식 방법론을 다국어로 제공한다.

## 무료 궁합 보기 — 30초면 끝난다

너랑 상대의 생년월일시만 있으면 30초 안에 사주 궁합 결과를 받아볼 수 있다. 우리는:

- **진태양시 보정**을 한다 (그래서 출생 도시를 물어본다)
- **5개 고전 원전(자평진전, 적천수, 궁통보감, 연해자평, 격국용신)에서 562개 핵심 구절을 벡터화**해서 너의 차트에 매칭한다
- 결과는 점수 하나가 아니라 **구조적 분석** — 어디서 합이 좋고, 어디서 마찰이 있고, 어떤 영역에서 서로를 보완하고, 어떤 시기에 더 신경 써야 하는지 다 나온다
- **무료다.** 신용카드 안 묻고, 트라이얼도 없고, 중간에 결제창도 안 뜬다

MBTI로는 못 본 너의 패턴, 별자리로는 손가락 사이로 빠져나가던 그 디테일을, 5,000년 동안 누군가가 이미 관찰해서 정리해놨다.

이번엔 진짜로 한 번 봐라. 30초면 된다.
`,
  },

  // 4. [JA] kankokushiki-shichusuimei-aishou-shindan
  {
    slug: "kankokushiki-shichusuimei-aishou-shindan",
    title: "韓国式四柱推命の相性診断 — 西洋占星術より518,400倍正確と言われる理由を解説",
    description: "韓国式四柱推命(사주)の相性診断が西洋占星術より精密な理由、本物の相性診断が見ている5層、信頼できるサービスの見分け方を完全解説。無料で相性を確認可能。",
    date: "2026-04-08",
    readTime: "10分",
    category: "相性診断",
    keywords: ["四柱推命 相性","韓国式 占い","サジュ 相性","韓国 四柱推命","相性診断"],
    locale: "ja",
    content: `# 韓国式四柱推命の相性診断 — 西洋占星術より518,400倍正確と言われる理由を解説

> **TL;DR**: 韓国式四柱推命(사주)は生年月日時から518,400通りの命式を生成 — MBTIの32,400倍の精度。SajuAstrologyは真太陽時補正と562節の古典引用を含む相性診断を無料で提供。

「四柱推命の相性って実際どうなの?」「西洋占星術や星座占いと何が違うの?」

最近、韓国カルチャーへの関心の高まりと共に、韓国式の四柱推命(韓国では「사주 / Saju」と呼ばれる)で相性を見る人が日本でも急速に増えています。SNSでは「サジュ相性診断」「韓国式相性占い」というキーワードの検索数が前年比で大幅に伸びています。

ただ — そのほとんどが、**本物の四柱推命相性診断とは別物**です。点数が一つ出てきて「あなたたちは87点の相性です!」で終わるものは、ほぼ全て自動生成された雛形に過ぎません。

この記事では、本物の四柱推命相性診断が何を見ているのか、なぜ西洋占星術より圧倒的に精密なのか、そして自分の相性を本当の意味で読み解く方法を、上から順に解説していきます。

## 答え:韓国式四柱推命の相性診断とは何か

韓国式四柱推命の相性診断(韓国語で「궁합 / クンハプ」、日本語で「相性 / アイショウ」)は、二人の生年月日時から計算された命式(年柱・月柱・日柱・時柱)に含まれる五行(木・火・土・金・水)が互いにどう作用するかを5つの層で分析する体系です。西洋占星術(12星座)やMBTI(16タイプ)と異なり**518,400通りの固有命式**を区別し、自己申告ではなく客観的な出生時刻を基にします。SajuAstrologyでは真太陽時補正と古典5原典の引用を含む相性診断を無料で提供しています。

## 四柱推命の相性が「518,400倍」精密と言われる根拠

まず数字の話から。

西洋占星術は人類全体を**12星座**に分類します。世界人口を12で割ると、あなたの星座は約6億7千万人と共有していることになります。「あなたは射手座だから〜」という分析は、アメリカとカナダとメキシコを合わせた人口に同じことを言っているのと同じです。

四柱推命は違います。生年・月・日・**時刻**まで使い、それぞれを天干(10種)と地支(12種)の組み合わせで表現します。年柱・月柱・日柱・時柱 — 4本の柱、合計8文字。可能な組み合わせは:

**518,400通り**

つまり四柱推命の解像度は、星座占いの**約43,200倍**、MBTIの**32,400倍**です。あなたと完全に同じ命式を持つ人は、地球上に約15,000人。日本国内に絞れば数十人程度です。事実上、あなた個人の指紋に近いレベルの精度です。

## 一目でわかる:MBTI vs 西洋占星術 vs 韓国式四柱推命

| 比較項目 | MBTI | 西洋占星術 | 韓国式四柱推命 (SajuAstrology) |
|---|---|---|---|
| タイプ数 | 16 | 12 | 518,400 |
| 入力方法 | 自己申告アンケート | 出生月 | 出生年・月・日・時刻 + 都市 |
| 再検査の一貫性 | 約60% | 100%(不変) | 100%(不変) |
| 分析方式 | 4軸タイプ論 | 太陽位置 | 命式 + 五行 + 合冲 + 用神 + 大運 |
| 出典引用 | ユング心理学 | バビロニア占星術 | 古典5原典 562節 |
| 相性分析 | 16x16マッチング表 | 12x12シンプル相性 | 5層構造分析 |
| 無料診断 | 可(16personalities等) | 多数 | 無料(SajuAstrology.com) |

## なぜ「日本の四柱推命」と「韓国の四柱推命」が違うのか

日本にも四柱推命の伝統はあります。ただし、韓国式(사주)と日本の伝統的な四柱推命には、実は重要な違いがいくつかあります。

**第一に、用神(ようじん)重視の度合い**。韓国の四柱推命は、命式全体のバランスを取るために必要な「用神」を見極めることに極めて重きを置きます。これは命主が必要としている五行を特定する作業で、相性診断においても「相手があなたの用神を持っているか」が最重要ポイントの一つです。

**第二に、現代化の度合い**。韓国では1990年代以降、四柱推命の体系化と現代的解釈の研究が活発で、現代心理学やライフコーチング的な文脈との接続が進んでいます。日本の四柱推命がやや伝統色を強く保っているのと対照的です。

**第三に、AI/データサイエンスとの統合**。韓国のテック業界では、四柱推命の古典562節をベクトル化してRAG(検索拡張生成)パイプラインで個人の命式と照合する技術が実用段階に入っています。本記事の運営元であるSajuAstrologyもこの技術で動いています。これは日本ではまだほぼ見られない取り組みです。

## 相性診断 — 韓国式四柱推命では何を見るのか

「相性が良い・悪い」という二元論ではありません。本物の韓国式相性診断では、最低でも以下の5つの層を分析します。

### 1. 日干(にっかん)の関係 — 最重要

日柱の天干、つまり「日干」があなた自身の本質を表す最も重要な文字です。あなたの日干と相手の日干がどう交わるか — これが相性の見出しです。

**相生(そうしょう)関係**: 一方の日干が他方を生み出す関係。例えば木が火を生む、火が土を生むという五行の流れ。自然と互いを支え合う関係になります。

**相剋(そうこく)関係**: 一方が他方を制する関係。例えば金が木を切る、水が火を消すという関係。緊張感のある関係です。良い意味の刺激にもなり得るし、慢性的な葛藤に固定化することもあります。

**比肩(ひけん)関係**: 日干が同じ五行同士。お互いを深く理解できる反面、譲らない時はお互い譲らないため、摩擦も生まれやすい関係です。

### 2. 五行のバランス — 補完性の発見

それぞれの命式に含まれる**木・火・土・金・水**の五行が、どんな比率で入っているかを見ます。

本当に長く続く相性の核心は、**あなたに足りない五行を相手が豊富に持っている**ことです。あなたに不足している五行を相手が補ってくれる時、その人と一緒にいると「自分の中で眠っていた何かが目を覚ます」感覚を得ます。

これを四柱推命では**用神関係**と呼びます。最も希少で、最も強力な相性パターンです。

### 3. 地支の合冲(ごうちゅう) — 化学反応のパターン

地支(ちし)同士の結合と衝突のパターンも見ます。

**六合(りくごう)**: 6つの特定の地支ペアが特別に調和する組み合わせ。日支に六合がある二人は、初対面から不思議な居心地の良さを感じることが多いです。

**三合(さんごう)**: 3つの地支が三角形状に強く結びつくパターン。部分三合だけでも「この人とは何故か通じる」という感覚を生みます。

**六冲(りくちゅう)**: 真逆の地支がぶつかる組み合わせ。刺激が強い。冲があるカップルは、冲のせいで惹かれる場合と、冲のせいで別れる場合が両方あります。どちらに転ぶかは、その人たちが冲をどう扱うかで決まります。

**刑(けい)・害(がい)・破(は)**: それぞれ別種の弱い不調和パターン。微細な圧迫、小さな損傷、外部環境の不安定として現れます。

### 4. 大運(たいうん) — タイミングの問題

四柱推命は静的な命式ではありません。10年単位で流れる**大運**があり、同じ人でもこの10年と次の10年では運気の質が変わります。

二人の大運がどのフェーズにあるかで、同じ相性でも作用の仕方が変わります。両方が良い大運期にある二人が出会えば、長く続く関係になりやすい。片方が困難な大運期に出会うと、同じ相性でも崩れやすい。タイミングは想像以上に重要です。

### 5. 真太陽時補正 — これがないと全部無意味

技術的な話ですが、決定的に重要な部分です。

あなたの出生証明書には「午後2時」と書かれているかもしれません。しかし日本標準時は東京の経度を基準にしていて、北海道や九州、沖縄では実際の太陽位置と数十分の差があります。これを補正しないと**時柱**が変わってしまい、命式全体が別物になります。

**出生地(都市名)を聞かない四柱推命サイトは、真太陽時補正をしていないサイト**です。技術的に間違った命式で相性を見ている可能性が高いということです。

## 「相性が悪い」という結果の本当の意味

ここが一番大事なので、太字にします。

**「相性が低い」という結果は「別れた方がいい」という意味ではありません。**

それは「あなたたちの間には、見えないままにしておくとお互いを消耗させる特定の摩擦パターンが存在する」という意味です。難しい相性のカップルでも、自分たちのパターンを**理解している**カップルは、簡単な相性で楽さに甘えて関係スキルを磨かなかったカップルより長く続くことが多いです。

そして — **「相性が良い」という結果も「楽な恋愛になる」という意味ではありません。**

それは「自然な化学反応は強い」という意味で、それでも相性の良いカップルもまた、二人の人間が一つの人生を共有するという仕事をする必要があります。

相性診断は**情報**です。決断はあなたのものです。

## 韓国式四柱推命の相性診断 — 信頼できる本物の見分け方

相性診断サービスを選ぶ前のチェック項目を3つ:

**出生都市を聞いてくるか?** 聞かないなら真太陽時補正をしていません。スキップしましょう。

**古典の出典を引用しているか?** 四柱推命には2,000年の文献的伝統があります。本物の相性診断は、子平真詮、滴天髓、窮通宝鑑、淵海子平など、特定の古典の節に遡れる根拠を持っているはずです。出典を隠すサービスは、出典を持っていません。

**「なぜそうなるのか」を説明しているか?** 「あなたたちは合いません」は診断ではありません。「あなたの日干は陽火、相手の日干は陽水で相剋関係にあり、長期計画の領域で衝突が出やすい一方、月柱に六合があるため感情的安定感は強い」 — これが診断です。

## よくある質問(FAQ)

### 韓国式四柱推命と日本の四柱推命は何が違いますか?

両者は同じ天干・地支体系を共有しますが、解釈の重点が異なります。韓国式は用神(命式が必要としている五行)分析を最重要視し、現代心理学的な解釈との統合が進んでいます。日本の四柱推命は伝統的な格局論を重視する傾向があります。SajuAstrologyは韓国式方法論を10ヶ国語で提供しています。

### 相性診断は無料で本当に正確に受けられますか?

はい、信頼できる無料の相性診断は3つの条件を満たすべきです:(1)真太陽時補正のため出生都市を聞く、(2)点数ではなく日干・五行・合冲・用神・大運の5層構造分析を提供する、(3)古典出典を引用する。SajuAstrology.comはこの3つを全て無料で提供し、クレジットカード入力や会員登録は不要です。

### サジュ相性診断はMBTI相性より正確ですか?

精度の点では明確に上です。MBTIは16タイプ、サジュは518,400通り — 32,400倍の解像度差があります。さらにMBTIは自己申告アンケートで結果が時期により変わりますが、サジュは固定された出生時刻を使うため結果が一貫します。客観性と精密性の両面でサジュが優位です。

### 「相性が悪い」と出たら別れるべきですか?

いいえ。「相性が低い」という結果は「あなたたちの間に特定の摩擦パターンが存在する」という意味で、「別れるべき」という意味ではありません。難しい相性でもそのパターンを理解しているカップルが、楽な相性で関係スキルを磨かなかったカップルより長く続くことが多いです。診断は情報、決断はあなたのものです。

### 出生時間が分からなくても相性診断できますか?

最も精密な分析には出生時間が必要ですが、不明でもSajuAstrologyは年・月・日のデータから意味のある相性分析を生成できます。ただし時柱関連のインサイトと大運の精度はやや低くなります。

### サジュ相性診断はどのくらい時間がかかりますか?

AI技術を活用した最新の相性診断は、生年月日を入力してから約30秒で完成します。伝統的な対面占い師による診断は1〜2時間かかることもありますが、計算の正確性自体は同じです。違いは解釈の深さとパーソナライズの度合いです。

## 無料で本物の相性診断を試す

あなたと相手の生年月日時だけあれば、30秒で韓国式四柱推命の相性結果を見られます。SajuAstrologyでは:

- **真太陽時補正**を行います(出生都市を聞くのはこのため)
- **5つの古典原典の562節をベクトル化**し、あなたの命式と照合します
- 結果は点数ではなく**構造的な分析** — どこで調和し、どこで摩擦が生じ、どの領域で互いを補完し、どの時期に注意が必要かが全て出ます
- **完全無料**。クレジットカード入力なし、トライアルなし、途中の課金画面なし

5,000年の観察を、AIで再構築した次世代の四柱推命相性診断 — 一度試してみてください。
`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}

// Sorted by date desc (newest first) for blog list display.
// Use this in components/blog/blog-list.tsx; keep BLOG_POSTS for getBySlug/sitemap/etc.
export const BLOG_POSTS_SORTED: BlogPost[] =
  [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
