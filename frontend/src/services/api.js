import axios from 'axios'
import { authStorage } from './authStorage.js'
import { toAppError } from '../utils/errors.js'

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '')

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

let unauthorizedHandler = null

/** AuthContext registers a callback so a 401 clears the session consistently. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear()
      unauthorizedHandler?.()
    }
    return Promise.reject(toAppError(error))
  },
)

export default api
