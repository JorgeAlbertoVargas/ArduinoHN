import sys
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

import os

img_path = r"C:\Users\jorge\.gemini\antigravity-ide\brain\82856520-b996-40ab-999e-ea549d31ed9b\media__1787197329119.png"
out_path = r"c:\Users\jorge\OneDrive\Documents\Antigravity Projects\ArduinoHN\public\logo.png"

# Ensure public folder exists
os.makedirs(os.path.dirname(out_path), exist_ok=True)

img = Image.open(img_path).convert("RGBA")
data = img.getdata()

new_data = []
for item in data:
    r, g, b, a = item
    if a > 0:
        # If it's a white-ish background pixel, make it transparent
        if r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))
        # If it's a non-white pixel (the logo itself), change to Arduino Green (0, 151, 156)
        else:
            # We preserve the alpha channel for anti-aliasing edges if they are somewhat transparent
            new_data.append((0, 151, 156, a))
    else:
        new_data.append(item)

img.putdata(new_data)
img.save(out_path)
print("Image recolored and saved.")
