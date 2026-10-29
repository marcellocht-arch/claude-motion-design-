"""
L3 « Julien, boulanger » (réseaux sociaux) — prépare les deux versions à partir de la voix ElevenLabs :
  - long  : TikTok / LinkedIn (voix complète)
  - short : Instagram / TikTok (1 min 30 maximum, sélection de phrases)
Pauses resserrées, voix accélérée (hauteur conservée), musique 110 BPM qui s'efface sous la voix,
bruitages sur les repères, mixage à -14 LUFS.
Écrit public/l3-<version>.m4a et src/videos/l3-<version>.json.

Usage : SCRATCH=<dossier temporaire> python3 scripts/l3_prep.py <voix.mp3>
Temps relevés par alignement mot à mot du texte (VOIX-OFF-LONGUES.md, L3) sur les pauses de l'enregistrement ;
liste des 5 réseaux découpée à la main sur les pics d'énergie.
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(__file__))
from sonlib import SR, Bus, arrange, chime, epiano, hz, impact, pop, reverb, riser, tick, whoosh  # noqa: E402

SRC = sys.argv[1]
SCRATCH = os.environ.get("SCRATCH", ".")
FPS = 30
SPEED = 1.07
GAP = 0.26
GAP_SCENE = 0.5
LEAD = 8
END_FRAMES = 135
PAD = 0.04

S = [
    # accroche : cinq comptes, trois semaines plus tard
    ("h1", 0.00, 0.95), ("h2", 1.47, 4.27), ("h3", 4.59, 6.75), ("h4", 6.83, 8.10), ("h5", 8.61, 11.15), ("h6", 11.57, 12.25),
    ("h7", 12.70, 14.06), ("h8", 14.67, 16.26), ("h9", 16.69, 18.17), ("h10", 18.79, 20.83),
    # question 1 : quel réseau
    ("q1", 21.38, 23.15), ("q2", 23.64, 25.33), ("q3", 25.76, 28.48), ("q4", 28.89, 31.45), ("q5", 31.91, 32.76), ("q6", 33.23, 36.95),
    ("q7", 37.42, 40.24), ("q8", 40.65, 42.69),
    # question 2 : quoi publier
    ("c1", 43.21, 45.17), ("c2", 45.64, 47.03), ("c3", 47.48, 49.94), ("c4", 50.40, 51.90), ("c5", 52.38, 55.17), ("c6", 55.60, 58.65),
    ("c7", 59.05, 63.57), ("c8", 64.04, 66.08), ("c9", 66.46, 69.15),
    # question 3 : quel rythme
    ("r1", 69.70, 71.71), ("r2", 72.13, 73.80), ("r3", 74.25, 75.54), ("r4", 75.96, 80.54), ("r5", 80.97, 83.10), ("r6", 83.50, 86.32),
    ("r7", 86.73, 90.69),
    # question 4 : mesurer
    ("m1", 91.21, 93.68), ("m2", 94.13, 95.48), ("m3", 95.85, 96.69), ("m4", 97.19, 99.38), ("m5", 99.81, 103.77), ("m6", 104.03, 105.01),
    # résumé, test, appel
    ("s1", 105.54, 112.17), ("e1", 112.64, 117.30), ("w1", 117.74, 121.48), ("w2", 121.91, 123.20),
]
SEG = {k: (a, b) for k, a, b in S}
SUB = {
    "h3_facebook": 4.66, "h3_instagram": 5.18, "h3_tiktok": 5.52, "h3_linkedin": 5.95, "h3_youtube": 6.35,
    "q4_groupes": 30.2, "q6_mode": 35.91, "q7_tenu": 39.4,
    "c5_conseil": 54.35, "c6_coulisses": 57.69, "c7_cliente": 60.45, "c7_preuves": 62.65,
    "c8_conseils": 64.04, "c8_coulisses": 64.87, "c8_preuves": 65.69, "c9_video": 67.81, "c9_idee": 68.73,
    "r4_sept": 78.85, "r6_programme": 85.50, "r7_reel": 88.5, "r7_tiktok": 89.29, "r7_short": 90.1,
    "m4_messages": 98.16, "m5_quote": 101.85,
    "s1_reseau": 106.48, "s1_types": 107.79, "s1_pub": 109.11, "s1_contacts": 110.69,
    "e1_tenus": 115.67, "w1_whatsapp": 119.35,
}
PREFIX = {"h": "hook", "q": "reseau", "c": "contenu", "r": "rythme", "m": "mesure", "s": "recap", "e": "exo", "w": "cta"}
SCENE_OF = {k: PREFIX[k[0]] for k, _, _ in S}
ALL = [k for k, _, _ in S]
VERSIONS = {
    "long": ALL,
    "short": ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10",
              "q1", "q2", "q4", "q6", "q7",
              "c1", "c3", "c4", "c5", "c6", "c7", "c9",
              "r1", "r2", "r3", "r4", "r5",
              "m1", "m2", "m3", "m4", "m5", "m6",
              "w1"],
}


def load_voice():
    raw = os.path.join(SCRATCH, "l3-voice-src.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", SRC, "-ac", "1", "-ar", str(SR), raw], check=True)
    _, x = wavfile.read(raw)
    return x.astype(np.float32) / 32768.0


def build(version, voice):
    ids = VERSIONS[version]
    pieces, placed, t, prev_scene = [], [], 0.0, None
    for key in ids:
        scene = SCENE_OF[key]
        if placed:
            t += GAP_SCENE if scene != prev_scene else GAP
        a, b = SEG[key]
        a2, b2 = max(0, a - PAD), b + PAD
        seg = voice[int(a2 * SR): int(b2 * SR)].copy()
        fade = int(0.01 * SR)
        seg[:fade] *= np.linspace(0, 1, fade)
        seg[-fade:] *= np.linspace(1, 0, fade)
        placed.append({"id": key, "scene": scene, "a": a2, "b": b2, "t": t})
        pieces.append((t, seg))
        t += b2 - a2
        prev_scene = scene
    total = t
    out = np.zeros(int((total + 0.5) * SR), dtype=np.float32)
    for st, seg in pieces:
        i = int(st * SR)
        out[i: i + len(seg)] += seg
    raw = os.path.join(SCRATCH, f"l3-{version}-voice-raw.wav")
    fast = os.path.join(SCRATCH, f"l3-{version}-voice.wav")
    wavfile.write(raw, SR, (out * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", f"atempo={SPEED}", "-ar", str(SR), fast], check=True)
    _, v = wavfile.read(fast)
    v = v.astype(np.float32) / 32768.0

    fr = lambda sec_new: round(LEAD + sec_new / SPEED * FPS)  # noqa: E731
    cues, subs = {}, {}
    for p in placed:
        a, b = SEG[p["id"]]
        cues[p["id"]] = [fr(p["t"] + (a - p["a"])), fr(p["t"] + (b - p["a"]))]
        for sk, st in SUB.items():
            if sk.split("_")[0] == p["id"] and a - 0.05 <= st <= b + 0.05:
                subs[sk] = fr(p["t"] + (st - p["a"]))
    order = []
    for p in placed:
        if not order or order[-1] != p["scene"]:
            order.append(p["scene"])
    scenes = []
    for sc in order:
        first = min(cues[p["id"]][0] for p in placed if p["scene"] == sc)
        scenes.append({"id": sc, "start": 0 if not scenes else first - 10})
    voice_end = fr(total)
    end_start = voice_end - 20
    scenes.append({"id": "end", "start": end_start})
    total_frames = end_start + END_FRAMES
    hop = SR // FPS
    env = np.array([np.sqrt(np.mean(v[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(len(v) // hop)])
    talk, start = [], None
    for i, flag in enumerate(env > 0.02):
        if flag and start is None:
            start = i
        if not flag and start is not None:
            if i - start >= 3:
                talk.append([LEAD + start, LEAD + i])
            start = None
    meta = {"version": version, "lead": LEAD, "speed": SPEED, "total": total_frames, "voiceEnd": voice_end, "cues": cues, "sub": subs, "scenes": scenes, "talk": talk}
    return v, meta


def sound(version, v, meta):
    seconds = meta["total"] / FPS
    beat_s = 60 / 110
    music, sfx = Bus(seconds + 2), Bus(seconds + 2)
    sc = {s["id"]: s["start"] / FPS for s in meta["scenes"]}
    cue = {k: c[0] / FPS for k, c in meta["cues"].items()}
    sub = {k: c / FPS for k, c in meta["sub"].items()}
    b = lambda sec: sec / beat_s  # noqa: E731
    # mineur et un peu vide au début (les comptes abandonnés), on s'éclaire à mesure que Julien s'organise
    CHORDS = [("D2", ["F3", "A3", "D4", "E4"]), ("A1", ["E3", "A3", "C4", "G4"]), ("F1", ["F3", "A3", "C4", "E4"]), ("C2", ["E3", "G3", "C4", "D4"])]
    LAY = {
        "hook": {"keys": 0.6, "bass_long": 0.8},
        "reseau": {"kick_half": 1, "bass_long": 1, "keys": 0.6, "hat": 0.5},
        "contenu": {"kick": 1, "bass": 1, "keys": 0.6, "hat": 0.7},
        "rythme": {"kick": 1, "bass": 1, "keys": 0.7, "hat": 0.8, "clap": 0.8},
        "mesure": {"kick": 1, "bass": 1, "keys": 0.8, "hat": 1, "clap": 1, "arp": 0.6},
        "recap": {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1, "ohat": 1},
        "exo": {"kick_half": 1, "bass_long": 1, "keys": 0.7},
        "cta": {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1, "ohat": 1},
    }
    names = [s["id"] for s in meta["scenes"]]
    secs = [(int(round(b(sc[n]))), int(round(b(sc[names[i + 1]]))), LAY[n]) for i, n in enumerate(names[:-1])]
    arrange(music, secs, CHORDS, b(sc["end"]) + 1, beat_s)
    for i, n in enumerate(["C3", "G3", "C4", "E4", "G4", "D5"]):
        music.add(epiano(hz(n), 4.0, 0.7), sc["end"] + i * 0.02, pan=(i - 2.5) * 0.2)
    music.add(riser(1.8, 0.6), sc["mesure"] - 1.8)

    for n in names[1:]:
        sfx.add(whoosh(0.5, 0.5), sc[n] - 0.05)
    # accroche : réveil, cinq icônes qui tombent, calendrier qui défile, plus rien
    sfx.add(tick(0.7), cue["h1"])
    sfx.add(tick(0.7), cue["h1"] + 0.45)
    for j, k in enumerate(("h3_facebook", "h3_instagram", "h3_tiktok", "h3_linkedin", "h3_youtube")):
        if k in sub:
            sfx.add(pop(0.6, 0.9 + j * 0.08), sub[k])
    for j in range(21):
        sfx.add(tick(0.35), cue["h4"] + 0.15 + j * 0.05)
    sfx.add(impact(0.7), cue["h7"] + 0.2)  # « pas un seul nouveau client »
    sfx.add(impact(0.5), cue["h9"] + 0.3)  # « être partout »
    sfx.add(chime(hz("E5"), 0.6), cue["q7"] + 0.3)  # un seul réseau
    for k, nte in (("c5_conseil", "C5"), ("c6_coulisses", "E5"), ("c7_preuves", "G5")):
        if k in sub:
            sfx.add(chime(hz(nte), 0.5), sub[k])
    if "c9_idee" in sub:
        sfx.add(pop(0.7, 1.1), sub["c9_idee"])
    sfx.add(impact(0.4), cue["r3"] + 0.3)  # « il a tenu une semaine »
    sfx.add(chime(hz("G5"), 0.6), cue["r5"] + 0.4)  # l'heure bloquée
    for k in ("r7_reel", "r7_tiktok", "r7_short"):
        if k in sub:
            sfx.add(pop(0.55, 1.1), sub[k])
    sfx.add(impact(0.4), cue["m3"])  # « mauvais compteur »
    sfx.add(pop(0.7, 1.0), sub.get("m4_messages", cue["m4"] + 0.5))
    sfx.add(chime(hz("C6"), 0.7), cue["m6"] + 0.1)
    for k, nte in (("s1_reseau", "C5"), ("s1_types", "E5"), ("s1_pub", "G5"), ("s1_contacts", "C6")):
        if k in sub:
            sfx.add(chime(hz(nte), 0.5), sub[k])
    sfx.add(pop(0.8, 1.1), cue["w1"])
    sfx.add(impact(0.7), sc["end"] + 27 / FPS)

    m = reverb(music.stereo(), 0.16)
    fx = reverb(sfx.stereo(), 0.1)
    n = m.shape[1]
    lead_s = int(meta["lead"] / FPS * SR)
    vv = np.zeros(n, dtype=np.float32)
    vv[lead_s: lead_s + len(v)] = v[: max(0, n - lead_s)]
    win = int(0.05 * SR)
    env = np.sqrt(np.convolve(vv ** 2, np.ones(win) / win, mode="same"))
    env = env / (env.max() + 1e-9)
    rel = np.exp(-1 / (0.35 * SR / 64))
    e2 = np.zeros_like(env[::64])
    acc = 0.0
    for i, x in enumerate(env[::64]):
        acc = x if x > acc else acc * rel
        e2[i] = acc
    duck = 1 - 0.7 * np.clip(np.repeat(e2, 64)[:n] * 3, 0, 1)
    m = m / (np.max(np.abs(m)) + 1e-9)
    fx = fx / (np.max(np.abs(fx)) + 1e-9)
    mix = np.vstack([vv, vv]) / (np.max(np.abs(vv)) + 1e-9) + m * duck * 0.42 + fx * 0.32
    mix = mix[:, : int(seconds * SR)]
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9
    fade = int(0.8 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade)
    wav = os.path.join(SCRATCH, f"l3-{version}-mix.wav")
    wavfile.write(wav, SR, (mix.T * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89:level=false", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", f"public/l3-{version}.m4a"], check=True)


voice = load_voice()
for ver in ("long", "short"):
    v, meta = build(ver, voice)
    json.dump(meta, open(f"src/videos/l3-{ver}.json", "w"), indent=1)
    sound(ver, v, meta)
    print(f"{ver} : {meta['total']} frames = {meta['total'] / FPS:.1f} s ; scènes {[(s['id'], s['start']) for s in meta['scenes']]} ; sub {sorted(meta['sub'])}")
