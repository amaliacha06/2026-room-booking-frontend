import { useEffect, useState } from 'react';
import Sidebar from "../components/layout/Sidebar";
import axios from 'axios';
import { Eye, Pencil, Trash2, Clock } from 'lucide-react';

interface Booking {
  id: number;
  userName: string;
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
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'info' | 'danger' | 'warning';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5135/api/bookings');
        const activeBookings = response.data.filter((b: Booking) => !b.isDeleted);
        setBookings(activeBookings);
      } catch (error) {
        console.error("Gagal mengambil data booking:", error);
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
        isOpen: true,
        type: 'warning',
        title: 'Akses Ditolak',
        message: 'Maaf, pesanan sudah diproses admin dan tidak bisa diubah lagi!'
      });
      return;
    }
    console.log("Mengedit booking ID:", booking.id);
    // Nanti di sini arahkan ke form edit
  };

  // 3. Fungsi untuk Hapus
  // 1. Validasi Status: Cek apakah statusnya BUKAN pending
  const handleDelete = (booking: Booking) => {
    if (booking.status?.toLowerCase() !== 'pending') {
      setAlertConfig({
        isOpen: true,
        type: 'danger',
        title: 'Gagal Menghapus',
        message: 'Peminjaman sudah disetujui Admin dan tidak dapat dihapus!'
      });
      return;
    }

    // 2. Jika masih pending), tanya konfirmasi
    setAlertConfig({
      isOpen: true,
      type: 'danger',
      title: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus peminjaman "${booking.purpose}"?`,
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5135/api/bookings/${booking.id}`);
          setBookings(prev => prev.filter(b => b.id !== booking.id));
          setAlertConfig({
            isOpen: true,
            type: 'info',
            title: 'Berhasil',
            message: 'Data booking telah dihapus dari sistem.'
          });
        } catch (error: any) {
          // Tetap tangkap pesan di backend
          setAlertConfig({
            isOpen: true,
            type: 'danger',
            title: 'Error Sistem',
            message: error.response?.data?.message || "Gagal menghubungi server."
          });
        }
      }
    });
  };

  return (
    <div className="flex bg-blue-50 min-h-screen">
    <Sidebar/>
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
            <div className="bg-blue-800 p-5 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Peminjaman</h2>
            </div>

            <div className="p-6 space-y-4 text-gray-700">
              <DetailRow label="Username" value={selectedBooking.userName} isBold />
              <DetailRow label="Nama Ruangan" value={selectedBooking.roomName} />
              <DetailRow label="Tujuan" value={selectedBooking.purpose} />
              <div className="grid grid-cols-3 gap-2 pb-3 text-sm">
                <span className="font-semibold text-gray-500">Waktu Pemiinjaman</span>
                <div className="col-span-2 space-y-0.5">
                  <p><span className="text-green-700 font-bold">Mulai:</span> {formatDate(selectedBooking.startTime)}</p>
                  <p><span className="text-red-600 font-bold">Selesai:</span> {formatDate(selectedBooking.endTime)}</p>
                </div>
              </div>
              <DetailRow label="Pengajuan" value={formatDate(selectedBooking.createdAt)} />
              <div className="grid grid-cols-3 gap-2 pt-2 text-sm">
                <span className="font-semibold text-gray-500">Status</span>
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
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-900">Close</button>
            </div>
          </div>
        </div>
      )
      }
      {alertConfig.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in duration-200">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${alertConfig.type === 'danger' ? 'bg-red-50 text-red-600' :
                alertConfig.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              }`}>
              {alertConfig.type === 'danger' ? <Trash2 size={28} /> : alertConfig.type === 'warning' ? <Pencil size={28} /> : <Clock size={28} />}
            </div>

            <h3 className="text-xl font-bold text-red-600 mb-2">{alertConfig.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{alertConfig.message}</p>

            <div className="flex gap-3">
              {alertConfig.onConfirm ? (
                <>
                  <button
                    onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                    className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      alertConfig.onConfirm?.();
                      setAlertConfig({ ...alertConfig, isOpen: false });
                    }}
                    className="flex-1 py-3 bg-red-700 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all">
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
      )}
      </main>
    </div>
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