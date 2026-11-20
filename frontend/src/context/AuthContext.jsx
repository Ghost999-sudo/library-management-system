import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService.js'
import { authStorage } from '../services/authStorage.js'
import { setUnauthorizedHandler } from '../services/api.js'
import { ROLE_DASHBOARD } from '../utils/constants.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(authStorage.getToken()))

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authStorage.clear()
      setUser(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    if (!authStorage.getToken()) {
      setLoading(false)
      return undefined
    }

    let active = true
    authService
      .me()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        if (active) {
          authStorage.clear()
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password)
    authStorage.setToken(data.accessToken)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Stateless logout: always clear locally, even when the token expired.
    }
    authStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      hasRole: (...roles) => Boolean(user && roles.includes(user.role)),
      dashboardPath: user ? ROLE_DASHBOARD[user.role] || '/login' : '/login',
      login,
      logout,
    }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
