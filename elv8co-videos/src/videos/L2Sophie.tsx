import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";
import { C, EASE, F, GRAD, W } from "../theme";
import { pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, Typewriter, Words } from "../components/Kinetic";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo } from "../components/Logo";
import { EndCard } from "../components/EndCard";
import { Scene, SceneSeries, seriesDuration } from "../components/SceneSeries";
import { copperSweep, glitchSlice, inkDrop, splitDoors, swipeUp, timing, zoomPunch } from "../transitions";
import { Bubble, Moon } from "../components/Moon";
import { Boiler, PhoneDeadPage, PhoneFrame, PhoneMaps, Radiator, Sophie } from "../components/Props";
import LONG from "./l2-long.json";
import SHORT from "./l2-short.json";

/*
 * L2 « Comment vos clients vous choisissent aujourd'hui » — le parcours de Sophie (histoire illustrative).
 *  - L2-Long  : TikTok / LinkedIn (voix complète)
 *  - L2-Short : Instagram / TikTok (≤ 1 min 30)
 * Repères : scripts/l2_prep.py (cues = phrases, sub = mots, en frames globales).
 * Photos Unsplash + captures d'écran de Marcel (public/footage, voir SOURCES.md). Aucun vrai nom d'entreprise lisible.
 */

type Meta = typeof LONG;
type Ctx = { M: Meta; s0: number };

const BOLD: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 900, color: C.ivory, lineHeight: 1.02, letterSpacing: "-0.04em" };
const SUB: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 500, color: C.ivoryDim, lineHeight: 1.25, letterSpacing: "-0.01em" };
const MONO: React.CSSProperties = { fontFamily: F.mono, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" };
const RED = "#D9534F";
const X = 90;
const NEVER = 99999;
const foot = (f: string) => staticFile(`footage/${f}`);

const useCues = ({ M, s0 }: Ctx) => {
  const cues = M.cues as Record<string, number[]>;
  const sub = M.sub as Record<string, number>;
  return {
    has: (id: string) => id in cues,
    L: (id: string, fallback = NEVER) => (id in cues ? cues[id][0] - s0 : fallback),
    LE: (id: string, fallback = NEVER) => (id in cues ? cues[id][1] - s0 : fallback),
    S: (id: string, fallback = NEVER) => (id in sub ? sub[id] - s0 : fallback),
    talk: (M.talk as number[][]).map(([a, b]) => [a - s0, b - s0] as [number, number]),
  };
};

/** Visible de `a` à `b` (fondus courts). */
const phase = (frame: number, a: number, b = NEVER) => ramp(frame, [a, a + 8], [0, 1]) * (1 - ramp(frame, [b - 6, b + 2], [0, 1]));

// ─── Briques ───────────────────────────────────────────────────────────────

/** Photo plein cadre, lent travelling, étalonnage et voile pour lire le texte. */
const Photo: React.FC<{
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
const PhotoCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; at: number; rot?: number; label?: string; pos?: string; o?: number; filter?: string }> = ({ src, x, y, w, h, at, rot = 0, label, pos = "50% 50%", o = 1, filter }) => {
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
const PhoneClip: React.FC<{ src: string; at: number; x: number; y: number; w?: number; o?: number; clipFrames: number; startFrom?: number }> = ({ src, at, x, y, w = 420, o = 1, clipFrames, startFrom = 0 }) => {
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

const ChapterHead: React.FC<{ n: string; title: string[] }> = ({ n, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 6, SPRING.heavy);
  return (
    <>
      <div style={{ position: "absolute", left: X, top: 262, ...MONO, fontSize: 26, color: C.copperLight, opacity: ramp(frame, [4, 14], [0, 1]) }}>Le parcours de Sophie · épisode</div>
      <div style={{ position: "absolute", right: X, top: 236, fontFamily: F.condensed, fontSize: 150, lineHeight: 1, color: C.copperLight, transform: `translateY(${(1 - s) * -200}px)`, opacity: s > 0.01 ? 1 : 0 }}>{n}</div>
      <At y={410} x={X}>
        <Words lines={title} align="left" delay={10} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 82 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 96 }} />
      </At>
    </>
  );
};

const Mark: React.FC<{ p: number; ok?: boolean; size?: number }> = ({ p, ok = true, size = 56 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: p > 0 ? (ok ? GRAD.copper : "#B4443F") : "transparent", border: `2px solid ${C.copperLight}88`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <DrawIcon paths={ok ? ICON.check : ICON.cross} progress={p} size={size * 0.58} color={ok ? C.deep : C.ivory} width={13} />
  </div>
);

const Row: React.FC<{ at: number; text: string; ok?: boolean; size?: number }> = ({ at, text, ok = true, size = 46 }) => {
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

const Chip: React.FC<{ at: number; text: string; x: number; y: number; rot?: number; hot?: boolean; size?: number; o?: number; red?: boolean }> = ({ at, text, x, y, rot = 0, hot, size = 48, o = 1, red }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, SPRING.bouncy);
  return (
    <div style={{ position: "absolute", left: x, top: y, padding: "16px 30px", borderRadius: 999, background: red ? "#B4443F" : hot ? GRAD.copper : C.ivory, fontFamily: F.grotesk, fontWeight: 900, fontSize: size, color: red ? C.ivory : C.deep, whiteSpace: "nowrap", transform: `scale(${s}) rotate(${rot}deg)`, opacity: s > 0.01 ? o : 0, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
      {text}
    </div>
  );
};

const STEPS = ["Recommandé", "Vérifié", "Comparé", "Choisi"];
const STEP_ICON = [ICON.message, ICON.eye, ICON.gauge, ICON.phone];

/** Le parcours en 4 étapes, en colonne. `p` 0 → 3 dessine le chemin ; `broken` = étape où elle décroche. */
const Journey: React.FC<{ y: number; p: number; at: number[]; broken?: number; brokenAt?: number }> = ({ y, p, at, broken = -1, brokenAt = NEVER }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const GAPY = 210;
  const cx = X + 70;
  const shown = Math.min(1, Math.max(0, p / 3));
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: W, height: GAPY * 3 + 140 }}>
      <div style={{ position: "absolute", left: cx - 5, top: 70, width: 10, height: GAPY * 3, borderRadius: 5, background: `${C.ivory}1A` }} />
      <div style={{ position: "absolute", left: cx - 5, top: 70, width: 10, height: GAPY * 3 * shown, borderRadius: 5, background: C.copperLight }} />
      {STEPS.map((t, i) => {
        const s = pop(frame, fps, at[i], SPRING.bouncy);
        const bad = i === broken && frame > brokenAt;
        const blink = bad && Math.floor((frame - brokenAt) / 8) % 2 === 0;
        return (
          <div key={t} style={{ position: "absolute", left: cx - 70, top: i * GAPY, display: "flex", alignItems: "center", gap: 40, opacity: s > 0.01 ? Math.min(1, s * 1.5) : 0, transform: `translateX(${(1 - s) * -120}px)` }}>
            <div style={{ width: 140, height: 140, borderRadius: 70, flexShrink: 0, background: bad ? (blink ? RED : "#7A2E2B") : GRAD.copper, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${bad ? 60 : 36}px ${bad ? RED : C.copper}66`, transform: `scale(${0.6 + 0.4 * s})` }}>
              <DrawIcon paths={bad ? ICON.cross : STEP_ICON[i]} progress={ramp(frame, [at[i], at[i] + 14], [0, 1])} size={70} color={bad ? C.ivory : C.deep} width={8} />
            </div>
            <div>
              <div style={{ ...MONO, fontSize: 24, color: C.copperLight }}>{`Étape ${i + 1}`}</div>
              <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 72, color: bad ? "#FF8A80" : C.ivory, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{t}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Illustratif: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: "absolute", left: X, top: 1640, padding: "8px 18px", borderRadius: 10, background: "rgba(7,15,24,0.7)", ...MONO, fontSize: 20, color: C.ivoryDim, opacity: o }}>Exemple illustratif</div>
);

// ─── Accroche ──────────────────────────────────────────────────────────────

const Hook: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, LE, has } = useCues(ctx);
  const h2 = L("h2");
  const h3 = L("h3");
  const h4 = L("h4");
  const h7 = L("h7");
  const h8 = L("h8");
  const h9 = L("h9");
  const h10 = L("h10");
  const hit = h3 + 27;
  const shake = frame > hit && frame < hit + 14 ? Math.sin(frame * 3.1) * (14 - (frame - hit)) * 1.6 : 0;
  const flash = frame > hit ? Math.max(0, 1 - (frame - hit) / 10) : 0;
  const secs = Math.min(5, Math.max(0, (frame - h9 - 30) / 10));
  return (
    <SceneFrame seed="l2hook" variant="deep" dur={560} zoom={[1, 1.02]}>
      {/* Dimanche soir · plus d'eau chaude : photos froides */}
      <Photo src="photo-thermostat.jpg" o={phase(frame, -10, h2 + 2)} dur={h2 + 10} zoom={[1.25, 1.1]} filter="grayscale(0.55) brightness(0.62) contrast(1.15)" tint="#5C7FA6" veil={0.35} pos="45% 45%" />
      <Photo src="photo-thermometre-froid.jpg" o={phase(frame, h2, h3)} dur={h3 - h2 + 20} zoom={[1.1, 1.3]} pan={[0, -40]} filter="brightness(0.75) saturate(0.6)" tint="#7FA0C4" veil={0.35} pos="50% 60%" />
      <div style={{ position: "absolute", left: X, top: 250, ...MONO, fontSize: 30, color: C.copperLight, opacity: phase(frame, 2, h3) }}>Dim. · 21:47</div>
      <At y={310} x={X}>
        <Words lines={["Dimanche *soir.*"]} align="left" delay={0} stagger={3} mode="rise" exitAt={h2 - 6} exitDuration={6} style={{ ...BOLD, fontSize: 120 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 140 }} />
      </At>
      <At y={310} x={X}>
        <Words lines={["Plus d'eau", "*chaude.*"]} align="left" delay={h2} stagger={3} mode="drop" exitAt={h3 - 6} exitDuration={6} style={{ ...BOLD, fontSize: 130 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 160, color: "#9CC7E3" }} />
      </At>
      {/* la chaudière lâche */}
      <div style={{ opacity: phase(frame, h3, h4), transform: `translateX(${shake}px)` }}>
        <At y={300} x={X}>
          <Words lines={["La chaudière de Sophie", "*vient de lâcher.*"]} align="left" delay={h3} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 76 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 92 }} />
        </At>
        <div style={{ position: "absolute", left: W / 2 - 190, top: 700, transform: `scale(${pop(frame, fps, h3 + 4, SPRING.heavy)}) rotate(${shake * 0.2}deg)` }}>
          <Boiler size={380} />
        </div>
      </div>
      <AbsoluteFill style={{ background: RED, opacity: flash * 0.35 * phase(frame, h3, h4), pointerEvents: "none" }} />
      {/* Sophie : vite, et de confiance */}
      <div style={{ opacity: phase(frame, h4, h7) }}>
        <At y={300} x={X}>
          <Words lines={["Elle a besoin", "d'un *chauffagiste.*"]} align="left" delay={h4} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 86 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 100 }} />
        </At>
        <div style={{ position: "absolute", left: W / 2 - 200, top: 760, transform: `translateY(${(1 - pop(frame, fps, h4 + 2, SPRING.snappy)) * 500}px)` }}>
          <Sophie size={400} mood="worried" phone />
        </div>
        <Chip at={L("h5")} text="Vite." x={X - 10} y={820} rot={-6} hot size={64} />
        <Chip at={L("h6")} text="Et de confiance." x={560} y={1060} rot={5} size={50} />
      </div>
      {/* un seul appel */}
      <div style={{ opacity: phase(frame, h7, h10) }}>
        <Photo src="photo-telephone-soir.jpg" o={1} dur={(has("h10") ? h10 : LE("h9")) - h7} zoom={[1.08, 1.2]} filter="brightness(0.7)" veil={0.5} pos="40% 60%" />
        <div style={{ position: "absolute", left: X - 10, top: 230, fontFamily: F.condensed, fontSize: 420, lineHeight: 1, color: C.copperLight, transform: `scale(${pop(frame, fps, h7 + 10, SPRING.heavy)})`, transformOrigin: "0 50%" }}>1</div>
        <At y={300} x={330}>
          <Words lines={["seul", "*appel.*"]} align="left" delay={h7 + 12} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 100 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 120 }} />
        </At>
        <At y={760} x={X}>
          <Words lines={["Pas forcément", "*le meilleur.*"]} align="left" delay={h8} stagger={2} mode="rise" exitAt={h9 - 4} exitDuration={6} style={{ ...BOLD, fontSize: 84 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 100 }} />
        </At>
        <At y={760} x={X}>
          <Words lines={["Celui qui a gagné", "sa *confiance*"]} align="left" delay={h9} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 84 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 104 }} />
        </At>
        <div style={{ position: "absolute", left: X, top: 1010, display: "flex", alignItems: "center", gap: 24, opacity: ramp(frame, [h9 + 26, h9 + 34], [0, 1]) }}>
          <svg viewBox="0 0 100 100" width={110} height={110}>
            <circle cx={50} cy={54} r={40} fill="none" stroke={`${C.ivory}44`} strokeWidth={8} />
            <circle cx={50} cy={54} r={40} fill="none" stroke={C.copperLight} strokeWidth={8} strokeDasharray={251} strokeDashoffset={251 * (1 - secs / 5)} transform="rotate(-90 50 54)" />
            <rect x={42} y={2} width={16} height={10} rx={3} fill={C.ivory} />
          </svg>
          <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 64, color: C.ivory }}>en quelques <span style={{ ...ACCENT_SERIF, fontSize: 76 }}>minutes.</span></div>
        </div>
      </div>
      {/* suivons-la (version longue) */}
      {has("h10") ? (
        <div style={{ opacity: phase(frame, h10) }}>
          <At y={290} x={X}>
            <Words lines={["Suivons-la,", "*étape par étape.*"]} align="left" delay={h10} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 88 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 104 }} />
          </At>
          <Journey y={600} p={ramp(frame, [L("h11"), L("h11") + 50], [0, 3])} at={[0, 1, 2, 3].map((i) => L("h11") - 4 + i * 12)} />
          <div style={{ position: "absolute", left: X, right: X, top: 1500, ...SUB, fontSize: 46, color: C.ivory, opacity: ramp(frame, [L("h12") + 30, L("h12") + 40], [0, 1]) }}>
            Son parcours, c'est celui de <span style={{ ...ACCENT_SERIF, fontSize: 56 }}>vos futurs clients.</span>
          </div>
        </div>
      ) : null}
      <Illustratif o={phase(frame, h3, h7)} />
    </SceneFrame>
  );
};

// ─── Épisode 1 : recommandé, puis vérifié ──────────────────────────────────

const Verifier: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const v2 = has("v1") ? L("v1") : L("v2");
  const v4 = L("v4");
  const v6 = L("v6");
  const v7 = L("v7");
  const v9 = L("v9");
  const trust = 1 - ramp(frame, [v9 + 6, v9 + 40], [0, 1], EASE.inOut);
  return (
    <SceneFrame seed="l2v" variant="deep" dur={560} zoom={[1, 1.02]}>
      {/* la voisine, dans une rue de Liège */}
      <div style={{ opacity: phase(frame, 0, v4) }}>
        <PhotoCard src="liege-escaliers-bueren.jpg" x={X} y={680} w={W - 2 * X} h={760} at={v2 - 6} rot={-1.5} pos="50% 55%" />
        <div style={{ position: "absolute", left: X + 30, top: 1350, padding: "10px 20px", borderRadius: 10, background: "rgba(7,15,24,0.75)", ...MONO, fontSize: 22, color: C.ivory, opacity: ramp(frame, [v2 + 10, v2 + 20], [0, 1]) }}>Liège · le quartier</div>
        <div style={{ position: "absolute", left: 130, right: 130, top: 1010, padding: "26px 34px", borderRadius: "36px 36px 36px 8px", background: C.ivory, boxShadow: "0 20px 50px rgba(0,0,0,0.45)", transform: `scale(${pop(frame, fps, L("v3"), SPRING.bouncy)})`, transformOrigin: "0 100%" }}>
          <div style={{ ...MONO, fontSize: 20, color: C.copper }}>La voisine</div>
          <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 46, color: C.deep, lineHeight: 1.15, marginTop: 8 }}>« Appelle le chauffagiste C, il est top ! »</div>
        </div>
      </div>
      <ChapterHead n="01" title={["Recommandé…", "*puis vérifié.*"]} />
      {/* elle vérifie */}
      <div style={{ opacity: phase(frame, v4, v7) }}>
        <At y={720} x={X}>
          <Words lines={["Mais Sophie", "*vérifie.*"]} align="left" delay={v4} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 120 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 150 }} />
        </At>
        <div style={{ position: "absolute", left: X, right: X, top: 1080, height: 110, borderRadius: 55, background: C.ivory, display: "flex", alignItems: "center", padding: "0 40px", gap: 22, opacity: ramp(frame, [v6 - 6, v6 + 2], [0, 1]) }}>
          <DrawIcon paths={["M42 42 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", "M60 60 L84 84"]} progress={1} size={48} color={C.deep} width={9} />
          <Typewriter text="chauffagiste c liège" start={v6 + 2} cps={18} style={{ fontFamily: F.grotesk, fontWeight: 600, fontSize: 48, color: C.deep }} caretColor={C.copper} />
        </div>
      </div>
      {/* la vraie recherche + ce qui casse la confiance */}
      <PhoneClip src="rec-google-chauffagiste.mp4" at={v7 - 4} x={X - 20} y={680} w={420} clipFrames={270} o={phase(frame, v7 - 10)} />
      <div style={{ position: "absolute", left: 530, right: 40, top: 700, opacity: phase(frame, v7) }}>
        <div style={{ ...MONO, fontSize: 22, color: C.copperLight, lineHeight: 1.5 }}>C'est là que tout se joue</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 30 }}>
          <Row at={S("v8_fiche", L("v8") + 20)} text="Pas de fiche" ok={false} size={42} />
          <Row at={S("v8_avis", L("v8") + 40)} text="Pas d'avis" ok={false} size={42} />
          <Row at={S("v8_horaires", L("v8") + 60)} text="Horaires faux" ok={false} size={42} />
        </div>
        <div style={{ marginTop: 70, opacity: ramp(frame, [v9 - 4, v9 + 4], [0, 1]) }}>
          <div style={{ ...MONO, fontSize: 22, color: C.ivoryDim }}>Confiance</div>
          <div style={{ marginTop: 12, height: 34, borderRadius: 17, background: `${C.ivory}22`, overflow: "hidden" }}>
            <div style={{ width: `${trust * 100}%`, height: "100%", background: trust > 0.4 ? GRAD.copper : RED }} />
          </div>
          <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 50, color: C.ivory, marginTop: 18, lineHeight: 1.1 }}>
            perdue en <span style={{ ...ACCENT_SERIF, fontSize: 60 }}>quelques secondes.</span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: X - 20, top: 1560, ...MONO, fontSize: 18, color: C.steel, opacity: phase(frame, v7) }}>Noms floutés</div>
    </SceneFrame>
  );
};

// ─── Épisode 2 : elle compare ──────────────────────────────────────────────

const Review: React.FC<{ at: number; stars: number; text: string; bad?: boolean; y: number }> = ({ at, stars, text, bad, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, SPRING.snappy);
  return (
    <div style={{ position: "absolute", left: X, right: X, top: y, padding: "24px 30px", borderRadius: 24, background: C.ivory, border: bad ? `4px solid ${RED}` : "4px solid transparent", opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 200}px) rotate(${bad ? -1 : 0.6}deg)` }}>
      <div style={{ fontSize: 40, letterSpacing: 2, color: "#E8A33D" }}>
        {"★★★★★".slice(0, stars)}
        <span style={{ color: "#C9C2B8" }}>{"★★★★★".slice(stars)}</span>
      </div>
      <div style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 38, color: C.deep, marginTop: 6 }}>{text}</div>
    </div>
  );
};

const Comparer: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const k2 = L("k2");
  const k3 = L("k3");
  const k4 = L("k4");
  const k5 = L("k5");
  const k6 = L("k6");
  const reply = k4 + 4;
  return (
    <SceneFrame seed="l2k" variant="night" dur={600} zoom={[1, 1.02]} grid>
      <ChapterHead n="02" title={["Sophie", "*compare.*"]} />
      {/* la carte : trois chauffagistes */}
      <div style={{ position: "absolute", left: (W - 420) / 2, top: 690, opacity: phase(frame, L("k1", k2 - 20), k3), transform: `translateY(${(1 - pop(frame, fps, L("k1", k2 - 20), SPRING.snappy)) * 300}px)` }}>
        <PhoneMaps reveal={ramp(frame, [k2 + 30, k2 + 46], [0, 1], EASE.out)} highlight={frame > k2 + 70 ? 2 : -1} />
      </div>
      <Chip at={k2 + 50} text="3 chauffagistes" x={X - 20} y={1300} rot={-4} hot size={44} o={phase(frame, k2, k3)} />
      {/* les avis, surtout les mauvais… et les réponses */}
      <div style={{ opacity: phase(frame, k3, k5) }}>
        <Review at={S("k3_etoiles", k3)} stars={5} text="« Rapide et très propre. »" y={700} />
        <Review at={S("k3_avis", k3 + 30)} stars={4} text="« Bon conseil, prix correct. »" y={880} />
        <Review at={S("k3_mauvais", k3 + 60)} stars={1} text="« Pas venu au rendez-vous ! »" bad y={1060} />
        <div style={{ position: "absolute", left: X + 60, right: X, top: 1250, padding: "22px 28px", borderRadius: 22, background: "rgba(243,238,230,0.1)", borderLeft: `6px solid ${C.copperLight}`, opacity: ramp(frame, [reply, reply + 8], [0, 1]) }}>
          <div style={{ ...MONO, fontSize: 20, color: C.copperLight }}>Réponse du patron</div>
          <Typewriter text={"Désolé, votre message s'était perdu.\nJe vous rappelle aujourd'hui."} start={reply + 6} cps={34} style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 36, color: C.ivory, lineHeight: 1.25, marginTop: 8 }} />
        </div>
      </div>
      {/* réponse calme > note parfaite */}
      <div style={{ opacity: phase(frame, k5, k6) }}>
        {[
          { n: "5,0 ★", t: "Aucune réponse", win: false },
          { n: "4,6 ★", t: "Répond à chaque avis", win: true },
        ].map((c, i) => {
          const s = pop(frame, fps, k5 + 6 + i * 14, SPRING.snappy);
          return (
            <div key={c.n} style={{ position: "absolute", left: X + i * 460, top: 720, width: 440, height: 480, borderRadius: 32, background: c.win ? `${C.copper}26` : "rgba(243,238,230,0.06)", border: `3px solid ${c.win ? C.copperLight : `${C.ivory}22`}`, padding: "34px 30px", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 80}px) scale(${c.win ? 1 + pop(frame, fps, k5 + 60, SPRING.bouncy) * 0.04 : 1})` }}>
              <div style={{ fontFamily: F.condensed, fontSize: 120, color: c.win ? C.copperLight : C.ivoryDim, lineHeight: 1 }}>{c.n}</div>
              <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 40, color: C.ivory, marginTop: 20 }}>{c.t}</div>
              <div style={{ position: "absolute", left: 30, bottom: 34 }}>
                <Mark p={ramp(frame, [k5 + 60, k5 + 72], [0, 1])} ok={c.win} size={80} />
              </div>
            </div>
          );
        })}
        <At y={1290} x={X}>
          <Words lines={["Une réponse calme rassure", "*plus qu'une note parfaite.*"]} align="left" delay={k5 + 50} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 56 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 66 }} />
        </At>
      </div>
      {/* les photos : des vrais gens, un vrai camion */}
      {has("k6") ? (
        <div style={{ opacity: phase(frame, k6) }}>
          <div style={{ position: "absolute", left: X, top: 690, ...MONO, fontSize: 24, color: C.copperLight, opacity: ramp(frame, [k6, k6 + 8], [0, 1]) }}>Elle ouvre les photos</div>
          <PhotoCard src="photo-technicien.jpg" x={X} y={760} w={480} h={560} at={Math.min(L("k7"), k6 + 10)} rot={-4} label="de vrais gens" pos="60% 40%" />
          <PhotoCard src="van-chauffagiste-c.jpg" x={470} y={1000} w={520} h={340} at={L("k8")} rot={3} label="un vrai camion" pos="50% 60%" />
          <div style={{ position: "absolute", left: 600, top: 720, width: 340, height: 250, borderRadius: 12, background: "#DCD6CC", transform: `rotate(5deg) scale(${pop(frame, fps, L("k9"), SPRING.bouncy)})`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <DrawIcon paths={ICON.handshake} progress={1} size={130} color="#9A948B" width={5} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...MONO, fontSize: 40, color: "rgba(255,255,255,0.7)", transform: "rotate(-20deg)" }}>STOCK</div>
            <svg width={340} height={250} style={{ position: "absolute", left: 0, top: 0 }}>
              <path d="M30 30 L310 220 M310 30 L30 220" stroke={RED} strokeWidth={14} strokeLinecap="round" strokeDasharray={340} strokeDashoffset={340 * (1 - ramp(frame, [L("k9") + 10, L("k9") + 22], [0, 1]))} />
            </svg>
          </div>
        </div>
      ) : null}
    </SceneFrame>
  );
};

// ─── Épisode 3 : les réseaux ───────────────────────────────────────────────

const Reseaux: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, has } = useCues(ctx);
  const f1 = L("f1");
  const f3 = L("f3");
  const f4 = L("f4");
  const f5 = L("f5");
  const f6 = L("f6");
  const f9 = L("f9");
  const vidP = ramp(frame, [f6, f9], [0.05, 0.95]);
  const dust = ramp(frame, [f3, f3 + 30], [0, 1]);
  return (
    <SceneFrame seed="l2f" variant="deep" dur={560} zoom={[1, 1.02]}>
      <ChapterHead n="03" title={["Elle regarde", "*vos réseaux.*"]} />
      {/* page abandonnée */}
      <div style={{ opacity: phase(frame, f1 - 10, f5) }}>
        <div style={{ position: "absolute", left: (W - 420) / 2, top: 700, filter: `grayscale(${dust}) brightness(${1 - dust * 0.25})`, transform: `translateY(${(1 - pop(frame, fps, f1, SPRING.snappy)) * 300}px) rotate(${dust * -2}deg)` }}>
          <PhoneDeadPage />
        </div>
        <div style={{ position: "absolute", left: 120, top: 1060, padding: "18px 34px", border: `8px solid ${RED}`, borderRadius: 16, fontFamily: F.condensed, fontSize: 96, color: RED, background: "rgba(13,27,42,0.6)", transform: `rotate(-12deg) scale(${2 - pop(frame, fps, f3, SPRING.heavy)})`, opacity: frame > f3 ? 1 : 0 }}>IL Y A 2 ANS</div>
        <Chip at={f4 + 10} text="Elle existe encore ?" x={X + 120} y={1420} rot={3} size={48} />
      </div>
      {/* le concurrent : 30 secondes de vidéo */}
      <div style={{ opacity: phase(frame, f5, f9) }}>
        <div style={{ position: "absolute", left: X, top: 680, ...MONO, fontSize: 24, color: C.copperLight, opacity: ramp(frame, [f5, f5 + 8], [0, 1]) }}>Chez le concurrent</div>
        <div style={{ position: "absolute", left: (W - 440) / 2, top: 740, transform: `translateY(${(1 - pop(frame, fps, f5 + 4, SPRING.snappy)) * 400}px)` }}>
          <PhoneFrame w={440} h={860} style={{ background: "#000" }}>
            <Img src={foot("photo-artisan-souriant.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 40%", transform: `scale(${1.15 + (frame - f5) * 0.0008})` }} />
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 110, padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.92)", fontFamily: F.grotesk, fontWeight: 800, fontSize: 28, color: C.deep, textAlign: "center", opacity: ramp(frame, [f6, f6 + 8], [0, 1]) }}>Purger un radiateur en 30 s</div>
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 76, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }}>
              <div style={{ width: `${vidP * 100}%`, height: "100%", borderRadius: 3, background: "#fff" }} />
            </div>
            {[0, 1, 2, 3, 4].map((i) => {
              const t0 = f6 + 10 + i * 16;
              const k = frame - t0;
              return k > 0 && k < 60 ? <div key={i} style={{ position: "absolute", right: 30 + random(`h${i}`) * 30, bottom: 200 + k * 5, fontSize: 44, color: "#FF6B7F", opacity: 1 - k / 60 }}>♥</div> : null;
            })}
          </PhoneFrame>
        </div>
        <Chip at={f5 + 20} text="0:30" x={760} y={760} rot={6} hot size={52} />
        <Chip at={L("f7", NEVER)} text="Sympa" x={50} y={1120} rot={-6} size={50} />
        <Chip at={L("f7", NEVER) + 18} text="Compétent" x={690} y={1250} rot={5} hot size={50} />
        {has("f8") ? (
          <div style={{ position: "absolute", left: X, right: X, top: 1640, textAlign: "center", fontFamily: F.grotesk, fontWeight: 900, fontSize: 48, color: C.ivory, opacity: ramp(frame, [L("f8"), L("f8") + 8], [0, 1]) }}>
            « J'ai l'impression de
            <br />
            <span style={{ ...ACCENT_SERIF, fontSize: 58 }}>déjà le connaître.</span> »
          </div>
        ) : null}
      </div>
      {/* devinez qui elle appelle */}
      <div style={{ opacity: phase(frame, f9) }}>
        <div style={{ position: "absolute", left: (W - 440) / 2, top: 700 }}>
          <PhoneFrame w={440} h={820} style={{ background: "linear-gradient(180deg, #1F3550, #0D1B2A)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center", ...MONO, fontSize: 20, color: C.ivoryDim }}>Appel en cours…</div>
            {[0, 1, 2].map((i) => {
              const k = ((frame - f9 + i * 15) % 45) / 45;
              return <div key={i} style={{ position: "absolute", left: 220 - 90 - k * 70, top: 190 - k * 70, width: 180 + k * 140, height: 180 + k * 140, borderRadius: "50%", border: `3px solid ${C.copperLight}`, opacity: (1 - k) * 0.8 }} />;
            })}
            <div style={{ position: "absolute", left: 130, top: 190, width: 180, height: 180, borderRadius: 90, overflow: "hidden", border: `4px solid ${C.ivory}` }}>
              <Img src={foot("photo-artisan-souriant.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "42% 42%", transform: "scale(2.2)", transformOrigin: "42% 46%" }} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", fontFamily: F.grotesk, fontWeight: 900, fontSize: 40, color: C.ivory }}>Le patron de la vidéo</div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 110, height: 110, borderRadius: 55, background: "#2FB45A", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(frame * 0.9) * 10}deg)` }}>
                <DrawIcon paths={ICON.phone} progress={1} size={56} color="#fff" width={8} />
              </div>
            </div>
          </PhoneFrame>
        </div>
        <At y={1560} x={X}>
          <Words lines={["Devinez *qui elle appelle.*"]} align="left" delay={f9} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 64 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 76 }} />
        </At>
      </div>
    </SceneFrame>
  );
};

// ─── Épisode 4 : l'IA ──────────────────────────────────────────────────────

const Ia: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, LE, S, has } = useCues(ctx);
  const a1 = L("a1");
  const ia = S("a1_ia", a1 + 70);
  const a3 = L("a3");
  const a6 = L("a6", NEVER);
  const a9 = L("a9");
  const strike = ramp(frame, [a1 + 30, a1 + 44], [0, 1]);
  const fiches = LE("a4") - 20;
  const qGlow = ramp(frame, [L("a2"), L("a2") + 10], [0, 1]) * (1 - ramp(frame, [a3, a3 + 10], [0, 1]));
  return (
    <SceneFrame seed="l2a" variant="night" dur={560} zoom={[1, 1.02]} grid="perspective">
      <ChapterHead n="04" title={["Elle demande", "*à une IA.*"]} />
      {/* plus besoin de Google */}
      <div style={{ position: "absolute", left: X, right: X, top: 700, height: 100, borderRadius: 50, background: C.ivory, display: "flex", alignItems: "center", padding: "0 38px", opacity: phase(frame, a1 - 6, ia + 4) }}>
        <span style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 44, color: "#5F6368" }}>Rechercher sur Google…</span>
        <div style={{ position: "absolute", left: 20, top: 46, height: 8, width: `${strike * 94}%`, background: RED, borderRadius: 4 }} />
      </div>
      {/* sa question, sur son téléphone */}
      <div style={{ position: "absolute", left: (W - 460) / 2, top: 690, opacity: phase(frame, ia, a3 + 6), transform: `translateY(${(1 - pop(frame, fps, ia, SPRING.snappy)) * 300}px)` }}>
        <PhoneFrame w={460} h={900} style={{ background: "#000" }}>
          <Img src={foot("chatgpt-question.png")} style={{ position: "absolute", left: 0, top: 120, width: 460, filter: `drop-shadow(0 0 ${qGlow * 30}px ${C.copperLight})` }} />
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 50, height: 70, borderRadius: 35, background: "#1E1E1E", border: "1px solid #333" }} />
        </PhoneFrame>
      </div>
      {/* l'IA lit le web */}
      <PhoneClip src="rec-chatgpt-reponse.mp4" at={a3} x={(W - 440) / 2} y={700} w={440} clipFrames={398} o={phase(frame, a3, has("a6") ? a6 : a9)} />
      <div style={{ opacity: phase(frame, a3, has("a6") ? a6 : a9) }}>
        <div style={{ position: "absolute", left: X, top: 640, ...MONO, fontSize: 24, color: C.copperLight, opacity: ramp(frame, [a3, a3 + 8], [0, 1]) }}>L'IA lit le web pour elle</div>
        <Chip at={fiches} text="Les fiches" x={40} y={900} rot={-6} hot size={46} />
        <Chip at={S("a5_avis", fiches + 20)} text="Les avis" x={720} y={1120} rot={5} size={46} />
        <Chip at={S("a5_sites", fiches + 40)} text="Les sites" x={60} y={1340} rot={-3} size={46} />
        <div style={{ position: "absolute", left: X - 20, top: 1560, ...MONO, fontSize: 18, color: C.steel }}>Réponse floutée</div>
      </div>
      {/* quelques noms… si vos infos sont claires */}
      {has("a6") ? (
        <div style={{ opacity: phase(frame, a6, a9) }}>
          <div style={{ position: "absolute", left: X, right: X, top: 700, padding: "30px 36px", borderRadius: "32px 32px 32px 8px", background: "rgba(243,238,230,0.08)", border: `2px solid ${C.copperLight}55`, transform: `scale(${pop(frame, fps, a6, SPRING.snappy)})` }}>
            <div style={{ ...MONO, fontSize: 22, color: C.copperLight, marginBottom: 18 }}>La réponse : quelques noms</div>
            {["Chauffagiste A", "Chauffagiste C", "Vous ?"].map((n, k) => {
              const me = k === 2;
              return (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14, opacity: ramp(frame, [a6 + 10 + k * 8, a6 + 16 + k * 8], [0, 1]) }}>
                  <div style={{ width: 52, height: 52, borderRadius: 26, background: me ? "transparent" : GRAD.copper, border: me ? `3px dashed ${C.copperLight}` : "none", fontFamily: F.grotesk, fontWeight: 900, fontSize: 28, color: me ? C.copperLight : C.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</div>
                  <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 46, color: me ? C.copperLight : C.ivory }}>{n}</div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: X, right: X, top: 1110, display: "flex", flexDirection: "column", gap: 26 }}>
            <Row at={S("a6_si", a6 + 40) + 14} text="Des infos claires" />
            <Row at={L("a7") + 4} text="Cohérentes partout" />
            <Row at={L("a7") + 26} text="À jour" />
          </div>
        </div>
      ) : null}
      {/* sinon : invisible */}
      <div style={{ opacity: phase(frame, a9) }}>
        <At y={700} x={X}>
          <Words lines={["Sinon, vous êtes", "*invisible…*"]} align="left" delay={a9} stagger={3} mode="blur" style={{ ...BOLD, fontSize: 104 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 130 }} />
        </At>
        <div style={{ position: "absolute", left: X, right: X, top: 1010, height: 260, borderRadius: 32, border: `4px dashed ${C.ivory}55`, padding: "36px 40px", opacity: 1 - ramp(frame, [a9 + 20, a9 + 60], [0, 0.85]), filter: `blur(${ramp(frame, [a9 + 20, a9 + 60], [0, 8])}px)` }}>
          <div style={{ ...MONO, fontSize: 22, color: C.copperLight }}>Votre commerce</div>
          <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 60, color: C.ivory, marginTop: 14 }}>???</div>
        </div>
        <div style={{ position: "absolute", left: X, right: X, top: 1340, ...SUB, fontSize: 50, color: C.ivory, opacity: ramp(frame, [L("a10"), L("a10") + 8], [0, 1]) }}>
          …avant même d'avoir <span style={{ ...ACCENT_SERIF, fontSize: 60 }}>été comparé.</span>
        </div>
      </div>
    </SceneFrame>
  );
};

// ─── Récapitulatif (version longue) ────────────────────────────────────────

const Recap: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S } = useCues(ctx);
  const at = [S("rc_recommande", 10), S("rc_verifie", 22), S("rc_compare", 34), S("rc_choisi", 46)];
  const r5 = L("r5");
  const conf = r5 + 70;
  const r6 = L("r6");
  const out = conf - 8;
  return (
    <SceneFrame seed="l2rc" variant="night" dur={340} zoom={[1, 1.04]} grid="perspective">
      <At y={250} x={X}>
        <Words lines={["4 mots,", "*4 étapes.*"]} align="left" delay={2} stagger={3} mode="rise" exitAt={out} exitDuration={8} style={{ ...BOLD, fontSize: 96 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 112 }} />
      </At>
      <div style={{ opacity: 1 - ramp(frame, [out, out + 10], [0, 1]) }}>
        <Journey y={560} p={ramp(frame, [at[0], at[3]], [0, 3])} at={at} />
        <div style={{ position: "absolute", left: 700, top: 1240, transform: `translateY(${(1 - pop(frame, fps, 6, SPRING.snappy)) * 500}px)` }}>
          <Sophie size={280} mood="happy" phone />
        </div>
      </div>
      <div style={{ opacity: ramp(frame, [conf, conf + 10], [0, 1]) }}>
        <At y={300} x={X}>
          <Words lines={["À chaque étape :", "*la confiance.*"]} align="left" delay={conf} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 90 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 110 }} />
        </At>
        <div style={{ position: "absolute", left: X, right: X, top: 680, display: "flex", flexDirection: "column", gap: 34 }}>
          <Row at={r6 + 4} text="Des infos justes" size={56} />
          <Row at={r6 + 40} text="Des avis… avec des réponses" size={56} />
          <Row at={L("r7") + 2} text="Un visage" size={56} />
        </div>
        <div style={{ position: "absolute", left: W - 420, top: 1150, transform: `scale(${ramp(frame, [L("r7"), L("r7") + 12], [0, 1], EASE.back)})` }}>
          <Radiator size={340} warm={1} />
        </div>
      </div>
    </SceneFrame>
  );
};

// ─── Exercice ──────────────────────────────────────────────────────────────

const Exo: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { L } = useCues(ctx);
  const e2 = L("e2");
  const e3 = L("e3");
  const walk = ramp(frame, [10, e3], [0, 2.2]);
  return (
    <SceneFrame seed="l2e" variant="deep" dur={180} zoom={[1, 1.03]}>
      <At y={250} x={X}>
        <Words lines={["Votre *exercice.*"]} align="left" delay={2} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 104 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 124 }} />
      </At>
      <div style={{ position: "absolute", left: X, right: X, top: 400, ...SUB, fontSize: 44, color: C.ivory, opacity: ramp(frame, [e2, e2 + 8], [0, 1]) }}>
        Suivez le parcours de Sophie <span style={{ ...ACCENT_SERIF, fontSize: 54 }}>pour votre commerce.</span>
      </div>
      <Journey y={600} p={walk} at={[6, 14, 22, 30]} broken={2} brokenAt={e3 + 6} />
      <At y={1480} x={X}>
        <Words lines={["Où est-ce qu'elle *décroche ?*"]} align="left" delay={e3} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 64 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 78 }} />
      </At>
    </SceneFrame>
  );
};

// ─── Appel à l'action ──────────────────────────────────────────────────────

const Cta: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { L, has, talk } = useCues(ctx);
  const w1 = L("w1");
  return (
    <SceneFrame seed="l2w" variant="night" dur={220} zoom={[1.04, 1]}>
      <Photo src="photo-salon-chaleureux.jpg" dur={260} zoom={[1.18, 1.06]} filter="brightness(0.62) saturate(1.1)" veil={0.6} pos="50% 60%" />
      <At y={290} x={X}>
        <Words lines={["Un regard", "*extérieur ?*"]} align="left" delay={w1} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 112 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 132 }} />
      </At>
      <Bubble x={110} y={930} at={w1 + 30} text="Écrivez-moi sur WhatsApp !" tail="right" />
      <Moon x={W / 2 + 200} y={1050} size={440} delay={4} poses={[[0, "open"], [w1 + 30, "wave"]]} talk={talk} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", fontFamily: F.grotesk, fontWeight: 900, fontSize: 64, color: C.copperLight, textShadow: "0 4px 20px rgba(0,0,0,0.6)", opacity: ramp(frame, [w1 + 40, w1 + 52], [0, 1]) }}>0470 35 43 90</div>
      {has("w2") ? <Chip at={L("w2")} text="À la semaine prochaine !" x={X} y={640} rot={-2} size={40} /> : null}
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

const COMP: Record<string, React.FC<{ ctx: Ctx }>> = { hook: Hook, verifier: Verifier, comparer: Comparer, reseaux: Reseaux, ia: Ia, recap: Recap, exo: Exo, cta: Cta };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EXIT: Record<string, () => TransitionPresentation<any>> = {
  hook: () => glitchSlice(),
  verifier: () => wipe({ direction: "from-right" }),
  comparer: () => splitDoors(),
  reseaux: () => zoomPunch(),
  ia: () => inkDrop({ x: W / 2, y: 900 }),
  recap: () => swipeUp(),
  exo: () => wipe({ direction: "from-left" }),
  cta: () => copperSweep(),
};
const T = 12;

const buildScenes = (M: Meta): Scene[] =>
  M.scenes.map((sc, i) => {
    const next = M.scenes[i + 1];
    const ctx = { M, s0: sc.start };
    const Comp = COMP[sc.id];
    return {
      id: sc.id,
      duration: next ? next.start - sc.start + T : M.total - sc.start,
      element: sc.id === "end" ? <EndCard /> : <Comp ctx={ctx} />,
      exit: next ? { presentation: EXIT[sc.id](), timing: timing(T, sc.id === "hook" ? (t: number) => t : undefined) } : undefined,
    };
  });

/** Barre de progression des 4 épisodes. */
const Progress: React.FC<{ M: Meta }> = ({ M }) => {
  const frame = useCurrentFrame();
  const ids = ["verifier", "comparer", "reseaux", "ia"];
  const st = Object.fromEntries(M.scenes.map((s) => [s.id, s.start]));
  const after = M.scenes[ids.length + 1].start;
  const vis = ramp(frame, [st.verifier, st.verifier + 10], [0, 1]) * (1 - ramp(frame, [after, after + 10], [0, 1]));
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

const makeVideo = (M: Meta, audio: string) => {
  const scenes = buildScenes(M);
  const endStart = M.scenes[M.scenes.length - 1].start;
  const Video: React.FC = () => (
    <AbsoluteFill style={{ background: C.deep }}>
      <SceneSeries scenes={scenes} />
      <Progress M={M} />
      <Sequence from={-82} layout="none">
        <BrandLogo variant="slot" handoff={60} hideAt={endStart + 82} />
      </Sequence>
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
  return { Video, duration: seriesDuration(scenes) };
};

const long = makeVideo(LONG, "l2-long.m4a");
const short = makeVideo(SHORT as Meta, "l2-short.m4a");
export const L2Long = long.Video;
export const L2_LONG_DURATION = long.duration;
export const L2Short = short.Video;
export const L2_SHORT_DURATION = short.duration;
