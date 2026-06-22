-- ============================================================
-- FILE INI DIJALANKAN DI SUPABASE DASHBOARD → SQL EDITOR
-- Jalankan secara berurutan dari bagian 1 ke 4.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- BAGIAN 1: ON DELETE CASCADE pada stores dan orders
--
-- Tujuan: Ketika user dihapus dari public.users (yang terjadi
-- saat auth trigger menangkap penghapusan dari auth.users),
-- semua baris di stores dan orders yang terhubung akan
-- otomatis terhapus.
-- ─────────────────────────────────────────────────────────────

-- 1a. Cek kolom yang ada di stores
-- (Jalankan ini dulu untuk melihat nama FK yang ada)
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.stores'::regclass;

-- 1b. Hapus FK lama pada stores.ownerid (ganti nama sesuai output SELECT di atas)
--     Nama FK biasanya: stores_ownerid_fkey
ALTER TABLE public.stores
  DROP CONSTRAINT IF EXISTS stores_ownerid_fkey;

-- 1c. Tambahkan FK baru dengan ON DELETE CASCADE
ALTER TABLE public.stores
  ADD CONSTRAINT stores_ownerid_fkey
  FOREIGN KEY (ownerid)
  REFERENCES public.users(id)
  ON DELETE CASCADE;


-- 1d. Cek kolom yang ada di orders
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.orders'::regclass;

-- 1e. Hapus FK lama pada orders.buyer_id
--     Nama FK biasanya: orders_buyer_id_fkey
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_buyer_id_fkey;

-- 1f. Tambahkan FK baru dengan ON DELETE SET NULL
--     (SET NULL karena buyer dihapus tapi histori order tetap penting untuk laporan)
ALTER TABLE public.orders
  ADD CONSTRAINT orders_buyer_id_fkey
  FOREIGN KEY (buyer_id)
  REFERENCES public.users(id)
  ON DELETE SET NULL;


-- ─────────────────────────────────────────────────────────────
-- BAGIAN 2: FUNCTION handle_new_user
--
-- Fungsi ini dipanggil oleh trigger setiap kali ada INSERT
-- baru di auth.users. Dia menyalin data dari auth ke public.users.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    status,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    -- Ambil full_name dari user_metadata (dikirim saat supabase.auth.signUp)
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)   -- fallback: bagian sebelum @
    ),
    -- Ambil role dari user_metadata, default ke 'buyer'
    COALESCE(
      NEW.raw_user_meta_data ->> 'role',
      'buyer'
    ),
    'aktif',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Jangan error kalau sudah ada

  RETURN NEW;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- BAGIAN 3: TRIGGER on_auth_user_created
--
-- Mengikat fungsi di atas ke event INSERT pada auth.users.
-- ─────────────────────────────────────────────────────────────

-- Hapus trigger lama jika ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Buat trigger baru
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- BAGIAN 4: TRIGGER handle_user_deleted (sinkronisasi hapus)
--
-- Ketika user dihapus dari auth.users,
-- pastikan public.users juga bersih.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deleted();


-- ─────────────────────────────────────────────────────────────
-- BAGIAN 5: Aktifkan Realtime untuk tabel yang dibutuhkan
--
-- Jalankan ini HANYA JIKA belum mengaktifkan Realtime
-- melalui Dashboard → Database → Replication.
-- ─────────────────────────────────────────────────────────────

-- Aktifkan Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;


-- ─────────────────────────────────────────────────────────────
-- VERIFIKASI (jalankan setelah semua bagian di atas)
-- ─────────────────────────────────────────────────────────────

-- Cek trigger terdaftar
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
   OR event_object_schema = 'auth'
ORDER BY trigger_name;

-- Cek FK constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
