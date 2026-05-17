import { supabaseAdmin } from '../config/supabase.js';

const LISTING_SELECT = `
  id, item_type, title, description, condition, available_slots, status, created_at,
  profiles:user_id (id, username, full_name)
`;

// GET /api/exchange/listings
export async function listListings(req, res) {
  const { q, item_type, condition, status = 'available' } = req.query;

  let query = supabaseAdmin
    .from('exchange_listings')
    .select(LISTING_SELECT)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (q)         query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (item_type) query = query.eq('item_type', item_type);
  if (condition) query = query.eq('condition', condition);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ listings: data });
}

// GET /api/exchange/listings/:id
export async function getListing(req, res) {
  const { data, error } = await supabaseAdmin
    .from('exchange_listings')
    .select(LISTING_SELECT)
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: data });
}

// POST /api/exchange/listings
export async function createListing(req, res) {
  const { item_type, title, description, condition, available_slots } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const { data, error } = await supabaseAdmin
    .from('exchange_listings')
    .insert({ user_id: req.profile.id, item_type: item_type ?? 'other', title, description, condition: condition ?? 'good', available_slots: available_slots ?? [] })
    .select(LISTING_SELECT)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ listing: data });
}

// PATCH /api/exchange/listings/:id
export async function updateListing(req, res) {
  const { title, description, condition, available_slots, status } = req.body;

  const { data: existing } = await supabaseAdmin
    .from('exchange_listings').select('user_id').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Listing not found' });
  if (existing.user_id !== req.profile.id) return res.status(403).json({ error: 'Not your listing' });

  const updates = {};
  if (title !== undefined)           updates.title = title;
  if (description !== undefined)     updates.description = description;
  if (condition !== undefined)       updates.condition = condition;
  if (available_slots !== undefined) updates.available_slots = available_slots;
  if (status !== undefined)          updates.status = status;

  const { data, error } = await supabaseAdmin
    .from('exchange_listings').update(updates).eq('id', req.params.id)
    .select(LISTING_SELECT).single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ listing: data });
}

// DELETE /api/exchange/listings/:id
export async function deleteListing(req, res) {
  const { data: existing } = await supabaseAdmin
    .from('exchange_listings').select('user_id').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Listing not found' });
  if (existing.user_id !== req.profile.id) return res.status(403).json({ error: 'Not your listing' });

  await supabaseAdmin.from('exchange_listings').delete().eq('id', req.params.id);
  res.json({ message: 'Listing removed' });
}

// ─── Chat ────────────────────────────────────────────────────

// GET /api/exchange/chats  — all chats involving current user
export async function myChats(req, res) {
  const { data, error } = await supabaseAdmin
    .from('exchange_chats')
    .select(`id, created_at,
      listing:listing_id (id, title, item_type),
      owner:owner_id (id, username, full_name),
      requester:requester_id (id, username, full_name)`)
    .or(`owner_id.eq.${req.profile.id},requester_id.eq.${req.profile.id}`)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ chats: data });
}

// POST /api/exchange/chats  — start a chat on a listing
export async function startChat(req, res) {
  const { listing_id } = req.body;
  if (!listing_id) return res.status(400).json({ error: 'listing_id is required' });

  const { data: listing } = await supabaseAdmin
    .from('exchange_listings').select('user_id, status').eq('id', listing_id).single();
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.user_id === req.profile.id) return res.status(400).json({ error: 'Cannot chat on your own listing' });

  // Upsert chat (unique on listing_id + requester_id)
  const { data, error } = await supabaseAdmin
    .from('exchange_chats')
    .upsert({ listing_id, owner_id: listing.user_id, requester_id: req.profile.id }, { onConflict: 'listing_id,requester_id' })
    .select(`id, created_at,
      listing:listing_id (id, title, item_type),
      owner:owner_id (id, username, full_name),
      requester:requester_id (id, username, full_name)`)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ chat: data });
}

// GET /api/exchange/chats/:id/messages
export async function getMessages(req, res) {
  const chatId = req.params.id;

  // Verify user is in this chat
  const { data: chat } = await supabaseAdmin
    .from('exchange_chats').select('owner_id, requester_id').eq('id', chatId).single();
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  if (chat.owner_id !== req.profile.id && chat.requester_id !== req.profile.id) {
    return res.status(403).json({ error: 'Not your chat' });
  }

  const since = req.query.since; // ISO timestamp for polling
  let query = supabaseAdmin
    .from('exchange_messages')
    .select(`id, message, created_at, sender:sender_id (id, username, full_name)`)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (since) query = query.gt('created_at', since);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ messages: data });
}

// POST /api/exchange/chats/:id/messages
export async function sendMessage(req, res) {
  const chatId = req.params.id;
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

  const { data: chat } = await supabaseAdmin
    .from('exchange_chats').select('owner_id, requester_id').eq('id', chatId).single();
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  if (chat.owner_id !== req.profile.id && chat.requester_id !== req.profile.id) {
    return res.status(403).json({ error: 'Not your chat' });
  }

  const { data, error } = await supabaseAdmin
    .from('exchange_messages')
    .insert({ chat_id: chatId, sender_id: req.profile.id, message: message.trim() })
    .select(`id, message, created_at, sender:sender_id (id, username, full_name)`)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: data });
}
