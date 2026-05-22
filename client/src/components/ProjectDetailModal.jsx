import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApplyModal from './ApplyModal.jsx'
import {
  FiX, FiDollarSign, FiGift, FiClock, FiUsers,
  FiTag, FiExternalLink, FiBriefcase, FiCode,
} from 'react-icons/fi'

export default function ProjectDetailModal({ project: p, onClose }) {
  const [showApply, setShowApply] = useState(false)
  const isPaid = p.type === 'paid'
  const accent = isPaid ? '#34d399' : '#a78bfa'

  return (
    <>
      <AnimatePresence>
        {!showApply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              onClick={e => e.stopPropagation()}
              className="flex w-full max-w-xl flex-col rounded-2xl border border-white/20 bg-[#0d1628] shadow-2xl overflow-hidden"
              style={{ maxHeight: '88vh' }}
            >
              {/* Colour bar */}
              <div className="h-1 w-full" style={{ background: accent }} />

              {/* Header */}
              <div className="flex items-start justify-between gap-4 p-6 pb-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ background: `${accent}18`, color: accent }}
                    >
                      {isPaid ? <FiDollarSign size={11} /> : <FiGift size={11} />}
                      {isPaid
                        ? (p.stipend ? `₹${p.stipend.toLocaleString()}/mo` : 'Paid')
                        : 'Unpaid'}
                    </span>
                    {p.category && (
                      <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-xs text-white/70">
                        {p.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black leading-snug text-white">{p.title}</h2>
                  {p.company_name && (
                    <p className="mt-0.5 text-sm font-semibold" style={{ color: '#4fd1ff' }}>
                      {p.company_name}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">

                {/* Meta row */}
                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  {p.duration && (
                    <span className="flex items-center gap-1.5">
                      <FiClock size={13} className="shrink-0" style={{ color: accent }} />
                      {p.duration}
                    </span>
                  )}
                  {p.team_size > 1 && (
                    <span className="flex items-center gap-1.5">
                      <FiUsers size={13} className="shrink-0" style={{ color: accent }} />
                      {p.team_size} members needed
                    </span>
                  )}
                  {p.status && (
                    <span className="flex items-center gap-1.5">
                      <FiCode size={13} className="shrink-0" style={{ color: accent }} />
                      <span className="capitalize">{p.status}</span>
                    </span>
                  )}
                </div>

                {/* Description */}
                {p.description && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">About</p>
                    <p className="text-sm leading-relaxed text-white/75 whitespace-pre-line">{p.description}</p>
                  </div>
                )}

                {/* Skills */}
                {p.skills?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">Skills Required</p>
                    <div className="flex flex-wrap gap-2">
                      {p.skills.map(s => (
                        <span
                          key={s}
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{ background: `${accent}12`, color: accent }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posted by */}
                {p.creator && (
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/40">Posted by</p>
                    <p className="text-sm text-white">
                      {p.creator.full_name ?? p.creator.username}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex gap-3 border-t border-white/[0.08] p-4">
                {p.application_link && (
                  <a
                    href={p.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-white/30 hover:text-white"
                  >
                    <FiExternalLink size={13} /> External Link
                  </a>
                )}
                <button
                  onClick={() => setShowApply(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-all hover:brightness-110"
                  style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
                >
                  <FiBriefcase size={13} /> Apply Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showApply && (
        <ApplyModal
          target={{ id: p.id, title: p.title, company: p.company_name, type: 'project' }}
          onClose={() => setShowApply(false)}
          onSuccess={onClose}
        />
      )}
    </>
  )
}
