import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import useNotification from '../../hooks/useNotification';
import { faceApi } from '../../api/faceApi';
import {
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import * as faceapi from 'face-api.js';

const JamaahRegistrasiWajah = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraContainerRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState('idle');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);

  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
  const [faceModelsError, setFaceModelsError] = useState('');

  // Status wajah
  const [faceStatus, setFaceStatus] = useState('Mencari wajah...');
  const [faceBox, setFaceBox] = useState(null);

  // ==========================================
  // HELPER: GET VIDEO RENDER METRICS
  // ==========================================

  const getVideoRenderMetrics = () => {
    const video = videoRef.current;
    const container = cameraContainerRef.current;

    if (!video || !container) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const intrinsicWidth = video.videoWidth;
    const intrinsicHeight = video.videoHeight;

    if (!intrinsicWidth || !intrinsicHeight) {
      return null;
    }

    const videoAspectRatio = intrinsicWidth / intrinsicHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let renderedWidth;
    let renderedHeight;

    // Calculate rendered dimensions based on object-contain behavior
    if (videoAspectRatio > containerAspectRatio) {
      // Video is wider than container - fit to width
      renderedWidth = containerWidth;
      renderedHeight = containerWidth / videoAspectRatio;
    } else {
      // Video is taller than container - fit to height
      renderedHeight = containerHeight;
      renderedWidth = containerHeight * videoAspectRatio;
    }

    // Calculate offset to center video in container
    const offsetX = (containerWidth - renderedWidth) / 2;
    const offsetY = (containerHeight - renderedHeight) / 2;

    // Use single scale factor to maintain aspect ratio
    const scale = renderedWidth / intrinsicWidth;

    return {
      renderedWidth,
      renderedHeight,
      offsetX,
      offsetY,
      scaleX: scale,
      scaleY: scale,
    };
  };

  // ==========================================
  // LOAD FACE-API MODELS
  // ==========================================

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models_face'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models_face'),
        ]);

        setFaceModelsLoaded(true);
        console.log('✅ Face detection models loaded');
      } catch (err) {
        console.error('Failed loading face-api models:', err);
        setFaceModelsError('Gagal memuat model face detection.');
      }
    };

    loadModels();
  }, []);


  // ==========================================
  // CEK STATUS REGISTRASI WAJAH
  // ==========================================

  useEffect(() => {
    const checkFaceRegistration = async () => {
      try {
        if (!user?._id) return;

        const response = await faceApi.getFaceDataByUserId(user._id);
        console.log('Data wajah user:', response.data);

        if (response.data?.data) {
          setRegistrationStatus('registered');
        }
      } catch (err) {
        console.error('Gagal mengecek status wajah:', err);
      }
    };

    checkFaceRegistration();
  }, [user?._id]);

  // ==========================================
  // CLEANUP CAMERA
  // ==========================================

  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleStartCapture = async () => {
    try {
      setError('');

      if (!faceModelsLoaded) {
        showError(faceModelsError || 'Model face detection belum siap. Silakan tunggu atau muat ulang halaman.');
        return;
      }

      setIsCapturing(true);
      setRegistrationStatus('capturing');
      setFaceStatus('Mencari wajah...');
      setFaceBox(null);

      const mediaStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: {
              ideal: 640,
            },
            height: {
              ideal: 480,
            },
          },
          audio: false,
        });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        await videoRef.current.play();
      }

      // Tunggu video siap
      await new Promise(resolve => {
        const video = videoRef.current;

        if (!video) {
          resolve();
          return;
        }

        if (video.readyState >= 2) {
          resolve();
          return;
        }

        video.onloadedmetadata = () => {
          resolve();
        };
      });

      // Face detection loop

      let detectionInProgress = false;
      let faceDetectedAt = null;

      detectionIntervalRef.current = window.setInterval(
        async () => {
          if (detectionInProgress) {
            return;
          }

          detectionInProgress = true;

          try {
            const video = videoRef.current;

            if (
              !video ||
              video.readyState < 2 ||
              !video.videoWidth ||
              !video.videoHeight
            ) {
              setFaceStatus('Mempersiapkan kamera...');
              detectionInProgress = false;
              return;
            }

            // Face detection

            const detectionOptions =
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 416,
                scoreThreshold: 0.3,
              });

            const results = await faceapi
              .detectAllFaces(
                video,
                detectionOptions
              )
              .withFaceLandmarks();
            // Draw custom overlay

            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const container = cameraContainerRef.current;

              if (!container) {
                detectionInProgress = false;
                return;
              }

              // Get video render metrics for accurate coordinate mapping
              const metrics = getVideoRenderMetrics();

              if (!metrics) {
                detectionInProgress = false;
                return;
              }

              const { offsetX, offsetY, scaleX, scaleY } = metrics;

              // Set canvas size to match container
              const containerRect = container.getBoundingClientRect();
              canvas.width = containerRect.width;
              canvas.height = containerRect.height;

              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              // Custom drawing untuk setiap wajah terdeteksi
              results.forEach((result) => {
                const box = result.detection.box;
                const landmarks = result.landmarks;

                // Transform bounding box coordinates to rendered video space
                const renderedBox = {
                  x: box.x * scaleX + offsetX,
                  y: box.y * scaleY + offsetY,
                  width: box.width * scaleX,
                  height: box.height * scaleY,
                };

                // Draw corner brackets
                const cornerSize = 30;
                const cornerThickness = 3;
                const greenColor = '#22c55e'; // green-500

                ctx.strokeStyle = greenColor;
                ctx.lineWidth = cornerThickness;
                ctx.lineCap = 'round';

                // Top-left corner
                ctx.beginPath();
                ctx.moveTo(renderedBox.x, renderedBox.y + cornerSize);
                ctx.lineTo(renderedBox.x, renderedBox.y);
                ctx.lineTo(renderedBox.x + cornerSize, renderedBox.y);
                ctx.stroke();

                // Top-right corner
                ctx.beginPath();
                ctx.moveTo(renderedBox.x + renderedBox.width - cornerSize, renderedBox.y);
                ctx.lineTo(renderedBox.x + renderedBox.width, renderedBox.y);
                ctx.lineTo(renderedBox.x + renderedBox.width, renderedBox.y + cornerSize);
                ctx.stroke();

                // Bottom-left corner
                ctx.beginPath();
                ctx.moveTo(renderedBox.x, renderedBox.y + renderedBox.height - cornerSize);
                ctx.lineTo(renderedBox.x, renderedBox.y + renderedBox.height);
                ctx.lineTo(renderedBox.x + cornerSize, renderedBox.y + renderedBox.height);
                ctx.stroke();

                // Bottom-right corner
                ctx.beginPath();
                ctx.moveTo(renderedBox.x + renderedBox.width - cornerSize, renderedBox.y + renderedBox.height);
                ctx.lineTo(renderedBox.x + renderedBox.width, renderedBox.y + renderedBox.height);
                ctx.lineTo(renderedBox.x + renderedBox.width, renderedBox.y + renderedBox.height - cornerSize);
                ctx.stroke();

                // Draw jaw outline
                if (landmarks) {
                  const jawOutline = landmarks.getJawOutline();
                  if (jawOutline && jawOutline.length > 0) {
                    ctx.strokeStyle = greenColor;
                    ctx.lineWidth = 2;
                    ctx.beginPath();

                    // Transform first point
                    const firstPoint = jawOutline[0];
                    ctx.moveTo(
                      firstPoint.x * scaleX + offsetX,
                      firstPoint.y * scaleY + offsetY
                    );

                    // Transform and draw remaining points
                    for (let i = 1; i < jawOutline.length; i++) {
                      const point = jawOutline[i];
                      ctx.lineTo(
                        point.x * scaleX + offsetX,
                        point.y * scaleY + offsetY
                      );
                    }
                    ctx.stroke();
                  }

                  // Draw landmark points
                  const allLandmarks = landmarks.positions;
                  ctx.fillStyle = '#ffffff';
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = 1;

                  allLandmarks.forEach((point) => {
                    ctx.beginPath();
                    ctx.arc(
                      point.x * scaleX + offsetX,
                      point.y * scaleY + offsetY,
                      2,
                      0,
                      2 * Math.PI
                    );
                    ctx.fill();
                  });
                }
              });
            }

            console.log('🔍 Jumlah wajah:', results.length);

            // No face detected

            if (results.length === 0) {
              setFaceStatus('Mendeteksi wajah... Arahkan wajah ke kamera');

              setFaceBox(null);
              faceDetectedAt = null;

              detectionInProgress = false;
              return;
            }

            // Multiple faces detected

            if (results.length > 1) {
              setFaceStatus('Pastikan hanya satu wajah berada di depan kamera');

              setFaceBox(null);
              faceDetectedAt = null;

              detectionInProgress = false;
              return;
            }

            // Single face detected

            const face = results[0];

            const box = face.detection.box;
            const score = face.detection.score;

            setFaceBox({
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              score: score,
            });

            console.log('✅ Wajah terdeteksi. Score:', score);

            // Face newly detected

            if (!faceDetectedAt) {
              faceDetectedAt = Date.now();

              setFaceStatus('Wajah terdeteksi. Pertahankan posisi...');

              detectionInProgress = false;
              return;
            }

            // Calculate detection duration

            const elapsedTime = Date.now() - faceDetectedAt;

            const requiredTime = 5000;

            const remainingTime = Math.max(
              0,
              Math.ceil(
                (requiredTime - elapsedTime) / 1000
              )
            );

            if (elapsedTime < requiredTime) {
              setFaceStatus(`Wajah terdeteksi. Pertahankan posisi ${remainingTime} detik...`);

              detectionInProgress = false;
              return;
            }

            // 5 seconds elapsed - capture photo

            console.log('📸 Waktu deteksi terpenuhi, mengambil foto...');

            // Hentikan interval terlebih dahulu
            if (detectionIntervalRef.current) {
              clearInterval(detectionIntervalRef.current);
              detectionIntervalRef.current = null;
            }

            const photo = capturePhotoFromVideo();

            if (!photo) {
              showError('Gagal mengambil foto dari kamera. Coba lagi.');

              mediaStream
                .getTracks()
                .forEach(track => track.stop());

              setStream(null);
              setIsCapturing(false);
              setFaceBox(null);
              setRegistrationStatus('idle');
              setFaceStatus('Mencari wajah...');

              detectionInProgress = false;
              return;
            }

            // Save photo

            setCapturedImage(photo);

            setFaceStatus('Wajah berhasil dideteksi');

            // Stop camera

            mediaStream
              .getTracks()
              .forEach(track => track.stop());

            setStream(null);
            setIsCapturing(false);
            setFaceBox(null);

            // Show captured photo

            setRegistrationStatus('success');

            console.log('📸 Foto wajah berhasil diambil');

          } catch (err) {
            console.error('Face detection error:', err);
            showError('Terjadi kesalahan saat mendeteksi wajah.');
          } finally {
            detectionInProgress = false;
          }
        },
        500
      );

    } catch (err) {
      console.error('Camera error:', err);
      showError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');

      setIsCapturing(false);
      setRegistrationStatus('idle');
    }
  };

  // Capture photo from video

  const capturePhotoFromVideo = () => {
    const video = videoRef.current;

    if (
      !video ||
      video.readyState < 2
    ) {
      console.debug('[DEBUG] Video belum siap:', video?.readyState);

      return null;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      return null;
    }

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    if (imageDataUrl && imageDataUrl.startsWith('data:image/jpeg;base64,')) {
      console.log('📸 Foto berhasil diambil');

      return imageDataUrl;
    }

    return null;
  };

  // Retake photo

  const handleRetake = () => {
    setCapturedImage(null);
    setRegistrationStatus('idle');
    setError('');
    setIsCapturing(false);
    setFaceBox(null);
    setFaceStatus('Mencari wajah...');
  };

  // Save registration

  const handleSaveRegistration = async () => {
    try {
      if (!capturedImage) {
        showError('Foto wajah belum tersedia.');
        return;
      }

      setLoading(true);
      setError('');

      await faceApi.createFaceData({
        userId: user._id,
        foto: capturedImage,
      });

      setRegistrationStatus('registered');
      showSuccess('Registrasi wajah berhasil disimpan.');
    } catch (err) {
      console.error('Error saving face data:', err);

      showError(err.response?.data?.message || 'Gagal menyimpan data wajah');
    } finally {
      setLoading(false);
    }
  };

  // Upload photo

  const handleFileUpload = e => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setCapturedImage(reader.result);
      setRegistrationStatus('success');
      setError('');
    };

    reader.readAsDataURL(file);
  };

  // Render

  return (
    <div className="p-8">
      {registrationStatus !==
        'registered' ? (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Registrasi Wajah
          </h1>

          <p className="text-gray-600 mb-8">
            Daftarkan wajah Anda untuk
            sistem absensi face recognition
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Instructions */}

            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Instruksi
              </h2>

              <div className="space-y-4">

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">
                      1
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      Pastikan pencahayaan cukup
                    </p>

                    <p className="text-sm text-gray-600">
                      Wajah harus terlihat jelas
                      dengan pencahayaan yang baik
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">
                      2
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      Lihat langsung ke kamera
                    </p>

                    <p className="text-sm text-gray-600">
                      Posisikan wajah menghadap
                      kamera secara langsung
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">
                      3
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      Hindari aksesoris
                    </p>

                    <p className="text-sm text-gray-600">
                      Lepas kacamata atau topi
                      jika memungkinkan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">
                      4
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      Jaga jarak yang tepat
                    </p>

                    <p className="text-sm text-gray-600">
                      Berada pada jarak 30-50 cm
                      dari kamera
                    </p>
                  </div>
                </div>

              </div>

              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="text-yellow-600 flex-shrink-0"
                    size={20}
                  />

                  <div>
                    <p className="font-medium text-yellow-800">
                      Catatan Penting
                    </p>

                    <p className="text-sm text-yellow-700 mt-1">
                      Data wajah Anda akan
                      digunakan hanya untuk sistem
                      absensi dan tidak akan
                      dibagikan kepada pihak lain.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Camera */}

            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Area Kamera
              </h2>

              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4 relative overflow-hidden">

                {/* Idle state */}

                {registrationStatus ===
                  'idle' && (
                    <div className="text-center">
                      <Camera
                        className="text-gray-400 mx-auto mb-2"
                        size={48}
                      />

                      <p className="text-gray-500">
                        Kamera belum aktif
                      </p>
                    </div>
                  )}

                {/* Camera active */}

                {registrationStatus ===
                  'capturing' && (
                    <div
                      ref={cameraContainerRef}
                      className="relative w-full h-full"
                    >

                      {/* VIDEO */}
                      <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        autoPlay
                        playsInline
                        muted
                      />

                      {/* Hidden canvas */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />

                      {/* Face detected label */}

                      {faceBox && (
                        <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
                          <CheckCircle size={14} />
                          Wajah Terdeteksi
                        </div>
                      )}

                      {/* Status */}

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                          {faceStatus}
                        </div>
                      </div>

                    </div>
                  )}

                {/* Success state */}

                {registrationStatus ===
                  'success' &&
                  capturedImage && (
                    <div className="relative w-full h-full">

                      <img
                        src={capturedImage}
                        alt="Captured face"
                        className="w-full h-full object-cover"
                      />

                      {/* SUCCESS LABEL */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg">
                          <CheckCircle
                            size={20}
                          />

                          Wajah berhasil
                          terdeteksi
                        </div>
                      </div>

                    </div>
                  )}

              </div>

              {/* Buttons */}

              <div className="space-y-3">

                {!capturedImage &&
                  registrationStatus !==
                  'capturing' && (
                    <>
                      <button
                        onClick={
                          handleStartCapture
                        }
                        disabled={
                          isCapturing
                        }
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera
                          size={20}
                        />

                        {isCapturing
                          ? 'Mendeteksi...'
                          : 'Buka Kamera'}
                      </button>

                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={
                            handleFileUpload
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <Upload
                            size={20}
                          />

                          Upload Foto
                        </button>
                      </div>
                    </>
                  )}

                {capturedImage && (
                  <>
                    <button
                      onClick={
                        handleRetake
                      }
                      disabled={
                        loading
                      }
                      className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera
                        size={20}
                      />

                      Foto Ulang
                    </button>

                    <button
                      onClick={
                        handleSaveRegistration
                      }
                      disabled={
                        loading
                      }
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle
                        size={20}
                      />

                      {loading
                        ? 'Menyimpan...'
                        : 'Simpan Registrasi'}
                    </button>
                  </>
                )}

              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center py-20 px-10">

              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircle
                  className="text-green-600"
                  size={40}
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Wajah Anda Sudah Terdaftar
              </h2>

              <p className="text-gray-600 mb-8">
                Wajah Anda telah terdaftar dakam sistem absensi dan siap digunakan untuk absensi.
              </p>

              <Link
                to="/jamaah/dashboard"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25"
              >
                Kembali ke Dashboard
              </Link>

            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JamaahRegistrasiWajah;