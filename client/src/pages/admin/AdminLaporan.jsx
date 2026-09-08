import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { kajianApi } from '../../api/kajianApi';
import { absensiApi } from '../../api/absensiApi';
import { Download, Calendar, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useNotification from '../../hooks/useNotification';

const getDateInputValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const formatDate = (value) => {
  const dateValue = getDateInputValue(value);
  if (!dateValue) return '-';

  return new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC' }).format(
    new Date(`${dateValue}T00:00:00.000Z`)
  );
};

const getStatusLabel = (status) => ({
  hadir: 'Hadir',
  belum_presensi: 'Belum Presensi',
  tidak_hadir: 'Tidak Hadir',
}[status] || '-');

const getStatusClassName = (status) => ({
  hadir: 'bg-green-100 text-green-800',
  belum_presensi: 'bg-yellow-100 text-yellow-800',
  tidak_hadir: 'bg-red-100 text-red-800',
}[status] || 'bg-gray-100 text-gray-800');

const AdminLaporan = () => {
  const [filterDate, setFilterDate] = useState('');
  const [filterKajian, setFilterKajian] = useState('');
  const [reportType, setReportType] = useState('kehadiran');
  const [kajianList, setKajianList] = useState([]);
  const [absensiData, setAbsensiData] = useState([]);
  const [loadingKajian, setLoadingKajian] = useState(true);
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);
  const [error, setError] = useState('');
  const [kajianMap, setKajianMap] = useState({});
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    fetchKajianList();
  }, []);

  useEffect(() => {
    if (filterKajian === 'all') {
      fetchAllAbsensi();
    } else if (filterKajian) {
      fetchAbsensiByKajian(filterKajian);
    } else {
      setAbsensiData([]);
    }
  }, [filterKajian, filterDate]);

  const fetchKajianList = async () => {
    try {
      setLoadingKajian(true);
      setError('');
      const response = await kajianApi.getAllKajian();
      const kajianData = response.data.data.kajian || [];
      setKajianList(kajianData);

      const newKajianMap = {};
      kajianData.forEach(kajian => {
        newKajianMap[kajian._id] = kajian;
      });
      setKajianMap(newKajianMap);
    } catch (err) {
      console.error('Error fetching kajian list:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data kajian');
    } finally {
      setLoadingKajian(false);
    }
  };

  const fetchAbsensiByKajian = async (kajianId) => {
    try {
      setLoadingAbsensi(true);
      setError('');
      const response = await absensiApi.getAttendanceRekap(kajianId);
      let data = response.data.data || [];
      
      if (filterDate) {
        data = data.filter(a => getDateInputValue(a.kajianTanggal) === filterDate);
      }
      
      setAbsensiData(data);
    } catch (err) {
      console.error('Error fetching absensi:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data absensi');
      setAbsensiData([]);
    } finally {
      setLoadingAbsensi(false);
    }
  };

  const fetchAllAbsensi = async () => {
    try {
      setLoadingAbsensi(true);
      setError('');
      const response = await absensiApi.getAllAbsensi();
      let data = response.data.data || [];
      
      if (filterDate) {
        data = data.filter(a => getDateInputValue(a.tanggal) === filterDate);
      }
      
      setAbsensiData(data);
    } catch (err) {
      console.error('Error fetching all absensi:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data absensi');
      setAbsensiData([]);
    } finally {
      setLoadingAbsensi(false);
    }
  };

  const handleGenerateReport = () => {
    if (filterKajian === 'all') {
      fetchAllAbsensi();
    } else if (filterKajian) {
      fetchAbsensiByKajian(filterKajian);
    }
  };

  const handleDownloadPDF = () => {
    if (absensiData.length === 0) {
      showInfo('Tidak ada data untuk di-export ke PDF');
      return;
    }

    const doc = new jsPDF();
    const kajianName = filterKajian === 'all' 
      ? 'Semua Kajian' 
      : kajianMap[filterKajian]?.judul || 'Unknown';
    
    // Title
    doc.setFontSize(18);
    doc.text('Laporan Kehadiran Jamaah', 14, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.text(`Kajian: ${kajianName}`, 14, 30);
    
    if (filterDate) {
      doc.text(`Tanggal: ${new Date(filterDate).toLocaleDateString('id-ID')}`, 14, 38);
    }
    
    const summaryY = filterDate ? 46 : 38;
    doc.text(`Total Jamaah: ${attendanceStats.total}`, 14, summaryY);
    doc.text(`Hadir: ${attendanceStats.hadir} | Belum Presensi: ${attendanceStats.belum_presensi} | Tidak Hadir: ${attendanceStats.tidak_hadir}`, 14, summaryY + 8);
    
    // Table
    const tableData = absensiData.map((absensi, index) => {
      const isRekap = filterKajian !== 'all';
      const kajian = !isRekap && absensi.kajianId?.judul
        ? absensi.kajianId.judul
        : kajianName;

      return [
      index + 1,
      isRekap ? absensi.nama || '-' : absensi.userId?.nama || '-',
      isRekap ? absensi.email || '-' : absensi.userId?.email || '-',
      isRekap ? absensi.kajianJudul || '-' : kajian,
      formatDate(isRekap ? absensi.kajianTanggal : absensi.tanggal),
      absensi.waktu || '-',
      getStatusLabel(absensi.status),
      absensi.metode || '-'
      ];
    });
    
    autoTable(doc, {
      startY: filterDate ? 63 : 55,
      head: [['No', 'Nama', 'Email', 'Kajian', 'Tanggal', 'Waktu', 'Status', 'Metode']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
    
    doc.save(`laporan-kehadiran-${new Date().toISOString().split('T')[0]}.pdf`);
    showSuccess('Laporan PDF berhasil di-download');
  };

  const attendanceStats = absensiData.reduce((stats, absensi) => {
    if (Object.prototype.hasOwnProperty.call(stats, absensi.status)) {
      stats[absensi.status] += 1;
    }
    return stats;
  }, { total: absensiData.length, hadir: 0, belum_presensi: 0, tidak_hadir: 0 });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Laporan</h1>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <div className="text-center py-4">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => {
                setError('');
                fetchKajianList();
              }}
              className="mt-2 text-red-600 hover:text-red-700 underline"
            >
              Coba Lagi
            </button>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="kehadiran">Laporan Kehadiran</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Kajian</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterKajian}
                onChange={(e) => setFilterKajian(e.target.value)}
                disabled={loadingKajian}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Pilih Kajian</option>
                <option value="all">Semua Kajian</option>
                {kajianList.map(k => (
                  <option key={k._id} value={k._id}>{k.judul}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={!filterKajian || loadingAbsensi}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Filter size={20} />
            Generate Laporan
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={absensiData.length === 0}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Export PDF
          </button>
        </div>

        {filterKajian && !loadingAbsensi && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total Jamaah</p>
              <p className="text-2xl font-bold text-gray-800">{attendanceStats.total}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-700">Hadir</p>
              <p className="text-2xl font-bold text-green-800">{attendanceStats.hadir}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">Belum Presensi</p>
              <p className="text-2xl font-bold text-yellow-800">{attendanceStats.belum_presensi}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-700">Tidak Hadir</p>
              <p className="text-2xl font-bold text-red-800">{attendanceStats.tidak_hadir}</p>
            </div>
          </div>
        )}
      </Card>

      {loadingKajian && (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Memuat daftar kajian...</p>
          </div>
        </Card>
      )}

      {!filterKajian && !loadingKajian && (
        <Card>
          <div className="text-center py-8 text-gray-500">
            Silakan pilih kajian atau "Semua Kajian" untuk melihat laporan.
          </div>
        </Card>
      )}

      {filterKajian && loadingAbsensi && (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-500">
              {filterKajian === 'all' ? 'Memuat semua data absensi...' : 'Memuat data absensi...'}
            </p>
          </div>
        </Card>
      )}

      {filterKajian && !loadingAbsensi && !loadingKajian && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {filterKajian === 'all' ? 'Semua Data Absensi' : kajianMap[filterKajian]?.judul || 'Data Absensi'}
            </h2>
            <span className="text-sm text-gray-500">
              Total: {absensiData.length} data
            </span>
          </div>

          {absensiData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Jamaah</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kajian</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Waktu</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Metode</th>
                  </tr>
                </thead>
                <tbody>
                  {absensiData.map((absensi, index) => {
                    const isRekap = filterKajian !== 'all';
                    const kajian = !isRekap && absensi.kajianId?.judul
                      ? absensi.kajianId.judul
                      : isRekap ? absensi.kajianJudul : kajianMap[absensi.kajianId]?.judul;
                    return (
                      <tr key={absensi._id || `${absensi.kajianId}-${absensi.userId}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{isRekap ? absensi.nama || '-' : absensi.userId?.nama || '-'}</td>
                        <td className="py-3 px-4">{isRekap ? absensi.email || '-' : absensi.userId?.email || '-'}</td>
                        <td className="py-3 px-4">{kajian || '-'}</td>
                        <td className="py-3 px-4">{formatDate(isRekap ? absensi.kajianTanggal : absensi.tanggal)}</td>
                        <td className="py-3 px-4">{absensi.waktu || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClassName(absensi.status)}`}>
                            {getStatusLabel(absensi.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{absensi.metode || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {filterDate
                ? 'Tidak ada data yang sesuai dengan filter tanggal.'
                : filterKajian !== 'all'
                  ? 'Tidak ada jamaah aktif untuk kajian ini.'
                  : 'Belum ada data absensi untuk kajian yang dipilih.'}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminLaporan;
