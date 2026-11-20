import { api } from './api.js'

/** Staff collection endpoints and the MEMBER-only /loans/me endpoint. */
export const loanService = {
  /** Issued dates, due dates and issuing staff are always calculated by the backend. */
  async issueBook(payload) {
    const { data } = await api.post('/loans', payload)
    return data
  },

  async getLoans(params = {}) {
    const { data } = await api.get('/loans', { params })
    return data
  },

  async getOverdue(params = {}) {
    const { data } = await api.get('/loans/overdue', { params })
    return data
  },

  async getMyLoans(params = {}) {
    const { data } = await api.get('/loans/me', { params })
    return data
  },

  async getById(loanId) {
    const { data } = await api.get(`/loans/${loanId}`)
    return data
  },

  async returnBook(loanId) {
    const { data } = await api.post(`/loans/${loanId}/return`)
    return data
  },
}
