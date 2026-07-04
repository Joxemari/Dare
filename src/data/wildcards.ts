import type { Dare } from "../types";

/** Unexpected dares from a special pool — sealed and revealed in gold. */
export const WILDCARDS: Dare[] = [
  { id: "w-sunset-swim", title: "Sunset Swim", cat: "pool", wild: true, min: 25, xp: 50, level: "Medium", energy: [4, 9], locs: ["pool"], reward: "The light itself",
    steps: ["Time it with the sunset", "Swim easy while the light drops", "Stop counting anything", "Leave when the sky says so"] },
  { id: "w-unturned", title: "The Unturned Street", cat: "walk", wild: true, min: 15, xp: 35, level: "Medium", energy: [3, 8], locs: ["outside"], reward: "Somewhere new",
    steps: ["Walk your usual route", "At the first street you've never turned into — turn", "Follow it until it surprises you", "Find your way back"] },
  { id: "w-night-pines", title: "Night Pines", cat: "forest", wild: true, min: 15, xp: 40, level: "Medium", energy: [3, 8], locs: ["forest", "outside"], reward: "One album, in the dark",
    steps: ["Go at dusk", "One album, no phone light", "Walk into the pines and stand still for one song", "Come back slowly"] },
  { id: "w-cold-dawn", title: "Cold Dawn", cat: "recovery", wild: true, min: 5, xp: 25, level: "Medium", energy: [2, 8], locs: ["home"], reward: "Being awake before the world",
    steps: ["Catch the first light from the window or the street", "Then: shower, last 30 seconds cold", "Breathe through it", "The day starts owing you one"] },
  { id: "w-rain-shine", title: "Rain or Shine", cat: "walk", wild: true, min: 10, xp: 30, level: "Medium", energy: [3, 8], locs: ["outside"], reward: "Weather, unfiltered",
    steps: ["Check nothing. Go out exactly as the sky is", "Walk 10 minutes in whatever weather this is", "Let it be part of the dare", "Come back with a story"] },
];
