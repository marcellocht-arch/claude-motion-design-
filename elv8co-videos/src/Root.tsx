import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./theme";
import { V1_DURATION, V1PersonalBranding } from "./videos/V1PersonalBranding";
import { V2_DURATION, V2VideoContent } from "./videos/V2VideoContent";
import { V3_DURATION, V3Advertising } from "./videos/V3Advertising";
import { V4_DURATION, V4AllTogether } from "./videos/V4AllTogether";
import { MoonSheet } from "./videos/MoonSheet";
import { V5_DURATION, V5Geo } from "./videos/V5Geo";
import { V6_DURATION, V6Mascotte } from "./videos/V6Mascotte";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="V1-PersonalBranding" component={V1PersonalBranding} durationInFrames={V1_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V2-VideoContent" component={V2VideoContent} durationInFrames={V2_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V3-Advertising" component={V3Advertising} durationInFrames={V3_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V4-AllTogether" component={V4AllTogether} durationInFrames={V4_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V5-Geo" component={V5Geo} durationInFrames={V5_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V6-Mascotte" component={V6Mascotte} durationInFrames={V6_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="Lune-Poses" component={MoonSheet} durationInFrames={120} fps={FPS} width={W} height={H} />
    </>
  );
};
