import type { Dare } from "../types";

/** Dares inesperados de un pool especial — sellados y revelados en dorado. */
export const WILDCARDS: Dare[] = [
  { id: "w-sunset-swim", title: "Sunset Swim", cat: "pool", wild: true, min: 25, level: "Medium", energy: [4, 9], locs: ["pool"],
    trigger: "Time it with the light.", companion: "The light itself.", proof: "Accepted an unexpected Dare.",
    effects: { Calm: 3, Mood: 2, Recovery: 2 }, scienceId: "swimming",
    steps: ["Time it with the sunset", "Swim easy while the light drops", "Stop counting anything", "Leave when the sky says so"] },
  { id: "w-unturned", title: "The Unturned Street", cat: "walk", wild: true, min: 15, level: "Medium", energy: [3, 8], locs: ["outside"],
    trigger: "Turn where you never turn.", companion: "Somewhere new.", proof: "Accepted an unexpected Dare.",
    effects: { Energy: 2, Mood: 2, Focus: 1 }, scienceId: "walking-outdoors",
    steps: ["Walk your usual route", "At the first street you've never turned into — turn", "Follow it until it surprises you", "Find your way back"] },
  { id: "w-night-pines", title: "Night Pines", cat: "forest", wild: true, min: 15, level: "Medium", energy: [3, 8], locs: ["forest", "outside"],
    trigger: "Go at dusk.", companion: "One album, in the dark.", proof: "Accepted an unexpected Dare.",
    effects: { Calm: 3, Mood: 2 }, scienceId: "nature",
    steps: ["Go at dusk", "One album, no phone light", "Walk into the pines and stand still for one song", "Come back slowly"] },
  { id: "w-cold-dawn", title: "Cold Dawn", cat: "recovery", wild: true, min: 5, level: "Medium", energy: [2, 8], locs: ["home"],
    trigger: "Before the world wakes.", companion: "Being awake first.", proof: "Accepted an unexpected Dare.",
    effects: { Energy: 2, Recovery: 1, Confidence: 1 }, scienceId: "breath-recovery",
    steps: ["Catch the first light from the window or the street", "Then: shower, last 30 seconds cold", "Breathe through it", "The day starts owing you one"] },
  { id: "w-rain-shine", title: "Rain or Shine", cat: "walk", wild: true, min: 10, level: "Medium", energy: [3, 8], locs: ["outside"],
    trigger: "Go out as the sky is.", companion: "Weather, unfiltered.", proof: "Accepted an unexpected Dare.",
    effects: { Energy: 2, Mood: 2 }, scienceId: "walking-outdoors",
    steps: ["Check nothing. Go out exactly as the sky is", "Walk 10 minutes in whatever weather this is", "Let it be part of the dare", "Come back with a story"] },
];
