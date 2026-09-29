import { interpolate, spring, SpringConfig } from "remotion";
import { BEAT, EASE } from "./theme";

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Clamped, eased interpolation. */
export const ramp = (
  f: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = EASE.out,
) => interpolate(f, input, output, { ...CLAMP, easing });

export const SPRING = {
  snappy: { damping: 14, mass: 0.6, stiffness: 170 },
  bouncy: { damping: 9, mass: 0.7, stiffness: 150 },
  soft: { damping: 20, mass: 1, stiffness: 90 },
  heavy: { damping: 13, mass: 1.4, stiffness: 120 },
} satisfies Record<string, Partial<SpringConfig>>;

export const pop = (
  frame: number,
  fps: number,
  delay = 0,
  config: Partial<SpringConfig> = SPRING.snappy,
) => spring({ frame: frame - delay, fps, config });

/** 1 on each beat, decaying exponentially until the next one. */
export const beatPulse = (frame: number, offset = 0, sharpness = 6) => {
  if (frame < offset) return 0;
  const p = ((frame - offset) % BEAT) / BEAT;
  return Math.exp(-p * sharpness);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
