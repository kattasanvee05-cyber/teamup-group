import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { internshipsApi } from '../api/internships.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiBriefcase, FiMapPin, FiBookmark, FiSearch, FiClock, FiArrowRight } from 'react-icons/fi'

export default function InternshipsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [search, setSearch] = useState('')

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
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-[4.5rem]">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#4fd1ff]">Internships</p>
        <h1 className="text-5xl font-black tracking-tight text-white">Find Internships</h1>
        <p className="mt-3 text-lg text-white">Build real-world experience with top companies and startups.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or company..."
            className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/70 transition-colors focus:border-[#4fd1ff]/40 focus:outline-none"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 flex-col items-center justify-center gap-3 text-white">
          <FiBriefcase size={40} />
          <p className="text-sm">{search ? 'No results found' : 'No internships posted yet'}</p>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="group flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#4fd1ff]/25 hover:bg-[#04080f]/92 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="mb-3 flex flex-wrap gap-2">
                {item.actively_hiring && (
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">● Actively Hiring</span>
                )}
                {item.ppo_available && (
                  <span className="rounded-full bg-orange-400/10 px-2.5 py-0.5 text-xs text-orange-400">PPO Offered</span>
                )}
                {!item.actively_hiring && !item.ppo_available && (
                  <span className="rounded-full bg-[#4fd1ff]/10 px-2.5 py-0.5 text-xs text-[#4fd1ff] capitalize">{item.mode ?? 'Internship'}</span>
                )}
              </div>

              <h2 className="font-semibold leading-snug text-white line-clamp-1">{item.title}</h2>
              <p className="mt-0.5 text-xs font-medium text-[#4fd1ff]">{item.company_name}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white line-clamp-2">{item.description}</p>

              {item.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.skills.slice(0, 3).map(s => (
                    <span key={s} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white">{s}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white">
                {item.location && <span className="flex items-center gap-1"><FiMapPin size={10} />{item.location}</span>}
                {item.mode && <span className="capitalize">{item.mode}</span>}
                {item.duration_months && <span className="flex items-center gap-1"><FiClock size={10} />{item.duration_months} months</span>}
                {item.stipend_monthly && (
                  <span className="font-medium text-emerald-400">₹{item.stipend_monthly.toLocaleString()}/mo</span>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  to={`/internships/${item.id}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#4fd1ff]/10 py-2.5 text-sm font-medium text-[#4fd1ff] transition-all duration-200 hover:bg-[#4fd1ff]/20"
                >
                  View Details <FiArrowRight size={13} />
                </Link>
                <button
                  onClick={() => doBookmark(item.id)}
                  disabled={busy === `bm-${item.id}`}
                  className="flex items-center justify-center rounded-xl border border-white/20 px-3 py-2.5 text-white transition-all duration-200 hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  {busy === `bm-${item.id}` ? <Spinner size="sm" /> : <FiBookmark size={14} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
