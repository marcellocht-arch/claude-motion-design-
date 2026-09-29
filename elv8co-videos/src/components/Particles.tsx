import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, H, W } from "../theme";

/** Slow floating dust / bokeh. */
export const Dust: React.FC<{
  count?: number;
  seed?: string;
  color?: string;
  speed?: number;
  maxSize?: number;
  opacity?: number;
}> = ({ count = 40, seed = "dust", color = C.copperLight, speed = 1, maxSize = 9, opacity = 0.8 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const depth = 0.3 + random(`${seed}d${i}`) * 0.7;
        const x0 = random(`${seed}x${i}`) * W;
        const y0 = random(`${seed}y${i}`) * (H + 200);
        const y = (((y0 - frame * speed * depth * 2.2) % (H + 200)) + H + 200) % (H + 200) - 100;
        const x = x0 + Math.sin(frame / 40 + i) * 18 * depth;
        const size = 2 + depth * maxSize;
        const tw = 0.5 + 0.5 * Math.sin(frame / (8 + depth * 10) + i * 3.1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 ${size * 2.5}px ${color}`,
              opacity: opacity * depth * (0.35 + 0.65 * tw),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Radial burst of sparks starting at frame `at` (relative to the parent sequence). */
export const Burst: React.FC<{
  at: number;
  x?: number;
  y?: number;
  count?: number;
  seed?: string;
  color?: string;
  power?: number;
  duration?: number;
}> = ({ at, x = W / 2, y = H / 2, count = 28, seed = "burst", color = C.copperLight, power = 520, duration = 32 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > duration) return null;
  const p = t / duration;
  const travel = 1 - Math.pow(1 - p, 3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + random(`${seed}a${i}`) * 0.5;
        const dist = power * (0.45 + random(`${seed}p${i}`) * 0.75) * travel;
        const len = 18 + 70 * (1 - p) * random(`${seed}l${i}`);
        const px = x + Math.cos(a) * dist;
        const py = y + Math.sin(a) * dist;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: len,
              height: 4,
              borderRadius: 3,
              background: `linear-gradient(90deg, transparent, ${color})`,
              transform: `translate(-100%, -50%) rotate(${a}rad)`,
              transformOrigin: "100% 50%",
              opacity: 1 - p,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Expanding shock ring. */
export const Ring: React.FC<{
  at: number;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  duration?: number;
  width?: number;
}> = ({ at, x = W / 2, y = H / 2, size = 900, color = C.copperLight, duration = 24, width = 6 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > duration) return null;
  const p = t / duration;
  const s = size * (1 - Math.pow(1 - p, 3));
  return (
    <div
      style={{
        position: "absolute",
        left: x - s / 2,
        top: y - s / 2,
        width: s,
        height: s,
        borderRadius: "50%",
        border: `${width * (1 - p) + 1}px solid ${color}`,
        opacity: 1 - p,
        pointerEvents: "none",
      }}
    />
  );
};

/** Flash of light (full frame), peaking at `at`. */
export const Flash: React.FC<{ at: number; color?: string; duration?: number; max?: number }> = ({
  at,
  color = C.ivory,
  duration = 10,
  max = 0.85,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -2 || t > duration) return null;
  const o = t < 0 ? ((t + 2) / 2) * max : max * Math.pow(1 - t / duration, 2);
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};
