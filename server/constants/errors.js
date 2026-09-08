export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Email atau password salah',
  TOKEN_INVALID: 'Token tidak valid',
  TOKEN_EXPIRED: 'Token telah kadaluarsa',
  UNAUTHORIZED: 'Anda tidak memiliki akses',
  FORBIDDEN: 'Anda tidak memiliki izin untuk melakukan aksi ini',

  // User
  USER_NOT_FOUND: 'User tidak ditemukan',
  EMAIL_EXISTS: 'Email sudah terdaftar',
  PASSWORD_MISMATCH: 'Password tidak cocok',
  PASSWORD_TOO_SHORT: 'Password minimal 6 karakter',

  // Kajian
  KAJIAN_NOT_FOUND: 'Kajian tidak ditemukan',
  INVALID_SCHEDULE: 'Jam selesai harus lebih besar dari jam mulai',

  // Absensi
  ABSENSI_NOT_FOUND: 'Absensi tidak ditemukan',
  DUPLICATE_ABSENSI: 'Anda sudah melakukan absensi pada kajian ini',
  GPS_INVALID: 'Anda berada di luar jarak yang diizinkan untuk melakukan absensi',
  FACE_NOT_RECOGNIZED: 'Wajah tidak dikenali',
  NO_FACE_DETECTED: 'Tidak ada wajah terdeteksi',
  MULTIPLE_FACES: 'Terdeteksi lebih dari satu wajah',

  // Face Data
  FACE_DATA_NOT_FOUND: 'Data wajah tidak ditemukan',
  FACE_REGISTRATION_FAILED: 'Registrasi wajah gagal',

  // File
  FILE_TOO_LARGE: 'Ukuran file terlalu besar',
  INVALID_FILE_TYPE: 'Tipe file tidak valid',

  // General
  INTERNAL_ERROR: 'Terjadi kesalahan pada server',
  VALIDATION_ERROR: 'Data tidak valid',
};
