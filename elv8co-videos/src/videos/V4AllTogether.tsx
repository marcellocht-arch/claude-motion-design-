import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { C, EASE, F, GRAD, H, W } from "../theme";
import { beatPulse, CLAMP, pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, Odometer, OutlineFill, Tag, Typewriter, useCount, Words } from "../components/Kinetic";
import { Burst, Dust, Flash, Ring } from "../components/Particles";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo, Dot } from "../components/Logo";
import { END_CARD_DURATION, EndCard } from "../components/EndCard";
import { Scene, SceneSeries, sceneStarts, seriesDuration } from "../components/SceneSeries";
import { blinds, copperSweep, glitchSlice, inkDrop, spinZoom, splitDoors, swipeUp, timing, zoomPunch } from "../transitions";

type Kind = "circle" | "square" | "triangle";

const SHAPE_COLOR: Record<Kind, string> = { circle: C.copper, square: C.ivory, triangle: C.copperLight };

const BOLD: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 900, color: C.ivory, lineHeight: 1.04, letterSpacing: "-0.035em" };
const SUB: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 500, color: C.ivoryDim, lineHeight: 1.25, letterSpacing: "-0.01em" };
const PILLAR_DUR = 140;

/** Simple side-view car, 100×100 stroke paths. */
const CAR = [
  "M8 64 L8 50 L22 46 L34 30 L66 30 L80 46 L92 50 L92 64 Z",
  "M38 34 L32 46 L68 46 L62 34 Z",
  "M30 64 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0",
  "M72 64 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0",
];

/** The three service shapes. */
const Shape: React.FC<{ kind: Kind; size: number; fill?: number; stroke?: number; draw?: number; color?: string; style?: React.CSSProperties }> = ({
  kind,
  size,
  fill = 0,
  stroke = 8,
  draw = 1,
  color,
  style,
}) => {
  const col = color ?? SHAPE_COLOR[kind];
  const len = kind === "circle" ? 2 * Math.PI * 46 + 1 : kind === "square" ? 4 * 88 + 1 : 96 + 96 + 92 + 1;
  const common = {
    fill: col,
    fillOpacity: fill,
    stroke: col,
    strokeWidth: (stroke * 100) / size,
    strokeLinejoin: "round" as const,
    strokeDasharray: len,
    strokeDashoffset: len * (1 - draw),
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible", ...style }}>
      {kind === "circle" ? <circle cx={50} cy={50} r={46} {...common} /> : null}
      {kind === "square" ? <rect x={6} y={6} width={88} height={88} rx={6} {...common} /> : null}
      {kind === "triangle" ? <path d="M50 4 L96 88 L4 88 Z" {...common} /> : null}
    </svg>
  );
};

const GeoBackdrop: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "absolute", left: -300, top: 200, transform: `rotate(${frame * 0.3}deg)` }}>
        <Shape kind="circle" size={900} stroke={3} color={C.ivory} />
      </div>
      <div style={{ position: "absolute", right: -350, top: 900, transform: `rotate(${-frame * 0.25}deg)` }}>
        <Shape kind="square" size={800} stroke={3} color={C.ivory} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 1300, transform: `rotate(${frame * 0.2}deg)` }}>
        <Shape kind="triangle" size={700} stroke={3} color={C.ivory} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scenes ────────────────────────────────────────────────────────────────

const Intro: React.FC = () => (
  <SceneFrame seed="v4intro" dur={80} zoom={[1.1, 1]} rotate={-3} back={<GeoBackdrop opacity={0.1} />}>
    <Dust count={30} seed="v4d" />
  </SceneFrame>
);

const PANEL_KINDS: Kind[] = ["circle", "square", "triangle"];
const PANEL_LABELS = ["BRANDING", "VIDÉO", "PUB"];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FUSE = 78;
  const merge = ramp(frame, [64, FUSE], [0, 1], EASE.in);
  const nested = pop(frame, fps, FUSE, SPRING.bouncy);
  const divider = ramp(frame, [2, 18], [0, 1], EASE.inOut) * (1 - ramp(frame, [58, 68], [0, 1]));
  return (
    <SceneFrame seed="v4hook" dur={150} zoom={[1, 1.05]} back={<GeoBackdrop />}>
      {/* triptych dividers */}
      {[1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: (W / 3) * i - 1, top: 640, width: 2, height: 700 * divider, background: `${C.ivory}44` }} />
      ))}
      {frame < FUSE
        ? PANEL_KINDS.map((k, i) => {
            const s = pop(frame, fps, 4 + i * 5, SPRING.bouncy);
            const bob = Math.sin(frame / (6 + i * 3) + i) * 30;
            const px = (W / 3) * (i + 0.5);
            const x = interpolate(merge, [0, 1], [px, W / 2]);
            const y = interpolate(merge, [0, 1], [980 + bob, 980]);
            const size = interpolate(merge, [0, 1], [240, 320 - i * 90]);
            return (
              <div key={k} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: `scale(${s}) rotate(${frame * (i - 1) * 2 + merge * 180}deg)` }}>
                <Shape kind={k} size={size} fill={k === "circle" ? 0.9 : 0} stroke={8} />
              </div>
            );
          })
        : null}
      {PANEL_KINDS.map((k, i) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: (W / 3) * i,
            width: W / 3,
            top: 1200,
            textAlign: "center",
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.2em",
            color: C.ivoryDim,
            opacity: ramp(frame, [10 + i * 4, 20 + i * 4], [0, 1]) * (1 - merge),
          }}
        >
          {PANEL_LABELS[i]}
        </div>
      ))}
      {frame >= FUSE ? (
        <div style={{ position: "absolute", left: W / 2 - 250, top: 980 - 250, width: 500, height: 500, transform: `scale(${nested}) rotate(${(frame - FUSE) * 0.8}deg)` }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Shape kind="triangle" size={500} stroke={7} />
          </div>
          <div style={{ position: "absolute", inset: 150, top: 200, bottom: 100, transform: `rotate(${-(frame - FUSE) * 2}deg)` }}>
            <Shape kind="square" size={200} stroke={7} />
          </div>
          <div style={{ position: "absolute", left: 190, top: 240, transform: `scale(${1 + beatPulse(frame, FUSE) * 0.12})` }}>
            <Shape kind="circle" size={120} fill={1} stroke={0} />
          </div>
        </div>
      ) : null}
      <Flash at={FUSE} max={0.6} color={C.copperLight} />
      <Ring at={FUSE} x={W / 2} y={980} size={1300} />
      <Burst at={FUSE} x={W / 2} y={980} count={36} power={700} seed="v4fuse" />
      {/* copy */}
      <At y={280}>
        <Words lines={["*Seuls,*"]} delay={18} mode="blur" exitAt={56} style={{ fontSize: 170 }} />
      </At>
      <At y={470}>
        <Words lines={["ils fonctionnent."]} delay={24} stagger={3} mode="rise" exitAt={56} style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 96, color: C.ivory, letterSpacing: "-0.03em" }} />
      </At>
      <At y={280}>
        <Words lines={["*Ensemble,*"]} delay={FUSE - 4} mode="drop" style={{ fontSize: 170 }} />
      </At>
      <At y={470}>
        <Words lines={["ils changent tout."]} delay={FUSE + 4} stagger={4} mode="pop" style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 104, color: C.ivory, letterSpacing: "-0.03em" }} />
      </At>
      <At y={1340}>
        <div style={{ fontFamily: F.condensed, fontSize: 200, color: "transparent", WebkitTextStroke: `2px ${C.copperLight}`, opacity: ramp(frame, [FUSE + 16, FUSE + 30], [0, 0.9]), transform: `scale(${interpolate(frame, [FUSE + 16, 150], [0.9, 1.1], CLAMP)})`, letterSpacing: "0.05em" }}>
          TOUT.
        </div>
      </At>
    </SceneFrame>
  );
};

const Pillar: React.FC<{
  kind: Kind;
  n: string;
  title: string;
  keyword: string;
  icon: string[];
  seed: string;
  grid?: boolean | "perspective";
  variant?: "night" | "deep";
  fx: React.ReactNode;
  role: string[];
}> = ({ kind, n, title, keyword, icon, seed, grid, variant = "night", fx, role }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 2, SPRING.bouncy);
  const step = Math.floor(frame / 16.36);
  const rot = kind === "square" ? step * 90 + ramp(frame % 16.36, [0, 6], [0, 90], EASE.back) - 90 : kind === "circle" ? 0 : Math.sin(frame / 10) * 6;
  const beat = beatPulse(frame);
  return (
    <SceneFrame seed={seed} variant={variant} dur={PILLAR_DUR} zoom={[1.05, 1]} grid={grid}>
      <At y={270}>
        <Tag style={{ fontSize: 30 }}>{`${n} / 03`}</Tag>
      </At>
      <At y={330}>
        <Words lines={[title]} delay={2} mode="rise" stagger={3} style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 92, color: C.ivory, letterSpacing: "-0.03em" }} />
      </At>
      {fx}
      <div style={{ position: "absolute", left: W / 2 - 260, top: 560, width: 520, height: 520, transform: `scale(${s * (1 + (kind === "circle" ? beat * 0.06 : 0))}) rotate(${rot}deg)` }}>
        <Shape kind={kind} size={520} stroke={10} draw={ramp(frame, [2, 26], [0, 1], EASE.inOut)} fill={ramp(frame, [20, 36], [0, 0.18])} />
      </div>
      <div style={{ position: "absolute", left: W / 2 - 90, top: kind === "triangle" ? 900 : 730, transform: `scale(${pop(frame, fps, 14, SPRING.bouncy)})` }}>
        <DrawIcon paths={icon} progress={ramp(frame, [14, 34], [0, 1])} size={180} color={C.ivory} width={5} />
      </div>
      <At y={1110}>
        <OutlineFill text={keyword} progress={ramp(frame, [30, 64], [0, 1], EASE.inOut)} stroke={C.copperLight} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 180, lineHeight: 1.1, paddingRight: 20, opacity: ramp(frame, [26, 32], [0, 1]) }} />
      </At>
      <At y={1370}>
        <Words lines={role} delay={58} stagger={2} mode="blur" style={{ ...SUB, fontSize: 50, color: C.ivory }} accentStyle={{ ...ACCENT_SERIF, fontSize: 60 }} />
      </At>
    </SceneFrame>
  );
};

const TrustFx: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <Ring key={i} at={10 + i * 16} x={W / 2} y={820} size={1100} duration={40} width={3} />
      ))}
      <div style={{ position: "absolute", left: W / 2 - 400, top: 420, width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, ${C.copper}44, transparent 65%)`, transform: `scale(${1 + beatPulse(frame) * 0.1})` }} />
    </>
  );
};

const RegularityFx: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1560, display: "flex", justifyContent: "space-between" }}>
      {new Array(12).fill(0).map((_, i) => {
        const active = Math.floor(frame / 8.18) % 12 >= i;
        return <div key={i} style={{ width: 56, height: 56, borderRadius: 10, border: `2px solid ${C.ivory}55`, background: active ? C.copperLight : "transparent", transform: `scale(${active ? 1 : 0.8})` }} />;
      })}
    </div>
  );
};

const ReachFx: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(40).fill(0).map((_, i) => {
        const a = random(`ra${i}`) * Math.PI * 2;
        const t = ((frame * 1.2 + random(`rt${i}`) * 100) % 100) / 100;
        const dist = 150 + t * 700;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: W / 2 + Math.cos(a) * dist - 8,
              top: 820 + Math.sin(a) * dist * 0.9 - 8,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: i % 3 ? C.copperLight : C.ivory,
              opacity: Math.sin(t * Math.PI) * 0.8,
            }}
          />
        );
      })}
      {[0, 1, 2].map((i) => (
        <Ring key={i} at={6 + i * 22} x={W / 2} y={620} size={1600} duration={50} width={4} color={C.ivory} />
      ))}
    </>
  );
};

const Fusion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const collapse = ramp(frame, [44, 64], [0, 1], EASE.snap);
  const spin = interpolate(frame, [64, 150], [0, 360], CLAMP);
  const words = ["Confiance", "Régularité", "Portée"];
  const glow = ramp(frame, [64, 80], [0, 1]);
  return (
    <SceneFrame seed="v4fusion" dur={150} zoom={[1, 1.06]} back={<GeoBackdrop opacity={0.05} />}>
      {/* triptych panels */}
      {PANEL_KINDS.map((k, i) => {
        const s = pop(frame, fps, i * 6, SPRING.snappy);
        const px = (W / 3) * i;
        const left = interpolate(collapse, [0, 1], [px, W / 2 - 1]);
        const width = interpolate(collapse, [0, 1], [W / 3, 2]);
        return (
          <div key={k} style={{ position: "absolute", left, width, top: 0, bottom: 0, overflow: "hidden", background: i === 1 ? "rgba(243,238,230,0.04)" : "transparent", transform: `translateY(${(1 - s) * (i % 2 ? -H : H)}px)`, borderLeft: i ? `2px solid ${C.ivory}33` : undefined }}>
            <div style={{ position: "absolute", left: W / 6 - 110, top: 620 }}>
              <Shape kind={k} size={220} fill={k === "circle" ? 0.9 : 0} stroke={8} style={{ transform: `rotate(${frame * (i - 1) * 3}deg)` }} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", fontFamily: F.serif, fontStyle: "italic", fontSize: 64, color: C.ivory, opacity: 1 - Math.min(1, collapse * 3) }}>{words[i]}</div>
          </div>
        );
      })}
      {/* nested emblem */}
      {frame >= 58 ? (
        <div style={{ position: "absolute", left: W / 2 - 300, top: 480, width: 600, height: 600, perspective: 1200 }}>
          <div style={{ position: "absolute", inset: -200, borderRadius: "50%", background: `radial-gradient(circle, ${C.copper}66, transparent 60%)`, opacity: glow }} />
          <div style={{ position: "absolute", inset: 0, transform: `rotateY(${spin}deg) scale(${pop(frame, fps, 58, SPRING.bouncy)})`, transformStyle: "preserve-3d" }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <Shape kind="triangle" size={600} stroke={8} />
            </div>
            <div style={{ position: "absolute", left: 175, top: 250, transform: "translateZ(60px)" }}>
              <Shape kind="square" size={250} stroke={8} />
            </div>
            <div style={{ position: "absolute", left: 225, top: 300, transform: "translateZ(120px)" }}>
              <Shape kind="circle" size={150} stroke={8} fill={0.25} />
            </div>
            <div style={{ position: "absolute", left: 300 - 50, top: 375 - 50, fontSize: 526, width: 100, height: 100, display: "flex", lineHeight: 0, transform: "translateZ(170px)" }}>
              <Dot style={{ marginLeft: 0 }} />
            </div>
          </div>
        </div>
      ) : null}
      <Flash at={62} max={0.55} color={C.copperLight} />
      <Burst at={64} x={W / 2} y={780} count={40} power={800} seed="v4fusion" />
      <Ring at={64} x={W / 2} y={780} size={1500} />
      <Sequence from={70} layout="none">
        <At y={1180}>
          <Words
            lines={["Confiance", "+ régularité", "+ *portée.*"]}
            delay={0}
            stagger={4}
            mode="flip"
            style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 96, color: C.ivory, lineHeight: 1.08, letterSpacing: "-0.03em" }}
            accentStyle={{ ...ACCENT_SERIF, fontSize: 120 }}
          />
        </At>
      </Sequence>
    </SceneFrame>
  );
};

const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = pop(frame, fps, 70, SPRING.heavy);
  const gather = ramp(frame, [96, 150], [0, 1], EASE.inOut);
  return (
    <SceneFrame seed="v4q" variant="deep" dur={170} zoom={[1, 1.08]}
      back={
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 280,
            textAlign: "center",
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 1500,
            lineHeight: 1,
            color: C.copper,
            opacity: 0.14 * q,
            transform: `scale(${0.5 + 0.5 * q}) rotate(${(1 - q) * 40 + Math.sin(frame / 20) * 3}deg)`,
          }}
        >
          ?
        </div>
      }
    >
      <At y={300}>
        <Words lines={["Une seule question :"]} delay={2} stagger={3} mode="rise" style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 84, color: C.ivoryDim, letterSpacing: "-0.02em" }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 60, top: 560, display: "flex", flexDirection: "column", gap: 10 }}>
        <Typewriter text="est-ce que ça" start={20} cps={20} style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 116, color: C.ivory, letterSpacing: "-0.03em" }} caretColor={frame < 38 ? C.copperLight : "transparent"} />
        <Typewriter text="vous ramène" start={38} cps={20} style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 116, color: C.ivory, letterSpacing: "-0.03em" }} caretColor={frame < 56 ? C.copperLight : "transparent"} />
        <Typewriter text="des clients ?" start={56} cps={18} style={{ ...ACCENT_SERIF, fontSize: 170, lineHeight: 1.1 }} />
      </div>
      {/* clients converging */}
      {new Array(10).fill(0).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        const r = interpolate(gather, [0, 1], [520, 150]);
        const s = pop(frame, fps, 80 + i * 2, SPRING.bouncy);
        return (
          <div key={i} style={{ position: "absolute", left: W / 2 + Math.cos(a) * r - 40, top: 1330 + Math.sin(a) * r * 0.45 - 40, transform: `scale(${s})` }}>
            <DrawIcon paths={ICON.face} progress={1} size={80} color={i % 2 ? C.copperLight : C.ivory} width={7} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: W / 2 - 60, top: 1330 - 60, width: 120, height: 120, transform: `scale(${pop(frame, fps, 96, SPRING.bouncy) * (1 + beatPulse(frame, 96) * 0.1)})` }}>
        <div style={{ fontSize: 630, display: "flex", lineHeight: 0 }}>
          <Dot style={{ marginLeft: 0 }} />
        </div>
      </div>
    </SceneFrame>
  );
};

// ─── Nouvelles scènes : le piège, l'exemple concret, le cas réel, l'offre ──

/** Petite pastille forme + label de service. */
const ServiceChip: React.FC<{ kind: Kind; label: string; dark?: boolean; size?: number }> = ({ kind, label, dark, size = 34 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
    <Shape kind={kind} size={size} stroke={6} fill={kind === "circle" ? 0.9 : 0} color={dark ? C.deep : undefined} />
    <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 24, letterSpacing: "0.25em", color: dark ? C.deep : C.copperLight }}>{label}</span>
  </div>
);

const Illustratif: React.FC<{ y?: number; dark?: boolean }> = ({ y = 1630, dark }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: F.mono, fontSize: 22, letterSpacing: "0.2em", color: dark ? C.copperDark : C.steel, textTransform: "uppercase" }}>
    Exemple illustratif
  </div>
);

const Mark: React.FC<{ ok: boolean; p: number; size?: number }> = ({ ok, p, size = 72 }) => (
  <div style={{ width: size, height: size, flexShrink: 0, borderRadius: "50%", background: ok ? GRAD.copper : "rgba(243,238,230,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <DrawIcon paths={ok ? ICON.check : ICON.cross} progress={p} size={size * 0.56} color={ok ? C.deep : C.ivory} width={12} />
  </div>
);

const TRAP: { kind: Kind; t: string; d: string }[] = [
  { kind: "triangle", t: "La pub seule", d: "On paie pour amener les gens… vers un profil vide." },
  { kind: "square", t: "La vidéo seule", d: "De bonnes vidéos, que presque personne ne voit." },
  { kind: "circle", t: "Le branding seul", d: "On vous découvre une fois… puis on vous oublie." },
];

const Trap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFrame seed="v4trap" variant="deep" dur={230} zoom={[1, 1.03]}>
      <At y={250}>
        <Tag>Le piège</Tag>
      </At>
      <At y={320}>
        <Words lines={["En faire *un seul*", "des trois."]} delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 104 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 124 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 600, display: "flex", flexDirection: "column", gap: 22 }}>
        {TRAP.map((r, i) => {
          const d = 30 + i * 30;
          const s = pop(frame, fps, d, SPRING.snappy);
          return (
            <div
              key={r.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "30px 34px",
                borderRadius: 30,
                background: "rgba(7,15,24,0.55)",
                border: "2px solid rgba(243,238,230,0.14)",
                transform: `translateX(${(1 - s) * 120}px)`,
                opacity: Math.min(1, s * 1.5),
              }}
            >
              <div style={{ width: 92, height: 92, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <Shape kind={r.kind} size={78} stroke={7} fill={r.kind === "circle" ? 0.9 : 0} />
                <div style={{ position: "absolute", right: -14, bottom: -14 }}>
                  <Mark ok={false} p={ramp(frame, [d + 10, d + 22], [0, 1])} size={46} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 52, color: C.ivory, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{r.t}</div>
                <div style={{ ...SUB, fontSize: 38, marginTop: 6 }}>{r.d}</div>
              </div>
            </div>
          );
        })}
      </div>
      <At y={1420}>
        <Words lines={["Chacun a besoin", "*des deux autres.*"]} delay={140} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 84 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 100 }} />
      </At>
    </SceneFrame>
  );
};

const ExampleTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drive = ramp(frame, [10, 60], [-500, 0], EASE.out);
  return (
    <SceneFrame seed="v4ex" variant="night" dur={120} zoom={[1.06, 1]} grid="perspective">
      <At y={330}>
        <Tag style={{ fontSize: 34 }}>Un exemple concret</Tag>
      </At>
      <div style={{ position: "absolute", left: W / 2 - 230 + drive, top: 470, transform: `scale(${pop(frame, fps, 6, SPRING.bouncy)})` }}>
        <DrawIcon paths={CAR} progress={ramp(frame, [6, 40], [0, 1])} size={460} color={C.copperLight} width={3.5} />
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 830, height: 3, background: `linear-gradient(90deg, transparent, ${C.ivory}55, transparent)`, transform: `scaleX(${ramp(frame, [20, 50], [0, 1])})` }} />
      <At y={900}>
        <Words lines={["Un garage", "*d'occasion.*"]} delay={30} stagger={5} mode="pop" style={{ ...BOLD, fontSize: 132 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 156 }} />
      </At>
      <At y={1230}>
        <Words lines={["Près de Liège. Un mois avec nous."]} delay={56} stagger={2} mode="blur" style={{ ...SUB, fontSize: 50, color: C.ivory }} />
      </At>
      <Illustratif y={1400} />
    </SceneFrame>
  );
};

/** Cadre de téléphone pour les visuels d'exemple. */
const Phone: React.FC<{ children: React.ReactNode; x: number; y: number; w?: number; h?: number; s?: number }> = ({ children, x, y, w = 330, h = 470, s = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y,
      width: w,
      height: h,
      borderRadius: 44,
      border: `4px solid ${C.ivory}`,
      background: C.abyss,
      overflow: "hidden",
      transform: `scale(${s})`,
      opacity: s > 0.01 ? 1 : 0,
      boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${C.copper}33`,
    }}
  >
    <div style={{ position: "absolute", left: w / 2 - 50, top: 14, width: 100, height: 22, borderRadius: 11, background: C.deep, zIndex: 2 }} />
    {children}
  </div>
);

const FaceCamVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rec = Math.floor(frame / 15) % 2 === 0;
  return (
    <Phone x={W / 2} y={560} s={pop(frame, fps, 8, SPRING.bouncy)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%, ${C.night}, ${C.abyss})` }} />
      <div style={{ position: "absolute", left: 24, top: 52, display: "flex", alignItems: "center", gap: 10, fontFamily: F.mono, fontWeight: 700, fontSize: 20, color: C.ivory, letterSpacing: "0.15em" }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#E5484D", opacity: rec ? 1 : 0.25 }} />
        REC
      </div>
      <div style={{ position: "absolute", left: 330 / 2 - 100, top: 110 }}>
        <DrawIcon paths={ICON.face} progress={ramp(frame, [14, 40], [0, 1])} size={200} color={C.ivory} width={3.5} />
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 30, padding: "12px 16px", borderRadius: 14, background: "rgba(243,238,230,0.92)", fontFamily: F.grotesk, fontWeight: 800, fontSize: 26, color: C.deep, textAlign: "center", opacity: ramp(frame, [40, 50], [0, 1]), transform: `translateY(${ramp(frame, [40, 52], [30, 0])}px)` }}>
        « Notre garantie, en 30 s »
      </div>
    </Phone>
  );
};

const WEEKS = ["Arrivage", "Conseil", "Atelier", "Essai"];

const WeeklyVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tile = 380;
  return (
    <div style={{ position: "absolute", left: W / 2 - tile - 15, top: 560, width: tile * 2 + 30, display: "flex", flexWrap: "wrap", gap: 30 }}>
      {WEEKS.map((w, i) => {
        const s = pop(frame, fps, 8 + i * 12, SPRING.bouncy);
        return (
          <div key={w} style={{ width: tile, height: 200, borderRadius: 28, background: i % 2 ? "rgba(243,238,230,0.07)" : "rgba(7,15,24,0.6)", border: `2px solid ${C.copperLight}66`, position: "relative", transform: `scale(${s})`, opacity: s > 0.01 ? 1 : 0, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 22, top: 18, fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: "0.2em", color: C.copperLight }}>{`SEM. ${i + 1}`}</div>
            <div style={{ position: "absolute", right: 24, top: 52 }}>
              <DrawIcon paths={ICON.play} progress={ramp(frame, [14 + i * 12, 28 + i * 12], [0, 1])} size={90} color={C.ivory} width={6} fill={C.copperLight} fillOpacity={0.35} />
            </div>
            <div style={{ position: "absolute", left: 22, bottom: 20, fontFamily: F.grotesk, fontWeight: 800, fontSize: 44, color: C.ivory, letterSpacing: "-0.02em" }}>{w}</div>
          </div>
        );
      })}
    </div>
  );
};

const RadiusVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cx = W / 2;
  const cy = 840;
  const R = 230 * pop(frame, fps, 8, SPRING.soft);
  return (
    <>
      <div style={{ position: "absolute", left: cx - R, top: cy - R, width: R * 2, height: R * 2, borderRadius: "50%", border: `3px dashed ${C.copperLight}`, background: `radial-gradient(circle, ${C.copper}33, transparent 70%)` }} />
      {new Array(26).fill(0).map((_, i) => {
        const a = random(`rv${i}`) * Math.PI * 2;
        const d = Math.sqrt(random(`rd${i}`)) * 210;
        const on = frame > 30 + i * 3;
        return (
          <div key={i} style={{ position: "absolute", left: cx + Math.cos(a) * d - 9, top: cy + Math.sin(a) * d - 9, width: 18, height: 18, borderRadius: "50%", background: on ? C.copperLight : `${C.ivory}33`, transform: `scale(${on ? 1 + beatPulse(frame, 30 + i * 3) * 0.6 : 0.7})` }} />
        );
      })}
      <div style={{ position: "absolute", left: cx - 50, top: cy - 100 }}>
        <DrawIcon paths={ICON.pin} progress={1} size={100} color={C.deep} width={6} fill={C.ivory} fillOpacity={1} />
      </div>
      <div style={{ position: "absolute", left: cx + 250, top: cy - 20, fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: "0.15em", color: C.copperLight, opacity: ramp(frame, [20, 30], [0, 1]) }}>15 KM</div>
      {[0, 1].map((i) => (
        <Ring key={i} at={12 + i * 30} x={cx} y={cy} size={700} duration={40} width={3} />
      ))}
    </>
  );
};

const Step: React.FC<{
  seed: string;
  kind: Kind;
  tag: string;
  title: string[];
  visual: React.ReactNode;
  bullets: string[];
  result: string;
  variant?: "night" | "deep";
  dur: number;
}> = ({ seed, kind, tag, title, visual, bullets, result, variant = "night", dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = pop(frame, fps, dur - 62, SPRING.bouncy);
  return (
    <SceneFrame seed={seed} variant={variant} dur={dur} zoom={[1, 1.03]}>
      <At y={250}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: ramp(frame, [0, 10], [0, 1]) }}>
          <Shape kind={kind} size={40} stroke={7} fill={kind === "circle" ? 0.9 : 0} />
          <Tag>{tag}</Tag>
        </div>
      </At>
      <At y={330}>
        <Words lines={title} delay={2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 84 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 100 }} />
      </At>
      {visual}
      <div style={{ position: "absolute", left: 110, right: 90, top: 1080, display: "flex", flexDirection: "column", gap: 20 }}>
        {bullets.map((b, i) => {
          const d = 40 + i * 16;
          const s = pop(frame, fps, d, SPRING.snappy);
          return (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 80}px)` }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: C.copperLight, flexShrink: 0, transform: "rotate(45deg)" }} />
              <div style={{ fontFamily: F.grotesk, fontWeight: 600, fontSize: 44, color: C.ivory, letterSpacing: "-0.015em", lineHeight: 1.15 }}>{b}</div>
            </div>
          );
        })}
      </div>
      <At y={1420}>
        <div
          style={{
            padding: "22px 46px",
            borderRadius: 999,
            background: GRAD.copper,
            boxShadow: `0 0 60px ${C.copper}66`,
            fontFamily: F.grotesk,
            fontWeight: 900,
            fontSize: 54,
            color: C.deep,
            letterSpacing: "-0.02em",
            transform: `scale(${r})`,
            opacity: r > 0.01 ? 1 : 0,
          }}
        >
          {result}
        </div>
      </At>
      <Burst at={dur - 60} x={W / 2} y={1470} count={18} power={420} seed={`${seed}b`} />
      <Illustratif />
    </SceneFrame>
  );
};

const JOURNEY: { kind: Kind | "dot"; t: string; d: string }[] = [
  { kind: "triangle", t: "Il tombe sur la pub", d: "Une voiture présentée en 30 secondes." },
  { kind: "square", t: "Il ouvre le profil", d: "Une vidéo chaque semaine, pas un profil vide." },
  { kind: "circle", t: "Il voit le patron", d: "Un visage, une garantie expliquée : il est rassuré." },
  { kind: "dot", t: "Il écrit pour un essai", d: "Il arrive au garage déjà en confiance." },
];

const Journey: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const top = 620;
  const gap = 210;
  const line = ramp(frame, [24, 24 + 3 * 46], [0, 1], EASE.inOut);
  return (
    <SceneFrame seed="v4journey" variant="deep" dur={290} zoom={[1, 1.04]} grid>
      <At y={250}>
        <Tag>Côté client</Tag>
      </At>
      <At y={320}>
        <Words lines={["Le parcours", "d'un *acheteur.*"]} delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 100 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 120 }} />
      </At>
      <div style={{ position: "absolute", left: 143, top: top + 50, width: 4, height: gap * 3 * line, background: `linear-gradient(180deg, ${C.copperLight}, ${C.copper})` }} />
      {JOURNEY.map((j, i) => {
        const d = 24 + i * 46;
        const s = pop(frame, fps, d, SPRING.bouncy);
        const last = j.kind === "dot";
        return (
          <div key={j.t} style={{ position: "absolute", left: 90, right: 90, top: top + i * gap, display: "flex", gap: 34, alignItems: "flex-start" }}>
            <div style={{ width: 110, height: 110, flexShrink: 0, borderRadius: "50%", background: last ? GRAD.copper : C.deep, border: `3px solid ${last ? C.copperLight : `${C.ivory}44`}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})`, boxShadow: last ? `0 0 ${50 * s}px ${C.copper}88` : undefined }}>
              {last ? <DrawIcon paths={ICON.message} progress={ramp(frame, [d + 4, d + 20], [0, 1])} size={62} color={C.deep} width={7} /> : <Shape kind={j.kind as Kind} size={56} stroke={7} fill={j.kind === "circle" ? 0.9 : 0} />}
            </div>
            <div style={{ paddingTop: 8, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 60}px)` }}>
              <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 54, color: last ? C.copperLight : C.ivory, letterSpacing: "-0.025em", lineHeight: 1.08 }}>{j.t}</div>
              <div style={{ ...SUB, fontSize: 38, marginTop: 8, maxWidth: 690 }}>{j.d}</div>
            </div>
          </div>
        );
      })}
      <Ring at={24 + 3 * 46} x={145} y={top + 3 * gap + 55} size={500} />
      <Illustratif y={1500} />
    </SceneFrame>
  );
};

const Without: React.FC = () => (
  <SceneFrame seed="v4without" variant="ivory" dur={160} zoom={[1, 1.05]}>
    <At y={420}>
      <Words lines={["Sans vidéos", "ni visage,"]} delay={4} stagger={4} mode="drop" style={{ ...BOLD, color: C.deep, fontSize: 140 }} />
    </At>
    <At y={760}>
      <Words lines={["*la pub mène*", "*nulle part.*"]} delay={24} stagger={4} mode="rise" style={{ fontSize: 150 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 140, lineHeight: 1.05 }} />
    </At>
    <At y={1270}>
      <Words
        lines={["Le client clique, trouve", "un profil vide… et repart."]}
        delay={64}
        stagger={2}
        mode="blur"
        style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 60, color: C.deep, lineHeight: 1.18, letterSpacing: "-0.02em" }}
      />
    </At>
  </SceneFrame>
);

/**
 * Cas réel de personal branding dans un domaine inattendu : le vin.
 * Source vérifiée (Wikipedia, « Gary Vaynerchuk ») : Wine Library TV lancée en février 2006,
 * 1 000 épisodes en 2011, magasin familial passé de 3 M$ à 60 M$ de chiffre d'affaires par an.
 */
const RealProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eps = useCount(0, 1000, 40, 90);
  const rev = useCount(3, 60, 120, 168);
  const card = (d: number) => pop(frame, fps, d, SPRING.snappy);
  const c1 = card(34);
  const c2 = card(110);
  const x = pop(frame, fps, 186, SPRING.bouncy);
  const box: React.CSSProperties = { padding: "32px 40px", borderRadius: 34, background: "rgba(243,238,230,0.07)", border: `2px solid ${C.copperLight}66` };
  return (
    <SceneFrame seed="v4real" variant="deep" dur={250} zoom={[1.05, 1]} grid="perspective">
      <At y={250}>
        <Tag>Un cas célèbre</Tag>
      </At>
      <At y={320}>
        <Words lines={["Gary Vaynerchuk"]} delay={4} stagger={5} mode="pop" style={{ fontFamily: F.condensed, fontSize: 132, color: C.ivory, lineHeight: 1 }} />
      </At>
      <At y={480}>
        <Words lines={["Le magasin de vin *de ses parents.*"]} delay={14} stagger={3} mode="blur" style={{ ...SUB, fontSize: 46, color: C.ivory }} accentStyle={{ ...ACCENT_SERIF, fontSize: 56 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 620, ...box, opacity: Math.min(1, c1 * 1.5), transform: `translateY(${(1 - c1) * 60}px)` }}>
        <ServiceChip kind="circle" label="FACE CAMÉRA · DÈS 2006" />
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: 14 }}>
          <Odometer value={eps.value} final={1000} velocity={eps.velocity} style={{ fontFamily: F.condensed, fontSize: 150, color: C.ivory }} />
          <span style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 52, color: C.ivory }}>épisodes</span>
        </div>
        <div style={{ ...SUB, fontSize: 40, color: C.ivory, marginTop: 6 }}>d'une émission vidéo… sur le vin.</div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 990, ...box, opacity: Math.min(1, c2 * 1.5), transform: `translateY(${(1 - c2) * 60}px)` }}>
        <ServiceChip kind="square" label="CHIFFRE D'AFFAIRES / AN" />
        <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 14 }}>
          <span style={{ fontFamily: F.condensed, fontSize: 110, color: C.ivoryDim }}>3 M$</span>
          <span style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 70, color: C.copperLight }}>→</span>
          <span style={{ fontFamily: F.condensed, fontSize: 150, color: C.ivory }}>{`${Math.round(rev.value)} M$`}</span>
        </div>
        <div style={{ ...SUB, fontSize: 40, color: C.ivory, marginTop: 6 }}>pour le magasin familial.</div>
      </div>
      <At y={1390}>
        <div style={{ textAlign: "center", transform: `scale(${x})`, opacity: x > 0.01 ? 1 : 0 }}>
          <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 64, color: C.ivory, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Pas une star.</div>
          <div style={{ ...ACCENT_SERIF, fontSize: 80, lineHeight: 1.1 }}>Un caviste qui se montre.</div>
        </div>
      </At>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1630, textAlign: "center", fontFamily: F.mono, fontSize: 20, letterSpacing: "0.15em", color: C.steel, textTransform: "uppercase" }}>
        Source : Wikipedia, « Gary Vaynerchuk »
      </div>
      <Flash at={186} max={0.3} color={C.copperLight} />
      <Burst at={188} x={W / 2} y={1460} count={24} power={560} seed="v4gv" />
    </SceneFrame>
  );
};

const OFFER = ["Un tournage chez vous", "Trois vidéos prêtes à publier", "Un bilan ensemble", "Sans engagement"];

const Offer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFrame seed="v4offer" variant="night" dur={175} zoom={[1.04, 1]} grid>
      <At y={300}>
        <Words lines={["Testez", "*les trois.*"]} delay={2} stagger={4} mode="drop" style={{ ...BOLD, fontSize: 140 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 170 }} />
      </At>
      <At y={660}>
        <div style={{ padding: "20px 44px", borderRadius: 999, background: GRAD.copper, fontFamily: F.grotesk, fontWeight: 900, fontSize: 56, color: C.deep, letterSpacing: "-0.02em", transform: `scale(${pop(frame, fps, 26, SPRING.bouncy)})` }}>
          Deux semaines offertes
        </div>
      </At>
      <div style={{ position: "absolute", left: 150, right: 90, top: 860, display: "flex", flexDirection: "column", gap: 28 }}>
        {OFFER.map((o, i) => {
          const d = 48 + i * 14;
          const s = pop(frame, fps, d, SPRING.snappy);
          return (
            <div key={o} style={{ display: "flex", alignItems: "center", gap: 26, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 80}px)` }}>
              <Mark ok p={ramp(frame, [d + 4, d + 14], [0, 1])} size={66} />
              <div style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 50, color: C.ivory, letterSpacing: "-0.02em" }}>{o}</div>
            </div>
          );
        })}
      </div>
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

const SCENES: Scene[] = [
  { id: "intro", duration: 80, element: <Intro />, exit: { presentation: spinZoom(), timing: timing(20) } },
  { id: "hook", duration: 150, element: <Hook />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "trap", duration: 230, element: <Trap />, exit: { presentation: iris({ width: W, height: H }), timing: timing(20) } },
  {
    id: "trust",
    duration: PILLAR_DUR,
    element: <Pillar kind="circle" n="01" title="Personal branding" keyword="confiance." icon={ICON.handshake} seed="v4p1" fx={<TrustFx />} role={["On voit *qui vous êtes.*", "On vous fait confiance."]} />,
    exit: { presentation: slide({ direction: "from-right" }), timing: timing(18) },
  },
  {
    id: "regularity",
    duration: PILLAR_DUR,
    element: <Pillar kind="square" n="02" title="Contenu vidéo" keyword="régularité." icon={ICON.play} seed="v4p2" grid variant="deep" fx={<RegularityFx />} role={["Une vidéo *chaque semaine.*", "On ne vous oublie pas."]} />,
    exit: { presentation: wipe({ direction: "from-left" }), timing: timing(18) },
  },
  {
    id: "reach",
    duration: PILLAR_DUR,
    element: <Pillar kind="triangle" n="03" title="Publicité" keyword="portée." icon={ICON.broadcast} seed="v4p3" grid="perspective" fx={<ReachFx />} role={["Vos vidéos montrées", "*aux gens du coin.*"]} />,
    exit: { presentation: zoomPunch(), timing: timing(18) },
  },
  { id: "fusion", duration: 150, element: <Fusion />, exit: { presentation: blinds(), timing: timing(20) } },
  { id: "example", duration: 120, element: <ExampleTitle />, exit: { presentation: slide({ direction: "from-bottom" }), timing: timing(18) } },
  {
    id: "step1",
    duration: 190,
    element: (
      <Step
        seed="v4s1"
        kind="circle"
        tag="Semaine 1 · Branding"
        title={["On filme *le patron.*"]}
        visual={<FaceCamVisual />}
        bullets={["Il se présente, lui et son garage", "Il explique sa garantie, sans jargon", "On voit l'atelier et l'équipe"]}
        result="On le reconnaît."
        dur={190}
      />
    ),
    exit: { presentation: wipe({ direction: "from-right" }), timing: timing(18) },
  },
  {
    id: "step2",
    duration: 190,
    element: (
      <Step
        seed="v4s2"
        kind="square"
        tag="Semaines 1 à 4 · Vidéo"
        title={["*Une vidéo* par semaine."]}
        visual={<WeeklyVisual />}
        bullets={["Une voiture du parc en 30 secondes", "Un conseil d'entretien", "Les coulisses de l'atelier"]}
        result="On le suit."
        variant="deep"
        dur={190}
      />
    ),
    exit: { presentation: wipe({ direction: "from-right" }), timing: timing(18) },
  },
  {
    id: "step3",
    duration: 200,
    element: (
      <Step
        seed="v4s3"
        kind="triangle"
        tag="Semaines 3 et 4 · Pub"
        title={["*La meilleure* vidéo", "diffusée autour."]}
        visual={<RadiusVisual />}
        bullets={["À 15 km autour du garage", "Aux gens intéressés par l'auto", "Un message clair : « Réservez un essai »"]}
        result="On le choisit."
        dur={200}
      />
    ),
    exit: { presentation: inkDrop({ x: W / 2, y: 1470 }), timing: timing(22) },
  },
  { id: "journey", duration: 290, element: <Journey />, exit: { presentation: splitDoors(), timing: timing(20) } },
  { id: "without", duration: 160, element: <Without />, exit: { presentation: glitchSlice(), timing: timing(14, (t) => t) } },
  { id: "real", duration: 250, element: <RealProof />, exit: { presentation: copperSweep(), timing: timing(20) } },
  { id: "question", duration: 170, element: <Question />, exit: { presentation: zoomPunch(), timing: timing(18) } },
  { id: "offer", duration: 175, element: <Offer />, exit: { presentation: copperSweep(), timing: timing(20) } },
  { id: "end", duration: END_CARD_DURATION, element: <EndCard /> },
];

export const V4_DURATION = seriesDuration(SCENES);
const starts = sceneStarts(SCENES);

export const V4AllTogether: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <SceneSeries scenes={SCENES} />
    <BrandLogo variant="fusion" handoff={64} hideAt={starts.end} invert={[[starts.without + 10, starts.without + 150]]} />
  </AbsoluteFill>
);
