import axios from 'axios'

// En Vercel se define VITE_API_URL con la URL del backend en Render;
// en desarrollo local, sin esa variable, apunta al backend local.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
