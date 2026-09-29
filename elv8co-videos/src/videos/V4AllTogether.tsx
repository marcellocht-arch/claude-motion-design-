import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { C, EASE, F, H, W } from "../theme";
import { beatPulse, CLAMP, pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, OutlineFill, Tag, Typewriter, Words } from "../components/Kinetic";
import { Burst, Dust, Flash, Ring } from "../components/Particles";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo, Dot } from "../components/Logo";
import { END_CARD_DURATION, EndCard } from "../components/EndCard";
import { Scene, SceneSeries, sceneStarts, seriesDuration } from "../components/SceneSeries";
import { copperSweep, glitchSlice, spinZoom, timing, zoomPunch } from "../transitions";

type Kind = "circle" | "square" | "triangle";

const SHAPE_COLOR: Record<Kind, string> = { circle: C.copper, square: C.ivory, triangle: C.copperLight };

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
}> = ({ kind, n, title, keyword, icon, seed, grid, variant = "night", fx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 2, SPRING.bouncy);
  const step = Math.floor(frame / 16.36);
  const rot = kind === "square" ? step * 90 + ramp(frame % 16.36, [0, 6], [0, 90], EASE.back) - 90 : kind === "circle" ? 0 : Math.sin(frame / 10) * 6;
  const beat = beatPulse(frame);
  return (
    <SceneFrame seed={seed} variant={variant} dur={105} zoom={[1.05, 1]} grid={grid}>
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
      <At y={1170}>
        <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 90, color: C.copperLight, opacity: ramp(frame, [30, 38], [0, 1]) }}>=</div>
      </At>
      <At y={1270}>
        <OutlineFill text={keyword} progress={ramp(frame, [36, 70], [0, 1], EASE.inOut)} stroke={C.copperLight} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 190, lineHeight: 1.1, paddingRight: 20, opacity: ramp(frame, [32, 38], [0, 1]) }} />
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

// ─── Composition ────────────────────────────────────────────────────────────

const SCENES: Scene[] = [
  { id: "intro", duration: 80, element: <Intro />, exit: { presentation: spinZoom(), timing: timing(20) } },
  { id: "hook", duration: 150, element: <Hook />, exit: { presentation: iris({ width: W, height: H }), timing: timing(20) } },
  {
    id: "trust",
    duration: 105,
    element: <Pillar kind="circle" n="01" title="Personal branding" keyword="confiance." icon={ICON.handshake} seed="v4p1" fx={<TrustFx />} />,
    exit: { presentation: slide({ direction: "from-right" }), timing: timing(18) },
  },
  {
    id: "regularity",
    duration: 105,
    element: <Pillar kind="square" n="02" title="Contenu vidéo" keyword="régularité." icon={ICON.play} seed="v4p2" grid variant="deep" fx={<RegularityFx />} />,
    exit: { presentation: wipe({ direction: "from-left" }), timing: timing(18) },
  },
  {
    id: "reach",
    duration: 105,
    element: <Pillar kind="triangle" n="03" title="Publicité" keyword="portée." icon={ICON.broadcast} seed="v4p3" grid="perspective" fx={<ReachFx />} />,
    exit: { presentation: zoomPunch(), timing: timing(18) },
  },
  { id: "fusion", duration: 150, element: <Fusion />, exit: { presentation: glitchSlice(), timing: timing(14, (t) => t) } },
  { id: "question", duration: 170, element: <Question />, exit: { presentation: copperSweep(), timing: timing(20) } },
  { id: "end", duration: END_CARD_DURATION, element: <EndCard /> },
];

export const V4_DURATION = seriesDuration(SCENES);
const starts = sceneStarts(SCENES);

export const V4AllTogether: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <SceneSeries scenes={SCENES} />
    <BrandLogo variant="fusion" handoff={64} hideAt={starts.end} />
  </AbsoluteFill>
);
