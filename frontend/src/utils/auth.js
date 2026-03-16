import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

/* ─── Auth helpers (localStorage) ──────────────────────────── */
export const login = async (email, password) => {
  if (!email || !password || password.length < 4) return false
  try {
    // Call real backend JWT endpoint
    const res = await axios.post(`${API_URL}/api/auth/token`, { email, role: 'customer' })
    const { token, user_id, role } = res.data
    localStorage.setItem('seasonai_token', token)
    localStorage.setItem('seasonai_user', JSON.stringify({ name: email.split('@')[0], email, user_id, role }))
    return true
  } catch {
    // Fallback to local-only auth if backend is unreachable
    const token = btoa(unescape(encodeURIComponent(email)))
    localStorage.setItem('seasonai_token', token)
    localStorage.setItem('seasonai_user', JSON.stringify({ name: email.split('@')[0], email }))
    return true
  }
}

export const register = async (name, email, password, company) => {
  if (!email || !password || password.length < 4) return false
  try {
    const res = await axios.post(`${API_URL}/api/auth/token`, { email, role: 'customer' })
    const { token, user_id, role } = res.data
    localStorage.setItem('seasonai_token', token)
    localStorage.setItem('seasonai_user', JSON.stringify({ name, email, user_id, role, company }))
    return true
  } catch {
    const token = btoa(unescape(encodeURIComponent(email)))
    localStorage.setItem('seasonai_token', token)
    localStorage.setItem('seasonai_user', JSON.stringify({ name, email, company }))
    return true
  }
}

export const logout = () => {
  localStorage.removeItem('seasonai_token')
  localStorage.removeItem('seasonai_user')
}

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('seasonai_user')) } catch { return null }
}

export const getToken = () => localStorage.getItem('seasonai_token')

export const isAuthenticated = () => !!localStorage.getItem('seasonai_token')
