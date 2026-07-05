import type { ReactNode } from "react";
import { C, CATS, colorOf } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { SYMBOLS, SECTION_SYM } from "../data/symbols";
import { findScience } from "../data/science";
import { Ico } from "../components/Ico";
import { Meta, companionWord } from "../components/Meta";
import { Effects } from "../components/Effects";
import { PlanForLater } from "../components/PlanForLater";
import { wrap, pad } from "../components/layout";
import type { Dare } from "../types";
import type { DareApp } from "../lib/useDare";

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

/** Nota explicativa del Companion (por qué acompañar la acción ayuda). */
function companionNote(d: Dare): string {
  switch (companionWord(d)) {
    case "Silence":
    case "Quiet":
      return "Fewer inputs to process means less friction. Use the quiet as part of the reset.";
    case "Podcast":
    case "Audiobook":
      return "Something to listen to lowers how hard the effort feels, so starting and continuing is easier.";
    case "Netflix":
      return "Pair the effort with a show you already want to watch — the reward is built in, so you show up.";
    case "Playlist":
    case "Album":
    case "Music":
      return "Music you like lowers perceived effort and sets the pace, so your brain negotiates less.";
    case "Coffee":
      return "A small reward waiting at the end turns the action into something you get to do, not have to.";
    case "Friend":
      return "Doing it with someone adds connection and accountability — play, not homework.";
    case "Daylight":
      return "Daylight itself is the companion: it lifts alertness and helps set your body clock.";
    case "Timer":
      return "A short timer makes the ask finite: you only owe it those minutes, which is easy to start.";
    case "Water":
      return "A concrete first prop lowers the bar — grab it and you've already begun.";
    default:
      return "A concrete, ready object makes the first move obvious — so you're far more likely to begin.";
  }
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
  const science = findScience(d.scienceId);
  // Trigger como PRIMER paso práctico dentro de Steps (ya no es sección propia).
  const steps = d.trigger ? [`Notice: ${d.trigger}`, ...d.steps] : d.steps;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
            <button className="link" style={{ textDecoration: "none", fontSize: 16 }} onClick={() => app.setScreen("home")}>
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

          {/* 2 · Companion (concreto + por qué ayuda) */}
          <Section symKey="companion" title="Companion" color={C.purple}>
            <p style={{ fontSize: 14, color: C.text, marginBottom: 6 }}>{d.companion}</p>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: C.dim }}>{companionNote(d)}</p>
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

          {/* 5 · Why this works — ciencia + porqué, fusionados y cortos */}
          <Section symKey="why" title="Why this works" color={C.gold}>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.text }}>{why}</p>
            {science && (
              <p style={{ fontSize: 13, lineHeight: 1.55, color: C.dim, marginTop: 8 }}>
                {firstSentence(science.text)}
              </p>
            )}
          </Section>

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
