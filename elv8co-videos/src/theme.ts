import { Easing } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

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
const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const archivo = loadArchivo("normal", {
  weights: ["500", "700", "900"],
  subsets: ["latin"],
});
const serif = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });
loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
const mono = loadMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

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
