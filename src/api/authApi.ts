import api from "./axiosInstance";

export const loginUser = async (loginData: any) => {
  try {
    // Menembak endpoint /api/auth/login di backend ASP.NET 
    const response = await api.post("/Auth/login", loginData);
    return response.data;
  } catch (error: any) {
    // Menangkap error jika login gagal (misal: password salah)
    throw error.response?.data || "Terjadi kesalahan saat login";
  }
};
export const registerUser = async (registerData: any) => {
  try {
    const response = await api.post("/Auth/register", registerData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Gagal melakukan registrasi";
  }
};