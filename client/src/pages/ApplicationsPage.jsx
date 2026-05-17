import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { applicationsApi } from '../api/applications.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiFileText, FiTrash2, FiClock } from 'react-icons/fi'

const STATUS_STYLES = {
  pending:   { cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',  dot: 'bg-yellow-400' },
  reviewing: { cls: 'bg-blue-400/10 text-blue-400 border-blue-400/20',        dot: 'bg-blue-400' },
  accepted:  { cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',dot: 'bg-emerald-400' },
  rejected:  { cls: 'bg-red-400/10 text-red-400 border-red-400/20',           dot: 'bg-red-400' },
  withdrawn: { cls: 'bg-white/5 text-white border-white/20',               dot: 'bg-white/30' },
}

export default function ApplicationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(null)

  useEffect(() => {
    applicationsApi.mine()
      .then(d => setItems(d.applications ?? d))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleWithdraw(id) {
    if (!window.confirm('Withdraw this application?')) return
    setWithdrawing(id)
    try {
      await applicationsApi.withdraw(id)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Application withdrawn')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setWithdrawing(null)
    }
  }

  const title = item =>
    item.target_title ?? `Application #${item.id?.slice(0, 8)}`

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-[4.5rem]">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-amber-400">My Applications</p>
        <h1 className="text-5xl font-black tracking-tight text-white">Applications</h1>
        <p className="mt-3 text-lg text-white">Track the status of everything you've applied to.</p>
      </motion.div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 flex-col items-center justify-center gap-3 text-white">
          <FiFileText size={40} />
          <p className="text-sm">You haven't applied to anything yet</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const s = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-[#04080f]/90 px-5 py-4 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-[#0d1628]/90"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{title(item)}</p>
                  {item.target_company && (
                    <p className="mt-0.5 text-xs text-[#4fd1ff]">{item.target_company}</p>
                  )}
                  <p className="mt-1 flex items-center gap-1 text-xs text-white">
                    <FiClock size={10} />
                    Applied {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${s.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {item.status ?? 'pending'}
                  </span>
                  {['pending', 'reviewing'].includes(item.status) && (
                    <button
                      onClick={() => handleWithdraw(item.id)}
                      disabled={withdrawing === item.id}
                      className="rounded-lg p-1.5 text-white transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                      title="Withdraw application"
                    >
                      {withdrawing === item.id ? <Spinner size="sm" /> : <FiTrash2 size={14} />}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
