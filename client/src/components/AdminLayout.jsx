import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        navigate('/login');
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 min-w-0 w-full bg-gray-50 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden bg-gradient-to-r from-primary-900 to-primary-800 border-b border-primary-700/50 p-4 flex items-center gap-4 sticky top-0 z-30">

          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Buka menu navigasi"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10"
          >
            <Menu size={26} strokeWidth={2.5} />
          </button>

          <div>
            <h1 className="font-bold text-white text-sm">Masjid Al-Fatonah</h1>
            <p className="text-xs text-emerald-200">Portal Admin</p>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
