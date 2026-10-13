"""
Bande son de la V4 « Les trois ensemble » : musique originale 110 BPM + bruitages calés sur l'image.
Lit src/videos/v4plan.json (mêmes temps que la vidéo) et écrit public/son-v4.m4a à -14 LUFS.
Usage : python3 scripts/son_v4.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from sonlib import Bus, bass, chime, clap, epiano, hat, hz, impact, kick, pluck, pop, reverb, riser, tick, whoosh, write  # noqa: E402

PLAN = json.load(open("src/videos/v4plan.json"))
FPS, BPM = PLAN["fps"], PLAN["bpm"]
BEAT_S = 60 / BPM
BEAT_F = FPS * BEAT_S

# Début de chaque scène, en frames et en temps (même calcul que dans V4AllTogether.tsx)
START, BEATS_AT = {}, {}
cum = 0
for sc in PLAN["scenes"]:
    START[sc["id"]] = round(cum * BEAT_F)
    BEATS_AT[sc["id"]] = cum
    cum += sc["beats"]
TOTAL_F = START["end"] + PLAN["endFrames"]
SECONDS = TOTAL_F / FPS


def f2s(scene, local_frame):
    return (START[scene] + local_frame) / FPS


def b2s(beat):
    return beat * BEAT_S


music = Bus(SECONDS + 2)
sfx = Bus(SECONDS + 2)

# ─── Harmonie : ré mineur, un accord par mesure (4 temps) ─────────────────
CHORDS = [
    ("D2", ["D4", "F4", "A4", "C5"]),  # Dm7
    ("Bb1", ["D4", "F4", "Bb4", "A4"]),  # Bbmaj7
    ("F2", ["C4", "F4", "A4", "E5"]),  # Fmaj7
    ("C2", ["C4", "E4", "G4", "D5"]),  # Cadd9
]


def chord_at(beat):
    return CHORDS[int(beat // 4) % 4]


# Sections : (début, fin) en temps -> couches actives
B = BEATS_AT
END_BEAT = B["end"] + 10
SECTIONS = [
    (0, B["hook"] + 4, {"arp": 0.6, "keys": 0.5}),  # intro, montée vers la fusion
    (B["hook"] + 4, B["trap"], {"kick": 1, "bass": 1, "keys": 0.8, "hat": 0.8}),
    (B["trap"], B["trust"], {"kick_sparse": 1, "bass_long": 1, "keys": 0.6}),  # le piège : plus sombre
    (B["trust"], B["regularity"], {"kick": 1, "bass": 1, "keys": 0.7, "hat": 0.6}),
    (B["regularity"], B["reach"], {"kick": 1, "bass": 1, "keys": 0.7, "hat": 1, "clap": 1}),
    (B["reach"], B["fusion"], {"kick": 1, "bass": 1, "keys": 0.7, "hat": 1, "clap": 1, "arp": 0.7}),
    (B["fusion"], B["example"], {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1, "ohat": 1}),
    (B["example"], B["journey"], {"kick": 1, "bass": 1, "keys": 0.7, "hat": 0.7}),  # l'exemple : plus posé
    (B["journey"], B["without"], {"kick": 1, "bass": 1, "keys": 0.8, "hat": 1, "clap": 1, "arp": 0.8}),
    (B["without"], B["real"], {"keys": 0.7}),  # « sans vidéos… » : tout se coupe
    (B["real"], B["question"], {"kick": 1, "bass": 1, "keys": 0.9, "hat": 1, "clap": 1, "arp": 0.8, "ohat": 1}),
    (B["question"], B["offer"], {"kick_half": 1, "bass_long": 1, "keys": 0.8}),  # la question : demi-tempo
    (B["offer"], B["end"], {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1, "ohat": 1}),
]


def layers_at(beat):
    for a, b, lay in SECTIONS:
        if a <= beat < b:
            return lay
    return {}


total_beats = int(END_BEAT)
for beat in range(total_beats):
    lay = layers_at(beat)
    t = b2s(beat)
    root, tones = chord_at(beat)
    bar_pos = beat % 4
    # batterie
    if "kick" in lay:
        music.add(kick(0.95), t)
    if "kick_sparse" in lay and bar_pos == 0:
        music.add(kick(0.8), t)
    if "kick_half" in lay and bar_pos == 0:
        music.add(kick(0.9), t)
    if "kick_half" in lay and bar_pos == 2:
        music.add(clap(0.7), t)
    if "clap" in lay and bar_pos in (1, 3):
        music.add(clap(0.55), t, pan=0.1)
    if "hat" in lay:
        for k in range(2):
            music.add(hat(vel=lay["hat"] * (0.5 if k == 0 else 0.8)), t + k * BEAT_S / 2, pan=0.35)
    if "ohat" in lay:
        music.add(hat(open_=True, vel=0.35), t + BEAT_S / 2, pan=-0.3)
    # basse
    if "bass" in lay:
        for k in range(2):
            f = hz(root) * (2 if (beat % 2 == 1 and k == 1) else 1)
            music.add(bass(f, BEAT_S / 2 * 0.9, 0.9), t + k * BEAT_S / 2)
    if "bass_long" in lay and bar_pos == 0:
        music.add(bass(hz(root), BEAT_S * 3.8, 0.9), t)
    # piano électrique : accord tenu en début de mesure, rappel sur le « et » du 3
    if "keys" in lay and bar_pos == 0:
        for i, n in enumerate(tones):
            music.add(epiano(hz(n), BEAT_S * 3.5, lay["keys"] * 0.8), t + i * 0.012, pan=(i - 1.5) * 0.25)
    if "keys" in lay and bar_pos == 2 and "kick" in lay:
        for i, n in enumerate(tones[1:3]):
            music.add(epiano(hz(n), BEAT_S * 0.8, lay["keys"] * 0.45), t + BEAT_S / 2, pan=(i - 0.5) * 0.4)
    # cordes pincées en arpège (croches)
    if "arp" in lay:
        seq = tones + [tones[1]]
        for k in range(2):
            n = seq[(beat * 2 + k) % len(seq)]
            octave_up = n[:-1] + str(int(n[-1]) + 1)
            music.add(pluck(hz(octave_up), 0.5, lay["arp"] * 0.7, bright=0.4), t + k * BEAT_S / 2, pan=0.4 if k else -0.4)

# Accord final + résonance
for i, n in enumerate(["D3", "A3", "D4", "F4", "A4", "E5"]):
    music.add(epiano(hz(n), 4.0, 0.7), b2s(B["end"]) + i * 0.02, pan=(i - 2.5) * 0.2)

# Montées avant les grands moments
music.add(riser(b2s(4), 0.8), b2s(B["hook"]))  # vers la fusion du hook (temps 8)
music.add(riser(b2s(4), 0.6), b2s(B["without"] - 4))
music.add(riser(b2s(2), 0.6), b2s(B["real"] - 2))
music.add(riser(b2s(4), 0.7), b2s(B["offer"] - 4))

# ─── Bruitages calés sur l'image ──────────────────────────────────────────
prev_exit = {PLAN["scenes"][i + 1]["id"]: PLAN["scenes"][i]["exit"] for i in range(len(PLAN["scenes"]) - 1)}
for sid, ex in prev_exit.items():
    sfx.add(whoosh(ex / FPS + 0.15, 0.55), START[sid] / FPS - 0.05, pan=0.0)

# hook : trois formes, puis fusion (temps fort)
for i in range(3):
    sfx.add(pop(0.8, 0.9 + i * 0.12), f2s("hook", 4 + i * 5), pan=(i - 1) * 0.6)
sfx.add(impact(1.0), f2s("hook", 66))
# le piège : trois cartes
for i in range(3):
    sfx.add(pop(0.7, 0.8), f2s("trap", 30 + i * 30), pan=0.3)
# piliers : forme dessinée + mot rempli
for sid in ("trust", "regularity", "reach"):
    sfx.add(pop(0.6, 1.2), f2s(sid, 2))
    sfx.add(chime(hz("D6"), 0.6), f2s(sid, 22))
# fusion
sfx.add(impact(0.9), f2s("fusion", 62))
# exemple : la voiture arrive
sfx.add(whoosh(1.2, 0.5), f2s("example", 8), pan=-0.5)
# étapes : puces + résultat
for sid in ("step1", "step2", "step3"):
    dur = START[PLAN["scenes"][[s["id"] for s in PLAN["scenes"]].index(sid) + 1]["id"]] - START[sid] + 18
    for i in range(3):
        sfx.add(tick(0.8), f2s(sid, 40 + i * 16))
    sfx.add(chime(hz("A5"), 0.8), f2s(sid, dur - 62))
# parcours client
for i in range(4):
    sfx.add(pop(0.7, 0.9 + i * 0.1), f2s("journey", 24 + i * 46))
sfx.add(chime(hz("D6"), 0.9), f2s("journey", 24 + 3 * 46))
# sans vidéos : coup sourd
sfx.add(impact(0.6), f2s("without", 4))
# cas réel : cartes, compteur, chute
sfx.add(pop(0.7), f2s("real", 34))
for k in range(0, 50, 3):
    sfx.add(tick(0.35), f2s("real", 40 + k))
sfx.add(pop(0.7), f2s("real", 96))
for k in range(0, 48, 3):
    sfx.add(tick(0.35), f2s("real", 104 + k))
sfx.add(impact(0.8), f2s("real", 164))
# la question : frappe au clavier
for start, n, cps in ((20, 13, 20), (38, 11, 20), (56, 13, 18)):
    for c in range(n):
        sfx.add(tick(0.55), f2s("question", start) + c / cps, pan=0.15)
sfx.add(chime(hz("F5"), 0.6), f2s("question", 96))
# l'offre
sfx.add(pop(0.9, 0.8), f2s("offer", 26))
for i in range(4):
    sfx.add(tick(0.9), f2s("offer", 48 + i * 14))
# écran de fin : logo
sfx.add(impact(0.7), f2s("end", 27))

mix = reverb(music.stereo(), 0.16) * 0.8 + reverb(sfx.stereo(), 0.1) * 0.75
write(mix, os.environ.get("SCRATCH", ".") + "/son-v4.wav", "public/son-v4.m4a", SECONDS)
print(f"son-v4 : {SECONDS:.2f} s, {TOTAL_F} frames")
