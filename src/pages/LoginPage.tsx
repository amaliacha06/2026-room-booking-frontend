import { useState } from "react";
import { loginUser } from "../api/authApi"; // Import fungsi API
import { Eye, EyeOff, } from "lucide-react"; // 1. Impor ikonnya
import { Link } from "react-router-dom";

type Errors = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<Errors>({
    email: "",
    password: "",
  }); // error per input
  const [authError, setAuthError] = useState(""); // error global
  const [loading, setLoading] = useState(false); // State untuk loading
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setAuthError("");
    setSuccessMsg("");

    let newErrors: Errors = {
      email: "",
      password: "",
    };

    let isValid = true;

    if (!email) {
      newErrors.email = "Email wajib diisi";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      // Jika berhasil, simpan token ke Local Storage
      localStorage.setItem("token", result.token);
      // Ambil pesan sukses dari Swagger 
      setSuccessMsg(result.message);
      console.log("Data User:", result.user);

      // Nanti di sini bisa arahkan ke halaman tujuan
    } catch (error: any) {
      // Jika gagal (email salah/CORS error), tampilkan pesan error
      setAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-md border border-gray-100">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-950 tracking-tight">Login</h2>
          <p className="text-gray-500 mt-3">Yuk Booking Ruangan Kamu!</p>
        </div>

        {successMsg && (
          <div className="mb-4 p-2 text-sm text-green-700 bg-green-100 rounded-lg text-center">
            {successMsg}
          </div>
        )}

        {authError && (
          <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded-lg text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-blue-950 mb-2">Email</label>
            {errors.email && (
              <p className="text-red-500 text-xs mb-1 italic">{errors.email}</p>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors(prev => ({ ...prev, email: "" }));
              }}
              className="w-full p-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all placeholder:text-gray-400 text-sm shadow-sm"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-950 mb-2">Password</label>
            {errors.password && (
              <p className="text-red-500 text-xs mb-1 italic">{errors.password}</p>
            )}
            <div className="relative"> 
              <input
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors(prev => ({ ...prev, password: "" }));
                }}
                className="w-full p-3 pr-12 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all placeholder:text-gray-400 shadow-sm text-sm"
                placeholder="Password "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-blue-900 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl mt-1 font-bold text-white shadow-lg transition-all duration-200 transform 
            ${loading
                ? 'bg-blue-300 cursor-not-allowed scale-100' 
                : 'bg-blue-800 hover:bg-blue-900 active:bg-blue-950 active:scale-95 hover:shadow-blue-200'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                Memverifikasi...
              </span>
            ) : (
              "Masuk"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link to="/register" className="text-blue-800 font-bold cursor-pointer hover:underline">Sign Up</Link>
          </p>
        </form>
      </div >
    </div >
  );
};

export default LoginPage;