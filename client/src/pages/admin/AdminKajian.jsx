import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { kajianApi } from '../../api/kajianApi';
import { Plus, Eye, Edit, Trash2, Calendar, MapPin, User, X } from 'lucide-react';
import useNotification from '../../hooks/useNotification';
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MAIN_LOCATION_NAME = 'Masjid Al-Fatonah, Yogyakarta, Gamping, Sleman, Balecatur, Temuwuh Kidul, Perumahan PBA';

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click: (event) => onSelect(event.latlng),
  });
  return null;
};

const MapViewController = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 16);
    }
  }, [location, map]);

  return null;
};

const LocationSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) {
      setResults([]);
      setSearchError('');
      setSearchLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');

      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          format: 'jsonv2',
          limit: '5',
          'accept-language': 'id',
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Nominatim request failed');
        }

        const data = await response.json();
        setResults(data);
        if (data.length === 0) {
          setSearchError('Lokasi tidak ditemukan. Coba gunakan nama tempat atau alamat yang lebih lengkap.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error searching location:', error);
          setResults([]);
          setSearchError('Pencarian lokasi gagal. Periksa koneksi internet lalu coba lagi.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (result) => {
    onSelect({
      lat: Number(result.lat),
      lng: Number(result.lon),
      locationName: result.display_name,
    });
    setQuery(result.display_name);
    setResults([]);
    setSearchError('');
  };

  return (
    <div className="mb-4">
      <label htmlFor="location-search" className="block text-sm font-medium text-gray-700 mb-2">
        Cari lokasi
      </label>
      <input
        id="location-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="🔍 Cari lokasi..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {searchLoading && (
        <p className="mt-2 text-sm text-gray-500">Mencari lokasi...</p>
      )}
      {searchError && !searchLoading && (
        <p className="mt-2 text-sm text-red-600">{searchError}</p>
      )}
      {results.length > 0 && (
        <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleSelect(result)}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-400">Pencarian menggunakan Nominatim dan OpenStreetMap.</p>
    </div>
  );
};

const AdminKajian = () => {
  const [kajianList, setKajianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailKajian, setDetailKajian] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedKajian, setSelectedKajian] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    pemateri: '',
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    lokasi: '',
    latitude: null,
    longitude: null,
    radius: 50,
    status: 'aktif'
  });
  const [locationMode, setLocationMode] = useState('');
  const [mainLocation, setMainLocation] = useState(null);
  const [mapPoint, setMapPoint] = useState(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState('');
  const [formError, setFormError] = useState('');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchKajianList();
    fetchMainLocation();
  }, []);

  const fetchMainLocation = async () => {
    try {
      const response = await kajianApi.getMainLocation();
      setMainLocation(response.data.data.location || null);
    } catch (error) {
      console.error('Error fetching main location:', error);
    }
  };

  const fetchKajianList = async () => {
    try {
      setLoading(true);
      const response = await kajianApi.getAllKajian();
      setKajianList(response.data.data.kajian);
    } catch (error) {
      console.error('Error fetching kajian list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (kajian = null) => {
    if (kajian) {
      setIsEditMode(true);
      setSelectedKajian(kajian);
      setFormData({
        judul: kajian.judul,
        deskripsi: kajian.deskripsi,
        pemateri: kajian.pemateri,
        tanggal: kajian.tanggal ? kajian.tanggal.split('T')[0] : '',
        jamMulai: kajian.jamMulai || '',
        jamSelesai: kajian.jamSelesai || '',
        lokasi: kajian.lokasi || '',
        latitude: kajian.latitude ?? null,
        longitude: kajian.longitude ?? null,
        radius: kajian.radius || 50,
        status: kajian.status
      });
      const isMainLocation = kajian.lokasi === MAIN_LOCATION_NAME;
      setLocationMode(isMainLocation ? 'main' : 'map');
      setMapPoint(!isMainLocation && Number.isFinite(kajian.latitude) && Number.isFinite(kajian.longitude)
        ? { lat: kajian.latitude, lng: kajian.longitude }
        : null);
    } else {
      setIsEditMode(false);
      setSelectedKajian(null);
      setFormData({
        judul: '',
        deskripsi: '',
        pemateri: '',
        tanggal: '',
        jamMulai: '',
        jamSelesai: '',
        lokasi: '',
        latitude: null,
        longitude: null,
        radius: 50,
        status: 'aktif'
      });
      setLocationMode('');
      setMapPoint(null);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedKajian(null);
  };

  const handleOpenDetail = async (kajian) => {
    setDetailLoading(true);
    setDetailKajian(null);
    setIsDetailModalOpen(true);

    try {
      const response = await kajianApi.getKajianById(kajian._id);
      setDetailKajian(response.data.data.kajian);
    } catch (error) {
      console.error('Error fetching kajian detail:', error);
      setIsDetailModalOpen(false);
      showError(error.response?.data?.message || 'Gagal mengambil detail kajian');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.judul.trim()) {
      setFormError('Judul kajian wajib diisi');
      return;
    }
    if (!formData.tanggal) {
      setFormError('Tanggal wajib diisi');
      return;
    }
    if (!formData.jamMulai) {
      setFormError('Jam mulai wajib diisi');
      return;
    }
    if (!formData.jamSelesai) {
      setFormError('Jam selesai wajib diisi');
      return;
    }
    if (formData.jamSelesai <= formData.jamMulai) {
      setFormError('Jam selesai harus lebih dari jam mulai');
      return;
    }
    if (!formData.lokasi.trim()) {
      setFormError('Lokasi wajib diisi');
      return;
    }
    if (!Number.isFinite(Number(formData.latitude)) || !Number.isFinite(Number(formData.longitude))) {
      setFormError('Koordinat lokasi wajib ditentukan');
      return;
    }
    if (!Number.isFinite(Number(formData.radius)) || Number(formData.radius) < 1) {
      setFormError('Radius harus berupa angka minimal 1 meter');
      return;
    }

    try {
      if (isEditMode) {
        await kajianApi.updateKajian(selectedKajian._id, formData);
      } else {
        await kajianApi.createKajian(formData);
      }
      await fetchKajianList();
      handleCloseModal();
      showSuccess(isEditMode ? 'Data kajian berhasil diperbarui' : 'Kajian baru berhasil ditambahkan');
    } catch (error) {
      console.error('Error saving kajian:', error);
      setFormError(error.response?.data?.message || 'Gagal menyimpan kajian');
    }
  };

  const formatJadwal = (kajian) => {
    if (kajian.tanggal && kajian.jamMulai && kajian.jamSelesai) {
      const date = new Date(kajian.tanggal);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[date.getDay()];
      const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      return `${dayName}, ${formattedDate}\n${kajian.jamMulai} - ${kajian.jamSelesai}`;
    }
    return kajian.jadwal || '-';
  };

  const handleSetMainLocation = () => {
    setLocationErrorMessage('');
    if (!navigator.geolocation) {
      setLocationErrorMessage('Browser tidak mendukung geolocation.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLoading(false);
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        kajianApi.saveMainLocation({ latitude, longitude })
          .then((response) => {
            setMainLocation(response.data.data.location);
            showSuccess('Lokasi utama Masjid Al-Fatonah berhasil disimpan');
          })
          .catch((error) => {
            setLocationErrorMessage(error.response?.data?.message || 'Gagal menyimpan lokasi utama.');
          });
      },
      (err) => {
        setLocationLoading(false);
        let message = 'Gagal mengambil lokasi. Silakan coba lagi.';
        if (err.code === 1) {
          message = 'Izin lokasi ditolak. Silakan izinkan akses lokasi pada browser.';
        } else if (err.code === 2) {
          message = 'Lokasi tidak dapat ditemukan. Pastikan GPS/lokasi perangkat aktif.';
        } else if (err.code === 3) {
          message = 'Pengambilan lokasi terlalu lama. Silakan coba lagi.';
        }
        setLocationErrorMessage(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSelectMainLocation = () => {
    if (!mainLocation) {
      setLocationErrorMessage('Tetapkan lokasi utama Masjid Al-Fatonah terlebih dahulu.');
      return;
    }
    setLocationMode('main');
    setMapPoint(null);
    setFormData({
      ...formData,
      lokasi: MAIN_LOCATION_NAME,
      latitude: mainLocation.latitude,
      longitude: mainLocation.longitude,
    });
    setIsLocationPickerOpen(false);
    setLocationErrorMessage('');
  };

  const handleSelectMapLocation = ({ lat, lng, locationName }) => {
    setLocationMode('map');
    setMapPoint({ lat, lng });
    setFormData({
      ...formData,
      lokasi: locationName || (formData.lokasi && formData.lokasi !== MAIN_LOCATION_NAME ? formData.lokasi : 'Lokasi alternatif'),
      latitude: lat,
      longitude: lng,
    });
    setLocationErrorMessage('');
  };

  const handleDelete = async (id) => {
    try {
      await kajianApi.deleteKajian(id);
      setKajianList(kajianList.filter(k => k._id !== id));
      showSuccess('Data kajian berhasil dihapus');
    } catch (error) {
      console.error('Error deleting kajian:', error);
      showError('Gagal menghapus data kajian');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Data Kajian</h1>
        <div className="flex gap-3">
          <button
            onClick={handleSetMainLocation}
            disabled={locationLoading}
            className="flex items-center gap-2 border border-primary-600 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50"
          >
            <MapPin size={20} />
            {locationLoading ? 'Menyimpan Lokasi...' : 'Tetapkan Lokasi Utama'}
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Tambah Kajian
          </button>
        </div>
      </div>

      {locationErrorMessage && !isLocationPickerOpen && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {locationErrorMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kajianList.map((kajian) => (
            <Card key={kajian._id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={kajian.status === 'aktif' ? 'success' : 'warning'}>
                  {kajian.status}
                </Badge>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDetail(kajian)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                    title="Detail"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleOpenModal(kajian)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(kajian._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{kajian.judul}</h3>
              <p className="text-gray-600 text-sm mb-4">{kajian.deskripsi}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <span>{kajian.pemateri}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="whitespace-pre-line">{formatJadwal(kajian)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{kajian.lokasi}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && kajianList.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Tidak ada data kajian yang ditemukan
        </div>
      )}

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Kajian"
      >
        {detailLoading ? (
          <div className="text-center py-6 text-gray-500">Memuat detail kajian...</div>
        ) : detailKajian ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <p className="text-sm text-gray-500">Judul Kajian</p>
              <p className="font-semibold text-gray-900">{detailKajian.judul}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deskripsi</p>
              <p className="font-medium text-gray-900">{detailKajian.deskripsi || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pemateri</p>
              <p className="font-medium text-gray-900">{detailKajian.pemateri}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tanggal</p>
                <p className="font-medium text-gray-900">
                  {detailKajian.tanggal
                    ? new Date(detailKajian.tanggal).toLocaleDateString('id-ID')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={detailKajian.status === 'aktif' ? 'success' : 'warning'}>
                  {detailKajian.status || '-'}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Jam Mulai</p>
                <p className="font-medium text-gray-900">{detailKajian.jamMulai || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jam Selesai</p>
                <p className="font-medium text-gray-900">{detailKajian.jamSelesai || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="font-medium text-gray-900">{detailKajian.lokasi || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Radius</p>
                <p className="font-medium text-gray-900">{detailKajian.radius ?? '-'} meter</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Koordinat</p>
                <p className="font-medium text-gray-900">
                  {detailKajian.latitude ?? '-'}, {detailKajian.longitude ?? '-'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Edit Kajian' : 'Tambah Kajian'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Judul Kajian</label>
            <input
              type="text"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Pemateri</label>
            <input
              type="text"
              value={formData.pemateri}
              onChange={(e) => setFormData({ ...formData, pemateri: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Tanggal</label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Jam Mulai</label>
              <input
                type="time"
                value={formData.jamMulai}
                onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Jam Selesai</label>
              <input
                type="time"
                value={formData.jamSelesai}
                onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Lokasi</label>
            <select
              value={locationMode}
              onChange={(e) => {
                const mode = e.target.value;
                if (mode === 'main') handleSelectMainLocation();
                if (mode === 'map') {
                  setLocationMode('map');
                  setIsLocationPickerOpen(true);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Pilih sumber lokasi...</option>
              <option value="main">Masjid Al-Fatonah</option>
              <option value="map">Pilih Lokasi dari Peta</option>
            </select>
            {formData.lokasi && (
              <div className="mt-2 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
                <p className="font-medium text-gray-800">{formData.lokasi}</p>
                <p>Latitude: {formData.latitude ?? '-'}</p>
                <p>Longitude: {formData.longitude ?? '-'}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Radius Presensi (meter)</label>
            <input
              type="number"
              min="1"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Jamaah harus berada dalam radius ini dari lokasi kajian.</p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {isEditMode ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Location Picker Modal */}
      {isLocationPickerOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Pilih Lokasi</h3>
              <button
                onClick={() => {
                  setIsLocationPickerOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Cari lokasi atau klik peta untuk menentukan titik lokasi kajian.</p>
            <LocationSearch onSelect={handleSelectMapLocation} />
            <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
              <MapContainer
                center={mapPoint || (mainLocation ? { lat: mainLocation.latitude, lng: mainLocation.longitude } : { lat: -7.7956, lng: 110.3695 })}
                zoom={15}
                style={{ height: '280px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewController location={mapPoint} />
                <MapClickHandler onSelect={handleSelectMapLocation} />
                {mapPoint && (
                  <CircleMarker center={mapPoint} radius={10} pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.8 }} />
                )}
              </MapContainer>
            </div>
            {locationMode === 'map' && (
              <input
                type="text"
                value={formData.lokasi === MAIN_LOCATION_NAME ? '' : formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Nama lokasi alternatif"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              />
            )}
            {locationLoading && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
                Mengambil lokasi...
              </div>
            )}
            {locationErrorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {locationErrorMessage}
              </div>
            )}
            {mapPoint && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <p>Latitude: {mapPoint.lat}</p>
                <p>Longitude: {mapPoint.lng}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKajian;
