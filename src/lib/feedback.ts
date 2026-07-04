/* ============================================================
   DARE — feedback háptico y sonoro (frontera con efectos).

   Impuro POR DISEÑO: usa `navigator.vibrate` y la Web Audio API,
   así que vive fuera de los módulos puros de `src/lib` y no se
   testea unitariamente (misma categoría que `storage.ts`).

   Sin assets: el sonido se sintetiza en el momento (nada de
   ficheros de audio ni CDN → funciona offline). Todo va guardado
   tras comprobaciones de disponibilidad y try/catch para no
   romper donde no hay soporte (p. ej. iOS Safari no implementa
   `vibrate`, y el audio puede estar bloqueado hasta un gesto del
   usuario — por eso el feedback se dispara desde el propio tap).
   ============================================================ */

let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  // Un único contexto reutilizado (crear uno por reproducción agota recursos).
  if (!ctx) ctx = new AC();
  return ctx;
}

/** Vibración corta (no-op si el dispositivo/navegador no la soporta). */
export function vibrate(pattern: number | number[] = 18): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* no-op */
  }
}

/** Shimmer sintetizado: dos senoides suaves (C5 + G5) con decay exponencial.
    Discreto, sin percusividad — un “brillo” que acompaña al giro de la carta. */
export function playChime(): void {
  const ac = audioCtx();
  if (!ac) return;
  try {
    // El audio requiere gesto del usuario; si está suspendido, reanudar.
    if (ac.state === "suspended") ac.resume().catch(() => {});
    const now = ac.currentTime;
    const notes = [523.25, 783.99]; // C5, G5 — quinta, luminoso
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = now + i * 0.09; // ligero arpegio
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + 0.95);
    });
  } catch {
    /* no-op */
  }
}

/** Feedback al revelar la carta: vibración corta + shimmer. Se llama desde el
    tap (Home) para que el audio no lo bloquee la política de autoplay. */
export function cardRevealFeedback(): void {
  vibrate(18);
  playChime();
}
