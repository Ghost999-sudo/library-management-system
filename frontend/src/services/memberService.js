import { api } from './api.js'

/** Staff-only member management; MEMBER users use /members/me via their own service. */
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
}
