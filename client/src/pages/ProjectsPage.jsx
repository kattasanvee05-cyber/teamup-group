import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api/projects.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import {
  FiSearch, FiCode, FiDollarSign, FiGift,
  FiClock, FiUsers, FiArrowRight, FiFilter,
} from 'react-icons/fi'
import SupportUs from '../components/SupportUs.jsx'

const PAID_META   = { color: '#34d399', bg: 'rgba(52,211,153,0.18)',  border: 'rgba(52,211,153,0.45)'  }
const UNPAID_META = { color: '#a78bfa', bg: 'rgba(167,139,250,0.18)', border: 'rgba(167,139,250,0.45)' }

const SKILL_PALETTE = ['#34d399', '#4fd1ff', '#a78bfa', '#fb7185', '#fbbf24', '#fb923c']

const TYPE_TABS = [
  { key: 'all',    label: 'All Projects' },
  { key: 'paid',   label: 'Paid'   },
  { key: 'unpaid', label: 'Unpaid' },
]

export default function ProjectsPage() {
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    const params = { status: 'open', sort: 'newest', limit: 50 }
    if (typeFilter !== 'all') params.type = typeFilter
    setLoading(true)
    projectsApi.list(params)
      .then(d => setItems(d.projects ?? []))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [typeFilter])

  const filtered = items.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const paid   = filtered.filter(p => p.type === 'paid')
  const unpaid = filtered.filter(p => p.type === 'unpaid')

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 sm:px-10" style={{ paddingTop: 'calc(4.5rem + 3.5rem)' }}>

      {/* Header */}
      <div className="mb-12">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ background: 'rgba(52,211,153,0.18)', border: '1px solid rgba(52,211,153,0.45)' }}
        >
          <FiCode size={12} color="#34d399" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: '#34d399' }}>Projects</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">Projects</h1>
        <p className="mt-4 max-w-xl text-lg text-white/75">
          Collaborate on paid opportunities with stipends, or unpaid projects for experience, research, and impact.
        </p>
      </div>

      {/* Search + filter */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-lg flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, company or keyword…"
            className="w-full rounded-2xl py-3.5 pl-11 pr-5 text-sm text-white placeholder:text-white/45 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
          />
        </div>
        <div className="flex gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] p-1">
          {TYPE_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                typeFilter === t.key
                  ? 'bg-[#34d399]/15 text-[#34d399]'
                  : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t.key === 'paid'   && <FiDollarSign size={13} />}
              {t.key === 'unpaid' && <FiGift size={13} />}
              {t.key === 'all'    && <FiFilter size={13} />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/55">
          <FiCode size={44} />
          <p className="text-sm">{search ? 'No results found' : 'No projects posted yet'}</p>
        </div>
      ) : (
        <div className="space-y-14">

          {/* Paid */}
          {(typeFilter === 'all' || typeFilter === 'paid') && paid.length > 0 && (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'rgba(52,211,153,0.18)' }}>
                  <FiDollarSign size={15} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Paid Projects</h2>
                  <p className="text-xs text-white/45">Stipend-based · Real company work</p>
                </div>
                <span className="ml-auto rounded-full px-3 py-0.5 text-xs font-bold"
                  style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                  {paid.length} open
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paid.map((p, i) => (
                  <ProjectCard key={p.id} project={p} meta={PAID_META} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Unpaid */}
          {(typeFilter === 'all' || typeFilter === 'unpaid') && unpaid.length > 0 && (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'rgba(167,139,250,0.18)' }}>
                  <FiGift size={15} style={{ color: '#a78bfa' }} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Unpaid Projects</h2>
                  <p className="text-xs text-white/45">Portfolio · Research · Open source · Social impact</p>
                </div>
                <span className="ml-auto rounded-full px-3 py-0.5 text-xs font-bold"
                  style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                  {unpaid.length} open
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {unpaid.map((p, i) => (
                  <ProjectCard key={p.id} project={p} meta={UNPAID_META} index={i} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
      <SupportUs />
    </div>
  )
}

function ProjectCard({ project: p, meta, index }) {
  return (
    <motion.div
      key={p.id}
      whileHover={{ y: -5, transition: { duration: 0.18 } }}
      className="flex flex-col rounded-2xl p-6"
      style={{
        background: '#1a2744',
        border: `1px solid ${meta.border}`,
        borderTop: `3px solid ${meta.color}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
        >
          {p.type === 'paid'
            ? (p.stipend ? `₹${Number(p.stipend).toLocaleString()}/mo` : 'Paid')
            : 'Unpaid'}
        </span>
        {p.category && (
          <span className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {p.category}
          </span>
        )}
      </div>

      {/* Title + Company */}
      <h2 className="text-lg font-black leading-snug text-white">{p.title}</h2>
      {p.company_name && (
        <p className="mt-1.5 text-sm font-bold" style={{ color: meta.color }}>{p.company_name}</p>
      )}

      {/* Description */}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70 line-clamp-3">{p.description}</p>

      {/* Skills */}
      {p.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.skills.slice(0, 4).map((s, j) => (
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
          {p.skills.length > 4 && (
            <span className="rounded-full px-2.5 py-1 text-xs text-white/40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              +{p.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/60">
        {p.duration   && <span className="flex items-center gap-1.5"><FiClock size={11} />{p.duration}</span>}
        {p.team_size > 1 && <span className="flex items-center gap-1.5"><FiUsers size={11} />{p.team_size} members</span>}
      </div>

      {/* CTA */}
      <Link
        to={`/projects/${p.id}`}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 hover:brightness-125"
        style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
      >
        View Details <FiArrowRight size={13} />
      </Link>
    </motion.div>
  )
}
