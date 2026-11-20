import { api } from './api.js'

/** Staff-only date-range reports. Dates are ISO YYYY-MM-DD, as the backend expects. */
export const reportService = {
  async getLoanReport({ startDate, endDate }) {
    const { data } = await api.get('/reports/loans', { params: { startDate, endDate } })
    return data
  },

  async getFineReport({ startDate, endDate }) {
    const { data } = await api.get('/reports/fines', { params: { startDate, endDate } })
    return data
  },
}
