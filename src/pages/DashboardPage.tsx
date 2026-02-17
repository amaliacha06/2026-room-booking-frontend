import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown, Settings } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [stats, setStats] = useState({
    booking: 0,
    approved: 0,
    rejected: 0,
    canceled: 0,
  });

  // Ambil data dari backend
  // data disimpan saat login sukses
  const userString = localStorage.getItem("user");

  const user = userString ? JSON.parse(userString) : {
    fullName: "Guest User",
    email: "guest@example.com",
    username: "Guest"
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://localhost:5135/api/bookings");
        const allBookings = response.data;

        console.log("LOGIN USER:", user);
        console.log("ALL BOOKINGS:", allBookings);


        const firstName = user.fullName.split(" ")[0];

        const userBookings = allBookings.filter((b: any) =>
          b.userName?.toLowerCase().includes(
            user.fullName.split(" ")[0].toLowerCase()
          )
        );


        setStats({
          booking: userBookings.length,
          approved: userBookings.filter(
            (b: any) => b.status?.toLowerCase() === "approved"
          ).length,
          rejected: userBookings.filter(
            (b: any) => b.status?.toLowerCase() === "rejected"
          ).length,
          canceled: userBookings.filter(
            (b: any) => b.status?.toLowerCase() === "canceled"
          ).length,
        });

      } catch (error) {
        console.error("Gagal load booking:", error);
      }
    };

    fetchBookings();
  }, [user.username]);


  // Fungsi buat inisialisasi (Contoh: Felicia Nabilah Zahty -> FNZ)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const statCards = [
    { label: "Booking", value: stats.booking, icon: Clock, color: "bg-blue-500", light: "bg-blue-50" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "bg-green-500", light: "bg-green-50" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-red-500", light: "bg-red-50" },
    { label: "Canceled", value: stats.canceled, icon: AlertCircle, color: "bg-amber-500", light: "bg-amber-50" },
  ];


  return (
    <div className="flex bg-blue-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 md:p-12 overflow-y-auto ">

        <header className="flex justify-between items-center mb-8">

          <div className="absolute top-4 right-12 z-20">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group flex items-center gap-2 hover:scale-105 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-full bg-linear-to-tr from-cyan-400 via-blue-200 to-pink-400 p-0.5 shadow-md group-hover:shadow-purple-200 transition-shadow">
                <div className="w-full h-full rounded-full bg-blue-800/50 flex items-center justify-center border-2 border-white">
                  <span className="text-white font-bold text-xs tracking-wider">{getInitials(user.fullName)}</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm border border-blue-50 group-hover:border-blue-200 transition-colors">
                <ChevronDown
                  size={14}
                  className={`text-blue-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-blue-50/50 py-3 z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">

                <div className="px-5 py-3 bg-linear-to-tr from-blue-50/50 to-transparent border-b border-gray-50 mb-2 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600 font-bold text-xs">
                    {getInitials(user.fullName)}
                  </div>
                  <p className="font-bold text-blue-900 mt-3 text-sm leading-tight">{user.fullName}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{user.email}</p>
                </div>

                <div className="px-2 space-y-0.5">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-colors group">
                    <Settings size={16} className="text-gray-400 group-hover:text-blue-500" />

                    <span className="font-medium">setting</span>
                  </button>

                  <div className="h-px bg-gray-50 my-2 mx-4"></div>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="bg-linear-to-tr from-blue-800 to-blue-500/50 rounded-2xl p-6 mb-8 text-white flex justify-between items-center relative overflow-hidden shadow-lg shadow-blue-100">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3">Welcome Back {user.fullName.split(" ")[0]}!</h2>
            <p className="text-blue-50 opacity-90 max-w-md text-sm">
              Kamu punya beberapa jadwal meeting hari ini? Jangan lupa booking ruanganmu ya!
            </p>
          </div>

          <div className="hidden lg:block relative z-10">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
              <span className="text-4xl">👩‍💻</span>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex flex-col relative z-10">
                <span className="text-blue-900 font-semibold text-lg mb-2">{stat.label}</span>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-black text-blue-900">{stat.value}</span>
                  <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}>
                    <stat.icon size={28} />
                  </div>
                </div>

                <span className="font-med text-blue-900/50 mt-2">Total {stat.label}</span>
              </div>

              <div className={`absolute -bottom-2 -right-2 w-16 h-16 ${stat.light} rounded-full opacity-50`} />
            </div>
          ))}
        </div>
      </main>
    </div >
  );
};

export default DashboardPage;
