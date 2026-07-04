import type { CSSProperties } from "react";

/** Phone-width column (390px is the reference viewport). */
export const wrap: CSSProperties = {
  maxWidth: 420,
  margin: "0 auto",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

export const pad: CSSProperties = { padding: "28px 24px", flex: 1 };
