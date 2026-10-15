"""
L1 « Faire connaître son commerce local » — prépare les deux versions à partir de la voix ElevenLabs :
  - long  : TikTok / LinkedIn, voix complète + ouverture choc (une phrase forte jouée en premier)
  - short : Instagram / TikTok, 1 min 30 maximum (sélection de phrases)
Pour chaque version : pauses resserrées, voix accélérée (hauteur conservée), musique 110 BPM qui s'efface
sous la voix, bruitages sur les repères, mixage à -14 LUFS.
Écrit public/l1-<version>.m4a et src/videos/l1-<version>.json (repères en frames, scènes, fenêtres de parole).

Usage : SCRATCH=<dossier temporaire> python3 scripts/l1_prep.py <voix.mp3>
Les temps ci-dessous viennent de l'alignement du texte (VOIX-OFF-LONGUES.md, L1) sur les pauses de l'enregistrement.
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
GAP = 0.28  # pause entre deux phrases
GAP_SCENE = 0.5  # pause entre deux chapitres
LEAD = 8  # frames avant le premier mot
END_FRAMES = 135
PAD = 0.04

# ─── Phrases (temps dans l'enregistrement d'origine) ──────────────────────
S = [
    ("hook1", 0.00, 3.50), ("hook2", 3.87, 5.28), ("q", 5.70, 7.09), ("q2", 7.49, 8.70), ("q3", 9.00, 10.17),
    ("good", 10.64, 13.11), ("order", 13.48, 15.72), ("plan", 16.17, 18.26), ("tease", 18.61, 21.18),
    ("t1", 21.76, 24.67), ("t2", 25.19, 28.71), ("t3", 29.21, 30.89), ("t4", 31.31, 35.97), ("t5", 36.46, 41.49),
    ("t6", 41.85, 44.33), ("t7", 44.80, 47.27),
    ("c1", 47.77, 50.32), ("c2", 50.79, 52.37), ("c3", 52.81, 54.11), ("c4a", 54.64, 55.17), ("c4b", 55.52, 57.47),
    ("c5", 57.89, 61.41), ("c6", 61.86, 66.20), ("c7", 66.67, 69.39),
    ("r1", 69.88, 72.08), ("r2", 72.46, 74.69), ("r3", 75.12, 77.90), ("r4", 78.33, 83.86), ("r5", 84.31, 85.56),
    ("r6", 85.94, 89.98), ("r7", 90.32, 92.62),
    ("p1", 93.18, 96.42), ("p2", 96.81, 98.26), ("p3", 98.68, 101.38), ("p4", 101.80, 103.82), ("p5", 104.21, 108.05),
    ("p6", 108.55, 112.28),
    ("i1", 112.84, 116.31), ("i2", 116.70, 119.56), ("i3", 120.00, 120.81), ("i4", 121.25, 126.83), ("i5", 127.19, 133.21),
    ("rc0", 133.60, 134.30), ("rc1", 134.79, 140.31),
    ("e0", 140.56, 142.01), ("e1", 142.59, 147.32), ("e2", 147.86, 149.27), ("e3", 149.90, 151.39),
    ("w1", 152.14, 155.14), ("w2", 155.59, 156.23), ("w3", 156.59, 158.22),
]
SEG = {k: (a, b) for k, a, b in S}

# Sous-repères (mots d'une liste), temps d'origine relevés sur les micro-pauses
SUB = {
    "q_google": 7.49, "q_reseaux": 8.22, "q_pub": 9.00, "q_ia": 9.77,
    "t4_categorie": 31.31, "t4_horaires": 32.49, "t4_photos": 33.55, "t4_services": 34.69,
    "t6_site": 41.85, "t6_facebook": 42.75, "t6_annuaires": 43.55,
    "c6_real": 63.0,
    "r6_arrivage": 85.94, "r6_conseil": 86.75, "r6_question": 87.71, "r6_coulisses": 89.33,
    "p3_fiche": 98.68, "p3_avis": 99.75, "p3_contenu": 100.45,
    "i4_fiche": 121.25, "i4_infos": 122.6, "i4_avis": 124.6, "i4_faits": 125.4,
    "rc_trouvable": 134.79, "rc_confiance": 135.89, "rc_regulier": 137.17, "rc_accelerer": 138.38, "rc_recommande": 139.33,
    "e1_google": 142.59, "e1_ia": 145.32,
}

SCENE_OF = {}
for k, _, _ in S:
    SCENE_OF[k] = ("intro" if k in ("hook1", "hook2", "q", "q2", "q3", "good", "order", "plan", "tease") else
                   "trouvable" if k.startswith("t") and k != "tease" else "confiance" if k.startswith("c") else
                   "regularite" if k.startswith("r") and not k.startswith("rc") else "pub" if k.startswith("p") and k != "plan" else
                   "ia" if k.startswith("i") else "recap" if k.startswith("rc") else "exo" if k.startswith("e") else "cta")

ALL = [k for k, _, _ in S]
VERSIONS = {
    "long": ["cold:p5"] + ALL,
    "short": ["hook1", "hook2", "plan", "t1", "t3", "t4", "t5", "t7", "c1", "c2", "c4a", "c4b", "c7", "r1", "r2", "r4",
              "p1", "p4", "p5", "i1", "i2", "i3", "i4", "e0", "e1", "e2", "e3", "w1"],
}


def load_voice():
    raw = os.path.join(SCRATCH, "l1-voice-src.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", SRC, "-ac", "1", "-ar", str(SR), raw], check=True)
    sr, x = wavfile.read(raw)
    return x.astype(np.float32) / 32768.0


def build(version, voice):
    ids = VERSIONS[version]
    pieces, placed, t = [], [], 0.0
    prev_scene = None
    for item in ids:
        cold = item.startswith("cold:")
        key = item.split(":")[1] if cold else item
        scene = "cold" if cold else SCENE_OF[key]
        if placed:
            t += GAP_SCENE if scene != prev_scene else GAP
            if prev_scene == "cold":
                t += 0.5  # respiration après l'ouverture choc
        a, b = SEG[key]
        a2, b2 = max(0, a - PAD), b + PAD
        seg = voice[int(a2 * SR): int(b2 * SR)].copy()
        fade = int(0.01 * SR)
        seg[:fade] *= np.linspace(0, 1, fade)
        seg[-fade:] *= np.linspace(1, 0, fade)
        placed.append({"id": ("cold" if cold else key), "src": key, "scene": scene, "a": a2, "b": b2, "t": t})
        pieces.append((t, seg))
        t += b2 - a2
        prev_scene = scene
    total = t
    out = np.zeros(int((total + 0.5) * SR), dtype=np.float32)
    for st, seg in pieces:
        i = int(st * SR)
        out[i: i + len(seg)] += seg
    raw = os.path.join(SCRATCH, f"l1-{version}-voice-raw.wav")
    fast = os.path.join(SCRATCH, f"l1-{version}-voice.wav")
    wavfile.write(raw, SR, (out * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", f"atempo={SPEED}", "-ar", str(SR), fast], check=True)
    _, v = wavfile.read(fast)
    v = v.astype(np.float32) / 32768.0

    def fr(sec_new):
        return round(LEAD + sec_new / SPEED * FPS)

    def map_orig(t0, piece):
        return fr(piece["t"] + (t0 - piece["a"]))

    cues, subs = {}, {}
    for p in placed:
        cues[p["id"]] = [map_orig(SEG[p["src"]][0], p), map_orig(SEG[p["src"]][1], p)]
        for sk, st in SUB.items():
            if p["id"] != "cold" and SEG[p["src"]][0] - 0.05 <= st <= SEG[p["src"]][1]:
                subs[sk] = map_orig(st, p)
    # scènes : début = premier mot - 10 frames (la transition est finie quand la voix parle)
    order = []
    for p in placed:
        if not order or order[-1] != p["scene"]:
            order.append(p["scene"])
    scenes = []
    for sc in order:
        first = min(cues[p["id"]][0] for p in placed if p["scene"] == sc)
        scenes.append({"id": sc, "start": 0 if not scenes else first - 10})
    voice_end = fr(total)
    end_start = voice_end - 24 if version == "long" else voice_end - 18
    scenes.append({"id": "end", "start": end_start})
    total_frames = end_start + END_FRAMES
    # fenêtres de parole pour la bouche de la lune : énergie de la voix finale
    hop = SR // FPS
    env = np.array([np.sqrt(np.mean(v[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(len(v) // hop)])
    on = env > 0.02
    talk, start = [], None
    for i, flag in enumerate(on):
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
    CHORDS = [("F2", ["A3", "C4", "F4", "G4"]), ("D2", ["A3", "D4", "F4", "C5"]), ("Bb1", ["F3", "Bb3", "D4", "A4"]), ("C2", ["G3", "C4", "E4", "G4"])]
    secs = []
    names = [s["id"] for s in meta["scenes"]]
    for i, n in enumerate(names[:-1]):
        a, z = b(sc[n]), b(sc[names[i + 1]])
        lay = {
            "cold": {"kick_half": 1, "bass_long": 1},
            "intro": {"keys": 0.7, "arp": 0.5, "bass_long": 0.8},
            "trouvable": {"kick": 1, "bass": 1, "keys": 0.6, "hat": 0.6},
            "confiance": {"kick": 1, "bass": 1, "keys": 0.7, "hat": 0.7, "clap": 0.8},
            "regularite": {"kick": 1, "bass": 1, "keys": 0.7, "hat": 0.8, "clap": 0.8, "arp": 0.5},
            "pub": {"kick": 1, "bass": 1, "keys": 0.7, "hat": 1, "clap": 1, "ohat": 1},
            "ia": {"kick": 1, "bass": 1, "keys": 0.9, "hat": 1, "clap": 1, "arp": 0.8, "ohat": 1},
            "recap": {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1},
            "exo": {"kick_half": 1, "bass_long": 1, "keys": 0.7},
            "cta": {"kick": 1, "bass": 1, "keys": 1, "hat": 1, "clap": 1, "arp": 1, "ohat": 1},
        }[n]
        secs.append((int(round(a)), int(round(z)), lay))
    arrange(music, secs, CHORDS, b(sc["end"]) + 1, beat_s)
    for i, n in enumerate(["F3", "C4", "F4", "A4", "C5", "G5"]):
        music.add(epiano(hz(n), 4.0, 0.7), sc["end"] + i * 0.02, pan=(i - 2.5) * 0.2)
    # montée avant l'étape 5 (la boucle ouverte se referme)
    music.add(riser(2.2, 0.8), sc["ia"] - 2.2)
    if "recap" in sc:
        music.add(riser(1.6, 0.5), sc["recap"] - 1.6)

    # bruitages
    for n in names[1:]:
        sfx.add(whoosh(0.5, 0.5), sc[n] - 0.05)
    first = names[0]
    sfx.add(impact(0.9), 0.0 if first == "cold" else cue["hook1"] + 0.1)
    if "cold" in cue:
        sfx.add(impact(0.8), meta["cues"]["cold"][1] / FPS - 0.6)  # « … vers rien »
    for k in ("q_google", "q_reseaux", "q_pub", "q_ia"):
        if k in sub:
            sfx.add(pop(0.7, 0.9 + 0.1 * ["q_google", "q_reseaux", "q_pub", "q_ia"].index(k)), sub[k] + 0.05)
    if "plan" in cue:
        for j in range(5):
            sfx.add(tick(0.8), cue["plan"] + 0.4 + j * 0.12)
        sfx.add(impact(0.4), cue["plan"] + 1.1)  # le cadenas du 5
    for n in ("trouvable", "confiance", "regularite", "pub", "ia"):
        sfx.add(impact(0.55), sc[n] + 10 / FPS)  # le chiffre du chapitre tombe
    if "t2" in cue:
        for j in range(15):
            sfx.add(tick(0.45), cue["t2"] + 0.2 + j * 0.07)
    for k in ("t4_categorie", "t4_horaires", "t4_photos", "t4_services", "p3_fiche", "p3_avis", "p3_contenu", "i4_fiche", "i4_infos", "i4_avis", "i4_faits"):
        if k in sub:
            sfx.add(tick(0.9), sub[k] + 0.25)
            sfx.add(pop(0.35, 1.3), sub[k] + 0.27)
    if "t7" in cue:
        sfx.add(impact(0.5), cue["t7"] + 0.5)
    for k in ("c4a", "c5", "c6", "c7"):
        if k in cue:
            sfx.add(pop(0.7, 1.0), cue[k])
    for k in ("r6_arrivage", "r6_conseil", "r6_question", "r6_coulisses"):
        if k in sub:
            sfx.add(pop(0.6, 1.1), sub[k])
    if "r1" in cue:
        sfx.add(chime(hz("A5"), 0.6), cue["r2"] + 1.6)
    if "p5" in cue:
        sfx.add(whoosh(1.4, 0.5), cue["p5"] + 0.6)
    sfx.add(chime(hz("C6"), 0.7), cue["i2"] + 0.3)
    for k in ("rc_trouvable", "rc_confiance", "rc_regulier", "rc_accelerer", "rc_recommande"):
        if k in sub:
            sfx.add(chime(hz(["F5", "A5", "C6", "D6", "F6"][["rc_trouvable", "rc_confiance", "rc_regulier", "rc_accelerer", "rc_recommande"].index(k)]), 0.5), sub[k])
    if "e1" in cue:
        for j in range(18):
            sfx.add(tick(0.4), cue["e1"] + 0.15 + j * 0.06)
    sfx.add(pop(0.8, 1.1), cue["w1"])
    sfx.add(impact(0.7), sc["end"] + 27 / FPS)

    # mixage : la musique s'efface sous la voix (sidechain sur l'énergie de la voix)
    m = reverb(music.stereo(), 0.16)
    fx = reverb(sfx.stereo(), 0.1)
    n = m.shape[1]
    lead_s = int(meta["lead"] / FPS * SR)
    vv = np.zeros(n, dtype=np.float32)
    vv[lead_s: lead_s + len(v)] = v[: max(0, n - lead_s)]
    win = int(0.05 * SR)
    env = np.sqrt(np.convolve(vv ** 2, np.ones(win) / win, mode="same"))
    env = env / (env.max() + 1e-9)
    # attaque rapide, relâchement lent
    rel = np.exp(-1 / (0.35 * SR / 64))
    e2 = np.zeros_like(env[::64])
    acc = 0.0
    for i, x in enumerate(env[::64]):
        acc = x if x > acc else acc * rel
        e2[i] = acc
    duck = 1 - 0.7 * np.clip(np.repeat(e2, 64)[:n] * 3, 0, 1)
    m = m / (np.max(np.abs(m)) + 1e-9)
    fx = fx / (np.max(np.abs(fx)) + 1e-9)
    voice_st = np.vstack([vv, vv]) / (np.max(np.abs(vv)) + 1e-9)
    mix = voice_st * 1.0 + m * duck * 0.42 + fx * 0.32
    mix = mix[:, : int(seconds * SR)]
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9
    fade = int(0.8 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade)
    wav = os.path.join(SCRATCH, f"l1-{version}-mix.wav")
    wavfile.write(wav, SR, (mix.T * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89:level=false", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", f"public/l1-{version}.m4a"], check=True)


voice = load_voice()
for ver in ("long", "short"):
    v, meta = build(ver, voice)
    json.dump(meta, open(f"src/videos/l1-{ver}.json", "w"), indent=1)
    sound(ver, v, meta)
    print(f"{ver} : {meta['total']} frames = {meta['total'] / FPS:.1f} s ; scènes {[(s['id'], s['start']) for s in meta['scenes']]}")
