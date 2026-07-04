import { useState } from "react";
import { C } from "../data/colors";

/** Arte de una carta, servido como WebP estático desde `public/arcana/{id}.webp`
    (ver CLAUDE.md — un fichero por carta, nombrado igual que su `id`).
    La URL respeta el `base: '/Dare/'` vía `import.meta.env.BASE_URL`.

    La imagen YA es una carta completa (marco, número, nombre y arte dibujados),
    así que se pinta a sangre: ocupa todo el `width` y conserva su proporción
    2:3 — nada de marcos ni etiquetas auxiliares alrededor. `width` acepta px
    (miniaturas) o cadena CSS como "100%"/"72%" (contenedor responsive).

    Si el WebP falta (carta aún no subida o id desconocido), cae a una marca ✦
    con la misma proporción, para no romper el layout. */
export function TarotArt({
  id,
  width = 64,
  radius = 8,
  alt = "",
}: {
  id: string;
  width?: number | string;
  radius?: number;
  alt?: string;
}) {
  // Guardamos el id que falló (no un booleano) para que un cambio de carta
  // reintente cargar la nueva sin arrastrar el error de la anterior.
  const [failedId, setFailedId] = useState<string | null>(null);

  if (failedId === id) {
    return (
      <div
        aria-hidden="true"
        style={{
          width,
          aspectRatio: "2 / 3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${C.gold}33`,
          borderRadius: radius,
          color: C.gold,
          opacity: 0.5,
        }}
      >
        ✦
      </div>
    );
  }

  return (
    <img
      src={`${import.meta.env.BASE_URL}arcana/${id}.webp`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      onError={() => setFailedId(id)}
      style={{ width, height: "auto", display: "block", borderRadius: radius }}
    />
  );
}
