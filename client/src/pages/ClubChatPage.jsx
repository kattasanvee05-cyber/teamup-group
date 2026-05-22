import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { clubsApi } from '../api/clubs.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import {
  FiArrowLeft, FiHash, FiSend, FiUsers, FiLogOut,
  FiMenu, FiVolume2, FiBell, FiChevronDown, FiChevronRight,
} from 'react-icons/fi'

// ── Channel structure (Discord-style) ──────────────────────────────────────
const CHANNEL_GROUPS = [
  {
    label: 'INFORMATION',
    channels: [
      { id: 'welcome',       label: 'welcome',       type: 'text', desc: 'Start here — introduction & club info' },
      { id: 'rules',         label: 'rules',          type: 'text', desc: 'Club rules and code of conduct' },
    ],
  },
  {
    label: 'GENERAL',
    channels: [
      { id: 'general',       label: 'general',        type: 'text', desc: 'General discussion and chat' },
      { id: 'hackathon',     label: 'hackathon',      type: 'text', desc: 'Team formation and hackathon planning' },
      { id: 'coding',        label: 'coding',         type: 'text', desc: 'Code help, tips, and discussions' },
    ],
  },
  {
    label: 'EVENTS',
    channels: [
      { id: 'announcements', label: 'announcements',  type: 'announce', desc: 'Important club announcements' },
    ],
  },
]

const ALL_CHANNELS = CHANNEL_GROUPS.flatMap(g => g.channels)

const CAT_COLOR = {
  Coding: '#4fd1ff', Technical: '#818cf8', Robotics: '#fbbf24',
  Design: '#ec4899', Research: '#34d399', Cultural: '#f97316', Sports: '#22d3ee',
}
const catColor = cat => CAT_COLOR[cat] ?? '#94a3b8'

// ── Main component ──────────────────────────────────────────────────────────
export default function ClubChatPage() {
  const { id: clubId } = useParams()
  const { profile }    = useAuth()

  const [myClubs, setMyClubs]         = useState([])
  const [club, setClub]               = useState(null)
  const [messages, setMessages]       = useState([])
  const [members, setMembers]         = useState([])
  const [isMember, setIsMember]       = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [joining, setJoining]         = useState(false)
  const [leaving, setLeaving]         = useState(false)
  const [activeChannel, setActiveChannel] = useState('welcome')
  const [text, setText]               = useState('')
  const [sending, setSending]         = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const [collapsedGroups, setCollapsedGroups] = useState({})

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const lastTimeRef = useRef(null)
  const chanRef     = useRef('welcome')

  // Keep chanRef in sync
  useEffect(() => { chanRef.current = activeChannel }, [activeChannel])

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    setPageLoading(true)
    Promise.all([clubsApi.get(clubId), clubsApi.mine()])
      .then(([clubRes, mineRes]) => {
        const c    = clubRes.club ?? clubRes
        const mine = mineRes.clubs ?? []
        setClub(c)
        setMyClubs(mine)
        setIsMember(mine.some(m => m.id === clubId))
      })
      .catch(e => toast.error(e.message))
      .finally(() => setPageLoading(false))
  }, [clubId])

  // ── Fetch messages ────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const ch    = chanRef.current
      const since = initial ? null : lastTimeRef.current
      const res   = await clubsApi.messages(clubId, ch, since)
      const msgs  = res.messages ?? []
      if (!msgs.length) return
      lastTimeRef.current = msgs[msgs.length - 1].created_at
      setMessages(prev => initial ? msgs : [...prev, ...msgs])
    } catch { /* silent on polls */ }
  }, [clubId])

  // Reset + start polling when channel or membership changes
  useEffect(() => {
    if (!isMember) return
    setMessages([])
    lastTimeRef.current = null
    fetchMessages(true)
    clubsApi.members(clubId).then(d => setMembers(d.members ?? [])).catch(() => {})

    const tid = setInterval(() => {
      fetchMessages(false)
      clubsApi.members(clubId).then(d => setMembers(d.members ?? [])).catch(() => {})
    }, 3000)
    return () => clearInterval(tid)
  }, [isMember, clubId, activeChannel, fetchMessages])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleJoin() {
    setJoining(true)
    try {
      await clubsApi.join(clubId)
      setMyClubs(prev => [...prev, club])
      setIsMember(true)
      toast.success(`Joined ${club.name}!`)
    } catch (e) { toast.error(e.message) }
    finally { setJoining(false) }
  }

  async function handleLeave() {
    if (!confirm(`Leave ${club.name}?`)) return
    setLeaving(true)
    try {
      await clubsApi.leave(clubId)
      setMyClubs(prev => prev.filter(c => c.id !== clubId))
      setIsMember(false)
      setMessages([])
      toast.success(`Left ${club.name}`)
    } catch (e) { toast.error(e.message) }
    finally { setLeaving(false) }
  }

  async function handleSend(e) {
    e.preventDefault()
    const msg = text.trim()
    if (!msg) return
    setSending(true)
    setText('')
    try {
      const res    = await clubsApi.sendMessage(clubId, msg, activeChannel)
      const newMsg = res.message
      if (newMsg) {
        setMessages(prev => [...prev, newMsg])
        lastTimeRef.current = newMsg.created_at
      }
    } catch (e) {
      toast.error(e.message)
      setText(msg)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function selectChannel(chId) {
    if (chId === activeChannel) return
    setActiveChannel(chId)
    setShowMobileSidebar(false)
  }

  function toggleGroup(label) {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>
  )
  if (!club) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-white">
      <p className="text-white/50">Club not found</p>
      <Link to="/clubs" className="text-sm text-[#4fd1ff] hover:underline">← Back to Clubs</Link>
    </div>
  )

  const accent      = catColor(club.category)
  const activeCh    = ALL_CHANNELS.find(c => c.id === activeChannel)

  // ── Sidebar content (shared between desktop + mobile) ─────────────────────
  const SidebarContent = (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Club header */}
      <div
        className="flex shrink-0 items-center gap-3 border-b border-black/30 px-3 py-3 shadow-sm"
        style={{ background: `${accent}12` }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-black"
          style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}35` }}
        >
          {club.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">{club.name}</p>
          <p className="text-[10px]" style={{ color: accent }}>{club.category}</p>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-2">
        {CHANNEL_GROUPS.map(group => (
          <div key={group.label} className="mb-1">
            {/* Category header */}
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex w-full items-center gap-1 px-3 py-1 text-left"
            >
              {collapsedGroups[group.label]
                ? <FiChevronRight size={10} className="text-white/35" />
                : <FiChevronDown size={10} className="text-white/35" />
              }
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 hover:text-white/55 transition-colors">
                {group.label}
              </span>
            </button>

            {/* Channel items */}
            {!collapsedGroups[group.label] && group.channels.map(ch => {
              const isActive = ch.id === activeChannel
              return (
                <button
                  key={ch.id}
                  onClick={() => selectChannel(ch.id)}
                  className={`group flex w-full items-center gap-2 rounded-md px-2 py-1.5 mx-1 transition-all ${
                    isActive
                      ? 'bg-white/[0.12] text-white'
                      : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'
                  }`}
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  {ch.type === 'announce'
                    ? <FiBell size={15} className={isActive ? 'text-white' : 'text-white/35'} />
                    : <FiHash size={15} className={isActive ? 'text-white' : 'text-white/35'} />
                  }
                  <span className="truncate text-sm">{ch.label}</span>
                </button>
              )
            })}
          </div>
        ))}

        {/* Divider + Your Clubs */}
        <div className="mt-3 border-t border-white/[0.07] pt-3">
          <Link
            to="/clubs"
            onClick={() => setShowMobileSidebar(false)}
            className="flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30 transition-colors hover:text-white/55"
          >
            <FiArrowLeft size={10} />
            Explore Clubs
          </Link>

          <p className="mt-2 px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
            Your Clubs
          </p>
          {myClubs.length === 0 ? (
            <p className="px-3 text-xs text-white/20">None joined yet</p>
          ) : (
            myClubs.map(c => {
              const cc     = catColor(c.category)
              const active = c.id === clubId
              return (
                <Link
                  key={c.id}
                  to={`/clubs/${c.id}`}
                  onClick={() => setShowMobileSidebar(false)}
                  title={c.name}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 mx-1 transition-all ${
                    active ? 'bg-white/[0.10] text-white' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
                  }`}
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black"
                    style={{ background: `${cc}22`, color: cc }}
                  >
                    {c.name[0]}
                  </div>
                  <span className="truncate text-xs font-medium">{c.name}</span>
                  {active && <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: cc }} />}
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex overflow-hidden" style={{ height: '100vh', paddingTop: '4.5rem' }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside className={`
        fixed left-0 z-50 w-60 bg-[#0a1525] transition-transform duration-200
        lg:static lg:translate-x-0 lg:z-auto
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ top: '4.5rem', height: 'calc(100vh - 4.5rem)' }}>
        {SidebarContent}
      </aside>

      {/* ── Center chat ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0c1628]">

        {/* Channel header */}
        <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] px-4 py-2.5">
          <button
            className="rounded-lg p-1 text-white/40 hover:text-white lg:hidden"
            onClick={() => setShowMobileSidebar(v => !v)}
          >
            <FiMenu size={18} />
          </button>
          {activeCh?.type === 'announce'
            ? <FiBell size={17} className="shrink-0 text-white/50" />
            : <FiHash size={17} className="shrink-0 text-white/50" />
          }
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">{activeCh?.label ?? activeChannel}</p>
            {activeCh?.desc && <p className="text-[11px] text-white/35">{activeCh.desc}</p>}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {isMember && (
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/35 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <FiLogOut size={13} />
                <span className="hidden sm:inline">Leave</span>
              </button>
            )}
            <button
              onClick={() => setShowMembers(v => !v)}
              className={`rounded-lg p-1.5 transition-colors ${showMembers ? 'bg-white/[0.08] text-white' : 'text-white/35 hover:text-white'}`}
              title="Members"
            >
              <FiUsers size={16} />
            </button>
          </div>
        </header>

        {/* Body */}
        {isMember === false ? (

          /* ── Join prompt ─────────────────────────────────────────────── */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black shadow-xl"
              style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
            >
              {club.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{club.name}</h2>
              <p className="mt-1.5 max-w-sm text-sm text-white/50">{club.description}</p>
            </div>
            <p className="text-sm text-white/40">
              Join to access all channels and chat with {club.member_count ?? 0} members.
            </p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-[#030712] shadow-lg transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background: accent }}
            >
              {joining ? <Spinner size="sm" /> : `Join ${club.name}`}
            </button>
          </div>

        ) : (
          <>
            {/* ── Welcome banner (only in #welcome channel) ────────────── */}
            {activeChannel === 'welcome' && (
              <div className="shrink-0 border-b border-white/[0.06] px-6 py-5" style={{ background: `${accent}08` }}>
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black"
                    style={{ background: `${accent}22`, color: accent }}
                  >
                    {club.name[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Welcome to {club.name}! 🎉</h2>
                    <p className="mt-0.5 text-sm text-white/55">
                      This is the beginning of the <span style={{ color: accent }}>#{activeChannel}</span> channel.
                      Say hello and introduce yourself!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Messages ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-white/25">
                  <FiHash size={32} />
                  <p className="text-sm">No messages yet in #{activeCh?.label} — be the first!</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {messages.map((msg, i) => {
                    const prev    = messages[i - 1]
                    const grouped = prev &&
                      prev.sender?.id === msg.sender?.id &&
                      new Date(msg.created_at) - new Date(prev.created_at) < 5 * 60 * 1000
                    return (
                      <MessageRow
                        key={msg.id}
                        msg={msg}
                        isMe={msg.sender?.id === profile?.id}
                        grouped={grouped}
                        accent={accent}
                      />
                    )
                  })}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Input ────────────────────────────────────────────────── */}
            <form onSubmit={handleSend} className="shrink-0 border-t border-white/[0.07] p-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 focus-within:border-white/20 transition-colors">
                <FiHash size={14} className="shrink-0 text-white/30" />
                <input
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e) }}
                  placeholder={`Message #${activeCh?.label ?? activeChannel}…`}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
                  maxLength={2000}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-30"
                  style={{ background: `${accent}22`, color: accent }}
                >
                  {sending ? <Spinner size="sm" /> : <FiSend size={13} />}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* ── Right members sidebar ─────────────────────────────────────────── */}
      {showMembers && isMember && (
        <aside className="hidden w-48 shrink-0 flex-col border-l border-white/[0.07] bg-[#0a1525] px-3 py-4 lg:flex">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">
            Members — {members.length}
          </p>
          <div className="flex-1 space-y-0.5 overflow-y-auto">
            {members.map(m => {
              const isMe = m.id === profile?.id
              const name = m.full_name ?? m.username ?? '?'
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.04]"
                >
                  <div className="relative">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: isMe ? `${accent}22` : 'rgba(255,255,255,0.08)', color: isMe ? accent : 'rgba(255,255,255,0.6)' }}
                    >
                      {name[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a1525] bg-emerald-400" />
                  </div>
                  <span className="truncate text-xs text-white/65">{isMe ? 'You' : name}</span>
                </div>
              )
            })}
          </div>
        </aside>
      )}
    </div>
  )
}

// ── Message row ─────────────────────────────────────────────────────────────
function MessageRow({ msg, isMe, grouped, accent }) {
  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const name = msg.sender?.full_name ?? msg.sender?.username ?? 'Unknown'

  return (
    <div className={`group flex items-start gap-3 rounded-md px-2 py-0.5 hover:bg-white/[0.03] ${grouped ? 'mt-0' : 'mt-5'}`}>
      {!grouped ? (
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            background: isMe ? `${accent}22` : 'rgba(255,255,255,0.07)',
            color:      isMe ? accent          : 'rgba(255,255,255,0.6)',
          }}
        >
          {name[0].toUpperCase()}
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span className="text-sm font-semibold" style={{ color: isMe ? accent : 'rgba(255,255,255,0.9)' }}>
              {isMe ? 'You' : name}
            </span>
            <span className="text-[10px] text-white/25">{time}</span>
          </div>
        )}
        <p className="break-words text-sm leading-relaxed text-white/80">{msg.message}</p>
      </div>

      {grouped && (
        <span className="invisible shrink-0 self-center text-[10px] text-white/20 group-hover:visible">{time}</span>
      )}
    </div>
  )
}
