"""
Petite bibliothèque de synthèse sonore pour les vidéos ELV8co (numpy/scipy, aucun sample externe).
Tout est déterministe : le bruit vient d'un générateur à graine fixe.

Instruments : kick, clap, hat, basse, piano électrique (FM), cordes pincées (Karplus-Strong).
Bruitages : whoosh, impact, pop, chime, tick, riser.
"""
import subprocess

import numpy as np
from scipy.signal import butter, fftconvolve, lfilter, sosfilt

SR = 44100
RNG = np.random.default_rng(42)

NOTE = {"C": -9, "C#": -8, "Db": -8, "D": -7, "D#": -6, "Eb": -6, "E": -5, "F": -4, "F#": -3, "Gb": -3, "G": -2, "G#": -1, "Ab": -1, "A": 0, "A#": 1, "Bb": 1, "B": 2}


def hz(name: str) -> float:
    """'D3' -> fréquence."""
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[n] + (o - 4) * 12) / 12)


def noise(n):
    return RNG.uniform(-1, 1, n)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


# ─── Instruments ──────────────────────────────────────────────────────────

def kick(vel=1.0):
    t = tt(0.45)
    f = 45 + 80 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    click = noise(len(t)) * np.exp(-t * 400) * 0.25
    return (np.sin(ph) * np.exp(-t * 7.5) + click) * vel


def clap(vel=1.0):
    t = tt(0.3)
    env = np.zeros_like(t)
    for d in (0.0, 0.011, 0.022):
        env += np.where(t >= d, np.exp(-(t - d) * 60), 0) * 0.5
    env += np.exp(-t * 14) * 0.4
    return bp(noise(len(t)), 900, 3200) * env * vel * 1.6


def hat(open_=False, vel=1.0):
    d = 0.22 if open_ else 0.06
    t = tt(d)
    return hp(noise(len(t)), 7000) * np.exp(-t * (14 if open_ else 70)) * vel * 0.5


def bass(f, dur, vel=1.0):
    t = tt(dur)
    w = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 7))
    env = np.minimum(1, t / 0.005) * np.exp(-t * 2.2) * np.minimum(1, (dur - t) / 0.03).clip(0)
    return lp(w, 700) * env * vel * 0.55


def epiano(f, dur, vel=1.0):
    """Piano électrique FM : modulateur 1:1 dont l'indice décroît (attaque claire, tenue douce)."""
    t = tt(dur + 0.6)
    idx = 1.8 * np.exp(-t * 6) + 0.25
    mod = np.sin(2 * np.pi * f * t) * idx
    tone = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 8)
    rel = np.clip((dur + 0.6 - t) / 0.6, 0, 1)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 1.6) * rel
    return tone * env * vel * 0.32


def pluck(f, dur=0.5, vel=1.0, bright=0.5):
    """Cordes pincées (Karplus-Strong vectorisé par un filtre IIR)."""
    n = int(dur * SR)
    N = max(2, int(SR / f))
    x = np.zeros(n)
    burst = lp(noise(N), 2000 + 6000 * bright, 1)
    x[:N] = burst
    d = 0.996
    a = np.zeros(N + 2)
    a[0] = 1
    a[N] = -d / 2
    a[N + 1] = -d / 2
    y = lfilter([1.0], a, x)
    t = np.arange(n) / SR
    return y * np.exp(-t * 3) * vel * 0.5


# ─── Bruitages ────────────────────────────────────────────────────────────

def whoosh(dur=0.6, vel=1.0):
    t = tt(dur)
    env = np.sin(np.pi * t / dur) ** 2
    x = noise(len(t))
    # balayage : mélange progressif d'une bande basse vers une bande haute
    lo = bp(x, 300, 1200)
    hi = bp(x, 1500, 6000)
    m = t / dur
    return (lo * (1 - m) + hi * m) * env * vel * 0.9


def impact(vel=1.0):
    t = tt(1.6)
    f = 32 + 70 * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-t * 3.2)
    crack = lp(noise(len(t)), 3500) * np.exp(-t * 18) * 0.6
    return (boom + crack) * vel


def pop(vel=1.0, pitch=1.0):
    t = tt(0.12)
    f = (650 + 900 * t / 0.12) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 32) * vel * 0.35


def chime(f=hz("A5"), vel=1.0):
    t = tt(1.4)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 5)
    x = np.sin(2 * np.pi * f * t + mod) + 0.5 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 4)
    return x * np.exp(-t * 3.5) * vel * 0.22


def tick(vel=1.0):
    t = tt(0.035)
    f = 1500 + RNG.uniform(-250, 250)
    return (np.sin(2 * np.pi * f * t) + hp(noise(len(t)), 3000) * 0.6) * np.exp(-t * 140) * vel * 0.3


def riser(dur=2.0, vel=1.0):
    t = tt(dur)
    m = t / dur
    f = 200 + 1600 * m ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    air = hp(noise(len(t)), 2500) * 0.28
    return (tone + air) * m ** 2.2 * vel * 0.6


# ─── Mixage ───────────────────────────────────────────────────────────────

class Bus:
    def __init__(self, seconds):
        self.L = np.zeros(int(seconds * SR) + SR)
        self.R = np.zeros_like(self.L)

    def add(self, sig, at, pan=0.0, gain=1.0):
        i = int(at * SR)
        if i < 0 or i >= len(self.L):
            return
        sig = sig[: len(self.L) - i] * gain
        self.L[i : i + len(sig)] += sig * np.sqrt((1 - pan) / 2)
        self.R[i : i + len(sig)] += sig * np.sqrt((1 + pan) / 2)

    def stereo(self):
        return np.vstack([self.L, self.R])


def reverb(st, mix=0.18, seconds=1.8):
    t = tt(seconds)
    irL = noise(len(t)) * np.exp(-t * 3.2)
    irR = noise(len(t)) * np.exp(-t * 3.2)
    irL, irR = lp(irL, 5000), lp(irR, 5000)
    wetL = fftconvolve(st[0], irL)[: st.shape[1]]
    wetR = fftconvolve(st[1], irR)[: st.shape[1]]
    wet = np.vstack([wetL, wetR])
    wet *= np.max(np.abs(st)) / (np.max(np.abs(wet)) + 1e-9)
    return st * (1 - mix) + wet * mix


def write(st, path_wav, path_out, seconds, lufs=-14.0):
    """Écrit le wav brut puis normalise à `lufs` LUFS (true peak -1 dB) en AAC."""
    from scipy.io import wavfile

    st = st[:, : int(seconds * SR)]
    st = st / (np.max(np.abs(st)) + 1e-9) * 0.9
    fade = int(0.8 * SR)
    st[:, -fade:] *= np.linspace(1, 0, fade)
    wavfile.write(path_wav, SR, (st.T * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path_wav, "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11,alimiter=limit=0.89:level=false", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", path_out], check=True)


# ─── Arrangement générique ───────────────────────────────────────────────

def arrange(music, sections, chords, total_beats, beat_s):
    """Joue la musique temps par temps. `sections` = [(début, fin, {couche: volume})] en temps,
    `chords` = [(basse, [notes])] (un accord par mesure de 4 temps).
    Couches : kick, kick_sparse, kick_half, clap, hat, ohat, bass, bass_long, keys, arp."""
    def layers_at(beat):
        for a, b, lay in sections:
            if a <= beat < b:
                return lay
        return {}

    for beat in range(int(total_beats)):
        lay = layers_at(beat)
        t = beat * beat_s
        root, tones = chords[int(beat // 4) % len(chords)]
        pos = beat % 4
        if "kick" in lay:
            music.add(kick(0.95 * lay["kick"]), t)
        if "kick_sparse" in lay and pos == 0:
            music.add(kick(0.8), t)
        if "kick_half" in lay and pos == 0:
            music.add(kick(0.9), t)
        if "kick_half" in lay and pos == 2:
            music.add(clap(0.7), t)
        if "clap" in lay and pos in (1, 3):
            music.add(clap(0.55 * lay["clap"]), t, pan=0.1)
        if "hat" in lay:
            for k in range(2):
                music.add(hat(vel=lay["hat"] * (0.5 if k == 0 else 0.8)), t + k * beat_s / 2, pan=0.35)
        if "ohat" in lay:
            music.add(hat(open_=True, vel=0.35), t + beat_s / 2, pan=-0.3)
        if "bass" in lay:
            for k in range(2):
                f = hz(root) * (2 if (beat % 2 == 1 and k == 1) else 1)
                music.add(bass(f, beat_s / 2 * 0.9, 0.9), t + k * beat_s / 2)
        if "bass_long" in lay and pos == 0:
            music.add(bass(hz(root), beat_s * 3.8, 0.9), t)
        if "keys" in lay and pos == 0:
            for i, n in enumerate(tones):
                music.add(epiano(hz(n), beat_s * 3.5, lay["keys"] * 0.8), t + i * 0.012, pan=(i - 1.5) * 0.25)
        if "keys" in lay and pos == 2 and "kick" in lay:
            for i, n in enumerate(tones[1:3]):
                music.add(epiano(hz(n), beat_s * 0.8, lay["keys"] * 0.45), t + beat_s / 2, pan=(i - 0.5) * 0.4)
        if "arp" in lay:
            seq = tones + [tones[1]]
            for k in range(2):
                n = seq[(beat * 2 + k) % len(seq)]
                up = n[:-1] + str(int(n[-1]) + 1)
                music.add(pluck(hz(up), 0.5, lay["arp"] * 0.7, bright=0.4), t + k * beat_s / 2, pan=0.4 if k else -0.4)


def plan_times(plan):
    """Début de chaque scène en frames et en temps, exactement comme dans les compositions Remotion."""
    beat_f = plan["fps"] * 60 / plan["bpm"]
    start, beats_at, cum = {}, {}, 0
    for sc in plan["scenes"]:
        start[sc["id"]] = round(cum * beat_f)
        beats_at[sc["id"]] = cum
        cum += sc["beats"]
    durs = {}
    ids = [s["id"] for s in plan["scenes"]]
    for i, sc in enumerate(plan["scenes"]):
        durs[sc["id"]] = (start[ids[i + 1]] - start[sc["id"]] + sc["exit"]) if i + 1 < len(ids) else plan["endFrames"]
    return start, beats_at, durs
