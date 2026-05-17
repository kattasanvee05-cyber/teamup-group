import { supabaseAdmin } from '../config/supabase.js';

const NOTIF_SELECT = 'id, type, subtype, title, message, is_read, action_url, meta, pending, created_at';

// GET /api/notifications
export async function listNotifications(req, res) {
  const { type, isRead, page = 1, limit = 30 } = req.query;
  const from = (Number(page) - 1) * Number(limit);

  let query = supabaseAdmin
    .from('notifications')
    .select(NOTIF_SELECT, { count: 'exact' })
    .eq('user_id', req.profile.id)
    .range(from, from + Number(limit) - 1)
    .order('created_at', { ascending: false });

  if (type)              query = query.eq('type', type);
  if (isRead === 'true') query = query.eq('is_read', true);
  if (isRead === 'false') query = query.eq('is_read', false);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ notifications: data, total: count, page: Number(page), limit: Number(limit) });
}

// GET /api/notifications/unread-count
export async function getUnreadCount(req, res) {
  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.profile.id)
    .eq('is_read', false);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ unread: count });
}

// PATCH /api/notifications/:id/read
export async function markRead(req, res) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .eq('user_id', req.profile.id) // scope to owner
    .select(NOTIF_SELECT)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Notification not found' });
  res.json({ notification: data });
}

// PATCH /api/notifications/read-all
export async function markAllRead(req, res) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.profile.id)
    .eq('is_read', false);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'All notifications marked as read' });
}

// DELETE /api/notifications/:id
export async function dismissNotification(req, res) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.profile.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Notification dismissed' });
}

// DELETE /api/notifications  — clear all
export async function clearAllNotifications(req, res) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('user_id', req.profile.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'All notifications cleared' });
}
