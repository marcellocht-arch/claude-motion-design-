import React from "react";
import { evolvePath } from "@remotion/paths";
import { C } from "../theme";

/** Stroke icon that draws itself as `progress` goes 0 → 1. */
export const DrawIcon: React.FC<{
  paths: string[];
  progress: number;
  size?: number;
  color?: string;
  width?: number;
  viewBox?: string;
  fill?: string;
  fillOpacity?: number;
  style?: React.CSSProperties;
}> = ({ paths, progress, size = 120, color = C.copperLight, width = 5, viewBox = "0 0 100 100", fill, fillOpacity = 0, style }) => (
  <svg viewBox={viewBox} width={size} height={size} style={{ overflow: "visible", ...style }}>
    {paths.map((d, i) => {
      const local = Math.max(0, Math.min(1, progress * paths.length - i * 0.6));
      const { strokeDasharray, strokeDashoffset } = evolvePath(local, d);
      return (
        <path
          key={i}
          d={d}
          fill={fill ?? "none"}
          fillOpacity={fill ? fillOpacity * local : 0}
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      );
    })}
  </svg>
);

// 100×100 icon paths
export const ICON = {
  face: ["M50 14 C68 14 76 28 76 42 C76 58 64 70 50 70 C36 70 24 58 24 42 C24 28 32 14 50 14 Z", "M12 96 C16 80 30 72 50 72 C70 72 84 80 88 96"],
  tools: ["M20 80 L58 42", "M58 42 C54 30 62 16 76 16 L66 28 L72 34 L84 24 C84 38 70 46 58 42", "M16 84 L24 76"],
  spark: ["M50 10 L50 34", "M50 66 L50 90", "M10 50 L34 50", "M66 50 L90 50", "M22 22 L38 38", "M62 62 L78 78", "M78 22 L62 38", "M38 62 L22 78"],
  heart: ["M50 84 C30 70 12 56 12 36 C12 24 22 14 34 14 C42 14 48 20 50 26 C52 20 58 14 66 14 C78 14 88 24 88 36 C88 56 70 70 50 84 Z"],
  eye: ["M6 50 C20 26 36 18 50 18 C64 18 80 26 94 50 C80 74 64 82 50 82 C36 82 20 74 6 50 Z", "M50 34 C59 34 66 41 66 50 C66 59 59 66 50 66 C41 66 34 59 34 50 C34 41 41 34 50 34 Z"],
  play: ["M34 22 L78 50 L34 78 Z"],
  target: ["M50 8 C73 8 92 27 92 50 C92 73 73 92 50 92 C27 92 8 73 8 50 C8 27 27 8 50 8 Z", "M50 28 C62 28 72 38 72 50 C72 62 62 72 50 72 C38 72 28 62 28 50 C28 38 38 28 50 28 Z", "M50 0 L50 20", "M50 80 L50 100", "M0 50 L20 50", "M80 50 L100 50"],
  pen: ["M18 82 L26 58 L70 14 L86 30 L42 74 Z", "M62 22 L78 38", "M18 82 L40 76"],
  camera: ["M10 30 L66 30 L66 74 L10 74 Z", "M66 44 L90 30 L90 74 L66 60"],
  scissors: ["M30 30 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", "M30 74 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", "M40 38 L88 80", "M40 66 L88 24"],
  mail: ["M10 24 L90 24 L90 78 L10 78 Z", "M10 26 L50 56 L90 26"],
  phone: ["M28 10 L42 10 L48 30 L38 38 C44 52 50 58 62 64 L70 54 L90 60 L90 74 C90 82 84 88 76 88 C44 86 14 56 12 24 C12 16 18 10 28 10 Z"],
  box: ["M50 10 L88 30 L88 72 L50 92 L12 72 L12 30 Z", "M12 30 L50 50 L88 30", "M50 50 L50 92"],
  book: ["M50 24 C40 16 24 14 10 16 L10 80 C24 78 40 80 50 88 C60 80 76 78 90 80 L90 16 C76 14 60 16 50 24 Z", "M50 24 L50 88"],
  message: ["M12 20 L88 20 L88 68 L44 68 L26 84 L28 68 L12 68 Z", "M28 38 L72 38", "M28 52 L60 52"],
  arrowUp: ["M50 88 L50 14", "M22 40 L50 12 L78 40"],
  check: ["M18 52 L40 74 L84 28"],
  gauge: ["M12 70 C12 46 30 26 50 26 C70 26 88 46 88 70", "M50 70 L70 44"],
  broadcast: ["M50 50 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0", "M32 32 C22 42 22 58 32 68", "M68 32 C78 42 78 58 68 68", "M18 18 C0 36 0 64 18 82", "M82 18 C100 36 100 64 82 82"],
  handshake: ["M6 44 L24 30 L42 36 L58 30 L76 30 L94 44", "M24 30 L24 62 L46 80 C50 84 56 82 58 78 L72 64 L76 30", "M42 36 L34 48 C32 54 40 58 44 54 L54 46"],
};
