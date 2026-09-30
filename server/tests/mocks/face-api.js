// Mock for face-api.js
export const nets = {
  tinyFaceDetector: {
    loadFromDisk: jest.fn(),
    loadFromUri: jest.fn(),
  },
  faceLandmark68Net: {
    loadFromDisk: jest.fn(),
    loadFromUri: jest.fn(),
  },
  faceRecognitionNet: {
    loadFromDisk: jest.fn(),
    loadFromUri: jest.fn(),
  },
  ssdMobilenetv1: {
    loadFromDisk: jest.fn(),
    loadFromUri: jest.fn(),
  },
};

export const TinyFaceDetectorOptions = jest.fn();
export const SsdMobilenetv1Options = jest.fn();

export const detectAllFaces = jest.fn();
export const withFaceLandmarks = jest.fn();
export const withFaceDescriptors = jest.fn();

export const env = {
  monkeyPatch: jest.fn(),
};
