import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/axios'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-void)' }}>
      <div className="w-full max-w-sm">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            CodeLens <span style={{ color: 'var(--signal)' }}>AI</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Create an account to get started
          </p>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 text-sm rounded"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--line)', color: '#F87171' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Ayush Durukkar"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium rounded transition disabled:opacity-50"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-void)' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--signal)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


const Field = ({ label, ...props }) => (
  <div>
    <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
      {label}
    </label>
    <input
      {...props}
      required
      className="w-full px-3 py-2.5 text-sm rounded outline-none transition"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--line)',
        color: 'var(--text-primary)'
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--signal)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
    />
  </div>
)

export default Register