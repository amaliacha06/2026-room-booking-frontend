import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { Search, Users, MapPin, CheckCircle } from "lucide-react";
import axios from "axios";

// Definisikan tipe data sesuai kolom di pgAdmin
interface Room {
    id: number;
    name: string;
    capacity: number;
    location: string;
    facilities: string;
    isAvailable: boolean;
    isDeleted: boolean;
    image_url?: string; // Kolom baru yang akan kita tambah nanti
}

// Data dummy untuk ngetes tampilan
const RoomsPage = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    // FUNGSI AMBIL DATA DARI BACKEND
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // Ganti URL ini sesuai dengan alamat API backend kamu
                const response = await axios.get("http://localhost:5135/api/Room");

                console.log("DATA DARI BACKEND:", response.data); // untuk debug

                setRooms(response.data);
            } catch (error) {
                console.error("Gagal mengambil data ruangan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    return (
        <div className="flex bg-blue-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                {/* Header Halaman */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-950">Daftar Ruangan</h1>
                        <p className="text-gray-500 text-sm mt-1">Pilih ruangan yang sesuai dengan kebutuhanmu</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari ruangan..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Grid List Ruangan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50 hover:shadow-md transition-all group">
                            {/* Image Ruangan */}
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={`/room${room.id}.jpg`}
                                    alt={room.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${room.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {room.isAvailable ? "AVAILABLE" : "OCCUPIED"}
                                </div>
                            </div>

                            {/* Detail Ruangan */}
                            <div className="p-5">

                                <h3 className="font-bold text-blue-950 mb-3 text-lg">{room.name}</h3>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Users size={16} className="text-blue-400" />
                                        <span>Kapasitas: {room.capacity} Orang</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <MapPin size={16} className="text-blue-400" />
                                        <span>Lokasi: {room.location}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-gray-500 text-sm">
                                        <CheckCircle size={16} className="text-blue-400 mt-1 flex-shrink-0" />
                                        <span>Fasilitas: {room.facilities}</span>
                                    </div>

                                </div>

                                <button
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${room.isAvailable
                                        ? 'bg-blue-800 text-white hover:bg-blue-900 shadow-lg shadow-blue-100'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={!room.isAvailable}
                                >
                                    {room.isAvailable ? 'Booking Sekarang' : 'Sudah Terisi'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default RoomsPage;