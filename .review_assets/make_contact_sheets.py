from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/tishagangar/Downloads/anjora birthday")
OUT = Path(__file__).parent
OUT.mkdir(exist_ok=True)


def font(size):
    for path in (
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttf",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def sheet(paths, destination, cols=4, thumb=(300, 360)):
    label_h = 42
    rows = (len(paths) + cols - 1) // cols
    canvas = Image.new("RGB", (cols * thumb[0], rows * (thumb[1] + label_h)), "#eee9df")
    draw = ImageDraw.Draw(canvas)
    face = font(20)
    for idx, path in enumerate(paths):
        with Image.open(path) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            image.thumbnail(thumb)
            x = (idx % cols) * thumb[0] + (thumb[0] - image.width) // 2
            y = (idx // cols) * (thumb[1] + label_h) + (thumb[1] - image.height) // 2
            canvas.paste(image, (x, y))
        label = path.name
        tx = (idx % cols) * thumb[0] + 8
        ty = (idx // cols) * (thumb[1] + label_h) + thumb[1] + 8
        draw.text((tx, ty), label, fill="#171717", font=face)
    canvas.save(destination, quality=92)


suffix = sys.argv[2] if len(sys.argv) > 2 else "1"
photos = sorted(SOURCE.glob("*.JPG"))
sheet(photos, OUT / f"photos_{suffix}.jpg", cols=4)

frames_dir = OUT / ("video_frames" if suffix == "1" else f"video_frames_{suffix}")
frames = sorted(frames_dir.glob("*.jpg"))
if frames:
    sheet(frames, OUT / ("videos.jpg" if suffix == "1" else f"videos_{suffix}.jpg"), cols=4, thumb=(300, 300))
