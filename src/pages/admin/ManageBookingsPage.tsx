import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import axios from "axios";
import { Settings2, User, Home, ChevronRight, Trash2, CheckCircle, X } from "lucide-react";

interface Booking {
  id: number;
  userName: string;
  roomName: string;
  purpose: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  status: string;
}

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const token = localStorage.getItem("token");
  // State untuk Alert Kustom
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'info' | 'danger' | 'warning';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5135/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedBooking) return;

    try {
      // Pastikan URL ini sesuai dengan yang ada di Controller Backend 
      await axios.put(`http://localhost:5135/api/bookings/${selectedBooking.id}/status`,
        JSON.stringify(status), 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Jika berhasil, tampilkan alert 
      setIsEditModalOpen(false);
      fetchBookings(); // Refresh tabel 

      // Tampilkan Alert Kustom Sukses
      setAlertConfig({
        isOpen: true,
        type: 'info',
        title: 'Update Berhasil',
        message: `Booking ${selectedBooking.purpose} berhasil di-${status.toUpperCase()}`
      });

    } catch (error: any) {
      alert("Gagal update status. Cek apakah backend sudah ada method PUT untuk status ini!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedBooking) return;

    setIsEditModalOpen(false);

    setAlertConfig({
      isOpen: true,
      type: 'danger',
      title: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus peminjaman ${selectedBooking.purpose}?`,
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5135/api/bookings/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAlertConfig({
            isOpen: true,
            type: 'info',
            title: 'Berhasil',
            message: 'Data booking berhasil dihapus dari sistem'
          });
          setIsEditModalOpen(false);
          fetchBookings();
        } catch (error) {
          setAlertConfig({
            isOpen: true,
            type: 'danger',
            title: 'Gagal Hapus',
            message: 'Terjadi kesalahan sistem'
          });
        }
      }
    });
  };
  const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="flex bg-blue-50/50 min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 pt-20 pb-12 md:px-12 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-extrabold text-blue-900">Manajemen Pemesanan</h1>
            <p className="text-gray-500 mt-1">Pantau dan kelola seluruh pengajuan peminjaman ruangan</p>
          </header>

          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-900 text-center text-white text-[14px] uppercase tracking-[0.15em]">
                  <th className="px-6 py-4 font-bold  w-12">No</th>
                  <th className="px-6 py-4 font-bold w-50">Username & Ruangan</th>
                  <th className="px-6 py-4 font-bold w-50">Tujuan</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap w-35">Tanggal Pengajuan</th>
                  <th className="px-6 py-4 font-bold w-32">Status</th>
                  <th className="px-6 py-4 font-bold w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5 text-center text-gray-500 font-medium">{index + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <User size={14} className="text-blue-500 shrink-0" /> {booking.userName}
                        </span>
                        <span className="text-base text-gray-600 mt-1 flex items-center gap-1.5 font-medium whitespace-nowrap">
                          <Home size={13} className="text-gray-500" /> {booking.roomName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-med text-gray-600 leading-relaxed line-clamp-2">{booking.purpose}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[15px] text-base text-gray-600 px-3 py-1 inline-flex items-center">
                        {formatDate(booking.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border shadow-sm ${booking.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-300' :
                        booking.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-300' :
                          booking.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-300' :
                            booking.status === 'Canceled' ? 'bg-gray-100 text-gray-500 border-gray-300' :
                              booking.status === 'Selesai' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                'bg-slate-50 text-slate-400 border-slate-300'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <button
                          onClick={() => { setSelectedBooking(booking); setIsEditModalOpen(true); }}
                          className="p-2.5 bg-white text-blue-800 border border-blue-100 rounded-xl hover:bg-blue-800 hover:text-white shadow-sm transition-all flex items-center gap-2 active:scale-95"
                        >
                          <Settings2 size={18} />
                          <span className="text-xs font-bold uppercase tracking-wider">Kelola</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DETAIL & STATUS*/}
        {isEditModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[1rem] shadow-2xl max-w-sm w-full overflow-hidden transform animate-in zoom-in duration-300">
              <div className="bg-blue-900 p-3 text-white text-center relative">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-all z-20 backdrop-blur-sm"
                  title="Tutup"><X size={18} strokeWidth={3} />
                </button>

                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm text-white">
                  <Settings2 size={24} />
                </div>
                <h2 className="text-xl font-black">Detail & Edit Status</h2>
                <p className="text-white-900 text-[13px] mt-1 font-medium line-clamp-1 px-4 opacity-80">
                  {selectedBooking.purpose}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* SECTION DETAIL WAKTU */}
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-700 mb-1 uppercase tracking-wider">Waktu Mulai</span>
                    <span className="text-xs text-blue-950">{formatDate(selectedBooking.startTime)}</span>
                  </div>
                  <div className="h-[1px] bg-blue-100 w-full opacity-50"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-red-500 mb-1 uppercase tracking-wider">Waktu Selesai</span>
                    <span className="text-xs text-blue-950">{formatDate(selectedBooking.endTime)}</span>
                  </div>
                </div>

                {/* TOMBOL AKSI STATUS */}
                <div className="grid grid-cols-1 gap-2">
                  <StatusButton label="Approved" status="Approved" color="bg-green-500" onClick={handleUpdateStatus} />
                  <StatusButton label="Rejected" status="Rejected" color="bg-red-500" onClick={handleUpdateStatus} />
                  <StatusButton label="Selesai" status="Selesai" color="bg-blue-500" onClick={handleUpdateStatus} />
                  <StatusButton label="Canceled" status="Canceled" color="bg-gray-500" onClick={handleUpdateStatus} />
                </div>

                {/* SECTION FOOTER (Hapus & Tutup) */}
                <div>
                  <button
                    onClick={() => handleDelete(selectedBooking.id)}
                    className="w-full flex items-center justify-center gap-3 text-red-500 bg-gray-50 hover:bg-red-100/50 py-4 rounded-2xl transition-all active:scale-95 group border border-gray-200 hover:border-gray-200">
                    <span className="text-sm font-black uppercase tracking-[0.1em]">Delete Permanen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ALERT KUSTOM */}
        {alertConfig.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in duration-200">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${alertConfig.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-green-100 text-green-700'
                }`}>
                {alertConfig.type === 'danger' ? <Trash2 size={28} /> : <CheckCircle size={28} />}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${alertConfig.type === 'danger' ? 'text-red-600' : 'text-green-700'}`}>{alertConfig.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {alertConfig.title === 'Update Berhasil' ? (<>Booking <span className="font-bold text-slate-800">{selectedBooking?.roomName}</span> berhasil di-<span>{alertConfig.message.split('di-')[1]}</span></>
                ) : alertConfig.title === 'Konfirmasi Hapus' ? (<>Apakah Anda yakin ingin menghapus permanen peminjaman di <span className="font-semibold text-red-600">{selectedBooking?.roomName}</span>?
                  </>) : (
                  alertConfig.message)}
              </p>
              <div className="flex gap-3">
                {alertConfig.onConfirm ? (
                  <><button onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })} className="flex-1 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-500 transition-all duration-300 hover:bg-gray-200 hover:text-gray-600 active:scale-95">Batal</button>
                    <button onClick={() => { alertConfig.onConfirm?.(); setAlertConfig({ ...alertConfig, isOpen: false }); }} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl transition-all duration-300 hover:bg-red-700 hover:shadow-lg active:scale-95">Ya, Hapus</button>
                  </> ) : (
                  <button
                    onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                    className="w-full py-4 bg-blue-900 text-white font-bold rounded-2xl transition-all duration-300 hover:bg-blue-950 hover:shadow-lg hover:shadow-blue-900/20 active:scale-95">
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

const StatusButton = ({ label, status, color, onClick }: any) => (
  <button
    onClick={() => onClick(status)}
    className={`w-full py-3.5 ${color} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200 hover:brightness-90 active:scale-95 transition-all flex items-center justify-between px-6`}>
    {label} <ChevronRight size={16} />
  </button>
);

export default ManageBookingsPage;