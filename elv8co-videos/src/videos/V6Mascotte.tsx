import React from "react";
import { AbsoluteFill, Audio, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";
import { C, EASE, F, GRAD, W } from "../theme";
import { pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, Words } from "../components/Kinetic";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo } from "../components/Logo";
import { EndCard } from "../components/EndCard";
import { Scene, SceneSeries, seriesDuration } from "../components/SceneSeries";
import { copperSweep, glitchSlice, inkDrop, splitDoors, swipeUp, timing } from "../transitions";
import { Bubble, Moon } from "../components/Moon";
import PLAN from "./v6plan.json";

/*
 * V6 — « Votre mascotte, à vous » : la vidéo qui vend le service « vidéo animée avec mascotte et voix off ».
 * Timeline calée sur le tempo (v6plan.json, lu aussi par scripts/son_v6.py).
 * Titres alignés à gauche (pas de titre centré sur dégradé), pas de gerbes de particules ni de lueurs sur les boutons.
 */

const BEAT_F = (PLAN.fps * 60) / PLAN.bpm;
const ST: Record<string, number> = {};
const DUR: Record<string, number> = {};
{
  let cum = 0;
  PLAN.scenes.forEach((sc, i) => {
    ST[sc.id] = Math.round(cum * BEAT_F);
    cum += sc.beats;
    const next = PLAN.scenes[i + 1];
    DUR[sc.id] = next ? Math.round(cum * BEAT_F) - ST[sc.id] + sc.exit : PLAN.endFrames;
  });
}

const BOLD: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 900, color: C.ivory, lineHeight: 1.02, letterSpacing: "-0.04em" };
const SUB: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 500, color: C.ivoryDim, lineHeight: 1.25, letterSpacing: "-0.01em" };
const MONO: React.CSSProperties = { fontFamily: F.mono, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" };
const X = 90;

// ─── 1. Accroche ───────────────────────────────────────────────────────────

const Hook: React.FC = () => {
  const dur = DUR.hook;
  return (
    <SceneFrame seed="v6hook" variant="night" dur={dur} zoom={[1.06, 1]} grid="perspective">
      <At y={300} x={X}>
        <Words lines={["Cette vidéo :"]} align="left" delay={2} stagger={3} mode="rise" style={{ ...SUB, fontSize: 64, color: C.ivory }} />
      </At>
      <At y={420} x={X}>
        <Words lines={["0 caméra."]} align="left" delay={14} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 150 }} />
      </At>
      <At y={590} x={X}>
        <Words lines={["0 acteur."]} align="left" delay={30} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 150 }} />
      </At>
      <At y={760} x={X}>
        <Words lines={["*1 mascotte.*"]} align="left" delay={48} stagger={3} mode="pop" style={{ fontSize: 170 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 176 }} />
      </At>
      <Moon x={W - 290} y={1080} size={460} delay={50} poses={[[0, "wave"], [90, "open"]]} talk={[[60, dur - 10]]} />
      <Bubble x={120} y={1180} at={70} text="Bonjour, c'est moi !" tail="right" />
    </SceneFrame>
  );
};

// ─── 2. Votre métier, c'est du jargon ──────────────────────────────────────

const JARGON = ["Franchise", "PEB", "Amortissement", "Prime énergie", "Compromis", "Garantie décennale", "Pompe à chaleur", "TVA", "Indexation", "Assurance RC"];

const Jargon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = DUR.jargon;
  const FALL = dur - 46;
  return (
    <SceneFrame seed="v6jar" variant="deep" dur={dur} zoom={[1, 1.03]}>
      <At y={260} x={X}>
        <Words lines={["Votre métier", "est *dur à expliquer ?*"]} align="left" delay={2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 88 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 100 }} />
      </At>
      {JARGON.map((j, i) => {
        const at = 20 + i * 9;
        const s = pop(frame, fps, at, SPRING.bouncy);
        const x = (i % 2 ? 470 : 80) + random(`jx${i}`) * 70;
        const y = 540 + i * 88;
        const rot = (random(`jr${i}`) - 0.5) * 16;
        const fall = Math.max(0, frame - FALL - i * 2);
        const fy = 0.5 * 2.2 * fall * fall;
        return (
          <div
            key={j}
            style={{
              position: "absolute",
              left: x,
              top: y + fy,
              padding: "16px 28px",
              borderRadius: 999,
              background: i % 3 === 0 ? "rgba(243,238,230,0.92)" : "rgba(243,238,230,0.1)",
              border: `2px solid ${C.ivory}44`,
              fontFamily: F.grotesk,
              fontWeight: 800,
              fontSize: 40,
              color: i % 3 === 0 ? C.deep : C.ivory,
              transform: `rotate(${rot + fall * (i % 2 ? 1.5 : -1.5)}deg) scale(${s})`,
              opacity: s > 0.01 ? 1 : 0,
              whiteSpace: "nowrap",
            }}
          >
            {j} ?
          </div>
        );
      })}
      <Moon x={W - 180} y={1450} size={230} delay={6} poses={[[0, "think"], [FALL, "open"]]} talk={[[10, dur - 10]]} />
    </SceneFrame>
  );
};

// ─── 3. La solution ────────────────────────────────────────────────────────

const STAMPS = ["Simple.", "Clair.", "Mémorable."];

const Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = DUR.solution;
  const phone = pop(frame, fps, 4, SPRING.snappy);
  return (
    <SceneFrame seed="v6sol" variant="night" dur={dur} zoom={[1, 1.04]} grid>
      <At y={250} x={X}>
        <Words lines={["Une mascotte", "*l'explique pour vous.*"]} align="left" delay={2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 88 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 100 }} />
      </At>
      <div style={{ position: "absolute", left: X, top: 560, width: 520, height: 900, borderRadius: 60, border: `5px solid ${C.ivory}`, background: C.abyss, overflow: "hidden", transform: `translateY(${(1 - phone) * 300}px)`, opacity: phone > 0.01 ? 1 : 0 }}>
        <div style={{ position: "absolute", left: 210, top: 18, width: 100, height: 24, borderRadius: 12, background: C.deep }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%, ${C.night}, ${C.abyss})` }} />
        <Moon x={260} y={200} size={380} delay={10} poses={[[0, "open"], [70, "pointUp"]]} talk={[[16, dur - 10]]} />
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 50, padding: "14px 18px", borderRadius: 16, background: "rgba(243,238,230,0.92)", fontFamily: F.grotesk, fontWeight: 800, fontSize: 32, color: C.deep, textAlign: "center", opacity: ramp(frame, [30, 40], [0, 1]) }}>
          « Une prime énergie ? Je vous explique. »
        </div>
      </div>
      <div style={{ position: "absolute", left: 660, top: 700, display: "flex", flexDirection: "column", gap: 70 }}>
        {STAMPS.map((t, i) => {
          const s = pop(frame, fps, 44 + i * 16, SPRING.bouncy);
          return (
            <div key={t} style={{ ...(i === 2 ? ACCENT_SERIF : BOLD), fontSize: i === 2 ? 76 : 64, transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`, transformOrigin: "0 50%", opacity: s > 0.01 ? 1 : 0 }}>
              {t}
            </div>
          );
        })}
      </div>
    </SceneFrame>
  );
};

// ─── 4. Galerie de mascottes d'exemple ─────────────────────────────────────

const GALLERY = [
  { body: "house" as const, metier: "Agence immobilière", line: "Le compromis ? C'est simple !" },
  { body: "drop" as const, metier: "Plombier chauffagiste", line: "Votre chaudière, en 30 secondes." },
  { body: "loaf" as const, metier: "Boulangerie", line: "Notre pain du dimanche !" },
];

const Gallery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = DUR.gallery;
  const slot = Math.round((dur - 18) / 3);
  // position du carrousel : somme de ressorts, un par changement (pas d'état entre les images)
  const pos = [1, 2].reduce((acc, k) => acc + pop(frame, fps, k * slot, SPRING.snappy), 0);
  return (
    <SceneFrame seed="v6gal" variant="deep" dur={dur} zoom={[1, 1.02]}>
      <At y={250} x={X}>
        <Words lines={["*À votre image.*"]} align="left" delay={2} stagger={3} mode="rise" style={{ fontSize: 110 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 120 }} />
      </At>
      <At y={400} x={X}>
        <div style={{ ...SUB, fontSize: 44, color: C.ivory, opacity: ramp(frame, [10, 20], [0, 1]) }}>Une mascotte pour chaque métier.</div>
      </At>
      {GALLERY.map((g, i) => {
        const off = (i - pos) * W;
        const cx = W / 2 + off;
        const local = frame - i * slot;
        return (
          <React.Fragment key={g.body}>
            <div style={{ position: "absolute", left: off, width: W, top: 560, textAlign: "center", ...MONO, fontSize: 30, color: C.copperLight }}>{g.metier}</div>
            <Moon body={g.body} x={cx} y={760} size={440} delay={i ? i * slot - 24 : 8} poses={[[0, "open"], [i * slot + 30, i === 1 ? "pointUp" : "wave"]]} talk={[[i * slot + 14, (i + 1) * slot - 6]]} />
            <Bubble x={cx - 330} y={640} at={i * slot + 18} until={(i + 1) * slot - 8} text={g.line} tail="bottom" width={660} style={{ textAlign: "center", opacity: local < -10 ? 0 : undefined }} />
          </React.Fragment>
        );
      })}
      {/* indicateur */}
      <div style={{ position: "absolute", left: W / 2 - 70, top: 1460, width: 140, height: 12, borderRadius: 6, background: `${C.ivory}22` }}>
        <div style={{ position: "absolute", top: 0, height: 12, borderRadius: 6, width: 140 / 3, left: (pos * 140) / 3, background: C.copperLight }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1510, textAlign: "center", ...MONO, fontSize: 22, color: C.steel }}>Exemples de mascottes</div>
    </SceneFrame>
  );
};

// ─── 5. Ce qui est compris ─────────────────────────────────────────────────

const INCLUDED: { icon: string[]; t: string }[] = [
  { icon: ICON.pen, t: "Votre mascotte, créée pour vous" },
  { icon: ICON.message, t: "Une voix off naturelle" },
  { icon: ICON.spark, t: "Une musique originale" },
  { icon: ICON.target, t: "Votre offre à la fin" },
  { icon: ICON.book, t: "Français, néerlandais, anglais…" },
  { icon: ICON.check, t: "Jusqu'à 3 retouches" },
];

const Included: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = DUR.included;
  const step = Math.floor((dur - 70) / INCLUDED.length);
  return (
    <SceneFrame seed="v6inc" variant="night" dur={dur} zoom={[1, 1.02]} grid>
      <At y={250} x={X}>
        <Words lines={["Tout est", "*compris.*"]} align="left" delay={2} stagger={4} mode="drop" style={{ ...BOLD, fontSize: 120 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 140 }} />
      </At>
      <div style={{ position: "absolute", left: X, right: 90, top: 580, display: "flex", flexDirection: "column", gap: 34 }}>
        {INCLUDED.map((it, i) => {
          const at = 30 + i * step;
          const s = pop(frame, fps, at, SPRING.snappy);
          return (
            <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 28, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 100}px)` }}>
              <div style={{ width: 104, height: 104, borderRadius: 30, flexShrink: 0, background: i % 2 ? "rgba(243,238,230,0.08)" : GRAD.copper, border: `2px solid ${C.copperLight}88`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DrawIcon paths={it.icon} progress={ramp(frame, [at + 4, at + 22], [0, 1])} size={52} color={i % 2 ? C.copperLight : C.deep} width={7} />
              </div>
              <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 52, color: C.ivory, letterSpacing: "-0.025em", lineHeight: 1.1, maxWidth: 680 }}>{it.t}</div>
            </div>
          );
        })}
      </div>
      <Moon x={W - 210} y={1430} size={300} delay={6} poses={[[0, "pointLeft"], [30 + 5 * step, "wave"]]} talk={[[10, dur - 12]]} />
    </SceneFrame>
  );
};

// ─── 6. Comment ça se passe ────────────────────────────────────────────────

const STEPS = [
  { t: "Un appel de 30 minutes", d: "On comprend votre métier et vos clients." },
  { t: "Le script, vous validez", d: "Vos mots, votre offre, votre ton." },
  { t: "Votre vidéo, prête", d: "À publier partout, en vertical ou en carré." },
];
const WHERE = ["Reels", "TikTok", "Site web", "Salons", "WhatsApp"];

const How: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = DUR.how;
  const gap = 230;
  const top = 560;
  const line = ramp(frame, [20, 20 + 2 * 50], [0, 1], EASE.inOut);
  return (
    <SceneFrame seed="v6how" variant="deep" dur={dur} zoom={[1, 1.03]}>
      <At y={250} x={X}>
        <Words lines={["En *3 étapes.*"]} align="left" delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 120 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 136 }} />
      </At>
      <div style={{ position: "absolute", left: X + 53, top: top + 55, width: 4, height: gap * 2 * line, background: `linear-gradient(180deg, ${C.copperLight}, ${C.copper})` }} />
      {STEPS.map((st, i) => {
        const at = 20 + i * 50;
        const s = pop(frame, fps, at, SPRING.bouncy);
        return (
          <div key={st.t} style={{ position: "absolute", left: X, right: 90, top: top + i * gap, display: "flex", gap: 34 }}>
            <div style={{ width: 110, height: 110, borderRadius: 55, flexShrink: 0, background: i === 2 ? GRAD.copper : C.deep, border: `3px solid ${C.copperLight}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.condensed, fontSize: 60, color: i === 2 ? C.deep : C.copperLight, transform: `scale(${s})` }}>{i + 1}</div>
            <div style={{ paddingTop: 10, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 60}px)` }}>
              <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 56, color: C.ivory, letterSpacing: "-0.03em" }}>{st.t}</div>
              <div style={{ ...SUB, fontSize: 38, marginTop: 6 }}>{st.d}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: X, right: 90, top: top + 3 * gap + 20, display: "flex", flexWrap: "wrap", gap: 16 }}>
        {WHERE.map((w, i) => {
          const s = pop(frame, fps, 140 + i * 6, SPRING.bouncy);
          return (
            <div key={w} style={{ padding: "14px 28px", borderRadius: 999, border: `2px solid ${C.copperLight}88`, fontFamily: F.grotesk, fontWeight: 700, fontSize: 36, color: C.ivory, transform: `scale(${s})`, opacity: s > 0.01 ? 1 : 0 }}>
              {w}
            </div>
          );
        })}
      </div>
    </SceneFrame>
  );
};

// ─── 7. Appel à l'action ───────────────────────────────────────────────────

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = DUR.cta;
  return (
    <SceneFrame seed="v6cta" variant="night" dur={dur} zoom={[1.04, 1]} grid="perspective">
      <At y={280} x={X}>
        <Words lines={["Votre mascotte,", "*à vous.*"]} align="left" delay={2} stagger={4} mode="drop" style={{ ...BOLD, fontSize: 120 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 150 }} />
      </At>
      <At y={600} x={X}>
        <div style={{ ...SUB, fontSize: 44, color: C.ivory, opacity: ramp(frame, [30, 42], [0, 1]) }}>
          La preuve : <span style={{ ...ACCENT_SERIF, fontSize: 52 }}>vous venez d'en regarder une.</span>
        </div>
      </At>
      <Bubble x={110} y={930} at={50} text="Écrivez-moi sur WhatsApp !" tail="right" />
      <Moon x={W / 2 + 200} y={1050} size={440} delay={4} poses={[[0, "open"], [50, "wave"]]} talk={[[8, dur - 14]]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", fontFamily: F.grotesk, fontWeight: 900, fontSize: 64, color: C.copperLight, opacity: ramp(frame, [70, 82], [0, 1]), letterSpacing: "-0.02em" }}>
        0470 35 43 90
      </div>
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EXITS: Record<string, TransitionPresentation<any>> = {
  hook: swipeUp(),
  jargon: glitchSlice(),
  solution: wipe({ direction: "from-right" }),
  gallery: splitDoors(),
  included: inkDrop({ x: W / 2, y: 1400 }),
  how: swipeUp(),
  cta: copperSweep(),
};
const ELEMENTS: Record<string, React.ReactNode> = {
  hook: <Hook />,
  jargon: <Jargon />,
  solution: <Solution />,
  gallery: <Gallery />,
  included: <Included />,
  how: <How />,
  cta: <Cta />,
  end: <EndCard />,
};

export const SCENES_V6: Scene[] = PLAN.scenes.map((sc) => ({
  id: sc.id,
  duration: DUR[sc.id],
  element: ELEMENTS[sc.id],
  exit: sc.exit ? { presentation: EXITS[sc.id], timing: timing(sc.exit, sc.id === "jargon" ? (t: number) => t : undefined) } : undefined,
}));

export const V6_DURATION = seriesDuration(SCENES_V6);

export const V6Mascotte: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <SceneSeries scenes={SCENES_V6} />
    <Sequence from={-60} layout="none">
      <BrandLogo variant="slot" handoff={60} hideAt={ST.end + 60} />
    </Sequence>
    <Audio src={staticFile("son-v6.m4a")} />
  </AbsoluteFill>
);
