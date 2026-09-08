  import { absensiRepository } from '../repositories/absensiRepository.js';
  import { faceDataRepository } from '../repositories/faceDataRepository.js';
  import { userRepository } from '../repositories/userRepository.js';
  import { kajianRepository } from '../repositories/kajianRepository.js';
  import { notificationService } from '../services/notificationService.js';
  import { successResponse, errorResponse } from '../utils/responseFormatter.js';
  import { extractFaceDescriptorFromBase64, euclideanDistance } from '../utils/faceRecognition.js';
  import { getIO } from '../config/socket.js';
  import { getJakartaDateTime, getJakartaNowParts, getJakartaDateString } from '../utils/jakartaTime.js';
  import { calculateDistance } from '../utils/distanceCalculator.js';

  const FACE_MATCH_THRESHOLD = 0.6;

  function isValidDescriptor(descriptor) {
    return (
      Array.isArray(descriptor) &&
      descriptor.length === 128 &&
      descriptor.every((value) => typeof value === 'number' && !Number.isNaN(value))
    );
  }

  export const absensiController = {
    async createAbsensi(req, res) {
      try {
        const { kajianId, metode, lokasi, latitude, longitude, foto } = req.body;
        const kajian = await kajianRepository.findById(kajianId);

        if (!kajian) {
          return errorResponse(res, 'Kajian tidak ditemukan', 404);
        }

        const now = new Date();
        const waktuMulai = getJakartaDateTime(kajian.tanggal, kajian.jamMulai);
        const waktuSelesai = getJakartaDateTime(kajian.tanggal, kajian.jamSelesai);

        if (now < waktuMulai) {
          return errorResponse(res, 'Presensi belum dapat dilakukan karena kajian belum dimulai', 400);
        }

        if (now > waktuSelesai) {
          return errorResponse(res, 'Presensi tidak dapat dilakukan karena kajian sudah selesai', 400);
        }

        const userLatitude = Number(latitude);
        const userLongitude = Number(longitude);
        if (!Number.isFinite(userLatitude) || !Number.isFinite(userLongitude)) {
          return errorResponse(res, 'Koordinat lokasi jamaah tidak valid', 400);
        }

        const locationDistance = calculateDistance(
          userLatitude,
          userLongitude,
          kajian.latitude,
          kajian.longitude
        );
        if (locationDistance > kajian.radius) {
          return errorResponse(
            res,
            `Lokasi Anda berada di luar radius kajian. Jarak Anda sekitar ${Math.round(locationDistance)} meter, sedangkan radius yang diizinkan adalah ${kajian.radius} meter.`,
            400
          );
        }

        const nowJakarta = getJakartaNowParts(now);
        const tanggalPresensi = new Date(`${getJakartaDateString(kajian.tanggal)}T00:00:00.000Z`);
        const waktuPresensi = `${String(nowJakarta.hour).padStart(2, '0')}:${String(nowJakarta.minute).padStart(2, '0')}`;
        // DEBUG
        console.log('[BACKEND] Foto diterima');

        if (foto) {
          console.log('[BACKEND] Base64 length:', foto.length);
          console.log('[BACKEND] Photo prefix:', foto.substring(0, 50));
        } else {
          console.log('[BACKEND] Foto TIDAK ADA');
        }

        if (!foto) {
          return errorResponse(res, 'Foto absensi wajib diisi', 400);
        }
        const descriptor = await extractFaceDescriptorFromBase64(foto);

        const userId = req.user._id;

        const faceData = await faceDataRepository.findActiveByUserId(userId);

        if (!faceData) {
          return errorResponse(res, 'Data wajah Anda belum terdaftar', 400);
        }

        if (!isValidDescriptor(faceData.descriptor)) {
          return errorResponse(res, 'Data wajah Anda tidak valid', 400);
        }


        const distance = euclideanDistance(descriptor, faceData.descriptor);

        if (distance > FACE_MATCH_THRESHOLD) {
          return errorResponse(res, 'Wajah tidak sesuai dengan akun yang sedang login', 400);
        }


        console.log('[BACKEND] Wajah berhasil dikenali');
        console.log('[BACKEND] Wajah berhasil dikenali');
        console.log('[BACKEND] Distance:', distance);
        console.log('[BACKEND] User ID:', userId);

        const user = await userRepository.findById(userId);
        if (!user || user.role !== 'jamaah' || user.status !== 'aktif') {
          return errorResponse(res, 'User hasil pencocokan tidak dapat melakukan presensi', 403);
        }
        const existingAbsensi = await absensiRepository.findByUserAndKajian(userId, kajianId);
        if (existingAbsensi) {
          return errorResponse(res, 'Anda sudah melakukan presensi pada kajian ini', 400);
        }

        console.log('[BACKEND] Akan menyimpan absensi ke database');


        const absensi = await absensiRepository.create({
          userId: userId,
          kajianId,
          tanggal: tanggalPresensi,
          waktu: waktuPresensi,
          status: 'hadir',
          metode,
          lokasi,
          latitude,
          longitude,
          distance: locationDistance,
          foto,
        });

        console.log('[BACKEND] Absensi berhasil disimpan:', absensi._id);

        // Fetch user and kajian data for notification
        // Get all admin users
        const adminUsers = await userRepository.findAll({ role: 'admin' });

        // Create notification for each admin
        for (const admin of adminUsers) {
          await notificationService.createAbsensiNotification(
            admin._id,
            user?.nama || 'Unknown',
            kajian?.judul || 'Unknown',
            waktuPresensi,
            absensi._id
          );
        }

        // Emit Socket.IO event to all connected clients
        const io = getIO();
        io.emit('notification:new', {
          type: 'ABSENSI',
          title: 'Absensi Baru',
          message: `${user?.nama || 'Unknown'} melakukan absensi pada ${kajian?.judul || 'Unknown'} pukul ${waktuPresensi}`,
          absensiId: absensi._id,
          timestamp: new Date().toISOString()
        });

        successResponse(res, absensi, 'Absensi berhasil dicatat', 201);
      } catch (error) {
        errorResponse(res, error.message);
      }
    },

    async getAbsensiByKajian(req, res) {
      try {
        const { kajianId } = req.params;
        const absensiList = await absensiRepository.findByKajianId(kajianId);
        successResponse(res, absensiList, 'Data absensi berhasil diambil');
      } catch (error) {
        errorResponse(res, error.message);
      }
    },

    async getAbsensiByUser(req, res) {
      try {
        const { userId } = req.params;
        const absensiList = await absensiRepository.findByUserId(userId);
        successResponse(res, absensiList, 'Data absensi berhasil diambil');
      } catch (error) {
        errorResponse(res, error.message);
      }
    },

    async getAbsensiStats(req, res) {
      try {
        const { kajianId } = req.params;
        const rekap = await absensiRepository.getAttendanceRekap(kajianId);
        const stats = rekap.reduce((result, absensi) => {
          if (Object.prototype.hasOwnProperty.call(result, absensi.status)) {
            result[absensi.status] += 1;
          }
          return result;
        }, {
          total: rekap.length,
          hadir: 0,
          belum_presensi: 0,
          tidak_hadir: 0,
        });
        successResponse(res, stats, 'Statistik absensi berhasil diambil');
      } catch (error) {
        errorResponse(res, error.message);
      }
    },

    async getAllAbsensi(req, res) {
      try {
        const absensiList = await absensiRepository.findAll();
        successResponse(res, absensiList, 'Data absensi berhasil diambil');
      } catch (error) {
        errorResponse(res, error.message);
      }
    },

    async deleteAbsensi(req, res) {
      try {
        const { id } = req.params;
        const deletedAbsensi = await absensiRepository.delete(id);

        if (!deletedAbsensi) {
          return errorResponse(res, 'Data absensi tidak ditemukan', 404);
        }

        successResponse(res, deletedAbsensi, 'Absensi berhasil dihapus');
      } catch (error) {
        errorResponse(res, error.message);
      }
    },

    async getAttendanceRekap(req, res) {
      try {
        const { kajianId } = req.params;
        const rekap = await absensiRepository.getAttendanceRekap(kajianId);
        successResponse(res, rekap, 'Rekap kehadiran berhasil diambil');
      } catch (error) {
        errorResponse(res, error.message);
      }
    },
  };
