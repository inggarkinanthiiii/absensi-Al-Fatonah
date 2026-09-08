import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { userApi } from '../../api/userApi';
import { kajianApi } from '../../api/kajianApi';
import { absensiApi } from '../../api/absensiApi';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useNotification from '../../hooks/useNotification';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalJamaah, setTotalJamaah] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [todayBelumPresensi, setTodayBelumPresensi] = useState(0);
  const [todayTidakHadir, setTodayTidakHadir] = useState(0);
  const [todayKajianMessage, setTodayKajianMessage] = useState('');
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [kajianMap, setKajianMap] = useState({});
  const { showError } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [usersResponse, kajianResponse] = await Promise.all([
        userApi.getAllUsers({ role: 'jamaah' }),
        kajianApi.getAllKajian()
      ]);

      const jamaahList = usersResponse.data.data.users || [];
      const kajianList = kajianResponse.data.data.kajian || [];

      setTotalJamaah(jamaahList.filter(user => user.status === 'aktif').length);

      // Create user map for quick lookup
      const newUserMap = {};
      jamaahList.forEach(user => {
        newUserMap[user._id] = user;
      });
      setUserMap(newUserMap);

      // Create kajian map for quick lookup
      const newKajianMap = {};
      kajianList.forEach(kajian => {
        newKajianMap[kajian._id] = kajian;
      });
      setKajianMap(newKajianMap);

      // Fetch attendance for each kajian (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const recentKajians = kajianList
        .filter(k => new Date(k.tanggal) >= sixMonthsAgo)
        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

      const attendancePromises = recentKajians.map(kajian =>
        absensiApi.getAbsensiByKajian(kajian._id)
      );

      const attendanceResponses = await Promise.all(attendancePromises);

      const todayParts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).formatToParts(new Date()).map(({ type, value }) => [type, value])
      );
      const todayJakarta = `${todayParts.year}-${todayParts.month}-${todayParts.day}`;
      const todayKajian = kajianList.find(kajian => (
        kajian.status === 'aktif' && String(kajian.tanggal).slice(0, 10) === todayJakarta
      ));

      if (todayKajian) {
        const rekapResponse = await absensiApi.getAttendanceRekap(todayKajian._id);
        const rekap = rekapResponse.data.data || [];
        setTotalJamaah(rekap.length);
        setTodayAttendance(rekap.filter(item => item.status === 'hadir').length);
        setTodayBelumPresensi(rekap.filter(item => item.status === 'belum_presensi').length);
        setTodayTidakHadir(rekap.filter(item => item.status === 'tidak_hadir').length);
        setTodayKajianMessage('');
      } else {
        setTodayAttendance(0);
        setTodayBelumPresensi(0);
        setTodayTidakHadir(0);
        setTodayKajianMessage('Tidak ada kajian terjadwal hari ini');
      }

      // Process chart data
      const chartDataProcessed = recentKajians.map((kajian, index) => ({
        name: new Date(kajian.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        hadir: attendanceResponses[index]?.data.data?.length || 0,
        judul: kajian.judul
      }));
      setChartData(chartDataProcessed);

      const allAttendance = [];

      attendanceResponses.forEach(response => {
        const attendanceList = response.data.data || [];
        attendanceList.forEach(absensi => {
          allAttendance.push(absensi);
        });
      });

      // Get recent attendance (last 5)
      const recentAttendanceSorted = allAttendance
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentAttendance(recentAttendanceSorted);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showError(err.response?.data?.message || 'Gagal mengambil data dashboard');
      setError(err.response?.data?.message || 'Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <p className="text-gray-500">Memuat data dashboard...</p>
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
              onClick={fetchDashboardData}
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Overview sistem absensi masjid</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Users className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Jamaah</p>
            <p className="text-2xl font-bold text-gray-900">{totalJamaah}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Hadir</p>
            <p className="text-2xl font-bold text-gray-900">{todayAttendance}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Belum Presensi</p>
            <p className="text-2xl font-bold text-gray-900">{todayBelumPresensi}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <XCircle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Tidak Hadir</p>
            <p className="text-2xl font-bold text-gray-900">{todayTidakHadir}</p>
          </div>
        </Card>
      </div>

      {todayKajianMessage && (
        <p className="text-gray-500 mb-8">{todayKajianMessage}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kehadiran Kajian 6 Bulan Terakhir</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6 -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value, name, props) => [
                    `${value} jamaah`,
                    props.payload.judul
                  ]}
                />
                <Bar dataKey="hadir" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada data kajian dalam 6 bulan terakhir</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kehadiran Terbaru</h2>
          {recentAttendance.length > 0 ? (
            <div className="space-y-3">
              {recentAttendance.map((attendance) => {
                const jamaah = userMap[attendance.userId];
                const kajian = kajianMap[attendance.kajianId];
                return (
                  <div key={attendance._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{jamaah?.nama || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{kajian?.judul || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={attendance.status === 'hadir' ? 'success' : 'danger'}>{attendance.status}</Badge>
                      <p className="text-xs text-gray-400 mt-1">{attendance.waktu}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada data kehadiran</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
