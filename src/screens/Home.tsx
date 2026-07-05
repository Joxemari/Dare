import { Nav } from "../components/Nav";
import { TodayHeader } from "../components/TodayHeader";
import { TodayDareRevealCard } from "../components/TodayDareRevealCard";
import { ActiveJourneyList } from "../components/ActiveJourneyList";
import { PlannedDueList } from "../components/PlannedDueList";
import { wrap, pad } from "../components/layout";
import { formatDayLabel, pickByDay } from "../lib/date";
import { HEADLINES } from "../data/headlines";
import type { DareApp } from "../lib/useDare";

/* Fondos rotatorios del masthead: TODAS las imágenes de src/assets/today (las
   sube el usuario, nombres libres). Vite las hashea; solo se descarga la del día.
   Orden estable por nombre → rotación determinista con pickByDay. */
const BG_MODULES = import.meta.glob("../assets/today/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const BG_URLS: string[] = Object.keys(BG_MODULES)
  .sort()
  .map((k) => BG_MODULES[k]);

/* ============================================================
   TODAY — un ritual diario mínimo, no un dashboard. Arriba, un
   MASTHEAD de contexto: logo de la app (✦ DARE) a la izquierda,
   una IMAGEN del día (rotatoria) con la fecha y un HEADLINE
   motivacional rotatorio encima — calidez, no una acción. Luego UNA
   acción evidente: "Your Dare" es el héroe. Debajo, en calma, los
   Planned Dares vencidos y los Journeys activos. NADA compite arriba:
   la carta del día vive en You y el briefing solo en el recordatorio.
   El perfil vive en la pestaña You (nav inferior).
   ============================================================ */
export function Home({ app }: { app: DareApp }) {
  const now = new Date();

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={{ ...pad, paddingBottom: 0 }}>
          {/* Masthead: logo + imagen del día + fecha + headline rotatorio. Ambos
              (imagen y headline) rotan una vez por día (pickByDay). */}
          <TodayHeader
            dayLabel={formatDayLabel(now)}
            headline={pickByDay(HEADLINES, now) ?? HEADLINES[0]}
            bgUrl={pickByDay(BG_URLS, now)}
          />

          {/* Héroe: un Dare a un toque (check-in opcional) */}
          <TodayDareRevealCard app={app} />

          {/* Planned Dares vencidos — se ofrecen sin saturar Today */}
          <PlannedDueList app={app} />

          {/* Journeys activos — próxima acción + Start (detalle en Journey) */}
          <ActiveJourneyList app={app} />

          <div style={{ height: 8 }} />
        </div>
        <Nav tab="home" go={app.setScreen} />
      </div>
    </div>
  );
}
