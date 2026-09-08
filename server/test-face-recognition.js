import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadFaceModels, areModelsLoaded, extractFaceDescriptorFromBase64 } from './utils/faceRecognition.js';

async function main() {
  const imgPath = process.argv[2];
  if (!imgPath) {
    console.error('Usage: node test-face-recognition.js <path-to-image>');
    process.exit(1);
  }

  const resolved = path.resolve(imgPath);
  if (!fs.existsSync(resolved)) {
    console.error('File not found:', resolved);
    process.exit(1);
  }

  const ext = path.extname(resolved).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const buf = fs.readFileSync(resolved);
  const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;

  try {
    console.log('Loading face-api.js models...');
    await loadFaceModels();
    console.log('Models loaded:', areModelsLoaded());

    console.log('Extracting descriptor from image:', resolved);
    const descriptor = await extractFaceDescriptorFromBase64(dataUrl);
    console.log('Face detected: YES');
    console.log('Descriptor length:', descriptor.length);
    console.log('Descriptor sample (first 8):', descriptor.slice(0, 8));
  } catch (err) {
    console.error('Error during test:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

main();
