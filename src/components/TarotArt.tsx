import { useState } from "react";
import { C } from "../data/colors";

/** Arte de una carta, servido como PNG estático desde `public/arcana/{id}.png`
    (ver CLAUDE.md — un fichero por carta, nombrado igual que su `id`).
    La URL respeta el `base: '/Dare/'` vía `import.meta.env.BASE_URL`. Si el PNG
    falta (carta aún no subida o id desconocido), cae a una marca ✦ para no
    romper el layout — mismo espíritu defensivo que la migración de `storage.ts`. */
export function TarotArt({ id, size = 64 }: { id: string; size?: number }) {
  // Guardamos el id que falló (no un booleano) para que un cambio de carta
  // reintente cargar la nueva sin arrastrar el error de la anterior.
  const [failedId, setFailedId] = useState<string | null>(null);
  const h = Math.round(size * 1.35);

  if (failedId === id) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: size,
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${C.gold}33`,
          borderRadius: 6,
          color: C.gold,
          opacity: 0.5,
          fontSize: size * 0.4,
        }}
      >
        ✦
      </div>
    );
  }

  return (
    <img
      src={`${import.meta.env.BASE_URL}arcana/${id}.png`}
      alt=""
      aria-hidden="true"
      width={size}
      height={h}
      onError={() => setFailedId(id)}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
