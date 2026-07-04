# DARE — Instrucciones del proyecto

**DARE = Daily Actions. Real Energy.**
App de activación de energía para una persona con TDAH, ocupada y cansada. No es una app de fitness: elimina la fatiga de decisión. Cada día: check-in de 20 segundos → la app asigna UN solo "dare" → lo completas → XP → viaje de 4 capítulos. UI en **inglés**. Estética Co-Star: dark, mínima, poética.

---

## 1. Decisiones de producto (fijadas)

- **Un dare al día, asignado, nunca elegido.** El usuario jamás ve listas de ejercicios. Tras completarlo, opción **"One more dare"** (multi-dare por día; insignia "Double day"). Solo el primer dare del día suma racha.
- **"Just dare me"**: botón alternativo que salta el check-in usando el último contexto conocido (`lastCheckin`). Disponible en home y dentro del check-in.
- **Re-entrada tras ausencia**: si hay hueco de días, la primera pantalla es "No reset. Take the next dare." + "Your streak sleeps. It doesn't die." con un small dare ya servido y un solo botón. Nada de estadísticas ni culpa. La vuelta es la interacción más barata de la app.
- **Wildcards**: ~18% de probabilidad (si time ≥ 10 y energy ≥ 3) de que el generador sirva un dare inesperado de un pool especial. Sellado y revelado en dorado. Insignia propia.
- **Reward draw**: al completar, carta sellada que se voltea → recompensa aleatoria con rareza (common 70% / rare 24% / golden 6%). Golden puede duplicar el XP del dare. Recompensa variable = el gancho. La recompensa "durante" (podcast, Netflix…) se mantiene.
- **Cartas diarias de tarot (arcanos mayores, estrictamente)**: cada día, 3 cartas boca abajo en home (rectangulares, ratio de baraja ~5:8.5, dorso con doble borde y ✦); el usuario elige una y se revela con ilustración line-art minimalista propia (estética Labyrinthos adaptada al lenguaje visual de DARE: trazo dorado fino sobre fondo oscuro) + numeral romano + nombre. Pool de 12 arcanos: The Fool, The Magician, The Chariot, Strength, The Hermit, Wheel of Fortune, The Hanged Man, Death, Temperance, The Tower, The Star, The Sun. **Voz de los mensajes: Co-Star** — directa, seca, específica y aplicable; nunca cursi ni horóscopo genérico.
- **Revelado en un solo paso**: tap en la carta sellada → directamente a la pantalla de detalle (el revelado ES el detalle). Desde home ya revelada, el CTA es "Start dare" (arranca el timer directo); "See steps & why" queda como link secundario. Nunca dos taps para lo mismo.
- **Rewards concretos**: los reward draws son cosas comprables/hacibles hoy ("Buy yourself a fresh orange juice", "A croissant from the good bakery", "Ice cream today — in whatever weather this is"). Los rewards "durante" nombran lo del usuario ("Your current podcast", "Next episode of your series"). En producción (Fase 2): el onboarding pide podcast/serie/álbum reales del usuario y los rewards muestran esos nombres con deep-links.
- **Sección You rica**: anillo de nivel con progreso al siguiente, grid de stats (dares/racha/insignias), "Your patterns" (barras por categoría + categoría que más energía da según feedback), carta del día, journey actual y manifiesto.
- **Journeys → Chapters (estilo Fabulous)**: el usuario puede elegir un journey; cada journey tiene 4 chapters (8 dares/chapter, el IV abierto) y progreso independiente que se conserva al cambiar. Nombres evocadores, nunca literales.
- **Idioma UI: inglés.** Tono: directo, poético, calmado, nunca cursi.
- **Tiempos de check-in: 3 / 10 / 20 / 30 min.** Navegación inferior: Today / Journey / Progress / You.
- **Racha flexible, sin culpa.** Día perdido → "No reset. Take the next dare." Nunca lenguaje de castigo, calorías o peso.
- **Versión de 3 minutos siempre disponible** desde cualquier dare.
- **La recompensa empieza durante el dare** (podcast, playlist, Netflix con mancuernas), no solo después.
- **El feedback de energía (+30 min) alimenta al generador**: categorías que históricamente dan energía reciben bonus de scoring. Este es el diferencial de la app.
- **Estado "revelado pero no empezado"**: el dare persiste hasta medianoche; después se archiva en silencio, sin mensaje de fallo.
- **Prohibido**: push-ups, planchas, burpees, HIIT largos, ejercicios de suelo con apoyo de manos, planes repetitivos de gimnasio.
- **Recursos disponibles**: mancuernas, esterilla (sin apoyo de manos), comba (solo elemento lúdico opcional), piscina, pista de pádel, parque, pinar cercano, gimnasio de Fitboxing abajo, caminar con música/podcast, fuerza viendo Netflix.

## 2. Generador de dares (spec)

Función de **scoring**, no if/else encadenados:

1. **Wildcard previo a todo**: si `time ≥ 10`, `energy ≥ 3` y `random < 0.18` → dare del pool WILDCARDS (filtrado por loc/tiempo). Si no hay match, sigue el flujo normal.
2. **Filtros duros**: `time === 3` → solo Small Dares. `duration ≤ time + 2`. Localización compatible. `energy ≤ 3` o estado blocked/tired → solo nivel Easy con duración ≤ 12 min o Small Dare.
3. **Scoring** (suma ponderada):
   - Encaje de energía con el rango [min, max] del dare: +30 si dentro, penalización proporcional a la distancia si fuera.
   - Estado mental: blocked/tired → +12 a small/recovery/walk/forest/focus; stressed → +12 a forest/recovery/pool/walk; active → +10 a dumbbells/fitboxing/padel/pool.
   - **Bias del journey activo**: +10 si la categoría está en `journey.bias` (Iron Quiet → dumbbells/fitboxing/padel; Still Water → recovery/focus/pool/forest; The Ember → sin bias).
   - **Anti-repetición**: −18 si la categoría coincide con la última; −40 si coincide con las dos últimas.
   - **Feedback de energía**: `+6 × feedback acumulado de la categoría`.
   - Jitter aleatorio pequeño (evita determinismo total).
4. **Salida**: dare + explicación "Why this dare today" construida desde el check-in.
5. **Principio rector**: optimizar probabilidad de EMPEZAR, no entrenamiento perfecto.

## 3. Sistema de diseño

- **Colores**: fondo `#111111` · cards `#1C1C1C` · texto `#F6F6F3` · texto tenue `#8B8B85` · verde `#A8C46A` (energía/primario) · morado `#B494F7` (descanso/noche) · coral `#FF6B6B` (fuerza) · dorado `#FFC857` (XP/recompensa) · líneas `#2A2A28`.
- **Tipografía**: serif ligera para titulares emocionales (Cormorant Garamond); sans limpia para UI (Space Grotesk). Labels en mayúsculas con letter-spacing amplio.
- **Iconografía: nunca emoji.** Todos los iconos son line-art SVG propios (viewBox 24×24, stroke 1.4–1.6, cap/join redondos, sin rellenos salvo puntos), en el mismo lenguaje que las cartas Arcana. Set actual: pine, headphones, dumbbell, bag (fitboxing), waves (pool), racket (padel), moon, eye (focus), spark, letter, goal (diana), bolt, bulb, flame, sine, mountain, bars, person, check. Los glifos tipográficos ✦ △ ☾ ✓ se permiten como marcas de texto (el ✦ es la marca de la casa); ⚡🌲🎧▶⏸ y cualquier emoji con presentación de color están prohibidos.
- **Categorías → icono/color**: Forest pine verde · Walk headphones verde · Dumbbells dumbbell coral · Fitboxing bag coral · Pool waves morado · Padel racket dorado · Recovery moon morado · Focus eye dorado · Small Dare spark verde.
- **Detalles**: esquinas redondeadas, glows sutiles, bordes finos, animaciones mínimas, mucho aire. Respetar `prefers-reduced-motion`.
- **UX**: una acción primaria por pantalla; nunca abrumar con opciones; sin confeti (completar = ✦ sobrio).

## 4. Contenido mínimo

≥25 dares (9 categorías) · ≥5 wildcards · 20 mensajes diarios · 12 insignias · 12 arcanos mayores (tarot) · 3 journeys × 4 chapters · pools de reward draw (common/rare/golden).

**Journeys** (CH_SIZE = 8 dares/chapter; progreso independiente por journey; cambiable en cualquier momento; los capítulos se desbloquean en orden — los futuros muestran "Not yet unlocked"):

**Modelo de capítulo (estilo Fabulous)**: cada capítulo es un hito con **marcas tipadas** además del conteo de dares. Tipos: **Letter** (lectura narrativa breve, ~2 min, voz sobria), **Dare goal** (objetivo que se cumple haciendo dares — engancha con el motor), **One-time action** (preparar el entorno, se hace una vez) y **Motivator** (insight educativo corto). Un capítulo se cierra al lograr todas sus marcas. Cabecera del journey con banda de progreso: `X% completion · N/M marks achieved`. Detalle de marca numerado `k/n` con estado Completed / Start.

**The Ember** ✦ verde — "Real energy, rebuilt daily." (default, sin bias). Marcas por capítulo:
- **I · Wake Up**: Letter "You don't have a motivation problem" · Action "Lay out tomorrow's shoes tonight" · Goal "Complete your first 3 dares" · Goal "Complete one 3-minute Small Dare" · Motivator "The first minute is the whole battle".
- **II · Build Momentum**: Letter "Rhythm beats intensity" · Goal "Complete 5 dares in this chapter" · Goal "Move in 3 different categories" · Action "Build your reward shelf — name your podcast, series and album" (alimenta los rewards personalizados) · Motivator "Why the pines work on your nervous system" · Goal "Teach the generator: give energy feedback 3 times".
- **III · Become Strong**: Letter "Strength is quiet" · Action "Put the dumbbells where you can see them" · Goal "Complete 2 strength dares" · Goal "Complete one Strong-level dare" · Motivator "Muscle is a battery, not a look" · Goal "Complete a wildcard".
- **IV · Identity**: Letter "Someone who moves daily" · Goal "Hold a 7-day flexible streak" · Goal "Have one double day" · Action "Write one line: what changed?" · Motivator "Identity is a vote count".
Iconos de capítulo: spark / sine / dumbbell / flame.

Los otros journeys quedan pendientes de marcas (los dares cuentan igual mientras tanto):
- **The Ember** ✦ verde — "Real energy, rebuilt daily." (default, sin bias). Chapters: I Wake Up · II Build Momentum · III Become Strong · IV Identity.
- **Iron Quiet** △ coral — "Strength without noise." (bias: dumbbells/fitboxing/padel). Chapters: I First Weight · II The Standing Hours · III Heavier, Calmer · IV Carry Anything.
- **Still Water** ☾ morado — "A quieter head, a looser body." (bias: recovery/focus/pool/forest). Chapters: I Unclench · II The Slow Return · III Deep Water · IV Clear.

**"The days ahead"** (pestaña Journey): camino de 7 nodos — hoy + 6 días con pistas de categoría (símbolos atenuados según bias del journey), un nodo dorado "?" (wildcard), marcadores de cierre de capítulo. Teaser textual: "Tomorrow leans forest. The rest stays sealed until its day." Objetivo: enganchar el día siguiente, no solo hoy.

## 5. Guía de diseño de cartas (DARE Arcana)

Carta emblemática de referencia: **XIX · The Sun** (`the-sun-card.svg`, generada por `gen-card.js`). El resto de la baraja se diseña contra esta guía.

**Enfoque: baraja generada por código.** Una plantilla común (`card()`) define la anatomía; cada arcano aporta solo su función `art(rnd)`. Texturas (stipple, hatching) con PRNG sembrado (`mulberry32(seed)`, seed = número del arcano) → cada carta es reproducible bit a bit. Consistencia estructural garantizada entre las 12.

**Anatomía de carta** (320 × 544, ratio 1:1.7):
- Cuerpo con esquinas r20, gradiente `#1B1B18 → #121210`, borde exterior dorado al 35%.
- Doble marco interior (insets 13 y 21, opacidades 45% / 18%) + estrella de 4 puntas en cada esquina.
- Numeral romano arriba (serif, letter-spacing 5) con punto divisor debajo.
- Zona de arte: y 90–430, centrada.
- Banda de título: línea partida con punto central + nombre en sans mayúsculas (letter-spacing 7).

**Lenguaje del arte**:
- Monocromo dorado `#FFC857` sobre oscuro; la jerarquía se hace con opacidad (primario ~0.9 / secundario ~0.5 / textura 0.06–0.3) y grosor de trazo (2.2 / 1.5 / 0.9).
- Line-art geométrico, sin rellenos salvo puntos; mucho aire; un motivo central + horizonte/base cuando aplique.
- Textura ilustrativa: stipple de cielo (evitando un radio de silencio alrededor del motivo) y hatching de suelo que se desvanece con la profundidad.
- Iconografía tradicional del arcano traducida al vocabulario DARE (The Sun = rayos alternos rectos/ondulados sobre horizonte de pinos — el pinar de la app).
- Referencia externa: Labyrinthos (tarot minimalista geométrico), adaptado a la paleta y sobriedad de DARE.

**Proceso para las 11 restantes**: escribir `art()` por arcano reutilizando helpers (`star4`, `line`, `wavyRay`, `pine`, stipple/hatch); validar rasterizando con `rsvg-convert`. En la app, `TarotArt` del prototipo es el slot a sustituir: exportar cada carta como componente SVG o servir los `.svg` como assets.

## 6. Datos — esquema localStorage (build real)

```json
{
  "version": 2,
  "onboarded": true,
  "journeyId": "ember",
  "journeyProgress": { "ember": 0, "iron": 0, "water": 0 },
  "checkins": [{ "date": "", "energy": 0, "time": 0, "loc": "", "state": "" }],
  "lastCheckin": { "energy": 0, "time": 0, "loc": "", "state": "" },
  "todaysDares": [{ "dareId": "", "date": "", "wild": false, "revealed": false, "startedAt": null, "completedAt": null }],
  "tarot": { "date": "", "cardId": "" },
  "rewardDraws": [{ "date": "", "tier": "", "text": "" }],
  "completed": [{ "dareId": "", "date": "", "xp": 0 }],
  "xp": 0,
  "streak": { "count": 0, "lastDate": "" },
  "badges": [""],
  "lastCats": ["", ""],
  "catCounts": {},
  "energyFeedback": [{ "date": "", "cat": "", "delta": 0 }]
}
```
Versionar el esquema (`version`) para migraciones futuras (v1 → v2: `todaysDare` pasa a array `todaysDares`; se añaden journeys, tarot y draws). Nivel = `floor(xp / 200) + 1`. Racha: solo el primer dare del día la incrementa. Detección de ausencia: `today − streak.lastDate > 1 día` → pantalla de re-entrada.

## 7. Stack y roadmap

- **Fase 0 (hecha)**: prototipo interactivo (artifact React, estado en memoria).
- **Fase 1**: **Vite + React + TypeScript + Tailwind** (Next.js es sobredimensionado sin backend/auth). localStorage con esquema versionado. Deploy estático: compatible con GitHub Pages o Vercel — decisión abierta.
- **Fase 2**: **PWA instalable** con recordatorio diario (notificación local). Crítico para retención TDAH: abrir la app no puede ser otra decisión.
- **Fase 3 (ideas, no comprometidas)**: exportar/importar datos, análisis del feedback de energía, modo "no energy" de acceso rápido.

## 8. Cómo trabajar en este proyecto

- Prototipo → validar con Jox → build real con Claude Code usando estas instrucciones como brief.
- Documentarse con Context7 para librerías; no asumir APIs.
- Copys de UI: en inglés, una sola voz, verbos activos, sin culpa. Los ejemplos poéticos originales en español sirven de referencia de tono, traducidos con la misma sobriedad.
- Ante dudas de alcance: menos pantallas, menos opciones, más pulido. El norte es siempre "probabilidad de empezar".
