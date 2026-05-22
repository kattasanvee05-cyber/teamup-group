import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { applicationsApi } from '../api/applications.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { FiFileText, FiTrash2, FiClock, FiAlertTriangle, FiX } from 'react-icons/fi'
import SupportUs from '../components/SupportUs.jsx'

const STATUS_STYLES = {
  pending:   { cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',   dot: 'bg-yellow-400' },
  reviewing: { cls: 'bg-blue-400/10 text-blue-400 border-blue-400/20',         dot: 'bg-blue-400' },
  accepted:  { cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', dot: 'bg-emerald-400' },
  rejected:  { cls: 'bg-red-400/10 text-red-400 border-red-400/20',            dot: 'bg-red-400' },
}

export default function ApplicationsPage() {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [confirming, setConfirming] = useState(null)   // id of card showing inline confirm
  const [withdrawing, setWithdrawing] = useState(null) // id currently being withdrawn

  useEffect(() => {
    applicationsApi.mine()
      .then(d => setItems(d.applications ?? d))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleWithdraw(id) {
    setWithdrawing(id)
    setConfirming(null)
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
    <div className="mx-auto max-w-4xl px-5 pb-28 sm:px-10" style={{ paddingTop: 'calc(4.5rem + 3.5rem)' }}>

      <div className="mb-12">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-amber-400">My Applications</p>
        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">Applications</h1>
        <p className="mt-4 text-lg text-white/75">Track the status of everything you've applied to.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/60">
          <FiFileText size={44} />
          <p className="text-sm">You haven't applied to anything yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => {
            const s = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending
            const canWithdraw = ['pending', 'reviewing'].includes(item.status)
            const isConfirming = confirming === item.id
            const isWithdrawing = withdrawing === item.id

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl transition-all duration-200"
                style={{ background: '#1a2744', border: `1px solid ${isConfirming ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.2)'}` }}
              >
                {/* Main row */}
                <div className="flex items-center justify-between gap-5 px-6 py-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{title(item)}</p>
                    {item.target_company && (
                      <p className="mt-0.5 text-xs font-medium text-[#4fd1ff]">{item.target_company}</p>
                    )}
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/45">
                      <FiClock size={11} />
                      Applied {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize ${s.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {item.status ?? 'pending'}
                    </span>

                    {canWithdraw && (
                      isWithdrawing ? (
                        <div className="p-2"><Spinner size="sm" /></div>
                      ) : (
                        <button
                          onClick={() => setConfirming(isConfirming ? null : item.id)}
                          className={`rounded-lg p-2 transition-colors ${
                            isConfirming
                              ? 'bg-red-400/15 text-red-400'
                              : 'text-white/40 hover:bg-red-400/10 hover:text-red-400'
                          }`}
                          title="Withdraw application"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Inline confirm bar */}
                <AnimatePresence>
                  {isConfirming && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-4 border-t border-red-400/20 bg-red-400/[0.05] px-6 py-3.5">
                        <div className="flex items-center gap-2.5 text-sm text-white/70">
                          <FiAlertTriangle size={14} className="shrink-0 text-red-400" />
                          Withdraw this application? This cannot be undone.
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => setConfirming(null)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
                          >
                            <FiX size={12} /> Cancel
                          </button>
                          <button
                            onClick={() => handleWithdraw(item.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3.5 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/30"
                          >
                            <FiTrash2 size={12} /> Yes, withdraw
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
      <SupportUs />
    </div>
  )
}
