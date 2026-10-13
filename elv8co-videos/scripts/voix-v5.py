"""
Prépare la voix off de la V5 (GEO) :
- raccourcit les pauses longues à PAUSE secondes,
- accélère la voix (SPEED, sans changer la hauteur),
- écrit public/voix-off-v5.m4a et src/videos/v5cues.ts (repères en frames, fenêtres de parole pour la lune).

Usage : python3 scripts/voix-v5.py <fichier-voix.mp3>
Les repères CUES sont en secondes dans l'audio d'origine (relevés sur les pauses de l'enregistrement ElevenLabs).
"""
import json
import re
import subprocess
import sys

SRC = sys.argv[1]
PAUSE = 0.20
SPEED = 1.13
FPS = 30
LEAD = 20  # frames avant le premier mot

def silences(d):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", SRC, "-af", f"silencedetect=noise=-35dB:d={d}", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", out)]
    e = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", out)]
    return list(zip(s, e))

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", SRC], capture_output=True, text=True).stdout)
big = silences(0.35)
fine = silences(0.12)

removed = [(a + PAUSE / 2, b - PAUSE / 2) for a, b in big if b - a > PAUSE]

def removed_before(t):
    return sum(max(0.0, min(t, b) - a) for a, b in removed if t > a)

def frame(t):
    return round(LEAD + (t - removed_before(t)) / SPEED * FPS)

# Morceaux gardés
keep, cur = [], 0.0
for a, b in removed:
    keep.append((cur, a))
    cur = b
keep.append((cur, dur))
parts = "".join(f"[0]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS[p{i}];" for i, (a, b) in enumerate(keep))
graph = parts + "".join(f"[p{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1,atempo={SPEED}[out]"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", SRC, "-filter_complex", graph, "-map", "[out]", "-c:a", "aac", "-b:a", "192k", "public/voix-off-v5.m4a"], check=True)

# Fenêtres de parole (pour la bouche de la lune)
talk, cur = [], 0.0
for a, b in fine:
    if a - cur > 0.08:
        talk.append([frame(cur + 0.02), frame(a)])
    cur = b
if dur - cur > 0.08:
    talk.append([frame(cur), frame(dur)])

CUES = {
    "hello": 0.0, "geoLine": 3.80,
    "avant": 6.71, "dixLiens": 8.54, "aujourdhui": 10.68, "pasDix": 13.51, "noms": 14.98,
    "comment": 16.84, "question": 18.09, "litWeb": 19.52, "resume": 24.55, "cite": 25.69,
    "engines": 27.80, "chatgpt": 28.65, "perplexity": 29.49, "gemini": 30.42, "copilot": 31.17, "claude": 31.93, "google": 33.0,
    "definition": 34.56,
    "seo": 38.27, "geoRecommande": 40.72, "faits": 43.13, "resultat": 45.92,
    "princeton": 48.16, "motsCles": 50.17, "baisse": 51.79, "sources": 52.91, "clair": 54.04, "quarante": 56.2,
    "why": 59.06, "why1": 61.25, "why2": 63.05, "why3": 65.38,
    "appliquer": 67.20, "c1": 68.33, "c2": 70.65, "c3": 73.05, "c4": 76.08, "c5": 78.74, "c6": 80.98,
    "exemple": 83.77, "introuvable": 86.80, "apres": 88.57,
    "test": 93.48, "pasLa": 95.86, "occupe": 96.78,
    "whatsapp": 97.80, "ceQue": 101.77, "bientot": 104.52,
    "fin": dur,
}
cues = {k: frame(v) for k, v in CUES.items()}

with open("src/videos/v5cues.ts", "w") as f:
    f.write("// Généré par scripts/voix-v5.py — ne pas modifier à la main.\n")
    f.write(f"// Voix accélérée x{SPEED}, pauses ramenées à {PAUSE} s, début à la frame {LEAD}.\n")
    f.write(f"export const VOICE_LEAD = {LEAD};\n")
    f.write(f"export const CUE = {json.dumps(cues, indent=2)} as const;\n")
    f.write(f"export const TALK: [number, number][] = {json.dumps(talk)};\n")

print("audio", round((dur - sum(b - a for a, b in removed)) / SPEED, 2), "s ; fin voix frame", cues["fin"], "; à bientôt frame", cues["bientot"])
