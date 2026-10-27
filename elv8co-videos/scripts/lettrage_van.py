"""
Pose un faux lettrage « Chauffagiste C » sur la photo de camionnette blanche (vue de profil),
floute les logos de marque (enjoliveurs, badges), et éclaire le lettrage avec les ombres de la tôle.
Usage : python3 -I scripts/lettrage_van.py <photo.jpg> <sortie.jpg> <dossier-polices>
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

src, out, fonts = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert("RGB")
W, H = im.size
k = W / 2000  # coordonnées relevées sur l'aperçu de 2000 px de large

def P(x, y):
    return int(x * k), int(y * k)

COPPER = (200, 121, 65)
DEEP = (13, 27, 42)
black = ImageFont.truetype(f"{fonts}/archivo-latin-900-normal.woff2", int(58 * k))
bold = ImageFont.truetype(f"{fonts}/archivo-latin-700-normal.woff2", int(17 * k))
mono = ImageFont.truetype(f"{fonts}/jetbrains-mono-latin-700-normal.woff2", int(26 * k))

layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
d = ImageDraw.Draw(layer)
# panneau arrière (tôle pleine) : nom + activité
d.text(P(552, 492), "CHAUFFAGISTE", font=ImageFont.truetype(f"{fonts}/archivo-latin-900-normal.woff2", int(22 * k)), fill=DEEP + (255,))
d.text(P(552, 520), "C", font=ImageFont.truetype(f"{fonts}/archivo-latin-900-normal.woff2", int(80 * k)), fill=COPPER + (255,))
d.text(P(618, 552), "Chauffage", font=bold, fill=DEEP + (255,))
d.text(P(618, 576), "Dépannage 7j/7", font=bold, fill=DEEP + (255,))
# bande cuivre le long des portes, sous les poignées
d.rectangle([P(760, 706), P(1262, 732)], fill=COPPER + (255,))
d.rectangle([P(498, 706), P(748, 732)], fill=COPPER + (255,))
# faux numéro (format belge, volontairement inexistant)
d.text(P(1046, 680), "04 000 00 00", font=mono, fill=DEEP + (255,))

# éclairage : le lettrage prend les ombres et reflets de la tôle
base = np.asarray(im).astype(np.float32) / 255
lum = (0.299 * base[..., 0] + 0.587 * base[..., 1] + 0.114 * base[..., 2])
lum_s = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3 * k))).astype(np.float32) / 255
ref = np.percentile(lum_s[int(470 * k):int(640 * k), int(540 * k):int(745 * k)], 90)
shade = np.clip(lum_s / max(ref, 1e-3), 0.55, 1.08)[..., None]
L = np.asarray(layer).astype(np.float32) / 255
rgb = L[..., :3] * shade
a = L[..., 3:4] * 0.97
outp = base * (1 - a) + rgb * a

res = Image.fromarray((np.clip(outp, 0, 1) * 255).astype(np.uint8))
# logos de marque : centres d'enjoliveurs, badges avant/arrière
for (x, y, r) in [(637, 840, 26), (1383, 850, 26), (1330, 772, 14), (445, 702, 22)]:
    cx, cy = P(x, y)
    rr = int(r * k)
    box = (cx - rr, cy - rr, cx + rr, cy + rr)
    patch = res.crop(box).filter(ImageFilter.GaussianBlur(rr * 0.5))
    mask = Image.new("L", patch.size, 0)
    ImageDraw.Draw(mask).ellipse([0, 0, patch.size[0] - 1, patch.size[1] - 1], fill=255)
    res.paste(patch, box, mask.filter(ImageFilter.GaussianBlur(2)))
res.save(out, quality=92)
print("ok", res.size)
