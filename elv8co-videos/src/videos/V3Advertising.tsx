import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { flip } from "@remotion/transitions/flip";
import { wipe } from "@remotion/transitions/wipe";
import { C, EASE, F, GRAD, H, W } from "../theme";
import { beatPulse, CLAMP, pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, Marquee, Odometer, Tag, useCount, Words } from "../components/Kinetic";
import { Burst, Dust, Flash, Ring } from "../components/Particles";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo } from "../components/Logo";
import { END_CARD_DURATION, EndCard } from "../components/EndCard";
import { Scene, SceneSeries, sceneStarts, seriesDuration } from "../components/SceneSeries";
import { glitchSlice, inkDrop, splitDoors, swipeUp, timing } from "../transitions";

const Ticker: React.FC<{ y: number; reverse?: boolean; opacity?: number }> = ({ y, reverse, opacity = 0.35 }) => (
  <At y={y} style={{ opacity }}>
    <Marquee
      text="CIBLAGE · PORTÉE · CLICS · LEADS · CONVERSIONS · BUDGET · "
      reverse={reverse}
      speed={0.3}
      style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 30, letterSpacing: "0.25em", color: C.copperLight }}
    />
  </At>
);

const Coin: React.FC<{ size: number; spin: number; style?: React.CSSProperties }> = ({ size, spin, style }) => {
  const c = Math.cos(spin);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        transform: `scaleX(${Math.max(0.06, Math.abs(c))})`,
        background: c > 0 ? `radial-gradient(circle at 35% 30%, #F7C79C, ${C.copperLight} 35%, ${C.copper} 70%, ${C.copperDark})` : `radial-gradient(circle at 35% 30%, ${C.copperLight}, ${C.copperDark})`,
        boxShadow: `inset 0 0 0 ${size * 0.05}px ${C.copperDark}, inset 0 0 0 ${size * 0.09}px #F2B584, 0 ${size * 0.08}px ${size * 0.2}px rgba(0,0,0,0.45)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.serif,
        fontSize: size * 0.62,
        color: C.copperDark,
        ...style,
      }}
    >
      {c > 0 ? "€" : ""}
    </div>
  );
};

// ─── Scenes ────────────────────────────────────────────────────────────────

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFrame seed="v3intro" variant="deep" grid="perspective" dur={80} zoom={[1.1, 1]}>
      <Ticker y={330} />
      <Ticker y={1480} reverse />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
        {new Array(9).fill(0).map((_, i) => {
          const h = ramp(frame, [i * 2, i * 2 + 20], [0, 60 + ((i * 37) % 90)]);
          return <rect key={i} x={150 + i * 90} y={1380 - h} width={50} height={h} fill={C.copper} />;
        })}
      </svg>
    </SceneFrame>
  );
};

const Stake: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = 22;
  const y = interpolate(frame, [0, land], [-900, 0], { ...CLAMP, easing: EASE.in });
  const bounce = frame > land ? -120 * Math.abs(Math.sin((frame - land) / 5)) * Math.exp(-(frame - land) / 7) : 0;
  const spin = frame < land + 14 ? frame * 0.5 : Math.round(((land + 14) * 0.5) / (Math.PI * 2)) * Math.PI * 2;
  const num = pop(frame, fps, land + 2, SPRING.heavy);
  return (
    <SceneFrame seed="v3stake" variant="deep" dur={110} zoom={[1, 1.06]} grid>
      <Ticker y={1560} opacity={0.2} />
      <At y={280}>
        <Tag style={{ fontSize: 34 }}>La mise</Tag>
      </At>
      <At y={420}>
        <div style={{ transform: `translateY(${y + bounce}px)` }}>
          <Coin size={320} spin={spin} />
        </div>
      </At>
      <Ring at={land} x={W / 2} y={740} size={900} />
      <Burst at={land} x={W / 2} y={740} count={20} power={420} seed="stake" />
      <At y={820}>
        <div style={{ fontFamily: F.condensed, fontSize: 400, lineHeight: 1, color: C.ivory, transform: `scale(${num}) translateY(${(1 - num) * 200}px)`, opacity: num > 0.01 ? 1 : 0 }}>20 €</div>
      </At>
      <At y={1250}>
        <Words lines={["*de publicité*"]} delay={land + 12} mode="blur" stagger={4} style={{ fontSize: 130 }} />
      </At>
    </SceneFrame>
  );
};

const Revenue: React.FC = () => {
  const frame = useCurrentFrame();
  const { value, velocity } = useCount(20, 780, 6, 60, EASE.out);
  const bars = [0.18, 0.26, 0.22, 0.4, 0.52, 0.7, 1];
  return (
    <SceneFrame seed="v3rev" dur={120} zoom={[1.05, 1]}>
      <div style={{ position: "absolute", left: 90, right: 90, bottom: 330, height: 640, display: "flex", alignItems: "flex-end", gap: 26, opacity: 0.55 }}>
        {bars.map((b, i) => {
          const h = ramp(frame, [4 + i * 4, 30 + i * 5], [0, b]);
          return (
            <div key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: "14px 14px 0 0", background: i === bars.length - 1 ? GRAD.copper : `linear-gradient(180deg, ${C.steel}, ${C.night})` }} />
          );
        })}
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {(() => {
          const d = "M120 1560 L300 1470 L470 1500 L640 1340 L820 1230 L960 1090";
          const p = ramp(frame, [10, 60], [0, 1], EASE.inOut);
          const len = 1400;
          return (
            <>
              <path d={d} fill="none" stroke={C.ivory} strokeWidth={8} strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
              <circle cx={960} cy={1090} r={18 * ramp(frame, [58, 64], [0, 1])} fill={C.ivory} />
            </>
          );
        })()}
      </svg>
      <At y={280}>
        <Tag style={{ fontSize: 34 }}>Le résultat</Tag>
      </At>
      <At y={400}>
        <div style={{ display: "flex", alignItems: "flex-start", transform: `scale(${1 + (frame >= 60 ? 0.08 * Math.exp(-(frame - 60) / 5) : 0)})` }}>
          <Odometer value={value} final={780} velocity={velocity} style={{ fontFamily: F.condensed, fontSize: 380, color: C.ivory }} />
          <span style={{ fontFamily: F.condensed, fontSize: 380, lineHeight: 1, color: C.copperLight, marginLeft: 20 }}>€</span>
        </div>
      </At>
      <At y={820}>
        <Words lines={["de chiffre", "d'affaires"]} delay={14} stagger={3} mode="rise" style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 110, color: C.ivory, lineHeight: 1.02, letterSpacing: "-0.03em" }} />
      </At>
      <Flash at={60} max={0.3} color={C.copperLight} />
    </SceneFrame>
  );
};

const Multiplier: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 4, SPRING.heavy);
  const shake = frame > 10 && frame < 26 ? Math.sin(frame * 3.1) * 14 * Math.exp(-(frame - 10) / 6) : 0;
  return (
    <SceneFrame seed="v3mult" variant="copper" dur={125} zoom={[1, 1.08]} glow={0.8}>
      <AbsoluteFill style={{ opacity: 0.25 }}>
        <div
          style={{
            position: "absolute",
            left: W / 2 - 1300,
            top: 860 - 1300,
            width: 2600,
            height: 2600,
            background: `repeating-conic-gradient(from ${frame * 0.8}deg, ${C.ivory} 0deg 5deg, transparent 5deg 15deg)`,
            maskImage: "radial-gradient(circle, black 0%, transparent 60%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 60%)",
          }}
        />
      </AbsoluteFill>
      {/* raining coins */}
      {new Array(14).fill(0).map((_, i) => {
        const t = frame - 8 - random(`cd${i}`) * 50;
        if (t < 0) return null;
        const x = random(`cx${i}`) * W;
        const yy = -200 + t * (18 + random(`cv${i}`) * 10);
        return (
          <div key={i} style={{ position: "absolute", left: x - 50, top: yy, transform: `rotate(${t * 4}deg)`, opacity: 0.9 }}>
            <Coin size={70 + random(`cs${i}`) * 50} spin={t * 0.3 + i} />
          </div>
        );
      })}
      <At y={500}>
        <div
          style={{
            fontFamily: F.condensed,
            fontSize: 600,
            lineHeight: 1,
            color: C.deep,
            transform: `translateX(${shake}px) scale(${0.3 + 0.7 * s}) rotate(${(1 - s) * -12}deg)`,
            opacity: s > 0.01 ? 1 : 0,
            textShadow: `0 30px 80px rgba(13,27,42,0.45)`,
            letterSpacing: "-0.02em",
          }}
        >
          39×
        </div>
      </At>
      <At y={1250}>
        <Words lines={["*la mise.*"]} delay={20} mode="drop" stagger={4} style={{ fontSize: 190 }} accentStyle={{ ...ACCENT_SERIF, backgroundImage: "none", color: C.ivory }} />
      </At>
      <Ring at={10} x={W / 2} y={860} size={1500} color={C.ivory} width={10} />
      <Ring at={16} x={W / 2} y={860} size={1100} color={C.deep} width={6} />
      <Flash at={9} max={0.6} />
      <Burst at={10} x={W / 2} y={860} count={36} power={800} seed="mult" color={C.ivory} />
    </SceneFrame>
  );
};

const PostCard: React.FC<{ scale?: number; highlight?: boolean }> = ({ scale = 1, highlight }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width: 220 * scale,
        height: 300 * scale,
        borderRadius: 22 * scale,
        background: highlight ? `linear-gradient(160deg, ${C.night}, ${C.deep})` : "rgba(26,46,69,0.9)",
        border: `${2 * scale}px solid ${highlight ? C.copperLight : "rgba(243,238,230,0.25)"}`,
        boxShadow: highlight ? `0 0 60px ${C.copper}88` : "0 20px 40px rgba(0,0,0,0.35)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", inset: `${14 * scale}px ${14 * scale}px ${80 * scale}px`, borderRadius: 12 * scale, background: GRAD.copper, opacity: highlight ? 1 : 0.5 }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
          <DrawIcon paths={ICON.play} progress={1} size={60 * scale} color={C.deep} width={8} fill={C.deep} fillOpacity={1} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 16 * scale, bottom: 26 * scale, display: "flex", gap: 10 * scale, alignItems: "center" }}>
        <div style={{ transform: `scale(${1 + beatPulse(frame) * 0.3})` }}>
          <DrawIcon paths={ICON.heart} progress={1} size={34 * scale} color={C.copperLight} width={8} fill={C.copperLight} fillOpacity={1} />
        </div>
        <div style={{ width: 90 * scale, height: 12 * scale, borderRadius: 6 * scale, background: "rgba(243,238,230,0.3)" }} />
      </div>
    </div>
  );
};

const Amplify: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spread = ramp(frame, [60, 100], [0, 1], EASE.out);
  const vol = ramp(frame, [40, 110], [0.2, 1], EASE.inOut);
  const cx = W / 2;
  const cy = 1090;
  return (
    <SceneFrame seed="v3amp" dur={170} zoom={[1, 1.05]}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Ring key={i} at={20 + i * 16} x={cx} y={cy} size={1500} duration={40} width={4} color={i % 2 ? C.ivory : C.copperLight} />
      ))}
      {/* copies fanning out */}
      {[-1, 0, 1].flatMap((gy) =>
        [-1, 0, 1].map((gx) => {
          if (gx === 0 && gy === 0) return null;
          const k = (gx + 1) * 3 + gy + 1;
          const s = pop(frame, fps, 60 + k * 2, SPRING.snappy);
          return (
            <div
              key={`${gx}${gy}`}
              style={{ position: "absolute", left: cx - 110 + gx * 290 * spread, top: cy - 150 + gy * 300 * spread, transform: `scale(${0.6 + 0.4 * s}) rotate(${gx * 4 * spread}deg)`, opacity: s }}
            >
              <PostCard />
            </div>
          );
        }),
      )}
      <div style={{ position: "absolute", left: cx - 110, top: cy - 150, transform: `scale(${pop(frame, fps, 4, SPRING.bouncy) * (1.25 - 0.25 * spread)})` }}>
        <PostCard highlight />
      </div>
      <At y={270}>
        <Words
          lines={["On amplifie", "ce qui fonctionne", "*déjà.*"]}
          delay={2}
          stagger={3}
          mode="flip"
          style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 104, color: C.ivory, lineHeight: 1.02, letterSpacing: "-0.03em" }}
          lineStyles={[undefined, undefined, { fontSize: 140 }]}
        />
      </At>
      {/* volume slider */}
      <div style={{ position: "absolute", left: 140, right: 140, top: 1560, height: 14, borderRadius: 7, background: "rgba(243,238,230,0.15)" }}>
        <div style={{ width: `${vol * 100}%`, height: "100%", borderRadius: 7, background: GRAD.copper }} />
        <div style={{ position: "absolute", left: `${vol * 100}%`, top: -18, width: 50, height: 50, marginLeft: -25, borderRadius: "50%", background: C.ivory, boxShadow: `0 0 30px ${C.copperLight}` }} />
      </div>
    </SceneFrame>
  );
};

// Benefits — a horizontal carousel of three panels
const Targeting: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = 9;
  const rows = 7;
  const tx = interpolate(frame, [0, 22, 34], [200, 700, 600], { ...CLAMP, easing: EASE.inOut });
  const ty = interpolate(frame, [0, 22, 34], [900, 520, 640], { ...CLAMP, easing: EASE.inOut });
  const lock = ramp(frame, [34, 42], [0, 1]);
  return (
    <>
      {new Array(cols * rows).fill(0).map((_, i) => {
        const x = 140 + (i % cols) * 100;
        const y = 340 + Math.floor(i / cols) * 100;
        const d = Math.hypot(x - 600, y - 640);
        const hit = d < 170 && lock > 0;
        return (
          <div key={i} style={{ position: "absolute", left: x - 22, top: y - 22, width: 44, height: 44 }}>
            <DrawIcon paths={[ICON.face[0]]} progress={1} size={44} color={hit ? C.copperLight : "rgba(243,238,230,0.3)"} width={hit ? 10 : 7} fill={hit ? C.copperLight : undefined} fillOpacity={lock} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: tx - 190, top: ty - 190, transform: `scale(${1 - lock * 0.1}) rotate(${frame * 2 * (1 - lock)}deg)` }}>
        <DrawIcon paths={ICON.target} progress={1} size={380} color={C.copperLight} width={2.5} />
      </div>
      <Ring at={40} x={600} y={640} size={600} />
    </>
  );
};

const Budget: React.FC = () => {
  const frame = useCurrentFrame();
  const needle = interpolate(frame, [0, 40], [-80, 10], { ...CLAMP, easing: EASE.back }) + Math.sin(frame / 6) * 3;
  return (
    <>
      <div style={{ position: "absolute", left: W / 2 - 330, top: 330, width: 660, height: 660 }}>
        <svg viewBox="0 0 200 200" width={660} height={660}>
          <path d="M20 130 A80 80 0 0 1 180 130" fill="none" stroke="rgba(243,238,230,0.15)" strokeWidth={16} strokeLinecap="round" />
          <path d="M20 130 A80 80 0 0 1 120 52" fill="none" stroke={C.copper} strokeWidth={16} strokeLinecap="round" strokeDasharray={200} strokeDashoffset={200 * (1 - ramp(frame, [0, 30], [0, 1]))} />
          {new Array(11).fill(0).map((_, i) => {
            const a = Math.PI + (i / 10) * Math.PI * 0.84 + 0.25;
            return <line key={i} x1={100 + Math.cos(a) * 62} y1={130 + Math.sin(a) * 62} x2={100 + Math.cos(a) * 70} y2={130 + Math.sin(a) * 70} stroke={C.ivory} strokeWidth={2} opacity={0.6} />;
          })}
          <g transform={`rotate(${needle} 100 130)`}>
            <path d="M97 130 L100 62 L103 130 Z" fill={C.ivory} />
          </g>
          <circle cx={100} cy={130} r={10} fill={C.copperLight} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: W / 2 - 250, top: 900, display: "flex", gap: 14, alignItems: "flex-end" }}>
        {[3, 5, 4, 5, 4].map((n, j) => (
          <div key={j} style={{ display: "flex", flexDirection: "column-reverse", gap: 0 }}>
            {new Array(n).fill(0).map((__, k) => {
              const s = ramp(frame, [4 + j * 3 + k * 2, 12 + j * 3 + k * 2], [0, 1], EASE.back);
              return <div key={k} style={{ width: 86, height: 22, marginTop: -4, borderRadius: "50%", background: GRAD.copper, border: `2px solid ${C.copperDark}`, transform: `translateY(${(1 - s) * -300}px)`, opacity: s }} />;
            })}
          </div>
        ))}
      </div>
    </>
  );
};

const NOTIFS = ["Nouveau message", "Demande de devis", "Nouveau contact", "Prise de rendez-vous"];

const Inbound: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: 330 }}>
      {NOTIFS.map((n, i) => {
        const d = 4 + i * 11;
        const s = pop(frame, fps, d, SPRING.bouncy);
        const vib = frame - d < 8 && frame > d ? Math.sin(frame * 4) * 6 : 0;
        return (
          <div
            key={n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "28px 32px",
              marginBottom: 22,
              borderRadius: 34,
              background: "rgba(243,238,230,0.94)",
              boxShadow: "0 24px 50px rgba(0,0,0,0.4)",
              transform: `translateY(${(1 - s) * -300}px) translateX(${vib}px) scale(${0.8 + 0.2 * s})`,
              opacity: s > 0.01 ? 1 : 0,
            }}
          >
            <div style={{ width: 84, height: 84, borderRadius: 22, background: GRAD.copper, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DrawIcon paths={i % 2 ? ICON.mail : ICON.message} progress={1} size={50} color={C.deep} width={8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 40, color: C.deep }}>{n}</div>
              <div style={{ width: `${60 - i * 8}%`, height: 14, borderRadius: 7, marginTop: 12, background: `${C.deep}22` }} />
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 22, color: C.steel, alignSelf: "flex-start" }}>maint.</div>
          </div>
        );
      })}
    </div>
  );
};

const BENEFITS = [
  { lines: ["Ciblage."], el: <Targeting /> },
  { lines: ["Budget", "*maîtrisé.*"], el: <Budget /> },
  { lines: ["Demandes", "*entrantes.*"], el: <Inbound /> },
];

const Benefits: React.FC = () => {
  const frame = useCurrentFrame();
  const STEP = 78;
  const pos = interpolate(frame, [STEP - 10, STEP, STEP * 2 - 10, STEP * 2], [0, 1, 1, 2], { ...CLAMP, easing: EASE.snap });
  const blur = Math.abs(pos - Math.round(pos)) > 0.02 ? Math.sin((pos % 1) * Math.PI) * 16 : 0;
  return (
    <SceneFrame seed="v3ben" variant="deep" dur={240} zoom={[1, 1]} grid>
      <div style={{ position: "absolute", top: 270, left: 90, fontFamily: F.mono, fontWeight: 700, fontSize: 32, color: C.copperLight, letterSpacing: "0.2em" }}>
        0{Math.round(pos) + 1} / 03
      </div>
      <AbsoluteFill style={{ transform: `translateX(${-pos * W}px)`, filter: blur ? `blur(${blur}px)` : undefined }}>
        {BENEFITS.map((b, i) => (
          <AbsoluteFill key={i} style={{ left: i * W, width: W }}>
            <Sequence from={i * STEP - 6} layout="none">
              {b.el}
              <At y={b.lines.length > 1 ? 1120 : 1180}>
                <Words
                  lines={b.lines}
                  delay={8}
                  stagger={4}
                  mode="rise"
                  style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: b.lines.length > 1 ? 130 : 170, color: C.ivory, lineHeight: 1.05, letterSpacing: "-0.04em" }}
                  accentStyle={{ ...ACCENT_SERIF, fontSize: 160 }}
                />
              </At>
            </Sequence>
          </AbsoluteFill>
        ))}
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 1580, left: W / 2 - 150, display: "flex", gap: 20 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 80, height: 8, borderRadius: 4, background: Math.round(pos) >= i ? C.copperLight : `${C.ivory}33` }} />
        ))}
      </div>
      <Dust count={16} seed="v3bd" />
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

const SCENES: Scene[] = [
  { id: "intro", duration: 80, element: <Intro />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "stake", duration: 110, element: <Stake />, exit: { presentation: glitchSlice(), timing: timing(14, (t) => t) } },
  { id: "revenue", duration: 120, element: <Revenue />, exit: { presentation: inkDrop({ x: W / 2, y: 600 }), timing: timing(22) } },
  { id: "multiplier", duration: 125, element: <Multiplier />, exit: { presentation: splitDoors(), timing: timing(20) } },
  { id: "amplify", duration: 170, element: <Amplify />, exit: { presentation: flip({ direction: "from-bottom" }), timing: timing(22) } },
  { id: "benefits", duration: 240, element: <Benefits />, exit: { presentation: wipe({ direction: "from-top-left" }), timing: timing(20) } },
  { id: "end", duration: END_CARD_DURATION, element: <EndCard /> },
];

export const V3_DURATION = seriesDuration(SCENES);
const starts = sceneStarts(SCENES);

export const V3Advertising: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <SceneSeries scenes={SCENES} />
    <BrandLogo variant="slot" handoff={64} hideAt={starts.end} invert={[[starts.multiplier + 6, starts.amplify + 4]]} />
  </AbsoluteFill>
);
