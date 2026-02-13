import axios from 'axios';

const api = axios.create({
  // Sesuaikan URL ini dengan alamat running Backend ASP.NET 
  baseURL: 'http://localhost:5135/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;