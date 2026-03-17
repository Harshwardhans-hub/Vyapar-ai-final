import axios from 'axios'
import { auth, googleProvider } from './firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'

const API_URL = import.meta.env.VITE_API_URL || ''

// ─── Token key constants (must match api.js) ─────────────────
const TOKEN_KEY = 'vyapar_ai_token'
const USER_KEY  = 'vyapar_ai_user'

/* ─── Auth helpers (Firebase + Local Storage) ──────────────── */
export const login = async (email, password) => {
  if (!email || !password) return false
  try {
    // 1. Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // 2. Call backend JWT endpoint (sync backend session)
    let token, user_id, role
    try {
      const res = await axios.post(`${API_URL}/api/auth/token`, { email, role: 'customer' })
      token = res.data.token
      user_id = res.data.user_id
      role = res.data.role
    } catch {
      token = await user.getIdToken()
      user_id = user.uid
      role = 'customer'
    }

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify({ 
      name: user.displayName || email.split('@')[0], 
      email, 
      user_id, 
      role 
    }))
    return true
  } catch (err) {
    console.error("Login failed:", err)
    return false
  }
}

export const register = async (name, email, password, company) => {
  if (!email || !password || password.length < 4) return false
  try {
    // 1. Firebase Register
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Set display name
    await updateProfile(user, { displayName: name })

    // 2. Call backend
    let token, user_id, role
    try {
      const res = await axios.post(`${API_URL}/api/auth/token`, { email, role: 'customer' })
      token = res.data.token
      user_id = res.data.user_id
      role = res.data.role
    } catch {
      token = await user.getIdToken()
      user_id = user.uid
      role = 'customer'
    }

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify({ name, email, user_id, role, company }))
    return true
  } catch (err) {
    console.error("Registration failed:", err)
    return false
  }
}

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    const email = user.email
    let token, user_id, role
    
    try {
      const res = await axios.post(`${API_URL}/api/auth/token`, { email, role: 'customer' })
      token = res.data.token
      user_id = res.data.user_id
      role = res.data.role
    } catch {
      token = await user.getIdToken()
      user_id = user.uid
      role = 'customer'
    }

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify({ 
      name: user.displayName || email.split('@')[0], 
      email, 
      user_id, 
      role 
    }))
    return true
  } catch (err) {
    console.error("Google login failed:", err)
    return false
  }
}

export const logout = async () => {
  try { await signOut(auth) } catch (e) { console.error(e) }
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const isAuthenticated = () => !!localStorage.getItem(TOKEN_KEY)
