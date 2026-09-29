import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, F } from "../theme";
import { CLAMP, pop, ramp, SPRING } from "../anim";
import { copperTextStyle } from "./Logo";

export type WordMode = "rise" | "blur" | "drop" | "pop" | "slide" | "flip";

type Token = { text: string; accent: boolean };

/** Parses "Le *personal* branding" → tokens; `*...*` marks accented words (can span words). */
const tokenize = (line: string): Token[] => {
  const out: Token[] = [];
  let inAccent = false;
  for (const raw of line.split(" ").filter(Boolean)) {
    let w = raw;
    const starts = w.startsWith("*");
    if (starts) {
      inAccent = true;
      w = w.slice(1);
    }
    const ends = w.endsWith("*");
    if (ends) w = w.slice(0, -1);
    out.push({ text: w, accent: inAccent });
    if (ends) inAccent = false;
  }
  return out;
};

export const ACCENT_SERIF: React.CSSProperties = {
  fontFamily: F.serif,
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: "-0.01em",
  ...copperTextStyle,
  paddingRight: "0.08em",
};

/**
 * Word-by-word kinetic typography.
 * Each line is a string; wrap words in *stars* to accent them.
 */
export const Words: React.FC<{
  lines: string[];
  delay?: number;
  stagger?: number;
  mode?: WordMode;
  style?: React.CSSProperties;
  accentStyle?: React.CSSProperties;
  lineStyles?: (React.CSSProperties | undefined)[];
  align?: "center" | "left" | "right";
  lineGap?: number;
  exitAt?: number;
  exitDuration?: number;
}> = ({
  lines,
  delay = 0,
  stagger = 3,
  mode = "rise",
  style,
  accentStyle = ACCENT_SERIF,
  lineStyles = [],
  align = "center",
  lineGap = 0,
  exitAt,
  exitDuration = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  const justify = align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: justify, gap: lineGap, ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", gap: "0.24em", justifyContent: justify, whiteSpace: "nowrap", ...lineStyles[li] }}>
          {tokenize(line).map((tok, wi) => {
            const d = delay + idx * stagger;
            idx++;
            const s = pop(frame, fps, d, mode === "drop" || mode === "pop" ? SPRING.bouncy : SPRING.snappy);
            const e = exitAt === undefined ? 0 : ramp(frame, [exitAt + idx * 1.5, exitAt + idx * 1.5 + exitDuration], [0, 1], EASE.in);
            let inner: React.CSSProperties = {};
            let clip = false;
            switch (mode) {
              case "rise":
                clip = true;
                inner = { transform: `translateY(${(1 - s) * 110 - e * 110}%)` };
                break;
              case "blur":
                inner = {
                  transform: `scale(${interpolate(s, [0, 1], [1.5, 1]) - e * 0.3})`,
                  filter: `blur(${(1 - s) * 18 + e * 18}px)`,
                  opacity: Math.min(1, s * 1.6) * (1 - e),
                };
                break;
              case "drop":
                inner = {
                  transform: `translateY(${(1 - s) * -160 + e * 120}%) rotate(${(1 - s) * (wi % 2 ? 12 : -12)}deg)`,
                  opacity: (s > 0.01 ? 1 : 0) * (1 - e),
                };
                break;
              case "pop":
                inner = { transform: `scale(${s * (1 - e)})`, opacity: s > 0.01 ? 1 : 0 };
                break;
              case "slide":
                clip = true;
                inner = { transform: `translateX(${(1 - s) * -105 + e * 105}%)` };
                break;
              case "flip":
                inner = {
                  transform: `perspective(800px) rotateX(${(1 - s) * -95 + e * 95}deg)`,
                  transformOrigin: "50% 100%",
                  opacity: (s > 0.02 ? 1 : 0) * (1 - e),
                };
                break;
            }
            const wordEl = (
              <span style={{ display: "inline-block", ...inner, ...(tok.accent ? accentStyle : null) }}>{tok.text}</span>
            );
            return clip ? (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", padding: "0.1em 0.06em", margin: "-0.1em -0.06em" }}>
                {wordEl}
              </span>
            ) : (
              <React.Fragment key={wi}>{wordEl}</React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Letter-by-letter entrance for display words. */
export const Letters: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  mode?: "scatter" | "drop" | "flip" | "rise";
  style?: React.CSSProperties;
  letterStyle?: React.CSSProperties;
  seed?: string;
}> = ({ text, delay = 0, stagger = 2, mode = "rise", style, letterStyle, seed = "l" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", whiteSpace: "pre", ...style }}>
      {text.split("").map((ch, i) => {
        const s = pop(frame, fps, delay + i * stagger, mode === "drop" ? SPRING.bouncy : SPRING.snappy);
        let tr = "";
        let op = 1;
        let clip = false;
        if (mode === "scatter") {
          const r1 = Math.sin(i * 12.9898 + seed.length) * 43758.5453;
          const rx = (r1 - Math.floor(r1) - 0.5) * 900;
          const ry = (Math.cos(i * 7.13) * 0.5) * 900;
          tr = `translate(${(1 - s) * rx}px, ${(1 - s) * ry}px) rotate(${(1 - s) * rx * 0.3}deg) scale(${0.4 + s * 0.6})`;
          op = Math.min(1, s * 2);
        } else if (mode === "drop") {
          tr = `translateY(${(1 - s) * -140}%)`;
          op = s > 0.01 ? 1 : 0;
        } else if (mode === "flip") {
          tr = `perspective(600px) rotateY(${(1 - s) * 90}deg)`;
          op = s > 0.05 ? 1 : 0;
        } else {
          clip = true;
          tr = `translateY(${(1 - s) * 105}%)`;
        }
        const el = <span style={{ display: "inline-block", transform: tr, opacity: op, ...letterStyle }}>{ch}</span>;
        return clip ? (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: "0.08em 0", margin: "-0.08em 0" }}>
            {el}
          </span>
        ) : (
          <React.Fragment key={i}>{el}</React.Fragment>
        );
      })}
    </div>
  );
};

/** Outlined text that fills with liquid copper (wavy edge) as `progress` goes 0 → 1. */
export const OutlineFill: React.FC<{
  text: string;
  progress: number;
  style?: React.CSSProperties;
  stroke?: string;
  strokeWidth?: number;
  fill?: React.CSSProperties;
}> = ({ text, progress, style, stroke = C.ivory, strokeWidth = 3, fill = copperTextStyle }) => {
  const frame = useCurrentFrame();
  const level = 100 - progress * 112 + 6; // % from top
  const pts: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = (i / 24) * 100;
    const y = level + Math.sin(i * 0.9 + frame * 0.35) * 3 * (progress > 0 && progress < 1 ? 1 : 0);
    pts.push(`${x}% ${y}%`);
  }
  const clip = `polygon(${pts.join(", ")}, 100% 100%, 0% 100%)`;
  return (
    <div style={{ position: "relative", whiteSpace: "nowrap", ...style }}>
      <div style={{ color: "transparent", WebkitTextStroke: `${strokeWidth}px ${stroke}` }}>{text}</div>
      <div style={{ position: "absolute", inset: 0, clipPath: clip, ...fill }}>{text}</div>
    </div>
  );
};

/** Endless horizontal ribbon of giant text. */
export const Marquee: React.FC<{
  text: string;
  speed?: number;
  style?: React.CSSProperties;
  outline?: boolean;
  reverse?: boolean;
  offset?: number;
}> = ({ text, speed = 0.25, style, outline, reverse, offset = 0 }) => {
  const frame = useCurrentFrame();
  const shift = ((frame * speed + offset) % 50) * (reverse ? 1 : -1) - (reverse ? 50 : 0);
  const chunk = (
    <span style={{ paddingRight: "0.4em" }}>
      {text}
      <span style={{ paddingLeft: "0.4em" }}>{text}</span>
    </span>
  );
  return (
    <div style={{ whiteSpace: "nowrap", display: "flex", width: "max-content", transform: `translateX(${shift}%)`, ...(outline ? { color: "transparent", WebkitTextStroke: `2px ${C.ivory}` } : null), ...style }}>
      {chunk}
      {chunk}
    </div>
  );
};

/** Mechanical odometer counter (digits roll). */
export const Odometer: React.FC<{
  value: number;
  final: number;
  style?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  velocity?: number;
}> = ({ value, final, style, digitStyle, velocity = 0 }) => {
  const digits = Math.max(1, String(Math.floor(final)).length);
  const cols: React.ReactNode[] = [];
  const shown = Math.max(1, String(Math.floor(value)).length);
  for (let k = digits - 1; k >= 0; k--) {
    const p = Math.pow(10, k);
    const r = value % p;
    let pos = Math.floor(value / p) % 10;
    if (r > p - 1) pos += r - (p - 1);
    const vis = k < shown ? 1 : 0;
    const blur = Math.min(10, (velocity / p) * 0.6);
    cols.push(
      <span key={k} style={{ display: "inline-block", overflow: "hidden", height: "1em", lineHeight: 1, opacity: vis, ...digitStyle }}>
        <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${-pos}em)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
            <span key={j} style={{ height: "1em" }}>
              {d}
            </span>
          ))}
        </span>
      </span>,
    );
    if (k % 3 === 0 && k > 0) cols.push(<span key={`s${k}`} style={{ display: "inline-block", width: "0.22em", opacity: vis }} />);
  }
  return <div style={{ display: "flex", fontVariantNumeric: "tabular-nums", lineHeight: 1, ...style }}>{cols}</div>;
};

/** Eased count helper: returns value and per-frame velocity. */
export const useCount = (from: number, to: number, start: number, end: number, easing = EASE.out) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, end], [from, to], { ...CLAMP, easing });
  const prev = interpolate(frame - 1, [start, end], [from, to], { ...CLAMP, easing });
  return { value: v, velocity: Math.abs(v - prev) };
};

/** Typewriter text with a blinking caret. */
export const Typewriter: React.FC<{ text: string; start: number; cps?: number; style?: React.CSSProperties; caretColor?: string }> = ({
  text,
  start,
  cps = 22,
  style,
  caretColor = C.copperLight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - start) / fps) * cps));
  const done = n >= text.length;
  const caretOn = !done || Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {text.slice(0, n)}
      <span style={{ display: "inline-block", width: "0.08em", height: "0.9em", marginLeft: "0.05em", background: caretColor, opacity: caretOn && frame >= start ? 1 : 0, verticalAlign: "-0.08em" }} />
    </span>
  );
};

/** Label in monospace (UI / editorial numbering). */
export const Tag: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 30, letterSpacing: "0.3em", textTransform: "uppercase", color: C.copperLight, ...style }}>{children}</div>
);
