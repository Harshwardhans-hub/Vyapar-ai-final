import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../utils/auth'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const ok = await register(form.name, form.email, form.password, form.company)
    setLoading(false)
    if (ok) {
      navigate('/dashboard')
    } else {
      setError('Registration failed. Password must be at least 4 characters.')
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} required
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-500 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-brand-900">SeasonAI</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start using AI-powered business intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'Full Name', 'text', 'Jane Smith')}
          {field('company', 'Company', 'text', 'Acme Corp')}
          {field('email', 'Work Email', 'email', 'jane@acme.com')}
          {field('password', 'Password', 'password', '4+ characters')}

          <p className="text-xs text-gray-400">
            By signing up you agree to our{' '}
            <a href="#" className="text-brand-600 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>.
          </p>

          {error && (
            <p className="text-red-500 text-xs text-center bg-red-50 rounded-lg py-2 px-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
