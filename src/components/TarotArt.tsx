import { C } from "../data/colors";

/** Minimal line-art per arcana — Labyrinthos-style geometry in DARE's language.
    Placeholder set for the 12 arcana until the full gen-card.js SVGs land. */
export function TarotArt({ id, size = 64 }: { id: string; size?: number }) {
  const P = {
    fill: "none",
    stroke: C.gold,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const art: Record<string, JSX.Element> = {
    fool: (
      <>
        <circle cx="22" cy="16" r="7" {...P} />
        <path d="M6 52 L34 44" {...P} />
        <path d="M34 44 L34 60" {...P} strokeDasharray="2 3" />
        <circle cx="40" cy="40" r="2.4" fill={C.gold} stroke="none" />
      </>
    ),
    magician: (
      <>
        <path d="M14 20 C14 12, 26 12, 26 20 C26 28, 38 28, 38 20 C38 12, 26 12, 26 20 C26 28, 14 28, 14 20 Z" {...P} />
        <path d="M26 34 L26 56" {...P} />
        <circle cx="26" cy="60" r="2" fill={C.gold} stroke="none" />
      </>
    ),
    chariot: (
      <>
        <path d="M12 18 L12 44 M40 18 L40 44" {...P} />
        <circle cx="26" cy="50" r="8" {...P} />
        <path d="M26 42 L26 58 M18 50 L34 50" {...P} />
      </>
    ),
    strength: (
      <>
        <path d="M14 30 C14 22, 26 22, 26 30 C26 38, 38 38, 38 30 C38 22, 26 22, 26 30 C26 38, 14 38, 14 30 Z" {...P} />
        <path d="M10 52 Q26 44 42 52" {...P} />
      </>
    ),
    hermit: (
      <>
        <path d="M26 10 L26 20" {...P} />
        <path d="M26 20 L18 30 L26 40 L34 30 Z" {...P} />
        <circle cx="26" cy="30" r="2.4" fill={C.gold} stroke="none" />
        <path d="M26 40 L26 60" {...P} strokeDasharray="2 3" />
      </>
    ),
    wheel: (
      <>
        <circle cx="26" cy="34" r="16" {...P} />
        <path d="M26 18 L26 50 M10 34 L42 34 M15 23 L37 45 M37 23 L15 45" {...P} strokeWidth={1} />
        <circle cx="26" cy="34" r="3" {...P} />
      </>
    ),
    hanged: (
      <>
        <path d="M12 12 L40 12" {...P} />
        <path d="M26 12 L26 26" {...P} />
        <path d="M26 26 L16 44 L36 44 Z" {...P} />
        <circle cx="26" cy="52" r="3" {...P} />
      </>
    ),
    death: (
      <>
        <path d="M6 40 L46 40" {...P} />
        <path d="M12 40 A14 14 0 0 1 40 40" {...P} />
        <path d="M18 52 L34 52" {...P} strokeDasharray="2 3" />
      </>
    ),
    temperance: (
      <>
        <path d="M10 22 L22 22 L16 34 Z" {...P} />
        <path d="M30 40 L42 40 L36 52 Z" {...P} />
        <path d="M18 30 Q28 34 34 42" {...P} strokeDasharray="2 3" />
      </>
    ),
    tower: (
      <>
        <path d="M18 60 L18 20 L34 20 L34 60" {...P} />
        <path d="M14 20 L38 20" {...P} />
        <path d="M42 8 L32 20 L38 22 L28 34" {...P} />
        <circle cx="14" cy="42" r="1.6" fill={C.gold} stroke="none" />
        <circle cx="40" cy="48" r="1.6" fill={C.gold} stroke="none" />
      </>
    ),
    star: (
      <>
        <path d="M26 12 L28.5 24 L40 26.5 L28.5 29 L26 41 L23.5 29 L12 26.5 L23.5 24 Z" {...P} strokeWidth={1.2} />
        <path d="M8 52 Q17 48 26 52 T44 52" {...P} />
      </>
    ),
    sun: (
      <>
        <circle cx="26" cy="32" r="10" {...P} />
        <path d="M26 12 L26 17 M26 47 L26 52 M6 32 L11 32 M41 32 L46 32 M12 18 L16 22 M36 42 L40 46 M40 18 L36 22 M16 42 L12 46" {...P} strokeWidth={1.1} />
      </>
    ),
  };
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 52 70" aria-hidden="true">
      {art[id]}
    </svg>
  );
}
