import type { Dare } from "../types";

export const DARES: Dare[] = [
  // SMALL (3 min)
  { id: "out-the-door", title: "Out the Door", cat: "small", min: 3, xp: 10, level: "Easy", energy: [1, 10], locs: ["home", "outside", "forest"], reward: "Fresh air",
    steps: ["Put on shoes", "Step outside", "Walk for 3 minutes", "Come back if you want"] },
  { id: "one-song", title: "One Song Standing", cat: "small", min: 3, xp: 10, level: "Easy", energy: [1, 10], locs: ["home"], reward: "One great song",
    steps: ["Play one song you love", "Stand up", "Move, sway or shadowbox until it ends", "That was it"] },
  { id: "water-window", title: "Water & Window", cat: "small", min: 3, xp: 10, level: "Easy", energy: [1, 10], locs: ["home"], reward: "A clear head",
    steps: ["Drink a glass of water", "Open a window", "20 slow bodyweight squats", "Done"] },

  // FOREST
  { id: "operation-forest", title: "Operation Forest", cat: "forest", min: 18, xp: 35, level: "Easy", energy: [4, 7], locs: ["forest", "outside"], reward: "Your current podcast",
    steps: ["Put on shoes", "Start your favorite podcast", "Walk to the pines", "Every time a segment ends: 10 squats", "Walk back and mark complete"] },
  { id: "pine-reset", title: "Pine Reset", cat: "forest", min: 12, xp: 25, level: "Easy", energy: [1, 5], locs: ["forest", "outside"], reward: "Silence", states: ["stressed", "tired", "blocked"],
    steps: ["Leave the phone in your pocket", "Walk slowly into the pines", "Breathe in 4, out 6", "Notice three sounds", "Turn back whenever you want"] },
  { id: "forest-intervals", title: "Forest Intervals", cat: "forest", min: 25, xp: 50, level: "Strong", energy: [7, 10], locs: ["forest", "outside"], reward: "Your loudest playlist",
    steps: ["Warm up: 5 min easy walk", "Brisk pace to the pines", "5 × 30-second hill strides, walk back down", "Easy walk home"] },
  { id: "dawn-pines", title: "Dawn Pines", cat: "forest", min: 20, xp: 40, level: "Medium", energy: [4, 8], locs: ["forest", "outside"], reward: "Coffee after",
    steps: ["Shoes on before you think about it", "Walk to the forest at an easy pace", "One loop among the trees", "Coffee is waiting when you're back"] },

  // WALK
  { id: "podcast-mile", title: "Podcast Mile", cat: "walk", min: 20, xp: 35, level: "Easy", energy: [3, 7], locs: ["outside", "forest"], reward: "Your current podcast",
    steps: ["Pick one episode", "Press play only once you're walking", "Walk until the segment ends", "Head home"] },
  { id: "album-side-a", title: "Album Side A", cat: "walk", min: 25, xp: 40, level: "Medium", energy: [4, 8], locs: ["outside", "forest"], reward: "The full album, walking",
    steps: ["Choose an album, start at track one", "Walk the whole side A", "No skipping songs", "Turn around at the halfway track"] },
  { id: "errand-run", title: "The Real Errand", cat: "walk", min: 10, xp: 20, level: "Easy", energy: [2, 7], locs: ["outside"], reward: "One thing off your list",
    steps: ["Pick one real errand within walking distance", "Walk there — no car", "Do the thing", "Walk back. Two wins."] },
  { id: "night-walk", title: "Night Walk", cat: "walk", min: 15, xp: 30, level: "Easy", energy: [2, 6], locs: ["outside"], reward: "Quiet streets", states: ["stressed", "tired"],
    steps: ["Coat on, headphones optional", "Walk around the block, slow", "Let the day settle", "Come home lighter"] },

  // DUMBBELLS (standing / seated — never hands on the floor)
  { id: "netflix-iron", title: "Netflix & Iron", cat: "dumbbells", min: 20, xp: 45, level: "Medium", energy: [5, 9], locs: ["home"], reward: "Next episode of your series",
    steps: ["Press play on your show", "Every 5 minutes: 10 goblet squats", "Then 10 curls, 10 shoulder presses", "Repeat until the episode ends", "You trained. It barely noticed."] },
  { id: "standing-five", title: "The Standing Five", cat: "dumbbells", min: 12, xp: 30, level: "Medium", energy: [4, 8], locs: ["home"], reward: "Your loudest playlist",
    steps: ["Two rounds of five moves, 10 reps each:", "Goblet squat", "Curl", "Shoulder press", "Bent-over row", "30-second farmer hold"] },
  { id: "heavy-carry", title: "Heavy Carry", cat: "dumbbells", min: 8, xp: 20, level: "Easy", energy: [3, 7], locs: ["home"], reward: "Done in 8 minutes",
    steps: ["Grab both dumbbells", "Walk laps around the house or up the stairs", "Rest when grip fails", "Repeat until the timer ends"] },
  { id: "coffee-lifts", title: "Coffee Lifts", cat: "dumbbells", min: 10, xp: 25, level: "Easy", energy: [3, 7], locs: ["home"], reward: "Coffee after",
    steps: ["Start the coffee", "While it brews: squats, curls, presses", "3 easy sets, nothing heroic", "Drink the coffee you earned"] },

  // FITBOXING
  { id: "round-one", title: "Round One", cat: "fitboxing", min: 30, xp: 60, level: "Strong", energy: [7, 10], locs: ["gym"], reward: "The best shower of the week",
    steps: ["The gym is downstairs. That's the whole trick.", "Wrap up, glove up", "Take the class — just follow along", "Hit the bag like it owes you money"] },
  { id: "shadow-rounds", title: "Shadow Rounds", cat: "fitboxing", min: 10, xp: 25, level: "Medium", energy: [5, 8], locs: ["home"], reward: "Loud music",
    steps: ["Music up", "3 rounds × 2 minutes of shadowboxing", "1 minute rest between rounds", "Light feet, loose shoulders"] },

  // POOL
  { id: "twenty-lengths", title: "Twenty Lengths", cat: "pool", min: 30, xp: 55, level: "Strong", energy: [6, 10], locs: ["pool"], reward: "Pool time",
    steps: ["Pack the bag before you can argue", "Swim 20 lengths, any style, any pace", "Rest at the wall whenever", "Float for the last two minutes"] },
  { id: "water-reset", title: "Water Reset", cat: "pool", min: 20, xp: 35, level: "Easy", energy: [3, 6], locs: ["pool"], reward: "Weightlessness", states: ["stressed", "tired"],
    steps: ["Easy swim, no counting", "Slow breaststroke, long exhales", "Finish floating on your back", "Water does the rest"] },

  // PADEL
  { id: "book-the-court", title: "Book the Court", cat: "padel", min: 30, xp: 60, level: "Strong", energy: [7, 10], locs: ["padel"], reward: "It's a game, not a workout",
    steps: ["Text a friend now — before the dare cools down", "Book the court", "Play. Just play.", "Winner buys nothing. It's not about that."] },
  { id: "wall-rally", title: "Wall Rally", cat: "padel", min: 15, xp: 30, level: "Medium", energy: [5, 8], locs: ["padel", "outside"], reward: "Your loudest playlist",
    steps: ["Racket and one ball", "Rally against the wall", "Count your longest streak", "Beat it once, then stop"] },

  // RECOVERY (no hand-supported positions)
  { id: "floor-breath", title: "Floor & Breath", cat: "recovery", min: 10, xp: 20, level: "Easy", energy: [1, 4], locs: ["home"], reward: "Stillness", states: ["blocked", "tired", "stressed"],
    steps: ["Lie on the mat, knees bent", "Box breathing: 4 in, 4 hold, 4 out, 4 hold", "Gentle knee-to-chest, one side at a time", "Legs up the wall for 3 minutes"] },
  { id: "shoulders-undone", title: "Shoulders, Undone", cat: "recovery", min: 8, xp: 15, level: "Easy", energy: [1, 5], locs: ["home", "outside"], reward: "Less noise in the body",
    steps: ["Stand tall", "Slow neck circles, both ways", "Shoulder rolls, big and slow", "Reach up, then let everything drop. Twice."] },
  { id: "hot-cold", title: "Hot / Cold Finish", cat: "recovery", min: 5, xp: 15, level: "Easy", energy: [1, 8], locs: ["home"], reward: "Instant reboot",
    steps: ["Normal shower", "Last 30 seconds: as cold as you can stand", "Breathe through it", "Step out new"] },

  // FOCUS
  { id: "the-unblock", title: "The Unblock", cat: "focus", min: 10, xp: 20, level: "Easy", energy: [1, 6], locs: ["home", "outside"], reward: "Free time after", states: ["blocked", "stressed"],
    steps: ["Walk outside for 3 minutes — no phone", "Come back", "Write the single next tiny step of the stuck thing", "Do only that step"] },
  { id: "sunlight-first", title: "Sunlight First", cat: "focus", min: 5, xp: 15, level: "Easy", energy: [1, 7], locs: ["outside", "home"], reward: "A real morning",
    steps: ["Go outside within an hour of waking", "Face the light, eyes soft", "Two minutes, no phone", "Now the day can start"] },
  { id: "clear-desk", title: "Clear Desk, Clear Mind", cat: "focus", min: 10, xp: 20, level: "Easy", energy: [2, 6], locs: ["home"], reward: "One playlist", states: ["blocked"],
    steps: ["One playlist, press play", "Clear the desk until it ends", "Everything has a place or the bin", "Sit down at a clean surface"] },
];
