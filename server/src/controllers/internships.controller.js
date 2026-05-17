import { supabaseAdmin } from '../config/supabase.js';

const INTERN_SELECT = `
  id, title, description, company_name, department, location, mode,
  duration_months, stipend_monthly, skills, ppo_available, actively_hiring,
  deadline, status, created_by, created_at, updated_at,
  profiles!created_by(id, username, full_name)
`.trim();

// GET /api/internships
export async function listInternships(req, res) {
  const {
    q, skills, department, mode, duration, ppo, active,
    sort = 'newest', page = 1, limit = 20,
  } = req.query;
  const from = (Number(page) - 1) * Number(limit);

  let query = supabaseAdmin
    .from('internships')
    .select(INTERN_SELECT, { count: 'exact' })
    .eq('status', 'open')
    .range(from, from + Number(limit) - 1);

  if (q)          query = query.or(`title.ilike.%${q}%,company_name.ilike.%${q}%,description.ilike.%${q}%`);
  if (department) query = query.ilike('department', `%${department}%`);
  if (mode)       query = query.eq('mode', mode);
  if (duration)   query = query.eq('duration_months', Number(duration));
  if (ppo === 'true')    query = query.eq('ppo_available', true);
  if (active === 'true') query = query.eq('actively_hiring', true);
  if (skills)     query = query.overlaps('skills', skills.split(','));

  if (sort === 'newest')   query = query.order('created_at',      { ascending: false });
  else if (sort === 'stipend')  query = query.order('stipend_monthly', { ascending: false, nullsFirst: false });
  else if (sort === 'deadline') query = query.order('deadline',        { ascending: true,  nullsFirst: false });

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ internships: data, total: count, page: Number(page), limit: Number(limit) });
}

// GET /api/internships/:id
export async function getInternship(req, res) {
  const { data, error } = await supabaseAdmin
    .from('internships')
    .select(INTERN_SELECT)
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Internship not found' });
  res.json({ internship: data });
}

// POST /api/internships  (teacher/admin)
export async function createInternship(req, res) {
  const { data, error } = await supabaseAdmin
    .from('internships')
    .insert({ ...req.body, created_by: req.profile.id })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ internship: data });
}

// PATCH /api/internships/:id  (teacher/admin)
export async function updateInternship(req, res) {
  const { data: intern } = await supabaseAdmin
    .from('internships').select('created_by').eq('id', req.params.id).single();
  if (!intern) return res.status(404).json({ error: 'Internship not found' });
  if (intern.created_by !== req.profile.id && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { data, error } = await supabaseAdmin
    .from('internships')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ internship: data });
}

// DELETE /api/internships/:id  (admin)
export async function deleteInternship(req, res) {
  const { error } = await supabaseAdmin.from('internships').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Internship deleted' });
}

// POST /api/internships/:id/apply
export async function applyToInternship(req, res) {
  const { id } = req.params;

  const { data: intern } = await supabaseAdmin
    .from('internships').select('id, status').eq('id', id).single();
  if (!intern) return res.status(404).json({ error: 'Internship not found' });
  if (intern.status !== 'open') return res.status(409).json({ error: 'Internship is closed' });

  const { data: existing } = await supabaseAdmin
    .from('applications')
    .select('id').eq('user_id', req.profile.id).eq('internship_id', id).single();
  if (existing) return res.status(409).json({ error: 'Already applied' });

  const { data, error } = await supabaseAdmin
    .from('applications')
    .insert({
      user_id:       req.profile.id,
      internship_id: id,
      cover_letter:  req.body.coverLetter,
      resume_url:    req.body.resumeUrl,
      status:        'pending',
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ application: data });
}

// POST /api/internships/:id/bookmark
export async function toggleBookmark(req, res) {
  const { id } = req.params;
  const userId = req.profile.id;

  const { data: existing } = await supabaseAdmin
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('target_id', id)
    .eq('target_type', 'internship')
    .single();

  if (existing) {
    await supabaseAdmin.from('bookmarks').delete().eq('id', existing.id);
    return res.json({ bookmarked: false });
  }

  await supabaseAdmin.from('bookmarks').insert({ user_id: userId, target_id: id, target_type: 'internship' });
  res.json({ bookmarked: true });
}
