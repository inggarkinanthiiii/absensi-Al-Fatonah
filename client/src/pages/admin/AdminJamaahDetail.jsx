import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { userApi } from '../../api/userApi';
import { absensiApi } from '../../api/absensiApi';
import { kajianApi } from '../../api/kajianApi';
import { faceApi } from '../../api/faceApi';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CheckSquare, Camera, X } from 'lucide-react';

const formatRegistrationDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatAttendanceDate = (value) => {
  if (!value) return '-';

  const dateKey = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)
    ? value.slice(0, 10)
    : '';

  if (dateKey) {
    return new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC' }).format(
      new Date(`${dateKey}T00:00:00.000Z`)
    );
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta' }).format(date);
};

const AdminJamaahDetail = () => {
  const { id } = useParams();

  const [jamaah, setJamaah] = useState(null);
  const [faceData, setFaceData] = useState(null);
  const [jamaahAbsensi, setJamaahAbsensi] = useState([]);
  const [kajianMap, setKajianMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFacePhotoPreview, setShowFacePhotoPreview] = useState(false);

  useEffect(() => {
    const fetchJamaahDetail = async () => {
      try {
        setLoading(true);
        setError('');

        // Ambil data jamaah
        const jamaahResponse = await userApi.getUserById(id);
        const jamaahData = jamaahResponse.data.data.user;

        setJamaah(jamaahData);
        const faceResponse = await faceApi.getFaceDataByUserId(id);
        const faceDataResponse = faceResponse.data.data;

        setFaceData(faceDataResponse);

        // Ambil riwayat absensi jamaah
        const absensiResponse = await absensiApi.getAbsensiByUser(id);
        const absensiData = absensiResponse.data.data || [];

        setJamaahAbsensi(absensiData);

        // Ambil data kajian untuk setiap absensi
        const uniqueKajianIds = [
          ...new Set(
            absensiData
              .map((absensi) => {
                if (typeof absensi.kajianId === 'object') {
                  return absensi.kajianId?._id;
                }

                return absensi.kajianId;
              })
              .filter(Boolean)
          ),
        ];

        const kajianResults = await Promise.all(
          uniqueKajianIds.map(async (kajianId) => {
            try {
              const response = await kajianApi.getKajianById(kajianId);
              return {
                id: kajianId,
                data: response.data.data.kajian || response.data.data,
              };
            } catch (error) {
              console.error(`Gagal mengambil kajian ${kajianId}:`, error);
              return {
                id: kajianId,
                data: null,
              };
            }
          })
        );

        const newKajianMap = {};

        kajianResults.forEach(({ id: kajianId, data }) => {
          newKajianMap[kajianId] = data;
        });

        setKajianMap(newKajianMap);
      } catch (error) {
        console.error('Error fetching jamaah detail:', error);

        setError(
          error.response?.data?.message ||
          'Gagal mengambil data jamaah'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJamaahDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !jamaah) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Data jamaah tidak ditemukan</p>
          <Link to="/admin/jamaah" className="text-primary-600 hover:underline mt-4 inline-block">
            Kembali ke Data Jamaah
          </Link>
        </div>
      </div>
    );
  }



  return (
    <div className="w-full min-w-0 max-w-full box-border overflow-x-clip p-4 sm:p-6 lg:p-8">
      <Link to="/admin/jamaah" className="mb-6 flex w-fit max-w-full items-start gap-2 text-sm text-primary-600 hover:underline sm:text-base">
        <ArrowLeft size={20} className="shrink-0" />
        <span className="break-words">Kembali ke Data Jamaah</span>
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-800 sm:mb-8 sm:text-3xl">Detail Jamaah</h1>

      <div className="mb-6 grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-3">
        <Card className="min-w-0 !p-4 sm:!p-6 lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-block">
              <div
                onClick={() => faceData?.foto && setShowFacePhotoPreview(true)}
                className={`mx-auto h-24 w-24 sm:h-32 sm:w-32 ${faceData?.foto
                  ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                  : 'bg-primary-100'
                  } mb-4 flex items-center justify-center overflow-hidden rounded-full transition-colors`}
              >
                {faceData?.foto ? (
                  <img
                    src={faceData.foto}
                    alt={`Foto wajah ${jamaah.nama}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary-600 sm:text-4xl">
                    {jamaah.nama.charAt(0)}
                  </span>
                )}
              </div>
              {faceData?.foto && (
                <p className="text-xs text-gray-400 mt-1">Klik untuk memperbesar</p>
              )}
            </div>
            <h2 className="break-words text-xl font-bold text-gray-800 sm:text-2xl">{jamaah.nama}</h2>
            <Badge variant="success" className="mt-2">{jamaah.status}</Badge>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Foto Wajah</p>
              {faceData?.foto ? (
                <p className="text-xs text-green-600">Terdaftar</p>
              ) : (
                <p className="text-xs text-red-600">Belum terdaftar</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="min-w-0 !p-4 sm:!p-6 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 sm:text-xl">Informasi Pribadi</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 shrink-0 text-gray-400" size={20} />
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Email</p>
                <p className="break-all font-medium">{jamaah.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 shrink-0 text-gray-400" size={20} />
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Telepon</p>
                <p className="break-words font-medium">{jamaah.telepon}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 shrink-0 text-gray-400" size={20} />
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="break-words font-medium">{jamaah.alamat}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 shrink-0 text-gray-400" size={20} />
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Tanggal Registrasi</p>
                <p className="break-words font-medium">{formatRegistrationDate(jamaah.tanggalRegistrasi)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="min-w-0 !p-4 sm:!p-6">
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <CheckSquare className="shrink-0 text-primary-600" size={24} />
          <h3 className="min-w-0 break-words text-lg font-semibold text-gray-800 sm:text-xl">Riwayat Absensi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-2 py-3 text-left font-semibold text-gray-700 sm:px-4">Tanggal</th>
                <th className="px-2 py-3 text-left font-semibold text-gray-700 sm:px-4">Waktu</th>
                <th className="px-2 py-3 text-left font-semibold text-gray-700 sm:px-4">Kajian</th>
                <th className="px-2 py-3 text-left font-semibold text-gray-700 sm:px-4">Status</th>
                <th className="px-2 py-3 text-left font-semibold text-gray-700 sm:px-4">Metode</th>
              </tr>
            </thead>
            <tbody>
              {jamaahAbsensi.map((absensi) => {
                const kajianId =
                  typeof absensi.kajianId === 'object'
                    ? absensi.kajianId?._id
                    : absensi.kajianId;

                const kajian = kajianMap[kajianId];
                return (
                  <tr key={absensi.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-3 sm:px-4">{formatAttendanceDate(absensi.tanggal)}</td>
                    <td className="px-2 py-3 sm:px-4">{absensi.waktu}</td>
                    <td className="break-words px-2 py-3 sm:px-4">{kajian?.judul || 'Unknown'}</td>
                    <td className="px-2 py-3 sm:px-4">
                      <Badge variant="success">{absensi.status}</Badge>
                    </td>
                    <td className="px-2 py-3 sm:px-4">{absensi.metode}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {jamaahAbsensi.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada riwayat absensi
          </div>
        )}
      </Card>

      {/* Face Photo Preview Modal */}
      {showFacePhotoPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-[min(24rem,calc(100vw-2rem))]">
            <button
              onClick={() => setShowFacePhotoPreview(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              aria-label="Tutup pratinjau foto"
            >
              <X size={24} />
            </button>
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              {faceData?.foto && (
                <img
                  src={faceData.foto}
                  alt={`Foto wajah ${jamaah.nama}`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <p className="text-white text-center mt-4 text-sm">Foto Wajah Jamaah</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJamaahDetail;
