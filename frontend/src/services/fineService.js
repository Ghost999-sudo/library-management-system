import { api } from './api.js'

/** Staff fine endpoints and the MEMBER-only /fines/me endpoint. */
export const fineService = {
  async getFines(params = {}) {
    const { data } = await api.get('/fines', { params })
    return data
  },

  async getMyFines(params = {}) {
    const { data } = await api.get('/fines/me', { params })
    return data
  },

  async getById(fineId) {
    const { data } = await api.get(`/fines/${fineId}`)
    return data
  },

  async getPayments(fineId) {
    const { data } = await api.get(`/fines/${fineId}/payments`)
    return data
  },

  async recordPayment(fineId, payload) {
    const { data } = await api.post(`/fines/${fineId}/payments`, payload)
    return data
  },
}
