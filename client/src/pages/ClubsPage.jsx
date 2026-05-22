import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiSearch, FiUsers, FiMail, FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi'
import SupportUs from '../components/SupportUs.jsx'

const CATEGORY_COLORS = {
  'Coding':    '#4fd1ff',
  'Technical': '#818cf8',
  'Robotics':  '#fbbf24',
  'Design':    '#ec4899',
  'Research':  '#34d399',
  'Cultural':  '#f97316',
  'Sports':    '#22d3ee',
  default:     '#94a3b8',
}

export default function ClubsPage() {
  const [clubs, setClubs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    clubsApi.list()
      .then(d => setClubs(d.clubs ?? []))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = clubs.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  )

  const byCategory = filtered.reduce((acc, c) => {
    const cat = c.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  return (
    <div className="min-h-screen px-5 pb-28 sm:px-10" style={{ paddingTop: 'calc(4.5rem + 3.5rem)' }}>
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/8 px-4 py-1.5">
            <FiUsers size={12} className="text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">Student Clubs</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">Clubs</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            Find your community — join clubs that match your interests, skills, and passions.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clubs by name or category…"
            className="w-full rounded-xl border border-white/15 bg-white/[0.05] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:border-violet-400/40 focus:outline-none transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/50">
            <FiUsers size={44} />
            <p className="text-sm">No clubs found</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(byCategory).map(([category, items]) => (
              <section key={category}>
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default }}
                  />
                  <h2 className="text-lg font-black text-white">{category}</h2>
                  <span className="text-sm text-white/40">{items.length} club{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((club, i) => (
                    <ClubCard key={club.id} club={club} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      <SupportUs />
    </div>
  )
}

function ClubCard({ club, index }) {
  const color = CATEGORY_COLORS[club.category] ?? CATEGORY_COLORS.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{
        background: '#1a2744',
        border: `1px solid ${color}30`,
        borderTop: `3px solid ${color}`,
      }}
    >
      {/* Banner strip */}
      <div
        className="flex h-14 items-center justify-between px-5"
        style={{ background: `${color}12` }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black"
          style={{ background: `${color}20`, color }}>
          {club.name[0]}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: club.is_accepting_members ? '#34d399' : '#f87171' }}>
          {club.is_accepting_members
            ? <><FiCheckCircle size={12} /> Open</>
            : <><FiXCircle size={12} /> Closed</>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-white">{club.name}</h3>
        {club.category && (
          <span className="mt-1 text-xs font-medium" style={{ color }}>{club.category}</span>
        )}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60 line-clamp-3">{club.description}</p>

        <div className="mt-4 flex items-center justify-between text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <FiUsers size={12} />
            {club.member_count ?? 0} members
          </span>
          {club.contact_email && (
            <a
              href={`mailto:${club.contact_email}`}
              className="flex items-center gap-1 transition-colors hover:text-[#4fd1ff]"
              onClick={e => e.stopPropagation()}
            >
              <FiMail size={12} /> Contact
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.07] px-5 py-3">
        <Link
          to={`/clubs/${club.id}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all hover:brightness-110"
          style={{ background: `${color}18`, color }}
        >
          <FiMessageSquare size={12} />
          {club.is_accepting_members ? 'Join & Chat' : 'View Chat'}
        </Link>
      </div>
    </motion.div>
  )
}
