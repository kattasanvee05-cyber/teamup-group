import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { opportunitiesApi } from '../api/opportunities.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiZap, FiMapPin, FiClock, FiSearch, FiDollarSign, FiArrowRight } from 'react-icons/fi'
import SupportUs from '../components/SupportUs.jsx'

const TYPE_META = {
  'full-time':  { label: 'Full-time',  color: '#c084fc', bg: 'rgba(192,132,252,0.18)', border: 'rgba(192,132,252,0.45)' },
  'part-time':  { label: 'Part-time',  color: '#38bdf8', bg: 'rgba(56,189,248,0.18)',  border: 'rgba(56,189,248,0.45)'  },
  'contract':   { label: 'Contract',   color: '#4ade80', bg: 'rgba(74,222,128,0.18)',  border: 'rgba(74,222,128,0.45)'  },
  'volunteer':  { label: 'Volunteer',  color: '#fb7185', bg: 'rgba(251,113,133,0.18)', border: 'rgba(251,113,133,0.45)' },
  'internship': { label: 'Internship', color: '#fbbf24', bg: 'rgba(251,191,36,0.18)',  border: 'rgba(251,191,36,0.45)'  },
}
const FALLBACK = { label: 'Opportunity', color: '#c084fc', bg: 'rgba(192,132,252,0.18)', border: 'rgba(192,132,252,0.45)' }

const SKILL_PALETTE = ['#c084fc', '#38bdf8', '#4ade80', '#fb7185', '#fbbf24', '#fb923c']

export default function OpportunitiesPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    opportunitiesApi.list()
      .then(d => setItems(d.opportunities ?? d))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(i =>
    !search ||
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase()) ||
    i.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 sm:px-10" style={{ paddingTop: 'calc(4.5rem + 3.5rem)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-12">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ background: 'rgba(192,132,252,0.18)', border: '1px solid rgba(192,132,252,0.45)' }}
        >
          <FiZap size={12} color="#c084fc" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: '#c084fc' }}>Explore</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">Opportunities</h1>
        <p className="mt-4 max-w-xl text-lg text-white/75">
          Discover projects and roles posted by teachers and organizations.
        </p>
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="relative max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, company or keyword…"
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
          <FiZap size={44} />
          <p className="text-sm">{search ? 'No results found' : 'No opportunities posted yet'}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => {
            const meta = TYPE_META[item.type] ?? FALLBACK
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -5, transition: { duration: 0.18 } }}
                className="flex flex-col rounded-2xl p-6"
                style={{
                  background: '#1a2744',
                  border: `1px solid ${meta.border}`,
                  borderTop: `3px solid ${meta.color}`,
                  boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
                }}
              >
                {/* Badges */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                  >
                    {meta.label}
                  </span>
                  {item.remote && (
                    <span className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{ background: 'rgba(74,222,128,0.18)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.45)' }}>
                      Remote
                    </span>
                  )}
                </div>

                {/* Title + Company */}
                <h2 className="text-lg font-black leading-snug text-white">{item.title}</h2>
                {item.company_name && (
                  <p className="mt-1.5 text-sm font-bold" style={{ color: meta.color }}>{item.company_name}</p>
                )}
                {item.department && (
                  <p className="mt-0.5 text-xs text-white/55">{item.department}</p>
                )}

                {/* Description */}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/72 line-clamp-3">{item.description}</p>

                {/* Skills */}
                {item.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.skills.slice(0, 4).map((s, j) => (
                      <span
                        key={s}
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          background: `${SKILL_PALETTE[j % SKILL_PALETTE.length]}22`,
                          color: SKILL_PALETTE[j % SKILL_PALETTE.length],
                          border: `1px solid ${SKILL_PALETTE[j % SKILL_PALETTE.length]}44`,
                        }}
                      >{s}</span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/60">
                  {item.location && <span className="flex items-center gap-1.5"><FiMapPin size={11} />{item.location}</span>}
                  {item.deadline && <span className="flex items-center gap-1.5"><FiClock size={11} />Due {new Date(item.deadline).toLocaleDateString()}</span>}
                  {item.stipend  && <span className="flex items-center gap-1.5 font-bold text-emerald-400"><FiDollarSign size={11} />₹{item.stipend.toLocaleString()}</span>}
                </div>

                {/* CTA */}
                <Link
                  to={`/opportunities/${item.id}`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 hover:brightness-125"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                >
                  View Details <FiArrowRight size={13} />
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
      <SupportUs />
    </div>
  )
}
