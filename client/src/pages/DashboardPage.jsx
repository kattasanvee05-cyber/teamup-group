import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { opportunitiesApi } from '../api/opportunities.js'
import { internshipsApi } from '../api/internships.js'
import { teamsApi } from '../api/teams.js'
import { applicationsApi } from '../api/applications.js'
import {
  FiZap, FiBriefcase, FiUsers, FiFileText,
  FiArrowRight, FiBook, FiHelpCircle, FiChevronDown, FiTool,
} from 'react-icons/fi'

const CARDS = [
  {
    key: 'opportunities', label: 'Opportunities', sub: 'Open roles & projects',
    icon: FiZap, to: '/opportunities',
    accent: '#a78bfa',
    border: 'border-violet-400/40',
    bg: 'from-violet-600/20 to-violet-900/10',
    num: 'text-violet-300',
    icon_bg: 'bg-violet-500/20 text-violet-300',
    glow: 'shadow-violet-500/20',
  },
  {
    key: 'internships', label: 'Internships', sub: 'Industry placements',
    icon: FiBriefcase, to: '/internships',
    accent: '#4fd1ff',
    border: 'border-cyan-400/40',
    bg: 'from-cyan-600/20 to-cyan-900/10',
    num: 'text-cyan-300',
    icon_bg: 'bg-cyan-500/20 text-cyan-300',
    glow: 'shadow-cyan-500/20',
  },
  {
    key: 'teams', label: 'Teams', sub: 'Collaborate & build',
    icon: FiUsers, to: '/teams',
    accent: '#34d399',
    border: 'border-emerald-400/40',
    bg: 'from-emerald-600/20 to-emerald-900/10',
    num: 'text-emerald-300',
    icon_bg: 'bg-emerald-500/20 text-emerald-300',
    glow: 'shadow-emerald-500/20',
  },
  {
    key: 'applications', label: 'Applications', sub: 'My submissions',
    icon: FiFileText, to: '/applications',
    accent: '#fbbf24',
    border: 'border-amber-400/40',
    bg: 'from-amber-600/20 to-amber-900/10',
    num: 'text-amber-300',
    icon_bg: 'bg-amber-500/20 text-amber-300',
    glow: 'shadow-amber-500/20',
  },
]

const QUICK = [
  { to: '/opportunities', label: 'Browse Opportunities',    icon: FiZap,       cls: 'border-violet-400/50 bg-violet-500/10 text-white hover:bg-violet-500/20 hover:border-violet-400/80' },
  { to: '/internships',   label: 'Find Internships',        icon: FiBriefcase, cls: 'border-cyan-400/50 bg-cyan-500/10 text-white hover:bg-cyan-500/20 hover:border-cyan-400/80' },
  { to: '/teams',         label: 'Create / Join a Team',    icon: FiUsers,     cls: 'border-emerald-400/50 bg-emerald-500/10 text-white hover:bg-emerald-500/20 hover:border-emerald-400/80' },
  { to: '/studies',       label: 'Borrow Books & Drafters', icon: FiBook,      cls: 'border-pink-400/50 bg-pink-500/10 text-white hover:bg-pink-500/20 hover:border-pink-400/80' },
]

const FAQ = [
  { q: 'How do I apply to an opportunity or internship?',
    a: 'Open any listing from Opportunities or Internships, then click "Apply Now". A form will expand where you can add a cover letter and resume URL before submitting.' },
  { q: 'How do I create or join a team?',
    a: 'Go to Teams → "New Team" to create one, or browse existing teams and click "View Team" then "Join Team" from the detail page.' },
  { q: 'How do I borrow a book or drafter?',
    a: 'Visit the Studies page and choose the Books or Drafters & Equipment tab. Find the item and click Borrow. Books are due in 14 days, equipment in 7 days.' },
  { q: 'Where can I track my applications?',
    a: 'The Applications page shows everything you\'ve applied to with real-time status: Pending → Reviewing → Accepted or Rejected.' },
  { q: 'Can I return a borrowed item early?',
    a: 'Yes — go to Studies → My Borrows and click "Return" on any active borrow. The copy goes back to the library inventory immediately.' },
]

function count(data, key) {
  if (!data) return 0
  if (Array.isArray(data)) return data.length
  return data[key]?.length ?? data.total ?? 0
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 ${open ? 'border-[#4fd1ff]/30 bg-[#04080f]/95' : 'border-white/20 bg-[#04080f]/90'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <FiChevronDown
          size={16}
          className={`mt-0.5 shrink-0 text-[#4fd1ff] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-7 text-white">{a}</div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      opportunitiesApi.list(),
      internshipsApi.list(),
      teamsApi.list(),
      applicationsApi.mine(),
    ]).then(([opps, ints, teams, apps]) => {
      setStats({
        opportunities: count(opps.value, 'opportunities'),
        internships:   count(ints.value, 'internships'),
        teams:         count(teams.value, 'teams'),
        applications:  count(apps.value, 'applications'),
      })
    }).finally(() => setLoading(false))
  }, [])

  const name = profile?.full_name ?? profile?.username ?? 'User'

  return (
    <div className="min-h-screen w-full px-6 pb-20 lg:px-16 xl:px-24" style={{ paddingTop: 'calc(4.5rem + 3rem)' }}>

      {/* ── Hero ── */}
      <motion.div
        {...fade(0.05)}
        className="mb-10 rounded-2xl border border-white/[0.12] bg-[#04080f]/90 p-8 backdrop-blur-sm"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#4fd1ff]/30 bg-[#4fd1ff]/10 px-4 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#4fd1ff]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#4fd1ff]">TEAMUP Dashboard</span>
        </div>

        <h1 className="flex flex-wrap items-baseline gap-x-5 font-black leading-[1.05] tracking-tight"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)' }}>
          <span className="text-white">Welcome back,</span>
          <span style={{
            background: 'linear-gradient(90deg,#ff6b6b,#ffa94d,#ffd43b,#69db7c,#4fd1ff,#748ffc,#da77f2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            paddingBottom: '0.1em',
          }}>
            {name}
          </span>
        </h1>

        <p className="mt-4 text-lg font-semibold text-white sm:text-xl" style={{ maxWidth: '62ch', lineHeight: 1.75 }}>
          Explore opportunities, collaborate with teams, borrow study materials, and track every application — all in one place.
        </p>
      </motion.div>

      {/* ── content ── */}
      <div>

      {/* ── Stat cards ── */}
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map(({ key, label, sub, icon: Icon, to, num, border, bg, icon_bg, glow, accent }, i) => (
          <motion.div key={key} {...fade(0.1 + i * 0.07)}>
            <Link
              to={to}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border ${border} bg-gradient-to-br ${bg} bg-[#04080f]/90 px-4 py-3 backdrop-blur-sm shadow-md ${glow} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              {/* Icon */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${icon_bg}`}>
                <Icon size={17} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white leading-tight">{label}</p>
                <p className="text-[11px] text-white leading-tight mt-0.5">{sub}</p>
              </div>

              {/* Count */}
              <div className="shrink-0 text-right">
                {loading
                  ? <div className="h-6 w-7 animate-pulse rounded bg-white/10" />
                  : <p className={`text-2xl font-black tabular-nums leading-none ${num}`}>{stats?.[key] ?? 0}</p>
                }
                <FiArrowRight size={12} className="ml-auto mt-1 text-white opacity-40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>

              {/* Bottom glow line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <motion.div {...fade(0.38)} className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK.map(({ to, label, icon: Icon, cls }) => (
            <Link
              key={to}
              to={to}
              className={`group flex items-center justify-between gap-3 rounded-xl border-2 px-5 py-4 text-sm font-semibold backdrop-blur-sm transition-all duration-200 ${cls}`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} />
                {label}
              </span>
              <FiArrowRight size={14} className="opacity-50 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Studies + Help ── */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* Studies */}
        <motion.div {...fade(0.45)}>
          <h2 className="mb-4 text-lg font-bold text-white">Studies & Library</h2>
          <div className="space-y-3">
            {[
              {
                to: '/studies',
                label: 'Library Books',
                sub: '10 textbooks available — Engineering, CS, Civil and more',
                icon: FiBook,
                cls: 'border-cyan-400/40 bg-cyan-950/60 hover:bg-cyan-900/60 hover:border-cyan-400/70',
                icon_bg: 'bg-cyan-500/20 text-cyan-300',
              },
              {
                to: '/studies',
                label: 'Drafters & Instruments',
                sub: 'Mini drafters, set squares, compass sets, scale rulers and more',
                icon: FiTool,
                cls: 'border-violet-400/40 bg-violet-950/60 hover:bg-violet-900/60 hover:border-violet-400/70',
                icon_bg: 'bg-violet-500/20 text-violet-300',
              },
            ].map(({ to, label, sub, icon: Icon, cls, icon_bg }) => (
              <Link key={label} to={to}
                className={`group flex items-center gap-4 rounded-xl border-2 px-5 py-4 backdrop-blur-sm transition-all duration-200 ${cls}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${icon_bg}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="mt-0.5 text-xs text-white">{sub}</p>
                </div>
                <FiArrowRight size={14} className="shrink-0 text-white transition-all duration-200 group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            ))}

            <div className="rounded-xl border-2 border-amber-400/40 bg-amber-950/60 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-amber-300">Library Hours</p>
              <p className="mt-1 text-sm text-white">Mon – Sat &nbsp;·&nbsp; 10:00 AM – 5:00 PM</p>
              <p className="text-xs text-white mt-0.5">Sunday — Closed</p>
            </div>
          </div>
        </motion.div>

        {/* Help / FAQ */}
        <motion.div {...fade(0.5)}>
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-white">
            <FiHelpCircle size={18} className="text-[#4fd1ff]" />
            Help & FAQ
          </h2>
          <div className="space-y-2.5">
            {FAQ.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </motion.div>

      </div>

      {/* ── About Us & Support ── */}
      <motion.div {...fade(0.55)} className="mt-12 grid gap-5 sm:grid-cols-2">

        {/* About Us */}
        <div className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-violet-400">About Us</h2>
          <p className="text-sm leading-7 text-white">
            TEAMUP is a college collaboration platform built to connect students with opportunities, teams, resources, and each other. From borrowing study materials to landing internships — we make campus life smarter and more connected.
          </p>
          <p className="mt-3 text-xs text-white">Built with ♥ for students, by students.</p>
        </div>

        {/* Support */}
        <div className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[#4fd1ff]">Support</h2>
          <p className="text-sm leading-7 text-white">
            Having trouble or want to report an issue? Our support team is here to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:noreply.teamup.com@gmail.com"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#4fd1ff]/20 bg-[#4fd1ff]/5 px-4 py-2.5 text-sm font-medium text-[#4fd1ff] transition-all duration-200 hover:bg-[#4fd1ff]/15"
          >
            noreply.teamup.com@gmail.com
          </a>
        </div>

      </motion.div>

      </div>{/* end content */}
    </div>
  )
}
