import { useState } from "react";
import { Link } from "react-router-dom";
import { Listbox } from '@headlessui/react';
import { Eye, EyeOff, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

const positionsList = ["Mahasiswa", "Dosen", "Pegawai", "Admin"];

type FormErrors = {
  email: string;
  password: string;
  fullName: string;
  position: string;
};

type FormData = {
  fullName: string;
  email: string;
  password: string;
  position: string;
};

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    fullName: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate(); // untuk pindah halaman otomatis
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    position: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({
      ...prev,
      [name as keyof FormErrors]: "",
    }));
  };

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors: FormErrors = {
      email: "",
      password: "",
      fullName: "",
      position: ""
    };

    let isValid = true;

    // Logika Validasi
    if (!formData.fullName) {
      newErrors.fullName = "Nama lengkap wajib diisi!";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email wajib diisi!";
      isValid = false;
    }
    else if (!isValidEmail(formData.email)) {
      newErrors.email = "Gunakan format email seperti: nama@gmail.com";
      isValid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter!";
      isValid = false;
    }

    if (!formData.position) {
      newErrors.position = "Silahkan pilih!";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    setLoading(true);
    setAuthError("");
    setSuccessMsg("");

    try {
      // mengambil username dari email
      const generatedUsername = formData.email.split('@')[0];

      const finalData = {
        ...formData,
        username: generatedUsername, // Username otomatis terisi
        position: formData.position
      };

      const result = await registerUser(finalData); // Kirim ke Backend
      setSuccessMsg(result.message || "Registrasi Berhasil!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

      // Jeda 2 detik lalu pindah ke Login
    } catch (error: any) {
      setAuthError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-6 md:p-7 rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-md border border-gray-100">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-950 tracking-tight">Registrasi</h2>
          <p className="text-gray-500 mt-3 text-sm">Lengkapi data diri kamu sekarang!</p>
        </div>

        {successMsg && <div className="p-2 bg-green-100 text-green-700 rounded-lg text-sm text-center mb-4">{successMsg}</div>}
        {authError && <div className="p-2 bg-red-100 text-red-700 rounded-lg text-sm text-center mb-4">{authError}</div>}

        <form onSubmit={handleSubmit} noValidate className="space-y-1">
          <div className="flex flex-col gap-2">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-blue-950 mb-1.5">Full Name</label>
              {errors.fullName && <p className="text-red-500 text-[10px] mb-1 italic">{errors.fullName}</p>}
              <input
                name="fullName"
                type="text"
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-blue-800 outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm"
                placeholder="Full Name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-blue-950 mb-1.5">Email</label>
              {errors.email && <p className="text-red-500 text-[10px] mb-1 italic">{errors.email}</p>}
              <input
                name="email"
                type="email"
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-blue-800 outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm"
                placeholder="Email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-blue-950 mb-1.5">Password</label>
              {errors.password && <p className="text-red-500 text-[10px] mb-1 italic">{errors.password}</p>}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  onChange={handleChange}
                  className="w-full pr-12 p-3 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-blue-800 outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-900"
                >
                  {showPassword ? <EyeOff size={18} key="eye-off" /> : <Eye size={18} key="eye-on" />}
                </button>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-blue-950 mb-2">Posisi/Jabatan</label>
              {errors.position && <p className="text-red-500 text-[10px] mb-1 italic">{errors.position}</p>}
              <Listbox
                value={formData.position}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, position: value }))
                }>

                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3.5 pl-4 text-left border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800 transition-all placeholder:text-gray-400 text-sm shadow-sm">
                    <span
                      className={`block truncate text-sm ${!formData.position ? "text-gray-400" : "text-gray-700"
                        }`}
                    >
                      {formData.position || "Pilih Posisi"}
                    </span>

                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <ChevronDown size={18} strokeWidth={2.5} />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-50 max-h-40 mt-1 w-full overflow-auto rounded-lg bg-white py-1 shadow-2xl ring-1 ring-opacity-5 focus:outline-none border border-gray-100">
                    {positionsList.map((item) => (
                      <Listbox.Option
                        key={item}
                        value={item}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-all ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate text-sm ${selected ? 'font-bold text-blue-800' : 'font-normal'}`}>
                              {item}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-3 flex items-center text-blue-800">
                                <Check size={16} />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-bold mt-4 text-white shadow-lg transition-all duration-200
          ${loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-800 hover:bg-blue-900 active:bg-blue-950 active:scale-95"
              }`}
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-2">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-blue-800 font-bold cursor-pointer hover:underline">Login now</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;