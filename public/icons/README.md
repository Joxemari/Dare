# Iconos PWA

Iconos de la app instalable (ver `public/manifest.webmanifest`). Todos derivan
del glifo sparkle de la marca (`public/favicon.svg`), en verde DARE `#A8C46A`
sobre fondo `#111111`.

Fuentes (SVG, editables):

- `icon.svg` — máster con esquinas redondeadas; el glifo ocupa ~58 % del lienzo.
  Sirve para los iconos `any` y para `apple-touch-icon`.
- `icon-maskable.svg` — fondo cuadrado a sangre y glifo dentro de la *safe zone*
  central (~46 %), para el propósito `maskable` (Android recorta a su forma).

Rasterizados (PNG, los que referencia el manifest / `index.html`):

- `icon-192.png`, `icon-512.png` — propósito `any`.
- `icon-512-maskable.png` — propósito `maskable`.
- `apple-touch-icon-180.png` — iOS (Add to Home Screen).

## Regenerar los PNG

No hay rasterizador de línea de comandos en el repo; los PNG se generan con el
Chromium de Playwright (ya es devDependency) a partir de los SVG. Script de
referencia (Node, ESM), ejecutado desde la raíz del repo:

```js
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const ICONS = "public/icons";
const JOBS = [
  ["icon.svg", "icon-192.png", 192],
  ["icon.svg", "icon-512.png", 512],
  ["icon-maskable.svg", "icon-512-maskable.png", 512],
  ["icon.svg", "apple-touch-icon-180.png", 180],
];
const b = await chromium.launch({ args: ["--no-sandbox"] });
for (const [src, out, size] of JOBS) {
  const svg = readFileSync(`${ICONS}/${src}`, "utf8");
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<!doctype html><meta charset=utf-8><style>*{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  await p.screenshot({ path: `${ICONS}/${out}`, omitBackground: true });
  await p.close();
}
await b.close();
```

Si el entorno ya trae un Chromium, apúntalo con `PLAYWRIGHT_CHROMIUM=/ruta/chrome`.
