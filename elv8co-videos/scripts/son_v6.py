"""
Bande son de la V6 « Votre mascotte, à vous » : musique 110 BPM (fa majeur) + bruitages calés sur l'image.
Lit src/videos/v6plan.json et écrit public/son-v6.m4a à -14 LUFS.
Usage : SCRATCH=<dossier temporaire> python3 scripts/son_v6.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from sonlib import Bus, arrange, chime, epiano, hz, impact, plan_times, pop, reverb, riser, tick, whoosh, write  # noqa: E402

PLAN = json.load(open("src/videos/v6plan.json"))
FPS, BEAT_S = PLAN["fps"], 60 / PLAN["bpm"]
START, B, DUR = plan_times(PLAN)
TOTAL_F = START["end"] + PLAN["endFrames"]
SECONDS = TOTAL_F / FPS
f2s = lambda sid, fr: (START[sid] + fr) / FPS  # noqa: E731
b2s = lambda b: b * BEAT_S  # noqa: E731

music, sfx = Bus(SECONDS + 2), Bus(SECONDS + 2)

CHORDS = [
    ("F2", ["A3", "C4", "F4", "G4"]),  # Fadd9
    ("C2", ["G3", "C4", "E4", "G4"]),  # C
    ("D2", ["A3", "D4", "F4", "C5"]),  # Dm7
    ("Bb1", ["F3", "Bb3", "D4", "A4"]),  # Bbmaj7
]
SECTIONS = [
    (B["hook"], B["jargon"], {"kick": 1, "bass": 1, "keys": 0.8, "hat": 0.8, "clap": 1}),
    (B["jargon"], B["solution"], {"kick_half": 1, "bass_long": 1, "keys": 0.6}),
    (B["solution"], B["gallery"], {"kick": 1, "bass": 1, "keys": 0.8, "hat": 0.6}),
    (B["gallery"], B["included"], {"kick": 1, "bass": 1, "keys": 0.9, "hat": 1, "clap": 1, "arp": 0.9, "ohat": 1}),
    (B["included"], B["how"], {"kick": 1, "bass": 1, "keys": 0.8, "hat": 1, "clap": 1}),
    (B["how"], B["cta"], {"kick": 1, "bass": 1, "keys": 0.8, "hat": 0.7, "arp": 0.6}),
    (B["cta"], B["end"], {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1, "ohat": 1}),
]
arrange(music, SECTIONS, CHORDS, B["end"], BEAT_S)
for i, n in enumerate(["F3", "C4", "F4", "A4", "C5", "G5"]):
    music.add(epiano(hz(n), 4.0, 0.7), b2s(B["end"]) + i * 0.02, pan=(i - 2.5) * 0.2)
music.add(riser(b2s(4), 0.7), b2s(B["gallery"] - 4))
music.add(riser(b2s(4), 0.6), b2s(B["cta"] - 4))

# transitions
ids = [s["id"] for s in PLAN["scenes"]]
for i in range(1, len(ids)):
    sfx.add(whoosh(PLAN["scenes"][i - 1]["exit"] / FPS + 0.15, 0.55), START[ids[i]] / FPS - 0.05)

# accroche : coup d'envoi immédiat, puis les trois lignes
sfx.add(impact(0.9), 0.0)
sfx.add(pop(0.8, 0.8), f2s("hook", 14))
sfx.add(pop(0.8, 0.9), f2s("hook", 30))
sfx.add(chime(hz("C6"), 0.8), f2s("hook", 48))
sfx.add(pop(0.7, 1.3), f2s("hook", 70))
# jargon : chaque mot surgit, puis tout tombe
for i in range(10):
    sfx.add(pop(0.55, 0.8 + (i % 4) * 0.15), f2s("jargon", 20 + i * 9), pan=(i % 3 - 1) * 0.5)
sfx.add(whoosh(0.9, 0.7), f2s("jargon", DUR["jargon"] - 46))
# solution : téléphone + trois tampons
sfx.add(whoosh(0.5, 0.5), f2s("solution", 4))
for i in range(3):
    sfx.add(impact(0.35), f2s("solution", 44 + i * 16))
# galerie : arrivée de chaque mascotte
slot = round((DUR["gallery"] - 18) / 3)
for i in range(3):
    if i:
        sfx.add(whoosh(0.55, 0.6), f2s("gallery", i * slot - 4), pan=0.4)
    sfx.add(pop(0.8, 1.0 + i * 0.1), f2s("gallery", i * slot + 8))
    sfx.add(chime(hz(["A5", "C6", "F6"][i]), 0.6), f2s("gallery", i * slot + 18))
# compris : un clic par ligne
step = (DUR["included"] - 70) // 6
for i in range(6):
    sfx.add(tick(0.9), f2s("included", 30 + i * step))
    sfx.add(pop(0.4, 1.2), f2s("included", 30 + i * step + 2))
# 3 étapes
for i in range(3):
    sfx.add(pop(0.8, 0.9 + i * 0.12), f2s("how", 20 + i * 50))
for i in range(5):
    sfx.add(tick(0.6), f2s("how", 140 + i * 6))
# appel à l'action
sfx.add(pop(0.8, 1.1), f2s("cta", 50))
sfx.add(chime(hz("F6"), 0.7), f2s("cta", 70))
sfx.add(impact(0.7), f2s("end", 27))

mix = reverb(music.stereo(), 0.16) * 0.8 + reverb(sfx.stereo(), 0.1) * 0.75
write(mix, os.environ.get("SCRATCH", ".") + "/son-v6.wav", "public/son-v6.m4a", SECONDS)
print(f"son-v6 : {SECONDS:.2f} s, {TOTAL_F} frames")
