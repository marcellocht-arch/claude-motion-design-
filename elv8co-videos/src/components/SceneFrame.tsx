import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "./Background";
import { CLAMP } from "../anim";

/** Scene wrapper: background + a slow camera drift so nothing is ever static. */
export const SceneFrame: React.FC<{
  variant?: "night" | "deep" | "ivory" | "copper";
  seed?: string;
  grid?: boolean | "perspective";
  glow?: number;
  zoom?: [number, number];
  rotate?: number;
  back?: React.ReactNode;
  children?: React.ReactNode;
  dur?: number;
}> = ({ variant = "night", seed = "s", grid, glow = 1, zoom = [1, 1.05], rotate = 0, back, children, dur = 120 }) => {
  const frame = useCurrentFrame();
  const durationInFrames = dur;
  const s = interpolate(frame, [0, durationInFrames], zoom, CLAMP);
  const r = interpolate(frame, [0, durationInFrames], [0, rotate], CLAMP);
  return (
    <AbsoluteFill>
      <Background variant={variant} seed={seed} grid={grid} glow={glow}>
        {back}
      </Background>
      <AbsoluteFill style={{ transform: `scale(${s}) rotate(${r}deg)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Absolutely positioned horizontal-centred block. */
export const At: React.FC<{ y: number; x?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, x, children, style }) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: x ?? 0,
      right: x === undefined ? 0 : undefined,
      display: "flex",
      justifyContent: x === undefined ? "center" : "flex-start",
      ...style,
    }}
  >
    {children}
  </div>
);
