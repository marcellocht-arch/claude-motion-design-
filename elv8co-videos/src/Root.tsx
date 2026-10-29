import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./theme";
import { V1_DURATION, V1PersonalBranding } from "./videos/V1PersonalBranding";
import { V2_DURATION, V2VideoContent } from "./videos/V2VideoContent";
import { V3_DURATION, V3Advertising } from "./videos/V3Advertising";
import { V4_DURATION, V4AllTogether } from "./videos/V4AllTogether";
import { MoonSheet } from "./videos/MoonSheet";
import { L2Decors } from "./videos/L2Decors";
import { L3_LONG_DURATION, L3_SHORT_DURATION, L3Long, L3Short } from "./videos/L3Julien";
import { L2_LONG_DURATION, L2_SHORT_DURATION, L2Long, L2Short } from "./videos/L2Sophie";
import { V5_DURATION, V5Geo } from "./videos/V5Geo";
import { V6_DURATION, V6Mascotte } from "./videos/V6Mascotte";
import { L1_LONG_DURATION, L1_SHORT_DURATION, L1Long, L1Short } from "./videos/L1Commerce";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="V1-PersonalBranding" component={V1PersonalBranding} durationInFrames={V1_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V2-VideoContent" component={V2VideoContent} durationInFrames={V2_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V3-Advertising" component={V3Advertising} durationInFrames={V3_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V4-AllTogether" component={V4AllTogether} durationInFrames={V4_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V5-Geo" component={V5Geo} durationInFrames={V5_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="V6-Mascotte" component={V6Mascotte} durationInFrames={V6_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="L1-Long" component={L1Long} durationInFrames={L1_LONG_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="L1-Short" component={L1Short} durationInFrames={L1_SHORT_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="L2-Long" component={L2Long} durationInFrames={L2_LONG_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="L2-Short" component={L2Short} durationInFrames={L2_SHORT_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="L3-Long" component={L3Long} durationInFrames={L3_LONG_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="L3-Short" component={L3Short} durationInFrames={L3_SHORT_DURATION} fps={FPS} width={W} height={H} />
      <Composition id="L2-Decors" component={L2Decors} durationInFrames={60} fps={FPS} width={W} height={H} />
      <Composition id="Lune-Poses" component={MoonSheet} durationInFrames={120} fps={FPS} width={W} height={H} />
    </>
  );
};
