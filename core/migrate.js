const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qqjqixwlfkygehwvwvsy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrate() {
  console.log("Memulai migrasi data ke Supabase...");

  try {
    // 1. Migrate Users
    console.log("Membaca users.json...");
    let users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
    users = users.map(u => ({
      id: u.id,
      username: u.username,
      password: u.password,
      name: u.name,
      role: u.role,
      storename: u.storeName || null,
      nim: u.nim || null,
      faculty: u.faculty || null,
      status: u.status || 'aktif',
      gender: u.gender || null
    }));
    console.log(`Mengupload ${users.length} users...`);
    const { error: errUsers } = await supabase.from('users').upsert(users);
    if (errUsers) throw new Error("Gagal upload users: " + JSON.stringify(errUsers));
    console.log("✅ Users berhasil dipindah!");

    // 2. Migrate Stores
    console.log("Membaca stores.json...");
    let stores = JSON.parse(fs.readFileSync('./stores.json', 'utf8'));
    stores = stores.map(s => ({
      id: s.id,
      name: s.name,
      ownerid: s.ownerId || null,
      push_subscription: s.push_subscription || null
    }));
    console.log(`Mengupload ${stores.length} stores...`);
    const { error: errStores } = await supabase.from('stores').upsert(stores);
    if (errStores) throw new Error("Gagal upload stores: " + JSON.stringify(errStores));
    console.log("✅ Stores berhasil dipindah!");

    // 3. Migrate Menus (Remove Base64 Images)
    console.log("Membaca menus.json (Ini mungkin butuh waktu karena filenya 9MB)...");
    let menus = JSON.parse(fs.readFileSync('./menus.json', 'utf8'));
    
    // Hapus gambar base64 yang bikin berat!
    menus = menus.map(menu => ({
      id: menu.id,
      storeid: menu.storeId,
      name: menu.name,
      price: menu.price,
      category: menu.category || 'Lainnya',
      image: "", // Dikosongkan agar tidak memberatkan Supabase
      isavailable: menu.isAvailable !== undefined ? menu.isAvailable : true
    }));

    console.log(`Mengupload ${menus.length} menus tanpa Base64...`);
    
    // Insert in batches of 50 to avoid payload limits
    for (let i = 0; i < menus.length; i += 50) {
      const batch = menus.slice(i, i + 50);
      const { error: errMenus } = await supabase.from('menus').upsert(batch);
      if (errMenus) throw new Error("Gagal upload menus batch: " + JSON.stringify(errMenus));
    }
    console.log("✅ Menus berhasil dipindah!");

    console.log("🎉 SEMUA DATA BERHASIL DIMIGRASI KE SUPABASE!");

  } catch (error) {
    console.error("❌ ERROR MIGRASI:", error.message);
  }
}

migrate();
