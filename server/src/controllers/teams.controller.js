import { supabaseAdmin } from '../config/supabase.js';

const TEAM_SELECT = `
  id, name, slug, description, category, is_public, status, max_members,
  tags, open_roles, created_by, created_at, updated_at,
  team_members(id, role, joined_at, profiles(id, username, full_name, avatar_url))
`.trim();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function getMemberRole(teamId, userId) {
  const { data } = await supabaseAdmin
    .from('team_members').select('role').eq('team_id', teamId).eq('user_id', userId).single();
  return data?.role ?? null;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

// GET /api/teams
export async function listTeams(req, res) {
  const { q, category, status, sort = 'newest', page = 1, limit = 20 } = req.query;
  const from = (Number(page) - 1) * Number(limit);

  let query = supabaseAdmin
    .from('teams')
    .select(TEAM_SELECT, { count: 'exact' })
    .eq('is_public', true)
    .range(from, from + Number(limit) - 1);

  if (q)        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  if (category) query = query.eq('category', category);
  if (status)   query = query.eq('status', status);

  if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else if (sort === 'name') query = query.order('name', { ascending: true });

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ teams: data, total: count, page: Number(page), limit: Number(limit) });
}

// GET /api/teams/mine
export async function listMyTeams(req, res) {
  const { data: memberships } = await supabaseAdmin
    .from('team_members').select('team_id').eq('user_id', req.profile.id);
  if (!memberships?.length) return res.json({ teams: [] });

  const ids = memberships.map(m => m.team_id);
  const { data, error } = await supabaseAdmin
    .from('teams').select(TEAM_SELECT).in('id', ids).order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ teams: data });
}

// GET /api/teams/:id
export async function getTeam(req, res) {
  const { data, error } = await supabaseAdmin
    .from('teams')
    .select(TEAM_SELECT)
    .or(`id.eq.${req.params.id},slug.eq.${req.params.id}`)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Team not found' });
  res.json({ team: data });
}

// POST /api/teams
export async function createTeam(req, res) {
  const userId = req.profile.id;
  const slug   = slugify(req.body.name);

  // Ensure slug uniqueness
  const { data: existing } = await supabaseAdmin
    .from('teams').select('id').eq('slug', slug).single();
  if (existing) return res.status(409).json({ error: 'A team with that name already exists' });

  const { data: team, error } = await supabaseAdmin
    .from('teams')
    .insert({ ...req.body, slug, created_by: userId })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Creator becomes owner
  await supabaseAdmin.from('team_members').insert({ team_id: team.id, user_id: userId, role: 'owner' });

  res.status(201).json({ team });
}

// PATCH /api/teams/:id
export async function updateTeam(req, res) {
  const role = await getMemberRole(req.params.id, req.profile.id);
  if (!['owner', 'admin'].includes(role) && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Only team owner or admin can edit the team' });
  }

  const { data, error } = await supabaseAdmin
    .from('teams')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: error?.message ?? 'Team not found' });
  res.json({ team: data });
}

// DELETE /api/teams/:id
export async function deleteTeam(req, res) {
  const role = await getMemberRole(req.params.id, req.profile.id);
  if (role !== 'owner' && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Only the team owner can delete the team' });
  }

  const { error } = await supabaseAdmin.from('teams').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Team deleted' });
}

// POST /api/teams/:id/join — add member directly (no join-requests table)
export async function requestToJoin(req, res) {
  const { id } = req.params;
  const userId = req.profile.id;

  const existing = await getMemberRole(id, userId);
  if (existing) return res.status(409).json({ error: 'Already a member of this team' });

  const { data: team } = await supabaseAdmin
    .from('teams').select('max_members').eq('id', id).single();
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const { count: memberCount } = await supabaseAdmin
    .from('team_members').select('id', { count: 'exact', head: true }).eq('team_id', id);
  if (team.max_members && memberCount >= team.max_members) {
    return res.status(409).json({ error: 'Team is full' });
  }

  const { error } = await supabaseAdmin
    .from('team_members')
    .insert({ team_id: id, user_id: userId, role: 'member', joined_at: new Date().toISOString() });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Joined team successfully!' });
}

// GET /api/teams/:id/requests — not implemented (no join_requests table)
export async function listJoinRequests(req, res) {
  res.json({ requests: [] });
}

// PATCH /api/teams/:id/requests/:requestId — not implemented
export async function reviewJoinRequest(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

// POST /api/teams/:id/members  (owner/admin — direct invite by user_id)
export async function inviteMember(req, res) {
  const { id } = req.params;
  const role   = await getMemberRole(id, req.profile.id);
  if (!['owner', 'admin'].includes(role) && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { userId } = req.body;
  const existing = await getMemberRole(id, userId);
  if (existing) return res.status(409).json({ error: 'User is already a member' });

  const { data, error } = await supabaseAdmin
    .from('team_members')
    .insert({ team_id: id, user_id: userId, role: 'member' })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await supabaseAdmin.from('notifications').insert({
    user_id:    userId,
    type:       'team_invite',
    title:      'You were added to a team',
    message:    `${req.profile.full_name} added you to the team.`,
    action_url: `/teams/${id}`,
    is_read:    false,
    pending:    false,
  });

  res.status(201).json({ member: data });
}

// PATCH /api/teams/:id/members/:memberId  (owner only — promote/demote)
export async function updateMemberRole(req, res) {
  const { id, memberId } = req.params;

  const viewerRole = await getMemberRole(id, req.profile.id);
  if (viewerRole !== 'owner' && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Only the team owner can change roles' });
  }

  const { data: target } = await supabaseAdmin
    .from('team_members').select('role').eq('id', memberId).eq('team_id', id).single();
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (target.role === 'owner') return res.status(409).json({ error: 'Cannot change the owner\'s role' });

  const { data, error } = await supabaseAdmin
    .from('team_members')
    .update({ role: req.body.role })
    .eq('id', memberId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ member: data });
}

// DELETE /api/teams/:id/members/:memberId  (owner/admin)
export async function removeMember(req, res) {
  const { id, memberId } = req.params;

  const viewerRole = await getMemberRole(id, req.profile.id);
  if (!['owner', 'admin'].includes(viewerRole) && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { data: target } = await supabaseAdmin
    .from('team_members').select('role, user_id').eq('id', memberId).eq('team_id', id).single();
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (target.role === 'owner') return res.status(409).json({ error: 'Cannot remove the team owner' });

  await supabaseAdmin.from('team_members').delete().eq('id', memberId);
  res.json({ message: 'Member removed' });
}

// DELETE /api/teams/:id/leave
export async function leaveTeam(req, res) {
  const { id } = req.params;
  const role   = await getMemberRole(id, req.profile.id);
  if (!role)          return res.status(404).json({ error: 'You are not a member of this team' });
  if (role === 'owner') return res.status(409).json({ error: 'Transfer ownership before leaving' });

  await supabaseAdmin
    .from('team_members')
    .delete()
    .eq('team_id', id)
    .eq('user_id', req.profile.id);

  res.json({ message: 'Left the team' });
}
