import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import axios from "axios";
import { Plus, Pencil, Trash2, X, CheckCircle, } from "lucide-react";

interface Room {
    id: number;
    name: string;
    capacity: number;
    location: string;
    facilities: string;
    imageFileName: string;
}

const ManageRoomsPage = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const token = localStorage.getItem("token");

    const [formData, setFormData] = useState({
        name: "",
        capacity: 0,
        location: "",
        facilities: "",
        imageFileName: ""
    });

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        type: 'info' | 'danger' | 'warning';
        title: string;
        message: string;
        onConfirm?: () => void;
    }>({ isOpen: false, type: 'info', title: '', message: '' });

    // 1. KONEKSI KE DATABASE 
    const fetchRooms = async () => {
        try {
            const response = await axios.get("http://localhost:5135/api/room", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Pastikan data benar-benar masuk ke state
            setRooms(response.data);
        } catch (error) {
            console.error("Gagal load database:", error);
        }
    };

    useEffect(() => { fetchRooms(); }, []);

    // 2. VALIDASI FORM 
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Nama ruangan wajib diisi";
        if (formData.capacity <= 0) newErrors.capacity = "Kapasitas harus berupa angka di atas 0";
        if (!formData.location.trim()) newErrors.location = "Lokasi gedung wajib diisi";
        if (!formData.facilities.trim()) newErrors.facilities = "Fasilitas wajib diisi";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (selectedRoom) {
                await axios.put(`http://localhost:5135/api/room/${selectedRoom.id}`, formData, config);
                setAlertConfig({
                    isOpen: true, type: 'info', title: 'Update Berhasil',
                    message: `Informasi ruangan "${formData.name}" telah diperbarui`
                });
            } else {
                await axios.post("http://localhost:5135/api/room", formData, config);
                setAlertConfig({
                    isOpen: true, type: 'info', title: 'Berhasil Tambah',
                    message: `Ruangan baru "${formData.name}" berhasil dimasukkan ke sistem`
                });
            }
            setIsModalOpen(false);
            fetchRooms();
        } catch (error) {
            alert("Gagal simpan ke database. Periksa koneksi API Anda");
        }
    };

    const handleDeleteRoom = (room: Room) => {
        setAlertConfig({
            isOpen: true, type: 'danger', title: 'Konfirmasi Hapus',
            message: `Hapus permanen ruangan "${room.name}" dari sistem?`,
            onConfirm: async () => {
                try {
                    await axios.delete(`http://localhost:5135/api/room/${room.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchRooms();
                    setAlertConfig({ isOpen: true, type: 'info', title: 'Berhasil', message: 'Data ruangan dihapus.' });
                } catch (error) { alert("Gagal menghapus ruangan"); }
            }
        });
    };

    const handleOpenModal = (room: Room | null = null) => {
        setErrors({});
        if (room) {
            setSelectedRoom(room);
            setFormData({
                name: room.name, capacity: room.capacity, location: room.location,
                facilities: room.facilities, imageFileName: room.imageFileName
            });
        } else {
            setSelectedRoom(null);
            setFormData({ name: "", capacity: 0, location: "", facilities: "", imageFileName: "" });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="flex bg-blue-50/50 min-h-screen">
            <Sidebar />
            <main className="flex-1 px-8 pt-20 pb-12 md:px-12 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto text-slate-900">
                    <header className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-2xl font-extrabold text-blue-900">Kelola Ruangan</h1>
                            <p className="text-gray-500 mt-2 font-medium">Sinkronisasi data ruangan kampus</p>
                        </div>
                        <button onClick={() => handleOpenModal()} className="bg-blue-800 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-900 transition-all active:scale-95 shadow-lg">
                            <Plus size={18} strokeWidth={3} /> Tambah Data
                        </button>
                    </header>

                    <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100">
                        <table className="w-full text-left table-fixed">
                            <thead>
                                <tr className="bg-blue-900 text-white text-[15px] uppercase tracking-wider text-center font-bold">
                                    <th className="px-6 py-4 w-12 text-center">No</th>
                                    <th className="px-6 py-2 w-32 text-center">Gambar</th>
                                    <th className="px-6 py-4 w-58 text-center">Nama Ruangan</th>
                                    <th className="px-6 py-4 w-55 text-center ">Lokasi</th>
                                    <th className="px-6 py-4 w-32 text-center">Kapasitas</th>
                                    <th className="px-6 py-4 w-32 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-900 font-bold ">
                                {rooms.map((room, index) => (
                                    <tr key={room.id} className="hover:bg-blue-50/50 transition-colors group text-slate-700 border-b border-gray-50">

                                        <td className="px-4 py-8 text-center text-blue-950/50 font-bold w-12">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-2 w-40">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="relative group/img cursor-zoom-in">
                                                    <img
                                                        src={`/${room.imageFileName || `room${index + 1}.jpg`}`}
                                                        onError={(e) => { e.currentTarget.src = "/room1.jpg"; }}
                                                        alt="Room"
                                                        className="w-28 h-20 object-cover rounded-2xl shadow-lg border-4 border-white group-hover/img:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center align-middle ">
                                            <div className="flex items-center justify-center gap-3">
                                                <span className="font-semibold text-blue-900 text-base tracking-tight leading-tight">
                                                    {room.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center align-middle">
                                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                                <span className="text-base font-medium leading-tight">
                                                    {room.location || '-'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-8 text-center align-middle">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="bg-blue-50 text-blue-800 px-8 py-2 rounded-2xl font-black text-sm flex items-center gap-2 border border-blue-100 shadow-sm shadow-blue-900/5">
                                                    {room.capacity}
                                                </span>
                                                <span className="text-[11px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Orang</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-8 align-middle">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleOpenModal(room)}
                                                    className="p-3 bg-white text-blue-600 border border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-90"
                                                    title="Edit Ruangan"
                                                >
                                                    <Pencil size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRoom(room)}
                                                    className="p-3 bg-white text-red-600 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-90"
                                                    title="Hapus Ruangan"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-xl max-w-md w-full p-7 relative animate-in zoom-in duration-300">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 transition-all">
                                <X size={20} strokeWidth={3} />
                            </button>

                            <h2 className="text-2xl font-black text-blue-900 leading-tight mt-1">
                                {selectedRoom ? 'Update Ruangan' : ' Tambah Ruangan Baru'}
                            </h2>
                            <p className="text-gray-500 text-[13px] mb-6 font-medium">Lengkapi detail spesifikasi ruangan kampus</p>

                            <form onSubmit={handleSubmit} className="space-y-2">
                                <div>
                                    <label className="text-[13px] font-bold text-slate-700 flex gap-1 ml-1">Nama Ruangan <span className="text-red-500">*</span></label>
                                    {errors.name && <p className="text-red-500 text-[11px] mt-0.5 ml-1 italic font-normal">{errors.name}</p>}
                                    <input
                                        type="text"
                                        placeholder="Contoh: Gedung Serbaguna"
                                        className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-3.5 focus:border-blue-800 outline-none transition-all mt-1 text-slate-700 font-medium ${errors.name ? 'border-red-400' : 'border-slate-200/50'}`}
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: "" });
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[13px] font-bold text-slate-700 flex gap-1 ml-1">Kapasitas <span className="text-red-500">*</span></label>
                                        {errors.capacity && <p className="text-red-500 text-[11px] mt-0.5 ml-1 italic font-normal">{errors.capacity}</p>}
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-3.5 focus:border-blue-800 outline-none mt-1 text-slate-700 font-medium ${errors.capacity ? 'border-red-400' : 'border-slate-200/50'}`}
                                            value={formData.capacity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setFormData({ ...formData, capacity: isNaN(val) ? 0 : val });
                                                if (errors.capacity) setErrors({ ...errors, capacity: "" }); // Hilangkan error saat mengetik
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[13px] font-bold text-slate-700 flex gap-1 ml-1">Lokasi <span className="text-red-500">*</span></label>
                                    {errors.location && <p className="text-red-500 text-[11px] mt-0.5 ml-1 italic font-normal">{errors.location}</p>}
                                    <input
                                        type="text"
                                        placeholder="Contoh: Lantai 2 Sayap Kiri"
                                        className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-3.5 focus:border-blue-800 outline-none transition-all mt-1 text-slate-700 font-medium ${errors.location ? 'border-red-400' : 'border-slate-200/50'}`}
                                        value={formData.location}
                                        onChange={(e) => {
                                            setFormData({ ...formData, location: e.target.value });
                                            if (errors.location) setErrors({ ...errors, location: "" }); // Hilangkan error saat mengetik
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="text-[13px] font-bold text-slate-700 flex gap-1 ml-1">Fasilitas <span className="text-red-500">*</span></label>
                                    {errors.facilities && <p className="text-red-500 text-[11px] mt-0.5 ml-1 italic font-normal">{errors.facilities}</p>}
                                    <textarea
                                        placeholder="AC, Wifi, Proyektor..."
                                        className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-3.5 focus:border-blue-800 outline-none h-24 resize-none text-[15px] text-slate-700 font-medium mt-1 ${errors.facilities ? 'border-red-400' : 'border-gray-200/50'}`}
                                        value={formData.facilities}
                                        onChange={(e) => {
                                            setFormData({ ...formData, facilities: e.target.value });
                                            if (errors.facilities) setErrors({ ...errors, facilities: "" }); // Hilangkan error saat mengetik
                                        }}
                                    />
                                </div>

                                <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 transition-all mt-2 hover:bg-blue-950 active:scale-95">
                                    {selectedRoom ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {alertConfig.isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${alertConfig.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                {alertConfig.type === 'danger' ? <Trash2 size={28} /> : <CheckCircle size={28} />}
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${alertConfig.type === 'danger' ? 'text-red-600' : 'text-green-700'}`}>{alertConfig.title}</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                                {alertConfig.title === 'Update Berhasil' || alertConfig.title === 'Berhasil Tambah' ? (
                                    <>
                                        Informasi ruangan <span className="font-semibold text-green-800">{formData.name}</span> telah {alertConfig.title === 'Update Berhasil' ? 'diperbarui' : 'terdaftar'}.
                                    </>
                                ) : alertConfig.title === 'Konfirmasi Hapus' ? (
                                    <>
                                        Apakah Anda yakin ingin menghapus permanen ruangan <span className="font-semibold text-red-700">{selectedRoom?.name}</span>?
                                    </>
                                ) : (
                                    alertConfig.message
                                )}
                            </p>
                            <div className="flex gap-3">
                                {alertConfig.onConfirm ? (
                                    <>
                                        <button onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })} className="flex-1 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 transition-all">Batal</button>
                                        <button onClick={() => { alertConfig.onConfirm?.(); setAlertConfig({ ...alertConfig, isOpen: false }); }} className="flex-1 py-4 bg-red-600 text-white hover:bg-red-700 font-bold rounded-2xl active:scale-95 transition-all">Ya, Hapus</button>
                                    </>
                                ) : (
                                    <button onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })} className="w-full py-4 bg-blue-900 text-white font-bold rounded-2xl hover:bg-blue-950 transition-all active:scale-95">Mengerti</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManageRoomsPage;