import { supabaseAdmin } from '../config/supabase.js';

// GET /api/studies/books
export async function listBooks(req, res) {
  const { q, subject, available } = req.query;

  let query = supabaseAdmin
    .from('books')
    .select('id, title, author, subject, description, cover_color, total_copies, available_copies, edition, year, price, image_url, owner:owner_id(id, username, full_name)')
    .order('title');

  if (q)                    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,subject.ilike.%${q}%`);
  if (subject)              query = query.ilike('subject', `%${subject}%`);
  if (available === 'true') query = query.gt('available_copies', 0);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ books: data });
}

// GET /api/studies/equipment
export async function listEquipment(req, res) {
  const { q, category, available } = req.query;

  let query = supabaseAdmin
    .from('equipment')
    .select('id, name, category, description, total_quantity, available_quantity, condition, price, image_url, owner:owner_id(id, username, full_name)')
    .order('category')
    .order('name');

  if (q)                    query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
  if (category)             query = query.eq('category', category);
  if (available === 'true') query = query.gt('available_quantity', 0);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ equipment: data });
}

// GET /api/studies/borrows/mine
export async function myBorrows(req, res) {
  const { data, error } = await supabaseAdmin
    .from('borrow_requests')
    .select('id, item_type, item_id, status, requested_at, due_date, returned_at, notes')
    .eq('user_id', req.profile.id)
    .order('requested_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const bookIds  = data.filter(b => b.item_type === 'book').map(b => b.item_id);
  const equipIds = data.filter(b => b.item_type === 'equipment').map(b => b.item_id);

  const [{ data: books }, { data: equip }] = await Promise.all([
    bookIds.length
      ? supabaseAdmin.from('books').select('id, title, author').in('id', bookIds)
      : { data: [] },
    equipIds.length
      ? supabaseAdmin.from('equipment').select('id, name, category').in('id', equipIds)
      : { data: [] },
  ]);

  const bookMap  = Object.fromEntries((books  ?? []).map(b => [b.id, b]));
  const equipMap = Object.fromEntries((equip  ?? []).map(e => [e.id, e]));

  const enriched = data.map(b => ({
    ...b,
    item_name: b.item_type === 'book'
      ? (bookMap[b.item_id]?.title ?? 'Unknown')
      : (equipMap[b.item_id]?.name ?? 'Unknown'),
    item_sub: b.item_type === 'book'
      ? (bookMap[b.item_id]?.author ?? '')
      : (equipMap[b.item_id]?.category ?? ''),
  }));

  res.json({ borrows: enriched });
}

// POST /api/studies/borrow
export async function createBorrow(req, res) {
  const { item_type, item_id, due_date, notes } = req.body;
  if (!['book', 'equipment'].includes(item_type)) {
    return res.status(400).json({ error: 'item_type must be book or equipment' });
  }

  const table  = item_type === 'book' ? 'books' : 'equipment';
  const qtyCol = item_type === 'book' ? 'available_copies' : 'available_quantity';

  const { data: item } = await supabaseAdmin.from(table).select(`id, ${qtyCol}`).eq('id', item_id).single();
  if (!item)           return res.status(404).json({ error: 'Item not found' });
  if (item[qtyCol] < 1) return res.status(409).json({ error: 'No copies available right now' });

  const { data: existing } = await supabaseAdmin
    .from('borrow_requests')
    .select('id')
    .eq('user_id', req.profile.id)
    .eq('item_id', item_id)
    .in('status', ['pending', 'approved'])
    .single();
  if (existing) return res.status(409).json({ error: 'You already have an active borrow request for this item' });

  const { data, error } = await supabaseAdmin
    .from('borrow_requests')
    .insert({ user_id: req.profile.id, item_type, item_id, due_date, notes, status: 'pending' })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await supabaseAdmin.from(table).update({ [qtyCol]: item[qtyCol] - 1 }).eq('id', item_id);

  res.status(201).json({ borrow: data });
}

// PATCH /api/studies/borrows/:id/return
export async function returnItem(req, res) {
  const { data: borrow } = await supabaseAdmin
    .from('borrow_requests').select('*').eq('id', req.params.id).single();

  if (!borrow) return res.status(404).json({ error: 'Borrow request not found' });
  if (borrow.user_id !== req.profile.id) return res.status(403).json({ error: 'Not your borrow request' });
  if (borrow.status !== 'approved' && borrow.status !== 'pending') {
    return res.status(409).json({ error: 'Cannot return an item that is not borrowed' });
  }

  await supabaseAdmin
    .from('borrow_requests')
    .update({ status: 'returned', returned_at: new Date().toISOString() })
    .eq('id', req.params.id);

  const table  = borrow.item_type === 'book' ? 'books' : 'equipment';
  const qtyCol = borrow.item_type === 'book' ? 'available_copies' : 'available_quantity';
  const { data: item } = await supabaseAdmin.from(table).select(qtyCol).eq('id', borrow.item_id).single();
  if (item) await supabaseAdmin.from(table).update({ [qtyCol]: item[qtyCol] + 1 }).eq('id', borrow.item_id);

  res.json({ message: 'Item returned successfully' });
}

// ── Borrow Chat ───────────────────────────────────────────────────────────

// POST /api/studies/chat  — start or reuse a chat about a book/equipment
export async function startBorrowChat(req, res) {
  const { item_id, item_type } = req.body;
  if (!item_id || !['book', 'equipment'].includes(item_type)) {
    return res.status(400).json({ error: 'item_id and item_type are required' });
  }

  const table = item_type === 'book' ? 'books' : 'equipment';
  const { data: item } = await supabaseAdmin.from(table).select('owner_id').eq('id', item_id).single();
  if (!item?.owner_id) return res.status(400).json({ error: 'This item has no seller — contact admin to assign one.' });
  if (item.owner_id === req.profile.id) return res.status(400).json({ error: 'You cannot chat with yourself about your own listing.' });

  const { data, error } = await supabaseAdmin
    .from('borrow_chats')
    .upsert(
      { user_id: req.profile.id, owner_id: item.owner_id, item_id, item_type },
      { onConflict: 'user_id,item_id,item_type' }
    )
    .select('id, user_id, owner_id, item_id, item_type, created_at, user:user_id(id, username, full_name), owner:owner_id(id, username, full_name)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ chat: data });
}

// GET /api/studies/chat/:id/messages
export async function getBorrowMessages(req, res) {
  const { data: chat } = await supabaseAdmin
    .from('borrow_chats').select('user_id, owner_id').eq('id', req.params.id).single();
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  if (chat.user_id !== req.profile.id && chat.owner_id !== req.profile.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  let query = supabaseAdmin
    .from('borrow_messages')
    .select('id, message, created_at, sender:sender_id(id, username, full_name)')
    .eq('chat_id', req.params.id)
    .order('created_at', { ascending: true });

  if (req.query.since) query = query.gt('created_at', req.query.since);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ messages: data });
}

// POST /api/studies/chat/:id/messages
export async function sendBorrowMessage(req, res) {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

  const { data: chat } = await supabaseAdmin
    .from('borrow_chats').select('user_id, owner_id').eq('id', req.params.id).single();
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  if (chat.user_id !== req.profile.id && chat.owner_id !== req.profile.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { data, error } = await supabaseAdmin
    .from('borrow_messages')
    .insert({ chat_id: req.params.id, sender_id: req.profile.id, message: message.trim() })
    .select('id, message, created_at, sender:sender_id(id, username, full_name)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: data });
}
