/**
 * Admin — services/api.ts
 *
 * Semua operasi data untuk portal Admin.
 * - Operasi baca (GET) langsung ke Supabase melalui anon client.
 * - Operasi privileged (create/delete user) → Next.js API Route
 *   yang memakai supabaseAdmin (service_role) di server-side.
 */

import { supabase } from '../lib/supabase';

export const api = {
  // ─── USERS ──────────────────────────────────────────────────────────────

  /** Ambil semua user berdasarkan role dari Supabase */
  async getUsersByRole(role: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`role.eq.${role},role.eq.${role === 'seller' ? 'penjual' : 'pembeli'}`);
    if (error) throw new Error('Failed to fetch users');
    return data || [];
  },

  /**
   * Buat user baru melalui server API route.
   * Server route menggunakan supabaseAdmin.auth.admin.createUser()
   * sehingga password benar-benar tersimpan di Supabase Auth.
   */
  async createUser(payload: {
    email: string;
    password: string;
    fullName: string;
    role: 'seller' | 'buyer';
    username?: string;
    storeName?: string;
  }) {
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal membuat user');
    return json;
  },

  /** Ubah status aktif / nonaktif */
  async updateUserStatus(id: string, is_active: boolean) {
    const status = is_active ? 'aktif' : 'nonaktif';
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw new Error('Failed to update user status');
    return data ? data[0] : null;
  },

  /** Ubah data profil pengguna */
  async updateUserProfile(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw new Error('Failed to update user profile');
    return data ? data[0] : null;
  },

  /**
   * Hapus user SECARA PERMANEN.
   *
   * Memanggil server API route yang menggunakan
   * supabaseAdmin.auth.admin.deleteUser(id).
   * Ini menghapus dari auth.users — trigger DB akan menghapus
   * dari public.users, dan ON DELETE CASCADE menangani stores + orders.
   */
  async deleteUser(id: string) {
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menghapus user');
    return json;
  },

  // ─── STORES ─────────────────────────────────────────────────────────────

  /** Buat toko baru — dipakai saat Admin menambahkan penjual */
  async createStore(store: {
    id?: string;
    name: string;
    ownerId?: string;
    sellerId?: string;
  }) {
    const toInsert = {
      ...(store.id ? { id: store.id } : {}),
      name: store.name,
      ownerid: store.ownerId || store.sellerId,
      is_open: true,
    };
    const { data, error } = await supabase
      .from('stores')
      .insert([toInsert])
      .select();
    if (error) {
      console.error('Supabase createStore error:', error);
      throw new Error(`Failed to create store: ${error.message}`);
    }
    return data ? { ...data[0], ownerId: data[0].ownerid } : null;
  },
};
