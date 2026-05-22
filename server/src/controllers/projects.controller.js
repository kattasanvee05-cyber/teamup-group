import { supabaseAdmin } from '../config/supabase.js';

const SELECT = `
  id, title, description, type, category, skills, stipend, duration,
  team_size, status, company_name, application_link, created_at, updated_at,
  creator:created_by(id, username, full_name)
`.trim();

// GET /api/projects
export async function listProjects(req, res) {
  const { q, type, category, status = 'open', sort = 'newest', page = 1, limit = 20 } = req.query;
  const from = (Number(page) - 1) * Number(limit);

  let query = supabaseAdmin
    .from('projects')
    .select(SELECT, { count: 'exact' })
    .range(from, from + Number(limit) - 1);

  if (status !== 'all')  query = query.eq('status', status);
  if (type)              query = query.eq('type', type);
  if (category)          query = query.ilike('category', `%${category}%`);
  if (q)                 query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,company_name.ilike.%${q}%`);
  if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else                   query = query.order('title', { ascending: true });

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ projects: data, total: count, page: Number(page), limit: Number(limit) });
}

// GET /api/projects/:id
export async function getProject(req, res) {
  const { data, error } = await supabaseAdmin
    .from('projects').select(SELECT).eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Project not found' });
  res.json({ project: data });
}

// POST /api/projects
export async function createProject(req, res) {
  const { title, description, type, category, skills, stipend, duration, teamSize, companyName, applicationLink } = req.body;
  if (!title?.trim() || !type || !['paid', 'unpaid'].includes(type)) {
    return res.status(400).json({ error: 'title and type (paid/unpaid) are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      type,
      category: category?.trim() || null,
      skills: Array.isArray(skills) ? skills : [],
      stipend: stipend ? Number(stipend) : null,
      duration: duration?.trim() || null,
      team_size: teamSize ? Number(teamSize) : 1,
      company_name: companyName?.trim() || null,
      application_link: applicationLink?.trim() || null,
      created_by: req.profile.id,
    })
    .select(SELECT)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ project: data });
}

// PATCH /api/projects/:id
export async function updateProject(req, res) {
  const { data: existing } = await supabaseAdmin
    .from('projects').select('created_by').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Project not found' });
  if (existing.created_by !== req.profile.id && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const b = req.body;
  const updates = {};
  if (b.title       !== undefined) updates.title            = b.title.trim();
  if (b.description !== undefined) updates.description      = b.description?.trim() || null;
  if (b.type        !== undefined) updates.type             = b.type;
  if (b.category    !== undefined) updates.category         = b.category?.trim() || null;
  if (b.skills      !== undefined) updates.skills           = Array.isArray(b.skills) ? b.skills : [];
  if (b.stipend     !== undefined) updates.stipend          = b.stipend ? Number(b.stipend) : null;
  if (b.duration    !== undefined) updates.duration         = b.duration?.trim() || null;
  if (b.teamSize    !== undefined) updates.team_size        = Number(b.teamSize);
  if (b.companyName !== undefined) updates.company_name     = b.companyName?.trim() || null;
  if (b.applicationLink !== undefined) updates.application_link = b.applicationLink?.trim() || null;
  if (b.status      !== undefined) updates.status           = b.status;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('projects').update(updates).eq('id', req.params.id).select(SELECT).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ project: data });
}

// DELETE /api/projects/:id
export async function deleteProject(req, res) {
  const { data: existing } = await supabaseAdmin
    .from('projects').select('created_by').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Project not found' });
  if (existing.created_by !== req.profile.id && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { error } = await supabaseAdmin.from('projects').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Project deleted' });
}
