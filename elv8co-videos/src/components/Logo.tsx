import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, F, GRAD, H } from "../theme";
import { beatPulse, CLAMP, pop, ramp, SPRING } from "../anim";
import { Burst, Ring } from "./Particles";

export const LETTERS = ["E", "L", "V", "8"] as const;
/** Approximate letter centres (in em) inside the wordmark — used for choreography. */
const LETTER_CENTERS = [0.31, 0.86, 1.47, 2.1];
const WORD_CENTER = 1.305;
const DOT_OFFSET = 1.21; // dot centre relative to wordmark centre (em)

export const wordStyle = (size: number): React.CSSProperties => ({
  fontFamily: F.grotesk,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 1,
  letterSpacing: "-0.035em",
  color: C.ivory,
  whiteSpace: "nowrap",
});

export const Dot: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; glow?: number }> = ({
  style,
  children,
  glow = 1,
}) => (
  <div
    style={{
      position: "relative",
      display: "inline-block",
      width: "0.19em",
      height: "0.19em",
      marginLeft: "0.05em",
      flexShrink: 0,
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: `radial-gradient(circle at 34% 30%, #F8C9A0 0%, ${C.copperLight} 30%, ${C.copper} 62%, ${C.copperDark} 100%)`,
        boxShadow: `0 0 ${0.12 * glow}em rgba(224,144,85,${0.55 * glow})`,
      }}
    />
    {children}
  </div>
);

type WordmarkProps = {
  size: number;
  letterStyle?: (i: number) => React.CSSProperties;
  renderLetter?: (ch: string, i: number) => React.ReactNode;
  clip?: boolean;
  dotStyle?: React.CSSProperties;
  dotChildren?: React.ReactNode;
  hideDot?: boolean;
  style?: React.CSSProperties;
};

export const Wordmark: React.FC<WordmarkProps> = ({
  size,
  letterStyle,
  renderLetter,
  clip,
  dotStyle,
  dotChildren,
  hideDot,
  style,
}) => (
  <div style={{ ...wordStyle(size), display: "flex", alignItems: "baseline", ...style }}>
    {LETTERS.map((ch, i) => {
      const inner = renderLetter ? (
        renderLetter(ch, i)
      ) : (
        <span style={{ display: "inline-block", ...letterStyle?.(i) }}>{ch}</span>
      );
      return clip ? (
        <span
          key={ch}
          style={{ display: "inline-block", overflow: "hidden", padding: "0.06em 0.02em 0.02em", margin: "-0.06em -0.02em -0.02em" }}
        >
          {inner}
        </span>
      ) : (
        <React.Fragment key={ch}>{inner}</React.Fragment>
      );
    })}
    {hideDot ? <div style={{ width: "0.24em" }} /> : <Dot style={dotStyle}>{dotChildren}</Dot>}
  </div>
);

/** A light sweep across the letters (drawn on top of a resting wordmark). */
export const Sheen: React.FC<{ size: number; progress: number; color?: string }> = ({ size, progress, color = "#FFFFFF" }) => {
  if (progress <= 0 || progress >= 1) return null;
  const pos = interpolate(progress, [0, 1], [130, -30]);
  return (
    <div
      style={{
        ...wordStyle(size),
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "baseline",
        backgroundImage: `linear-gradient(105deg, transparent 40%, ${color} 50%, transparent 60%)`,
        backgroundSize: "300% 100%",
        backgroundPosition: `${pos}% 0`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        pointerEvents: "none",
      }}
    >
      {LETTERS.map((ch) => (
        <span key={ch}>{ch}</span>
      ))}
      <div style={{ width: "0.24em" }} />
    </div>
  );
};

export type LogoVariant = "rise" | "rec" | "slot" | "fusion";

const SIZE = 230;
const CORNER_SIZE = 56;
const CORNER_Y = 150;
const INTRO_Y = H * 0.47;

// ─── Intro choreographies ───────────────────────────────────────────────────

/** Video 1 — the copper dot drops, and its impact lifts the letters up. */
const RiseIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const IMPACT = 16;
  let dotY = 0;
  let squash = 1;
  if (frame < IMPACT) {
    dotY = interpolate(frame, [2, IMPACT], [-900, 0], { ...CLAMP, easing: EASE.in });
  } else {
    const t = frame - IMPACT;
    dotY = -170 * Math.abs(Math.sin((Math.PI * t) / 11)) * Math.exp(-t / 9);
    const since = t % 11;
    squash = 1 - 0.35 * Math.exp(-since / 2) * Math.exp(-t / 14);
  }
  return (
    <div style={{ position: "relative" }}>
      <Wordmark
        size={SIZE}
        clip
        letterStyle={(i) => {
          const s = pop(frame, fps, IMPACT + (3 - i) * 2.5, SPRING.bouncy);
          return { transform: `translateY(${(1 - s) * 115}%)` };
        }}
        dotStyle={{ transform: `translateY(${dotY}px) scale(${2 - squash}, ${squash})`, transformOrigin: "50% 100%" }}
        dotChildren={
          <>
            <Ring at={IMPACT} x={22} y={44} size={520} width={5} />
            <Ring at={IMPACT + 6} x={22} y={44} size={300} width={3} color={C.ivory} />
          </>
        }
      />
      <Sheen size={SIZE} progress={ramp(frame, [36, 58], [0, 1], EASE.inOut)} />
    </div>
  );
};

/** Video 2 — camera viewfinder, outlined letters drawn then filled, REC dot blinking. */
const RecIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = ramp(frame, [4, 26], [100, 0], EASE.inOut);
  const fill = ramp(frame, [24, 40], [100, 0], EASE.inOut);
  const blur = ramp(frame, [0, 14], [14, 0]);
  const blink = frame < 10 ? 0 : frame >= 34 ? 1 : Math.floor((frame - 10) / 6) % 2 === 0 ? 1 : 0;
  return (
    <div style={{ position: "relative", filter: `blur(${blur}px)` }}>
      <div style={{ clipPath: `inset(0 ${draw}% 0 0)` }}>
        <Wordmark
          size={SIZE}
          letterStyle={() => ({ color: "transparent", WebkitTextStroke: `3px ${C.ivory}` })}
          dotStyle={{ opacity: blink, transform: `scale(${blink ? 1 : 0.6})` }}
        />
      </div>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${fill}% 0 0 0)` }}>
        <Wordmark size={SIZE} hideDot />
      </div>
      <Sheen size={SIZE} progress={ramp(frame, [42, 62], [0, 1], EASE.inOut)} />
    </div>
  );
};

const SLOT_CHARS = "0123456789€%×+#";

/** Video 3 — slot-machine reels spin and lock on each letter, the dot is a coin. */
const SlotIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reel = (i: number, f: number) => interpolate(f, [2 + i * 2, 16 + i * 6], [0, 13], { ...CLAMP, easing: EASE.out });
  const COIN = 40;
  const coinT = frame - COIN;
  const coinY = frame < COIN ? interpolate(frame, [26, COIN], [-800, 0], { ...CLAMP, easing: EASE.in }) : 0;
  const coinSpin = frame < COIN + 8 ? Math.cos(frame * 0.7) : 1;
  const land = frame < COIN ? 1 : 1 + 0.4 * Math.exp(-coinT / 4) * Math.cos(coinT * 0.9);
  return (
    <div style={{ position: "relative" }}>
      <Wordmark
        size={SIZE}
        renderLetter={(ch, i) => {
          const pos = reel(i, frame);
          const v = Math.abs(pos - reel(i, frame - 1));
          const settle = pop(frame, fps, 16 + i * 6, SPRING.bouncy);
          const strip = [...new Array(13)].map((_, k) => SLOT_CHARS[Math.floor(random(`slot${i}${k}`) * SLOT_CHARS.length)]);
          strip.push(ch);
          return (
            <span key={ch} style={{ position: "relative", display: "inline-block", overflow: "hidden", height: "1em", verticalAlign: "baseline" }}>
              <span style={{ visibility: "hidden" }}>{ch}</span>
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transform: `translate(-50%, ${-pos + (1 - settle) * 0.08}em)`,
                  filter: `blur(${Math.min(12, v * 10)}px)`,
                  color: pos > 12.9 ? C.ivory : C.copperLight,
                }}
              >
                {strip.map((c, k) => (
                  <span key={k} style={{ height: "1em" }}>
                    {c}
                  </span>
                ))}
              </span>
            </span>
          );
        }}
        dotStyle={{
          transform: `translateY(${coinY}px) scale(${coinSpin * land}, ${frame < COIN ? 1 : 2 - land})`,
          transformOrigin: "50% 100%",
          opacity: frame < 26 ? 0 : 1,
        }}
        dotChildren={<Burst at={COIN} x={22} y={22} count={16} power={220} duration={22} seed="coin" />}
      />
      <Sheen size={SIZE} progress={ramp(frame, [48, 66], [0, 1], EASE.inOut)} />
    </div>
  );
};

/** Video 4 — three shapes (the three services) orbit, fuse into the dot and the letters burst out. */
const FusionIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FUSE = 38;
  const shapes = [0, 1, 2].map((i) => {
    const base = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    const r = frame < 16 ? interpolate(frame, [0, 16], [950, 240], { ...CLAMP, easing: EASE.out }) : interpolate(frame, [16, FUSE], [240, 0], { ...CLAMP, easing: EASE.in });
    const a = base + interpolate(frame, [0, FUSE], [0, Math.PI * 2.2], { ...CLAMP, easing: EASE.in });
    const s = interpolate(frame, [16, FUSE], [1, 0.3], CLAMP);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, s, rot: frame * 6 };
  });
  const ball = pop(frame, fps, FUSE, SPRING.bouncy);
  const travel = ramp(frame, [FUSE + 4, FUSE + 20], [0, 1], EASE.inOut);
  return (
    <div style={{ position: "relative" }}>
      {frame < FUSE + 1 ? (
        <div style={{ position: "absolute", left: "50%", top: "55%", width: 0, height: 0 }}>
          {shapes.map((sh, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: sh.x - 60,
                top: sh.y - 60,
                width: 120,
                height: 120,
                transform: `scale(${sh.s}) rotate(${sh.rot}deg)`,
              }}
            >
              <svg viewBox="0 0 120 120" width={120} height={120} style={{ overflow: "visible" }}>
                {i === 0 ? <circle cx={60} cy={60} r={52} fill={C.copper} /> : null}
                {i === 1 ? <rect x={12} y={12} width={96} height={96} rx={10} fill="none" stroke={C.ivory} strokeWidth={10} /> : null}
                {i === 2 ? <path d="M60 8 L112 104 L8 104 Z" fill="none" stroke={C.copperLight} strokeWidth={10} strokeLinejoin="round" /> : null}
              </svg>
            </div>
          ))}
        </div>
      ) : null}
      <Wordmark
        size={SIZE}
        letterStyle={(i) => {
          const s = pop(frame, fps, FUSE + 2 + Math.abs(1.5 - i) * 2, SPRING.bouncy);
          const dx = (WORD_CENTER - LETTER_CENTERS[i]) * (1 - s);
          return { transform: `translateX(${dx}em) scale(${s})`, opacity: s > 0.02 ? 1 : 0 };
        }}
        dotStyle={{
          transform: `translate(${-DOT_OFFSET * (1 - travel)}em, ${-0.3 * (1 - travel)}em) scale(${ball * (1 + 1.5 * (1 - travel))})`,
          opacity: frame >= FUSE ? 1 : 0,
        }}
      />
      <Sheen size={SIZE} progress={ramp(frame, [56, 72], [0, 1], EASE.inOut)} />
    </div>
  );
};

const INTROS: Record<LogoVariant, React.FC> = {
  rise: RiseIntro,
  rec: RecIntro,
  slot: SlotIntro,
  fusion: FusionIntro,
};

/**
 * The brand logo layer: plays the intro in the centre, then glides up and
 * stays small at the top of the frame until the end card takes over.
 */
export const BrandLogo: React.FC<{
  variant: LogoVariant;
  handoff: number;
  hideAt: number;
  /** frame ranges where the logo sits on a light background */
  invert?: [number, number][];
}> = ({ variant, handoff, hideAt, invert = [] }) => {
  const frame = useCurrentFrame();
  const Intro = INTROS[variant];
  const move = ramp(frame, [handoff, handoff + 20], [0, 1], EASE.snap);
  const y = interpolate(move, [0, 1], [INTRO_Y, CORNER_Y]);
  const scale = interpolate(move, [0, 1], [1, CORNER_SIZE / SIZE]);
  const hide = ramp(frame, [hideAt - 8, hideAt + 2], [0, 1], EASE.in);
  const pulse = move >= 1 ? beatPulse(frame) : 0;
  const ink = invert.reduce((acc, [a, b]) => Math.max(acc, ramp(frame, [a - 6, a, b - 2, b + 4], [0, 1, 1, 0], EASE.inOut)), 0);
  const tagline = ramp(frame, [30, 44], [0, 1]) * (1 - ramp(frame, [handoff - 8, handoff], [0, 1]));
  if (hide >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(-50%) translateY(${-hide * 60}px) scale(${scale})`,
          opacity: 1 - hide,
          filter: ink > 0 ? `invert(${ink * 0.92}) hue-rotate(${ink * 180}deg)` : undefined,
        }}
      >
        <div style={{ transform: `scale(${1 + pulse * 0.04})` }}>
          <Intro />
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: `${0.5 + tagline * 0.2}em`,
            color: C.ivoryDim,
            opacity: tagline,
            height: 0,
          }}
        >
          AGENCE · LIÈGE
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Big, static-in-place logo used by the end card (with a reflection). */
export const OutroLogo: React.FC<{ size?: number }> = ({ size = 250 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const DOT = 20;
  const dotS = pop(frame, fps, DOT, SPRING.bouncy);
  const letter = (i: number): React.CSSProperties => {
    const s = pop(frame, fps, i * 3.5, SPRING.bouncy);
    return {
      transform: `translateY(${(1 - s) * -620}px) rotate(${(1 - s) * (i % 2 ? 14 : -14)}deg)`,
      opacity: s > 0.01 ? 1 : 0,
    };
  };
  const dotStyle: React.CSSProperties = {
    transform: `translateY(${(1 - dotS) * -700}px) scale(${0.6 + dotS * 0.4 + beatPulse(frame, DOT + 10) * 0.08})`,
  };
  const loopSheen = frame < 70 ? ramp(frame, [34, 56], [0, 1], EASE.inOut) : ((frame - 70) % 60) / 34;
  const mark = (reflect: boolean) => (
    <div style={{ position: "relative" }}>
      <Wordmark
        size={size}
        letterStyle={letter}
        dotStyle={dotStyle}
        dotChildren={reflect ? null : <Ring at={DOT + 7} x={24} y={24} size={640} width={6} />}
      />
      {!reflect ? <Sheen size={size} progress={loopSheen} /> : null}
    </div>
  );
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {mark(false)}
      <div
        style={{
          transform: "scaleY(-1)",
          marginTop: -size * 0.16,
          opacity: 0.2,
          maskImage: "linear-gradient(to top, black 0%, transparent 55%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 55%)",
          filter: "blur(2px)",
        }}
      >
        {mark(true)}
      </div>
    </div>
  );
};

export const copperTextStyle: React.CSSProperties = {
  backgroundImage: GRAD.copperText,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};
