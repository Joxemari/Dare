import { C, CATS } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { Ico } from "./Ico";
import type { Dare } from "../types";

/** Place / During / After strip on the dare detail. */
export function Meta({ dare }: { dare: Dare }) {
  const cat = CATS[dare.cat];
  const rows: [string, string, string][] = [
    [CAT_ICO[dare.cat], "Place", cat.label],
    ["headphones", "During", dare.reward.length > 14 ? dare.reward.slice(0, 13) + "…" : dare.reward],
    ["spark", "After", "Reward draw"],
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 22,
        borderTop: `1px solid ${C.line}`,
        borderBottom: `1px solid ${C.line}`,
        padding: "14px 0",
        margin: "18px 0",
      }}
    >
      {rows.map(([ico, k, v], i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>
            <Ico name={ico} size={16} color={C.dim} sw={1.4} />
          </div>
          <div className="lbl" style={{ fontSize: 9 }}>
            {k}
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}
