import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import { FiGrid, FiBriefcase, FiUsers, FiFileText, FiLogOut, FiZap, FiBook, FiMenu, FiX, FiPlus, FiCode } from 'react-icons/fi'
import { LogoIcon } from './Logo.jsx'
import NotificationBell from './NotificationBell.jsx'
import SplashScreen from './SplashScreen.jsx'

const QUOTES = [
  { icon: '📚', text: 'Your notes are missing you. Time to study!' },
  { icon: '☕', text: 'Fuel up — big ideas need fuel.' },
  { icon: '🚀', text: 'One more chapter, future engineer!' },
  { icon: '🧠', text: 'The grind is silent, but the results speak loud.' },
  { icon: '💡', text: 'Ideas unite. Pick up where you left off.' },
  { icon: '⚡', text: 'Every line of code takes you closer to the dream.' },
  { icon: '🎯', text: 'Focus mode: ON. Distraction mode: OFF.' },
  { icon: '🌟', text: 'You are one study session away from a breakthrough.' },
  { icon: '🔥', text: 'The team is waiting. Make your contribution count.' },
  { icon: '📐', text: 'Even the greatest engineers started with a drafter.' },
  { icon: '🏆', text: "Consistency beats talent when talent doesn't show up." },
  { icon: '🌙', text: 'Late nights build early successes. Keep going!' },
]

const NAV_LINKS = [
  { to: '/dashboard',     label: 'Dashboard',     icon: FiGrid },
  { to: '/opportunities', label: 'Opportunities', icon: FiZap },
  { to: '/internships',   label: 'Internships',   icon: FiBriefcase },
  { to: '/projects',      label: 'Projects',      icon: FiCode },
  { to: '/clubs',         label: 'Clubs',         icon: FiUsers },
  { to: '/studies',       label: 'Studies',       icon: FiBook },
  { to: '/applications',  label: 'My Apps',       icon: FiFileText },
]

export default function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const quoteIdx = useRef(Math.floor(Math.random() * QUOTES.length))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutSplash, setShowLogoutSplash] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!profile) return
    const id = setInterval(() => {
      const q = QUOTES[quoteIdx.current % QUOTES.length]
      quoteIdx.current += 1
      toast(`${q.icon} ${q.text}`, {
        duration: 5000,
        style: {
          background: '#0d1628',
          color: '#f0f4ff',
          border: '1px solid rgba(79,209,255,0.15)',
          borderRadius: '14px',
          fontSize: '13px',
          maxWidth: '340px',
        },
      })
    }, 8 * 60 * 1000)
    return () => clearInterval(id)
  }, [profile])

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    setShowLogoutSplash(true)
  }

  return (
    <>
      {showLogoutSplash && (
        <SplashScreen onComplete={() => { setShowLogoutSplash(false); navigate('/') }} />
      )}
      <nav
        className="fixed inset-x-0 top-0 z-[60] border-b border-white/[0.1] bg-[#04080f]/92 backdrop-blur-2xl"
        style={{ boxShadow: '0 2px 12px rgba(4,8,15,0.6)' }}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-screen-2xl items-center justify-between px-5 sm:px-8">

          {/* Brand */}
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <LogoIcon size={38} />
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="inline-block bg-gradient-to-r from-[#ffe08a] via-[#f5c842] to-[#c8860a] bg-clip-text text-lg font-black tracking-[0.12em] text-transparent pb-[2px]">
                TEAMUP
              </span>
              <span className="hidden sm:inline-block bg-gradient-to-r from-amber-400 via-pink-400 to-violet-400 bg-clip-text text-[11px] font-bold tracking-[0.14em] text-transparent uppercase pb-[1px]">
                Ideas Unite · Future Ignite
              </span>
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden items-center rounded-xl border border-white/[0.18] bg-white/[0.04] p-1.5 md:flex">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-[#4fd1ff]/15 text-[#4fd1ff]'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'}`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Create button — desktop */}
          {profile && (
            <Link
              to="/create"
              className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 hover:brightness-110 md:flex"
              style={{
                background: 'linear-gradient(135deg, rgba(79,209,255,0.18), rgba(167,139,250,0.18))',
                border: '1px solid rgba(79,209,255,0.28)',
                color: '#4fd1ff',
              }}
            >
              <FiPlus size={14} />
              Create
            </Link>
          )}

          {/* Right: user + controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {profile && <NotificationBell />}
            {profile?.username && (
              <Link to="/profile" className="hidden items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.06] sm:flex">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4fd1ff]/40 to-violet-500/40 text-sm font-black text-[#4fd1ff] ring-2 ring-[#4fd1ff]/20">
                  {(profile.full_name ?? profile.username)[0].toUpperCase()}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-white">{profile.full_name ?? profile.username}</span>
                  <span className="text-[10px] text-white/50">@{profile.username}</span>
                </div>
              </Link>
            )}
            <div className="hidden h-5 w-px bg-white/10 sm:block" />
            <button
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/65 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 sm:flex"
            >
              <FiLogOut size={14} />
              <span className="hidden sm:block">Logout</span>
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle navigation"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white md:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'x' : 'menu'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[4.5rem] z-[59] border-b border-white/[0.08] bg-[#04080f]/97 backdrop-blur-2xl md:hidden"
            style={{ boxShadow: '0 12px 40px rgba(4,8,15,0.75)' }}
          >
            <div className="mx-auto max-w-screen-2xl px-4 pb-4 pt-3">
              <div className="space-y-0.5">
                {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                        ${active
                          ? 'bg-[#4fd1ff]/12 text-[#4fd1ff]'
                          : 'text-white/65 hover:bg-white/[0.05] hover:text-white'}`}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  )
                })}
              </div>

              <Link
                to="/create"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200"
                style={{ background: 'rgba(79,209,255,0.08)', border: '1px solid rgba(79,209,255,0.18)', color: '#4fd1ff' }}
              >
                <FiPlus size={15} />
                Create New
              </Link>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3 px-1">
                {profile?.username && (
                  <Link to="/profile" className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-white/[0.05]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4fd1ff]/40 to-violet-500/40 text-sm font-black text-[#4fd1ff] ring-2 ring-[#4fd1ff]/20">
                      {(profile.full_name ?? profile.username)[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-bold text-white">{profile.full_name ?? profile.username}</span>
                      <span className="text-[10px] text-white/50">@{profile.username}</span>
                    </div>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/55 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                >
                  <FiLogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
