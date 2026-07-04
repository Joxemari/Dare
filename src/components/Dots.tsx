import { C } from "../data/colors";

/** Level indicator — up to 3 filled dots. */
export function Dots({ n, color }: { n: number; color: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ width: 5, height: 5, borderRadius: 99, background: i < n ? color : C.line }}
        />
      ))}
    </span>
  );
}
