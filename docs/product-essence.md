# Esencia de producto — DARE

Fuente de verdad de **producto** (qué es DARE, cómo se usa y qué NO traicionar).
Complementa a `CLAUDE.md`, que es la fuente de verdad de **arquitectura** (dónde
vive la lógica). Antes de añadir o cambiar una función, mídela contra los
principios de este documento.

---

## La esencia (el norte)

DARE (Daily Actions. Real Energy.) **no es un tracker de fitness**: es un
**Chief Energy Officer**. Un reto (*dare*) al día, elegido por ti, para construir
el hábito de **moverte** (fuerza, cardio, aire libre, recuperación) **sin
aburrimiento ni culpa**.

Manifiesto: **"one decision removed, one action begun"** — quitar la decisión,
empezar la acción.

Tono **anti-gamificación** deliberado. Vocabulario fijo (interno → UI): **Proof**
(no XP) · **Identity** (no niveles) · **Momentum** (no "streak fallida") ·
**Badges** (raros, con significado) · **Treat Draw** · **Companion** ·
**Milestones**. Nunca: XP, niveles, calorías, "burn", vergüenza.

Es **physical-energy-first**: el objetivo es que la persona se mueva, no que
gestione tareas.

---

## Las funciones principales

### 1. El Dare diario (pestaña Today) — el corazón
Al abrir: un **masthead** cálido (fecha + saludo por franja + capítulo del
Journey si estás embarcado) y **UNA sola acción**: *Your Dare*. Dos vías en la
MISMA card:
- **Start check-in** → *"How are you today?"* (energía · tiempo · dónde estás · a
  dónde te deja ir · estado mental · *"¿qué lo haría menos aburrido?"*) → un dare
  a medida.
- **Just dare me** → rápido y aleatorio, revelado **inline** (sin entrar en la
  pantalla del Dare).

El dare es corto (3–20 min), diseñado para **empezar**, no para entrenar
perfecto. Timer → completado → **Treat**.

### 2. Los Journeys — la profundidad y la retención
Sprints de **7 días** con plan diario y 4 capítulos de *milestones* accionables.
4 en el MVP: **Iron Quiet** (fuerza), **Bright Pulse** (cardio divertido),
**Wild Ground** (aire libre), **Still Water** (recuperación). Se empiezan
explícitamente, pueden coexistir varios, se pausan/reanudan/cancelan, y al
terminarlos dan un **Badge de identidad** + el **Dream Reward**. El dare de cada
día del Journey es **coherente con el Journey**, nunca aleatorio.

### 3. El sistema de recompensas — el motor anti-aburrimiento
*Trigger* (antes) · **Companion** (DURANTE — *temptation bundling*: "ves el
episodio solo mientras haces las sentadillas") · *Treat* (después) · *Date*
(semanal) · **Dream Reward** (al terminar el Journey).

### 4. Rituales y contexto
- **Carta del día** (tarot): ritual de apertura místico, **una vez al día**,
  **saltable**; el resultado vive en **You**. Placer, no peaje.
- **Today's Briefing** (consejo inspirado): solo en el recordatorio.
- **Progress**: proofs, badges, momentum, ciencia (sin presión).
- **You**: identidad, patrones, carta, recordatorio, ajustes.

---

## El día a día del usuario

1. **Abre la app** → (opcional) saca su carta del día, 10s de misterio.
2. **Today le saluda** y le muestra una sola cosa: su dare.
3. **Un toque**: *Just dare me* (instantáneo) o *Start check-in* (20s para afinar).
4. **Hace el dare** (timer) → **Treat** al terminar. Sin fricción, sin scroll,
   sin métricas en la cara.
5. Si está **en un Journey**, ve la acción de hoy de su sprint y avanza milestones.
6. Por la tarde, un **recordatorio suave** si aún no lo hizo.
7. De vez en cuando: revisa **Progress** o empieza/continúa un **Journey**.

Bucle emocional: *decisión eliminada → acción pequeña empezada → recompensa →
identidad reforzada* ("someone who moves daily").

---

## Recomendaciones para ser fiel a la esencia

1. **Protege Today como "una decisión".** Nada nuevo entra a Today si añade una
   CTA que compita con el Dare (por eso salieron carta y briefing). Todo lo demás
   vive en su pestaña.
2. **Mantén el tono anti-gamificación.** Momentum indulgente (nunca "has
   fallado"), badges raros, cero XP/niveles/calorías. Es el diferenciador
   emocional; en cuanto metes presión, se vuelve otro tracker.
3. **Physical-energy-first, no productividad genérica.** El generador debe seguir
   tirando a movimiento; vigila que "avoiding: admin/mind" no derive DARE hacia
   to-do lists.
4. **El Companion es el gancho de engagement, y hoy está enterrado.** El
   *temptation bundling* es lo más potente y vive escondido en el check-in.
   Merece más protagonismo — es lo que hace volver.
5. **Los Journeys son la retención: cuídalos como contenido.** Autorados a mano,
   calidad alta, ciencia con lenguaje prudente. La generación automática NO los
   toca.
6. **La carta es delicia, no núcleo.** Perfecta como ritual opcional/saltable. Si
   algún día añade fricción o distrae del movimiento, córtala sin culpa.
7. **Honestidad con los límites — que hoy son TEMPORALES: el backend llega
   pronto.** Mientras tanto, el recordatorio es local (no hay push con la app
   cerrada) y la carta social / feed de amigos están diferidos. Regla: **no
   prometer en la UI lo que aún no está**. Cuando aterrice el backend, se
   habilitan push (VAPID), feed social (*presencia, no ranking* — ver
   `docs/social-layer.md`) y sync entre dispositivos; documentar entonces stack,
   despliegue, garantías de la CI y reglas de datos persistidos (ver `CLAUDE.md`).
8. **Un solo modelo mental por concepto.** Ya se unificó el check-in; mantén esa
   disciplina (evita dos formas de hacer lo mismo).

### A revisar pronto (en línea con la esencia)
- **Dos notificaciones/día** pueden sentirse insistentes para quien busca "sin
  stress"; valorar una por defecto (mañana).
- **Onboarding** que venda la *identidad y la energía* ("alguien que se mueve a
  diario"), no las features.
