import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { applicationsApi } from '../api/applications.js'
import { uploadsApi } from '../api/uploads.js'
import toast from 'react-hot-toast'
import Spinner from './Spinner.jsx'
import { FiX, FiUpload, FiFileText, FiCheckCircle, FiTrash2 } from 'react-icons/fi'

export default function ApplyModal({ target, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile]   = useState(null)
  const [resumeUrl, setResumeUrl]     = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const fileRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5 MB')
      e.target.value = ''
      return
    }
    setUploading(true)
    setResumeFile(file)
    try {
      const { url } = await uploadsApi.resume(file)
      setResumeUrl(url)
      toast.success('Resume uploaded!')
    } catch (err) {
      toast.error(err.message)
      setResumeFile(null)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeResume() {
    setResumeFile(null)
    setResumeUrl(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await applicationsApi.create({
        projectId:    target.type === 'project'     ? target.id : undefined,
        opportunityId: target.type === 'opportunity' ? target.id : undefined,
        internshipId:  target.type === 'internship'  ? target.id : undefined,
        coverLetter:  coverLetter.trim() || undefined,
        resumeUrl:    resumeUrl || undefined,
      })
      toast.success(`Applied to "${target.title}"!`)
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.22 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#0d1628] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4fd1ff]">Apply</p>
              <h2 className="mt-0.5 truncate text-lg font-black text-white">{target.title}</h2>
              {target.company && (
                <p className="text-sm font-medium text-white/50">{target.company}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Cover letter */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Cover Letter / Description
              </label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself, mention relevant skills or experience, and explain why you're a great fit…"
                rows={5}
                maxLength={2000}
                className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#4fd1ff]/40 focus:outline-none transition-colors"
              />
              <p className="mt-1 text-right text-[11px] text-white/30">{coverLetter.length}/2000</p>
            </div>

            {/* Resume upload */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Resume <span className="font-normal text-white/35">(PDF, DOC, DOCX — max 5 MB)</span>
              </label>

              {resumeFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3">
                  <FiCheckCircle size={16} className="shrink-0 text-emerald-400" />
                  <p className="flex-1 truncate text-sm font-medium text-white">{resumeFile.name}</p>
                  <button
                    type="button"
                    onClick={removeResume}
                    className="shrink-0 rounded-lg p-1 text-white/40 transition-colors hover:text-red-400"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] py-4 text-sm font-medium text-white/50 transition-colors hover:border-[#4fd1ff]/40 hover:text-[#4fd1ff] disabled:opacity-50"
                >
                  {uploading ? (
                    <><Spinner size="sm" /> Uploading…</>
                  ) : (
                    <><FiUpload size={15} /> Click to upload resume</>
                  )}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4fd1ff] to-violet-500 py-2.5 text-sm font-bold text-[#030712] transition-all hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? <Spinner size="sm" /> : <><FiFileText size={14} /> Submit Application</>}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
