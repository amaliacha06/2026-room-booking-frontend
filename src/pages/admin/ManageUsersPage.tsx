import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import axios from "axios";
import { Pencil, Trash2, X, CheckCircle, Search, Mail, Phone, ShieldCheck, Eye } from "lucide-react";

interface UserData {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  position: string;
  createdAt: string;
}

const ManageUsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    FullName: "",
    Username: "",
    Email: "",
    PhoneNumber: "",
    Position: "Mahasiswa",
  });

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'info' | 'danger';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5135/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.FullName.trim())
      newErrors.fullName = "Nama lengkap wajib diisi";

    if (!formData.Username.trim())
      newErrors.username = "Username wajib diisi";

    if (!formData.Email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.email = "Format email tidak valid (contoh: user@gmail.com)";
    }

    if (!formData.PhoneNumber.trim()) {
      newErrors.phoneNumber = "Nomor WhatsApp wajib diisi";
    }

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
          "Content-Type": "application/json"
        }
      };

      if (selectedUser) {
        await axios.put(
          `http://localhost:5135/api/users/${selectedUser.id}`,
          formData,
          config
        );

        setAlertConfig({
          isOpen: true,
          type: "info",
          title: "Update Berhasil",
          message: `Data user "${formData.FullName}" telah diperbarui`
        });
      } else {
        await axios.post(
          "http://localhost:5135/api/users",
          formData,
          config
        );
      }

      setIsModalOpen(false);
      fetchUsers();

    } catch (error: any) {
      console.log(error.response?.status);
      console.log(error.response?.data);

      setAlertConfig({
        isOpen: true,
        type: "danger",
        title: "Gagal Update",
        message:
          error.response?.data?.message ||
          "Terjadi kesalahan saat memproses data user"
      });
    }
  };


  const handleDeleteUser = (user: UserData) => {
    setAlertConfig({
      isOpen: true, type: 'danger', title: 'Konfirmasi Hapus',
      message: `Hapus akun "${user.fullName}" secara permanen?`,
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5135/api/users/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchUsers();
          setAlertConfig({ isOpen: true, type: 'info', title: 'Berhasil', message: 'User telah dihapus dari sistem' });
        } catch (error) { alert("Gagal menghapus user"); }
      }
    });
  };

  const handleOpenModal = (user: UserData | null = null) => {
    setErrors({});
    if (user) {
      setSelectedUser(user);
      setFormData({
        FullName: user.fullName, Username: user.username, Email: user.email,
        PhoneNumber: user.phoneNumber || "", Position: user.position
      });
    } else {
      setSelectedUser(null);
      setFormData({ FullName: "", Username: "", Email: "", PhoneNumber: "", Position: "Mahasiswa" });
    }
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-blue-50/50 min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 pt-20 pb-12 md:px-12 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto text-slate-900">

          <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h1 className="text-2xl font-black text-blue-900 tracking-tight">Manajement Users</h1>
              <p className="text-gray-500 mt-2 font-medium">Daftar User yang terdaftar di sistem</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search.."
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:border-blue-700 outline-none shadow-sm transition-all text-sm font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </header>

          <div className="bg-white rounded-[1rem] shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-blue-900 text-white text-[15px] uppercase tracking-widest text-center font-bold">
                  <th className="px-6 py-5 w-16">No</th>
                  <th className="px-6 py-5 text-center">Nama Lengkap</th>
                  <th className="px-6 py-5 text-center">Username</th>
                  <th className="px-6 py-5 text-center">Email</th>
                  <th className="px-6 py-4 w-32 text-center">Posisi</th>
                  <th className="px-6 py-4 w-44 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 font-bold">
                {loading ? (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-400">Loading data user...</td></tr>
                ) : filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group text-slate-700">
                    <td className="px-6 py-6 text-center text-gray-500 font-medium">{index + 1}</td>

                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-lg border-2 border-white shadow-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-blue-900 font-bold text-base">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center text-slate-500 font-medium text-base">@{user.username}</td>
                    <td className="px-6 py-6 text-center text-slate-500 font-medium text-base">{user.email}</td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase border ${user.position === 'Admin' ? 'bg-red-50 text-red-600 border-red-300' : 'bg-blue-50 text-blue-700 border-blue-300'
                        }`}>
                        {user.position}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }} className="p-2.5 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90" title="View Detail"><Eye size={18} /></button>
                        <button onClick={() => handleOpenModal(user)} className="p-2.5 bg-slate-50 text-orange-600 hover:bg-yellow-500  hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><Pencil size={18} /></button>
                        <button onClick={() => handleDeleteUser(user)} className="p-2.5 bg-slate-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL VIEW DETAIL */}
        {isViewModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden relative animate-in zoom-in duration-300">
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-all z-10"><X size={24} strokeWidth={3} /></button>
              <div className="bg-blue-900 p-6 text-center">
                <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20 text-white font-black text-3xl">{selectedUser.username.charAt(0).toUpperCase()}</div>
                <h2 className="text-xl font-black text-white">{selectedUser.fullName}</h2>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">{selectedUser.position}</p>
              </div>
              <div className="p-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-700 border border-slate-100"><Mail size={18} /></div>
                  <div><p className="text-[14px] text-slate-600 font-bold uppercase">Email</p><p className="text-xs text-slate-400">{selectedUser.email}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center font-bold text-emerald-700 border border-slate-100"><Phone size={18} /></div>
                  <div><p className="text-[14px] text-slate-600 font-bold uppercase">No. Telepon</p><p className="text-xs text-slate-400">{selectedUser.phoneNumber || "-"}</p></div>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center font-bold text-amber-600 border border-slate-100"><ShieldCheck size={18} /></div>
                  <div><p className="text-[14px] text-slate-600 font-bold uppercase">Terdaftar Pada</p><p className="text-xs text-slate-400">{new Date(selectedUser.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all mt-2">Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FORM EDIT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 transition-all"><X size={20} strokeWidth={3} /></button>
              <h2 className="text-2xl font-black text-blue-900 leading-tight mb-1">{selectedUser ? 'Update User' : 'User Baru'}</h2>
              <p className="text-gray-500 text-[12px] mb-6 font-semibold">Lengkapi informasi akun mahasiswa</p>
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <div>
                  <label className="text-[14px] font-bold text-slate-600 ml-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  {errors.fullName && <p className="text-red-500 text-[10px] italic font-normal mt-0.5 ml-1">{errors.fullName}</p>}
                  <input type="text" className={`w-full bg-slate-50 border-2 rounded-xl px-5 py-3 focus:border-blue-800 outline-none transition-all mt-1 ${errors.fullName ? 'border-red-400' : 'border-slate-200/50'}`} value={formData.FullName} onChange={(e) => { setFormData({ ...formData, FullName: e.target.value }); if (errors.fullName) setErrors({ ...errors, fullName: "" }) }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 flex gap-1 ml-1">Username <span className="text-red-500">*</span></label>
                    {errors.username && <p className="text-red-500 text-[10px] italic font-normal mt-0.5 ml-1">{errors.username}</p>}
                    <input type="text" className={`w-full bg-slate-50 border-2 rounded-xl px-5 py-3 focus:border-blue-700 outline-none transition-all mt-1 text-slate-600 font-medium ${errors.username ? 'border-red-400' : 'border-slate-100'}`} value={formData.Username} onChange={(e) => { setFormData({ ...formData, Username: e.target.value }); if (errors.username) setErrors({ ...errors, username: "" }) }} />
                  </div>
                  <div>
                    <label className="text-[14px] font-bold text-slate-700 ml-1">Posisi</label>
                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-3 focus:border-blue-800 outline-none mt-1" value={formData.Position} onChange={(e) => setFormData({ ...formData, Position: e.target.value })}>
                      <option value="Admin">Admin</option>
                      <option value="Admin">Dosen</option>
                      <option value="Mahasiswa">Mahasiswa</option>
                      <option value="Admin">Staff</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 flex gap-1 ml-1">Email <span className="text-red-500">*</span></label>
                  {errors.email && <p className="text-red-500 text-[10px] italic font-normal mt-0.5 ml-1">{errors.email}</p>}
                  <input
                    type="email"
                    className={`w-full bg-slate-50 border-2 rounded-xl px-5 py-3 focus:border-blue-700 outline-none transition-all mt-1 text-slate-600 font-medium ${errors.email ? 'border-red-400' : 'border-slate-100'}`}
                    value={formData.Email}
                    onChange={(e) => {
                      setFormData({ ...formData, Email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 flex gap-1 ml-1">No. HP <span className="text-red-500">*</span></label>
                  {errors.phoneNumber && <p className="text-red-500 text-[10px] italic font-normal mt-0.5 ml-1">{errors.phoneNumber}</p>}
                  <input
                    type="text"
                    className={`w-full bg-slate-50 border-2 rounded-xl px-5 py-3 focus:border-blue-700 outline-none transition-all mt-1 text-slate-600 font-medium ${errors.phoneNumber ? 'border-red-400' : 'border-slate-100'}`}
                    value={formData.PhoneNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, PhoneNumber: e.target.value });
                      if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" })
                    }}
                  />
                </div>
                <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl mt-4 hover:bg-blue-950 transition-all active:scale-95">SIMPAN DATA</button>
              </form>
            </div>
          </div>
        )}

        {/* ALERT */}
        {alertConfig.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in duration-200 font-bold">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${alertConfig.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {alertConfig.type === 'danger' ? <Trash2 size={32} /> : <CheckCircle size={32} />}
              </div>
              <h3 className={`text-2xl font-black mb-2 ${alertConfig.type === 'danger' ? 'text-red-600' : 'text-green-700'}`}>{alertConfig.title}</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium text-center">
                {alertConfig.title === 'Update Berhasil' || alertConfig.title === 'Berhasil Tambah' ? (
                  <>Data user <span className="font-bold text-green-800">{formData.FullName}</span> telah {alertConfig.title === 'Update Berhasil' ? 'diperbarui' : 'terdaftar'}.</>
                ) : alertConfig.title === 'Konfirmasi Hapus' ? (
                  <>Apakah Anda yakin menghapus permanen akun <span className="font-bold text-red-600">{selectedUser?.fullName}</span>?</>
                ) : alertConfig.message}
              </p>
              <div className="flex gap-3">
                {alertConfig.onConfirm ? (
                  <><button onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500  hover:bg-gray-200">Batal</button>
                    <button onClick={() => { alertConfig.onConfirm?.(); setAlertConfig({ ...alertConfig, isOpen: false }); }} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl active:scale-95 shadow-lg">Ya, Hapus</button>
                  </>
                ) : (
                  <button onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })} className="w-full py-4 bg-blue-900 text-white font-black rounded-2xl text-sm uppercase tracking-widest active:scale-95 hover:bg-blue-950">Mengerti</button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageUsersPage;