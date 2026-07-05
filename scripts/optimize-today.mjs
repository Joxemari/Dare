/* ============================================================
   optimize-today — reduce el peso de los fondos de Today.
   Redimensiona a ≤1080px de ancho y convierte a WebP (q78); borra
   el original si no era webp. El masthead ya detecta .webp por su
   glob, así que no hay que tocar código.

   Uso puntual (sharp NO es dependencia del repo, para no cargar la
   CI): `npm i -D sharp && node scripts/optimize-today.mjs`.
   ============================================================ */
import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, extname, basename, dirname } from "node:path";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "assets", "today");
const MAX_W = 1080;
const QUALITY = 78;

const files = (await readdir(DIR)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
let before = 0;
let after = 0;
for (const f of files) {
  const src = join(DIR, f);
  before += (await stat(src)).size;
  const out = join(DIR, basename(f, extname(f)) + ".webp");
  const isWebp = extname(f).toLowerCase() === ".webp";
  const buf = await sharp(src).resize({ width: MAX_W, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer();
  if (!isWebp) await unlink(src); // quita el png original (nos quedamos con webp)
  await sharp(buf).toFile(out);
  after += buf.length;
}
console.log(`today: ${files.length} imgs · ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(1)}MB`);
