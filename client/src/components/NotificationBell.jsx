import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { notificationsApi } from '../api/notifications.js'
import toast from 'react-hot-toast'
import { FiBell, FiX, FiCheckCircle, FiTrash2 } from 'react-icons/fi'

export default function NotificationBell() {
  const [open, setOpen]   = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  // Poll unread count every 30s; toast once per session if unread > 0 on first load
  useEffect(() => {
    let first = true
    function fetchCount() {
      notificationsApi.unread().then(d => {
        const count = d.unread ?? 0
        setUnread(count)
        if (first && count > 0 && !sessionStorage.getItem('notif_alerted')) {
          sessionStorage.setItem('notif_alerted', '1')
          toast(`🔔 You have ${count} unread notification${count !== 1 ? 's' : ''}`, {
            duration: 5000,
            style: {
              background: '#0d1628',
              color: '#f0f4ff',
              border: '1px solid rgba(79,209,255,0.2)',
              borderRadius: '14px',
              fontSize: '13px',
            },
          })
        }
        first = false
      }).catch(() => {})
    }
    fetchCount()
    const t = setInterval(fetchCount, 30000)
    return () => clearInterval(t)
  }, [])

  // Load full list when panel opens
  useEffect(() => {
    if (!open) return
    setLoading(true)
    notificationsApi.list({ limit: 20 })
      .then(d => setItems(d.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  // Close on outside click
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function handleRead(id) {
    await notificationsApi.markRead(id).catch(() => {})
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnread(n => Math.max(0, n - 1))
  }

  async function handleReadAll() {
    await notificationsApi.markAllRead().catch(() => {})
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  async function handleDismiss(id) {
    await notificationsApi.dismiss(id).catch(() => {})
    setItems(prev => prev.filter(n => n.id !== id))
  }

  async function handleClear() {
    await notificationsApi.clearAll().catch(() => {})
    setItems([])
    setUnread(0)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center rounded-lg p-2 text-white transition-all hover:bg-white/5 hover:text-white"
      >
        <FiBell size={18} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4fd1ff] text-[9px] font-bold text-[#050b15]"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-white/20 bg-[#0a1020]/95 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.18] px-4 py-3">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={handleReadAll} className="text-xs text-[#4fd1ff] hover:text-[#4fd1ff]">
                    Mark all read
                  </button>
                )}
                {items.length > 0 && (
                  <button onClick={handleClear} className="text-xs text-rose-400 hover:text-rose-400">
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="py-8 text-center text-xs text-white">Loading…</div>
              )}
              {!loading && items.length === 0 && (
                <div className="py-10 text-center text-xs text-white">No notifications yet</div>
              )}
              {!loading && items.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 border-b border-white/[0.05] px-4 py-3 transition-colors hover:bg-white/[0.03] ${!n.is_read ? 'bg-[#4fd1ff]/[0.03]' : ''}`}
                >
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-[#4fd1ff]'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white leading-snug">{n.title}</p>
                    {n.message && <p className="mt-0.5 text-xs text-white leading-relaxed">{n.message}</p>}
                    <p className="mt-1 text-[10px] text-white">
                      {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!n.is_read && (
                      <button onClick={() => handleRead(n.id)} className="rounded p-1 text-white hover:text-[#4fd1ff]" title="Mark read">
                        <FiCheckCircle size={12} />
                      </button>
                    )}
                    <button onClick={() => handleDismiss(n.id)} className="rounded p-1 text-white hover:text-rose-400" title="Dismiss">
                      <FiX size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
