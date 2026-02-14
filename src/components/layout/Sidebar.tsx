import { LayoutDashboard, DoorOpen, LogOut, } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
    const navigate = useNavigate();

    // State untuk melacak menu mana yang aktif
    const [activeMenu, setActiveMenu] = useState("dashboard");

    const handleLogout = () => {
        // Hapus token agar user tidak bisa balik lagi tanpa login
        localStorage.removeItem("token");
        navigate("/login");
    };
    // Fungsi pembantu untuk mengatur gaya tombol menu
    const getMenuClass = (menuName: string) => {
        const isActive = activeMenu === menuName;
        return `flex items-center gap-4 w-full p-3 transition-all rounded-xl group ${isActive
            ? "bg-blue-100 text-blue-800 shadow-md"
            : "text-blue-900/50 hover:bg-blue-50 hover:text-blue-800"
            }`;
    };
    return (
        <div className="w-64 bg-white min-h-screen text-blue-900 flex flex-col p-6 shadow-xl">
            {/* Branding Nama Aplikasi */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-blue-700/50 p-2 rounded-lg">
                    <DoorOpen size={24} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-blue-900">Roomie</h1>
            </div>

            {/* Menu Navigasi */}
            <nav className="flex-1 space-y-4">
                <button
                    onClick={() => setActiveMenu("dashboard")}
                    className={getMenuClass("dashboard")}
                >
                    <LayoutDashboard
                        size={20}
                        strokeWidth={activeMenu === "dashboard" ? 2.5 : 2} // Icon jadi lebih tebal
                        className={activeMenu === "dashboard" ? "scale-110" : "group-hover:scale-110 transition-transform"}
                    />
                    <span className={activeMenu === "dashboard" ? "font-semibold" : "font-medium group-hover:font-semibold"}>
                        Dashboard
                    </span>
                </button>

                <button
                    onClick={() => setActiveMenu("rooms")}
                    className={getMenuClass("rooms")}
                >
                    <DoorOpen
                        size={20}
                        strokeWidth={activeMenu === "rooms" ? 2.5 : 2}
                        className={activeMenu === "rooms" ? "scale-110" : "group-hover:scale-110 transition-transform"}
                    />
                    <span className={activeMenu === "rooms" ? "font-semibold" : "font-medium group-hover:font-semibold"}>
                        Daftar Ruangan
                    </span>
                </button>
            </nav>

            {/* Tombol Keluar */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 mt-auto text-blue-900/50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all group">
                <LogOut size={20}
                    className="group-hover:scale-110 group-hover:stroke-[2.5px] transition-all"/>
                <span className="font-medium group-hover:font-semibold">Keluar</span>
            </button>
        </div>
    );
};

export default Sidebar;