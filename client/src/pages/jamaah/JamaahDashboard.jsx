import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { kajianApi } from '../../api/kajianApi';
import { absensiApi } from '../../api/absensiApi';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, Calendar, CheckSquare, History } from 'lucide-react';
import useNotification from '../../hooks/useNotification';

const JamaahDashboard = () => {
  const { user } = useAuth();

  const [kajianAktif, setKajianAktif] = useState(null);
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showError } = useNotification();

  const today = new Date();

  const todayString =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        setError('');

        const [kajianResponse, absensiResponse] = await Promise.all([
          kajianApi.getAllKajian({ status: 'aktif' }),
          absensiApi.getAbsensiByUser(user._id),
        ]);

        console.log('Data kajian aktif:', kajianResponse.data);
        console.log('Data absensi jamaah:', absensiResponse.data);

        const daftarKajian = kajianResponse.data?.data?.kajian || [];
        const daftarAbsensi = absensiResponse.data?.data || [];

        const sekarang = new Date();

        const kajianSedangBerlangsung = daftarKajian.find((kajian) => {
          const tanggalKajian = new Date(kajian.tanggal);

          const [jamMulai, menitMulai] = kajian.jamMulai.split(':').map(Number);
          const [jamSelesai, menitSelesai] = kajian.jamSelesai.split(':').map(Number);

          const mulai = new Date(tanggalKajian);
          mulai.setHours(jamMulai, menitMulai, 0, 0);

          const selesai = new Date(tanggalKajian);
          selesai.setHours(jamSelesai, menitSelesai, 0, 0);

          return sekarang >= mulai && sekarang <= selesai;
        });

        setKajianAktif(kajianSedangBerlangsung || null);
        setAbsensi(daftarAbsensi);


      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
        showError(err.response?.data?.message || 'Gagal mengambil data dashboard');
        setError(
          err.response?.data?.message ||
          'Gagal mengambil data dashboard'
        );
      } finally {
        setLoading(false);
      }
    };
    const interval = setInterval(fetchDashboardData, 30000);
    fetchDashboardData();
    return () => clearInterval(interval);
  }, [user?._id]);

  const todayAbsensi = absensi.filter((item) => {
    return new Date(item.tanggal).toISOString().split('T')[0] === todayString;
  });

  const hasAttendedToday = todayAbsensi.length > 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">
          Memuat dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang, {user?.nama || 'Jamaah'}</h1>
        <p className="text-gray-500 mt-1">Dashboard Jamaah Masjid Al-Hikmah</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="text-primary-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Kajian Sedang Berlangsung</h2>
          </div>
          {kajianAktif ? (
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-6 border border-primary-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{kajianAktif.judul}</h3>
              <p className="text-gray-600 mb-4 text-sm">{kajianAktif.deskripsi || 'Tidak ada deskripsi'}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pemateri</p>
                  <p className="font-semibold text-gray-900">{kajianAktif.pemateri}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Jadwal</p>
                  <p className="font-semibold text-gray-900">{new Date(kajianAktif.tanggal).toLocaleDateString('id-ID')}{' | '}{kajianAktif.jamMulai} - {kajianAktif.jamSelesai}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Lokasi</p>
                  <p className="font-semibold text-gray-900">{kajianAktif.lokasi}</p>
                </div>
              </div>
              <Link
                to="/jamaah/absensi"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25"
              >
                <CheckSquare size={18} />
                {hasAttendedToday ? 'Absen Ulang' : 'Absen Sekarang'}
              </Link>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Tidak ada kajian yang sedang berlangsung</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Status Hari Ini</h2>
          </div>
          {hasAttendedToday ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <Badge variant="success" className="text-sm px-4 py-2">Sudah Absen</Badge>
              <p className="text-gray-500 mt-2 text-sm">Pukul {todayAbsensi[0]?.waktu || '-'}</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Clock className="text-amber-600" size={32} />
              </div>
              <Badge variant="warning" className="text-sm px-4 py-2">Belum Absen</Badge>
              <p className="text-gray-500 mt-2 text-sm">Silakan absen sekarang</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <History className="text-primary-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Riwayat Kehadiran</h2>
            </div>
            <Link to="/jamaah/riwayat" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {absensi.slice(0, 5).map((absensiItem) => {
              const kajian = absensiItem.kajianId;

              return (
                <div
                  key={absensiItem._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {kajian?.judul || 'Unknown'}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(absensiItem.tanggal).toLocaleDateString('id-ID')}
                    </p>
                  </div>

                  <Badge
                    variant={
                      absensiItem.status === 'hadir'
                        ? 'success'
                        : 'danger'
                    }
                  >
                    {absensiItem.status}
                  </Badge>
                </div>
              );
            })}

            {absensi.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <History size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada riwayat kehadiran</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JamaahDashboard;
