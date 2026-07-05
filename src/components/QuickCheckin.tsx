import { C } from "../data/colors";
import type { Avoid } from "../types";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   QuickCheckin — el check-in RÁPIDO de Today, previo a generar
   "Your Dare". Energía + Foco (1-5) + qué estás evitando. Sin
   ninguna opción marcada por defecto. Inline en la tarjeta del
   Dare, sin navegar. Ver useDare (startQuickCheckin/runQuickCheckin).
   ============================================================ */

const avoids: [Avoid, string][] = [
  ["admin", "Admin"],
  ["body", "Body"],
  ["people", "People"],
  ["mind", "Mind"],
  ["none", "Nothing"],
];

function Scale({
  value,
  onPick,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  onPick: (n: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={"pill" + (value === n ? " on" : "")}
            style={{ padding: "10px 0", fontSize: 13 }}
            aria-pressed={value === n}
            onClick={() => onPick(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 9.5, color: C.faint }}>{lowLabel}</span>
        <span style={{ fontSize: 9.5, color: C.faint }}>{highLabel}</span>
      </div>
    </>
  );
}

export function QuickCheckin({ app }: { app: DareApp }) {
  const { quickDraft, setQuickDraft } = app;
  const ready = quickDraft.energy && quickDraft.focus && quickDraft.avoiding;

  return (
    <div className="card rise" style={{ padding: 24 }}>
      <p className="lbl" style={{ marginBottom: 4, color: C.dim }}>
        YOUR DARE
      </p>
      <p className="serif" style={{ fontSize: 22, marginBottom: 18 }}>
        Quick check-in
      </p>

      <p className="lbl" style={{ marginBottom: 8 }}>
        Energy
      </p>
      <div style={{ marginBottom: 18 }}>
        <Scale value={quickDraft.energy} onPick={(n) => setQuickDraft({ ...quickDraft, energy: n })} lowLabel="Empty" highLabel="Full" />
      </div>

      <p className="lbl" style={{ marginBottom: 8 }}>
        Focus
      </p>
      <div style={{ marginBottom: 18 }}>
        <Scale value={quickDraft.focus} onPick={(n) => setQuickDraft({ ...quickDraft, focus: n })} lowLabel="Scattered" highLabel="Sharp" />
      </div>

      <p className="lbl" style={{ marginBottom: 8 }}>
        What are you avoiding?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {avoids.map(([id, label]) => {
          const on = quickDraft.avoiding === id;
          return (
            <button
              key={id}
              className={"pill" + (on ? " on" : "")}
              style={{ padding: "9px 16px", fontSize: 12.5, width: "auto" }}
              aria-pressed={on}
              onClick={() => setQuickDraft({ ...quickDraft, avoiding: id })}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        className="btn btn-green"
        disabled={!ready}
        style={{ opacity: ready ? 1 : 0.35 }}
        onClick={() =>
          ready &&
          app.runQuickCheckin({
            energy: quickDraft.energy!,
            focus: quickDraft.focus!,
            avoiding: quickDraft.avoiding!,
          })
        }
      >
        Get my Dare
      </button>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button className="link" style={{ color: C.faint, fontSize: 12 }} onClick={() => app.cancelQuickCheckin()}>
          Cancel
        </button>
      </div>
    </div>
  );
}
