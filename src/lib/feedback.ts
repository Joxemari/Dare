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

/** Shimmer sintetizado: un “brillo” místico que acompaña al giro de la carta.
    En vez de un acorde mayor luminoso (C5+G5), buscamos algo misterioso y
    ritual, en línea con el tarot de la app:

    - Registro grave con un DRONE sostenido (La, dos triángulos ligeramente
      desafinados → batido/“shimmer” vivo, sin percusividad).
    - Un arpegio lento en modo MENOR/suspendido (La menor add9: A·C·E·B) con
      osciladores desafinados por par, entra suave y con cola larga.
    - Un filtro paso-bajo que se ABRE despacio (400→2400 Hz): el sonido “emerge”
      de la penumbra, la sensación de revelación.
    - Una chispa muy tenue en agudos al final (armónico), como un destello.

    Todo sintetizado en el momento (sin assets → offline). */
export function playChime(): void {
  const ac = audioCtx();
  if (!ac) return;
  try {
    // El audio requiere gesto del usuario; si está suspendido, reanudar.
    if (ac.state === "suspended") ac.resume().catch(() => {});
    const now = ac.currentTime;

    // Bus común con un filtro que se abre despacio: el sonido emerge de la penumbra.
    const bus = ac.createGain();
    bus.gain.value = 0.9;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 1.4);
    bus.connect(filter).connect(ac.destination);

    // Voz reutilizable: par de osciladores desafinados (batido) → cola larga.
    const voice = (
      freq: number,
      t0: number,
      peak: number,
      dur: number,
      type: OscillatorType = "triangle",
      detune = 6,
    ) => {
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + dur * 0.18); // ataque suave
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      gain.connect(bus);
      [-detune, detune].forEach((cents) => {
        const osc = ac.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = cents;
        osc.connect(gain);
        osc.start(t0);
        osc.stop(t0 + dur + 0.1);
      });
    };

    // Drone grave sostenido (La2) — el “fondo” ritual.
    voice(110, now, 0.09, 2.6, "sine", 4);

    // Arpegio lento en La menor add9: A3 · C4 · E4 · B4. Modo menor = misterio.
    const arp = [220.0, 261.63, 329.63, 493.88];
    arp.forEach((freq, i) => voice(freq, now + 0.12 + i * 0.16, 0.1, 1.8 - i * 0.15));

    // Destello final muy tenue en agudos (E6), como un brillo que se apaga.
    voice(1318.51, now + 0.7, 0.03, 1.2, "sine", 3);
  } catch {
    /* no-op */
  }
}

/** Feedback al revelar la carta: vibración corta + shimmer. Se llama desde el
    tap (Home) para que el audio no lo bloquee la política de autoplay. */
export function cardRevealFeedback(): void {
  vibrate([12, 40, 10]); // doble pulso suave, más ritual que un golpe seco
  playChime();
}
