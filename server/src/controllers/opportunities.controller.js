import { supabaseAdmin } from '../config/supabase.js';

const OPP_SELECT = `
  id, title, description, type, department, company_name, location, remote,
  skills, stipend, deadline, status, created_by, created_at, updated_at,
  profiles!created_by(id, username, full_name)
`.trim();

// GET /api/opportunities
export async function listOpportunities(req, res) {
  const { q, skills, type, department, status = 'open', sort = 'newest', page = 1, limit = 20 } = req.query;
  const from = (Number(page) - 1) * Number(limit);

  let query = supabaseAdmin
    .from('opportunities')
    .select(OPP_SELECT, { count: 'exact' })
    .range(from, from + Number(limit) - 1);

  if (status !== 'all') query = query.eq('status', status);
  if (type)             query = query.eq('type', type);
  if (department)       query = query.ilike('department', `%${department}%`);
  if (q)                query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (skills)           query = query.overlaps('skills', skills.split(','));

  if (sort === 'newest')   query = query.order('created_at', { ascending: false });
  else if (sort === 'deadline') query = query.order('deadline', { ascending: true, nullsFirst: false });

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ opportunities: data, total: count, page: Number(page), limit: Number(limit) });
}

// GET /api/opportunities/:id
export async function getOpportunity(req, res) {
  const { data, error } = await supabaseAdmin
    .from('opportunities')
    .select(OPP_SELECT)
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Opportunity not found' });
  res.json({ opportunity: data });
}

// POST /api/opportunities
export async function createOpportunity(req, res) {
  const { data, error } = await supabaseAdmin
    .from('opportunities')
    .insert({ ...req.body, created_by: req.profile.id })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ opportunity: data });
}

// PATCH /api/opportunities/:id
export async function updateOpportunity(req, res) {
  // Verify ownership (admin bypasses via authorize middleware)
  const { data: opp } = await supabaseAdmin
    .from('opportunities').select('created_by').eq('id', req.params.id).single();
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  if (opp.created_by !== req.profile.id && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to edit this opportunity' });
  }

  const { data, error } = await supabaseAdmin
    .from('opportunities')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ opportunity: data });
}

// DELETE /api/opportunities/:id
export async function deleteOpportunity(req, res) {
  const { data: opp } = await supabaseAdmin
    .from('opportunities').select('created_by').eq('id', req.params.id).single();
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  if (opp.created_by !== req.profile.id && req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { error } = await supabaseAdmin.from('opportunities').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Opportunity deleted' });
}

// POST /api/opportunities/:id/apply
export async function applyToOpportunity(req, res) {
  const { id } = req.params;

  // Check opportunity exists and is open
  const { data: opp } = await supabaseAdmin
    .from('opportunities').select('id, status').eq('id', id).single();
  if (!opp)               return res.status(404).json({ error: 'Opportunity not found' });
  if (opp.status !== 'open') return res.status(409).json({ error: 'Opportunity is not accepting applications' });

  // Prevent duplicate applications
  const { data: existing } = await supabaseAdmin
    .from('applications')
    .select('id').eq('user_id', req.profile.id).eq('opportunity_id', id).single();
  if (existing) return res.status(409).json({ error: 'Already applied' });

  const { data, error } = await supabaseAdmin
    .from('applications')
    .insert({
      user_id:        req.profile.id,
      opportunity_id: id,
      cover_letter:   req.body.coverLetter,
      resume_url:     req.body.resumeUrl,
      status:         'pending',
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ application: data });
}
