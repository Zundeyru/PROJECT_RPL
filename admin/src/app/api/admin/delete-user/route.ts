/**
 * POST /api/admin/delete-user
 *
 * Menghapus user secara PERMANEN dari Supabase Auth (auth.users)
 * menggunakan Admin Client dengan service_role key.
 *
 * Supabase Auth trigger akan otomatis menghapus baris terkait
 * di public.users, stores (via ON DELETE CASCADE), dan orders.
 *
 * Body: { userId: string }
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, hasServiceRole } from '@/lib/supabaseAdmin';

/** Regex UUID v4 — format yang dipakai Supabase Auth */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Hapus langsung dari public.users + cascade ke stores/orders.
 * Dipakai sebagai fallback untuk user lama yang dibuat manual
 * (ID-nya bukan UUID, misal: SLR-1234567890, BYR-1234567890).
 */
async function deleteFromPublicOnly(userId: string) {
  const { error } = await supabaseAdmin.from('users').delete().eq('id', userId);
  if (error) throw new Error(`Gagal hapus dari database: ${error.message}`);
  return NextResponse.json({ success: true, source: 'db_only', userId });
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId harus disertakan dan berupa string.' },
        { status: 400 }
      );
    }

    // ── Cek apakah ID adalah UUID yang valid ──────────────────────────────
    // User lama yang dibuat manual (sebelum Auth) punya ID seperti SLR-123.
    // supabase.auth.admin.deleteUser() hanya menerima UUID → lewati Auth
    // dan hapus langsung dari public.users saja.
    if (!UUID_REGEX.test(userId)) {
      console.warn(
        `userId "${userId}" bukan UUID — user ini dibuat manual, hapus dari public.users langsung.`
      );
      return await deleteFromPublicOnly(userId);
    }

    // ── Hapus dari Supabase Auth (butuh service_role key) ────────────────
    // Jika service_role key belum dikonfigurasi, skip Auth dan hapus DB saja.
    if (!hasServiceRole) {
      console.warn(
        'service_role key tidak tersedia → hapus DB-only (user akan hilang dari tabel, ' +
        'tapi akun Auth masih ada jika pernah dibuat via signUp)'
      );
      return await deleteFromPublicOnly(userId);
    }

    // Trigger on_auth_user_deleted akan hapus public.users,
    // dan FK CASCADE akan hapus stores + orders otomatis.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      // Jika user tidak ditemukan di Auth → mungkin pernah dibuat manual
      // dengan UUID format tapi tidak terdaftar di Auth. Fallback ke DB.
      const notFound =
        authError.message.toLowerCase().includes('user not found') ||
        authError.message.toLowerCase().includes('not found');

      if (notFound) {
        console.warn(`User ${userId} tidak ada di Auth → fallback hapus public.users`);
        return await deleteFromPublicOnly(userId);
      }

      console.error('Auth delete error:', authError);
      return NextResponse.json(
        { error: `Gagal hapus dari Auth: ${authError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, source: 'auth', userId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('delete-user route error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
