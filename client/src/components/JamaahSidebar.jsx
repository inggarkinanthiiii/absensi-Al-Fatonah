import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  CheckSquare,
  History,
  User,
} from 'lucide-react';

const JamaahSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/jamaah/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/jamaah/registrasi-wajah',
      icon: Camera,
      label: 'Registrasi Wajah',
    },
    {
      path: '/jamaah/absensi',
      icon: CheckSquare,
      label: 'Absensi',
    },
    {
      path: '/jamaah/riwayat',
      icon: History,
      label: 'Riwayat Absensi',
    },
    {
      path: '/jamaah/profil',
      icon: User,
      label: 'Profil',
    },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:static lg:w-64 lg:min-h-screen lg:flex-col bg-gradient-to-b from-primary-900 to-primary-800 text-white">

        {/* Header */}
        <div className="p-6 border-b border-primary-700/50">
          <h1 className="text-xl font-bold tracking-tight">
            Masjid Al-Fatonah
          </h1>
          <p className="text-xs text-primary-300 mt-1 font-medium">
            Portal Jamaah
          </p>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-primary-200 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-900 to-primary-800 text-white border-t border-primary-700/50 shadow-2xl">
        <nav className="flex items-center justify-around px-2 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl min-w-16 transition-all duration-200 ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-primary-300'
                  }`}
              >
                <Icon size={20} />

                <span className="text-[10px] font-medium text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default JamaahSidebar;