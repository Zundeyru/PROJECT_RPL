-- ============================================================
-- FIX: TAMBAHKAN KOLOM location DAN cover_image PADA TABEL stores
-- Jalankan ini di Supabase Dashboard -> SQL Editor
-- ============================================================

ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT;
