import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { kajianApi } from '../../api/kajianApi';
import { absensiApi } from '../../api/absensiApi';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useNotification from '../../hooks/useNotification';

const getKajianDateKey = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date).map(({ type, value: partValue }) => [type, partValue])
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const formatKajianDate = (value) => {
  const dateKey = getKajianDateKey(value);
  if (!dateKey) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
};

const AdminAnalitik = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partialError, setPartialError] = useState('');
  const [totalJamaah, setTotalJamaah] = useState(0);
  const [totalAbsensi, setTotalAbsensi] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [attendanceByKajian, setAttendanceByKajian] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [kajianList, setKajianList] = useState([]);
  const [rekapByKajian, setRekapByKajian] = useState([]);
  const [selectedKajianId, setSelectedKajianId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { showError } = useNotification();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    const filteredRekap = rekapByKajian.filter(({ kajian }) => {
      const kajianDate = getKajianDateKey(kajian.tanggal);
      const matchesKajian = selectedKajianId === 'all' || kajian._id === selectedKajianId;
      const matchesStartDate = !startDate || kajianDate >= startDate;
      const matchesEndDate = !endDate || kajianDate <= endDate;

      return matchesKajian && matchesStartDate && matchesEndDate;
    });

    const allRekapData = filteredRekap.flatMap(({ rekap }) => rekap);
    const uniqueJamaahIds = new Set(
      allRekapData.map(item => String(item.userId?._id || item.userId))
    );
    const hadirCount = allRekapData.filter(item => item.status === 'hadir').length;
    const belumPresensiCount = allRekapData.filter(item => item.status === 'belum_presensi').length;
    const tidakHadirCount = allRekapData.filter(item => item.status === 'tidak_hadir').length;
    const totalPeserta = allRekapData.length;

    setTotalJamaah(allRekapData.length > 0 ? uniqueJamaahIds.size : 0);
    setTotalAbsensi(hadirCount);
    setAvgAttendance(totalPeserta > 0 ? `${((hadirCount / totalPeserta) * 100).toFixed(1)}%` : '0.0%');

    setAttendanceByKajian(filteredRekap.map(({ kajian, rekap }) => ({
      name: kajian.judul,
      hadir: rekap.filter(item => item.status === 'hadir').length,
      total: rekap.length,
    })));

    setAttendanceStatus([
      { name: 'Hadir', value: hadirCount, color: '#10b981' },
      { name: 'Belum Presensi', value: belumPresensiCount, color: '#f59e0b' },
      { name: 'Tidak Hadir', value: tidakHadirCount, color: '#ef4444' },
    ]);

    setTrendData([...filteredRekap]
      .sort((a, b) => getKajianDateKey(a.kajian.tanggal).localeCompare(getKajianDateKey(b.kajian.tanggal)))
      .map(({ kajian, rekap }) => ({
        name: formatKajianDate(kajian.tanggal),
        hadir: rekap.filter(item => item.status === 'hadir').length,
        judul: kajian.judul,
      })));
  }, [endDate, rekapByKajian, selectedKajianId, startDate]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      setPartialError('');

      const kajianResponse = await kajianApi.getAllKajian();
      const kajianList = kajianResponse.data.data.kajian || [];
      setKajianList(kajianList);

      // Keep each rekap paired with its kajian so sorting cannot mismatch responses.
      const rekapResults = await Promise.allSettled(
        kajianList.map(async (kajian) => ({
          kajian,
          rekap: (await absensiApi.getAttendanceRekap(kajian._id)).data.data || [],
        }))
      );

      const successfulRekap = [];
      const failedKajian = [];
      rekapResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulRekap.push(result.value);
        } else {
          failedKajian.push(kajianList[index]);
          console.error(`Gagal mengambil rekap kajian ${kajianList[index]?.judul || kajianList[index]?._id}:`, result.reason);
        }
      });

      if (failedKajian.length > 0) {
        const message = `${failedKajian.length} kajian gagal dimuat. Statistik hanya mencakup kajian yang berhasil dimuat.`;
        setPartialError(message);
        showError(message);
      }

      setRekapByKajian(successfulRekap);

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      showError(err.response?.data?.message || 'Gagal mengambil data analitik');
      setError(err.response?.data?.message || 'Gagal mengambil data analitik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <p className="text-gray-500">Memuat data analitik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="bg-red-50 border-red-200">
          <div className="text-center py-8">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchAnalyticsData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Analitik Kehadiran</h1>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="kajian-filter" className="block text-sm font-medium text-gray-700 mb-2">Kajian</label>
            <select
              id="kajian-filter"
              value={selectedKajianId}
              onChange={(event) => setSelectedKajianId(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">Semua Kajian</option>
              {kajianList.map(kajian => (
                <option key={kajian._id} value={kajian._id}>{kajian.judul}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedKajianId('all');
            setStartDate('');
            setEndDate('');
          }}
          className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset Filter
        </button>
        <p className="text-sm text-gray-500 mt-3">Persentase dihitung berdasarkan data kehadiran jamaah pada kajian yang dipilih.</p>
      </Card>

      {partialError && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800 font-medium">{partialError}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center gap-4">
          <div className="p-4 bg-primary-100 rounded-full">
            <Users className="text-primary-600" size={32} />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Jamaah</p>
            <p className="text-2xl font-bold text-gray-800">{totalJamaah}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 bg-green-100 rounded-full">
            <Calendar className="text-green-600" size={32} />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Hadir</p>
            <p className="text-2xl font-bold text-gray-800">{totalAbsensi}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <TrendingUp className="text-blue-600" size={32} />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Rata-rata Kehadiran</p>
            <p className="text-2xl font-bold text-gray-800">{avgAttendance}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Kehadiran per Kajian</h2>
          {attendanceByKajian.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceByKajian}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hadir" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada data kajian</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribusi Status Kehadiran</h2>
          {attendanceStatus.length > 0 && attendanceStatus.some(s => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada data absensi</p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tren Kehadiran</h2>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} jamaah`,
                  props.payload.judul
                ]}
              />
              <Bar dataKey="hadir" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada data kajian untuk tren kehadiran</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminAnalitik;
