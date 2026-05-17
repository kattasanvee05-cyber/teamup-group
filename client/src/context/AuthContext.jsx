import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { authApi } from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('teamup_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(({ user, profile }) => {
        if (!cancelled) { setUser(user); setProfile(profile) }
      })
      .catch(() => {
        if (!cancelled) localStorage.removeItem('teamup_token')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email, password) => {
    const { session, user, profile } = await authApi.login({ email, password })
    localStorage.setItem('teamup_token', session.access_token)
    localStorage.setItem('teamup_refresh', session.refresh_token)
    setUser(user)
    setProfile(profile)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    localStorage.removeItem('teamup_token')
    localStorage.removeItem('teamup_refresh')
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(async (body) => {
    const { profile: updated } = await authApi.updateMe(body)
    setProfile(updated)
    return updated
  }, [])

  const value = useMemo(
    () => ({ user, profile, loading, login, logout, updateProfile, isAuth: !!user }),
    [user, profile, loading, login, logout, updateProfile]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
