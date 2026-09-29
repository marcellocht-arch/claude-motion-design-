import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./theme";
import { V1_DURATION, V1PersonalBranding } from "./videos/V1PersonalBranding";
import { V2_DURATION, V2VideoContent } from "./videos/V2VideoContent";
import { V3_DURATION, V3Advertising } from "./videos/V3Advertising";
import { V4_DURATION, V4AllTogether } from "./videos/V4AllTogether";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="V1-PersonalBranding" component={V1PersonalBranding} durationInFrames={V1_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V2-VideoContent" component={V2VideoContent} durationInFrames={V2_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V3-Advertising" component={V3Advertising} durationInFrames={V3_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V4-AllTogether" component={V4AllTogether} durationInFrames={V4_DURATION} fps={FPS} width={W} height={H} />
    </>
  );
};
