import { Easing } from "remotion";
import { staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

// ─── Palette ────────────────────────────────────────────────────────────────
export const C = {
  night: "#1A2E45",
  deep: "#0D1B2A",
  abyss: "#070F18",
  copper: "#C87941",
  copperLight: "#E09055",
  copperDark: "#8A4A22",
  ivory: "#F3EEE6",
  ivoryDim: "rgba(243,238,230,0.62)",
  steel: "#5D7189",
} as const;

export const GRAD = {
  copper: `linear-gradient(135deg, ${C.copperLight} 0%, ${C.copper} 55%, ${C.copperDark} 100%)`,
  copperText: `linear-gradient(180deg, #F2B27F 0%, ${C.copperLight} 35%, ${C.copper} 70%, ${C.copperDark} 100%)`,
  night: `radial-gradient(120% 80% at 50% 30%, ${C.night} 0%, ${C.deep} 60%, ${C.abyss} 100%)`,
  ivory: `radial-gradient(120% 90% at 50% 20%, #FFFBF5 0%, ${C.ivory} 55%, #E4DACB 100%)`,
};

// ─── Typography ─────────────────────────────────────────────────────────────
// Polices embarquées dans public/fonts (pas de dépendance réseau au rendu).
const local = (family: string, file: string, weight: string, style: "normal" | "italic" = "normal") =>
  loadFont({ family, url: staticFile(`fonts/${file}.woff2`), weight, style, format: "woff2" });
local("Anton", "anton-latin-400-normal", "400");
local("Archivo", "archivo-latin-500-normal", "500");
local("Archivo", "archivo-latin-700-normal", "700");
local("Archivo", "archivo-latin-900-normal", "900");
local("Instrument Serif", "instrument-serif-latin-400-normal", "400");
local("Instrument Serif", "instrument-serif-latin-400-italic", "400", "italic");
local("JetBrains Mono", "jetbrains-mono-latin-500-normal", "500");
local("JetBrains Mono", "jetbrains-mono-latin-700-normal", "700");
const anton = { fontFamily: "Anton" };
const archivo = { fontFamily: "Archivo" };
const serif = { fontFamily: "Instrument Serif" };
const mono = { fontFamily: "JetBrains Mono" };

export const F = {
  condensed: anton.fontFamily, // tall, poster-like
  grotesk: archivo.fontFamily, // bold grotesque
  serif: serif.fontFamily, // editorial serif (+ italic)
  mono: mono.fontFamily, // UI labels, timecodes
};

// ─── Format & rhythm ────────────────────────────────────────────────────────
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const BPM = 110;
/** Frames per beat at 110 BPM / 30 fps ≈ 16.36 */
export const BEAT = (FPS * 60) / BPM;
export const beats = (n: number) => Math.round(n * BEAT);

// ─── Easings ────────────────────────────────────────────────────────────────
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  snap: Easing.bezier(0.85, 0, 0.15, 1),
};

export const SAFE_X = 90; // lateral safe margin for text
