import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath, interpolatePath } from "@remotion/paths";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { C, EASE, F, H, W } from "../theme";
import { beatPulse, CLAMP, pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, Letters, Marquee, OutlineFill, Tag, Words } from "../components/Kinetic";
import { Burst, Dust, Flash, Ring } from "../components/Particles";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo, copperTextStyle } from "../components/Logo";
import { END_CARD_DURATION, EndCard } from "../components/EndCard";
import { Scene, SceneSeries, sceneStarts, seriesDuration } from "../components/SceneSeries";
import { copperSweep, splitDoors, timing, blinds, zoomPunch } from "../transitions";

// ─── Shared drawings ────────────────────────────────────────────────────────

const Rule: React.FC<{ y: number; progress: number; from?: "left" | "right" }> = ({ y, progress, from = "left" }) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: from === "left" ? 70 : undefined,
      right: from === "right" ? 70 : undefined,
      width: (W - 140) * progress,
      height: 2,
      background: `linear-gradient(90deg, ${C.copper}, ${C.ivory}55)`,
    }}
  />
);

/** A storefront drawn in line-art. B is warm, lit and has a face in the window. */
const Storefront: React.FC<{ kind: "A" | "B"; draw: number; lit: number; width?: number; face?: number }> = ({
  kind,
  draw,
  lit,
  width = 420,
  face = 1,
}) => {
  const frame = useCurrentFrame();
  const stroke = kind === "B" ? C.copperLight : "#8C9BAE";
  const strokes = [
    "M20 520 L20 60 L380 60 L380 520",
    "M40 84 L360 84 L360 146 L40 146 Z",
    "M30 172 L370 172 L350 232 L50 232 Z",
    "M52 262 L226 262 L226 462 L52 462 Z",
    "M262 262 L352 262 L352 520 L262 520 Z",
    "M0 520 L400 520",
  ];
  const seg = (i: number) => Math.max(0, Math.min(1, draw * strokes.length - i * 0.7));
  const flicker = kind === "A" ? 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.9) * Math.sin(frame * 0.37)) : 1;
  const faceDraw = (d: string, k: number) => evolvePath(Math.max(0, Math.min(1, face * 2 - k * 0.5)), d);
  return (
    <svg viewBox="0 0 400 540" width={width} height={width * 1.35} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`glass${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={kind === "B" ? "#F6C08F" : "#2A3B50"} />
          <stop offset="1" stopColor={kind === "B" ? C.copper : "#172536"} />
        </linearGradient>
      </defs>
      {/* fills */}
      <rect x={20} y={60} width={360} height={460} fill={kind === "B" ? "#23364D" : "#16222F"} opacity={lit} />
      <rect x={52} y={262} width={174} height={200} fill={`url(#glass${kind})`} opacity={lit * (kind === "B" ? 0.95 : 0.6)} />
      {kind === "B"
        ? [0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${50 + i * 50} 172 L${50 + i * 50 + 25} 172 L${46 + i * 50 + 25} 232 L${46 + i * 50} 232 Z`} fill={i % 2 ? C.ivory : C.copper} opacity={lit * 0.9} />
          ))
        : null}
      {kind === "A" ? (
        <g opacity={lit * 0.35} stroke="#8C9BAE" strokeWidth={3}>
          <path d="M80 440 L160 290" />
          <path d="M120 450 L200 300" />
        </g>
      ) : null}
      {kind === "B" ? (
        <g fill="none" stroke={C.deep} strokeWidth={7} strokeLinecap="round" opacity={lit}>
          <path d="M139 300 C156 300 166 314 166 330 C166 348 154 360 139 360 C124 360 112 348 112 330 C112 314 122 300 139 300 Z" {...faceDraw("M139 300 C156 300 166 314 166 330 C166 348 154 360 139 360 C124 360 112 348 112 330 C112 314 122 300 139 300 Z", 0)} />
          <path d="M94 452 C98 404 116 388 139 388 C162 388 180 404 184 452" {...faceDraw("M94 452 C98 404 116 388 139 388 C162 388 180 404 184 452", 1)} />
        </g>
      ) : null}
      {/* line-art */}
      {strokes.map((d, i) => {
        const e = evolvePath(seg(i), d);
        return <path key={i} d={d} fill="none" stroke={stroke} strokeWidth={5} strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
      })}
      <text x={200} y={128} textAnchor="middle" fontFamily={F.condensed} fontSize={40} letterSpacing={6} fill={kind === "B" ? C.ivory : "#8C9BAE"} opacity={lit * flicker}>
        {kind === "B" ? "CHEZ LÉA" : "COMMERCE"}
      </text>
      <circle cx={336} cy={392} r={6} fill={stroke} opacity={lit} />
    </svg>
  );
};

// ─── Scenes ────────────────────────────────────────────────────────────────

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFrame seed="v1intro" dur={80} zoom={[1.08, 1]}>
      <Dust count={30} seed="v1d" />
      <Rule y={560} progress={ramp(frame, [2, 26], [0, 1], EASE.inOut)} />
      <Rule y={1300} progress={ramp(frame, [8, 32], [0, 1], EASE.inOut)} from="right" />
      <At y={500} x={70}>
        <Tag style={{ opacity: ramp(frame, [10, 20], [0, 1]), fontSize: 26 }}>N°01</Tag>
      </At>
      <At y={1325} style={{ justifyContent: "flex-end", right: 70, left: "auto" }}>
        <Tag style={{ opacity: ramp(frame, [16, 26], [0, 1]), fontSize: 26 }}>Personal branding</Tag>
      </At>
    </SceneFrame>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const q = pop(frame, 30, 44, SPRING.bouncy);
  return (
    <SceneFrame seed="v1hook" dur={105} zoom={[1, 1.07]}
      back={
        <>
          <At y={170} style={{ opacity: 0.1 }}>
            <Marquee text="PERSONAL BRANDING" outline style={{ fontFamily: F.condensed, fontSize: 250 }} speed={0.35} />
          </At>
          <At y={1480} style={{ opacity: 0.1 }}>
            <Marquee text="PERSONAL BRANDING" outline reverse style={{ fontFamily: F.condensed, fontSize: 250 }} speed={0.35} />
          </At>
          <div
            style={{
              position: "absolute",
              left: W / 2 - 500,
              top: 380,
              width: 1000,
              textAlign: "center",
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 1300,
              lineHeight: 1,
              color: C.copper,
              opacity: 0.1 * q,
              transform: `rotate(${interpolate(frame, [0, 105], [-18, 8])}deg) scale(${0.6 + 0.4 * q})`,
            }}
          >
            ?
          </div>
        </>
      }
    >
      <At y={430}>
        <Words lines={["Le"]} delay={2} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 120, color: C.ivory }} />
      </At>
      <At y={590}>
        <Letters text="PERSONAL" delay={6} stagger={1.6} style={{ fontFamily: F.condensed, fontSize: 240, lineHeight: 1, color: C.ivory }} />
      </At>
      <At y={860}>
        <OutlineFill
          text="BRANDING,"
          progress={ramp(frame, [16, 46], [0, 1], EASE.inOut)}
          style={{ fontFamily: F.condensed, fontSize: 228, lineHeight: 1, transform: `translateX(${interpolate(frame, [10, 40], [120, 0], { ...CLAMP, easing: EASE.out })}px)` }}
        />
      </At>
      <At y={1150}>
        <Words
          lines={["*c'est quoi ?*"]}
          delay={40}
          stagger={5}
          mode="blur"
          style={{ fontSize: 190, transform: `scale(${1 + beatPulse(frame, 60) * 0.03})` }}
          accentStyle={{ ...ACCENT_SERIF }}
        />
      </At>
      <Burst at={48} x={W / 2 + 330} y={1260} count={18} power={300} seed="q" />
    </SceneFrame>
  );
};

const DefRow: React.FC<{ n: string; icon: string[]; lines: string[]; delay: number; dimAt?: number; y: number }> = ({ n, icon, lines, delay, dimAt, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, SPRING.snappy);
  const dim = dimAt === undefined ? 0 : ramp(frame, [dimAt, dimAt + 10], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 90,
        right: 60,
        display: "flex",
        alignItems: "center",
        gap: 40,
        opacity: (s > 0.01 ? 1 : 0) * (1 - dim * 0.55),
        transform: `translateX(${(1 - s) * 500}px) scale(${1 - dim * 0.06})`,
        transformOrigin: "left center",
      }}
    >
      <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
        <svg width={150} height={150} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <circle cx={75} cy={75} r={70} fill="none" stroke={C.copper} strokeWidth={3} strokeDasharray={440} strokeDashoffset={440 * (1 - ramp(frame, [delay, delay + 22], [0, 1]))} transform="rotate(-90 75 75)" />
        </svg>
        <div style={{ position: "absolute", inset: 27, transform: `rotate(${frame * (n === "02" ? 1.5 : 0)}deg)` }}>
          <DrawIcon paths={icon} progress={ramp(frame, [delay + 4, delay + 24], [0, 1])} size={96} width={6} />
        </div>
        <div style={{ position: "absolute", top: -14, right: -18, fontFamily: F.mono, fontWeight: 700, fontSize: 28, color: C.copperLight }}>{n}</div>
      </div>
      <Words
        lines={lines}
        delay={delay + 4}
        stagger={2.5}
        mode="rise"
        align="left"
        style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 78, lineHeight: 1.02, color: C.ivory, letterSpacing: "-0.02em" }}
        accentStyle={{ ...ACCENT_SERIF, fontSize: 92 }}
      />
    </div>
  );
};

const Definition: React.FC = () => {
  const frame = useCurrentFrame();
  const vous = ramp(frame, [104, 130], [0, 1], EASE.inOut);
  const vousS = pop(frame, 30, 100, SPRING.bouncy);
  return (
    <SceneFrame seed="v1def" dur={170} zoom={[1.04, 1]} grid>
      <Dust count={20} seed="v1def" />
      <At y={270} x={90}>
        <Words lines={["C'est :"]} delay={0} mode="rise" style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 110, color: C.copperLight }} />
      </At>
      <DefRow n="01" icon={ICON.tools} lines={["Ce que", "*vous faites*"]} delay={8} dimAt={40} y={450} />
      <DefRow n="02" icon={ICON.spark} lines={["Comment", "*vous le faites*"]} delay={40} dimAt={72} y={690} />
      <DefRow n="03" icon={ICON.face} lines={["Pourquoi on", "vous choisit,"]} delay={72} dimAt={104} y={930} />
      <At y={1170}>
        <div style={{ transform: `scale(${0.4 + 0.6 * vousS}) rotate(${(1 - vousS) * -8}deg)`, opacity: vousS > 0.01 ? 1 : 0 }}>
          <OutlineFill
            text="vous."
            progress={vous}
            stroke={C.copperLight}
            style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 400, lineHeight: 1, paddingRight: 30 }}
          />
        </div>
      </At>
      <Ring at={104} x={W / 2} y={1370} size={1100} />
      <Burst at={106} x={W / 2} y={1370} count={30} power={560} seed="vous" />
    </SceneFrame>
  );
};

const Street: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = pop(frame, fps, 34, SPRING.bouncy);
  const b = pop(frame, fps, 40, SPRING.bouncy);
  return (
    <SceneFrame seed="v1street" dur={100} zoom={[1.1, 1]}>
      <At y={270}>
        <Words lines={["Deux commerces."]} delay={2} mode="drop" stagger={4} style={{ fontFamily: F.condensed, fontSize: 124, color: C.ivory, lineHeight: 1 }} />
      </At>
      <At y={430}>
        <Words lines={["*Même rue.*"]} delay={12} mode="blur" stagger={4} style={{ fontSize: 130 }} />
      </At>
      {/* perspective street lines */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[-1, 1].map((d) => {
          const path = `M${W / 2} 1250 L${W / 2 + d * 900} 1920`;
          const e = evolvePath(ramp(frame, [6, 30], [0, 1]), path);
          return <path key={d} d={path} stroke={C.ivory} strokeOpacity={0.25} strokeWidth={3} strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
        })}
        {[0, 1, 2, 3].map((i) => {
          const y = 1300 + ((i * 160 + frame * 6) % 640);
          return <rect key={i} x={W / 2 - 6} y={y} width={12} height={50 + (y - 1300) * 0.2} fill={C.copperLight} opacity={0.5 * ramp(frame, [20, 30], [0, 1])} />;
        })}
      </svg>
      <div style={{ position: "absolute", top: 660, left: 50 }}>
        <Storefront kind="A" draw={ramp(frame, [6, 40], [0, 1])} lit={ramp(frame, [34, 50], [0, 1])} face={0} width={450} />
      </div>
      <div style={{ position: "absolute", top: 660, right: 50 }}>
        <Storefront kind="B" draw={ramp(frame, [12, 46], [0, 1])} lit={ramp(frame, [40, 56], [0, 1])} face={ramp(frame, [50, 70], [0, 1])} width={450} />
      </div>
      {[
        { l: "A", s: a, x: 275 },
        { l: "B", s: b, x: W - 275 },
      ].map(({ l, s, x }) => (
        <div
          key={l}
          style={{
            position: "absolute",
            left: x - 70,
            top: 560,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: l === "B" ? C.copper : C.night,
            border: `3px solid ${l === "B" ? C.copperLight : "#8C9BAE"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: F.condensed,
            fontSize: 90,
            color: C.ivory,
            transform: `scale(${s})`,
          }}
        >
          {l}
        </div>
      ))}
    </SceneFrame>
  );
};

const ListLines: React.FC<{ items: { text: string; accent?: boolean; icon: string[]; cross?: boolean }[]; start: number; gap: number; y: number; warm?: boolean }> = ({
  items,
  start,
  gap,
  y,
  warm,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: y, left: 90, right: 60, display: "flex", flexDirection: "column", gap: 28 }}>
      {items.map((it, i) => {
        const d = start + i * gap;
        const s = pop(frame, fps, d, SPRING.snappy);
        const strike = it.cross ? ramp(frame, [d + 14, d + 24], [0, 1], EASE.inOut) : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 34, opacity: s > 0.01 ? 1 : 0, transform: `translateY(${(1 - s) * 80}px)` }}>
            <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
              <DrawIcon paths={it.icon} progress={ramp(frame, [d, d + 16], [0, 1])} size={96} width={6} color={warm ? C.copperLight : "#8C9BAE"} />
              {it.cross ? (
                <svg width={96} height={96} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                  <line x1={-6} y1={102} x2={-6 + 108 * strike} y2={102 - 108 * strike} stroke={C.copper} strokeWidth={8} strokeLinecap="round" />
                </svg>
              ) : null}
            </div>
            <div style={{ position: "relative" }}>
              <Words
                lines={[it.text]}
                delay={d + 2}
                stagger={2}
                mode="rise"
                align="left"
                style={{ fontFamily: it.accent ? F.serif : F.grotesk, fontStyle: it.accent ? "italic" : "normal", fontWeight: it.accent ? 400 : 800, fontSize: it.accent ? 100 : 84, color: warm ? C.ivory : "#C3CCD8", lineHeight: 1 }}
                accentStyle={ACCENT_SERIF}
              />
              {it.cross ? <div style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 7, background: C.copper, transform: `scaleX(${strike})`, transformOrigin: "left" }} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CommerceA: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFrame seed="v1a" variant="deep" glow={0.35} dur={90} zoom={[1, 1.06]}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px)" }} />
      <At y={270}>
        <Tag style={{ color: "#8C9BAE", fontSize: 34 }}>Commerce A</Tag>
      </At>
      <At y={350} style={{ filter: "saturate(0.2)" }}>
        <Storefront kind="A" draw={ramp(frame, [0, 22], [0.4, 1])} lit={1} face={0} width={520} />
      </At>
      <ListLines
        y={1100}
        start={14}
        gap={16}
        items={[
          { text: "Un nom.", icon: ICON.message },
          { text: "Une vitrine.", icon: ICON.box },
          { text: "Aucun visage.", icon: ICON.face, cross: true },
        ]}
      />
    </SceneFrame>
  );
};

const CommerceB: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFrame seed="v1b" glow={1.5} dur={105} zoom={[1.06, 1]}>
      <Dust count={40} seed="v1bd" color={C.copperLight} speed={1.2} />
      <At y={270}>
        <Tag style={{ fontSize: 34 }}>Commerce B</Tag>
      </At>
      <At y={350}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -80, borderRadius: "50%", background: `radial-gradient(circle, ${C.copper}66, transparent 65%)`, transform: `scale(${1 + beatPulse(frame) * 0.05})` }} />
          <Storefront kind="B" draw={ramp(frame, [0, 20], [0.4, 1])} lit={1} face={ramp(frame, [0, 26], [0.3, 1])} width={520} />
        </div>
      </At>
      {[0, 1, 2, 3, 4].map((i) => {
        const t = (frame - 10 - i * 12) / 60;
        if (t < 0 || t > 1) return null;
        return (
          <div key={i} style={{ position: "absolute", left: W / 2 + (i % 2 ? 200 : -260) + Math.sin(t * 6 + i) * 30, top: 780 - t * 420, opacity: Math.sin(t * Math.PI), transform: `scale(${0.6 + t * 0.6})` }}>
            <DrawIcon paths={ICON.heart} progress={1} size={70} width={5} fill={C.copper} fillOpacity={0.9} />
          </div>
        );
      })}
      <ListLines
        y={1100}
        start={14}
        gap={16}
        warm
        items={[
          { text: "Un nom.", icon: ICON.message },
          { text: "Une histoire.", icon: ICON.book },
          { text: "*Un visage*", icon: ICON.face },
        ]}
      />
      <div style={{ position: "absolute", top: 1510, left: 220 }}>
        <Words lines={["qu'on reconnaît."]} delay={64} mode="rise" style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 100, lineHeight: 1 }} accentStyle={ACCENT_SERIF} align="left" />
      </div>
    </SceneFrame>
  );
};

const Choice: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const split = ramp(frame, [14, 30], [0.5, 0.18], EASE.snap);
  const bigB = pop(frame, fps, 32, SPRING.heavy);
  const cx = interpolate(frame, [0, 26], [W * 0.3, W * 0.66], { ...CLAMP, easing: EASE.inOut });
  const cy = interpolate(frame, [0, 26], [1500, 1080], { ...CLAMP, easing: EASE.inOut });
  const click = ramp(frame, [26, 30, 34], [1, 0.8, 1]);
  return (
    <SceneFrame seed="v1choice" dur={70} zoom={[1, 1.04]}>
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - split * 100}% 0 0)`, background: "#1B2530", filter: "grayscale(1)" }}>
        <div style={{ position: "absolute", top: 700, left: split * W * 0.5 - 170, opacity: 0.6 }}>
          <Storefront kind="A" draw={1} lit={1} face={0} width={340} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: split * W - 2, width: 4, background: C.copperLight, boxShadow: `0 0 30px ${C.copperLight}` }} />
      <At y={280}>
        <Words lines={["On choisit"]} delay={2} mode="rise" style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 120, color: C.ivory, letterSpacing: "-0.03em" }} />
      </At>
      <div
        style={{
          position: "absolute",
          left: split * W,
          right: 0,
          top: 420,
          display: "flex",
          justifyContent: "center",
          fontFamily: F.condensed,
          fontSize: 980,
          lineHeight: 1,
          transform: `scale(${bigB}) rotate(${(1 - bigB) * 20}deg)`,
          opacity: bigB > 0.01 ? 1 : 0,
          ...copperTextStyle,
          filter: `drop-shadow(0 30px 60px rgba(0,0,0,0.5))`,
        }}
      >
        B.
      </div>
      <svg width={90} height={90} viewBox="0 0 100 100" style={{ position: "absolute", left: cx, top: cy, transform: `scale(${click})`, overflow: "visible" }}>
        <path d="M10 6 L82 52 L48 58 L66 92 L52 98 L34 64 L10 88 Z" fill={C.ivory} stroke={C.deep} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      <Ring at={28} x={W * 0.66 + 10} y={1090} size={380} />
      <Flash at={33} max={0.35} color={C.copperLight} />
    </SceneFrame>
  );
};

const BOX = "M50 10 L88 30 L88 72 L50 92 L12 72 L12 30 Z";
const HEART = ICON.heart[0];

const Trust: React.FC = () => {
  const frame = useCurrentFrame();
  const morph = ramp(frame, [56, 74], [0, 1], EASE.inOut);
  const d = interpolatePath(morph, BOX, HEART);
  const fill = ramp(frame, [66, 96], [0, 1], EASE.inOut);
  const rays = ramp(frame, [62, 80], [0, 1]);
  return (
    <SceneFrame seed="v1trust" dur={120} zoom={[1, 1.08]}>
      <AbsoluteFill style={{ opacity: rays * 0.5 }}>
        <div
          style={{
            position: "absolute",
            left: W / 2 - 1200,
            top: 700 - 1200,
            width: 2400,
            height: 2400,
            background: `repeating-conic-gradient(from ${frame * 0.6}deg, ${C.copper}33 0deg 6deg, transparent 6deg 18deg)`,
            maskImage: "radial-gradient(circle, black 0%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)",
          }}
        />
      </AbsoluteFill>
      <At y={500}>
        <svg viewBox="0 0 100 100" width={380} height={380} style={{ overflow: "visible", transform: `rotate(${interpolate(frame, [0, 60], [-6, 6], CLAMP) * (1 - morph)}deg) scale(${1 + beatPulse(frame, 74) * 0.06 * morph})` }}>
          <path d={d} fill={C.copper} fillOpacity={morph * 0.9} stroke={morph > 0.5 ? C.copperLight : "#8C9BAE"} strokeWidth={3} strokeLinejoin="round" />
          {morph < 0.2 ? (
            <g stroke="#8C9BAE" strokeWidth={3} fill="none" opacity={1 - morph * 5}>
              <path d="M12 30 L50 50 L88 30" />
              <path d="M50 50 L50 92" />
            </g>
          ) : null}
        </svg>
      </At>
      <At y={290}>
        <Words
          lines={["Ce n'est pas le produit", "qui change."]}
          delay={2}
          stagger={3}
          mode="rise"
          exitAt={50}
          style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 74, color: C.ivory, lineHeight: 1.1, letterSpacing: "-0.02em" }}
        />
      </At>
      <At y={1000}>
        <Words lines={["C'est la"]} delay={60} mode="drop" style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 110, color: C.ivory, letterSpacing: "-0.03em" }} />
      </At>
      <At y={1140}>
        <div style={{ transform: `scale(${0.8 + 0.2 * pop(frame, 30, 64, SPRING.bouncy)})`, opacity: ramp(frame, [62, 66], [0, 1]) }}>
          <OutlineFill text="confiance." progress={fill} stroke={C.copperLight} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 205, lineHeight: 1.1, paddingRight: 20 }} />
        </div>
      </At>
      <Burst at={74} x={W / 2} y={690} count={34} power={620} seed="trust" />
      <Ring at={74} x={W / 2} y={690} size={1200} />
      <Dust count={30} seed="trustd" speed={1.5} opacity={rays} />
    </SceneFrame>
  );
};

const YouToo: React.FC = () => {
  const frame = useCurrentFrame();
  const circle = "M540 40 C860 40 1000 110 1000 190 C1000 270 820 330 520 330 C220 330 70 270 70 190 C70 100 260 30 600 50";
  const e = evolvePath(ramp(frame, [24, 44], [0, 1], EASE.inOut), circle);
  return (
    <SceneFrame seed="v1you" variant="ivory" dur={75} zoom={[1.06, 1]}>
      <At y={560}>
        <Words lines={["Ça vaut pour"]} delay={2} mode="rise" style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 104, color: C.deep, letterSpacing: "-0.03em" }} />
      </At>
      <At y={720}>
        <div style={{ position: "relative" }}>
          <Words lines={["*votre activité*"]} delay={10} mode="blur" stagger={4} style={{ fontSize: 150 }} accentStyle={{ ...ACCENT_SERIF }} />
          <svg width={W} height={380} viewBox="0 0 1080 380" style={{ position: "absolute", left: "50%", top: -60, transform: "translateX(-50%)", overflow: "visible" }}>
            <path d={circle} fill="none" stroke={C.deep} strokeWidth={5} strokeLinecap="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
          </svg>
        </div>
      </At>
      <At y={960}>
        <Letters text="AUSSI." delay={20} stagger={2.5} mode="drop" style={{ fontFamily: F.condensed, fontSize: 300, color: C.deep, lineHeight: 1 }} />
      </At>
      <At y={1330}>
        <div style={{ transform: `translateY(${Math.sin(frame / 5) * 10}px)`, opacity: ramp(frame, [34, 44], [0, 1]) }}>
          <DrawIcon paths={["M50 10 L50 86", "M24 60 L50 88 L76 60"]} progress={ramp(frame, [34, 50], [0, 1])} size={110} color={C.copper} width={7} />
        </div>
      </At>
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

const SCENES: Scene[] = [
  { id: "intro", duration: 80, element: <Intro />, exit: { presentation: zoomPunch(), timing: timing(18) } },
  { id: "hook", duration: 105, element: <Hook />, exit: { presentation: copperSweep(), timing: timing(20) } },
  { id: "definition", duration: 170, element: <Definition />, exit: { presentation: splitDoors(), timing: timing(20) } },
  { id: "street", duration: 100, element: <Street />, exit: { presentation: wipe({ direction: "from-right" }), timing: timing(18) } },
  { id: "commerceA", duration: 90, element: <CommerceA />, exit: { presentation: flip({ direction: "from-right" }), timing: timing(22) } },
  { id: "commerceB", duration: 105, element: <CommerceB />, exit: { presentation: clockWipe({ width: W, height: H }), timing: timing(22) } },
  { id: "choice", duration: 70, element: <Choice />, exit: { presentation: iris({ width: W, height: H }), timing: timing(20) } },
  { id: "trust", duration: 120, element: <Trust />, exit: { presentation: blinds(), timing: timing(22) } },
  { id: "you", duration: 75, element: <YouToo />, exit: { presentation: slide({ direction: "from-bottom" }), timing: timing(20) } },
  { id: "end", duration: END_CARD_DURATION, element: <EndCard /> },
];

export const V1_DURATION = seriesDuration(SCENES);
const starts = sceneStarts(SCENES);

export const V1PersonalBranding: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <SceneSeries scenes={SCENES} />
    <BrandLogo variant="rise" handoff={60} hideAt={starts.end} invert={[[starts.you + 8, starts.end]]} />
  </AbsoluteFill>
);
