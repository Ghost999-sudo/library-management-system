import { api } from './api.js'

/** Staff manage the collection; MEMBER users may only read /members/me. */
export const memberService = {
  async getMembers(params = {}) {
    const { data } = await api.get('/members', { params })
    return data
  },

  async getById(memberId) {
    const { data } = await api.get(`/members/${memberId}`)
    return data
  },

  async getMe() {
    const { data } = await api.get('/members/me')
    return data
  },

  /** POST /members — creates the user account and the member together. */
  async createMember(payload) {
    const { data } = await api.post('/members', payload)
    return data
  },

  /** PUT /members/{memberId} — user account fields are not part of this DTO. */
  async updateMember(memberId, payload) {
    const { data } = await api.put(`/members/${memberId}`, payload)
    return data
  },

  async changeStatus(memberId, status) {
    const { data } = await api.patch(`/members/${memberId}/status`, { status })
    return data
  },
}
