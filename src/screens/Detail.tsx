import type { ReactNode } from "react";
import { C, CATS, colorOf } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { SYMBOLS, SECTION_SYM } from "../data/symbols";
import { findScience } from "../data/science";
import { Ico } from "../components/Ico";
import { Meta } from "../components/Meta";
import { Effects } from "../components/Effects";
import { PlanForLater } from "../components/PlanForLater";
import { wrap, pad } from "../components/layout";
import { resolveCompanion } from "../lib/companions";
import type { DareApp } from "../lib/useDare";
import type { Dare } from "../types";

/** Resumen "What this is": usa el summary del Dare o deriva un fallback. */
function dareSummary(d: Dare): string {
  if (d.summary) return d.summary;
  return `A ${d.min}-minute ${CATS[d.cat].label.toLowerCase()} dare — small enough to start now, with no need to finish it perfectly.`;
}

/** Primera frase de un texto (para mantener corto el "Why this works"). */
function firstSentence(text: string): string {
  const i = text.indexOf(". ");
  return i === -1 ? text : text.slice(0, i + 1);
}

function Section({ symKey, title, color, children }: { symKey: keyof typeof SECTION_SYM; title: string; color?: string; children: ReactNode }) {
  const glyph = SYMBOLS[SECTION_SYM[symKey]];
  return (
    <div className="card" style={{ padding: 18, marginBottom: 12, background: C.card2 }}>
      <p className="lbl" style={{ color: color ?? C.dim, marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ color: color ?? C.gold }}>{glyph}</span> {title}
      </p>
      {children}
    </div>
  );
}

export function Detail({ app }: { app: DareApp }) {
  if (!app.currentDare) return null;
  const d = app.currentDare.dare;
  const why = app.currentDare.why;
  const col = colorOf(d);
  // Companion concreto y rotado por día (temptation bundling): sesgado por el
  // vibe del último check-in, estable dentro del día vía la fecha del Dare.
  const comp = resolveCompanion(d, {
    vibe: app.store.lastCheckin?.vibe,
    seed: app.currentDare.entry.date,
  });
  const science = findScience(d.scienceId);
  // Trigger como PRIMER paso práctico dentro de Steps (ya no es sección propia).
  const steps = d.trigger ? [`Notice: ${d.trigger}`, ...d.steps] : d.steps;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
            <button className="link" style={{ textDecoration: "none", fontSize: 16 }} aria-label="Back to Today" onClick={() => app.setScreen("home")}>
              ←
            </button>
            <span className="lbl" style={{ color: d.wild ? C.gold : C.dim }}>
              {d.wild ? `${SYMBOLS.wildcard} Wildcard` : "Your dare"}
            </span>
            <span style={{ width: 16 }} />
          </div>

          <div style={{ textAlign: "center" }} className="rise">
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: 99,
                border: `1px solid ${col}`,
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 44px -12px ${col}`,
              }}
            >
              <Ico name={CAT_ICO[d.cat]} size={30} color={col} sw={1.3} />
            </div>
            <p className="lbl" style={{ color: col, marginBottom: 8 }}>
              {d.level} · {CATS[d.cat].label}
            </p>
            <h2 className="serif" style={{ fontSize: 34, marginBottom: 8 }}>
              {d.title}
            </h2>
            <p style={{ color: C.dim, fontSize: 13.5 }}>{d.min} minutes</p>
            <Meta dare={d} />
          </div>

          {/* 1 · What this is — un resumen corto de qué es el Dare (antes: Trigger) */}
          <Section symKey="trigger" title="What this is" color={C.green}>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: C.text }}>{dareSummary(d)}</p>
          </Section>

          {/* 2 · Companion — recompensa CONCRETA y DURANTE la acción (temptation
              bundling): resolveCompanion elige uno concreto rotado por fecha. */}
          <Section symKey="companion" title={`Companion · ${comp.word}`} color={C.purple}>
            <p className="serif" style={{ fontSize: 16, color: C.text, marginBottom: 6 }}>{comp.label}</p>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: C.dim, marginBottom: 8 }}>{comp.note}</p>
            <p className="lbl" style={{ fontSize: 9, color: C.gold }}>
              {SYMBOLS.spark} During the dare only — that's the hook.
            </p>
          </Section>

          {/* 3 · Expected Effect */}
          <Section symKey="effect" title="Expected Effect" color={C.green}>
            <Effects effects={d.effects} />
          </Section>

          {/* 4 · Steps — el Trigger es el primer paso práctico */}
          <Section symKey="steps" title="Steps">
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  padding: "8px 0",
                  borderBottom: i < steps.length - 1 ? `1px solid ${C.line}` : "none",
                }}
              >
                <span style={{ color: col, fontSize: 11, minWidth: 16 }}>{i + 1}</span>
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </Section>

          {/* 5 · Why this works — ciencia + porqué, fusionados y cortos. Es la
                última explicación antes de comprometerse: va justo encima de
                "Start dare" (cumple el spec: primero la acción, luego el porqué). */}
          <Section symKey="why" title="Why this works" color={C.gold}>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.text }}>{why}</p>
            {science && (
              <p style={{ fontSize: 13, lineHeight: 1.55, color: C.dim, marginTop: 8 }}>
                {firstSentence(science.text)}
              </p>
            )}
          </Section>

          {/* 6 · Start dare — inmediatamente después de "Why this works". */}
          <button className="btn btn-green" style={{ marginTop: 6 }} onClick={() => app.startDare()}>
            Start dare
          </button>

          {/* Plan for later (Planned Dares) + versión de baja energía */}
          <PlanForLater app={app} />
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button className="link" onClick={() => app.swapToSmall()}>
              {SYMBOLS.soft} No energy → 3-minute version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
