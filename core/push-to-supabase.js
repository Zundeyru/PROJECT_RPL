const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qqjqixwlfkygehwvwvsy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function pushData() {
  console.log("=========================================");
  console.log("⬆️ MENGUPLOAD DATA JSON KE SUPABASE");
  console.log("=========================================\n");

  try {
    // 1. Push Users
    console.log("Membaca users.json...");
    let users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));
    console.log(`Mengupload ${users.length} users...`);
    const { error: errUsers } = await supabase.from('users').upsert(users);
    if (errUsers) throw new Error("Gagal upload users: " + JSON.stringify(errUsers));
    console.log("✅ Users berhasil diupload!");

    // 2. Push Stores
    console.log("Membaca stores.json...");
    let stores = JSON.parse(fs.readFileSync(path.join(__dirname, 'stores.json'), 'utf8'));
    console.log(`Mengupload ${stores.length} stores...`);
    const { error: errStores } = await supabase.from('stores').upsert(stores);
    if (errStores) throw new Error("Gagal upload stores: " + JSON.stringify(errStores));
    console.log("✅ Stores berhasil diupload!");

    console.log("\n🎉 SEMUA DATA LOKAL BERHASIL DI-PUSH KE SUPABASE!");
  } catch (error) {
    console.error("❌ ERROR PUSH:", error.message);
  }
}

pushData();
