import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { kajianApi } from '../../api/kajianApi';
import { absensiApi } from '../../api/absensiApi';
import { Search, Calendar, Filter, X, MapPin, Camera } from 'lucide-react';
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

const AdminAbsensi = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterKajian, setFilterKajian] = useState('all');
  const [selectedAbsensi, setSelectedAbsensi] = useState(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [kajianList, setKajianList] = useState([]);
  const [absensiList, setAbsensiList] = useState([]);
  const [loadingKajian, setLoadingKajian] = useState(true);
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);
  const [error, setError] = useState('');
  const [kajianMap, setKajianMap] = useState({});
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchKajianList();
  }, []);

  useEffect(() => {
    if (filterKajian === 'all') {
      fetchAllAbsensi();
    } else if (filterKajian) {
      fetchAbsensiByKajian(filterKajian);
    } else {
      setAbsensiList([]);
    }
  }, [filterKajian]);

  const fetchKajianList = async () => {
    try {
      setLoadingKajian(true);
      setError('');
      const response = await kajianApi.getAllKajian();
      const kajianData = response.data.data.kajian || [];
      setKajianList(kajianData);

      // Create kajian map for quick lookup
      const newKajianMap = {};
      kajianData.forEach(kajian => {
        newKajianMap[kajian._id] = kajian;
      });
      setKajianMap(newKajianMap);
    } catch (err) {
      console.error('Error fetching kajian list:', err);
      showError(err.response?.data?.message || 'Gagal mengambil data kajian');
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
      setAbsensiList(response.data.data || []);
    } catch (err) {
      console.error('Error fetching absensi:', err);
      showError(err.response?.data?.message || 'Gagal mengambil data absensi');
      setError(err.response?.data?.message || 'Gagal mengambil data absensi');
      setAbsensiList([]);
    } finally {
      setLoadingAbsensi(false);
    }
  };

  const fetchAllAbsensi = async () => {
    try {
      setLoadingAbsensi(true);
      setError('');
      const response = await absensiApi.getAllAbsensi();
      setAbsensiList(response.data.data || []);
    } catch (err) {
      console.error('Error fetching all absensi:', err);
      showError(err.response?.data?.message || 'Gagal mengambil data absensi');
      setError(err.response?.data?.message || 'Gagal mengambil data absensi');
      setAbsensiList([]);
    } finally {
      setLoadingAbsensi(false);
    }
  };

  const getDisplayData = (absensi) => {
    const isRekap = filterKajian !== 'all';
    const userId = absensi.userId?._id || absensi.userId;
    const kajianId = absensi.kajianId?._id || absensi.kajianId;

    return {
      nama: isRekap ? absensi.nama : absensi.userId?.nama,
      email: isRekap ? absensi.email : absensi.userId?.email,
      kajianJudul: isRekap ? absensi.kajianJudul : absensi.kajianId?.judul || kajianMap[String(kajianId)]?.judul,
      tanggal: isRekap ? absensi.kajianTanggal : absensi.tanggal,
      userId,
      kajianId,
    };
  };

  const filteredAbsensi = absensiList.filter(absensi => {
    const displayData = getDisplayData(absensi);
    const searchValue = searchTerm.trim().toLowerCase();
    const nama = String(displayData.nama || '').toLowerCase();
    const kajianJudul = String(displayData.kajianJudul || '').toLowerCase();

    const matchSearch = !searchValue || nama.includes(searchValue) || kajianJudul.includes(searchValue);
    const matchDate = !filterDate || getDateInputValue(displayData.tanggal) === filterDate;

    return matchSearch && matchDate;
  });

  const handleViewDetail = (absensi) => {
    setSelectedAbsensi(absensi);
  };

  const handleDelete = async (absensi) => {
    if (!absensi._id) return;

    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus data absensi ini?');
    if (!confirmed) return;

    try {
      await absensiApi.deleteAbsensi(absensi._id);
      setSelectedAbsensi((current) => current?._id === absensi._id ? null : current);
      setShowPhotoPreview(false);

      if (filterKajian === 'all') {
        await fetchAllAbsensi();
      } else if (filterKajian) {
        await fetchAbsensiByKajian(filterKajian);
      }

      showSuccess('Absensi berhasil dihapus');
    } catch (err) {
      showError(err.response?.data?.message || 'Gagal menghapus absensi');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl md:mb-8">Data Absensi</h1>

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

      <Card>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama jamaah atau kajian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={false}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              disabled={false}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterKajian}
              onChange={(e) => setFilterKajian(e.target.value)}
              disabled={loadingKajian}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">Semua Kajian</option>
              {kajianList.map(k => (
                <option key={k._id} value={k._id}>{k.judul}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingKajian && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Memuat daftar kajian...</p>
          </div>
        )}


        {filterKajian && loadingAbsensi && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-500">
              {filterKajian === 'all' ? 'Memuat semua data absensi...' : 'Memuat data absensi...'}
            </p>
          </div>
        )}

        {filterKajian && !loadingAbsensi && !loadingKajian && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Jamaah</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kajian</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Waktu</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Metode</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbsensi.map((absensi, index) => {
                    const displayData = getDisplayData(absensi);
                    const status = absensi.status;
                    
                    // Determine badge variant based on status
                    let badgeVariant = 'default';
                    if (status === 'hadir') badgeVariant = 'success';
                    else if (status === 'tidak_hadir') badgeVariant = 'danger';
                    else if (status === 'belum_presensi') badgeVariant = 'warning';

                    // Format status for display
                    const statusDisplay = status === 'hadir' ? 'Hadir' :
                                         status === 'belum_presensi' ? 'Belum Presensi' :
                                         status === 'tidak_hadir' ? 'Tidak Hadir' : '-';

                    return (
                      <tr key={absensi._id || `${displayData.kajianId}-${displayData.userId}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{displayData.nama || '-'}</td>
                        <td className="py-3 px-4">{displayData.kajianJudul || '-'}</td>
                        <td className="py-3 px-4">{formatDate(displayData.tanggal)}</td>
                        <td className="py-3 px-4">{absensi.waktu || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={badgeVariant}>{statusDisplay}</Badge>
                        </td>
                        <td className="py-3 px-4">{absensi.metode || '-'}</td>
                        <td className="py-3 px-4">
                          {status === 'hadir' && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleViewDetail(absensi)}
                                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                              >
                                Detail
                              </button>
                              {absensi._id && (
                                <button
                                  onClick={() => handleDelete(absensi)}
                                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {filteredAbsensi.map((absensi) => {
                const displayData = getDisplayData(absensi);
                const status = absensi.status;
                const statusDisplay = status === 'hadir' ? 'Hadir' :
                  status === 'belum_presensi' ? 'Belum Presensi' :
                  status === 'tidak_hadir' ? 'Tidak Hadir' : '-';

                return (
                  <div
                    key={absensi._id || `${displayData.kajianId}-${displayData.userId}`}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-gray-900">{displayData.nama || '-'}</h2>
                        <p className="mt-1 truncate text-sm text-gray-500">{displayData.kajianJudul || '-'}</p>
                      </div>
                      <Badge variant={status === 'hadir' ? 'success' : status === 'belum_presensi' ? 'warning' : 'danger'}>
                        {statusDisplay}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Tanggal</p>
                        <p className="mt-1 truncate font-medium text-gray-700">{formatDate(displayData.tanggal)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Waktu</p>
                        <p className="mt-1 truncate font-medium text-gray-700">{absensi.waktu || '-'}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Metode</p>
                      <p className="mt-1 truncate text-sm font-medium text-gray-700">{absensi.metode || '-'}</p>
                    </div>

                    {status === 'hadir' && (
                      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                        <button
                          onClick={() => handleViewDetail(absensi)}
                          className="min-h-10 flex-1 rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100"
                        >
                          Detail
                        </button>
                        {absensi._id && (
                          <button
                            onClick={() => handleDelete(absensi)}
                            className="min-h-10 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredAbsensi.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {filterKajian !== 'all' && absensiList.length === 0
                  ? 'Tidak ada jamaah aktif untuk kajian ini.'
                  : 'Tidak ada data yang sesuai dengan pencarian atau filter.'}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedAbsensi && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Detail Absensi</h2>
              <button
                onClick={() => setSelectedAbsensi(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                const displayData = getDisplayData(selectedAbsensi);
                const isHadir = selectedAbsensi.status === 'hadir';
                const statusDisplay = selectedAbsensi.status === 'hadir' ? 'Hadir' :
                  selectedAbsensi.status === 'belum_presensi' ? 'Belum Presensi' : 'Tidak Hadir';
                return (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Nama</p>
                      <p className="text-lg font-semibold text-gray-900">{displayData.nama || '-'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-medium">Kajian</p>
                      <p className="text-lg font-semibold text-gray-900">{displayData.kajianJudul || '-'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Tanggal</p>
                        <p className="text-base font-semibold text-gray-900">{formatDate(displayData.tanggal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Waktu</p>
                        <p className="text-base font-semibold text-gray-900">{selectedAbsensi.waktu || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Status</p>
                        <Badge variant={selectedAbsensi.status === 'hadir' ? 'success' : selectedAbsensi.status === 'belum_presensi' ? 'warning' : 'danger'}>
                          {statusDisplay}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Metode</p>
                        <p className="text-base font-semibold text-gray-900">{selectedAbsensi.metode || '-'}</p>
                      </div>
                    </div>

                    {isHadir && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Lokasi</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={18} className="text-primary-600" />
                            <p className="text-base font-semibold text-gray-900">{selectedAbsensi.lokasi || '-'}</p>
                          </div>
                        </div>

                        {selectedAbsensi.latitude !== undefined && selectedAbsensi.longitude !== undefined && (
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Koordinat</p>
                            <p className="text-base font-semibold text-gray-900">
                              {Number(selectedAbsensi.latitude).toFixed(6)}, {Number(selectedAbsensi.longitude).toFixed(6)}
                            </p>
                            {selectedAbsensi.distance !== undefined && selectedAbsensi.distance !== null && (
                              <p className="text-sm text-gray-500 mt-1">Jarak: ±{Number(selectedAbsensi.distance).toFixed(0)} meter</p>
                            )}
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-500 font-medium">Foto Peserta</p>
                          {selectedAbsensi.foto ? (
                            <>
                              <div
                                onClick={() => setShowPhotoPreview(true)}
                                className="mt-2 bg-gray-100 rounded-lg w-48 h-48 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
                              >
                                <img
                                  src={selectedAbsensi.foto}
                                  alt="Foto Peserta"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Klik foto untuk memperbesar</p>
                            </>
                          ) : (
                            <p className="mt-2 text-gray-500">-</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {showPhotoPreview && selectedAbsensi && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowPhotoPreview(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
            <div className="bg-gray-100 rounded-lg w-96 h-96 flex items-center justify-center overflow-hidden">
              {selectedAbsensi.foto ? (
                <img 
                  src={selectedAbsensi.foto} 
                  alt="Foto Peserta" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="text-gray-400" size={96} />
              )}
            </div>
            <p className="text-white text-center mt-4 text-sm">Foto Peserta Absensi</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAbsensi;
