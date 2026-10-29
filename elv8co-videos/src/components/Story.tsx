import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { TransitionPresentation } from "@remotion/transitions";
import { C, F, GRAD } from "../theme";
import { pop, ramp, SPRING } from "../anim";
import { At } from "./SceneFrame";
import { ACCENT_SERIF, Words } from "./Kinetic";
import { DrawIcon, ICON } from "./Icons";
import { BrandLogo } from "./Logo";
import { EndCard } from "./EndCard";
import { Scene, SceneSeries, seriesDuration } from "./SceneSeries";
import { timing } from "../transitions";
import { PhoneFrame } from "./Props";

/*
 * Briques des vidéos « histoire » (L2 Sophie, L3 Julien…) : repères de voix, photos, téléphones,
 * puces, en-têtes d'épisode, barre de progression et assemblage des scènes.
 */

export type StoryMeta = { total: number; cues: Record<string, number[]>; sub: Record<string, number>; talk: number[][]; scenes: { id: string; start: number }[] };
export type Ctx = { M: StoryMeta; s0: number };

export const BOLD: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 900, color: C.ivory, lineHeight: 1.02, letterSpacing: "-0.04em" };
export const SUB: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 500, color: C.ivoryDim, lineHeight: 1.25, letterSpacing: "-0.01em" };
export const MONO: React.CSSProperties = { fontFamily: F.mono, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" };
export const RED = "#D9534F";
export const X = 90;
export const NEVER = 99999;
export const foot = (f: string) => staticFile(`footage/${f}`);

export const useCues = ({ M, s0 }: Ctx) => {
  const cues = M.cues;
  const sub = M.sub;
  return {
    has: (id: string) => id in cues,
    L: (id: string, fallback = NEVER) => (id in cues ? cues[id][0] - s0 : fallback),
    LE: (id: string, fallback = NEVER) => (id in cues ? cues[id][1] - s0 : fallback),
    S: (id: string, fallback = NEVER) => (id in sub ? sub[id] - s0 : fallback),
    talk: M.talk.map(([a, b]) => [a - s0, b - s0] as [number, number]),
  };
};

/** Visible de `a` à `b` (fondus courts). */
export const phase = (frame: number, a: number, b = NEVER) => ramp(frame, [a, a + 8], [0, 1]) * (1 - ramp(frame, [b - 6, b + 2], [0, 1]));

// ─── Briques ───────────────────────────────────────────────────────────────

/** Photo plein cadre, lent travelling, étalonnage et voile pour lire le texte. */
export const Photo: React.FC<{
  src: string;
  o?: number;
  zoom?: [number, number];
  pan?: [number, number];
  dur?: number;
  filter?: string;
  tint?: string;
  veil?: number;
  pos?: string;
}> = ({ src, o = 1, zoom = [1.04, 1.14], pan = [0, 0], dur = 300, filter, tint, veil = 0.55, pos = "50% 50%" }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = zoom[0] + (zoom[1] - zoom[0]) * t;
  const y = pan[0] + (pan[1] - pan[0]) * t;
  if (o <= 0.001) return null;
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>
      <Img src={foot(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${s}) translateY(${y}px)`, filter }} />
      {tint ? <AbsoluteFill style={{ background: tint, mixBlendMode: "multiply" }} /> : null}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(7,15,24,${veil + 0.25}) 0%, rgba(7,15,24,${veil * 0.5}) 40%, rgba(7,15,24,${veil * 0.6}) 70%, rgba(7,15,24,${veil + 0.3}) 100%)` }} />
    </AbsoluteFill>
  );
};

/** Photo encadrée (polaroïd / carte). */
export const PhotoCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; at: number; rot?: number; label?: string; pos?: string; o?: number; filter?: string }> = ({ src, x, y, w, h, at, rot = 0, label, pos = "50% 50%", o = 1, filter }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, SPRING.snappy);
  const k = 1.06 + Math.max(0, frame - at) * 0.0006;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: 14, paddingBottom: label ? 70 : 14, background: C.ivory, borderRadius: 10, boxShadow: "0 30px 70px rgba(0,0,0,0.5)", transform: `translateY(${(1 - s) * 140}px) rotate(${rot * s}deg) scale(${0.8 + 0.2 * s})`, opacity: Math.min(1, s * 1.6) * o }}>
      <div style={{ width: w - 28, height: h, overflow: "hidden", borderRadius: 4 }}>
        <Img src={foot(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${k})`, filter }} />
      </div>
      {label ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center", fontFamily: F.serif, fontStyle: "italic", fontSize: 40, color: C.deep }}>{label}</div> : null}
    </div>
  );
};

/** Téléphone qui joue une capture d'écran réelle. */
export const PhoneClip: React.FC<{ src: string; at: number; x: number; y: number; w?: number; o?: number; clipFrames: number; startFrom?: number }> = ({ src, at, x, y, w = 420, o = 1, clipFrames, startFrom = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at - 6, SPRING.snappy);
  const h = w * 2.03;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, s * 1.5) * o, transform: `translateY(${(1 - s) * 160}px)` }}>
      <PhoneFrame w={w} h={h} style={{ background: "#000" }}>
        <Sequence from={at} durationInFrames={clipFrames} layout="none">
          <OffthreadVideo src={foot(src)} muted startFrom={startFrom} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%" }} />
        </Sequence>
      </PhoneFrame>
    </div>
  );
};

export const ChapterHead: React.FC<{ n: string; title: string[]; series: string }> = ({ n, title, series }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 6, SPRING.heavy);
  return (
    <>
      <div style={{ position: "absolute", left: X, top: 262, ...MONO, fontSize: 26, color: C.copperLight, opacity: ramp(frame, [4, 14], [0, 1]) }}>{series}</div>
      <div style={{ position: "absolute", right: X, top: 236, fontFamily: F.condensed, fontSize: 150, lineHeight: 1, color: C.copperLight, transform: `translateY(${(1 - s) * -200}px)`, opacity: s > 0.01 ? 1 : 0 }}>{n}</div>
      <At y={410} x={X}>
        <Words lines={title} align="left" delay={10} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 82 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 96 }} />
      </At>
    </>
  );
};

export const Mark: React.FC<{ p: number; ok?: boolean; size?: number }> = ({ p, ok = true, size = 56 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: p > 0 ? (ok ? GRAD.copper : "#B4443F") : "transparent", border: `2px solid ${C.copperLight}88`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <DrawIcon paths={ok ? ICON.check : ICON.cross} progress={p} size={size * 0.58} color={ok ? C.deep : C.ivory} width={13} />
  </div>
);

export const Row: React.FC<{ at: number; text: string; ok?: boolean; size?: number }> = ({ at, text, ok = true, size = 46 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at - 4, SPRING.snappy);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 80}px)` }}>
      <Mark p={ramp(frame, [at + 2, at + 12], [0, 1])} ok={ok} />
      <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: size, color: C.ivory, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{text}</div>
    </div>
  );
};

export const Chip: React.FC<{ at: number; text: string; x: number; y: number; rot?: number; hot?: boolean; size?: number; o?: number; red?: boolean }> = ({ at, text, x, y, rot = 0, hot, size = 48, o = 1, red }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, SPRING.bouncy);
  return (
    <div style={{ position: "absolute", left: x, top: y, padding: "16px 30px", borderRadius: 999, background: red ? "#B4443F" : hot ? GRAD.copper : C.ivory, fontFamily: F.grotesk, fontWeight: 900, fontSize: size, color: red ? C.ivory : C.deep, whiteSpace: "nowrap", transform: `scale(${s}) rotate(${rot}deg)`, opacity: s > 0.01 ? o : 0, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
      {text}
    </div>
  );
};


export const Illustratif: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: "absolute", left: X, top: 1640, padding: "8px 18px", borderRadius: 10, background: "rgba(7,15,24,0.7)", ...MONO, fontSize: 20, color: C.ivoryDim, opacity: o }}>Exemple illustratif</div>
);


// ─── Assemblage ────────────────────────────────────────────────────────────

const T = 12;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Exit = () => TransitionPresentation<any>;

/** Barre de progression des épisodes (rétention TikTok / Reels). */
const Progress: React.FC<{ M: StoryMeta; ids: string[] }> = ({ M, ids }) => {
  const frame = useCurrentFrame();
  const st = Object.fromEntries(M.scenes.map((s) => [s.id, s.start]));
  const after = M.scenes[M.scenes.findIndex((s) => s.id === ids[ids.length - 1]) + 1].start;
  const vis = ramp(frame, [st[ids[0]], st[ids[0]] + 10], [0, 1]) * (1 - ramp(frame, [after, after + 10], [0, 1]));
  return (
    <div style={{ position: "absolute", left: X, right: X, top: 205, display: "flex", gap: 10, opacity: vis }}>
      {ids.map((id, i) => {
        const end = i < ids.length - 1 ? st[ids[i + 1]] : after;
        const p = interpolate(frame, [st[id], end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={id} style={{ flex: 1, height: 8, borderRadius: 4, background: `${C.ivory}22`, overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: C.copperLight }} />
          </div>
        );
      })}
    </div>
  );
};

export const makeStory = (M: StoryMeta, audio: string, comp: Record<string, React.FC<{ ctx: Ctx }>>, exit: Record<string, Exit>, episodes: string[], linear: string[] = ["hook"]) => {
  const scenes: Scene[] = M.scenes.map((sc, i) => {
    const next = M.scenes[i + 1];
    const Comp = comp[sc.id];
    return {
      id: sc.id,
      duration: next ? next.start - sc.start + T : M.total - sc.start,
      element: sc.id === "end" ? <EndCard /> : <Comp ctx={{ M, s0: sc.start }} />,
      exit: next ? { presentation: exit[sc.id](), timing: timing(T, linear.includes(sc.id) ? (t: number) => t : undefined) } : undefined,
    };
  });
  const endStart = M.scenes[M.scenes.length - 1].start;
  const Video: React.FC = () => (
    <AbsoluteFill style={{ background: C.deep }}>
      <SceneSeries scenes={scenes} />
      <Progress M={M} ids={episodes} />
      {/* logo déjà dans le coin dès la première image : rien ne traverse l'accroche */}
      <Sequence from={-82} layout="none">
        <BrandLogo variant="slot" handoff={60} hideAt={endStart + 82} />
      </Sequence>
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
  return { Video, duration: seriesDuration(scenes) };
};
