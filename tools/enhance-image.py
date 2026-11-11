import os
from PIL import Image, ImageFilter, ImageEnhance

input_path = r"C:\Users\AMD\.gemini\antigravity\brain\8ee1e696-2458-4f36-a25f-3b74d15d0806\.user_uploaded\media_1794382576174_fe2ba76d.jpg"
img = Image.open(input_path).convert("RGB")
w, h = img.size
print(f"Original size: {w}x{h}")

# Target resolution: 4x scale (2904 x 732)
target_w = w * 4
target_h = h * 4

# Stage 1: Slight de-noising / median smoothing on small scale to clean JPEG artifacts
clean = img.filter(ImageFilter.SMOOTH)
# Blend 70% original with 30% smoothed to suppress block artifacts without losing sharp features
clean = Image.blend(img, clean, 0.3)

# Progressive 3-stage Lanczos upsampling
cur = clean
stages = [1.6, 1.6, target_w / (w * 2.56)]

for i, factor in enumerate(stages):
    nw = int(cur.width * factor)
    nh = int(cur.height * factor)
    cur = cur.resize((nw, nh), resample=Image.Resampling.LANCZOS)
    cur = cur.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=2))

# Final precise resize to target dimensions
cur = cur.resize((target_w, target_h), resample=Image.Resampling.LANCZOS)

# Crisp edge refinement
cur = cur.filter(ImageFilter.UnsharpMask(radius=1.5, percent=140, threshold=1))
cur = ImageEnhance.Sharpness(cur).enhance(1.25)
cur = ImageEnhance.Contrast(cur).enhance(1.06)

out_dir = r"C:\Users\AMD\OneDrive\Documents\SURVEY SYSTEM\public\images"
out_jpg = os.path.join(out_dir, "ua-campus-hd.jpg")
out_png = os.path.join(out_dir, "ua-campus-hd.png")

# Save high-fidelity JPEG with 4:4:4 chroma subsampling and quality 98
cur.save(out_jpg, format="JPEG", quality=98, subsampling=0)
# Save lossless PNG
cur.save(out_png, format="PNG", optimize=True)

print(f"Done! Created {cur.size} images:")
print(f"  JPEG: {os.path.getsize(out_jpg):,} bytes")
print(f"  PNG:  {os.path.getsize(out_png):,} bytes")
