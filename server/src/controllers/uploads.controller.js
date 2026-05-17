import { supabaseAdmin } from '../config/supabase.js';

// POST /api/uploads/resume
export async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = `${req.profile.id}/${Date.now()}_resume.pdf`;

  const { error } = await supabaseAdmin.storage
    .from('resumes')
    .upload(filePath, req.file.buffer, { contentType: 'application/pdf', upsert: true });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabaseAdmin.storage.from('resumes').getPublicUrl(filePath);
  res.json({ url: data.publicUrl });
}

// POST /api/uploads/item-image
export async function uploadItemImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const ext      = req.file.mimetype === 'image/png' ? '.png' : req.file.mimetype === 'image/webp' ? '.webp' : '.jpg';
  const filePath = `${req.profile.id}/${Date.now()}${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('item-images')
    .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabaseAdmin.storage.from('item-images').getPublicUrl(filePath);
  res.json({ url: data.publicUrl });
}
