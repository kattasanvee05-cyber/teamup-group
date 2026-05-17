import { useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import { FiGrid, FiBriefcase, FiUsers, FiFileText, FiLogOut, FiZap, FiBook } from 'react-icons/fi'
import { LogoIcon } from './Logo.jsx'
import NotificationBell from './NotificationBell.jsx'

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
  { icon: '🏆', text: 'Consistency beats talent when talent doesn\'t show up.' },
  { icon: '🌙', text: 'Late nights build early successes. Keep going!' },
]

const NAV_LINKS = [
  { to: '/',              label: 'Dashboard',     icon: FiGrid },
  { to: '/opportunities', label: 'Opportunities', icon: FiZap },
  { to: '/internships',   label: 'Internships',   icon: FiBriefcase },
  { to: '/teams',         label: 'Teams',         icon: FiUsers },
  { to: '/studies',       label: 'Studies',       icon: FiBook },
  { to: '/applications',  label: 'My Apps',       icon: FiFileText },
]

export default function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const quoteIdx = useRef(Math.floor(Math.random() * QUOTES.length))

  // Zomato-style quote notifications every 8 minutes
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
    }, 8 * 60 * 1000) // every 8 minutes
    return () => clearInterval(id)
  }, [profile])

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-[60] border-b border-white/[0.1] bg-[#04080f]/92 backdrop-blur-2xl" style={{ boxShadow: '0 2px 12px rgba(4,8,15,0.6)' }}>
      <div className="mx-auto flex h-[4.5rem] max-w-screen-2xl items-center justify-between px-5 sm:px-8">

        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <LogoIcon size={38} />
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="bg-gradient-to-r from-[#4fd1ff] via-violet-300 to-purple-400 bg-clip-text text-lg font-black tracking-[0.12em] text-transparent pb-px">
              TEAMUP
            </span>
            <span className="hidden bg-gradient-to-r from-amber-400 via-pink-400 to-violet-400 bg-clip-text text-[11px] font-bold tracking-[0.14em] text-transparent uppercase pb-px sm:block">
              Ideas Unite · Future Ignite
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center rounded-xl border border-white/[0.18] bg-white/[0.04] p-1.5 md:flex">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-[#4fd1ff]/15 text-[#4fd1ff]'
                    : 'text-white hover:bg-white/5 hover:text-white'}`}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right: user + logout */}
        <div className="flex items-center gap-3">
          {profile && <NotificationBell />}
          {profile?.username && (
            <Link to="/profile" className="hidden items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.06] sm:flex">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4fd1ff]/40 to-violet-500/40 text-sm font-black text-[#4fd1ff] ring-2 ring-[#4fd1ff]/20">
                {(profile.full_name ?? profile.username)[0].toUpperCase()}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold text-white">{profile.full_name ?? profile.username}</span>
                <span className="text-[10px] text-white">@{profile.username}</span>
              </div>
            </Link>
          )}
          <div className="h-5 w-px bg-white/10" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          >
            <FiLogOut size={14} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>

      </div>
    </nav>
  )
}
