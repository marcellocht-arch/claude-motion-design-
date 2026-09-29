# Usage: python3 scripts/sheet.py <dir> <prefix> <out.jpg> [cols]
import sys, glob, os
from PIL import Image, ImageDraw
d, prefix, out = sys.argv[1:4]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6
files = sorted(glob.glob(os.path.join(d, prefix + "*.jpeg")))
ims = [Image.open(f) for f in files]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 22)), "white")
dr = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 22)
    sheet.paste(im, (x, y + 22))
    dr.text((x + 4, y + 4), os.path.basename(f).split("-")[-1].split(".")[0], fill="black")
sheet.save(out, quality=85)
print(out, sheet.size)
