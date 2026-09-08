# ERD Analysis - Sistem Absensi Kajian Masjid Al-Hikmah

## 1. Entity yang Ditemukan

Berdasarkan analisis prototype, ditemukan 6 entity utama:

1. **User** - Menyimpan data pengguna (admin dan jamaah)
2. **FaceData** - Menyimpan data wajah untuk face recognition
3. **Kajian** - Menyimpan data kajian/schedule
4. **Absensi** - Menyimpan data kehadiran jamaah
5. **Izin** - Menyimpan data pengajuan izin
6. **Notification** - Menyimpan data notifikasi untuk real-time updates

---

## 2. User

### Field yang ditemukan di prototype:

**Dari dummyData.js (dummyJamaah):**
- id
- nama
- email
- telepon
- alamat
- tanggalRegistrasi
- status (Aktif/Nonaktif)
- foto (null di dummy, tapi ada UI untuk upload)

**Dari dummyData.js (dummyAdmin):**
- id
- nama
- email
- telepon
- role (Admin)

**Dari Register.jsx:**
- nama (required)
- email (required)
- telepon (required)
- alamat (required)
- password (required)
- confirmPassword (required)

**Dari JamaahProfil.jsx:**
- nama (editable)
- email (editable)
- telepon (editable)
- alamat (editable)
- password (changeable)
- foto (uploadable)
- tanggalRegistrasi (read-only)

**Dari AdminJamaah.jsx:**
- nama (required in form)
- email (required in form)
- telepon (required in form)
- alamat (required in form)
- password (required for add, optional for edit)
- status (Aktif/Nonaktif)

**Dari AuthContext.jsx:**
- role (admin/jamaah)

### Field yang diperlukan untuk database:

```javascript
{
  _id: ObjectId,
  nama: String,           // Required
  email: String,          // Required, unique
  password: String,       // Required (hashed with bcrypt)
  telepon: String,        // Required
  alamat: String,         // Required
  role: String,           // Required, enum: ['admin', 'jamaah']
  status: String,         // Required, enum: ['aktif', 'nonaktif'], default: 'aktif'
  foto: String,           // Optional (URL/path to profile photo)
  tanggalRegistrasi: Date,// Required, default: Date.now()
  createdAt: Date         // Auto-generated (updatedAt handled by Mongoose)
}
```

### Keputusan desain:

1. **Role dan status menggunakan enum** - Karena prototype menggunakan nilai tetap (admin/jamaah, Aktif/Nonaktif)
2. **Satu collection untuk admin dan jamaah** - Karena struktur data sama, hanya dibedakan oleh role
3. **Password di-hash dengan bcrypt** - Sesuai requirement teknologi backend
4. **Email unique** - Diperlukan untuk login dan identifikasi unik
5. **Foto optional** - Di prototype, field ada tapi null, dan ada UI untuk upload
6. **tanggalRegistrasi** - Diperlukan karena ditampilkan di profil dan dashboard

### Field yang TIDAK diperlukan:

- **tanggalLahir** - Tidak ditemukan di prototype
- **jenisKelamin** - Tidak ditemukan di prototype
- **lastLogin** - Tidak ditemukan di prototype (opsional untuk audit log)
- **faceRegistered** - Bisa diturunkan dari FaceData collection

---

## 3. FaceData

### Field yang ditemukan di prototype:

**Dari JamaahRegistrasiWajah.jsx:**
- Camera capture simulation
- File upload support
- Re-registration capability (registrasi ulang)
- Status: idle, capturing, success, registered

**Dari requirement:**
- face-api.js
- TensorFlow.js
- TinyFaceDetector
- FaceLandmark68Net
- FaceRecognitionNet

### Field yang diperlukan untuk database:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // Required, reference to User
  descriptor: [Number],   // Required - Array of numbers (128-dimensional face descriptor from face-api.js)
  foto: String,           // Required - Path/URL to face photo used for registration
  isActive: Boolean,      // Required, default: true - untuk support registrasi ulang
  createdAt: Date         // Auto-generated (updatedAt handled by Mongoose)
}
```

### Keputusan desain:

1. **Descriptor sebagai array of numbers** - face-api.js menghasilkan 128-dimensional float array, bukan string
2. **Satu User boleh memiliki banyak FaceData** - Untuk support registrasi ulang (update wajah)
3. **isActive flag** - Untuk menandai face data mana yang aktif. Saat registrasi ulang, face data lama di-set isActive: false
4. **Foto wajah disimpan** - Diperlukan untuk verifikasi visual dan debugging

### Relasi dengan User:

- User 1 ─── N FaceData (One-to-Many)
- Setiap registrasi ulang membuat FaceData baru
- Hanya satu FaceData dengan isActive: true per user

---

## 4. Kajian

### Field yang ditemukan di prototype:

**Dari dummyData.js (dummyKajian):**
- id
- judul
- deskripsi
- pemateri
- tanggal (YYYY-MM-DD)
- jamMulai (HH:mm)
- jamSelesai (HH:mm)
- lokasi
- status (Aktif)

**Dari AdminKajian.jsx:**
- judul (required)
- deskripsi (optional)
- pemateri (required)
- tanggal (required, type="date")
- jamMulai (required, type="time")
- jamSelesai (required, type="time")
- lokasi (required, dengan location picker modal)
- status (Aktif/Non-Aktif)

**Dari JamaahAbsensi.jsx:**
- Validasi lokasi/GPS
- Menampilkan jarak dari lokasi kajian

### Field yang diperlukan untuk database:

```javascript
{
  _id: ObjectId,
  judul: String,          // Required
  deskripsi: String,      // Optional
  pemateri: String,       // Required
  tanggal: Date,          // Required
  jamMulai: String,       // Required (HH:mm format)
  jamSelesai: String,     // Required (HH:mm format)
  lokasi: String,         // Required - nama lokasi (misal: "Masjid Al-Hikmah")
  latitude: Number,       // Required - koordinat lokasi untuk validasi GPS
  longitude: Number,      // Required - koordinat lokasi untuk validasi GPS
  radius: Number,         // Required - batas jarak dalam meter untuk validasi lokasi (default: 50, configurable)
  status: String,         // Required, enum: ['aktif', 'nonaktif'], default: 'aktif'
  createdAt: Date         // Auto-generated (updatedAt handled by Mongoose)
}
```

### Keputusan desain:

1. **Jadwal terstruktur** - Tidak menggunakan satu string "jadwal", tapi terpisah: tanggal, jamMulai, jamSelesai
2. **Koordinat lokasi (latitude, longitude)** - Diperlukan untuk validasi GPS saat absensi
3. **Radius** - Diperlukan untuk menentukan batas maksimal jarak peserta dari lokasi untuk melakukan absensi
4. **Status enum** - Sesuai prototype (Aktif/Non-Aktif)

### Field tambahan yang diperlukan (berdasarkan requirement):

- **latitude, longitude, radius** - Tidak ada di dummyData, tapi diperlukan untuk fitur validasi lokasi/GPS yang ada di JamaahAbsensi.jsx

---

## 5. Absensi

### Field yang ditemukan di prototype:

**Dari dummyData.js (dummyAbsensi):**
- id
- jamaahId (reference to dummyJamaah)
- kajianId (reference to dummyKajian)
- tanggal (YYYY-MM-DD)
- waktu (HH:mm)
- status (Hadir)
- metode (Face Recognition)

**Dari AdminAbsensi.jsx:**
- Filter by: tanggal, kajianId
- Search by: nama jamaah, judul kajian
- Detail modal shows: lokasi, foto peserta

**Dari JamaahAbsensi.jsx:**
- Location validation simulation
- Shows: lokasi saat ini, jarak (±25 meter)
- Face recognition simulation

### Field yang diperlukan untuk database:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // Required, reference to User
  kajianId: ObjectId,     // Required, reference to Kajian
  tanggal: Date,          // Required (mengikuti tanggal kajian)
  waktu: String,          // Required (HH:mm format)
  status: String,         // Required, enum: ['hadir', 'izin', 'tidak_hadir'], default: 'hadir'
  metode: String,         // Required, enum: ['face_recognition'], default: 'face_recognition'
  lokasi: String,         // Required - deskripsi lokasi saat absensi
  latitude: Number,       // Required - koordinat GPS saat absensi
  longitude: Number,      // Required - koordinat GPS saat absensi
  distance: Number,       // Required - jarak dari lokasi kajian dalam meter
  foto: String,           // Required - path/URL foto saat absensi untuk verifikasi
  createdAt: Date         // Auto-generated (updatedAt handled by Mongoose)
}
```

### Keputusan desain:

1. **userId dan kajianId sebagai reference** - Menggunakan ObjectId untuk relasi ke User dan Kajian
2. **Status enum** - Sesuai requirement (hadir, izin, tidak_hadir)
3. **Metode enum** - Sesuai prototype (Face Recognition)
4. **Lokasi terstruktur** - Menyimpan lokasi, latitude, longitude, distance untuk audit trail dan validasi
5. **Foto absensi** - Diperlukan karena ditampilkan di detail modal AdminAbsensi.jsx
6. **Unique constraint** - Satu user tidak boleh absensi dua kali untuk kajian yang sama pada tanggal yang sama

### Index/Unique Constraint:

```javascript
// Compound unique index untuk mencegah duplikasi absensi
// Menggunakan userId + kajianId karena tanggal absensi selalu mengikuti tanggal kajian
db.absensi.createIndex({ userId: 1, kajianId: 1 }, { unique: true })
```

### Field tambahan yang diperlukan:

- **latitude, longitude, distance, foto** - Tidak lengkap di dummyData, tapi diperlukan untuk fitur validasi lokasi dan foto preview yang ada di prototype

---

## 6. Izin

### Field yang ditemukan di prototype:

**Dari dummyData.js (dummyIzin):**
- id
- jamaahId (reference to dummyJamaah)
- kajianId (reference to dummyKajian)
- tanggal
- alasan
- status (Pending/Disetujui/Ditolak)
- tanggalPengajuan

**Dari JamaahIzin.jsx:**
- kajianId (required, select from active kajian)
- tanggal (required, type="date")
- alasan (required, textarea)
- buktiFile (optional, file upload - image/*,.pdf)
- status (Pending setelah submit)

**Dari AdminIzin.jsx:**
- Approve action
- Reject action
- Status: Pending/Disetujui/Ditolak

### Field yang diperlukan untuk database:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // Required, reference to User
  kajianId: ObjectId,     // Required, reference to Kajian
  tanggal: Date,          // Required - tanggal izin
  alasan: String,         // Required
  bukti: String,          // Optional - path/URL file bukti pendukung
  status: String,         // Required, enum: ['pending', 'disetujui', 'ditolak'], default: 'pending'
  catatanAdmin: String,   // Optional - catatan saat approve/reject
  approvedBy: ObjectId,   // Optional - reference to User (admin yang approve/reject)
  approvedAt: Date,       // Optional - waktu approve/reject
  tanggalPengajuan: Date, // Required, default: Date.now()
  createdAt: Date         // Auto-generated (updatedAt handled by Mongoose)
}
```

### Keputusan desain:

1. **userId dan kajianId sebagai reference** - Menggunakan ObjectId untuk relasi
2. **Status enum** - Sesuai prototype (pending, disetujui, ditolak)
3. **Bukti optional** - Di prototype ada UI untuk upload, tapi tidak required
4. **approvedBy dan approvedAt** - Diperlukan untuk audit trail siapa yang approve/reject dan kapan
5. **catatanAdmin** - Diperlukan untuk mencatat alasan approve/reject

### Field tambahan yang diperlukan:

- **catatanAdmin, approvedBy, approvedAt** - Tidak ada di dummyData, tapi diperlukan untuk fitur approval yang ada di AdminIzin.jsx

---

## 7. Notification

### Field yang ditemukan di prototype:

**Dari dummyData.js (dummyNotifikasi):**
- id
- judul
- pesan
- tanggal
- waktu
- status (unread/read)

**Dari AdminNotifikasi.jsx:**
- judul
- pesan
- tanggal
- waktu
- status (unread/read)
- Mark as read action
- Mark all as read action
- Delete action

**Dari AdminDashboard.jsx:**
- Shows recent notifications
- Types: "Jamaah Baru Terdaftar", "Pengajuan Izin Baru", "Kehadiran Tinggi"

**Dari requirement:**
- Socket.IO untuk real-time
- Notifikasi absensi
- Notifikasi pengajuan izin

### Field yang diperlukan untuk database:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // Required - reference to User (penerima notifikasi)
  type: String,           // Required - enum: ['absensi', 'izin', 'jamaah_baru', 'statistik']
  title: String,          // Required - judul notifikasi
  message: String,        // Required - pesan notifikasi
  isRead: Boolean,        // Required, default: false
  relatedId: ObjectId,    // Optional - reference ke entity terkait (misal: absensiId, izinId)
  relatedType: String,    // Optional - enum: ['absensi', 'izin', 'user']
  createdAt: Date         // Auto-generated
}
```

### Keputusan desain:

1. **userId** - Diperlukan untuk mengirim notifikasi ke user spesifik (admin atau jamaah)
2. **type** - Diperlukan untuk kategorisasi notifikasi dan filter
3. **isRead** - Sesuai prototype (unread/read)
4. **relatedId dan relatedType** - Diperlukan untuk link ke entity terkait (misal: klik notifikasi izin → buka detail izin)
5. **Satu collection untuk semua notifikasi** - Untuk simplisitas dan query yang lebih mudah

### Field tambahan yang diperlukan:

- **userId, type, relatedId, relatedType** - Tidak lengkap di dummyData, tapi diperlukan untuk fitur real-time Socket.IO dan link ke entity terkait

### Desain untuk Socket.IO:

```
Event terjadi (misal: jamaah absen)
        ↓
Backend create Notification document
        ↓
Socket.IO emit ke room user
        ↓
Admin menerima notifikasi real-time
```

---

## 8. Relationship

### Relationship yang ditemukan dari prototype:

1. **User → Absensi**
   - Satu user bisa memiliki banyak absensi
   - Cardinality: 1:N
   - Field: userId di Absensi

2. **Kajian → Absensi**
   - Satu kajian bisa memiliki banyak absensi
   - Cardinality: 1:N
   - Field: kajianId di Absensi

3. **User → Izin**
   - Satu user bisa mengajukan banyak izin
   - Cardinality: 1:N
   - Field: userId di Izin

4. **Kajian → Izin**
   - Satu kajian bisa memiliki banyak pengajuan izin
   - Cardinality: 1:N
   - Field: kajianId di Izin

5. **User → FaceData**
   - Satu user bisa memiliki banyak FaceData (untuk registrasi ulang)
   - Cardinality: 1:N
   - Field: userId di FaceData
   - Hanya satu FaceData dengan isActive: true

6. **User → Notification**
   - Satu user bisa menerima banyak notifikasi
   - Cardinality: 1:N
   - Field: userId di Notification

7. **User → Izin (as approvedBy)**
   - Satu user (admin) bisa approve banyak izin
   - Cardinality: 1:N
   - Field: approvedBy di Izin

### Relationship Diagram:

```
User 1 ─── N Absensi
User 1 ─── N IzIN
User 1 ─── N FaceData
User 1 ─── N Notification
User 1 ─── N Izin (as approvedBy)

Kajian 1 ─── N Absensi
Kajian 1 ─── N Izin
```

### Tidak ada relationship N:N:
- Semua relationship adalah 1:N
- Tidak perlu junction table

---

## 9. Index

### Index yang diperlukan untuk performa:

**User:**
```javascript
db.user.createIndex({ email: 1 }, { unique: true })
db.user.createIndex({ role: 1 })
db.user.createIndex({ status: 1 })
```

**FaceData:**
```javascript
db.facedata.createIndex({ userId: 1 })
db.facedata.createIndex({ userId: 1, isActive: 1 })
```

**Kajian:**
```javascript
db.kajian.createIndex({ status: 1 })
db.kajian.createIndex({ tanggal: 1 })
```

**Absensi:**
```javascript
db.absensi.createIndex({ userId: 1 })
db.absensi.createIndex({ kajianId: 1 })
db.absensi.createIndex({ tanggal: 1 })
db.absensi.createIndex({ userId: 1, kajianId: 1, tanggal: 1 }, { unique: true }) // Compound unique
```

**Izin:**
```javascript
db.izin.createIndex({ userId: 1 })
db.izin.createIndex({ kajianId: 1 })
db.izin.createIndex({ status: 1 })
db.izin.createIndex({ tanggal: 1 })
```

**Notification:**
```javascript
db.notification.createIndex({ userId: 1 })
db.notification.createIndex({ isRead: 1 })
db.notification.createIndex({ userId: 1, isRead: 1 })
db.notification.createIndex({ createdAt: -1 })
```

---

## 10. Validasi dan Constraint

### Validasi di database level (Mongoose):

**User:**
- email: required, unique, valid email format
- password: required, min 6 characters
- nama: required
- telepon: required
- alamat: required
- role: enum ['admin', 'jamaah']
- status: enum ['aktif', 'nonaktif']

**FaceData:**
- userId: required, reference to User
- descriptor: required, array of numbers
- foto: required
- isActive: boolean, default true

**Kajian:**
- judul: required
- pemateri: required
- tanggal: required
- jamMulai: required
- jamSelesai: required
- lokasi: required
- latitude: required, number
- longitude: required, number
- radius: required, number, default 50
- status: enum ['aktif', 'nonaktif']
- jamSelesai > jamMulai (custom validation)

**Absensi:**
- userId: required, reference to User
- kajianId: required, reference to Kajian
- tanggal: required
- waktu: required
- status: enum ['hadir', 'izin', 'tidak_hadir']
- metode: enum ['face_recognition']
- lokasi: required
- latitude: required
- longitude: required
- distance: required
- foto: required
- Unique: userId + kajianId + tanggal

**Izin:**
- userId: required, reference to User
- kajianId: required, reference to Kajian
- tanggal: required
- alasan: required
- status: enum ['pending', 'disetujui', 'ditolak']
- approvedBy: optional, reference to User (must be admin)
- approvedAt: optional

**Notification:**
- userId: required, reference to User
- type: enum ['absensi', 'izin', 'jamaah_baru', 'statistik']
- title: required
- message: required
- isRead: boolean, default false

---

## 11. Data yang masih perlu dikonfirmasi

### Perlu validasi dengan user/stakeholder:

1. **Radius default untuk validasi lokasi** - Di prototype simulasi menggunakan ±25 meter, apakah ini nilai default yang tepat?
2. **Maksimal file size untuk bukti izin** - Prototype menyebut "Maks 5MB", apakah ini final?
3. **Format file yang diterima untuk bukti izin** - Prototype: JPG, PNG, PDF, apakah ada format lain?
4. **Apakah notifikasi perlu dihapus otomatis setelah periode tertentu?** - Untuk mengontrol ukuran collection
5. **Apakah ada batas maksimal FaceData per user?** - Untuk mencegah abuse
6. **Apakah perlu audit log untuk admin actions?** - Delete jamaah, approve/reject izin, dll
7. **Apakah perlu collection RefreshToken untuk JWT refresh token?** - Untuk security

### Data yang TIDAK ditemukan di prototype tapi mungkin diperlukan:

1. **RefreshToken collection** - Tidak diperlukan untuk ERD ini. Bisa diimplementasikan dengan Redis untuk performa.
2. **AuditLog collection** - Tidak diperlukan untuk ERD ini. Opsional untuk fase selanjutnya.
3. **Location collection** - Tidak diperlukan. Lokasi embedded di Kajian dengan latitude, longitude, radius.

---

## 12. Keputusan Desain

### Keputusan utama:

1. **Satu User collection untuk admin dan jamaah** - Struktur data sama, dibedakan oleh role
2. **FaceData sebagai collection terpisah** - Untuk support registrasi ulang dan multiple face data
3. **Jadwal Kajian terstruktur** - Tidak menggunakan string, tapi tanggal, jamMulai, jamSelesai terpisah
4. **Koordinat lokasi di Kajian dan Absensi** - Diperlukan untuk validasi GPS
5. **Unique constraint untuk Absensi** - Mencegah duplikasi absensi
6. **Notification dengan relatedId/relatedType** - Untuk link ke entity terkait dan Socket.IO
7. **Bukti file di Izin** - Optional, sesuai prototype
8. **approvedBy dan approvedAt di Izin** - Untuk audit trail approval

### Alasan tidak menambah collection lain:

- **RefreshToken** - Bukan entity database, mekanisme authentication yang bisa di Redis
- **AuditLog** - Tidak ada requirement di prototype, opsional untuk fase selanjutnya
- **Location** - Lokasi embedded di Kajian dengan latitude, longitude, radius
- **Role, Status** - Atribut enum di User, bukan entity terpisah
- **Socket** - Mekanisme komunikasi realtime (Socket.IO), bukan entity database
- **FaceRecognition** - Fitur yang menggunakan FaceData, bukan entity terpisah
- **GoogleMaps** - External service untuk location picker, bukan entity database

### Teknologi yang digunakan:

- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT + bcrypt
- **Face Recognition**: face-api.js (descriptor sebagai array of numbers)
- **Real-time**: Socket.IO
- **File Upload**: Multer

### Desain siap untuk implementasi:

ERD ini sudah siap untuk diimplementasikan dengan Mongoose schema. Semua field sudah dianalisis berdasarkan prototype dan requirement sistem.
