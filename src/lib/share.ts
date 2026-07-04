import type { TarotCard } from "../types";

/* ============================================================
   Capa social — compartir la Daily Card (Idea 1 de docs/social-layer.md).
   Aquí vive SOLO la parte PURA y testeable: construir el texto y el
   payload que se pasará a la Web Share API. El efecto (componer la imagen
   en <canvas>, llamar a `navigator.share`, fallback a portapapeles) vive en
   `src/components/ShareCardButton.tsx`, que es la frontera con el DOM —
   mismo criterio que el resto del repo (lógica pura en `src/lib`, efectos
   en la frontera). Ver CLAUDE.md.
   ============================================================ */

/** Tagline de marca — lo que cierra el mensaje compartido. */
export const TAGLINE = "Daily Actions. Real Energy.";

/** Payload para `navigator.share`: título, cuerpo y URL por separado. */
export interface CardShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Texto que acompaña la carta al compartirla (WhatsApp, IG, etc.).
 * En inglés como el resto de la UI. Voz coherente con las cartas
 * (número · nombre, mensaje entrecomillado, firma de marca).
 */
export function buildCardShareText(card: TarotCard): string {
  return `${card.num} · ${card.name}\n\n“${card.msg}”\n\nMy DARE card today · ${TAGLINE}`;
}

/**
 * Payload completo para la Web Share API. La `url` la resuelve la frontera
 * (origin + base) y se inyecta aquí para mantener la función pura/testeable.
 */
export function buildCardShareData(card: TarotCard, url: string): CardShareData {
  return {
    title: `DARE — ${card.name}`,
    text: buildCardShareText(card),
    url,
  };
}
