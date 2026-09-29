# ELV8co — vidéos verticales (Remotion)

Quatre vidéos 1080×1920, 30 fps, ~30 s, calées sur un tempo de 110 BPM.

| Composition | Fichier rendu | Thème |
|---|---|---|
| `V1-PersonalBranding` | `out/ELV8co-01-personal-branding.mp4` | Éditorial (serif, vitrines, cœur) |
| `V2-VideoContent` | `out/ELV8co-02-contenu-video.mp4` | Cinéma / interface (REC, timeline, téléphone) |
| `V3-Advertising` | `out/ELV8co-03-publicite.mp4` | Data (pièces, compteurs, graphiques) |
| `V4-AllTogether` | `out/ELV8co-04-les-trois-ensemble.mp4` | Géométrique (cercle, carré, triangle qui fusionnent) |

## Structure

- `src/theme.ts` : palette, polices Google Fonts, tempo (`BEAT`, `beats()`), easings
- `src/components/` : `Logo` (intros animées + logo discret en haut), `EndCard` (carte de fin commune),
  `Kinetic` (Words, Letters, OutlineFill, Marquee, Odometer, Typewriter), `Background`, `Particles`,
  `Icons`, `SceneFrame`, `SceneSeries`
- `src/transitions/` : transitions sur mesure (zoomPunch, splitDoors, copperSweep, blinds,
  glitchSlice, spinZoom, swipeUp, inkDrop), en plus de celles de `@remotion/transitions`
- `src/videos/` : une composition par vidéo

## Commandes

```bash
npm i
npm run dev                                   # Studio
npx remotion render V1-PersonalBranding out/ELV8co-01-personal-branding.mp4
node scripts/stills.mjs V1-PersonalBranding /tmp/stills 0,60,120   # images de contrôle
```
