import type { CSSProperties } from "react";
import { ICONS } from "../data/icons";

interface IcoProps {
  name: string;
  size?: number;
  color?: string;
  sw?: number;
  style?: CSSProperties;
}

/** Line-art icon — 24×24 viewBox, rounded caps/joins, same language as the Arcana. */
export function Ico({ name, size = 18, color = "currentColor", sw = 1.5, style }: IcoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
