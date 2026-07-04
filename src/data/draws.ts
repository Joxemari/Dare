import type { Tier } from "../types";
import { C } from "./colors";

/* Reward draws — concrete, buyable, doable. Variable reward is the hook. */
export const DRAWS = {
  common: [
    "Buy yourself a fresh orange juice.",
    "One coffee, sitting down, phone face-down.",
    "A croissant from the good bakery.",
    "Tonight: one episode of your current series, zero guilt.",
    "Your favorite album, from track one, while doing nothing else.",
    "Ten minutes in the sun. That's it. That's the reward.",
  ],
  rare: [
    "Ice cream today — in whatever weather this is.",
    "A long shower with no clock.",
    "Order the fancy coffee. The one with a surname.",
    "Thirty guilt-free minutes of absolutely anything.",
  ],
  golden: [
    { text: "Golden ticket — dinner tonight is whatever you want.", x2: false },
    { text: "Double XP — applied.", x2: true },
    { text: "Buy yourself one small thing this week. This card is the permission.", x2: false },
  ],
} as const;

export const TIER: Record<Tier, { color: string; label: string }> = {
  common: { color: C.green, label: "Reward" },
  rare: { color: C.purple, label: "Rare reward" },
  golden: { color: C.gold, label: "Golden reward" },
};
