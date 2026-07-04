import { DARES } from "../data/dares";
import { WILDCARDS } from "../data/wildcards";
import { TAROT } from "../data/tarot";
import type { Dare, TarotCard } from "../types";

const ALL: Dare[] = [...DARES, ...WILDCARDS];

export function findDare(id: string): Dare | undefined {
  return ALL.find((d) => d.id === id);
}

export function findCard(id: string | null | undefined): TarotCard | undefined {
  if (!id) return undefined;
  return TAROT.find((c) => c.id === id);
}
