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
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
