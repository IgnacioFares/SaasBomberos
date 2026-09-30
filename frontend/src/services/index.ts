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

// El token JWT dura 24 horas. Cuando vence (o deja de ser válido porque
// cambió el secreto del backend), todas las peticiones empiezan a
// responder 401 y la app quedaba mostrando errores sueltos en cada
// pantalla. Acá se corta por lo sano: se descarta el token y se manda
// al login una sola vez.
//
// Se excluyen el login (para que "email o contraseña incorrectos" se vea
// en el formulario) y /me al arrancar, que AuthContext ya resuelve solo
// sin recargar la página.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    const loManejaAuthContext =
      url.includes('/api/usuarios/login') || url.includes('/api/usuarios/me')
    if (error.response?.status === 401 && !loManejaAuthContext) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
