import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/AdminLayout';
import JamaahLayout from './components/JamaahLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJamaah from './pages/admin/AdminJamaah';
import AdminJamaahDetail from './pages/admin/AdminJamaahDetail';
import AdminKajian from './pages/admin/AdminKajian';
import AdminAbsensi from './pages/admin/AdminAbsensi';
import AdminAnalitik from './pages/admin/AdminAnalitik';
import AdminNotifikasi from './pages/admin/AdminNotifikasi';
import AdminLaporan from './pages/admin/AdminLaporan';
import AdminProfil from './pages/admin/AdminProfil';
import { NotificationProvider } from './context/NotificationContext';

// Jamaah Pages
import JamaahDashboard from './pages/jamaah/JamaahDashboard';
import JamaahRegistrasiWajah from './pages/jamaah/JamaahRegistrasiWajah';
import JamaahAbsensi from './pages/jamaah/JamaahAbsensi';
import JamaahRiwayat from './pages/jamaah/JamaahRiwayat';
import JamaahProfil from './pages/jamaah/JamaahProfil';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="jamaah" element={<AdminJamaah />} />
              <Route path="jamaah/:id" element={<AdminJamaahDetail />} />
              <Route path="kajian" element={<AdminKajian />} />
              <Route path="absensi" element={<AdminAbsensi />} />
              <Route path="analitik" element={<AdminAnalitik />} />
              <Route path="notifikasi" element={<AdminNotifikasi />} />
              <Route path="laporan" element={<AdminLaporan />} />
              <Route path="profil" element={<AdminProfil />} />
            </Route>

            {/* Jamaah Routes */}
            <Route path="/jamaah" element={<JamaahLayout />}>
              <Route path="dashboard" element={<JamaahDashboard />} />
              <Route path="registrasi-wajah" element={<JamaahRegistrasiWajah />} />
              <Route path="absensi" element={<JamaahAbsensi />} />
              <Route path="riwayat" element={<JamaahRiwayat />} />
              <Route path="profil" element={<JamaahProfil />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>

        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
