const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api'

const getToken   = () => localStorage.getItem('teamup_token')
const getRefresh = () => localStorage.getItem('teamup_refresh')

async function tryRefresh() {
  const refresh_token = getRefresh()
  if (!refresh_token) return false

  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    })
    if (!res.ok) throw new Error('refresh failed')
    const { access_token, refresh_token: newRefresh } = await res.json()
    localStorage.setItem('teamup_token', access_token)
    if (newRefresh) localStorage.setItem('teamup_refresh', newRefresh)
    return true
  } catch {
    localStorage.removeItem('teamup_token')
    localStorage.removeItem('teamup_refresh')
    return false
  }
}

async function request(path, options = {}, retry = false) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  // Auto-refresh on 401 (once) — skip for auth endpoints to avoid loops
  if (res.status === 401 && !retry && path !== '/auth/login' && path !== '/auth/refresh') {
    const ok = await tryRefresh()
    if (ok) return request(path, options, true)
    // Refresh failed — kick to login
    window.location.href = '/login'
    return
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw Object.assign(new Error(data.error ?? 'Request failed'), { status: res.status, data })
  }
  return data
}

export const api = {
  get:    (path, opts) => request(path, { method: 'GET', ...opts }),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body ?? {}) }),
  patch:  (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body ?? {}) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
}
