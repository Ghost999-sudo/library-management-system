import { api } from './api.js'

/** Staff may read settings; only ADMIN may write them (enforced by the backend). */
export const settingsService = {
  async getSettings() {
    const { data } = await api.get('/settings')
    return data
  },

  /** PUT /settings — replaces all five policy values on the single settings row. */
  async updateSettings(payload) {
    const { data } = await api.put('/settings', payload)
    return data
  },
}
