import React from "react";
import { TransitionSeries } from "@remotion/transitions";
import type { TransitionPresentation, TransitionTiming } from "@remotion/transitions";

export type Scene = {
  id: string;
  duration: number;
  element: React.ReactNode;
  /** transition played after this scene */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exit?: { presentation: TransitionPresentation<any>; timing: TransitionTiming };
};

const exitFrames = (s: Scene) => (s.exit ? s.exit.timing.getDurationInFrames({ fps: 30 }) : 0);

export const seriesDuration = (scenes: Scene[]) =>
  scenes.reduce((acc, s, i) => acc + s.duration - (i < scenes.length - 1 ? exitFrames(s) : 0), 0);

/** Frame at which each scene starts (after overlaps). */
export const sceneStarts = (scenes: Scene[]) => {
  const out: Record<string, number> = {};
  let t = 0;
  scenes.forEach((s) => {
    out[s.id] = t;
    t += s.duration - exitFrames(s);
  });
  return out;
};

export const SceneSeries: React.FC<{ scenes: Scene[] }> = ({ scenes }) => (
  <TransitionSeries>
    {scenes.map((s, i) => (
      <React.Fragment key={s.id}>
        <TransitionSeries.Sequence durationInFrames={s.duration} name={s.id} premountFor={20}>
          {s.element}
        </TransitionSeries.Sequence>
        {s.exit && i < scenes.length - 1 ? <TransitionSeries.Transition presentation={s.exit.presentation} timing={s.exit.timing} /> : null}
      </React.Fragment>
    ))}
  </TransitionSeries>
);
