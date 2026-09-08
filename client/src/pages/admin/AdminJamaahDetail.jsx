import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { userApi } from '../../api/userApi';
import { absensiApi } from '../../api/absensiApi';
import { kajianApi } from '../../api/kajianApi';
import { faceApi } from '../../api/faceApi';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CheckSquare, Camera, X } from 'lucide-react';

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
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !jamaah) {
    return (
      <div className="p-8">
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
    <div className="p-8">
      <Link to="/admin/jamaah" className="flex items-center gap-2 text-primary-600 hover:underline mb-6">
        <ArrowLeft size={20} />
        Kembali ke Data Jamaah
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Detail Jamaah</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-block">
              <div
                onClick={() => faceData?.foto && setShowFacePhotoPreview(true)}
                className={`w-32 h-32 ${faceData?.foto
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-primary-100'
                  } rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden transition-colors`}
              >
                {faceData?.foto ? (
                  <img
                    src={faceData.foto}
                    alt={`Foto wajah ${jamaah.nama}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary-600">
                    {jamaah.nama.charAt(0)}
                  </span>
                )}
              </div>
              {faceData?.foto && (
                <p className="text-xs text-gray-400 mt-1">Klik untuk memperbesar</p>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{jamaah.nama}</h2>
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

        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Informasi Pribadi</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{jamaah.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Telepon</p>
                <p className="font-medium">{jamaah.telepon}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="font-medium">{jamaah.alamat}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Tanggal Registrasi</p>
                <p className="font-medium">{jamaah.tanggalRegistrasi}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare className="text-primary-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Riwayat Absensi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Waktu</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kajian</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Metode</th>
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
                    <td className="py-3 px-4">{absensi.tanggal}</td>
                    <td className="py-3 px-4">{absensi.waktu}</td>
                    <td className="py-3 px-4">{kajian?.judul || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="success">{absensi.status}</Badge>
                    </td>
                    <td className="py-3 px-4">{absensi.metode}</td>
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
          <div className="relative">
            <button
              onClick={() => setShowFacePhotoPreview(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
            <div className="bg-gray-100 rounded-lg w-96 h-96 flex items-center justify-center overflow-hidden">
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
