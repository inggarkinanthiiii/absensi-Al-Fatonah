import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import useNotification from '../../hooks/useNotification';
import { faceApi } from '../../api/faceApi';
import { Mail, Phone, MapPin, Calendar, Edit, LogOut, Camera, X } from 'lucide-react';

const JamaahProfil = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [faceData, setFaceData] = useState(null);
  const { showSuccess, showError, showInfo } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showFacePhotoPreview, setShowFacePhotoPreview] = useState(false);
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    telepon: user?.telepon || '',
    alamat: user?.alamat || ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  const handleSave = async () => {
    setFormError('');

    if (!formData.nama.trim()) {
      setFormError('Nama wajib diisi');
      return;
    }

    if (!formData.email.trim()) {
      setFormError('Email wajib diisi');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Format email tidak valid');
      return;
    }

    if (!formData.telepon.trim()) {
      setFormError('Nomor telepon wajib diisi');
      return;
    }

    if (!formData.alamat.trim()) {
      setFormError('Alamat wajib diisi');
      return;
    }

    const result = await updateProfile(formData);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    setIsEditing(false);
    showSuccess('Profil berhasil diperbarui');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.oldPassword) {
      setPasswordError('Password lama wajib diisi');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('Password baru wajib diisi');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok');
      return;
    }

    const result = await changePassword({
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    });

    if (!result.success) {
      setPasswordError(result.message);
      return;
    }

    setIsChangingPassword(false);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    showSuccess('Password berhasil diubah');
  };

  const handleLogout = () => {
    showInfo('Anda telah keluar');
    logout();
  };
  useEffect(() => {
    const fetchFaceData = async () => {
      try {
        if (!user?._id) return;

        const response = await faceApi.getFaceDataByUserId(user._id);
        setFaceData(response.data.data);
      } catch (error) {
        console.error('Gagal mengambil data wajah:', error);
        setFaceData(null);
      }
    };

    fetchFaceData();
  }, [user?._id]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profil Jamaah</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    alt={`Foto wajah ${formData.nama}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary-600">
                    {formData.nama.charAt(0)}
                  </span>
                )}

              </div>
              {faceData?.foto && (
                <p className="text-xs text-gray-400 mt-1">
                  Klik untuk memperbesar
                </p>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{formData.nama}</h2>

            <Badge variant="success" className="mt-2">
              Aktif
            </Badge>

            <p className="text-gray-600 mt-1">Jamaah Masjid Al-Fatonah</p>

            <div className="mt-4">
              <p className="text-sm text-gray-600">Foto Wajah</p>

              {faceData?.foto ? (
                <p className="text-xs text-green-600">Terdaftar</p>
              ) : (
                <p className="text-xs text-red-600">Belum terdaftar</p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 flex items-center gap-2 justify-center w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Informasi Profil</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit size={20} />
                Edit Profil
              </button>
            )}
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {formError}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Nama</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                  />
                ) : (
                  <p className="font-medium">{formData.nama}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                  />
                ) : (
                  <p className="font-medium">{formData.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Telepon</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                  />
                ) : (
                  <p className="font-medium">{formData.telepon}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Alamat</p>
                {isEditing ? (
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1 resize-none"
                    rows="3"
                  />
                ) : (
                  <p className="font-medium">{formData.alamat}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Tanggal Registrasi</p>
                <p className="font-medium">{user?.tanggalRegistrasi || '01 Januari 2024'}</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Password Change Section */}
      <Card className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Ubah Password</h3>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit size={20} />
              Ubah Password
            </button>
          )}
        </div>

        {passwordError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {passwordError}
          </div>
        )}

        {isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Lama</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ubah Password
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">Password belum diubah. Klik "Ubah Password" untuk mengubah password Anda.</p>
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
                  alt={`Foto wajah ${formData.nama}`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <p className="text-white text-center mt-4 text-sm">
              Foto Wajah Jamaah
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JamaahProfil;
