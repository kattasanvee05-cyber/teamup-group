import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBook, FiGlobe,
  FiGithub, FiEdit2, FiSave, FiX, FiTag, FiStar,
  FiCalendar, FiAward, FiShield,
} from 'react-icons/fi'

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Alumni']
const ROLE_BADGE = {
  student: { cls: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30', label: 'Student' },
  teacher: { cls: 'bg-violet-400/15 text-violet-300 border-violet-400/30', label: 'Teacher' },
  admin:   { cls: 'bg-amber-400/15 text-amber-300 border-amber-400/30', label: 'Admin' },
}

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')

  function add() {
    const v = input.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setInput('')
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-[#4fd1ff]/10 px-3 py-1 text-xs font-medium text-[#4fd1ff]">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="hover:text-white">
              <FiX size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-white/15 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#4fd1ff]/50 focus:outline-none"
        />
        <button type="button" onClick={add} className="rounded-xl bg-[#4fd1ff]/15 px-3.5 py-2.5 text-xs font-semibold text-[#4fd1ff] hover:bg-[#4fd1ff]/25">Add</button>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07]">
        <Icon size={14} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white mb-0.5">{label}</p>
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map(v => (
              <span key={v} className="rounded-full bg-[#4fd1ff]/10 px-2.5 py-0.5 text-xs text-white">{v}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-white break-all">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)

  function startEdit() {
    setForm({
      fullName:     profile?.full_name    ?? '',
      username:     profile?.username     ?? '',
      phone:        profile?.phone        ?? '',
      college:      profile?.college      ?? '',
      collegeEmail: profile?.college_email ?? '',
      yearOfStudy:  profile?.year_of_study ?? '',
      department:   profile?.department   ?? '',
      bio:          profile?.bio          ?? '',
      location:     profile?.location     ?? '',
      website:      profile?.website      ?? '',
      githubUrl:    profile?.github_url   ?? '',
      skills:       profile?.skills       ?? [],
      interests:    profile?.interests    ?? [],
    })
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setForm(null)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile saved!')
      setEditing(false)
      setForm(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setArr = k => v => setForm(f => ({ ...f, [k]: v }))

  const initials = (profile?.full_name ?? profile?.username ?? 'U')[0].toUpperCase()
  const roleBadge = ROLE_BADGE[profile?.role] ?? ROLE_BADGE.student

  const inputCls = "w-full rounded-xl border border-white/15 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#4fd1ff]/50 focus:outline-none transition-colors"

  return (
    <div className="min-h-screen px-4 pb-20 pt-[4.5rem]">
      <div className="mx-auto max-w-3xl">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ── Header ── */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#4fd1ff]">Account</p>
              <h1 className="text-3xl font-black text-white">My Profile</h1>
            </div>
            {!editing && (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={startEdit}
                className="flex items-center gap-2 rounded-xl bg-[#4fd1ff]/15 px-4 py-2.5 text-sm font-semibold text-[#4fd1ff] hover:bg-[#4fd1ff]/25 transition-colors"
              >
                <FiEdit2 size={14} /> Edit Profile
              </motion.button>
            )}
          </div>

          {/* ── Avatar + name card ── */}
          <div className="mb-5 rounded-2xl border border-white/20 bg-[#04080f]/90 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4fd1ff]/30 to-violet-500/30 text-3xl font-black text-[#4fd1ff]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black text-white">{profile?.full_name ?? profile?.username ?? 'No name set'}</h2>
                <p className="text-sm text-white">@{profile?.username}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${roleBadge.cls}`}>
                    {roleBadge.label}
                  </span>
                  {profile?.department && (
                    <span className="rounded-full bg-white/[0.08] px-3 py-0.5 text-xs text-white">{profile.department}</span>
                  )}
                  {profile?.year_of_study && (
                    <span className="rounded-full bg-white/[0.08] px-3 py-0.5 text-xs text-white">{profile.year_of_study}</span>
                  )}
                </div>
              </div>
            </div>
            {profile?.bio && (
              <p className="mt-4 text-sm leading-relaxed text-white border-t border-white/[0.07] pt-4">{profile.bio}</p>
            )}
          </div>

          {/* ── View mode ── */}
          {!editing && (
            <div className="rounded-2xl border border-white/20 bg-[#04080f]/90 p-6 backdrop-blur-sm">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={FiMail}    label="Email"           value={profile?.email} />
                <Field icon={FiPhone}   label="Phone"           value={profile?.phone} />
                <Field icon={FiAward}   label="College"         value={profile?.college} />
                <Field icon={FiMail}    label="College Email"   value={profile?.college_email} />
                <Field icon={FiCalendar} label="Year of Study"  value={profile?.year_of_study} />
                <Field icon={FiBook}    label="Department"      value={profile?.department} />
                <Field icon={FiMapPin}  label="Location"        value={profile?.location} />
                <Field icon={FiGlobe}   label="Website"         value={profile?.website} />
                <Field icon={FiGithub}  label="GitHub"          value={profile?.github_url} />
              </div>
              {(profile?.skills?.length > 0 || profile?.interests?.length > 0) && (
                <div className="mt-5 grid gap-4 border-t border-white/[0.07] pt-5 sm:grid-cols-2">
                  <Field icon={FiTag}  label="Skills"    value={profile?.skills} />
                  <Field icon={FiStar} label="Interests" value={profile?.interests} />
                </div>
              )}
              {!profile?.phone && !profile?.college && !profile?.bio && (
                <div className="py-6 text-center">
                  <p className="text-sm text-white">No details added yet.</p>
                  <button onClick={startEdit} className="mt-2 text-sm font-semibold text-[#4fd1ff] hover:underline">
                    Complete your profile →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Edit mode ── */}
          {editing && form && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSave}
              className="space-y-5 rounded-2xl border border-[#4fd1ff]/20 bg-[#04080f]/92 p-6 backdrop-blur-sm"
            >
              <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Edit Details</h3>

              {/* Basic */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">Full Name</label>
                  <input value={form.fullName} onChange={set('fullName')} placeholder="Your full name" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">Username</label>
                  <input value={form.username} onChange={set('username')} placeholder="username" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white">Bio</label>
                <textarea value={form.bio} onChange={set('bio')} placeholder="Tell others about yourself…" rows={3} className={`${inputCls} resize-none`} />
              </div>

              {/* Contact */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">Phone Number</label>
                  <input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">Location</label>
                  <input value={form.location} onChange={set('location')} placeholder="City, State" className={inputCls} />
                </div>
              </div>

              {/* College */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">College / University</label>
                  <input value={form.college} onChange={set('college')} placeholder="e.g. IIT Bombay" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">College Email ID</label>
                  <input type="email" value={form.collegeEmail} onChange={set('collegeEmail')} placeholder="you@college.edu" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">Department / Branch</label>
                  <input value={form.department} onChange={set('department')} placeholder="e.g. Computer Science" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">Year of Study</label>
                  <select value={form.yearOfStudy} onChange={set('yearOfStudy')} className={`${inputCls} appearance-none`}>
                    <option value="">Select year</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Online */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">Website</label>
                  <input type="url" value={form.website} onChange={set('website')} placeholder="https://yoursite.com" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white">GitHub URL</label>
                  <input type="url" value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/you" className={inputCls} />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white">Skills <span className="text-white">(press Enter or click Add)</span></label>
                <TagInput value={form.skills} onChange={setArr('skills')} placeholder="e.g. React, Python…" />
              </div>

              {/* Interests */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white">Interests <span className="text-white">(press Enter or click Add)</span></label>
                <TagInput value={form.interests} onChange={setArr('interests')} placeholder="e.g. AI, Robotics, Design…" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 border-t border-white/[0.07] pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4fd1ff] to-violet-500 px-6 py-2.5 text-sm font-bold text-[#030712] shadow-lg shadow-[#4fd1ff]/20 transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? <Spinner size="sm" /> : <><FiSave size={14} /> Save Profile</>}
                </button>
                <button type="button" onClick={cancelEdit} className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors">
                  <FiX size={14} /> Cancel
                </button>
              </div>
            </motion.form>
          )}

        </motion.div>
      </div>
    </div>
  )
}
