import { supabaseAdmin, supabase } from '../config/supabase.js';
import { env } from '../config/env.js';

// POST /api/auth/signup
export async function signup(req, res) {
  const { email, password, fullName, username, role } = req.body;

  // Check username uniqueness
  const { data: existing } = await supabaseAdmin
    .from('profiles').select('id').eq('username', username).single();
  if (existing) return res.status(409).json({ error: 'Username already taken' });

  // Use admin createUser with email_confirm: true — no confirmation email needed
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, username, role },
  });
  if (error) {
    if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('already exists')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res.status(400).json({ error: error.message });
  }
  if (!data.user) return res.status(400).json({ error: 'Signup failed' });

  // Check if a DB trigger already created the profile row
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles').select('id').eq('id', data.user.id).maybeSingle();

  if (existingProfile) {
    // Trigger created it — just update with our values
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({ email, username, full_name: fullName, role: role ?? 'student' })
      .eq('id', data.user.id);
    if (updateErr) console.error('[signup] profile update error:', updateErr.message);
  } else {
    // No trigger — insert fresh row
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id:        data.user.id,
      email,
      username,
      full_name: fullName,
      role:      role ?? 'student',
    });
    if (profileError) {
      console.error('[signup] profile insert error:', JSON.stringify(profileError));
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return res.status(500).json({
        error: `Profile setup failed: ${profileError.message} | code: ${profileError.code} | ${profileError.hint ?? ''}`,
      });
    }
  }

  res.status(201).json({ message: 'Account created! Please check your email and click the confirmation link before logging in.' });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid email or password' });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('*').eq('id', data.user.id).single();

  res.json({
    session: data.session,
    user: data.user,
    profile,
  });
}

// POST /api/auth/logout
export async function logout(req, res) {
  res.json({ message: 'Logged out successfully' });
}

// POST /api/auth/refresh
export async function refreshToken(req, res) {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Missing refresh_token' });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error || !data.session) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  res.json({
    access_token:  data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  const { email } = req.body;
  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${env.CLIENT_URL}/auth/reset-password` },
  });
  // Always return 200 to prevent email enumeration
  if (error) console.error('[forgotPassword]', error.message);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
}

// GET /api/auth/me
export async function getMe(req, res) {
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('*').eq('id', req.user.sub).single();
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json({ user: req.user, profile });
}

// PATCH /api/auth/me
export async function updateMe(req, res) {
  const b = req.body;
  // Map camelCase request fields → snake_case DB columns
  const updates = {};
  if (b.fullName     !== undefined) updates.full_name     = b.fullName;
  if (b.username     !== undefined) updates.username      = b.username;
  if (b.bio          !== undefined) updates.bio           = b.bio;
  if (b.phone        !== undefined) updates.phone         = b.phone;
  if (b.college      !== undefined) updates.college       = b.college;
  if (b.collegeEmail !== undefined) updates.college_email = b.collegeEmail;
  if (b.yearOfStudy  !== undefined) updates.year_of_study = b.yearOfStudy;
  if (b.department   !== undefined) updates.department    = b.department;
  if (b.location     !== undefined) updates.location      = b.location;
  if (b.website      !== undefined) updates.website       = b.website;
  if (b.githubUrl    !== undefined) updates.github_url    = b.githubUrl;
  if (b.skills       !== undefined) updates.skills        = b.skills;
  if (b.interests    !== undefined) updates.interests     = b.interests;
  if (b.avatarUrl    !== undefined) updates.avatar_url    = b.avatarUrl;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', req.user.sub)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ profile: data });
}

// Admin: GET /api/auth/users
export async function listUsers(req, res) {
  const { page = 1, limit = 20, role, search } = req.query;
  const from = (page - 1) * limit;

  let query = supabaseAdmin
    .from('profiles')
    .select('id, username, full_name, email, role, created_at, is_active', { count: 'exact' })
    .range(from, from + limit - 1)
    .order('created_at', { ascending: false });

  if (role) query = query.eq('role', role);
  if (search) query = query.ilike('full_name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ users: data, total: count, page: Number(page), limit: Number(limit) });
}

// Admin: PATCH /api/auth/users/:id/role
export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles').update({ role }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });

  // Sync role in auth.users metadata
  await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: { role } });

  res.json({ profile: data });
}

// Admin: DELETE /api/auth/users/:id
export async function deleteUser(req, res) {
  const { id } = req.params;
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User deleted' });
}
