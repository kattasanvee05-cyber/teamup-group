import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { teamsApi } from '../api/teams.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiUsers, FiPlus, FiX, FiSearch, FiArrowRight } from 'react-icons/fi'

export default function TeamsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    teamsApi.list()
      .then(d => setItems(d.teams ?? d))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await teamsApi.create(form)
      setItems(t => [res.team ?? res, ...t])
      setShowForm(false)
      setForm({ name: '', description: '' })
      toast.success('Team created!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const filtered = items.filter(i =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 sm:px-10" style={{ paddingTop: 'calc(4.5rem + 3.5rem)' }}>

      <div className="mb-12 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-400">Collaborate</p>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">Teams</h1>
          <p className="mt-4 text-lg text-white/65" style={{ maxWidth: '50ch' }}>
            Find or create a team to build something great together.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(v => !v)}
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#4fd1ff] px-5 py-3 text-sm font-bold text-[#050816] transition-colors hover:bg-[#67dcff] mt-2"
        >
          {showForm ? <><FiX size={15} /> Cancel</> : <><FiPlus size={15} /> New Team</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 40 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleCreate}
            className="overflow-hidden rounded-2xl border border-[#4fd1ff]/20 bg-[#4fd1ff]/5"
          >
            <div className="p-8">
              <h2 className="mb-5 font-bold text-white">Create a New Team</h2>
              <div className="space-y-4">
                <input
                  required
                  placeholder="Team name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm text-white placeholder:text-white/35 focus:border-[#4fd1ff]/50 focus:outline-none"
                />
                <textarea
                  placeholder="What is this team building?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm text-white placeholder:text-white/35 focus:border-[#4fd1ff]/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-xl bg-[#4fd1ff] px-7 py-3 text-sm font-bold text-[#050816] transition-colors hover:bg-[#67dcff] disabled:opacity-50"
                >
                  {creating ? <Spinner size="sm" /> : 'Create Team'}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mb-10">
        <div className="relative max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search teams…"
            className="w-full rounded-2xl border border-white/15 bg-white/[0.05] py-3.5 pl-11 pr-5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-emerald-500/40 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/40">
          <FiUsers size={44} />
          <p className="text-sm">{search ? 'No teams found' : 'No teams yet — create one!'}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              className="group flex flex-col rounded-2xl p-6 transition-all duration-300"
              style={{ background: '#1a2744', border: '1px solid rgba(52,211,153,0.3)', borderTop: '3px solid #34d399' }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10">
                <FiUsers className="text-emerald-400" size={22} />
              </div>

              <h2 className="text-base font-bold text-white">{item.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65 line-clamp-2">{item.description}</p>

              {item.tech_stack?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tech_stack.slice(0, 4).map(s => (
                    <span key={s} className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">{s}</span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <FiUsers size={12} />
                  {item.team_members?.length ?? 0}
                  {item.max_members ? `/${item.max_members}` : ''} members
                </span>
                <Link
                  to={`/teams/${item.id}`}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500/10"
                >
                  View Team <FiArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
