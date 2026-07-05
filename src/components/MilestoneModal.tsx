import { useState } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { MS_T } from "../data/journeys";
import { findScience } from "../data/science";
import type { BossPlaylist, CompanionShelf, Milestone } from "../types";
import type { DareApp } from "../lib/useDare";

/* Modal de acción de un Milestone. Cada tipo tiene su CTA real
   (fix del bug "Start no hace nada"):
     letter/motivator/science → lectura + "Mark as read / Got it"
     action → formulario (Companion Shelf / Boss Playlist / texto)
     goal   → guía + "Take me to my Dare" + "Mark complete" */
export function MilestoneModal({
  app,
  ms,
  color,
  onClose,
}: {
  app: DareApp;
  ms: Milestone;
  color: string;
  onClose: () => void;
}) {
  const done = !!app.store.milestones[ms.id];
  const science = findScience(ms.scienceId);

  const [shelf, setShelf] = useState<CompanionShelf>(
    app.store.companionShelf ?? { podcast: "", series: "", playlist: "", album: "" },
  );
  const [boss, setBoss] = useState<BossPlaylist>(
    app.store.bossPlaylist ?? { name: "", platform: "", firstSong: "" },
  );

  const input = (val: string, onChange: (v: string) => void, ph: string) => (
    <input
      value={val}
      onChange={(e) => onChange(e.target.value)}
      placeholder={ph}
      style={{
        width: "100%",
        background: C.bg,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: "11px 12px",
        color: C.text,
        fontFamily: "inherit",
        fontSize: 13.5,
        marginBottom: 10,
      }}
    />
  );

  let cta = "Done";
  let body: React.ReactNode = null;
  if (ms.t === "letter") cta = "Mark as read";
  else if (ms.t === "motivator") cta = "Save insight";
  else if (ms.t === "science") cta = "Got it";
  else if (ms.t === "goal") cta = "Mark complete";
  else if (ms.t === "proof") cta = "Save proof";
  else if (ms.t === "reflection") cta = "Save reflection";
  else if (ms.t === "badge") cta = "Claim badge";
  else if (ms.action) cta = ms.action === "companionShelf" ? "Save Shelf" : ms.action === "bossPlaylist" ? "Save Boss Playlist" : "Done";

  if (ms.t === "science" && science) {
    body = (
      <>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{science.title}</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: C.dim }}>{science.text}</p>
        {science.longTerm && <p style={{ fontSize: 13, lineHeight: 1.6, color: C.faint, marginTop: 10 }}>{science.longTerm}</p>}
      </>
    );
  } else if (ms.action === "companionShelf") {
    body = (
      <>
        {ms.body && <p style={{ fontSize: 13.5, lineHeight: 1.55, color: C.dim, marginBottom: 14 }}>{ms.body}</p>}
        {input(shelf.podcast, (v) => setShelf({ ...shelf, podcast: v }), "Favourite podcast")}
        {input(shelf.series, (v) => setShelf({ ...shelf, series: v }), "Favourite series")}
        {input(shelf.playlist, (v) => setShelf({ ...shelf, playlist: v }), "Favourite playlist")}
        {input(shelf.album, (v) => setShelf({ ...shelf, album: v }), "Favourite album")}
      </>
    );
  } else if (ms.action === "bossPlaylist") {
    body = (
      <>
        {ms.body && <p style={{ fontSize: 13.5, lineHeight: 1.55, color: C.dim, marginBottom: 14 }}>{ms.body}</p>}
        {input(boss.name, (v) => setBoss({ ...boss, name: v }), "Playlist name")}
        {input(boss.platform, (v) => setBoss({ ...boss, platform: v }), "Platform")}
        {input(boss.firstSong, (v) => setBoss({ ...boss, firstSong: v }), "First song")}
      </>
    );
  } else if (ms.body) {
    body = <p style={{ fontSize: 14.5, lineHeight: 1.65, color: C.text }}>{ms.body}</p>;
  } else if (ms.t === "goal" && ms.goalHint) {
    body = <p style={{ fontSize: 14.5, lineHeight: 1.6, color: C.dim }}>{ms.goalHint}</p>;
  }

  function complete() {
    if (ms.action === "companionShelf") app.saveCompanionShelf(shelf, ms.id);
    else if (ms.action === "bossPlaylist") app.saveBossPlaylist(boss, ms.id);
    else app.completeMilestone(ms.id);
    onClose();
  }

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
          borderTop: `1px solid ${color}55`,
          borderRadius: "22px 22px 0 0",
          width: "100%",
          maxWidth: 420,
          padding: "26px 24px 32px",
          maxHeight: "84vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span className="lbl" style={{ color }}>
            {MS_T[ms.t].label}
          </span>
          <button className="link" style={{ textDecoration: "none", fontSize: 18 }} onClick={onClose}>
            ✕
          </button>
        </div>
        <h3 className="serif" style={{ fontSize: 24, lineHeight: 1.2, marginBottom: 16 }}>
          {ms.title}
        </h3>

        <div style={{ marginBottom: 22 }}>{body}</div>

        {ms.t === "goal" && (
          <button
            className="btn btn-line"
            style={{ marginBottom: 10 }}
            onClick={() => {
              // Lanza el Dare CONCRETO del Journey en foco (coherente con el
              // journey), sin pedir check-in: resuelve el día dentro del Journey.
              onClose();
              app.startJourneyDay(app.store.journeyId);
            }}
          >
            Take me to my Dare {SYMBOLS.spark}
          </button>
        )}

        {done ? (
          <p style={{ textAlign: "center", fontSize: 13, color: C.green }}>✓ Completed</p>
        ) : (
          <button className="btn btn-green" onClick={complete}>
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}
