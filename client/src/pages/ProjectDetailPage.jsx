import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { projectsApi } from '../api/projects.js'
import { applicationsApi } from '../api/applications.js'
import { uploadsApi } from '../api/uploads.js'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import {
  FiArrowLeft, FiClock, FiCode, FiDollarSign, FiGift,
  FiCalendar, FiSend, FiBookmark, FiCheckCircle, FiUsers,
  FiUpload, FiX, FiTag, FiTrendingUp,
} from 'react-icons/fi'

const SKILL_COLORS = [
  'bg-purple-400/10 text-purple-400 border-purple-400/20',
  'bg-cyan-400/10 text-[#4fd1ff] border-cyan-400/20',
  'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'bg-pink-400/10 text-pink-400 border-pink-400/20',
  'bg-violet-400/10 text-violet-400 border-violet-400/20',
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied]   = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ coverLetter: '', resumeFile: null })
  const [fileError, setFileError] = useState('')

  useEffect(() => {
    projectsApi.get(id)
      .then(d => setProject(d.project ?? d))
      .catch(() => toast.error('Project not found'))
      .finally(() => setLoading(false))
  }, [id])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) { setForm(f => ({ ...f, resumeFile: null })); return }
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
      await applicationsApi.create({
        projectId:   id,
        coverLetter: form.coverLetter,
        resumeUrl,
      })
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
    return <div className="flex min-h-screen items-center justify-center pt-14"><Spinner size="lg" /></div>
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-14 text-white">
        <FiCode size={48} />
        <p>Project not found</p>
        <Link to="/projects" className="text-sm text-[#4fd1ff] hover:underline">Back to Projects</Link>
      </div>
    )
  }

  const isPaid    = project.type === 'paid'
  const accent    = isPaid ? '#34d399' : '#a78bfa'
  const postedBy  = project.creator?.full_name ?? project.creator?.username ?? 'TEAMUP'

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-8" style={{ paddingTop: 'calc(4.5rem + 2rem)' }}>
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          <FiArrowLeft size={15} />
          Back to Projects
        </motion.button>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ── Left ── */}
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
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}40` }}
                >
                  {isPaid ? <FiDollarSign size={11} /> : <FiGift size={11} />}
                  {isPaid ? 'Paid Project' : 'Unpaid Project'}
                </span>
                {project.category && (
                  <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-medium text-white/70">
                    {project.category}
                  </span>
                )}
                {project.status === 'open' && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Open
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">{project.title}</h1>
              {project.company_name && (
                <p className="mt-1.5 text-base font-medium" style={{ color: accent }}>{project.company_name}</p>
              )}

              {/* Key details row */}
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-white/[0.15] pt-5 text-sm text-white/80">
                {project.duration && (
                  <span className="flex items-center gap-1.5">
                    <FiClock size={13} className="text-white/50" />
                    {project.duration}
                  </span>
                )}
                {project.team_size > 1 && (
                  <span className="flex items-center gap-1.5">
                    <FiUsers size={13} className="text-white/50" />
                    {project.team_size} members needed
                  </span>
                )}
                {isPaid && project.stipend && (
                  <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <FiDollarSign size={13} />
                    ₹{Number(project.stipend).toLocaleString()}/month
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiUsers size={13} className="text-white/50" />
                  Posted by {postedBy}
                </span>
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white">
                <FiTrendingUp size={13} />
                About the Project
              </h2>
              {project.description ? (
                <p className="text-sm leading-7 text-white/80 whitespace-pre-wrap">{project.description}</p>
              ) : (
                <p className="text-sm italic text-white/40">No description provided.</p>
              )}
            </motion.div>

            {/* Skills */}
            {project.skills?.length > 0 && (
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
                  {project.skills.map((s, i) => (
                    <span key={s} className={`rounded-full border px-3 py-1 text-sm font-medium ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Perks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
            >
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Perks</h2>
              <ul className="space-y-2.5">
                {isPaid && project.stipend && (
                  <li className="flex items-center gap-2.5 text-sm text-white/80">
                    <FiCheckCircle size={15} className="shrink-0 text-emerald-400" />
                    Paid project — ₹{Number(project.stipend).toLocaleString()}/month stipend
                  </li>
                )}
                {!isPaid && (
                  <li className="flex items-center gap-2.5 text-sm text-white/80">
                    <FiCheckCircle size={15} className="shrink-0 text-violet-400" />
                    Great portfolio project — real impact work
                  </li>
                )}
                {project.status === 'open' && (
                  <li className="flex items-center gap-2.5 text-sm text-white/80">
                    <FiCheckCircle size={15} className="shrink-0 text-emerald-400" />
                    Actively accepting applications
                  </li>
                )}
                {project.team_size > 1 && (
                  <li className="flex items-center gap-2.5 text-sm text-white/80">
                    <FiCheckCircle size={15} className="shrink-0" style={{ color: accent }} />
                    Collaborative team of {project.team_size} members
                  </li>
                )}
              </ul>
            </motion.div>

          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="sticky top-20 rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-5"
            >
              {/* Stipend / type highlight */}
              <div
                className="mb-4 rounded-xl px-4 py-3"
                style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}
              >
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: accent }}>
                  {isPaid ? 'Monthly Stipend' : 'Project Type'}
                </p>
                <p className="mt-0.5 text-2xl font-bold" style={{ color: accent }}>
                  {isPaid && project.stipend
                    ? `₹${Number(project.stipend).toLocaleString()}`
                    : isPaid ? 'Paid' : 'Unpaid / Volunteer'}
                </p>
              </div>

              {/* Duration */}
              {project.duration && (
                <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
                  <FiCalendar size={13} className="text-white/40" />
                  <span>Duration: <span className="font-medium text-white">{project.duration}</span></span>
                </div>
              )}

              {/* Apply button / form */}
              {applied ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 py-4 text-emerald-400">
                  <FiCheckCircle size={22} />
                  <p className="text-sm font-semibold">Application Submitted!</p>
                  <p className="text-xs text-emerald-400/70">We'll notify you of updates</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-[#030712] shadow-lg transition-all duration-200 hover:brightness-110"
                    style={{
                      background: isPaid
                        ? 'linear-gradient(135deg, #34d399, #10b981)'
                        : 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                      boxShadow: `0 4px 18px ${accent}30`,
                    }}
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
                            <label className="mb-1.5 block text-xs font-medium text-white/70">
                              Cover Letter <span className="text-white/40">(optional)</span>
                            </label>
                            <textarea
                              placeholder="Tell them why you're a great fit..."
                              value={form.coverLetter}
                              onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
                              rows={4}
                              className="w-full resize-none rounded-xl border border-white/20 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#4fd1ff]/40 focus:outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/70">
                              Resume <span className="font-normal text-white/40">· PDF/DOC · max 5 MB</span>
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
                              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/[0.04] px-3.5 py-3 transition-colors hover:border-[#4fd1ff]/40 hover:bg-[#4fd1ff]/5">
                                <FiUpload size={14} className="shrink-0 text-[#4fd1ff]" />
                                <span className="text-sm text-white/45">Click to upload…</span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,application/pdf,application/msword"
                                  onChange={handleFileChange}
                                  className="sr-only"
                                />
                              </label>
                            )}
                            {fileError && <p className="mt-1 text-xs text-rose-400">{fileError}</p>}
                          </div>
                          <button
                            type="submit"
                            disabled={applying}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-[#030712] transition-all duration-200 hover:brightness-110 disabled:opacity-60"
                            style={{
                              background: isPaid
                                ? 'linear-gradient(135deg, #34d399, #10b981)'
                                : 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                            }}
                          >
                            {applying ? <Spinner size="sm" /> : <><FiSend size={13} /> Submit Application</>}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Save for later */}
              <button
                onClick={() => toast.success('Saved!')}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-2.5 text-sm text-white/60 transition-all duration-200 hover:border-white/30 hover:text-white"
              >
                <FiBookmark size={13} />
                Save for Later
              </button>

              {/* Meta table */}
              <div className="mt-5 space-y-2 border-t border-white/[0.15] pt-4 text-xs text-white/50">
                {project.duration && (
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="text-white/80">{project.duration}</span>
                  </div>
                )}
                {project.team_size && (
                  <div className="flex justify-between">
                    <span>Team Size</span>
                    <span className="text-white/80">{project.team_size}</span>
                  </div>
                )}
                {project.category && (
                  <div className="flex justify-between">
                    <span>Category</span>
                    <span className="text-white/80">{project.category}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Posted</span>
                  <span className="text-white/80">
                    {new Date(project.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
