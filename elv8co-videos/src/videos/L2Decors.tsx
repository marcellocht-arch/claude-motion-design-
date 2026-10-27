import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { Background } from "../components/Background";
import { Boiler, PhoneDeadPage, PhoneFiche, PhoneMaps, PhoneVideo, Radiator, Sophie, Street, Van } from "../components/Props";

/** Planche des décors générés pour la vidéo 2 « Le parcours de Sophie » (contrôle visuel). */
const Label: React.FC<{ children: React.ReactNode; x: number; y: number }> = ({ children, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: F.mono, fontWeight: 700, fontSize: 26, letterSpacing: "0.15em", color: C.copperLight, textTransform: "uppercase" }}>{children}</div>
);

export const L2Decors: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <Background variant="night" seed="decors" />
    <div style={{ position: "absolute", left: 0, top: 40, transform: "scale(0.5)", transformOrigin: "0 0", width: 2160 }}>
      <Street width={2160} />
    </div>
    <Label x={40} y={600}>Rue liégeoise</Label>
    <div style={{ position: "absolute", left: 40, top: 660 }}>
      <Sophie size={200} mood="worried" phone />
    </div>
    <Label x={40} y={980}>Sophie</Label>
    <div style={{ position: "absolute", left: 300, top: 660 }}>
      <Boiler size={190} />
    </div>
    <Label x={300} y={950}>Chaudière</Label>
    <div style={{ position: "absolute", left: 540, top: 700 }}>
      <Radiator size={240} warm={1} />
    </div>
    <Label x={540} y={880}>Radiateur</Label>
    <div style={{ position: "absolute", left: 790, top: 640, transform: "scale(0.6)", transformOrigin: "0 0" }}>
      <PhoneFiche />
    </div>
    <Label x={790} y={1150}>Fiche Google</Label>
    <div style={{ position: "absolute", left: 540, top: 920 }}>
      <Van size={260} />
    </div>
    {[<PhoneMaps key="m" highlight={2} />, <PhoneDeadPage key="d" />, <PhoneVideo key="v" />].map((p, i) => (
      <div key={i} style={{ position: "absolute", left: 20 + i * 265, top: 1200, transform: "scale(0.6)", transformOrigin: "0 0" }}>
        {p}
      </div>
    ))}
    <Label x={40} y={1720}>Écrans : carte · page abandonnée · vidéo du patron</Label>
  </AbsoluteFill>
);
