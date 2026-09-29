import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C, GRAD, H, W } from "../theme";

type Variant = "night" | "deep" | "ivory" | "copper";

const BASE: Record<Variant, string> = {
  night: GRAD.night,
  deep: `radial-gradient(110% 70% at 50% 40%, #12263A 0%, ${C.deep} 55%, ${C.abyss} 100%)`,
  ivory: GRAD.ivory,
  copper: `radial-gradient(110% 80% at 50% 35%, ${C.copperLight} 0%, ${C.copper} 45%, ${C.copperDark} 100%)`,
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  // A static noise texture shifted every frame: cheap animated film grain
  const dx = Math.floor(random(`gx${frame}`) * 200);
  const dy = Math.floor(random(`gy${frame}`) * 200);
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <svg
        width={W + 200}
        height={H + 200}
        style={{ position: "absolute", left: -dx, top: -dy }}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Glows: React.FC<{
  seed?: string;
  colors?: string[];
  intensity?: number;
  speed?: number;
}> = ({ seed = "g", colors = [C.copper, C.night, C.copperLight], intensity = 1, speed = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {colors.map((col, i) => {
        const t = frame * 0.004 * speed;
        const x = W * (0.5 + 0.45 * noise2D(`${seed}x${i}`, t, i));
        const y = H * (0.5 + 0.42 * noise2D(`${seed}y${i}`, i, t));
        const size = 1000 + i * 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${col} 0%, transparent 65%)`,
              opacity: (i === 0 ? 0.42 : 0.32) * intensity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const GridLines: React.FC<{ color?: string; step?: number; opacity?: number; drift?: number; perspective?: boolean }> = ({
  color = C.ivory,
  step = 90,
  opacity = 0.06,
  drift = 0.6,
  perspective = false,
}) => {
  const frame = useCurrentFrame();
  const off = (frame * drift) % step;
  const style: React.CSSProperties = {
    position: "absolute",
    inset: perspective ? "-60% -60%" : `-${step}px`,
    backgroundImage: `linear-gradient(${color} 1.5px, transparent 1.5px), linear-gradient(90deg, ${color} 1.5px, transparent 1.5px)`,
    backgroundSize: `${step}px ${step}px`,
    backgroundPosition: `0px ${off}px`,
    opacity,
  };
  if (perspective) {
    return (
      <AbsoluteFill style={{ perspective: 900, overflow: "hidden" }}>
        <div
          style={{
            ...style,
            top: "45%",
            transform: "rotateX(72deg)",
            transformOrigin: "50% 0%",
            maskImage: "linear-gradient(to bottom, transparent, black 30%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%)",
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={style} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(120% 85% at 50% 45%, transparent 55%, rgba(3,8,14,${strength}) 100%)`,
    }}
  />
);

export const Background: React.FC<{
  variant?: Variant;
  seed?: string;
  glow?: number;
  grid?: boolean | "perspective";
  children?: React.ReactNode;
}> = ({ variant = "night", seed = "bg", glow = 1, grid = false, children }) => {
  const light = variant === "ivory";
  return (
    <AbsoluteFill style={{ background: BASE[variant], overflow: "hidden" }}>
      {glow > 0 ? (
        <Glows
          seed={seed}
          intensity={glow * (light ? 0.5 : 1)}
          colors={
            variant === "copper"
              ? ["#F4B27C", C.copperDark, C.copperLight]
              : light
                ? [C.copperLight, "#FFFFFF", C.copper]
                : [C.copper, C.night, C.copperLight]
          }
        />
      ) : null}
      {grid ? (
        <GridLines perspective={grid === "perspective"} color={light ? C.deep : C.ivory} opacity={light ? 0.07 : 0.06} />
      ) : null}
      {children}
      <Vignette strength={light ? 0.18 : 0.6} />
      <Grain opacity={light ? 0.12 : 0.09} />
    </AbsoluteFill>
  );
};
