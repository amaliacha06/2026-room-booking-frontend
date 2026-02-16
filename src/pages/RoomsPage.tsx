import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    image_url?: string;
}

const RoomsPage = () => {
    const resetForm = () => {
        setBookingData({
            purpose: "",
            whatsapp: "",
            startTime: "",
            endTime: ""
        });
        setErrors({});
    };
    // Di dalam komponen RoomsPage
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [bookingData, setBookingData] = useState({
        purpose: "",
        whatsapp: "",
        startTime: "",
        endTime: ""
    });
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const now = new Date();
        const start = new Date(bookingData.startTime);
        const end = new Date(bookingData.endTime);

        if (!bookingData.purpose) newErrors.purpose = "Tujuan peminjaman wajib diisi";
        if (!bookingData.whatsapp) newErrors.whatsapp = "Nomor WhatsApp wajib diisi";
        if (!bookingData.startTime) newErrors.startTime = "Waktu mulai wajib diisi";
        if (!bookingData.endTime) newErrors.endTime = "Waktu selesai wajib diisi";

        // Validasi Logika Tanggal
        if (bookingData.startTime && start < now) {
            newErrors.startTime = "Waktu mulai tidak boleh di masa lalu";
        }

        if (bookingData.startTime && bookingData.endTime && end <= start) {
            newErrors.endTime = "Waktu selesai harus setelah waktu mulai";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const navigate = useNavigate(); // Pastikan sudah di-import dari react-router-dom
    const [rooms, setRooms] = useState<Room[]>([]);

    // FUNGSI AMBIL DATA DARI BACKEND
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // Ganti URL sesuai dengan alamat API backend
                const response = await axios.get("http://localhost:5135/api/Room");
                setRooms(response.data);
            } catch (error) {
                console.error("Gagal mengambil data ruangan:", error);
            } finally {
            }
        };

        fetchRooms();
    }, []);
    const handleInputChange = (field: string, value: string) => {
        // Update data input
        setBookingData(prev => ({ ...prev, [field]: value }));

        // Hapus error 
        if (value.trim() !== "") {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Validasi khusus nomor telepon (hanya angka)
        if (field === 'whatsapp' && value !== "") {
            const phoneRegex = /^[0-9]+$/;
            if (!phoneRegex.test(value)) {
                setErrors(prev => ({ ...prev, whatsapp: "Nomor WA harus berupa angka saja" }));
            }
        }
    };
    const handleBookingClick = (room: Room) => {
        resetForm();
        setSelectedRoom(room);
        setIsBookingModalOpen(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return; // Validasi lokal 

        // Ambil user & token dari localStorage
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        const user = storedUser ? JSON.parse(storedUser) : null;

        // Konversi waktu ke UTC
        const startTimeUtc = new Date(bookingData.startTime).toISOString();
        const endTimeUtc = new Date(bookingData.endTime).toISOString();

        const payload = {
            roomId: selectedRoom?.id,
            userName: user?.email || "Guest",
            userId: user?.id,
            whatsapp: bookingData.whatsapp,
            purpose: bookingData.purpose,
            startTime: startTimeUtc, // UTC string
            endTime: endTimeUtc,     // UTC string
            status: "Pending"
        };

        console.log("Payload booking yang dikirim:", payload);
        console.log("Token yang dikirim:", token);

        try {
            await axios.post("http://localhost:5135/api/bookings", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            // Tampilkan Alert Berhasil
            setIsBookingModalOpen(false); // Tutup modal input
            setShowSuccessAlert(true);    // Nyalakan alert sukses

            // Tunggu 2 detik agar user bisa baca, lalu pindah halaman
            setTimeout(() => {
                setShowSuccessAlert(false);
                navigate("/history");
            }, 2000);

        } catch (error: any) {
            if (error.response?.status === 401) {
                alert("Sesi login habis. Silakan login kembali.");
                navigate("/login");
            } else if (error.response?.status === 400) {
                setErrors(prev => ({
                    ...prev,
                    global: error.response.data.message || "Jadwal bentrok!"
                }));
            } else {
                console.error("Gagal membuat booking:", error);
                alert("Terjadi kesalahan sistem.");
            }
        }
    };

    return (
        <div className="flex bg-blue-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 px-8 pt-20 pb-12 md:px-12 h-screen overflow-y-auto">
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
                                        <CheckCircle size={16} className="text-blue-400 mt-1 shrink-0" />
                                        <span>Fasilitas: {room.facilities}</span>
                                    </div>

                                </div>

                                <button
                                    onClick={() => handleBookingClick(room)}
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

            {/* MODAL CREATE BOOKING */}
            {isBookingModalOpen && selectedRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100 shadow-blue-900/20">

                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-4 text-white text-center">
                            <h2 className="text-2xl font-black tracking-tight mb-1">Form Peminjaman</h2>
                            <p className="text-gray-300 text-base font-semibold">{selectedRoom.name}</p>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (validateForm()) handleBookingSubmit(e);
                        }} className="p-8 space-y-4">

                            {/* Input Tujuan */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-bold text-blue-950">
                                    Tujuan Peminjaman <span className="text-red-500 ml-1">*</span>
                                </label>
                                {errors.purpose && <p className="text-red-500 text-[11px] font-med italic">{errors.purpose}</p>}
                                <textarea
                                    className={`w-full p-4 rounded-2xl border-2 transition-all outline-none text-sm resize-none h-24 ${errors.purpose
                                        ? 'border-red-500'
                                        : 'border-gray-200 bg-gray-50 focus:border-blue-700 focus:bg-white'
                                        }`}
                                    placeholder="Contoh: Rapat Koordinasi Internal Mahasiswa"
                                    value={bookingData.purpose}
                                    onChange={(e) => handleInputChange('purpose', e.target.value)} // GANTI INI
                                />
                            </div>

                            {/* Input WhatsApp */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-bold text-blue-900">
                                    Nomor WhatsApp Aktif <span className="text-red-500 ml-1">*</span>
                                </label>
                                {errors.whatsapp && <p className="text-red-500 text-[11px] font-med italic">{errors.whatsapp}</p>}
                                <input
                                    type="tel"
                                    className={`w-full p-4 rounded-2xl border-2 transition-all outline-none text-sm ${errors.whatsapp
                                        ? 'border-red-500'
                                        : 'border-gray-200 bg-gray-50 focus:border-blue-700 focus:bg-white'
                                        }`}
                                    placeholder="081234567890"
                                    value={bookingData.whatsapp}
                                    onChange={(e) => handleInputChange('whatsapp', e.target.value)} // GANTI INI
                                />
                            </div>

                            {/* Date Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-bold text-blue-900">
                                        Mulai <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    {errors.startTime && <p className="text-red-500 text-[11px] font-med italic">{errors.startTime}</p>}
                                    <input
                                        type="datetime-local"
                                        // Mengambil waktu sekarang dalam format yang dimengerti HTML
                                        min={new Date().toISOString().slice(0, 16)}
                                        className={`w-full p-3 rounded-xl border-2 transition-all outline-none text-xs ${errors.startTime
                                            ? 'border-red-500'
                                            : 'border-gray-200 bg-gray-50 focus:border-blue-700 focus:bg-white'
                                            }`}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)} // GANTI INI
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-bold text-blue-900">
                                        Selesai <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    {errors.endTime && <p className="text-red-500 text-[11px] font-med italic">{errors.endTime}</p>}
                                    <input
                                        type="datetime-local"
                                        className={`w-full p-3 rounded-xl border-2 transition-all outline-none text-xs ${errors.startTime
                                            ? 'border-red-500'
                                            : 'border-gray-200 bg-gray-50 focus:border-blue-700 focus:bg-white'
                                            }`}
                                        onChange={(e) => handleInputChange('endTime', e.target.value)} // GANTI INI
                                    />
                                </div>
                            </div>
                            {errors.global && (
                                <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 mb-4 text-red-600 text-xs font-bold animate-pulse">
                                    {errors.global}
                                </div>
                            )}

                            {/* Buttons Section */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="flex-1 py-4 border-2 border-gray-200 text-gray-400 font-bold hover:bg-gray-200 hover:text-gray-600 rounded-2xl transition-all duration-300">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-50 hover:bg-blue-900 active:scale-95 transition-all duration-300"
                                >
                                    Konfirmasi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* ALERT BERHASIL TAMBAH */}
            {showSuccessAlert && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 transform animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={48} strokeWidth={3} />
                        </div>
                        <h3 className="text-xl font-black text-blue-900 mb-2 text-center">Booking Berhasil!</h3>
                        <p className="text-gray-500 text-center text-sm leading-relaxed">
                            Peminjaman untuk <span className="font-bold text-blue-800">"{bookingData.purpose}"</span> berhasil ditambahkan
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsPage;