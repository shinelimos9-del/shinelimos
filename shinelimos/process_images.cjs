const { removeBackground } = require('@imgly/background-removal-node');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImages() {
  const inputDir = 'C:/Users/user/.gemini/antigravity-ide/brain/29123056-12bf-4aa3-94b8-d026af386f5f/';
  const outputDir = 'C:/Users/user/Desktop/tripbookingMethod (1)/tripbookingMethod/shinelimos/public/images/';
  
  const filesToProcess = [
    { src: 's_class_1781517488412.png', dests: ['S class.webp', 'sedan.webp', 'Mercedes Benz S Class  luxury sedan.webp'] },
    { src: 'cadillac_escalade_1781517501655.png', dests: ['Cadillac Escalade.webp'] },
    { src: 'chevrolet_suburban_1781517514245.png', dests: ['Chevrolet Suburban.webp'] },
    { src: 'lincoln_navigator_1781517527474.png', dests: ['Lincoln navigator-SUV.webp'] },
    { src: 'sprinter_van_1781517541694.png', dests: ['sprinter (mercedes van).webp'] },
    { src: 'party_bus_1781517555217.png', dests: ['30 PAX bus.webp'] },
    { src: 'coach_bus_1781517568989.png', dests: ['50 PAX bus.webp'] }
  ];

  for (const file of filesToProcess) {
    const inputPath = path.join(inputDir, file.src);
    console.log(`Processing ${file.src}...`);
    try {
      // Remove background
      const blob = await removeBackground(inputPath);
      const buffer = Buffer.from(await blob.arrayBuffer());
      
      // Convert to WebP and save to all destinations
      for (const dest of file.dests) {
        const destPath = path.join(outputDir, dest);
        await sharp(buffer)
          .webp({ quality: 90, lossless: true })
          .toFile(destPath);
        console.log(`Saved transparent webp to ${destPath}`);
      }
    } catch (e) {
      console.error(`Error processing ${file.src}:`, e);
    }
  }
}

processImages().then(() => console.log('Done!'));
