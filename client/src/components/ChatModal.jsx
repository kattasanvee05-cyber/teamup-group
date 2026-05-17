import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { exchangeApi } from '../api/exchange.js'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'
import { FiX, FiSend, FiClock } from 'react-icons/fi'

const SLOT_LABELS = {
  'morning':   '9 AM – 12 PM',
  'afternoon': '12 PM – 3 PM',
  'evening':   '3 PM – 6 PM',
  'night':     '6 PM – 9 PM',
}

export default function ChatModal({ listing, chat: initialChat, onClose }) {
  const { profile } = useAuth()
  const [chat, setChat]       = useState(initialChat ?? null)
  const [messages, setMessages] = useState([])
  const [input, setInput]     = useState('')
  const [sending, setSending] = useState(false)
  const [starting, setStarting] = useState(false)
  const lastTs = useRef(null)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  // Start or reuse chat
  useEffect(() => {
    if (chat) return
    setStarting(true)
    exchangeApi.startChat(listing.id)
      .then(d => setChat(d.chat))
      .catch(() => {})
      .finally(() => setStarting(false))
  }, [listing.id, chat])

  // Load messages once chat exists, then poll
  const fetchMessages = useCallback(async () => {
    if (!chat) return
    try {
      const d = await exchangeApi.messages(chat.id, lastTs.current)
      if (d.messages?.length) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id))
          const fresh = d.messages.filter(m => !ids.has(m.id))
          if (!fresh.length) return prev
          lastTs.current = fresh[fresh.length - 1].created_at
          return [...prev, ...fresh]
        })
      }
    } catch {}
  }, [chat])

  useEffect(() => {
    if (!chat) return
    // Initial load (no since filter)
    exchangeApi.messages(chat.id)
      .then(d => {
        setMessages(d.messages ?? [])
        if (d.messages?.length) lastTs.current = d.messages[d.messages.length - 1].created_at
      })
      .catch(() => {})
    // Poll every 3s
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => clearInterval(pollRef.current)
  }, [chat, fetchMessages])

  // Scroll to bottom when messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !chat) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      const d = await exchangeApi.send(chat.id, text)
      setMessages(prev => [...prev, d.message])
      lastTs.current = d.message.created_at
    } catch {}
    setSending(false)
  }

  const slots = listing.available_slots ?? []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          onClick={e => e.stopPropagation()}
          className="flex w-full max-w-lg flex-col rounded-t-2xl sm:rounded-2xl border border-white/20 bg-[#080f1f] shadow-2xl"
          style={{ height: '80vh', maxHeight: 600 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.18] p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{listing.title}</p>
              <p className="text-xs text-white">
                {chat ? `Chat with ${chat.owner?.id === profile?.id ? (chat.requester?.full_name ?? chat.requester?.username) : (chat.owner?.full_name ?? chat.owner?.username)}` : 'Starting chat…'}
              </p>
            </div>
            <button onClick={onClose} className="ml-3 shrink-0 rounded-lg p-1.5 text-white transition-colors hover:bg-white/5 hover:text-white">
              <FiX size={18} />
            </button>
          </div>

          {/* Pickup slots */}
          {slots.length > 0 && (
            <div className="border-b border-white/[0.15] px-4 py-2.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white">
                <FiClock size={11} /> Pickup slots available
              </p>
              <div className="flex flex-wrap gap-1.5">
                {slots.map(s => (
                  <span key={s} className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs text-amber-400">
                    {SLOT_LABELS[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {starting && (
              <div className="flex justify-center py-8"><Spinner size="md" /></div>
            )}
            {!starting && messages.length === 0 && (
              <p className="py-8 text-center text-xs text-white">No messages yet — say hello!</p>
            )}
            {messages.map(msg => {
              const mine = msg.sender?.id === profile?.id
              return (
                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                    ${mine
                      ? 'rounded-br-sm bg-[#4fd1ff]/15 text-[#4fd1ff]'
                      : 'rounded-bl-sm bg-white/[0.06] text-white'}`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-[10px] font-medium text-white">
                        {msg.sender?.full_name ?? msg.sender?.username}
                      </p>
                    )}
                    {msg.message}
                    <p className={`mt-0.5 text-[10px] ${mine ? 'text-[#4fd1ff]' : 'text-white'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/[0.18] p-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={!chat || starting}
              className="flex-1 rounded-xl border border-white/20 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[#4fd1ff]/30 focus:outline-none disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!input.trim() || !chat || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4fd1ff]/15 text-[#4fd1ff] transition-colors hover:bg-[#4fd1ff]/25 disabled:opacity-30"
            >
              {sending ? <Spinner size="sm" /> : <FiSend size={15} />}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
