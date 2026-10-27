"""
L2 « Le parcours de Sophie » — prépare les deux versions à partir de la voix ElevenLabs :
  - long  : TikTok / LinkedIn (voix complète)
  - short : Instagram / TikTok (1 min 30 maximum, sélection de phrases)
Pauses resserrées, voix accélérée (hauteur conservée), musique 110 BPM qui s'efface sous la voix,
bruitages sur les repères, mixage à -14 LUFS.
Écrit public/l2-<version>.m4a et src/videos/l2-<version>.json.

Usage : SCRATCH=<dossier temporaire> python3 scripts/l2_prep.py <voix.mp3>
Temps relevés par alignement mot à mot du texte (VOIX-OFF-LONGUES.md, L2) sur les pauses de l'enregistrement,
vérifié par comptage des syllabes.
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
    # accroche
    ("h1", 0.00, 0.92), ("h2", 1.42, 2.20), ("h3", 2.58, 4.10), ("h4", 4.48, 5.67), ("h5", 5.98, 6.35), ("h6", 6.76, 7.58),
    ("h7", 8.06, 9.34), ("h8", 9.76, 11.33), ("h9", 11.76, 14.49), ("h10", 14.98, 15.49), ("h11", 15.83, 16.78), ("h12", 17.22, 20.15),
    # épisode 1 : vérifier
    ("v1", 20.71, 22.47), ("v2", 22.84, 24.85), ("v3", 25.31, 26.39), ("v4", 26.82, 28.05), ("v5", 28.46, 29.17), ("v6", 29.61, 30.91),
    ("v7", 31.35, 32.68), ("v8", 33.11, 37.94), ("v9", 38.26, 39.95),
    # épisode 2 : comparer
    ("k1", 40.46, 41.35), ("k2", 41.79, 44.31), ("k3", 44.70, 48.00), ("k4", 48.34, 49.67), ("k5", 50.12, 53.96), ("k6", 54.44, 55.80),
    ("k7", 56.22, 57.27), ("k8", 57.58, 59.43), ("k9", 59.78, 61.09),
    # épisode 3 : les réseaux
    ("f1", 61.57, 64.18), ("f2", 64.57, 65.54), ("f3", 65.91, 66.68), ("f4", 67.16, 68.95), ("f5", 69.49, 72.26), ("f6", 72.59, 74.74),
    ("f7", 75.15, 76.66), ("f8", 77.06, 78.66), ("f9", 79.19, 80.47),
    # épisode 4 : l'IA
    ("a1", 80.88, 85.24), ("a2", 85.61, 87.50), ("a3", 87.93, 89.43), ("a4", 89.74, 91.74), ("a5", 92.08, 93.36), ("a6", 93.80, 96.68),
    ("a7", 96.87, 98.31), ("a8", 98.73, 100.33), ("a9", 100.74, 102.25), ("a10", 102.81, 104.66),
    # récapitulatif
    ("r1", 105.09, 105.86), ("r2", 106.08, 106.78), ("r3", 107.04, 107.60), ("r4", 107.85, 108.30), ("r5", 108.73, 111.87), ("r6", 112.26, 115.05),
    ("r7", 115.39, 116.14),
    # exercice + appel
    ("e1", 116.59, 117.47), ("e2", 117.83, 120.42), ("e3", 120.81, 121.77),
    ("w1", 122.18, 125.04), ("w2", 125.41, 126.45),
]
SEG = {k: (a, b) for k, a, b in S}
SUB = {
    "a1_ia": 83.65, "a5_avis": 92.08, "a5_sites": 92.8, "a6_si": 95.5,
    "rc_recommande": 107.04, "rc_verifie": 107.85, "rc_compare": 108.73, "rc_choisi": 109.25,
    "v8_fiche": 34.6, "v8_avis": 35.6, "v8_horaires": 36.4,
    "k3_etoiles": 44.70, "k3_avis": 45.9, "k3_mauvais": 47.0,
}
PREFIX = {"h": "hook", "v": "verifier", "k": "comparer", "f": "reseaux", "a": "ia", "r": "recap", "e": "exo", "w": "cta"}
SCENE_OF = {k: PREFIX[k[0]] for k, _, _ in S}
ALL = [k for k, _, _ in S]
VERSIONS = {
    "long": ALL,
    "short": ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9",
              "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9",
              "k1", "k2", "k3", "k4", "k5",
              "f1", "f2", "f3", "f4", "f5", "f6", "f9",
              "a1", "a2", "a3", "a4", "a5", "a9", "a10",
              "w1"],
}


def load_voice():
    raw = os.path.join(SCRATCH, "l2-voice-src.wav")
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
    raw = os.path.join(SCRATCH, f"l2-{version}-voice-raw.wav")
    fast = os.path.join(SCRATCH, f"l2-{version}-voice.wav")
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
            if a - 0.05 <= st <= b + 0.6 and sk.split("_")[0] in (p["id"], p["id"][:1] + "c"[:0]) or (sk.startswith("rc_") and p["id"] in ("r3", "r4", "r5") and a - 0.05 <= st <= b):
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
    # mineur et nocturne au début (la panne), on s'éclaire vers la fin (Sophie trouve)
    CHORDS = [("A1", ["E3", "A3", "C4", "G4"]), ("F1", ["F3", "A3", "C4", "E4"]), ("C2", ["E3", "G3", "C4", "D4"]), ("G1", ["D3", "G3", "B3", "D4"])]
    LAY = {
        "hook": {"keys": 0.6, "bass_long": 0.8},
        "verifier": {"kick_half": 1, "bass_long": 1, "keys": 0.6, "hat": 0.5},
        "comparer": {"kick": 1, "bass": 1, "keys": 0.6, "hat": 0.7},
        "reseaux": {"kick": 1, "bass": 1, "keys": 0.7, "hat": 0.8, "clap": 0.8},
        "ia": {"kick": 1, "bass": 1, "keys": 0.8, "hat": 1, "clap": 1, "arp": 0.6},
        "recap": {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1, "ohat": 1},
        "exo": {"kick_half": 1, "bass_long": 1, "keys": 0.7},
        "cta": {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1, "ohat": 1},
    }
    names = [s["id"] for s in meta["scenes"]]
    secs = [(int(round(b(sc[n]))), int(round(b(sc[names[i + 1]]))), LAY[n]) for i, n in enumerate(names[:-1])]
    arrange(music, secs, CHORDS, b(sc["end"]) + 1, beat_s)
    for i, n in enumerate(["C3", "G3", "C4", "E4", "G4", "D5"]):
        music.add(epiano(hz(n), 4.0, 0.7), sc["end"] + i * 0.02, pan=(i - 2.5) * 0.2)
    music.add(riser(1.8, 0.6), sc["ia"] - 1.8)

    for n in names[1:]:
        sfx.add(whoosh(0.5, 0.5), sc[n] - 0.05)
    # accroche : horloge du soir, panne, coup sourd
    sfx.add(tick(0.7), cue["h1"])
    sfx.add(tick(0.7), cue["h1"] + 0.5)
    sfx.add(impact(0.8), cue["h3"] + 0.9)  # « vient de lâcher »
    sfx.add(pop(0.6, 0.8), cue["h7"] + 0.4)
    if "v6" in cue:
        for j in range(16):
            sfx.add(tick(0.45), cue["v6"] + 0.1 + j * 0.06)
    sfx.add(impact(0.5), cue["v9"] + 0.3)
    for k in ("v8_fiche", "v8_avis", "v8_horaires", "k3_etoiles", "k3_avis", "k3_mauvais"):
        if k in sub:
            sfx.add(pop(0.55, 1.1), sub[k])
    sfx.add(chime(hz("E5"), 0.6), cue["k4"] + 0.2)
    sfx.add(impact(0.4), cue["f3"])  # « il y a deux ans »
    sfx.add(chime(hz("G5"), 0.7), cue["f9"] + 0.6)  # « devinez qui elle appelle »
    for j in range(22):
        sfx.add(tick(0.4), cue["a2"] + j * 0.07)
    sfx.add(chime(hz("C6"), 0.7), (cue.get("a6") or cue["a9"]) + 0.1)
    if "a9" in cue:
        sfx.add(whoosh(1.0, 0.6), cue["a9"] + 0.6)
    for k, nte in (("rc_recommande", "C5"), ("rc_verifie", "E5"), ("rc_compare", "G5"), ("rc_choisi", "C6")):
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
    wav = os.path.join(SCRATCH, f"l2-{version}-mix.wav")
    wavfile.write(wav, SR, (mix.T * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89:level=false", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", f"public/l2-{version}.m4a"], check=True)


voice = load_voice()
for ver in ("long", "short"):
    v, meta = build(ver, voice)
    json.dump(meta, open(f"src/videos/l2-{ver}.json", "w"), indent=1)
    sound(ver, v, meta)
    print(f"{ver} : {meta['total']} frames = {meta['total'] / FPS:.1f} s ; scènes {[(s['id'], s['start']) for s in meta['scenes']]} ; sub {sorted(meta['sub'])}")
