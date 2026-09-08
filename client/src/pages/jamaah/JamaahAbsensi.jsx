import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { kajianApi } from '../../api/kajianApi';
import { absensiApi } from '../../api/absensiApi';
import { Camera, CheckCircle, Clock, AlertCircle, Calendar, MapPin, X, User, Clock as Schedule, MapPin as LocationIcon, ChevronLeft } from 'lucide-react';
import useNotification from '../../hooks/useNotification';

const JamaahAbsensi = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const [attendanceStep, setAttendanceStep] = useState('idle'); // idle, location, detecting, detected, confirmed, success
  const [selectedKajian, setSelectedKajian] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [detectionMessage, setDetectionMessage] = useState('');
  const [faceBox, setFaceBox] = useState(null);
  const [locationValid, setLocationValid] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kajianList, setKajianList] = useState([]);
  const [attendedKajianIds, setAttendedKajianIds] = useState([]);
  const streamRef = useRef(null);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
  const [faceModelsError, setFaceModelsError] = useState('');

  const stopStream = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [])

  useEffect(() => {
    fetchActiveKajian();

    return () => {
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models_face'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models_face'),
        ]);
        setFaceModelsLoaded(true);
      } catch (err) {
        console.error('Failed loading face-api models:', err);
        setFaceModelsError('Gagal memuat model face detection.');
      }
    };

    loadModels();
  }, []);

  const fetchActiveKajian = async () => {
    try {
      setLoading(true);
      const response = await kajianApi.getAllKajian({ status: 'aktif' });
      setKajianList(response.data.data.kajian);

      if (user?._id) {
        const attendanceResponse = await absensiApi.getAbsensiByUser(user._id);
        const attendedIds = (attendanceResponse.data.data || [])
          .map((absensi) => absensi.kajianId?._id || absensi.kajianId)
          .filter(Boolean)
          .map((kajianId) => String(kajianId));
        setAttendedKajianIds([...new Set(attendedIds)]);
      }
    } catch (err) {
      console.error('Error fetching kajian:', err);
      showError('Gagal memuat data kajian');
    } finally {
      setLoading(false);
    }
  };

  const getKajianStatus = (kajian) => {
    const now = new Date();

    const tanggal = String(kajian.tanggal).slice(0, 10);

    const kajianMulai = new Date(`${tanggal}T${kajian.jamMulai}`);
    const kajianSelesai = new Date(`${tanggal}T${kajian.jamSelesai}`);

    if (now < kajianMulai) {
      return 'akan_datang';
    }

    if (now <= kajianSelesai) {
      return 'sedang_berlangsung';
    }

    return 'selesai';
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  };

  const validateLocation = async (kajian) => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationValid(false);
        showError('Browser tidak mendukung geolocation');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            kajian.latitude,
            kajian.longitude
          );

          setLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            distance: distance
          });

          const isWithinRadius = distance <= kajian.radius;
          setLocationValid(isWithinRadius);
          if (!isWithinRadius) {
            showError(`Lokasi Anda berada di luar radius kajian. Jarak Anda sekitar ${Math.round(distance)} meter, sedangkan radius yang diizinkan adalah ${kajian.radius} meter.`);
          }
          resolve(isWithinRadius);
        },
        (err) => {
          setLocationValid(false);
          showError('Tidak dapat mengakses lokasi. Pastikan izin lokasi diberikan.');
          resolve(false);
        }
      );
    });
  };

  ;

  const capturePhotoFromVideo = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      console.debug('[DEBUG] capturePhotoFromVideo: video not ready', video?.readyState);
      return null;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    console.debug('[DEBUG] video.readyState', video.readyState, 'width', width, 'height', height);

    if (!width || !height) {
      console.error('[DEBUG] capturePhotoFromVideo: invalid video dimensions', width, height);
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    const imageDataUrl = canvas.toDataURL('image/jpeg');

    if (typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image/jpeg;base64,')) {
      console.debug('[DEBUG] capturedPhoto length', imageDataUrl.length);
      return imageDataUrl;
    }

    console.error('[DEBUG] capturePhotoFromVideo: invalid captured photo format');
    return null;
  };

  const handleStartAttendance = async (kajian) => {
    const kajianStatus = getKajianStatus(kajian);
    const kajianId = String(kajian._id);

    if (attendedKajianIds.includes(kajianId)) {
      showError('Anda sudah melakukan absensi untuk kajian ini.');
      return;
    }

    if (kajianStatus !== 'sedang_berlangsung') {
      showError(
        kajianStatus === 'akan_datang'
          ? 'Absensi belum dapat dilakukan karena kajian belum dimulai.'
          : 'Absensi sudah ditutup karena kajian telah selesai.'
      );
      return;
    }

    try {
      setSelectedKajian(kajian);
      setAttendanceStep('location');

      const isValid = await validateLocation(kajian);

      if (isValid) {
        if (!faceModelsLoaded) {
          showError(faceModelsError || 'Model face detection belum siap. Silakan muat ulang halaman.');
          setAttendanceStep('idle');
          return;
        }

        setAttendanceStep('detecting');
        setDetectionMessage('Mendeteksi wajah...');

        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 },
          });

          streamRef.current = mediaStream;

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            await videoRef.current.play();
          }

          // Mencegah proses deteksi berjalan bersamaan
          let detectionInProgress = false;
          let faceDetectedAt = null;

          detectionIntervalRef.current = window.setInterval(async () => {
            // Jangan menjalankan deteksi baru kalau deteksi sebelumnya masih berjalan
            if (detectionInProgress) return;

            detectionInProgress = true;

            try {
              const video = videoRef.current;

              if (!video || video.readyState < 2) {
                setDetectionMessage('Mempersiapkan kamera...');
                detectionInProgress = false;
                return;
              }

              const width = video.videoWidth;
              const height = video.videoHeight;

              if (!width || !height) {
                setDetectionMessage('Tunggu hingga kamera siap...');
                detectionInProgress = false;
                return;
              }

              const detectionOptions =
                new faceapi.TinyFaceDetectorOptions({
                  inputSize: 416,
                  scoreThreshold: 0.3
                });

              const results = await faceapi
                .detectAllFaces(video, detectionOptions)
                .withFaceLandmarks();

              console.debug(
                '[DEBUG] Jumlah wajah:',
                results.length
              );

              const canvas = canvasRef.current;

              // ==============================
              // GAMBAR OVERLAY CUSTOM
              // ==============================

              if (canvas) {
                const displaySize = {
                  width: video.videoWidth,
                  height: video.videoHeight
                };

                faceapi.matchDimensions(canvas, displaySize);

                const resizedResults = faceapi.resizeResults(
                  results,
                  displaySize
                );

                const ctx = canvas.getContext('2d');

                ctx.clearRect(
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );

                // Custom drawing untuk setiap wajah terdeteksi
                resizedResults.forEach((result) => {
                  const box = result.detection.box;
                  const landmarks = result.landmarks;

                  // ==============================
                  // GAMBAR CORNER BRACKET HIJAU
                  // ==============================
                  const cornerSize = 30;
                  const cornerThickness = 3;
                  const greenColor = '#22c55e'; // green-500

                  ctx.strokeStyle = greenColor;
                  ctx.lineWidth = cornerThickness;
                  ctx.lineCap = 'round';

                  // Top-left corner
                  ctx.beginPath();
                  ctx.moveTo(box.x, box.y + cornerSize);
                  ctx.lineTo(box.x, box.y);
                  ctx.lineTo(box.x + cornerSize, box.y);
                  ctx.stroke();

                  // Top-right corner
                  ctx.beginPath();
                  ctx.moveTo(box.x + box.width - cornerSize, box.y);
                  ctx.lineTo(box.x + box.width, box.y);
                  ctx.lineTo(box.x + box.width, box.y + cornerSize);
                  ctx.stroke();

                  // Bottom-left corner
                  ctx.beginPath();
                  ctx.moveTo(box.x, box.y + box.height - cornerSize);
                  ctx.lineTo(box.x, box.y + box.height);
                  ctx.lineTo(box.x + cornerSize, box.y + box.height);
                  ctx.stroke();

                  // Bottom-right corner
                  ctx.beginPath();
                  ctx.moveTo(box.x + box.width - cornerSize, box.y + box.height);
                  ctx.lineTo(box.x + box.width, box.y + box.height);
                  ctx.lineTo(box.x + box.width, box.y + box.height - cornerSize);
                  ctx.stroke();

                  // ==============================
                  // GAMBAR KONTUR WAJAH (JAW OUTLINE)
                  // ==============================
                  if (landmarks) {
                    const jawOutline = landmarks.getJawOutline();
                    if (jawOutline && jawOutline.length > 0) {
                      ctx.strokeStyle = greenColor;
                      ctx.lineWidth = 2;
                      ctx.beginPath();
                      ctx.moveTo(jawOutline[0].x, jawOutline[0].y);
                      for (let i = 1; i < jawOutline.length; i++) {
                        ctx.lineTo(jawOutline[i].x, jawOutline[i].y);
                      }
                      ctx.stroke();
                    }

                    // ==============================
                    // GAMBAR LANDMARK PUTIH
                    // ==============================
                    const allLandmarks = landmarks.positions;
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;

                    allLandmarks.forEach((point) => {
                      ctx.beginPath();
                      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                      ctx.fill();
                    });
                  }
                });
              }

              // ==============================
              // TIDAK ADA WAJAH
              // ==============================

              if (!results || results.length === 0) {
                setFaceBox(null);
                faceDetectedAt = null;

                setDetectionMessage(
                  'Mendeteksi wajah... Arahkan wajah ke kamera'
                );

                detectionInProgress = false;
                return;
              }

              // ==============================
              // LEBIH DARI SATU WAJAH
              // ==============================

              if (results.length > 1) {
                setFaceBox(null);
                faceDetectedAt = null;

                setDetectionMessage(
                  'Pastikan hanya satu wajah berada di depan kamera'
                );

                detectionInProgress = false;
                return;
              }

              // ==============================
              // TEPAT SATU WAJAH
              // ==============================

              const face = results[0];

              const score = face.detection.score;
              const box = face.detection.box;

              console.debug(
                '[DEBUG] Face score:',
                score
              );

              console.debug(
                '[DEBUG] Face box:',
                box
              );

              // Simpan posisi wajah
              setFaceBox({
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height
              });

              // ==============================
              // WAJAH BARU TERDETEKSI
              // ==============================

              if (!faceDetectedAt) {
                faceDetectedAt = Date.now();

                setDetectionMessage(
                  'Wajah terdeteksi. Pertahankan posisi...'
                );

                console.debug(
                  '[DEBUG] Wajah pertama kali terdeteksi'
                );

                detectionInProgress = false;
                return;
              }

              // ==============================
              // HITUNG WAKTU WAJAH TERDETEKSI
              // ==============================

              const elapsedTime =
                Date.now() - faceDetectedAt;

              const requiredTime = 5000; // 5 detik

              const remainingTime =
                Math.ceil(
                  (requiredTime - elapsedTime) / 1000
                );

              if (elapsedTime < requiredTime) {

                setDetectionMessage(
                  `Wajah terdeteksi. Pertahankan posisi ${remainingTime} detik...`
                );

                console.debug(
                  '[DEBUG] Menunggu:',
                  remainingTime,
                  'detik'
                );

                detectionInProgress = false;
                return;
              }

              // ==============================
              // SUDAH 5 DETIK
              // SEKARANG AMBIL FOTO
              // ==============================

              console.debug(
                '[DEBUG] Waktu deteksi terpenuhi, mengambil foto...'
              );

              const photo = capturePhotoFromVideo();

              if (!photo) {
                console.error(
                  '[DEBUG] Gagal mengambil foto'
                );

                showError('Gagal menangkap foto dari kamera. Coba lagi.');

                stopStream();
                setAttendanceStep('idle');

                detectionInProgress = false;
                return;
              }

              // Simpan foto
              setCapturedPhoto(photo);

              setDetectionMessage(
                'Wajah berhasil dideteksi. Silakan konfirmasi absensi.'
              );

              console.debug(
                '[DEBUG] Foto berhasil diambil'
              );

              // Hentikan kamera setelah foto berhasil
              stopStream();

              // Pindah ke halaman konfirmasi
              setAttendanceStep('recognized');

            } catch (err) {

              console.error(
                '[DEBUG] Face detection error:',
                err
              );

              showError('Terjadi kesalahan saat mendeteksi wajah.');

            } finally {

              detectionInProgress = false;
            }

          }, 500);
        } catch (err) {
          console.error('Camera error:', err);
          showError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
          setAttendanceStep('idle');
        }
      } else {
        setAttendanceStep('idle');
      }
    } catch (err) {
      console.error('Error starting attendance:', err);
      showError('Gagal memulai absensi');
      setAttendanceStep('idle');
    }
  };

  const handleConfirmAttendance = async () => {
    try {
      if (!selectedKajian) {
        showError('Kajian tidak ditemukan. Silakan coba lagi.');
        return;
      }

      const kajianId = String(selectedKajian._id);
      if (attendedKajianIds.includes(kajianId)) {
        stopStream();
        setAttendanceStep('idle');
        showError('Anda sudah melakukan absensi untuk kajian ini.');
        return;
      }

      const kajianStatus = getKajianStatus(selectedKajian);
      if (kajianStatus !== 'sedang_berlangsung') {
        stopStream();
        setAttendanceStep('idle');
        showError(
          kajianStatus === 'akan_datang'
            ? 'Absensi belum dapat dilakukan karena kajian belum dimulai.'
            : 'Absensi sudah ditutup karena kajian telah selesai.'
        );
        return;
      }

      if (!capturedPhoto) {
        showError('Foto absensi belum tersedia. Silakan coba lagi.');
        return;
      }

      setAttendanceStep('confirmed');

      const now = new Date();
      const absensiData = {
        kajianId: selectedKajian._id,
        tanggal: now.toISOString().split('T')[0],
        waktu: now.toTimeString().split(' ')[0].substring(0, 5),
        status: 'hadir',
        metode: 'face_recognition',
        lokasi: selectedKajian.lokasi,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        distance: locationData.distance,
        foto: capturedPhoto
      };

      await absensiApi.createAbsensi(absensiData);
      setAttendedKajianIds((currentIds) => (
        currentIds.includes(kajianId) ? currentIds : [...currentIds, kajianId]
      ));
      showSuccess('Absensi berhasil dicatat');
      setAttendanceStep('success');
    } catch (err) {
      console.error('Error confirming attendance:', err);
      showError(err.response?.data?.message || 'Gagal mencatat absensi');
      setAttendanceStep('recognized');
    }
  };

  const handleReset = () => {
    stopStream();

    setAttendanceStep('idle');
    setSelectedKajian(null);
    setCapturedPhoto(null);
    setLocationValid(false);
    setLocationData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-7 sm:mb-9">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Kehadiran Anda</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Absensi Kajian</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Verifikasi lokasi dan wajah untuk mencatat kehadiran Anda.</p>
        </div>

        {attendanceStep === 'idle' && (
          <>
            {loading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl bg-white px-6 py-12 shadow-sm ring-1 ring-slate-200/80">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600"></div>
                <p className="text-sm font-medium text-slate-500">Memuat data kajian...</p>
              </div>
            ) : (
              <>
                {kajianList.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {kajianList.map((kajian) => {
                      const kajianStatus = getKajianStatus(kajian);
                      const hasAttended = attendedKajianIds.includes(String(kajian._id));
                      const canStartAttendance = kajianStatus === 'sedang_berlangsung' && !hasAttended;

                      return (
                        <Card
                          key={kajian._id}
                          className="!rounded-3xl !border-slate-200/80 !bg-white !p-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
                        >
                          <div className="p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                              <Badge
                                variant={
                                  kajianStatus === 'sedang_berlangsung'
                                    ? 'success'
                                    : kajianStatus === 'akan_datang'
                                      ? 'warning'
                                      : 'secondary'
                                }
                                className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                              >
                                {kajianStatus === 'sedang_berlangsung'
                                  ? 'Sedang Berlangsung'
                                  : kajianStatus === 'akan_datang'
                                    ? 'Akan Datang'
                                    : 'Selesai'}
                              </Badge>

                              <div
                                className={`w-2 h-2 rounded-full ${kajianStatus === 'sedang_berlangsung'
                                  ? 'bg-green-500 animate-pulse'
                                  : kajianStatus === 'akan_datang'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-400'
                                  }`}
                              ></div>
                            </div>

                            <h3 className="mb-2 text-lg font-bold leading-snug text-slate-950">
                              {kajian.judul}
                            </h3>

                            <p className="mb-5 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                              {kajian.deskripsi || 'Tidak ada deskripsi'}
                            </p>

                            <div className="mb-6 grid grid-cols-2 gap-x-3 gap-y-4">
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Calendar size={16} className="text-gray-500" />
                                </div>

                                <div>
                                  <p className="text-xs text-gray-400">Tanggal</p>
                                  <p className="font-medium text-gray-700">
                                    {new Date(kajian.tanggal).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <User size={16} className="text-gray-500" />
                                </div>

                                <div>
                                  <p className="text-xs text-gray-400">Pemateri</p>
                                  <p className="font-medium text-gray-700">
                                    {kajian.pemateri}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Schedule size={16} className="text-gray-500" />
                                </div>

                                <div>
                                  <p className="text-xs text-gray-400">Jadwal</p>
                                  <p className="font-medium text-gray-700">
                                    {kajian.jamMulai} - {kajian.jamSelesai}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <LocationIcon size={16} className="text-gray-500" />
                                </div>

                                <div>
                                  <p className="text-xs text-gray-400">Lokasi</p>
                                  <p className="font-medium text-gray-700">
                                    {kajian.lokasi}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => canStartAttendance && handleStartAttendance(kajian)}
                              disabled={!canStartAttendance}
                              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg ${canStartAttendance
                                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-primary-500/25'
                                : 'bg-gray-300 text-gray-600 opacity-50 cursor-not-allowed shadow-none'
                                }`}
                            >
                              <Camera size={20} />
                              {hasAttended
                                ? 'Sudah Absen'
                                : kajianStatus === 'akan_datang'
                                  ? 'Belum Dimulai'
                                  : kajianStatus === 'selesai'
                                    ? 'Absensi Ditutup'
                                    : 'Mulai Absensi'}
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="!rounded-3xl !border-slate-200/80 !bg-white text-center !shadow-sm">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                        <Calendar className="text-primary-400" size={30} />
                      </div>
                      <p className="font-semibold text-slate-600">Tidak ada kajian yang sedang berlangsung</p>
                      <p className="mt-1 text-sm text-slate-400">Silakan cek kembali nanti</p>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {(attendanceStep === 'location' || attendanceStep === 'detecting' || attendanceStep === 'recognized' || attendanceStep === 'confirmed' || attendanceStep === 'success') && (
          <div className="mx-auto w-full max-w-2xl">
            <Card className="!rounded-3xl !border-slate-200/80 !bg-white !p-0 shadow-sm sm:shadow-md">
              {/* Header */}
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <button
                  onClick={handleReset}
                  className="mb-4 flex min-h-10 items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                >
                  <ChevronLeft size={20} />
                  <span className="text-sm font-medium">Kembali</span>
                </button>
                <h2 className="text-xl font-bold leading-tight text-slate-950 sm:text-2xl">{selectedKajian?.judul}</h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">{selectedKajian?.jamMulai} - {selectedKajian?.jamSelesai} <span className="mx-1 text-slate-300">|</span> {selectedKajian?.lokasi}</p>
              </div>

              {/* Location Validation Step */}
              {attendanceStep === 'location' && (
                <div className="px-5 py-14 sm:px-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 animate-ping rounded-full bg-primary-100 opacity-50"></div>
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary-600 shadow-lg shadow-primary-600/20">
                        <MapPin className="text-white" size={38} />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-950">Verifikasi Lokasi</h3>
                    <p className="mb-4 text-center text-sm text-slate-500">Memeriksa lokasi Anda...</p>
                    <div className="rounded-2xl bg-slate-50 px-5 py-3 text-center text-sm leading-6 text-slate-500 ring-1 ring-slate-100">
                      <p>Pastikan GPS aktif dan Anda berada di area kajian.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Valid Result - Compact */}
              {attendanceStep === 'detecting' && locationValid && (
                <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-3 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle className="text-emerald-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-800">Lokasi Terverifikasi</p>
                      <p className="text-xs text-emerald-600">Jarak: ±{locationData?.distance?.toFixed(0)} meter</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera / Face Detection */}
              {attendanceStep === 'detecting' && (
                <div className="px-4 py-5 sm:px-6 sm:py-6">
                  <div className="mb-4">
                    <h3 className="text-center text-lg font-bold text-slate-950">Verifikasi Wajah</h3>
                    <p className="text-center text-sm text-slate-500">Posisikan wajah Anda di dalam area</p>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-950 shadow-xl ring-1 ring-slate-900/10">
                    {/* Kamera */}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />

                    {/* Label Wajah Terdeteksi */}
                    {faceBox && (
                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-emerald-500/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                        <CheckCircle size={14} />
                        Wajah Terdeteksi
                      </div>
                    )}

                    {/* Status overlay di bawah */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent px-4 pb-5 pt-14">
                      <div className="text-center">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
                          {detectionMessage || 'Mendeteksi wajah...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recognized / Confirmation */}
              {attendanceStep === 'recognized' && (
                <div className="px-5 py-9 sm:px-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 shadow-lg shadow-primary-600/20">
                      <CheckCircle className="text-white" size={40} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-950">Foto Berhasil Diambil</h3>
                    <p className="text-sm text-slate-500">Foto wajah siap diverifikasi</p>
                  </div>

                  {capturedPhoto && (
                    <div className="mb-6">
                      <img
                        src={capturedPhoto}
                        alt="Captured face"
                        className="mx-auto w-full max-w-xs rounded-3xl border border-slate-200 shadow-lg"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleConfirmAttendance}
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-4 font-bold text-white shadow-lg shadow-primary-600/20 transition-all duration-300 hover:bg-primary-700"
                  >
                    <CheckCircle size={20} />
                    Konfirmasi Absensi
                  </button>
                </div>
              )}

              {/* Confirmed / Processing */}
              {attendanceStep === 'confirmed' && (
                <div className="px-5 py-14 sm:px-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 animate-ping rounded-full bg-primary-100 opacity-50"></div>
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 shadow-lg shadow-primary-600/20">
                        <Clock className="text-white animate-spin" size={32} />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-950">Memproses Absensi</h3>
                    <p className="text-center text-sm leading-6 text-slate-500">Sedang memverifikasi wajah dan mencatat kehadiran Anda</p>
                  </div>
                </div>
              )}

              {/* Success */}
              {attendanceStep === 'success' && (
                <div className="px-5 py-9 sm:px-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-600 shadow-xl shadow-primary-600/20">
                      <CheckCircle className="text-white" size={48} />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-slate-950">Absensi Berhasil!</h3>
                    <p className="text-sm text-slate-500">Absensi Anda telah berhasil dicatat</p>
                  </div>

                  <div className="mb-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Kajian</p>
                        <p className="text-base font-bold text-slate-900">{selectedKajian?.judul}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Waktu</p>
                        <p className="text-base font-bold text-slate-900">{new Date().toLocaleTimeString('id-ID')}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-4 font-bold text-white shadow-lg shadow-primary-600/20 transition-all duration-300 hover:bg-primary-700"
                  >
                    <Camera size={20} />
                    Absen Lagi
                  </button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default JamaahAbsensi;
