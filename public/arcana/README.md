# Arte de las cartas (arcanos mayores)

Un WebP por carta del tarot, nombrado **exactamente igual que su `id`** en
`src/data/tarot.ts`. El componente `src/components/TarotArt.tsx` resuelve la URL
como `` `${import.meta.env.BASE_URL}arcana/${id}.webp` `` (respeta el
`base: '/Dare/'` de `vite.config.ts`).

Reglas de nombrado (la ruta de GitHub Pages distingue mayúsculas):

- **minúscula** y extensión **`.webp`** en minúscula (`fool.webp`, no `Fool.WEBP`);
- **sin espacios ni acentos**; una sola palabra.

Formato: **WebP**, redimensionado a **800px de ancho** y calidad **82**
(las cartas se muestran a 54–88px; el original 1024×1536 era innecesario). Para
regenerar desde nuevos PNG: `npm i sharp --no-save` y
`sharp(src).resize({ width: 800 }).webp({ quality: 82 })`.

Ficheros esperados (22):

```
fool.webp        magician.webp    priestess.webp   empress.webp
emperor.webp     hierophant.webp  lovers.webp      chariot.webp
strength.webp    hermit.webp      wheel.webp       justice.webp
hanged.webp      death.webp       temperance.webp  devil.webp
tower.webp       star.webp        moon.webp        sun.webp
judgement.webp   world.webp
```

Si un WebP falta, `TarotArt` cae a una marca ✦ en lugar de romper el layout.
