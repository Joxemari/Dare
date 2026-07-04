import type { Chapter, Journey, MilestoneType } from "../types";
import { JOURNEY_COLOR } from "./colors";

/* ============================================================
   JOURNEYS — cada Journey es un sprint de 7 días (spec Journey system).
   Los 7 Journeys del set final:
     First Flame ✦ · Iron Quiet △ · Still Water ☾ · Clear Signal ◇ ·
     Steady Current ⌁ · Wild Ground ↟ · Quiet Fire ⟁
   Nota de datos: los ids internos ember/iron/water se CONSERVAN para no
   romper el progreso guardado (localStorage). "First Flame" reutiliza el
   slot histórico "ember"; su contenido se reescribe según el spec.
   Reglas:
   - Cada Journey tiene 4 chapters, milestones tipados de id estable,
     un plan de 7 días con variantes ◌ Soft / ◆ Real / ⟁ Bold, y un
     Badge final (1 por Journey).
   - Ciencia con lenguaje cuidadoso ("may support", "can help",
     "is associated with", "research suggests"). Sin claims médicos.
   ============================================================ */

/** Etiqueta + icono por tipo de milestone (para la UI). */
export const MS_T: Record<MilestoneType, { label: string; ico: string }> = {
  letter: { label: "Letter", ico: "letter" },
  goal: { label: "Dare Goal", ico: "goal" },
  action: { label: "Setup Action", ico: "bolt" },
  motivator: { label: "Motivator", ico: "bulb" },
  science: { label: "Science", ico: "moon" },
  proof: { label: "Proof", ico: "goal" },
  reflection: { label: "Reflection", ico: "letter" },
  badge: { label: "Badge", ico: "bulb" },
};

export const JOURNEYS: Journey[] = [
  // ======================= 01 — FIRST FLAME ✦ =======================
  {
    id: "ember",
    name: "First Flame",
    sym: "spark",
    color: JOURNEY_COLOR.ember,
    tag: "Start before you feel ready.",
    problem: "I know what I need to do, but I can't get myself to start.",
    promise: "Break the freeze with one small action.",
    lesson: "Motion comes before motivation.",
    bias: ["small", "walk", "forest"],
    identity: { id: "first-mover", name: "First Mover", line: "Starts before feeling ready." },
    completionLine:
      "Seven days ago, you waited for motivation. Today, you know something better: start first, feel better second.",
    dreamPrompt: "What would make finishing your first DARE feel worth it?",
    dreamOptions: [
      { id: "painting", emoji: "🎨", label: "Painting class" },
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "sephora", emoji: "💄", label: "Sephora €30" },
      { id: "book", emoji: "📚", label: "New book" },
      { id: "trainers", emoji: "👟", label: "New trainers" },
      { id: "dinner", emoji: "🍽️", label: "Dinner somewhere nice" },
      { id: "breakfast", emoji: "🥐", label: "Solo breakfast date" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "Strike the Match", sym: "spark", goal: "Make the first action tiny.", days: [1, 1],
        milestones: [
          { id: "ff-1-letter", t: "letter", title: "You don't have a motivation problem", body: "You've been told to find motivation. It rarely shows up on time. You don't have a motivation problem — you have a starting problem. The first minute is the whole battle. DARE removes the decision so all that's left is the smallest possible first step." },
          { id: "ff-1-action", t: "action", title: "Choose your 3-minute minimum", action: "text", body: "Name the smallest action that still counts on a bad day. Three minutes. That's your floor — and it never moves." },
          { id: "ff-1-goal", t: "goal", title: "Complete one 3-minute Dare", goalHint: "Start a check-in — we'll give you a 3-minute Small Dare." },
          { id: "ff-1-science", t: "science", title: "Why starting changes state", body: "Beginning a small action can shift you out of the freeze. Movement is associated with a change in arousal and mood, and research suggests the first step often lowers the resistance that felt so large before you moved." },
          { id: "ff-1-proof", t: "proof", title: "I started before feeling ready." },
        ],
      },
      {
        n: "II", name: "Cross the Door", sym: "forest", goal: "Remove negotiation by changing state.", days: [2, 3],
        milestones: [
          { id: "ff-2-letter", t: "letter", title: "The door is the hardest part", body: "Not the walk. Not the weather. The door. Once you're outside, staying out is easy — it's crossing the threshold your brain fights. Make the door the only decision. Shoes, door, done." },
          { id: "ff-2-action", t: "action", title: "Lay out tomorrow's shoes", action: "text", body: "Put tomorrow's shoes by the door tonight. Friction removed now is a Dare completed later." },
          { id: "ff-2-goal", t: "goal", title: "Complete one outside Dare", goalHint: "Check in from outside, or choose a destination — we'll send you out." },
          { id: "ff-2-science", t: "science", title: "Why daylight and walking change your state", scienceId: "daylight" },
          { id: "ff-2-proof", t: "proof", title: "I moved before negotiating." },
        ],
      },
      {
        n: "III", name: "Break the Loop", sym: "focus", goal: "Apply activation to a real avoided task.", days: [4, 5],
        milestones: [
          { id: "ff-3-letter", t: "letter", title: "Avoidance gets heavier when you feed it", body: "The task you're avoiding is rarely as heavy as the dread around it. Every hour you don't touch it, it grows. A five-minute ugly start shrinks it back to its real size." },
          { id: "ff-3-action", t: "action", title: "Name one task you are avoiding", action: "text", body: "Write it down. Naming it out loud takes it out of the fog and makes it a thing you can start." },
          { id: "ff-3-goal", t: "goal", title: "Do a 5-minute ugly start", goalHint: "Open the avoided task and work on it for five imperfect minutes. That's the whole Dare." },
          { id: "ff-3-goal2", t: "goal", title: "Send or draft one brave message", goalHint: "One sentence counts. Draft it if you can't send it yet." },
          { id: "ff-3-science", t: "science", title: "Why action reduces cognitive load", body: "Unfinished tasks can occupy working memory and keep a low background tension running. Starting or externalizing a task is associated with relief and freed attention, even before it's done." },
        ],
      },
      {
        n: "IV", name: "Proof of Fire", sym: "dream", goal: "Convert action into identity.", days: [6, 7],
        milestones: [
          { id: "ff-4-letter", t: "letter", title: "You are collecting proof", body: "Seven days ago you waited for motivation. Now you have evidence: a Proof Library that says you start. Identity isn't declared — it's accumulated." },
          { id: "ff-4-goal", t: "goal", title: "Complete your fifth Dare", goalHint: "Keep going — your fifth completed Dare closes this chapter." },
          { id: "ff-4-goal2", t: "goal", title: "Complete one Dare when energy is low", goalHint: "On a low day, use the 3-minute version — it still counts." },
          { id: "ff-4-reflection", t: "reflection", title: "Write one line: what changed?", body: "One line. What's different after seven days? Save it — it's the first entry in who you're becoming." },
          { id: "ff-4-badge", t: "badge", title: "✦ First Mover", body: "Starts before feeling ready." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Just Start", cat: "small", dareId: "out-the-door",
        dare: "3-minute walk outside.", soft: "Stand up and stretch for one song.", bold: "10-minute walk with no phone.",
        trigger: "Just shoes.", companion: "One song.", treat: "Orange juice.", proof: "Started before feeling ready.",
        scienceTitle: "Daylight, blood flow, state change", scienceBody: "A short walk in daylight is associated with a lift in alertness and mood, and moving increases blood flow — a quick way to change how you feel." },
      { day: 2, title: "Ugly Start", cat: "focus",
        dare: "5-minute ugly start on an avoided task.", soft: "Open the task and read it for 2 minutes.", bold: "15-minute block on the avoided task.",
        trigger: "Open it. Nothing else.", companion: "Timer.", treat: "Coffee or tea.", proof: "Made the task smaller.",
        scienceTitle: "Executive function and cognitive load", scienceBody: "Breaking a task into a tiny first step can lower the load on your executive function, which may make the whole thing feel less heavy." },
      { day: 3, title: "Leave the Door", cat: "walk", dareId: "leave-door",
        dare: "12–15 minute walk.", soft: "5-minute walk around the block.", bold: "25-minute walk to somewhere new.",
        trigger: "Don't decide. Step outside.", companion: "Podcast.", treat: "Coffee in the sun.", proof: "Moved before negotiating.",
        scienceTitle: "Circadian rhythm and cortisol patterns", scienceBody: "Morning daylight is associated with a healthier cortisol rhythm, which can help energy feel steadier across the day." },
      { day: 4, title: "One Brave Message", cat: "focus",
        dare: "Send or draft one avoided message.", soft: "Draft one sentence, no need to send.", bold: "Send it and ask clearly for one thing.",
        trigger: "One sentence counts.", companion: "Calm playlist.", treat: "10 minutes guilt-free scroll.", proof: "Reduced one open loop.",
        scienceTitle: "Unfinished tasks and relief from action", scienceBody: "Open loops can keep a task mentally active. Research suggests acting on one — even partially — is associated with relief and freed attention." },
      { day: 5, title: "Use What Worked", cat: "walk",
        dare: "Repeat your best-performing Dare.", soft: "Repeat the easiest version of it.", bold: "Repeat it and add five minutes.",
        trigger: "Use what already worked.", companion: "Companion Shelf.", treat: "Read outside for 15 minutes.", proof: "Repeated without perfection.",
        scienceTitle: "Self-efficacy", scienceBody: "Repeating something you've already done builds self-efficacy — the belief that you can — which is associated with sticking with a behaviour over time." },
      { day: 6, title: "Low-Energy Proof", cat: "small", dareId: "one-song",
        dare: "A low-energy Dare.", soft: "One song, standing.", bold: "3-minute walk plus one song.",
        trigger: "Minimum still counts.", companion: "Soft music.", treat: "Hot shower.", proof: "Did something with low energy.",
        scienceTitle: "Nervous system and low-friction action", scienceBody: "On low days, a small, low-friction action can still shift your state without overloading a tired nervous system." },
      { day: 7, title: "Proof of Fire", cat: "walk", chapter: true, dream: true,
        dare: "Your favourite Dare of the week.", soft: "The gentlest version of your favourite.", bold: "The strongest version you've done.",
        trigger: "Choose your proof.", companion: "Best companion.", treat: "Dream Reward unlock.", proof: "Became someone who starts.",
        scienceTitle: "Identity-based behavior", scienceBody: "Choosing your own action reinforces an identity — 'I'm someone who starts' — and identity is associated with more durable behaviour than willpower alone." },
    ],
  },

  // ======================= 02 — IRON QUIET △ =======================
  {
    id: "iron",
    name: "Iron Quiet",
    sym: "strength",
    color: JOURNEY_COLOR.iron,
    tag: "Strength without noise.",
    problem: "I want to feel stronger, but exercise feels boring and mentally heavy.",
    promise: "Build strength without turning it into another obligation.",
    lesson: "Strength gives your energy somewhere to live.",
    bias: ["dumbbells", "carry", "tabata", "fitboxing", "padel", "pool"],
    identity: { id: "quiet-builder", name: "Quiet Builder", line: "Uses strength to create energy." },
    completionLine:
      "You did not become stronger by doing more. You became stronger by making strength easier to start.",
    dreamPrompt: "What would feeling stronger be worth?",
    dreamOptions: [
      { id: "top", emoji: "🎽", label: "New training top" },
      { id: "fitbit", emoji: "⌚", label: "Fitbit Air" },
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "padel", emoji: "🎾", label: "Padel class" },
      { id: "swimsuit", emoji: "🩱", label: "New swimsuit" },
      { id: "headphones", emoji: "🎧", label: "New headphones" },
      { id: "poolday", emoji: "🏊", label: "Pool day" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "First Weight", sym: "strength", goal: "Remove dumbbell friction.", days: [1, 1],
        milestones: [
          { id: "iq-1-letter", t: "letter", title: "Strength is not a workout. It is a signal.", body: "Every time you lift, your body gets a message: this system is worth maintaining. You're not chasing a look or burning anything. You're telling your body to keep the lights on. Twelve minutes is enough to send the signal." },
          { id: "iq-1-action", t: "action", title: "Put your dumbbells where you can see them", action: "text", body: "Out of the cupboard, into the room you live in. Visible weights get lifted. Hidden ones don't." },
          { id: "iq-1-goal", t: "goal", title: "Complete one 12-minute strength Dare", goalHint: "Check in at home — we'll give you a standing dumbbell Dare." },
          { id: "iq-1-science", t: "science", title: "Why muscle supports long-term energy", scienceId: "muscle-energy" },
          { id: "iq-1-proof", t: "proof", title: "I chose strength without drama." },
        ],
      },
      {
        n: "II", name: "Make It Play", sym: "strong", goal: "Make training less boring.", days: [2, 3],
        milestones: [
          { id: "iq-2-letter", t: "letter", title: "Play counts as training", body: "The best training is the kind you'd do anyway. Water, a bag to hit, a game with a friend. If it doesn't feel like homework, you'll come back. That's the whole strategy." },
          { id: "iq-2-action", t: "action", title: "Create your Boss Playlist", action: "bossPlaylist", body: "The one that makes you feel unstoppable. Name it, pick the platform, choose the first song. It's the soundtrack to your Tabatas." },
          { id: "iq-2-goal", t: "goal", title: "Complete one standing tabata", goalHint: "8 minutes, standing — check in with energy 5+ at home." },
          { id: "iq-2-goal2", t: "goal", title: "Complete one water, padel or play-based Dare", goalHint: "Choose Pool or Padel as your destination in the check-in." },
          { id: "iq-2-science", t: "science", title: "Why short intensity works", scienceId: "tabata" },
        ],
      },
      {
        n: "III", name: "Load the Body", sym: "forge", goal: "Add real stimulus without overwhelm.", days: [4, 5],
        milestones: [
          { id: "iq-3-letter", t: "letter", title: "Muscle is not a look. It is capacity.", body: "Forget the mirror. Muscle is active tissue that stores energy, supports steady glucose and holds your posture. You're building capacity, not decorating a shelf." },
          { id: "iq-3-goal", t: "goal", title: "Complete two strength Dares", goalHint: "Two strength or carry Dares this chapter." },
          { id: "iq-3-goal2", t: "goal", title: "Complete one Strong Dare", goalHint: "When energy is high, take a Strong-level Dare." },
          { id: "iq-3-motivator", t: "motivator", title: "Strong does not need to be loud", body: "You don't have to grunt, post, or suffer. Quiet, consistent strength outlasts the loud kind every time." },
          { id: "iq-3-proof", t: "proof", title: "I can carry more than I think." },
        ],
      },
      {
        n: "IV", name: "Quiet Power", sym: "dream", goal: "Convert strength into identity.", days: [6, 7],
        milestones: [
          { id: "iq-4-letter", t: "letter", title: "Quiet power is still power", body: "You didn't become stronger by doing more. You became stronger by making it easier to start. That's a skill that outlasts any program." },
          { id: "iq-4-goal", t: "goal", title: "Complete your favourite strength-related Dare", goalHint: "Pick the one that gave you the most energy and repeat it." },
          { id: "iq-4-reflection", t: "reflection", title: "Write one line: what felt stronger?", body: "One line. What feels stronger than a week ago — body, or the ease of starting?" },
          { id: "iq-4-badge", t: "badge", title: "△ Quiet Builder", body: "Uses strength to create energy." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "First Weight", cat: "dumbbells", dareId: "iron-first-weight",
        dare: "12 min dumbbells: goblet squat, dumbbell row, shoulder press, farmer hold.", soft: "One round only.", bold: "Three full rounds.",
        trigger: "No gym. Just two weights.", companion: "Netflix.", treat: "Hot shower.", proof: "Chose strength without drama.",
        scienceTitle: "Muscle tissue and neuromuscular coordination", scienceBody: "Lifting recruits muscle tissue and trains neuromuscular coordination. Regular loading is associated with steadier energy and everyday strength over time." },
      { day: 2, title: "Water Energy", cat: "pool", dareId: "water-reset",
        dare: "20 min pool or easy swim.", soft: "Shower + 5 min standing mobility.", bold: "30 min varied swim.",
        trigger: "Let water do half the work.", companion: "Calm playlist or silence.", treat: "Nice body lotion.", proof: "Used water to reset my body.",
        scienceTitle: "Parasympathetic activation and sensory input", scienceBody: "Water and rhythmic movement can support parasympathetic activation — the 'rest and recover' side of the nervous system — which may leave you calmer afterwards." },
      { day: 3, title: "Standing Tabata", cat: "tabata", dareId: "micro-tabata",
        dare: "8 min standing tabata, 20s on / 10s off (squats, reverse lunges, shadowboxing, fast feet, curls, presses).", soft: "4 min, one move.", bold: "12 min, two-move rounds.",
        trigger: "Eight minutes. No negotiation.", companion: "Boss playlist.", treat: "Cold drink.", proof: "Did intensity without overthinking.",
        scienceTitle: "Heart rate, endorphins and perceived energy", scienceBody: "Short bursts of effort raise heart rate and are associated with a release of endorphins, which can lift perceived energy for hours afterwards." },
      { day: 4, title: "Hit Back", cat: "fitboxing", dareId: "shadow-rounds",
        dare: "Fitboxing class if available, or 12 min shadowboxing.", soft: "3 min shadowboxing.", bold: "20 min with combinations.",
        trigger: "Hit resistance back.", companion: "High-energy music.", treat: "Long shower.", proof: "Turned stress into movement.",
        scienceTitle: "Coordination, rhythm and stress discharge", scienceBody: "Rhythmic, coordinated movement can give stress somewhere to go, and is associated with a shift out of a wound-up state." },
      { day: 5, title: "Carry Strength", cat: "carry", dareId: "carry-strength",
        dare: "Farmer carry + squats + presses, 12–15 min.", soft: "Carry bags or dumbbells for 3 short rounds.", bold: "Heavier carries, longer distance.",
        trigger: "Pick things up. Carry them.", companion: "Netflix or music.", treat: "Protein-rich snack.", proof: "Built strength in small sets.",
        scienceTitle: "Grip strength and loaded movement", scienceBody: "Carrying load trains grip and whole-body strength. Grip strength is associated with overall resilience and healthy ageing." },
      { day: 6, title: "Active Recovery", cat: "recovery",
        dare: "Active recovery: pool, walk, standing mobility or light dumbbells.", soft: "7 min walk.", bold: "Mobility flow + easy swim.",
        trigger: "Recovery is still training.", companion: "Soft playlist.", treat: "Early night ritual.", proof: "Recovered without stopping.",
        scienceTitle: "HRV and nervous system recovery", scienceBody: "Easy movement and rest support heart rate variability, a marker associated with a well-recovered nervous system." },
      { day: 7, title: "Quiet Power", cat: "dumbbells", chapter: true, dream: true,
        dare: "Your favourite from the week: dumbbells, pool, Fitboxing, padel or standing tabata.", soft: "The easiest version of it.", bold: "The strongest version you've done.",
        trigger: "Choose your strongest proof.", companion: "Best companion.", treat: "Dream Reward unlock.", proof: "Became someone who trains strength.",
        scienceTitle: "Self-efficacy", scienceBody: "Choosing and completing your own strength Dare builds self-efficacy, which is associated with continuing a habit long after a program ends." },
    ],
  },

  // ======================= 03 — STILL WATER ☾ =======================
  {
    id: "water",
    name: "Still Water",
    sym: "calm",
    color: JOURNEY_COLOR.water,
    tag: "A quieter head, a looser body.",
    problem: "I feel wired, tired or overstimulated.",
    promise: "Come down without disappearing.",
    lesson: "Recovery is an action, not a collapse.",
    bias: ["recovery", "pool", "forest", "focus"],
    identity: { id: "regulator", name: "Regulator", line: "Knows how to lower the noise." },
    completionLine:
      "You learned that recovery is not doing nothing. It is choosing the signal that brings you back.",
    dreamPrompt: "What would feeling calm again be worth?",
    dreamOptions: [
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "spa", emoji: "🛁", label: "Spa or pool day" },
      { id: "pyjamas", emoji: "🛌", label: "New pyjamas" },
      { id: "candle", emoji: "🕯️", label: "Nice candle" },
      { id: "book", emoji: "📚", label: "New book" },
      { id: "facial", emoji: "🧖", label: "Facial" },
      { id: "tea", emoji: "🍵", label: "Tea set" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "Lower the Volume", sym: "calm", goal: "Reduce stimulation.", days: [1, 1],
        milestones: [
          { id: "sw-1-letter", t: "letter", title: "You are not lazy. You may be overloaded.", body: "Wired-and-tired is not a character flaw. A nervous system running hot all day struggles to switch off. The fix isn't more discipline — it's lowering the volume, on purpose, for a few minutes." },
          { id: "sw-1-action", t: "action", title: "Choose your calm signal", action: "text", body: "Pick the one cue that tells your body it's safe to come down — a candle, a song, a long exhale. Name it, and use it every time." },
          { id: "sw-1-goal", t: "goal", title: "Complete one 5-minute downshift", goalHint: "Check in tired or stressed — we'll give you a 5-minute calm Dare." },
          { id: "sw-1-science", t: "science", title: "How breathing affects the nervous system", body: "A longer exhale than inhale is associated with parasympathetic activation, the branch of the nervous system that can slow heart rate and help you settle." },
          { id: "sw-1-proof", t: "proof", title: "I lowered the volume." },
        ],
      },
      {
        n: "II", name: "Waterline", sym: "water", goal: "Use water and body cues to reset.", days: [2, 3],
        milestones: [
          { id: "sw-2-letter", t: "letter", title: "The body can lead the mind down", body: "You can't always think your way calm. But water, warmth and slow movement give the body a cue, and the mind tends to follow. Start with the body." },
          { id: "sw-2-goal", t: "goal", title: "Complete one water-based reset", goalHint: "Pool, shower or bath — choose water as today's reset." },
          { id: "sw-2-goal2", t: "goal", title: "Complete one slow walk", goalHint: "A 15-minute walk with no productivity goal." },
          { id: "sw-2-science", t: "science", title: "Why rhythm and sensory input can support recovery", body: "Rhythmic movement and gentle sensory input, like warm water, are associated with a downshift in arousal and can support recovery." },
          { id: "sw-2-proof", t: "proof", title: "I used water to reset." },
        ],
      },
      {
        n: "III", name: "Evening Softening", sym: "shift", goal: "Build a shutdown ritual.", days: [4, 5],
        milestones: [
          { id: "sw-3-letter", t: "letter", title: "Your day needs an ending", body: "Without a clear ending, work bleeds into the night and sleep pays for it. A short shutdown ritual tells your body the day is closed." },
          { id: "sw-3-action", t: "action", title: "Create a 20-minute shutdown shelf", action: "text", body: "Line up what a soft ending looks like: dim light, a candle, tea, a book. Twenty minutes, same order, most nights." },
          { id: "sw-3-goal", t: "goal", title: "Complete one screen-light reduction", goalHint: "Dim or drop screens for the last stretch of the evening." },
          { id: "sw-3-science", t: "science", title: "Circadian rhythm and sleep cues", body: "Dimmer light in the evening is associated with a healthier circadian rhythm, which can help sleep arrive more easily." },
        ],
      },
      {
        n: "IV", name: "Quiet Return", sym: "dream", goal: "Make regulation part of identity.", days: [6, 7],
        milestones: [
          { id: "sw-4-letter", t: "letter", title: "Calm is not passivity", body: "Choosing to come down is an active skill, not a collapse. The people who look unshakeable aren't calmer by luck — they practise the return." },
          { id: "sw-4-goal", t: "goal", title: "Complete one calm Dare when restless", goalHint: "Next time you feel restless, use a calm Dare instead of scrolling." },
          { id: "sw-4-reflection", t: "reflection", title: "What helps me come back?", body: "One line. Which signal brought you back this week — breath, water, an ending? Keep it where you can find it." },
          { id: "sw-4-badge", t: "badge", title: "☾ Regulator", body: "Knows how to lower the noise." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Lower the Volume", cat: "recovery",
        dare: "5 min long-exhale breathing.", soft: "2 min, hand on chest.", bold: "10 min box breathing.",
        trigger: "Exhale longer than you inhale.", companion: "Timer.", treat: "Tea.", proof: "Lowered the volume.",
        scienceTitle: "Parasympathetic activation", scienceBody: "A longer exhale is associated with parasympathetic activation, which can slow the heart rate and help you feel settled." },
      { day: 2, title: "Slow Walk", cat: "walk", dareId: "night-walk",
        dare: "15 min slow walk, no productivity.", soft: "5 min around the block.", bold: "25 min unhurried loop.",
        trigger: "Walk like nothing is chasing you.", companion: "Soft playlist.", treat: "Fresh juice.", proof: "Moved without rushing.",
        scienceTitle: "Blood flow, mood and rumination", scienceBody: "A gentle walk increases blood flow and is associated with less rumination and a steadier mood." },
      { day: 3, title: "Waterline", cat: "pool", dareId: "water-window",
        dare: "Pool, shower or bath reset.", soft: "Warm shower, last minute slower.", bold: "Easy swim, then float.",
        trigger: "Let water change the signal.", companion: "Silence.", treat: "Body lotion.", proof: "Used water to reset.",
        scienceTitle: "Sensory input and recovery cues", scienceBody: "Warm water and gentle sensory input can act as a recovery cue, associated with a downshift out of a wired state." },
      { day: 4, title: "Evening Shutdown", cat: "recovery",
        dare: "20 min evening shutdown ritual.", soft: "Dim the lights and make tea.", bold: "Full wind-down: no screens, candle, book.",
        trigger: "Give the day an ending.", companion: "Candle or music.", treat: "New tea.", proof: "Closed the loop.",
        scienceTitle: "Circadian rhythm", scienceBody: "A consistent, dim evening routine is associated with a healthier circadian rhythm and easier sleep onset." },
      { day: 5, title: "Unclench", cat: "recovery",
        dare: "10 min stretch or standing mobility.", soft: "3 min neck and shoulders.", bold: "Full mobility flow.",
        trigger: "Unclench first.", companion: "Calm playlist.", treat: "Hot shower.", proof: "Released tension.",
        scienceTitle: "Nervous system and proprioception", scienceBody: "Slow stretching and body awareness can support the nervous system and are associated with a drop in muscle tension." },
      { day: 6, title: "Low-Stimulation Hour", cat: "focus",
        dare: "A low-stimulation hour.", soft: "20 minutes of quiet, no input.", bold: "A full screen-free evening.",
        trigger: "No input. Just quiet.", companion: "Book or silence.", treat: "Early bed.", proof: "Protected my attention.",
        scienceTitle: "Cognitive load", scienceBody: "Reducing incoming input lowers cognitive load, which can help attention and mood recover." },
      { day: 7, title: "Quiet Return", cat: "recovery", chapter: true, dream: true,
        dare: "Your favourite calm Dare.", soft: "The gentlest version of it.", bold: "Combine two calm Dares.",
        trigger: "Choose your return point.", companion: "Best companion.", treat: "Dream Reward unlock.", proof: "Became someone who regulates.",
        scienceTitle: "Self-efficacy", scienceBody: "Knowing you can bring yourself back builds self-efficacy, associated with feeling more in control of your own state." },
    ],
  },

  // ======================= 04 — CLEAR SIGNAL ◇ =======================
  {
    id: "clear",
    name: "Clear Signal",
    sym: "focus",
    color: JOURNEY_COLOR.clear,
    tag: "Make space in your head.",
    problem: "My brain feels full, and I avoid boring or admin tasks.",
    promise: "Clear one open loop at a time.",
    lesson: "Clarity comes from externalizing, not thinking harder.",
    bias: ["focus", "small"],
    identity: { id: "clear-mind", name: "Clear Mind", line: "Turns mental clutter into next actions." },
    completionLine:
      "You did not solve everything. You made the next action visible. That is clarity.",
    dreamPrompt: "What would a clearer head be worth?",
    dreamOptions: [
      { id: "notebook", emoji: "📓", label: "New notebook" },
      { id: "coffee", emoji: "☕", label: "Coffee date" },
      { id: "desk", emoji: "🪑", label: "Desk upgrade" },
      { id: "sephora", emoji: "💄", label: "Sephora €30" },
      { id: "dinner", emoji: "🍽️", label: "Dinner somewhere nice" },
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "headphones", emoji: "🎧", label: "New headphones" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "Empty the Head", sym: "focus", goal: "Externalize mental clutter.", days: [1, 1],
        milestones: [
          { id: "cs-1-letter", t: "letter", title: "Your brain is not a storage unit", body: "Holding every task in your head is expensive. It's not that you're forgetful — you're overloaded. Get it onto a page and the pressure drops." },
          { id: "cs-1-action", t: "action", title: "Create your Dump List", action: "text", body: "One place — paper or app — where everything on your mind lands. It doesn't need order yet. It needs to be out of your head." },
          { id: "cs-1-goal", t: "goal", title: "Complete one 5-minute brain dump", goalHint: "Set a timer and empty your head onto the Dump List." },
          { id: "cs-1-science", t: "science", title: "Cognitive load and working memory", body: "Working memory holds only a few things at once. Externalizing tasks is associated with lower cognitive load and clearer thinking." },
          { id: "cs-1-proof", t: "proof", title: "I externalized the noise." },
        ],
      },
      {
        n: "II", name: "One Open Loop", sym: "reset", goal: "Reduce avoidance.", days: [2, 3],
        milestones: [
          { id: "cs-2-letter", t: "letter", title: "Open loops drain energy", body: "Every unfinished task quietly runs in the background. You don't feel each one, but together they leave you tired. Close one and you free real attention." },
          { id: "cs-2-goal", t: "goal", title: "Close one tiny admin loop", goalHint: "One small admin task, start to finish. Not the whole list — one." },
          { id: "cs-2-goal2", t: "goal", title: "Send one simple reply", goalHint: "The message you've been leaving on read. One reply." },
          { id: "cs-2-science", t: "science", title: "Why unfinished tasks stay mentally active", body: "Unfinished tasks tend to stay mentally active — an effect research calls the Zeigarnik effect. Completing or scheduling them is associated with relief." },
          { id: "cs-2-proof", t: "proof", title: "I closed one open loop." },
        ],
      },
      {
        n: "III", name: "Deep Work Door", sym: "strong", goal: "Start focused work without drama.", days: [4, 5],
        milestones: [
          { id: "cs-3-letter", t: "letter", title: "Focus starts with fewer doors", body: "Focus isn't a superpower — it's a setup. Fewer tabs, one task, a clear container. Reduce the doors and attention has somewhere to stay." },
          { id: "cs-3-action", t: "action", title: "Choose your focus container", action: "text", body: "Pick the block: how long, where, what's off. A 20-minute container beats a vague intention to 'focus'." },
          { id: "cs-3-goal", t: "goal", title: "Complete one 20-minute focus block", goalHint: "One tab, one task, 20 minutes. That's the Dare." },
          { id: "cs-3-science", t: "science", title: "Attention switching and executive function", body: "Switching between tasks carries a cost. Protecting a single-task block is associated with better use of executive function and less mental fatigue." },
        ],
      },
      {
        n: "IV", name: "Clear Desk", sym: "dream", goal: "Turn clarity into identity.", days: [6, 7],
        milestones: [
          { id: "cs-4-letter", t: "letter", title: "A clear surface is a decision removed", body: "Every bit of clutter is a tiny open question. Clear the surface and you remove a dozen small decisions before they're even asked." },
          { id: "cs-4-goal", t: "goal", title: "Reset one physical or digital space", goalHint: "Desk, downloads folder, one shelf. One space, reset." },
          { id: "cs-4-reflection", t: "reflection", title: "What feels lighter?", body: "One line. After clearing the head and one space — what feels lighter?" },
          { id: "cs-4-badge", t: "badge", title: "◇ Clear Mind", body: "Turns mental clutter into next actions." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Brain Dump", cat: "focus",
        dare: "5 min brain dump.", soft: "List 3 things on your mind.", bold: "10 min dump, then group into themes.",
        trigger: "Get it out of your head.", companion: "Timer.", treat: "Coffee.", proof: "Externalized the noise.",
        scienceTitle: "Working memory", scienceBody: "Working memory is limited. Writing tasks down is associated with lower load and clearer thinking." },
      { day: 2, title: "One Open Loop", cat: "focus",
        dare: "Close one tiny admin loop.", soft: "Do the 2-minute version of it.", bold: "Close two loops back to back.",
        trigger: "One loop. Not the whole life.", companion: "Lo-fi music.", treat: "10 min break.", proof: "Closed one open loop.",
        scienceTitle: "Zeigarnik effect", scienceBody: "Unfinished tasks tend to stay mentally active. Finishing one is associated with relief and freed attention." },
      { day: 3, title: "Focus Block", cat: "focus",
        dare: "20 min focus block.", soft: "10 min, one task.", bold: "Two 20-minute blocks with a break.",
        trigger: "One tab. One task.", companion: "Focus playlist.", treat: "Nice drink.", proof: "Protected one block.",
        scienceTitle: "Attention switching", scienceBody: "Task switching carries a cost. Protecting a single-task block is associated with better focus and less fatigue." },
      { day: 4, title: "Boring Reply", cat: "focus",
        dare: "Send one boring reply.", soft: "Draft it, send when ready.", bold: "Clear three quick replies.",
        trigger: "Reply ugly. Refine later.", companion: "Timer.", treat: "Walk outside.", proof: "Reduced avoidance.",
        scienceTitle: "Action and cognitive load", scienceBody: "Acting on an avoided task is associated with a drop in the background load it was creating." },
      { day: 5, title: "Reset a Space", cat: "small",
        dare: "Reset desk or downloads folder.", soft: "Clear one corner of the desk.", bold: "Reset desk and inbox.",
        trigger: "Clear one surface.", companion: "Podcast.", treat: "Candle or tea.", proof: "Removed visual friction.",
        scienceTitle: "Environmental cues", scienceBody: "A cluttered space adds visual cues that compete for attention. Clearing it is associated with easier focus." },
      { day: 6, title: "Tomorrow's Door", cat: "focus",
        dare: "Make tomorrow's first action visible.", soft: "Write the single first step.", bold: "Lay out everything the first task needs.",
        trigger: "Future-you needs a door.", companion: "Calm music.", treat: "Early finish.", proof: "Removed one decision.",
        scienceTitle: "Implementation intention", scienceBody: "Deciding the specific next action in advance — an implementation intention — is associated with a higher chance of following through." },
      { day: 7, title: "Clear Desk", cat: "focus", chapter: true, dream: true,
        dare: "Your favourite clarity Dare.", soft: "The lightest version of it.", bold: "Combine a dump and a reset.",
        trigger: "Choose the lightest thing.", companion: "Best companion.", treat: "Dream Reward unlock.", proof: "Became someone who clears.",
        scienceTitle: "Self-efficacy", scienceBody: "Repeating a clarity habit builds self-efficacy, associated with keeping the habit when things get busy." },
    ],
  },

  // ======================= 05 — STEADY CURRENT ⌁ =======================
  {
    id: "current",
    name: "Steady Current",
    sym: "momentum",
    color: JOURNEY_COLOR.current,
    tag: "Let motion carry you.",
    problem: "I start, stop, feel guilty, then avoid restarting.",
    promise: "Restart without shame.",
    lesson: "Consistency is not never stopping. It is returning faster.",
    bias: ["walk", "small", "recovery"],
    identity: { id: "returner", name: "Returner", line: "Comes back without making it dramatic." },
    completionLine:
      "You are not someone who never stops. You are someone who knows how to return.",
    dreamPrompt: "What would trusting yourself again be worth?",
    dreamOptions: [
      { id: "breakfast", emoji: "🥐", label: "Weekend breakfast" },
      { id: "book", emoji: "📚", label: "New book" },
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "headphones", emoji: "🎧", label: "New headphones" },
      { id: "dinner", emoji: "🍽️", label: "Nice dinner" },
      { id: "class", emoji: "🧘", label: "Pilates or padel class" },
      { id: "sephora", emoji: "💄", label: "Sephora €30" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "No Streak Shame", sym: "momentum", goal: "Remove all-or-nothing thinking.", days: [1, 1],
        milestones: [
          { id: "sc-1-letter", t: "letter", title: "Missing once is not losing", body: "One missed day is not a broken streak — it's a missed day. The people who stay consistent aren't the ones who never stop. They're the ones who don't turn a gap into a story." },
          { id: "sc-1-action", t: "action", title: "Choose your minimum return", action: "text", body: "Decide now what the smallest possible comeback looks like. One song. One walk to the corner. So small it survives a bad week." },
          { id: "sc-1-goal", t: "goal", title: "Complete one minimum Dare", goalHint: "Do your minimum return once, on purpose." },
          { id: "sc-1-science", t: "science", title: "Why all-or-nothing thinking breaks consistency", body: "All-or-nothing thinking turns one slip into 'I've failed', which is associated with quitting. A defined minimum keeps the door open." },
          { id: "sc-1-proof", t: "proof", title: "I defined my return point." },
        ],
      },
      {
        n: "II", name: "Repeat the Easy", sym: "rhythm", goal: "Build rhythm.", days: [2, 3],
        milestones: [
          { id: "sc-2-letter", t: "letter", title: "Rhythm beats intensity", body: "You don't need a hard day. You need a repeatable one. Rhythm turns a few good days into an identity. Keep the bar low enough that tomorrow is never in doubt." },
          { id: "sc-2-goal", t: "goal", title: "Repeat one Dare twice", goalHint: "The same small Dare, two days." },
          { id: "sc-2-goal2", t: "goal", title: "Use the same trigger twice", goalHint: "Reuse the exact same cue to start, twice." },
          { id: "sc-2-science", t: "science", title: "Repetition and cue-response loops", body: "Repeating an action after the same cue strengthens a cue-response loop, which over time is associated with the action feeling more automatic." },
          { id: "sc-2-proof", t: "proof", title: "I made repetition easier." },
        ],
      },
      {
        n: "III", name: "Return Faster", sym: "shift", goal: "Practice restarting.", days: [4, 5],
        milestones: [
          { id: "sc-3-letter", t: "letter", title: "The return is the training", body: "The skill isn't never falling off. It's coming back faster. Every time you return after resistance, you're training the exact muscle that keeps people consistent." },
          { id: "sc-3-goal", t: "goal", title: "Complete one restart Dare after resistance", goalHint: "When you feel the pull to skip — do the minimum instead." },
          { id: "sc-3-reflection", t: "reflection", title: "What made returning easier?", body: "One line. What helped you come back this time? Name it so you can reuse it." },
          { id: "sc-3-motivator", t: "motivator", title: "Coming back counts", body: "Nobody sees the streak. They see the person who's still going months later. That person just returned more times than they quit." },
        ],
      },
      {
        n: "IV", name: "Carry the Current", sym: "dream", goal: "Convert restarting into identity.", days: [6, 7],
        milestones: [
          { id: "sc-4-letter", t: "letter", title: "You are not building a streak. You are building a current.", body: "A streak snaps. A current keeps moving even when a day is missed. You're not chasing a perfect record — you're staying in motion." },
          { id: "sc-4-goal", t: "goal", title: "Complete your fifth Dare", goalHint: "Your fifth completed Dare this Journey." },
          { id: "sc-4-goal2", t: "goal", title: "Complete one low-energy return", goalHint: "On a low day, do the minimum — that's the whole point." },
          { id: "sc-4-badge", t: "badge", title: "⌁ Returner", body: "Comes back without making it dramatic." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Your Minimum", cat: "small",
        dare: "Choose and do your minimum Dare.", soft: "Name it, do the tiniest version.", bold: "Do it and note when you'll repeat it.",
        trigger: "What counts on a bad day?", companion: "Timer.", treat: "Coffee.", proof: "Defined my return point.",
        scienceTitle: "Implementation intention", scienceBody: "Deciding your minimum in advance is an implementation intention, associated with a higher chance of doing it under stress." },
      { day: 2, title: "Repeat the Tiny", cat: "small", dareId: "one-song",
        dare: "Repeat the same tiny Dare.", soft: "Half of it counts.", bold: "Repeat it and add one minute.",
        trigger: "Same door. Less effort.", companion: "Same song.", treat: "Juice.", proof: "Made repetition easier.",
        scienceTitle: "Cue-response learning", scienceBody: "Repeating an action after the same cue strengthens the loop and is associated with it feeling more automatic over time." },
      { day: 3, title: "Return After Resistance", cat: "walk",
        dare: "Do one Dare after resistance.", soft: "The 3-minute version counts.", bold: "Do it fully, resistance and all.",
        trigger: "Resistance is not refusal.", companion: "Podcast.", treat: "10 min rest.", proof: "Returned after friction.",
        scienceTitle: "Self-efficacy", scienceBody: "Acting despite resistance builds self-efficacy, associated with bouncing back faster next time." },
      { day: 4, title: "A 2-Step Rhythm", cat: "walk",
        dare: "Build a 2-step rhythm: trigger then action.", soft: "Practise just the trigger.", bold: "Chain three days in a row.",
        trigger: "Trigger → action.", companion: "Playlist.", treat: "Walk outside.", proof: "Created a current.",
        scienceTitle: "Habit cues", scienceBody: "Pairing a consistent cue with an action supports habit formation, associated with less reliance on motivation." },
      { day: 5, title: "Low-Energy Return", cat: "recovery",
        dare: "A low-energy return Dare.", soft: "The gentlest version you have.", bold: "Return with a full session.",
        trigger: "Minimum still counts.", companion: "Soft companion.", treat: "Hot shower.", proof: "Returned without shame.",
        scienceTitle: "All-or-nothing reduction", scienceBody: "Allowing a minimum on low days counters all-or-nothing thinking, which is associated with staying consistent." },
      { day: 6, title: "Best Rhythm", cat: "walk",
        dare: "Repeat your best rhythm.", soft: "Repeat the easiest part of it.", bold: "Extend it by five minutes.",
        trigger: "Let the current carry it.", companion: "Same companion.", treat: "Treat Draw.", proof: "Trusted repetition.",
        scienceTitle: "Cognitive economy", scienceBody: "Repeating a known routine costs less mental effort, which can make it easier to keep going." },
      { day: 7, title: "Carry the Current", cat: "walk", chapter: true, dream: true,
        dare: "Your favourite return Dare.", soft: "The lightest version of it.", bold: "The fullest version you've done.",
        trigger: "Come back one more time.", companion: "Best companion.", treat: "Dream Reward unlock.", proof: "Became someone who returns.",
        scienceTitle: "Identity-based behavior", scienceBody: "Seeing yourself as 'someone who returns' is associated with more durable consistency than chasing a perfect streak." },
    ],
  },

  // ======================= 06 — WILD GROUND ↟ =======================
  {
    id: "wild",
    name: "Wild Ground",
    sym: "forest",
    color: JOURNEY_COLOR.wild,
    tag: "The outside changes you.",
    problem: "I stay inside too long and my energy collapses.",
    promise: "Use the outside as a state-change.",
    lesson: "Environment is an energy tool.",
    bias: ["forest", "walk"],
    identity: { id: "outwalker", name: "Outwalker", line: "Changes state by changing place." },
    completionLine:
      "You learned that sometimes the fastest way to change your mind is to change your place.",
    dreamPrompt: "What would feeling more alive outside be worth?",
    dreamOptions: [
      { id: "trainers", emoji: "👟", label: "New trainers" },
      { id: "picnic", emoji: "🧺", label: "Picnic date" },
      { id: "forestday", emoji: "🌲", label: "Forest day" },
      { id: "sunglasses", emoji: "🕶️", label: "New sunglasses" },
      { id: "breakfast", emoji: "🥐", label: "Outdoor breakfast" },
      { id: "padel", emoji: "🎾", label: "Padel class" },
      { id: "book", emoji: "📖", label: "New book for park reading" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "Step Out", sym: "forest", goal: "Make leaving easy.", days: [1, 1],
        milestones: [
          { id: "wg-1-letter", t: "letter", title: "Outside is not an activity. It is a switch.", body: "You don't have to earn going outside with a plan. Stepping out is a switch — light, air, movement — that can change your state in minutes. Use it like a tool." },
          { id: "wg-1-action", t: "action", title: "Prepare your leave-the-house kit", action: "text", body: "Shoes, jacket, headphones — by the door. The fewer decisions between you and outside, the more often you'll go." },
          { id: "wg-1-goal", t: "goal", title: "Complete one 5-minute outside Dare", goalHint: "Just cross the door and stay out five minutes." },
          { id: "wg-1-science", t: "science", title: "Daylight and circadian rhythm", scienceId: "daylight" },
          { id: "wg-1-proof", t: "proof", title: "I changed state by changing place." },
        ],
      },
      {
        n: "II", name: "Green Signal", sym: "reset", goal: "Use nature or green space.", days: [2, 3],
        milestones: [
          { id: "wg-2-letter", t: "letter", title: "Your nervous system notices where you are", body: "A street and a stand of trees don't feel the same, and that's not in your imagination. Green space is associated with a softer, more restored kind of attention." },
          { id: "wg-2-goal", t: "goal", title: "Complete one park or tree-lined walk", goalHint: "Choose a route with trees, a park, or any green you can reach." },
          { id: "wg-2-science", t: "science", title: "Green space and attention restoration", scienceId: "nature" },
          { id: "wg-2-proof", t: "proof", title: "I used green space." },
        ],
      },
      {
        n: "III", name: "Small Expedition", sym: "wildcard", goal: "Add novelty and exploration.", days: [4, 5],
        milestones: [
          { id: "wg-3-letter", t: "letter", title: "Novelty wakes up attention", body: "Same route, same mind. A new street, a turn you never take — novelty is associated with a small lift in attention and mood. Give your walk something to notice." },
          { id: "wg-3-goal", t: "goal", title: "Take one new route", goalHint: "Walk somewhere you don't usually go." },
          { id: "wg-3-goal2", t: "goal", title: "Complete one phone-light walk", goalHint: "Leave the phone in your pocket. Look up." },
          { id: "wg-3-science", t: "science", title: "Novelty, attention and mood", body: "New surroundings are associated with heightened attention and a small mood lift, which can make a familiar walk feel fresh again." },
        ],
      },
      {
        n: "IV", name: "Grounded", sym: "dream", goal: "Make outside a reset identity.", days: [6, 7],
        milestones: [
          { id: "wg-4-letter", t: "letter", title: "You can leave the room before you solve the problem", body: "You don't have to fix the mood before you move. Often the fastest route out of a stuck head is out the door — the thinking clears once you're walking." },
          { id: "wg-4-goal", t: "goal", title: "Complete your favourite outside Dare", goalHint: "The outside Dare that gave you the most energy." },
          { id: "wg-4-reflection", t: "reflection", title: "Where do I feel most alive?", body: "One line. Which place gave you the most back this week? Note it — that's your reset." },
          { id: "wg-4-badge", t: "badge", title: "↟ Outwalker", body: "Changes state by changing place." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Cross the Door", cat: "small", dareId: "out-the-door",
        dare: "5 min outside, no goal.", soft: "Step onto the doorstep and breathe.", bold: "10-minute walk, no destination.",
        trigger: "Just cross the door.", companion: "One song.", treat: "Orange juice.", proof: "Changed state by changing place.",
        scienceTitle: "Daylight", scienceBody: "Morning daylight is associated with a healthier circadian rhythm and a lift in daytime alertness." },
      { day: 2, title: "City Walk", cat: "walk", dareId: "podcast-mile",
        dare: "15 min walk.", soft: "5 min around the block.", bold: "25-minute walk with a turnaround point.",
        trigger: "Let your body lead.", companion: "Podcast.", treat: "Coffee.", proof: "Moved through the city.",
        scienceTitle: "Blood flow", scienceBody: "Walking increases blood flow, which is associated with better mood and clearer thinking." },
      { day: 3, title: "Green Route", cat: "forest", dareId: "pine-reset",
        dare: "Park, trees or green route.", soft: "Sit under a tree for a few minutes.", bold: "A longer loop through the greenest route you have.",
        trigger: "Find something alive.", companion: "Calm playlist.", treat: "Park reading.", proof: "Used green space.",
        scienceTitle: "Attention restoration", scienceBody: "Time in green space is associated with attention restoration — a softer, recovered kind of focus." },
      { day: 4, title: "New Route", cat: "walk", dareId: "leave-door",
        dare: "Take a new route.", soft: "One new street on your usual walk.", bold: "A whole route you've never walked.",
        trigger: "No autopilot today.", companion: "Music.", treat: "Nice snack.", proof: "Added novelty.",
        scienceTitle: "Novelty and attention", scienceBody: "New surroundings are associated with heightened attention and a small lift in mood." },
      { day: 5, title: "Phone-Light Walk", cat: "walk",
        dare: "A phone-light walk.", soft: "Phone in pocket for 5 minutes.", bold: "A full walk with no phone at all.",
        trigger: "Look up.", companion: "Silence.", treat: "Tea.", proof: "Reduced input.",
        scienceTitle: "Cognitive load", scienceBody: "Less incoming input lowers cognitive load, which can help attention recover while you walk." },
      { day: 6, title: "Outdoor Date", cat: "forest",
        dare: "An outdoor Date — make outside beautiful.", soft: "Coffee on a bench outside.", bold: "A half-day outdoors: picnic, park, walk.",
        trigger: "Make outside beautiful.", companion: "Book or camera.", treat: "Picnic or café.", proof: "Nourished energy.",
        scienceTitle: "Positive reinforcement", scienceBody: "Pairing outside with something you enjoy is positive reinforcement, associated with wanting to go again." },
      { day: 7, title: "Grounded", cat: "forest", chapter: true, dream: true,
        dare: "Your favourite outside Dare.", soft: "The gentlest version of it.", bold: "The longest or wildest version you've done.",
        trigger: "Choose your ground.", companion: "Best companion.", treat: "Dream Reward unlock.", proof: "Became someone who steps out.",
        scienceTitle: "Self-efficacy", scienceBody: "Knowing you can change your state by stepping out builds self-efficacy, associated with using it as a tool." },
    ],
  },

  // ======================= 07 — QUIET FIRE ⟁ =======================
  {
    id: "fire",
    name: "Quiet Fire",
    sym: "forge",
    color: JOURNEY_COLOR.fire,
    tag: "Courage in controlled doses.",
    problem: "I avoid discomfort, hard conversations or challenging actions.",
    promise: "Build courage without forcing recklessness.",
    lesson: "Confidence is built through completed discomfort.",
    bias: ["focus", "dumbbells", "fitboxing", "carry"],
    identity: { id: "forged", name: "Forged", line: "Does hard things in measured doses." },
    completionLine:
      "You did not need to feel fearless. You built proof that you can act with discomfort present.",
    dreamPrompt: "What would feeling braver be worth?",
    dreamOptions: [
      { id: "solodinner", emoji: "🍽️", label: "Solo dinner somewhere nice" },
      { id: "outfit", emoji: "👗", label: "New outfit" },
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "adventure", emoji: "🏔️", label: "Adventure day" },
      { id: "boxing", emoji: "🥊", label: "Padel or boxing class" },
      { id: "sephora", emoji: "💄", label: "Sephora €30" },
      { id: "weekend", emoji: "🗓️", label: "Weekend plan" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "Controlled Heat", sym: "forge", goal: "Make challenge safe and bounded.", days: [1, 1],
        milestones: [
          { id: "qf-1-letter", t: "letter", title: "Hard does not mean reckless", body: "Courage isn't throwing yourself off a cliff. It's choosing a discomfort you can handle, on purpose, and finishing it. Bounded challenge builds confidence; recklessness just builds fear." },
          { id: "qf-1-action", t: "action", title: "Choose your discomfort scale", action: "text", body: "Rate challenges 1–10 for yourself. A 3 is slightly uncomfortable; a 6 is a real stretch. You'll work up the scale, not leap it." },
          { id: "qf-1-goal", t: "goal", title: "Complete one 3/10 challenge", goalHint: "Something slightly uncomfortable — not heroic." },
          { id: "qf-1-science", t: "science", title: "Self-efficacy and controlled exposure", body: "Facing a manageable challenge and completing it is associated with growing self-efficacy — the felt sense that you can handle hard things." },
          { id: "qf-1-proof", t: "proof", title: "I entered controlled discomfort." },
        ],
      },
      {
        n: "II", name: "Brave Message", sym: "strong", goal: "Unblock social or professional discomfort.", days: [2, 3],
        milestones: [
          { id: "qf-2-letter", t: "letter", title: "A message can move your life", body: "The email you're avoiding, the ask you keep postponing — one message can change a month. The discomfort is anticipation. Sending it is usually lighter than not sending it." },
          { id: "qf-2-goal", t: "goal", title: "Send one brave message", goalHint: "The one you've been putting off. One sentence counts." },
          { id: "qf-2-goal2", t: "goal", title: "Ask for one thing clearly", goalHint: "State what you want in one clear line. Clear is kind." },
          { id: "qf-2-science", t: "science", title: "Avoidance and anticipatory discomfort", body: "Avoidance tends to grow the dread around a task. Acting is associated with relief, and the feared outcome is usually milder than the anticipation." },
          { id: "qf-2-proof", t: "proof", title: "I asked instead of avoiding." },
        ],
      },
      {
        n: "III", name: "Strong Signal", sym: "strength", goal: "Use physical challenge as confidence evidence.", days: [4, 5],
        milestones: [
          { id: "qf-3-letter", t: "letter", title: "The body teaches the brain", body: "Effort, control, completion — the body runs that loop every time you finish something physical. Your brain reads it as evidence: I can do hard things." },
          { id: "qf-3-goal", t: "goal", title: "Complete one strong physical Dare", goalHint: "A Strong-level strength, carry or Fitboxing Dare." },
          { id: "qf-3-motivator", t: "motivator", title: "You are allowed to take up force", body: "You don't have to shrink your effort to be likeable. Taking up space with force is not aggression — it's presence." },
          { id: "qf-3-science", t: "science", title: "Effort, control and confidence", body: "Completing controlled physical effort is associated with a sense of mastery, which can carry over into confidence off the mat." },
        ],
      },
      {
        n: "IV", name: "Forged", sym: "dream", goal: "Convert courage into identity.", days: [6, 7],
        milestones: [
          { id: "qf-4-letter", t: "letter", title: "You do not need to feel fearless", body: "Fearless isn't the goal — and it isn't real. The goal is to act with the fear present. That's what forged means: shaped by heat, not the absence of it." },
          { id: "qf-4-goal", t: "goal", title: "Complete one 6/10 challenge", goalHint: "A real stretch — bounded, chosen, finished." },
          { id: "qf-4-reflection", t: "reflection", title: "What did I survive that I was avoiding?", body: "One line. Name the thing you did this week that you'd been avoiding. Proof, in your own words." },
          { id: "qf-4-badge", t: "badge", title: "⟁ Forged", body: "Does hard things in measured doses." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "3/10 Challenge", cat: "focus",
        dare: "Pick a 3/10 challenge.", soft: "A 2/10 — barely uncomfortable.", bold: "A 4/10 challenge.",
        trigger: "Slightly uncomfortable. Not heroic.", companion: "Timer.", treat: "Coffee.", proof: "Entered controlled discomfort.",
        scienceTitle: "Self-efficacy", scienceBody: "Completing a manageable challenge is associated with growing self-efficacy — the felt belief that you can handle hard things." },
      { day: 2, title: "Brave Message", cat: "focus",
        dare: "Send one brave message.", soft: "Draft it; send when ready.", bold: "Send it and ask clearly for one thing.",
        trigger: "One sentence can move it.", companion: "Calm playlist.", treat: "Walk outside.", proof: "Asked instead of avoiding.",
        scienceTitle: "Avoidance loop", scienceBody: "Avoidance grows the dread around a task. Acting is associated with relief and a feared outcome milder than expected." },
      { day: 3, title: "Strong Physical Dare", cat: "dumbbells", dareId: "iron-first-weight",
        dare: "A strong physical Dare.", soft: "One round, moderate effort.", bold: "A full Strong-level session.",
        trigger: "Let the body lead.", companion: "Boss playlist.", treat: "Hot shower.", proof: "Built proof through effort.",
        scienceTitle: "Effort-control-completion loop", scienceBody: "Finishing controlled physical effort is associated with a sense of mastery that can carry into everyday confidence." },
      { day: 4, title: "Boring Hard Thing", cat: "focus",
        dare: "Do one boring hard thing for 20 min.", soft: "10 minutes on it.", bold: "Two blocks with a short break.",
        trigger: "No drama. Just the block.", companion: "Focus music.", treat: "Nice snack.", proof: "Stayed with discomfort.",
        scienceTitle: "Distress tolerance", scienceBody: "Staying with mild discomfort instead of escaping it is associated with building distress tolerance over time." },
      { day: 5, title: "Ask Clearly", cat: "focus",
        dare: "Ask clearly for one thing.", soft: "Write the ask down first.", bold: "Ask in person or by call.",
        trigger: "Clear is kind.", companion: "Silence.", treat: "Treat Draw.", proof: "Used directness.",
        scienceTitle: "Anticipatory discomfort", scienceBody: "The discomfort before asking is usually larger than the moment itself. Acting is associated with quick relief." },
      { day: 6, title: "5/10 Challenge", cat: "fitboxing",
        dare: "Choose a 5/10 challenge.", soft: "Scale it to a 4/10.", bold: "Push it toward a 6/10.",
        trigger: "More heat. Still controlled.", companion: "Best companion.", treat: "Recovery ritual.", proof: "Expanded capacity.",
        scienceTitle: "Stress adaptation", scienceBody: "Gradually rising, controlled challenge supports stress adaptation — the body and mind adjusting to handle more." },
      { day: 7, title: "Forged", cat: "focus", chapter: true, dream: true,
        dare: "One 6/10 Bold Dare.", soft: "A solid 4/10 still counts.", bold: "A genuine 7/10 you choose.",
        trigger: "Not fearless. Forged.", companion: "Boss playlist.", treat: "Dream Reward unlock.", proof: "Became someone who does hard things.",
        scienceTitle: "Confidence through evidence", scienceBody: "Confidence built on completed actions is associated with lasting longer than confidence based on feeling ready." },
    ],
  },
];


export const SPRINT_DAYS = 7;

export function journeyById(id: string): Journey {
  return JOURNEYS.find((j) => j.id === id) ?? JOURNEYS[0];
}

/** Capítulo activo dado el nº de días completados (0-index de día = progreso). */
export function chapterOf(j: Journey, daysDone: number): Chapter & { idx: number } {
  const dayNum = Math.min(SPRINT_DAYS, daysDone + 1); // el día "en curso"
  const idx = Math.max(
    0,
    j.chapters.findIndex((c) => dayNum >= c.days[0] && dayNum <= c.days[1]),
  );
  return { ...j.chapters[idx], idx };
}

/* ---- Desbloqueo de capítulos por COMPLETADO (no por calendario) ----
   Un capítulo se completa cuando TODOS sus milestones están hechos; el
   siguiente se desbloquea al instante, sin esperar a que cambie el día.
   Un capítulo sin milestones (placeholder) no se puede completar, así que
   actúa de tope: no desbloquea a los siguientes. */

/** ¿Están todos los milestones del capítulo completados? */
export function chapterCompleted(c: Chapter, done: Record<string, boolean>): boolean {
  return c.milestones.length > 0 && c.milestones.every((m) => done[m.id]);
}

/** Nº de capítulos desbloqueados: el 1º siempre; cada siguiente al completar el anterior. */
export function unlockedChapterCount(j: Journey, done: Record<string, boolean>): number {
  let n = 1;
  for (let i = 0; i < j.chapters.length - 1; i++) {
    if (chapterCompleted(j.chapters[i], done)) n++;
    else break;
  }
  return Math.min(n, j.chapters.length);
}

/** Estado de un capítulo dado el mapa de milestones completados. */
export function chapterState(j: Journey, idx: number, done: Record<string, boolean>): "done" | "now" | "locked" {
  if (chapterCompleted(j.chapters[idx], done)) return "done";
  return idx < unlockedChapterCount(j, done) ? "now" : "locked";
}

/** Capítulo "en curso": el primero desbloqueado y sin completar (o el último). */
export function currentChapter(j: Journey, done: Record<string, boolean>): Chapter & { idx: number } {
  const unlocked = unlockedChapterCount(j, done);
  for (let i = 0; i < unlocked; i++) {
    if (!chapterCompleted(j.chapters[i], done)) return { ...j.chapters[i], idx: i };
  }
  const idx = Math.max(0, unlocked - 1);
  return { ...j.chapters[idx], idx };
}

/** Total de milestones de un Journey (para el % de completion). */
export function totalMilestones(j: Journey): number {
  return j.chapters.reduce((n, c) => n + c.milestones.length, 0);
}
