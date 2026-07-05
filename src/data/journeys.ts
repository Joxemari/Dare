import type { Chapter, DayPlan, Journey, JourneyId, Milestone, MilestoneType } from "../types";
import type { SymbolKey } from "./symbols";
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
    promise: "Build real strength in twelve minutes, without the gym or the drama.",
    lesson: "Strength gives your energy somewhere to live.",
    bias: ["dumbbells", "carry", "tabata", "walk"],
    identity: { id: "quiet-builder", name: "Quiet Builder", line: "Uses strength to create energy." },
    completionLine:
      "You didn't get stronger by doing more. You got stronger by making it easy to start, attractive to repeat, and a little harder each time.",
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
        n: "I", name: "The First Two Reps", sym: "strength", goal: "Make starting impossible to refuse.", days: [1, 1],
        milestones: [
          { id: "iq-1-letter", t: "letter", title: "You don't have a discipline problem.", body: "You have a starting problem — and starting is a design problem, not a character flaw. BJ Fogg, who runs Stanford's Behavior Design Lab, built a life-changing habit from two push-ups after each toilet break; the trick was making the action so small refusal made no sense. Wendy Wood's research on habit says the same from the other side: durable behaviour runs on cues in your environment, not daily willpower. So we stop relying on motivation. We shrink the first move until it's laughable, and we let the room do the reminding. Twelve minutes is the session. Two reps is the door." },
          { id: "iq-1-action", t: "action", title: "Put your weights where you live", action: "text", body: "Out of the cupboard, into the room you actually sit in — beside the sofa, under the TV. A visible weight is a silent cue; a hidden one is a decision you'll keep postponing. Name where they'll live now." },
          { id: "iq-1-action2", t: "action", title: "Set your two-rep minimum", action: "text", body: "Decide the smallest version that still counts on your worst day: two goblet squats, one carry across the room. This floor never moves and never resets. On good days you'll do far more — but the streak you're protecting is 'I showed up', not 'I crushed it'. Write your minimum." },
          { id: "iq-1-goal", t: "goal", title: "Complete one 12-minute strength Dare", goalHint: "Check in at home — we'll give you a standing dumbbell Dare. If today is a bad day, your two-rep minimum still closes it." },
          { id: "iq-1-goal2", t: "goal", title: "Show up a second time", goalHint: "Even your two-rep minimum counts. Prove the floor holds twice — that's the habit, not the heroics." },
          { id: "iq-1-science", t: "science", title: "How habits actually form", scienceId: "habit-automaticity" },
          { id: "iq-1-proof", t: "proof", title: "I made strength a decision, not a mood." },
        ],
      },
      {
        n: "II", name: "Make It Attractive", sym: "strong", goal: "Bundle strength with something you love.", days: [2, 3],
        milestones: [
          { id: "iq-2-letter", t: "letter", title: "Trick yourself on purpose.", body: "James Clear's second law of behaviour change is 'make it attractive'. The cleanest way to do that is temptation bundling: pair the thing you should do with the thing you want. Behavioural economist Katy Milkman tested this by letting people hear page-turner audiobooks only at the gym — attendance jumped. So don't fight the pull of your favourite series. Use it. The next episode is the reward you lift for; the weights are the price of admission. This is why 'Netflix & Iron' beats a grim workout every time — you'll come back for the story." },
          { id: "iq-2-action", t: "action", title: "Create your Boss Playlist", action: "bossPlaylist", body: "The one that makes you feel unstoppable. Name it, pick the platform, choose the first song. Music you love is shown to lower how hard effort feels — this is the soundtrack that makes a set fly by." },
          { id: "iq-2-action2", t: "action", title: "Name your temptation bundle", action: "text", body: "Choose one show, podcast or album you'll allow yourself ONLY while training. Guard it — don't watch it on the sofa. Write the title. It becomes the reason you look forward to lifting." },
          { id: "iq-2-goal", t: "goal", title: "Complete one loaded carry Dare", goalHint: "Pick things up and carry them — farmer carries, laps or stairs. Grip and posture, no floor work." },
          { id: "iq-2-goal2", t: "goal", title: "Lift once with your bundle running", goalHint: "Same weights, but only press play on your bundled show while you move." },
          { id: "iq-2-science", t: "science", title: "Bundle the boring with the good", scienceId: "temptation-bundling" },
        ],
      },
      {
        n: "III", name: "A Little More", sym: "forge", goal: "Add a little more than last time.", days: [4, 5],
        milestones: [
          { id: "iq-3-letter", t: "letter", title: "Muscle is an account you fund now.", body: "Forget the mirror. Dr Gabrielle Lyon calls muscle 'the organ of longevity' — active tissue that holds your posture and plays a role in how steadily you handle glucose. Peter Attia frames it as an account: the strength and muscle you build in your prime is what protects your mobility and independence decades from now. And the mechanism for building it is almost boringly simple — progressive overload, first formalised by physician Thomas DeLorme in 1940s rehab wards: do a little more than last time. One more rep. A slightly heavier weight. A cleaner set. You're not decorating a shelf. You're making deposits." },
          { id: "iq-3-action", t: "action", title: "Start a lift log", action: "text", body: "One note on your phone: date, move, weight, reps. That's it. What gets measured moves — a log turns 'I should push a bit' into an obvious next number. Write today's lifts down the moment you finish." },
          { id: "iq-3-goal", t: "goal", title: "Complete two strength Dares this chapter", goalHint: "Two strength or carry Dares — log both." },
          { id: "iq-3-goal2", t: "goal", title: "Beat your last number by a little", goalHint: "One more rep, a slightly heavier weight, or one cleaner set than your log shows." },
          { id: "iq-3-motivator", t: "motivator", title: "Strong doesn't need to be loud", body: "No grunting, no posting, no suffering for an audience. Quiet, consistent, progressive strength outlasts the loud kind — because it's built on a system, not a mood. The person who adds one rep a week for a year is unrecognisable. Nobody watched them do it." },
          { id: "iq-3-science", t: "science", title: "Why grip strength keeps coming up", scienceId: "grip-longevity" },
          { id: "iq-3-proof", t: "proof", title: "I lifted more than the version of me who started." },
        ],
      },
      {
        n: "IV", name: "Quiet Power", sym: "dream", goal: "Turn strength into identity.", days: [6, 7],
        milestones: [
          { id: "iq-4-letter", t: "letter", title: "Every set is a vote.", body: "James Clear's sharpest idea: every action is a vote for the type of person you're becoming. You didn't spend this week chasing a number — you cast six or seven votes for 'someone who trains'. That's identity, and psychologist Albert Bandura showed why it lasts: doing the hard thing and finishing builds self-efficacy, the quiet belief that you can. That belief, not willpower, is what carries a habit through the flat weeks. You're not someone trying to get strong anymore. You're someone who lifts — and has the log to prove it." },
          { id: "iq-4-goal", t: "goal", title: "Complete your strongest session of the week", goalHint: "Pick the lift that felt best and repeat it — beat one number if you can." },
          { id: "iq-4-goal2", t: "goal", title: "Beat one number in your log", goalHint: "Open your lift log and beat a single number — one more rep or a little more weight. One deposit." },
          { id: "iq-4-reflection", t: "reflection", title: "Write one line: what got easier?", body: "One line. What's easier than seven days ago — a weight, a rep, or the moment of starting itself? Save it. It's the first entry in who you're becoming." },
          { id: "iq-4-badge", t: "badge", title: "△ Quiet Builder", body: "Uses strength to create energy." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "First Weight", cat: "dumbbells", dareId: "iron-first-weight",
        dare: "12 min dumbbells: goblet squat, dumbbell row, shoulder press, farmer hold.", soft: "Your two-rep minimum only.", bold: "Three full rounds.",
        trigger: "No gym. Just two weights.", companion: "The show you only watch while lifting.", treat: "Hot shower.", proof: "Made strength a decision, not a mood.",
        scienceTitle: "Why muscle is the organ of longevity", scienceBody: "Muscle is active tissue, not decoration: it holds your posture and plays a role in how steadily your body handles glucose. Dr Gabrielle Lyon calls it 'the organ of longevity'. Regular loading — even 12 minutes — signals the body to keep it, and is associated with steadier energy and better mobility as you age." },
      { day: 2, title: "Carry Strength", cat: "carry", dareId: "carry-strength",
        dare: "Farmer carry + squats + presses, 12–15 min.", soft: "Carry bags or dumbbells for 3 short rounds.", bold: "Heavier carries, longer distance.",
        trigger: "Pick things up. Carry them.", companion: "A short podcast.", treat: "Big glass of cold water.", proof: "Carried more than I thought I could.",
        scienceTitle: "Grip strength and healthy ageing", scienceBody: "Carries train grip, posture and core with no floor work. Grip strength is cheap to measure and, in large cohort studies like the international PURE study, is associated with overall muscular strength and healthier ageing — a marker of the account you're funding now." },
      { day: 3, title: "Boss Playlist Sets", cat: "tabata", dareId: "sweat-eight",
        dare: "8 min standing intervals, 20s on / 10s off, to your Boss Playlist.", soft: "4 min, one move.", bold: "12 min, two-move rounds.",
        trigger: "Boss playlist. Eight minutes.", companion: "Your Boss Playlist.", treat: "Cold drink.", proof: "Let the music carry the hard part.",
        scienceTitle: "Music, effort and temptation bundling", scienceBody: "Music you love is shown to lower perceived effort — a hard set feels more doable, though the physical work is the same. Pair that with temptation bundling (Katy Milkman's research): reserving a favourite playlist for training is associated with showing up more often." },
      { day: 4, title: "One Weight Flow", cat: "dumbbells", dareId: "kettlebell-flow",
        dare: "14 min flow: swings, goblet squats, presses with one weight. Log it.", soft: "Two easy rounds.", bold: "Four rounds, heavier.",
        trigger: "No gym. Just one weight.", companion: "Podcast or playlist.", treat: "Protein-rich snack.", proof: "Added a little more than last time.",
        scienceTitle: "Progressive overload — a little more than last time", scienceBody: "Getting stronger runs on one principle: progressive overload, formalised by physician Thomas DeLorme in the 1940s. Adding a rep, a little load, or a cleaner set over weeks is associated with steady gains and is gentler on motivation than big jumps. A quick lift log makes the next small step obvious." },
      { day: 5, title: "Loaded Walk", cat: "walk", dareId: "stair-climb",
        dare: "12 min: stairs or a brisk walk carrying something with intent.", soft: "One steady climb, then home.", bold: "Add a loaded backpack.",
        trigger: "Take the stairs on purpose.", companion: "One driving song.", treat: "Coffee in the sun.", proof: "Turned an ordinary climb into training.",
        scienceTitle: "Everyday load beats the elevator", scienceBody: "Climbing and loaded walking recruit the large muscles of the legs and hips and raise heart rate gently — a near-frictionless way to add strength and capacity that transfers straight into daily life. The best training is often the kind you barely schedule." },
      { day: 6, title: "Active Recovery", cat: "recovery",
        dare: "10 min standing mobility, or light dumbbells with no intensity.", soft: "7 min neck, shoulders, hips.", bold: "Full mobility flow.",
        trigger: "Recovery is still training.", companion: "Soft playlist.", treat: "Early night ritual.", proof: "Let the strength settle in.",
        scienceTitle: "You get stronger between sessions", scienceBody: "Muscle adapts during recovery, not only during effort. Easy movement and genuine rest support heart rate variability, a marker associated with a well-recovered nervous system — and a recovered body is one that shows up again tomorrow." },
      { day: 7, title: "Quiet Power", cat: "dumbbells", chapter: true, dream: true,
        dare: "Your strongest session of the week: dumbbells, kettlebell or carries. Beat one number.", soft: "The easiest version of it.", bold: "The strongest version you've done.",
        trigger: "Cast one more vote.", companion: "Best companion.", treat: "Dream Reward unlock.", proof: "Became someone who lifts — and has the log to prove it.",
        scienceTitle: "Identity and self-efficacy", scienceBody: "James Clear frames every rep as a vote for who you're becoming; Albert Bandura's work on self-efficacy explains why it sticks — doing the hard thing and finishing builds the quiet belief that you can, and that belief carries a habit long after any plan ends." },
    ],
  },

  // ======================= BRIGHT PULSE ◆ =======================
  {
    id: "pulse",
    name: "Bright Pulse",
    sym: "strong",
    color: JOURNEY_COLOR.pulse,
    tag: "Energy you can switch on.",
    problem: "I want fast energy, but 'cardio' has always sounded like punishment.",
    promise: "Eight-minute sessions, built on music and play, that switch you on.",
    lesson: "Intensity is a mood, not a chore.",
    bias: ["tabata", "fitboxing", "padel", "walk"],
    identity: { id: "bright-mover", name: "Bright Mover", line: "Turns energy up on purpose." },
    completionLine:
      "You stopped waiting for energy to arrive. You learned to generate it — one song, eight minutes, on demand.",
    dreamPrompt: "What would feeling switched-on again be worth?",
    dreamOptions: [
      { id: "headphones", emoji: "🎧", label: "New headphones" },
      { id: "class", emoji: "🥊", label: "Fitboxing class pack" },
      { id: "top", emoji: "🎽", label: "New training top" },
      { id: "concert", emoji: "🎫", label: "Concert or gig" },
      { id: "speaker", emoji: "🔊", label: "Bluetooth speaker" },
      { id: "trainers", emoji: "👟", label: "New trainers" },
      { id: "smoothie", emoji: "🥤", label: "Smoothie bar week" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "Turn It Up", sym: "strong", goal: "Prove eight minutes is a real session.", days: [1, 1],
        milestones: [
          { id: "bp-1-letter", t: "letter", title: "Four minutes made history once.", body: "In 1996, Japanese researcher Izumi Tabata published a study on Olympic speed skaters showing that four minutes of brutal intervals moved fitness markers that hours of steady training barely touched. Martin Gibala at McMaster University has spent twenty years extending the point in his lab and in The One-Minute Workout: even sixty-second 'exercise snacks' — a hard stair climb, one fast hill — are associated with real gains. The grim hour on a treadmill was never the entry price. Yours is eight minutes and a playlist that makes standing still impossible. This journey isn't about enduring cardio. It's about discovering you own a dial." },
          { id: "bp-1-action", t: "action", title: "Create your Boss Playlist", action: "bossPlaylist", body: "Three to five songs that make you feel unstoppable. Name it, pick the platform, choose the first track. Music you love is shown to lower how hard effort feels — this playlist is equipment, not decoration." },
          { id: "bp-1-action2", t: "action", title: "Anchor your eight minutes", action: "text", body: "Decide when the eight minutes live: after the first coffee, right after work, before the shower. Psychologists call this an implementation intention — deciding when-and-where in advance is associated with far higher follow-through than 'sometime today'. Write your anchor." },
          { id: "bp-1-goal", t: "goal", title: "Complete one 8-minute intensity Dare", goalHint: "Standing intervals or dance cardio at home — energy 5+. Your anchor moment is the cue." },
          { id: "bp-1-goal2", t: "goal", title: "Repeat your eight minutes once more", goalHint: "Same anchor, a second day. Prove it wasn't a fluke — the dial is yours." },
          { id: "bp-1-science", t: "science", title: "Minutes count more than you think", scienceId: "exercise-snacks" },
          { id: "bp-1-proof", t: "proof", title: "I proved eight minutes is enough." },
        ],
      },
      {
        n: "II", name: "Find the Rhythm", sym: "rhythm", goal: "Let music do half the work.", days: [2, 3],
        milestones: [
          { id: "bp-2-letter", t: "letter", title: "Music is legal doping.", body: "Costas Karageorghis, who has studied music and movement at Brunel University for decades, calls the right track 'a legal performance-enhancing drug': it reliably lowers how hard effort feels, so the same work simply costs less. Kelly McGonigal's The Joy of Movement goes further — when movement locks onto a beat, the brain starts predicting the rhythm and rewards you for landing on it. That's why dance cardio and shadowboxing work when 'exercising' doesn't: they aren't repetitions, they're groove. You don't need choreography. Humans bounce to a beat before they can walk." },
          { id: "bp-2-action", t: "action", title: "Build the three-song ladder", action: "text", body: "Pick three songs: one that starts you moving, one that pushes, one that finishes big. That's a complete session disguised as a playlist — structure without a spreadsheet. Write the three tracks." },
          { id: "bp-2-goal", t: "goal", title: "Complete one fitboxing or shadowboxing Dare", goalHint: "Jab, cross, hook — three rounds to a loud playlist. Land the punches on the beat." },
          { id: "bp-2-goal2", t: "goal", title: "Complete one dance cardio Dare", goalHint: "No choreography. Nobody's watching. Three songs, keep moving." },
          { id: "bp-2-science", t: "science", title: "Music and perceived effort", scienceId: "music-effort" },
          { id: "bp-2-proof", t: "proof", title: "I turned music into movement." },
        ],
      },
      {
        n: "III", name: "Make It Social", sym: "reset", goal: "Use play and people as fuel.", days: [4, 5],
        milestones: [
          { id: "bp-3-letter", t: "letter", title: "The rower's high is real.", body: "In 2010, Oxford researchers found that rowers training in sync could tolerate noticeably more discomfort than rowers training alone — moving together raises the body's natural painkillers. And psychiatrist Stuart Brown, who founded the National Institute for Play after studying thousands of life histories, argues adults don't quit movement because it's hard; they quit because it stops being play. A padel match is an interval session wearing a costume: you'll push harder, feel it less, and want to come back. Which is the entire game." },
          { id: "bp-3-action", t: "action", title: "Send the invite now", action: "text", body: "Text one person and propose a game or a fast walk this week — before this feeling cools. A sent invitation is a commitment device: future-you shows up because someone is waiting. Write who you asked." },
          { id: "bp-3-goal", t: "goal", title: "Complete one play or padel Dare", goalHint: "Book a court, rally against a wall, or race someone up a hill — it counts." },
          { id: "bp-3-goal2", t: "goal", title: "Move with someone once", goalHint: "A fast walk, a rally, a dance — anyone alongside you. Moving together makes hard feel lighter." },
          { id: "bp-3-motivator", t: "motivator", title: "Chase the buzz, not the exhaustion", body: "You don't have to suffer to get a real lift. The best sessions leave you brighter, not wrecked — and 'brighter' is the metric this journey actually tracks." },
          { id: "bp-3-proof", t: "proof", title: "I got a real lift from playing." },
        ],
      },
      {
        n: "IV", name: "Bright Return", sym: "dream", goal: "Make energy-on-demand an identity.", days: [6, 7],
        milestones: [
          { id: "bp-4-letter", t: "letter", title: "You own the dial now.", body: "William James suspected it over a century ago: 'We don't sing because we're happy; we're happy because we sing.' Modern behavioural activation research agrees — action changes state faster than waiting for the state to change you. You now have a week of your own evidence: eight minutes and one loud song, and the day tilts. That's not a workout plan. That's a switch you carry everywhere. Use it on the grey days especially — that's what it's for." },
          { id: "bp-4-goal", t: "goal", title: "Complete your favourite Pulse Dare", goalHint: "The session that gave you the biggest lift — repeat it, one notch brighter." },
          { id: "bp-4-goal2", t: "goal", title: "Use the switch on a grey day", goalHint: "Next flat moment, run eight minutes instead of scrolling. That's the rep that counts double." },
          { id: "bp-4-reflection", t: "reflection", title: "What flips your switch fastest?", body: "One line. Which session changed your state quickest this week — the intervals, the punches, the dance, the game? Keep it. That's your reset button, in writing." },
          { id: "bp-4-badge", t: "badge", title: "◆ Bright Mover", body: "Turns energy up on purpose." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Eight Bright Minutes", cat: "tabata", dareId: "sweat-eight",
        dare: "8 min standing intervals, 20s on / 10s off, to your Boss Playlist.", soft: "4 min, one move.", bold: "12 min, two-move rounds.",
        trigger: "Boss playlist. Eight minutes.", companion: "Your Boss Playlist.", treat: "Cold drink.", proof: "Proved eight minutes is enough.",
        scienceTitle: "Tabata's four minutes, your eight", scienceBody: "Izumi Tabata's 1996 protocol and Martin Gibala's 'exercise snack' research point the same way: short, honest bursts raise heart rate fast and are associated with real fitness gains — no long session required. The endorphin lift can outlast the session by hours." },
      { day: 2, title: "Shadow Rounds", cat: "fitboxing", dareId: "fitboxing-flow",
        dare: "15 min fitboxing flow: jab, cross, hook to a loud playlist.", soft: "3 rounds of shadowboxing.", bold: "20 min with combinations.",
        trigger: "Hit resistance back.", companion: "High-energy playlist.", treat: "Long shower.", proof: "Gave the day's stress somewhere to go.",
        scienceTitle: "Coordination, rhythm and stress discharge", scienceBody: "Boxing-style movement stacks three levers at once: coordination demands full attention (no room for rumination), rhythm turns effort into groove, and intensity is associated with discharging a wound-up state into controlled action." },
      { day: 3, title: "Dance Cardio", cat: "tabata", dareId: "dance-cardio",
        dare: "12 min dance cardio — three songs, no choreography.", soft: "One song, just move.", bold: "Five songs, full commitment.",
        trigger: "Nobody's watching. Move anyway.", companion: "Your three-song ladder.", treat: "Fresh smoothie.", proof: "Turned music into movement.",
        scienceTitle: "Groove and perceived effort", scienceBody: "Music you love is shown to lower how hard movement feels — Karageorghis calls it 'a legal performance-enhancing drug' — and moving on the beat turns repetition into groove. The session reads shorter and brighter than the clock says." },
      { day: 4, title: "Play a Game", cat: "padel", dareId: "book-the-court",
        dare: "Book padel with a friend, or rally against a wall.", soft: "15 min wall rally, solo.", bold: "Full match.",
        trigger: "This is play, not training.", companion: "A friend.", treat: "Matcha or coffee after.", proof: "Got a real lift from playing.",
        scienceTitle: "Synchrony and the rower's high", scienceBody: "Oxford research on rowers found that moving in sync with others raised pain thresholds — shared effort is associated with feeling easier than solo effort. Play is the friendliest interval session there is, and the one you'll actually rebook." },
      { day: 5, title: "Fast Feet Outside", cat: "walk", dareId: "stair-climb",
        dare: "12 min: brisk intervals, stairs or a fast loop.", soft: "One steady climb.", bold: "6 hill or stair repeats.",
        trigger: "Take the stairs on purpose.", companion: "One driving song.", treat: "Cold drink in the sun.", proof: "Turned the city into a session.",
        scienceTitle: "One-minute bursts, long-term returns", scienceBody: "A large 2022 UK study of everyday movement linked a few one-minute vigorous bursts — stairs, fast hills — with substantially better long-term health. Your commute can be a session; it just needs intent." },
      { day: 6, title: "Easy Reset", cat: "recovery",
        dare: "10 min gentle mobility — let the body come down.", soft: "5 min neck and shoulders.", bold: "Full mobility flow + long exhales.",
        trigger: "Bright doesn't mean burnt out.", companion: "Calm playlist.", treat: "Body lotion ritual.", proof: "Recharged the switch instead of forcing it.",
        scienceTitle: "Recovery between efforts", scienceBody: "The body adapts between efforts, not only during them. Easy movement and rest are associated with a well-recovered, more responsive nervous system — which is what makes tomorrow's intensity feel bright instead of heavy." },
      { day: 7, title: "Bright Return", cat: "tabata", chapter: true, dream: true,
        dare: "Your favourite Pulse session of the week.", soft: "The gentlest version of it.", bold: "The most intense version you've done.",
        trigger: "Turn it up one more time.", companion: "Best companion.", treat: "Dream Reward unlock.", proof: "Became someone who generates their own energy.",
        scienceTitle: "Action before mood", scienceBody: "William James guessed it and behavioural activation research confirmed it: acting changes state faster than waiting to feel like acting. Choosing and repeating your favourite session builds the self-efficacy that keeps the switch working long after this sprint ends." },
    ],
  },

  // ======================= 03 — STILL WATER ☾ =======================
  {
    id: "water",
    name: "Still Water",
    sym: "calm",
    color: JOURNEY_COLOR.water,
    tag: "A quieter head, a looser body.",
    problem: "I run wired all day and can't switch off at night.",
    promise: "Come down on purpose — breath, water, and a real ending to the day.",
    lesson: "Recovery is an action, not a collapse.",
    bias: ["recovery", "pool", "forest", "focus"],
    identity: { id: "regulator", name: "Regulator", line: "Knows how to lower the noise." },
    completionLine:
      "You learned that calm isn't something you wait for. It's somewhere you know the way back to.",
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
        n: "I", name: "Lower the Volume", sym: "calm", goal: "Learn the fastest way down.", days: [1, 1],
        milestones: [
          { id: "sw-1-letter", t: "letter", title: "The off-switch is trainable.", body: "In 1975 a Harvard cardiologist, Herbert Benson, showed that the body has a built-in 'relaxation response' — an off-switch that can be trained like a muscle, not a personality trait you either have or don't. Fifty years later, a Stanford trial (Balban, 2023) got specific about the fastest way in: five minutes a day of 'cyclic sighing' — two inhales through the nose, one long exhale — improved mood and lowered resting breathing rate over a month, edging out meditation. Wired-and-tired isn't a flaw in you. It's a nervous system that never gets the signal the day is over. This week, you learn to send the signal." },
          { id: "sw-1-action", t: "action", title: "Choose your calm signal", action: "text", body: "Pick the one cue that tells your body it's safe to come down — a candle, a song, the long exhale itself. Used consistently, a cue becomes a conditioned off-ramp: the body starts the descent before you've finished asking. Name yours." },
          { id: "sw-1-goal", t: "goal", title: "Complete one 5-minute downshift", goalHint: "Check in tired or stressed — we'll give you a 5-minute calm Dare. Two inhales, one long exhale." },
          { id: "sw-1-goal2", t: "goal", title: "Run your calm signal once more", goalHint: "Use your chosen cue a second time today or tomorrow — repetition trains the off-switch." },
          { id: "sw-1-science", t: "science", title: "The long exhale, measured", scienceId: "cyclic-sighing" },
          { id: "sw-1-proof", t: "proof", title: "I sent the off signal myself." },
        ],
      },
      {
        n: "II", name: "Waterline", sym: "water", goal: "Let water do the regulating.", days: [2, 3],
        milestones: [
          { id: "sw-2-letter", t: "letter", title: "Blue mind.", body: "Marine biologist Wallace J. Nichols spent a career on why humans go quiet near water — he called the state 'blue mind'. The mechanics are surprisingly physical: cool water on the face triggers the mammalian dive reflex, which slows the heart within seconds; immersion simplifies what your senses have to process; and swimming forces the long, rhythmic exhale that breathwork classes charge for. You can't always think your way calm. Water doesn't ask you to think." },
          { id: "sw-2-action", t: "action", title: "Book the water", action: "text", body: "Put one water slot in this week's calendar now — pool, bath, or an unhurried shower with the last minute slower. Recovery that isn't scheduled loses to everything else. Write when." },
          { id: "sw-2-goal", t: "goal", title: "Complete one water-based reset", goalHint: "Pool, shower or bath — choose water as today's reset." },
          { id: "sw-2-goal2", t: "goal", title: "Complete one slow walk", goalHint: "A 15-minute walk with no destination and no productivity goal." },
          { id: "sw-2-science", t: "science", title: "Blue mind", scienceId: "blue-mind" },
          { id: "sw-2-proof", t: "proof", title: "I let water do the regulating." },
        ],
      },
      {
        n: "III", name: "Evening Softening", sym: "shift", goal: "Give the day a real ending.", days: [4, 5],
        milestones: [
          { id: "sw-3-letter", t: "letter", title: "Say the day is closed.", body: "Cal Newport ends every workday with the same small ceremony: open loops written down, a plan for each, then a phrase that means it's over. It sounds precious until you see the evidence — Masicampo and Baumeister found that unfinished tasks stop intruding on the mind once you've written a concrete plan for them. You don't have to finish the day's work; you have to park it. Add what sleep scientist Matthew Walker keeps repeating in Why We Sleep — dim, regular, unstimulating evenings — and you get a real ending instead of a slow fade into your phone." },
          { id: "sw-3-action", t: "action", title: "Create a 20-minute shutdown shelf", action: "text", body: "Line up what a soft ending looks like: loops written down, dim light, a candle, tea, a book. Twenty minutes, same order, most nights — the sameness is the signal. Write your sequence." },
          { id: "sw-3-goal", t: "goal", title: "Complete one screen-light reduction", goalHint: "Dim or drop screens for the last stretch of the evening. Park tomorrow's loops on paper first." },
          { id: "sw-3-goal2", t: "goal", title: "Run your shutdown shelf once", goalHint: "Do the full 20-minute wind-down in order, one night: loops parked, dim light, tea, book." },
          { id: "sw-3-science", t: "science", title: "Why a shutdown ritual works", scienceId: "shutdown-ritual" },
        ],
      },
      {
        n: "IV", name: "Quiet Return", sym: "dream", goal: "Make regulation part of identity.", days: [6, 7],
        milestones: [
          { id: "sw-4-letter", t: "letter", title: "Calm is a skill, not weather.", body: "The people who look unshakeable aren't luckier — they've practised the return trip. Heart-rate variability, the metric recovery science leans on, is essentially the fitness of your braking system; like any fitness, it responds to training. This week you built the brake: a breath that works in minutes, water that works without effort, an evening that actually ends. You're not someone who hopes to feel calm anymore. You're someone who knows the way back." },
          { id: "sw-4-goal", t: "goal", title: "Complete one calm Dare when restless", goalHint: "Next time you feel restless, run your calm signal instead of scrolling. That's the rep that counts double." },
          { id: "sw-4-goal2", t: "goal", title: "End one day on purpose", goalHint: "Choose water or the long exhale as tonight's ending — your fastest way down, used deliberately." },
          { id: "sw-4-reflection", t: "reflection", title: "What brings me back?", body: "One line. Which signal worked fastest this week — the exhale, the water, the ending? Write it down and keep it where the restless version of you will find it." },
          { id: "sw-4-badge", t: "badge", title: "☾ Regulator", body: "Knows how to lower the noise." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Lower the Volume", cat: "recovery",
        dare: "5 min cyclic sighing: two inhales through the nose, one long exhale.", soft: "2 min, hand on chest.", bold: "10 min: cyclic sighing, then box breathing.",
        trigger: "Exhale longer than you inhale.", companion: "Timer.", treat: "Tea.", proof: "Sent the off signal myself.",
        scienceTitle: "Cyclic sighing, measured", scienceBody: "In a 2023 Stanford trial, five minutes of daily long-exhale breathing improved mood over a month, slightly outperforming meditation. The long exhale leans on the nervous system's built-in brake — parasympathetic activation." },
      { day: 2, title: "Slow Walk", cat: "walk", dareId: "night-walk",
        dare: "15 min slow walk, no productivity.", soft: "5 min around the block.", bold: "25 min unhurried loop.",
        trigger: "Walk like nothing is chasing you.", companion: "Soft playlist.", treat: "Fresh juice.", proof: "Moved without rushing anywhere.",
        scienceTitle: "Blood flow, mood and rumination", scienceBody: "A gentle walk increases blood flow and is associated with less rumination and a steadier mood — movement gives a spinning head somewhere quieter to sit." },
      { day: 3, title: "Waterline", cat: "pool", dareId: "water-window",
        dare: "Pool, shower or bath reset.", soft: "Warm shower, last minute slower.", bold: "Easy swim, then float.",
        trigger: "Let water change the signal.", companion: "Silence.", treat: "Body lotion.", proof: "Let water do the regulating.",
        scienceTitle: "Blue mind and the dive reflex", scienceBody: "Cool water on the face can trigger the mammalian dive reflex, slowing the heart within seconds; immersion simplifies sensory input. Wallace J. Nichols called the resulting quiet 'blue mind' — the pool does the coaching." },
      { day: 4, title: "Evening Shutdown", cat: "recovery",
        dare: "20 min shutdown ritual: park the open loops, dim the lights, close the day.", soft: "Dim the lights and make tea.", bold: "Full wind-down: loops on paper, no screens, candle, book.",
        trigger: "Give the day an ending.", companion: "Candle or music.", treat: "New tea.", proof: "Closed the day on purpose.",
        scienceTitle: "Parked loops and dim light", scienceBody: "Masicampo and Baumeister found unfinished tasks stop intruding once you've written a concrete plan for them — the day can end because it's parked, not abandoned. Dim, regular evenings also support the circadian rhythm that makes sleep arrive." },
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
    problem: "I stay inside too long and my energy flattens into fog.",
    promise: "Use light, streets and trees as a daily energy tool.",
    lesson: "Change the place and the mind follows.",
    bias: ["forest", "walk"],
    identity: { id: "outwalker", name: "Outwalker", line: "Changes state by changing place." },
    completionLine:
      "You learned that the fastest way to change your mind is often to change your place.",
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
        n: "I", name: "Step Out", sym: "forest", goal: "Make leaving the house frictionless.", days: [1, 1],
        milestones: [
          { id: "wg-1-letter", t: "letter", title: "Solvitur ambulando.", body: "'It is solved by walking' — the phrase is old enough that nobody's sure who said it first, and it keeps being rediscovered. Nietzsche claimed all truly great thoughts are conceived while walking; Dickens paced London half the night to untangle his plots. The mechanism under the poetry is blunt: even an overcast sky delivers many times more light than a lit room, and that morning light anchors the circadian clock that decides how awake you feel at four in the afternoon. You don't need a hike, a view or good weather. You need the door — and a reason to be on the other side of it." },
          { id: "wg-1-action", t: "action", title: "Prepare your leave-the-house kit", action: "text", body: "Shoes, jacket, headphones — by the door tonight. BJ Fogg would call this shrinking the behaviour to its trigger: the fewer decisions between you and outside, the more often you'll go. Name what's in your kit and where it lives." },
          { id: "wg-1-action2", t: "action", title: "Claim your ten-minute slot", action: "text", body: "Pick the daily moment the outside gets: with the first coffee, after lunch, at the school run. Same slot every day — habits attach to anchors, not intentions. Write the slot." },
          { id: "wg-1-goal", t: "goal", title: "Complete one 5-minute outside Dare", goalHint: "Just cross the door and stay out five minutes. The door is the whole workout." },
          { id: "wg-1-goal2", t: "goal", title: "Cross the door a second day", goalHint: "Same slot, same kit, one more day. The door gets lighter every time you use it." },
          { id: "wg-1-science", t: "science", title: "Daylight and circadian rhythm", scienceId: "daylight" },
          { id: "wg-1-proof", t: "proof", title: "I changed state by changing place." },
        ],
      },
      {
        n: "II", name: "Green Signal", sym: "reset", goal: "Use green space as medicine.", days: [2, 3],
        milestones: [
          { id: "wg-2-letter", t: "letter", title: "Soft fascination.", body: "Psychologists Rachel and Stephen Kaplan spent their careers on one simple observation: focused attention is a muscle that tires, and nature restores it in a way streets and screens don't. They called the mechanism 'soft fascination' — leaves, water and light hold attention gently, without demanding it. In Japan the idea became practice: Dr Qing Li's research on shinrin-yoku, forest bathing, associates unhurried time among trees with lower stress markers. The trees aren't décor. They're doing something to you — you just have to stand under them long enough to collect it." },
          { id: "wg-2-goal", t: "goal", title: "Complete one park or tree-lined walk", goalHint: "Choose a route with trees, a park, or any green you can reach. Slow counts." },
          { id: "wg-2-goal2", t: "goal", title: "Stand under trees for two slow minutes", goalHint: "No walking needed — just soft fascination: leaves, light, water. Let the green restore you." },
          { id: "wg-2-science", t: "science", title: "Green space and attention restoration", scienceId: "nature" },
          { id: "wg-2-proof", t: "proof", title: "I let the green do the restoring." },
        ],
      },
      {
        n: "III", name: "Small Expedition", sym: "wildcard", goal: "Add novelty and awe on foot.", days: [4, 5],
        milestones: [
          { id: "wg-3-letter", t: "letter", title: "Walk somewhere you've never been.", body: "A Stanford experiment by Marily Oppezzo found people produced far more creative ideas while walking than sitting — and the effect lingered after they sat back down. Add novelty and it compounds: in a UCSF study, people asked to take a weekly fifteen-minute 'awe walk' — deliberately noticing what's vast, old or surprising — reported more positive emotion and less daily distress within eight weeks. Same legs, same city. The variable is where you point them, and what you agree to notice on the way." },
          { id: "wg-3-action", t: "action", title: "Draw one new line on your map", action: "text", body: "Pick a street, park or route you've never walked and name the day you'll take it. Novelty is cheap when you plan it and rare when you don't. Write the route." },
          { id: "wg-3-goal", t: "goal", title: "Take one new route", goalHint: "Walk the line you drew. No autopilot." },
          { id: "wg-3-goal2", t: "goal", title: "Complete one phone-light walk", goalHint: "Leave the phone in your pocket. Look up — that's where the awe is." },
          { id: "wg-3-science", t: "science", title: "The awe walk effect", scienceId: "awe-walks" },
        ],
      },
      {
        n: "IV", name: "Grounded", sym: "dream", goal: "Make outside your reset identity.", days: [6, 7],
        milestones: [
          { id: "wg-4-letter", t: "letter", title: "Attention is the beginning of devotion.", body: "That's Mary Oliver's line, and she wrote most of her poems on foot. Thoreau called an early-morning walk 'a blessing for the whole day'. After a week of doors, green routes and new streets, you know what they meant — not as poetry, but as procedure: you don't have to solve the mood before you move. When the head is stuck, the body knows the way out. Move first, and let the place do the arguing." },
          { id: "wg-4-goal", t: "goal", title: "Complete your favourite outside Dare", goalHint: "The outside Dare that gave you the most back — repeat it." },
          { id: "wg-4-goal2", t: "goal", title: "Take one more new street", goalHint: "One route you've never walked — end the week with a little novelty on foot." },
          { id: "wg-4-reflection", t: "reflection", title: "Where do I feel most alive?", body: "One line. Which place gave you the most back this week — the pines, the new street, the bench in the sun? Name it. That's your reset, with an address." },
          { id: "wg-4-badge", t: "badge", title: "↟ Outwalker", body: "Changes state by changing place." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Cross the Door", cat: "small", dareId: "out-the-door",
        dare: "5 min outside, no goal.", soft: "Step onto the doorstep and breathe.", bold: "10-minute walk, no destination.",
        trigger: "Just cross the door.", companion: "One song.", treat: "Orange juice.", proof: "Changed state by changing place.",
        scienceTitle: "Daylight sets the clock", scienceBody: "Even an overcast sky delivers many times more light than a lit room, and morning daylight anchors the circadian rhythm — which is associated with steadier daytime energy and easier sleep at night. Five minutes out the door is a real dose." },
      { day: 2, title: "City Walk", cat: "walk", dareId: "podcast-mile",
        dare: "15 min walk.", soft: "5 min around the block.", bold: "25-minute walk with a turnaround point.",
        trigger: "Let your body lead.", companion: "Podcast.", treat: "Coffee.", proof: "Solved something by walking.",
        scienceTitle: "Solvitur ambulando", scienceBody: "Walking increases blood flow and is associated with better mood and clearer thinking — Nietzsche claimed his best thoughts arrived on foot, and Stanford experiments later agreed: people generate markedly more ideas while walking than sitting." },
      { day: 3, title: "Green Route", cat: "forest", dareId: "pine-reset",
        dare: "Park, trees or green route.", soft: "Sit under a tree for a few minutes.", bold: "A longer loop through the greenest route you have.",
        trigger: "Find something alive.", companion: "Calm playlist.", treat: "Park reading.", proof: "Let the green do the restoring.",
        scienceTitle: "Soft fascination", scienceBody: "The Kaplans' attention restoration research suggests nature repairs tired, directed attention through 'soft fascination' — and forest-bathing studies in Japan associate slow time among trees with lower stress markers." },
      { day: 4, title: "New Route", cat: "walk", dareId: "leave-door",
        dare: "Take a new route.", soft: "One new street on your usual walk.", bold: "A whole route you've never walked.",
        trigger: "No autopilot today.", companion: "Music.", treat: "Nice snack.", proof: "Walked a line I'd never drawn.",
        scienceTitle: "Novelty compounds a walk", scienceBody: "New surroundings are associated with heightened attention and a lift in mood — the same walk with a different map gives your brain something to actually notice." },
      { day: 5, title: "Phone-Light Walk", cat: "walk",
        dare: "A phone-light walk.", soft: "Phone in pocket for 5 minutes.", bold: "A full walk with no phone at all.",
        trigger: "Look up.", companion: "Silence.", treat: "Tea.", proof: "Gave my attention the hour off.",
        scienceTitle: "The awe walk effect", scienceBody: "In a UCSF study, weekly fifteen-minute 'awe walks' — deliberately noticing what's vast, old or surprising — were associated with more positive emotion within eight weeks. Awe needs a raised head; the phone stays in the pocket." },
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

/* ---- MVP: solo 4 Journeys se ofrecen para empezar ----
   DARE es physical-energy-first. El MVP arranca con 4 Journeys físicos:
   Iron Quiet (fuerza), Bright Pulse (cardio divertido), Wild Ground (fuera)
   y Still Water (recuperación). El resto del set (First Flame, Clear Signal,
   Steady Current, Quiet Fire) se conservan en los datos como CONCEPTOS DE
   ROADMAP y para no romper el progreso guardado, pero NO aparecen en la
   selección de Journeys. Ver CLAUDE.md. */
export const MVP_JOURNEY_IDS: JourneyId[] = ["iron", "pulse", "wild", "water"];

/** Los Journeys del MVP, en el orden en que se ofrecen. */
export const MVP_JOURNEYS: Journey[] = MVP_JOURNEY_IDS
  .map((id) => JOURNEYS.find((j) => j.id === id))
  .filter((j): j is Journey => !!j);

/** ¿Es `id` uno de los Journeys del MVP (ofrecibles)? */
export const isMvpJourney = (id: string): boolean => (MVP_JOURNEY_IDS as string[]).includes(id);

/** Journeys de roadmap: se conservan en datos y se muestran como "Coming soon"
 *  (solo preview — nombre, tag, promesa y estructura de capítulos), sin poder
 *  empezarse. Para reintroducir uno basta añadir su id a MVP_JOURNEY_IDS. */
export const ROADMAP_JOURNEYS: Journey[] = JOURNEYS.filter((j) => !isMvpJourney(j.id));

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

/** El primer milestone sin completar del capítulo en curso (la "próxima
 *  acción" real y accionable), o null si el Journey no tiene pendientes. */
export function nextMilestone(j: Journey, done: Record<string, boolean>): Milestone | null {
  const ch = currentChapter(j, done);
  return ch.milestones.find((m) => !done[m.id]) ?? null;
}

/** Dentro de un capítulo, un milestone se ACTIVA solo cuando todos los
 *  anteriores del mismo capítulo están completados (progresión secuencial):
 *  "Start" no se ofrece hasta terminar el milestone previo. Un milestone ya
 *  completado siempre cuenta como desbloqueado (para poder revisarlo). Puro. */
export function milestoneUnlocked(c: Chapter, index: number, done: Record<string, boolean>): boolean {
  for (let i = 0; i < index; i++) {
    if (!done[c.milestones[i].id]) return false;
  }
  return true;
}

/** Una sola "próxima acción" de un Journey para la lista de Today: el título del
 *  primer milestone sin completar; si no queda ninguno, la promesa del Journey. */
export function nextAction(j: Journey, done: Record<string, boolean>): string {
  return nextMilestone(j, done)?.title ?? j.promise;
}

/** Progreso por milestones de un Journey: hechos / total / porcentaje (0..100).
 *  Es la MISMA base que dispara la completion (`journeyComplete`), así que la
 *  barra de Dream Reward y la banda de la pantalla Journey miden lo mismo:
 *  milestones, no días de calendario. */
export function milestoneProgress(j: Journey, done: Record<string, boolean>): { done: number; total: number; pct: number } {
  const all = j.chapters.flatMap((c) => c.milestones);
  const total = all.length;
  const doneCount = all.filter((m) => done[m.id]).length;
  return { done: doneCount, total, pct: total ? Math.round((doneCount / total) * 100) : 0 };
}

/** Total de milestones de un Journey (para el % de completion). */
export function totalMilestones(j: Journey): number {
  return j.chapters.reduce((n, c) => n + c.milestones.length, 0);
}

/** ¿Están completados TODOS los milestones de TODOS los capítulos?
 *  Es la señal de "Journey completado" (spec): al marcar el último milestone
 *  del último capítulo, el Journey se da por terminado —aunque hayan pasado
 *  menos de 7 días de calendario— y dispara la celebración. Requiere que el
 *  Journey tenga al menos un milestone (nunca completo un Journey vacío). */
export function journeyComplete(j: Journey, done: Record<string, boolean>): boolean {
  const total = totalMilestones(j);
  return total > 0 && j.chapters.every((c) => chapterCompleted(c, done));
}

/** Todos los ids de milestone de un Journey (para limpiar al cancelar). Puro. */
export function journeyMilestoneIds(j: Journey): string[] {
  return j.chapters.flatMap((c) => c.milestones.map((m) => m.id));
}

/**
 * El día del plan que toca HOY según los días completados (`daysDone`). Puro.
 * `daysDone` es el índice 0-based del progreso: con 0 hechos, hoy es plan[0]
 * (Day 1). Si el sprint está completo (daysDone >= 7), devuelve null.
 */
export function todaysDayPlan(j: Journey, daysDone: number): DayPlan | null {
  if (daysDone >= j.plan.length) return null;
  return j.plan[daysDone] ?? null;
}

/* ---- Variantes de dificultad de un día (spec: ◌ Soft / ◆ Real / ⟁ Bold) ---- */
export type VariantKey = "soft" | "real" | "bold";
export interface DayVariant {
  key: VariantKey;
  label: string;
  sym: SymbolKey;
  text: string;
}

/** Símbolo por variante (design tokens de `symbols.ts`). */
export const VARIANT_SYM: Record<VariantKey, SymbolKey> = { soft: "soft", real: "strong", bold: "forge" };

/**
 * Variantes disponibles de un día, en orden Soft → Real → Bold. Función PURA.
 * "Real" cae al texto principal del día (`dare`). Un día sin contenido rico
 * (planes antiguos) devuelve []. La UI ofrece "Real" por defecto.
 */
export function dayVariants(p: DayPlan): DayVariant[] {
  const out: DayVariant[] = [];
  if (p.soft) out.push({ key: "soft", label: "Soft", sym: VARIANT_SYM.soft, text: p.soft });
  if (p.dare) out.push({ key: "real", label: "Real", sym: VARIANT_SYM.real, text: p.dare });
  if (p.bold) out.push({ key: "bold", label: "Bold", sym: VARIANT_SYM.bold, text: p.bold });
  return out;
}

/** Variante recomendada por defecto: Real si existe, si no la primera disponible. */
export function defaultVariant(p: DayPlan): VariantKey | null {
  const vs = dayVariants(p);
  return vs.find((v) => v.key === "real")?.key ?? vs[0]?.key ?? null;
}
