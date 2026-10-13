import React from "react";
import { AbsoluteFill } from "remotion";
import { C, W } from "../theme";
import { Background } from "../components/Background";
import { Moon, MoonPose } from "../components/Moon";

/** Planche de la mascotte : toutes les poses, bouche qui parle. */
const LIST: MoonPose[] = ["idle", "wave", "pointRight", "pointLeft", "pointUp", "open", "think"];

export const MoonSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <Background variant="night" seed="sheet" />
    {LIST.map((p, i) => (
      <React.Fragment key={p}>
        <Moon x={(W / 3) * ((i % 3) + 0.5)} y={120 + Math.floor(i / 3) * 560} size={300} poses={[[0, p]]} talk={i % 2 ? [[0, 999]] : []} />
        <div style={{ position: "absolute", left: (W / 3) * (i % 3), width: W / 3, top: 540 + Math.floor(i / 3) * 560, textAlign: "center", fontFamily: "JetBrains Mono", fontSize: 26, color: C.copperLight }}>{p}</div>
      </React.Fragment>
    ))}
    {(["house", "drop", "loaf"] as const).map((b, i) => (
      <Moon key={b} body={b} x={(W / 3) * ((i + 1) % 3 + 0.5) - (i === 2 ? 0 : 0)} y={1240 + (i === 2 ? 0 : 0)} size={240} poses={[[0, i === 1 ? "wave" : "open"]]} talk={[[0, 999]]} style={{ display: i === 0 ? "block" : "block" }} />
    ))}
  </AbsoluteFill>
);
