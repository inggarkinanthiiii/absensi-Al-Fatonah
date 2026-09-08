export const dummyJamaah = [
  {
    id: 1,
    nama: 'Ahmad Fauzan',
    email: 'ahmad@example.com',
    telepon: '081234567890',
    alamat: 'Jl. Merdeka No. 10',
    tanggalRegistrasi: '2024-01-15',
    status: 'Aktif',
    foto: null
  },
  {
    id: 2,
    nama: 'Budi Santoso',
    email: 'budi@example.com',
    telepon: '081234567891',
    alamat: 'Jl. Sudirman No. 20',
    tanggalRegistrasi: '2024-02-20',
    status: 'Aktif',
    foto: null
  },
  {
    id: 3,
    nama: 'Citra Lestari',
    email: 'citra@example.com',
    telepon: '081234567892',
    alamat: 'Jl. Gatot Subroto No. 30',
    tanggalRegistrasi: '2024-03-10',
    status: 'Aktif',
    foto: null
  },
  {
    id: 4,
    nama: 'Dimas Pratama',
    email: 'dimas@example.com',
    telepon: '081234567893',
    alamat: 'Jl. Diponegoro No. 40',
    tanggalRegistrasi: '2024-04-05',
    status: 'Aktif',
    foto: null
  },
  {
    id: 5,
    nama: 'Fajar Ramadhan',
    email: 'fajar@example.com',
    telepon: '081234567894',
    alamat: 'Jl. Ahmad Yani No. 50',
    tanggalRegistrasi: '2024-05-12',
    status: 'Aktif',
    foto: null
  }
];

export const dummyKajian = [
  {
    id: 1,
    judul: 'Kajian Rutin Mingguan',
    deskripsi: 'Kajian rutin setiap minggu membahas tafsir Al-Quran',
    pemateri: 'Ustadz Abdullah',
    tanggal: '2024-08-11',
    jamMulai: '09:00',
    jamSelesai: '11:00',
    lokasi: 'Masjid Utama',
    status: 'Aktif'
  },
  {
    id: 2,
    judul: 'Kajian Tafsir',
    deskripsi: 'Tafsir mendalam tentang ayat-ayat pilihan',
    pemateri: 'Ustadz Ibrahim',
    tanggal: '2024-08-13',
    jamMulai: '19:00',
    jamSelesai: '21:00',
    lokasi: 'Masjid Utama',
    status: 'Aktif'
  },
  {
    id: 3,
    judul: 'Kajian Akhlak',
    deskripsi: 'Pembahasan tentang akhlakul karimah',
    pemateri: 'Ustadz Hassan',
    tanggal: '2024-08-15',
    jamMulai: '18:00',
    jamSelesai: '20:00',
    lokasi: 'Aula Masjid',
    status: 'Aktif'
  },
  {
    id: 4,
    judul: 'Kajian Fiqih',
    deskripsi: 'Pembahasan fiqih ibadah sehari-hari',
    pemateri: 'Ustadz Khalid',
    tanggal: '2024-08-17',
    jamMulai: '16:00',
    jamSelesai: '18:00',
    lokasi: 'Masjid Utama',
    status: 'Aktif'
  }
];

export const dummyAbsensi = [
  {
    id: 1,
    jamaahId: 1,
    kajianId: 1,
    tanggal: '2024-08-10',
    waktu: '09:15',
    status: 'Hadir',
    metode: 'Face Recognition'
  },
  {
    id: 2,
    jamaahId: 2,
    kajianId: 1,
    tanggal: '2024-08-10',
    waktu: '09:20',
    status: 'Hadir',
    metode: 'Face Recognition'
  },
  {
    id: 3,
    jamaahId: 3,
    kajianId: 1,
    tanggal: '2024-08-10',
    waktu: '09:25',
    status: 'Hadir',
    metode: 'Face Recognition'
  },
  {
    id: 4,
    jamaahId: 4,
    kajianId: 2,
    tanggal: '2024-08-06',
    waktu: '19:10',
    status: 'Hadir',
    metode: 'Face Recognition'
  },
  {
    id: 5,
    jamaahId: 5,
    kajianId: 3,
    tanggal: '2024-08-08',
    waktu: '18:05',
    status: 'Hadir',
    metode: 'Face Recognition'
  }
];

export const dummyNotifikasi = [
  {
    id: 1,
    judul: 'Jamaah Baru Terdaftar',
    pesan: 'Ahmad Fauzan telah mendaftar sebagai jamaah baru',
    tanggal: '2024-08-10',
    waktu: '10:30',
    status: 'unread'
  },
  {
    id: 3,
    judul: 'Kehadiran Tinggi',
    pesan: 'Kehadiran kajian minggu ini mencapai 85%',
    tanggal: '2024-08-09',
    waktu: '14:00',
    status: 'read'
  }
];

export const dummyAdmin = {
  id: 1,
  nama: 'Admin Masjid',
  email: 'admin@masjid-alhikmah.com',
  telepon: '081111111111',
  role: 'Admin'
};
