import path from 'path';
import { fileURLToPath } from 'url';
import * as faceapi from 'face-api.js';
import { Canvas, Image, ImageData } from 'canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MODEL_PATH = path.join(__dirname, '..', 'models_face');

// Monkey patch canvas bindings for face-api.js in Node
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

export async function loadFaceModels() {
  if (modelsLoaded) return;
  // Load models from disk (MODEL_PATH)
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
  modelsLoaded = true;
}

export function areModelsLoaded() {
  return modelsLoaded;
}

export async function extractFaceDescriptorFromBase64(base64Image) {
  const totalStartTime = Date.now();
  console.log('[FACE-REG] extractFaceDescriptorFromBase64 started');

  if (!base64Image) throw new Error('No image provided');

  // Ensure models are loaded
  const loadModelsStart = Date.now();
  await loadFaceModels();
  const loadModelsEnd = Date.now();
  console.log(`[FACE-REG] Load models (cached): ${loadModelsEnd - loadModelsStart} ms`);

  // Normalize base64: accept data:url or raw base64
  let b64 = base64Image;
  const dataUrlMatch = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/i.exec(base64Image);
  if (dataUrlMatch) {
    b64 = dataUrlMatch[2];
  }

  // Decode Base64 to Buffer
  const decodeStart = Date.now();
  let imgBuffer;
  try {
    imgBuffer = Buffer.from(b64, 'base64');
  } catch (err) {
    throw new Error('Invalid base64 image data');
  }
  const decodeEnd = Date.now();
  console.log(`[FACE-REG] Decode Base64 to Buffer: ${decodeEnd - decodeStart} ms`);

  // Load image to Canvas
  const loadImgStart = Date.now();
  const img = new Image();
  try {
    img.src = imgBuffer;
  } catch (err) {
    throw new Error('Failed to create image from base64: ' + err.message);
  }
  const loadImgEnd = Date.now();
  console.log(`[FACE-REG] Load image to Canvas: ${loadImgEnd - loadImgStart} ms`);

  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 });

  // Detect all faces with landmarks and descriptors in one chain
  const detectionStart = Date.now();
  const results = await faceapi.detectAllFaces(img, options).withFaceLandmarks().withFaceDescriptors();
  const detectionEnd = Date.now();
  console.log(`[FACE-REG] detectAllFaces + withFaceLandmarks + withFaceDescriptors: ${detectionEnd - detectionStart} ms`);

  if (!results || results.length === 0) {
    throw new Error('Wajah tidak terdeteksi');
  }

  if (results.length > 1) {
    throw new Error('Lebih dari satu wajah terdeteksi; hanya satu wajah yang diperbolehkan');
  }

  const descriptor = results[0].descriptor;
  if (!descriptor) throw new Error('Gagal membuat face descriptor');
  if (descriptor.length !== 128) throw new Error('Descriptor tidak memiliki panjang 128');

  // Convert Float32Array to plain Array<number>
  const convertStart = Date.now();
  const result = Array.from(descriptor);
  const convertEnd = Date.now();
  console.log(`[FACE-REG] Convert descriptor to Array: ${convertEnd - convertStart} ms`);

  const totalEndTime = Date.now();
  console.log(`[FACE-REG] extractFaceDescriptorFromBase64 TOTAL: ${totalEndTime - totalStartTime} ms`);

  return result;
}

export function euclideanDistance(descriptorA, descriptorB) {
  if (!Array.isArray(descriptorA) || !Array.isArray(descriptorB)) {
    throw new Error('Descriptor tidak valid');
  }
  if (descriptorA.length !== 128 || descriptorB.length !== 128) {
    throw new Error('Descriptor harus memiliki panjang 128');
  }

  let sum = 0;
  for (let i = 0; i < 128; i += 1) {
    const delta = descriptorA[i] - descriptorB[i];
    sum += delta * delta;
  }

  const distance = Math.sqrt(sum);
  if (Number.isNaN(distance)) {
    throw new Error('Perhitungan descriptor menghasilkan NaN');
  }

  return distance;
}
