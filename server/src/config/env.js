import 'dotenv/config';

const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const env = {
  NODE_ENV:                    process.env.NODE_ENV || 'development',
  PORT:                        Number(process.env.PORT) || 4000,
  CLIENT_URL:                  process.env.CLIENT_URL || 'http://localhost:5173',
  SUPABASE_URL:                required('SUPABASE_URL'),
  SUPABASE_ANON_KEY:           required('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY:   required('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_JWT_SECRET:         required('SUPABASE_JWT_SECRET'),
};
