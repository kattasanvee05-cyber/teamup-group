import { supabaseAdmin } from '../config/supabase.js';

const SELECT = `
  id, name, description, category, member_count, contact_email,
  banner_color, is_accepting_members, created_at, updated_at,
  creator:created_by(id, username, full_name)
`.trim();

// GET /api/clubs
export async function listClubs(req, res) {
  const { q, category } = req.query;

  let query = supabaseAdmin
    .from('clubs')
    .select(SELECT)
    .order('created_at', { ascending: false });

  if (q)        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
  if (category) query = query.ilike('category', `%${category}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ clubs: data });
}

// GET /api/clubs/:id
export async function getClub(req, res) {
  const { data, error } = await supabaseAdmin
    .from('clubs').select(SELECT).eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Club not found' });
  res.json({ club: data });
}

// POST /api/clubs
export async function createClub(req, res) {
  const { name, description, category, contactEmail, bannerColor, isAcceptingMembers } = req.body;
  if (!name?.trim() || !category?.trim()) {
    return res.status(400).json({ error: 'name and category are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('clubs')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      category: category.trim(),
      contact_email: contactEmail?.trim() || null,
      banner_color: bannerColor?.trim() || '#4fd1ff',
      is_accepting_members: isAcceptingMembers !== false,
      created_by: req.profile.id,
    })
    .select(SELECT)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ club: data });
}

// PATCH /api/clubs/:id
export async function updateClub(req, res) {
  const { data: existing } = await supabaseAdmin
    .from('clubs').select('created_by').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Club not found' });
  if (existing.created_by !== req.profile.id && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const b = req.body;
  const updates = {};
  if (b.name               !== undefined) updates.name                = b.name.trim();
  if (b.description        !== undefined) updates.description         = b.description?.trim() || null;
  if (b.category           !== undefined) updates.category            = b.category.trim();
  if (b.contactEmail       !== undefined) updates.contact_email       = b.contactEmail?.trim() || null;
  if (b.bannerColor        !== undefined) updates.banner_color        = b.bannerColor;
  if (b.isAcceptingMembers !== undefined) updates.is_accepting_members = b.isAcceptingMembers;
  if (b.memberCount        !== undefined) updates.member_count        = Number(b.memberCount);
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('clubs').update(updates).eq('id', req.params.id).select(SELECT).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ club: data });
}

// DELETE /api/clubs/:id
export async function deleteClub(req, res) {
  const { data: existing } = await supabaseAdmin
    .from('clubs').select('created_by').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Club not found' });
  if (existing.created_by !== req.profile.id && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { error } = await supabaseAdmin.from('clubs').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Club deleted' });
}

// ── Club membership & chat ────────────────────────────────────────────────────

// GET /api/clubs/mine
export async function getMyClubs(req, res) {
  const { data: memberships, error } = await supabaseAdmin
    .from('club_members')
    .select('club_id, joined_at')
    .eq('user_id', req.profile.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!memberships?.length) return res.json({ clubs: [] });

  const clubIds = memberships.map(m => m.club_id);
  const { data: clubs } = await supabaseAdmin
    .from('clubs')
    .select('id, name, category, banner_color, member_count')
    .in('id', clubIds)
    .order('name');
  res.json({ clubs: clubs ?? [] });
}

// POST /api/clubs/:id/join
export async function joinClub(req, res) {
  const clubId = req.params.id;
  const { data: club } = await supabaseAdmin.from('clubs').select('id, member_count').eq('id', clubId).single();
  if (!club) return res.status(404).json({ error: 'Club not found' });

  const { data: existing } = await supabaseAdmin
    .from('club_members').select('user_id').eq('club_id', clubId).eq('user_id', req.profile.id).single();
  if (existing) return res.json({ message: 'Already a member' });

  const { error } = await supabaseAdmin
    .from('club_members').insert({ club_id: clubId, user_id: req.profile.id });
  if (error) return res.status(400).json({ error: error.message });

  await supabaseAdmin.from('clubs').update({ member_count: (club.member_count ?? 0) + 1 }).eq('id', clubId);
  res.status(201).json({ message: 'Joined club' });
}

// DELETE /api/clubs/:id/leave
export async function leaveClub(req, res) {
  const clubId = req.params.id;
  const { error } = await supabaseAdmin
    .from('club_members').delete().eq('club_id', clubId).eq('user_id', req.profile.id);
  if (error) return res.status(400).json({ error: error.message });

  const { data: club } = await supabaseAdmin.from('clubs').select('member_count').eq('id', clubId).single();
  if (club) {
    await supabaseAdmin.from('clubs')
      .update({ member_count: Math.max(0, (club.member_count ?? 1) - 1) }).eq('id', clubId);
  }
  res.json({ message: 'Left club' });
}

// GET /api/clubs/:id/members
export async function getClubMembers(req, res) {
  const { data: memberships, error } = await supabaseAdmin
    .from('club_members').select('user_id, joined_at').eq('club_id', req.params.id).order('joined_at');
  if (error) return res.status(500).json({ error: error.message });
  if (!memberships?.length) return res.json({ members: [] });

  const userIds = memberships.map(m => m.user_id);
  const { data: profiles } = await supabaseAdmin
    .from('profiles').select('id, username, full_name').in('id', userIds);
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));

  res.json({ members: memberships.map(m => ({ ...profileMap[m.user_id], joined_at: m.joined_at })) });
}

// GET /api/clubs/:id/messages
export async function getClubMessages(req, res) {
  const clubId  = req.params.id;
  const channel = req.query.channel || 'general';

  const { data: member } = await supabaseAdmin
    .from('club_members').select('user_id').eq('club_id', clubId).eq('user_id', req.profile.id).single();
  if (!member) return res.status(403).json({ error: 'You are not a member of this club' });

  let query = supabaseAdmin
    .from('club_messages')
    .select('id, message, created_at, sender_id')
    .eq('club_id', clubId)
    .eq('channel', channel)
    .order('created_at', { ascending: true })
    .limit(100);
  if (req.query.since) query = query.gt('created_at', req.query.since);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  if (!data?.length) return res.json({ messages: [] });

  const senderIds = [...new Set(data.map(m => m.sender_id))];
  const { data: profiles } = await supabaseAdmin
    .from('profiles').select('id, username, full_name').in('id', senderIds);
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));

  res.json({ messages: data.map(m => ({ ...m, sender: profileMap[m.sender_id] ?? null })) });
}

// POST /api/clubs/:id/messages
export async function sendClubMessage(req, res) {
  const clubId           = req.params.id;
  const { message, channel = 'general' } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

  const { data: member } = await supabaseAdmin
    .from('club_members').select('user_id').eq('club_id', clubId).eq('user_id', req.profile.id).single();
  if (!member) return res.status(403).json({ error: 'You are not a member of this club' });

  const { data, error } = await supabaseAdmin
    .from('club_messages')
    .insert({ club_id: clubId, sender_id: req.profile.id, message: message.trim(), channel })
    .select('id, message, created_at, sender_id, channel')
    .single();
  if (error) return res.status(400).json({ error: error.message });

  const { data: sender } = await supabaseAdmin
    .from('profiles').select('id, username, full_name').eq('id', req.profile.id).single();
  res.status(201).json({ message: { ...data, sender: sender ?? null } });
}
