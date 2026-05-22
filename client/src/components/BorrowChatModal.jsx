import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { studiesApi } from '../api/studies.js'
import { uploadsApi } from '../api/uploads.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Spinner from './Spinner.jsx'
import { FiX, FiSend, FiImage, FiBook, FiTool, FiArrowLeft, FiMessageSquare } from 'react-icons/fi'

function ChatThread({ chatId, otherName, onBack, itemType }) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const lastTs    = useRef(null)
  const bottomRef = useRef(null)
  const pollRef   = useRef(null)
  const fileRef   = useRef(null)

  const fetchMessages = useCallback(async () => {
    try {
      const d = await studiesApi.chatMessages(chatId, lastTs.current)
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
  }, [chatId])

  useEffect(() => {
    studiesApi.chatMessages(chatId)
      .then(d => {
        setMessages(d.messages ?? [])
        if (d.messages?.length) lastTs.current = d.messages[d.messages.length - 1].created_at
      })
      .catch(() => {})
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => clearInterval(pollRef.current)
  }, [chatId, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      const d = await studiesApi.sendMessage(chatId, text)
      setMessages(prev => [...prev, d.message])
      lastTs.current = d.message.created_at
    } catch {}
    setSending(false)
  }

  async function handleImagePick(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setUploading(true)
    try {
      const { url } = await uploadsApi.itemImage(file)
      const d = await studiesApi.sendMessage(chatId, `[img]${url}`)
      setMessages(prev => [...prev, d.message])
      lastTs.current = d.message.created_at
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      {/* Sub-header */}
      <div className="flex items-center gap-2 border-b border-white/[0.1] px-4 py-2.5">
        {onBack && (
          <button onClick={onBack} className="rounded-lg p-1.5 text-white/40 hover:text-white">
            <FiArrowLeft size={15} />
          </button>
        )}
        <p className="text-xs font-semibold text-white/70">{otherName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <FiMessageSquare size={28} className="text-white/20" />
            <p className="text-sm text-white/50">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const mine  = msg.sender?.id === profile?.id
          const isImg = typeof msg.message === 'string' && msg.message.startsWith('[img]')
          const imgUrl = isImg ? msg.message.slice(5) : null
          return (
            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                ${mine ? 'rounded-br-sm bg-[#4fd1ff]/15 text-[#4fd1ff]' : 'rounded-bl-sm bg-white/[0.07] text-white'}`}
              >
                {!mine && (
                  <p className="mb-0.5 text-[10px] font-semibold text-white/50">
                    {msg.sender?.full_name ?? msg.sender?.username}
                  </p>
                )}
                {isImg
                  ? <img src={imgUrl} alt="Shared" className="max-h-52 rounded-xl object-cover" />
                  : <span>{msg.message}</span>
                }
                <p className={`mt-0.5 text-[10px] ${mine ? 'text-[#4fd1ff]/50' : 'text-white/35'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/[0.1] p-3">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="sr-only" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 text-white/50 hover:border-white/30 hover:text-white disabled:opacity-30"
        >
          {uploading ? <Spinner size="sm" /> : <FiImage size={15} />}
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-white/20 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#4fd1ff]/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4fd1ff]/15 text-[#4fd1ff] hover:bg-[#4fd1ff]/25 disabled:opacity-30"
        >
          {sending ? <Spinner size="sm" /> : <FiSend size={15} />}
        </button>
      </form>
    </>
  )
}

export default function BorrowChatModal({ item, itemType, onClose }) {
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [isOwner, setIsOwner]         = useState(false)
  const [chat, setChat]               = useState(null)      // customer view
  const [ownerChats, setOwnerChats]   = useState([])        // seller view
  const [activeChat, setActiveChat]   = useState(null)      // seller selected chat

  useEffect(() => {
    studiesApi.startChat({ item_id: item.id, item_type: itemType })
      .then(d => {
        if (d.isOwner) {
          setIsOwner(true)
          setOwnerChats(d.chats ?? [])
        } else {
          setChat(d.chat)
        }
      })
      .catch(e => setError(e.message ?? 'Could not open chat'))
      .finally(() => setLoading(false))
  }, [item.id, itemType])

  const Icon      = itemType === 'book' ? FiBook : FiTool
  const accentCls = itemType === 'book' ? 'bg-[#4fd1ff]/15 text-[#4fd1ff]' : 'bg-violet-400/15 text-violet-400'
  const itemName  = item.title ?? item.name

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
              <p className="text-xs text-white/50">
                {isOwner ? 'Customer inquiries' : 'Chat with seller'}
              </p>
            </div>
            <button onClick={onClose} className="ml-1 shrink-0 rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white">
              <FiX size={18} />
            </button>
          </div>

          {/* Body */}
          {loading && (
            <div className="flex flex-1 items-center justify-center">
              <Spinner size="md" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-sm font-medium text-rose-400">{error}</p>
            </div>
          )}

          {/* Owner inbox — list of customer chats */}
          {!loading && !error && isOwner && !activeChat && (
            <div className="flex-1 overflow-y-auto p-4">
              {ownerChats.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <FiMessageSquare size={32} className="text-white/20" />
                  <p className="text-sm text-white/50">No customer inquiries yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                    {ownerChats.length} conversation{ownerChats.length !== 1 ? 's' : ''}
                  </p>
                  {ownerChats.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveChat(c)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-left transition-all hover:border-[#4fd1ff]/30 hover:bg-white/[0.07]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4fd1ff]/30 to-violet-500/30 text-sm font-black text-[#4fd1ff]">
                        {(c.customer?.full_name ?? c.customer?.username ?? '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          {c.customer?.full_name ?? c.customer?.username ?? 'Anonymous'}
                        </p>
                        <p className="text-xs text-white/40">
                          @{c.customer?.username ?? '—'} · {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <FiArrowLeft size={14} className="shrink-0 rotate-180 text-white/30" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Owner viewing a customer thread */}
          {!loading && !error && isOwner && activeChat && (
            <ChatThread
              chatId={activeChat.id}
              otherName={activeChat.customer?.full_name ?? activeChat.customer?.username ?? 'Customer'}
              onBack={() => setActiveChat(null)}
              itemType={itemType}
            />
          )}

          {/* Customer chat thread */}
          {!loading && !error && !isOwner && chat && (
            <ChatThread
              chatId={chat.id}
              otherName={chat.owner?.full_name ?? chat.owner?.username ?? 'Seller'}
              onBack={null}
              itemType={itemType}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
