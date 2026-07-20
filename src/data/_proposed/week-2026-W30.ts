import type { Dare, Tier, Treat } from "../../types";

/* PROPUESTAS GENERADAS — semana 2026-W30. NO editar salvo revisión. Al aprobar:
   Dares/Wildcards → dares.ts/wildcards.ts, Treats → rewards.ts; borra este fichero. */
export const PROPOSED: Dare[] = [
  {
    "id": "gen-2026-w30-walk",
    "title": "The Unhurried Loop",
    "cat": "walk",
    "min": 15,
    "level": "Easy",
    "energy": [
      2,
      7
    ],
    "locs": [
      "city",
      "park"
    ],
    "companion": "One slow album.",
    "trigger": "No route. Just out.",
    "proof": "Moved before negotiating.",
    "effects": {
      "Energy": 2,
      "Calm": 1,
      "Mood": 1
    },
    "scienceId": "walking-outdoors",
    "steps": [
      "Album on before you sit back down",
      "Out the door, pick the softer direction",
      "Walk one unhurried loop",
      "Home when the album says so"
    ]
  }
];
export const PROPOSED_WILDCARDS: Dare[] = [
  {
    "id": "w-gen-2026-w30-dusk",
    "title": "Dusk Detour",
    "cat": "walk",
    "wild": true,
    "min": 15,
    "level": "Easy",
    "energy": [
      3,
      8
    ],
    "locs": [
      "city"
    ],
    "companion": "The changing light.",
    "trigger": "Turn where you never turn.",
    "proof": "Let the evening surprise me.",
    "effects": {
      "Calm": 2,
      "Mood": 2
    },
    "scienceId": "daylight",
    "steps": [
      "Head out at dusk",
      "Take one street you never take",
      "Follow it until it surprises you",
      "Find your way back slowly"
    ]
  }
];
export const PROPOSED_TREATS: Array<Treat & { tier: Tier }> = [
  {
    "tier": "common",
    "text": "Ten quiet minutes with the good tea."
  }
];
