import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import SupportUs from '../components/SupportUs.jsx'
import { LogoIcon } from '../components/Logo.jsx'
import {
  FiCode, FiBriefcase, FiZap, FiUsers, FiBook, FiFileText,
  FiArrowRight, FiCheckCircle,
} from 'react-icons/fi'

const FEATURES = [
  { icon: FiCode,      title: 'Projects',       desc: 'Work on real paid & unpaid projects. Build portfolio-worthy experience with actual companies.', color: '#34d399', badge: 'Paid & Unpaid'  },
  { icon: FiBriefcase, title: 'Internships',     desc: 'Discover internships at companies big and small. Kickstart your career while still in college.', color: '#4fd1ff', badge: 'Career Growth' },
  { icon: FiZap,       title: 'Opportunities',   desc: 'Competitions, research gigs, freelance work, and more — all updated daily.',                    color: '#a78bfa', badge: 'Always Fresh'  },
  { icon: FiUsers,     title: 'Clubs',           desc: 'Join student clubs with real-time Discord-style group chat. Build your tribe.',                  color: '#fb7185', badge: 'Live Chat'     },
  { icon: FiBook,      title: 'Studies',         desc: 'Borrow books and equipment from fellow students. Knowledge shared multiplies.',                  color: '#fbbf24', badge: 'Peer Sharing'  },
  { icon: FiFileText,  title: 'Applications',    desc: 'Track every application in one place. Cover letters, resumes, and status all in one dashboard.', color: '#fb923c', badge: 'Stay Organized'},
]

const STEPS = [
  { n: '01', title: 'Create your profile',  desc: 'Sign up in seconds. Add your skills, interests, and what you are looking for.',            color: '#4fd1ff' },
  { n: '02', title: 'Explore everything',   desc: 'Browse projects, internships, opportunities, and clubs tailored for students.',             color: '#a78bfa' },
  { n: '03', title: 'Apply & connect',      desc: 'Submit applications with resume and cover letter. Join clubs with live chat instantly.',     color: '#34d399' },
  { n: '04', title: 'Grow together',        desc: 'Collaborate, chat in club channels, and build real experience that stands out.',            color: '#fbbf24' },
]

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' },
  transition:  { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

// ── Navbar ────────────────────────────────────────────────────────────────────
function LandingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#030912]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <LogoIcon size={34} />
          <span className="bg-gradient-to-r from-[#ffe08a] via-[#f5c842] to-[#c8860a] bg-clip-text text-lg font-black tracking-widest text-transparent">
            TEAMUP
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-white/65 transition-colors hover:text-white">
            Login
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4fd1ff] to-violet-500 px-4 py-2 text-sm font-bold text-[#030712] shadow-lg transition-all hover:brightness-110"
          >
            Get Started <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-100px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <LogoIcon size={110} />
        </motion.div>

        {/* Brand name */}
        <motion.p
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-r from-[#ffe08a] via-[#f5c842] to-[#c8860a] bg-clip-text text-6xl font-black tracking-widest text-transparent sm:text-7xl"
        >
          TEAMUP
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-2 bg-gradient-to-r from-amber-400 via-pink-400 to-violet-400 bg-clip-text text-xs font-bold uppercase tracking-[0.22em] text-transparent"
        >
          Ideas Unite · Future Ignite
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Build{' '}
          <span className="bg-gradient-to-r from-[#4fd1ff] via-violet-400 to-[#34d399] bg-clip-text text-transparent">
            Together,
          </span>
          <br />
          Grow Together.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.55 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60"
        >
          The all-in-one platform where students find projects, internships,
          clubs, and study resources — and actually collaborate.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4fd1ff] to-violet-500 px-8 py-4 text-base font-bold text-[#030712] shadow-2xl shadow-[#4fd1ff]/20 transition-all hover:brightness-110 hover:scale-[1.03]"
          >
            Create Free Account <FiArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="rounded-2xl border border-white/20 bg-white/[0.06] px-8 py-4 text-base font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/35"
        >
          {['100% Free', 'No Spam', 'Student-built', 'Privacy First'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <FiCheckCircle size={11} className="text-[#34d399]" /> {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">Scroll</p>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="h-6 w-px rounded-full bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section className="w-full px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-screen-xl">
        {/* Header */}
        <motion.div {...fadeUp()} className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4fd1ff]/25 bg-[#4fd1ff]/8 px-4 py-1.5">
            <FiZap size={11} style={{ color: '#4fd1ff' }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#4fd1ff]">Everything You Need</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
            One platform.{' '}
            <span className="bg-gradient-to-r from-[#4fd1ff] to-violet-400 bg-clip-text text-transparent">
              Endless possibilities.
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-white/55">
            Six powerful tools designed to help students collaborate, grow, and get hired.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(i * 0.07)}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-white/20"
              style={{ background: 'rgba(255,255,255,0.03)', boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}
            >
              <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${f.color}18`, border: `1px solid ${f.color}35` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: `${f.color}12`, color: f.color, border: `1px solid ${f.color}25` }}>
                  {f.badge}
                </span>
              </div>
              <h3 className="text-lg font-black text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.desc}</p>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold" style={{ color: f.color }}>
                Explore {f.title}
                <FiArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section className="w-full px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-screen-xl">
        {/* Header */}
        <motion.div {...fadeUp()} className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/8 px-4 py-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-400">How It Works</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
            From zero to{' '}
            <span className="bg-gradient-to-r from-violet-400 to-[#34d399] bg-clip-text text-transparent">
              connected
            </span>{' '}
            in minutes.
          </h2>
        </motion.div>

        {/* Steps — 4-column grid on desktop */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              {...fadeUp(i * 0.1)}
              className="flex flex-col items-center text-center"
            >
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-[#030912] shadow-xl"
                style={{ background: step.color, boxShadow: `0 6px 24px ${step.color}50` }}
              >
                {step.n}
              </div>
              <h3 className="text-base font-black text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="flex w-full justify-center px-6 py-20 sm:px-10">
      <motion.div
        {...fadeUp()}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/[0.1] p-12 text-center sm:p-20"
        style={{ background: 'linear-gradient(135deg, rgba(79,209,255,0.07), rgba(167,139,250,0.07), rgba(52,211,153,0.07))' }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,200,66,0.08), transparent 60%)' }} />

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="mx-auto mb-7 w-fit"
        >
          <LogoIcon size={80} />
        </motion.div>

        <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
          Ready to{' '}
          <span className="bg-gradient-to-r from-[#f5c842] to-[#ffe08a] bg-clip-text text-transparent">get started?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-white/55">
          Create your free account in seconds. No credit card required. No spam. Just opportunities.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/register"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4fd1ff] to-violet-500 px-9 py-4 text-base font-bold text-[#030712] shadow-2xl shadow-[#4fd1ff]/20 transition-all hover:brightness-110 hover:scale-[1.02] sm:w-auto"
          >
            Create Free Account <FiArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/[0.05] px-9 py-4 text-base font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white sm:w-auto"
          >
            Already have an account?
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuth, loading } = useAuth()
  if (!loading && isAuth) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#030912] text-white">
      {/* Fixed bg glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-violet-700/10 blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-600/6 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <LandingNav />
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <CTASection />
        <SupportUs />

        <footer className="border-t border-white/[0.06] py-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <LogoIcon size={30} />
            <span className="bg-gradient-to-r from-[#ffe08a] via-[#f5c842] to-[#c8860a] bg-clip-text text-base font-black tracking-widest text-transparent">
              TEAMUP
            </span>
          </div>
          <p className="text-xs text-white/25">© 2026 TeamUp · Ideas Unite · Future Ignite · Built by students</p>
        </footer>
      </div>
    </div>
  )
}
