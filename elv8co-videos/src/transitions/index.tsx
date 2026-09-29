import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { linearTiming, springTiming } from "@remotion/transitions";
import { C, EASE, GRAD, H, W } from "../theme";
import { CLAMP } from "../anim";

type Empty = Record<string, never>;
const make = <P extends Record<string, unknown>>(component: React.FC<TransitionPresentationComponentProps<P>>) =>
  (props: P = {} as P): TransitionPresentation<P> => ({ component, props });

export const timing = (frames: number, easing = EASE.inOut) => linearTiming({ durationInFrames: frames, easing });
export const springy = (frames: number) => springTiming({ durationInFrames: frames, config: { damping: 200 } });

/** Outgoing scene punches towards camera and blurs out, incoming settles from a zoom-out. */
export const zoomPunch = make<Empty>(({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ transform: `scale(${1 + p * 1.4})`, filter: `blur(${p * 24}px)`, opacity: 1 - interpolate(p, [0.4, 0.8], [0, 1], CLAMP) }}>
        {children}
      </AbsoluteFill>
    );
  }
  const q = interpolate(p, [0.35, 1], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{ transform: `scale(${0.75 + 0.25 * EASE.out(q)})`, filter: `blur(${(1 - q) * 16}px)`, opacity: q }}>
      {children}
    </AbsoluteFill>
  );
});

/** Outgoing scene splits in two halves which slide apart, revealing the next one. */
export const splitDoors = make<{ vertical?: boolean }>(({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "entering") {
    return <AbsoluteFill style={{ transform: `scale(${1.2 - 0.2 * p})` }}>{children}</AbsoluteFill>;
  }
  const d = EASE.snap(p);
  const v = passedProps.vertical;
  const half = (side: 0 | 1) => (
    <AbsoluteFill
      style={{
        clipPath: v ? (side ? "inset(50% 0 0 0)" : "inset(0 0 50% 0)") : side ? "inset(0 0 0 50%)" : "inset(0 50% 0 0)",
        transform: v ? `translateY(${(side ? 1 : -1) * d * H * 0.55}px)` : `translateX(${(side ? 1 : -1) * d * W * 0.6}px) rotate(${(side ? 1 : -1) * d * 4}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ zIndex: 2 }}>
      {half(0)}
      {half(1)}
      <AbsoluteFill
        style={{
          background: GRAD.copper,
          clipPath: v ? `inset(${50 - d * 4}% 0 ${50 - d * 4}% 0)` : `inset(0 ${50 - d * 3}% 0 ${50 - d * 3}%)`,
          opacity: 1 - d,
        }}
      />
    </AbsoluteFill>
  );
});

/** A diagonal copper band sweeps across; the new scene trails behind it. */
export const copperSweep = make<Empty>(({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `translateX(${-p * 120}px)` }}>{children}</AbsoluteFill>;
  }
  const skew = 500;
  const edge = interpolate(p, [0, 1], [-skew - 260, W + 260]);
  const band = 260;
  const reveal = `polygon(0 0, ${edge - band}px 0, ${edge - band - skew}px 100%, 0 100%)`;
  const bandPoly = `polygon(${edge - band}px 0, ${edge}px 0, ${edge - skew}px 100%, ${edge - band - skew}px 100%)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: reveal }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: bandPoly, background: `linear-gradient(90deg, ${C.copperDark}, ${C.copperLight} 60%, #F7C9A2)` }} />
    </AbsoluteFill>
  );
});

/** Horizontal blinds open with a stagger from the top. */
export const blinds = make<{ count?: number }>(({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ filter: `brightness(${1 - p * 0.5})` }}>{children}</AbsoluteFill>;
  }
  const n = passedProps.count ?? 9;
  const h = 100 / n;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const local = EASE.inOut(interpolate(p, [i * 0.05, i * 0.05 + 1 - (n - 1) * 0.05], [0, 1], CLAMP));
    const c = i * h + h / 2;
    const top = c - (h / 2) * local - 0.05;
    const bot = c + (h / 2) * local + 0.05;
    pts.push(`0% ${top}%`, `100% ${top}%`, `100% ${bot}%`, `0% ${bot}%`);
  }
  return <AbsoluteFill style={{ clipPath: `polygon(${pts.join(", ")})` }}>{children}</AbsoluteFill>;
});

/** Digital glitch: sliced offsets with copper/ivory tears, hard switch at mid-point. */
export const glitchSlice = make<Empty>(({ children, presentationDirection, presentationProgress: p }) => {
  const frame = useCurrentFrame();
  const visible = presentationDirection === "exiting" ? p < 0.5 : p >= 0.5;
  if (!visible) return null;
  const amt = 1 - Math.abs(p - 0.5) * 2; // peaks at 0.5
  const slices = 6;
  return (
    <AbsoluteFill>
      {new Array(slices).fill(0).map((_, i) => {
        const top = (i / slices) * 100;
        const off = (random(`gl${frame}${i}`) - 0.5) * 260 * amt;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${top}% 0 ${100 - top - 100 / slices}% 0)`, transform: `translateX(${off}px)` }}>
            {children}
          </AbsoluteFill>
        );
      })}
      {amt > 0.3
        ? new Array(4).fill(0).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: random(`gt${frame}${i}`) * H,
                height: 6 + random(`gh${frame}${i}`) * 40,
                background: i % 2 ? C.copperLight : C.ivory,
                opacity: 0.8 * amt,
                mixBlendMode: "screen",
              }}
            />
          ))
        : null}
    </AbsoluteFill>
  );
});

/** Rotating zoom: outgoing spins away small, incoming spins in from large. */
export const spinZoom = make<Empty>(({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "exiting") {
    const q = EASE.in(p);
    return <AbsoluteFill style={{ transform: `rotate(${q * 35}deg) scale(${1 - q * 0.7})`, opacity: 1 - interpolate(p, [0.5, 0.9], [0, 1], CLAMP) }}>{children}</AbsoluteFill>;
  }
  const q = EASE.out(interpolate(p, [0.3, 1], [0, 1], CLAMP));
  return (
    <AbsoluteFill style={{ transform: `rotate(${(1 - q) * -35}deg) scale(${2.2 - 1.2 * q})`, opacity: q, filter: `blur(${(1 - q) * 10}px)` }}>
      {children}
    </AbsoluteFill>
  );
});

/** Vertical push with motion blur and a slight scale — a "swipe" like on a phone. */
export const swipeUp = make<Empty>(({ children, presentationDirection, presentationProgress: p }) => {
  const q = EASE.snap(p);
  const blur = Math.sin(p * Math.PI) * 14;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `translateY(${-q * H}px) scale(${1 - q * 0.1})`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ transform: `translateY(${(1 - q) * H}px) scale(${0.9 + q * 0.1})`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
});

/** A copper circle grows from a point, then shrinks away revealing the new scene (2-phase ink). */
export const inkDrop = make<{ x?: number; y?: number }>(({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const x = passedProps.x ?? W / 2;
  const y = passedProps.y ?? H / 2;
  const R = Math.hypot(W, H);
  if (presentationDirection === "exiting") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  const grow = EASE.inOut(interpolate(p, [0, 0.55], [0, 1], CLAMP));
  const open = EASE.inOut(interpolate(p, [0.45, 1], [0, 1], CLAMP));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${grow * R}px at ${x}px ${y}px)`, background: GRAD.copper }} />
      <AbsoluteFill style={{ clipPath: `circle(${open * R}px at ${x}px ${y}px)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
});
