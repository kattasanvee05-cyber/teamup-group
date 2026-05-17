import { supabaseAdmin } from '../config/supabase.js';

// applications table uses opportunity_id / internship_id (not target_id/target_type)
const APP_SELECT = `
  id, user_id, opportunity_id, internship_id, status, cover_letter, resume_url,
  note, created_at, updated_at
`.trim();

async function enrichApplications(apps) {
  if (!apps?.length) return apps;
  const oppIds = apps.filter(a => a.opportunity_id).map(a => a.opportunity_id);
  const intIds = apps.filter(a => a.internship_id).map(a => a.internship_id);

  const [{ data: opps }, { data: ints }] = await Promise.all([
    oppIds.length ? supabaseAdmin.from('opportunities').select('id, title, company_name').in('id', oppIds) : { data: [] },
    intIds.length ? supabaseAdmin.from('internships').select('id, title, company_name').in('id', intIds)  : { data: [] },
  ]);

  const map = {};
  (opps ?? []).forEach(o => { map[o.id] = { title: o.title, company: o.company_name, type: 'opportunity' }; });
  (ints ?? []).forEach(i => { map[i.id] = { title: i.title, company: i.company_name, type: 'internship' }; });

  return apps.map(a => {
    const ref = map[a.opportunity_id ?? a.internship_id] ?? {};
    return { ...a, target_title: ref.title ?? null, target_company: ref.company ?? null, target_type: ref.type ?? null };
  });
}

// GET /api/applications
export async function listMyApplications(req, res) {
  const { type, status, sort = 'newest', page = 1, limit = 20 } = req.query;
  const from = (Number(page) - 1) * Number(limit);

  let query = supabaseAdmin
    .from('applications')
    .select(APP_SELECT, { count: 'exact' })
    .eq('user_id', req.profile.id)
    .range(from, from + Number(limit) - 1);

  if (status) query = query.eq('status', status);
  if (type === 'opportunity') query = query.not('opportunity_id', 'is', null);
  if (type === 'internship')  query = query.not('internship_id',  'is', null);

  query = sort === 'newest'
    ? query.order('created_at', { ascending: false })
    : query.order('updated_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const enriched = await enrichApplications(data);
  res.json({ applications: enriched, total: count, page: Number(page), limit: Number(limit) });
}

// GET /api/applications/:id
export async function getApplication(req, res) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select(APP_SELECT)
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Application not found' });

  if (data.user_id !== req.profile.id && !['teacher', 'admin'].includes(req.profile.role)) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  res.json({ application: data });
}

// GET /api/applications/target/:targetId
export async function listTargetApplications(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const from = (Number(page) - 1) * Number(limit);
  const { targetId } = req.params;

  let query = supabaseAdmin
    .from('applications')
    .select(APP_SELECT, { count: 'exact' })
    .or(`opportunity_id.eq.${targetId},internship_id.eq.${targetId}`)
    .range(from, from + Number(limit) - 1)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ applications: data, total: count, page: Number(page), limit: Number(limit) });
}

// PATCH /api/applications/:id/status
export async function updateApplicationStatus(req, res) {
  const { status, note } = req.body;

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status, note, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: error?.message ?? 'Application not found' });
  res.json({ application: data });
}

// DELETE /api/applications/:id — withdraw
export async function withdrawApplication(req, res) {
  const { data: app } = await supabaseAdmin
    .from('applications').select('user_id, status').eq('id', req.params.id).single();

  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.user_id !== req.profile.id) return res.status(403).json({ error: 'Not authorized' });
  if (!['pending', 'reviewing'].includes(app.status)) {
    return res.status(409).json({ error: 'Cannot withdraw a decided application' });
  }

  const { error } = await supabaseAdmin
    .from('applications')
    .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Application withdrawn' });
}
