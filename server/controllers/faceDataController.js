import { faceDataRepository } from '../repositories/faceDataRepository.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { extractFaceDescriptorFromBase64, euclideanDistance, } from '../utils/faceRecognition.js';

export const faceDataController = {
  async getFaceDataByUserId(req, res) {
    try {
      const { userId } = req.params;
      const faceData = await faceDataRepository.findActiveByUserId(userId);
      successResponse(res, faceData, 'Data wajah berhasil diambil');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  async createFaceData(req, res) {
    const totalStartTime = Date.now();
    console.log('[FACE-REG] Request received for userId:', req.user._id);

    try {
      const { foto } = req.body;
      const userId = req.user._id;

      if (!userId) {
        return errorResponse(res, 'User ID wajib diisi', 400);
      }

      if (!foto) {
        return errorResponse(res, 'Foto wajah wajib diisi', 400);
      }

      // Check existing face data
      const checkExistingStart = Date.now();
      const existingFaceData = await faceDataRepository.findActiveByUserId(userId);
      const checkExistingEnd = Date.now();
      console.log(`[FACE-REG] Check existing face data: ${checkExistingEnd - checkExistingStart} ms`);

      if (existingFaceData) {
        return errorResponse(res, 'Wajah Anda Sudah Terdaftar', 400);
      }

      // Extract face descriptor
      console.log('[FACE-REG] Starting face descriptor extraction...');
      const descriptor = await extractFaceDescriptorFromBase64(foto);
      console.log('[FACE-REG] Face descriptor extraction completed');

      if (!Array.isArray(descriptor)) {
        return errorResponse(res, 'Descriptor hasil ekstraksi tidak valid', 400);
      }

      if (descriptor.length !== 128) {
        return errorResponse(res, 'Descriptor harus berisi 128 angka', 400);
      }

      // Query all active face data for duplicate check
      const queryAllStart = Date.now();
      const allFaceData = await faceDataRepository.findAllActive();
      const queryAllEnd = Date.now();
      console.log(`[FACE-REG] Query all active faces (${allFaceData.length} records): ${queryAllEnd - queryAllStart} ms`);

      // Duplicate check loop
      const duplicateCheckStart = Date.now();
      let duplicateCheckCount = 0;
      for (const existingFace of allFaceData) {
        // Lewati FaceData milik user yang sedang login
        if (existingFace.userId.toString() === userId.toString()) {
          continue;
        }

        duplicateCheckCount++;
        const distance = euclideanDistance(descriptor, existingFace.descriptor);

        if (distance <= 0.6) {
          return errorResponse(
            res,
            'Wajah sudah terdaftar pada akun lain',
            400
          );
        }
      }
      const duplicateCheckEnd = Date.now();
      console.log(`[FACE-REG] Duplicate check (${duplicateCheckCount} comparisons): ${duplicateCheckEnd - duplicateCheckStart} ms`);

      // Insert to database
      const insertStart = Date.now();
      const faceData = await faceDataRepository.create({
        userId,
        descriptor,
        foto,
        isActive: true,
      });
      const insertEnd = Date.now();
      console.log(`[FACE-REG] Database insert: ${insertEnd - insertStart} ms`);

      const totalEndTime = Date.now();
      console.log(`[FACE-REG] TOTAL: ${totalEndTime - totalStartTime} ms`);

      successResponse(res, faceData, 'Data wajah berhasil disimpan', 201);
    } catch (error) {
      const totalEndTime = Date.now();
      console.log(`[FACE-REG] ERROR after ${totalEndTime - totalStartTime} ms:`, error.message);

      const message = error.message || 'Terjadi kesalahan saat memproses data wajah';
      const statusCode = [
        'Wajah tidak terdeteksi',
        'Lebih dari satu wajah terdeteksi',
        'Invalid base64 image data',
        'Failed to create image from base64',
        'No image provided',
      ].some((expected) => message.includes(expected))
        ? 400
        : 500;
      errorResponse(res, message, statusCode);
    }
  },

  async updateFaceData(req, res) {
    try {
      const { id } = req.params;
      const { descriptor, foto } = req.body;
      const faceData = await faceDataRepository.update(id, {
        descriptor,
        foto,
      });
      successResponse(res, faceData, 'Data wajah berhasil diperbarui');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  async deactivateFaceData(req, res) {
    try {
      const { userId } = req.params;
      await faceDataRepository.deactivateByUserId(userId);
      successResponse(res, null, 'Data wajah berhasil dinonaktifkan');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  async deleteFaceData(req, res) {
    try {
      const { id } = req.params;
      await faceDataRepository.delete(id);
      successResponse(res, null, 'Data wajah berhasil dihapus');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },
};
