import { api } from './api.js'

/** MEMBER-only requests and staff-only decisions. The backend owns the dates and the loan. */
export const borrowRequestService = {
  /** A member asks for a title only; the librarian chooses the copy at approval. */
  async requestBook(bookId) {
    const { data } = await api.post('/borrow-requests', { bookId })
    return data
  },

  async getMyRequests(params = {}) {
    const { data } = await api.get('/borrow-requests/me', { params })
    return data
  },

  async getRequests(params = {}) {
    const { data } = await api.get('/borrow-requests', { params })
    return data
  },

  async approve(requestId, copyId) {
    const { data } = await api.post(`/borrow-requests/${requestId}/approve`, { copyId })
    return data
  },

  async reject(requestId, note) {
    const { data } = await api.post(`/borrow-requests/${requestId}/reject`, { note: note || null })
    return data
  },
}
