from rembg import remove
from PIL import Image
import io
import os

input_dir = r"C:\Users\user\.gemini\antigravity-ide\brain\29123056-12bf-4aa3-94b8-d026af386f5f"
output_dir = r"C:\Users\user\Desktop\tripbookingMethod (1)\tripbookingMethod\shinelimos\public\images"

files_to_process = {
    "s_class_1781517488412.png": ["S class.webp", "sedan.webp", "Mercedes Benz S Class  luxury sedan.webp"],
    "cadillac_escalade_1781517501655.png": ["Cadillac Escalade.webp"],
    "chevrolet_suburban_1781517514245.png": ["Chevrolet Suburban.webp"],
    "lincoln_navigator_1781517527474.png": ["Lincoln navigator-SUV.webp"],
    "sprinter_van_1781517541694.png": ["sprinter (mercedes van).webp"],
    "party_bus_1781517555217.png": ["30 PAX bus.webp"],
    "coach_bus_1781517568989.png": ["50 PAX bus.webp"]
}

for src, dests in files_to_process.items():
    src_path = os.path.join(input_dir, src)
    if os.path.exists(src_path):
        print(f"Processing {src}...")
        try:
            with open(src_path, 'rb') as i:
                input_data = i.read()
                
            output_data = remove(input_data)
            
            img = Image.open(io.BytesIO(output_data)).convert("RGBA")
            
            for dest in dests:
                dest_path = os.path.join(output_dir, dest)
                img.save(dest_path, "WEBP", lossless=True)
                print(f"Saved {dest_path}")
        except Exception as e:
            print(f"Error processing {src}: {e}")

print("All done!")
