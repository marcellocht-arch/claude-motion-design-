// Usage: node scripts/stills.mjs <compositionId> <outDir> <frame,frame,...>
// Bundles once and renders the requested frames as JPEG stills (for frame-by-frame review).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { enableTailwind } from "@remotion/tailwind-v4";

const [id, outDir, framesArg] = process.argv.slice(2);
const shell = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable = fs.existsSync(shell) ? shell : null;
const chromiumOptions = { ignoreCertificateErrors: true };
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: enableTailwind });
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
const frames = framesArg
  ? framesArg.split(",").map(Number)
  : Array.from({ length: Math.ceil(composition.durationInFrames / 15) }, (_, i) => i * 15);
for (const frame of frames) {
  const output = path.join(outDir, `${id}-${String(frame).padStart(4, "0")}.jpeg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 80, scale: 0.35, browserExecutable, chromiumOptions });
  process.stdout.write(`${frame} `);
}
console.log("done");
