import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api/auth.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiMail, FiLock, FiUser, FiAtSign, FiArrowRight } from 'react-icons/fi'
import { LogoFull } from '../components/Logo.jsx'

const FIELDS = [
  { key: 'fullName',  placeholder: 'Full Name',  type: 'text',     icon: FiUser },
  { key: 'username',  placeholder: 'Username',   type: 'text',     icon: FiAtSign },
  { key: 'email',     placeholder: 'Email',      type: 'email',    icon: FiMail },
  { key: 'password',  placeholder: 'Password',   type: 'password', icon: FiLock },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.signup(form)
      toast.success('Account created! You can now log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message ?? 'Signup failed')
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
            <p className="mt-1.5 text-sm text-white/60">Join the community and start collaborating</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {FIELDS.map(({ key, placeholder, type, icon: Icon }) => (
              <div key={key} className="relative">
                <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
                <input
                  type={type}
                  placeholder={placeholder}
                  required
                  value={form[key]}
                  onChange={set(key)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.07] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 transition-colors focus:border-[#4fd1ff]/50 focus:bg-white/[0.10] focus:outline-none"
                />
              </div>
            ))}

            <div className="relative">
              <select
                value={form.role}
                onChange={set('role')}
                className="w-full appearance-none rounded-xl border border-white/15 bg-[#0a1020] px-4 py-3.5 text-sm text-white transition-colors focus:border-[#4fd1ff]/50 focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">▾</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4fd1ff] to-violet-500 py-3.5 text-sm font-bold text-[#030712] shadow-lg shadow-[#4fd1ff]/25 transition-all duration-200 hover:brightness-110 disabled:opacity-60"
            >
              {loading ? <Spinner size="sm" /> : <><span>Create Account</span><FiArrowRight size={14} /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-white/55">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#4fd1ff] hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
