import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, animate as amt,
} from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { opportunitiesApi } from '../api/opportunities.js'
import { internshipsApi } from '../api/internships.js'
import { clubsApi } from '../api/clubs.js'
import { applicationsApi } from '../api/applications.js'
import {
  FiZap, FiBriefcase, FiUsers, FiFileText,
  FiArrowRight, FiBook, FiTool, FiClock,
  FiMail, FiChevronDown, FiTrendingUp,
  FiArrowUpRight, FiCode,
} from 'react-icons/fi'
import SupportUs from '../components/SupportUs.jsx'

/* ─────────────── data ─────────────── */
const STAT_CARDS = [
  {
    key: 'opportunities', label: 'Opportunities', sub: 'Open roles & projects',
    icon: FiZap, to: '/opportunities',
    color: '#a78bfa', border: 'rgba(167,139,250,0.22)',
    glow: 'rgba(250, 148, 139, 0.12)', iconBg: 'rgba(167,139,250,0.14)',
  },
  {
    key: 'internships', label: 'Internships', sub: 'Industry placements',
    icon: FiBriefcase, to: '/internships',
    color: '#4fd1ff', border: 'rgba(79,209,255,0.22)',
    glow: 'rgba(79,209,255,0.12)', iconBg: 'rgba(79,209,255,0.14)',
  },
  {
    key: 'clubs', label: 'Clubs', sub: 'Communities & chat',
    icon: FiUsers, to: '/clubs',
    color: '#34d399', border: 'rgba(52,211,153,0.22)',
    glow: 'rgba(52,211,153,0.12)', iconBg: 'rgba(52,211,153,0.14)',
  },
  {
    key: 'applications', label: 'Applications', sub: 'My submissions',
    icon: FiFileText, to: '/applications',
    color: '#fbbf24', border: 'rgba(251,191,36,0.22)',
    glow: 'rgba(251,191,36,0.12)', iconBg: 'rgba(251,191,36,0.14)',
  },
]

const QUICK_ACTIONS = [
  { to: '/opportunities', label: 'Browse Opportunities', desc: 'Roles & projects', icon: FiZap,       color: '#a78bfa', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.24)',  hover: 'rgba(139,92,246,0.14)'  },
  { to: '/internships',   label: 'Find Internships',     desc: 'Industry roles',   icon: FiBriefcase,  color: '#4fd1ff', bg: 'rgba(79,209,255,0.08)',  border: 'rgba(79,209,255,0.24)',  hover: 'rgba(79,209,255,0.14)'  },
  { to: '/clubs',          label: 'Join a Club',           desc: 'Community & chat', icon: FiUsers,      color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.24)',  hover: 'rgba(52,211,153,0.14)'  },
  { to: '/studies',       label: 'Borrow Resources',     desc: 'Books & drafters', icon: FiBook,       color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.24)', hover: 'rgba(244,114,182,0.14)' },
]

const STUDY_ITEMS = [
  {
    icon: FiBook, to: '/studies',
    title: 'Library Books',
    description: '10 textbooks across Engineering, CS, Civil, Physics and more.',
    cta: 'Browse Books',
    color: '#4fd1ff', iconBg: 'rgba(79,209,255,0.14)',
    border: 'rgba(79,209,255,0.18)', ctaBg: 'rgba(79,209,255,0.10)',
    ctaHover: 'rgba(79,209,255,0.18)',
  },
  {
    icon: FiTool, to: '/studies',
    title: 'Drafters & Instruments',
    description: 'Mini drafters, set squares, compass sets, scale rulers.',
    cta: 'Browse Equipment',
    color: '#a78bfa', iconBg: 'rgba(167,139,250,0.14)',
    border: 'rgba(167,139,250,0.18)', ctaBg: 'rgba(167,139,250,0.10)',
    ctaHover: 'rgba(167,139,250,0.18)',
  },
  {
    icon: FiClock, to: null,
    title: 'Library Hours',
    lines: ['Mon – Sat  ·  10:00 AM – 5:00 PM', 'Sunday — Closed'],
    color: '#fbbf24', iconBg: 'rgba(251,191,36,0.14)',
    border: 'rgba(251,191,36,0.18)',
  },
]

const FAQ_ITEMS = [
  { q: 'How do I apply to an opportunity or internship?',
    a: 'Open any listing from Opportunities or Internships, then click "Apply Now". Fill in your cover letter and resume URL in the form that appears.' },
  { q: 'How do I join a club?',
    a: 'Go to Clubs, browse the list, and click "Join" on any club. Once joined you get access to the club chat with channels like general, hackathon, and announcements.' },
  { q: 'How do I borrow a book or drafter?',
    a: 'Visit the Studies page, pick the Books or Drafters tab, find your item and click Borrow. Books are due in 14 days; equipment in 7 days.' },
  { q: 'Where can I track my applications?',
    a: "The Applications page tracks everything you've submitted with live status updates: Pending → Reviewing → Accepted or Rejected." },
  { q: 'Can I return a borrowed item early?',
    a: 'Yes — open Studies → My Borrows and click Return on any active borrow. Inventory updates immediately.' },
]

/* ─────────────── animation variants ─────────────── */
const stagger = {
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.0 } },
}
const fadeUp = {
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

/* ─────────────── helpers ─────────────── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ─────────────── animated counter ─────────────── */
function Counter({ to }) {
  const count   = useMotionValue(0)
  const display = useTransform(count, v => Math.round(v))
  useEffect(() => {
    const ctrl = amt(count, to, { duration: 1.1, ease: 'easeOut' })
    return ctrl.stop
  }, [to])
  return <motion.span>{display}</motion.span>
}

/* ─────────────── stat card ─────────────── */
function StatCard({ card, stat, loading }) {
  const { label, sub, icon: Icon, to, color, border, glow, iconBg } = card
  return (
    <Link to={to}>
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
        className="relative flex flex-col gap-8 overflow-hidden rounded-2xl p-9 backdrop-blur-sm cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.016) 100%)',
          border: `1px solid ${border}`,
          boxShadow: `0 2px 20px ${glow}, 0 1px 1px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)`,
          transition: 'box-shadow 0.25s, border-color 0.25s',
        }}
      >
        {/* Icon + trend */}
        <div className="flex items-start justify-between">
          <div className="flex h-13 w-13 items-center justify-center rounded-xl" style={{ background: iconBg }}>
            <Icon size={22} style={{ color }} />
          </div>
          <FiTrendingUp size={14} className="mt-0.5 text-white/20 transition-colors" />
        </div>

        {/* Stat number */}
        <div>
          {loading ? (
            <div className="skeleton mb-3 h-10 w-20" />
          ) : (
            <p className="text-5xl font-black tabular-nums leading-[1.1]" style={{ color }}>
              <Counter to={stat ?? 0} />
            </p>
          )}
          <p className="mt-4 text-base font-bold text-white">{label}</p>
          <p className="mt-1.5 text-sm text-white/50">{sub}</p>
        </div>

        {/* Arrow */}
        <FiArrowRight
          size={14}
          className="absolute bottom-6 right-6"
          style={{ color: `${color}99` }}
        />

        {/* Bottom line */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }}
        />
      </motion.div>
    </Link>
  )
}

/* ─────────────── quick action card ─────────────── */
function QuickCard({ item }) {
  const { to, label, desc, icon: Icon, color, bg, border, hover } = item
  return (
    <Link to={to}>
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.18 } }}
        className="group flex items-center gap-6 rounded-2xl px-7 py-6 backdrop-blur-sm cursor-pointer transition-all duration-200"
        style={{ background: bg, border: `1.5px solid ${border}` }}
        onMouseEnter={e => { e.currentTarget.style.background = hover }}
        onMouseLeave={e => { e.currentTarget.style.background = bg }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${color}22` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-white">{label}</p>
          <p className="mt-0.5 text-sm text-white/50">{desc}</p>
        </div>
        <FiArrowRight size={15}
          className="shrink-0 text-white/25 transition-all duration-200 group-hover:translate-x-1"
          style={{ color: `${color}99` }}
        />
      </motion.div>
    </Link>
  )
}

/* ─────────────── study card ─────────────── */
function StudyCard({ item }) {
  const { icon: Icon, to, title, description, lines, cta, color, iconBg, border, ctaBg, ctaHover } = item
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="flex flex-col gap-6 rounded-2xl p-9 backdrop-blur-sm"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.012) 100%)',
        border: `1px solid ${border}`,
        boxShadow: `0 2px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.055)`,
      }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: iconBg }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-base font-bold text-white">{title}</p>
        {description && (
          <p className="mt-2.5 text-sm leading-relaxed text-white/60">{description}</p>
        )}
        {lines && (
          <div className="mt-2.5 space-y-1">
            {lines.map((l, i) => (
              <p key={i} className={`text-sm ${i === 0 ? 'text-white/75' : 'text-white/45'}`}>{l}</p>
            ))}
          </div>
        )}
      </div>
      {cta && to && (
        <Link
          to={to}
          className="inline-flex items-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200"
          style={{ background: ctaBg, color }}
          onMouseEnter={e => { e.currentTarget.style.background = ctaHover }}
          onMouseLeave={e => { e.currentTarget.style.background = ctaBg }}
        >
          {cta} <FiArrowRight size={13} />
        </Link>
      )}
    </motion.div>
  )
}

/* ─────────────── FAQ item ─────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        background: '#1a2e4a',
        border: `2px solid ${open ? '#4fd1ff' : 'rgba(79,209,255,0.5)'}`,
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', width: '100%', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
          padding: '20px 24px', textAlign: 'left',
          background: 'transparent', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', lineHeight: 1.5 }}>{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ flexShrink: 0 }}
        >
          <FiChevronDown size={18} style={{ color: open ? '#4fd1ff' : '#94a3b8' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p style={{ padding: '0 24px 20px', fontSize: '14px', lineHeight: 1.8, color: '#cbd5e1' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────── page ─────────────── */
export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      opportunitiesApi.list(),
      internshipsApi.list(),
      clubsApi.list(),
      applicationsApi.mine(),
    ]).then(([opps, ints, clubs, apps]) => {
      function c(d, k) {
        if (!d) return 0
        if (Array.isArray(d)) return d.length
        return d[k]?.length ?? d.total ?? 0
      }
      setStats({
        opportunities: c(opps.value, 'opportunities'),
        internships:   c(ints.value, 'internships'),
        clubs:         c(clubs.value, 'clubs'),
        applications:  c(apps.value, 'applications'),
      })
    }).finally(() => setLoading(false))
  }, [])

  const name     = profile?.full_name ?? profile?.username ?? 'User'
  const greeting = getGreeting()

  return (
    <div
      className="w-full px-5 pb-72 sm:px-8 lg:px-14 xl:px-20 2xl:px-28"
      style={{ paddingTop: 'calc(4.5rem + 5rem)' }}
    >
      <div className="mx-auto max-w-screen-xl">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl p-14 sm:p-20"
          style={{
            marginBottom: '10rem',
            background: '#0f1a30',
            border: '1px solid rgba(79,209,255,0.2)',
            boxShadow: '0 2px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Hero glows */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 0%, rgba(79,209,255,0.07) 0%, transparent 65%)' }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{ background: 'radial-gradient(ellipse 50% 50% at 85% 100%, rgba(167,139,250,0.06) 0%, transparent 65%)' }}
          />

          <div className="relative">
            {/* Badge */}
            <div
              className="mb-8 inline-flex items-center gap-2.5 rounded-full px-5 py-2"
              style={{ border: '1px solid rgba(79,209,255,0.28)', background: 'rgba(79,209,255,0.08)' }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4fd1ff]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4fd1ff]">
                TEAMUP Platform
              </span>
            </div>

            {/* Greeting */}
            <h1
              className="font-black leading-[1.12] tracking-tight"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 5.6rem)' }}
            >
              <span className="text-white">{greeting}, </span>
              <span style={{
                background: 'linear-gradient(100deg,#ff6b6b 0%,#ffa94d 20%,#ffd43b 35%,#69db7c 50%,#4fd1ff 65%,#748ffc 80%,#da77f2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
                paddingBottom: '0.1em',
              }}>
                {name}.
              </span>
            </h1>

            <p
              className="mt-8 text-lg text-white/65 sm:text-xl"
              style={{ maxWidth: '58ch', lineHeight: 1.85 }}
            >
              Explore opportunities, collaborate with teams, borrow study materials,
              and track every application — all from one place.
            </p>

            {/* CTA row */}
            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-[#060a14] transition-all duration-200 hover:brightness-110"
                style={{ background: 'linear-gradient(135deg,#4fd1ff,#818cf8)' }}
              >
                Browse Opportunities <FiArrowUpRight size={15} />
              </Link>
              <Link
                to="/clubs"
                className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                Join a Club
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <motion.section
          variants={stagger}
          animate="show"
          style={{ marginBottom: '10rem' }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '2.5rem' }}>Platform Overview</p>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STAT_CARDS.map(card => (
              <StatCard
                key={card.key}
                card={card}
                stat={stats?.[card.key]}
                loading={loading}
              />
            ))}
          </div>
        </motion.section>

        {/* ── Quick Actions ───────────────────────────────────────── */}
        <section style={{ marginBottom: '10rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '2.5rem' }}>Quick Actions</p>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
          >
            {QUICK_ACTIONS.map(item => <QuickCard key={item.to} item={item} />)}
          </motion.div>
        </section>

        {/* ── FAQ + Studies split ─────────────────────────────────── */}
        <div className="grid gap-16 xl:grid-cols-[1fr_420px]" style={{ marginBottom: '10rem' }}>

          {/* FAQ */}
          <section>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4fd1ff', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', height: '16px', width: '16px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(79,209,255,0.25)' }}>
                <span style={{ fontSize: '8px', color: '#4fd1ff' }}>?</span>
              </span>
              Frequently Asked
            </p>
            <div className="space-y-5">
              {FAQ_ITEMS.map((item, i) => <FaqItem key={i} {...item} />)}
            </div>
          </section>

          {/* Studies sidebar */}
          <section>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '2.5rem' }}>Studies & Library</p>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {STUDY_ITEMS.map((item, i) => <StudyCard key={i} item={item} />)}
            </motion.div>
          </section>

        </div>

        {/* ── Divider ────────────────────────────────────────────── */}
        <div className="divider" style={{ marginBottom: '8rem' }} />

        {/* ── About Us ────────────────────────────────────────────── */}
        <section style={{ marginBottom: '0' }}>
          <div
            className="relative overflow-hidden rounded-3xl p-12 sm:p-20"
            style={{
              background: '#0f1a30',
              border: '1px solid rgba(167,139,250,0.35)',
              boxShadow: '0 2px 32px rgba(0,0,0,0.32)',
            }}
          >
            {/* Glow orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 65%)' }} />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(79,209,255,0.07) 0%, transparent 65%)' }} />

            <div className="relative">
              <p className="section-label mb-7" style={{ color: '#a78bfa' }}>About Us</p>
              <h2 className="mb-8 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Built for students,<br />
                <span style={{
                  background: 'linear-gradient(120deg,#a78bfa 0%,#818cf8 50%,#4fd1ff 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  display: 'inline-block', paddingBottom: '0.08em',
                }}>by students.</span>
              </h2>

              <p className="mb-6 max-w-3xl text-base leading-9 text-white/85">
                TEAMUP is a college collaboration platform built to close the gap between students and
                real-world opportunities. Whether you're hunting for your first internship, forming a
                project team, or borrowing a textbook before the exam — everything lives in one place.
              </p>
              <p className="mb-14 max-w-3xl text-base leading-9 text-white/75">
                We believe the best campus experiences happen when students connect, collaborate, and
                support each other. TEAMUP is the infrastructure for that — simple, fast, and built
                with the kind of care that only comes from people who've been in those seats.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                {[
                  { icon: FiZap,       label: 'Opportunities', desc: 'Roles & projects',   color: '#a78bfa', bg: 'rgba(167,139,250,0.18)', border: 'rgba(167,139,250,0.45)' },
                  { icon: FiBriefcase, label: 'Internships',   desc: 'Industry placements', color: '#4fd1ff', bg: 'rgba(79,209,255,0.18)',  border: 'rgba(79,209,255,0.45)'  },
                  { icon: FiUsers,     label: 'Clubs',         desc: 'Community & chat',    color: '#34d399', bg: 'rgba(52,211,153,0.18)',  border: 'rgba(52,211,153,0.45)'  },
                  { icon: FiBook,      label: 'Study Library', desc: 'Books & instruments', color: '#fbbf24', bg: 'rgba(251,191,36,0.18)',  border: 'rgba(251,191,36,0.45)'  },
                ].map(({ icon: Icon, label, desc, color, bg, border }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-4 rounded-2xl p-6"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}22` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="mt-1 text-xs text-white/50">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-sm text-white/40">Built with ♥ by students, for students · JNTUH University</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Divider ────────────────────────────────────────────── */}
        {/* ── Gap + divider + gap between About and Support ── */}
        <div style={{ height: '8rem' }} />
        <div className="divider" />
        <div style={{ height: '8rem' }} />

        {/* ── Support ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: '0' }}>
          <div
            className="relative overflow-hidden rounded-3xl p-12 sm:p-20"
            style={{
              background: '#0f1a30',
              border: '1px solid rgba(79,209,255,0.35)',
              boxShadow: '0 2px 32px rgba(0,0,0,0.32)',
            }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(79,209,255,0.1) 0%, transparent 65%)' }} />

            <div className="relative grid gap-14 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <p className="section-label mb-7 text-[#4fd1ff]">Support & Contact</p>
                <h2 className="mb-8 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  We're here to help.
                </h2>
                <p className="mb-6 max-w-2xl text-base leading-9 text-white/65">
                  Running into a bug, have a feature request, or just want to share feedback?
                  Our team reviews every message and typically responds within one business day.
                </p>
                <p className="max-w-2xl text-base leading-9 text-white/50">
                  For urgent issues — a borrowed item not updating, an application stuck in
                  pending, or a broken page — please include a brief description of the problem
                  and your username so we can resolve it quickly.
                </p>

                <div className="mt-12 flex flex-wrap gap-4">
                  <a
                    href="mailto:noreply.teamup.com@gmail.com"
                    className="inline-flex items-center gap-3 rounded-2xl px-7 py-4 text-sm font-semibold text-[#4fd1ff] transition-all duration-200"
                    style={{ border: '1px solid rgba(79,209,255,0.28)', background: 'rgba(79,209,255,0.08)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,209,255,0.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,209,255,0.08)' }}
                  >
                    <FiMail size={16} />
                    Send us an email
                  </a>
                  <span
                    className="inline-flex items-center gap-2.5 rounded-2xl px-6 py-4 text-sm text-white/40"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Usually responds within 24 hrs
                  </span>
                </div>
              </div>

              {/* Contact card */}
              <div
                className="shrink-0 rounded-2xl p-8 lg:w-72"
                style={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <p className="mb-6 text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Contact</p>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <FiMail size={15} className="mt-0.5 shrink-0 text-[#4fd1ff]" />
                    <div>
                      <p className="text-xs text-white/40">Email</p>
                      <p className="mt-1 break-all text-sm font-medium text-white/75">noreply.teamup.com@gmail.com</p>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="flex items-start gap-4">
                    <FiClock size={15} className="mt-0.5 shrink-0 text-amber-400" />
                    <div>
                      <p className="text-xs text-white/40">Response time</p>
                      <p className="mt-1 text-sm font-medium text-white/75">Within 1 business day</p>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="flex items-start gap-4">
                    <FiUsers size={15} className="mt-0.5 shrink-0 text-violet-400" />
                    <div>
                      <p className="text-xs text-white/40">Team</p>
                      <p className="mt-1 text-sm font-medium text-white/75">JNTUH University, Student Dev Team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div style={{ height: '8rem' }} />
        <div className="divider" />
        <p style={{ paddingTop: '3rem', paddingBottom: '8rem' }} className="text-center text-xs text-white/22">
          © {new Date().getFullYear()} TEAMUP · JNTUH University · Built with ♥ by students
        </p>

      </div>
      <SupportUs />
    </div>
  )
}
