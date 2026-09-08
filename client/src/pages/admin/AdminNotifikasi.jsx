import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, Trash2 } from 'lucide-react';
import useNotificationHook from '../../hooks/useNotification';

const AdminNotifikasi = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotification();
  const { showSuccess, showError } = useNotificationHook();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    setLoading(false);
  }, [fetchNotifications]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <p className="text-gray-500">Memuat notifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-1">{unreadCount} notifikasi belum dibaca</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => {
              markAllAsRead();
              showSuccess('Semua notifikasi ditandai sebagai dibaca');
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Check size={20} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif._id} className={`flex items-start gap-4 ${!notif.isRead ? 'border-l-4 border-primary-600' : ''}`}>
            <div className={`p-3 rounded-full ${!notif.isRead ? 'bg-primary-100' : 'bg-gray-100'}`}>
              <Bell className={!notif.isRead ? 'text-primary-600' : 'text-gray-400'} size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                <div className="flex gap-2">
                  {!notif.isRead && (
                    <button
                      onClick={() => {
                        markAsRead(notif._id);
                        showSuccess('Notifikasi ditandai sebagai dibaca');
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Tandai dibaca"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      deleteNotification(notif._id);
                      showSuccess('Notifikasi dihapus');
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-1">{notif.message}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-gray-500">{formatDate(notif.createdAt)}</span>
                <span className="text-sm text-gray-500">{formatTime(notif.createdAt)}</span>
                {!notif.isRead && (
                  <Badge variant="primary">Baru</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Bell className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-500">Tidak ada notifikasi</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminNotifikasi;
