from PIL import Image
import os

source_path = "C:/Users/stuar/.gemini/antigravity/brain/0a7e80a3-bae2-4e0b-945e-8c108c93ab0d/tiss_guard_logo_1765047907103.png"
dest_dir = "c:/Users/stuar/Desktop/TISS Guard/public/icons"

sizes = {
    "icon16.png": (16, 16),
    "icon48.png": (48, 48),
    "icon128.png": (128, 128)
}

try:
    img = Image.open(source_path)
    print(f"Opened image: {source_path}")
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        print(f"Created directory: {dest_dir}")

    for filename, size in sizes.items():
        resized_img = img.resize(size, Image.Resampling.LANCZOS)
        out_path = os.path.join(dest_dir, filename)
        resized_img.save(out_path, "PNG")
        print(f"Saved {filename} ({size}) to {out_path}")
        
except Exception as e:
    print(f"Error: {e}")
