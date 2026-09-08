import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  Bell, 
  User,
  X 
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { unreadCount } = useNotification();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/jamaah', icon: Users, label: 'Data Jamaah' },
    { path: '/admin/kajian', icon: BookOpen, label: 'Data Kajian' },
    { path: '/admin/absensi', icon: CheckSquare, label: 'Data Absensi' },
    { path: '/admin/analitik', icon: BarChart3, label: 'Analitik' },
    { path: '/admin/notifikasi', icon: Bell, label: 'Notifikasi', showBadge: true },
    { path: '/admin/laporan', icon: FileText, label: 'Laporan' },
    { path: '/admin/profil', icon: User, label: 'Profil' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary-900 to-primary-800 min-h-screen text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-primary-700/50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Masjid Al-Fatonah</h1>
            <p className="text-xs text-primary-300 mt-1 font-medium">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-primary-200 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-primary-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  {item.showBadge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
