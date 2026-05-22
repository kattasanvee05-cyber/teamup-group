import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { opportunitiesApi } from '../api/opportunities.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import { uploadsApi } from '../api/uploads.js'
import {
  FiArrowLeft, FiMapPin, FiClock, FiZap, FiDollarSign,
  FiCalendar, FiSend, FiCheckCircle, FiUsers,
  FiGlobe, FiTrendingUp, FiUpload, FiX,
} from 'react-icons/fi'

const SKILL_COLORS = [
  'bg-purple-400/10 text-purple-400 border-purple-400/20',
  'bg-cyan-400/10 text-[#4fd1ff] border-cyan-400/20',
  'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'bg-pink-400/10 text-pink-400 border-pink-400/20',
  'bg-violet-400/10 text-violet-400 border-violet-400/20',
]

export default function OpportunityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [opp, setOpp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [form, setForm] = useState({ coverLetter: '', resumeFile: null })
  const [fileError, setFileError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    opportunitiesApi.get(id)
      .then(d => setOpp(d.opportunity ?? d))
      .catch(() => toast.error('Opportunity not found'))
      .finally(() => setLoading(false))
  }, [id])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) { setForm(f => ({ ...f, resumeFile: null })); return }
    if (file.type !== 'application/pdf') {
      setFileError('Only PDF files are allowed')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File must be under 5 MB')
      e.target.value = ''
      return
    }
    setFileError('')
    setForm(f => ({ ...f, resumeFile: file }))
  }

  function clearFile() {
    setForm(f => ({ ...f, resumeFile: null }))
    setFileError('')
  }

  async function handleApply(e) {
    e.preventDefault()
    setApplying(true)
    try {
      let resumeUrl = ''
      if (form.resumeFile) {
        const { url } = await uploadsApi.resume(form.resumeFile)
        resumeUrl = url
      }
      await opportunitiesApi.apply(id, { coverLetter: form.coverLetter, resumeUrl })
      setApplied(true)
      setShowForm(false)
      toast.success('Application submitted!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-14">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!opp) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-14 text-white">
        <FiZap size={48} />
        <p>Opportunity not found</p>
        <Link to="/opportunities" className="text-sm text-[#4fd1ff] hover:underline">Back to Opportunities</Link>
      </div>
    )
  }

  const postedBy = opp.profiles?.full_name ?? opp.profiles?.username ?? 'TEAMUP'

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-8" style={{ paddingTop: 'calc(4.5rem + 2rem)' }}>
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-white transition-colors hover:text-white"
        >
          <FiArrowLeft size={15} />
          Back to Opportunities
        </motion.button>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ── Left: Main content ── */}
          <div className="space-y-5">

            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
            >
              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                {opp.type && (
                  <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-400 capitalize">
                    {opp.type}
                  </span>
                )}
                {opp.remote && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    <FiGlobe size={11} />
                    Remote
                  </span>
                )}
                {opp.department && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white">
                    {opp.department}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">{opp.title}</h1>
              {opp.company_name && (
                <p className="mt-1.5 text-base font-medium text-violet-400">{opp.company_name}</p>
              )}

              {/* Key details row */}
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-white/[0.15] pt-5 text-sm text-white">
                {opp.location && (
                  <span className="flex items-center gap-1.5">
                    <FiMapPin size={13} className="text-white" />
                    {opp.location}
                  </span>
                )}
                {opp.stipend && (
                  <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <FiDollarSign size={13} />
                    ₹{opp.stipend}
                  </span>
                )}
                {opp.deadline && (
                  <span className="flex items-center gap-1.5">
                    <FiCalendar size={13} className="text-white" />
                    Apply by {new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiUsers size={13} className="text-white" />
                  Posted by {postedBy}
                </span>
              </div>
            </motion.div>

            {/* About / Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white">
                <FiTrendingUp size={13} />
                About this Opportunity
              </h2>
              {opp.description ? (
                <div className="prose-sm max-w-none text-sm leading-7 text-white whitespace-pre-wrap">
                  {opp.description}
                </div>
              ) : (
                <p className="text-sm text-white italic">No description provided.</p>
              )}
            </motion.div>

            {/* Skills */}
            {opp.skills?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.14 }}
                className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
              >
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.map((s, i) => (
                    <span
                      key={s}
                      className={`rounded-full border px-3 py-1 text-sm font-medium ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right: Apply sidebar ── */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="sticky top-20 rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-5"
            >
              {/* Stipend highlight */}
              {opp.stipend && (
                <div className="mb-4 rounded-xl bg-emerald-400/5 border border-emerald-400/15 px-4 py-3">
                  <p className="text-xs text-emerald-400 uppercase tracking-widest font-medium">Stipend / Pay</p>
                  <p className="mt-0.5 text-2xl font-bold text-emerald-400">₹{opp.stipend}</p>
                </div>
              )}

              {/* Deadline */}
              {opp.deadline && (
                <div className="mb-4 flex items-center gap-2 text-sm text-white">
                  <FiCalendar size={13} className="text-white" />
                  <span>Apply by <span className="font-medium text-white">
                    {new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span></span>
                </div>
              )}

              {/* Apply button / form */}
              {applied ? (
                <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 py-4 text-emerald-400">
                  <FiCheckCircle size={22} />
                  <p className="text-sm font-semibold">Application Submitted!</p>
                  <p className="text-xs text-emerald-400">We'll notify you of updates</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:brightness-110"
                  >
                    <FiSend size={14} />
                    {showForm ? 'Cancel' : 'Apply Now'}
                  </button>

                  <AnimatePresence>
                    {showForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        onSubmit={handleApply}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-white">
                              Cover Letter <span className="text-white">(optional)</span>
                            </label>
                            <textarea
                              placeholder="Tell them why you're a great fit..."
                              value={form.coverLetter}
                              onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
                              rows={4}
                              className="w-full resize-none rounded-xl border border-white/20 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-white">
                              Resume <span className="font-normal text-white/50">· PDF only · max 5 MB</span>
                            </label>
                            {form.resumeFile ? (
                              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-3.5 py-3">
                                <FiUpload size={14} className="shrink-0 text-emerald-400" />
                                <span className="flex-1 truncate text-sm text-emerald-400">{form.resumeFile.name}</span>
                                <button type="button" onClick={clearFile} className="shrink-0 text-white/40 hover:text-rose-400 transition-colors">
                                  <FiX size={14} />
                                </button>
                              </div>
                            ) : (
                              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/[0.04] px-3.5 py-3 transition-colors hover:border-violet-400/40 hover:bg-violet-400/5">
                                <FiUpload size={14} className="shrink-0 text-violet-400" />
                                <span className="text-sm text-white/50">Click to upload PDF…</span>
                                <input type="file" accept="application/pdf" onChange={handleFileChange} className="sr-only" />
                              </label>
                            )}
                            {fileError && <p className="mt-1 text-xs text-rose-400">{fileError}</p>}
                          </div>
                          <button
                            type="submit"
                            disabled={applying}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:brightness-110 disabled:opacity-60"
                          >
                            {applying ? <Spinner size="sm" /> : <><FiSend size={13} /> Submit Application</>}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Meta */}
              <div className="mt-5 space-y-2 border-t border-white/[0.15] pt-4 text-xs text-white">
                {opp.type && (
                  <div className="flex justify-between">
                    <span>Type</span>
                    <span className="text-white capitalize">{opp.type}</span>
                  </div>
                )}
                {opp.location && (
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="text-white">{opp.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Remote</span>
                  <span className="text-white">{opp.remote ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Posted</span>
                  <span className="text-white">
                    {new Date(opp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}
