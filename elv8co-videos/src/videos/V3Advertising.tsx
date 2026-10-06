import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { flip } from "@remotion/transitions/flip";
import { wipe } from "@remotion/transitions/wipe";
import { C, EASE, F, GRAD, H, W } from "../theme";
import { CLAMP, pop, ramp, SPRING } from "../anim";
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
        <Tag style={{ fontSize: 34 }}>Pour chaque</Tag>
      </At>
      <At y={420}>
        <div style={{ transform: `translateY(${y + bounce}px)` }}>
          <Coin size={320} spin={spin} />
        </div>
      </At>
      <Ring at={land} x={W / 2} y={740} size={900} />
      <Burst at={land} x={W / 2} y={740} count={20} power={420} seed="stake" />
      <At y={820}>
        <div style={{ fontFamily: F.condensed, fontSize: 400, lineHeight: 1, color: C.ivory, transform: `scale(${num}) translateY(${(1 - num) * 200}px)`, opacity: num > 0.01 ? 1 : 0 }}>1 €</div>
      </At>
      <At y={1250}>
        <Words lines={["*investi en pub*"]} delay={land + 12} mode="blur" stagger={4} style={{ fontSize: 130 }} />
      </At>
    </SceneFrame>
  );
};

const Revenue: React.FC = () => {
  const frame = useCurrentFrame();
  const { value, velocity } = useCount(1, 39, 6, 60, EASE.out);
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
        <Tag style={{ fontSize: 34 }}>Il a rapporté</Tag>
      </At>
      <At y={400}>
        <div style={{ display: "flex", alignItems: "flex-start", transform: `scale(${1 + (frame >= 60 ? 0.08 * Math.exp(-(frame - 60) / 5) : 0)})` }}>
          <Odometer value={value} final={39} velocity={velocity} style={{ fontFamily: F.condensed, fontSize: 380, color: C.ivory }} />
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

// ─── Nouvel angle : la pub Meta expliquée ───────────────────────────────────

const BOLD: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 900, color: C.ivory, lineHeight: 1.04, letterSpacing: "-0.035em" };
const SUB: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 500, color: C.ivoryDim, lineHeight: 1.25, letterSpacing: "-0.01em" };

const Hook: React.FC = () => (
  <SceneFrame seed="v3hook" variant="night" dur={120} zoom={[1.06, 1]} grid>
    <At y={430}>
      <Tag style={{ fontSize: 30 }}>Facebook · Instagram</Tag>
    </At>
    <At y={540}>
      <Words lines={["La pub Meta,", "*ça sert à quoi ?*"]} delay={4} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 118 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 140 }} />
    </At>
    <At y={1010}>
      <Words lines={["Et pourquoi payer", "*ne suffit pas.*"]} delay={46} stagger={3} mode="blur" style={{ ...SUB, fontSize: 70, color: C.ivory }} accentStyle={{ ...ACCENT_SERIF, fontSize: 84 }} />
    </At>
    <Dust count={14} seed="v3hk" />
  </SceneFrame>
);

const WhatFor: React.FC = () => {
  const frame = useCurrentFrame();
  const pin = ramp(frame, [40, 52], [0, 1], EASE.back);
  return (
    <SceneFrame seed="v3what" variant="deep" dur={170} zoom={[1, 1.04]}>
      <At y={250}>
        <Tag>01 · À quoi ça sert</Tag>
      </At>
      <Sequence from={8} layout="none">
        <Targeting />
      </Sequence>
      <div style={{ position: "absolute", left: 600 - 60, top: 640 - 150, transform: `scale(${pin}) translateY(${(1 - pin) * -80}px)`, transformOrigin: "50% 100%" }}>
        <DrawIcon paths={ICON.pin} progress={1} size={120} color={C.deep} width={6} fill={C.ivory} fillOpacity={1} />
      </div>
      <At y={1060}>
        <Words lines={["Montrer votre vidéo", "aux *bonnes personnes.*"]} delay={50} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 92 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 108 }} />
      </At>
      <At y={1330}>
        <Words lines={["Autour de chez vous, selon l'âge,", "les centres d'intérêt…"]} delay={84} stagger={2} mode="blur" style={{ ...SUB, fontSize: 46 }} />
      </At>
    </SceneFrame>
  );
};

const AnyBudget: React.FC = () => (
  <SceneFrame seed="v3bud" variant="night" dur={160} zoom={[1.04, 1]} grid>
    <At y={250}>
      <Tag>02 · Le budget</Tag>
    </At>
    <Budget />
    <At y={1110}>
      <Words lines={["Ça marche avec", "*tous les budgets.*"]} delay={20} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 98 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 116 }} />
    </At>
    <At y={1380}>
      <Words lines={["On commence petit.", "On augmente *si ça rapporte.*"]} delay={62} stagger={2} mode="blur" style={{ ...SUB, fontSize: 50, color: C.ivory }} accentStyle={{ ...ACCENT_SERIF, fontSize: 60 }} />
    </At>
  </SceneFrame>
);

type Row = { t: string; d: string };

const ListScene: React.FC<{ seed: string; variant: "night" | "deep"; tag: string; title: string[]; rows: Row[]; good: boolean; dur: number }> = ({ seed, variant, tag, title, rows, good, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFrame seed={seed} variant={variant} dur={dur} zoom={[1, 1.03]}>
      <At y={250}>
        <Tag>{tag}</Tag>
      </At>
      <At y={330}>
        <Words lines={title} delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 130 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 150 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 590, display: "flex", flexDirection: "column", gap: 26 }}>
        {rows.map((r, i) => {
          const d = 22 + i * 24;
          const s = pop(frame, fps, d, SPRING.snappy);
          const ic = ramp(frame, [d + 6, d + 18], [0, 1]);
          return (
            <div
              key={r.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "30px 34px",
                borderRadius: 30,
                background: good ? "rgba(243,238,230,0.07)" : "rgba(7,15,24,0.55)",
                border: `2px solid ${good ? "rgba(224,144,85,0.45)" : "rgba(243,238,230,0.14)"}`,
                transform: `translateX(${(1 - s) * 120}px)`,
                opacity: Math.min(1, s * 1.5),
              }}
            >
              <div style={{ width: 92, height: 92, flexShrink: 0, borderRadius: "50%", background: good ? GRAD.copper : "rgba(243,238,230,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DrawIcon paths={good ? ICON.check : ICON.cross} progress={ic} size={54} color={good ? C.deep : C.ivory} width={12} />
              </div>
              <div>
                <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 52, color: C.ivory, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{r.t}</div>
                <div style={{ ...SUB, fontSize: 37, marginTop: 6 }}>{r.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </SceneFrame>
  );
};

const PROS: Row[] = [
  { t: "Ciblage précis", d: "Votre ville, votre clientèle, pas les autres" },
  { t: "Budget maîtrisé", d: "Montant choisi, arrêt à tout moment" },
  { t: "Tout se mesure", d: "On voit ce qui rapporte, et ce qui ne rapporte pas" },
  { t: "Effet rapide", d: "Visible dès le lancement de la campagne" },
];
const CONS: Row[] = [
  { t: "Ça s'arrête avec le budget", d: "Plus de pub, plus de diffusion" },
  { t: "Une mauvaise pub coûte", d: "Contenu qui ne parle pas = argent perdu" },
  { t: "Il faut tester", d: "Les premiers jours servent à ajuster le tir" },
];

const DUEL = [
  { k: "Contenu", a: "Une photo du logo", b: "Le four à 6 h, en vidéo" },
  { k: "Ciblage", a: "Toute la Belgique", b: "10 km autour de la boutique" },
  { k: "Message", a: "Venez nous voir", b: "Réservez vos pains du dimanche" },
  { k: "Suivi", a: "Aucun", b: "Ajusté chaque semaine" },
];

const Mark: React.FC<{ ok: boolean; p: number }> = ({ ok, p }) => (
  <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: "50%", background: ok ? GRAD.copper : "rgba(243,238,230,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <DrawIcon paths={ok ? ICON.check : ICON.cross} progress={p} size={26} color={ok ? C.deep : C.ivory} width={13} />
  </div>
);

const Duel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colW = (W - 180 - 30) / 2;
  const head = pop(frame, fps, 30, SPRING.snappy);
  const cell = (txt: string, ok: boolean, d: number) => {
    const s = pop(frame, fps, d, SPRING.snappy);
    return (
      <div style={{ width: colW, display: "flex", gap: 16, alignItems: "flex-start", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 40}px)` }}>
        <Mark ok={ok} p={ramp(frame, [d + 4, d + 14], [0, 1])} />
        <div style={{ fontFamily: F.grotesk, fontWeight: ok ? 800 : 500, fontSize: 41, lineHeight: 1.15, color: ok ? C.ivory : C.ivoryDim, letterSpacing: "-0.015em" }}>{txt}</div>
      </div>
    );
  };
  return (
    <SceneFrame seed="v3duel" variant="deep" dur={330} zoom={[1, 1.03]} grid>
      <At y={250}>
        <Tag>05 · Exemple</Tag>
      </At>
      <At y={320}>
        <Words lines={["Deux boulangeries.", "*Même budget.*"]} delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 96 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 116 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 600, display: "flex", gap: 30, opacity: head, transform: `scale(${0.9 + 0.1 * head})` }}>
        {["Boulangerie A", "Boulangerie B"].map((n, i) => (
          <div key={n} style={{ width: colW, padding: "22px 0", borderRadius: 24, textAlign: "center", fontFamily: F.grotesk, fontWeight: 900, fontSize: 44, color: i ? C.deep : C.ivory, background: i ? GRAD.copper : "rgba(243,238,230,0.1)" }}>
            {n}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 740, display: "flex", flexDirection: "column", gap: 30 }}>
        {DUEL.map((r, i) => {
          const d = 50 + i * 42;
          return (
            <div key={r.k}>
              <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", color: C.copperLight, textTransform: "uppercase", marginBottom: 14, opacity: ramp(frame, [d - 6, d + 4], [0, 1]) }}>{r.k}</div>
              <div style={{ display: "flex", gap: 30 }}>
                {cell(r.a, false, d)}
                {cell(r.b, true, d + 10)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1590, textAlign: "center", fontFamily: F.mono, fontSize: 22, letterSpacing: "0.2em", color: C.steel, textTransform: "uppercase" }}>Exemple illustratif</div>
    </SceneFrame>
  );
};

const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = pop(frame, fps, 4, SPRING.snappy);
  const b = pop(frame, fps, 30, SPRING.bouncy);
  const half = (W - 180 - 30) / 2;
  return (
    <SceneFrame seed="v3verd" variant="night" dur={170} zoom={[1.03, 1]}>
      <div style={{ position: "absolute", left: 90, right: 90, top: 300, display: "flex", gap: 30 }}>
        <div style={{ width: half, height: 640, borderRadius: 36, background: "rgba(7,15,24,0.55)", border: "2px solid rgba(243,238,230,0.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, opacity: a, transform: `translateY(${(1 - a) * 60}px)` }}>
          <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 34, letterSpacing: "0.25em", color: C.steel }}>A</div>
          <DrawIcon paths={ICON.eye} progress={ramp(frame, [6, 30], [0, 1])} size={170} color={C.ivoryDim} width={4} />
          <div style={{ textAlign: "center", fontFamily: F.grotesk, fontWeight: 800, fontSize: 48, color: C.ivoryDim, lineHeight: 1.1 }}>
            Des vues.
            <br />
            <span style={{ fontWeight: 500, fontSize: 42 }}>Pas de clients.</span>
          </div>
        </div>
        <div style={{ width: half, height: 640, borderRadius: 36, background: GRAD.copper, boxShadow: `0 0 80px ${C.copper}66`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, opacity: b > 0.01 ? 1 : 0, transform: `scale(${0.8 + 0.2 * b})` }}>
          <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 34, letterSpacing: "0.25em", color: C.deep }}>B</div>
          <DrawIcon paths={ICON.handshake} progress={ramp(frame, [32, 60], [0, 1])} size={170} color={C.deep} width={4.5} />
          <div style={{ textAlign: "center", fontFamily: F.grotesk, fontWeight: 900, fontSize: 44, color: C.deep, lineHeight: 1.15 }}>
            Des messages.
            <br />
            Des commandes.
          </div>
        </div>
      </div>
      <Ring at={32} x={W / 2 + half / 2 + 15} y={620} size={900} />
      <At y={1080}>
        <Words lines={["Même budget.", "*Pas le même résultat.*"]} delay={64} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 96 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 112 }} />
      </At>
    </SceneFrame>
  );
};

const Lesson: React.FC = () => (
  <SceneFrame seed="v3less" variant="ivory" dur={170} zoom={[1, 1.05]}>
    <At y={470}>
      <Words lines={["Payer", "*ne suffit pas.*"]} delay={4} stagger={5} mode="drop" style={{ ...BOLD, color: C.deep, fontSize: 170 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 190 }} />
    </At>
    <At y={980}>
      <Words
        lines={["La pub *amplifie*", "ce que vous montrez.", "En bien comme en mal."]}
        delay={44}
        stagger={2}
        mode="blur"
        style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 62, color: C.deep, lineHeight: 1.18, letterSpacing: "-0.02em" }}
        accentStyle={{ ...ACCENT_SERIF, fontSize: 76 }}
      />
    </At>
  </SceneFrame>
);

const RealCase: React.FC = () => (
  <SceneFrame seed="v3real" variant="deep" dur={120} zoom={[1.08, 1]} grid="perspective">
    <At y={470}>
      <Tag style={{ fontSize: 34 }}>06 · Un cas réel</Tag>
    </At>
    <At y={580}>
      <Words lines={["AKP Kustom"]} delay={6} stagger={5} mode="pop" style={{ fontFamily: F.condensed, fontSize: 190, color: C.ivory, lineHeight: 1 }} />
    </At>
    <At y={830}>
      <Words lines={["Atelier textile liégeois.", "*Premier test publicitaire.*"]} delay={26} stagger={3} mode="rise" style={{ ...SUB, fontSize: 56, color: C.ivory }} accentStyle={{ ...ACCENT_SERIF, fontSize: 66 }} />
    </At>
    <Ring at={8} x={W / 2} y={680} size={1200} />
    <Dust count={14} seed="v3rl" />
  </SceneFrame>
);

const Clients: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 4, SPRING.heavy);
  return (
    <SceneFrame seed="v3cli" variant="night" dur={110} zoom={[1, 1.06]}>
      <At y={300}>
        <Tag style={{ fontSize: 34 }}>Et surtout</Tag>
      </At>
      <At y={400}>
        <div style={{ fontFamily: F.condensed, fontSize: 520, lineHeight: 1, color: C.ivory, transform: `scale(${s})`, opacity: s > 0.01 ? 1 : 0 }}>2</div>
      </At>
      <At y={960}>
        <Words lines={["*clients signés*"]} delay={14} stagger={4} mode="rise" style={{ fontSize: 140 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 150 }} />
      </At>
      <At y={1170}>
        <Words lines={["dès le premier test."]} delay={26} stagger={3} mode="blur" style={{ ...SUB, fontSize: 60, color: C.ivory }} />
      </At>
      <Burst at={6} x={W / 2} y={660} count={22} power={500} seed="cli" />
    </SceneFrame>
  );
};

const Final: React.FC = () => (
  <SceneFrame seed="v3fin" variant="deep" dur={160} zoom={[1.05, 1]} grid>
    <At y={430}>
      <Words lines={["Le bon contenu."]} delay={2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 110 }} />
    </At>
    <At y={570}>
      <Words lines={["La bonne cible."]} delay={20} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 110 }} />
    </At>
    <At y={700}>
      <Words lines={["*Le bon suivi.*"]} delay={38} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 110 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 140 }} />
    </At>
    <At y={1010}>
      <Words lines={["C'est ça qui transforme", "un budget pub *en clients.*"]} delay={66} stagger={2} mode="blur" style={{ ...SUB, fontSize: 58, color: C.ivory }} accentStyle={{ ...ACCENT_SERIF, fontSize: 70 }} />
    </At>
  </SceneFrame>
);

// ─── Composition ────────────────────────────────────────────────────────────

const SCENES: Scene[] = [
  { id: "intro", duration: 80, element: <Intro />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "hook", duration: 120, element: <Hook />, exit: { presentation: glitchSlice(), timing: timing(14, (t) => t) } },
  { id: "what", duration: 170, element: <WhatFor />, exit: { presentation: wipe({ direction: "from-right" }), timing: timing(18) } },
  { id: "budget", duration: 160, element: <AnyBudget />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "pros", duration: 200, element: <ListScene seed="v3pro" variant="night" tag="03 · Les avantages" title={["Les *avantages*"]} rows={PROS} good dur={200} />, exit: { presentation: glitchSlice(), timing: timing(14, (t) => t) } },
  { id: "cons", duration: 180, element: <ListScene seed="v3con" variant="deep" tag="04 · Les limites" title={["Les *limites*"]} rows={CONS} good={false} dur={180} />, exit: { presentation: splitDoors(), timing: timing(20) } },
  { id: "duel", duration: 330, element: <Duel />, exit: { presentation: flip({ direction: "from-right" }), timing: timing(20) } },
  { id: "verdict", duration: 170, element: <Verdict />, exit: { presentation: inkDrop({ x: W / 2, y: 900 }), timing: timing(22) } },
  { id: "lesson", duration: 170, element: <Lesson />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "real", duration: 120, element: <RealCase />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "stake", duration: 110, element: <Stake />, exit: { presentation: glitchSlice(), timing: timing(14, (t) => t) } },
  { id: "revenue", duration: 120, element: <Revenue />, exit: { presentation: inkDrop({ x: W / 2, y: 600 }), timing: timing(22) } },
  { id: "multiplier", duration: 125, element: <Multiplier />, exit: { presentation: splitDoors(), timing: timing(20) } },
  { id: "clients", duration: 110, element: <Clients />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "final", duration: 160, element: <Final />, exit: { presentation: wipe({ direction: "from-top-left" }), timing: timing(20) } },
  { id: "end", duration: END_CARD_DURATION, element: <EndCard /> },
];

export const V3_DURATION = seriesDuration(SCENES);
const starts = sceneStarts(SCENES);

export const V3Advertising: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <SceneSeries scenes={SCENES} />
    <BrandLogo
      variant="slot"
      handoff={64}
      hideAt={starts.end}
      invert={[
        [starts.lesson + 6, starts.real + 4],
        [starts.multiplier + 6, starts.clients + 4],
      ]}
    />
  </AbsoluteFill>
);
