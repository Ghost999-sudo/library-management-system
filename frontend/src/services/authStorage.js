/*
 * Single place responsible for holding the JWT.
 * In-memory first; sessionStorage only so the token disappears when the tab closes.
 * Swap this module for cookie-based auth later without touching components.
 */
const STORAGE_KEY = 'lms.accessToken'

let inMemoryToken = null

function readSession() {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export const authStorage = {
  getToken() {
    if (inMemoryToken) return inMemoryToken
    inMemoryToken = readSession()
    return inMemoryToken
  },

  setToken(token) {
    inMemoryToken = token || null
    try {
      if (inMemoryToken) sessionStorage.setItem(STORAGE_KEY, inMemoryToken)
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage may be unavailable (private browsing); in-memory still works.
    }
  },

  clear() {
    this.setToken(null)
  },
}
