from rembg import remove
from PIL import Image
import io
import os

input_dir = r"C:\Users\user\.gemini\antigravity-ide\brain\29123056-12bf-4aa3-94b8-d026af386f5f"
output_dir = r"C:\Users\user\Desktop\tripbookingMethod (1)\tripbookingMethod\shinelimos\public\images"

files_to_process = {
    "s_class_new_1781518809884.png": ["S class.webp", "sedan.webp", "Mercedes Benz S Class  luxury sedan.webp"],
    "cadillac_escalade_new_1781518822149.png": ["Cadillac Escalade.webp"],
    "chevrolet_suburban_new_1781518834177.png": ["Chevrolet Suburban.webp"],
    "lincoln_navigator_new_1781518846736.png": ["Lincoln navigator-SUV.webp"],
    "sprinter_van_new_1781518858370.png": ["sprinter (mercedes van).webp"],
    "party_bus_new_1781518871024.png": ["30 PAX bus.webp"],
    "coach_bus_new_1781518883500.png": ["50 PAX bus.webp"]
}

for src, dests in files_to_process.items():
    src_path = os.path.join(input_dir, src)
    if os.path.exists(src_path):
        print(f"Processing {src}...")
        try:
            with open(src_path, 'rb') as i:
                input_data = i.read()
                
            # Remove background to get transparent car
            output_data = remove(input_data)
            transparent_img = Image.open(io.BytesIO(output_data)).convert("RGBA")
            
            # Create a solid white background
            white_bg = Image.new("RGB", transparent_img.size, (255, 255, 255))
            
            # Paste the car onto the white background using its alpha channel as the mask
            white_bg.paste(transparent_img, mask=transparent_img.split()[3])
            
            # Save the final image as WEBP
            for dest in dests:
                dest_path = os.path.join(output_dir, dest)
                white_bg.save(dest_path, "WEBP", quality=90)
                print(f"Saved {dest_path}")
        except Exception as e:
            print(f"Error processing {src}: {e}")

print("All done!")
