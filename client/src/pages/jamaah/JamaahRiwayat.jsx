import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { absensiApi } from '../../api/absensiApi';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Filter, Clock } from 'lucide-react';
import useNotification from '../../hooks/useNotification';

const JamaahRiwayat = () => {
  const { user } = useAuth();
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterKajian, setFilterKajian] = useState('');
  const { showError } = useNotification();

  useEffect(() => {
    const fetchRiwayatAbsensi = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        setError('');

        const response = await absensiApi.getAbsensiByUser(user._id);

        console.log('Data riwayat absensi:', response.data);

        setAbsensi(response.data.data || []);
      } catch (err) {
        console.error('Gagal mengambil riwayat absensi:', err);
        showError(err.response?.data?.message || 'Gagal mengambil riwayat absensi');
        setError(err.response?.data?.message ||'Gagal mengambil riwayat absensi');
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayatAbsensi();
  }, [user?._id]);

  const daftarKajian = [
  ...new Map(
    absensi
      .filter(item => item.kajianId)
      .map(item => [
        item.kajianId._id,
        item.kajianId
      ])
  ).values()
];

  const filteredAbsensi = absensi.filter(absensiItem => {
    const kajian = absensiItem.kajianId;

    const matchSearch = kajian?.judul.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = !filterDate || new Date(absensiItem.tanggal).toISOString().split('T')[0] === filterDate;
    const matchKajian = !filterKajian || kajian?._id === filterKajian;

    return matchSearch && matchDate && matchKajian;
  });

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl md:mb-8">Riwayat Absensi</h1>

      <Card>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari kajian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterKajian}
              onChange={(e) => setFilterKajian(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Kajian</option>
              {daftarKajian.map(k => (
                <option key={k._id} value={k._id}>{k.judul}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kajian</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Waktu</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Metode</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsensi.map((absensi, index) => {
                const kajian = absensi.kajianId;
                return (
                  <tr key={absensi.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 font-medium">{kajian?.judul || 'Unknown'}</td>
                    <td className="py-3 px-4">{new Date(absensi.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-4">{absensi.waktu}</td>
                    <td className="py-3 px-4">
                      <Badge variant={absensi.status === 'hadir' ? 'success' : 'danger'}> {absensi.status} </Badge>
                    </td>
                    <td className="py-3 px-4">{absensi.metode}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {filteredAbsensi.map((absensi) => {
            const kajian = absensi.kajianId;
            return (
              <div
                key={absensi.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="line-clamp-2 min-w-0 text-base font-semibold leading-5 text-gray-900">
                    {kajian?.judul || 'Unknown'}
                  </h2>
                  <Badge variant={absensi.status === 'hadir' ? 'success' : 'danger'}>
                    {absensi.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2 text-gray-600">
                    <Calendar className="shrink-0 text-gray-400" size={16} />
                    <span className="truncate">{new Date(absensi.tanggal).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-2 text-gray-600">
                    <Clock className="shrink-0 text-gray-400" size={16} />
                    <span className="truncate">{absensi.waktu}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Metode</p>
                  <p className="mt-1 truncate text-sm font-medium text-gray-700">{absensi.metode}</p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAbsensi.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada riwayat absensi yang ditemukan
          </div>
        )}
      </Card>
    </div>
  );
};

export default JamaahRiwayat;
