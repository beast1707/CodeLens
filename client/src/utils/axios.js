import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
})

// Endpoints where a 401 is a NORMAL, expected outcome — never trigger refresh or redirect here
const SKIP_AUTH_HANDLING = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const shouldSkip = SKIP_AUTH_HANDLING.some(path => originalRequest.url?.includes(path))

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkip) {
      originalRequest._retry = true

      try {
        await api.post('/auth/refresh')
        return api(originalRequest)
      } catch (refreshError) {
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api