import { useState } from "react";
import { Link } from "react-router-dom";
import { Listbox } from '@headlessui/react';
import { Eye, EyeOff, ChevronDown, Briefcase, Check } from 'lucide-react';

// 1. Taruh daftar pilihan di luar komponen agar rapi
const positionsList = ["Mahasiswa", "Dosen", "Pegawai", "Admin"];

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  // 2. State untuk Dropdown (Default pilih Mahasiswa)
  const [selectedPosition, setSelectedPosition] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 3. Gabungkan data input dengan pilihan dropdown saat submit
    const finalData = { ...formData, position: selectedPosition };
    console.log("Data Registrasi Siap Kirim:", finalData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-md border border-gray-100">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-950 tracking-tight">Registrasi</h2>
          <p className="text-gray-500 mt-3 text-sm">Lengkapi data diri kamu sekarang!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-blue-950 mb-1.5">Full Name</label>
              <input
                name="fullName"
                type="text"
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-blue-800 outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm"
                placeholder="Full Name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-blue-950 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-blue-800 outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm"
                placeholder="Email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-blue-950 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  onChange={handleChange}
                  className="w-full pr-12 p-3 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-blue-800 outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm"
                  placeholder="Password"
                  required
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

            {/* Position (Dropdown UI) */}
            <div>
              <label className="block text-sm font-semibold text-blue-950 mb-2">Posisi/Jabatan</label>
              <Listbox value={selectedPosition} onChange={setSelectedPosition}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3.5 pl-4 text-left border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800 shadow-sm transition-all placeholder:text-gray-400 text-sm shadow-sm">
                    <span className={`block truncate text-sm ${!selectedPosition ? 'text-gray-400' : 'text-gray-700'}`}>
                      {selectedPosition || "Pilih Posisi"}
                    </span>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <ChevronDown size={18} strokeWidth={2.5} />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 max-h-50 w-full overflow-auto rounded-lg bg-white py-1 shadow-2xl ring-1 ring-opacity-5 focus:outline-none z-50 border border-gray-100">
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
            className="w-full bg-blue-800 hover:bg-blue-900 active:bg-blue-950 active:scale-95 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all duration-200 mt-4"
          >
            Daftar Sekarang
          </button>

          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-blue-800 font-bold cursor-pointer hover:underline">Login di sini</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;