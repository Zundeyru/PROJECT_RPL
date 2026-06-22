const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qqjqixwlfkygehwvwvsy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fungsi untuk melakukan fetch semua data dari tabel dan menyimpannya ke JSON
async function fetchAndSave(table, filename) {
  console.log(`[SYNC] Mengambil data terbaru dari tabel '${table}'...`);
  const { data, error } = await supabase.from(table).select('*');
  
  if (error) {
    console.error(`[ERROR] Gagal mengambil data ${table}:`, error.message);
    return;
  }

  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`[SYNC] ✅ File ${filename} berhasil diperbarui! (${data.length} baris)`);
}

async function startSync() {
  console.log("=========================================");
  console.log("🔄 MEMULAI SINKRONISASI REALTIME SUPABASE");
  console.log("=========================================");
  console.log("Script ini akan terus berjalan dan memantau perubahan di database.");
  console.log("Jika ada yang ditambah, diedit, atau dihapus di Supabase, file JSON akan otomatis terupdate!\n");

  // Lakukan sinkronisasi awal saat script dijalankan
  await fetchAndSave('users', 'users.json');
  await fetchAndSave('stores', 'stores.json');
  await fetchAndSave('menus', 'menus.json');
  await fetchAndSave('orders', 'orders.json');

  // Berlangganan (Subscribe) ke perubahan Realtime di Supabase
  supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users' },
      (payload) => {
        console.log(`\n🔔 Perubahan terdeteksi di tabel USERS (${payload.eventType})!`);
        fetchAndSave('users', 'users.json');
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'stores' },
      (payload) => {
        console.log(`\n🔔 Perubahan terdeteksi di tabel STORES (${payload.eventType})!`);
        fetchAndSave('stores', 'stores.json');
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'menus' },
      (payload) => {
        console.log(`\n🔔 Perubahan terdeteksi di tabel MENUS (${payload.eventType})!`);
        fetchAndSave('menus', 'menus.json');
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        console.log(`\n🔔 Perubahan terdeteksi di tabel ORDERS (${payload.eventType})!`);
        fetchAndSave('orders', 'orders.json');
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("\n📡 Menunggu perubahan data secara Realtime... (Tekan Ctrl+C untuk berhenti)");
      }
    });
}

startSync();
