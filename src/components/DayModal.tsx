import { useState, type ReactNode } from "react";
import { C } from "../data/colors";
import { SYMBOLS, SECTION_SYM } from "../data/symbols";
import { dayVariants, defaultVariant, type VariantKey } from "../data/journeys";
import type { DayPlan, Journey } from "../types";
import type { DareApp } from "../lib/useDare";

/* Briefing de un día del Journey (spec "Daily Plan"): muestra el contenido
   rico del día — variantes ◌ Soft / ◆ Real / ⟁ Bold, Trigger, Companion,
   Treat, Proof y la ficha "Science Behind Today's Dare". Es informativo: la
   ejecución real del Dare sigue pasando por el check-in. El selector de
   variante es efímero (por defecto Real); persistirlo es un follow-up. */
function Row({ symKey, title, color, children }: { symKey: keyof typeof SECTION_SYM; title: string; color: string; children: ReactNode }) {
  return (
    <div className="card" style={{ padding: 14, marginBottom: 10, background: C.card2 }}>
      <p className="lbl" style={{ color, marginBottom: 6, display: "flex", gap: 8, alignItems: "center" }}>
        <span>{SYMBOLS[SECTION_SYM[symKey]]}</span> {title}
      </p>
      {children}
    </div>
  );
}

export function DayModal({
  app,
  journey,
  day,
  dayIndex,
  isCurrent,
  onClose,
}: {
  app: DareApp;
  journey: Journey;
  day: DayPlan;
  dayIndex: number;
  isCurrent: boolean;
  onClose: () => void;
}) {
  const variants = dayVariants(day);
  const [sel, setSel] = useState<VariantKey | null>(defaultVariant(day));
  const active = variants.find((v) => v.key === sel) ?? variants[0] ?? null;
  const col = journey.color;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.66)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        className="rise"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          borderTop: `1px solid ${col}55`,
          borderRadius: "22px 22px 0 0",
          width: "100%",
          maxWidth: 420,
          padding: "26px 24px 32px",
          maxHeight: "86vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="lbl" style={{ color: col }}>
            Day {dayIndex + 1}
            {isCurrent ? " · Current" : ""}
          </span>
          <button className="link" style={{ textDecoration: "none", fontSize: 18 }} onClick={onClose}>
            ✕
          </button>
        </div>
        <h3 className="serif" style={{ fontSize: 26, lineHeight: 1.2, marginBottom: 16 }}>
          {day.title}
        </h3>

        {/* Selector de variante ◌ / ◆ / ⟁ */}
        {variants.length > 0 && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {variants.map((v) => {
                const on = v.key === active?.key;
                return (
                  <button
                    key={v.key}
                    onClick={() => setSel(v.key)}
                    style={{
                      flex: 1,
                      padding: "9px 6px",
                      borderRadius: 10,
                      border: `1px solid ${on ? col : C.line}`,
                      background: on ? col + "1e" : "transparent",
                      color: on ? C.text : C.dim,
                      fontFamily: "inherit",
                      fontSize: 12,
                      cursor: "pointer",
                      boxShadow: on ? `0 0 20px -10px ${col}` : "none",
                    }}
                  >
                    <span style={{ color: on ? col : C.faint, marginRight: 5 }}>{SYMBOLS[v.sym]}</span>
                    {v.label}
                  </button>
                );
              })}
            </div>
            {active && (
              <div className="card" style={{ padding: 16, marginBottom: 14, borderColor: col + "44" }}>
                <p style={{ fontSize: 15, lineHeight: 1.5, color: C.text }}>{active.text}</p>
              </div>
            )}
          </>
        )}

        {day.trigger && (
          <Row symKey="trigger" title="Trigger" color={C.green}>
            <p className="serif" style={{ fontSize: 17, color: C.text }}>"{day.trigger}"</p>
          </Row>
        )}
        {day.companion && (
          <Row symKey="companion" title="Companion" color={C.purple}>
            <p style={{ fontSize: 13.5, color: C.text }}>{day.companion}</p>
          </Row>
        )}
        {day.treat && (
          <Row symKey="treat" title="Treat" color={C.gold}>
            <p style={{ fontSize: 13.5, color: C.text }}>{day.treat}</p>
          </Row>
        )}
        {day.proof && (
          <Row symKey="why" title="Proof" color={col}>
            <p className="serif" style={{ fontStyle: "italic", fontSize: 15, color: C.text }}>"{day.proof}"</p>
          </Row>
        )}
        {day.scienceTitle && day.scienceBody && (
          <Row symKey="science" title="Science Behind Today's Dare" color={C.gold}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{day.scienceTitle}</p>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: C.dim }}>{day.scienceBody}</p>
          </Row>
        )}

        {isCurrent && app.isJourneyActive ? (
          <button
            className="btn btn-green"
            style={{ marginTop: 6 }}
            onClick={() => {
              app.setScreen("checkin");
              onClose();
            }}
          >
            Take today's dare {SYMBOLS.spark}
          </button>
        ) : (
          <button className="btn btn-line" style={{ marginTop: 6 }} onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}
