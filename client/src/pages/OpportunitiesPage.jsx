import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { opportunitiesApi } from '../api/opportunities.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiZap, FiMapPin, FiClock, FiSearch, FiDollarSign, FiArrowRight } from 'react-icons/fi'

const SKILL_COLORS = [
  'bg-purple-400/10 text-purple-400',
  'bg-cyan-400/10 text-cyan-400',
  'bg-emerald-400/10 text-emerald-400',
  'bg-orange-400/10 text-orange-400',
  'bg-pink-400/10 text-pink-400',
]

export default function OpportunitiesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-[4.5rem]">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-violet-400">Explore</p>
        <h1 className="text-5xl font-black tracking-tight text-white">Opportunities</h1>
        <p className="mt-3 text-lg text-white">Discover projects and roles posted by teachers and organizations.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, company or keyword..."
            className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/70 transition-colors focus:border-purple-500/40 focus:outline-none"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 flex-col items-center justify-center gap-3 text-white">
          <FiZap size={40} />
          <p className="text-sm">{search ? 'No results found for your search' : 'No opportunities posted yet'}</p>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="group flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 p-5 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-[#04080f]/92 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-purple-400/10 px-2.5 py-0.5 text-xs font-medium text-purple-400">
                  {item.type ?? 'Opportunity'}
                </span>
                {item.remote && (
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs text-emerald-400">Remote</span>
                )}
              </div>

              <h2 className="font-semibold leading-snug text-white line-clamp-1">{item.title}</h2>
              {item.company_name && (
                <p className="mt-0.5 text-xs font-medium text-[#4fd1ff]">{item.company_name}</p>
              )}
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white line-clamp-2">{item.description}</p>

              {item.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.skills.slice(0, 4).map((s, j) => (
                    <span key={s} className={`rounded-full px-2.5 py-0.5 text-xs ${SKILL_COLORS[j % SKILL_COLORS.length]}`}>{s}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white">
                {item.location && (
                  <span className="flex items-center gap-1"><FiMapPin size={10} />{item.location}</span>
                )}
                {item.deadline && (
                  <span className="flex items-center gap-1"><FiClock size={10} />Due {new Date(item.deadline).toLocaleDateString()}</span>
                )}
                {item.stipend && (
                  <span className="flex items-center gap-1 text-emerald-400"><FiDollarSign size={10} />₹{item.stipend}</span>
                )}
              </div>

              <Link
                to={`/opportunities/${item.id}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500/10 py-2.5 text-sm font-medium text-purple-400 transition-all duration-200 hover:bg-purple-500/20"
              >
                View Details <FiArrowRight size={13} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
