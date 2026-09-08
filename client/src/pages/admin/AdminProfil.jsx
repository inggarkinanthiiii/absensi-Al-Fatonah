import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, MapPin, Calendar, Edit, LogOut } from 'lucide-react';
import useNotification from '../../hooks/useNotification';

const AdminProfil = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    telepon: user?.telepon || ''
  });
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    setFormData({
      nama: user?.nama || '',
      email: user?.email || '',
      telepon: user?.telepon || ''
    });
  }, [user]);

  const handleSave = async () => {
    const result = await updateProfile(formData);

    if (!result.success) {
      showError(result.message);
      return;
    }

    setFormData({
      nama: result.user.nama,
      email: result.user.email,
      telepon: result.user.telepon
    });
    setIsEditing(false);
    showSuccess('Profil berhasil diperbarui');
  };

  const handleCancel = () => {
    setFormData({
      nama: user?.nama || '',
      email: user?.email || '',
      telepon: user?.telepon || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    showInfo('Anda telah keluar');
    logout();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profil Admin</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="w-32 h-32 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-600">
                {formData.nama.charAt(0)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{formData.nama}</h2>
            <p className="text-gray-600 mt-1">{user?.role}</p>
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
              <div>
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="font-medium">{user?.alamat || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Tanggal Bergabung</p>
                <p className="font-medium">
                  {user?.tanggalRegistrasi
                    ? new Date(user.tanggalRegistrasi).toLocaleDateString('id-ID')
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
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
    </div>
  );
};

export default AdminProfil;
