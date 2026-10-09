import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { C, EASE, F, GRAD, H, W } from "../theme";
import { beatPulse, pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, OutlineFill, Tag, Typewriter, Words } from "../components/Kinetic";
import { Burst, Dust, Flash, Ring } from "../components/Particles";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo } from "../components/Logo";
import { END_CARD_DURATION, EndCard } from "../components/EndCard";
import { Scene, SceneSeries, sceneStarts, seriesDuration } from "../components/SceneSeries";
import { blinds, copperSweep, glitchSlice, inkDrop, splitDoors, swipeUp, timing, zoomPunch } from "../transitions";
import { Bubble, Moon, MoonPose } from "../components/Moon";

/*
 * V5 — « Le GEO expliqué par la lune »
 * La lune (mascotte ELV8co) parle pendant les fenêtres `talk` de chaque scène.
 * Le script de voix off minuté est dans VOIX-OFF-V5-GEO.md (même découpage que SCENES).
 */

const BOLD: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 900, color: C.ivory, lineHeight: 1.04, letterSpacing: "-0.035em" };
const SUB: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 500, color: C.ivoryDim, lineHeight: 1.25, letterSpacing: "-0.01em" };
const MONO: React.CSSProperties = { fontFamily: F.mono, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" };

/** Lune dans le coin bas droit pendant les explications. */
const CornerMoon: React.FC<{ dur: number; poses?: [number, MoonPose][]; talk?: [number, number][]; left?: boolean }> = ({ dur, poses, talk, left }) => (
  <Moon x={left ? 170 : W - 170} y={1395} size={250} delay={4} poses={poses ?? [[0, left ? "pointUp" : "idle"]]} talk={talk ?? [[10, dur - 24]]} />
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; s?: number }> = ({ children, style, s = 1 }) => (
  <div
    style={{
      borderRadius: 30,
      background: "rgba(243,238,230,0.07)",
      border: `2px solid ${C.copperLight}55`,
      opacity: Math.min(1, s * 1.5),
      transform: `translateY(${(1 - s) * 50}px)`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── 1. Bonjour ────────────────────────────────────────────────────────────

const Hello: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFrame seed="v5hello" variant="night" dur={200} zoom={[1, 1.04]} grid="perspective">
      <Dust count={30} seed="v5stars" />
      {new Array(40).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: random(`sx${i}`) * W,
            top: random(`sy${i}`) * H * 0.6,
            width: 4,
            height: 4,
            borderRadius: 2,
            background: C.ivory,
            opacity: 0.25 + 0.5 * Math.abs(Math.sin(frame / 14 + i)),
          }}
        />
      ))}
      <Moon x={W / 2} y={560} size={560} delay={6} poses={[[0, "wave"], [110, "open"]]} talk={[[16, 70], [80, 176]]} />
      <At y={300}>
        <Words lines={["Le *GEO,*"]} delay={20} stagger={4} mode="drop" style={{ ...BOLD, fontSize: 130 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 160 }} />
      </At>
      <At y={1350}>
        <Words lines={["expliqué par la lune", "*d'ELV8.*"]} delay={60} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 76 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 96 }} />
      </At>
    </SceneFrame>
  );
};

// ─── 2. Avant / maintenant ─────────────────────────────────────────────────

const SearchVsAsk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SWITCH = 170;
  const a = 1 - ramp(frame, [SWITCH - 10, SWITCH + 6], [0, 1], EASE.in);
  const b = ramp(frame, [SWITCH, SWITCH + 16], [0, 1]);
  const ans = pop(frame, fps, SWITCH + 110, SPRING.snappy);
  return (
    <SceneFrame seed="v5shift" variant="deep" dur={420} zoom={[1, 1.03]}>
      {/* Phase A : moteur classique */}
      <div style={{ opacity: a, transform: `translateX(${(1 - a) * -200}px)` }}>
        <At y={250}>
          <Tag>Avant</Tag>
        </At>
        <At y={320}>
          <Words lines={["On tapait *3 mots.*"]} delay={2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 92 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 110 }} />
        </At>
        <div style={{ position: "absolute", left: 90, right: 90, top: 500, height: 100, borderRadius: 50, background: C.ivory, display: "flex", alignItems: "center", padding: "0 40px", gap: 24 }}>
          <DrawIcon paths={["M42 42 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", "M60 60 L84 84"]} progress={1} size={46} color={C.deep} width={9} />
          <Typewriter text="garage liège" start={16} cps={12} style={{ fontFamily: F.grotesk, fontWeight: 600, fontSize: 46, color: C.deep }} caretColor={C.copper} />
        </div>
        <div style={{ position: "absolute", left: 90, right: 90, top: 650, display: "flex", flexDirection: "column", gap: 22 }}>
          {new Array(10).fill(0).map((_, i) => {
            const s = pop(frame, fps, 44 + i * 5, SPRING.snappy);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, opacity: Math.min(1, s * 1.4) * (i < 4 ? 1 : 0.6 - i * 0.04), transform: `translateY(${(1 - s) * 30}px)` }}>
                <div style={{ width: `${70 - ((i * 13) % 30)}%`, height: 20, borderRadius: 10, background: `${C.copperLight}AA` }} />
                <div style={{ width: `${90 - ((i * 17) % 25)}%`, height: 12, borderRadius: 6, background: `${C.ivory}33` }} />
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 90, top: 1420, ...MONO, fontSize: 30, color: C.copperLight, opacity: ramp(frame, [110, 120], [0, 1]) }}>→ 10 liens à trier</div>
      </div>
      {/* Phase B : on demande à une IA */}
      <div style={{ opacity: b, transform: `translateX(${(1 - b) * 200}px)` }}>
        <At y={250}>
          <Tag>Aujourd'hui</Tag>
        </At>
        <At y={320}>
          <Words lines={["On *pose la question*", "à une IA."]} delay={SWITCH + 2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 88 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 104 }} />
        </At>
        <div style={{ position: "absolute", right: 90, top: 590, maxWidth: 760, padding: "26px 34px", borderRadius: "34px 34px 8px 34px", background: GRAD.copper, color: C.deep, fontFamily: F.grotesk, fontWeight: 700, fontSize: 44, lineHeight: 1.2 }}>
          <Typewriter text={"Quel garage de confiance\nprès de Liège ?"} start={SWITCH + 30} cps={22} style={{ whiteSpace: "pre" }} caretColor={C.deep} />
        </div>
        <div style={{ position: "absolute", left: 90, right: 150, top: 800, padding: "30px 34px", borderRadius: "34px 34px 34px 8px", background: "rgba(243,238,230,0.08)", border: `2px solid ${C.ivory}22`, opacity: Math.min(1, ans * 1.5), transform: `translateY(${(1 - ans) * 40}px)` }}>
          <div style={{ ...MONO, fontSize: 22, color: C.copperLight, marginBottom: 18 }}>Réponse de l'IA</div>
          {["Garage A", "Garage B", "Garage C"].map((g, i) => {
            const s = pop(frame, fps, SWITCH + 125 + i * 14, SPRING.snappy);
            return (
              <div key={g} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 40}px)` }}>
                <div style={{ width: 46, height: 46, borderRadius: 23, background: GRAD.copper, color: C.deep, fontFamily: F.grotesk, fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 42, color: C.ivory }}>{g}</div>
                <div style={{ flex: 1, height: 12, borderRadius: 6, background: `${C.ivory}22` }} />
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 90, top: 1240, ...BOLD, fontSize: 64, maxWidth: 640, opacity: ramp(frame, [SWITCH + 190, SWITCH + 204], [0, 1]) }}>
          Pas 10 liens.
          <br />
          <span style={{ ...ACCENT_SERIF, fontSize: 74 }}>Quelques noms.</span>
        </div>
      </div>
      <CornerMoon dur={420} poses={[[0, "pointUp"], [SWITCH, "pointLeft"], [SWITCH + 120, "open"]]} talk={[[10, 150], [SWITCH + 6, 396]]} />
    </SceneFrame>
  );
};

// ─── 3. Comment marche un moteur de recherche IA ───────────────────────────

const SOURCES = ["Sites web", "Fiches Google", "Avis clients", "Annuaires", "Articles"];

const HowAIWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cx = W / 2;
  const cy = 900;
  const s1 = pop(frame, fps, 20, SPRING.snappy);
  const s2 = pop(frame, fps, 70, SPRING.bouncy);
  const s3 = pop(frame, fps, 250, SPRING.snappy);
  const label = (n: string, t: string, y: number, at: number) => (
    <div style={{ position: "absolute", left: 90, top: y, display: "flex", alignItems: "center", gap: 16, opacity: ramp(frame, [at, at + 10], [0, 1]) }}>
      <div style={{ width: 52, height: 52, borderRadius: 26, border: `2px solid ${C.copperLight}`, ...MONO, letterSpacing: 0, fontSize: 26, color: C.copperLight, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
      <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 38, color: C.ivory }}>{t}</div>
    </div>
  );
  return (
    <SceneFrame seed="v5how" variant="night" dur={450} zoom={[1, 1.03]} grid>
      <At y={250}>
        <Tag>Comment ça marche</Tag>
      </At>
      <At y={320}>
        <Words lines={["Dans la tête", "d'une *IA de recherche.*"]} delay={2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 80 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 96 }} />
      </At>
      {label("1", "Vous posez une question", 520, 14)}
      <div style={{ position: "absolute", left: 180, top: 590, padding: "16px 26px", borderRadius: 24, background: GRAD.copper, color: C.deep, fontFamily: F.grotesk, fontWeight: 700, fontSize: 34, transform: `scale(${s1})`, transformOrigin: "0 0" }}>
        « Meilleur fleuriste à Liège ? »
      </div>
      {label("2", "Elle lit le web", 700, 64)}
      {/* cerveau IA */}
      <div style={{ position: "absolute", left: cx - 110, top: cy - 110 + 40, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${C.copper}, ${C.copperDark})`, boxShadow: `0 0 ${60 + beatPulse(frame) * 40}px ${C.copper}`, transform: `scale(${s2 * (1 + beatPulse(frame) * 0.04)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `rotate(${frame * 1.2}deg)` }}>
          <DrawIcon paths={ICON.spark} progress={ramp(frame, [74, 100], [0, 1])} size={120} color={C.ivory} width={6} />
        </div>
      </div>
      {/* sources qui affluent */}
      {SOURCES.map((src, i) => {
        const side = i % 2 ? 1 : -1;
        const appear = 90 + i * 22;
        const s = pop(frame, fps, appear, SPRING.snappy);
        const sx = cx + side * 330;
        const sy = 790 + i * 70;
        const t = ((frame - appear - 20) % 60) / 60;
        const flowing = frame > appear + 20;
        return (
          <React.Fragment key={src}>
            <div style={{ position: "absolute", left: sx - 140, top: sy - 30, width: 280, textAlign: "center", padding: "12px 0", borderRadius: 20, background: "rgba(7,15,24,0.7)", border: `2px solid ${C.ivory}33`, fontFamily: F.grotesk, fontWeight: 700, fontSize: 30, color: C.ivory, transform: `scale(${s})` }}>{src}</div>
            {flowing ? (
              <div style={{ position: "absolute", left: interpolate(t, [0, 1], [sx - side * 140, cx]) - 7, top: interpolate(t, [0, 1], [sy, cy + 40]) - 7, width: 14, height: 14, borderRadius: 7, background: C.copperLight, opacity: Math.sin(t * Math.PI) }} />
            ) : null}
          </React.Fragment>
        );
      })}
      {label("3", "Elle résume et cite ses sources", 1120, 240)}
      <div style={{ position: "absolute", left: 90, right: 330, top: 1190, padding: "22px 28px", borderRadius: 24, background: "rgba(243,238,230,0.08)", border: `2px solid ${C.copperLight}66`, opacity: Math.min(1, s3 * 1.5), transform: `translateY(${(1 - s3) * 40}px)` }}>
        <div style={{ height: 14, width: "90%", borderRadius: 7, background: `${C.ivory}44`, marginBottom: 12 }} />
        <div style={{ height: 14, width: "70%", borderRadius: 7, background: `${C.ivory}44`, marginBottom: 18 }} />
        <div style={{ display: "flex", gap: 12 }}>
          {["[1]", "[2]", "[3]"].map((c, i) => (
            <div key={c} style={{ ...MONO, letterSpacing: "0.05em", fontSize: 26, color: C.deep, background: C.copperLight, borderRadius: 10, padding: "4px 12px", transform: `scale(${pop(frame, fps, 270 + i * 10, SPRING.bouncy)})` }}>{c}</div>
          ))}
        </div>
      </div>
      <CornerMoon dur={450} poses={[[0, "pointUp"], [120, "think"], [250, "pointLeft"]]} talk={[[8, 60], [70, 230], [246, 426]]} />
    </SceneFrame>
  );
};

// ─── 4. Les moteurs concernés ──────────────────────────────────────────────

const ENGINES = ["ChatGPT", "Perplexity", "Gemini", "Copilot", "Google · réponses IA", "Claude"];

const Engines: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFrame seed="v5eng" variant="deep" dur={220} zoom={[1.04, 1]}>
      <At y={260}>
        <Tag>Où ça se passe</Tag>
      </At>
      <At y={330}>
        <Words lines={["Les nouveaux", "*moteurs de recherche.*"]} delay={2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 82 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 98 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 620, display: "flex", flexWrap: "wrap", gap: 26, justifyContent: "center" }}>
        {ENGINES.map((e, i) => {
          const s = pop(frame, fps, 24 + i * 12, SPRING.bouncy);
          const float = Math.sin(frame / 14 + i) * 8;
          return (
            <div key={e} style={{ padding: "26px 40px", borderRadius: 999, background: i === 4 ? GRAD.copper : "rgba(243,238,230,0.08)", border: `2px solid ${C.copperLight}77`, fontFamily: F.grotesk, fontWeight: 800, fontSize: 48, color: i === 4 ? C.deep : C.ivory, transform: `translateY(${float}px) scale(${s})`, opacity: s > 0.01 ? 1 : 0 }}>
              {e}
            </div>
          );
        })}
      </div>
      <At y={1120}>
        <Words lines={["Et même *tout en haut*", "de Google."]} delay={100} stagger={3} mode="blur" style={{ ...SUB, fontSize: 56, color: C.ivory }} accentStyle={{ ...ACCENT_SERIF, fontSize: 66 }} />
      </At>
      <CornerMoon dur={220} poses={[[0, "open"], [100, "pointLeft"]]} />
    </SceneFrame>
  );
};

// ─── 5. Définition ─────────────────────────────────────────────────────────

const Definition: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFrame seed="v5def" variant="night" dur={240} zoom={[1, 1.05]} grid="perspective">
      <At y={330}>
        <OutlineFill text="GEO" progress={ramp(frame, [6, 50], [0, 1], EASE.inOut)} stroke={C.copperLight} style={{ fontFamily: F.condensed, fontSize: 380, lineHeight: 1 }} />
      </At>
      <At y={760}>
        <div style={{ ...MONO, fontSize: 30, color: C.ivoryDim, opacity: ramp(frame, [30, 44], [0, 1]) }}>Generative Engine Optimization</div>
      </At>
      <At y={880}>
        <Words lines={["=", "être *cité*", "dans les réponses", "des IA."]} delay={56} stagger={4} mode="pop" style={{ ...BOLD, fontSize: 92, lineHeight: 1.08 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 116 }} />
      </At>
      <Ring at={56} x={W / 2} y={520} size={1200} />
      <CornerMoon dur={240} poses={[[0, "pointUp"], [140, "open"]]} left />
    </SceneFrame>
  );
};

// ─── 6. Tableau SEO vs GEO ─────────────────────────────────────────────────

const COMPARE: { k: string; seo: string; geo: string }[] = [
  { k: "Objectif", seo: "Être dans les 10 liens", geo: "Être cité dans la réponse" },
  { k: "Le client voit", seo: "Une liste", geo: "Une recommandation" },
  { k: "Ce qui compte", seo: "Mots-clés, liens", geo: "Faits clairs, sources, avis" },
  { k: "Résultat", seo: "Un clic, peut-être", geo: "Un nom retenu" },
];

const CompareTable: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colK = 200;
  const col = (W - 180 - colK - 20) / 2;
  const head = pop(frame, fps, 20, SPRING.snappy);
  const sweep = ramp(frame, [250, 300], [-0.2, 1.2], EASE.inOut);
  return (
    <SceneFrame seed="v5cmp" variant="deep" dur={420} zoom={[1, 1.03]} grid>
      <At y={250}>
        <Tag>Le match</Tag>
      </At>
      <At y={320}>
        <Words lines={["SEO *contre* GEO"]} delay={2} stagger={4} mode="drop" style={{ ...BOLD, fontSize: 104 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 120 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 520 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
          <div style={{ width: colK }} />
          <div style={{ width: col, padding: "18px 0", textAlign: "center", borderRadius: 20, background: "rgba(243,238,230,0.1)", fontFamily: F.grotesk, fontWeight: 900, fontSize: 44, color: C.ivoryDim }}>SEO</div>
          <div style={{ width: col, padding: "18px 0", textAlign: "center", borderRadius: 20, background: GRAD.copper, fontFamily: F.grotesk, fontWeight: 900, fontSize: 44, color: C.deep, position: "relative", overflow: "hidden" }}>
            GEO
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sweep * 100}%`, width: 60, background: "rgba(255,255,255,0.5)", transform: "skewX(-20deg)" }} />
          </div>
        </div>
        {COMPARE.map((r, i) => {
          const d = 50 + i * 50;
          const s = pop(frame, fps, d, SPRING.snappy);
          const g = pop(frame, fps, d + 16, SPRING.bouncy);
          return (
            <div key={r.k} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "stretch" }}>
              <div style={{ width: colK, display: "flex", alignItems: "center", ...MONO, letterSpacing: "0.1em", fontSize: 21, lineHeight: 1.3, color: C.copperLight, opacity: ramp(frame, [d - 6, d + 4], [0, 1]) }}>{r.k}</div>
              <div style={{ width: col, padding: "22px 20px", borderRadius: 18, background: "rgba(7,15,24,0.6)", border: `2px solid ${C.ivory}18`, fontFamily: F.grotesk, fontWeight: 500, fontSize: 38, color: C.ivoryDim, lineHeight: 1.15, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * -60}px)` }}>{r.seo}</div>
              <div style={{ width: col, padding: "22px 20px", borderRadius: 18, background: `${C.copper}26`, border: `2px solid ${C.copperLight}AA`, fontFamily: F.grotesk, fontWeight: 800, fontSize: 38, color: C.ivory, lineHeight: 1.15, opacity: Math.min(1, g * 1.5), transform: `translateX(${(1 - g) * 60}px) scale(${0.9 + 0.1 * g})` }}>{r.geo}</div>
            </div>
          );
        })}
      </div>
      <CornerMoon dur={420} poses={[[0, "pointUp"], [180, "think"], [300, "open"]]} talk={[[10, 110], [124, 396]]} />
    </SceneFrame>
  );
};

// ─── 7. L'étude : graphique animé ──────────────────────────────────────────
// Source : Aggarwal et al., « GEO: Generative Engine Optimization » (Princeton, 2023, arXiv 2311.09735),
// score de visibilité moyen par méthode (tableau des résultats) ; jusqu'à +40 % selon les requêtes.

const BARS: { t: string; v: number; kind: "base" | "bad" | "good" }[] = [
  { t: "Texte d'origine", v: 19.3, kind: "base" },
  { t: "Bourré de mots-clés", v: 17.7, kind: "bad" },
  { t: "Sources citées", v: 24.6, kind: "good" },
  { t: "Texte clair et fluide", v: 24.7, kind: "good" },
];

const StudyChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxW = 700;
  const scale = (v: number) => (v / 26) * maxW;
  const big = pop(frame, fps, 300, SPRING.heavy);
  return (
    <SceneFrame seed="v5study" variant="night" dur={440} zoom={[1, 1.03]} grid>
      <At y={250}>
        <Tag>L'étude</Tag>
      </At>
      <At y={320}>
        <Words lines={["Ce qui *marche*", "vraiment."]} delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 96 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 116 }} />
      </At>
      <div style={{ position: "absolute", left: 90, top: 560, ...MONO, fontSize: 22, color: C.ivoryDim, opacity: ramp(frame, [20, 30], [0, 1]) }}>Visibilité dans les réponses IA</div>
      {/* ligne de référence */}
      <div style={{ position: "absolute", left: 90 + scale(19.3), top: 610, width: 3, height: 640 * ramp(frame, [40, 70], [0, 1]), background: `repeating-linear-gradient(180deg, ${C.ivory}88 0 10px, transparent 10px 20px)` }} />
      {BARS.map((b, i) => {
        const d = 50 + i * 55;
        const grow = ramp(frame, [d, d + 40], [0, 1], EASE.out);
        const val = b.v * grow;
        const col = b.kind === "good" ? GRAD.copper : b.kind === "bad" ? "rgba(93,113,137,0.9)" : `${C.ivory}55`;
        return (
          <div key={b.t} style={{ position: "absolute", left: 90, top: 630 + i * 155 }}>
            <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 38, color: b.kind === "bad" ? C.ivoryDim : C.ivory, marginBottom: 10, opacity: ramp(frame, [d - 8, d + 4], [0, 1]), display: "flex", alignItems: "center", gap: 14 }}>
              {b.t}
              {b.kind === "bad" && frame > d + 40 ? <span style={{ ...MONO, fontSize: 22, color: C.ivory, background: "#B4443F", borderRadius: 10, padding: "4px 12px", transform: `scale(${pop(frame, fps, d + 40, SPRING.bouncy)})` }}>Baisse</span> : null}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: scale(val), height: 54, borderRadius: 14, background: col, boxShadow: b.kind === "good" ? `0 0 30px ${C.copper}66` : undefined }} />
              <div style={{ fontFamily: F.condensed, fontSize: 52, color: C.ivory, opacity: grow }}>{val.toFixed(1).replace(".", ",")}</div>
            </div>
          </div>
        );
      })}
      <At y={1260}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, transform: `scale(${big})`, opacity: big > 0.01 ? 1 : 0, marginRight: 260 }}>
          <span style={{ fontFamily: F.condensed, fontSize: 150, color: C.copperLight }}>+40 %</span>
          <span style={{ ...SUB, fontSize: 40, color: C.ivory, lineHeight: 1.1 }}>
            jusqu'à,
            <br />
            selon la requête
          </span>
        </div>
      </At>
      <div style={{ position: "absolute", left: 90, right: 330, top: 1470, ...MONO, letterSpacing: "0.08em", textTransform: "none", fontWeight: 500, fontSize: 21, color: C.steel, lineHeight: 1.4 }}>
        Source : Aggarwal et al., « GEO: Generative Engine Optimization », Princeton, 2023
      </div>
      <Flash at={300} max={0.25} color={C.copperLight} />
      <CornerMoon dur={440} poses={[[0, "pointUp"], [100, "think"], [190, "open"], [300, "wave"]]} talk={[[8, 90], [104, 180], [196, 416]]} />
    </SceneFrame>
  );
};

// ─── 8. À quoi ça sert pour un commerce local ──────────────────────────────

const WHY: { icon: string[]; t: string; d: string }[] = [
  { icon: ICON.target, t: "Être le nom recommandé", d: "Quand on demande « le meilleur… près de chez moi »." },
  { icon: ICON.handshake, t: "Des clients déjà convaincus", d: "L'IA vous a présenté avant même le premier contact." },
  { icon: ICON.arrowUp, t: "Passer devant", d: "Prendre la place avant vos concurrents." },
];

const WhyLocal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFrame seed="v5why" variant="deep" dur={330} zoom={[1, 1.03]}>
      <At y={250}>
        <Tag>À quoi ça sert</Tag>
      </At>
      <At y={320}>
        <Words lines={["Pour un *commerce*", "*local ?*"]} delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 96 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 116 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 600, display: "flex", flexDirection: "column", gap: 26 }}>
        {WHY.map((w, i) => {
          const d = 50 + i * 70;
          const s = pop(frame, fps, d, SPRING.snappy);
          return (
            <Card key={w.t} s={s} style={{ display: "flex", gap: 28, alignItems: "center", padding: "30px 34px" }}>
              <div style={{ width: 100, height: 100, flexShrink: 0, borderRadius: "50%", background: GRAD.copper, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DrawIcon paths={w.icon} progress={ramp(frame, [d + 6, d + 26], [0, 1])} size={60} color={C.deep} width={7} />
              </div>
              <div>
                <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 48, color: C.ivory, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{w.t}</div>
                <div style={{ ...SUB, fontSize: 36, marginTop: 6 }}>{w.d}</div>
              </div>
            </Card>
          );
        })}
      </div>
      <CornerMoon dur={330} poses={[[0, "idle"], [50, "pointUp"], [190, "open"]]} />
    </SceneFrame>
  );
};

// ─── 9. Comment l'appliquer : la checklist ─────────────────────────────────

const CHECK: { t: string; d: string }[] = [
  { t: "Fiche Google complète", d: "Horaires, photos, services, catégorie" },
  { t: "Les mêmes infos partout", d: "Nom, adresse, téléphone identiques" },
  { t: "Des avis récents", d: "Et une réponse à chacun" },
  { t: "Une page de questions", d: "Les vraies questions de vos clients" },
  { t: "Des faits vérifiables", d: "Années, chiffres, certifications" },
  { t: "Un site lisible par les IA", d: "Données structurées et fichier llms.txt" },
];

const Checklist: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const STEP = 70;
  const done = (i: number) => 60 + i * STEP;
  const level = CHECK.reduce((acc, _, i) => acc + ramp(frame, [done(i) + 6, done(i) + 20], [0, 1]), 0) / CHECK.length;
  return (
    <SceneFrame seed="v5check" variant="night" dur={570} zoom={[1, 1.02]} grid>
      <At y={250}>
        <Tag>Comment l'appliquer</Tag>
      </At>
      <At y={320}>
        <Words lines={["*6 actions* concrètes."]} delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 92 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 110 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 490, display: "flex", flexDirection: "column", gap: 14 }}>
        {CHECK.map((c, i) => {
          const d = done(i);
          const s = pop(frame, fps, d - 20, SPRING.snappy);
          const tick = ramp(frame, [d, d + 12], [0, 1]);
          const active = frame >= d - 20 && frame < d + STEP - 20;
          return (
            <div
              key={c.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "18px 26px",
                borderRadius: 22,
                background: active ? `${C.copper}2E` : "rgba(243,238,230,0.06)",
                border: `2px solid ${active ? C.copperLight : `${C.ivory}1A`}`,
                opacity: Math.min(1, s * 1.5),
                transform: `translateX(${(1 - s) * 80}px) scale(${active ? 1.02 : 1})`,
              }}
            >
              <div style={{ ...MONO, letterSpacing: 0, fontSize: 30, color: C.copperLight, width: 40 }}>{`0${i + 1}`}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 40, color: C.ivory, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{c.t}</div>
                <div style={{ ...SUB, fontSize: 30, marginTop: 4 }}>{c.d}</div>
              </div>
              <div style={{ width: 58, height: 58, borderRadius: 29, flexShrink: 0, background: tick > 0 ? GRAD.copper : "transparent", border: `2px solid ${C.copperLight}88`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + (tick > 0 && tick < 1 ? 0.2 : 0)})` }}>
                <DrawIcon paths={ICON.check} progress={tick} size={34} color={C.deep} width={13} />
              </div>
            </div>
          );
        })}
      </div>
      {/* jauge */}
      <div style={{ position: "absolute", left: 90, right: 340, top: 1350 }}>
        <div style={{ ...MONO, fontSize: 22, color: C.copperLight, marginBottom: 12 }}>Votre visibilité IA</div>
        <div style={{ height: 34, borderRadius: 17, background: "rgba(243,238,230,0.1)", overflow: "hidden" }}>
          <div style={{ width: `${level * 100}%`, height: "100%", background: GRAD.copper, boxShadow: `0 0 30px ${C.copper}` }} />
        </div>
      </div>
      <Burst at={done(5) + 14} x={W - 340} y={1400} count={20} power={400} seed="v5chk" />
      <CornerMoon dur={570} poses={[[0, "pointUp"], [done(2), "pointLeft"], [done(4), "pointUp"], [done(5) + 20, "wave"]]} talk={[[8, 56], [60, 546]]} />
    </SceneFrame>
  );
};

// ─── 10. Exemple avant / après ─────────────────────────────────────────────

const BeforeAfter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FLIP = 180;
  const after = ramp(frame, [FLIP, FLIP + 20], [0, 1], EASE.inOut);
  const list = after < 0.5 ? ["Fleuriste A", "Fleuriste B", "Fleuriste C"] : ["Atelier Lilas", "Fleuriste A", "Fleuriste B"];
  const stamp = pop(frame, fps, FLIP + 10, SPRING.bouncy);
  return (
    <SceneFrame seed="v5ba" variant="deep" dur={360} zoom={[1, 1.03]}>
      <At y={250}>
        <Tag>Exemple</Tag>
      </At>
      <At y={320}>
        <Words lines={["*Atelier Lilas,*", "fleuriste à Liège."]} delay={2} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 84 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 104 }} />
      </At>
      <div style={{ position: "absolute", right: 90, top: 560, padding: "22px 30px", borderRadius: "30px 30px 8px 30px", background: GRAD.copper, color: C.deep, fontFamily: F.grotesk, fontWeight: 700, fontSize: 38 }}>
        « Un fleuriste pour un mariage à Liège ? »
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 720, padding: "30px 34px", borderRadius: "30px 30px 30px 8px", background: "rgba(243,238,230,0.08)", border: `2px solid ${C.ivory}22`, transform: `perspective(1400px) rotateY(${Math.sin(after * Math.PI) * 25}deg)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ ...MONO, fontSize: 22, color: C.copperLight }}>Réponse de l'IA</div>
          <div style={{ ...MONO, fontSize: 22, color: after < 0.5 ? C.ivoryDim : C.copperLight }}>{after < 0.5 ? "Avant" : "Après le GEO"}</div>
        </div>
        {list.map((n, i) => {
          const me = n === "Atelier Lilas";
          return (
            <div key={n + i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 18px", marginBottom: 12, borderRadius: 18, background: me ? GRAD.copper : "rgba(7,15,24,0.5)", boxShadow: me ? `0 0 ${40 * stamp}px ${C.copper}88` : undefined }}>
              <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 32, color: me ? C.deep : C.copperLight, width: 30 }}>{i + 1}</div>
              <div>
                <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 40, color: me ? C.deep : C.ivory }}>{n}</div>
                {me ? <div style={{ fontFamily: F.grotesk, fontWeight: 600, fontSize: 28, color: C.deep }}>Spécialité mariages · avis très positifs · infos à jour</div> : null}
              </div>
            </div>
          );
        })}
      </div>
      {after < 0.5 ? (
        <div style={{ position: "absolute", left: 90, top: 1180, ...SUB, fontSize: 44, color: C.ivory, opacity: ramp(frame, [60, 74], [0, 1]) }}>
          Atelier Lilas ? <span style={{ ...ACCENT_SERIF, fontSize: 54 }}>Introuvable.</span>
        </div>
      ) : (
        <div style={{ position: "absolute", left: 90, top: 1240, ...BOLD, fontSize: 60, transform: `scale(${stamp})`, transformOrigin: "0 50%" }}>
          Citée <span style={{ ...ACCENT_SERIF, fontSize: 74 }}>en premier.</span>
        </div>
      )}
      <Ring at={FLIP + 10} x={W / 2} y={900} size={1300} />
      <div style={{ position: "absolute", left: 90, top: 1440, ...MONO, fontSize: 22, color: C.steel }}>Exemple illustratif</div>
      <CornerMoon dur={360} poses={[[0, "pointLeft"], [FLIP, "open"]]} talk={[[8, 150], [FLIP + 4, 336]]} />
    </SceneFrame>
  );
};

// ─── 11. Faites le test ────────────────────────────────────────────────────

const TryIt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = pop(frame, fps, 170, SPRING.heavy);
  return (
    <SceneFrame seed="v5try" variant="night" dur={330} zoom={[1, 1.04]} grid="perspective">
      <At y={300}>
        <Words lines={["Faites", "*le test.*"]} delay={2} stagger={4} mode="drop" style={{ ...BOLD, fontSize: 150 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 180 }} />
      </At>
      <div style={{ position: "absolute", left: 90, right: 90, top: 720, padding: "30px 36px", borderRadius: 40, background: C.ivory, boxShadow: `0 0 60px ${C.copper}55` }}>
        <Typewriter text={"Quel est le meilleur\n[votre métier] à [votre ville] ?"} start={50} cps={20} style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 46, color: C.deep, lineHeight: 1.25 }} caretColor={C.copper} />
      </div>
      <At y={1020}>
        <div style={{ textAlign: "center", transform: `scale(${q})`, opacity: q > 0.01 ? 1 : 0 }}>
          <div style={{ ...BOLD, fontSize: 84 }}>Vous n'y êtes pas ?</div>
          <div style={{ ...ACCENT_SERIF, fontSize: 104, lineHeight: 1.2 }}>On s'en occupe.</div>
        </div>
      </At>
      <CornerMoon dur={330} poses={[[0, "pointUp"], [120, "think"], [170, "open"]]} talk={[[8, 130], [168, 306]]} />
    </SceneFrame>
  );
};

// ─── 12. Appel à l'action ──────────────────────────────────────────────────

const OFFER = ["Ce que les IA disent de vous", "Ce qui vous manque", "Les 3 actions prioritaires"];

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFrame seed="v5cta" variant="deep" dur={300} zoom={[1.04, 1]} grid>
      <At y={260}>
        <Words lines={["Votre *analyse GEO*"]} delay={2} stagger={4} mode="rise" style={{ ...BOLD, fontSize: 88 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 106 }} />
      </At>
      <At y={400}>
        <div style={{ padding: "18px 46px", borderRadius: 999, background: GRAD.copper, fontFamily: F.grotesk, fontWeight: 900, fontSize: 56, color: C.deep, transform: `scale(${pop(frame, fps, 20, SPRING.bouncy)}) rotate(-2deg)` }}>offerte</div>
      </At>
      <div style={{ position: "absolute", left: 120, right: 90, top: 580, display: "flex", flexDirection: "column", gap: 24 }}>
        {OFFER.map((o, i) => {
          const d = 50 + i * 16;
          const s = pop(frame, fps, d, SPRING.snappy);
          return (
            <div key={o} style={{ display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 80}px)` }}>
              <div style={{ width: 60, height: 60, borderRadius: 30, background: GRAD.copper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <DrawIcon paths={ICON.check} progress={ramp(frame, [d + 4, d + 14], [0, 1])} size={34} color={C.deep} width={13} />
              </div>
              <div style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 46, color: C.ivory, letterSpacing: "-0.02em" }}>{o}</div>
            </div>
          );
        })}
      </div>
      <Bubble x={120} y={930} at={110} text="Écrivez-moi sur WhatsApp !" tail="right" />
      <Moon x={W / 2 + 230} y={1060} size={400} delay={6} poses={[[0, "open"], [110, "wave"]]} talk={[[10, 276]]} />
      <Burst at={112} x={W / 2} y={980} count={20} power={420} seed="v5cta" />
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

const Intro: React.FC = () => (
  <SceneFrame seed="v5intro" variant="deep" grid="perspective" dur={80} zoom={[1.1, 1]}>
    <Dust count={30} seed="v5i" />
  </SceneFrame>
);

export const SCENES_V5: Scene[] = [
  { id: "intro", duration: 80, element: <Intro />, exit: { presentation: inkDrop({ x: W / 2, y: 900 }), timing: timing(22) } },
  { id: "hello", duration: 200, element: <Hello />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "shift", duration: 420, element: <SearchVsAsk />, exit: { presentation: wipe({ direction: "from-right" }), timing: timing(18) } },
  { id: "how", duration: 450, element: <HowAIWorks />, exit: { presentation: glitchSlice(), timing: timing(14, (t) => t) } },
  { id: "engines", duration: 220, element: <Engines />, exit: { presentation: zoomPunch(), timing: timing(18) } },
  { id: "definition", duration: 240, element: <Definition />, exit: { presentation: splitDoors(), timing: timing(20) } },
  { id: "compare", duration: 420, element: <CompareTable />, exit: { presentation: slide({ direction: "from-bottom" }), timing: timing(18) } },
  { id: "study", duration: 440, element: <StudyChart />, exit: { presentation: blinds(), timing: timing(20) } },
  { id: "why", duration: 330, element: <WhyLocal />, exit: { presentation: wipe({ direction: "from-left" }), timing: timing(18) } },
  { id: "checklist", duration: 570, element: <Checklist />, exit: { presentation: copperSweep(), timing: timing(20) } },
  { id: "example", duration: 360, element: <BeforeAfter />, exit: { presentation: swipeUp(), timing: timing(18) } },
  { id: "try", duration: 330, element: <TryIt />, exit: { presentation: inkDrop({ x: W / 2, y: 1100 }), timing: timing(22) } },
  { id: "cta", duration: 300, element: <Cta />, exit: { presentation: copperSweep(), timing: timing(20) } },
  { id: "end", duration: END_CARD_DURATION, element: <EndCard /> },
];

export const V5_DURATION = seriesDuration(SCENES_V5);
export const V5_STARTS = sceneStarts(SCENES_V5);

export const V5Geo: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep }}>
    <SceneSeries scenes={SCENES_V5} />
    <BrandLogo variant="slot" handoff={60} hideAt={V5_STARTS.end} />
  </AbsoluteFill>
);
