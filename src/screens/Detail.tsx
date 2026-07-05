import type { ReactNode } from "react";
import { C, CATS, colorOf } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { SYMBOLS, SECTION_SYM } from "../data/symbols";
import { SPRINT_DAYS } from "../data/journeys";
import { findScience } from "../data/science";
import { Ico } from "../components/Ico";
import { Meta, companionWord } from "../components/Meta";
import { Effects } from "../components/Effects";
import { wrap, pad } from "../components/layout";
import type { Dare } from "../types";
import type { DareApp } from "../lib/useDare";

/** Nota explicativa del Companion (por qué acompañar la acción ayuda). */
function companionNote(d: Dare): string {
  switch (companionWord(d)) {
    case "Silence":
      return "Silence gives your brain fewer inputs to process. Use the quiet as part of the reset.";
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
    default:
      return "A companion makes the action enjoyable, so you're far more likely to begin.";
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
  const remaining = Math.max(0, SPRINT_DAYS - app.daysDone);

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

          {/* 1 · Trigger — la acción primero, no la explicación */}
          <Section symKey="trigger" title="Trigger" color={C.green}>
            <p className="serif" style={{ fontSize: 18, color: C.text }}>"{d.trigger}"</p>
          </Section>

          {/* 2 · Companion (con explicación de por qué ayuda) */}
          <Section symKey="companion" title="Companion" color={C.purple}>
            <p style={{ fontSize: 14, color: C.text, marginBottom: 6 }}>{d.companion}</p>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: C.dim }}>{companionNote(d)}</p>
          </Section>

          {/* 3 · Expected Effect */}
          <Section symKey="effect" title="Expected Effect" color={C.green}>
            <Effects effects={d.effects} />
          </Section>

          {/* 4 · Science Behind Today's Dare */}
          {science && (
            <Section symKey="science" title="Science Behind Today's Dare" color={C.gold}>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{science.title}</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: C.dim }}>{science.text}</p>
              <p className="lbl" style={{ fontSize: 8.5, marginTop: 10, color: C.faint }}>
                Evidence: {science.evidence}
              </p>
            </Section>
          )}

          {/* 5 · Steps */}
          <Section symKey="steps" title="Steps">
            {d.steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  padding: "8px 0",
                  borderBottom: i < d.steps.length - 1 ? `1px solid ${C.line}` : "none",
                }}
              >
                <span style={{ color: col, fontSize: 11, minWidth: 16 }}>{i + 1}</span>
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </Section>

          {/* 6 · Treat Locked */}
          <Section symKey="treat" title="Treat Locked" color={C.gold}>
            <p style={{ fontSize: 13.5, lineHeight: 1.45, color: C.dim }}>
              A sealed Treat Draw unlocks when you finish — sometimes it's golden.
            </p>
            {app.isJourneyActive && app.dreamReward && (
              <p style={{ fontSize: 12.5, color: C.gold, marginTop: 10 }}>
                {SYMBOLS.dream} Dream Reward: {app.dreamReward} · {remaining} to go
              </p>
            )}
          </Section>

          {/* 7 · Why this Dare today — la última explicación antes de comprometerse,
                justo encima de Start dare (primero la acción, este cierre, y a empezar). */}
          <Section symKey="why" title="Why this Dare today" color={C.purple}>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.text }}>{why}</p>
          </Section>

          {/* 8 · Start dare — inmediatamente después de "Why this Dare today". */}
          <button className="btn btn-green" style={{ marginTop: 6 }} onClick={() => app.startDare()}>
            Start dare
          </button>
          {/* 9 · No energy → versión de 3 minutos */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button className="link" onClick={() => app.swapToSmall()}>
              {SYMBOLS.soft} No energy → 3-minute version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
