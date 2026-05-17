import { supabaseAdmin } from '../config/supabase.js';

// Supabase now signs JWTs with ES256 (asymmetric). Use getUser() for verification.
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, username, full_name, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return res.status(401).json({ error: 'User profile not found' });
    if (!profile.is_active) return res.status(403).json({ error: 'Account is deactivated' });

    req.user = { sub: user.id, email: user.email };
    req.profile = profile;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles').select('id, role').eq('id', user.id).single();
      req.user = { sub: user.id, email: user.email };
      req.profile = profile;
    }
  } catch {
    // ignore — optional
  }
  next();
}
