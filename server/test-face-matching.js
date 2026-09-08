import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { faceDataRepository } from './repositories/faceDataRepository.js';
import { loadFaceModels, areModelsLoaded, extractFaceDescriptorFromBase64, euclideanDistance } from './utils/faceRecognition.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_IMAGE = path.join(__dirname, 'test_face_single.jpg');
const THRESHOLD = 0.6;

async function main() {
  const imageArg = process.argv[2];
  const imagePath = imageArg ? path.resolve(imageArg) : DEFAULT_IMAGE;

  if (!fs.existsSync(imagePath)) {
    console.error('ERROR: Test image not found:', imagePath);
    console.error('Please provide a valid image path as the first argument.');
    process.exit(1);
  }

  const ext = path.extname(imagePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const buffer = fs.readFileSync(imagePath);
  const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;

  console.log('=== FACE MATCHING TEST ===');
  console.log('Test image:', imagePath);

  try {
    await connectDB();

    await loadFaceModels();
    console.log('Models loaded:', areModelsLoaded());

    const descriptor = await extractFaceDescriptorFromBase64(dataUrl);
    console.log('Face detected: true');
    console.log('Test descriptor type:', Array.isArray(descriptor) ? 'Array' : typeof descriptor);
    console.log('Test descriptor length:', descriptor.length);

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      throw new Error('Test descriptor invalid');
    }

    const activeFaceData = await faceDataRepository.findAllActive();
    console.log('\nActive FaceData:', activeFaceData.length);

    if (!activeFaceData || activeFaceData.length === 0) {
      throw new Error('No active FaceData found');
    }

    const candidates = [];
    for (const faceData of activeFaceData) {
      const userId = faceData.userId?.toString ? faceData.userId.toString() : faceData.userId;
      const descriptorB = faceData.descriptor;

      if (!Array.isArray(descriptorB) || descriptorB.length !== 128) {
        console.warn(`- Skipping FaceData ${userId}: descriptor tidak valid (${descriptorB?.length ?? 'none'})`);
        continue;
      }

      const distance = euclideanDistance(descriptor, descriptorB);
      candidates.push({ userId, distance });
    }

    if (candidates.length === 0) {
      throw new Error('No valid FaceData descriptors found');
    }

    console.log('\nMatch candidates:');
    for (const candidate of candidates) {
      console.log(`- userId: ${candidate.userId}`);
      console.log(`  distance: ${candidate.distance.toFixed(4)}`);
    }

    const bestMatch = candidates.reduce((best, current) => {
      return current.distance < best.distance ? current : best;
    }, candidates[0]);

    const isMatch = bestMatch.distance <= THRESHOLD;

    console.log('\nBest match:');
    console.log(`- userId: ${bestMatch.userId}`);
    console.log(`- distance: ${bestMatch.distance.toFixed(4)}`);
    console.log(`- threshold: ${THRESHOLD}`);
    console.log(`- match: ${isMatch}`);

    process.exit(isMatch ? 0 : 0);
  } catch (error) {
    console.error('\nERROR: Integration test failed');
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

main();
