-- ============================================================
-- FIX: MENGAKTIFKAN REALTIME UNTUK SEMUA TABEL
-- Jalankan ini di Supabase Dashboard -> SQL Editor
-- ============================================================

-- Pastikan publication supabase_realtime ada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Masukkan tabel-tabel utama ke dalam publication agar Websocket bisa mendengarkan perubahannya
ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
