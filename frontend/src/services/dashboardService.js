import { api } from './api.js'

/** Staff-only dashboard statistics from GET /api/v1/dashboard/summary. */
export const dashboardService = {
  async getSummary() {
    const { data } = await api.get('/dashboard/summary')
    return data
  },
}
