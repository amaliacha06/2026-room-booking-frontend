import { useState } from "react";

const LoginPage = () => {
    // 1. Siapkan "memori" untuk email dan password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 2. Cek apakah datanya sudah masuk ke memori
    console.log("Mencoba login dengan:", { email, password });
    alert(`Halo! Kamu mencoba masuk dengan email: ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Catat ketikan email
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="masukkan email kamu"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Catat ketikan password
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition duration-300 transform hover:scale-[1.02]">
            Masuk Sekarang
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;