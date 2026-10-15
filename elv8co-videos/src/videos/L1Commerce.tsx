import React from "react";
import { AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";
import { C, EASE, F, GRAD, H, W } from "../theme";
import { beatPulse, pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, Typewriter, Words } from "../components/Kinetic";
import { DrawIcon, ICON } from "../components/Icons";
import { BrandLogo } from "../components/Logo";
import { EndCard } from "../components/EndCard";
import { Scene, SceneSeries, seriesDuration } from "../components/SceneSeries";
import { copperSweep, glitchSlice, inkDrop, splitDoors, swipeUp, timing, zoomPunch } from "../transitions";
import { Bubble, Moon, MoonPose } from "../components/Moon";
import LONG from "./l1-long.json";
import SHORT from "./l1-short.json";

/*
 * L1 « Faire connaître son commerce local » — deux versions à partir de la même voix :
 *  - L1-Long  : TikTok / LinkedIn (voix complète, ouverture choc)
 *  - L1-Short : Instagram / TikTok (1 min 30 max)
 * Repères générés par scripts/l1_prep.py (cues = phrases, sub = mots d'une liste, en frames globales).
 */

type Meta = typeof LONG;
type Ctx = { M: Meta; s0: number };

const BOLD: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 900, color: C.ivory, lineHeight: 1.02, letterSpacing: "-0.04em" };
const SUB: React.CSSProperties = { fontFamily: F.grotesk, fontWeight: 500, color: C.ivoryDim, lineHeight: 1.25, letterSpacing: "-0.01em" };
const MONO: React.CSSProperties = { fontFamily: F.mono, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" };
const X = 90;
const NEVER = 99999;

/** Accès aux repères en frames locales de la scène. `null` si la phrase n'existe pas dans cette version. */
const useCues = ({ M, s0 }: Ctx) => {
  const cues = M.cues as Record<string, number[]>;
  const sub = M.sub as Record<string, number>;
  return {
    has: (id: string) => id in cues,
    L: (id: string, fallback = NEVER) => (id in cues ? cues[id][0] - s0 : fallback),
    LE: (id: string, fallback = NEVER) => (id in cues ? cues[id][1] - s0 : fallback),
    S: (id: string, fallback = NEVER) => (id in sub ? sub[id] - s0 : fallback),
    talk: (M.talk as number[][]).map(([a, b]) => [a - s0, b - s0] as [number, number]),
  };
};

/** Fondu entre phases d'une scène : visible de `a` à `b`. */
const phase = (frame: number, a: number, b = NEVER) => ramp(frame, [a, a + 8], [0, 1]) * (1 - ramp(frame, [b - 6, b + 2], [0, 1]));

const CornerMoon: React.FC<{ ctx: Ctx; poses?: [number, MoonPose][]; left?: boolean; size?: number }> = ({ ctx, poses, left, size = 230 }) => {
  const { talk } = useCues(ctx);
  return <Moon x={left ? 160 : W - 160} y={1440} size={size} delay={2} poses={poses ?? [[0, left ? "pointUp" : "pointLeft"]]} talk={talk} />;
};

const ChapterHead: React.FC<{ n: string; title: string[]; lock?: boolean }> = ({ n, title, lock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 6, SPRING.heavy);
  const open = lock ? ramp(frame, [14, 24], [0, 1], EASE.back) : 1;
  return (
    <>
      <div style={{ position: "absolute", left: X - 6, top: 260, fontFamily: F.condensed, fontSize: 200, lineHeight: 1, color: C.copperLight, transform: `translateY(${(1 - s) * -260}px)`, opacity: s > 0.01 ? 1 : 0 }}>
        {n}
        {lock ? (
          <svg viewBox="0 0 100 100" width={90} height={90} style={{ position: "absolute", right: -100, top: 70, overflow: "visible" }}>
            <path d={`M30 46 L30 ${32 - open * 18} C30 ${14 - open * 18} 70 ${14 - open * 18} 70 32 L70 40`} stroke={C.ivory} strokeWidth={9} fill="none" strokeLinecap="round" transform={`rotate(${open * -25} 70 40)`} />
            <rect x={20} y={46} width={60} height={46} rx={8} fill={C.ivory} />
          </svg>
        ) : null}
      </div>
      <At y={480} x={X}>
        <Words lines={title} align="left" delay={10} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 84 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 98 }} />
      </At>
    </>
  );
};

const Check: React.FC<{ p: number; ok?: boolean; size?: number }> = ({ p, ok = true, size = 56 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: p > 0 ? (ok ? GRAD.copper : "#B4443F") : "transparent", border: `2px solid ${C.copperLight}88`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <DrawIcon paths={ok ? ICON.check : ICON.cross} progress={p} size={size * 0.58} color={ok ? C.deep : C.ivory} width={13} />
  </div>
);

const Row: React.FC<{ at: number; text: string; sub?: string; ok?: boolean; size?: number }> = ({ at, text, sub, ok = true, size = 46 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at - 4, SPRING.snappy);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 80}px)` }}>
      <Check p={ramp(frame, [at + 2, at + 12], [0, 1])} ok={ok} />
      <div>
        <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: size, color: C.ivory, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{text}</div>
        {sub ? <div style={{ ...SUB, fontSize: size * 0.7, marginTop: 4 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; o?: number }> = ({ children, style, o = 1 }) => (
  <div style={{ position: "absolute", borderRadius: 32, background: "rgba(243,238,230,0.07)", border: `2px solid ${C.copperLight}55`, opacity: o, transform: `translateY(${(1 - o) * 30}px)`, ...style }}>{children}</div>
);

const SearchBar: React.FC<{ text: string; start: number; y: number; o?: number }> = ({ text, start, y, o = 1 }) => (
  <div style={{ position: "absolute", left: X, right: X, top: y, height: 100, borderRadius: 50, background: C.ivory, display: "flex", alignItems: "center", padding: "0 38px", gap: 22, opacity: o }}>
    <DrawIcon paths={["M42 42 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", "M60 60 L84 84"]} progress={1} size={44} color={C.deep} width={9} />
    <Typewriter text={text} start={start} cps={18} style={{ fontFamily: F.grotesk, fontWeight: 600, fontSize: 44, color: C.deep }} caretColor={C.copper} />
  </div>
);

// ─── Ouverture choc (version longue) ───────────────────────────────────────

const Cold: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { L, LE } = useCues(ctx);
  const a = L("cold");
  const z = LE("cold");
  const pay = a + (z - a) * 0.62;
  return (
    <SceneFrame seed="l1cold" variant="deep" dur={140} zoom={[1.08, 1]}>
      <At y={300} x={X}>
        <Words lines={["Si votre profil", "est vide…"]} align="left" delay={0} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 120 }} />
      </At>
      <At y={600} x={X}>
        <Words lines={["…vous payez", "*pour rien.*"]} align="left" delay={pay} stagger={4} mode="drop" style={{ ...BOLD, fontSize: 120 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 150 }} />
      </At>
      {/* téléphone au profil vide, les pièces le traversent */}
      <div style={{ position: "absolute", left: W / 2 - 170, top: 980, width: 340, height: 560, borderRadius: 46, border: `5px solid ${C.ivory}`, background: C.abyss, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 120, top: 50, width: 100, height: 100, borderRadius: 50, background: `${C.ivory}22` }} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "absolute", left: 30 + (i % 3) * 98, top: 190 + Math.floor(i / 3) * 98, width: 86, height: 86, borderRadius: 8, background: `${C.ivory}14`, border: `2px dashed ${C.ivory}33` }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", ...MONO, fontSize: 20, color: C.steel }}>Aucune publication</div>
      </div>
      {new Array(9).fill(0).map((_, i) => {
        const t0 = 6 + i * 9;
        const y = 820 + Math.max(0, frame - t0) ** 2 * 0.35;
        const x = W / 2 - 150 + random(`cx${i}`) * 300;
        return frame > t0 && y < H + 80 ? (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 54, height: 54, borderRadius: 27, background: `radial-gradient(circle at 35% 30%, #F7C79C, ${C.copper} 60%, ${C.copperDark})`, transform: `scaleX(${Math.abs(Math.cos(frame / 5 + i))})`, opacity: 0.95 }} />
        ) : null;
      })}
    </SceneFrame>
  );
};

// ─── Intro ─────────────────────────────────────────────────────────────────

const Shop: React.FC<{ o: number; y: number }> = ({ o, y }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: W / 2 - 330, top: y, width: 660, height: 520, opacity: o }}>
      <svg viewBox="0 0 660 520" width={660} height={520}>
        <rect x={40} y={120} width={580} height={400} rx={10} fill="#1F3550" stroke={C.ivory} strokeWidth={4} />
        {new Array(8).fill(0).map((_, i) => (
          <path key={i} d={`M${20 + i * 77.5} 70 L${97.5 + i * 77.5} 70 L${97.5 + i * 77.5} 150 Q${58.75 + i * 77.5} 175 ${20 + i * 77.5} 150 Z`} fill={i % 2 ? C.ivory : C.copper} />
        ))}
        <rect x={20} y={40} width={620} height={34} rx={6} fill={C.copperDark} />
        <rect x={80} y={210} width={300} height={220} rx={8} fill="#9CC7E31F" stroke={C.ivory} strokeWidth={3} />
        <rect x={430} y={230} width={150} height={290} rx={8} fill={C.night} stroke={C.ivory} strokeWidth={3} />
        <rect x={150} y={250} width={160} height={56} rx={10} fill={C.ivory} />
        <text x={230} y={288} textAnchor="middle" fontFamily="Archivo" fontWeight={900} fontSize={30} fill={C.deep}>
          OUVERT
        </text>
      </svg>
      {/* passants qui ne s'arrêtent pas */}
      {[0, 1, 2].map((i) => {
        const x = ((frame * 3.2 + i * 260) % 1000) - 200;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 470 }}>
            <DrawIcon paths={ICON.face} progress={1} size={70} color={C.ivoryDim} width={7} />
          </div>
        );
      })}
    </div>
  );
};

const PLAN = ["Être trouvable", "Donner confiance", "La régularité", "La pub", "???"];

const Intro: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const h1 = Math.max(0, L("hook1"));
  const h2 = L("hook2");
  const plan = L("plan");
  const chips: [string, string][] = [["Google ?", "q_google"], ["Réseaux ?", "q_reseaux"], ["Pub ?", "q_pub"], ["IA ?", "q_ia"]];
  const order = L("order", plan);
  return (
    <SceneFrame seed="l1intro" variant="night" dur={400} zoom={[1, 1.03]} grid="perspective">
      <At y={300} x={X}>
        <Words lines={["Vous avez *un commerce,*", "des clients contents…"]} align="left" delay={h1 > 20 ? h1 : 0} stagger={2} mode="rise" exitAt={h2 - 16} exitDuration={8} style={{ ...BOLD, fontSize: 82 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 94 }} />
      </At>
      <At y={300} x={X}>
        <Words lines={["mais pas assez de", "*nouveaux clients.*"]} align="left" delay={h2 + 6} stagger={3} mode="rise" exitAt={plan - 14} exitDuration={8} style={{ ...BOLD, fontSize: 92 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 112 }} />
      </At>
      <Shop o={phase(frame, 14, plan)} y={760} />
      {has("q")
        ? chips.map(([t, k], i) => {
            const at = S(k);
            const s = pop(frame, fps, at, SPRING.bouncy);
            const fall = Math.max(0, frame - order) ** 2 * 0.4;
            const pos = [
              [90, 600],
              [600, 650],
              [130, 1330],
              [640, 1300],
            ][i];
            return (
              <div key={t} style={{ position: "absolute", left: pos[0], top: pos[1] + fall, padding: "18px 34px", borderRadius: 999, background: C.ivory, fontFamily: F.grotesk, fontWeight: 900, fontSize: 52, color: C.deep, transform: `scale(${s}) rotate(${(i % 2 ? 6 : -6) + fall * 0.05}deg)`, opacity: s > 0.01 ? 1 : 0 }}>
                {t}
              </div>
            );
          })
        : null}
      {/* le plan en 5 étapes */}
      <At y={300} x={X}>
        <Words lines={["Le plan,", "en *5 étapes.*"]} align="left" delay={plan} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 96 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 116 }} />
      </At>
      <div style={{ position: "absolute", left: X, right: X, top: 600, display: "flex", flexDirection: "column", gap: 18 }}>
        {PLAN.map((p, i) => {
          const s = pop(frame, fps, plan + 8 + i * 5, SPRING.snappy);
          const last = i === 4;
          return (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 30px", borderRadius: 26, background: last ? `${C.copper}26` : "rgba(243,238,230,0.07)", border: `2px solid ${last ? C.copperLight : `${C.ivory}22`}`, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 100}px)` }}>
              <div style={{ fontFamily: F.condensed, fontSize: 64, color: C.copperLight, width: 80 }}>{`0${i + 1}`}</div>
              <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 50, color: C.ivory, letterSpacing: "-0.02em", filter: last ? "blur(10px)" : undefined }}>{last ? "Recommandé…" : p}</div>
              {last ? (
                <svg viewBox="0 0 100 100" width={60} height={60} style={{ marginLeft: "auto" }}>
                  <path d="M30 46 L30 32 C30 14 70 14 70 32 L70 46" stroke={C.ivory} strokeWidth={9} fill="none" />
                  <rect x={20} y={46} width={60} height={46} rx={8} fill={C.ivory} />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: X, top: 1250, padding: "16px 28px", borderRadius: 18, background: GRAD.copper, fontFamily: F.grotesk, fontWeight: 900, fontSize: 40, color: C.deep, transform: `rotate(-2deg) scale(${pop(frame, fps, plan + 40, SPRING.bouncy)})` }}>
        La 5e : presque personne ne la fait.
      </div>
      {has("tease") ? (
        <div style={{ position: "absolute", left: X + 20, top: 1360, padding: "12px 24px", borderRadius: 16, border: `2px solid ${C.copperLight}`, fontFamily: F.grotesk, fontWeight: 700, fontSize: 36, color: C.ivory, transform: `rotate(1.5deg) scale(${pop(frame, fps, L("tease"), SPRING.bouncy)})` }}>
          + un exercice à la fin
        </div>
      ) : null}
      <CornerMoon ctx={ctx} poses={[[0, "wave"], [plan, "pointLeft"]]} />
    </SceneFrame>
  );
};

// ─── 01 Être trouvable ─────────────────────────────────────────────────────

const Trouvable: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const searchAt = has("t2") ? L("t2") : L("t1") + 30;
  const ficheAt = L("t3");
  const napAt = L("t5");
  const bad = L("t7");
  const pins = [
    [220, 300],
    [520, 180],
    [700, 330],
  ];
  const NAP = has("t6") ? [["Site web", "t6_site"], ["Facebook", "t6_facebook"], ["Annuaire", "t6_annuaires"]] : [["Site web", ""], ["Facebook", ""], ["Annuaire", ""]];
  return (
    <SceneFrame seed="l1t" variant="deep" dur={700} zoom={[1, 1.02]}>
      <ChapterHead n="01" title={["Être *trouvable.*"]} />
      {/* recherche + carte */}
      <SearchBar text="fleuriste liège" start={searchAt + 4} y={640} o={phase(frame, searchAt, ficheAt)} />
      <Card o={phase(frame, searchAt + 10, ficheAt)} style={{ left: X, right: X, top: 780, height: 520, overflow: "hidden", background: "#16283C" }}>
        {new Array(7).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 80, height: 2, background: `${C.ivory}10` }} />
        ))}
        <div style={{ position: "absolute", left: -40, top: 260, width: 1100, height: 30, background: `${C.ivory}18`, transform: "rotate(-12deg)" }} />
        {pins.map(([x, y], i) => {
          const me = i === 1;
          const s = pop(frame, fps, searchAt + 30 + i * 6, SPRING.bouncy);
          return (
            <div key={i} style={{ position: "absolute", left: x - 45, top: y - 90, transform: `scale(${s * (me ? 1.3 + beatPulse(frame) * 0.08 : 1)})`, transformOrigin: "50% 100%" }}>
              <DrawIcon paths={ICON.pin} progress={1} size={90} color={C.deep} width={6} fill={me ? C.copperLight : C.ivory} fillOpacity={1} />
              {me ? <div style={{ position: "absolute", left: 100, top: 10, ...MONO, fontSize: 26, color: C.copperLight, whiteSpace: "nowrap" }}>Vous ?</div> : null}
            </div>
          );
        })}
      </Card>
      {/* fiche Google */}
      <Card o={phase(frame, ficheAt, napAt)} style={{ left: X, right: X, top: 640, padding: "36px 40px" }}>
        <div style={{ ...MONO, fontSize: 26, color: C.copperLight, marginBottom: 26 }}>Votre fiche Google</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <Row at={S("t4_categorie", ficheAt + 20)} text="La bonne catégorie" />
          <Row at={S("t4_horaires", ficheAt + 34)} text="Des horaires à jour" />
          <Row at={S("t4_photos", ficheAt + 48)} text="De vraies photos" />
          <Row at={S("t4_services", ficheAt + 62)} text="Vos services décrits" />
        </div>
      </Card>
      {/* les mêmes infos partout */}
      <At y={640} x={X} style={{ opacity: phase(frame, napAt) }}>
        <div style={{ ...SUB, fontSize: 46, color: C.ivory }}>
          Les <span style={{ ...ACCENT_SERIF, fontSize: 56 }}>mêmes infos</span> partout :
        </div>
      </At>
      {NAP.map(([name, k], i) => {
        const at = k ? S(k) : napAt + 20 + i * 12;
        const s = pop(frame, fps, at, SPRING.snappy);
        const wrong = i === 2 && frame > bad + 10;
        return (
          <Card key={name} o={Math.min(1, s * 1.5) * phase(frame, napAt)} style={{ left: X, right: X, top: 760 + i * 190, height: 160, padding: "26px 34px", border: `2px solid ${wrong ? "#D9534F" : `${C.copperLight}55`}` }}>
            <div style={{ ...MONO, fontSize: 22, color: C.copperLight }}>{name}</div>
            <div style={{ fontFamily: F.grotesk, fontWeight: 700, fontSize: 38, color: C.ivory, marginTop: 12 }}>
              Votre nom · Votre adresse · <span style={{ color: wrong ? "#FF8A80" : C.ivory, textDecoration: wrong ? "line-through" : "none" }}>{wrong ? "Ancien numéro" : "Votre tél."}</span>
            </div>
          </Card>
        );
      })}
      <div style={{ position: "absolute", left: X, top: 1350, padding: "14px 26px", borderRadius: 16, background: "#B4443F", fontFamily: F.grotesk, fontWeight: 900, fontSize: 44, color: C.ivory, transform: `rotate(-3deg) scale(${pop(frame, fps, bad + 14, SPRING.bouncy)})` }}>
        Moins fiable
      </div>
      <CornerMoon ctx={ctx} poses={[[0, "pointUp"], [ficheAt, "pointLeft"], [bad, "think"]]} />
    </SceneFrame>
  );
};

// ─── 02 Donner confiance ───────────────────────────────────────────────────

const Confiance: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, has } = useCues(ctx);
  const q = L("c2");
  const cols = [
    { id: "c4a", t: "Les avis" },
    { id: "c5", t: "Les visages" },
    { id: "c6", t: "Les preuves" },
  ].filter((c) => has(c.id));
  const w = cols.length === 1 ? 600 : 290;
  const gap = (W - 2 * X - cols.length * w) / Math.max(1, cols.length - 1);
  const final = L("c7");
  return (
    <SceneFrame seed="l1c" variant="night" dur={700} zoom={[1, 1.02]} grid>
      <ChapterHead n="02" title={["Donner *confiance.*"]} />
      <Card o={ramp(frame, [L("c1"), L("c1") + 10], [0, 1])} style={{ left: X, right: X, top: 640, padding: "30px 36px" }}>
        <div style={{ ...MONO, fontSize: 24, color: C.copperLight, marginBottom: 16 }}>Ce que se demande un nouveau client</div>
        <Typewriter text={"« Est-ce que je peux\nleur faire confiance ? »"} start={q} cps={32} style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 50, color: C.ivory, lineHeight: 1.2 }} />
      </Card>
      {cols.map((c, i) => {
        const at = L(c.id);
        const s = pop(frame, fps, at, SPRING.bouncy);
        const left = cols.length === 1 ? (W - w) / 2 : X + i * (w + gap);
        return (
          <Card key={c.id} o={Math.min(1, s * 1.5)} style={{ left, width: w, top: 900, height: 380, padding: "26px 20px", textAlign: "center" }}>
            <div style={{ ...MONO, fontSize: 24, color: C.copperLight }}>{c.t}</div>
            {c.id === "c4a" ? (
              <div style={{ marginTop: 30 }}>
                <div style={{ fontSize: 46, color: C.copperLight, letterSpacing: 4 }}>{"★★★★★".slice(0, Math.max(0, Math.min(5, Math.floor((frame - at) / 3))))}</div>
                <div style={{ margin: "26px auto 0", padding: "14px 18px", borderRadius: 18, background: C.ivory, color: C.deep, fontFamily: F.grotesk, fontWeight: 800, fontSize: 28, maxWidth: 240, opacity: ramp(frame, [L("c4b", at + 20), L("c4b", at + 20) + 8], [0, 1]) }}>« Merci Julie ! »</div>
              </div>
            ) : null}
            {c.id === "c5" ? (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 50 }}>
                {[0, 1, 2].map((k) => (
                  <div key={k} style={{ transform: `scale(${pop(frame, fps, at + 8 + k * 5, SPRING.bouncy)})` }}>
                    <DrawIcon paths={ICON.face} progress={1} size={80} color={k === 1 ? C.copperLight : C.ivory} width={6} />
                  </div>
                ))}
              </div>
            ) : null}
            {c.id === "c6" ? (
              <div style={{ display: "flex", marginTop: 40, borderRadius: 16, overflow: "hidden", height: 170 }}>
                <div style={{ flex: 1, background: "#2A3B50", ...MONO, fontSize: 18, color: C.ivoryDim, paddingTop: 70 }}>Avant</div>
                <div style={{ flex: ramp(frame, [at + 10, at + 30], [0.01, 1]), background: GRAD.copper, ...MONO, fontSize: 18, color: C.deep, paddingTop: 70 }}>Après</div>
              </div>
            ) : null}
          </Card>
        );
      })}
      <At y={1340} x={X}>
        <Words lines={["On fait confiance à des", "*personnes,* pas à des logos."]} align="left" delay={final} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 56 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 66 }} />
      </At>
      <CornerMoon ctx={ctx} left poses={[[0, "pointUp"], [final, "open"]]} size={200} />
    </SceneFrame>
  );
};

// ─── 03 La régularité ──────────────────────────────────────────────────────

const Regularite: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, LE, S, has } = useCues(ctx);
  const r1 = L("r1");
  const r2 = L("r2");
  const chartAt = has("r3") ? L("r3") : L("r4");
  const chipsAt = L("r5", NEVER);
  const banal = L("r7");
  return (
    <SceneFrame seed="l1r" variant="deep" dur={700} zoom={[1, 1.02]}>
      <ChapterHead n="03" title={["La *régularité.*"]} />
      {/* vu 1, 2, 3 fois… choisi */}
      <div style={{ position: "absolute", left: X, right: X, top: 680, display: "flex", alignItems: "center", gap: 30, opacity: phase(frame, r1, chartAt) }}>
        {[r1 + 4, r1 + 30, r2 + 4].map((at, i) => (
          <div key={i} style={{ textAlign: "center", transform: `scale(${pop(frame, fps, at, SPRING.bouncy)})` }}>
            <DrawIcon paths={ICON.eye} progress={1} size={150} color={C.ivory} width={4} />
            <div style={{ ...MONO, fontSize: 26, color: C.copperLight, marginTop: 8 }}>{`${i + 1}x`}</div>
          </div>
        ))}
        <div style={{ transform: `scale(${pop(frame, fps, LE("r2") - 4, SPRING.bouncy)})`, textAlign: "center" }}>
          <Check p={ramp(frame, [LE("r2"), LE("r2") + 10], [0, 1])} size={130} />
          <div style={{ ...MONO, fontSize: 26, color: C.copperLight, marginTop: 14 }}>Choisi</div>
        </div>
      </div>
      {/* une superbe vidéo vs une vidéo par semaine */}
      <div style={{ position: "absolute", left: X, right: X, top: 640, display: "flex", gap: 30, opacity: phase(frame, chartAt, chipsAt) }}>
        {[0, 1].map((side) => (
          <Card key={side} style={{ position: "relative", flex: 1, height: 600, padding: "26px 24px" }}>
            <div style={{ ...MONO, fontSize: 22, color: side ? C.copperLight : C.ivoryDim, lineHeight: 1.4 }}>{side ? "1 vidéo / semaine" : "1 superbe vidéo"}</div>
            <div style={{ position: "absolute", left: 24, right: 24, bottom: 90, height: 340, display: "flex", alignItems: "flex-end", gap: 6 }}>
              {new Array(12).fill(0).map((_, i) => {
                const grow = ramp(frame, [chartAt + 10 + i * 4, chartAt + 20 + i * 4], [0, 1]);
                const h = side ? (90 + i * 18) * grow : i === 1 ? 320 * grow : 6;
                return <div key={i} style={{ flex: 1, height: h, borderRadius: 6, background: side ? GRAD.copper : `${C.ivory}66` }} />;
              })}
            </div>
            <div style={{ position: "absolute", left: 24, bottom: 26, fontFamily: F.grotesk, fontWeight: 800, fontSize: 36, color: side ? C.ivory : C.ivoryDim, opacity: ramp(frame, [chartAt + 60, chartAt + 70], [0, 1]) }}>{side ? "On vous suit." : "On vous oublie."}</div>
          </Card>
        ))}
      </div>
      {/* idées de contenus */}
      {has("r5")
        ? [
            ["Un arrivage", "r6_arrivage"],
            ["Un conseil", "r6_conseil"],
            ["Une question", "r6_question"],
            ["Les coulisses", "r6_coulisses"],
          ].map(([t, k], i) => {
            const s = pop(frame, fps, S(k), SPRING.bouncy);
            return (
              <div key={t} style={{ position: "absolute", left: X + (i % 2) * 450, top: 680 + Math.floor(i / 2) * 170, padding: "26px 36px", borderRadius: 26, background: i % 3 === 0 ? GRAD.copper : "rgba(243,238,230,0.1)", border: `2px solid ${C.copperLight}88`, fontFamily: F.grotesk, fontWeight: 900, fontSize: 46, color: i % 3 === 0 ? C.deep : C.ivory, transform: `scale(${s}) rotate(${i % 2 ? 2 : -2}deg)`, opacity: s > 0.01 ? phase(frame, chipsAt) : 0 }}>
                {t}
              </div>
            );
          })
        : null}
      {has("r7") ? (
        <At y={1080} x={X}>
          <Words lines={["Ce qui vous paraît *banal*", "intéresse vos clients."]} align="left" delay={banal} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 58 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 70 }} />
        </At>
      ) : null}
      <CornerMoon ctx={ctx} poses={[[0, "pointUp"], [chartAt, "pointLeft"], [chipsAt, "open"]]} />
    </SceneFrame>
  );
};

// ─── 04 La pub ─────────────────────────────────────────────────────────────

const Pub: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const p1 = L("p1");
  const readyAt = L("p2", NEVER);
  const ampAt = L("p4");
  const voidAt = L("p5");
  const growAt = L("p6", NEVER);
  const needle = ramp(frame, [p1 + 6, p1 + 40], [-80, 70], EASE.back);
  return (
    <SceneFrame seed="l1p" variant="night" dur={600} zoom={[1, 1.02]} grid="perspective">
      <ChapterHead n="04" title={["La *pub.*"]} />
      {/* accélérateur */}
      <div style={{ position: "absolute", left: W / 2 - 300, top: 660, width: 600, height: 340, opacity: phase(frame, p1, has("p2") ? readyAt : ampAt) }}>
        <svg viewBox="0 0 600 340" width={600} height={340}>
          <path d="M60 320 A240 240 0 0 1 540 320" stroke={`${C.ivory}33`} strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d="M60 320 A240 240 0 0 1 540 320" stroke={C.copperLight} strokeWidth={30} fill="none" strokeLinecap="round" strokeDasharray={760} strokeDashoffset={760 * (1 - ramp(frame, [p1 + 6, p1 + 40], [0, 1]))} />
          <g transform={`translate(300 320) rotate(${needle})`}>
            <path d="M0 -210 L12 0 L-12 0 Z" fill={C.ivory} />
          </g>
          <circle cx={300} cy={320} r={22} fill={C.ivory} />
        </svg>
        <div style={{ textAlign: "center", ...MONO, fontSize: 28, color: C.copperLight, marginTop: 10 }}>Accélérateur</div>
      </div>
      {has("p2") ? (
        <Card o={phase(frame, readyAt, ampAt)} style={{ left: X, right: X, top: 660, padding: "36px 40px" }}>
          <div style={{ ...MONO, fontSize: 24, color: C.copperLight, marginBottom: 26 }}>Seulement si c'est prêt</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <Row at={S("p3_fiche")} text="Une fiche propre" />
            <Row at={S("p3_avis")} text="Des avis" />
            <Row at={S("p3_contenu")} text="Du contenu régulier" />
          </div>
        </Card>
      ) : null}
      {/* la pub amplifie… un profil vide */}
      <div style={{ position: "absolute", left: X, top: 680, opacity: phase(frame, ampAt, growAt) }}>
        <div style={{ transform: `scale(${pop(frame, fps, ampAt, SPRING.bouncy)})` }}>
          <DrawIcon paths={ICON.broadcast} progress={ramp(frame, [ampAt, ampAt + 20], [0, 1])} size={200} color={C.copperLight} width={5} />
        </div>
        <div style={{ ...BOLD, fontSize: 84, marginTop: 20, maxWidth: 440 }}>
          La pub <span style={{ ...ACCENT_SERIF, fontSize: 100 }}>amplifie.</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 560, top: 680, width: 300, height: 500, borderRadius: 44, border: `5px solid ${C.ivory}`, background: C.abyss, overflow: "hidden", opacity: phase(frame, voidAt, growAt) }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: 26 + (i % 2) * 128, top: 120 + Math.floor(i / 2) * 128, width: 116, height: 116, borderRadius: 8, border: `2px dashed ${C.ivory}33` }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", ...MONO, fontSize: 18, color: C.steel }}>Profil vide</div>
      </div>
      {new Array(10).fill(0).map((_, i) => {
        const t0 = voidAt + 10 + i * 6;
        const k = Math.max(0, frame - t0);
        const x = 600 + random(`vx${i}`) * 220;
        const y = 600 + k * 9 + k * k * 0.15;
        return frame > t0 && frame < growAt && y < 1500 ? (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.85 * phase(frame, voidAt, growAt) }}>
            <DrawIcon paths={ICON.face} progress={1} size={56} color={C.ivoryDim} width={7} />
          </div>
        ) : null;
      })}
      <div style={{ position: "absolute", left: X, top: 1230, ...BOLD, fontSize: 60, opacity: ramp(frame, [voidAt + 40, voidAt + 50], [0, 1]) * phase(frame, voidAt, growAt) }}>
        → <span style={{ ...ACCENT_SERIF, fontSize: 72 }}>vers rien.</span>
      </div>
      {/* commencer petit, mesurer, augmenter */}
      {has("p6") ? (
        <div style={{ position: "absolute", left: X, right: X, top: 700, height: 560, display: "flex", alignItems: "flex-end", gap: 40, opacity: phase(frame, growAt) }}>
          {["Petit", "Mesurer", "Augmenter"].map((t, i) => (
            <div key={t} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: (120 + i * 160) * ramp(frame, [growAt + 6 + i * 22, growAt + 22 + i * 22], [0, 1], EASE.back), borderRadius: 18, background: i === 2 ? GRAD.copper : `${C.ivory}55` }} />
              <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 40, color: C.ivory, marginTop: 16 }}>{t}</div>
            </div>
          ))}
        </div>
      ) : null}
      <CornerMoon ctx={ctx} left poses={[[0, "pointUp"], [ampAt, "pointUp"], [voidAt, "think"]]} size={200} />
    </SceneFrame>
  );
};

// ─── 05 Être recommandé par les IA ─────────────────────────────────────────

const Ia: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const i1 = L("i1");
  const i2 = L("i2");
  const listAt = L("i3");
  const princeton = L("i5", NEVER);
  const ans = pop(frame, fps, i2, SPRING.snappy);
  return (
    <SceneFrame seed="l1i" variant="deep" dur={600} zoom={[1, 1.02]} grid>
      <ChapterHead n="05" title={["Recommandé", "*par les IA.*"]} lock />
      <div style={{ opacity: phase(frame, i1, listAt) }}>
        <div style={{ position: "absolute", right: X, top: 740, maxWidth: 760, padding: "24px 32px", borderRadius: "32px 32px 8px 32px", background: GRAD.copper, color: C.deep, fontFamily: F.grotesk, fontWeight: 700, fontSize: 42 }}>
          <Typewriter text={"Quel fleuriste de confiance\nà Liège ?"} start={i1 + 12} cps={30} style={{ whiteSpace: "pre" }} caretColor={C.deep} />
        </div>
        <Card o={Math.min(1, ans * 1.5)} style={{ left: X, right: 160, top: 960, padding: "28px 32px", borderRadius: "32px 32px 32px 8px" }}>
          <div style={{ ...MONO, fontSize: 22, color: C.copperLight, marginBottom: 16 }}>Réponse de l'IA</div>
          {["Fleuriste A", "Fleuriste B", "Fleuriste C"].map((n, k) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, opacity: ramp(frame, [i2 + 14 + k * 8, i2 + 20 + k * 8], [0, 1]) }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: GRAD.copper, fontFamily: F.grotesk, fontWeight: 900, fontSize: 24, color: C.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</div>
              <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 40, color: C.ivory }}>{n}</div>
            </div>
          ))}
          <div style={{ ...SUB, fontSize: 32, color: C.ivory, marginTop: 6 }}>Pas dix liens. Quelques noms.</div>
        </Card>
      </div>
      <Card o={phase(frame, listAt, princeton)} style={{ left: X, right: X, top: 740, padding: "36px 40px" }}>
        <div style={{ ...MONO, fontSize: 24, color: C.copperLight, marginBottom: 26 }}>Pour en faire partie</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Row at={S("i4_fiche", listAt + 20)} text="Une fiche complète" />
          <Row at={S("i4_infos", listAt + 34)} text="Les mêmes infos partout" />
          <Row at={S("i4_avis", listAt + 48)} text="Des avis" />
          <Row at={S("i4_faits", listAt + 60)} text="Des faits clairs sur votre site" />
        </div>
      </Card>
      {has("i5") ? (
        <Card o={phase(frame, princeton)} style={{ left: X, right: X, top: 740, padding: "40px 40px" }}>
          <div style={{ ...MONO, fontSize: 24, color: C.copperLight }}>Étude de Princeton · 2023</div>
          <div style={{ fontFamily: F.condensed, fontSize: 170, color: C.ivory, lineHeight: 1.1, marginTop: 10, transform: `scale(${pop(frame, fps, princeton + 30, SPRING.heavy)})`, transformOrigin: "0 50%" }}>+40 %</div>
          <div style={{ ...SUB, fontSize: 40, color: C.ivory }}>de visibilité, jusqu'à, en écrivant clairement et en citant ses sources.</div>
          <div style={{ ...MONO, letterSpacing: "0.05em", textTransform: "none", fontWeight: 500, fontSize: 20, color: C.steel, marginTop: 24 }}>Aggarwal et al., « GEO: Generative Engine Optimization », 2023</div>
        </Card>
      ) : null}
      <CornerMoon ctx={ctx} poses={[[0, "wave"], [i1, "pointUp"], [listAt, "pointLeft"]]} />
    </SceneFrame>
  );
};

// ─── Récapitulatif (version longue) ────────────────────────────────────────

const Recap: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { S } = useCues(ctx);
  const items: [string, string[], string][] = [
    ["Trouvable", ICON.pin, "rc_trouvable"],
    ["Confiance", ICON.handshake, "rc_confiance"],
    ["Régulier", ICON.play, "rc_regulier"],
    ["Accéléré", ICON.gauge, "rc_accelerer"],
    ["Recommandé", ICON.spark, "rc_recommande"],
  ];
  return (
    <SceneFrame seed="l1rc" variant="night" dur={260} zoom={[1, 1.04]} grid="perspective">
      <At y={290} x={X}>
        <Words lines={["*Récapitulons.*"]} align="left" delay={2} stagger={3} mode="rise" style={{ fontSize: 110 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 120 }} />
      </At>
      <div style={{ position: "absolute", left: X, right: X, top: 480, display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map(([t, icon, k], i) => {
          const at = S(k);
          const s = pop(frame, fps, at, SPRING.bouncy);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 30, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 100}px)` }}>
              <div style={{ fontFamily: F.condensed, fontSize: 70, color: C.copperLight, width: 90 }}>{`0${i + 1}`}</div>
              <div style={{ width: 110, height: 110, borderRadius: 30, background: GRAD.copper, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DrawIcon paths={icon} progress={ramp(frame, [at, at + 14], [0, 1])} size={64} color={C.deep} width={7} />
              </div>
              <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 64, color: C.ivory, letterSpacing: "-0.03em" }}>{t}</div>
            </div>
          );
        })}
      </div>
      <CornerMoon ctx={ctx} poses={[[0, "open"]]} />
    </SceneFrame>
  );
};

// ─── Exercice ──────────────────────────────────────────────────────────────

const Exo: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S } = useCues(ctx);
  const e1 = L("e1");
  const ia = S("e1_ia", e1 + 60);
  return (
    <SceneFrame seed="l1e" variant="deep" dur={400} zoom={[1, 1.03]}>
      <At y={290} x={X}>
        <Words lines={["Votre exercice", "*aujourd'hui.*"]} align="left" delay={2} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 100 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 120 }} />
      </At>
      <div style={{ position: "absolute", left: X, top: 590, ...MONO, fontSize: 24, color: C.copperLight, opacity: ramp(frame, [6, 16], [0, 1]) }}>1 · Sur Google</div>
      <SearchBar text="[votre métier] [votre ville]" start={e1 + 4} y={640} o={ramp(frame, [6, 16], [0, 1])} />
      <div style={{ position: "absolute", left: X, top: 800, ...MONO, fontSize: 24, color: C.copperLight, opacity: ramp(frame, [ia, ia + 8], [0, 1]) }}>2 · À une IA</div>
      <div style={{ position: "absolute", left: X, right: X, top: 850, padding: "26px 32px", borderRadius: "32px 32px 32px 8px", background: GRAD.copper, color: C.deep, fontFamily: F.grotesk, fontWeight: 700, fontSize: 40, opacity: ramp(frame, [ia, ia + 8], [0, 1]) }}>
        <Typewriter text="Quel est le meilleur [métier] à [ville] ?" start={ia + 4} cps={30} caretColor={C.deep} />
      </div>
      <div style={{ position: "absolute", left: X, right: X, top: 1080, display: "flex", flexDirection: "column", gap: 26 }}>
        <Row at={L("e2")} text="Vous apparaissez ?" />
        <Row at={L("e3")} text="Vous n'apparaissez pas ?" ok={false} />
      </div>
      <div style={{ position: "absolute", left: X, top: 1330, padding: "12px 24px", borderRadius: 16, border: `2px solid ${C.copperLight}`, fontFamily: F.grotesk, fontWeight: 800, fontSize: 36, color: C.ivory, transform: `scale(${pop(frame, fps, L("e3") + 20, SPRING.bouncy)})` }}>
        Notez-le.
      </div>
      <CornerMoon ctx={ctx} poses={[[0, "pointUp"], [L("e2"), "think"]]} />
    </SceneFrame>
  );
};

// ─── Appel à l'action ──────────────────────────────────────────────────────

const Cta: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, has, talk } = useCues(ctx);
  const w1 = L("w1");
  return (
    <SceneFrame seed="l1w" variant="night" dur={220} zoom={[1.04, 1]} grid="perspective">
      <At y={300} x={X}>
        <Words lines={["On fait le point", "*ensemble ?*"]} align="left" delay={w1} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 104 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 124 }} />
      </At>
      <Bubble x={110} y={930} at={w1 + 30} text="Écrivez-moi sur WhatsApp !" tail="right" />
      <Moon x={W / 2 + 200} y={1050} size={440} delay={4} poses={[[0, "open"], [w1 + 30, "wave"]]} talk={talk} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", fontFamily: F.grotesk, fontWeight: 900, fontSize: 64, color: C.copperLight, opacity: ramp(frame, [w1 + 40, w1 + 52], [0, 1]) }}>0470 35 43 90</div>
      {has("w2") ? (
        <div style={{ position: "absolute", left: X, top: 640, padding: "16px 30px", borderRadius: 999, background: C.ivory, fontFamily: F.grotesk, fontWeight: 900, fontSize: 40, color: C.deep, transform: `scale(${pop(frame, fps, L("w2"), SPRING.bouncy)})` }}>+ Suivre la lune</div>
      ) : null}
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

const COMP: Record<string, React.FC<{ ctx: Ctx }>> = { cold: Cold, intro: Intro, trouvable: Trouvable, confiance: Confiance, regularite: Regularite, pub: Pub, ia: Ia, recap: Recap, exo: Exo, cta: Cta };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EXIT: Record<string, () => TransitionPresentation<any>> = {
  cold: () => glitchSlice(),
  intro: () => swipeUp(),
  trouvable: () => wipe({ direction: "from-right" }),
  confiance: () => splitDoors(),
  regularite: () => zoomPunch(),
  pub: () => glitchSlice(),
  ia: () => inkDrop({ x: W / 2, y: 900 }),
  recap: () => swipeUp(),
  exo: () => wipe({ direction: "from-left" }),
  cta: () => copperSweep(),
};
const T = 12;

const buildScenes = (M: Meta): Scene[] =>
  M.scenes.map((sc, i) => {
    const next = M.scenes[i + 1];
    const ctx = { M, s0: sc.start };
    const Comp = COMP[sc.id];
    return {
      id: sc.id,
      duration: next ? next.start - sc.start + T : M.total - sc.start,
      element: sc.id === "end" ? <EndCard /> : <Comp ctx={ctx} />,
      exit: next ? { presentation: EXIT[sc.id](), timing: timing(T, sc.id === "cold" || sc.id === "pub" ? (t: number) => t : undefined) } : undefined,
    };
  });

/** Barre de progression des 5 étapes (rétention sur TikTok / Reels). */
const Progress: React.FC<{ M: Meta }> = ({ M }) => {
  const frame = useCurrentFrame();
  const ids = ["trouvable", "confiance", "regularite", "pub", "ia"];
  const st = Object.fromEntries(M.scenes.map((s) => [s.id, s.start]));
  const after = M.scenes.find((s) => s.id === "recap" || s.id === "exo")!.start;
  const vis = ramp(frame, [st.trouvable, st.trouvable + 10], [0, 1]) * (1 - ramp(frame, [after, after + 10], [0, 1]));
  return (
    <div style={{ position: "absolute", left: X, right: X, top: 215, display: "flex", gap: 10, opacity: vis }}>
      {ids.map((id, i) => {
        const end = i < 4 ? st[ids[i + 1]] : after;
        const p = interpolate(frame, [st[id], end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={id} style={{ flex: 1, height: 8, borderRadius: 4, background: `${C.ivory}22`, overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: C.copperLight }} />
          </div>
        );
      })}
    </div>
  );
};

const makeVideo = (M: Meta, audio: string) => {
  const scenes = buildScenes(M);
  const endStart = M.scenes[M.scenes.length - 1].start;
  const Video: React.FC = () => (
    <AbsoluteFill style={{ background: C.deep }}>
      <SceneSeries scenes={scenes} />
      <Progress M={M} />
      {/* logo déjà dans le coin dès la première image : rien ne traverse l'accroche */}
      <Sequence from={-82} layout="none">
        <BrandLogo variant="slot" handoff={60} hideAt={endStart + 82} />
      </Sequence>
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
  return { Video, duration: seriesDuration(scenes) };
};

const long = makeVideo(LONG, "l1-long.m4a");
const short = makeVideo(SHORT as Meta, "l1-short.m4a");
export const L1Long = long.Video;
export const L1_LONG_DURATION = long.duration;
export const L1Short = short.Video;
export const L1_SHORT_DURATION = short.duration;
