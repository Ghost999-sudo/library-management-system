import { api } from './api.js'

/** Thin wrapper around the authentication endpoints; no UI concerns here. */
export const authService = {
  async login(username, password) {
    const { data } = await api.post('/auth/login', { username, password })
    return data
  },

  async me() {
    const { data } = await api.get('/auth/me')
    return data
  },

  async logout() {
    const { data } = await api.post('/auth/logout')
    return data
  },
}
