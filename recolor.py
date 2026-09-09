import sys
from PIL import Image

def tint_image(src, dest, color_hex):
    # color_hex like #00979C
    color = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    img = Image.open(src).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        # Check alpha channel. If it has opacity, color it.
        # This approach replaces all visible pixels with the exact green color, preserving anti-aliasing alpha
        if item[3] > 0:
            new_data.append((color[0], color[1], color[2], item[3]))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(dest, "PNG")

if __name__ == '__main__':
    src_path = r"c:\Users\jorge\OneDrive\Documents\Antigravity Projects\ArduinoHN\public\logo.png"
    dest_path = r"c:\Users\jorge\OneDrive\Documents\Antigravity Projects\ArduinoHN\public\logo_arduino.png"
    tint_image(src_path, dest_path, "#00979C")
    print("Logo created at:", dest_path)
