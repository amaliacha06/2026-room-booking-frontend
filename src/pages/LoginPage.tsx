import { useState } from "react";
import { loginUser } from "../api/authApi"; // Import fungsi API
import { Eye, EyeOff, } from "lucide-react"; // 1. Impor ikonnya
import { Link } from "react-router-dom";

const LoginPage = () => {
  // 1. Siapkan "memori" untuk email dan password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // State untuk loading
  const [showPassword, setShowPassword] = useState(false); // 2. State untuk mata

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      // Jika berhasil, simpan token ke Local Storage
      localStorage.setItem("token", result.token);

      alert("Selamat! " + result.message);
      console.log("Data User:", result.user);

      // Nanti di sini kita bisa arahkan ke Dashboard
    } catch (error: any) {
      // Jika gagal (email salah/CORS error), tampilkan pesan error
      alert("Login Gagal: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"> {/* Background abu sangat muda */}
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-md border border-gray-100">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-950 tracking-tight">Login</h2>
          <p className="text-gray-500 mt-3">Yuk Booking Ruangan Kamu!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-blue-950 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all placeholder:text-gray-400 text-sm shadow-sm"
              placeholder="Email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-950 mb-2">Password</label>
            <div className="relative"> {/* 3. Tambahkan 'relative' di pembungkus */}
              <input
                type={showPassword ? "text" : "password"} // 4. Tipe input berubah dinamis
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all placeholder:text-gray-400 shadow-sm text-sm"
                placeholder="Password "
                required
              />
              {/* 5. Tombol ikon mata yang sudah dibersihkan */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-blue-900 transition-colors focus:outline-none"
              >
                {/* 👇 HANYA PAKAI BLOK INI, JANGAN ADA BARIS IKON LAIN DI ATASNYA */}
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-200 transform 
            ${loading
                ? 'bg-blue-300 cursor-not-allowed scale-100' // Saat loading, jangan bisa mengecil (scale)
                : 'bg-blue-800 hover:bg-blue-900 active:bg-blue-950 active:scale-95 hover:shadow-blue-200'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                {/* Kamu bisa tambah spinner kecil di sini nanti */}
                Memverifikasi...
              </span>
            ) : (
              "Masuk"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-700 font-bold cursor-pointer hover:underline">Sign Up</Link>
          </p>
        </form>
      </div >
    </div >
  );
};

export default LoginPage;