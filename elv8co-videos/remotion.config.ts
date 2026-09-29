/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";
import fs from "node:fs";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.overrideBundlerConfig(enableTailwind);

// Use a locally installed headless Chromium when available (e.g. CI / sandbox)
const localShell =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (fs.existsSync(localShell)) {
  Config.setBrowserExecutable(localShell);
  // the sandbox proxy re-signs TLS; let Chromium fetch Google Fonts through it
  Config.setChromiumIgnoreCertificateErrors(true);
}
