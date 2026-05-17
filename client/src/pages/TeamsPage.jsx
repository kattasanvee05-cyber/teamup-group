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
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-[4.5rem]">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-emerald-400">Collaborate</p>
          <h1 className="text-5xl font-black tracking-tight text-white">Teams</h1>
          <p className="mt-3 text-lg text-white">Find or create a team to build something great together.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(v => !v)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#4fd1ff] px-4 py-2.5 text-sm font-semibold text-[#050816] transition-colors hover:bg-[#67dcff]"
        >
          {showForm ? <><FiX size={14} /> Cancel</> : <><FiPlus size={14} /> New Team</>}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleCreate}
            className="overflow-hidden rounded-2xl border border-[#4fd1ff]/20 bg-[#4fd1ff]/5"
          >
            <div className="p-6">
              <h2 className="mb-4 font-semibold text-white">Create a New Team</h2>
              <div className="space-y-3">
                <input
                  required
                  placeholder="Team name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/70 focus:border-[#4fd1ff]/50 focus:outline-none"
                />
                <textarea
                  placeholder="What is this team building?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/70 focus:border-[#4fd1ff]/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-xl bg-[#4fd1ff] px-6 py-2.5 text-sm font-semibold text-[#050816] transition-colors hover:bg-[#67dcff] disabled:opacity-50"
                >
                  {creating ? <Spinner size="sm" /> : 'Create Team'}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/70 transition-colors focus:border-emerald-500/40 focus:outline-none"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 flex-col items-center justify-center gap-3 text-white">
          <FiUsers size={40} />
          <p className="text-sm">{search ? 'No teams found' : 'No teams yet — create one!'}</p>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="group flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 p-5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#04080f]/92 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10">
                <FiUsers className="text-emerald-400" size={20} />
              </div>

              <h2 className="font-semibold text-white">{item.name}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-white line-clamp-2">{item.description}</p>

              {item.tech_stack?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tech_stack.slice(0, 4).map(s => (
                    <span key={s} className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs text-emerald-400">{s}</span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-white">
                  <FiUsers size={11} />
                  {item.team_members?.length ?? 0}
                  {item.max_members ? `/${item.max_members}` : ''} members
                </span>
                <Link
                  to={`/teams/${item.id}`}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 px-3.5 py-1.5 text-xs font-medium text-emerald-400 transition-all duration-200 hover:bg-emerald-500/10"
                >
                  View Team <FiArrowRight size={11} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
