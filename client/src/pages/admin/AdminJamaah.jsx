import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { userApi } from '../../api/userApi';
import { Search, Plus, Edit, Trash2, Eye, Power } from 'lucide-react';
import useNotification from '../../hooks/useNotification';

const AdminJamaah = () => {
  const [jamaahList, setJamaahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJamaah, setSelectedJamaah] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'deactivate', 'activate', 'add', or 'edit'
  const [newJamaah, setNewJamaah] = useState({
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
    password: '',
    confirmPassword: '',
    status: 'aktif'
  });
  const [formError, setFormError] = useState('');
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    fetchJamaahList();
  }, []);

  const fetchJamaahList = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers({ role: 'jamaah' });
      setJamaahList(response.data.data.users);
    } catch (error) {
      console.error('Error fetching jamaah list:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJamaah = jamaahList.filter(j =>
    j.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await userApi.deleteUser(id);
      setJamaahList(jamaahList.filter(j => j._id !== id));
      showSuccess('Data jamaah berhasil dihapus');
    } catch (error) {
      console.error('Error deleting jamaah:', error);
      showError('Gagal menghapus data jamaah');
    }
  };

  const handleToggleStatus = (jamaah, action) => {
    setSelectedJamaah(jamaah);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (selectedJamaah) {
      try {
        await userApi.toggleUserStatus(selectedJamaah._id);
        await fetchJamaahList();
        const action = selectedJamaah.status === 'aktif' ? 'dinonaktifkan' : 'diaktifkan kembali';
        showSuccess(`Akun jamaah berhasil ${action}`);
      } catch (error) {
        console.error('Error toggling status:', error);
        showError('Gagal mengubah status jamaah');
      }
    }
    setIsModalOpen(false);
    setSelectedJamaah(null);
    setModalAction(null);
  };

  const handleAddJamaah = () => {
    setModalAction('add');
    setNewJamaah({
      nama: '',
      email: '',
      telepon: '',
      alamat: '',
      password: '',
      confirmPassword: '',
      status: 'aktif'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEditJamaah = (jamaah) => {
    setSelectedJamaah(jamaah);
    setModalAction('edit');
    setNewJamaah({
      nama: jamaah.nama,
      email: jamaah.email,
      telepon: jamaah.telepon,
      alamat: jamaah.alamat,
      password: '',
      confirmPassword: '',
      status: jamaah.status
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveNewJamaah = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!newJamaah.nama.trim()) {
      setFormError('Nama wajib diisi');
      return;
    }
    if (!newJamaah.email.trim()) {
      setFormError('Email wajib diisi');
      return;
    }
    if (!newJamaah.email.includes('@')) {
      setFormError('Format email tidak valid');
      return;
    }
    if (!newJamaah.telepon.trim()) {
      setFormError('Nomor telepon wajib diisi');
      return;
    }
    if (!newJamaah.alamat.trim()) {
      setFormError('Alamat wajib diisi');
      return;
    }
    if (modalAction === 'add' && !newJamaah.password) {
      setFormError('Password wajib diisi');
      return;
    }
    if (newJamaah.password && newJamaah.password.length < 6) {
      setFormError('Password minimal 6 karakter');
      return;
    }
    if (newJamaah.password !== newJamaah.confirmPassword) {
      setFormError('Konfirmasi password tidak cocok');
      return;
    }

    try {
      if (modalAction === 'add') {
        const userData = {
          nama: newJamaah.nama,
          email: newJamaah.email,
          telepon: newJamaah.telepon,
          alamat: newJamaah.alamat,
          password: newJamaah.password,
          role: 'jamaah',
          status: newJamaah.status
        };
        await userApi.createUser(userData);
      } else if (modalAction === 'edit' && selectedJamaah) {
        const userData = {
          nama: newJamaah.nama,
          email: newJamaah.email,
          telepon: newJamaah.telepon,
          alamat: newJamaah.alamat,
          status: newJamaah.status
        };
        if (newJamaah.password) {
          userData.password = newJamaah.password;
        }
        await userApi.updateUser(selectedJamaah._id, userData);
      }
      await fetchJamaahList();
      setIsModalOpen(false);
      setNewJamaah({
        nama: '',
        email: '',
        telepon: '',
        alamat: '',
        password: '',
        confirmPassword: '',
        status: 'aktif'
      });
      setSelectedJamaah(null);
      setModalAction(null);
      setFormError('');
      showSuccess(modalAction === 'edit' ? 'Data jamaah berhasil diperbarui' : 'Jamaah baru berhasil ditambahkan');
    } catch (error) {
      console.error('Error saving jamaah:', error);
      setFormError(error.response?.data?.message || 'Gagal menyimpan data jamaah');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Data Jamaah</h1>
        <button 
          onClick={handleAddJamaah}
          className="flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm text-white transition-colors hover:bg-primary-700 sm:px-4"
        >
          <Plus size={20} />
          Tambah Jamaah
        </button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari jamaah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Telepon</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredJamaah.map((jamaah, index) => (
                  <tr key={jamaah._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 font-medium">{jamaah.nama}</td>
                    <td className="py-3 px-4">{jamaah.email}</td>
                    <td className="py-3 px-4">{jamaah.telepon}</td>
                    <td className="py-3 px-4">
                      <Badge variant={jamaah.status === 'aktif' ? 'success' : 'danger'}>{jamaah.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/jamaah/${jamaah._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Detail"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(jamaah, jamaah.status === 'aktif' ? 'deactivate' : 'activate')}
                          className={`p-2 ${jamaah.status === 'aktif' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'} rounded`}
                          title={jamaah.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => handleEditJamaah(jamaah)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(jamaah._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

          <div className="space-y-3 md:hidden">
            {filteredJamaah.map((jamaah) => (
              <div
                key={jamaah._id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-gray-900">{jamaah.nama}</h2>
                    <p className="mt-1 truncate text-sm text-gray-500">{jamaah.email}</p>
                  </div>
                  <Badge variant={jamaah.status === 'aktif' ? 'success' : 'danger'}>
                    {jamaah.status}
                  </Badge>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">No. Telepon</p>
                  <p className="mt-1 truncate text-sm font-medium text-gray-700">{jamaah.telepon}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                  <Link
                    to={`/admin/jamaah/${jamaah._id}`}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                  >
                    <Eye size={16} />
                    Detail
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(jamaah, jamaah.status === 'aktif' ? 'deactivate' : 'activate')}
                    className={`inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-2 ${jamaah.status === 'aktif' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    title={jamaah.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => handleEditJamaah(jamaah)}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-yellow-50 px-3 py-2 text-yellow-600 hover:bg-yellow-100"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(jamaah._id)}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            </div>
          </>
        )}

        {!loading && filteredJamaah.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data jamaah yang ditemukan
          </div>
        )}
      </Card>

      {/* Status Toggle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJamaah(null);
          setModalAction(null);
        }}
        title={modalAction === 'deactivate' ? 'Nonaktifkan Akun' : modalAction === 'activate' ? 'Aktifkan Akun' : modalAction === 'edit' ? 'Edit Jamaah' : 'Tambah Jamaah Baru'}
      >
        {(modalAction === 'add' || modalAction === 'edit') ? (
          <form onSubmit={handleSaveNewJamaah} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={newJamaah.nama}
                onChange={(e) => setNewJamaah({...newJamaah, nama: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newJamaah.email}
                onChange={(e) => setNewJamaah({...newJamaah, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
              <input
                type="tel"
                value={newJamaah.telepon}
                onChange={(e) => setNewJamaah({...newJamaah, telepon: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              <textarea
                value={newJamaah.alamat}
                onChange={(e) => setNewJamaah({...newJamaah, alamat: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="3"
              />
            </div>
            {modalAction === 'add' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={newJamaah.password}
                    onChange={(e) => setNewJamaah({...newJamaah, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={newJamaah.confirmPassword}
                    onChange={(e) => setNewJamaah({...newJamaah, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Akun</label>
              <select
                value={newJamaah.status}
                onChange={(e) => setNewJamaah({...newJamaah, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setNewJamaah({
                    nama: '',
                    email: '',
                    telepon: '',
                    alamat: '',
                    password: '',
                    confirmPassword: '',
                    status: 'Aktif'
                  });
                  setSelectedJamaah(null);
                  setModalAction(null);
                  setFormError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700"
              >
                {modalAction === 'edit' ? 'Simpan Perubahan' : 'Simpan'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              {modalAction === 'deactivate' 
                ? `Apakah Anda yakin ingin menonaktifkan akun ${selectedJamaah?.nama}?`
                : `Apakah Anda yakin ingin mengaktifkan kembali akun ${selectedJamaah?.nama}?`
              }
            </p>
            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedJamaah(null);
                  setModalAction(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmToggleStatus}
                className={`px-4 py-2 rounded-lg text-white ${
                  modalAction === 'deactivate' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {modalAction === 'deactivate' ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminJamaah;
