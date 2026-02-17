import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import axios from "axios";
import { Users, DoorOpen, CalendarDays, ClipboardCheck, ChevronDown, Settings, LogOut } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  totalBookings: number;
  pendingBookings: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ 
    totalUsers: 0, totalRooms: 0, totalBookings: 0, pendingBookings: 0 
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Ambil data admin dari localStorage
  const userString = localStorage.getItem("user");
  const admin = userString ? JSON.parse(userString) : { fullName: "Admin System", email: "admin@pnc.ac.id" };

  // Fungsi inisial (persis dashboard user)
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 3);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Ambil data dari 3 API sekaligus agar akurat
        const [userRes, roomRes, bookingRes] = await Promise.all([
          axios.get("http://localhost:5135/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5135/api/room", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5135/api/bookings", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const allBookings = bookingRes.data;

        setStats({
          totalUsers: userRes.data.length, // Menghitung Admin1, Felicia, Amalia (3)
          totalRooms: roomRes.data.length, // Menghitung 4 ruangan
          totalBookings: allBookings.length, // Menghitung 7 data booking
          // Filter booking yang statusnya "PENDING" untuk verifikasi
          pendingBookings: allBookings.filter((b: any) => b.status?.toLowerCase() === "pending").length 
        });

        setLoading(false);
      } catch (error) {
        console.error("Gagal load dashboard data:", error);
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  // Statistik khusus Admin (Label disesuaikan)
  const adminStats = [
    { label: "Total Pengguna", value: stats.totalUsers, icon: Users, color: "bg-blue-500", light: "bg-blue-50" },
    { label: "Total Ruangan", value: stats.totalRooms, icon: DoorOpen, color: "bg-amber-500", light: "bg-indigo-50" },
    { label: "Total Booking", value: stats.totalBookings, icon: CalendarDays, color: "bg-green-500", light: "bg-green-50" },
    { label: "Perlu Verifikasi", value: stats.pendingBookings, icon: ClipboardCheck, color: "bg-red-500", light: "bg-amber-50" },
  ];

  return (
    <div className="flex bg-blue-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        
        {/* Profile Header (Styling persis Dashboard User) */}
        <header className="flex justify-end mb-8">
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group flex items-center gap-2 hover:scale-105 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-full bg-linear-to-tr from-cyan-400 via-blue-200 to-pink-400 p-0.5 shadow-md group-hover:shadow-purple-200">
                <div className="w-full h-full rounded-full bg-blue-800 flex items-center justify-center border-2 border-white">
                  <span className="text-white font-bold text-xs tracking-wider">{getInitials(admin.fullName)}</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm border border-blue-50 group-hover:border-blue-200">
                <ChevronDown size={14} className={`text-blue-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-blue-50/50 py-3 z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="px-5 py-3 bg-linear-to-tr from-blue-50/50 to-transparent border-b border-gray-50 mb-2 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600 font-bold text-xs">
                    {getInitials(admin.fullName)}
                  </div>
                  <p className="font-bold text-blue-900 mt-3 text-sm leading-tight">{admin.fullName}</p>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-widest">Administrator</p>
                </div>
                <div className="px-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-colors">
                    <Settings size={16} className="text-gray-400" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <div className="h-px bg-gray-50 my-2 mx-4"></div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Welcome Banner (Styling persis Dashboard User) */}
        <div className="bg-linear-to-tr from-blue-800 to-blue-500 rounded-2xl p-6 mb-8 text-white flex justify-between items-center relative overflow-hidden shadow-lg shadow-blue-100">
          <div className="relative z-10 font-bold">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Selamat Datang, Admin!</h2>
            <p className="text-blue-50 opacity-90 max-w-md text-sm font-medium">
              Kelola data pengguna dan pantau aktivitas pemesanan ruangan setiap hari!
            </p>
          </div>
          <div className="hidden lg:block relative z-10">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
              <span className="text-4xl">👨‍💻</span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Statistics Grid (Styling persis Dashboard User) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm hover:shadow-md transition-all relative overflow-hidden group font-bold">
              <div className="flex flex-col relative z-10">
                <span className="text-blue-900 font-semibold text-lg mb-2">{stat.label}</span>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-black text-blue-950">
                    {loading ? "..." : stat.value}
                  </span>
                  <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}>
                    <stat.icon size={28} />
                  </div>
                </div>
                <span className="text-sm text-blue-900/50 mt-3 font-medium uppercase tracking-tighter">Ringkasan</span>
              </div>
              <div className={`absolute -bottom-2 -right-2 w-16 h-16 ${stat.light} rounded-full opacity-50`} />
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;