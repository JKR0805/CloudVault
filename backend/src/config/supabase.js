const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

// ─── Public client ────────────────────────────────
// Respects Row Level Security. Used for auth verification.
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// ─── Admin client ─────────────────────────────────
// Bypasses RLS. Used for storage ops and DB writes.
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

module.exports = { supabase, supabaseAdmin };
