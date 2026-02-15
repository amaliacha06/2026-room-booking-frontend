import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RoomsPage from "./pages/RoomsPage";
import BookingHistoryPage from './pages/BookingHistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Jika user buka alamat utama, arahkan ke login dulu */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/history" element={<BookingHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;