/**
 * POST /api/admin/create-user
 *
 * Membuat user baru di Supabase Auth (auth.users) menggunakan Admin Client.
 * Database trigger `on_auth_user_created` akan otomatis menyinkronkan
 * ke public.users sehingga tidak perlu insert manual.
 *
 * Body:
 * {
 *   email: string,
 *   password: string,
 *   fullName: string,
 *   role: 'seller' | 'buyer',
 *   username?: string,
 *   storeName?: string   // untuk seller
 * }
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, hasServiceRole } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, role, username, storeName } = body;

    // ── Validasi input ────────────────────────────────────────────────────
    if (!password || !fullName || !role) {
      return NextResponse.json(
        { error: 'password, fullName, dan role wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter.' },
        { status: 400 }
      );
    }

    let newUserId = '';

    // ── Jika TIDAK ADA Service Role Key (Fallback Mode) ───────────────────
    if (!hasServiceRole) {
      console.warn('service_role key belum diisi → fallback ke insert public.users saja.');
      const fallbackId = `USR-${Date.now()}`;
      
      const { error: dbError } = await supabaseAdmin.from('users').insert([{
        id: fallbackId,
        username: username || fullName.toLowerCase().replace(/\s/g, ''),
        name: fullName,
        password: password, // legacy schema menyimpan password di public table
        role: role,
        status: 'aktif',
      }]);

      if (dbError) {
        return NextResponse.json(
          { error: `Gagal membuat user di database: ${dbError.message}` },
          { status: 500 }
        );
      }
      
      newUserId = fallbackId;
    } else {
      // ── Buat user di Supabase Auth (butuh service_role key) ───────────────
      // raw_user_meta_data akan dipakai oleh trigger untuk mengisi public.users
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // langsung konfirmasi tanpa perlu klik link
        user_metadata: {
          full_name: fullName,
          role,
          username: username || email.split('@')[0],
        },
      });

      if (authError) {
        console.error('Auth createUser error:', authError);
        return NextResponse.json(
          { error: `Gagal membuat akun: ${authError.message}` },
          { status: 500 }
        );
      }

      newUserId = authData.user.id;
    }

    // ── Jika penjual: buat store-nya juga ─────────────────────────────────
    if (role === 'seller' && storeName) {
      const { error: storeError } = await supabaseAdmin
        .from('stores')
        .insert([{
          id: `STR-${Date.now()}`,
          ownerid: newUserId,
          name: storeName,
          is_open: true,
        }]);

      if (storeError) {
        console.warn('Store creation failed (user already created):', storeError.message);
        // Jangan throw — user sudah berhasil dibuat, store bisa dibuat manual
      }
    }

    return NextResponse.json({
      success: true,
      userId: newUserId,
      email: email,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('create-user route error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
