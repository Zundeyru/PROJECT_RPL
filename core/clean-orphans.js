const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qqjqixwlfkygehwvwvsy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanOrphans() {
  console.log("Mencari toko (stores) yang tidak memiliki pemilik (users)...");
  
  // Ambil semua users
  const { data: users } = await supabase.from('users').select('id');
  const userIds = users.map(u => u.id);
  
  // Ambil semua stores
  const { data: stores } = await supabase.from('stores').select('*');
  
  const orphanedStores = stores.filter(store => !userIds.includes(store.ownerid));
  
  console.log(`Ditemukan ${orphanedStores.length} toko yatim.`);
  
  for (const store of orphanedStores) {
    console.log(`Menghapus toko yatim: ${store.name} (${store.id})`);
    
    // Hapus menu dari toko ini
    await supabase.from('menus').delete().eq('storeid', store.id);
    console.log(`- Menu dihapus untuk toko ${store.id}`);
    
    // Hapus toko
    await supabase.from('stores').delete().eq('id', store.id);
    console.log(`- Toko ${store.id} dihapus.`);
  }
  
  console.log("Pembersihan selesai!");
}

cleanOrphans();
