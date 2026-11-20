import { api } from './api.js'

/** ADMIN-only account management. UserResponse never includes a password hash. */
export const userService = {
  async getUsers(params = {}) {
    const { data } = await api.get('/users', { params })
    return data
  },

  async getById(userId) {
    const { data } = await api.get(`/users/${userId}`)
    return data
  },

  /** POST /users — password is hashed by the backend. */
  async createUser(payload) {
    const { data } = await api.post('/users', payload)
    return data
  },

  /** PUT /users/{id} — username is immutable; a blank password keeps the current one. */
  async updateUser(userId, payload) {
    const { data } = await api.put(`/users/${userId}`, payload)
    return data
  },

  async changeStatus(userId, status) {
    const { data } = await api.patch(`/users/${userId}/status`, { status })
    return data
  },
}
