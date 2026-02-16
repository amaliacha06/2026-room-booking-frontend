import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RoomsPage from "./pages/RoomsPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import Sidebar from "./components/layout/Sidebar"; // Sesuaikan jalur folder Sidebar kamu

// Komponen Dashboard Admin Sederhana
const AdminDashboard = () => (
  <div className="flex">
    <Sidebar /> 
    <div className="flex-1 p-10">
      <h1 className="text-2xl font-bold text-blue-900">Dashboard Admin 🏗️</h1>
      <p className="mt-2 text-gray-500">Selamat datang kembali, Admin!</p>
    </div>
  </div>
);

// Komponen Persetujuan Admin Sederhana
const ManageBookings = () => (
  <div className="flex">
    <Sidebar /> 
    <div className="flex-1 p-10">
      <h1 className="text-2xl font-bold text-blue-900">Persetujuan Booking 📋</h1>
      <p className="mt-2 text-gray-500">Daftar booking yang perlu di-approve.</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Jika user buka alamat utama, arahkan ke login dulu */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Route User Biasa */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/history" element={<BookingHistoryPage />} />

        {/* --- TAMBAHKAN ROUTE ADMIN DI SINI --- */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<ManageBookings />} />
      </Routes>
    </Router>
  );
}

export default App;