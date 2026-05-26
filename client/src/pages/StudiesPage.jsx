import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { studiesApi } from '../api/studies.js'
import { exchangeApi } from '../api/exchange.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import ChatModal from '../components/ChatModal.jsx'
import BorrowChatModal from '../components/BorrowChatModal.jsx'
import {
  FiBook, FiTool, FiSearch, FiClock,
  FiRotateCcw, FiList, FiAlertCircle, FiRefreshCw,
  FiMessageSquare, FiPlus, FiX, FiCalendar, FiArrowRight, FiPackage,
} from 'react-icons/fi'
import SupportUs from '../components/SupportUs.jsx'

const TABS = [
  { key: 'books',     label: 'Books',     icon: FiBook },
  { key: 'equipment', label: 'Drafters',   icon: FiTool },
  { key: 'exchange',  label: 'Exchange',   icon: FiRefreshCw },
  { key: 'borrows',   label: 'My Borrows', icon: FiList },
  { key: 'my-items',  label: 'My Items',   icon: FiPackage },
]

const SUBJECT_COLORS = {
  'Mathematics':      'bg-blue-400/15 text-blue-300',
  'Computer Science': 'bg-cyan-400/15 text-[#4fd1ff]',
  'Electronics':      'bg-violet-400/15 text-violet-300',
  'Mechanical':       'bg-orange-400/15 text-orange-300',
  'Mechanical Engg':  'bg-orange-400/15 text-orange-300',
  'Civil Engineering':'bg-amber-400/15 text-amber-300',
  'Civil/Mechanical': 'bg-orange-400/15 text-orange-300',
  'Physics':          'bg-emerald-400/15 text-emerald-300',
  'Electrical':       'bg-yellow-400/15 text-yellow-300',
  'Chemistry':        'bg-teal-400/15 text-teal-300',
  default:            'bg-white/10 text-white',
}

const COND_COLORS = {
  new:  'bg-emerald-400/15 text-emerald-300',
  good: 'bg-cyan-400/15 text-[#4fd1ff]',
  fair: 'bg-amber-400/15 text-amber-300',
  poor: 'bg-red-400/15 text-red-300',
}

const STATUS_STYLE = {
  pending:  { cls: 'bg-yellow-400/15 text-yellow-300',   label: 'Pending' },
  approved: { cls: 'bg-emerald-400/15 text-emerald-300', label: 'Approved' },
  returned: { cls: 'bg-white/10 text-white',              label: 'Returned' },
  rejected: { cls: 'bg-red-400/15 text-red-300',          label: 'Rejected' },
}

const SLOT_OPTIONS = [
  { key: 'morning',   label: '9 AM – 12 PM' },
  { key: 'afternoon', label: '12 PM – 3 PM' },
  { key: 'evening',   label: '3 PM – 6 PM' },
  { key: 'night',     label: '6 PM – 9 PM' },
]

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: i * 0.05 },
})

function TableMissing({ name }) {
  return (
    <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 text-amber-400">
      <FiAlertCircle size={36} />
      <p className="text-sm font-medium">Database table not set up yet</p>
      <p className="text-xs">Run the SQL from the setup guide to create the <code className="rounded bg-amber-400/10 px-1">{name}</code> table.</p>
    </div>
  )
}

// ── Books tab ─────────────────────────────────────────────────────────────
function BooksTab() {
  const { profile } = useAuth()
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [missing, setMissing]     = useState(false)
  const [search, setSearch]       = useState('')
  const [borrowing, setBorrowing] = useState(null)
  const [chatTarget, setChatTarget] = useState(null)

  useEffect(() => {
    studiesApi.books()
      .then(d => setItems(d.books ?? []))
      .catch(e => {
        if (e.message?.includes('books') || e.status === 500) setMissing(true)
        else toast.error(e.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(b =>
    !search ||
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.subject?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleBorrow(book) {
    const due = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    setBorrowing(book.id)
    try {
      await studiesApi.borrow({ item_type: 'book', item_id: book.id, due_date: due })
      setItems(prev => prev.map(b => b.id === book.id ? { ...b, available_copies: b.available_copies - 1 } : b))
      toast.success(`"${book.title}" borrowed! Due ${due}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBorrowing(null)
    }
  }

  if (loading) return <div className="flex h-52 items-center justify-center"><Spinner size="lg" /></div>
  if (missing)  return <TableMissing name="books" />

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45" size={15} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, author, or subject…"
          className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:border-[#4fd1ff]/40 focus:outline-none transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center gap-3 text-white">
          <FiBook size={40} />
          <p className="text-sm">{search ? 'No books match your search' : 'No books in library yet'}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book, i) => {
            const subjCls = SUBJECT_COLORS[book.subject] ?? SUBJECT_COLORS.default
            const avail   = book.available_copies > 0
            const isOwner = book.owner?.id === profile?.id
            return (
              <motion.div key={book.id} {...fade(i)}
                className="group flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 backdrop-blur-sm transition-all duration-300 hover:border-[#4fd1ff]/25 hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden"
              >
                {/* Image / placeholder */}
                {book.image_url ? (
                  <div className="h-44 overflow-hidden">
                    <img src={book.image_url} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div
                    className="flex h-36 items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${book.cover_color ?? '#4fd1ff'}25, ${book.cover_color ?? '#4fd1ff'}08)` }}
                  >
                    <FiBook size={36} style={{ color: book.cover_color ?? '#4fd1ff', opacity: 0.5 }} />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  {/* Badges */}
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${subjCls}`}>
                      {book.subject ?? 'General'}
                    </span>
                    {(book.edition || book.year) && (
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white">
                        {[book.edition, book.year].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    {book.price > 0 && (
                      <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                        ₹{book.price} deposit
                      </span>
                    )}
                  </div>

                  <h2 className="font-semibold leading-snug text-white line-clamp-1">{book.title}</h2>
                  <p className="mt-0.5 text-xs font-medium text-[#4fd1ff]">{book.author}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65 line-clamp-2">{book.description}</p>

                  <p className={`mt-3 text-xs font-medium ${avail ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {avail ? `${book.available_copies}/${book.total_copies} available` : 'All borrowed'}
                  </p>

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setChatTarget(book)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-[#4fd1ff]/40 hover:text-[#4fd1ff] ${isOwner ? 'w-full' : 'flex-1'}`}
                    >
                      <FiMessageSquare size={13} /> Chat
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => handleBorrow(book)}
                        disabled={!avail || borrowing === book.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#4fd1ff]/10 py-2.5 text-sm font-medium text-[#4fd1ff] transition-all duration-200 hover:bg-[#4fd1ff]/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {borrowing === book.id ? <Spinner size="sm" /> : <><FiBook size={13} /> Borrow</>}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {chatTarget && (
        <BorrowChatModal item={chatTarget} itemType="book" onClose={() => setChatTarget(null)} />
      )}
    </div>
  )
}

// ── Equipment tab ─────────────────────────────────────────────────────────
function EquipmentTab() {
  const { profile } = useAuth()
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [missing, setMissing]     = useState(false)
  const [search, setSearch]       = useState('')
  const [borrowing, setBorrowing] = useState(null)
  const [chatTarget, setChatTarget] = useState(null)

  useEffect(() => {
    studiesApi.equipment()
      .then(d => setItems(d.equipment ?? []))
      .catch(e => {
        if (e.message?.includes('equipment') || e.status === 500) setMissing(true)
        else toast.error(e.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(e =>
    !search ||
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleBorrow(eq) {
    const due = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    setBorrowing(eq.id)
    try {
      await studiesApi.borrow({ item_type: 'equipment', item_id: eq.id, due_date: due })
      setItems(prev => prev.map(e => e.id === eq.id ? { ...e, available_quantity: e.available_quantity - 1 } : e))
      toast.success(`"${eq.name}" borrowed! Due ${due}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBorrowing(null)
    }
  }

  if (loading) return <div className="flex h-52 items-center justify-center"><Spinner size="lg" /></div>
  if (missing)  return <TableMissing name="equipment" />

  const categories = [...new Set(filtered.map(e => e.category))]

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45" size={15} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search drafters, instruments, calculators…"
          className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:border-violet-400/40 focus:outline-none transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center gap-3 text-white">
          <FiTool size={40} />
          <p className="text-sm">{search ? 'No equipment matches your search' : 'No equipment listed yet'}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/60">{cat}</h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.filter(e => e.category === cat).map((eq, i) => {
                  const avail   = eq.available_quantity > 0
                  const condCls = COND_COLORS[eq.condition] ?? COND_COLORS.good
                  const isOwner = eq.owner?.id === profile?.id
                  return (
                    <motion.div key={eq.id} {...fade(i)}
                      className="group flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 backdrop-blur-sm transition-all duration-300 hover:border-violet-400/25 hover:shadow-lg hover:shadow-violet-500/10 overflow-hidden"
                    >
                      {/* Image / placeholder */}
                      {eq.image_url ? (
                        <div className="h-44 overflow-hidden">
                          <img src={eq.image_url} alt={eq.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      ) : (
                        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-violet-500/10 to-violet-900/5">
                          <FiTool size={36} className="text-violet-400/50" />
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-5">
                        {/* Badges */}
                        <div className="mb-3 flex flex-wrap items-center gap-1.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${condCls}`}>
                            {eq.condition ?? 'good'}
                          </span>
                          {eq.price > 0 && (
                            <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                              ₹{eq.price} deposit
                            </span>
                          )}
                        </div>

                        <h2 className="font-semibold leading-snug text-white">{eq.name}</h2>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65 line-clamp-2">{eq.description}</p>

                        <p className={`mt-3 text-xs font-medium ${avail ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {avail ? `${eq.available_quantity}/${eq.total_quantity} available` : 'None available'}
                        </p>

                        {/* Action buttons */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => setChatTarget(eq)}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-violet-400/40 hover:text-violet-400 ${isOwner ? 'w-full' : 'flex-1'}`}
                          >
                            <FiMessageSquare size={13} /> Chat
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => handleBorrow(eq)}
                              disabled={!avail || borrowing === eq.id}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-500/10 py-2.5 text-sm font-medium text-violet-400 transition-all duration-200 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {borrowing === eq.id ? <Spinner size="sm" /> : <><FiTool size={13} /> Borrow</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {chatTarget && (
        <BorrowChatModal item={chatTarget} itemType="equipment" onClose={() => setChatTarget(null)} />
      )}
    </div>
  )
}

// ── Exchange tab ──────────────────────────────────────────────────────────
function ExchangeTab() {
  const { profile } = useAuth()
  const [listings, setListings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [missing, setMissing]       = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [posting, setPosting]       = useState(false)
  const [chatTarget, setChatTarget] = useState(null)
  const [form, setForm] = useState({ item_type: 'book', title: '', description: '', condition: 'good', available_slots: [] })

  useEffect(() => {
    exchangeApi.list()
      .then(d => setListings(d.listings ?? []))
      .catch(e => {
        if (e.status === 500 || e.message?.includes('exchange')) setMissing(true)
        else toast.error(e.message)
      })
      .finally(() => setLoading(false))
  }, [])

  function toggleSlot(key) {
    setForm(f => ({
      ...f,
      available_slots: f.available_slots.includes(key)
        ? f.available_slots.filter(s => s !== key)
        : [...f.available_slots, key],
    }))
  }

  async function handlePost(e) {
    e.preventDefault()
    setPosting(true)
    try {
      const d = await exchangeApi.create(form)
      setListings(prev => [d.listing, ...prev])
      setShowForm(false)
      setForm({ item_type: 'book', title: '', description: '', condition: 'good', available_slots: [] })
      toast.success('Listing posted!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPosting(false)
    }
  }

  async function handleRemove(id) {
    try {
      await exchangeApi.remove(id)
      setListings(prev => prev.filter(l => l.id !== id))
      toast.success('Listing removed')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <div className="flex h-52 items-center justify-center"><Spinner size="lg" /></div>
  if (missing)  return <TableMissing name="exchange_listings" />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-white/55">
          {listings.length > 0 ? `${listings.length} item${listings.length !== 1 ? 's' : ''} available` : 'No listings yet'}
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-400/25"
        >
          {showForm ? <><FiX size={13} /> Cancel</> : <><FiPlus size={13} /> Post Item</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handlePost}
            className="overflow-hidden rounded-2xl border border-amber-400/20 bg-[#04080f]/90 backdrop-blur-sm p-5"
          >
            <h3 className="mb-4 font-semibold text-white">List an Item for Exchange</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Item type</label>
                  <select
                    value={form.item_type}
                    onChange={e => setForm(f => ({ ...f, item_type: e.target.value }))}
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-amber-400/40 focus:outline-none"
                  >
                    <option value="book">Book</option>
                    <option value="equipment">Drafter / Equipment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Condition</label>
                  <select
                    value={form.condition}
                    onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-amber-400/40 focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              <input
                required
                placeholder="Item name (e.g. Engineering Maths by Grewal)"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/40 focus:outline-none"
              />
              <textarea
                placeholder="Any details — edition, notes, what you want in return…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/40 focus:outline-none"
              />
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/60">
                  <FiCalendar size={11} /> Available pickup slots (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SLOT_OPTIONS.map(s => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => toggleSlot(s.key)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        form.available_slots.includes(s.key)
                          ? 'bg-amber-400/25 text-amber-300'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={posting}
                className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-[#050b15] transition-colors hover:bg-amber-300 disabled:opacity-50"
              >
                {posting ? <Spinner size="sm" /> : 'Post Listing'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {listings.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center gap-3 text-white">
          <FiRefreshCw size={40} />
          <p className="text-sm">No exchange listings yet — be the first!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, i) => {
            const isOwn    = listing.profiles?.id === profile?.id
            const condCls  = COND_COLORS[listing.condition] ?? COND_COLORS.good
            const typeLabel = listing.item_type === 'book' ? 'Book' : listing.item_type === 'equipment' ? 'Equipment' : 'Item'
            return (
              <motion.div key={listing.id} {...fade(i)}
                className="group flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 p-5 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/25 hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-medium text-amber-300">{typeLabel}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${condCls}`}>{listing.condition}</span>
                  </div>
                  {isOwn && (
                    <button onClick={() => handleRemove(listing.id)} className="rounded-lg p-1 text-white/40 transition-colors hover:text-rose-400">
                      <FiX size={13} />
                    </button>
                  )}
                </div>

                <h2 className="font-semibold leading-snug text-white line-clamp-1">{listing.title}</h2>
                {listing.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65 line-clamp-2">{listing.description}</p>
                )}

                {listing.available_slots?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {listing.available_slots.map(s => {
                      const opt = SLOT_OPTIONS.find(o => o.key === s)
                      return (
                        <span key={s} className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
                          {opt?.label ?? s}
                        </span>
                      )
                    })}
                  </div>
                )}

                <p className="mt-3 text-xs text-white/60">
                  {listing.profiles?.full_name ?? listing.profiles?.username ?? 'Anonymous'}
                </p>

                <div className="mt-4">
                  {isOwn ? (
                    <span className="flex w-full items-center justify-center rounded-xl border border-white/20 py-2.5 text-sm text-white/50">
                      Your listing
                    </span>
                  ) : (
                    <button
                      onClick={() => setChatTarget(listing)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#4fd1ff]/10 py-2.5 text-sm font-medium text-[#4fd1ff] transition-all duration-200 hover:bg-[#4fd1ff]/20"
                    >
                      <FiMessageSquare size={13} /> Chat with owner <FiArrowRight size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {chatTarget && (
        <ChatModal listing={chatTarget} onClose={() => setChatTarget(null)} />
      )}
    </div>
  )
}

// ── My Borrows tab ────────────────────────────────────────────────────────
function BorrowsTab() {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [missing, setMissing]     = useState(false)
  const [returning, setReturning] = useState(null)

  useEffect(() => {
    studiesApi.myBorrows()
      .then(d => setItems(d.borrows ?? []))
      .catch(e => {
        if (e.status === 500 || e.message?.includes('borrow')) setMissing(true)
        else toast.error(e.message)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleReturn(id) {
    setReturning(id)
    try {
      await studiesApi.returnItem(id)
      setItems(prev => prev.map(b => b.id === id ? { ...b, status: 'returned' } : b))
      toast.success('Item returned successfully!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setReturning(null)
    }
  }

  if (loading) return <div className="flex h-52 items-center justify-center"><Spinner size="lg" /></div>
  if (missing)  return <TableMissing name="borrow_requests" />

  if (items.length === 0) {
    return (
      <div className="flex h-52 flex-col items-center justify-center gap-3 text-white">
        <FiList size={40} />
        <p className="text-sm">You haven't borrowed anything yet</p>
      </div>
    )
  }

  const active  = items.filter(b => ['pending', 'approved'].includes(b.status))
  const history = items.filter(b => !['pending', 'approved'].includes(b.status))

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/55">Active Borrows</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((b, i) => {
              const s       = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending
              const overdue = b.due_date && new Date(b.due_date) < new Date()
              return (
                <motion.div key={b.id} {...fade(i)}
                  className="flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 p-5 backdrop-blur-sm"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs capitalize text-white">{b.item_type}</span>
                  </div>
                  <p className="font-semibold text-white line-clamp-1">{b.item_name}</p>
                  <p className="mt-0.5 text-sm text-white/60">{b.item_sub}</p>
                  {b.due_date && (
                    <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${overdue ? 'text-rose-400' : 'text-white/60'}`}>
                      {overdue ? <FiAlertCircle size={12} /> : <FiClock size={12} />}
                      {overdue ? 'Overdue — ' : 'Due '}
                      {new Date(b.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                  <button
                    onClick={() => handleReturn(b.id)}
                    disabled={returning === b.id}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/20 py-2.5 text-sm text-white transition-all duration-200 hover:border-emerald-400/30 hover:text-emerald-400 disabled:opacity-50"
                  >
                    {returning === b.id ? <Spinner size="sm" /> : <><FiRotateCcw size={13} /> Return Item</>}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/55">History</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((b, i) => {
              const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.returned
              return (
                <motion.div key={b.id} {...fade(i)}
                  className="flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 p-5 backdrop-blur-sm"
                >
                  <div className="mb-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
                  </div>
                  <p className="font-semibold text-white line-clamp-1">{b.item_name}</p>
                  <p className="mt-0.5 text-sm capitalize text-white/55">{b.item_type}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── My Items tab ──────────────────────────────────────────────────────────
function MyItemsTab() {
  const [books, setBooks]       = useState([])
  const [equip, setEquip]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [chatTarget, setChatTarget] = useState(null)
  const [chatType, setChatType] = useState(null)

  useEffect(() => {
    studiesApi.myItems()
      .then(d => { setBooks(d.books ?? []); setEquip(d.equipment ?? []) })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex h-52 items-center justify-center"><Spinner size="lg" /></div>

  const totalBooks = books.length
  const totalEquip = equip.length

  if (totalBooks === 0 && totalEquip === 0) {
    return (
      <div className="flex h-52 flex-col items-center justify-center gap-3 text-white">
        <FiPackage size={40} />
        <p className="text-sm">You haven't listed any items yet</p>
        <p className="text-xs text-white/50">Add books or drafters so others can borrow them</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {books.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/55">Your Books ({books.length})</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((b, i) => (
              <motion.div key={b.id} {...fade(i)}
                className="flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 p-5 backdrop-blur-sm"
              >
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SUBJECT_COLORS[b.subject] ?? SUBJECT_COLORS.default}`}>
                    {b.subject ?? 'General'}
                  </span>
                  {b.price > 0 && (
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      ₹{b.price} deposit
                    </span>
                  )}
                </div>
                <p className="font-semibold text-white line-clamp-1">{b.title}</p>
                <p className="mt-0.5 text-xs text-[#4fd1ff]">{b.author}</p>
                <p className={`mt-2 text-xs font-medium ${b.available_copies > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {b.available_copies}/{b.total_copies} available
                </p>
                <button
                  onClick={() => { setChatTarget(b); setChatType('book') }}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white transition-all hover:border-[#4fd1ff]/40 hover:text-[#4fd1ff]"
                >
                  <FiMessageSquare size={13} />
                  {b.chat_count > 0 ? `${b.chat_count} ${b.chat_count === 1 ? 'Inquiry' : 'Inquiries'}` : 'No inquiries yet'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {equip.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/55">Your Equipment ({equip.length})</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {equip.map((e, i) => (
              <motion.div key={e.id} {...fade(i)}
                className="flex flex-col rounded-2xl border border-white/20 bg-[#04080f]/90 p-5 backdrop-blur-sm"
              >
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${COND_COLORS[e.condition] ?? COND_COLORS.good}`}>
                    {e.condition ?? 'good'}
                  </span>
                  {e.price > 0 && (
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      ₹{e.price} deposit
                    </span>
                  )}
                </div>
                <p className="font-semibold text-white">{e.name}</p>
                <p className="mt-0.5 text-xs text-violet-400">{e.category}</p>
                <p className={`mt-2 text-xs font-medium ${e.available_quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {e.available_quantity}/{e.total_quantity} available
                </p>
                <button
                  onClick={() => { setChatTarget(e); setChatType('equipment') }}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white transition-all hover:border-violet-400/40 hover:text-violet-400"
                >
                  <FiMessageSquare size={13} />
                  {e.chat_count > 0 ? `${e.chat_count} ${e.chat_count === 1 ? 'Inquiry' : 'Inquiries'}` : 'No inquiries yet'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {chatTarget && chatType && (
        <BorrowChatModal item={chatTarget} itemType={chatType} onClose={() => { setChatTarget(null); setChatType(null) }} />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function StudiesPage() {
  const [tab, setTab] = useState('books')

  return (
    <div className="min-h-screen px-5 pb-28 sm:px-10" style={{ paddingTop: 'calc(4.5rem + 3.5rem)' }}>
      <div className="mx-auto max-w-7xl">

        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4fd1ff]/30 bg-[#4fd1ff]/8 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#4fd1ff]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#4fd1ff]">Library & Resources</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">Studies</h1>
          <p className="mt-4 text-lg text-white/75" style={{ maxWidth: '56ch' }}>Borrow books, drafters, and instruments — chat before borrowing, or exchange with fellow students.</p>
        </div>

        <div className="mb-10 flex flex-wrap gap-1.5 rounded-2xl p-1.5 w-fit" style={{ background: '#1a2744', border: '1px solid rgba(79,209,255,0.3)' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200
                ${tab === key
                  ? 'bg-[#4fd1ff]/15 text-[#4fd1ff] shadow-sm'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div>
          {tab === 'books'     && <BooksTab />}
          {tab === 'equipment' && <EquipmentTab />}
          {tab === 'exchange'  && <ExchangeTab />}
          {tab === 'borrows'   && <BorrowsTab />}
          {tab === 'my-items'  && <MyItemsTab />}
        </div>

      </div>
      <SupportUs />
    </div>
  )
}
