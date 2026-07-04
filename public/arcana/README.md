# Arte de las cartas (arcanos mayores)

Un PNG por carta del tarot, nombrado **exactamente igual que su `id`** en
`src/data/tarot.ts`. El componente `src/components/TarotArt.tsx` resuelve la URL
como `` `${import.meta.env.BASE_URL}arcana/${id}.png` `` (respeta el
`base: '/Dare/'` de `vite.config.ts`).

Reglas de nombrado (la ruta de GitHub Pages distingue mayúsculas):

- **minúscula** y extensión **`.png`** en minúscula (`fool.png`, no `Fool.PNG`);
- **sin espacios ni acentos**; una sola palabra.

Ficheros esperados (22):

```
fool.png        magician.png    priestess.png   empress.png
emperor.png     hierophant.png  lovers.png      chariot.png
strength.png    hermit.png      wheel.png       justice.png
hanged.png      death.png       temperance.png  devil.png
tower.png       star.png        moon.png        sun.png
judgement.png   world.png
```

Si un PNG falta, `TarotArt` cae a una marca ✦ en lugar de romper el layout.
