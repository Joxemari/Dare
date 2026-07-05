# Today — fondos rotatorios

Imágenes de fondo del **masthead de Today**. Se rota **una por día** (cambia a
diario) entre todas las que haya aquí.

- **Formato:** PNG (también valen `.jpg`/`.jpeg`/`.webp`), ratio **4:5** vertical
  (~1080×1350), con el **tercio superior oscuro/vacío** para que el titular y la
  marca se lean encima. Estilo Co–Star (objeto surreal, monocromo oro/oliva sobre
  casi-negro, grano sutil).
- **Nombres LIBRES:** da igual cómo se llamen. El masthead las detecta TODAS con
  `import.meta.glob('../assets/today/*.{png,jpg,jpeg,webp}', …)` — no hay lista de
  nombres que mantener.
- Al ir en `src/assets/` (no `public/`), Vite las hashea y solo se descarga la que
  se muestra ese día.

Deja los ficheros en esta carpeta y listo.
