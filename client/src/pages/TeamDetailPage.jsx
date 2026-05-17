import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { teamsApi } from '../api/teams.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner.jsx'
import {
  FiArrowLeft, FiUsers, FiTag, FiCheckCircle,
  FiUserPlus, FiLogOut, FiLock, FiGlobe,
  FiCalendar, FiShield, FiStar,
} from 'react-icons/fi'

const ROLE_BADGE = {
  owner:  { cls: 'bg-amber-400/10 text-amber-400 border-amber-400/20',   icon: FiStar,   label: 'Owner' },
  admin:  { cls: 'bg-violet-400/10 text-violet-400 border-violet-400/20', icon: FiShield, label: 'Admin' },
  member: { cls: 'bg-white/5 text-white border-white/20',              icon: null,     label: 'Member' },
}

const TAG_COLORS = [
  'bg-purple-400/10 text-purple-400 border-purple-400/20',
  'bg-cyan-400/10 text-[#4fd1ff] border-cyan-400/20',
  'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'bg-pink-400/10 text-pink-400 border-pink-400/20',
]

function Avatar({ member }) {
  const name = member.profiles?.full_name ?? member.profiles?.username ?? '?'
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4fd1ff]/20 to-violet-400/20 text-sm font-bold text-[#4fd1ff]">
      {name[0].toUpperCase()}
    </div>
  )
}

export default function TeamDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    teamsApi.get(id)
      .then(d => {
        const t = d.team ?? d
        setTeam(t)
        const alreadyMember = t.team_members?.some(m => m.profiles?.id === profile?.id)
        setJoined(alreadyMember)
      })
      .catch(() => toast.error('Team not found'))
      .finally(() => setLoading(false))
  }, [id, profile?.id])

  async function handleJoin() {
    setJoining(true)
    try {
      await teamsApi.join(id, {})
      setJoined(true)
      setTeam(t => ({
        ...t,
        team_members: [
          ...(t.team_members ?? []),
          { id: 'tmp', role: 'member', joined_at: new Date().toISOString(), profiles: { id: profile.id, username: profile.username, full_name: profile.full_name } },
        ],
      }))
      toast.success('You joined the team!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setJoining(false)
    }
  }

  async function handleLeave() {
    if (!window.confirm('Leave this team?')) return
    setLeaving(true)
    try {
      await teamsApi.leave(id)
      setJoined(false)
      setTeam(t => ({
        ...t,
        team_members: t.team_members?.filter(m => m.profiles?.id !== profile?.id),
      }))
      toast.success('You left the team')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLeaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-14">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-14 text-white">
        <FiUsers size={48} />
        <p>Team not found</p>
        <Link to="/teams" className="text-sm text-[#4fd1ff] hover:underline">Back to Teams</Link>
      </div>
    )
  }

  const members = team.team_members ?? []
  const memberCount = members.length
  const isFull = team.max_members && memberCount >= team.max_members
  const myRole = members.find(m => m.profiles?.id === profile?.id)?.role ?? null
  const isOwner = myRole === 'owner'

  return (
    <div className="min-h-screen pt-[4.5rem] pb-20 px-4">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-white transition-colors hover:text-white"
        >
          <FiArrowLeft size={15} />
          Back to Teams
        </motion.button>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* ── Left ── */}
          <div className="space-y-5">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
            >
              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                {team.status && (
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize
                    ${team.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/5 text-white'}`}>
                    ● {team.status}
                  </span>
                )}
                {team.category && (
                  <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-400 capitalize">
                    {team.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-white">
                  {team.is_public ? <FiGlobe size={11} /> : <FiLock size={11} />}
                  {team.is_public ? 'Public' : 'Private'}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">{team.name}</h1>

              {/* Tags */}
              {team.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {team.tags.map((t, i) => (
                    <span key={t} className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta row */}
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.15] pt-5 text-sm text-white">
                <span className="flex items-center gap-1.5">
                  <FiUsers size={13} className="text-white" />
                  {memberCount}{team.max_members ? `/${team.max_members}` : ''} members
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCalendar size={13} className="text-white" />
                  Created {new Date(team.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {isFull && (
                  <span className="font-medium text-rose-400">Team is full</span>
                )}
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.07 }}
              className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
            >
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">About the Team</h2>
              {team.description ? (
                <p className="text-sm leading-7 text-white whitespace-pre-wrap">{team.description}</p>
              ) : (
                <p className="text-sm italic text-white">No description provided.</p>
              )}
            </motion.div>

            {/* Open Roles */}
            {team.open_roles?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.13 }}
                className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
              >
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white">
                  <FiTag size={12} />
                  Open Roles
                </h2>
                <ul className="space-y-2">
                  {team.open_roles.map(role => (
                    <li key={role} className="flex items-center gap-2.5 text-sm text-white">
                      <FiCheckCircle size={14} className="shrink-0 text-emerald-400" />
                      {role}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white">
                <FiUsers size={12} />
                Members · {memberCount}
              </h2>
              {members.length === 0 ? (
                <p className="text-sm italic text-white">No members yet.</p>
              ) : (
                <ul className="space-y-3">
                  {members.map(m => {
                    const rb = ROLE_BADGE[m.role] ?? ROLE_BADGE.member
                    const RoleIcon = rb.icon
                    const displayName = m.profiles?.full_name ?? m.profiles?.username ?? 'Unknown'
                    return (
                      <li key={m.id} className="flex items-center gap-3">
                        <Avatar member={m} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{displayName}</p>
                          {m.profiles?.username && m.profiles?.full_name && (
                            <p className="text-xs text-white">@{m.profiles.username}</p>
                          )}
                        </div>
                        <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${rb.cls}`}>
                          {RoleIcon && <RoleIcon size={10} />}
                          {rb.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </motion.div>

          </div>

          {/* ── Right: sidebar ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="sticky top-20 rounded-2xl border border-white/[0.18] bg-[#04080f]/90 backdrop-blur-sm p-5"
            >
              {/* Member count */}
              <div className="mb-4 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Team Size</p>
                <p className="mt-0.5 text-2xl font-bold text-emerald-400">
                  {memberCount}
                  {team.max_members && <span className="text-base font-normal text-emerald-400"> / {team.max_members}</span>}
                </p>
                {isFull && <p className="mt-1 text-xs text-rose-400">No open spots</p>}
              </div>

              {/* Action button */}
              {joined ? (
                <>
                  <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 py-3 text-sm font-semibold text-emerald-400">
                    <FiCheckCircle size={15} />
                    {myRole === 'owner' ? 'You own this team' : `You're a ${myRole}`}
                  </div>
                  {!isOwner && (
                    <button
                      onClick={handleLeave}
                      disabled={leaving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-2.5 text-sm text-rose-400 transition-all duration-200 hover:border-rose-400/20 hover:bg-rose-400/5 hover:text-rose-400 disabled:opacity-50"
                    >
                      {leaving ? <Spinner size="sm" /> : <><FiLogOut size={13} /> Leave Team</>}
                    </button>
                  )}
                </>
              ) : isFull ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm text-white">
                  <FiUsers size={14} />
                  Team is Full
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:brightness-110 disabled:opacity-60"
                >
                  {joining ? <Spinner size="sm" /> : <><FiUserPlus size={14} /> Join Team</>}
                </button>
              )}

              {/* Meta */}
              <div className="mt-5 space-y-2 border-t border-white/[0.15] pt-4 text-xs text-white">
                {team.category && (
                  <div className="flex justify-between">
                    <span>Category</span>
                    <span className="capitalize text-white">{team.category}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Visibility</span>
                  <span className="text-white">{team.is_public ? 'Public' : 'Private'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="capitalize text-white">{team.status ?? 'active'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created</span>
                  <span className="text-white">
                    {new Date(team.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
