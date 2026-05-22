import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { internshipsApi } from '../api/internships.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiBriefcase, FiMapPin, FiBookmark, FiSearch, FiClock, FiArrowRight } from 'react-icons/fi'
import SupportUs from '../components/SupportUs.jsx'

const MODE_META = {
  'remote':  { color: '#4ade80', bg: 'rgba(74,222,128,0.18)',  border: 'rgba(74,222,128,0.45)'  },
  'hybrid':  { color: '#38bdf8', bg: 'rgba(56,189,248,0.18)',  border: 'rgba(56,189,248,0.45)'  },
  'on-site': { color: '#c084fc', bg: 'rgba(192,132,252,0.18)', border: 'rgba(192,132,252,0.45)' },
}
const MODE_FALLBACK = { color: '#38bdf8', bg: 'rgba(56,189,248,0.18)', border: 'rgba(56,189,248,0.45)' }

const CARD_TOPS = ['#38bdf8', '#c084fc', '#4ade80', '#fb923c', '#fb7185', '#fbbf24']

export default function InternshipsPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(null)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    internshipsApi.list()
      .then(d => setItems(d.internships ?? d))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(i =>
    !search ||
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  function doBookmark(id) {
    setBusy(`bm-${id}`)
    internshipsApi.bookmark(id)
      .then(() => toast.success('Bookmarked!'))
      .catch(e => toast.error(e.message))
      .finally(() => setBusy(null))
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 sm:px-10" style={{ paddingTop: 'calc(4.5rem + 3.5rem)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-12">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ background: 'rgba(56,189,248,0.18)', border: '1px solid rgba(56,189,248,0.45)' }}
        >
          <FiBriefcase size={12} color="#38bdf8" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: '#38bdf8' }}>Internships</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">Find Internships</h1>
        <p className="mt-4 max-w-xl text-lg text-white/75">
          Build real-world experience with top companies and startups.
        </p>
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="relative max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or company…"
            className="w-full rounded-2xl py-3.5 pl-11 pr-5 text-sm text-white placeholder:text-white/45 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
          />
        </div>
      </div>

      {/* ── Cards ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/55">
          <FiBriefcase size={44} />
          <p className="text-sm">{search ? 'No results found' : 'No internships posted yet'}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => {
            const modeMeta  = MODE_META[item.mode] ?? MODE_FALLBACK
            const topColor  = CARD_TOPS[i % CARD_TOPS.length]
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -5, transition: { duration: 0.18 } }}
                className="flex flex-col rounded-2xl p-6"
                style={{
                  background: '#1a2744',
                  border: `1px solid ${topColor}88`,
                  borderTop: `3px solid ${topColor}`,
                  boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
                }}
              >
                {/* Badges */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {item.actively_hiring && (
                    <span className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{ background: 'rgba(74,222,128,0.18)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.45)' }}>
                      ● Actively Hiring
                    </span>
                  )}
                  {item.ppo_available && (
                    <span className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{ background: 'rgba(251,146,60,0.18)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.45)' }}>
                      PPO Offered
                    </span>
                  )}
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold capitalize"
                    style={{ background: modeMeta.bg, color: modeMeta.color, border: `1px solid ${modeMeta.border}` }}
                  >
                    {item.mode ?? 'Internship'}
                  </span>
                </div>

                {/* Title + Company */}
                <h2 className="text-lg font-black leading-snug text-white">{item.title}</h2>
                <p className="mt-1.5 text-sm font-bold" style={{ color: topColor }}>{item.company_name}</p>
                {item.department && (
                  <p className="mt-0.5 text-xs text-white/55">{item.department}</p>
                )}

                {/* Description */}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/72 line-clamp-3">{item.description}</p>

                {/* Skills */}
                {item.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.skills.slice(0, 3).map(s => (
                      <span key={s} className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.18)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/60">
                  {item.location       && <span className="flex items-center gap-1.5"><FiMapPin size={11} />{item.location}</span>}
                  {item.duration_months && <span className="flex items-center gap-1.5"><FiClock size={11} />{item.duration_months} months</span>}
                  {item.stipend_monthly && (
                    <span className="font-bold text-emerald-400">₹{item.stipend_monthly.toLocaleString()}/mo</span>
                  )}
                </div>

                {/* CTAs */}
                <div className="mt-5 flex gap-2.5">
                  <Link
                    to={`/internships/${item.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 hover:brightness-125"
                    style={{ background: `${topColor}22`, color: topColor, border: `1px solid ${topColor}55` }}
                  >
                    View Details <FiArrowRight size={13} />
                  </Link>
                  <button
                    onClick={() => doBookmark(item.id)}
                    disabled={busy === `bm-${item.id}`}
                    className="flex items-center justify-center rounded-xl px-4 py-3 text-white/65 transition-all duration-200 hover:text-white disabled:opacity-50"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    {busy === `bm-${item.id}` ? <Spinner size="sm" /> : <FiBookmark size={15} />}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
      <SupportUs />
    </div>
  )
}
