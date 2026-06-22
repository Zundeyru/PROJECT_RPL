/**
 * supabaseAdmin.ts — Server-only Supabase Admin Client
 *
 * Menggunakan service_role key yang HANYA boleh dipakai di server-side
 * (API Routes / Server Actions). JANGAN import file ini di client component!
 *
 * Setup:
 * 1. Buka Supabase Dashboard → Settings → API
 * 2. Copy "service_role" key (bukan anon key)
 * 3. Paste ke admin/.env.local sebagai SUPABASE_SERVICE_ROLE_KEY
 *
 * Catatan:
 * Jika SUPABASE_SERVICE_ROLE_KEY belum diisi, sistem otomatis fallback
 * ke anon key. Dalam mode fallback:
 * - Hapus user lama (non-UUID) → tetap berfungsi via public.users
 * - Hapus user Auth (UUID)     → butuh service_role key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://qqjqixwlfkygehwvwvsy.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI';

const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const PLACEHOLDER = 'GANTI_DENGAN_SERVICE_ROLE_KEY_ANDA';

/** True jika service_role key sudah diisi dengan nilai nyata */
export const hasServiceRole =
  rawServiceKey.length > 0 && rawServiceKey !== PLACEHOLDER;

if (!hasServiceRole) {
  console.warn(
    '⚠️  SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local\n' +
    '   → Menggunakan anon key sebagai fallback.\n' +
    '   → Hapus user dari Auth.users TIDAK akan berfungsi (hanya DB-only).\n' +
    '   → Isi service_role key untuk hapus permanen dari Auth.'
  );
}

/**
 * Admin client.
 * - Jika service_role key tersedia: bypass Row Level Security, bisa hapus dari Auth.
 * - Jika tidak: gunakan anon key (DB operations saja — RLS tetap berlaku).
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  hasServiceRole ? rawServiceKey : supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
