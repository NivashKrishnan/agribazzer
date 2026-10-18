const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

function processImage(inputPath, outputPath) {
  const rawData = fs.readFileSync(inputPath);
  const jpegData = jpeg.decode(rawData, { useTArray: true });
  
  const png = new PNG({
    width: jpegData.width,
    height: jpegData.height,
  });

  const cx = jpegData.width / 2;
  const cy = jpegData.height / 2;
  const radius = Math.min(cx, cy) * 0.49;

  for (let y = 0; y < jpegData.height; y++) {
    for (let x = 0; x < jpegData.width; x++) {
      const idx = (y * jpegData.width + x) * 4;
      const r = jpegData.data[idx];
      const g = jpegData.data[idx + 1];
      const b = jpegData.data[idx + 2];
      
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      // Check if white background pixel or outside circle radius
      if ((r > 230 && g > 230 && b > 230) || dist > radius) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0; // Transparent
      } else {
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255; // Opaque
      }
    }
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved transparent PNG to ${outputPath} (${buffer.length} bytes)`);
}

const sourceFile = path.join(__dirname, '../public/img/logo.png');
const targetPublic = path.join(__dirname, '../public/img/logo.png');
const targetAssets = path.join(__dirname, '../assets/images/logo.png');

processImage(sourceFile, targetPublic);
processImage(sourceFile, targetAssets);
