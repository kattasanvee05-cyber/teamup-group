import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { studiesApi } from '../api/studies.js'
import { uploadsApi } from '../api/uploads.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Spinner from './Spinner.jsx'
import { FiX, FiSend, FiImage, FiBook, FiTool } from 'react-icons/fi'

export default function BorrowChatModal({ item, itemType, onClose }) {
  const { profile }   = useAuth()
  const [chat, setChat]         = useState(null)
  const [chatError, setChatError] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [starting, setStarting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const lastTs    = useRef(null)
  const bottomRef = useRef(null)
  const pollRef   = useRef(null)
  const fileRef   = useRef(null)

  useEffect(() => {
    setStarting(true)
    studiesApi.startChat({ item_id: item.id, item_type: itemType })
      .then(d => setChat(d.chat))
      .catch(e => setChatError(e.message ?? 'Could not start chat'))
      .finally(() => setStarting(false))
  }, [item.id, itemType])

  const fetchMessages = useCallback(async () => {
    if (!chat) return
    try {
      const d = await studiesApi.chatMessages(chat.id, lastTs.current)
      if (d.messages?.length) {
        setMessages(prev => {
          const ids   = new Set(prev.map(m => m.id))
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
    studiesApi.chatMessages(chat.id)
      .then(d => {
        setMessages(d.messages ?? [])
        if (d.messages?.length) lastTs.current = d.messages[d.messages.length - 1].created_at
      })
      .catch(() => {})
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => clearInterval(pollRef.current)
  }, [chat, fetchMessages])

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
      const d = await studiesApi.sendMessage(chat.id, text)
      setMessages(prev => [...prev, d.message])
      lastTs.current = d.message.created_at
    } catch {}
    setSending(false)
  }

  async function handleImagePick(e) {
    const file = e.target.files[0]
    if (!file || !chat) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setUploading(true)
    try {
      const { url } = await uploadsApi.itemImage(file)
      const d = await studiesApi.sendMessage(chat.id, `[img]${url}`)
      setMessages(prev => [...prev, d.message])
      lastTs.current = d.message.created_at
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const Icon      = itemType === 'book' ? FiBook : FiTool
  const accentCls = itemType === 'book' ? 'bg-[#4fd1ff]/15 text-[#4fd1ff]' : 'bg-violet-400/15 text-violet-400'
  const itemName  = item.title ?? item.name
  const sellerName = chat?.owner?.full_name ?? chat?.owner?.username ?? item.owner?.full_name ?? item.owner?.username ?? 'Seller'

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
          <div className="flex items-center gap-3 border-b border-white/[0.15] p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentCls}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{itemName}</p>
              <p className="text-xs text-white/60">
                {item.price > 0 ? `₹${item.price} deposit` : 'Free to borrow'}
                {' · '}Chat with {sellerName}
              </p>
            </div>
            <button onClick={onClose} className="ml-1 shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white">
              <FiX size={18} />
            </button>
          </div>

          {/* Price banner */}
          {item.price > 0 && (
            <div className="border-b border-white/[0.10] bg-emerald-400/5 px-4 py-2.5">
              <p className="text-xs text-emerald-400">
                ₹{item.price} deposit — confirm price and condition with {sellerName} before borrowing.
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {starting && (
              <div className="flex justify-center py-8"><Spinner size="md" /></div>
            )}
            {!starting && chatError && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <p className="text-sm font-medium text-rose-400">{chatError}</p>
              </div>
            )}
            {!starting && !chatError && messages.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Icon size={32} className="text-white/20" />
                <p className="text-sm font-medium text-white">Chat with {sellerName}</p>
                <p className="text-xs text-white/50">Ask about availability, condition, price, or anything else before you borrow.</p>
              </div>
            )}
            {messages.map(msg => {
              const mine  = msg.sender?.id === profile?.id
              const isImg = typeof msg.message === 'string' && msg.message.startsWith('[img]')
              const imgUrl = isImg ? msg.message.slice(5) : null
              return (
                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                    ${mine
                      ? 'rounded-br-sm bg-[#4fd1ff]/15 text-[#4fd1ff]'
                      : 'rounded-bl-sm bg-white/[0.07] text-white'}`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-[10px] font-semibold text-white/60">
                        {msg.sender?.full_name ?? msg.sender?.username}
                      </p>
                    )}
                    {isImg ? (
                      <img src={imgUrl} alt="Shared" className="max-h-52 rounded-xl object-cover" />
                    ) : (
                      <span>{msg.message}</span>
                    )}
                    <p className={`mt-0.5 text-[10px] ${mine ? 'text-[#4fd1ff]/60' : 'text-white/40'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/[0.15] p-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="sr-only" />
            <button
              type="button"
              title="Share a photo"
              onClick={() => fileRef.current?.click()}
              disabled={!chat || uploading || !!chatError}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 text-white/50 transition-colors hover:border-white/30 hover:text-white disabled:opacity-30"
            >
              {uploading ? <Spinner size="sm" /> : <FiImage size={15} />}
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about price, condition, availability…"
              disabled={!chat || starting || !!chatError}
              className="flex-1 rounded-xl border border-white/20 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#4fd1ff]/30 focus:outline-none disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!input.trim() || !chat || sending || !!chatError}
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
