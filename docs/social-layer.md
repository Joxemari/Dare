# Capa social de DARE — decisiones y hoja de ruta

> Documento de diseño. Recoge las ideas discutidas para una capa social en DARE
> y **separa lo que ya se puede hacer sin backend de lo que exige uno**. La
> intención es no acumular deuda: dejar por escrito el modelo de datos y el
> principio de producto ANTES de construir el feed de amigos.

Estado: **Idea 1 (compartir la carta) implementada**. Idea 2 (feed de amigos)
**diferida** — decisión pendiente porque implica añadir backend.

---

## La línea que lo parte todo: DARE no tiene backend

Hoy DARE es una SPA pura con estado en `localStorage` (v3), sin identidad de
usuario ni red. Eso hace que las dos ideas vivan en mundos de coste opuestos:

| Idea | ¿Necesita backend? | Coste |
|---|---|---|
| **Compartir la carta** (WhatsApp / Instagram) | **No** | Bajo — no toca la arquitectura |
| **Feed de amigos** (BeReal / How We Feel) | **Sí, obligatorio** | Alto — auth, identidad, red, servidor, privacidad, moderación |

Son **dos proyectos, no uno**. Compartir puede vivir ya y da señal viral gratis;
el feed de amigos es "el backend de DARE" disfrazado y debe esperar a esa
decisión. Pero conviene diseñar el modelo de datos del feed *ahora* para no
sufrir después.

---

## Idea 1 — Compartir la carta (implementada, sin backend)

### Qué es

La pantalla `Card` (revelado de la Daily Card a pantalla completa) ofrece
**"✦ Share card"**. Al pulsarlo se compone una imagen de la carta y se entrega a
la **Web Share API** (`navigator.share`), de modo que el SO ofrece WhatsApp,
Instagram Stories, Mensajes, etc. En escritorio o navegadores sin Web Share, cae
a **copiar el texto al portapapeles**.

### Cómo, respetando la arquitectura

- **Lógica pura en `src/lib/share.ts`** (testeada en `src/lib/share.test.ts`):
  `buildCardShareText(card)` y `buildCardShareData(card, url)` construyen el
  texto/payload. Sin efectos → node-testeable como el resto de `src/lib`.
- **Efecto en la frontera — `src/components/ShareCardButton.tsx`**: compone la
  imagen en `<canvas>` (1080×1350, formato retrato que encaja en feed e
  Historias), llama a `navigator.share` y hace fallback. El canvas y
  `navigator.*` son DOM → no se testean en el entorno `node` de Vitest, igual
  que `TarotArt`. Se monta en `src/screens/Card.tsx`; su contenedor hace
  `stopPropagation` para que pulsar Share no dispare el "tap to continue".
- **Defensivo por diseño** (mismo espíritu que la migración de `storage.ts` y el
  fallback ✦ de `TarotArt`): si el canvas o la Web Share fallan, cae a compartir
  solo texto; si tampoco hay Web Share, copia al portapapeles. Nunca rompe.
- **Reutiliza los assets vivos**: el arte sale de `public/arcana/{id}.webp`
  (mismo origen → el canvas no se contamina). La URL respeta `import.meta.env
  .BASE_URL` como en `TarotArt`.
- **Marca y tono**: usa `SYMBOLS` (nunca glifos sueltos), cierra con la tagline
  *"Daily Actions. Real Energy."* y mantiene la UI en inglés. Nada de
  XP/streak — la carta que circula por chats es un objeto de marca.

### Notas / limitaciones honestas

- **Instagram no tiene deep-link de "publicar" fiable en web.** La vía real es
  compartir la imagen vía Web Share y que el usuario elija Stories. No existe un
  botón "Post to Instagram" estable, así que no se promete.
- La composición del canvas depende de que las fuentes autoalojadas estén
  cargadas; se espera a `document.fonts.ready` antes de dibujar, con *fallback*
  a fuentes de sistema si no.
- **No se ha probado en dispositivo físico** (iOS/Android reales): el código está
  verificado por typecheck/tests/build, pero el diálogo nativo de share y el
  render de la imagen conviene comprobarlos a mano en un móvil.

---

## Idea 2 — Ver a tus amigos (BeReal / How We Feel) — DIFERIDA

### Por qué es un salto grande

1. **Identidad y auth.** Hoy no existe el concepto de "usuario". Hace falta
   cuentas (o un identificador estable) para saber quién es "tu amigo": login,
   sesión, probablemente OAuth o magic-link.
2. **Backend + base de datos.** Guardar en servidor perfil, grafo de amistades y
   las publicaciones (qué dare hiciste hoy, cómo lo llevas). El `CLAUDE.md` ya
   reserva la documentación de "cuando se añada el BACKEND".
3. **El estado migra de dispositivo a nube.** Hoy el progreso es privado en
   `localStorage` (y en iOS se puede desalojar a los ~7 días → de ahí la PWA).
   Un feed social implica que parte del estado deja de ser local.
4. **Privacidad y moderación.** "Cómo lo llevas" es dato sensible: consentimiento
   explícito, control de qué se comparte y borrado.

### El riesgo de producto (importante)

DARE está diseñado **anti-gamificación a propósito**: nada de "streak failed",
nada de leaderboards, *Momentum* en vez de *streak* (ver el vocabulario en
`CLAUDE.md`). Un feed social mal hecho rompe justo ese principio y lo convierte
en comparación, presión y culpa — lo contrario de un *Chief Energy Officer*.

El modelo correcto NO es BeReal-competitivo, es **How We Feel–gentle**: baja
presión, sin rankings, sin números públicos.

- "3 amigos han dared hoy" → **presencia, no puntuación**.
- Estado cualitativo y opcional ("más energía / igual / bajón"), nunca un
  contador de racha público.
- Reacciones de apoyo, no likes competitivos.
- Momentum / Proof / Identity ajenos **no visibles** — privados por diseño.

### Modelo de datos a preparar (aunque no se implemente aún)

Cuando llegue el backend, mantener las reglas de datos del `CLAUDE.md`:
**guardar referencias (ids), no copias**, y **versionar la forma + migrar** en la
misma PR. Forma tentativa de la actividad de amigos:

```ts
interface FriendActivity {
  friendId: string;   // referencia, no copia del perfil
  date: string;       // YYYY-MM-DD (todayStr)
  dareId: string;     // id contra src/data — NO el objeto dare
  mood?: "up" | "same" | "down"; // cualitativo y opcional
}
```

La UI del feed debería poder consumir esta forma esté mockeada en local hoy o
venga de red mañana, sin cambios. `dareId` se re-resuelve con `lookup.ts` (como
todo lo demás), así cambiar el contenido no rompe la actividad guardada.

---

## Recomendación / orden

1. **Hecho:** compartir la carta (Web Share + imagen canvas, sin backend).
2. **Decidir pronto:** el feed de amigos = decisión de "DARE tiene backend".
   Cuando se tome, el feed es *una* de las cosas que habilita (junto a sync
   multi-dispositivo, que de paso resuelve el desalojo de `localStorage` en iOS).
3. **Gratis hoy:** este documento fija el modelo `FriendActivity` y el principio
   **"presencia, no ranking"** para no traicionar el tono anti-gamificación.
