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
import type { Dare, Loc } from "../types";

/** Frase de lugar para el "What this is" (para entender de un vistazo si es en
 *  casa, en el bosque, en la piscina…). */
const PLACE_PHRASE: Record<Loc, string> = {
  home: "at home",
  outside: "outside",
  forest: "in the forest",
  pool: "in the pool",
  gym: "at the gym",
  padel: "on the court",
};

/** Resumen "What this is": usa el summary del Dare o deriva un fallback CORTO y
 *  específico — dice qué tipo de movimiento y DÓNDE (pesas en casa, paseo por el
 *  bosque, baño en la piscina…), para entenderlo de un vistazo. */
function dareSummary(d: Dare): string {
  if (d.summary) return d.summary;
  const place = PLACE_PHRASE[d.locs[0]] ?? "wherever you are";
  return `${d.min} minutes of ${CATS[d.cat].label.toLowerCase()} ${place} — small enough to start now, no need to finish it perfectly.`;
}

/* Sección del detalle. Cada header lleva su ACENTO de color (glifo + label) para
   que las secciones se distingan y tengan vida; la JERARQUÍA se mantiene con
   `tone`: `primary` (What this is / Steps) lidera con label completa, `muted`
   (Companion / Why / Effect) es apoyo con label más pequeña y padding contenido.
   Así hay color Y orden (color con disciplina, no arcoíris que rebota). */
function Section({
  symKey,
  title,
  accent = C.dim,
  tone = "primary",
  children,
}: {
  symKey: keyof typeof SECTION_SYM;
  title: string;
  accent?: string;
  tone?: "primary" | "muted";
  children: ReactNode;
}) {
  const glyph = SYMBOLS[SECTION_SYM[symKey]];
  const muted = tone === "muted";
  return (
    <div className="card" style={{ padding: muted ? 16 : 18, marginBottom: muted ? 10 : 12, background: C.card2, borderColor: accent + "2b" }}>
      <p className={muted ? "lbl-sm" : "lbl"} style={{ color: accent, marginBottom: muted ? 6 : 8, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ color: accent }}>{glyph}</span> {title}
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
            <h2 className="serif t-title" style={{ marginBottom: 8 }}>
              {d.title}
            </h2>
            <p style={{ color: C.dim, fontSize: 13.5 }}>{d.min} minutes</p>
            {/* El companion del strip = el de la sección (mismo `comp` resuelto). */}
            <Meta dare={d} companion={comp.word} />
          </div>

          {/* Orden (spec de review): 1 What this is · 2 Steps · 3 Companion ·
              4 Why this works · 5 Expected Effect · 6 CTAs. */}

          {/* 1 · What this is — un resumen corto de qué es el Dare (PRIMARIO) */}
          <Section symKey="trigger" title="What this is" accent={C.green}>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: C.text }}>{dareSummary(d)}</p>
          </Section>

          {/* 2 · Steps — título (glifo + "Steps") y números en el AMARILLO del
              símbolo (C.gold), consistente entre sí. El Trigger es el 1er paso. */}
          <Section symKey="steps" title="Steps" accent={C.gold}>
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
                <span style={{ color: C.gold, fontSize: 11, minWidth: 16 }}>{i + 1}</span>
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </Section>

          {/* 3 · Companion — recompensa CONCRETA y DURANTE la acción (temptation
              bundling): resolveCompanion elige uno concreto y coherente con la
              actividad (filtra por la categoría del Dare), rotado por fecha. */}
          {/* Título SOLO "Companion" (el companion concreto ya sale en el strip
              de arriba). Sin texto en blanco: la idea accionable + el porqué van
              en gris, concretos, para no requerir pensar. */}
          <Section symKey="companion" title="Companion" accent={C.purple} tone="muted">
            <p style={{ fontSize: 14, lineHeight: 1.5, color: C.dim, marginBottom: 6 }}>{comp.label}</p>
            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: C.faint }}>{comp.note}</p>
          </Section>

          {/* 4 · Why this works — el porqué + la ciencia COMPLETA (química,
                comportamiento, efecto a largo plazo): es la explicación de peso
                antes de comprometerse. Lenguaje prudente (ver science.ts). */}
          <Section symKey="why" title="Why this works" accent={C.gold} tone="muted">
            {/* Todo en gris (sin blanco): el porqué + la ciencia. */}
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.dim }}>{why}</p>
            {science && (
              <>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: C.dim, marginTop: 10 }}>{science.text}</p>
                {science.longTerm && (
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: C.faint, marginTop: 8 }}>{science.longTerm}</p>
                )}
              </>
            )}
          </Section>

          {/* 5 · Expected Effect (apoyo) */}
          <Section symKey="effect" title="Expected Effect" accent={C.green} tone="muted">
            <Effects effects={d.effects} />
          </Section>

          {/* 6 · Start dare — CTA principal, tras el porqué. */}
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
