import type { ReactNode } from "react";
import type { Cat } from "../types";

/* Icon set — line-art, same language as the Arcana cards. No emoji.
   Each entry is the inner content of a 24×24 viewBox SVG (see <Ico>). */
export const ICONS: Record<string, ReactNode> = {
  pine: (
    <>
      <path d="M8 12 L12 6 L16 12" />
      <path d="M6 17 L12 9.5 L18 17" />
      <path d="M12 17 L12 21" />
    </>
  ),
  headphones: (
    <>
      <path d="M5 15 v-1 a7 7 0 0 1 14 0 v1" />
      <rect x="4" y="14" width="3.4" height="6" rx="1.6" />
      <rect x="16.6" y="14" width="3.4" height="6" rx="1.6" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M8.5 12 H15.5" />
      <path d="M6.5 8.5 V15.5 M4.5 10 V14 M17.5 8.5 V15.5 M19.5 10 V14" />
    </>
  ),
  bag: (
    <>
      <rect x="9" y="8" width="6" height="11" rx="3" />
      <path d="M12 8 V5 M10 4.5 H14" />
    </>
  ),
  waves: (
    <>
      <path d="M4 10 Q6.5 7.5 9 10 T14 10 T19 10" />
      <path d="M4 15 Q6.5 12.5 9 15 T14 15 T19 15" />
    </>
  ),
  racket: (
    <>
      <circle cx="12" cy="8.5" r="5" />
      <path d="M12 13.5 V20" />
      <circle cx="10.5" cy="7.2" r="0.4" />
      <circle cx="13.5" cy="7.2" r="0.4" />
      <circle cx="10.5" cy="9.8" r="0.4" />
      <circle cx="13.5" cy="9.8" r="0.4" />
    </>
  ),
  moon: <path d="M14.5 3.5 a8.5 8.5 0 1 0 6 14.5 a7 7 0 0 1 -6 -14.5 Z" />,
  eye: (
    <>
      <path d="M3 12 Q12 5.5 21 12 Q12 18.5 3 12 Z" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  spark: <path d="M12 4 Q12.7 11.3 20 12 Q12.7 12.7 12 20 Q11.3 12.7 4 12 Q11.3 11.3 12 4 Z" />,
  letter: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4.5 7 L12 13 L19.5 7" />
    </>
  ),
  goal: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="12" cy="12" r="0.6" />
    </>
  ),
  bolt: <path d="M13 3 L6.5 13 H11 L10 21 L17.5 10.5 H13 Z" />,
  bulb: (
    <>
      <path d="M12 3.5 a5.8 5.8 0 0 1 3.4 10.5 c-.8.6-1.1 1.4-1.1 2.3 h-4.6 c0-.9-.3-1.7-1.1-2.3 A5.8 5.8 0 0 1 12 3.5 Z" />
      <path d="M10.2 19 H13.8 M10.8 21 H13.2" />
    </>
  ),
  flame: <path d="M12 3.5 C15.3 7.6 16.8 10 16.8 13.2 A4.8 4.8 0 0 1 7.2 13.2 C7.2 10.4 9.4 7.6 12 3.5 Z" />,
  sine: <path d="M4 12 Q8 5.5 12 12 T20 12" />,
  mountain: (
    <>
      <path d="M3 18.5 L9 8 L13.6 16" />
      <path d="M11.2 12 L15 6.5 L21 18.5" />
    </>
  ),
  bars: (
    <>
      <path d="M6 19 V12" />
      <path d="M12 19 V5.5" />
      <path d="M18 19 V15" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19.5 a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  check: <path d="M5 12.5 L10 17.5 L19 7" />,
  card: (
    <>
      <rect x="7" y="3.5" width="10" height="17" rx="2" />
      <path d="M12 8 Q12.4 11.6 15 12 Q12.4 12.4 12 16 Q11.6 12.4 9 12 Q11.6 11.6 12 8 Z" />
    </>
  ),
  phone: (
    <>
      <rect x="7.5" y="3" width="9" height="18" rx="2.2" />
      <path d="M10.6 18 H13.4" />
    </>
  ),
  chat: (
    <>
      <path d="M5 6.5 h14 a1.5 1.5 0 0 1 1.5 1.5 v6 a1.5 1.5 0 0 1 -1.5 1.5 H10 l-4 3 v-3 H5 a1.5 1.5 0 0 1 -1.5 -1.5 v-6 A1.5 1.5 0 0 1 5 6.5 Z" />
    </>
  ),
  broom: (
    <>
      <path d="M15.5 4 L9 10.5" />
      <path d="M6 13 l5 5" />
      <path d="M5 19 c2-1 3-3 6-3 l2 2 c0 3-2 4-3 6 Z" />
    </>
  ),
};

export const CAT_ICO: Record<Cat, string> = {
  forest: "pine",
  walk: "headphones",
  dumbbells: "dumbbell",
  fitboxing: "bag",
  pool: "waves",
  padel: "racket",
  tabata: "bolt",
  carry: "dumbbell",
  recovery: "moon",
  focus: "eye",
  small: "spark",
  // movimiento consciente / Flow (Wave 2)
  yoga: "sine",
  taichi: "waves",
  qigong: "moon",
  climbing: "goal",
  // anti-procrastinación / activación
  admin: "letter",
  communication: "chat",
  bodyreset: "sine",
  environment: "broom",
  creative: "bulb",
  social: "person",
  decision: "goal",
  emotion: "moon",
  phone: "phone",
  taskcontact: "goal",
  close: "check",
};
