import { useState } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { buildCardShareData, buildCardShareText } from "../lib/share";
import type { TarotCard } from "../types";

/* Compartir la Daily Card (Idea 1 de docs/social-layer.md).
   Este componente es la FRONTERA con el DOM: compone una imagen de la carta
   en <canvas> y la entrega a la Web Share API (WhatsApp, Instagram Stories,
   etc.). La lógica pura (texto/payload) vive en `src/lib/share.ts` y se testea
   allí; aquí solo hay efectos (canvas, `navigator.share`, portapapeles), que no
   se testean en el entorno `node` de Vitest — mismo espíritu que TarotArt.
   Defensivo por diseño: si el canvas o la Web Share fallan, cae a compartir
   solo texto y, en último término, a copiar al portapapeles. */

/** URL canónica de la app (origin + base de Vite), para el payload de share. */
function appUrl(): string {
  return window.location.origin + import.meta.env.BASE_URL;
}

/** Envuelve texto a un ancho máximo en px sobre el contexto dado. */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Compone la carta como PNG 1080×1350 (formato retrato, encaja en feed e
 * Historias). Devuelve `null` si algo falla — el llamador cae a texto.
 */
async function composeCardImage(card: TarotCard): Promise<Blob | null> {
  try {
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Espera a que las fuentes autoalojadas estén listas antes de dibujar texto.
    if (document.fonts?.ready) await document.fonts.ready;

    // Fondo + glow dorado superior (mismo lenguaje visual que la Home).
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.7);
    glow.addColorStop(0, `${C.gold}22`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";

    // Wordmark
    ctx.fillStyle = C.gold;
    ctx.font = '600 34px "Space Grotesk", system-ui, sans-serif';
    ctx.letterSpacing = "10px";
    ctx.fillText("DARE", W / 2, 130);
    ctx.letterSpacing = "0px";

    // Arte de la carta (WebP estático, mismo origen → canvas no se contamina).
    const img = await loadImage(`${import.meta.env.BASE_URL}arcana/${card.id}.webp`);
    let imgBottom = 210;
    if (img) {
      const iw = 440;
      const ih = iw * (img.naturalHeight / img.naturalWidth || 1.35);
      const ix = (W - iw) / 2;
      const iy = 200;
      // marco tenue como en la UI
      ctx.strokeStyle = `${C.gold}55`;
      ctx.lineWidth = 2;
      ctx.strokeRect(ix - 10, iy - 10, iw + 20, ih + 20);
      ctx.drawImage(img, ix, iy, iw, ih);
      imgBottom = iy + ih;
    } else {
      // Fallback ✦ (misma marca que TarotArt cuando falta el fichero).
      ctx.fillStyle = `${C.gold}88`;
      ctx.font = '120px "Space Grotesk", system-ui, sans-serif';
      ctx.fillText(SYMBOLS.spark, W / 2, 430);
      imgBottom = 480;
    }

    // Número · nombre
    ctx.fillStyle = C.gold;
    ctx.font = '500 30px "Space Grotesk", system-ui, sans-serif';
    ctx.letterSpacing = "4px";
    ctx.fillText(`${card.num} · ${card.name.toUpperCase()}`, W / 2, imgBottom + 80);
    ctx.letterSpacing = "0px";

    // Mensaje (serif, envuelto)
    ctx.fillStyle = C.text;
    ctx.font = 'italic 44px "Cormorant Garamond", Georgia, serif';
    const lines = wrapLines(ctx, `“${card.msg}”`, W - 220);
    let y = imgBottom + 170;
    for (const l of lines.slice(0, 8)) {
      ctx.fillText(l, W / 2, y);
      y += 58;
    }

    // Tagline
    ctx.fillStyle = C.dim;
    ctx.font = '400 26px "Space Grotesk", system-ui, sans-serif';
    ctx.letterSpacing = "2px";
    ctx.fillText("Daily Actions. Real Energy.", W / 2, H - 90);

    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  } catch {
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function ShareCardButton({ card }: { card: TarotCard }) {
  const [state, setState] = useState<"idle" | "working" | "copied">("idle");

  async function share() {
    setState("working");
    const url = appUrl();
    const data = buildCardShareData(card, url);

    try {
      const blob = await composeCardImage(card);
      const file = blob ? new File([blob], `dare-${card.id}.png`, { type: "image/png" }) : null;

      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: data.title, text: data.text, files: [file] });
        setState("idle");
        return;
      }
      if (navigator.share) {
        await navigator.share(data);
        setState("idle");
        return;
      }
    } catch (e) {
      // El usuario canceló el diálogo nativo: no es un error, no hacemos fallback.
      if ((e as Error)?.name === "AbortError") {
        setState("idle");
        return;
      }
      // cualquier otro fallo → caemos al portapapeles abajo
    }

    // Fallback (desktop / sin Web Share): copiar el texto al portapapeles.
    try {
      await navigator.clipboard.writeText(`${buildCardShareText(card)}\n${url}`);
      setState("copied");
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      className="link"
      onClick={share}
      disabled={state === "working"}
      style={{ marginTop: 12, alignSelf: "flex-start", color: C.gold, opacity: state === "working" ? 0.6 : 1 }}
    >
      {state === "copied" ? "Copied to clipboard" : `${SYMBOLS.spark} Share card`}
    </button>
  );
}
