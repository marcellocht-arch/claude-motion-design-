import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, F } from "../theme";
import { pop, ramp, SPRING } from "../anim";
import { Background } from "./Background";
import { Dust, Flash } from "./Particles";
import { OutroLogo } from "./Logo";
import { ACCENT_SERIF, Words } from "./Kinetic";
import { DrawIcon, ICON } from "./Icons";

export const END_CARD_DURATION = 165;

const Pill: React.FC<{ icon: string[]; text: string; delay: number; from: -1 | 1 }> = ({ icon, text, delay, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, SPRING.snappy);
  const border = ramp(frame, [delay, delay + 20], [0, 1]);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "26px 44px",
        borderRadius: 999,
        border: `2px solid rgba(224,144,85,${0.25 + 0.55 * border})`,
        background: "rgba(13,27,42,0.55)",
        boxShadow: `0 0 ${40 * border}px rgba(200,121,65,0.18)`,
        transform: `translateX(${(1 - s) * from * 700}px)`,
        opacity: s > 0.01 ? 1 : 0,
      }}
    >
      <DrawIcon paths={icon} progress={ramp(frame, [delay + 4, delay + 22], [0, 1])} size={44} width={7} />
      <span style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 46, color: C.ivory, letterSpacing: "0.01em" }}>{text}</span>
    </div>
  );
};

/** Identical closing card for the four videos. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const line = ramp(frame, [34, 56], [0, 1], EASE.inOut);
  return (
    <AbsoluteFill>
      <Background variant="deep" seed="end" grid="perspective" glow={1.1} />
      <Dust count={36} seed="enddust" speed={0.6} />
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div style={{ position: "absolute", top: 400 }}>
          <OutroLogo size={250} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 770,
            width: 620 * line,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${C.copperLight}, transparent)`,
          }}
        />
        <div style={{ position: "absolute", top: 830 }}>
          <Words
            lines={["Prêt à devenir", "*visible ?*"]}
            delay={40}
            stagger={4}
            mode="rise"
            style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 96, color: C.ivory, lineHeight: 1.05, letterSpacing: "-0.02em" }}
            lineStyles={[undefined, { fontSize: 170, lineHeight: 1 }]}
            accentStyle={ACCENT_SERIF}
          />
        </div>
        <div style={{ position: "absolute", top: 1150 }}>
          <Words
            lines={["Un appel de 30 minutes suffit."]}
            delay={60}
            stagger={2}
            mode="blur"
            style={{ fontFamily: F.grotesk, fontWeight: 500, fontSize: 50, color: C.ivoryDim }}
          />
        </div>
        <div style={{ position: "absolute", top: 1270, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <Pill icon={ICON.mail} text="contact@elv8co.be" delay={72} from={-1} />
          <Pill icon={ICON.phone} text="+32 470 35 43 90" delay={78} from={1} />
        </div>
      </AbsoluteFill>
      <Flash at={27} color={C.copperLight} max={0.22} duration={12} />
    </AbsoluteFill>
  );
};
