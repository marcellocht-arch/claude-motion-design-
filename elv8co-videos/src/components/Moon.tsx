import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE } from "../theme";
import { CLAMP, pop, SPRING } from "../anim";

/**
 * Mascotte ELV8co : une pleine lune qui parle, avec bras et jambes.
 * - `talk` : fenêtres [début, fin] (en frames de la scène) où la bouche bouge, à caler sur la voix off.
 * - `poses` : liste [frame, pose] ; la lune passe d'une pose à l'autre en douceur.
 */
export type MoonPose = "idle" | "wave" | "pointRight" | "pointLeft" | "pointUp" | "open" | "think";

type Arm = [number, number]; // angles (degrés écran : 0 = droite, 90 = bas) bras / avant-bras
const POSES: Record<MoonPose, { l: Arm; r: Arm }> = {
  idle: { l: [112, 96], r: [68, 84] },
  wave: { l: [112, 96], r: [-40, -95] },
  pointRight: { l: [112, 96], r: [-8, -14] },
  pointLeft: { l: [188, 194], r: [68, 84] },
  pointUp: { l: [112, 96], r: [-55, -80] },
  open: { l: [205, 240], r: [-25, -60] },
  think: { l: [112, 96], r: [150, 215] },
};

const SHOULDER_L = { x: 26, y: 120 };
const SHOULDER_R = { x: 174, y: 120 };
const UPPER = 36;
const FORE = 32;

const rad = (d: number) => (d * Math.PI) / 180;

const armPath = (s: { x: number; y: number }, [a1, a2]: Arm) => {
  const ex = s.x + Math.cos(rad(a1)) * UPPER;
  const ey = s.y + Math.sin(rad(a1)) * UPPER;
  const hx = ex + Math.cos(rad(a2)) * FORE;
  const hy = ey + Math.sin(rad(a2)) * FORE;
  return { d: `M${s.x} ${s.y} Q${ex} ${ey} ${hx} ${hy}`, hx, hy };
};

const posesAt = (frame: number, poses: [number, MoonPose][]) => {
  const sorted = [...poses].sort((a, b) => a[0] - b[0]);
  let prev: MoonPose = sorted[0]?.[1] ?? "idle";
  let cur: MoonPose = prev;
  let start = -100;
  for (const [f, p] of sorted) {
    if (frame >= f) {
      prev = cur;
      cur = p;
      start = f;
    }
  }
  const t = EASE.out(interpolate(frame, [start, start + 10], [0, 1], CLAMP));
  const mix = (a: Arm, b: Arm): Arm => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return { l: mix(POSES[prev].l, POSES[cur].l), r: mix(POSES[prev].r, POSES[cur].r), cur };
};

/** 0 → 1 : ouverture de bouche pseudo-syllabique pendant les fenêtres de parole. */
const mouthOpen = (frame: number, talk: [number, number][]) => {
  const on = talk.some(([a, b]) => frame >= a && frame <= b);
  if (!on) return 0;
  const syl = Math.abs(Math.sin(frame * 0.95)) * (0.55 + 0.45 * Math.sin(frame * 0.31 + 1.3));
  const pause = Math.sin(frame * 0.11) > 0.86 ? 0.15 : 1; // petites respirations
  return Math.max(0, Math.min(1, syl * pause));
};

export const Moon: React.FC<{
  x: number;
  y: number;
  size?: number;
  talk?: [number, number][];
  poses?: [number, MoonPose][];
  delay?: number;
  style?: React.CSSProperties;
}> = ({ x, y, size = 280, talk = [], poses = [[0, "idle"]], delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = pop(frame, fps, delay, SPRING.bouncy);
  const o = mouthOpen(frame, talk);
  const { l, r, cur } = posesAt(frame, poses);
  const waveWobble = cur === "wave" ? Math.sin(frame * 0.5) * 22 : 0;
  const pointJab = cur.startsWith("point") ? Math.sin(frame * 0.25) * 4 : 0;
  const rArm: Arm = [r[0] + pointJab * 0.5, r[1] + waveWobble + pointJab];
  const lArm: Arm = [l[0] - (cur === "pointLeft" ? pointJab * 0.5 : 0), l[1] - (cur === "pointLeft" ? pointJab : 0)];
  const A = armPath(SHOULDER_L, lArm);
  const B = armPath(SHOULDER_R, rArm);
  const bob = Math.sin(frame / 11) * 4;
  const squash = 1 + o * 0.025;
  const blinkPhase = (frame + 17) % 96;
  const blink = blinkPhase < 4 ? 0.12 : 1;
  const step = Math.sin(frame / 11);
  const h = size * 1.3;
  const ivory = "#FBF6EE";
  const ink = C.deep;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y, width: size, height: h, transform: `scale(${enter})`, transformOrigin: "50% 100%", opacity: enter > 0.01 ? 1 : 0, ...style }}>
      <svg viewBox="0 0 200 260" width={size} height={h} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="moonFace" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="60%" stopColor={ivory} />
            <stop offset="100%" stopColor="#E2D5C2" />
          </radialGradient>
          <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor={C.copperLight} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.copperLight} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={`translate(0 ${bob})`}>
          {/* halo */}
          <circle cx={100} cy={100} r={118} fill="url(#moonHalo)" />
          {/* jambes */}
          <path d={`M82 176 Q${78 + step * 3} 202 ${76 + step * 5} 226`} stroke={ivory} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M118 176 Q${122 - step * 3} 202 ${124 - step * 5} 226`} stroke={ivory} strokeWidth={8} fill="none" strokeLinecap="round" />
          <ellipse cx={70 + step * 5} cy={230} rx={16} ry={8} fill={C.copper} />
          <ellipse cx={130 - step * 5} cy={230} rx={16} ry={8} fill={C.copper} />
          {/* bras gauche (derrière) */}
          <path d={A.d} stroke={C.copperDark} strokeWidth={12} fill="none" strokeLinecap="round" />
          <circle cx={A.hx} cy={A.hy} r={11.5} fill={C.copperDark} />
          <path d={A.d} stroke={ivory} strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={A.hx} cy={A.hy} r={9.5} fill={ivory} />
          {/* corps-lune */}
          <g transform={`translate(100 100) scale(${1 / squash} ${squash}) translate(-100 -100)`}>
            <circle cx={100} cy={100} r={80} fill="url(#moonFace)" stroke={C.copperLight} strokeWidth={2.5} />
            {/* cratères */}
            {[
              [58, 50, 12],
              [140, 44, 9],
              [152, 138, 13],
              [46, 142, 8],
              [112, 166, 7],
              [92, 34, 5],
            ].map(([cx, cy, rr], i) => (
              <circle key={i} cx={cx} cy={cy} r={rr} fill="#D9C8B2" opacity={0.55} />
            ))}
            {/* joues */}
            <circle cx={62} cy={114} r={10} fill={C.copperLight} opacity={0.35} />
            <circle cx={138} cy={114} r={10} fill={C.copperLight} opacity={0.35} />
            {/* yeux */}
            {[76, 124].map((ex) => (
              <g key={ex} transform={`translate(${ex} 92) scale(1 ${blink})`}>
                <ellipse cx={0} cy={0} rx={7.5} ry={11} fill={ink} />
                <circle cx={2.5} cy={-4} r={2.6} fill="#FFFFFF" />
              </g>
            ))}
            {/* sourcils, qui se lèvent en parlant */}
            <path d={`M66 ${74 - o * 4} Q76 ${68 - o * 5} 86 ${74 - o * 4}`} stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d={`M114 ${74 - o * 4} Q124 ${68 - o * 5} 134 ${74 - o * 4}`} stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />
            {/* bouche */}
            {o < 0.08 ? (
              <path d="M86 124 Q100 136 114 124" stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <path d={`M86 123 Q100 ${126 - o * 2} 114 123 Q100 ${130 + o * 22} 86 123 Z`} fill={ink} />
                <ellipse cx={100} cy={124 + o * 13} rx={6 + o * 3} ry={2 + o * 4} fill={C.copper} opacity={o > 0.35 ? 0.9 : 0} />
              </g>
            )}
          </g>
          {/* nœud papillon cuivre, signature ELV8 */}
          <path d="M100 182 L86 174 L86 190 Z M100 182 L114 174 L114 190 Z" fill={C.copper} />
          <circle cx={100} cy={182} r={4} fill={C.copperLight} />
          {/* bras droit (devant) */}
          <path d={B.d} stroke={C.copperDark} strokeWidth={12} fill="none" strokeLinecap="round" />
          <circle cx={B.hx} cy={B.hy} r={11.5} fill={C.copperDark} />
          <path d={B.d} stroke={ivory} strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={B.hx} cy={B.hy} r={9.5} fill={ivory} />
        </g>
      </svg>
    </div>
  );
};

/** Bulle de dialogue de la lune (mots-clés courts, la voix off porte le reste). */
export const Bubble: React.FC<{ x: number; y: number; text: string; at: number; until?: number; tail?: "left" | "right" | "bottom"; width?: number; style?: React.CSSProperties }> = ({
  x,
  y,
  text,
  at,
  until = 99999,
  tail = "bottom",
  width,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, SPRING.bouncy) * (1 - interpolate(frame, [until, until + 8], [0, 1], CLAMP));
  const tailStyle: React.CSSProperties =
    tail === "bottom"
      ? { left: "50%", bottom: -18, marginLeft: -14, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `20px solid ${C.ivory}` }
      : tail === "right"
        ? { right: 40, bottom: -18, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `20px solid ${C.ivory}` }
        : { left: 40, bottom: -18, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `20px solid ${C.ivory}` };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        padding: "20px 30px",
        borderRadius: 28,
        background: C.ivory,
        color: C.deep,
        fontFamily: "Archivo",
        fontWeight: 800,
        fontSize: 40,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
        transform: `scale(${s})`,
        transformOrigin: tail === "left" ? "10% 100%" : tail === "right" ? "90% 100%" : "50% 100%",
        opacity: s > 0.01 ? 1 : 0,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {text}
      <div style={{ position: "absolute", width: 0, height: 0, ...tailStyle }} />
    </div>
  );
};
