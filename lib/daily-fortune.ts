// Daily Fortune Engine — locale-aware
// No API calls — pure deterministic rotation based on date + element + score

export type DailyFortune = {
  message: string;
  advice: string;
  luckyColor: string;
  luckyColorHex: string;
  luckyDirection: string;
  luckyActivity: string;
  shareText: string;
};

type Tier = "high" | "mid" | "low";

function dateHash(date: Date): number {
  const str = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const FORTUNES: Record<string, Record<Tier, DailyFortune[]>> = {
  wood: {
    high: [
      { message: "Your creative energy peaks today. Ideas that come to you before noon carry the most power.", advice: "Start a new project or pitch an idea.", luckyColor: "Green", luckyColorHex: "#59DE9B", luckyDirection: "East", luckyActivity: "Walking among trees", shareText: "My Wood energy is on fire today 🌿 Creative breakthroughs incoming" },
      { message: "Growth opportunities surround you. A conversation today could open an unexpected door.", advice: "Say yes to spontaneous invitations.", luckyColor: "Teal", luckyColorHex: "#2DD4BF", luckyDirection: "Southeast", luckyActivity: "Morning journaling", shareText: "The cosmos says today is MY day for growth 🌱" },
      { message: "Your natural leadership shines through. Others look to you for direction without being asked.", advice: "Speak up in group settings — your words carry weight.", luckyColor: "Jade", luckyColorHex: "#00A86B", luckyDirection: "East", luckyActivity: "Team collaboration", shareText: "Yang Wood energy is STRONG — born to lead today 甲" },
      { message: "The seeds you planted weeks ago begin to sprout. Watch for results from past efforts.", advice: "Follow up on something you've been waiting on.", luckyColor: "Emerald", luckyColorHex: "#50C878", luckyDirection: "Northeast", luckyActivity: "Gardening or cooking with fresh herbs", shareText: "Past efforts are paying off today — patience wins 🌿" },
      { message: "Your flexibility is your superpower today. Bend without breaking and you'll find the perfect path.", advice: "Adapt your plans rather than forcing them.", luckyColor: "Lime", luckyColorHex: "#84CC16", luckyDirection: "East", luckyActivity: "Stretching or yoga", shareText: "Wood bends but never breaks — today I'm unstoppable 💚" },
      { message: "A burst of creative inspiration arrives in the afternoon. Keep your phone ready to capture ideas.", advice: "Carry a notebook or voice-memo your thoughts.", luckyColor: "Forest green", luckyColorHex: "#228B22", luckyDirection: "Southeast", luckyActivity: "Creative writing or sketching", shareText: "Afternoon inspiration incoming — my Wood element knows 🎋" },
      { message: "Your compassion draws someone who needs guidance. Your natural wisdom helps more than you realize.", advice: "Listen more than you speak today.", luckyColor: "Sage", luckyColorHex: "#9CAF88", luckyDirection: "East", luckyActivity: "Mentoring or teaching", shareText: "My Wood energy heals others today 🌳 Born counselor mode ON" },
      { message: "Expansion energy is strong. Anything you start today has excellent growth potential.", advice: "Launch, publish, or begin — timing favors new starts.", luckyColor: "Spring green", luckyColorHex: "#00FF7F", luckyDirection: "East", luckyActivity: "Starting something new", shareText: "NEW BEGINNINGS energy is maxed out today ☘️" },
      { message: "Your moral compass is perfectly calibrated. Trust your sense of right and wrong today.", advice: "Make that decision you've been postponing.", luckyColor: "Olive", luckyColorHex: "#808000", luckyDirection: "Northeast", luckyActivity: "Decluttering your space", shareText: "Trust the gut today — my Four Pillars confirm it ✅" },
      { message: "Connections between ideas form effortlessly. You see patterns others miss.", advice: "Share your insights — they're more valuable than you think.", luckyColor: "Mint", luckyColorHex: "#98FF98", luckyDirection: "Southeast", luckyActivity: "Brainstorming sessions", shareText: "Pattern recognition: ACTIVATED 🧠🌿" },
    ],
    mid: [
      { message: "Steady growth day. Nothing dramatic, but roots are deepening beneath the surface.", advice: "Focus on consistency over intensity.", luckyColor: "Fern green", luckyColorHex: "#4F7942", luckyDirection: "East", luckyActivity: "Routine maintenance tasks", shareText: "Quiet growth day — building strong roots 🌿" },
      { message: "A good day for nurturing existing relationships rather than starting new ones.", advice: "Reach out to someone you haven't talked to in a while.", luckyColor: "Moss", luckyColorHex: "#8A9A5B", luckyDirection: "Southeast", luckyActivity: "Catching up with old friends", shareText: "Nurture mode: ON. Good energy for deepening bonds 💚" },
      { message: "Your patience is tested but rewarded. The slow path leads somewhere better today.", advice: "Resist the urge to rush. Let things unfold.", luckyColor: "Green", luckyColorHex: "#59DE9B", luckyDirection: "East", luckyActivity: "Reading or studying", shareText: "Patience is my superpower today — Wood energy teaches timing 🎋" },
      { message: "Moderate creative energy. Good for refining existing ideas rather than generating new ones.", advice: "Edit, polish, and improve what you've already started.", luckyColor: "Pistachio", luckyColorHex: "#93C572", luckyDirection: "Northeast", luckyActivity: "Editing and revising", shareText: "Polish day — making good things great 🌱" },
      { message: "Balance between giving and receiving is key today. You tend to give too much.", advice: "Accept help when it's offered.", luckyColor: "Sage", luckyColorHex: "#9CAF88", luckyDirection: "East", luckyActivity: "Self-care rituals", shareText: "Learning to receive today — balance is everything ⚖️🌿" },
      { message: "A stable day for financial decisions. Not the best for risks, but good for saving.", advice: "Review your budget or set up auto-savings.", luckyColor: "Hunter green", luckyColorHex: "#355E3B", luckyDirection: "Southeast", luckyActivity: "Financial planning", shareText: "Steady financial energy today — no big moves, smart moves 💰" },
      { message: "Your body asks for movement today. Physical activity clears mental fog.", advice: "Walk for 20 minutes, preferably near greenery.", luckyColor: "Lime", luckyColorHex: "#84CC16", luckyDirection: "East", luckyActivity: "Outdoor exercise", shareText: "Body says MOVE — and the stars agree 🏃🌿" },
      { message: "Good energy for learning but not for teaching. Absorb before you broadcast.", advice: "Read, listen, or take an online course.", luckyColor: "Teal", luckyColorHex: "#2DD4BF", luckyDirection: "Northeast", luckyActivity: "Learning something new", shareText: "Student mode today — absorbing knowledge like a sponge 📚" },
      { message: "Relationships benefit from honesty today. A gentle truth strengthens bonds.", advice: "Have that conversation you've been avoiding.", luckyColor: "Mint", luckyColorHex: "#98FF98", luckyDirection: "East", luckyActivity: "Honest conversations", shareText: "Truth-telling day — honesty builds trust 🌿💬" },
      { message: "Your environment matters more than usual. Clean space = clear mind today.", advice: "Spend 15 minutes organizing your workspace.", luckyColor: "Emerald", luckyColorHex: "#50C878", luckyDirection: "Southeast", luckyActivity: "Organizing and cleaning", shareText: "Clean space, clear mind — my Wood element demands order 🧹" },
    ],
    low: [
      { message: "Your Wood energy feels compressed today. Growth is paused, not stopped.", advice: "Rest without guilt. Even great trees go dormant.", luckyColor: "Dark green", luckyColorHex: "#006400", luckyDirection: "East", luckyActivity: "Napping or meditation", shareText: "Rest day — even mighty oaks need stillness 🌳💤" },
      { message: "Creativity is blocked but clarity improves. Use this day for analysis, not creation.", advice: "Sort, organize, and plan instead of creating.", luckyColor: "Olive", luckyColorHex: "#808000", luckyDirection: "Northeast", luckyActivity: "Planning and analysis", shareText: "Analysis mode ON — sometimes stopping creates space 🌿" },
      { message: "Metal energy constrains you today. Don't fight it — find the structure within the limitation.", advice: "Work within constraints rather than against them.", luckyColor: "Forest", luckyColorHex: "#228B22", luckyDirection: "East", luckyActivity: "Working within boundaries", shareText: "Constraints breed creativity — using today's limits wisely 🎋" },
      { message: "Low energy doesn't mean low value. Your best insights often come in quiet moments.", advice: "Spend time alone with your thoughts.", luckyColor: "Sage", luckyColorHex: "#9CAF88", luckyDirection: "Southeast", luckyActivity: "Solo reflection", shareText: "Quiet moments hold wisdom — listening today 🌱🤫" },
      { message: "Your liver and eyes need extra care today. Avoid screens after sunset if possible.", advice: "Eat leafy greens and take eye breaks.", luckyColor: "Green", luckyColorHex: "#59DE9B", luckyDirection: "East", luckyActivity: "Digital detox after dinner", shareText: "Self-care priority today — honoring my body 💚" },
      { message: "Social energy is low. Protect your space without apologizing for it.", advice: "Decline invitations that drain you.", luckyColor: "Moss", luckyColorHex: "#8A9A5B", luckyDirection: "East", luckyActivity: "Solitude and quiet", shareText: "Boundaries are self-love — taking space today 🌿🛡️" },
      { message: "Financial caution advised. Not a day for investments or major purchases.", advice: "Save the shopping for another day.", luckyColor: "Dark moss", luckyColorHex: "#4A5D23", luckyDirection: "Northeast", luckyActivity: "Budgeting and saving", shareText: "Wallet stays closed today — the stars recommend patience 💰🌿" },
      { message: "Past regrets may surface. Acknowledge them, then gently release.", advice: "Write down what's bothering you, then close the notebook.", luckyColor: "Fern", luckyColorHex: "#4F7942", luckyDirection: "East", luckyActivity: "Journaling", shareText: "Releasing what no longer serves me — lightening the load 🍃" },
      { message: "Your usual flexibility feels stiff. That's okay — sometimes stillness is the answer.", advice: "Do gentle stretching before bed tonight.", luckyColor: "Pine", luckyColorHex: "#01796F", luckyDirection: "Southeast", luckyActivity: "Gentle stretching", shareText: "Stillness is strength — resting in my roots today 🌲" },
      { message: "Others may misunderstand you today. Don't over-explain — time will clarify.", advice: "Let misunderstandings resolve naturally.", luckyColor: "Basil", luckyColorHex: "#487800", luckyDirection: "East", luckyActivity: "Patience practice", shareText: "Not everything needs an explanation — trusting the process 🌿" },
    ],
  },
  fire: {
    high: [
      { message: "Your charisma is magnetic today. People are drawn to your warmth without knowing why.", advice: "Use your influence for something meaningful.", luckyColor: "Red", luckyColorHex: "#EF4444", luckyDirection: "South", luckyActivity: "Public speaking or presenting", shareText: "FIRE energy is BLAZING today 🔥 Unstoppable charisma" },
      { message: "Passion and clarity align perfectly. What you desire and what's right are the same thing.", advice: "Chase that goal without hesitation.", luckyColor: "Crimson", luckyColorHex: "#DC143C", luckyDirection: "South", luckyActivity: "Taking bold action", shareText: "Heart and mind aligned — today I GO for it 🔥❤️" },
      { message: "Your enthusiasm ignites others. Watch how your energy transforms the room.", advice: "Lead by inspiration, not instruction.", luckyColor: "Orange-red", luckyColorHex: "#FF4500", luckyDirection: "Southwest", luckyActivity: "Group activities", shareText: "Setting rooms on fire (the good kind) 🔥✨" },
      { message: "Recognition energy is strong. Your efforts are about to be noticed.", advice: "Don't downplay your achievements today.", luckyColor: "Coral", luckyColorHex: "#FF7F50", luckyDirection: "South", luckyActivity: "Showcasing your work", shareText: "Recognition incoming — the cosmos sees my work 🌟🔥" },
      { message: "Romantic energy peaks. If you're looking, today favors bold moves.", advice: "Express your feelings directly.", luckyColor: "Rose red", luckyColorHex: "#C21E56", luckyDirection: "South", luckyActivity: "Date night or confession", shareText: "Fire + romance = TODAY 🔥💕 Bold hearts win" },
      { message: "Your intuition burns through confusion. Trust the first answer that comes to mind.", advice: "Go with your gut on the first decision today.", luckyColor: "Scarlet", luckyColorHex: "#FF2400", luckyDirection: "Southeast", luckyActivity: "Decisive action", shareText: "Intuition is ON FIRE — trusting the spark 🔥⚡" },
      { message: "Competitive energy favors you. Whether sports, business, or games — play to win.", advice: "Bring your A-game to any challenge.", luckyColor: "Flame", luckyColorHex: "#E25822", luckyDirection: "South", luckyActivity: "Competition or sports", shareText: "Competition day — Fire element says I WIN 🏆🔥" },
      { message: "Joy radiates from you today. Share it generously — it multiplies when given away.", advice: "Do something that makes someone else laugh.", luckyColor: "Tangerine", luckyColorHex: "#FF9966", luckyDirection: "Southwest", luckyActivity: "Making others smile", shareText: "Joy machine activated — spreading warmth everywhere 🔥😊" },
      { message: "Creative fire burns clean today. Artistic expression flows without resistance.", advice: "Create something — anything. The medium doesn't matter.", luckyColor: "Ruby", luckyColorHex: "#E0115F", luckyDirection: "South", luckyActivity: "Artistic creation", shareText: "ART MODE: ACTIVATED 🎨🔥 The muse is HERE" },
      { message: "Transformation energy peaks. Something old can be reborn today if you let it.", advice: "Revisit an abandoned project with fresh eyes.", luckyColor: "Phoenix red", luckyColorHex: "#CD2029", luckyDirection: "South", luckyActivity: "Reviving old projects", shareText: "Phoenix energy today — what was dead rises again 🔥🦅" },
    ],
    mid: [
      { message: "Warm, steady fire today. Good for maintaining, not starting. Keep the flame burning.", advice: "Follow through on existing commitments.", luckyColor: "Peach", luckyColorHex: "#FFCBA4", luckyDirection: "South", luckyActivity: "Completing tasks", shareText: "Steady flame today — consistency is power 🕯️" },
      { message: "Your heart is open but your energy is moderate. Choose one person to focus on.", advice: "Quality over quantity in relationships today.", luckyColor: "Salmon", luckyColorHex: "#FA8072", luckyDirection: "Southwest", luckyActivity: "One-on-one time", shareText: "Focusing my fire on one thing today — depth over breadth 🔥" },
      { message: "Good day for planning rather than executing. Map out your next bold move.", advice: "Strategy before action. Plan the fire, then light it.", luckyColor: "Amber", luckyColorHex: "#FFBF00", luckyDirection: "South", luckyActivity: "Strategic planning", shareText: "Planning my next blaze — strategy day 🔥📋" },
      { message: "Moderate inspiration. Good ideas come but need incubation before acting.", advice: "Write ideas down but sleep on them.", luckyColor: "Coral", luckyColorHex: "#FF7F50", luckyDirection: "Southeast", luckyActivity: "Idea journaling", shareText: "Collecting sparks today — the fire comes tomorrow 🌟" },
      { message: "Social energy is pleasant but not explosive. Enjoy company without performing.", advice: "Be present without trying to impress.", luckyColor: "Rose", luckyColorHex: "#FF007F", luckyDirection: "South", luckyActivity: "Casual socializing", shareText: "Chill fire energy — enjoying the warmth 🕯️😌" },
      { message: "Your heart knows something your mind hasn't caught up to yet. Give it time.", advice: "Sit with your feelings before analyzing them.", luckyColor: "Brick", luckyColorHex: "#CB4154", luckyDirection: "South", luckyActivity: "Emotional processing", shareText: "Heart wisdom loading... trusting the process 🔥💭" },
      { message: "Financial energy is neutral. Not the day for big bets, but small investments grow.", advice: "Put a little aside. Small flames build big fires.", luckyColor: "Orange", luckyColorHex: "#FF8C00", luckyDirection: "Southwest", luckyActivity: "Small financial moves", shareText: "Small flames, big future — planting financial seeds 💰🔥" },
      { message: "Your body needs movement to keep the fire circulating. Stillness creates stagnation.", advice: "Even 15 minutes of exercise changes your day.", luckyColor: "Red-orange", luckyColorHex: "#FF5349", luckyDirection: "South", luckyActivity: "Cardio exercise", shareText: "Moving to keep the fire alive — energy follows motion 🏃🔥" },
      { message: "Communication flows smoothly today. Good for emails, calls, and messages.", advice: "Send that message you've been drafting in your head.", luckyColor: "Tangerine", luckyColorHex: "#FF9966", luckyDirection: "South", luckyActivity: "Written communication", shareText: "Words flow like fire today — communicating clearly 📝🔥" },
      { message: "A day to appreciate what you have. Gratitude amplifies Fire energy.", advice: "Name 3 things you're grateful for right now.", luckyColor: "Warm pink", luckyColorHex: "#FF6B81", luckyDirection: "Southeast", luckyActivity: "Gratitude practice", shareText: "Grateful heart = powerful fire 🔥🙏" },
    ],
    low: [
      { message: "Your fire is embers today, not flames. That's where the deepest warmth lives.", advice: "Rest near warmth. Hot drinks, warm blankets, gentle light.", luckyColor: "Burgundy", luckyColorHex: "#800020", luckyDirection: "South", luckyActivity: "Cozy self-care", shareText: "Ember day — the deepest warmth is quiet 🕯️" },
      { message: "Heart energy is low. Protect it. Avoid emotionally draining people today.", advice: "Set boundaries without explanation.", luckyColor: "Dark red", luckyColorHex: "#8B0000", luckyDirection: "Southwest", luckyActivity: "Boundary setting", shareText: "Protecting my fire today — boundaries are love 🔥🛡️" },
      { message: "Your circulation and heart need care today. Move gently and stay warm.", advice: "Avoid cold drinks. Choose warm water and tea.", luckyColor: "Maroon", luckyColorHex: "#800000", luckyDirection: "South", luckyActivity: "Warm beverages and rest", shareText: "Caring for my fire element — warmth heals 🫖❤️" },
      { message: "Confidence dips today but it's temporary. The fire always returns.", advice: "Don't make self-assessments on a low day.", luckyColor: "Rust", luckyColorHex: "#B7410E", luckyDirection: "South", luckyActivity: "Avoiding self-judgment", shareText: "Low flame ≠ no flame — the fire ALWAYS returns 🔥" },
      { message: "Avoid arguments today. Your fire is too low to burn clean — it'll just smoke.", advice: "Postpone difficult conversations to tomorrow.", luckyColor: "Brick", luckyColorHex: "#CB4154", luckyDirection: "Southeast", luckyActivity: "Conflict avoidance", shareText: "Choosing peace over fire today — wisdom wins 🕊️" },
      { message: "Creativity is resting, not gone. Let ideas compost — they'll be richer tomorrow.", advice: "Consume art instead of creating it today.", luckyColor: "Deep rose", luckyColorHex: "#C21E56", luckyDirection: "South", luckyActivity: "Watching films or reading", shareText: "Creative rest day — filling the well 🎬📚" },
      { message: "Loneliness may whisper today. It lies. You are more connected than you feel.", advice: "Send a simple 'thinking of you' text to someone.", luckyColor: "Warm brown", luckyColorHex: "#964B00", luckyDirection: "Southwest", luckyActivity: "Reaching out to loved ones", shareText: "Connection heals — reaching out today 💌" },
      { message: "Decisions feel harder than usual. That's a sign to wait, not to force.", advice: "Delay any major decisions by 24 hours.", luckyColor: "Terracotta", luckyColorHex: "#E2725B", luckyDirection: "South", luckyActivity: "Postponing decisions", shareText: "Delay = wisdom today — no rush 🔥⏳" },
      { message: "Physical energy is low. Honor it. Rest is not laziness — it's fuel.", advice: "Go to bed 30 minutes earlier tonight.", luckyColor: "Dark coral", luckyColorHex: "#CD5B45", luckyDirection: "South", luckyActivity: "Early bedtime", shareText: "Rest IS the work today — recharging my fire 🔥💤" },
      { message: "Your light dims for others to find their own. Sometimes stepping back is a gift.", advice: "Let someone else take the lead today.", luckyColor: "Ash rose", luckyColorHex: "#B5651D", luckyDirection: "Southeast", luckyActivity: "Supporting others quietly", shareText: "Dimming my light so others can shine — that's strength 🌅" },
    ],
  },
  earth: {
    high: [
      { message: "Your stability is a superpower today. Others ground themselves through your presence.", advice: "Hold space for someone who needs it.", luckyColor: "Gold", luckyColorHex: "#F2CA50", luckyDirection: "Center", luckyActivity: "Being a rock for others", shareText: "Mountain energy today — unmovable, unshakeable 🏔️✨" },
      { message: "Practical wisdom peaks. Your solutions are simple, obvious, and exactly right.", advice: "Trust the straightforward answer over the clever one.", luckyColor: "Amber", luckyColorHex: "#FFBF00", luckyDirection: "Southwest", luckyActivity: "Problem-solving", shareText: "Earth wisdom ACTIVATED — simple answers are the right ones 🌍" },
      { message: "Financial energy is excellent. Investments, deals, and negotiations favor you.", advice: "Make that financial move you've been considering.", luckyColor: "Honey", luckyColorHex: "#EB9605", luckyDirection: "Center", luckyActivity: "Financial decisions", shareText: "Earth = wealth energy today — making money moves 💰🌍" },
      { message: "Your nurturing instinct is powerful. Everything you tend to today will flourish.", advice: "Cook for someone. Tend your garden. Care for your space.", luckyColor: "Ochre", luckyColorHex: "#CC7722", luckyDirection: "Southwest", luckyActivity: "Cooking or gardening", shareText: "Whatever I touch today GROWS — nurture energy maxed 🌻" },
      { message: "Building energy peaks. Whether physical or metaphorical, lay foundations today.", advice: "Start a project that requires patience and structure.", luckyColor: "Bronze", luckyColorHex: "#CD7F32", luckyDirection: "Center", luckyActivity: "Building and creating structure", shareText: "FOUNDATION day — building things that LAST 🏗️🌍" },
      { message: "Your reliability draws opportunity. Someone trusts you with something important.", advice: "Accept responsibility — it's a gift, not a burden.", luckyColor: "Sienna", luckyColorHex: "#A0522D", luckyDirection: "Northeast", luckyActivity: "Taking on responsibility", shareText: "Trust = opportunity — my Earth element attracts both 🌍🤝" },
      { message: "Harvest energy arrives. Collect what you've earned. Accept praise gracefully.", advice: "Don't deflect compliments today. Absorb them.", luckyColor: "Wheat", luckyColorHex: "#F5DEB3", luckyDirection: "Center", luckyActivity: "Receiving recognition", shareText: "HARVEST TIME — reaping what I've sown 🌾✨" },
      { message: "Your patience pays dividends. Something you've waited for starts to materialize.", advice: "Stay the course. You're closer than you think.", luckyColor: "Sand", luckyColorHex: "#C2B280", luckyDirection: "Southwest", luckyActivity: "Patience and persistence", shareText: "Patience = my superpower. Earth energy DELIVERS 🏔️" },
      { message: "Physical strength peaks. Your body feels solid and capable.", advice: "Tackle physical tasks or exercise at higher intensity.", luckyColor: "Terracotta", luckyColorHex: "#E2725B", luckyDirection: "Center", luckyActivity: "Physical labor or exercise", shareText: "Earth body STRONG today — feeling solid 💪🌍" },
      { message: "Harmony in your environment creates harmony in your mind. Your space matters today.", advice: "Rearrange, clean, or add beauty to your surroundings.", luckyColor: "Cream", luckyColorHex: "#FFFDD0", luckyDirection: "Center", luckyActivity: "Home improvement", shareText: "Creating beauty in my space — Earth element says NEST 🏡✨" },
    ],
    mid: [
      { message: "Stable, grounded day. Not spectacular but reliable — and that's valuable.", advice: "Focus on tasks that need steady attention.", luckyColor: "Tan", luckyColorHex: "#D2B48C", luckyDirection: "Center", luckyActivity: "Steady focused work", shareText: "Steady day — Earth energy builds quietly 🌍" },
      { message: "Your stomach and digestion need attention today. Eat mindfully.", advice: "Choose warm, cooked foods over raw and cold.", luckyColor: "Yellow", luckyColorHex: "#F2CA50", luckyDirection: "Southwest", luckyActivity: "Mindful eating", shareText: "Nourishing from the inside — Earth element care 🍲" },
      { message: "Good day for maintenance — home, body, relationships, finances.", advice: "Fix something small that's been bugging you.", luckyColor: "Khaki", luckyColorHex: "#C3B091", luckyDirection: "Center", luckyActivity: "Fixing and maintaining", shareText: "Maintenance day — small fixes, big peace 🔧🌍" },
      { message: "Moderate energy for socializing. Prefer small groups over crowds.", advice: "Have a meaningful conversation over a meal.", luckyColor: "Caramel", luckyColorHex: "#FFD59A", luckyDirection: "Southwest", luckyActivity: "Intimate gatherings", shareText: "Small group energy — quality connections today 🌍💛" },
      { message: "Your body holds wisdom today. Physical sensations are reliable guides.", advice: "If something feels wrong in your body, pay attention.", luckyColor: "Honey", luckyColorHex: "#EB9605", luckyDirection: "Center", luckyActivity: "Body awareness", shareText: "Listening to my body today — Earth wisdom speaks through sensation 🌍" },
      { message: "Financial stability is maintained but growth requires patience.", advice: "Review subscriptions and trim unnecessary expenses.", luckyColor: "Beige", luckyColorHex: "#F5F5DC", luckyDirection: "Center", luckyActivity: "Financial review", shareText: "Smart money day — trimming the excess 💰🌍" },
      { message: "Relationships benefit from practical gestures more than grand words.", advice: "Do something helpful for someone — actions speak louder.", luckyColor: "Sand", luckyColorHex: "#C2B280", luckyDirection: "Southwest", luckyActivity: "Acts of service", shareText: "Love in action — Earth element shows care through doing 🤲" },
      { message: "Learning comes through doing today, not reading. Get your hands dirty.", advice: "Practice instead of study. Apply instead of plan.", luckyColor: "Clay", luckyColorHex: "#B66A50", luckyDirection: "Center", luckyActivity: "Hands-on learning", shareText: "Learning by doing — Earth energy says GET STARTED 🌍🔨" },
      { message: "Your opinions carry weight today. When asked, share honestly.", advice: "Don't sugarcoat your feedback — honesty serves better.", luckyColor: "Amber", luckyColorHex: "#FFBF00", luckyDirection: "Northeast", luckyActivity: "Giving honest feedback", shareText: "Honest Earth energy — my words build or break today 🌍💬" },
      { message: "A day for gratitude toward the material world. Appreciate what you have.", advice: "Take inventory of your blessings — literally list them.", luckyColor: "Gold", luckyColorHex: "#F2CA50", luckyDirection: "Center", luckyActivity: "Gratitude journaling", shareText: "Counting blessings today — Earth element is RICH 🌍🙏" },
    ],
    low: [
      { message: "Your foundation feels shaky today. That's a feeling, not a fact.", advice: "Ground yourself: feet on earth, deep breaths, warm food.", luckyColor: "Brown", luckyColorHex: "#8B4513", luckyDirection: "Center", luckyActivity: "Grounding exercises", shareText: "Grounding myself today — feet on the earth 🌍🧘" },
      { message: "Worry about security may surface. Most of it is projection, not reality.", advice: "Check your bank balance to calm your mind. Facts > feelings.", luckyColor: "Dark sand", luckyColorHex: "#967117", luckyDirection: "Southwest", luckyActivity: "Reality-checking worries", shareText: "Facts over fears today — Earth element stays rational 🌍" },
      { message: "Digestive system is sensitive. Be gentle with food choices.", advice: "Avoid spicy, cold, and processed food today.", luckyColor: "Tan", luckyColorHex: "#D2B48C", luckyDirection: "Center", luckyActivity: "Gentle eating", shareText: "Treating my stomach kindly — Earth body needs care 🍵" },
      { message: "Overthinking blocks action. Your Earth energy is stuck in the planning phase.", advice: "Do one small thing instead of planning ten big things.", luckyColor: "Mud", luckyColorHex: "#70543E", luckyDirection: "Center", luckyActivity: "Taking small action", shareText: "One step > ten plans — Earth energy needs movement 🌍👣" },
      { message: "Social energy is low. That's your Earth telling you to recharge in solitude.", advice: "Cancel optional plans without guilt.", luckyColor: "Soil", luckyColorHex: "#6B4226", luckyDirection: "Southwest", luckyActivity: "Solitude and rest", shareText: "Solo recharge mode — Earth element refuels in quiet 🌍🤫" },
      { message: "Control feels important but isn't available today. Practice letting go.", advice: "Release one thing you're trying to control.", luckyColor: "Dust", luckyColorHex: "#B5A642", luckyDirection: "Center", luckyActivity: "Letting go exercises", shareText: "Releasing control — Earth teaches surrender too 🌍🙌" },
      { message: "Physical heaviness signals the need for lighter movement, not harder effort.", advice: "Walk slowly rather than run. Swim rather than lift.", luckyColor: "Sandstone", luckyColorHex: "#786D5F", luckyDirection: "Center", luckyActivity: "Gentle movement", shareText: "Moving gently today — heavy doesn't mean stuck 🌍🚶" },
      { message: "Old patterns surface. Notice them without judgment. Awareness is enough.", advice: "Name the pattern. That alone weakens it.", luckyColor: "Dark amber", luckyColorHex: "#B8860B", luckyDirection: "Southwest", luckyActivity: "Self-observation", shareText: "Seeing old patterns clearly — awareness heals 🌍👁️" },
      { message: "Material desires feel urgent but aren't. What you truly need, you already have.", advice: "Before buying anything, wait 24 hours.", luckyColor: "Dark gold", luckyColorHex: "#AA8C2C", luckyDirection: "Center", luckyActivity: "Mindful consumption", shareText: "I have enough — Earth element teaches contentment 🌍✨" },
      { message: "Your Earth needs Water today. Hydrate heavily and seek reflective spaces.", advice: "Drink more water than usual. Visit water if possible.", luckyColor: "Wet sand", luckyColorHex: "#96856C", luckyDirection: "Center", luckyActivity: "Hydration and water visits", shareText: "Water feeds Earth — hydrating and flowing today 💧🌍" },
    ],
  },
  metal: {
    high: [
      { message: "Your mind is a blade today. Cut through confusion and see the truth.", advice: "Make the decision you've been postponing. You see clearly.", luckyColor: "Silver", luckyColorHex: "#C0C0C0", luckyDirection: "West", luckyActivity: "Decision-making", shareText: "CLARITY MODE — Metal element sees EVERYTHING today ⚔️" },
      { message: "Precision and quality peak. Everything you do today has a polished edge.", advice: "Focus on quality over quantity. Do less, but perfectly.", luckyColor: "Platinum", luckyColorHex: "#E5E4E2", luckyDirection: "West", luckyActivity: "Craftsmanship and detail work", shareText: "Precision peaks — Metal energy polishes everything ✨" },
      { message: "Justice energy is strong. Right and wrong are crystal clear.", advice: "Stand up for what's fair, even if it's uncomfortable.", luckyColor: "Steel", luckyColorHex: "#71797E", luckyDirection: "Northwest", luckyActivity: "Advocacy and fairness", shareText: "Justice is CLEAR today — standing for what's right ⚖️" },
      { message: "Financial acumen peaks. Your instinct for value is exceptionally sharp.", advice: "Negotiate, compare deals, or review investments.", luckyColor: "Gold-silver", luckyColorHex: "#CFB53B", luckyDirection: "West", luckyActivity: "Financial analysis", shareText: "Money instinct SHARP — Metal energy reads value perfectly 💰" },
      { message: "Your words carry authority. Speak with confidence — people listen and act.", advice: "Present, pitch, or propose. Your timing is excellent.", luckyColor: "White gold", luckyColorHex: "#EBEBEB", luckyDirection: "West", luckyActivity: "Presentations and pitches", shareText: "Authority mode ON — Metal element commands attention 🎤" },
      { message: "Letting go is powerful today. Release what no longer serves with surgical precision.", advice: "End one thing cleanly. No loose ends.", luckyColor: "Chrome", luckyColorHex: "#DBE4EB", luckyDirection: "Northwest", luckyActivity: "Ending and releasing", shareText: "Clean cuts only — Metal element releases with grace ✂️" },
      { message: "Detail orientation peaks. You notice what everyone else misses.", advice: "Proofread, debug, audit, or inspect. Find the flaw others can't.", luckyColor: "Titanium", luckyColorHex: "#878681", luckyDirection: "West", luckyActivity: "Auditing and reviewing", shareText: "Nothing escapes my eye today — Metal precision 🔍" },
      { message: "Discipline comes effortlessly. Hard tasks feel achievable.", advice: "Tackle your most dreaded task first. You'll crush it.", luckyColor: "Iron", luckyColorHex: "#4A4A4A", luckyDirection: "West", luckyActivity: "Difficult tasks", shareText: "Eating the frog FIRST — discipline is my weapon ⚔️" },
      { message: "Your aesthetic sense is heightened. Beauty and order call to you.", advice: "Create order and beauty wherever you can today.", luckyColor: "Pearl", luckyColorHex: "#FDEEF4", luckyDirection: "Northwest", luckyActivity: "Aesthetic arrangement", shareText: "Beauty and order — Metal element demands elegance ✨" },
      { message: "A contract, agreement, or commitment favors you today.", advice: "Sign, agree, or commit to something formal.", luckyColor: "Silver", luckyColorHex: "#C0C0C0", luckyDirection: "West", luckyActivity: "Formal agreements", shareText: "Commitment energy — signing and sealing today 📝✨" },
    ],
    mid: [
      { message: "Steady analytical energy. Good for systematic work that needs patience.", advice: "Work through your checklist methodically.", luckyColor: "Gray", luckyColorHex: "#808080", luckyDirection: "West", luckyActivity: "Systematic work", shareText: "Steady Metal energy — one step at a time ⚙️" },
      { message: "Your lungs and skin need attention. Breathe deeply and moisturize.", advice: "Step outside for 5 minutes of fresh air.", luckyColor: "Light gray", luckyColorHex: "#D3D3D3", luckyDirection: "West", luckyActivity: "Breathing exercises", shareText: "Breathing deeply — Metal element needs fresh air 🌬️" },
      { message: "Good day for organizing digital and physical spaces.", advice: "Delete 20 photos, unsubscribe from 5 emails, tidy one drawer.", luckyColor: "Silver", luckyColorHex: "#C0C0C0", luckyDirection: "Northwest", luckyActivity: "Digital decluttering", shareText: "Digital detox day — clearing space for clarity 🗂️" },
      { message: "Conversations benefit from brevity. Say what you mean, nothing more.", advice: "Edit your words before speaking. Less is more.", luckyColor: "Pewter", luckyColorHex: "#96A8A1", luckyDirection: "West", luckyActivity: "Concise communication", shareText: "Less words, more meaning — Metal energy edits today ✂️" },
      { message: "Moderate discipline available. Use it for habits, not heroics.", advice: "Maintain your routine. That alone is enough.", luckyColor: "Aluminum", luckyColorHex: "#A9A9A9", luckyDirection: "West", luckyActivity: "Routine maintenance", shareText: "Routine is power — Metal keeps the system running ⚙️" },
      { message: "Your critical eye serves you well for self-improvement, but go easy on others.", advice: "Critique your own work, praise someone else's.", luckyColor: "Nickel", luckyColorHex: "#727472", luckyDirection: "Northwest", luckyActivity: "Self-improvement", shareText: "Refining myself, accepting others — balanced Metal energy ⚖️" },
      { message: "Nostalgia may arise. Honor the past without clinging to it.", advice: "Look at old photos, smile, then look forward.", luckyColor: "Antique silver", luckyColorHex: "#7B8788", luckyDirection: "West", luckyActivity: "Honoring memories", shareText: "Beautiful memories, brighter future — Metal reflects 🪞" },
      { message: "Moderate financial energy. Good for saving, cautious with spending.", advice: "Transfer a small amount to savings.", luckyColor: "Coin gold", luckyColorHex: "#CD7F32", luckyDirection: "West", luckyActivity: "Saving money", shareText: "Saving mode — Metal element builds reserves 💰" },
      { message: "Your body benefits from structure today. Regular meals, regular sleep.", advice: "Eat three proper meals at consistent times.", luckyColor: "Slate", luckyColorHex: "#708090", luckyDirection: "West", luckyActivity: "Structured routine", shareText: "Structure = health today — Metal body needs rhythm 🕐" },
      { message: "Good energy for contracts and paperwork. Attention to detail catches errors.", advice: "Read the fine print on anything you sign.", luckyColor: "Steel blue", luckyColorHex: "#4682B4", luckyDirection: "Northwest", luckyActivity: "Paperwork and contracts", shareText: "Reading the fine print — Metal eye misses nothing 📄🔍" },
    ],
    low: [
      { message: "Your inner critic is loud today. Acknowledge it, then mute it.", advice: "For every self-criticism, counter with one genuine strength.", luckyColor: "Dark gray", luckyColorHex: "#4A4A4A", luckyDirection: "West", luckyActivity: "Self-compassion practice", shareText: "Muting the critic — self-kindness today 🤍" },
      { message: "Grief or loss may surface. Metal carries autumn energy — let things fall.", advice: "It's okay to feel sad without a reason. Let it pass.", luckyColor: "Charcoal", luckyColorHex: "#36454F", luckyDirection: "West", luckyActivity: "Emotional release", shareText: "Autumn energy — letting things fall naturally 🍂" },
      { message: "Breathing feels constricted. Your lungs ask for expansion.", advice: "Practice 4-7-8 breathing: inhale 4, hold 7, exhale 8.", luckyColor: "Fog", luckyColorHex: "#C0C0C0", luckyDirection: "Northwest", luckyActivity: "Breathing techniques", shareText: "Expanding my breath — Metal element needs air 🌬️" },
      { message: "Perfectionism blocks progress. Done is better than perfect today.", advice: "Submit, send, or finish something at 80% quality.", luckyColor: "Ash", luckyColorHex: "#B2BEB5", luckyDirection: "West", luckyActivity: "Finishing imperfect work", shareText: "80% done > 100% planned — releasing perfectionism today 📤" },
      { message: "Isolation beckons but connection heals. Choose one person to reach out to.", advice: "One text, one call. Small connection beats big solitude.", luckyColor: "Storm gray", luckyColorHex: "#717D7E", luckyDirection: "West", luckyActivity: "Small connection", shareText: "One reach-out changes everything — choosing connection 📱" },
      { message: "Rigidity causes friction today. Soften your expectations of others.", advice: "Allow someone to do things their way, even if it's not yours.", luckyColor: "Smoke", luckyColorHex: "#738276", luckyDirection: "Northwest", luckyActivity: "Practicing flexibility", shareText: "Flexibility challenge — softening the Metal edge 🌊" },
      { message: "Skin and allergies may act up. Your body's Metal is processing something.", advice: "Hydrate skin and reduce processed foods.", luckyColor: "Pale silver", luckyColorHex: "#D4D4D4", luckyDirection: "West", luckyActivity: "Skin care", shareText: "Body care priority — Metal element speaks through skin 🧴" },
      { message: "Value feels unclear today. What matters? The answer returns tomorrow.", advice: "Don't reassess your life on a low day. Just rest.", luckyColor: "Gunmetal", luckyColorHex: "#2C3539", luckyDirection: "West", luckyActivity: "Rest without reassessing", shareText: "Not making life decisions today — rest now, clarity later 😌" },
      { message: "Your standards feel impossibly high. Lower the bar just for today.", advice: "Give yourself permission to be average at something.", luckyColor: "Lead", luckyColorHex: "#6B6B6B", luckyDirection: "Northwest", luckyActivity: "Self-permission to be human", shareText: "Permission to be imperfect — and that's MORE than enough 🤍" },
      { message: "Metal is heavy today. Lighten the load — literally and figuratively.", advice: "Give away one thing you don't need. Physical or emotional.", luckyColor: "Tarnished silver", luckyColorHex: "#8A8D8F", luckyDirection: "West", luckyActivity: "Lightening the load", shareText: "Letting go of weight — Metal gets lighter 🪶" },
    ],
  },
  water: {
    high: [
      { message: "Your intuition is a river today — flowing, powerful, and absolutely right.", advice: "Follow your first instinct without second-guessing.", luckyColor: "Deep blue", luckyColorHex: "#3B82F6", luckyDirection: "North", luckyActivity: "Trusting intuition", shareText: "INTUITION MAXED OUT — Water energy flows perfectly 🌊" },
      { message: "Wisdom pours through you. Others seek your counsel, and you have answers.", advice: "Share your perspective freely — it's needed.", luckyColor: "Navy", luckyColorHex: "#000080", luckyDirection: "North", luckyActivity: "Mentoring and advising", shareText: "Wisdom overflow — Water element channels ancient knowing 🌊🧠" },
      { message: "Adaptability peaks. You navigate obstacles like water around rocks.", advice: "When blocked, flow around it. Never force.", luckyColor: "Ocean blue", luckyColorHex: "#4F93CE", luckyDirection: "Northwest", luckyActivity: "Creative problem-solving", shareText: "Water finds a way — ALWAYS 🌊💪" },
      { message: "Deep connections form today. Conversations go to meaningful depths.", advice: "Ask someone 'how are you really doing?' and listen.", luckyColor: "Aquamarine", luckyColorHex: "#7FFFD4", luckyDirection: "North", luckyActivity: "Deep conversations", shareText: "Deep talk energy — Water element goes beneath the surface 🌊💙" },
      { message: "Hidden knowledge surfaces. Dreams, hunches, and subtle signs carry truth.", advice: "Pay attention to recurring thoughts — they're messages.", luckyColor: "Sapphire", luckyColorHex: "#0F52BA", luckyDirection: "North", luckyActivity: "Dream journaling", shareText: "Hidden truths surfacing — Water reveals what was hidden 🌊🔮" },
      { message: "Financial flow improves. Money moves toward you through unexpected channels.", advice: "Be open to income from unusual sources.", luckyColor: "Cerulean", luckyColorHex: "#007BA7", luckyDirection: "Northwest", luckyActivity: "Financial openness", shareText: "Money flowing IN — Water element attracts abundance 💰🌊" },
      { message: "Your emotional intelligence peaks. You read rooms and people flawlessly.", advice: "Use this gift to heal a relationship or close a deal.", luckyColor: "Teal", luckyColorHex: "#008080", luckyDirection: "North", luckyActivity: "Emotional navigation", shareText: "Reading the room PERFECTLY — Water EQ is unmatched 🌊👁️" },
      { message: "Communication flows like poetry. Your words carry weight and beauty.", advice: "Write something important — a letter, proposal, or confession.", luckyColor: "Royal blue", luckyColorHex: "#4169E1", luckyDirection: "North", luckyActivity: "Writing", shareText: "Words flow like water — writing with power today 🌊✍️" },
      { message: "Healing energy is strong. Physical and emotional recovery accelerates.", advice: "Rest accelerates healing today. Don't push through pain.", luckyColor: "Sky blue", luckyColorHex: "#87CEEB", luckyDirection: "Northwest", luckyActivity: "Active rest and healing", shareText: "Healing acceleration — Water mends what was broken 🌊💙" },
      { message: "Creative flow state is accessible today. Art, music, writing — dive in.", advice: "Block 2 hours for uninterrupted creative work.", luckyColor: "Cobalt", luckyColorHex: "#0047AB", luckyDirection: "North", luckyActivity: "Deep creative work", shareText: "FLOW STATE activated — Water + Creativity = magic 🌊🎨" },
    ],
    mid: [
      { message: "Gentle, reflective energy. Good for thinking, not for acting.", advice: "Reflect before you react to anything today.", luckyColor: "Light blue", luckyColorHex: "#ADD8E6", luckyDirection: "North", luckyActivity: "Reflection and journaling", shareText: "Reflection day — Water teaches patience 🌊" },
      { message: "Kidney and bladder energy needs support. Hydrate generously.", advice: "Drink 8 glasses of water. Your body is asking.", luckyColor: "Blue", luckyColorHex: "#3B82F6", luckyDirection: "North", luckyActivity: "Staying hydrated", shareText: "Hydration priority — Water element says DRINK 💧" },
      { message: "Moderate intuition. Feelings are partially reliable — verify before acting.", advice: "Trust but verify. Feel but then fact-check.", luckyColor: "Periwinkle", luckyColorHex: "#CCCCFF", luckyDirection: "Northwest", luckyActivity: "Balanced decision-making", shareText: "Trust but verify — Water wisdom today 🌊🔍" },
      { message: "Good day for learning and absorbing new information.", advice: "Read, podcast, or learn something that excites you.", luckyColor: "Ice blue", luckyColorHex: "#99CCFF", luckyDirection: "North", luckyActivity: "Learning and studying", shareText: "Knowledge absorption mode — Water soaks it all in 📚🌊" },
      { message: "Relationships flow at a comfortable pace. No urgency, no pressure.", advice: "Enjoy the calm. Not every day needs intensity.", luckyColor: "Powder blue", luckyColorHex: "#B0E0E6", luckyDirection: "North", luckyActivity: "Easy socializing", shareText: "Calm waters — enjoying the peace today 🌊😌" },
      { message: "Sleep quality matters more than usual. Your Water replenishes in deep rest.", advice: "No screens 30 min before bed. Let sleep heal you.", luckyColor: "Midnight blue", luckyColorHex: "#191970", luckyDirection: "North", luckyActivity: "Sleep optimization", shareText: "Deep sleep heals — Water element recharges tonight 🌊🌙" },
      { message: "Moderate financial energy. Avoid impulse purchases near water (online shopping counts).", advice: "Wait 24 hours before any purchase over $50.", luckyColor: "Steel blue", luckyColorHex: "#4682B4", luckyDirection: "Northwest", luckyActivity: "Mindful spending", shareText: "Mindful money day — Water teaches patience with purchases 💰" },
      { message: "Your empathy is reliable today. Use it to understand, not to absorb others' pain.", advice: "Listen empathetically but maintain your boundary.", luckyColor: "Aqua", luckyColorHex: "#00CED1", luckyDirection: "North", luckyActivity: "Empathetic listening", shareText: "Empathy ON, absorption OFF — healthy Water boundaries 🌊🛡️" },
      { message: "Physical flexibility is good today. Water in your body responds to stretching.", advice: "Try yoga, swimming, or a long hot shower.", luckyColor: "Turquoise", luckyColorHex: "#40E0D0", luckyDirection: "North", luckyActivity: "Stretching or swimming", shareText: "Body flows today — Water energy loves movement 🌊🧘" },
      { message: "Memories carry wisdom today. A past experience holds the answer to a current question.", advice: "Think about a similar situation from your past. What did you learn?", luckyColor: "Slate blue", luckyColorHex: "#6A5ACD", luckyDirection: "Northwest", luckyActivity: "Mining past wisdom", shareText: "Past wisdom, present power — Water remembers everything 🌊" },
    ],
    low: [
      { message: "Your Water stagnates today. Emotions feel muddy and directions unclear.", advice: "Move your body to move your Water. Walk, even briefly.", luckyColor: "Dark blue", luckyColorHex: "#00008B", luckyDirection: "North", luckyActivity: "Movement to clear stagnation", shareText: "Muddy waters clear with movement — walking today 🌊🚶" },
      { message: "Fear surfaces but is unreliable. What feels threatening today is smaller than it seems.", advice: "Name your fear out loud. It shrinks when spoken.", luckyColor: "Midnight", luckyColorHex: "#191970", luckyDirection: "North", luckyActivity: "Fear acknowledgment", shareText: "Naming fears to tame them — Water courage 🌊💪" },
      { message: "Kidney energy is low. Your body needs warmth and rest.", advice: "Keep your lower back warm. Drink warm water, not cold.", luckyColor: "Ink blue", luckyColorHex: "#0A1628", luckyDirection: "North", luckyActivity: "Keeping warm", shareText: "Warming my Water element — self-care today 🫖🌊" },
      { message: "Communication may be misread. Others project onto your silence.", advice: "Over-communicate your intentions. Don't assume understanding.", luckyColor: "Storm blue", luckyColorHex: "#507786", luckyDirection: "Northwest", luckyActivity: "Clear communication", shareText: "Saying what I mean clearly — no room for misreading 🌊💬" },
      { message: "Emotional overwhelm is possible. You absorb too much from your environment.", advice: "Spend time alone near actual water if possible.", luckyColor: "Deep sea", luckyColorHex: "#003366", luckyDirection: "North", luckyActivity: "Water proximity", shareText: "Seeking water to reset — the element heals its own 🌊" },
      { message: "Procrastination is Water's shadow. Flowing around the task instead of into it.", advice: "Set a 10-minute timer and start. Just start.", luckyColor: "Blue-gray", luckyColorHex: "#6699CC", luckyDirection: "North", luckyActivity: "Timed work sprints", shareText: "10 minutes. That's all. Then Water flows into work 🌊⏱️" },
      { message: "Isolation deepens unnecessarily. Your Water draws inward too far today.", advice: "Go somewhere with ambient human presence — a café, park.", luckyColor: "Twilight", luckyColorHex: "#4E5180", luckyDirection: "North", luckyActivity: "Ambient socializing", shareText: "Not alone alone — finding comfort in ambient presence 🌊☕" },
      { message: "Dreams may be vivid and disturbing. Your subconscious processes something big.", advice: "Write dreams down immediately on waking. They hold clues.", luckyColor: "Night blue", luckyColorHex: "#1B2838", luckyDirection: "Northwest", luckyActivity: "Dream journaling", shareText: "Dreams speak tonight — Water element downloads wisdom 🌊🌙" },
      { message: "Your wisdom feels inaccessible. The well is deep but the rope is short today.", advice: "Don't force insight. Read someone else's wisdom instead.", luckyColor: "Ocean dark", luckyColorHex: "#023E73", luckyDirection: "North", luckyActivity: "Reading wisdom literature", shareText: "Borrowing wisdom today — mine returns tomorrow 📚🌊" },
      { message: "Physical coldness signals low Water. Your body temperature reflects your energy.", advice: "Take a warm bath or shower. Eat warm food. Wear layers.", luckyColor: "Frost blue", luckyColorHex: "#7EB6D0", luckyDirection: "North", luckyActivity: "Warming rituals", shareText: "Warming up — physical warmth restores Water energy 🛁🌊" },
    ],
  },
};

export function getDailyFortune(element: string, score: number, date: Date = new Date(), locale?: string): DailyFortune {
  const el = element.toLowerCase();
  let tier: Tier = score >= 75 ? "high" : score >= 55 ? "mid" : "low";

  // For KO/JA, caller passes locale — data resolved in dashboard-content via dynamic import
  // This function handles EN; KO/JA handled by getDailyFortuneLocale below
  const elementFortunes = FORTUNES[el] || FORTUNES.water;
  const pool = elementFortunes[tier];
  const index = dateHash(date) % pool.length;
  return pool[index];
}

// Locale-aware entry point used by dashboard
// Accepts optional fortune maps for all 9 non-English languages.
// locale string is normalized (case-insensitive, handles zh-TW variations)
export function getDailyFortuneLocale(
  element: string,
  score: number,
  locale: string,
  koFortunes?: Record<string, Record<string, DailyFortune[]>>,
  jaFortunes?: Record<string, Record<string, DailyFortune[]>>,
  esFortunes?: Record<string, Record<string, DailyFortune[]>>,
  frFortunes?: Record<string, Record<string, DailyFortune[]>>,
  ptFortunes?: Record<string, Record<string, DailyFortune[]>>,
  zhTWFortunes?: Record<string, Record<string, DailyFortune[]>>,
  ruFortunes?: Record<string, Record<string, DailyFortune[]>>,
  hiFortunes?: Record<string, Record<string, DailyFortune[]>>,
  idFortunes?: Record<string, Record<string, DailyFortune[]>>,
  date: Date = new Date()
): DailyFortune {
  const el = element.toLowerCase();
  const tier: Tier = score >= 75 ? "high" : score >= 55 ? "mid" : "low";
  const hash = dateHash(date);

  // Normalize locale: "zh-TW", "zh_TW", "zhTW", "zh-tw" -> "zhtw"
  const l = locale.toLowerCase().replace(/[-_]/g, "");

  // Language routing with graceful fallback to English
  if (l === "ko" && koFortunes) {
    const pool = (koFortunes[el] || koFortunes.water)[tier];
    return pool[hash % pool.length];
  }
  if (l === "ja" && jaFortunes) {
    const pool = (jaFortunes[el] || jaFortunes.water)[tier];
    return pool[hash % pool.length];
  }
  if (l.startsWith("es") && esFortunes) {
    const pool = (esFortunes[el] || esFortunes.water)[tier];
    return pool[hash % pool.length];
  }
  if (l.startsWith("fr") && frFortunes) {
    const pool = (frFortunes[el] || frFortunes.water)[tier];
    return pool[hash % pool.length];
  }
  if (l.startsWith("pt") && ptFortunes) {
    const pool = (ptFortunes[el] || ptFortunes.water)[tier];
    return pool[hash % pool.length];
  }
  if (l === "zhtw" && zhTWFortunes) {
    const pool = (zhTWFortunes[el] || zhTWFortunes.water)[tier];
    return pool[hash % pool.length];
  }
  if (l.startsWith("ru") && ruFortunes) {
    const pool = (ruFortunes[el] || ruFortunes.water)[tier];
    return pool[hash % pool.length];
  }
  if (l.startsWith("hi") && hiFortunes) {
    const pool = (hiFortunes[el] || hiFortunes.water)[tier];
    return pool[hash % pool.length];
  }
  if (l.startsWith("id") && idFortunes) {
    const pool = (idFortunes[el] || idFortunes.water)[tier];
    return pool[hash % pool.length];
  }

  // Fallback to English
  const pool = (FORTUNES[el] || FORTUNES.water)[tier];
  return pool[hash % pool.length];
}
