import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { LogoFull } from '../components/Logo.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Dark card */}
        <div className="rounded-3xl border border-white/[0.12] bg-[#04080f]/90 p-8 shadow-2xl shadow-black/60 backdrop-blur-2xl">

          {/* Brand */}
          <div className="mb-8 text-center">
            <LogoFull className="mb-5" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-1.5 text-sm text-white">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={form.email}
                onChange={set('email')}
                className="w-full rounded-xl border border-white/15 bg-white/[0.07] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white transition-colors focus:border-[#4fd1ff]/50 focus:bg-white/[0.10] focus:outline-none"
              />
            </div>

            <div className="relative">
              <FiLock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
              <input
                type="password"
                placeholder="Password"
                required
                value={form.password}
                onChange={set('password')}
                className="w-full rounded-xl border border-white/15 bg-white/[0.07] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white transition-colors focus:border-[#4fd1ff]/50 focus:bg-white/[0.10] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4fd1ff] to-violet-500 py-3.5 text-sm font-bold text-[#030712] shadow-lg shadow-[#4fd1ff]/25 transition-all duration-200 hover:brightness-110 disabled:opacity-60"
            >
              {loading ? <Spinner size="sm" /> : <><span>Sign In</span><FiArrowRight size={14} /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-white">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#4fd1ff] hover:underline">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
