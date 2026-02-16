import { useEffect, useState } from 'react';
import Sidebar from "../components/layout/Sidebar";
import axios from 'axios';
import { Eye, Pencil, Trash2, CheckCircle } from 'lucide-react';

interface Booking {
  id: number;
  userName: string;
  UserId: number;
  roomId: number;
  roomName: string;
  purpose: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  status: string;
  isDeleted: boolean;
}

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    purpose: "",
    startTime: "",
    endTime: ""
  });
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'info' | 'danger' | 'warning';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};
    const now = new Date();
    const start = new Date(editData.startTime);
    const end = new Date(editData.endTime);

    if (!editData.purpose.trim()) newErrors.purpose = "Tujuan peminjaman wajib diisi";
    if (!editData.startTime) newErrors.startTime = "Waktu mulai wajib diisi";
    if (!editData.endTime) newErrors.endTime = "Waktu selesai wajib diisi";

    if (editData.startTime && start < now) {
      newErrors.startTime = "Waktu mulai tidak boleh di masa lalu";
    }
    if (editData.startTime && editData.endTime && end <= start) {
      newErrors.endTime = "Waktu selesai harus setelah waktu mulai";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("Token tidak ditemukan!");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5135/api/bookings/my-bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log("DATA DARI BACKEND:", response.data);
        setBookings(response.data);
      } catch (error) {
        console.error("Gagal mengambil booking:", error);
      }
    };

    fetchBookings();
  }, []);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 1. Fungsi untuk melihat Detail
  const handleDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // 2. Fungsi untuk Edit
  const handleEdit = (booking: Booking) => {
    if (booking.status?.toLowerCase() !== 'pending') {
      setAlertConfig({
        isOpen: true, type: 'warning', title: 'Akses Ditolak',
        message: 'Maaf, pesanan sudah diproses admin!'
      });
      return;
    }

    setSelectedBooking(booking);
    setEditData({
      purpose: booking.purpose,
      // Format tanggal agar masuk ke input datetime-local (YYYY-MM-DDTHH:mm)
      startTime: new Date(booking.startTime).toISOString().slice(0, 16),
      endTime: new Date(booking.endTime).toISOString().slice(0, 16)
    });
    setIsEditModalOpen(true); // Buka modal edit
  };

  const handleDelete = (booking: Booking) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAlertConfig({
        isOpen: true,
        type: 'danger',
        title: 'Error Sistem',
        message: 'Token tidak ditemukan, silakan login kembali.'
      });
      return;
    }

    // Validasi status: hanya boleh hapus jika pending
    if (booking.status?.toLowerCase() !== 'pending') {
      setAlertConfig({
        isOpen: true,
        type: 'danger',
        title: 'Gagal Menghapus',
        message: 'Peminjaman sudah disetujui Admin dan tidak dapat dihapus!'
      });
      return;
    }

    // Konfirmasi sebelum hapus
    setAlertConfig({
      isOpen: true,
      type: 'danger',
      title: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus peminjaman "${booking.purpose}"?`,
      onConfirm: () => {
        // Pakai IIFE async supaya aman di onConfirm
        (async () => {
          try {
            await axios.delete(`http://localhost:5135/api/bookings/${booking.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            // Update state lokal
            setBookings(prev => prev.filter(b => b.id !== booking.id));

            // Tampilkan alert sukses
            setAlertConfig({
              isOpen: true,
              type: 'info',
              title: 'Berhasil',
              message: 'Data booking berhasil dihapus dari sistem'
            });
          } catch (err: unknown) {
            let message = "Gagal menghubungi server";
            if (axios.isAxiosError(err) && err.response?.data?.message) {
              message = err.response.data.message;
            }

            setAlertConfig({
              isOpen: true,
              type: 'danger',
              title: 'Error Sistem',
              message
            });
          }
        })();
      }
    });
  };
  const handleUpdateSubmit = async () => {
    // 1. Validasi lokal dulu
    if (!validateEditForm()) return;

    if (!selectedBooking) {
      alert("Booking tidak ditemukan, silakan pilih data terlebih dahulu");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan, silakan login kembali");
      return;
    }

    try {
      // 2. Siapkan payload
      const payload = {
        purpose: editData.purpose,
        startTime: new Date(editData.startTime).toISOString(),
        endTime: new Date(editData.endTime).toISOString(),
      };

      console.log("Payload Update:", payload, "Booking ID:", selectedBooking.id);

      // 3. Kirim PUT ke backend
      const response = await axios.put(
        `http://localhost:5135/api/bookings/${selectedBooking.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("Response Update:", response.data);

      // 4. Alert sukses
      setAlertConfig({
        isOpen: true,
        type: 'info',
        title: 'Berhasil Diperbarui',
        message: 'Perubahan jadwal untuk "${editData.purpose}" telah disimpan',
      });

      setIsEditModalOpen(false);

      // 5. Refresh data bookings
      const fetchResponse = await axios.get("http://localhost:5135/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(fetchResponse.data);

    } catch (error: unknown) {
      console.error("Full Update Error:", error);

      let message = "Terjadi kesalahan sistem";
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) message = error.response.data.message;
        else if (error.response?.data) message = JSON.stringify(error.response.data);
      }

      setAlertConfig({
        isOpen: true,
        type: 'danger',
        title: 'Gagal Update',
        message
      });
    }
  };

  return (
    <div className="flex bg-blue-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 pt-20 pb-12 md:px-12 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-extrabold text-blue-900">Riwayat Peminjaman</h1>
            <p className="text-gray-500 mt-2">Pantau dan kelola status pengajuan peminjaman ruangan Anda</p>
          </header>

          <div className="bg-white rounded-xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-800 text-white text-sm uppercase tracking-wider text-center">
                  <th className="px-6 py-4 font-bold">No</th>
                  <th className="px-6 py-4 font-bold w-1/4">Nama Ruangan</th>
                  <th className="px-6 py-4 font-bold w-1/3">Tujuan Peminjaman</th>
                  <th className="px-6 py-4 font-bold w-1/5 whitespace-nowrap">Waktu Pengajuan</th>
                  <th className="px-6 py-4 font-bold ">Status</th>
                  <th className="px-6 py-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300/50">
                {bookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-blue-50 transition-colors group">
                    <td className="px-6 py-4 text-base text-black-50 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4 text-base font-semibold text-gray-700">
                      {booking.roomName || `Ruangan ID: ${booking.roomId}`}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-700 max-w-xs">
                      {booking.purpose}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-700 text-center">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                            booking.status?.toLowerCase() === 'canceled' ? 'bg-gray-100 text-gray-700' :
                              booking.status === 'Selesai' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-3">
                        {/* Tombol Detail */}
                        <button
                          onClick={() => handleDetail(booking)}
                          title="Lihat Detail"
                          className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg transition-all hover:scale-125"
                        >
                          <Eye size={20} />
                        </button>

                        {/* Tombol Edit */}
                        <button
                          onClick={() => handleEdit(booking)}
                          title="Edit Peminjaman"
                          className="p-2 text-orange-500 hover:bg-amber-100 rounded-lg transition-all hover:scale-125"
                        >
                          <Pencil size={20} />
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDelete(booking)}
                          title="Hapus Peminjaman"
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-125"
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

        {/* Modal Detail */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
              <div className="bg-blue-900 p-4 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Detail Peminjaman</h2>
              </div>

              <div className="p-5 space-y-2 text-gray-700">
                <DetailRow label="Username" value={selectedBooking.userName} isBold />
                <DetailRow label="Nama Ruangan" value={selectedBooking.roomName} />
                <DetailRow label="Tujuan" value={selectedBooking.purpose} />
                <div className="grid grid-cols-3 gap-2 pb-3 text-sm">
                  <span className="font-semibold text-gray-600">Waktu Pinjam</span>
                  <div className="col-span-2 space-y-0.5">
                    <p><span className="text-green-700 font-bold">Mulai:</span> {formatDate(selectedBooking.startTime)}</p>
                    <p><span className="text-red-600 font-bold">Selesai:</span> {formatDate(selectedBooking.endTime)}</p>
                  </div>
                </div>
                <DetailRow label="Pengajuan" value={formatDate(selectedBooking.createdAt)} />
                <div className="grid grid-cols-3 gap-2 pt-2 text-sm">
                  <span className="font-semibold text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                    // Logika warna status
                    selectedBooking.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                      selectedBooking.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        selectedBooking.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                          selectedBooking.status?.toLowerCase() === 'canceled' ? 'bg-gray-100 text-gray-700' :
                            selectedBooking.status?.toLowerCase() === 'selesai' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                    }`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 flex justify-end">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-blue-800 text-white font-bold rounded-2xl hover:bg-blue-900">Close</button>
              </div>
            </div>
          </div>
        )
        }
        {alertConfig.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in duration-200">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${alertConfig.type === 'danger'
                ? 'bg-red-50 text-red-600'
                : 'bg-green-100 text-green-600'
                }`}>
                {alertConfig.type === 'danger' ? (
                  <Trash2 size={28} />
                ) : (
                  <CheckCircle size={28} />
                )}
              </div>

              {/* Judul */}
              <h3 className={`text-xl font-semibold mb-6 ${alertConfig.type === 'danger' ? 'text-red-600' : 'text-green-700'
                }`}>
                {alertConfig.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 text-center">
                {/* Kondisi 1: Jika Alert Sukses Update */}
                {alertConfig.title === 'Berhasil Diperbarui' ? (
                  <>
                    Perubahan jadwal untuk <span className="font-semibold text-green-700">"{editData.purpose}"</span> telah disimpan
                  </>
                ) :
                  /* Kondisi 2: Jika Alert Konfirmasi Hapus */
                  alertConfig.title === 'Konfirmasi Hapus' ? (
                    <>
                      Apakah Anda yakin ingin menghapus peminjaman <span className="font-semibold text-red-400">"{selectedBooking?.purpose}"</span>?
                    </>
                  ) : (
                    /* Kondisi 3: Pesan lainnya (Gagal update / Berhasil hapus) */
                    alertConfig.message
                  )}
              </p>

              <div className="flex gap-3">
                {alertConfig.onConfirm ? (
                  <>
                    <button
                      onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                      className="flex-1 py-3 border-2  border-gray-200 text-gray-700 font-semibold hover:bg-gray-200 hover:text-gray-600 rounded-xl transition-all duration-300"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        alertConfig.onConfirm?.();
                        setAlertConfig({ ...alertConfig, isOpen: false });
                      }}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-base shadow-red-200 transition-all">
                      Ya, Hapus
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                    className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl transition-all">
                    Mengerti
                  </button>
                )}
              </div>
            </div>
          </div>
        )
        }
        {/* MODAL EDIT BOOKING */}
        {
          isEditModalOpen && selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100 shadow-blue-900/20">

                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-600 p-4 text-white text-center">
                  <h2 className="text-2xl font-black tracking-tight mb-1">Edit Peminjaman</h2>
                  <p className="text-gray-200 text-base font-semibold">{selectedBooking.roomName}</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleUpdateSubmit(); }} className="p-8 space-y-6">

                  {/* Input Tujuan */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-blue-900">
                      Tujuan Peminjaman <span className="text-red-600 ml-1">*</span>
                    </label>
                    {editErrors.purpose && <p className="text-red-500 text-[11px] font-med italic">{editErrors.purpose}</p>}
                    <textarea
                      className={`w-full p-4 rounded-2xl border-2 transition-all outline-none text-sm resize-none h-24 ${editErrors.purpose ? 'border-red-50' : 'border-gray-200 bg-gray-50 focus:border-orange-500'
                        }`}
                      value={editData.purpose}
                      onChange={(e) => {
                        setEditData({ ...editData, purpose: e.target.value });
                        if (e.target.value) setEditErrors(prev => ({ ...prev, purpose: "" })); // Hapus error merah saat user mengetik
                      }}
                    />
                  </div>

                  {/* Date Inputs Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-bold text-blue-900">Mulai <span className="text-red-500 ml-1">*</span></label>
                      {editErrors.startTime && <p className="text-red-500 text-[11px] font-med italic">{editErrors.startTime}</p>}
                      <input
                        type="datetime-local"
                        className={`w-full p-3 rounded-xl border-2 transition-all outline-none text-sm ${editErrors.startTime ? 'border-red-400' : 'border-gray-200 bg-gray-50 focus:border-orange-200'
                          }`}
                        value={editData.startTime}
                        onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-bold text-blue-900">Selesai <span className="text-red-500 ml-1">*</span></label>
                      {editErrors.endTime && <p className="text-red-500 text-[11px] font-med italic">{editErrors.endTime}</p>}
                      <input
                        type="datetime-local"
                        className={`w-full p-3 rounded-xl border-2 transition-all outline-none text-sm ${editErrors.endTime ? 'border-red-500' : 'border-gray-200 bg-gray-50 focus:border-orange-500'
                          }`}
                        value={editData.endTime}
                        onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Buttons Section */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-4 border-2 border-gray-200 text-gray-400 font-bold hover:bg-gray-200 hover:text-gray-600 rounded-2xl transition-all duration-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-lg hover:bg-yellow-600 hover:shadow-orange-100 active:scale-95 transition-all duration-300"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </main >
    </div >
  );
};

//untuk baris detail
const DetailRow = ({ label, value, isBold, isItalic }: any) => (
  <div className="grid grid-cols-3 gap-2 pb-3 text-sm">
    <span className="font-semibold text-gray-600">{label}</span>
    <span className={`col-span-2 ${isBold ? 'font-bold text-blue-900' : ''} ${isItalic ? 'italic text-gray-600' : ''}`}>
      {value}
    </span>
  </div>
);

export default BookingHistoryPage;