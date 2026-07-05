import { C } from "../data/colors";
import { Ico } from "./Ico";
import type { Screen } from "../lib/useDare";

const items: { id: Screen; ico: string; label: string; color: string }[] = [
  { id: "home", ico: "spark", label: "Today", color: C.green },
  { id: "journey", ico: "mountain", label: "Journey", color: C.purple },
  { id: "progress", ico: "bars", label: "Progress", color: C.gold },
  { id: "you", ico: "person", label: "You", color: C.text },
];

/** Bottom navigation: Today / Journey / Progress / You. */
export function Nav({ tab, go }: { tab: Screen; go: (s: Screen) => void }) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        background: "rgba(17,17,17,.92)",
        backdropFilter: "blur(8px)",
        borderTop: `1px solid ${C.line}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 14px",
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          className="nav-b"
          onClick={() => go(it.id)}
          aria-current={tab === it.id ? "page" : undefined}
          aria-label={it.label}
          style={{ color: tab === it.id ? it.color : C.faint }}
        >
          <Ico name={it.ico} size={17} sw={1.6} />
          {it.label}
        </button>
      ))}
    </div>
  );
}
