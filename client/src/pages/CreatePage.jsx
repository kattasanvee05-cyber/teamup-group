import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { opportunitiesApi } from '../api/opportunities.js'
import { internshipsApi } from '../api/internships.js'
import { projectsApi } from '../api/projects.js'
import { studiesApi } from '../api/studies.js'
import { uploadsApi } from '../api/uploads.js'
import {
  FiZap, FiBriefcase, FiCode, FiBook, FiTool,
  FiPlus, FiX, FiArrowLeft, FiImage, FiUploadCloud,
} from 'react-icons/fi'

/* ── Tab config ─────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'opportunity', label: 'Opportunity', icon: FiZap,       color: '#a78bfa', border: 'rgba(167,139,250,0.28)', bg: 'rgba(167,139,250,0.10)' },
  { id: 'internship',  label: 'Internship',  icon: FiBriefcase, color: '#4fd1ff', border: 'rgba(79,209,255,0.28)',  bg: 'rgba(79,209,255,0.10)'  },
  { id: 'project',     label: 'Project',     icon: FiCode,      color: '#34d399', border: 'rgba(52,211,153,0.28)',  bg: 'rgba(52,211,153,0.10)'  },
  { id: 'book',        label: 'Book',        icon: FiBook,      color: '#f472b6', border: 'rgba(244,114,182,0.28)', bg: 'rgba(244,114,182,0.10)' },
  { id: 'equipment',   label: 'Equipment',   icon: FiTool,      color: '#fbbf24', border: 'rgba(251,191,36,0.28)',  bg: 'rgba(251,191,36,0.10)'  },
]

/* ── Reusable field wrappers ─────────────────────────────────────────────── */
function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-white/70">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-white/50">{hint}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, maxLength, type = 'text', min, max, step }) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      min={min}
      max={max}
      step={step}
    />
  )
}

function TextArea({ value, onChange, placeholder, maxLength, rows = 4 }) {
  return (
    <textarea
      className="input resize-y"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={rows}
    />
  )
}

function Select({ value, onChange, options }) {
  return (
    <select className="input" value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full rounded-xl px-4 py-3 transition-colors duration-150"
      style={{
        background: value ? 'rgba(79,209,255,0.07)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${value ? 'rgba(79,209,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <span className="text-sm text-white/70">{label}</span>
      <div
        className="relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0"
        style={{ background: value ? '#4fd1ff' : 'rgba(255,255,255,0.14)' }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: value ? '1.25rem' : '0.125rem' }}
        />
      </div>
    </button>
  )
}

function TagInput({ value, onChange, placeholder, color }) {
  const [text, setText] = useState('')

  function add() {
    const parts = text.split(',').map(s => s.trim()).filter(Boolean)
    if (!parts.length) return
    onChange([...new Set([...value, ...parts])])
    setText('')
  }

  function handleKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
            >
              {tag}
              <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}>
                <FiX size={9} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] transition-colors"
          style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
        >
          <FiPlus size={16} />
        </button>
      </div>
    </div>
  )
}

/* ── Image upload picker ───────────────────────────────────────────────────── */
function ImageUpload({ value, onChange, color }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setUploading(true)
    try {
      const { url } = await uploadsApi.itemImage(file)
      onChange(url)
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
      {value ? (
        <div className="relative">
          <img src={value} alt="Preview" className="h-44 w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <FiX size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors"
          style={{ borderColor: `${color}40`, background: `${color}08` }}
        >
          {uploading
            ? <span className="text-sm" style={{ color }}>Uploading…</span>
            : <>
                <FiUploadCloud size={24} style={{ color, opacity: 0.7 }} />
                <span className="text-sm font-medium" style={{ color }}>Click to upload photo</span>
                <span className="text-xs text-white/40">JPEG, PNG, WEBP · max 5 MB</span>
              </>
          }
        </button>
      )}
    </div>
  )
}

/* ── Convert local date "YYYY-MM-DD" to ISO datetime ──────────────────────── */
function toIso(dateStr) {
  return dateStr ? new Date(dateStr + 'T23:59:59.000Z').toISOString() : undefined
}

/* ── Submit button ─────────────────────────────────────────────────────────── */
function SubmitBtn({ loading, label, color }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl py-4 text-sm font-bold text-[#060a14] transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
    >
      {loading ? 'Creating…' : label}
    </button>
  )
}

/* ═══════════════════════ OPPORTUNITY FORM ══════════════════════════════════ */
function OpportunityForm({ onSuccess }) {
  const [f, setF] = useState({
    title: '', description: '', type: 'full-time', companyName: '',
    department: '', location: '', remote: false, skills: [],
    stipend: '', deadline: '', status: 'open',
  })
  const [busy, setBusy] = useState(false)
  const s = (k, v) => setF(p => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!f.title.trim()) return toast.error('Title is required')
    if (f.description.trim().length < 10) return toast.error('Description must be at least 10 characters')
    setBusy(true)
    try {
      const body = {
        title: f.title.trim(), description: f.description.trim(),
        type: f.type, status: f.status, remote: f.remote, skills: f.skills,
        ...(f.companyName.trim()  && { companyName:  f.companyName.trim()  }),
        ...(f.department.trim()   && { department:   f.department.trim()   }),
        ...(f.location.trim()     && { location:     f.location.trim()     }),
        ...(f.stipend             && { stipend:       parseInt(f.stipend, 10) }),
        ...(f.deadline            && { deadline:      toIso(f.deadline)    }),
      }
      const data = await opportunitiesApi.create(body)
      toast.success('Opportunity created!')
      onSuccess('/opportunities/' + data.opportunity.id)
    } catch (err) {
      toast.error(err.message || 'Failed to create opportunity')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title" required>
            <TextInput value={f.title} onChange={v => s('title', v)} placeholder="e.g. Frontend Developer Intern" maxLength={120} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Description" required hint="Describe the role, responsibilities, and requirements">
            <TextArea value={f.description} onChange={v => s('description', v)} placeholder="What will the person be doing? What skills do they need?..." maxLength={5000} rows={5} />
          </Field>
        </div>

        <Field label="Type" required>
          <Select value={f.type} onChange={v => s('type', v)} options={[
            { value: 'full-time',  label: 'Full-time'  },
            { value: 'part-time',  label: 'Part-time'  },
            { value: 'contract',   label: 'Contract'   },
            { value: 'volunteer',  label: 'Volunteer'  },
            { value: 'internship', label: 'Internship' },
          ]} />
        </Field>

        <Field label="Status">
          <Select value={f.status} onChange={v => s('status', v)} options={[
            { value: 'open',   label: 'Open — visible to all' },
            { value: 'draft',  label: 'Draft — not yet visible' },
            { value: 'closed', label: 'Closed'                  },
          ]} />
        </Field>

        <Field label="Company / Organization">
          <TextInput value={f.companyName} onChange={v => s('companyName', v)} placeholder="e.g. Google, JNTUH Lab" maxLength={120} />
        </Field>

        <Field label="Department">
          <TextInput value={f.department} onChange={v => s('department', v)} placeholder="e.g. Computer Science" maxLength={80} />
        </Field>

        <Field label="Location">
          <TextInput value={f.location} onChange={v => s('location', v)} placeholder="e.g. Hyderabad, Remote" maxLength={120} />
        </Field>

        <Field label="Stipend (₹ / month)">
          <TextInput value={f.stipend} onChange={v => s('stipend', v)} type="number" placeholder="e.g. 15000" min="0" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Application Deadline">
            <TextInput value={f.deadline} onChange={v => s('deadline', v)} type="date" />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Skills Required" hint="Press Enter or add comma-separated values, then press +">
            <TagInput value={f.skills} onChange={v => s('skills', v)} placeholder="e.g. React, Python, Figma" color="#a78bfa" />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Toggle value={f.remote} onChange={v => s('remote', v)} label="Remote / Work from home" />
        </div>
      </div>

      <SubmitBtn loading={busy} label="Create Opportunity" color="#a78bfa" />
    </form>
  )
}

/* ═══════════════════════ INTERNSHIP FORM ════════════════════════════════════ */
function InternshipForm({ onSuccess }) {
  const [f, setF] = useState({
    title: '', description: '', companyName: '', durationMonths: '',
    department: '', location: '', mode: 'hybrid',
    stipendMonthly: '', skills: [], ppoAvailable: false,
    activelyHiring: true, deadline: '', status: 'open',
  })
  const [busy, setBusy] = useState(false)
  const s = (k, v) => setF(p => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!f.title.trim()) return toast.error('Title is required')
    if (f.description.trim().length < 10) return toast.error('Description must be at least 10 characters')
    if (!f.companyName.trim()) return toast.error('Company name is required')
    if (!f.durationMonths) return toast.error('Duration is required')
    setBusy(true)
    try {
      const body = {
        title: f.title.trim(), description: f.description.trim(),
        companyName: f.companyName.trim(),
        durationMonths: parseInt(f.durationMonths, 10),
        mode: f.mode, status: f.status,
        ppoAvailable: f.ppoAvailable, activelyHiring: f.activelyHiring,
        skills: f.skills,
        ...(f.department.trim()    && { department:    f.department.trim()    }),
        ...(f.location.trim()      && { location:      f.location.trim()      }),
        ...(f.stipendMonthly       && { stipendMonthly: parseInt(f.stipendMonthly, 10) }),
        ...(f.deadline             && { deadline:       toIso(f.deadline)     }),
      }
      const data = await internshipsApi.create(body)
      toast.success('Internship created!')
      onSuccess('/internships/' + data.internship.id)
    } catch (err) {
      toast.error(err.message || 'Failed to create internship')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title" required>
            <TextInput value={f.title} onChange={v => s('title', v)} placeholder="e.g. Machine Learning Intern" maxLength={120} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Description" required hint="Role overview, day-to-day tasks, learning outcomes">
            <TextArea value={f.description} onChange={v => s('description', v)} placeholder="What will the intern work on? What will they learn?..." maxLength={5000} rows={5} />
          </Field>
        </div>

        <Field label="Company Name" required>
          <TextInput value={f.companyName} onChange={v => s('companyName', v)} placeholder="e.g. Infosys, DRDO" maxLength={120} />
        </Field>

        <Field label="Duration (months)" required>
          <TextInput value={f.durationMonths} onChange={v => s('durationMonths', v)} type="number" placeholder="e.g. 3" min="1" max="24" />
        </Field>

        <Field label="Department">
          <TextInput value={f.department} onChange={v => s('department', v)} placeholder="e.g. Data Science" maxLength={80} />
        </Field>

        <Field label="Location">
          <TextInput value={f.location} onChange={v => s('location', v)} placeholder="e.g. Bangalore, Remote" maxLength={120} />
        </Field>

        <Field label="Mode">
          <Select value={f.mode} onChange={v => s('mode', v)} options={[
            { value: 'remote',  label: 'Remote'  },
            { value: 'hybrid',  label: 'Hybrid'  },
            { value: 'on-site', label: 'On-site' },
          ]} />
        </Field>

        <Field label="Monthly Stipend (₹)">
          <TextInput value={f.stipendMonthly} onChange={v => s('stipendMonthly', v)} type="number" placeholder="e.g. 20000" min="0" />
        </Field>

        <Field label="Status">
          <Select value={f.status} onChange={v => s('status', v)} options={[
            { value: 'open',   label: 'Open — accepting applications' },
            { value: 'closed', label: 'Closed'                        },
          ]} />
        </Field>

        <Field label="Application Deadline">
          <TextInput value={f.deadline} onChange={v => s('deadline', v)} type="date" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Skills Required" hint="Press Enter or add comma-separated values, then press +">
            <TagInput value={f.skills} onChange={v => s('skills', v)} placeholder="e.g. Python, TensorFlow, SQL" color="#4fd1ff" />
          </Field>
        </div>

        <Toggle value={f.ppoAvailable}   onChange={v => s('ppoAvailable', v)}   label="PPO (Pre-Placement Offer) available" />
        <Toggle value={f.activelyHiring} onChange={v => s('activelyHiring', v)} label="Actively hiring right now" />
      </div>

      <SubmitBtn loading={busy} label="Create Internship" color="#4fd1ff" />
    </form>
  )
}

/* ═══════════════════════ PROJECT FORM ═══════════════════════════════════════ */
function ProjectForm({ onSuccess }) {
  const [f, setF] = useState({
    title: '', description: '', type: 'paid', category: '',
    skills: [], stipend: '', duration: '', teamSize: '1',
    companyName: '', applicationLink: '',
  })
  const [busy, setBusy] = useState(false)
  const s = (k, v) => setF(p => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!f.title.trim()) return toast.error('Project title is required')
    setBusy(true)
    try {
      const body = {
        title: f.title.trim(),
        type: f.type,
        ...(f.description.trim()    && { description:      f.description.trim()         }),
        ...(f.category.trim()       && { category:         f.category.trim()            }),
        ...(f.skills.length         && { skills:           f.skills                     }),
        ...(f.stipend               && { stipend:          parseFloat(f.stipend)        }),
        ...(f.duration.trim()       && { duration:         f.duration.trim()            }),
        ...(f.teamSize              && { teamSize:         parseInt(f.teamSize, 10)     }),
        ...(f.companyName.trim()    && { companyName:      f.companyName.trim()         }),
        ...(f.applicationLink.trim()&& { applicationLink: f.applicationLink.trim()     }),
      }
      await projectsApi.create(body)
      toast.success('Project posted!')
      onSuccess('/projects')
    } catch (err) {
      toast.error(err.message || 'Failed to create project')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Project Title" required>
            <TextInput value={f.title} onChange={v => s('title', v)} placeholder="e.g. React Dashboard, ML Model for NLP" maxLength={120} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Description" hint="What will collaborators work on?">
            <TextArea value={f.description} onChange={v => s('description', v)} placeholder="Describe the project, responsibilities, what you'll build..." maxLength={2000} rows={4} />
          </Field>
        </div>

        <Field label="Type" required>
          <Select value={f.type} onChange={v => s('type', v)} options={[
            { value: 'paid',   label: 'Paid — offers a stipend'           },
            { value: 'unpaid', label: 'Unpaid — portfolio / open source'  },
          ]} />
        </Field>

        <Field label="Category">
          <TextInput value={f.category} onChange={v => s('category', v)} placeholder="e.g. Web Development, AI/ML, Research" maxLength={60} />
        </Field>

        <Field label="Company / Organisation">
          <TextInput value={f.companyName} onChange={v => s('companyName', v)} placeholder="e.g. TechStartup Pvt. Ltd." maxLength={120} />
        </Field>

        <Field label="Duration">
          <TextInput value={f.duration} onChange={v => s('duration', v)} placeholder="e.g. 2 months, 6 weeks" maxLength={40} />
        </Field>

        {f.type === 'paid' && (
          <Field label="Monthly Stipend (₹)">
            <TextInput value={f.stipend} onChange={v => s('stipend', v)} type="number" placeholder="e.g. 15000" min="0" />
          </Field>
        )}

        <Field label="Team Size">
          <TextInput value={f.teamSize} onChange={v => s('teamSize', v)} type="number" placeholder="1" min="1" max="20" />
        </Field>

        <Field label="Application / Details Link">
          <TextInput value={f.applicationLink} onChange={v => s('applicationLink', v)} placeholder="https://forms.google.com/..." maxLength={300} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Skills Required" hint="Press Enter or + to add">
            <TagInput value={f.skills} onChange={v => s('skills', v)} placeholder="e.g. React, Python, Figma" color="#34d399" />
          </Field>
        </div>
      </div>

      <SubmitBtn loading={busy} label="Post Project" color="#34d399" />
    </form>
  )
}

/* ═══════════════════════ BOOK FORM ══════════════════════════════════════════ */
function BookForm({ onSuccess }) {
  const [f, setF] = useState({
    title: '', author: '', subject: '', description: '',
    edition: '', year: '', totalCopies: '1', price: '', coverColor: '#1e3a5f', imageUrl: '',
  })
  const [busy, setBusy] = useState(false)
  const s = (k, v) => setF(p => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!f.title.trim()) return toast.error('Title is required')
    if (!f.author.trim()) return toast.error('Author is required')
    if (!f.subject.trim()) return toast.error('Subject is required')
    if (!f.totalCopies || parseInt(f.totalCopies, 10) < 1) return toast.error('At least 1 copy is required')
    setBusy(true)
    try {
      const body = {
        title: f.title.trim(), author: f.author.trim(), subject: f.subject.trim(),
        totalCopies: parseInt(f.totalCopies, 10),
        ...(f.description.trim() && { description: f.description.trim() }),
        ...(f.edition.trim()     && { edition:      f.edition.trim()     }),
        ...(f.year               && { year:         parseInt(f.year, 10) }),
        ...(f.price              && { price:        parseFloat(f.price)  }),
        ...(f.coverColor         && { coverColor:   f.coverColor         }),
        ...(f.imageUrl           && { imageUrl:     f.imageUrl           }),
      }
      const data = await studiesApi.createBook(body)
      toast.success('Book added to library!')
      onSuccess('/studies')
    } catch (err) {
      toast.error(err.message || 'Failed to add book')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Book Title" required>
          <TextInput value={f.title} onChange={v => s('title', v)} placeholder="e.g. Engineering Mathematics Vol.1" maxLength={200} />
        </Field>

        <Field label="Author" required>
          <TextInput value={f.author} onChange={v => s('author', v)} placeholder="e.g. B.S. Grewal" maxLength={120} />
        </Field>

        <Field label="Subject" required>
          <TextInput value={f.subject} onChange={v => s('subject', v)} placeholder="e.g. Mathematics, Physics, CS" maxLength={80} />
        </Field>

        <Field label="Edition">
          <TextInput value={f.edition} onChange={v => s('edition', v)} placeholder="e.g. 14th Edition" maxLength={40} />
        </Field>

        <Field label="Year Published">
          <TextInput value={f.year} onChange={v => s('year', v)} type="number" placeholder="e.g. 2020" min="1900" max={new Date().getFullYear()} />
        </Field>

        <Field label="Total Copies Available" required>
          <TextInput value={f.totalCopies} onChange={v => s('totalCopies', v)} type="number" placeholder="1" min="1" max="50" />
        </Field>

        <Field label="Borrow Fee (₹)" hint="Leave blank if free">
          <TextInput value={f.price} onChange={v => s('price', v)} type="number" placeholder="e.g. 50" min="0" step="0.01" />
        </Field>

        <Field label="Cover Color" hint="Used to display a colored book spine in the library">
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={f.coverColor}
              onChange={e => s('coverColor', e.target.value)}
              className="h-[46px] w-[46px] cursor-pointer rounded-xl border-0 bg-transparent p-0.5"
              style={{ background: 'rgba(255,255,255,0.038)', border: '1px solid rgba(255,255,255,0.09)' }}
            />
            <TextInput value={f.coverColor} onChange={v => s('coverColor', v)} placeholder="#1e3a5f" maxLength={20} />
          </div>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Description" hint="What is the book about? Course relevance?">
            <TextArea value={f.description} onChange={v => s('description', v)} placeholder="Brief description of the book's content and relevance..." maxLength={1000} rows={3} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Cover Photo" hint="Upload a photo of the book cover (optional)">
            <ImageUpload value={f.imageUrl} onChange={v => s('imageUrl', v)} color="#f472b6" />
          </Field>
        </div>
      </div>

      <SubmitBtn loading={busy} label="Add Book to Library" color="#f472b6" />
    </form>
  )
}

/* ═══════════════════════ EQUIPMENT FORM ═════════════════════════════════════ */
function EquipmentForm({ onSuccess }) {
  const [f, setF] = useState({
    name: '', category: '', description: '',
    condition: 'good', totalQuantity: '1', price: '', imageUrl: '',
  })
  const [busy, setBusy] = useState(false)
  const s = (k, v) => setF(p => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!f.name.trim()) return toast.error('Name is required')
    if (!f.category.trim()) return toast.error('Category is required')
    if (!f.totalQuantity || parseInt(f.totalQuantity, 10) < 1) return toast.error('At least 1 unit is required')
    setBusy(true)
    try {
      const body = {
        name: f.name.trim(), category: f.category.trim(),
        condition: f.condition,
        totalQuantity: parseInt(f.totalQuantity, 10),
        ...(f.description.trim() && { description: f.description.trim() }),
        ...(f.price              && { price:        parseFloat(f.price)  }),
        ...(f.imageUrl           && { imageUrl:     f.imageUrl           }),
      }
      const data = await studiesApi.createEquipment(body)
      toast.success('Equipment added!')
      onSuccess('/studies')
    } catch (err) {
      toast.error(err.message || 'Failed to add equipment')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Equipment Name" required>
          <TextInput value={f.name} onChange={v => s('name', v)} placeholder="e.g. Mini Drafter, Compass Set" maxLength={120} />
        </Field>

        <Field label="Category" required hint="Type of instrument or tool">
          <TextInput value={f.category} onChange={v => s('category', v)} placeholder="e.g. Drafter, Compass, Scale Ruler" maxLength={60} />
        </Field>

        <Field label="Condition">
          <Select value={f.condition} onChange={v => s('condition', v)} options={[
            { value: 'excellent', label: 'Excellent — like new'        },
            { value: 'good',      label: 'Good — minor wear'           },
            { value: 'fair',      label: 'Fair — functional but worn'  },
            { value: 'poor',      label: 'Poor — needs attention'      },
          ]} />
        </Field>

        <Field label="Total Quantity" required>
          <TextInput value={f.totalQuantity} onChange={v => s('totalQuantity', v)} type="number" placeholder="1" min="1" max="100" />
        </Field>

        <Field label="Borrow / Deposit Fee (₹)" hint="Leave blank if free">
          <TextInput value={f.price} onChange={v => s('price', v)} type="number" placeholder="e.g. 100" min="0" step="0.01" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Description" hint="Additional details about the item">
            <TextArea value={f.description} onChange={v => s('description', v)} placeholder="Brand, model, included accessories, usage notes..." maxLength={1000} rows={3} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Item Photo" hint="Upload a photo of the equipment (optional)">
            <ImageUpload value={f.imageUrl} onChange={v => s('imageUrl', v)} color="#fbbf24" />
          </Field>
        </div>
      </div>

      <SubmitBtn loading={busy} label="Add Equipment" color="#fbbf24" />
    </form>
  )
}

/* ═══════════════════════ PAGE ════════════════════════════════════════════════ */
const FORM_MAP = {
  opportunity: OpportunityForm,
  internship:  InternshipForm,
  project:     ProjectForm,
  book:        BookForm,
  equipment:   EquipmentForm,
}

export default function CreatePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('opportunity')

  const activeTab = TABS.find(t => t.id === tab)
  const FormComponent = FORM_MAP[tab]

  return (
    <div
      className="w-full px-5 pb-24 sm:px-8 lg:px-14 xl:px-20 2xl:px-28"
      style={{ paddingTop: 'calc(4.5rem + 4rem)' }}
    >
      <div className="mx-auto max-w-3xl">

        {/* ── Back + Header ─────────────────────────────────────── */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-white/40 hover:text-white/75 transition-colors"
          >
            <FiArrowLeft size={14} />
            Back
          </button>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
            style={{ background: activeTab.bg, border: `1px solid ${activeTab.border}` }}
          >
            <activeTab.icon size={12} style={{ color: activeTab.color }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: activeTab.color }}>
              Create New
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Create a{' '}
            <span style={{ color: activeTab.color }}>
              {activeTab.label}
            </span>
          </h1>
          <p className="mt-3 text-base text-white/45">
            Fill in the details below — you can edit everything later.
          </p>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
                style={{
                  background:  active ? t.bg      : 'rgba(255,255,255,0.035)',
                  border:      active ? `1.5px solid ${t.border}` : '1.5px solid rgba(255,255,255,0.07)',
                  color:       active ? t.color   : 'rgba(255,255,255,0.45)',
                }}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ── Form card ──────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{
            background: '#0a1020',
            border: `1px solid ${activeTab.border}`,
            boxShadow: '0 2px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <FormComponent onSuccess={path => navigate(path)} />
        </div>

      </div>
    </div>
  )
}
