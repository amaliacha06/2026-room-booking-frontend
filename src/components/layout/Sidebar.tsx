import { LayoutDashboard, DoorOpen, LogOut, Warehouse, Users, ClipboardList, History } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";


const Sidebar = () => {
    const location = useLocation(); // Untuk mendeteksi menu mana yang sedang aktif
    const navigate = useNavigate();

    // 1. Ambil data user dari localStorage untuk cek Role
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const role = user?.position?.toLowerCase(); // 'admin' atau 'mahasiswa'

    // 2. Tentukan Menu secara Dinamis berdasarkan Role
    const menuItems = role === 'admin'
        ? [
            /* MENU KHUSUS ADMIN */
            {
                title: "Dashboard Admin",
                path: "/admin/dashboard",
                icon: <LayoutDashboard size={20} />,
            },
            {
                title: "Kelola Ruangan",
                path: "/admin/rooms",
                icon: <Warehouse size={20} />,
            },
            {
                title: "Daftar Pengguna",
                path: "/admin/users",
                icon: <Users size={20} />,
            },
            {
                title: "Daftar Pemesanan",
                path: "/admin/bookings",
                icon: <ClipboardList size={20} />,
            },
        ]
        : [
            /* MENU KHUSUS MAHASISWA */
            {
                title: "Dashboard",
                path: "/dashboard",
                icon: <LayoutDashboard size={20} />,
            },
            {
                title: "Daftar Ruangan",
                path: "/rooms",
                icon: <Warehouse size={20} />,
            },
            {
                title: "Riwayat Pemesanan",
                path: "/history",
                icon: <History size={20} />,
            },
        ];
    const handleLogout = () => {
        // Hapus token agar user tidak bisa balik lagi tanpa login
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="w-64 bg-white min-h-screen text-blue-900 flex flex-col p-6 shadow-xl">
            {/* Branding Nama Aplikasi */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-blue-700/50 p-2 rounded-lg">
                    <DoorOpen size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-900">Roomie</h1>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                        {role || 'Guest'} Panel
                    </span>
                </div>
            </div>

            {/* Menu Navigasi */}
            {/* --- HAPUS SEMUA ISI DI DALAM <nav> INI --- */}
            <nav className="flex-1 space-y-4">
                {/* GANTI SEMUA BUTTON MANUAL DENGAN KODE DI BAWAH INI */}
                {menuItems.map((item) => {
                    // Cek apakah menu ini sedang aktif berdasarkan URL
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            // Class ini diambil dari getMenuClass kamu agar warnanya TIDAK BERUBAH
                            className={`flex items-center gap-4 w-full p-3 transition-all rounded-xl group ${isActive
                                ? "bg-blue-100 text-blue-800 shadow-md" // Warna saat aktif (punya kamu)
                                : "text-blue-900/50 hover:bg-blue-50 hover:text-blue-800" // Warna saat biasa
                                }`}
                        >
                            {/* Icon: Logikanya sama seperti button kamu tadi */}
                            <div className="flex items-center justify-center">
                                {/* Mengkloning icon agar bisa ditambah class dinamis */}
                                {/* Kita ganti icon manual kamu dengan item.icon dari array */}
                                <div className={`${isActive ? "scale-110" : "group-hover:scale-110 transition-transform"}`}>
                                    {item.icon}
                                </div>
                            </div>

                            <span className={isActive ? "font-semibold" : "font-medium group-hover:font-semibold"}>
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Tombol Keluar */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 mt-auto text-blue-900/50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all group">
                <LogOut size={20}
                    className="group-hover:scale-110 group-hover:stroke-[2.5px] transition-all" />
                <span className="font-medium group-hover:font-semibold">Keluar</span>
            </button>
        </div>
    );
};

export default Sidebar; 