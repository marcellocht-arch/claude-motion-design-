import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { C, EASE, F, GRAD, H, W } from "../theme";
import { beatPulse, CLAMP, pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, Letters, Odometer, Tag, Typewriter, useCount, Words } from "../components/Kinetic";
import { Burst, Dust, Flash, Ring } from "../components/Particles";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo, copperTextStyle } from "../components/Logo";
import { END_CARD_DURATION, EndCard } from "../components/EndCard";
import { Scene, SceneSeries, sceneStarts, seriesDuration } from "../components/SceneSeries";
import { glitchSlice, inkDrop, spinZoom, splitDoors, swipeUp, timing } from "../transitions";

// ─── UI building blocks ─────────────────────────────────────────────────────

const timecode = (frame: number) => {
  const s = Math.floor(frame / 30);
  const f = frame % 30;
  return `00:00:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
};

const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => (
  <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,1) 0 1px, transparent 1px 5px)", opacity, pointerEvents: "none" }} />
);

const Brackets: React.FC<{ x: number; y: number; w: number; h: number; color?: string; len?: number; thick?: number; style?: React.CSSProperties }> = ({
  x,
  y,
  w,
  h,
  color = C.ivory,
  len = 70,
  thick = 5,
  style,
}) => {
  const corner = (cx: number, cy: number, sx: number, sy: number) => (
    <path d={`M${cx} ${cy + sy * len} L${cx} ${cy} L${cx + sx * len} ${cy}`} fill="none" stroke={color} strokeWidth={thick} strokeLinecap="square" />
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>
      {corner(x, y, 1, 1)}
      {corner(x + w, y, -1, 1)}
      {corner(x, y + h, 1, -1)}
      {corner(x + w, y + h, -1, -1)}
    </svg>
  );
};

const RecLabel: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 34 }) => {
  const frame = useCurrentFrame();
  const on = Math.floor(frame / 15) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 14, fontFamily: F.mono, fontWeight: 700, fontSize: size, color: C.ivory, letterSpacing: "0.12em" }}>
      <div style={{ width: size * 0.6, height: size * 0.6, borderRadius: "50%", background: C.copperLight, opacity: on ? 1 : 0.25, boxShadow: on ? `0 0 20px ${C.copperLight}` : "none" }} />
      REC
    </div>
  );
};

const Phone: React.FC<{ children: React.ReactNode; width?: number; style?: React.CSSProperties }> = ({ children, width = 480, style }) => {
  const h = width * 2.05;
  return (
    <div
      style={{
        position: "relative",
        width,
        height: h,
        borderRadius: width * 0.13,
        background: "#05090F",
        padding: width * 0.035,
        boxShadow: `0 50px 120px rgba(0,0,0,0.6), 0 0 0 3px #2B3A4D, 0 0 80px rgba(200,121,65,0.25)`,
        ...style,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: width * 0.1, overflow: "hidden", background: C.deep }}>
        {children}
        <div style={{ position: "absolute", top: width * 0.03, left: "50%", width: width * 0.28, height: width * 0.07, marginLeft: -width * 0.14, borderRadius: 99, background: "#05090F" }} />
      </div>
    </div>
  );
};

/** A fake vertical-video UI shown inside the phone. */
const ReelScreen: React.FC<{ label: string; tint: string; seed: string; progress: number }> = ({ label, tint, seed, progress }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 30% 20%, ${tint}, ${C.deep} 70%)` }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${20 + random(`${seed}${i}`) * 50}%`,
            top: `${20 + i * 22}%`,
            width: 140 + i * 40,
            height: 140 + i * 40,
            borderRadius: "50%",
            background: i === 1 ? C.copperLight : C.ivory,
            opacity: 0.12,
            transform: `translateY(${Math.sin(frame / 12 + i) * 20}px)`,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%,-50%)" }}>
        <DrawIcon paths={ICON.face} progress={1} size={150} color={C.ivory} width={5} />
      </div>
      <div style={{ position: "absolute", right: 22, bottom: 140, display: "flex", flexDirection: "column", gap: 28, alignItems: "center" }}>
        {[ICON.heart, ICON.message, ICON.arrowUp].map((ic, i) => (
          <div key={i} style={{ transform: `scale(${1 + (i === 0 ? beatPulse(frame) * 0.25 : 0)})` }}>
            <DrawIcon paths={ic} progress={1} size={44} color={i === 0 ? C.copperLight : C.ivory} width={7} fill={i === 0 ? C.copperLight : undefined} fillOpacity={1} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 24, bottom: 70, fontFamily: F.grotesk, fontWeight: 800, fontSize: 30, color: C.ivory }}>@elv8co</div>
      <div style={{ position: "absolute", left: 24, bottom: 34, fontFamily: F.mono, fontSize: 20, color: C.ivoryDim, letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: "rgba(255,255,255,0.2)" }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", background: C.copperLight }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scenes ────────────────────────────────────────────────────────────────

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const b = ramp(frame, [0, 16], [1.6, 1], EASE.out);
  const bw = 820 * b;
  const bh = 520 * b;
  return (
    <SceneFrame seed="v2intro" variant="deep" dur={80} zoom={[1.05, 1]} grid>
      <Scanlines />
      <Brackets x={W / 2 - bw / 2} y={H * 0.47 - bh / 2 + 20} w={bw} h={bh} color={C.ivory} style={{ opacity: ramp(frame, [0, 8], [0, 0.9]) }} />
      {/* rule-of-thirds */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.12 * ramp(frame, [6, 20], [0, 1]) }}>
        {[1, 2].map((i) => (
          <React.Fragment key={i}>
            <line x1={(W / 3) * i} y1={0} x2={(W / 3) * i} y2={H} stroke={C.ivory} strokeWidth={2} />
            <line x1={0} y1={(H / 3) * i} x2={W} y2={(H / 3) * i} stroke={C.ivory} strokeWidth={2} />
          </React.Fragment>
        ))}
      </svg>
      <RecLabel x={110} y={300} />
      <div style={{ position: "absolute", right: 110, top: 302, fontFamily: F.mono, fontWeight: 500, fontSize: 32, color: C.ivory }}>{timecode(frame)}</div>
      <div style={{ position: "absolute", left: 110, bottom: 330, fontFamily: F.mono, fontSize: 26, color: C.ivoryDim, letterSpacing: "0.2em" }}>4K · 30 FPS · 9:16</div>
      <div style={{ position: "absolute", right: 110, bottom: 330, display: "flex", gap: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 16, height: 30, background: i < 3 ? C.ivory : "transparent", border: `2px solid ${C.ivory}` }} />
        ))}
      </div>
    </SceneFrame>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const half = ramp(frame, [8, 40], [0, 180], EASE.inOut);
  const clockOut = ramp(frame, [50, 60], [0, 1], EASE.in);
  const cells = 30;
  return (
    <SceneFrame seed="v2hook" variant="deep" dur={140} zoom={[1, 1.05]}>
      <Scanlines opacity={0.03} />
      <At y={280}>
        <Words lines={["Une"]} delay={0} mode="rise" exitAt={46} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 110, color: C.ivory }} />
      </At>
      <At y={400}>
        <Letters text="DEMI-JOURNÉE." delay={4} stagger={1.3} mode="rise" style={{ fontFamily: F.condensed, fontSize: 150, color: C.ivory, lineHeight: 1, opacity: 1 - clockOut }} />
      </At>
      {/* clock */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - 260,
          top: 700,
          width: 520,
          height: 520,
          transform: `scale(${pop(frame, fps, 2, SPRING.bouncy) * (1 - clockOut * 0.6)}) rotate(${clockOut * 90}deg)`,
          opacity: 1 - clockOut,
        }}
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `4px solid ${C.ivory}33` }} />
        <div style={{ position: "absolute", inset: 18, borderRadius: "50%", background: `conic-gradient(${C.copper} 0deg, ${C.copperLight} ${half}deg, transparent ${half}deg)`, opacity: 0.9 }} />
        {new Array(12).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 257, top: 6, width: 6, height: 30, background: C.ivory, transformOrigin: "3px 254px", transform: `rotate(${i * 30}deg)`, opacity: 0.7 }} />
        ))}
        <div style={{ position: "absolute", left: 255, top: 60, width: 10, height: 200, borderRadius: 5, background: C.ivory, transformOrigin: "5px 200px", transform: `rotate(${half}deg)` }} />
        <div style={{ position: "absolute", left: 240, top: 240, width: 40, height: 40, borderRadius: "50%", background: C.ivory }} />
      </div>
      {/* month of content */}
      <Sequence from={60} layout="none">
        <MonthGrid cells={cells} />
      </Sequence>
    </SceneFrame>
  );
};

const MonthGrid: React.FC<{ cells: number }> = ({ cells }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const size = 150;
  const gap = 14;
  const cols = 6;
  const gw = cols * size + (cols - 1) * gap;
  return (
    <>
      <At y={280}>
        <Words lines={["Un mois"]} delay={0} mode="drop" style={{ fontFamily: F.condensed, fontSize: 150, color: C.ivory, lineHeight: 1 }} />
      </At>
      <At y={440}>
        <Words lines={["*de contenu.*"]} delay={6} mode="blur" style={{ fontSize: 140 }} />
      </At>
      <div style={{ position: "absolute", left: (W - gw) / 2, top: 700, width: gw, display: "flex", flexWrap: "wrap", gap }}>
        {new Array(cells).fill(0).map((_, i) => {
          const d = 4 + i * 0.9;
          const s = pop(frame, fps, d, SPRING.snappy);
          const lit = ramp(frame, [d + 4, d + 10], [0, 1]);
          const isVideo = i % 7 === 1 || i % 7 === 4;
          return (
            <div
              key={i}
              style={{
                width: size,
                height: size * 0.8,
                borderRadius: 18,
                background: isVideo ? GRAD.copper : "rgba(243,238,230,0.08)",
                border: `2px solid ${isVideo ? C.copperLight : "rgba(243,238,230,0.18)"}`,
                transform: `scale(${s}) rotate(${(1 - s) * 30}deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <span style={{ position: "absolute", top: 8, left: 12, fontFamily: F.mono, fontSize: 20, color: isVideo ? C.deep : C.ivoryDim }}>{i + 1}</span>
              {isVideo ? <DrawIcon paths={ICON.play} progress={lit} size={50} color={C.deep} width={8} fill={C.deep} fillOpacity={1} /> : null}
            </div>
          );
        })}
      </div>
    </>
  );
};

const Script: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: W / 2 - 360, top: 360, width: 720, height: 560, transform: `rotate(${interpolate(frame, [0, 50], [-6, -2])}deg)` }}>
      <div style={{ position: "absolute", inset: 0, background: C.ivory, borderRadius: 16, padding: 48, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
        <Typewriter text="SCÈNE 1 — ATELIER" start={2} cps={30} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: C.deep }} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ marginTop: 26, height: 18, borderRadius: 9, background: i === 2 ? C.copper : `${C.deep}33`, width: `${ramp(frame, [8 + i * 4, 18 + i * 4], [0, [92, 70, 84, 60, 88, 40][i]])}%` }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: -40, top: 250 + Math.sin(frame / 3) * 40, transform: `translateX(${Math.cos(frame / 4) * 60}px)` }}>
        <DrawIcon paths={ICON.pen} progress={1} size={130} color={C.copper} width={6} fill={C.copperLight} fillOpacity={0.4} />
      </div>
    </div>
  );
};

const Viewfinder: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = 1 + 0.15 * Math.exp(-frame / 6) * Math.cos(frame);
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 340, width: 800, height: 620, borderRadius: 12, overflow: "hidden", background: `radial-gradient(90% 90% at 40% 30%, ${C.night}, ${C.abyss})` }}>
        <div style={{ position: "absolute", left: "50%", top: "52%", transform: `translate(-50%,-50%) scale(${1 + frame * 0.004})`, filter: `blur(${ramp(frame, [0, 14], [10, 0])}px)` }}>
          <DrawIcon paths={ICON.face} progress={1} size={320} color={C.copperLight} width={3} />
        </div>
        <div style={{ position: "absolute", left: "50%", top: "44%", width: 200, height: 200, marginLeft: -100, marginTop: -100, border: `3px solid ${C.copperLight}`, transform: `scale(${focus})` }} />
      </div>
      <Brackets x={120} y={320} w={840} h={660} color={C.ivory} len={60} />
      <RecLabel x={180} y={370} size={30} />
      <div style={{ position: "absolute", right: 180, top: 372, fontFamily: F.mono, fontSize: 28, color: C.ivory }}>{timecode(frame + 212)}</div>
    </>
  );
};

const Timeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tracks = [
    [0, 180, 300, 520],
    [60, 260, 420, 610],
    [20, 380, 560],
  ];
  const head = interpolate(frame, [4, 50], [80, 900], CLAMP);
  return (
    <div style={{ position: "absolute", left: 90, top: 380, width: 900, height: 560 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "rgba(5,9,15,0.7)", border: `2px solid ${C.ivory}22` }} />
      {tracks.map((clips, t) => (
        <div key={t} style={{ position: "absolute", left: 30, right: 30, top: 70 + t * 150, height: 110, borderRadius: 10, background: "rgba(243,238,230,0.05)" }}>
          {clips.map((x, i) => {
            const s = pop(frame, fps, 2 + t * 4 + i * 3, SPRING.snappy);
            const wClip = 150 + ((t + i) % 3) * 40;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x * 1.25 * s + (1 - s) * 900,
                  top: 10,
                  width: Math.min(wClip, 840 - x),
                  height: 90,
                  borderRadius: 8,
                  background: t === 1 ? GRAD.copper : t === 0 ? `linear-gradient(135deg, ${C.steel}, ${C.night})` : `repeating-linear-gradient(90deg, ${C.copperLight}99 0 4px, transparent 4px 10px)`,
                  border: `2px solid ${t === 1 ? C.copperLight : C.ivory}44`,
                  opacity: s > 0.02 ? 1 : 0,
                }}
              />
            );
          })}
        </div>
      ))}
      <div style={{ position: "absolute", left: head, top: 20, bottom: 20, width: 4, background: C.copperLight, boxShadow: `0 0 20px ${C.copperLight}` }}>
        <div style={{ position: "absolute", top: -14, left: -12, width: 28, height: 20, background: C.copperLight, clipPath: "polygon(0 0,100% 0,50% 100%)" }} />
      </div>
      <div style={{ position: "absolute", right: 30, top: -60, transform: `rotate(${Math.sin(frame / 2) * 20}deg)` }}>
        <DrawIcon paths={ICON.scissors} progress={ramp(frame, [6, 24], [0, 1])} size={90} color={C.ivory} width={6} />
      </div>
    </div>
  );
};

const METHOD = [
  { word: "ÉCRIT.", visual: <Script /> },
  { word: "FILMÉ.", visual: <Viewfinder /> },
  { word: "MONTÉ.", visual: <Timeline /> },
];

const Method: React.FC = () => {
  const frame = useCurrentFrame();
  const STEP = 50;
  return (
    <SceneFrame seed="v2method" variant="deep" dur={150} zoom={[1, 1]} grid>
      <Scanlines opacity={0.03} />
      {METHOD.map((m, i) => (
        <Sequence key={m.word} from={i * STEP} durationInFrames={STEP} layout="none">
          <MethodBeat word={m.word} index={i}>
            {m.visual}
          </MethodBeat>
        </Sequence>
      ))}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 1560,
            left: W / 2 - 150 + i * 110,
            width: 80,
            height: 8,
            borderRadius: 4,
            background: frame >= i * STEP ? C.copperLight : `${C.ivory}33`,
          }}
        />
      ))}
      <Flash at={STEP} max={0.35} duration={6} />
      <Flash at={STEP * 2} max={0.35} duration={6} />
    </SceneFrame>
  );
};

const MethodBeat: React.FC<{ word: string; index: number; children: React.ReactNode }> = ({ word, index, children }) => {
  const frame = useCurrentFrame();
  const punch = interpolate(frame, [0, 8], [1.25, 1], { ...CLAMP, easing: EASE.out });
  return (
    <AbsoluteFill style={{ transform: `scale(${punch})` }}>
      <div style={{ position: "absolute", left: 90, top: 270, fontFamily: F.mono, fontWeight: 700, fontSize: 32, color: C.copperLight, letterSpacing: "0.2em" }}>
        0{index + 1} / 03
      </div>
      {children}
      <At y={1070}>
        <Letters
          text={word}
          delay={2}
          stagger={1.5}
          mode={index === 1 ? "flip" : index === 2 ? "drop" : "rise"}
          style={{ fontFamily: F.condensed, fontSize: 330, lineHeight: 1 }}
          letterStyle={index === 1 ? copperTextStyle : { color: C.ivory }}
        />
      </At>
    </AbsoluteFill>
  );
};

const PLATFORMS = [
  { name: "Instagram.", tint: "#6B3A5A", x: 60, y: 520, from: -1 },
  { name: "Facebook.", tint: "#1F3F6E", x: 620, y: 820, from: 1 },
  { name: "LinkedIn.", tint: "#0F4C6B", x: 60, y: 1120, from: -1 },
];

const Distribution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const screenIdx = Math.min(2, Math.floor(frame / 30));
  const phase2 = ramp(frame, [92, 110], [0, 1], EASE.inOut);
  const phoneS = pop(frame, fps, 0, SPRING.soft);
  return (
    <SceneFrame seed="v2dist" dur={160} zoom={[1, 1.04]}>
      <Dust count={24} seed="v2dist" />
      <div
        style={{
          position: "absolute",
          left: W / 2 - 230,
          top: 430,
          transform: `translate(${-phase2 * 230}px, ${(1 - phoneS) * 900 + phase2 * 120}px) scale(${1 - phase2 * 0.18}) rotate(${interpolate(frame, [0, 90], [-4, 3], CLAMP) * (1 - phase2)}deg)`,
        }}
      >
        <Phone width={460}>
          {PLATFORMS.map((p, i) => {
            const t = interpolate(frame, [i * 30 - 6, i * 30 + 4], [1, 0], { ...CLAMP, easing: EASE.snap });
            return (
              <AbsoluteFill key={p.name} style={{ transform: `translateY(${i === 0 ? 0 : t * 100}%)`, opacity: i <= screenIdx ? 1 : 0 }}>
                <ReelScreen label={p.name.replace(".", "").toUpperCase()} tint={p.tint} seed={p.name} progress={((frame - i * 30) % 60) / 60} />
              </AbsoluteFill>
            );
          })}
        </Phone>
      </div>
      {/* platform chips */}
      {PLATFORMS.map((p, i) => {
        const d = 4 + i * 30;
        const s = pop(frame, fps, d, SPRING.bouncy);
        const out = phase2;
        return (
          <div
            key={p.name}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              padding: "22px 36px",
              borderRadius: 999,
              background: i === screenIdx ? GRAD.copper : "rgba(13,27,42,0.85)",
              border: `2px solid ${C.copperLight}`,
              fontFamily: F.grotesk,
              fontWeight: 900,
              fontSize: 64,
              color: i === screenIdx ? C.deep : C.ivory,
              transform: `translateX(${(1 - s) * p.from * 700 + out * p.from * 900}px) rotate(${(1 - s) * p.from * 10}deg)`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            }}
          >
            {p.name}
          </div>
        );
      })}
      {/* phase 2 : one video per week */}
      <Sequence from={96} layout="none">
        <Weekly />
      </Sequence>
    </SceneFrame>
  );
};

const Weekly: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <At y={270}>
        <Words lines={["Une vidéo"]} delay={0} mode="rise" style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 100, color: C.ivory, letterSpacing: "-0.03em" }} />
      </At>
      <At y={390}>
        <Words lines={["*par semaine.*"]} delay={5} mode="blur" style={{ fontSize: 120 }} />
      </At>
      <div style={{ position: "absolute", left: 600, top: 640, display: "flex", flexDirection: "column", gap: 24 }}>
        {[1, 2, 3, 4].map((wk, i) => {
          const s = pop(frame, fps, 6 + i * 8, SPRING.bouncy);
          return (
            <div
              key={wk}
              style={{
                width: 400,
                height: 150,
                borderRadius: 24,
                background: "rgba(13,27,42,0.85)",
                border: `2px solid ${C.copper}`,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "0 28px",
                transform: `translateX(${(1 - s) * 500}px)`,
              }}
            >
              <div style={{ width: 90, height: 90, borderRadius: 18, background: GRAD.copper, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + beatPulse(frame, 6 + i * 8) * 0.1})` }}>
                <DrawIcon paths={ICON.play} progress={1} size={44} color={C.deep} width={8} fill={C.deep} fillOpacity={1} />
              </div>
              <div>
                <div style={{ fontFamily: F.mono, fontSize: 24, color: C.copperLight, letterSpacing: "0.2em" }}>SEMAINE</div>
                <div style={{ fontFamily: F.condensed, fontSize: 64, color: C.ivory, lineHeight: 1 }}>0{wk}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const Promesse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const target = pop(frame, fps, 70, SPRING.bouncy);
  const arrowX = interpolate(frame, [62, 72], [-700, 0], { ...CLAMP, easing: EASE.in });
  return (
    <SceneFrame seed="v2promise" dur={120} zoom={[1.05, 1]}
      back={
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 360, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: 0.35 }}>
          {new Array(40).fill(0).map((_, i) => {
            const h = 40 + 280 * Math.abs(Math.sin(i * 0.7 + frame * 0.25)) * (0.4 + 0.6 * beatPulse(frame, i % 4, 4));
            return <div key={i} style={{ width: 16, height: h, borderRadius: 8, background: i % 3 ? C.copper : C.ivory }} />;
          })}
        </div>
      }
    >
      <At y={430}>
        <div style={{ transform: `scale(${1 + beatPulse(frame, 6) * 0.05})` }}>
          <Letters text="RYTHMÉ." delay={4} stagger={1.5} mode="drop" style={{ fontFamily: F.condensed, fontSize: 250, color: C.ivory, lineHeight: 1 }} />
        </div>
      </At>
      <At y={780}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: "-40px -80px", background: `radial-gradient(closest-side, ${C.copper}55, transparent)`, opacity: ramp(frame, [36, 60], [0, 1]) }} />
          <Words lines={["*Sincère.*"]} delay={34} mode="blur" style={{ fontSize: 250, lineHeight: 1.05 }} />
        </div>
      </At>
      <At y={1120}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Words lines={["Efficace."]} delay={64} mode="slide" style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 150, color: C.ivory, letterSpacing: "-0.04em" }} />
          <div style={{ position: "relative", width: 150, height: 150, transform: `scale(${target})` }}>
            <DrawIcon paths={ICON.target} progress={target} size={150} color={C.copperLight} width={6} />
            <div style={{ position: "absolute", left: 75 + arrowX, top: 71, width: 120, height: 8, background: C.ivory, transform: "translateX(-100%)", opacity: frame > 62 ? 1 : 0 }} />
          </div>
        </div>
      </At>
      <Ring at={72} x={W / 2 + 330} y={1195} size={420} />
    </SceneFrame>
  );
};

const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const LAND = 86;
  const { value, velocity } = useCount(0, 100000, 8, LAND, EASE.out);
  const punch = frame >= LAND ? 1 + 0.08 * Math.exp(-(frame - LAND) / 5) * Math.cos((frame - LAND) * 0.8) : 1;
  const graph = ramp(frame, [8, LAND], [0, 1], EASE.out);
  const pts = new Array(21).fill(0).map((_, i) => {
    const x = (i / 20) * W;
    const y = 1820 - Math.pow(i / 20, 2.2) * 900 - Math.sin(i * 1.7) * 30;
    return [x, y];
  });
  const shown = pts.filter((_, i) => i / 20 <= graph);
  const line = shown.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const pops = [
    { icon: ICON.heart, x: 110, y: 560, d: 20 },
    { icon: ICON.eye, x: 860, y: 640, d: 32 },
    { icon: ICON.message, x: 70, y: 1330, d: 44 },
    { icon: ICON.heart, x: 900, y: 1330, d: 56 },
    { icon: ICON.arrowUp, x: 480, y: 480, d: 66 },
  ];
  return (
    <SceneFrame seed="v2proof" dur={200} zoom={[1, 1.06]} glow={1.3}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 1 - 0.6 * ramp(frame, [LAND + 6, LAND + 24], [0, 1]) }}>
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.copper} stopOpacity={0.45} />
            <stop offset="1" stopColor={C.copper} stopOpacity={0} />
          </linearGradient>
        </defs>
        {shown.length > 1 ? (
          <>
            <path d={`${line} L${shown[shown.length - 1][0]} 1920 L0 1920 Z`} fill="url(#area)" />
            <path d={line} fill="none" stroke={C.copperLight} strokeWidth={6} />
          </>
        ) : null}
      </svg>
      {pops.map((p, i) => {
        const s = pop(frame, fps, p.d, SPRING.bouncy);
        const fl = Math.sin((frame - p.d) / 10) * 12;
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y + fl, width: 110, height: 110, borderRadius: 28, background: "rgba(13,27,42,0.9)", border: `2px solid ${C.copper}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})` }}>
            <DrawIcon paths={p.icon} progress={1} size={56} color={C.copperLight} width={7} fill={i % 2 ? undefined : C.copperLight} fillOpacity={1} />
          </div>
        );
      })}
      <At y={700}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${punch})` }}>
          <DrawIcon paths={ICON.eye} progress={ramp(frame, [0, 16], [0, 1])} size={120} color={C.ivory} width={5} />
          <div style={{ display: "flex", alignItems: "flex-start", marginTop: 10, color: C.copperLight, textShadow: `0 0 60px ${C.copper}88` }}>
            <span style={{ fontFamily: F.condensed, fontSize: 240, lineHeight: 1, marginRight: 12 }}>+</span>
            <Odometer value={value} final={100000} velocity={velocity} style={{ fontFamily: F.condensed, fontSize: 240 }} />
          </div>
          <Words lines={["*vues cumulées*"]} delay={LAND - 6} mode="blur" style={{ fontSize: 120, marginTop: -4 }} />
        </div>
      </At>
      <Flash at={LAND} max={0.4} color={C.copperLight} />
      <Burst at={LAND} x={W / 2} y={960} count={40} power={700} seed="proof" />
      <Ring at={LAND} x={W / 2} y={960} size={1400} />
      <Sequence from={LAND + 12} layout="none">
        <At y={1300}>
          <div style={{ padding: "14px 34px", borderRadius: 999, background: C.deep, border: `2px solid ${C.copperLight}`, transform: `scale(${pop(frame - LAND - 12, fps, 0, SPRING.bouncy)})` }}>
            <Tag style={{ fontSize: 34 }}>En organique</Tag>
          </div>
        </At>
        <At y={1400}>
          <Words
            lines={["pour un atelier textile", "*de Liège*"]}
            delay={8}
            stagger={3}
            mode="rise"
            style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 60, color: C.ivory, lineHeight: 1.15 }}
            accentStyle={{ ...ACCENT_SERIF, fontSize: 86 }}
          />
        </At>
      </Sequence>
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

const SCENES: Scene[] = [
  { id: "intro", duration: 80, element: <Intro />, exit: { presentation: glitchSlice(), timing: timing(14, (t) => t) } },
  { id: "hook", duration: 140, element: <Hook />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "method", duration: 150, element: <Method />, exit: { presentation: splitDoors({ vertical: true }), timing: timing(20) } },
  { id: "distribution", duration: 160, element: <Distribution />, exit: { presentation: spinZoom(), timing: timing(20) } },
  { id: "promise", duration: 120, element: <Promesse />, exit: { presentation: clockWipe({ width: W, height: H }), timing: timing(20) } },
  { id: "proof", duration: 200, element: <Proof />, exit: { presentation: inkDrop({ x: W / 2, y: 960 }), timing: timing(24) } },
  { id: "end", duration: END_CARD_DURATION, element: <EndCard /> },
];

export const V2_DURATION = seriesDuration(SCENES);
const starts = sceneStarts(SCENES);

export const V2VideoContent: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <SceneSeries scenes={SCENES} />
    <BrandLogo variant="rec" handoff={60} hideAt={starts.end} />
  </AbsoluteFill>
);
