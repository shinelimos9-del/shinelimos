from PIL import Image
import os

input_path = r"C:\Users\user\.gemini\antigravity-ide\brain\29123056-12bf-4aa3-94b8-d026af386f5f\s_class_green_1781518594298.png"
output_path = r"C:\Users\user\Desktop\tripbookingMethod (1)\tripbookingMethod\shinelimos\public\images\test_transparent.webp"

img = Image.open(input_path).convert("RGBA")
datas = img.getdata()

newData = []
for item in datas:
    # item is (R, G, B, A)
    # Check if green is dominant
    if item[1] > 180 and item[0] < 100 and item[2] < 100:
        newData.append((255, 255, 255, 0)) # transparent
    else:
        newData.append(item)

img.putdata(newData)
img.save(output_path, "WEBP", lossless=True)
print("Saved test_transparent.webp")
