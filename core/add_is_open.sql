-- ============================================================
-- FIX: TAMBAHKAN KOLOM is_open PADA TABEL stores
-- Jalankan ini di Supabase Dashboard -> SQL Editor
-- ============================================================

ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;
