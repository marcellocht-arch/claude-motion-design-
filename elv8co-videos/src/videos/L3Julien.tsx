import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { wipe } from "@remotion/transitions/wipe";
import { C, EASE, F, GRAD, W } from "../theme";
import { pop, ramp, SPRING } from "../anim";
import { At, SceneFrame } from "../components/SceneFrame";
import { ACCENT_SERIF, Words } from "../components/Kinetic";
import { DrawIcon, ICON } from "../components/Icons";
import { copperSweep, glitchSlice, inkDrop, splitDoors, swipeUp, zoomPunch } from "../transitions";
import { Bubble, Moon } from "../components/Moon";
import { PhoneFrame } from "../components/Props";
import { BOLD, ChapterHead as Head, Chip, Ctx, Illustratif, makeStory, Mark, MONO, NEVER, phase, Photo, PhotoCard, RED, StoryMeta, SUB, useCues, X } from "../components/Story";
import LONG from "./l3-long.json";
import SHORT from "./l3-short.json";

/*
 * L3 « Les réseaux sociaux pour un commerce : par où commencer ? » — racontée avec Julien, boulanger (personnage inventé).
 *  - L3-Long  : TikTok / LinkedIn (voix complète)
 *  - L3-Short : Instagram / TikTok (≤ 1 min 30)
 * Repères : scripts/l3_prep.py. Photos Unsplash (public/footage, voir SOURCES.md).
 * Icônes de réseaux génériques (couleur + pictogramme + nom écrit), jamais les logos officiels.
 */

const ChapterHead: React.FC<{ n: string; title: string[] }> = (p) => <Head {...p} series="Julien, boulanger · question" />;

// ─── Icônes de réseaux (génériques) ────────────────────────────────────────

type Net = { name: string; bg: string; glyph: string[] };
const NETS: Net[] = [
  { name: "Facebook", bg: "#1877F2", glyph: ICON.face },
  { name: "Instagram", bg: "linear-gradient(135deg, #F9A13A 0%, #E1306C 50%, #833AB4 100%)", glyph: ICON.camera },
  { name: "TikTok", bg: "#111111", glyph: ICON.play },
  { name: "LinkedIn", bg: "#0A66C2", glyph: ICON.handshake },
  { name: "YouTube", bg: "#E62117", glyph: ICON.play },
];
const NET_SUB = ["h3_facebook", "h3_instagram", "h3_tiktok", "h3_linkedin", "h3_youtube"];

const AppIcon: React.FC<{ net: Net; size?: number; grey?: number; label?: boolean; ring?: number; badge?: string }> = ({ net, size = 140, grey = 0, label = true, ring = 0, badge }) => (
  <div style={{ position: "relative", width: size, textAlign: "center" }}>
    <div style={{ width: size, height: size, borderRadius: size * 0.24, background: net.bg, display: "flex", alignItems: "center", justifyContent: "center", filter: `grayscale(${grey}) brightness(${1 - grey * 0.35})`, boxShadow: ring > 0 ? `0 0 0 ${6 * ring}px ${C.copperLight}, 0 0 ${50 * ring}px ${C.copper}` : "0 14px 30px rgba(0,0,0,0.35)" }}>
      <DrawIcon paths={net.glyph} progress={1} size={size * 0.52} color="#FFFFFF" width={7} />
    </div>
    {label ? <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: size * 0.2, color: grey > 0.5 ? C.ivoryDim : C.ivory, marginTop: size * 0.08 }}>{net.name}</div> : null}
    {badge ? (
      <div style={{ position: "absolute", right: -size * 0.12, top: -size * 0.12, minWidth: size * 0.36, height: size * 0.36, borderRadius: size * 0.18, background: RED, color: C.ivory, fontFamily: F.grotesk, fontWeight: 900, fontSize: size * 0.2, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>{badge}</div>
    ) : null}
  </div>
);

/** Bulle de question de client (fond ivoire). */
const Ask: React.FC<{ at: number; text: string; x: number; y: number; w?: number; size?: number; o?: number; rot?: number; right?: boolean }> = ({ at, text, x, y, w = 700, size = 44, o = 1, rot = 0, right }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, SPRING.bouncy);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: "22px 30px", borderRadius: right ? "34px 34px 8px 34px" : "34px 34px 34px 8px", background: right ? GRAD.copper : C.ivory, fontFamily: F.grotesk, fontWeight: 800, fontSize: size, color: C.deep, lineHeight: 1.2, boxShadow: "0 18px 40px rgba(0,0,0,0.35)", transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: right ? "100% 100%" : "0 100%", opacity: s > 0.01 ? o : 0 }}>
      {text}
    </div>
  );
};

/** Étiquette de type de contenu sur une photo. */
const Kind: React.FC<{ at: number; text: string; x: number; y: number }> = ({ at, text, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, SPRING.heavy);
  return <div style={{ position: "absolute", left: x, top: y, padding: "14px 30px", borderRadius: 14, background: GRAD.copper, ...MONO, fontSize: 34, color: C.deep, transform: `scale(${s}) rotate(-4deg)`, opacity: s > 0.01 ? 1 : 0, boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>{text}</div>;
};

// ─── Accroche ──────────────────────────────────────────────────────────────

const Hook: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S } = useCues(ctx);
  const h2 = L("h2");
  const h3 = L("h3");
  const h4 = L("h4");
  const h5 = L("h5");
  const h6 = L("h6");
  const h7 = L("h7");
  const h8 = L("h8");
  const h10 = L("h10");
  const day = Math.round(interpolate(frame, [h4 + 4, h4 + 36], [1, 21], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const grey = ramp(frame, [h4 + 10, h4 + 40], [0, 1]);
  return (
    <SceneFrame seed="l3hook" variant="deep" dur={580} zoom={[1, 1.02]}>
      {/* lundi matin, Julien */}
      <Photo src="boulangerie-vitrine.jpg" o={phase(frame, -10, h2 + 4)} dur={h2 + 10} zoom={[1.3, 1.18]} filter="brightness(0.8)" veil={0.4} pos="50% 75%" />
      <Photo src="julien-portrait.jpg" o={phase(frame, h2, h3 + 4)} dur={h3 - h2 + 20} zoom={[1.08, 1.18]} filter="brightness(0.85)" veil={0.4} pos="50% 30%" />
      <div style={{ position: "absolute", left: X, top: 250, ...MONO, fontSize: 30, color: C.copperLight, opacity: phase(frame, 2, h3) }}>Lun. · 06:30</div>
      <At y={310} x={X}>
        <Words lines={["Lundi *matin.*"]} align="left" delay={0} stagger={3} mode="rise" exitAt={h2 - 4} exitDuration={6} style={{ ...BOLD, fontSize: 124 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 146 }} />
      </At>
      <At y={310} x={X}>
        <Words lines={["Julien, boulanger,", "ouvre *5 comptes.*"]} align="left" delay={h2 + 4} stagger={2} mode="rise" exitAt={h3 - 2} exitDuration={6} style={{ ...BOLD, fontSize: 88 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 108 }} />
      </At>
      {/* les cinq comptes, puis trois semaines de silence */}
      <div style={{ opacity: phase(frame, h3 - 4, h7) }}>
        <div style={{ position: "absolute", left: (W - 560) / 2, top: 560, transform: `translateY(${(1 - pop(frame, fps, h3 - 6, SPRING.snappy)) * 500}px)` }}>
          <PhoneFrame w={560} h={1060} style={{ background: "linear-gradient(180deg, #1F3550 0%, #0D1B2A 100%)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: F.grotesk, fontWeight: 700, fontSize: 30, color: C.ivoryDim }}>{frame < h4 + 4 ? "Lundi" : `Lundi · J+${day}`}</div>
            <div style={{ position: "absolute", left: 50, right: 50, top: 170, display: "flex", flexWrap: "wrap", gap: "56px 50", justifyContent: "space-between", rowGap: 56 }}>
              {NETS.map((n, i) => {
                const s = pop(frame, fps, S(NET_SUB[i], h3 + i * 8) - 2, SPRING.bouncy);
                const dust = grey * (0.6 + random(`d${i}`) * 0.4);
                return (
                  <div key={n.name} style={{ width: 130, transform: `scale(${s}) rotate(${dust * (i % 2 ? 4 : -4)}deg)`, opacity: s > 0.01 ? 1 : 0 }}>
                    <AppIcon net={n} size={130} grey={dust} badge={frame > h5 + 6 + i * 4 ? "21 j" : undefined} />
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", left: 40, right: 40, bottom: 120, padding: "18px 22px", borderRadius: 20, background: "rgba(243,238,230,0.1)", fontFamily: F.grotesk, fontWeight: 700, fontSize: 28, color: C.ivory, opacity: ramp(frame, [h5 + 20, h5 + 30], [0, 1]) }}>
              Dernière publication : <span style={{ color: "#FF8A80" }}>il y a 21 jours</span>
            </div>
          </PhoneFrame>
        </div>
        <At y={300} x={X}>
          <Words lines={["*3 semaines* plus tard…"]} align="left" delay={h4} stagger={2} mode="rise" exitAt={h5 - 2} exitDuration={6} style={{ ...BOLD, fontSize: 80 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 96 }} />
        </At>
        <At y={300} x={X}>
          <Words lines={["Plus rien.", "*Nulle part.*"]} align="left" delay={h5} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 96 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 112 }} />
        </At>
        <Chip at={h6} text="Trop de travail." x={620} y={1500} rot={4} red size={44} />
      </div>
      {/* zéro nouveau client */}
      <div style={{ opacity: phase(frame, h7, h8) }}>
        <Photo src="boulangerie-vitrine.jpg" dur={h8 - h7 + 20} zoom={[1.15, 1.25]} filter="brightness(0.7) saturate(0.8)" veil={0.5} pos="40% 55%" />
        <div style={{ position: "absolute", left: X - 10, top: 230, fontFamily: F.condensed, fontSize: 420, lineHeight: 1, color: C.copperLight, transform: `scale(${pop(frame, fps, h7 + 6, SPRING.heavy)})`, transformOrigin: "0 50%" }}>0</div>
        <At y={330} x={360}>
          <Words lines={["nouveau", "*client.*"]} align="left" delay={h7 + 8} stagger={3} mode="rise" style={{ ...BOLD, fontSize: 100 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 120 }} />
        </At>
      </div>
      {/* le problème : vouloir être partout */}
      <div style={{ opacity: phase(frame, h8, h10) }}>
        <At y={300} x={X}>
          <Words lines={["Le problème,", "ce n'est *pas Julien.*"]} align="left" delay={h8} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 80 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 96 }} />
        </At>
        {NETS.map((n, i) => {
          const ang = (i / 5) * Math.PI * 2 + frame * 0.02;
          const s = pop(frame, fps, h8 + 14 + i * 4, SPRING.bouncy);
          return (
            <div key={n.name} style={{ position: "absolute", left: W / 2 - 60 + Math.cos(ang) * 300, top: 1060 + Math.sin(ang) * 260, transform: `scale(${s})`, opacity: s > 0.01 ? 1 : 0 }}>
              <AppIcon net={n} size={120} label={false} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", ...BOLD, fontSize: 84, opacity: ramp(frame, [L("h9") + 14, L("h9") + 22], [0, 1]) }}>
          <span style={{ position: "relative" }}>
            Partout
            <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, background: RED, borderRadius: 6, transform: `scaleX(${ramp(frame, [L("h9") + 30, L("h9") + 40], [0, 1])})`, transformOrigin: "0 50%" }} />
          </span>
        </div>
      </div>
      {/* quatre questions */}
      <div style={{ opacity: phase(frame, h10) }}>
        <At y={290} x={X}>
          <Words lines={["On reprend avec lui,", "en *4 questions.*"]} align="left" delay={h10} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 82 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 100 }} />
        </At>
        <div style={{ position: "absolute", left: X, right: X, top: 640, display: "flex", flexDirection: "column", gap: 22 }}>
          {["Quel réseau ?", "Quoi publier ?", "Quel rythme ?", "Ça marche ?"].map((q, i) => {
            const s = pop(frame, fps, h10 + 20 + i * 6, SPRING.snappy);
            return (
              <div key={q} style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 30px", borderRadius: 26, background: "rgba(243,238,230,0.07)", border: `2px solid ${C.ivory}22`, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 100}px)` }}>
                <div style={{ fontFamily: F.condensed, fontSize: 64, color: C.copperLight, width: 80 }}>{`0${i + 1}`}</div>
                <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 52, color: C.ivory, letterSpacing: "-0.02em" }}>{q}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Illustratif o={phase(frame, h2, h3)} />
    </SceneFrame>
  );
};

// ─── Question 1 : quel réseau ──────────────────────────────────────────────

const Reseau: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const q2 = Math.min(L("q2"), 30);
  const q4 = L("q4");
  const q6 = L("q6");
  const q7 = L("q7");
  const q8 = L("q8", NEVER);
  const insta = has("q5") ? L("q5") : q4 + 50;
  return (
    <SceneFrame seed="l3q" variant="night" dur={620} zoom={[1, 1.02]} grid>
      <ChapterHead n="01" title={["Quel *réseau ?*"]} />
      {/* ses clients */}
      <div style={{ opacity: phase(frame, q2 - 6, q4) }}>
        <PhotoCard src="boulangerie-telephone-soir.jpg" x={X} y={600} w={W - 2 * X} h={760} at={q2 - 6} rot={-1.5} pos="50% 45%" />
        <Chip at={has("q3") ? L("q3") + 4 : q2 + 30} text="Des familles du quartier" x={X - 20} y={1210} rot={-3} hot size={44} />
        <Chip at={has("q3") ? L("q3") + 50 : q2 + 50} text="Avant le travail" x={560} y={1330} rot={3} size={44} />
      </div>
      {/* où sont-ils ? */}
      <div style={{ opacity: phase(frame, q4, q6) }}>
        <div style={{ position: "absolute", left: X, top: 620, ...MONO, fontSize: 26, color: C.copperLight }}>Où sont ses clients ?</div>
        <div style={{ position: "absolute", left: X - 10, right: X - 10, top: 700, display: "flex", justifyContent: "space-between" }}>
          {NETS.map((n, i) => {
            const on = (i === 0 && frame > q4 + 30) || (i === 1 && frame > insta + 4);
            const off = !on && frame > q4 + 30;
            return (
              <div key={n.name} style={{ transform: `scale(${on ? 1 + pop(frame, fps, i === 0 ? q4 + 30 : insta + 4, SPRING.bouncy) * 0.12 : 1})`, opacity: off ? 0.35 : 1 }}>
                <AppIcon net={n} size={150} grey={off ? 0.8 : 0} ring={on ? 1 : 0} />
              </div>
            );
          })}
        </div>
        <Chip at={S("q4_groupes", q4 + 40)} text="Les groupes du quartier" x={X} y={1010} rot={-2} hot size={46} />
        <div style={{ position: "absolute", left: X, right: X, top: 1170, ...SUB, fontSize: 40, color: C.ivory, opacity: ramp(frame, [q4 + 10, q4 + 20], [0, 1]) }}>Pas besoin d'être partout. Juste <span style={{ ...ACCENT_SERIF, fontSize: 50 }}>là où ils sont.</span></div>
      </div>
      {/* la règle */}
      <div style={{ opacity: phase(frame, q6, q7) }}>
        <At y={640} x={X}>
          <Words lines={["Allez là où sont", "*vos clients,*"]} align="left" delay={q6 + 10} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 92 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 112 }} />
        </At>
        <div style={{ position: "absolute", left: X, top: 960, ...BOLD, fontSize: 64, color: C.ivoryDim, opacity: ramp(frame, [S("q6_mode", q6 + 50), S("q6_mode", q6 + 50) + 8], [0, 1]) }}>
          <span style={{ position: "relative" }}>
            pas là où c'est à la mode.
            <span style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 9, background: RED, borderRadius: 5, transform: `scaleX(${ramp(frame, [S("q6_mode", q6 + 50) + 16, S("q6_mode", q6 + 50) + 28], [0, 1])})`, transformOrigin: "0 50%" }} />
          </span>
        </div>
      </div>
      {/* un seul réseau, bien tenu */}
      <div style={{ opacity: phase(frame, q7) }}>
        <div style={{ position: "absolute", left: W / 2 - 160, top: 640, transform: `scale(${pop(frame, fps, q7 + 4, SPRING.heavy)})` }}>
          <AppIcon net={NETS[0]} size={320} ring={ramp(frame, [S("q7_tenu", q7 + 40), S("q7_tenu", q7 + 40) + 10], [0, 1])} />
        </div>
        <div style={{ position: "absolute", left: W / 2 + 110, top: 600, padding: "12px 24px", borderRadius: 999, background: GRAD.copper, fontFamily: F.grotesk, fontWeight: 900, fontSize: 40, color: C.deep, transform: `scale(${pop(frame, fps, q7 + 20, SPRING.bouncy)}) rotate(8deg)` }}>N° 1</div>
        <At y={1110} x={X}>
          <Words lines={["Un seul réseau,", "*bien tenu.*"]} align="left" delay={q7 + 10} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 80 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 96 }} />
        </At>
        {has("q8") ? (
          <div style={{ position: "absolute", right: X, top: 1380, display: "flex", alignItems: "center", gap: 20, opacity: ramp(frame, [q8, q8 + 10], [0, 1]) }}>
            <div style={{ ...SUB, fontSize: 36, color: C.ivory, textAlign: "right" }}>Le 2e ?<br />Quand le 1er tourne.</div>
            <AppIcon net={NETS[1]} size={110} label={false} grey={0.6} />
          </div>
        ) : null}
      </div>
    </SceneFrame>
  );
};

// ─── Question 2 : quoi publier ─────────────────────────────────────────────

const Contenu: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const c3 = L("c3");
  const c4 = L("c4");
  const c5 = L("c5");
  const c6 = L("c6");
  const c7 = L("c7");
  const c8 = L("c8", NEVER);
  const c9 = L("c9");
  const start = Math.min(has("c2") ? L("c2") : c3, 30);
  return (
    <SceneFrame seed="l3c" variant="deep" dur={720} zoom={[1, 1.02]}>
      <ChapterHead n="02" title={["Quoi *publier ?*"]} />
      {/* pas d'idées… mais les mêmes questions tous les jours */}
      <div style={{ opacity: phase(frame, start - 6, c5) }}>
        <PhotoCard src="julien-portrait.jpg" x={X} y={600} w={400} h={500} at={start - 4} rot={-3} pos="50% 25%" label="« Pas d'idées… »" />
        <Ask at={c3 + 20} text="Vous ouvrez à quelle heure ?" x={480} y={640} w={510} size={36} rot={2} />
        <Ask at={c3 + 34} text="C'est sans gluten ?" x={540} y={830} w={420} size={36} rot={-2} />
        <Ask at={c3 + 48} text="Vous faites des gâteaux ?" x={500} y={990} w={480} size={36} rot={1} />
        <Ask at={c4} text="« C'est quoi la différence entre vos pains ? »" x={X} y={1230} w={W - 2 * X} size={54} />
      </div>
      {/* conseil */}
      <div style={{ opacity: phase(frame, c5, c6) }}>
        <div style={{ position: "absolute", left: (W - 440) / 2, top: 620, transform: `translateY(${(1 - pop(frame, fps, c5, SPRING.snappy)) * 400}px)` }}>
          <PhoneFrame w={440} h={860} style={{ background: "#000" }}>
            <Photo src="boulangerie-vitrine.jpg" dur={c6 - c5 + 20} zoom={[1.35, 1.5]} veil={0.15} pos="40% 70%" />
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 110, padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.92)", fontFamily: F.grotesk, fontWeight: 800, fontSize: 28, color: C.deep, textAlign: "center" }}>La différence entre nos pains</div>
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 76, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }}>
              <div style={{ width: `${ramp(frame, [c5, c6], [5, 90])}%`, height: "100%", borderRadius: 3, background: "#fff" }} />
            </div>
          </PhoneFrame>
        </div>
        <div style={{ position: "absolute", left: X, top: 1500, ...SUB, fontSize: 40, color: C.ivory, opacity: ramp(frame, [c5 + 10, c5 + 20], [0, 1]) }}>1 question = <span style={{ ...ACCENT_SERIF, fontSize: 50 }}>1 vidéo.</span></div>
        <Kind at={S("c5_conseil", c5 + 50)} text="Conseil" x={640} y={1360} />
      </div>
      {/* coulisses */}
      <div style={{ opacity: phase(frame, c6, c7) }}>
        <PhotoCard src="four-nuit.jpg" x={X} y={620} w={W - 2 * X} h={600} at={c6} rot={1.5} pos="45% 50%" />
        <div style={{ position: "absolute", left: X + 40, top: 660, fontFamily: F.condensed, fontSize: 120, color: C.ivory, textShadow: "0 6px 30px rgba(0,0,0,0.7)", opacity: ramp(frame, [c6 + 10, c6 + 18], [0, 1]) }}>04:00</div>
        <PhotoCard src="fournee-chariot.jpg" x={560} y={1100} w={420} h={380} at={c6 + 40} rot={-4} pos="50% 40%" />
        <Kind at={S("c6_coulisses", c6 + 50)} text="Coulisses" x={X} y={1330} />
      </div>
      {/* preuves */}
      <div style={{ opacity: phase(frame, c7, has("c8") ? c8 : c9) }}>
        <PhotoCard src="piece-montee.jpg" x={X} y={600} w={560} h={820} at={c7} rot={-2} pos="50% 55%" label="La pièce montée" />
        <Ask at={S("c7_cliente", c7 + 40)} text="« À samedi prochain ! »" x={520} y={1120} w={470} size={40} right />
        <Kind at={S("c7_preuves", c7 + 80)} text="Preuves" x={600} y={760} />
      </div>
      {/* les trois familles */}
      {has("c8") ? (
        <div style={{ opacity: phase(frame, c8, c9) }}>
          {[
            ["Conseils", "c8_conseils", ICON.message],
            ["Coulisses", "c8_coulisses", ICON.eye],
            ["Preuves", "c8_preuves", ICON.check],
          ].map(([t, k, ic], i) => {
            const at = S(k as string, c8 + i * 16);
            const s = pop(frame, fps, at, SPRING.bouncy);
            return (
              <div key={t as string} style={{ position: "absolute", left: X, right: X, top: 640 + i * 230, height: 200, borderRadius: 32, background: i === 0 ? `${C.copper}26` : "rgba(243,238,230,0.07)", border: `2px solid ${C.copperLight}66`, display: "flex", alignItems: "center", gap: 36, padding: "0 40px", opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 120}px)` }}>
                <div style={{ width: 120, height: 120, borderRadius: 34, background: GRAD.copper, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DrawIcon paths={ic as string[]} progress={ramp(frame, [at, at + 14], [0, 1])} size={68} color={C.deep} width={7} />
                </div>
                <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 72, color: C.ivory, letterSpacing: "-0.03em" }}>{t as string}</div>
              </div>
            );
          })}
        </div>
      ) : null}
      {/* une vidéo, une idée */}
      <div style={{ opacity: phase(frame, c9) }}>
        <div style={{ position: "absolute", left: X, top: 640, ...MONO, fontSize: 28, color: C.copperLight, opacity: ramp(frame, [c9, c9 + 8], [0, 1]) }}>La règle d'or</div>
        <div style={{ position: "absolute", left: X, right: X, top: 720, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {[
            ["1", "vidéo", S("c9_video", c9 + 30)],
            ["=", "", S("c9_video", c9 + 30) + 10],
            ["1", "idée", S("c9_idee", c9 + 50)],
          ].map(([n, t, at], i) => (
            <div key={i} style={{ textAlign: "center", transform: `scale(${pop(frame, fps, at as number, SPRING.heavy)})` }}>
              <div style={{ fontFamily: F.condensed, fontSize: i === 1 ? 200 : 300, lineHeight: 1, color: i === 1 ? C.ivoryDim : C.copperLight }}>{n}</div>
              <div style={{ ...ACCENT_SERIF, fontSize: 80, color: C.ivory }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </SceneFrame>
  );
};

// ─── Question 3 : quel rythme ──────────────────────────────────────────────

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

const Rythme: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S, has } = useCues(ctx);
  const r2 = L("r2");
  const r3 = L("r3");
  const r4 = L("r4");
  const r5 = L("r5");
  const r6 = L("r6", NEVER);
  const r7 = L("r7", NEVER);
  const sept = S("r4_sept", r4 + 80);
  return (
    <SceneFrame seed="l3r" variant="night" dur={600} zoom={[1, 1.02]} grid="perspective">
      <ChapterHead n="03" title={["Quel *rythme ?*"]} />
      {/* tous les jours… une semaine */}
      <div style={{ opacity: phase(frame, Math.min(r2 - 6, 24), r4) }}>
        <div style={{ position: "absolute", left: X, top: 620, ...MONO, fontSize: 26, color: C.copperLight }}>Le plan de Julien : tous les jours</div>
        {[0, 1, 2, 3].map((wk) => (
          <div key={wk} style={{ position: "absolute", left: X, right: X, top: 690 + wk * 150, display: "flex", justifyContent: "space-between" }}>
            {DAYS.map((d, i) => {
              const k = wk * 7 + i;
              const at = wk === 0 ? r2 + 6 + i * 4 : r3 + 10 + (k - 7) * 1.2;
              const done = wk === 0;
              const show = frame > at;
              return (
                <div key={i} style={{ width: 112, height: 120, borderRadius: 20, background: show ? (done ? GRAD.copper : "rgba(180,68,63,0.25)") : "rgba(243,238,230,0.06)", border: `2px solid ${show && !done ? "#B4443F" : `${C.ivory}22`}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <div style={{ ...MONO, fontSize: 20, color: show && done ? C.deep : C.ivoryDim }}>{d}</div>
                  {show ? <DrawIcon paths={done ? ICON.check : ICON.cross} progress={ramp(frame, [at, at + 6], [0, 1])} size={46} color={done ? C.deep : "#FF8A80"} width={12} /> : null}
                </div>
              );
            })}
          </div>
        ))}
        <Chip at={r3 + 12} text="Tenu : 1 semaine." x={X + 140} y={1330} rot={-3} red size={50} />
      </div>
      {/* 1 par semaine pendant un an > 7 par semaine pendant un mois */}
      <div style={{ position: "absolute", left: X, right: X, top: 620, display: "flex", gap: 30, opacity: phase(frame, r4, r5) }}>
        {[0, 1].map((side) => {
          const at = side ? r4 + 10 : sept;
          return (
            <div key={side} style={{ position: "relative", flex: 1, height: 680, borderRadius: 32, background: side ? `${C.copper}1F` : "rgba(243,238,230,0.06)", border: `2px solid ${side ? C.copperLight : `${C.ivory}22`}`, padding: "26px 24px", opacity: ramp(frame, [at - 4, at + 6], [0, 1]) }}>
              <div style={{ fontFamily: F.condensed, fontSize: 96, color: side ? C.copperLight : C.ivoryDim, lineHeight: 1 }}>{side ? "1 / sem." : "7 / sem."}</div>
              <div style={{ ...MONO, fontSize: 22, color: C.ivoryDim, marginTop: 8 }}>{side ? "pendant 1 an" : "pendant 1 mois"}</div>
              <div style={{ position: "absolute", left: 24, right: 24, bottom: 110, height: 300, display: "flex", alignItems: "flex-end", gap: 3 }}>
                {new Array(26).fill(0).map((_, i) => {
                  const grow = ramp(frame, [at + 6 + i * 1.5, at + 14 + i * 1.5], [0, 1]);
                  const h = side ? 70 * grow : i < 4 ? 280 * grow : 4;
                  return <div key={i} style={{ flex: 1, height: h, borderRadius: 3, background: side ? GRAD.copper : `${C.ivory}77` }} />;
                })}
              </div>
              <div style={{ position: "absolute", left: 24, bottom: 34, fontFamily: F.grotesk, fontWeight: 800, fontSize: 38, color: side ? C.ivory : C.ivoryDim, opacity: ramp(frame, [sept + 40, sept + 50], [0, 1]) }}>{side ? "Ça gagne." : "Ça s'arrête."}</div>
            </div>
          );
        })}
      </div>
      {/* une heure le mardi */}
      <div style={{ opacity: phase(frame, r5, has("r6") ? r6 : NEVER) }}>
        <div style={{ position: "absolute", left: X, right: X, top: 620, borderRadius: 32, background: "rgba(243,238,230,0.06)", border: `2px solid ${C.ivory}22`, padding: "30px 34px", height: 760 }}>
          <div style={{ ...MONO, fontSize: 24, color: C.copperLight }}>Agenda · mardi</div>
          {["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((h, i) => (
            <div key={h} style={{ position: "absolute", left: 34, right: 34, top: 100 + i * 105, borderTop: `1px solid ${C.ivory}22`, ...MONO, fontSize: 22, color: C.ivoryDim, paddingTop: 8 }}>{h}</div>
          ))}
          <div style={{ position: "absolute", left: 170, right: 34, top: 300, height: 140, borderRadius: 18, background: GRAD.copper, padding: "16px 24px", transform: `scaleY(${ramp(frame, [r5 + 20, r5 + 32], [0, 1], EASE.back)})`, transformOrigin: "50% 0" }}>
            <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 40, color: C.deep }}>Vidéos de la semaine</div>
            <div style={{ fontFamily: F.grotesk, fontWeight: 600, fontSize: 26, color: C.deep }}>14:00 – 15:00 · 1 heure</div>
          </div>
        </div>
      </div>
      {/* plusieurs d'un coup, programmées */}
      {has("r6") ? (
        <div style={{ opacity: phase(frame, r6, r7) }}>
          <div style={{ position: "absolute", left: X, top: 630, ...MONO, fontSize: 26, color: C.copperLight }}>Préparées d'un coup</div>
          {["Lun.", "Mer.", "Ven.", "Sam."].map((d, i) => {
            const s = pop(frame, fps, r6 + 6 + i * 8, SPRING.snappy);
            const ok = frame > S("r6_programme", r6 + 50) + i * 4;
            return (
              <div key={d} style={{ position: "absolute", left: X + i * 228, top: 700, width: 200, height: 360, borderRadius: 24, overflow: "hidden", background: "#000", border: `3px solid ${ok ? C.copperLight : C.ivory}`, transform: `translateY(${(1 - s) * 200}px) rotate(${(i - 1.5) * 2}deg)`, opacity: Math.min(1, s * 1.5) }}>
                <Photo src={["four-nuit.jpg", "fournee-chariot.jpg", "boulangerie-vitrine.jpg", "piece-montee.jpg"][i]} dur={200} zoom={[1.1, 1.2]} veil={0.2} />
                <div style={{ position: "absolute", left: 12, top: 12, ...MONO, fontSize: 18, color: C.ivory }}>{d}</div>
                {ok ? (
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center" }}>
                    <Mark p={1} size={56} />
                  </div>
                ) : null}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: X, top: 1120, ...BOLD, fontSize: 64, opacity: ramp(frame, [S("r6_programme", r6 + 50), S("r6_programme", r6 + 50) + 8], [0, 1]) }}>
            …et <span style={{ ...ACCENT_SERIF, fontSize: 78 }}>programmées.</span>
          </div>
        </div>
      ) : null}
      {/* une vidéo, trois réseaux */}
      {has("r7") ? (
        <div style={{ opacity: phase(frame, r7) }}>
          <div style={{ position: "absolute", left: X, top: 630, ...MONO, fontSize: 26, color: C.copperLight }}>Une même vidéo verticale</div>
          {[
            ["Reel", "r7_reel", NETS[1]],
            ["TikTok", "r7_tiktok", NETS[2]],
            ["Short", "r7_short", NETS[4]],
          ].map(([t, k, n], i) => {
            const s = pop(frame, fps, S(k as string, r7 + 40 + i * 12), SPRING.bouncy);
            return (
              <div key={t as string} style={{ position: "absolute", left: X + i * 310, top: 720, width: 280, textAlign: "center", transform: `scale(${s})`, opacity: s > 0.01 ? 1 : 0 }}>
                <div style={{ width: 240, height: 420, margin: "0 auto", borderRadius: 26, overflow: "hidden", border: `3px solid ${C.ivory}` }}>
                  <Photo src="four-nuit.jpg" dur={200} zoom={[1.2, 1.25]} veil={0.15} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 20 }}>
                  <AppIcon net={n as Net} size={64} label={false} />
                  <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 46, color: C.ivory }}>{t as string}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </SceneFrame>
  );
};

// ─── Question 4 : ça marche ? ──────────────────────────────────────────────

const Mesure: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S } = useCues(ctx);
  const m2 = L("m2");
  const m3 = L("m3");
  const m4 = L("m4");
  const m5 = L("m5");
  const m6 = L("m6");
  const likes = Math.round(interpolate(frame, [m2 + 4, m3], [0, 48], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const msg = S("m4_messages", m4 + 30);
  return (
    <SceneFrame seed="l3m" variant="deep" dur={420} zoom={[1, 1.02]}>
      <ChapterHead n="04" title={["Ça *marche ?*"]} />
      {/* les likes : mauvais compteur */}
      <div style={{ opacity: phase(frame, Math.min(m2 - 6, 24), m4) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", transform: `scale(${pop(frame, fps, Math.min(m2, 30), SPRING.heavy)})` }}>
          <span style={{ fontSize: 200, color: "#FF6B7F" }}>♥</span>
          <div style={{ fontFamily: F.condensed, fontSize: 220, lineHeight: 1, color: C.ivory, position: "relative", display: "inline-block", marginLeft: 30 }}>
            {likes}
            <span style={{ position: "absolute", left: -40, right: -40, top: "48%", height: 18, background: RED, borderRadius: 9, transform: `scaleX(${ramp(frame, [m3, m3 + 10], [0, 1])}) rotate(-8deg)` }} />
          </div>
          <div style={{ ...MONO, fontSize: 30, color: C.ivoryDim, marginTop: 10 }}>likes</div>
        </div>
        <Chip at={m3 + 4} text="Mauvais compteur." x={X + 120} y={1260} rot={-3} red size={56} />
      </div>
      {/* ce qui compte : les messages */}
      <div style={{ opacity: phase(frame, m4, m5) }}>
        <div style={{ position: "absolute", left: X, top: 620, ...MONO, fontSize: 26, color: C.copperLight }}>Ce qui compte vraiment</div>
        <div style={{ position: "absolute", left: (W - 480) / 2, top: 690, transform: `translateY(${(1 - pop(frame, fps, m4, SPRING.snappy)) * 400}px)` }}>
          <PhoneFrame w={480} h={820} style={{ background: "#F7F4EF" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 56, textAlign: "center", fontFamily: F.grotesk, fontWeight: 800, fontSize: 26, color: "#333" }}>Messages · 3 nouveaux</div>
            {["Il vous reste des cramiques samedi ?", "Vous faites des pièces montées ?", "Je peux commander pour 20 personnes ?"].map((t, i) => {
              const s = pop(frame, fps, msg + i * 14, SPRING.bouncy);
              return (
                <div key={t} style={{ position: "absolute", left: 22, right: 70, top: 130 + i * 190, padding: "18px 22px", borderRadius: "26px 26px 26px 8px", background: "#FFFFFF", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", fontFamily: F.grotesk, fontWeight: 700, fontSize: 30, color: "#202124", lineHeight: 1.2, transform: `scale(${s})`, transformOrigin: "0 100%", opacity: s > 0.01 ? 1 : 0 }}>
                  {t}
                </div>
              );
            })}
          </PhoneFrame>
        </div>
      </div>
      {/* au comptoir */}
      <div style={{ opacity: phase(frame, m5, m6) }}>
        <Photo src="boulangerie-vitrine.jpg" dur={m6 - m5 + 20} zoom={[1.1, 1.2]} filter="brightness(0.85)" veil={0.45} pos="50% 70%" />
        <div style={{ position: "absolute", left: X, top: 640, ...MONO, fontSize: 26, color: C.copperLight }}>Au comptoir</div>
        <Ask at={S("m5_quote", m5 + 50)} text="« Je vous ai vu sur Facebook ! »" x={X} y={1000} w={W - 2 * X} size={64} />
      </div>
      {/* le vrai résultat */}
      <div style={{ opacity: phase(frame, m6) }}>
        <div style={{ position: "absolute", left: W / 2 - 110, top: 700, transform: `scale(${pop(frame, fps, m6, SPRING.heavy)})` }}>
          <Mark p={ramp(frame, [m6 + 4, m6 + 16], [0, 1])} size={220} />
        </div>
        <At y={1000} x={X}>
          <Words lines={["Ça, c'est le", "*vrai résultat.*"]} align="left" delay={m6} stagger={2} mode="rise" style={{ ...BOLD, fontSize: 96 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 116 }} />
        </At>
      </div>
    </SceneFrame>
  );
};

// ─── Résumé (version longue) ───────────────────────────────────────────────

const Recap: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { S } = useCues(ctx);
  const items: [string, string, string, string[]][] = [
    ["1", "réseau principal", "s1_reseau", ICON.target],
    ["3", "types de contenus", "s1_types", ICON.play],
    ["1", "publication / semaine", "s1_pub", ICON.box],
    ["✓", "les vrais contacts", "s1_contacts", ICON.message],
  ];
  return (
    <SceneFrame seed="l3s" variant="night" dur={220} zoom={[1, 1.04]} grid="perspective">
      <At y={260} x={X}>
        <Words lines={["*Résumé.*"]} align="left" delay={2} stagger={3} mode="rise" style={{ fontSize: 120 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 130 }} />
      </At>
      <div style={{ position: "absolute", left: X, right: X, top: 480, display: "flex", flexDirection: "column", gap: 30 }}>
        {items.map(([n, t, k, ic], i) => {
          const at = S(k, 10 + i * 30);
          const s = pop(frame, fps, at, SPRING.bouncy);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 30, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 100}px)` }}>
              <div style={{ width: 120, height: 120, borderRadius: 32, background: GRAD.copper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <DrawIcon paths={ic} progress={ramp(frame, [at, at + 14], [0, 1])} size={66} color={C.deep} width={7} />
              </div>
              <div style={{ fontFamily: F.condensed, fontSize: 110, color: C.copperLight, width: 80, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 56, color: C.ivory, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{t}</div>
            </div>
          );
        })}
      </div>
      <PhotoCard src="julien-portrait.jpg" x={620} y={1180} w={360} h={380} at={S("s1_contacts", 100) + 10} rot={3} pos="50% 25%" label="Julien, organisé" />
    </SceneFrame>
  );
};

// ─── Le test ───────────────────────────────────────────────────────────────

const Exo: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { L, S } = useCues(ctx);
  const e1 = L("e1");
  const tenus = S("e1_tenus", e1 + 90);
  return (
    <SceneFrame seed="l3e" variant="deep" dur={160} zoom={[1, 1.03]}>
      <At y={260} x={X}>
        <Words lines={["Faites *le test.*"]} align="left" delay={2} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 108 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 128 }} />
      </At>
      <div style={{ position: "absolute", left: X, right: X, top: 520, display: "flex", gap: 30 }}>
        {[
          ["Comptes ouverts", "?", e1 + 20],
          ["Vraiment tenus", "?", tenus],
        ].map(([t, v, at], i) => {
          const s = pop(frame, fps, at as number, SPRING.snappy);
          return (
            <div key={t as string} style={{ flex: 1, height: 520, borderRadius: 32, background: i ? `${C.copper}26` : "rgba(243,238,230,0.07)", border: `2px solid ${i ? C.copperLight : `${C.ivory}22`}`, padding: "34px 30px", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 80}px)` }}>
              <div style={{ ...MONO, fontSize: 24, color: C.copperLight, lineHeight: 1.4 }}>{t as string}</div>
              <div style={{ fontFamily: F.condensed, fontSize: 280, color: C.ivory, lineHeight: 1.1, marginTop: 20 }}>{v as string}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: X, right: X, top: 1110, display: "flex", justifyContent: "space-between", opacity: ramp(frame, [e1 + 30, e1 + 40], [0, 1]) }}>
        {NETS.map((n, i) => (
          <AppIcon key={n.name} net={n} size={130} label={false} grey={frame > tenus + 10 + i * 4 && i > 0 ? 0.85 : 0} ring={frame > tenus + 10 && i === 0 ? 1 : 0} />
        ))}
      </div>
    </SceneFrame>
  );
};

// ─── Appel à l'action ──────────────────────────────────────────────────────

const Cta: React.FC<{ ctx: Ctx }> = ({ ctx }) => {
  const frame = useCurrentFrame();
  const { L, S, has, talk } = useCues(ctx);
  const w1 = L("w1");
  const wa = S("w1_whatsapp", w1 + 40);
  return (
    <SceneFrame seed="l3w" variant="night" dur={200} zoom={[1.04, 1]}>
      <Photo src="four-nuit.jpg" dur={240} zoom={[1.4, 1.25]} filter="brightness(0.6)" veil={0.5} pos="35% 50%" />
      <At y={290} x={X}>
        <Words lines={["Par où", "*commencer ?*"]} align="left" delay={w1} stagger={3} mode="drop" style={{ ...BOLD, fontSize: 112 }} accentStyle={{ ...ACCENT_SERIF, fontSize: 132 }} />
      </At>
      <Bubble x={110} y={930} at={wa} text="On choisit ensemble sur WhatsApp !" tail="right" />
      <Moon x={W / 2 + 200} y={1050} size={440} delay={4} poses={[[0, "open"], [wa, "wave"]]} talk={talk} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", fontFamily: F.grotesk, fontWeight: 900, fontSize: 64, color: C.copperLight, textShadow: "0 4px 20px rgba(0,0,0,0.6)", opacity: ramp(frame, [wa + 10, wa + 22], [0, 1]) }}>0470 35 43 90</div>
      {has("w2") ? <Chip at={L("w2")} text="+ Abonnez-vous" x={X} y={640} rot={-2} size={42} /> : null}
    </SceneFrame>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

const COMP: Record<string, React.FC<{ ctx: Ctx }>> = { hook: Hook, reseau: Reseau, contenu: Contenu, rythme: Rythme, mesure: Mesure, recap: Recap, exo: Exo, cta: Cta };
const EXIT = {
  hook: () => glitchSlice(),
  reseau: () => wipe({ direction: "from-right" }),
  contenu: () => splitDoors(),
  rythme: () => zoomPunch(),
  mesure: () => inkDrop({ x: W / 2, y: 900 }),
  recap: () => swipeUp(),
  exo: () => wipe({ direction: "from-left" }),
  cta: () => copperSweep(),
};
const EPISODES = ["reseau", "contenu", "rythme", "mesure"];

const long = makeStory(LONG as StoryMeta, "l3-long.m4a", COMP, EXIT, EPISODES);
const short = makeStory(SHORT as StoryMeta, "l3-short.m4a", COMP, EXIT, EPISODES);
export const L3Long = long.Video;
export const L3_LONG_DURATION = long.duration;
export const L3Short = short.Video;
export const L3_SHORT_DURATION = short.duration;
