import { supabaseAdmin } from '../config/supabase.js';

// POST /api/studies/books
export async function createBook(req, res) {
  const { title, author, subject, description, edition, year, totalCopies, price, coverColor, imageUrl } = req.body;
  if (!title?.trim() || !author?.trim() || !subject?.trim() || !totalCopies) {
    return res.status(400).json({ error: 'title, author, subject, and totalCopies are required' });
  }
  const copies = parseInt(totalCopies, 10);
  if (isNaN(copies) || copies < 1) return res.status(400).json({ error: 'totalCopies must be at least 1' });

  const { data, error } = await supabaseAdmin
    .from('books')
    .insert({
      title: title.trim(),
      author: author.trim(),
      subject: subject.trim(),
      description: description?.trim() || null,
      edition: edition?.trim() || null,
      year: year ? parseInt(year, 10) : null,
      total_copies: copies,
      available_copies: copies,
      price: price ? parseFloat(price) : null,
      cover_color: coverColor?.trim() || null,
      image_url: imageUrl || null,
      owner_id: req.profile.id,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ book: data });
}

// POST /api/studies/equipment
export async function createEquipment(req, res) {
  const { name, category, description, condition, totalQuantity, price, imageUrl } = req.body;
  if (!name?.trim() || !category?.trim() || !totalQuantity) {
    return res.status(400).json({ error: 'name, category, and totalQuantity are required' });
  }
  const qty = parseInt(totalQuantity, 10);
  if (isNaN(qty) || qty < 1) return res.status(400).json({ error: 'totalQuantity must be at least 1' });

  const { data, error } = await supabaseAdmin
    .from('equipment')
    .insert({
      name: name.trim(),
      category: category.trim(),
      description: description?.trim() || null,
      condition: condition?.trim() || null,
      total_quantity: qty,
      available_quantity: qty,
      price: price ? parseFloat(price) : null,
      image_url: imageUrl || null,
      owner_id: req.profile.id,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ equipment: data });
}

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
  if (!item) return res.status(404).json({ error: 'Item not found.' });

  // If caller is the item owner, return all customer chats for this item
  if (item.owner_id && item.owner_id === req.profile.id) {
    const { data: chats } = await supabaseAdmin
      .from('borrow_chats')
      .select('id, user_id, item_id, item_type, created_at')
      .eq('item_id', item_id)
      .eq('item_type', item_type)
      .order('created_at', { ascending: false });

    const userIds = (chats ?? []).map(c => c.user_id);
    const { data: profiles } = userIds.length
      ? await supabaseAdmin.from('profiles').select('id, username, full_name').in('id', userIds)
      : { data: [] };
    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));

    return res.status(200).json({
      isOwner: true,
      chats: (chats ?? []).map(c => ({ ...c, customer: profileMap[c.user_id] ?? null })),
    });
  }

  // Customer flow — upsert creates or reuses their chat thread
  const { data: chatRow, error: chatErr } = await supabaseAdmin
    .from('borrow_chats')
    .upsert(
      { user_id: req.profile.id, item_id, item_type },
      { onConflict: 'user_id,item_id,item_type' }
    )
    .select('id, user_id, item_id, item_type, created_at')
    .single();

  if (chatErr) return res.status(400).json({ error: chatErr.message });

  const { data: ownerProfile } = item.owner_id
    ? await supabaseAdmin.from('profiles').select('id, username, full_name').eq('id', item.owner_id).single()
    : { data: null };

  res.status(200).json({
    isOwner: false,
    chat: { ...chatRow, owner: ownerProfile ?? null },
  });
}

async function canAccessChat(chatId, profileId) {
  const { data: chat } = await supabaseAdmin
    .from('borrow_chats').select('user_id, item_id, item_type').eq('id', chatId).single();
  if (!chat) return { allowed: false };
  if (chat.user_id === profileId) return { allowed: true, chat };
  const table = chat.item_type === 'book' ? 'books' : 'equipment';
  const { data: item } = await supabaseAdmin.from(table).select('owner_id').eq('id', chat.item_id).single();
  if (item?.owner_id === profileId) return { allowed: true, chat };
  return { allowed: false };
}

// GET /api/studies/chat/:id/messages
export async function getBorrowMessages(req, res) {
  const { allowed } = await canAccessChat(req.params.id, req.profile.id);
  if (!allowed) return res.status(403).json({ error: 'Not authorized' });

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

  const { allowed, chat } = await canAccessChat(req.params.id, req.profile.id);
  if (!allowed) return res.status(403).json({ error: 'Not authorized' });

  const { data, error } = await supabaseAdmin
    .from('borrow_messages')
    .insert({ chat_id: req.params.id, sender_id: req.profile.id, message: message.trim() })
    .select('id, message, created_at, sender:sender_id(id, username, full_name)')
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Notify the other party
  try {
    const table2 = chat.item_type === 'book' ? 'books' : 'equipment';
    const { data: itemRow } = await supabaseAdmin.from(table2).select('owner_id, title, name').eq('id', chat.item_id).single();
    const recipientId = req.profile.id === chat.user_id ? itemRow?.owner_id : chat.user_id;
    if (recipientId && recipientId !== req.profile.id) {
      const senderName = req.profile.full_name ?? req.profile.username ?? 'Someone';
      await supabaseAdmin.from('notifications').insert({
        user_id: recipientId,
        type: 'message',
        title: `New message from ${senderName}`,
        message: `About: "${itemRow?.title ?? itemRow?.name ?? 'an item'}"`,
        is_read: false,
      });
    }
  } catch {}

  res.status(201).json({ message: data });
}

// GET /api/studies/my-items  — items listed by the current user
export async function getMyItems(req, res) {
  const uid = req.profile.id;

  const [{ data: books }, { data: equipment }] = await Promise.all([
    supabaseAdmin.from('books').select('id, title, author, subject, total_copies, available_copies, cover_color, price').eq('owner_id', uid),
    supabaseAdmin.from('equipment').select('id, name, category, total_quantity, available_quantity, condition, price').eq('owner_id', uid),
  ]);

  const bookIds  = (books  ?? []).map(b => b.id);
  const equipIds = (equipment ?? []).map(e => e.id);

  const [{ data: bookChats }, { data: equipChats }] = await Promise.all([
    bookIds.length
      ? supabaseAdmin.from('borrow_chats').select('item_id').eq('item_type', 'book').in('item_id', bookIds)
      : { data: [] },
    equipIds.length
      ? supabaseAdmin.from('borrow_chats').select('item_id').eq('item_type', 'equipment').in('item_id', equipIds)
      : { data: [] },
  ]);

  const count = (arr, id) => (arr ?? []).filter(c => c.item_id === id).length;

  res.json({
    books:     (books     ?? []).map(b => ({ ...b, chat_count: count(bookChats, b.id) })),
    equipment: (equipment ?? []).map(e => ({ ...e, chat_count: count(equipChats, e.id) })),
  });
}
